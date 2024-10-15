import Attendance from '#models/HR_Administrations/attendance'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import Company from '#models/MasterData/Configs/company'
import { AttendanceRepository } from '#services/repositories/administrations/attendance_repository'
import {
  attendanceInValidator,
  attendanceOutValidator,
  photoValidator,
} from '#validators/administrations/attendance'
import { cuid } from '@adonisjs/core/helpers'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { DateTime } from 'luxon'

interface AttendancePayload {
  date: Date
  lat: number
  lng: number
  photo?: string
  nik?: number
}

export default class AttendancesController {
  private process: AttendanceRepository

  constructor() {
    this.process = new AttendanceRepository()
  }

  /**
   * Display a list of resource
   */
  async listMobile({ request, response, auth }: HttpContext) {
    const input = request.all()
    const q = await this.process.indexMobile(auth.user!.nik, input.page, input.limit, input.search)
    return response.ok(q)
  }

  /**
   * Display a list of resource
   */
  async currentOffice({ response }: HttpContext) {
    const q = await Company.first()
    if (!q) {
      return response.notFound(q)
    }
    return response.ok(q)
  }
  /**
   * Display a list of resource
   */
  async currentDate({ response, auth }: HttpContext) {
    const q = await this.process.currentDate(auth.user!.nik.toString())
    if (!q) {
      return response.notFound(q)
    }
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ request, response, auth }: HttpContext) {
    const input = request.all()
    const { photo } = await request.validateUsing(photoValidator)
    // Define payload and result variables
    let payload: AttendancePayload
    let result: any
    if (input.flag === 'in') {
      await photo.move(app.makePath('storage/uploads/attendance-in'), {
        name: `${cuid()}.${photo.extname}`,
      })
      payload = (await attendanceInValidator.validate(input)) as AttendancePayload
      if (payload) {
        payload.nik = auth.user!.nik
        payload.photo = `attendance-in/${photo.fileName}`
        result = await this.process.in(payload)
      }
    } else {
      await photo.move(app.makePath('storage/uploads/attendance-out'), {
        name: `${cuid()}.${photo.extname}`,
      })
      payload = (await attendanceOutValidator.validate(input)) as AttendancePayload
      if (payload) {
        payload.nik = auth.user!.nik
        payload.photo = `attendance-out/${photo.fileName}`
        result = await this.process.out(payload)
      }
    }
    if (result !== null) {
      return response.ok(result)
    } else {
      return response.abort(
        'Terjadi kesalahan pada server yg disebabkan ketidak ketersediaanya jadwal absensi anda pada sistem!'
      )
    }
  }

  /**
   * Revission individual record
   */
  async revisionGet({ auth, request, response }: HttpContext) {
    const q = await Attendance.query()
      .where('date', request.param('date'))
      .andWhere('nik', auth.user!.nik)
      .firstOrFail()
    return response.ok(q)
  }

  /**
   * Revission individual record
   */
  async currentShift({ auth, response }: HttpContext) {
    try {
      const currentDate = DateTime.now().setZone('Asia/Jakarta').toFormat('yyyy-MM-dd')
      const q = await ScheduleGroupAttendance.query()
        .preload('time')
        .preload('group_attendance')
        .preload('user')
        .where('date', currentDate)
        .whereHas('user', (uq) => {
          uq.where('id', auth.user!.id)
        })
        .firstOrFail()
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }
}
