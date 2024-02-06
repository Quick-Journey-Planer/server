import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { PrismaService } from '../../../../libs/common/src/prisma/prisma.service';
import {
  Observable,
  catchError,
  from,
  map,
  mergeMap,
  of,
  throwError,
} from 'rxjs';
import { compare } from 'bcrypt';
import { users } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthResponse, Response } from '../interfaces';

interface AuthenticatedUser {
  id: string;
  roles: string[];
}

@Injectable()
export class AuthService {
  private authenticatedUser: AuthenticatedUser;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public validateUser(loginDto: LoginDto): Observable<users | null> {
    return from(
      this.prisma.users.findUnique({
        where: { email: loginDto.username },
        include: { roles: true },
      }),
    ).pipe(
      mergeMap((user) =>
        user && user.is_activated && user.is_confirmed
          ? from(compare(loginDto.password, user.password)).pipe(
              map((passwordValid) => {
                if (passwordValid) {
                  this.authenticatedUser = {
                    id: user.id,
                    roles: user.roles.map((role) => role.role_name),
                  };
                  return user;
                } else {
                  return null;
                }
              }),
            )
          : of(null),
      ),
    );
  }

  public login(): Observable<AuthResponse> {
    return of({
      access_token: this.jwtService.sign(
        { id: this.authenticatedUser.id, role: this.authenticatedUser.roles },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        },
      ),
    }).pipe(
      mergeMap(({ access_token }) =>
        this.prisma.tokens.create({
          data: {
            token: access_token,
            users: { connect: { id: this.authenticatedUser.id } },
          },
        }),
      ),
      map(({ token }) => ({ access_token: token })),
      catchError(() => throwError(() => new UnauthorizedException())),
    );
  }

  public logOut(token: string): Observable<Response> {
    return of(token).pipe(
      map((token) => token.split(' ')[1]),
      mergeMap((decodedToken) =>
        from(
          this.prisma.tokens.findFirst({
            select: { id: true },
            where: {
              token: decodedToken,
            },
          }),
        ),
      ),
      mergeMap((token) =>
        this.prisma.tokens.update({
          data: { is_revoked: true, deleted_at: new Date() },
          where: { id: token.id },
        }),
      ),
      map(() => ({ status: 'success', message: 'User logged out' })),
      catchError(() =>
        throwError(() => new UnauthorizedException('Something went wrong!')),
      ),
    );
  }
}
