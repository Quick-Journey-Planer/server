import { Observable, throwError } from 'rxjs';
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Put,
  UseGuards,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { CreateUserDto, ResetPasswordDto, UpdateAccountDto } from './dto';
import { Response } from '../interfaces';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBody({
    type: CreateUserDto,
    description: 'User Details',
    examples: {
      example1: {
        summary: 'User 1',
        value: {
          email: 'contact@quick-journey.com',
          password: 'SuperSecretPassword1!',
          passwordConfirmation: 'SuperSecretPassword1!',
          firstName: 'Jeyhun',
          lastName: 'Rahimli',
        },
      },
    },
  })
  @Post('register')
  public register(@Body() createUserDto: CreateUserDto): Observable<Response> {
    return createUserDto.password !== createUserDto.passwordConfirmation
      ? throwError(() => new BadRequestException('Passwords do not match'))
      : this.userService.createUser(createUserDto);
  }

  @ApiBearerAuth()
  @ApiBody({
    type: UpdateAccountDto,
    description: 'User Details',
    examples: {
      example1: {
        summary: 'User 1',
        value: {
          password: 'SuperSecretPassword1!',
          passwordConfirmation: 'SuperSecretPassword1!',
          firstName: 'Jeyhun',
          lastName: 'Rahimli',
        },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('update-account')
  public updateUserByToken(
    @Body() updateUserDto: UpdateAccountDto,
    @Req() { headers },
  ): Observable<Response> {
    return updateUserDto.password !== updateUserDto.passwordConfirmation
      ? throwError(() => new BadRequestException('Passwords do not match'))
      : this.userService.updateAccount(headers.authorization, updateUserDto);
  }

  @ApiParam({
    type: String,
    name: 'Email',
  })
  @Put('forgot-password/:email')
  public forgotPassword(@Param() email: string): Observable<Response> {
    return this.userService.forgotPassword(email);
  }

  @ApiBody({
    type: ResetPasswordDto,
    description: 'User reset password',
    examples: {
      example1: {
        summary: 'User',
        value: {
          password: 'SuperSecretPassword2!',
          passwordConfirmation: 'SuperSecretPassword2',
          confirmationNumber: '123456',
        },
      },
    },
  })
  @Put('reset-password/:email')
  @ApiParam({
    name: 'email',
    description: 'Email address of the user to confirm the account.',
    type: 'string',
  })
  public resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('email') email: string,
  ): Observable<Response> {
    return resetPasswordDto.password !== resetPasswordDto.passwordConfirmation
      ? throwError(() => new BadRequestException('Passwords do not match'))
      : this.userService.resetPassword(email, resetPasswordDto);
  }
}
