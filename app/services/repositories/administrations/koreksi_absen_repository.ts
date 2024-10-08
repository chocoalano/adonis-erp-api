import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import KoreksiAbsen from '#models/HR_Administrations/koreksi_absen'
import { KoreksiAbsenInterface } from '#services/interfaces/administrations/koreksi_absen_interface'

export class KoreksiAbsenRepository implements KoreksiAbsenInterface {
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
  ): Promise<ModelPaginatorContract<KoreksiAbsen>> {
    const sqlQuery = KoreksiAbsen.query()
      .preload('user')
      .preload('line')
      .preload('hrd')
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
          .orWhereHas('hrd', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })
    return sqlQuery.orderBy('id', 'desc').paginate(page, limit)
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
    const cek = await KoreksiAbsen.find(id)
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
