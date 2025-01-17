import {
  ConflictException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { UserRole } from './users-role.enum';
import { SignUpDto } from './dto/signup.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(signupDto: SignUpDto): Promise<void> {
    const { username, password, email, role } = signupDto;
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = this.create({
      username,
      password: hashedPassword,
      email,
      role: role || UserRole.USER
    });

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate email
        throw new ConflictException(
          `User with email address "${email}" already exists`
        );
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  async getUsers(): Promise<{ users: User[]; roles: UserRole[] }> {
    const users = await this.find();
    return { users, roles: Object.values(UserRole) };
  }

  async addChildToParent(parentId: string, childId: string): Promise<User> {
    const parent = await this.findOne({
      where: { id: parentId },
      relations: ['children']
    });
    const child = await this.findOne({ where: { id: childId } });

    if (!parent || !child) {
      throw new Error('Parent or Child not found');
    }

    // Add the child to the parent's children array
    parent.children = [...(parent.children || []), child];
    return await this.save(parent);
  }

  async getParentsForUser(userId: string): Promise<User[]> {
    const user = await this.findOne({
      where: { id: userId },
      relations: ['parents']
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.parents;
  }

  async getChildrenForUser(userId: string): Promise<User[]> {
    const user = await this.findOne({
      where: { id: userId },
      relations: ['children']
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user.children;
  }
}
