import Attendance from '#models/HR_Administrations/attendance'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import User from '#models/user'
import CloudinaryService from '#services/CloudinaryService'
import { AttendanceRepository } from '#services/repositories/administrations/attendance_repository'
import {
  attendanceInValidator,
  attendanceOutValidator,
  attendanceUpdateValidator,
  photoValidator,
} from '#validators/administrations/attendance'
import type { HttpContext } from '@adonisjs/core/http'
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
  async index({ auth, bouncer, request, response }: HttpContext) {
    // Authorize user
    await bouncer.with('AttendancePolicy').authorize('view');
    // Extract input data with default values
    const { page = 1, limit = 10, search } = request.all();
    // Authenticate user
    const user = await auth.authenticate();
    // Check roles
    const isAdminOrDeveloper =
      (await user.hasRole(user, 'Administrator')) ||
      (await user.hasRole(user, 'Developer'));
    let queryResult;
    // Admin or Developer specific processing
    if (isAdminOrDeveloper) {
      queryResult = await this.process.index(page, limit, search);
    } else {
      // Fetch user details with employe relation
      const userDetail = await User.query()
        .where('id', user.id)
        .preload('employe')
        .firstOrFail();
      // Build query for attendance based on organization
      queryResult = await Attendance.query()
        .preload('user')
        .whereHas('user', (userQuery) => {
          userQuery.whereHas('employe', (employeQuery) => {
            employeQuery.where('organization_id', userDetail.employe.organizationId);
          });
        })
        .if(search, (query) => {
          query.whereHas('user', (userSearch) => {
            userSearch
              .where('name', 'like', `%${search}%`)
              .orWhere('nik', 'like', `%${search}%`);
          });
        })
        .orderBy('date', 'desc')
        .paginate(page, limit);
    }
    return response.ok(queryResult);
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
  async store({ bouncer, request, response, auth }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('create')
    const input = request.all()
    const { photo } = await request.validateUsing(photoValidator)
    // Define payload and result variables
    let payload: AttendancePayload
    let result: any
    if (input.flag === 'in') {
      const uploadResult = await CloudinaryService.upload(photo, 'attendance-in')
      payload = (await attendanceInValidator.validate(input)) as AttendancePayload
      if (payload) {
        payload.nik = auth.user!.nik
        payload.photo = uploadResult.secure_url
        result = await this.process.in(payload)
      }
    } else {
      const uploadResult = await CloudinaryService.upload(photo, 'attendance-out')
      payload = (await attendanceOutValidator.validate(input)) as AttendancePayload
      if (payload) {
        payload.nik = auth.user!.nik
        payload.photo = uploadResult.secure_url
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
   * Show individual record
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('view')
    const q = await this.process.show(request.param('id'))
    return response.ok(q)
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

  /**
   * Edit individual record
   */
  async edit({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('update')
    const q = await this.process.show(request.param('id'))
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('update')
    const input = request.all()
    const payload = await attendanceUpdateValidator.validate(input)
    const q = await this.process.update(request.param('id'), payload)
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('delete')
    const q = await this.process.delete(request.param('id'))
    return response.ok(q)
  }
}
