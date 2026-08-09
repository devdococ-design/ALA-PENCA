import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({ data: dto });
  }

  findAll() {
    return this.prisma.appointment.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async updateStatus(id: number, status: string) {
    try {
      return await this.prisma.appointment.update({
        where: { id },
        data: { status },
      });
    } catch {
      throw new NotFoundException('Appointment not found');
    }
  }
}
