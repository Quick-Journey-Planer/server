import { IsNotEmpty } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, OmitType } from '@nestjs/swagger';

export class ResetPasswordDto extends OmitType(CreateUserDto, [
  'email',
  'firstName',
  'lastName',
]) {
  @ApiProperty({ description: 'Confirmation number', example: '123456' })
  @IsNotEmpty()
  public confirmationNumber: number;
}
