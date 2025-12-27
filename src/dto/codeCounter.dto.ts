import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator'
import { PROGRAM_TYPE } from '../generated/client/enums'

export class CodeCounterDto {
  @IsNotEmpty()
  @IsString()
  prefix: string

  @IsNotEmpty()
  @IsString()
  applicationCycleId: string

  @IsOptional()
  @IsNumber()
  lastValue: number

  @IsEnum(PROGRAM_TYPE)
  programType: PROGRAM_TYPE
}
