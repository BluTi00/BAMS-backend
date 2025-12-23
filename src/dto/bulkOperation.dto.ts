import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MediaDto } from './media.dto'

export class LoanRecipientBulkUploadDto {
  @IsString()
  @IsNotEmpty()
  applicationCycleId: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]
}

export class ApplicationBulkUploadDto {
  @IsString()
  @IsNotEmpty()
  applicationCycleId: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]
}
