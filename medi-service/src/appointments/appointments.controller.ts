import { Controller, Post, Body, Req, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  async bookAppointment(
    @Req() req,
    @Body() dto: CreateAppointmentDto,
    @CurrentUser() authUser: any,
  ) {
    return this.service.createAppointment(authUser.userId, dto);
  }
  
  @Get('getAll')
  @UseGuards(JwtAuthGuard)
  async getAllAppointments(@CurrentUser() authUserId: string) {
    return this.service.getAllAppointments(authUserId);
  }

  @Get(':id')
  async getAppointment(@Param('id') id: string) {
    return this.service.getAppointmentById(id);
  }
}
