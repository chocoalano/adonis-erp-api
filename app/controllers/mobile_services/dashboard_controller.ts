import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import emitter from '@adonisjs/core/services/emitter'
import Cuti from '#models/HR_Administrations/cuti'

export default class DashboardController {
  async test_notif({ auth, response }: HttpContext) {
    const user = await User.find(auth.user!.id)
    const q = await Cuti.query().preload('user').where('user_id', user!.id).firstOrFail()
    if (q) {
      emitter.emit('pengajuan:cuti', q)
    }
    return response.ok(auth.user)
  }
}
