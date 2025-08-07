import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class QrCodeLoginDto {
  @ApiProperty({ description: '二维码ID' })
  @IsString()
  @IsNotEmpty()
  qrCodeId!: string;
}

export class QrCodeConfirmDto {
  @ApiProperty({ description: '二维码ID' })
  @IsString()
  @IsNotEmpty()
  qrCodeId!: string;
}