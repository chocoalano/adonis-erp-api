import User from '#models/user'
import CloudinaryService from '#services/CloudinaryService'
import { UserInterface } from '#services/interfaces/user_interfaces'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export class UserRepository implements UserInterface {
  async list(page: number, limit: number, search: string): Promise<ModelPaginatorContract<User>> {
    // Initialize the user query with necessary preloads
    const query = User.query().preload('address').preload('employe')
    // Define searchable fields
    const userFields = [
      'name',
      'nik',
      'email',
      'phone',
      'placebirth',
      'gender',
      'blood',
      'maritalStatus',
      'religion',
    ]
    const employeFields = ['organizationId', 'jobPositionId', 'jobLevelId', 'status']
    // Add search criteria if provided
    if (search) {
      query
        .where((q) => {
          // Search in user fields
          for (const field of userFields) {
            q.orWhere(field, 'like', `%${search}%`)
          }
        })
        .orWhereHas('employe', (empQuery) => {
          // Search in employee fields
          for (const field of employeFields) {
            empQuery.orWhere(field, 'like', `%${search}%`)
          }
        })
    }
    // Execute the query and return paginated results
    return query.orderBy('createdAt', 'desc').paginate(page, limit)
  }

  async listMobile(authId: number, search: string): Promise<User[] | null> {
    try {
      const auth = await User.query()
        .preload('employe')
        .where('id', authId)
        .firstOrFail()
      const query = User.query()
        .preload('address')
        .preload('employe')
        .whereHas('employe', (builder) => {
          builder.where('organizationId', auth.employe.organizationId)
        })
      if (search) {
        const searchFields = [
          'name',
          'nik',
          'email',
          'phone',
          'placebirth',
          'gender',
          'blood',
          'maritalStatus',
          'religion',
        ]
        query.where((q) => {
          searchFields.forEach((field) => {
            q.orWhere(field, 'like', `%${search}%`)
          })
        })
      }
      const users = await query.orderBy('name', 'asc')

      return users
    } catch (error) {
      console.error('Error fetching users:', error)
      return null
    }
  }


  async create(data: any): Promise<User> {
    if (data.user && data.user.datebirth) {
      data.user.datebirth = DateTime.fromISO(new Date(data.user.datebirth).toISOString())
    }
    if (data.employe) {
      if (data.employe.join_date) {
        data.employe.join_date = DateTime.fromISO(new Date(data.employe.join_date).toISOString())
      }
      if (data.employe.sign_date) {
        data.employe.sign_date = DateTime.fromISO(new Date(data.employe.sign_date).toISOString())
      }
    }

    const user = new User()
    user.merge(data.user)
    await user.save()
    await user.related('employe').updateOrCreate({}, data.employe)
    if (data.address) {
      data.address.idexpired = DateTime.fromISO(new Date(data.address.idexpired).toISOString())
      await user.related('address').updateOrCreate({}, data.address)
    }
    if (data.bank) {
      await user.related('bank').updateOrCreate({}, data.bank)
    }
    if (data.bpjs) {
      data.bpjs.bpjs_ketenagakerjaan_date = DateTime.fromISO(
        new Date(data.bpjs.bpjs_ketenagakerjaan_date).toISOString()
      )
      data.bpjs.bpjs_kesehatan_date = DateTime.fromISO(
        new Date(data.bpjs.bpjs_kesehatan_date).toISOString()
      )
      data.bpjs.jht_cost = DateTime.fromISO(new Date(data.bpjs.jht_cost).toISOString())
      data.bpjs.jaminan_pensiun_date = DateTime.fromISO(
        new Date(data.bpjs.jaminan_pensiun_date).toISOString()
      )
      await user.related('bpjs').updateOrCreate({}, data.bpjs)
    }
    if (data.emergency_contacts) {
      await user.related('emergencyContact').updateOrCreateMany(data.emergency_contacts)
    }
    if (data.family) {
      data.family = data.family.map((member: any) => {
        if (member.birthdate) {
          member.birthdate = DateTime.fromISO(new Date(member.birthdate).toISOString())
        }
        return member
      })
      await user.related('family').updateOrCreateMany(data.family)
    }
    if (data.formal_education) {
      data.formal_education = data.formal_education.map((member: any) => {
        if (member.start && member.finish) {
          member.start = DateTime.fromISO(new Date(member.start).toISOString())
          member.finish = DateTime.fromISO(new Date(member.finish).toISOString())
        }
        return member
      })
      await user.related('formalEducation').updateOrCreateMany(data.formal_education)
    }
    if (data.informal_education) {
      data.informal_education = data.informal_education.map((member: any) => {
        if (member.start && member.finish && member.expired) {
          member.start = DateTime.fromISO(new Date(member.start).toISOString())
          member.finish = DateTime.fromISO(new Date(member.finish).toISOString())
          member.expired = DateTime.fromISO(new Date(member.expired).toISOString())
        }
        return member
      })
      await user.related('informalEducation').updateOrCreateMany(data.informal_education)
    }
    if (data.salary) {
      await user.related('salary').updateOrCreate({}, data.salary)
    }
    if (data.tax) {
      await user.related('taxConfig').updateOrCreate({}, data.tax)
    }
    if (data.work_experience) {
      data.work_experience = data.work_experience.map((member: any) => {
        if (member.from && member.to) {
          member.from = DateTime.fromISO(new Date(member.from).toISOString())
          member.to = DateTime.fromISO(new Date(member.to).toISOString())
        }
        return member
      })
      await user.related('workExperience').updateOrCreateMany(data.work_experience)
    }
    return user
  }
  async update(userId: number, data: any): Promise<User> {
    const convertToDateTime = (date: string | null): DateTime | null => {
      return date ? DateTime.fromISO(date) : null
    }

    // Convert dates for user fields
    if (data.user && data.user.datebirth) {
      data.user.datebirth = convertToDateTime(data.user.datebirth.toISOString())
    }

    // Convert dates for employe fields
    if (data.employe) {
      data.employe.join_date = convertToDateTime(data.employe.join_date)
      data.employe.sign_date = convertToDateTime(data.employe.sign_date)
    }
    const user = await User.findOrFail(userId)
    user.name = data.user.name
    user.nik = data.user.nik
    user.email = data.user.email
    user.password = data.user.password
    user.phone = data.user.phone
    user.placebirth = data.user.placebirth
    user.datebirth = data.user.datebirth
    user.gender = data.user.gender
    user.blood = data.user.blood
    user.maritalStatus = data.user.maritalStatus
    user.religion = data.user.religion
    if (data.user.image !== null || data.user.image !== '') {
      user.image = data.user.image
    }
    await user.save()
    if (data.user.role) {
      const arrayRoles = data.user.role.split(',').map(Number)
      await user.related('roles').sync(arrayRoles)
    }

    // Update or create related employe data
    await user.related('employe').updateOrCreate({}, data.employe)

    // Update or create related address data
    if (data.address) {
      data.address.idexpired = convertToDateTime(data.address.idexpired)
      await user.related('address').updateOrCreate({}, data.address)
    }

    // Update or create related bank data
    if (data.bank) {
      await user.related('bank').updateOrCreate({}, data.bank)
    }

    // Convert dates and update or create related BPJS data
    if (data.bpjs) {
      data.bpjs.bpjs_ketenagakerjaan_date = convertToDateTime(data.bpjs.bpjs_ketenagakerjaan_date)
      data.bpjs.bpjs_kesehatan_date = convertToDateTime(data.bpjs.bpjs_kesehatan_date)
      data.bpjs.jht_cost = convertToDateTime(data.bpjs.jht_cost)
      data.bpjs.jaminan_pensiun_date = convertToDateTime(data.bpjs.jaminan_pensiun_date)
      await user.related('bpjs').updateOrCreate({}, data.bpjs)
    }

    // Update or create emergency contacts
    if (data.emergency_contacts) {
      await user.related('emergencyContact').updateOrCreateMany(data.emergency_contacts)
    }

    // Convert dates and update or create related family data
    if (data.family) {
      data.family = data.family.map((member: any) => {
        member.birthdate = convertToDateTime(member.birthdate)
        return member
      })
      await user.related('family').updateOrCreateMany(data.family)
    }

    // Convert dates and update or create formal education data
    if (data.formal_education) {
      data.formal_education = data.formal_education.map((member: any) => {
        member.start = convertToDateTime(member.start)
        member.finish = convertToDateTime(member.finish)
        return member
      })
      await user.related('formalEducation').updateOrCreateMany(data.formal_education)
    }

    // Convert dates and update or create informal education data
    if (data.informal_education) {
      data.informal_education = data.informal_education.map((member: any) => {
        member.start = convertToDateTime(member.start)
        member.finish = convertToDateTime(member.finish)
        member.expired = convertToDateTime(member.expired)
        return member
      })
      await user.related('informalEducation').updateOrCreateMany(data.informal_education)
    }

    // Update or create salary data
    if (data.salary) {
      await user.related('salary').updateOrCreate({}, data.salary)
    }

    // Update or create tax config data
    if (data.tax) {
      await user.related('taxConfig').updateOrCreate({}, data.tax)
    }

    // Convert dates and update or create work experience data
    if (data.work_experience) {
      data.work_experience = data.work_experience.map((member: any) => {
        member.from = convertToDateTime(member.from)
        member.to = convertToDateTime(member.to)
        return member
      })
      await user.related('workExperience').updateOrCreateMany(data.work_experience)
    }

    return user
  }

  async show(userId: number): Promise<User | null> {
    return await User.query()
      .preload('roles')
      .preload('address')
      .preload('bank')
      .preload('bpjs')
      .preload('emergencyContact')
      .preload('family')
      .preload('formalEducation')
      .preload('informalEducation')
      .preload('workExperience')
      .preload('employe')
      .preload('salary')
      .preload('taxConfig')
      .where('id', userId)
      .first()
  }
  async delete(userId: number): Promise<User> {
    const t = await User.findOrFail(userId)
    if (t) {
      const publicId = await CloudinaryService.extractPublicId(t.image)
      await CloudinaryService.delete(publicId)
      await t.delete()
    }
    return t
  }
}
