import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class ApplicationCycleDto {
  @IsOptional()
  @IsString()
  name: string

  @IsOptional()
  @IsString()
  startDate: string

  @IsOptional()
  @IsString()
  endDate: string

  @IsOptional()
  @IsBoolean()
  isDisabled: boolean
}
