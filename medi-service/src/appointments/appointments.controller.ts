import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  async bookAppointment(
    @Req() req,
    @Body() dto: CreateAppointmentDto,
  ) {
    const patientId = req.user.id;

    return this.service.createAppointment(patientId, dto);
  }

  @Get('getAll')
  async getAllAppointments() {
    // Implementation for fetching all appointments
    return this.service.getAllAppointments();
  }
}
