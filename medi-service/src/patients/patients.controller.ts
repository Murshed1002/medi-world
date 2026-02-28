import {
  Controller,
  Get,
  Put,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('patients')
@UseGuards(JwtAuthGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get('profile')
  async getProfile(@Req() req: any) {
    return this.patientsService.getPatientProfile(req.user.userId);
  }

  @Put('profile')
  async updateProfile(@Req() req: any, @Body() updateDto: UpdatePatientDto) {
    return this.patientsService.updatePatientProfile(
      req.user.userId,
      updateDto,
    );
  }
}
