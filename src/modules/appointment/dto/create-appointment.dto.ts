import { IsNotEmpty } from "class-validator";
import { Type } from "class-transformer";

export class CreateAppointmentDto {
  @IsNotEmpty()
  appointmentDate: string

  @IsNotEmpty()
  appointmentTime: string

  @IsNotEmpty()
  servicePackage: string

  @IsNotEmpty()
  @Type(() => Number)
  clinicId: number
}
