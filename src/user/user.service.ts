import { PrismaService } from 'src/prisma/prisma.service';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  Observable,
  catchError,
  from,
  map,
  mergeMap,
  of,
  throwError,
} from 'rxjs';
import { hash } from 'bcrypt';
import {
  CreateUserDto,
  ResetPasswordDto,
  UpdateAccountDto,
  UserDto,
} from './dto';
import { Response } from 'src/interfaces';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  public createUser(createUserDto: CreateUserDto): Observable<Response> {
    return from(
      this.prisma.users.findUnique({
        where: { email: createUserDto.email },
      }),
    ).pipe(
      mergeMap((user) =>
        user
          ? throwError(() => new BadRequestException('Email already in use'))
          : from(hash(createUserDto.password, 10)),
      ),
      mergeMap((hashedPassword) =>
        this.prisma.users.create({
          data: {
            email: createUserDto.email,
            password: hashedPassword,
            first_name: createUserDto.firstName,
            last_name: createUserDto.lastName,
            confirmation_number: Math.floor(
              Math.random() * (999999 - 100000) + 100000,
            ),
          },
        }),
      ),
      mergeMap((createdUser) =>
        from(
          this.prisma.users_have_roles.upsert({
            where: {
              unique_user_item: {
                user_id: createdUser.id,
                role_name: 'USER',
              },
            },
            update: {},
            create: {
              user_id: createdUser.id,
              role_name: 'USER',
            },
          }),
        ),
      ),
      map(() => ({ status: 'success', message: 'User created' })),
      catchError(() =>
        throwError(() => new BadRequestException('Could not create user')),
      ),
    );
  }

  public updateAccount(
    token: string,
    userData: UpdateAccountDto,
  ): Observable<Response> {
    return of(token).pipe(
      map((token) => token.split(' ')[1]),
      mergeMap((decodedToken) =>
        !this.jwtService.decode(decodedToken)?.id
          ? throwError(() => new UnauthorizedException('Invalid token'))
          : from(
              this.prisma.users.findUnique({
                where: {
                  id: this.jwtService.decode(decodedToken)?.id,
                  deleted_at: null,
                },
              }),
            ).pipe(
              mergeMap((user) =>
                user
                  ? from(hash(userData.password, 10)).pipe(
                      mergeMap((hashedPassword) =>
                        hashedPassword
                          ? this.prisma.users.update({
                              where: {
                                id: user.id,
                                deleted_at: null,
                              },
                              data: {
                                password: hashedPassword,
                                first_name: userData.firstName,
                                last_name: userData.lastName,
                              },
                            })
                          : throwError(
                              () =>
                                new BadRequestException(
                                  'Could not update user',
                                ),
                            ),
                      ),
                    )
                  : throwError(() => new BadRequestException('User not found')),
              ),
            ),
      ),
      map(() => ({ status: 'success', message: 'User updated' })),
      catchError(() =>
        throwError(() => new BadRequestException('Something went wrong!')),
      ),
    );
  }

  public forgotPassword(userDto: UserDto): Observable<Response> {
    return from(
      this.prisma.users.findUnique({
        where: { email: userDto.email },
      }),
    ).pipe(
      mergeMap((user) =>
        !user
          ? throwError(() => new BadRequestException('Email not found'))
          : this.prisma.users.update({
              where: { id: user.id },
              data: {
                confirmation_number: Math.floor(
                  Math.random() * (999999 - 100000) + 100000,
                ),
              },
            }),
      ),
      map(() => ({
        status: 'success',
        message: 'Forgot password email sent successfully',
      })),
      catchError(() =>
        throwError(() => new BadRequestException('Something went wrong!')),
      ),
    );
  }

  public resetPassword(
    email: string,
    resetPasswordDto: ResetPasswordDto,
  ): Observable<Response> {
    return from(
      this.prisma.users.findUnique({
        where: { email: email },
      }),
    ).pipe(
      mergeMap((user) =>
        user && resetPasswordDto.confirmationNumber == user.confirmation_number
          ? from(hash(resetPasswordDto.password, 10)).pipe(
              mergeMap((hashedPassword) =>
                this.prisma.users.update({
                  where: { id: user.id },
                  data: {
                    password: hashedPassword,
                  },
                }),
              ),
            )
          : throwError(
              () => new BadRequestException('Confirmation number is invalid'),
            ),
      ),
      map(() => ({
        status: 'success',
        message: 'Reset password sent successfully',
      })),
      catchError(() =>
        throwError(() => new BadRequestException('Something went wrong!')),
      ),
    );
  }
}
