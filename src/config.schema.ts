import * as Joi from '@hapi/joi';

export const configValidationSchema = Joi.object({
  TASK_MANAGER_STAGE: Joi.string().valid('dev', 'prod').required(),
  TASK_MANAGER_DB_HOST: Joi.string().required(),
  TASK_MANAGER_DB_PORT: Joi.number().default(5432).required(),
  TASK_MANAGER_DB_USERNAME: Joi.string().required(),
  TASK_MANAGER_DB_PASSWORD: Joi.string().required(),
  TASK_MANAGER_DB_NAME: Joi.string().default('postgres').required(),
  TASK_MANAGER_JWT_SECRET: Joi.string().length(32).required()
});
