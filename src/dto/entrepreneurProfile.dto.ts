import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'
import { AddressDto } from './address.dto'
import { GENDER } from '../generated/client/client'

export class EntrepreneurProfileDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  citizenshipNumber: string

  @IsString()
  @IsNotEmpty()
  issuedDate: string

  @IsString()
  @IsNotEmpty()
  issuedDistrict: string

  @IsNotEmpty()
  temporaryAddress: AddressDto

  @IsNotEmpty()
  permanentAddress: AddressDto

  @IsString()
  @IsNotEmpty()
  mobileNumber: string

  @IsString()
  @IsNotEmpty()
  applicationId: string

  @IsBoolean()
  isMainEntrepreneur: boolean

  @IsEnum(GENDER)
  gender: GENDER

  @IsOptional()
  @IsString()
  educationalQualification: string

  @IsOptional()
  @IsString()
  training: string

  @IsOptional()
  @IsString()
  experience: string
}
