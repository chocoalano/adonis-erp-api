import Notification from '#models/notification'
import NotificationView from '#models/notification_view'
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
    const { page, limit = 10, type } = request.all();
    const userId = auth.user?.id;

    if (!userId) {
      return response.unauthorized({ message: 'User not authenticated' });
    }

    let notifications;
    let isReadTotalNotifications = 0;

    if (type === 'pengajuan') {
      // Query for 'pengajuan' type notifications
      notifications = await NotificationView.query()
        .where((query) => {
          query
            .whereIn('user_1', [userId])
            .orWhereIn('user_2', [userId])
            .orWhereIn('user_3', [userId])
            .orWhereIn('user_4', [userId])
            .orWhereIn('user_5', [userId])
            .orWhereIn('user_6', [userId]);

          query.andWhere((subQuery) => {
            subQuery
              .whereIn('status_1', ['w'])
              .orWhereIn('status_2', ['w'])
              .orWhereIn('status_3', ['w'])
              .orWhereIn('status_4', ['w'])
              .orWhereIn('status_5', ['w'])
              .orWhereIn('status_6', ['w']);
          });
        })
        .orderBy('id', 'desc')
        .paginate(page, limit);
      isReadTotalNotifications = 0;
    } else {
      // Query for other types of notifications
      notifications = await Notification.query()
        .preload('fromUser')
        .preload('toUser')
        .where('to', userId)
        .orderBy('id', 'desc')
        .paginate(page, limit);

      // Count unread notifications
      const [{ total = 0 } = {}] = await db.from('notifications')
        .where('to', userId)
        .andWhere('isread', 'n')
        .count('* as total');

      isReadTotalNotifications = total;
    }
    return response.ok({ isReadTotalNotifications, notifications });
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
