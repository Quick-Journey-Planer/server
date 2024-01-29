import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { lastValueFrom, mergeMap, of, throwError } from 'rxjs';
import { users } from '@prisma/client';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  public validate(username: string, password: string): Promise<users> {
    return lastValueFrom(
      this.authService
        .validateUser({ username, password })
        .pipe(
          mergeMap((user) =>
            !user
              ? throwError(
                  () => new UnauthorizedException('Invalid credentials'),
                )
              : of(user),
          ),
        ),
    );
  }
}
