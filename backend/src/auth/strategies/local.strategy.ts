import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as LocalStrategyBase } from 'passport-local';
import { Strategy as GoogleStrategyBase } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(LocalStrategyBase, 'local') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(GoogleStrategyBase, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: AuthService,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(_at: string, _rt: string, profile: any) {
    return this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      providerId: profile.id,
      displayName: profile.displayName,
    });
  }
}
