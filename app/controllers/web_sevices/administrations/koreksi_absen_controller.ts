import User from '#models/user'
import { KoreksiAbsenRepository } from '#services/repositories/administrations/koreksi_absen_repository'
import { KoreksiAbsenValidator } from '#validators/administrations/koreksi_absen'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

export default class KoreksiAbsenController {
  private process: KoreksiAbsenRepository

  constructor() {
    this.process = new KoreksiAbsenRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ bouncer, request, response, auth }: HttpContext) {
    await bouncer.with('KoreksiAbsenPolicy').authorize('view')
    const { page, limit, search, userIdSelected } = request.all()
    if (page && limit) {
      const user = await auth.authenticate()
      const uGroup = await User.query().where('id', auth.user!.id).preload('employe').first()
      const isAdminOrDeveloper =
        (await user.hasRole(user, 'Administrator')) || (await user.hasRole(user, 'Developer'))
      const q = isAdminOrDeveloper
        ? await this.process.index(page, limit, search)
        : await this.process.indexGroup(page, limit, search, uGroup!.employe.organizationId, auth.user!.id)
      return response.ok(q)
    } else if (userIdSelected) {
      const user = await User.query().preload('employe').where('id', userIdSelected).firstOrFail()
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
    const userOptions = await User.all()
    return response.ok({ userOptions })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('KoreksiAbsenPolicy').authorize('create')
    const payload = await KoreksiAbsenValidator.validate(request.all())
    const q = await this.process.store(payload)
    emitter.emit('pengajuan:koreksi-absen', q)
    return response.ok(q)
  }

  /**
   * Handle form submission for the show action
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('KoreksiAbsenPolicy').authorize('view')
    const q = await this.process.show(request.param('id'))
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('KoreksiAbsenPolicy').authorize('update')
    const payload = await KoreksiAbsenValidator.validate(request.all())
    const id = request.param('id')
    const q = await this.process.update(id, payload)
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('KoreksiAbsenPolicy').authorize('delete')
    const q = await this.process.delete(request.param('id'))
    return response.ok(q)
  }
}
