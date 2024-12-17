import Notification from '#models/notification'
import NotificationView from '#models/view/notification_view'
import { CutiRepository } from '#services/repositories/administrations/cuti_repository'
import { KoreksiAbsenRepository } from '#services/repositories/administrations/koreksi_absen_repository'
import { PerubahanShiftRepository } from '#services/repositories/administrations/perubahan_shift_repository'
import { WorkOvertimeRepository } from '#services/repositories/administrations/work_overtime_repository'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class NotificationController {
  private processCuti: CutiRepository
  private processKorsen: KoreksiAbsenRepository
  private processPershift: PerubahanShiftRepository
  private processLembur: WorkOvertimeRepository

  constructor() {
    this.processCuti = new CutiRepository()
    this.processKorsen = new KoreksiAbsenRepository()
    this.processPershift = new PerubahanShiftRepository()
    this.processLembur = new WorkOvertimeRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ auth, response, request }: HttpContext) {
    const { page = 1, limit = 10, type } = request.all()
    const userId = auth.user?.id
    if (!userId) {
      return response.unauthorized({ message: 'User not authenticated' })
    }
    let notifications
    let isReadTotalNotifications
    if (type === 'pengajuan') {
      const userStatusFields = [
        { user: 'user_1', status: 'status_1' },
        { user: 'user_2', status: 'status_2' },
        { user: 'user_3', status: 'status_3' },
        { user: 'user_4', status: 'status_4' },
        { user: 'user_5', status: 'status_5' },
        { user: 'user_6', status: 'status_6' },
      ]
      notifications = await NotificationView.query()
        .preload('user')
        .where((query) => {
          userStatusFields.forEach(({ user, status }) => {
            query.orWhere((subQuery) => {
              subQuery.where(user, userId).andWhere(status, 'w')
            })
          })
        })
        .paginate(page, limit)
      isReadTotalNotifications = 0
    } else {
      notifications = await Notification.query()
        .preload('fromUser')
        .preload('toUser')
        .where('to', userId)
        .orderBy('id', 'desc')
        .paginate(page, limit)
      const count = await db
        .from('notifications')
        .where('to', userId)
        .andWhere('isread', 'n')
        .count('* as total')
      isReadTotalNotifications = count[0].total
    }
    return response.ok({ isReadTotalNotifications, notifications })
  }

  async show({ response, request }: HttpContext) {
    const id = request.param('id')
    const read = await Notification.find(id)
    if (read) {
      read.isread = 'y'
      await read.save()
    }
    return response.ok(read)
  }

  async approval({ auth, response, request }: HttpContext) {
    let id = request.param('id')
    let indicatours = request.param('tablename')
    let authId = auth.user!.id
    let status = request.input('status')
    let exec
    switch (indicatours) {
      case 'cuti':
        exec = this.processCuti.approval(id, status, authId)
        break
      case 'koreksi-absensi':
        exec = this.processKorsen.approval(id, status, authId)
        break
      case 'lembur':
        exec = this.processLembur.approval(id, status, authId)
        break
      case 'perubahan-shift':
        exec = this.processPershift.approval(id, status, authId)
        break
      default:
        return response.status(400).send({ error: 'Unknown table name' })
    }
    if (!exec) {
      return response.status(400).send({ error: 'Approval process not executed' })
    }
    return await exec
  }
}
