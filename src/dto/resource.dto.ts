import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MediaDto } from './media.dto'

export class ResourceDto {
  @IsString()
  @IsNotEmpty()
  fileName: string

  @IsString()
  @IsOptional()
  key: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]
}
