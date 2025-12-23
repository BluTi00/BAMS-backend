import { ASSESSMENT_TYPE } from '../generated/client/client'
import { IsEnum, IsNumber, IsOptional } from 'class-validator'

export class ScoreThresholdDto {
  @IsOptional()
  @IsNumber()
  passingScore: number

  @IsEnum(ASSESSMENT_TYPE)
  assessmentType: ASSESSMENT_TYPE
}
