import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import { TimeInterface } from '#services/interfaces/configs/time_interface'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export class TimeRepository implements TimeInterface {
  /**
   * Get paginated list of TimeAttendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of TimeAttendances
   */
  async index(page: number, limit: number): Promise<ModelPaginatorContract<TimeAttendance>> {
    const data = await TimeAttendance.query().paginate(page, limit)
    return data
  }

  async create(data: any): Promise<TimeAttendance> {
    const f = new TimeAttendance()
    f.merge(data)
    await f.save()
    return f
  }

  async show(id: number): Promise<TimeAttendance | null> {
    const f = await TimeAttendance.query().where('id', id).first()
    return f
  }
  async showAll(): Promise<TimeAttendance[]> {
    return await TimeAttendance.all()
  }

  async update(id: number, data: any): Promise<TimeAttendance | null> {
    const f = await TimeAttendance.find(id)
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const f = await TimeAttendance.find(id)
    if (f) {
      await f.delete()
      return true
    }
    return false
  }
}
