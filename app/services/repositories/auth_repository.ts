import Permission from '#models/MasterData/Configs/permission'
import UEmergencyContact from '#models/MasterData/UserRelated/u_emergency_contact'
import UFamily from '#models/MasterData/UserRelated/u_family'
import UFormalEducation from '#models/MasterData/UserRelated/u_formal_education'
import UInformalEducation from '#models/MasterData/UserRelated/u_informal_education'
import UWorkExperience from '#models/MasterData/UserRelated/u_work_experience'
import User from '#models/user'
import { AuthInterface } from '#services/interfaces/auth_interfaces'
import {
  profileAlamatValidator,
  profileBankValidator,
  profileDataDiriValidator,
  profileEducationFormalValidator,
  profileEducationInformalValidator,
  profileFamiliesValidator,
  profileKontakDaruratValidator,
  profileWorkExperiencesValidator,
} from '#validators/authenticated/auth'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'

export class AuthRepository implements AuthInterface {
  async update(userId: number, data: any): Promise<User | null> {
    const existing = await User.findOrFail(userId)
    if (existing && data.avatar) {
      existing.image = data.avatar.image
      await existing.save()
    }
    if (existing && data.user) {
      const input = await profileDataDiriValidator(userId).validate(data.user)
      existing.name = input.name
      existing.nik = input.nik
      existing.email = input.email
      if (input.password) {
        existing.password = input.password
      }
      existing.phone = input.phone
      existing.placebirth = input.placebirth
      existing.datebirth = existing.datebirth = DateTime.fromJSDate(new Date(input.datebirth))
      existing.gender = input.gender
      existing.blood = input.blood
      existing.maritalStatus = input.maritalStatus
      existing.religion = input.religion
      if (data.user.image) {
        existing.image = data.user.image
      }
      await existing.save()
    }
    if (existing && data.alamat) {
      const input = await profileAlamatValidator.validate(data.alamat)
      await existing.related('address').updateOrCreate(
        {
          userId: existing.id,
        },
        input
      )
    }
    if (existing && data.bank) {
      const input = await profileBankValidator.validate(data.bank)
      await existing.related('bank').updateOrCreate(
        {
          userId: existing.id,
        },
        input
      )
    }
    if (existing && data.kontak_darurat) {
      const input = await profileKontakDaruratValidator.validate(data.kontak_darurat)
      for (const el of input) {
        const getId = await UEmergencyContact.query()
          .where('user_id', existing.id)
          .andWhere('name', el.name)
          .andWhere('relationship', el.relationship)
          .andWhere('profesion', el.profession)
          .first();

        let ec;
        if (getId) {
          ec = await existing.related('emergencyContact').query().where('id', getId.id).firstOrFail();
        } else {
          ec = new UEmergencyContact();
          ec.userId = existing.id;
        }
        ec.name = el.name
        ec.relationship = el.relationship
        ec.phone = el.phone
        ec.profesion = el.profession
        await ec.save();
      }
    }
    if (existing && data.families) {
      const input = await profileFamiliesValidator.validate(data.families)

      for (const el of input) {
        const getId = await UFamily.query()
          .where('user_id', existing.id)
          .andWhere('birthdate', el.birthdate)
          .andWhere('relationship', el.relationship)
          .first()

        let family
        if (getId) {
          family = await existing.related('family').query().where('id', getId.id).firstOrFail()
        } else {
          family = new UFamily()
          family.userId = existing.id
        }
        family.fullname = el.fullname
        family.relationship = el.relationship
        family.birthdate = DateTime.fromJSDate(new Date(el.birthdate))
        family.maritalStatus = el.marital_status
        family.job = el.job
        await family.save()
      }
    }
    if (existing && data.formal_education) {
      const input = await profileEducationFormalValidator.validate(data.formal_education)
      input.forEach(async (el) => {
        const getId = await UFormalEducation.query()
          .where('user_id', existing.id)
          .andWhere('majors', el.majors)
          .andWhere('institution', el.institution)
          .first();

        let t;
        if (getId) {
          t = await existing.related('formalEducation').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UFormalEducation();
          t.userId = existing.id;
        }
        t.institution = el.institution
        t.majors = el.majors
        t.score = el.score
        t.start = DateTime.fromJSDate(new Date(el.start))
        t.finish = DateTime.fromJSDate(new Date(el.finish))
        t.description = el.description
        t.certification = el.certification
        await t.save();
      })
    }
    if (existing && data.informal_education) {
      const input = await profileEducationInformalValidator.validate(data.informal_education)
      for (const el of input) {
        const getId = await UInformalEducation.query()
          .where('user_id', existing.id)
          .andWhere('name', el.name)
          .first();
        let t;
        if (getId) {
          t = await existing.related('informalEducation').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UInformalEducation();
          t.userId = existing.id;
        }
        t.name = el.name
        t.start = DateTime.fromJSDate(new Date(el.start))
        t.finish = DateTime.fromJSDate(new Date(el.finish))
        t.expired = DateTime.fromJSDate(new Date(el.expired))
        t.type = el.type
        t.duration = el.duration
        t.fee = el.fee
        t.description = el.description
        t.certification = el.certification
        await t.save();
      }
    }
    if (existing && data.work_experiences) {
      const input = await profileWorkExperiencesValidator.validate(data.work_experiences)
      input.forEach(async (el) => {
        const getId = await UWorkExperience.query()
          .where('user_id', existing.id)
          .andWhere('company', el.company)
          .first();
        let t;
        if (getId) {
          t = await existing.related('workExperience').query().where('id', getId.id).firstOrFail();
        } else {
          t = new UWorkExperience();
          t.userId = existing.id;
        }
        t.company = el.company
        t.position = el.position
        t.from = DateTime.fromJSDate(new Date(el.from))
        t.to = DateTime.fromJSDate(new Date(el.to))
        t.lengthOfService = el.length_of_service
        await t.save();
      })
    }
    if (existing && data.old_password && data.new_password) {
      const oldpass = existing.password
      if (!(await hash.verify(oldpass, data.old_password))) {
        return null
      }
      existing.password = data.new_password
      await existing.save()
    }
    return existing
  }

