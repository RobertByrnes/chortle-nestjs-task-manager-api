import {
  Injectable,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersRepository } from './users.repository';
import { AuthCredentialsDto } from './dto/auth-credientials.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './user.entity';
import { UserRole } from './users-role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersRepository)
    private usersRepository: UsersRepository,
    private jwtService: JwtService
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return this.usersRepository.createUser(authCredentialsDto);
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto
  ): Promise<{ username: string; accessToken: string }> {
    const { password, email } = authCredentialsDto;
    const user = await this.usersRepository.findOne({ where: { email } });

    if (user && (await bcrypt.compare(password, user.password))) {
      const payload: JwtPayload = { email };
      const accessToken = this.jwtService.sign(payload);
      return { username: user.username, accessToken };
    } else {
      throw new UnauthorizedException('Please check your login credentials');
    }
  }

  async addChildToParent(parentId: string, childId: string): Promise<User> {
    return await this.usersRepository.addChildToParent(parentId, childId);
  }

  async getParentsForUser(userId: string): Promise<User[]> {
    return await this.usersRepository.getParentsForUser(userId);
  }

  async getChildrenForUser(userId: string): Promise<User[]> {
    return await this.usersRepository.getChildrenForUser(userId);
  }

  getUsers(): Promise<{ users: User[]; roles: UserRole[] }> {
    return this.usersRepository.getUsers();
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['parents', 'children']
    });

    if (user) {
      user.parents = [];
      user.children = [];
      await this.usersRepository.save(user); // Save to remove relationships
      const result = await this.usersRepository.delete({ id });
      if (result.affected === 0) {
        throw new NotFoundException(
          `User with ID "${id}" not deleted but relations have been cleared`
        );
      }
    }
  }

  async removeChildFromParent(
    parentId: string,
    childId: string
  ): Promise<User> {
    const parent = await this.usersRepository.findOne({
      where: { id: parentId },
      relations: ['children']
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID "${parentId}" not found.`);
    }

    const child = parent.children.find((child) => child.id === childId);

    if (!child) {
      throw new NotFoundException(
        `Child with ID "${childId}" is not related to Parent with ID "${parentId}".`
      );
    }

    // Remove child from parent's children
    parent.children = parent.children.filter((c) => c.id !== childId);
    await this.usersRepository.save(parent);

    return parent;
  }

  async removeParentFromChild(
    childId: string,
    parentId: string
  ): Promise<User> {
    const child = await this.usersRepository.findOne({
      where: { id: childId },
      relations: ['parents']
    });

    if (!child) {
      throw new NotFoundException(`Child with ID "${childId}" not found.`);
    }

    const parent = child.parents.find((parent) => parent.id === parentId);

    if (!parent) {
      throw new NotFoundException(
        `Parent with ID "${parentId}" is not related to Child with ID "${childId}".`
      );
    }

    // Remove parent from child's parents
    child.parents = child.parents.filter((p) => p.id !== parentId);
    await this.usersRepository.save(child);

    return child;
  }

  async updateUserRole(id: string, role: UserRole): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    user.role = role;
    await this.usersRepository.save(user);

    return user;
  }
}
