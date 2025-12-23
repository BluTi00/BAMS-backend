import { IsNotEmpty, IsString } from 'class-validator'

export class MediaDto {
  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  mimeType: string

  @IsNotEmpty()
  // @IsEnum(MediaType)
  // type: MediaType
  type: string
}