  async show(userId: number): Promise<{
    account: User | null
    role: string[]
    permission: string[]
  }> {
    const authorization = await User.query()
      .preload('roles', (postsQuery) => {
        postsQuery.preload('permissions')
      })
      .where('id', userId)
      .first()
    const account = await User.query()
      .where('id', userId)
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
      .first()
    let abilities: string[]
    if (account!.name === 'Superadmin') {
      const permissions = await Permission.all()
      abilities = [...new Set(permissions.flatMap((permission) => [permission.name]))]
    } else {
      abilities = [
        ...new Set(
          authorization!.roles.flatMap((role) =>
            role.permissions.map((permission) => permission.name)
          )
        ),
      ]
    }
    const result = {
      account: account,
      role: authorization!.roles.map((role) => role.name),
      permission: abilities,
    }

    return result
  }

  async remove_data_auth(userId: number, datatype: string, id: number): Promise<User | null> {
    try {
      const user = await User.findOrFail(userId);

      switch (datatype) {
        case 'kontak_keluarga':
          await user.related('family').query().where('id', id).delete();
          break;
        case 'kontak_darurat':
          await user.related('emergencyContact').query().where('id', id).delete();
          break;
        case 'pendidikan_normal':
          await user.related('formalEducation').query().where('id', id).delete();
          break;
        case 'pendidikan_informal':
          await user.related('informalEducation').query().where('id', id).delete();
          break;
        case 'pengalaman_kerja':
          await user.related('workExperience').query().where('id', id).delete();
          break;

        default:
          return user;
      }
      return user;

    } catch (error) {
      console.error(`Error removing data: ${error.message}`);
      return null;
    }
  }
}
