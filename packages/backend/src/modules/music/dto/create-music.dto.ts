import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateMusicDto {
  @IsString()
  title!: string;

  @IsString()
  artist!: string;

  @IsString()
  src!: string;

  @IsNumber()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  cover?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  description?: string;
}