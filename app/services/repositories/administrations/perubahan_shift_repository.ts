import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { PerubahanShiftInterface } from '#services/interfaces/administrations/perubahan_shift_interface'
import PerubahanShift from '#models/HR_Administrations/perubahan_shift'
import ScheduleGroupAttendance from '#models/HR_Administrations/schedule_group_attendance'
import { formatDateTime } from '../../../helpers/for_date.js'
import { AttendanceScheduleRepository } from './attendance_schedule_repository.js'
import TimeAttendance from '#models/MasterData/Configs/time_attendance'

export class PerubahanShiftRepository implements PerubahanShiftInterface {
  private process: AttendanceScheduleRepository

  constructor() {
    this.process = new AttendanceScheduleRepository()
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
  ): Promise<ModelPaginatorContract<PerubahanShift>> {
    const sqlQuery = PerubahanShift.query()
      .preload('group')
      .preload('currentshift')
      .preload('adjustshift')
      .preload('user')
      .preload('line')
      .preload('hr')
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
          .orWhereHas('hr', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })

    return sqlQuery.orderBy('id', 'desc').paginate(page, limit)
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
  ): Promise<ModelPaginatorContract<PerubahanShift>> {
    const sqlQuery = PerubahanShift.query()
      .preload('user')
      .preload('line')
      .preload('hr')
      .whereHas('user', (uq) => {
        uq.whereHas('employe', (eq) => {
          eq.where('organization_id', organizationId)
        })
      })
      .orWhere((query) => {
        query
          .where('line_id', userId)
          .orWhere('hr_ID', userId);
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
          .orWhereHas('hr', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })
    return sqlQuery.orderBy('id', 'desc').paginate(page, limit)
  }

  async store(data: any): Promise<PerubahanShift> {
    data.date = DateTime.fromISO(new Date(data.date).toISOString())
    const save = new PerubahanShift()
    save.merge(data)
    return await save.save()
  }

  async show(id: number): Promise<PerubahanShift | null> {
    const f = await PerubahanShift.query().preload('user').where('id', id).first()
    return f
  }

  async update(id: number, data: any) {
    const f = await PerubahanShift.find(id)
    data.date = DateTime.fromISO(new Date(data.date).toISOString())
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const del = await PerubahanShift.find(id)
    if (del) {
      await del.delete()
      return true
    }
    return false
  }

  async approval(id: number, status: string, authId: number): Promise<boolean> {
    const record = await PerubahanShift.find(id);

    if (!record) {
      console.error(`PerubahanShift with ID ${id} not found.`);
      return false;
    }

    try {
      // Update approval status
      const isAuthorized = this.updateApprovalStatus(record, authId, status);
      if (!isAuthorized) {
        console.error(`Unauthorized action for user ${authId} on PerubahanShift ${id}.`);
        return false;
      }

      if (!(await record.save())) {
        console.error(`Failed to save updated PerubahanShift record with ID ${id}.`);
        return false;
      }

      // If all approvals are completed, process the shift adjustment
      if (record.lineApprove === 'y' && record.hrApprove === 'y') {
        return await this.processShiftAdjustment(record);
      }

      return true;
    } catch (error) {
      console.error(`Error in approval process: ${error.message}`);
      return false;
    }
  }

  private updateApprovalStatus(record: PerubahanShift, authId: number, status: string): boolean {
    let isUpdated = false;

    if (record.lineId === authId) {
      record.lineApprove = status;
      isUpdated = true;
    }

    if (record.hrId === authId) {
      record.hrApprove = status;
      isUpdated = true;
    }

    return isUpdated;
  }

  private async processShiftAdjustment(record: PerubahanShift): Promise<boolean> {
    try {
      const dateAdjustment = formatDateTime(record.date);

      const existingSchedule = await ScheduleGroupAttendance.query()
        .where((q) =>
          q
            .where('user_id', record.userId)
            .andWhere('date', dateAdjustment!)
            .andWhere('group_attendance_id', record.currentGroup)
            .andWhere('time_attendance_id', record.currentShift)
        )
        .first();

      if (!existingSchedule) {
        console.error(`No matching schedule found for user ${record.userId} on ${dateAdjustment}.`);
        return false;
      }

      const adjustedShift = await TimeAttendance.find(record.adjustShift);
      if (!adjustedShift) {
        console.error(`Adjusted shift with ID ${record.adjustShift} not found.`);
        return false;
      }

      const dataToUpdate = {
        group_attendance_id: record.currentGroup,
        user_id: record.userId,
        time_attendance_id: adjustedShift.id,
        date: dateAdjustment,
      };

      const isUpdated = await this.process.update(existingSchedule.id, dataToUpdate);
      if (!isUpdated) {
        console.error(`Failed to update schedule for user ${record.userId} on ${dateAdjustment}.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error(`Error processing shift adjustment: ${error.message}`);
      return false;
    }
  }
}
