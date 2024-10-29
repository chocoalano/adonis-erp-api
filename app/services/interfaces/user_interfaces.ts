import User from '#models/user'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

export interface UserInterface {
  list(page: number, limit: number, search: string): Promise<ModelPaginatorContract<User>>
  listMobile(authId: number, search: string): Promise<User[] | null>
  create(data: any): Promise<User>
  update(userId: number, data: any): Promise<User>
  show(userId: number): Promise<User | null>
  delete(userId: number): Promise<User>
  import(
    Departement: any,
    Position: any,
    level: any,
    company: any,
    branch: any,
    users_import: any,
    payment_import: any
  ): Promise<{ status: number, message: string }>
  export(joinfrom: string, jointo: string): Promise<{ status: number, data: User[] | null }>
}
