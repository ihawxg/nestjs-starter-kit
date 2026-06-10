import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth.service';
import { JwtPayload } from '../../jwt-payload';
import {
  adminSessionCookieName,
  readCookieValue,
} from '../../admin-cookie-auth';

type JwtExtractorRequest = {
  cookies?: Record<string, string | undefined>;
  headers?: {
    cookie?: string | string[];
  };
};

export function extractJwtFromAdminSessionCookie(
  request: JwtExtractorRequest | null,
): string | null {
  if (!request) return null;

  const parsedCookie = request.cookies?.[adminSessionCookieName];
  if (parsedCookie) return parsedCookie;

  return readCookieValue(request.headers?.cookie, adminSessionCookieName);
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        extractJwtFromAdminSessionCookie,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwtSecret') as string,
    });
  }

  async validate(payload: JwtPayload) {
    return this.authService.validateAdminSession(payload);
  }
}
