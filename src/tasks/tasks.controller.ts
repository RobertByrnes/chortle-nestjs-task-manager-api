import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Logger
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/user.entity';
import { UpdateTasksDescriptionDto } from './dto/update-tasks-description.dto';
import { TaskStatus } from './enum/task-status.enum';

@Controller('/tasks')
@UseGuards(AuthGuard())
export class TasksController {
  private logger = new Logger('TasksController', { timestamp: true });
  constructor(private tasksService: TasksService) {}

  @Get()
  @UseGuards(AuthGuard())
  getTasks(
    @Query() filterDto: GetTasksFilterDto,
    @GetUser() user: User
  ): Promise<{ tasks: Task[]; statuses: TaskStatus[] }> {
    this.logger.verbose(
      `User "${user.username}" retreiving all Tasks. Filters: ${JSON.stringify(filterDto, null, 0)}`
    );
    return this.tasksService.getTasks(filterDto, user);
  }

  @Get('/:id')
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Task> {
    return this.tasksService.getTaskById(id, user);
  }

  @Post()
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @GetUser() user: User
  ): Promise<Task> {
    this.logger.verbose(
      `User "${user.username}" creating a Task. Data: ${JSON.stringify(createTaskDto, null, 0)}`
    );
    return this.tasksService.createTask(createTaskDto, user);
  }

  @Delete('/:id')
  deleteTask(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tasksService.deleteTask(id, user);
  }

  @Patch('/:id/status')
  updateTaskStatus(
    @Param('id') id: string,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
    @GetUser() user: User
  ): Promise<Task> {
    return this.tasksService.updateTaskStatus(id, updateTaskStatusDto, user);
  }

  @Patch('/:id/description')
  updateTaskDescription(
    @Param('id') id: string,
    @Body() updateTasksDescriptionDto: UpdateTasksDescriptionDto,
    @GetUser() user: User
  ): Promise<Task> {
    return this.tasksService.updateTaskDescription(
      id,
      updateTasksDescriptionDto,
      user
    );
  }
}
