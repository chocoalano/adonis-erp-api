import Branch from '#models/MasterData/Configs/brance'
import Company from '#models/MasterData/Configs/company'
import JobLevel from '#models/MasterData/Configs/job_levels'
import JobPosition from '#models/MasterData/Configs/job_position'
import Organization from '#models/MasterData/Configs/organization'
import UEmergencyContact from '#models/MasterData/UserRelated/u_emergency_contact'
import UFamily from '#models/MasterData/UserRelated/u_family'
import UFormalEducation from '#models/MasterData/UserRelated/u_formal_education'
import UInformalEducation from '#models/MasterData/UserRelated/u_informal_education'
import UWorkExperience from '#models/MasterData/UserRelated/u_work_experience'
import User from '#models/user'
import CloudinaryService from '#services/CloudinaryService'
import { UserInterface } from '#services/interfaces/user_interfaces'
import db from '@adonisjs/lucid/services/db'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'

export class UserRepository implements UserInterface {
  async import(
    Departement: any,
    position_sync: any,
    level: any,
    company: any,
    branch: any,
    users_import: any,
    payment_import: any
  ): Promise<{ status: number, message: string }> {
    const processBatch = async (data: any[], batchSize: number, processFn: (batch: any[], trx: any) => Promise<void>) => {
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        const trx = await db.transaction();
        try {
          await processFn(batch, trx);
          await trx.commit();
        } catch (error) {
          await trx.rollback();
          throw error;
        }
      }
    };

    const updateOrInsertEntity = async (data: any[], Model: any, uniqueField: string, trx: any) => {
      for (const item of data) {
        Object.assign(item, {
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        });
        await Model.updateOrCreate(
          { [uniqueField]: item.name },
          { ...item },
          { useTransaction: trx }
        );
      }
    };

    const updateOrInsertUsers = async (batch: any[], trx: any) => {
      const nikList = batch.map((item: any) => item.nik);
      const existingUsers = await User.query().whereIn('nik', nikList).useTransaction(trx);
      const existingUsersMap = existingUsers.reduce((map, user) => {
        map[user.nik] = user;
        return map;
      }, {} as Record<string, any>);

      for (const item of batch) {

        const user = existingUsersMap[item.nik] || new User();
        Object.assign(user, item, {
          datebirth: DateTime.fromISO(item.datebirth),
          updated_at: new Date(),
          password: user.password || item.nik
        });
        user.useTransaction(trx);
        await user.save();

        // Update related records
        const relations = {
          organizationId: await Organization.findByOrFail('name', item.organization_id),
          jobPositionId: await JobPosition.findByOrFail('name', item.job_position_id),
          jobLevelId: await JobLevel.findByOrFail('name', item.job_level_id),
          approvalLine: await User.findByOrFail('name', item.approval_line),
          approvalManager: await User.findByOrFail('name', item.approval_manager),
          companyId: await Company.findByOrFail('name', item.company_id),
          branchId: await Branch.findByOrFail('name', item.branch_id)
        };

        await user.related('employe').updateOrCreate({ userId: user.id }, {
          ...relations,
          status: item.status,
          joinDate: DateTime.fromISO(item.joinDate),
          signDate: DateTime.fromISO(item.signDate)
        });
      }
    };

    const updateOrInsertPayments = async (batch: any[], trx: any) => {
      for (const item of batch) {
        const user = await (await User.findByOrFail('nik', item.user_id)).useTransaction(trx);

        await user.related('salary').updateOrCreate({ userId: user.id }, {
          basicSalary: item.basicSalary,
          salaryType: item.salaryType,
          paymentSchedule: item.paymentSchedule,
          prorateSettings: item.prorateSettings,
          overtimeSettings: item.overtimeSettings,
          costCenter: item.costCenter,
          costCenterCategory: item.costCenterCategory,
          currency: item.currency
        });

        await user.related('taxConfig').updateOrCreate({ userId: user.id }, {
          npwp15DigitOld: item.npwp_15_digit_old,
          npwp16DigitNew: item.npwp_16_digit_new,
          ptkpStatus: item.ptkp_status,
          taxMethod: item.tax_method,
          taxSalary: item.tax_salary,
          empTaxStatus: item.emp_tax_status,
          beginningNetto: item.beginning_netto,
          pph21_paid: item.pph_21_paid
        });
      }
    };

