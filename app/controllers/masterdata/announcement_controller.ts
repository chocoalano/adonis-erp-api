import Announcement from '#models/MasterData/announcement'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'

export default class AnnouncementController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response, request }: HttpContext) {
    try {
      await bouncer.with('AnnouncementPolicy').authorize('view')
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
   * Handle form submission for the create action
   */
  async store({ auth, bouncer, request, response }: HttpContext) {
    try {
      await bouncer.with('AnnouncementPolicy').authorize('create')
      const input = request.all()
      input['createdBy'] = auth.user!.id
      const q = await Announcement.create(input)
      await emitter.emit('pengumuman', q)
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }
  /**
   * Handle form submission for the show action
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AnnouncementPolicy').authorize('view')
    const id = request.param('id')
    const q = await Announcement.find(id)
    if (q) {
      return response.ok(q)
    }
    return response.notFound
  }
  /**
   * Handle form submission for the create action
   */
  async update({ auth, bouncer, request, response }: HttpContext) {
    try {
      await bouncer.with('AnnouncementPolicy').authorize('update')
      const id = request.param('id')
      const q = await Announcement.find(id)
      if (q) {
        const input = request.all()
        input['createdBy'] = auth.user!.id
        q.merge(input)
        await q.save()
        await emitter.emit('pengumuman', q)
      }
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AnnouncementPolicy').authorize('delete')
    const q = await Announcement.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
