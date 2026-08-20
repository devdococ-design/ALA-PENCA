import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(dto: CreateAppointmentDto) {
    const appointment = await this.prisma.appointment.create({ data: dto });

    void this.notifications.notifyNewOrder(appointment).catch((error) => {
      this.logger.error(`Order notification failed for #${appointment.id}`, error);
    });

    return appointment;
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
