import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import GroupAttendance from '#models/HR_Administrations/group_attendance'
import { AttendanceScheduleRepository } from '#services/repositories/administrations/attendance_schedule_repository'
import {
  ScheduleGroupAbsenEditValidator
} from '#validators/administrations/group_absens'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import User from '#models/user'
import GroupUser from '#models/HR_Administrations/group_user'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'

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
      .whereHas('group_users', (gu) => {
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
    await bouncer.with('AttendancePolicy').authorize('create');
    const input = request.all();
    const arr: any[] = []
    for (const [key, value] of Object.entries(input)) {
      try {
        const group_user = await GroupUser.query()
          .whereHas('user', (u) => {
            u.where('id', value.user_id);
          })
          .firstOrFail();
        arr.push({
          group_attendance_id: group_user.id,
          user_id: value.user_id,
          time_attendance_id: value.time_attendance_id,
          date: DateTime.fromISO(value.date),
        });
      } catch (error) {
        continue;
      }
    }
    try {
      await ScheduleGroupAttendance.updateOrCreateMany(['group_attendance_id', 'user_id', 'date'], arr)
      return response.ok(arr)
    } catch (error) {
      return response.abort(arr, error.message)
    }
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
  /**
   * Delete record
   */
  async formAttr({ response }: HttpContext) {
    const group = await GroupAttendance.all();
    const time = await TimeAttendance.all();
    const user = await User.all();
    const result = { group, user, time };
    return response.ok(result);
  }
}
