import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatus } from './enum/task-status.enum';
import { RecurrencePattern } from './enum/recurrence-pattern.enum';
import { User } from 'src/users/user.entity';
import { Exclude } from 'class-transformer';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  status: TaskStatus;

  @Column({ type: 'timestamp', nullable: true })
  finishBy: Date;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((_type) => User, (user) => user.tasks, {
    eager: false,
    nullable: true,
    onDelete: 'SET NULL'
  })
  @Exclude({ toPlainOnly: true })
  user: User;

  @Column({
    type: 'enum',
    enum: RecurrencePattern,
    default: RecurrencePattern.NONE
  })
  recurrence: RecurrencePattern;
}
