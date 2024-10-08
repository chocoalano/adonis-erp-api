import Role from '#models/MasterData/Configs/role'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  async run() {
    await Role.createMany([
      {
        name: 'Developer',
      },
      {
        name: 'Administrator',
      },
    ])
  }
}
