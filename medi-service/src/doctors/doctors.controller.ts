import { Controller, Get, Query, Param, NotFoundException, BadRequestException } from '@nestjs/common';
import { DoctorsService } from './doctors.service';
import { GetDoctorsQueryDto } from './dto/get-doctors-query.dto';

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  async getDoctors(@Query() queryDto: GetDoctorsQueryDto) {
    return this.doctorsService.getDoctors(queryDto);
  }

  @Get(':id/slots')
  async getAvailableSlots(
    @Param('id') id: string,
    @Query('date') date: string,
  ) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid doctor ID format. Expected UUID.');
    }

    if (!date) {
      throw new BadRequestException('Date parameter is required (format: YYYY-MM-DD)');
    }

    const slots = await this.doctorsService.getAvailableSlots(id, date);
    return { slots };
  }

  @Get(':id')
  async getDoctorById(@Param('id') id: string) {
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new BadRequestException('Invalid doctor ID format. Expected UUID.');
    }

    const doctor = await this.doctorsService.getDoctorById(id);
    
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    return doctor;
  }
}
