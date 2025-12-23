import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class StartupSubSectorDto {
  @IsUUID()
  @IsNotEmpty()
  startupSectorId: string

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
