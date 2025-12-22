import { IsInt, IsOptional, IsString } from 'class-validator';

export class AddMessageDto {
  @IsInt()
  conversation_id: number;

  @IsOptional()
  @IsString()
  content?: string;
}
