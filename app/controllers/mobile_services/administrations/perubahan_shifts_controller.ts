import GroupAttendance from '#models/HR_Administrations/group_attendance'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import User from '#models/user'
import { PerubahanShiftRepository } from '#services/repositories/administrations/perubahan_shift_repository'
import { PerubahanShiftValidator } from '#validators/administrations/perubahan_shift'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

export default class PerubahanShiftsController {
  private process: PerubahanShiftRepository

  constructor() {
    this.process = new PerubahanShiftRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ bouncer, request, response, auth }: HttpContext) {
    await bouncer.with('PerubahanShiftPolicy').authorize('view')
    const { page, limit, search, userIdSelected, date } = request.all()
    if (page && limit) {
      const user = await auth.authenticate()
      const isAdminOrDeveloper =
        (await user.hasRole(user, 'Administrator')) || (await user.hasRole(user, 'Developer'))
      const q = isAdminOrDeveloper
        ? await this.process.index(page, limit, search)
        : await this.process.indexGroup(page, limit, search, user.employe.organizationId)
      return response.ok(q)
    } else if (userIdSelected && !date) {
      const user = await User.query().preload('employe').where('id', userIdSelected).firstOrFail()
      if (user) {
        const line = await User.query().where('id', user.employe.approvalLine)
        const hrga = await User.query().whereHas('employe', (empQuery) => {
          empQuery
            .whereHas('org', (oQuery) => {
              oQuery.where('name', 'HRGA')
            })
            .whereHas('job', (oQuery) => {
              oQuery.where('name', 'HRGA MANAGER')
            })
            .andWhereHas('lvl', (lQuery) => {
              lQuery.where('name', 'MANAGER')
            })
        })
        return response.ok({ line, hrga })
      }
    } else if (userIdSelected && date) {
      const x = await ScheduleGroupAttendance.query()
        .preload('group_attendance')
        .preload('user')
        .preload('time')
        .where('date', date)
        .andWhereHas('user', (uQuery) => {
          uQuery.where('id', userIdSelected > 0 ? userIdSelected : auth.user!.id)
        })
        .firstOrFail()
      return response.ok(x)
    }
    const userOptions = await User.all()
    const groupAbsenOptions = await GroupAttendance.all()
    const shiftOptions = await TimeAttendance.all()
    const fline = await User.query().preload('employe').where('id', auth.user?.id!).firstOrFail()
    const lineOptions = await User.query().where('id', fline.employe.approvalLine)
    const HrdOptions = await User.query().whereHas('employe', (empq) => {
      empq.whereHas('org', (org) => {
        org.where('name', 'HRGA')
      })
    })
    return response.ok({ userOptions, groupAbsenOptions, shiftOptions, HrdOptions, lineOptions })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, bouncer, request, response }: HttpContext) {
    await bouncer.with('PerubahanShiftPolicy').authorize('create')
    const payload = await PerubahanShiftValidator.validate(request.all())
    const extendedPayload = {
      ...payload,
      userId: auth.user!.id
    }
    const q = await this.process.store(extendedPayload)
    emitter.emit('pengajuan:shift', q)
    return response.ok(q)
  }

  /**
   * Handle form submission for the show action
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('PerubahanShiftPolicy').authorize('view')
    const q = await this.process.show(request.param('id'))
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('PerubahanShiftPolicy').authorize('update')
    const payload = await PerubahanShiftValidator.validate(request.all())
    const id = request.param('id')
    const q = await this.process.update(id, payload)
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('PerubahanShiftPolicy').authorize('delete')
    const q = await this.process.delete(request.param('id'))
    return response.ok(q)
  }
}
