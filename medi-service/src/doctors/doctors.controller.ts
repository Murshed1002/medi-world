import { Controller, Get, Query, Param, NotFoundException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getDoctors(@Query() queryDto: GetDoctorsQueryDto) {
    return this.doctorsService.getDoctors(queryDto);
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    const doctor = await this.doctorsService.getDoctorById(id);
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
