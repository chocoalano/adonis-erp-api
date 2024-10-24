import BugReport from '#models/MasterData/Configs/bug_report'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import CloudinaryService from '#services/CloudinaryService'

export default class BugController {
  async store({ auth, request, response }: HttpContext) {
    try {
      const input = request.all()
      const file = request.file('pictureProof')
      const uploadResult = await CloudinaryService.upload(file, 'laporan-bug')
      input.pictureProof = uploadResult.secure_url
      input['createdBy'] = auth.user!.id
      const q = await BugReport.create(input)
      await emitter.emit('bug', q)
      return response.ok(q)
    } catch (error) {
      return response.abort(error)
    }
  }
}
