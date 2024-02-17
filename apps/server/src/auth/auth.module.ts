import { UsersModule } from '../user/user.module';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '@app/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy, LocalStrategy } from './strategies';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Module({
  imports: [UsersModule, PassportModule, JwtModule],
  providers: [
    AuthService,
    PrismaService,
    ConfigService,
    LocalStrategy,
    JwtStrategy,
    JwtService,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
