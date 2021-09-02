import { FranchiseLogType } from '@prisma/client';
import { Joi } from '.';

export const PATTERN = {
  PAGINATION: {
    TAKE: Joi.number().default(10).optional(),
    SKIP: Joi.number().default(0).optional(),
    SEARCH: Joi.string().allow('').optional(),
    ORDER_BY: {
      FIELD: Joi.string().optional(),
      SORT: Joi.string().valid('asc', 'desc').default('asc').optional(),
    },
  },
  PERMISSION: {
    MULTIPLE: Joi.array().items(Joi.string()).required(),
    ID: Joi.string().min(2).max(16).required(),
    NAME: Joi.string().min(2).max(16).required(),
    DESCRIPTION: Joi.string().default('').allow('').max(64).optional(),
    GROUP: {
      ID: Joi.string().uuid().required(),
      NAME: Joi.string().min(2).max(16).required(),
      DESCRIPTION: Joi.string().default('').allow('').max(64).optional(),
    },
  },
  FRANCHISE: {
    ID: Joi.string().uuid().required(),
    NAME: Joi.string().min(2).max(16).required(),
    LOG: {
      TYPE: Joi.array()
        .items(Joi.string().valid(...Object.keys(FranchiseLogType)))
        .required(),
    },
    USER: {
      ID: Joi.string().uuid().required(),
      NAME: Joi.string().min(2).max(16).required(),
      EMAIL: Joi.string().email().required(),
      SESSION_ID: Joi.string().required(),
      PHONE: Joi.string()
        .regex(/^\+(\d*)$/)
        .messages({
          'string.pattern.base': '+ 로 시작하시는 전화번호를 입력해주세요.',
        }),
      PASSWORD: Joi.string()
        .regex(
          /^(?=.*?[A-Z])(?=(.*[a-z]){1,})(?=(.*[\d]){1,})(?=(.*[\W]){1,})(?!.*\s).{10,}$/
        )
        .messages({
          'string.pattern.base':
            '대소문자와 숫자, 특수문자가 각 1자 이상 포함된 10자 이상의 비밀번호를 입력해주세요.',
        }),
    },
  },
};
