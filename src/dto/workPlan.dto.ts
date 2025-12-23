import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class WorkPlanDto {
  @IsString()
  @IsNotEmpty()
  activity: string

  @IsString()
  @IsOptional()
  time: string

  @IsOptional()
  @IsNumber()
  budget: number

  @IsString()
  @IsOptional()
  expectedOutcome: string

  @IsString()
  @IsOptional()
  risk: string

  @IsString()
  @IsOptional()
  remarks: string

  @IsString()
  @IsNotEmpty()
  applicationId: string
}
