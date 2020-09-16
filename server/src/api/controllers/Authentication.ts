import { Request, Response, Router } from 'express';
import { check, ValidationChain } from 'express-validator';
import { Service, Inject } from 'typedi';
import BaseController from 'api/controllers/BaseController';
import validateMiddleware from 'api/middleware/validateMiddleware';
import asyncMiddleware from 'api/middleware/asyncMiddleware';
import AuthenticationService from 'services/Authentication';
import { IUserOTD, ISystemUser, IRegisterOTD } from 'interfaces';
import { ServiceError, ServiceErrors } from "exceptions";

@Service()
export default class AuthenticationController extends BaseController{
  @Inject()
  authService: AuthenticationService;

  /**
   * Constructor method.
   */
  router() {
    const router = Router();

    router.post(
      '/login',
      this.loginSchema,
      this.validationResult,
      asyncMiddleware(this.login.bind(this))
    );
    router.post(
      '/register',
      this.registerSchema,
      this.validationResult,
      asyncMiddleware(this.register.bind(this))
    );
    router.post(
      '/send_reset_password',
      this.sendResetPasswordSchema,
      this.validationResult,
      asyncMiddleware(this.sendResetPassword.bind(this))
    );
    router.post(
      '/reset/:token',
      this.resetPasswordSchema,
      this.validationResult,
      asyncMiddleware(this.resetPassword.bind(this))
    );
    return router;
  }

  /**
   * Login schema.
   */
  get loginSchema(): ValidationChain[] {
    return [
      check('crediential').exists().isEmail(),
      check('password').exists().isLength({ min: 5 }),
    ];
  }

  /**
   * Register schema.
   */
  get registerSchema(): ValidationChain[] {
    return [
      check('organization_name').exists().trim().escape(),
      check('first_name').exists().trim().escape(),
      check('last_name').exists().trim().escape(),
      check('email').exists().isEmail().trim().escape(),
      check('phone_number').exists().trim().escape(),
      check('password').exists().trim().escape(),
      check('country').exists().trim().escape(),
    ];
  }

  /**
   * Reset password schema.
   */
  get resetPasswordSchema(): ValidationChain[] {
    return [
      check('password').exists().isLength({ min: 5 })
        .custom((value, { req }) => {
          if (value !== req.body.confirm_password) {
            throw new Error("Passwords don't match");
          } else {
            return value;
          }
        }),
    ];
  }

  /**
   * Send reset password validation schema.
   */
  get sendResetPasswordSchema(): ValidationChain[] {
    return [
      check('email').exists().isEmail().trim().escape(),
    ];
  }

  /**
   * Handle user login.
   * @param {Request} req 
   * @param {Response} res 
   */
  async login(req: Request, res: Response, next: Function): Response {
    const userDTO: IUserOTD = this.matchedBodyData(req);

    try {
      const { token, user, tenant } = await this.authService.signIn(
        userDTO.crediential,
        userDTO.password
      );
      return res.status(200).send({ token, user, tenant });
    } catch (error) {
      if (error instanceof ServiceError) {
        if (['invalid_details', 'invalid_password'].indexOf(error.errorType) !== -1) {
          return res.boom.badRequest(null, {
            errors: [{ type: 'INVALID_DETAILS', code: 100 }],
          });
        }
        if (error.errorType === 'user_inactive') {
          return res.boom.badRequest(null, {
            errors: [{ type: 'INVALID_DETAILS', code: 200 }],
          });
        }
      }
      next(error);
    }
  }

  /**
   * Organization register handler.
   * @param {Request} req 
   * @param {Response} res 
   */
  async register(req: Request, res: Response, next: Function) {
    const registerDTO: IRegisterOTD = this.matchedBodyData(req);

    try {
      const registeredUser: ISystemUser = await this.authService.register(registerDTO);

      return res.status(200).send({
        type: 'success',
        code: 'REGISTER.SUCCESS',
        message: 'Register organization has been success.',
      });
    } catch (error) {
      if (error instanceof ServiceErrors) {
        const errorReasons = [];

        if (error.hasType('phone_number_exists')) {
          errorReasons.push({ type: 'PHONE_NUMBER_EXISTS', code: 100 });
        }
        if (error.hasType('email_exists')) {
          errorReasons.push({ type: 'EMAIL.EXISTS', code: 200 });
        }
        if (errorReasons.length > 0) {
          return res.boom.badRequest(null, { errors: errorReasons });
        }
      }
      next(error);
    }
  }

  /**
   * Send reset password handler
   * @param {Request} req 
   * @param {Response} res 
   */
  async sendResetPassword(req: Request, res: Response, next: Function) {
    const { email } = this.matchedBodyData(req);

    try {
      await this.authService.sendResetPassword(email);

      return res.status(200).send({
        code: 'SEND_RESET_PASSWORD_SUCCESS',
      });
    } catch(error) {
      if (error instanceof ServiceError) {
        if (error.errorType === 'email_not_found') {
          return res.status(400).send({
            errors: [{ type: 'EMAIL.NOT.REGISTERED', code: 200 }],
          });
        }
      }
      next(error);
    }
  }

  /**
   * Reset password handler
   * @param {Request} req 
   * @param {Response} res 
   */
  async resetPassword(req: Request, res: Response, next: Function) {
    const { token } = req.params;
    const { password } = req.body;

    try {
      await this.authService.resetPassword(token, password);

      return res.status(200).send({
        type: 'RESET_PASSWORD_SUCCESS',
      })
    } catch(error) {
      if (error instanceof ServiceError) {
        if (error.errorType === 'token_invalid' || error.errorType === 'token_expired') {
          return res.boom.badRequest(null, {
            errors: [{ type: 'TOKEN_INVALID', code: 100 }],
          });
        }
        if (error.errorType === 'user_not_found') {
          return res.boom.badRequest(null, {
            errors: [{ type: 'USER_NOT_FOUND', code: 120 }],
          });
        }
      }
      next(error);
    }
  }
};