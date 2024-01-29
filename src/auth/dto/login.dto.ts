import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsEmail()
  public username: string;

  @Exclude()
  @IsNotEmpty()
  @IsStrongPassword()
  public password: string;
}
