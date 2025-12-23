import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { AddressDto } from './address.dto'
import { GENDER } from '../generated/client/client'
import { MediaDto } from './media.dto'

export class MemberDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  nameNp: string

  @IsString()
  @IsOptional()
  phone: string

  @IsOptional()
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  dateOfBirth: string

  @IsNotEmpty()
  @IsEnum(GENDER)
  gender: GENDER

  @IsString()
  @IsOptional()
  citizenshipNumber: string

  @IsString()
  @IsOptional()
  issuedDistrict: string

  @IsString()
  @IsOptional()
  issuedDate: string

  @IsOptional()
  @IsString()
  experience: string

  @IsOptional()
  @IsString()
  qualification: string

  @IsOptional()
  address: AddressDto

  @IsOptional()
  startupSectorId: string

  @IsOptional()
  startupSubSector: string[]

  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]
}
