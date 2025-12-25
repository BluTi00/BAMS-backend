import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { AddressDto } from './address.dto'
import { APPLICATION_STATUS, PROGRAM_TYPE } from '../generated/client/client'
import { MediaDto } from './media.dto'

export class ApplicationDto {
  @IsOptional()
  @IsString()
  applicationCode: string

  @IsString()
  @IsNotEmpty()
  applicantName: string

  @IsString()
  @IsNotEmpty()
  applicantNameNp: string

  @IsOptional()
  address: AddressDto

  @IsOptional()
  @IsString()
  telephone: string

  @IsOptional()
  @IsString()
  email: string

  @IsOptional()
  @IsString()
  dateOfBirth: string

  @IsString()
  @IsOptional()
  citizenshipNumber: string

  @IsString()
  @IsOptional()
  issuedDate: string

  @IsString()
  @IsOptional()
  issuedDistrict: string

  @IsOptional()
  @IsString()
  educationQualification: string

  @IsOptional()
  @IsString()
  profession: string

  @IsOptional()
  @IsString()
  fatherName: string

  @IsOptional()
  @IsString()
  fatherProfession: string

  @IsBoolean()
  @IsOptional()
  useOfModernTechnology: boolean

  @IsBoolean()
  @IsOptional()
  possibilityOfSellingProducedGoods: boolean

  @IsBoolean()
  @IsOptional()
  institutionalUpgradeSupport: boolean

  @IsOptional()
  @IsString()
  existingOperatingProfession: string

  @IsNotEmpty()
  @IsEnum(PROGRAM_TYPE)
  programType: PROGRAM_TYPE

  @IsOptional()
  professionToBeUpgraded: string[]

  @IsOptional()
  entrepreneurshipRelatedTraining: any[]

  @IsNumber()
  estimatedCost: number

  @IsString()
  @IsOptional()
  submissionDate: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]

  @IsOptional()
  entrepreneurshipActivity: string[]
}

export class UpdateApplicationStatusDto {
  @IsEnum(APPLICATION_STATUS)
  status: APPLICATION_STATUS

  @IsOptional()
  @IsString()
  rejectionReason: string
}
