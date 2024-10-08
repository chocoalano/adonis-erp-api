import PermissionGroup from '#models/MasterData/Configs/permission_group'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

export default class extends BaseSeeder {
  private async createPermissionGroupWithRetry(group: string, retryCount: number = 3) {
    let attempts = 0

    while (attempts < retryCount) {
      try {
        const permissionGroup = new PermissionGroup()
        permissionGroup.name = group
        await permissionGroup.save()

        const childPermissions = ['view', 'create', 'update', 'delete'].map((action) => ({
          name: `${group}-${action}`,
          action: `${group}-${action}`,
        }))
        await permissionGroup.related('childPermission').createMany(childPermissions)
        return // Sukses, keluar dari loop
      } catch (error) {
        if (error.code === 'ER_LOCK_DEADLOCK') {
          console.log(`Deadlock detected for group ${group}, retrying... (attempt ${attempts + 1})`)
          attempts++
          if (attempts >= retryCount) throw error // Jika sudah mencapai batas retry, lempar error
        } else {
          throw error // Lemparkan error lain
        }
      }
    }
  }

  async run() {
    const permissions = ['user', 'attendance', 'cuti', 'koreksi-absen', 'lembur', 'perubahan-shift']

    // Memproses seeding secara sekuensial untuk mengurangi kemungkinan deadlock
    for (const group of permissions) {
      await this.createPermissionGroupWithRetry(group)
    }
  }
}
