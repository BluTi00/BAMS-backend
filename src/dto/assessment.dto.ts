import { ASSESSMENT_TYPE } from '../generated/client/client'
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'

export class AssessmentDto {
  @IsString()
  @IsNotEmpty()
  applicationId: string

  @IsEnum(ASSESSMENT_TYPE)
  assessmentType: ASSESSMENT_TYPE

  @IsOptional()
  scoreSheet: any

  @IsNumber()
  @IsOptional()
  score: number

  @IsString()
  @IsOptional()
  remarks: string
}

export class UpdateAssessmentDto {
  @IsOptional()
  scoreSheet: any

  @IsNumber()
  @IsOptional()
  score: number

  @IsString()
  @IsOptional()
  remarks: string

  @IsOptional()
  @IsBoolean()
  isDraft: boolean
}
