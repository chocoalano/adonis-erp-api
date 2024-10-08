import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import { WorkOvertimeInterface } from '#services/interfaces/administrations/work_overtime_interface'
import WorkOvertime from '#models/HR_Administrations/work_overtime'
import User from '#models/user'

export class WorkOvertimeRepository implements WorkOvertimeInterface {
  /**
   * Get paginated list of attendances
   *
   * @param page - Current page number
   * @param limit - Number of items per page
   * @returns Paginated list of attendances
   */
  async index(
    page: number,
    limit: number,
    search: string
  ): Promise<ModelPaginatorContract<WorkOvertime>> {
    const sqlQuery = WorkOvertime.query()
      .preload('user')
      .preload('org')
      .preload('position')
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('date_spl', search)
          }
        })
          .orWhereHas('user', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).orWhere('nik', 'like', `%${search}%`)
          })
          .orWhereHas('org', (oQuery) => {
            oQuery.where('name', 'like', `%${search}%`)
          })
          .orWhereHas('user', (jQuery) => {
            jQuery.where('name', 'like', `%${search}%`)
          })
      })

    return sqlQuery.orderBy('date_spl', 'desc').paginate(page, limit)
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
    organizationId: number
  ): Promise<ModelPaginatorContract<WorkOvertime>> {
    const sqlQuery = WorkOvertime.query()
      .preload('user')
      .preload('org')
      .preload('position')
      .where('organizationId', organizationId)
      .if(search, (q) => {
        const isValidDate = DateTime.fromFormat(search, 'yyyy-MM-dd').isValid
        q.where((sql) => {
          if (isValidDate) {
            sql.where('date_spl', search)
          }
        })
          .orWhereHas('org', (gaQuery) => {
            gaQuery.where('name', 'like', `%${search}%`)
          })
          .orWhereHas('position', (tQuery) => {
            tQuery.where('name', 'like', `%${search}%`)
          })
          .orWhereHas('user', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`).where('nik', 'like', `%${search}%`)
          })
      })
    return sqlQuery.orderBy('date_spl', 'desc').paginate(page, limit)
  }

  async store(data: any): Promise<WorkOvertime[]> {
    const dataSave = data.map(
      (e: {
        userIdCreated: number
        userAdm: number
        userLine: number
        userGm: number
        userHr: number
        userDirector: number
        userFat: number
        dateSpl: string
        organizationId: number
        jobPositionId: number
        overtimeDayStatus: boolean
        dateOvertimeAt: string
      }) => ({
        useridCreated: e.userIdCreated,
        dateSpl: DateTime.fromISO(new Date(e.dateSpl).toISOString()),
        organizationId: e.organizationId,
        jobPositionId: e.jobPositionId,
        overtimeDayStatus: e.overtimeDayStatus,
        dateOvertimeAt: DateTime.fromISO(new Date(e.dateOvertimeAt).toISOString()),
        adminApproved: 'y',
        userAdm: e.userAdm,
        lineApproved: 'w',
        userLine: e.userLine,
        gmApproved: 'w',
        userGm: e.userGm,
        hrgaApproved: 'w',
        userHr: e.userHr,
        directorApproved: 'w',
        userDirector: e.userDirector,
        fatApproved: 'w',
        userFat: e.userFat,
      })
    )

    return await WorkOvertime.createMany(dataSave)
  }

  async show(id: number): Promise<WorkOvertime | null> {
    const f = await WorkOvertime.query()
      .preload('user')
      .preload('org')
      .preload('position')
      .where('id', id)
      .first()
    return f
  }

  async update(id: number, data: any) {
    const f = await WorkOvertime.find(id)
    data.dateSpl = DateTime.fromISO(new Date(data.dateSpl).toISOString())
    data.dateOvertimeAt = DateTime.fromISO(new Date(data.dateOvertimeAt).toISOString())
    if (f) {
      f.merge(data)
      await f.save()
    }
    return f
  }

  async delete(id: number): Promise<boolean> {
    const attendance = await WorkOvertime.find(id)
    if (attendance) {
      await attendance.delete()
      return true
    }
    return false
  }

  async findUser(organizationId: number | null, jobPositionId: number | null): Promise<User[]> {
    const query = User.query()
    if (organizationId) {
      query.whereHas('employe', (empQuery) => {
        empQuery.where('organizationId', organizationId)
      })
    }
    if (jobPositionId) {
      query.whereHas('employe', (empQuery) => {
        empQuery.where('jobPositionId', jobPositionId)
      })
    }
    return await query
  }

  async findUserApproval(userId: number): Promise<any> {
    // Preload 'employe' dan cari user berdasarkan userId
    const usr = await User.query().preload('employe').where('id', userId).first()
    // Jika user ditemukan
    if (usr) {
      const { organizationId, approvalLine } = usr.employe
      // Menggunakan Promise.all untuk menjalankan query paralel
      const [adm, line, gm, hr, director, fat] = await Promise.all([
        User.query().whereHas('employe', (empQuery) => {
          empQuery.where('organizationId', organizationId)
        }),
        User.query().where('id', approvalLine),
        User.query().whereHas('employe', (empQuery) => {
          empQuery
            .whereHas('org', (oQuery) => {
              oQuery.where('name', 'HRGA')
            })
            .whereHas('job', (oQuery) => {
              oQuery.where('name', 'HRGA MANAGER')
            })
            .andWhereHas('lvl', (lQuery) => {
              lQuery.where('name', 'MANAGER')
            })
        }),
        User.query().whereHas('employe', (empQuery) => {
          empQuery
            .whereHas('org', (oQuery) => {
              oQuery.where('name', 'HRGA')
            })
            .whereHas('job', (oQuery) => {
              oQuery.where('name', 'HRGA MANAGER')
            })
            .andWhereHas('lvl', (lQuery) => {
              lQuery.where('name', 'MANAGER')
            })
        }),
        User.query().whereHas('employe', (empQuery) => {
          empQuery
            .whereHas('org', (oQuery) => {
              oQuery.where('name', 'HRGA')
            })
            .whereHas('job', (oQuery) => {
              oQuery.where('name', 'HRGA MANAGER')
            })
            .andWhereHas('lvl', (lQuery) => {
              lQuery.where('name', 'MANAGER')
            })
        }),
        this.queryByOrgName('FAT'),
      ])
      return { adm, line, gm, hr, director, fat }
    }
    return {}
  }

  async queryByOrgName(orgName: string) {
    return User.query().whereHas('employe', (empQuery) => {
      empQuery.whereHas('org', (orgQuery) => {
        orgQuery.where('name', orgName)
      })
    })
  }

  async approval(id: number, status: string, authId: number): Promise<boolean> {
    const cek = await WorkOvertime.find(id)
    if (cek) {
      if (cek.userAdm === authId) {
        cek.adminApproved = status
      }
      if (cek.userLine === authId) {
        cek.lineApproved = status
      }
      if (cek.userGm === authId) {
        cek.gmApproved = status
      }
      if (cek.userHr === authId) {
        cek.hrgaApproved = status
      }
      if (cek.userDirector === authId) {
        cek.directorApproved = status
      }
      if (cek.userFat === authId) {
        cek.fatApproved = status
      }
      await cek.save()
      return true
    }
    return false
  }
}
