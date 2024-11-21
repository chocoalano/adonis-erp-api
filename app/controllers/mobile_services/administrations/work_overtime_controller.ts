import WorkOvertime from '#models/HR_Administrations/work_overtime'
import JobPosition from '#models/MasterData/Configs/job_position'
import Organization from '#models/MasterData/Configs/organization'
import User from '#models/user'
import { WorkOvertimeRepository } from '#services/repositories/administrations/work_overtime_repository'
import {
  WorkOvertimeCreateValidatorMobile,
  WorkOvertimeEditValidator,
} from '#validators/administrations/work_overtime'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import { DateTime } from 'luxon'

export default class WorkOvertimeController {
  private process: WorkOvertimeRepository

  constructor() {
    this.process = new WorkOvertimeRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ bouncer, request, response, auth }: HttpContext) {
    await bouncer.with('LemburPolicy').authorize('view')
    const { page, limit, search, organizationId, jobPositionId, userId } = request.all()
    if (organizationId || jobPositionId) {
      const u = await this.process.findUser(organizationId, jobPositionId)
      return response.ok(u)
    }
    if (userId) {
      const u = await this.process.findUserApproval(userId > 0 ? userId : auth.user!.id)
      return response.ok(u)
    }
    const user = await auth.authenticate()
    const uGroup = await User.query().where('id', user.id).preload('employe').first()
    const isAdminOrDeveloper =
      (await user.hasRole(user, 'Administrator')) || (await user.hasRole(user, 'Developer'))
    const q = isAdminOrDeveloper
      ? await this.process.index(page, limit, search)
      : await this.process.indexGroup(page, limit, search, uGroup!.employe.organizationId)
    const dept = await Organization.all()
    const pos = await JobPosition.all()
    const users = await User.all()
    return response.ok({ list: q, dept: dept, pos: pos, users: users })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ auth, bouncer, request, response }: HttpContext) {
    try {
      await bouncer.with('LemburPolicy').authorize('create')
      const payload = await WorkOvertimeCreateValidatorMobile.validate(request.all())
      const user = await User.query()
        .preload('employe')
        .where('id', auth.user!.id)
        .firstOrFail()
      const extendedPayload = {
        ...payload,
        userIdCreated: user.id,
        organizationId: user.employe.organizationId,
        jobPositionId: user.employe.jobPositionId,
        overtimeDayStatus: false,
        dateSpl: DateTime.now()
      }
      const arrsave: any[] = []
      arrsave.push(extendedPayload)
      const q = await this.process.store(arrsave)
      emitter.emit('pengajuan:lembur', q)
      return response.ok(q)
    } catch (error) {
      return response.status(500).send({ error: 'Something went wrong', details: error.message })
    }
  }


  /**
   * Handle form submission for the edit action
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('LemburPolicy').authorize('update')
    const id = request.param('id')
    const q = await WorkOvertime.find(id)
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('LemburPolicy').authorize('update')
    const payload = await WorkOvertimeEditValidator.validate(request.all())
    const id = request.param('id')
    const q = await this.process.update(id, payload['datapost'])
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('LemburPolicy').authorize('delete')
    const q = await this.process.delete(request.param('id'))
    return response.ok(q)
  }
}
