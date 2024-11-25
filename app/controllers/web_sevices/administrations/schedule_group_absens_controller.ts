import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import GroupAttendance from '#models/HR_Administrations/group_attendance'
import { AttendanceScheduleRepository } from '#services/repositories/administrations/attendance_schedule_repository'
import {
  ScheduleGroupAbsenEditValidator,
  ScheduleGroupAbsenValidator,
} from '#validators/administrations/group_absens'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'

export default class ScheduleGroupAbsensController {
  private process: AttendanceScheduleRepository

  constructor() {
    this.process = new AttendanceScheduleRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ bouncer, request, response, auth }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('view')
    const { page, limit, search } = request.all()
    const user = await auth.authenticate()
    const groupUser = await GroupAttendance.query()
    .whereHas('group_users', (gu)=>{
      gu.where('user_id', user.id)
    }).first()
    const uGroup = await User.query().where('id', auth.user!.id).preload('employe').first()
    const isAdminOrDeveloper =
      (await user.hasRole(user, 'Administrator')) || (await user.hasRole(user, 'Developer'))
    const q = isAdminOrDeveloper
      ? await this.process.index(page, limit, search)
      : await this.process.indexGroup(page, limit, search, uGroup!.employe.organizationId, groupUser!.id)

    const group = await GroupAttendance.all()
    const jam = await TimeAttendance.all()
    return response.ok({ list: q, group: group, jam: jam })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('create')
    const input = request.all()
    if (!input.start || !input.end) {
      return response.badRequest('Tanggal mulai dan akhir harus diisi')
    }
    const payload = await ScheduleGroupAbsenValidator.validate(input)
    const { start, end, group, time } = payload
    const startDate = DateTime.fromJSDate(new Date(start))
    const endDate = DateTime.fromJSDate(new Date(end))
    if (!startDate.isValid || !endDate.isValid) {
      return response.badRequest('Tanggal tidak valid')
    }
    const q = await this.process.store(group, time, startDate, endDate)
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('update')
    const payload = await ScheduleGroupAbsenEditValidator.validate(request.all())
    const id = request.param('id')
    const q = await this.process.update(id, payload)
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
