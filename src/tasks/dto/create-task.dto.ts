import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { RecurrencePattern } from '../enum/recurrence-pattern.enum';

export class CreateTaskDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;
  finishBy: Date;

  @IsOptional()
  @IsEnum(RecurrencePattern)
  recurrence?: RecurrencePattern = RecurrencePattern.NONE;
}
