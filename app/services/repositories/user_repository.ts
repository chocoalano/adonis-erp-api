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
import { convertToDateTime, formatDateTime } from '../../helpers/for_date.js'

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
        delete item.id;
        await Model.updateOrCreate(
          { [uniqueField]: item.name },
          { ...item },
          { useTransaction: trx }
        );
      }
    };

    const updateOrInsertUsers = async (batch: any[], trx: any) => {
      for (const item of batch) {
        // Find an existing user by email or create a new instance
        let user = await User.query()
          .where('nik', item.nik)
          .first();

        if (!user) {
          user = new User();
        }
        user.name = item.name
        user.nik = item.nik
        user.email = item.email
        user.password = item.nik.toString()
        user.phone = item.phone
        user.placebirth = item.placebirth
        user.datebirth = item.datebirth ? DateTime.fromISO(item.datebirth) : DateTime.fromISO(new Date().toISOString())
        user.gender = item.gender === 'LAKI-LAKI' ? 'm' : 'w'
        user.blood = item.blood
        user.maritalStatus = item.maritalStatus
        user.religion = item.religion

        // Use transaction and save user
        user.useTransaction(trx);
        await user.save();

        // Fetch related entities in parallel to improve efficiency
        const [
          organization,
          jobPosition,
          jobLevel,
          approvalLineUser,
          approvalManagerUser,
          company,
          branch
        ] = await Promise.all([
          Organization.findBy('name', item.organization_id),
          JobPosition.findBy('name', item.job_position_id),
          JobLevel.findBy('name', item.job_level_id),
          User.findBy('nik', item.approval_line),
          User.findBy('nik', item.approval_manager),
          Company.findBy('name', item.company_id),
          Branch.findBy('name', item.branch_id)
        ]);

        // Define relations with ID lookups and default values
        const relations = {
          organizationId: organization?.id,
          jobPositionId: jobPosition?.id,
          jobLevelId: jobLevel?.id,
          approvalLine: approvalLineUser?.id || 1,
          approvalManager: approvalManagerUser?.id || 1,
          companyId: company?.id,
          branchId: branch?.id
        };

        // Update or create related 'employe' record
        await user.related('employe').updateOrCreate(
          { userId: user.id },
          {
            ...relations,
            status: item.status,
            joinDate: item.joinDate ? DateTime.fromISO(item.joinDate) : DateTime.now(),
            signDate: item.signDate ? DateTime.fromISO(item.signDate) : DateTime.now(),
          }
        );
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
  async export(joinfrom: string, jointo: string): Promise<{ status: number, data: User[] | null }> {
    try {
      const u = await User.query().where((Query) => {
        Query.whereHas('employe', (empQuery) => {
          empQuery.where('join_date', '>', joinfrom).andWhere('join_date', '<', jointo)
        })
      }).preload('employe').preload('bank').preload('salary').preload('taxConfig')
      return {
        status: 200,
        data: u
      }
    } catch (error) {
      return {
        status: error.status,
        data: null
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
    const updateOrCreate = async (
      relation: any, // Define the correct type if available
      payload: Record<string, any>,
      uniqueConstraints: Record<string, any> = {}
    ) => {
      return relation.updateOrCreate(uniqueConstraints, payload);
    };

    const getOrCreateRelated = async (
      relation: any, // Define the correct type if available
      model: any, // Model class type
      userId: number,
      constraints: Record<string, any>
    ) => {
      const existing = await relation.query().where(constraints).first();
      if (existing) return existing;

      const newInstance = new model();
      newInstance.userId = userId;
      Object.assign(newInstance, constraints);
      return newInstance;
    };

    if (data.user?.datebirth) data.user.datebirth = convertToDateTime(data.user.datebirth);
    if (data.employe) {
      data.employe.join_date = convertToDateTime(data.employe.join_date);
      data.employe.sign_date = convertToDateTime(data.employe.sign_date);
    }
    if (data.address?.idexpired) data.address.idexpired = convertToDateTime(data.address.idexpired);
    if (data.bpjs) {
      data.bpjs.bpjs_ketenagakerjaan_date = convertToDateTime(data.bpjs.bpjs_ketenagakerjaan_date);
      data.bpjs.bpjs_kesehatan_date = convertToDateTime(data.bpjs.bpjs_kesehatan_date);
      data.bpjs.jht_cost = convertToDateTime(data.bpjs.jht_cost);
      data.bpjs.jaminan_pensiun_date = convertToDateTime(data.bpjs.jaminan_pensiun_date);
    }

    // Update main user data
    const user = new User()
    Object.assign(user, data.user);
    await user.save();

    // Update roles
    if (data.user?.role) {
      const roles = data.user.role.split(',').map(Number);
      await user.related('roles').sync(roles);
    }

    // Related data updates
    await updateOrCreate(user.related('employe'), data.employe);
    await updateOrCreate(user.related('address'), data.address);
    await updateOrCreate(user.related('bank'), data.bank);
    await updateOrCreate(user.related('bpjs'), data.bpjs);
    // Update emergency contacts
    if (data.emergency_contacts) {
      for (const contact of data.emergency_contacts) {
        const emergencyContact = await getOrCreateRelated(user.related('emergencyContact'), UEmergencyContact, user.id, {
          name: contact.name,
          relationship: contact.relationship,
          profesion: contact.profession,
        });
        Object.assign(emergencyContact, contact);
        await emergencyContact.save();
      }
    }

    // Update family data
    if (data.family) {
      for (const member of data.family) {
        const familyMember = await getOrCreateRelated(user.related('family'), UFamily, user.id, {
          birthdate: formatDateTime(convertToDateTime(member.birthdate)),
          relationship: member.relationship,
        });
        Object.assign(familyMember, member);
        familyMember.birthdate = convertToDateTime(member.birthdate);
        await familyMember.save();
      }
    }

    // Formal education
    if (data.formal_education) {
      for (const edu of data.formal_education) {
        const education = await getOrCreateRelated(user.related('formalEducation'), UFormalEducation, user.id, {
          majors: edu.majors,
          institution: edu.institution,
        });
        Object.assign(education, edu);
        education.start = convertToDateTime(edu.start);
        education.finish = convertToDateTime(edu.finish);
        // console.log(education)
        await education.save();
      }
    }

    // Informal education
    if (data.informal_education) {
      for (const edu of data.informal_education) {
        const education = await getOrCreateRelated(user.related('informalEducation'), UInformalEducation, user.id, { name: edu.name });
        Object.assign(education, edu);
        education.start = convertToDateTime(edu.start);
        education.finish = convertToDateTime(edu.finish);
        education.expired = convertToDateTime(edu.expired);
        await education.save();
      }
    }

    // Salary and tax configuration
    await updateOrCreate(user.related('salary'), data.salary);
    await updateOrCreate(user.related('taxConfig'), data.tax);

    // Work experience
    if (data.work_experience) {
      for (const work of data.work_experience) {
        const experience = await getOrCreateRelated(user.related('workExperience'), UWorkExperience, user.id, { company: work.company });
        Object.assign(experience, work);
        experience.from = convertToDateTime(work.from);
        experience.to = convertToDateTime(work.to);
        await experience.save();
      }
    }

    return user;
  }
  async update(userId: number, data: any): Promise<User> {
    const updateOrCreate = async (
      relation: any, // Define the correct type if available
      payload: Record<string, any>,
      uniqueConstraints: Record<string, any> = {}
    ) => {
      return relation.updateOrCreate(uniqueConstraints, payload);
    };

    const getOrCreateRelated = async (
      relation: any, // Define the correct type if available
      model: any, // Model class type
      userId: number,
      constraints: Record<string, any>
    ) => {
      const existing = await relation.query().where(constraints).first();
      if (existing) return existing;

      const newInstance = new model();
      newInstance.userId = userId;
      Object.assign(newInstance, constraints);
      return newInstance;
    };

    const user = await User.findOrFail(userId);
    const {
      user: userData,
      employe,
      address,
      bank,
      bpjs,
      emergency_contacts,
      family,
      formal_education,
      informal_education,
      salary,
      tax,
      work_experience,
    } = data;

    // Convert dates for user, employe, and address
    if (userData?.datebirth) userData.datebirth = convertToDateTime(userData.datebirth);
    if (employe) {
      employe.join_date = convertToDateTime(employe.join_date);
      employe.sign_date = convertToDateTime(employe.sign_date);
    }
    if (address?.idexpired) address.idexpired = convertToDateTime(address.idexpired);
    if (bpjs) {
      bpjs.bpjs_ketenagakerjaan_date = convertToDateTime(bpjs.bpjs_ketenagakerjaan_date);
      bpjs.bpjs_kesehatan_date = convertToDateTime(bpjs.bpjs_kesehatan_date);
      bpjs.jht_cost = convertToDateTime(bpjs.jht_cost);
      bpjs.jaminan_pensiun_date = convertToDateTime(bpjs.jaminan_pensiun_date);
    }

    // Update main user data
    Object.assign(user, userData);
    if (userData?.password) user.password = userData.password
    if (userData?.image) user.image = userData.image;
    await user.save();

    // Update roles
    if (userData?.role) {
      const roles = userData.role.split(',').map(Number);
      await user.related('roles').sync(roles);
    }

    // Related data updates
    await updateOrCreate(user.related('employe'), employe);
    await updateOrCreate(user.related('address'), address);
    await updateOrCreate(user.related('bank'), bank);
    await updateOrCreate(user.related('bpjs'), bpjs);

    // Update emergency contacts
    if (emergency_contacts) {
      for (const contact of emergency_contacts) {
        const emergencyContact = await getOrCreateRelated(user.related('emergencyContact'), UEmergencyContact, user.id, {
          name: contact.name,
          relationship: contact.relationship,
          profesion: contact.profession,
        });
        Object.assign(emergencyContact, contact);
        await emergencyContact.save();
      }
    }

    // Update family data
    if (family) {
      for (const member of family) {
        const familyMember = await getOrCreateRelated(user.related('family'), UFamily, user.id, {
          birthdate: formatDateTime(convertToDateTime(member.birthdate)),
          relationship: member.relationship,
        });
        Object.assign(familyMember, member);
        familyMember.birthdate = convertToDateTime(member.birthdate);
        await familyMember.save();
      }
    }

    // Formal education
    if (formal_education) {
      for (const edu of formal_education) {
        const education = await getOrCreateRelated(user.related('formalEducation'), UFormalEducation, user.id, {
          majors: edu.majors,
          institution: edu.institution,
        });
        Object.assign(education, edu);
        education.start = convertToDateTime(edu.start);
        education.finish = convertToDateTime(edu.finish);
        // console.log(education)
        await education.save();
      }
    }

    // Informal education
    if (informal_education) {
      for (const edu of informal_education) {
        const education = await getOrCreateRelated(user.related('informalEducation'), UInformalEducation, user.id, { name: edu.name });
        Object.assign(education, edu);
        education.start = convertToDateTime(edu.start);
        education.finish = convertToDateTime(edu.finish);
        education.expired = convertToDateTime(edu.expired);
        await education.save();
      }
    }

    // Salary and tax configuration
    await updateOrCreate(user.related('salary'), salary);
    await updateOrCreate(user.related('taxConfig'), tax);

    // Work experience
    if (work_experience) {
      for (const work of work_experience) {
        const experience = await getOrCreateRelated(user.related('workExperience'), UWorkExperience, user.id, { company: work.company });
        Object.assign(experience, work);
        experience.from = convertToDateTime(work.from);
        experience.to = convertToDateTime(work.to);
        await experience.save();
      }
    }

    return user;
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
    const user = await User.findOrFail(userId);
    if (user.image) {
      try {
        const publicId = await CloudinaryService.extractPublicId(user.image);
        if (publicId.status) {
          await CloudinaryService.delete(publicId.res);
        }
      } catch (error) {
        console.error(`Failed to delete image for user ID ${userId}:`, error);
        throw new Error('Failed to delete associated image.');
      }
    }
    await user.delete();
    return user;
  }
}
