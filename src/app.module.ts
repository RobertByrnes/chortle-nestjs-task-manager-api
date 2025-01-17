import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { RewardsModule } from './rewards/rewards.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { configValidationSchema } from './config.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.TASK_MANAGER_STAGE}`],
      validationSchema: configValidationSchema
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('TASK_MANAGER_DB_HOST'),
        port: configService.get<number>('TASK_MANAGER_DB_PORT'),
        username: configService.get<string>('TASK_MANAGER_DB_USERNAME'),
        password: configService.get<string>('TASK_MANAGER_DB_PASSWORD'),
        database: configService.get<string>('TASK_MANAGER_DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: true
      })
    }),
    TasksModule,
    RewardsModule,
    UsersModule
  ]
})
export class AppModule {}
