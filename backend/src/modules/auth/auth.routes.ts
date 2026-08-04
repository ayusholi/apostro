import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate';
import { validate } from '../../validation/validate';
import {
  loginSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
  sessionIdParamSchema,
  verifyEmailSchema,
} from './auth.schema';
import * as controller from './auth.controller';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), controller.register);
authRouter.post('/login', validate({ body: loginSchema }), controller.login);
authRouter.post('/refresh', controller.refresh);
authRouter.post('/logout', authenticate(), controller.logout);
authRouter.get('/me', authenticate(), controller.me);

authRouter.post('/email/verify', validate({ body: verifyEmailSchema }), controller.verifyEmail);
authRouter.post(
  '/email/resend',
  validate({ body: requestPasswordResetSchema }),
  controller.requestEmailVerification,
);

authRouter.post(
  '/password/forgot',
  validate({ body: requestPasswordResetSchema }),
  controller.requestPasswordReset,
);
authRouter.post(
  '/password/reset',
  validate({ body: resetPasswordSchema }),
  controller.resetPassword,
);

authRouter.get('/sessions', authenticate(), controller.listSessions);
authRouter.delete(
  '/sessions/:sessionId',
  authenticate(),
  validate({ params: sessionIdParamSchema }),
  controller.revokeSession,
);
authRouter.delete('/sessions', authenticate(), controller.revokeAllOtherSessions);
