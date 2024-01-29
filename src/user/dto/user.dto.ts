import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @ApiProperty({
    description: 'Email',
    example: 'contact@quick-journey.com',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
