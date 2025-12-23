import { IsOptional, IsString } from 'class-validator'

export class StatusHistoryDto {
  @IsString()
  @IsOptional()
  userId: string

  @IsString()
  @IsOptional()
  oldStatus: string

  @IsString()
  @IsOptional()
  newStatus: string

  @IsString()
  @IsOptional()
  remark: string

  @IsString()
  @IsOptional()
  applicationId: string
}
