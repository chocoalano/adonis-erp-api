import JobLevel from '#models/MasterData/Configs/job_levels'
import { JobLevelValidator } from '#validators/configs/job_level'
import type { HttpContext } from '@adonisjs/core/http'

export default class LevelsController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('view')
    const q = await JobLevel.all()
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('create')
    const input = request.all()
    const payload = await JobLevelValidator.validate(input)
    const q = await JobLevel.updateOrCreateMany('name', payload['data'])
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('JobLevelPolicy').authorize('delete')
    const q = await JobLevel.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
