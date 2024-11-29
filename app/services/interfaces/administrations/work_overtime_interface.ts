import WorkOvertime from '#models/HR_Administrations/work_overtime'
import User from '#models/user'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface WorkOvertimeInterface {
  index(page: number, limit: number, search: string): Promise<ModelPaginatorContract<WorkOvertime>>
  indexGroup(
    page: number,
    limit: number,
    search: string,
    organizationId: number,
    userId: number
  ): Promise<ModelPaginatorContract<WorkOvertime>>
  store(data: any): Promise<WorkOvertime[]>
  show(id: number): Promise<WorkOvertime | null>
  update(id: number, data: any): Promise<any>
  delete(id: number): Promise<boolean>
  findUser(organizationId: number, jobPositionId: number): Promise<User[]>
  findUserApproval(userId: number): Promise<any[]>
  approval(id: number, status: string, authId: number): Promise<boolean>
}
