import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

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
}
