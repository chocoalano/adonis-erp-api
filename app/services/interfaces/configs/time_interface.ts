import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface TimeInterface {
  index(page: number, limit: number): Promise<ModelPaginatorContract<TimeAttendance>>
  create(data: any): Promise<TimeAttendance>
  show(id: number): Promise<TimeAttendance | null>
  showAll(): Promise<TimeAttendance[]>
  update(id: number, data: any): Promise<TimeAttendance | null>
  delete(id: number): Promise<boolean>
}
