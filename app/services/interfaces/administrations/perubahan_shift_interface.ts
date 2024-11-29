import PerubahanShift from '#models/HR_Administrations/perubahan_shift'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface PerubahanShiftInterface {
  index(
    page: number,
    limit: number,
    search: string
  ): Promise<ModelPaginatorContract<PerubahanShift>>
  indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number,
    userId: number
  ): Promise<ModelPaginatorContract<PerubahanShift>>
  store(data: any): Promise<PerubahanShift>
  show(id: number): Promise<PerubahanShift | null>
  update(id: number, data: any): Promise<any>
  delete(id: number): Promise<boolean>
  approval(id: number, status: string, authId: number): Promise<boolean>
}
