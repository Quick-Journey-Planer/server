import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'username',
    example: 'contact@quick-journey.com',
  })
  @IsNotEmpty()
  @IsEmail()
  public username: string;

  @ApiProperty({ description: 'Password', example: 'ABC123abc!' })
  @Exclude()
  @IsNotEmpty()
  @IsStrongPassword()
  public password: string;
}
