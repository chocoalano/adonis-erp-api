import User from '#models/user'

export interface AuthInterface {
  update(userId: number, data: any): Promise<User | null>
  show(userId: number): Promise<{
    account: User | null
    role: string[]
    permission: string[]
  }>
}
