import TimeAttendance from '#models/MasterData/Configs/time_attendance'
import { TimeValidator } from '#validators/configs/time'
import type { HttpContext } from '@adonisjs/core/http'

export default class TimeConfigsController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response }: HttpContext) {
    await bouncer.with('TimePolicy').authorize('view')
    const q = await TimeAttendance.all()
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('TimePolicy').authorize('view')
    const input = request.all()
    const payload = await TimeValidator.validate(input)
    const q = await TimeAttendance.updateOrCreateMany('type', payload['data'])
    return response.ok(q)
  }
  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('TimePolicy').authorize('view')
    const q = await TimeAttendance.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
  /**
   * Display a list of resource
   */
  async showAll({ response }: HttpContext) {
    const q = await TimeAttendance.all()
    return response.ok(q)
  }
}
