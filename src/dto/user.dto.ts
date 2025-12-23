import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { GENDER, ROLE } from '../generated/client/client'

export class UserDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  nameNp: string

  @IsString()
  phone: string

  @IsNotEmpty()
  @IsEnum(ROLE)
  role: ROLE

  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: GENDER

  @IsOptional()
  @IsString()
  email: string

  @IsOptional()
  @IsBoolean()
  requireLoginVerification: boolean
}

// for update
export class UpdateUserDto extends UserDto {
  @IsOptional()
  @IsBoolean()
  isBlocked: boolean

  @IsOptional()
  @IsBoolean()
  isDeactivated: boolean
}

// change password
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string

  @IsString()
  @IsNotEmpty()
  newPassword: string
}
