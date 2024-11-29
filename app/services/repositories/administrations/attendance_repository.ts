import Attendance from '#models/HR_Administrations/attendance'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import { AttendanceInterface } from '#services/interfaces/administrations/attendance_interface'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { calculateDateRange } from '../../../helpers/for_date.js'

export class AttendanceRepository implements AttendanceInterface {
  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async index(
    page: number,
    limit: number,
    search?: string
  ): Promise<ModelPaginatorContract<Attendance>> {
    const attendanceQuery = Attendance.query()
      .preload('user')
      .if(search, (q) => {
        q.whereHas('user', (uQuery) => {
          uQuery
            .where('name', 'like', `%${search}%`)
            .orWhere('nik', 'like', `%${search}%`)
            .orWhereHas('employe', (eQuery) => {
              eQuery.whereHas('org', (oQuery) => {
                oQuery.where('name', 'like', `%${search}%`)
              })
            })
        })
      })
    return attendanceQuery.orderBy('date', 'desc').paginate(page, limit)
  }
  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async indexMobile(nik: number, page: number, limit: number, search?: string) {
    const attendanceQuery = Attendance.query().preload('user')
    const currentMonth = new Date().getMonth() + 1
    if (search) {
      const month = Number.parseInt(search)
      const { start, end } = calculateDateRange(month)
      attendanceQuery.where('nik', nik).andWhere((query) => {
        query.where('date', '>=', start).andWhere('date', '<=', end)
      })
    } else {
      const { start, end } = calculateDateRange(currentMonth)

      attendanceQuery.where('nik', nik).andWhere((query) => {
        query.where('date', '>=', start).andWhere('date', '<=', end)
      })
    }
    return attendanceQuery.orderBy('date', 'desc').paginate(page, limit)
  }

  async currentDate(nik: string): Promise<Attendance | null> {
    const currentDate = DateTime.now().toFormat('yyyy-MM-dd')
    const data = await Attendance.query().where('nik', nik).andWhere('date', currentDate).first()
    if (data) {
      return data
    }
    return null
  }

  async in(data: any): Promise<Attendance | null> {
    let attendance: Attendance
    const existingAttendance = await Attendance.query()
      .where('date', data.date)
      .where('nik', data.nik)
      .first()
    const u = await ScheduleGroupAttendance.query()
      .preload('time')
      .where('date', data.date)
      .whereHas('user', (postsQuery) => {
        postsQuery.where('nik', data.nik)
      })
      .first()
    if (u && u.time) {
      const currentTimeInJakarta = DateTime.now().setZone('Asia/Jakarta')
      let timeRelease = u ? u?.time.in : null
      let currentTime = currentTimeInJakarta.toFormat('HH:mm:ss')
      const current = DateTime.fromFormat(currentTime, 'HH:mm:ss')
      const rel = DateTime.fromFormat(timeRelease!, 'HH:mm:ss')
      let status = current > rel ? 'late' : 'unlate'

      if (existingAttendance) {
        attendance = existingAttendance
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const currentTimeInJakarta = DateTime.now().setZone('Asia/Jakarta')
        attendance.nik = data.nik
        attendance.schedule_group_attendances_id = u.id
        attendance.date = DateTime.fromISO(new Date(data.date).toISOString())
        attendance.lat_in = data.lat
        attendance.lng_in = data.lng
        attendance.time_in = currentTimeInJakarta.toFormat('HH:mm:ss')
        attendance.photo_in = data.photo
        attendance.status_in = status
        await attendance.save()
      } else {
        attendance = new Attendance()
        attendance.schedule_group_attendances_id = u.id
        attendance.nik = data.nik
        attendance.date = DateTime.fromISO(new Date(data.date).toISOString())
        attendance.lat_in = data.lat
        attendance.lng_in = data.lng
        attendance.time_in = currentTimeInJakarta.toFormat('HH:mm:ss')
        attendance.photo_in = data.photo
        attendance.status_in = status
        await attendance.save()
      }
      return attendance
    }
    return null
  }

  async out(data: any): Promise<Attendance | null> {
    let attendance: Attendance | null = null
    const existingAttendance = await Attendance.query()
      .where('date', data.date)
      .where('nik', data.nik)
      .first()
    const u = await ScheduleGroupAttendance.query()
      .preload('time')
      .where('date', data.date)
      .whereHas('user', (postsQuery) => {
        postsQuery.where('nik', data.nik)
      })
      .first()
    const currentTimeInJakarta = DateTime.now().setZone('Asia/Jakarta')
    let timeRelease = u ? u?.time.out : null
    let currentTime = currentTimeInJakarta.toFormat('HH:mm:ss')
    const current = DateTime.fromFormat(currentTime, 'HH:mm:ss')
    const rel = DateTime.fromFormat(timeRelease!, 'HH:mm:ss')
    let status = current > rel ? 'late' : 'unlate'

    if (existingAttendance) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const currentTimeInJakarta = DateTime.now().setZone('Asia/Jakarta')
      attendance = existingAttendance
      attendance.lat_out = data.lat
      attendance.lng_out = data.lng
      attendance.time_out = currentTimeInJakarta.toFormat('HH:mm:ss')
      attendance.photo_out = data.photo
      attendance.status_out = status
      await attendance.save()
    }
    return attendance
  }

  async show(id: number): Promise<Attendance | null> {
    const f = await Attendance.query().preload('user').where('id', id).first()
    return f
  }

  async update(id: number, data: any): Promise<Attendance | null> {
    const f = await Attendance.find(id)
    if (f) {
      data['date'] = DateTime.fromISO(new Date(data.date).toISOString())
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const attendance = await Attendance.find(id)
    if (attendance) {
      await attendance.delete()
      return true
    }
    return false
  }
}
