import Attendance from '#models/HR_Administrations/attendance'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { formatChartData, getDateFormat } from '../../helpers/for_date.js'
import User from '#models/user'
import emitter from '@adonisjs/core/services/emitter'
import Cuti from '#models/HR_Administrations/cuti'

export default class DashboardController {
  async test_notif({ auth, response }: HttpContext) {
    const user = await User.find(auth.user!.id)
    const q = await Cuti.query().preload('user').where('user_id', user!.id).firstOrFail()
    if (q) {
      emitter.emit('pengajuan:cuti', q)
    }
    return response.ok(auth.user)
  }

  async index({ request, response }: HttpContext) {
    const { page, limit, perday } = request.all()
    if (page && limit) {
      const absen = await Attendance.query()
        .preload('user')
        .where('status_in', 'late')
        .orderBy('id', 'desc')
        .paginate(page, limit)

      return response.ok(absen)
    }
    if (perday) {
      const attendanceData = db.from('attendances')
      const dateFormat = getDateFormat(perday)

      const fetch = await attendanceData
        .select(db.raw(`DATE_FORMAT(date, '${dateFormat}') as monthname`))
        .count('* as total')
        .where('status_in', 'late')
        .groupBy('monthname')
        .orderBy('monthname', 'asc')
      const chart = formatChartData(fetch)

      return response.ok(chart)
    }
    const [countUser, countDept, countPosisi, countAbsensi] = await Promise.all([
      db.from('users').count('* as total'),
      db.from('organizations').count('* as total'),
      db.from('job_positions').count('* as total'),
      db.from('attendances').count('* as total'),
    ])
    const ultah = await User.query()
      .preload('employe')
      .whereRaw("DATE_FORMAT(datebirth, '%m') = DATE_FORMAT(CURDATE(), '%m')")
    return response.ok({
      ultahdata: ultah,
      gridcount: {
        user: countUser[0].total,
        dept: countDept[0].total,
        posisi: countPosisi[0].total,
        absen: countAbsensi[0].total,
      },
    })
  }
}
