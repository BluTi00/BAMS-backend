import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class LoanRecipientDto {
  @IsOptional()
  @IsString()
  applicationCycleId: string

  @IsString()
  @IsNotEmpty()
  applicationCode: string

  @IsString()
  @IsNotEmpty()
  projectName: string

  @IsOptional()
  @IsString()
  projectAddress: string

  @IsOptional()
  @IsString()
  entrepreneurName: string

  @IsOptional()
  @IsNumber()
  loanRecommendedAmount: number

  @IsOptional()
  @IsNumber()
  loanReceivedAmount: number

  @IsOptional()
  @IsString()
  panNumber: string

  @IsOptional()
  @IsString()
  registrationNumber: string
}
