import Announcement from '#models/MasterData/announcement'
import type { HttpContext } from '@adonisjs/core/http'

export default class AnnouncementController {
  /**
   * Display a list of resource
   */
  async index({ response, request }: HttpContext) {
    try {
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const query = Announcement.query().preload('user_created_by')
      if (search) {
        query
          .where('title', 'like', `%${search}%`)
          .orWhere('value', 'like', `%${search}%`)
          .orWhere('publish', 'like', `%${search}%`)
      }
      const q = await query.paginate(page, limit)
      return response.ok(q)
    } catch (error) {
      return response.abort(error.message)
    }
  }
  /**
   * Handle form submission for the show action
   */
  async show({ request, response }: HttpContext) {
    const id = request.param('id')
    const q = await Announcement.find(id)
    if (q) {
      return response.ok(q)
    }
    return response.notFound
  }
}
