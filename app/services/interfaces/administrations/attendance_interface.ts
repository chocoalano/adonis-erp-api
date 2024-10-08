import Attendance from '#models/HR_Administrations/attendance'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface AttendanceInterface {
  index(page: number, limit: number, search: string): Promise<ModelPaginatorContract<Attendance>>
  indexMobile(
    nik: number,
    page: number,
    limit: number,
    search: string
  ): Promise<ModelPaginatorContract<Attendance>>
  in(data: any): Promise<Attendance | null>
  out(data: any): Promise<Attendance | null>
  currentDate(nik: string): Promise<Attendance | null>
  show(id: number): Promise<Attendance | null>
  update(id: number, data: any): Promise<Attendance | null>
  delete(id: number): Promise<boolean>
}
