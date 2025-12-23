import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class StartupSectorDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  nameNp: string

  @IsOptional()
  @IsString()
  code: string
}
