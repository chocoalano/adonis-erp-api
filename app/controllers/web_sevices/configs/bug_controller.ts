import BugReport from '#models/MasterData/Configs/bug_report'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { DateUniqueGenerator } from '../../helpers/for_date.js'
import { unlinkFile } from '../../helpers/file_uploads.js'
import emitter from '@adonisjs/core/services/emitter'

export default class BugController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response, request }: HttpContext) {
    try {
      await bouncer.with('BugPolicy').authorize('view')
      const page = request.input('page', 1)
      const limit = request.input('limit', 10)
      const search = request.input('search', '')
      const query = BugReport.query().preload('user_created_by')
      if (search) {
        query
          .where('title', 'like', `%${search}%`)
          .orWhere('description', 'like', `%${search}%`)
          .orWhere('repair_status', 'like', `%${search}%`)
          .orWhere('repair_progres', 'like', `%${search}%`)
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
      await bouncer.with('BugPolicy').authorize('create')
      const input = request.all()
      const file = request.file('pictureProof')
      let path = 'storage/uploads/laporan-bug'
      await file!.move(app.makePath(path), {
        name: `${DateUniqueGenerator()}.${file!.extname}`,
      })
      input.pictureProof = `laporan-bug/${file!.fileName!}`
      input['createdBy'] = auth.user!.id
      const q = await BugReport.create(input)
      await emitter.emit('bug', q)
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }
  /**
   * Handle form submission for the show action
   */
  async show({ bouncer, request, response }: HttpContext) {
    try {
      await bouncer.with('BugPolicy').authorize('view')
      const id = request.param('id')
      const q = await BugReport.find(id)
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }
  /**
   * Handle form submission for the create action
   */
  async update({ auth, bouncer, request, response }: HttpContext) {
    try {
      await bouncer.with('BugPolicy').authorize('update')
      const id = request.param('id')
      const q = await BugReport.find(id)
      if (q) {
        const input = request.all()
        const file = request.file('pictureProof', {
          size: '20mb',
          extnames: ['jpg', 'png', 'jpeg'],
        })
        input.pictureProof = q.pictureProof
        if (file) {
          if (q.pictureProof !== '' || q.pictureProof !== null) {
            await unlinkFile(`storage/uploads/${q.pictureProof}`)
          }
          let path = 'storage/uploads/laporan-bug'
          await file!.move(app.makePath(path), {
            name: `${DateUniqueGenerator()}.${file!.extname}`,
          })
          input.pictureProof = `laporan-bug/${file!.fileName!}`
        }
        input['createdBy'] = auth.user!.id
        q.merge(input)
        await q.save()
        await emitter.emit('bug', q)
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
    await bouncer.with('BugPolicy').authorize('delete')
    const q = await BugReport.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
