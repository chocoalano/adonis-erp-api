import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import KoreksiAbsen from '#models/HR_Administrations/koreksi_absen'
import { KoreksiAbsenInterface } from '#services/interfaces/administrations/koreksi_absen_interface'
import { AttendanceRepository } from './attendance_repository.js'
import Attendance from '#models/HR_Administrations/attendance'
import { formatDateTime } from '../../../helpers/for_date.js'

export class KoreksiAbsenRepository implements KoreksiAbsenInterface {
  private process: AttendanceRepository
  constructor() {
    this.process = new AttendanceRepository()
  }
  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async index(
    page: number,
    limit: number,
    search: string
  ): Promise<ModelPaginatorContract<KoreksiAbsen>> {
    const sqlQuery = KoreksiAbsen.query()
      .preload('user')
      .preload('line')
      .preload('hrd')
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('start_date', search).orWhere('end_date', search)
          }
        })
          .orWhereHas('user', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
          .orWhereHas('line', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
          .orWhereHas('hrd', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })

    return sqlQuery.orderBy('created_at', 'desc').paginate(page, limit)
  }

  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number,
    userId: number
  ): Promise<ModelPaginatorContract<KoreksiAbsen>> {
    const sqlQuery = KoreksiAbsen.query()
      .preload('user')
      .preload('line')
      .preload('hrd')
      .where((q) => {
        q.whereHas('user', (us) => {
          us.whereHas('employe', (emp) => {
            emp.where('organizationId', organizationId)
          })
        })
          .orWhere('line_id', userId)
          .orWhere('hr_ID', userId)
      })
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('start_date', search).orWhere('end_date', search)
          }
        })
          .orWhereHas('user', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
          .orWhereHas('line', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
          .orWhereHas('hrd', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })
    return sqlQuery.orderBy('created_at', 'desc').paginate(page, limit)
  }

  async store(data: any): Promise<KoreksiAbsen> {
    data.dateAdjustment = DateTime.fromISO(new Date(data.dateAdjustment).toISOString())
    const save = new KoreksiAbsen()
    save.merge(data)
    return await save.save()
  }

  async show(id: number): Promise<KoreksiAbsen | null> {
    const f = await KoreksiAbsen.query().preload('user').where('id', id).first()
    return f
  }

  async update(id: number, data: any) {
    const f = await KoreksiAbsen.find(id)
    data.dateAdjustment = DateTime.fromISO(new Date(data.dateAdjustment).toISOString())
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const del = await KoreksiAbsen.find(id)
    if (del) {
      await del.delete()
      return true
    }
    return false
  }

  async approval(id: number, status: string, authId: number): Promise<boolean> {
    const record = await KoreksiAbsen.find(id);
    if (!record) {
      console.error(`KoreksiAbsen with id ${id} not found.`);
      return false;
    }

    try {
      const isAuthorized = this.updateApprovalStatus(record, authId, status);
      if (!isAuthorized) {
        console.error(`Unauthorized action for user ${authId} on KoreksiAbsen ${id}.`);
        return false;
      }
      const dateAdjustment = formatDateTime(record.dateAdjustment);
      const attendance = await Attendance
        .query()
        .whereHas('user', (userQuery) => userQuery.where('id', record.userId))
        .andWhere('date', dateAdjustment!)
        .first();
      if (!attendance) {
        console.error(`Attendance record for user ${record.userId} on ${dateAdjustment} not found.`);
        return false;
      }
      const currentTimeInJakarta = DateTime.now().setZone('Asia/Jakarta');
      const statusIn = this.getTimeStatus(
        currentTimeInJakarta,
        record.timeinAdjustment
      );
      const statusOut = this.getTimeStatus(
        currentTimeInJakarta,
        record.timeoutAdjustment
      );

      // Update attendance with new adjustments
      const dataToUpdate = {
        nik: attendance.nik,
        schedule_group_attendances_id: attendance.schedule_group_attendances_id,
        time_in: record.timeinAdjustment,
        status_in: statusIn,
        time_out: record.timeoutAdjustment,
        status_out: statusOut,
      };

      await this.process.update(attendance.id, dataToUpdate);
      return true;
    } catch (error) {
      console.error(`Error processing approval: ${error.message}`);
      return false;
    }
  }

  private updateApprovalStatus(record: KoreksiAbsen, authId: number, status: string): boolean {
    let isUpdated = false;

    if (record.lineId === authId) {
      record.lineApprove = status;
      isUpdated = true;
    }

    if (record.hrId === authId) {
      record.hrApprove = status;
      isUpdated = true;
    }

    if (isUpdated) {
      record.save();
    }

    return isUpdated;
  }

  private getTimeStatus(currentTime: DateTime, adjustmentTime?: string): string {
    if (!adjustmentTime) return 'unknown';
    const adjustment = DateTime.fromFormat(adjustmentTime, 'HH:mm:ss');
    return currentTime > adjustment ? 'late' : 'unlate';
  }

}
