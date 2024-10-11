import JobPosition from '#models/MasterData/Configs/job_position'
import { OrganizationValidator } from '#validators/configs/organization'
import type { HttpContext } from '@adonisjs/core/http'

export default class JobsController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('view')
    const q = await JobPosition.all()
    return response.ok(q)
  }
  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('create')
    const input = request.all()
    const payload = await OrganizationValidator.validate(input)
    const q = await JobPosition.updateOrCreateMany('name', payload['data'])
    return response.ok(q)
  }
  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('delete')
    const q = await JobPosition.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
