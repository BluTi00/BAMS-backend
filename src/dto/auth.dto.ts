import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class RegisterUserDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  @MinLength(6)
  password: string

  @IsNotEmpty()
  phone: string

  @IsOptional()
  gender: string
}

export class LoginUserDto {
  @IsString()
  @IsNotEmpty()
  phone: string

  @IsNotEmpty()
  password: string
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  otp: string
}

export class VerifyUserDto {
  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsNotEmpty()
  otp: string
}
