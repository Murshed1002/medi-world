import { Controller, Post, Body, Req, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async bookAppointment(
    @Req() req,
    @Body() dto: CreateAppointmentDto,
  ) {
    const authUserId = req.user.userId;

    return this.service.createAppointment(authUserId, dto);
  }

  @Get('getAll')
  @UseGuards(JwtAuthGuard)
  async getAllAppointments(@Req() req) {
    const authUserId = req.user.userId;
    return this.service.getAllAppointments(authUserId);
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.service.getAppointmentById(id);
  }
}
