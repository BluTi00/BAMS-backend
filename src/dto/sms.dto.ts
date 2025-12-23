import { IsNotEmpty, IsString } from 'class-validator'

export class SMSDto {
  @IsString()
  messageText: string

  @IsNotEmpty()
  @IsString()
  phone: string

  @IsString()
  messageType: string
}
