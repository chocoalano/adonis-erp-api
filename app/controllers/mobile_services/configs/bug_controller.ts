import BugReport from '#models/MasterData/Configs/bug_report'
import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { DateUniqueGenerator } from '../../../helpers/for_date.js'
import emitter from '@adonisjs/core/services/emitter'

export default class BugController {
  async store({ auth, request, response }: HttpContext) {
    try {
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
}
