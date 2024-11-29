import KoreksiAbsen from '#models/HR_Administrations/koreksi_absen'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface KoreksiAbsenInterface {
  index(page: number, limit: number, search: string): Promise<ModelPaginatorContract<KoreksiAbsen>>
  indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number,
    userId: number
  ): Promise<ModelPaginatorContract<KoreksiAbsen>>
  store(data: any): Promise<KoreksiAbsen>
  show(id: number): Promise<KoreksiAbsen | null>
  update(id: number, data: any): Promise<any>
  delete(id: number): Promise<boolean>
  approval(id: number, status: string, authId: number): Promise<boolean>
}
