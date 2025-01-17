import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { User } from 'src/users/user.entity';
import { UpdateTasksDescriptionDto } from './dto/update-tasks-description.dto';
import { TaskStatus } from './enum/task-status.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TasksRepository)
    private tasksRepository: TasksRepository
  ) {}

  getTasks(
    filterDto: GetTasksFilterDto,
    user: User
  ): Promise<{ tasks: Task[]; statuses: TaskStatus[] }> {
    return this.tasksRepository.getTasks(filterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Task> {
    const found = await this.tasksRepository.findOne({ where: { id, user } });

    if (!found) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    return found;
  }

  createTask(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const { finishBy } = createTaskDto;
    createTaskDto.finishBy = finishBy ? new Date(finishBy) : null;

    return this.tasksRepository.createTask(createTaskDto, user);
  }

  async deleteTask(id: string, user: User): Promise<void> {
    const result = await this.tasksRepository.delete({ id, user });

    if (result.affected === 0) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }
  }

  async updateTaskStatus(
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
    user: User
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = updateTaskStatusDto.status;
    await this.tasksRepository.save(task);

    return task;
  }

  async updateTaskDescription(
    id: string,
    updateTasksDescriptionDto: UpdateTasksDescriptionDto,
    user: User
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.description = updateTasksDescriptionDto.description;
    await this.tasksRepository.save(task);

    return task;
  }
}
