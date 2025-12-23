import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { MediaDto } from './media.dto'

export class CommitteeMemberDto {
  @IsString()
  @IsNotEmpty()
  committeeId: string

  @IsString()
  @IsNotEmpty()
  memberId: string

  @IsOptional()
  @IsString()
  joiningDate: string

  @IsOptional()
  @IsString()
  designation: string

  @IsArray()
  @IsOptional()
  media: MediaDto[]

  @IsOptional()
  deletedMedia: string[]
}
