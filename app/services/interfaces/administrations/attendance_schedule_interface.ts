import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export interface AttendanceScheduleInterface {
  index(
    page: number,
    limit: number,
    search: string
  ): Promise<ModelPaginatorContract<ScheduleGroupAttendance>>
  indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number
  ): Promise<ModelPaginatorContract<ScheduleGroupAttendance>>
  store(
    group_attendance_id: number,
    time_attendance_id: number,
    start: DateTime,
    end: DateTime
  ): Promise<ScheduleGroupAttendance[]>
  show(id: number): Promise<ScheduleGroupAttendance | null>
  update(id: number, data: any): Promise<ScheduleGroupAttendance | null>
  delete(id: number): Promise<boolean>
}
