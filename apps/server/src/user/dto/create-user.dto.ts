import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'Email',
    example: 'contact@quick-journey.com',
  })
  @IsNotEmpty()
  @IsEmail()
  public email: string;

  @ApiProperty({ description: 'Password', example: 'ABC123abc!' })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  public password: string;

  @ApiProperty({ description: 'Password confirmation', example: 'ABC123abc!' })
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  public passwordConfirmation: string;

  @ApiProperty({ description: 'First name', example: 'Max' })
  @IsNotEmpty()
  @IsString()
  public firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Mustermann' })
  @IsNotEmpty()
  @IsString()
  public lastName: string;
}
