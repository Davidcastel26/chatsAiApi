import { IsInt, IsOptional, IsString } from 'class-validator';

export class AudioToTextDto {
  @IsString()
  @IsOptional()
  readonly prompt?: string;

  @IsInt()
  @IsOptional()
  readonly maxTokens?: number;
}
