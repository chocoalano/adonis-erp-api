import Branch from '#models/MasterData/Configs/brance'
import { BranchValidator } from '#validators/configs/branch'
import type { HttpContext } from '@adonisjs/core/http'

export default class BranchesController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('BrancePolicy').authorize('view')
    const q = await Branch.all()
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('BrancePolicy').authorize('create')
    const input = request.all()
    const payload = await BranchValidator.validate(input)
    const q = await Branch.updateOrCreateMany('name', payload['data'])
    return response.ok(q)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('BrancePolicy').authorize('delete')
    const q = await Branch.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
