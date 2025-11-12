import { IsInt, IsOptional, IsString } from 'class-validator';

export class OrthograpyhDto {
  @IsString()
  readonly prompt: string;

  @IsInt()
  @IsOptional()
  readonly maxTokens?: number;
}
