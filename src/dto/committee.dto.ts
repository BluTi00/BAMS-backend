import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { COMMITTEE_TYPE } from '../generated/client/client'

export class CommitteeDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsOptional()
  @IsString()
  nameNp: string

  @IsOptional()
  @IsString()
  formationDate: string

  @IsOptional()
  @IsEnum(COMMITTEE_TYPE)
  type: COMMITTEE_TYPE

  @IsOptional()
  @IsString()
  remarks: string
}
