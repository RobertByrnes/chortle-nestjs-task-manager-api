import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { UserRole } from './users-role.enum';
import { Task } from 'src/tasks/task.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  role: UserRole;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((_type) => Task, (task) => task.user, { eager: true })
  tasks: Task[];

  // Self-referential relationship for parents
  @ManyToMany(() => User, (user) => user.children, { cascade: true })
  @JoinTable({
    name: 'user_parents', // Custom join table name
    joinColumn: {
      name: 'childId',
      referencedColumnName: 'id'
    },
    inverseJoinColumn: {
      name: 'parentId',
      referencedColumnName: 'id'
    }
  })
  parents: User[];

  // Self-referential relationship for children
  @ManyToMany(() => User, (user) => user.parents)
  children: User[];
}
