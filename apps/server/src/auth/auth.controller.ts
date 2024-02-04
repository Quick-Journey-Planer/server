import { Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards';
import { AuthResponse, Response } from '../interfaces';
import { Observable } from 'rxjs';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    type: LoginDto,
    examples: {
      example: {
        value: {
          username: 'contact@quick-journey.com',
          password: 'SuperSecretPassword1!',
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  public login(): Observable<AuthResponse> {
    return this.authService.login();
  }

  @ApiBearerAuth()
  @Put('logout')
  public logOut(@Req() { headers }): Observable<Response> {
    return this.authService.logOut(headers.authorization);
  }
}
