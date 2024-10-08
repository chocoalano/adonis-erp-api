import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { PerubahanShiftInterface } from '#services/interfaces/administrations/perubahan_shift_interface'
import PerubahanShift from '#models/HR_Administrations/perubahan_shift'

export class PerubahanShiftRepository implements PerubahanShiftInterface {
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
    organizationId: number
  ): Promise<ModelPaginatorContract<PerubahanShift>> {
    const sqlQuery = PerubahanShift.query()
      .preload('user')
      .preload('line')
      .preload('hr')
      .where('organizationId', organizationId)
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
    const cek = await PerubahanShift.find(id)
    if (cek) {
      if (cek.lineId === authId) {
        cek.lineApprove = status
      }
      if (cek.hrId === authId) {
        cek.hrApprove = status
      }
      await cek.save()
      return true
    }
    return false
  }
}
