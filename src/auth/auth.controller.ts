import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards';
import { AuthResponse, Response } from 'src/interfaces';
import { Observable } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiBody({
    type: LoginDto,
    examples: {
      Login_example_1: {
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
  @Get('logout')
  public logOut(@Req() { headers }): Observable<Response> {
    return this.authService.logOut(headers.authorization);
  }
}
