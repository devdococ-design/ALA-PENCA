import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post('appointments')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('admin/appointments')
  findAll() {
    return this.appointments.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Patch('admin/appointments/:id')
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string) {
    return this.appointments.updateStatus(id, status);
  }
}
