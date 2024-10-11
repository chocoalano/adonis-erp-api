import Organization from '#models/MasterData/Configs/organization'
import { OrganizationValidator } from '#validators/configs/organization'
import type { HttpContext } from '@adonisjs/core/http'

export default class OrganizationsController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('view')
    const q = await Organization.all()
    return response.ok(q)
  }
  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('create')
    const input = request.all()
    const payload = await OrganizationValidator.validate(input)
    const q = await Organization.updateOrCreateMany('name', payload['data'])
    return response.ok(q)
  }
  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('delete')
    const q = await Organization.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
