import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards
} from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credientials.dto';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { SignUpDto } from './dto/signup.dto';
import { User } from './user.entity';
import { UserRole } from './users-role.enum';
import { GetUser } from './get-user.decorator';

@Controller('/users')
export class UsersController {
  private logger = new Logger('UsersController', { timestamp: true });

  constructor(private usersService: UsersService) {}

  @Post('/signup')
  signUp(@Body() signupDto: SignUpDto): Promise<void> {
    return this.usersService.signUp(signupDto);
  }

  @Post('/signin')
  signIn(
    @Body() authCredentialsDto: AuthCredentialsDto
  ): Promise<{ accessToken: string }> {
    return this.usersService.signIn(authCredentialsDto);
  }

  @Get()
  @UseGuards(AuthGuard())
  getUsers(
    @GetUser() user: User
  ): Promise<{ users: User[]; roles: UserRole[] }> {
    this.logger.verbose(
      `User "${user.username}" retreiving all Users and Roles`
    );
    return this.usersService.getUsers();
  }

  // Add a child to a parent
  @Post('/:parentId/children/:childId')
  @UseGuards(AuthGuard())
  async addChildToParent(
    @Param('parentId') parentId: string,
    @Param('childId') childId: string
  ): Promise<User> {
    return await this.usersService.addChildToParent(parentId, childId);
  }

  // Get parents for a user
  @Get('/:userId/parents')
  @UseGuards(AuthGuard())
  async getParentsForUser(@Param('userId') userId: string): Promise<User[]> {
    return await this.usersService.getParentsForUser(userId);
  }

  // Get children for a user
  @Get('/:userId/children')
  @UseGuards(AuthGuard())
  async getChildrenForUser(@Param('userId') userId: string): Promise<User[]> {
    return await this.usersService.getChildrenForUser(userId);
  }

  @Delete('/:id')
  deleteUser(@Param('id') id: string): Promise<void> {
    return this.usersService.deleteUser(id);
  }

  // Remove a child from a parent
  @Delete('/:parentId/children/:childId')
  @UseGuards(AuthGuard())
  async removeChildFromParent(
    @Param('parentId') parentId: string,
    @Param('childId') childId: string
  ): Promise<User> {
    this.logger.verbose(
      `User with ID "${parentId}" is removing child with ID "${childId}".`
    );
    return await this.usersService.removeChildFromParent(parentId, childId);
  }

  // Remove a parent from a child
  @Delete('/:childId/parents/:parentId')
  @UseGuards(AuthGuard())
  async removeParentFromChild(
    @Param('childId') childId: string,
    @Param('parentId') parentId: string
  ): Promise<User> {
    this.logger.verbose(
      `User with ID "${childId}" is removing parent with ID "${parentId}".`
    );
    return await this.usersService.removeParentFromChild(childId, parentId);
  }

  @Patch('/:id/role')
  @UseGuards(AuthGuard())
  updateUserRole(
    @Param('id') id: string,
    @Body('role') role: UserRole,
    @GetUser() user: User
  ): Promise<User> {
    this.logger.verbose(
      `User with ID "${user.id}" is changing the role of user with ID "${id}".`
    );
    return this.usersService.updateUserRole(id, role);
  }
}
