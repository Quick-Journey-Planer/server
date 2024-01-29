import { IsNotEmpty, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateAccountDto {
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
  public firstName?: string;

  @ApiProperty({ description: 'Last name', example: 'Mustermann' })
  public lastName?: string;
}
