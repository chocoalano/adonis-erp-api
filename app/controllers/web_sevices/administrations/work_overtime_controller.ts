import WorkOvertime from '#models/HR_Administrations/work_overtime'
import JobPosition from '#models/MasterData/Configs/job_position'
import Organization from '#models/MasterData/Configs/organization'
import User from '#models/user'
import { WorkOvertimeRepository } from '#services/repositories/administrations/work_overtime_repository'
import {
  WorkOvertimeCreateValidator,
  WorkOvertimeEditValidator,
} from '#validators/administrations/work_overtime'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

export default class ScheduleGroupAbsensController {
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
      const u = await this.process.findUserApproval(userId)
      return response.ok(u)
    }
    const user = await auth.authenticate()
    const isAdminOrDeveloper =
      (await user.hasRole(user, 'Administrator')) || (await user.hasRole(user, 'Developer'))
    const q = isAdminOrDeveloper
      ? await this.process.index(page, limit, search)
      : await this.process.indexGroup(page, limit, search, user.employe.organizationId, auth.user!.id)
    const dept = await Organization.all()
    const pos = await JobPosition.all()
    const users = await User.all()
    return response.ok({ list: q, dept: dept, pos: pos, users: users })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('LemburPolicy').authorize('create')
    const payload = await WorkOvertimeCreateValidator.validate(request.all())
    const q = await this.process.store(payload['datapost'])
    emitter.emit('pengajuan:lembur', q)
    return response.ok(q)
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
