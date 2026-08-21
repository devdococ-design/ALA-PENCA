import { Type } from 'class-transformer';
import { IsEmail, IsIn, IsNumber, IsOptional, IsString, Min, MinLength, ValidateIf } from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(2)
  customerName!: string;

  @IsOptional()
  @ValidateIf((_, value) => typeof value === 'string' && value.trim().length > 0)
  @IsEmail()
  @IsString()
  email?: string;

  @IsString()
  @MinLength(7)
  phone!: string;

  @IsString()
  @MinLength(5)
  plantIssue!: string;

  @IsString()
  preferredDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  @IsIn(['cash', 'transfer', 'later'])
  paymentMethod?: string;
}