    try {
      if (Departement?.length) {
        await processBatch(Departement, 10, (batch, trx) => updateOrInsertEntity(batch, Organization, 'name', trx));
      }
      if (position_sync?.length) {
        await processBatch(position_sync, 10, (batch, trx) => updateOrInsertEntity(batch, JobPosition, 'name', trx));
      }
      if (level?.length) {
        await processBatch(level, 10, (batch, trx) => updateOrInsertEntity(batch, JobLevel, 'name', trx));
      }
      if (company?.length) {
        await processBatch(company, 10, (batch, trx) => updateOrInsertEntity(batch, Company, 'name', trx));
      }
      if (branch?.length) {
        await processBatch(branch, 10, (batch, trx) => updateOrInsertEntity(batch, Branch, 'name', trx));
      }
      if (users_import?.length) {
        await processBatch(users_import, 10, updateOrInsertUsers);
      }
      if (payment_import?.length) {
        await processBatch(payment_import, 10, updateOrInsertPayments);
      }
      return {
        status: 200,
        message: 'import success'
      };
    } catch (error) {
      console.error('Error during import:', error);
      return {
        status: error.status,
        message: error.message
      }
    }
  }

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
      for (const el of data.emergency_contacts) {
        const getId = await UEmergencyContact.query()
          .where('user_id', user.id)
          .andWhere('name', el.name)
          .andWhere('relationship', el.relationship)
          .andWhere('profesion', el.profession)
          .first();

        let ec;
        if (getId) {
          ec = await user.related('emergencyContact').query().where('id', getId.id).firstOrFail();
        } else {
          ec = new UEmergencyContact();
          ec.userId = user.id;
        }
        ec.name = el.name
        ec.relationship = el.relationship
        ec.phone = el.phone
        ec.profesion = el.profession
        await ec.save();
      }
    }

    // Convert dates and update or create related family data
    if (data.family) {
      for (const el of data.family) {
        const getId = await UFamily.query()
          .where('user_id', user.id)
          .andWhere('birthdate', el.birthdate)
          .andWhere('relationship', el.relationship)
          .first()

        let family
        if (getId) {
          family = await user.related('family').query().where('id', getId.id).firstOrFail()
        } else {
          family = new UFamily()
          family.userId = user.id
        }
        family.fullname = el.fullname
        family.relationship = el.relationship
        family.birthdate = DateTime.fromJSDate(new Date(el.birthdate))
        family.maritalStatus = el.marital_status
        family.job = el.job
        await family.save()
      }
    }

    // Convert dates and update or create formal education data
    if (data.formal_education) {
      for (const el of data.formal_education) {
        const getId = await UFormalEducation.query()
          .where('majors', el.majors)
          .andWhere('institution', el.institution)
          .first();
        let t;
        if (getId) {
          t = await user.related('formalEducation').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UFormalEducation();
          t.userId = user.id;
        }
        t.institution = el.institution
        t.majors = el.majors
        t.score = el.score
        t.start = DateTime.fromJSDate(new Date(el.start))
        t.finish = DateTime.fromJSDate(new Date(el.finish))
        t.description = el.description
        t.certification = el.certification
        await t.save();
      }
    }

    // Convert dates and update or create informal education data
    if (data.informal_education) {
      for (const el of data.informal_education) {
        const getId = await UInformalEducation.query()
          .where('user_id', user.id)
          .andWhere('name', el.name)
          .first();

        let t;
        if (getId) {
          t = await user.related('informalEducation').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UInformalEducation();
          t.userId = user.id;
        }

        t.name = el.name;
        t.start = DateTime.fromJSDate(new Date(el.start));
        t.finish = DateTime.fromJSDate(new Date(el.finish));
        t.expired = DateTime.fromJSDate(new Date(el.expired));
        t.type = el.type;
        t.duration = el.duration;
        t.fee = el.fee;
        t.description = el.description;
        t.certification = true;

        await t.save();
      }
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
      for (const el of data.work_experience) {
        const getId = await UWorkExperience.query()
          .where('user_id', user.id)
          .andWhere('company', el.name)
          .first();

        let t;
        if (getId) {
          t = await user.related('workExperience').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UWorkExperience();
          t.userId = user.id;
        }
        t.company = el.company
        t.position = el.position
        t.from = DateTime.fromJSDate(new Date(el.from))
        t.to = DateTime.fromJSDate(new Date(el.to))
        t.lengthOfService = el.length_of_service
        await t.save();
      }
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
      if (publicId.status) {
        await CloudinaryService.delete(publicId.res)
      }
      await t.delete()
    }
    return t
  }
}
