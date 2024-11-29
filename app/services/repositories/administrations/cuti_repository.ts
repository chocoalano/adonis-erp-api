import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { CutiInterface } from '#services/interfaces/administrations/cuti_interface'
import Cuti from '#models/HR_Administrations/cuti'

export class CutiRepository implements CutiInterface {
  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async index(page: number, limit: number, search: string): Promise<ModelPaginatorContract<Cuti>> {
    const sqlQuery = Cuti.query()
      .preload('user')
      .preload('line')
      .preload('hrga')
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
          .orWhereHas('hrga', (uQuery) => {
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
  ): Promise<ModelPaginatorContract<Cuti>> {
    const sqlQuery = Cuti.query()
      .preload('user')
      .preload('line')
      .preload('hrga')
      .where((q)=>{
        q.whereHas('user', (us)=>{
          us.whereHas('employe', (emp)=>{
            emp.where('organizationId', organizationId)
          })
        })
        .orWhere('user_line', userId)
        .orWhere('user_hr', userId)
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
          .orWhereHas('hrga', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })
    return sqlQuery.orderBy('id', 'desc').paginate(page, limit)
  }

  async store(data: any): Promise<Cuti> {
    data.startDate = DateTime.fromISO(new Date(data.startDate).toISOString())
    data.endDate = DateTime.fromISO(new Date(data.endDate).toISOString())
    const save = new Cuti()
    save.merge(data)
    return await save.save()
  }

  async show(id: number): Promise<Cuti | null> {
    const f = await Cuti.query().preload('user').where('id', id).first()
    return f
  }

  async update(id: number, data: any) {
    const f = await Cuti.find(id)
    data.startDate = DateTime.fromISO(new Date(data.startDate).toISOString())
    data.endDate = DateTime.fromISO(new Date(data.endDate).toISOString())
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const del = await Cuti.find(id)
    if (del) {
      await del.delete()
      return true
    }
    return false
  }

  async approval(id: number, status: string, authId: number): Promise<boolean> {
    const cek = await Cuti.find(id)
    if (cek) {
      if (cek.userLine === authId) {
        cek.lineApproved = status
      }
      if (cek.userHr === authId) {
        cek.hrgaApproved = status
      }
      await cek.save()
      return true
    }
    return false
  }
}
