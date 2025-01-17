import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, LogLevel, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './transform.interceptor';
import { ConfigService } from '@nestjs/config';

function getCorsConfig() {
  return {
    origin: process.env.FRONTEND_URL || [
      'http://localhost:5173',
      'http://127.0.0.1:5173'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true
  };
}

function getLogLevels(): LogLevel[] {
  return ['log', 'error', 'warn', 'debug', 'verbose', 'fatal'];
}

function configureLogLevels(logLevel: string): LogLevel[] {
  const validLogLevels: LogLevel[] = getLogLevels();
  const configuredLogLevels: LogLevel[] = validLogLevels.slice(
    0,
    validLogLevels.indexOf(logLevel as LogLevel) + 1
  ) || ['log'];
  return configuredLogLevels;
}

async function bootstrap() {
  const configService: ConfigService = new ConfigService();
  const logLevel =
    configService.get<string>('TASK_MANAGER_LOG_LEVEL').toLowerCase() || 'log';
  const configuredLogLevels = configureLogLevels(logLevel);
  const logger = new Logger('Bootstrap', { timestamp: true });
  const app = await NestFactory.create(AppModule, {
    logger: configuredLogLevels
  });

  logger.log(`Application will log from "${logLevel}" level`);
  logger.log(`Application running in ${process.env.TASK_MANAGER_STAGE} mode`);

  // App middleware
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Enable CORS
  app.enableCors(getCorsConfig());

  // Start the application
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application listening on port ${port}`);
}
bootstrap();
