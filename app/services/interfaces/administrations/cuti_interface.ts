import Cuti from '#models/HR_Administrations/cuti'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface CutiInterface {
  index(page: number, limit: number, search: string): Promise<ModelPaginatorContract<Cuti>>
  indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number,
    userId: number
  ): Promise<ModelPaginatorContract<Cuti>>
  store(data: any): Promise<Cuti>
  show(id: number): Promise<Cuti | null>
  update(id: number, data: any): Promise<any>
  delete(id: number): Promise<boolean>
  approval(id: number, status: string, authId: number): Promise<boolean>
}
