import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

export class DocumentSetupDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  nameNp: string

  @IsString()
  @IsNotEmpty()
  mediaType: string

  @IsOptional()
  @IsNumber()
  visibilityOrder: number

  @IsBoolean()
  isRequired: boolean

  @IsBoolean()
  isActive: boolean

  @IsOptional()
  acceptedExtensions: string[]
}
