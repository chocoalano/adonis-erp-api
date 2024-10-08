import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { AttendanceScheduleInterface } from '#services/interfaces/administrations/attendance_schedule_interface'
import { DateTime } from 'luxon'
import GroupAttendance from '#models/HR_Administrations/group_attendance'

export class AttendanceScheduleRepository implements AttendanceScheduleInterface {
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
    search: string
  ): Promise<ModelPaginatorContract<ScheduleGroupAttendance>> {
    const attendanceQuery = ScheduleGroupAttendance.query()
      .preload('user')
      .preload('group_attendance')
      .preload('time')
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('date', search)
          }
        })
          .orWhereHas('group_attendance', (gaQuery) => {
            gaQuery
              .where('name', 'like', `%${search}%`)
              .orWhere('description', 'like', `%${search}%`)
              .orWhere('patternName', 'like', `%${search}%`)
          })
          .orWhereHas('time', (tQuery) => {
            tQuery.where('type', 'like', `%${search}%`)
          })
          .orWhereHas('user', (uQuery) => {
            uQuery
              .where('name', 'like', `%${search}%`)
              .orWhere('nik', 'like', `%${search}%`)
              .orWhere('email', 'like', `%${search}%`)
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
  async indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number
  ): Promise<ModelPaginatorContract<ScheduleGroupAttendance>> {
    const attendanceQuery = ScheduleGroupAttendance.query()
      .preload('user')
      .preload('group_attendance')
      .preload('time')
      .whereHas('user', (us) => {
        us.whereHas('employe', (e) => {
          e.where('organizationId', organizationId)
        })
      })
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('date', search)
          }
        })
          .orWhereHas('group_attendance', (gaQuery) => {
            gaQuery
              .where('name', 'like', `%${search}%`)
              .orWhere('description', 'like', `%${search}%`)
              .orWhere('patternName', 'like', `%${search}%`)
          })
          .orWhereHas('time', (tQuery) => {
            tQuery.where('type', 'like', `%${search}%`)
          })
          .orWhereHas('user', (uQuery) => {
            uQuery
              .where('name', 'like', `%${search}%`)
              .where('nik', 'like', `%${search}%`)
              .where('email', 'like', `%${search}%`)
          })
      })
    return attendanceQuery.orderBy('date', 'desc').paginate(page, limit)
  }

  async store(
    group_attendance_id: number,
    time_attendance_id: number,
    start: DateTime,
    end: DateTime
  ): Promise<ScheduleGroupAttendance[]> {
    try {
      // Memuat data group_attendance dan group_users
      const groupAttendance = await GroupAttendance.query()
        .preload('group_users')
        .where('id', group_attendance_id)
        .firstOrFail()

      // Membuat array jadwal untuk tiap user
      const arrJadwal = groupAttendance.group_users.flatMap((user) => {
        const dates: {
          group_attendance_id: number
          user_id: number
          time_attendance_id: number
          date: DateTime<boolean>
          status: string
        }[] = []
        let currentDate = start

        // Mengisi array dengan tanggal kecuali hari Minggu
        while (currentDate <= end) {
          if (currentDate.weekday !== 7) {
            dates.push({
              group_attendance_id,
              user_id: user.id,
              time_attendance_id,
              date: currentDate,
              status: 'unpresent',
            })
          }
          currentDate = currentDate.plus({ days: 1 }) // Tambahkan 1 hari
        }

        return dates
      })

      // Menyimpan jadwal ke database
      const savedSchedules = await Promise.all(
        arrJadwal.map(async (schedule) => {
          // Cek apakah jadwal sudah ada
          const existingSchedule = await ScheduleGroupAttendance.query()
            .where('group_attendance_id', schedule.group_attendance_id)
            .andWhere('user_id', schedule.user_id)
            .andWhere('time_attendance_id', schedule.time_attendance_id)
            .andWhere('date', `${schedule.date.toFormat('yyyy-MM-dd')}`)
            .first()

          if (existingSchedule) {
            // Jika sudah ada, update jadwal
            return existingSchedule.merge(schedule).save()
          } else {
            // Jika belum ada, buat jadwal baru
            return ScheduleGroupAttendance.create(schedule)
          }
        })
      )

      // Mengembalikan array jadwal yang tersimpan
      return savedSchedules
    } catch (error) {
      console.error('Error:', error)
      throw new Error('Terjadi kesalahan pada penyimpanan jadwal')
    }
  }

  async show(id: number): Promise<ScheduleGroupAttendance | null> {
    const f = await ScheduleGroupAttendance.query()
      .preload('user')
      .preload('group_attendance')
      .preload('time')
      .where('id', id)
      .first()
    return f
  }

  async update(id: number, data: any): Promise<ScheduleGroupAttendance | null> {
    const f = await ScheduleGroupAttendance.find(id)
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const attendance = await ScheduleGroupAttendance.find(id)
    if (attendance) {
      await attendance.delete()
      return true
    }
    return false
  }
}
