import { IsInt, IsOptional, IsString, IsIn } from 'class-validator';

export class AddMessageDto {
  @IsInt()
  conversation_id: number;

  @IsOptional()
  @IsString()
  content?: string;
}
