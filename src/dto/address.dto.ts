import { IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class AddressDto {
  @IsNotEmpty()
  @IsNumber()
  provinceId: number

  @IsNotEmpty()
  @IsNumber()
  districtId: number

  @IsNotEmpty()
  @IsNumber()
  municipalityId: number

  @IsOptional()
  @IsNumber()
  wardId?: number

  @IsOptional()
  locality?: string
}

export class UpdateAddressDto extends AddressDto {
  //   @IsNotEmpty()
  //   @IsUUID()
  //   id: string
}
