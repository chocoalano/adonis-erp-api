import Permission from '#models/MasterData/Configs/permission'
import UEmergencyContact from '#models/MasterData/UserRelated/u_emergency_contact'
import UFamily from '#models/MasterData/UserRelated/u_family'
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
    if (existing && data.users) {
      const input = await profileDataDiriValidator(userId).validate(data.users)
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
      if (data.users.image) {
        existing.image = data.users.image
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
      input.forEach(async (el) => {
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
          ec.relationship= el.relationship
          ec.phone = el.phone
          ec.profesion = el.profession
          await ec.save();
      })
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
        await existing.related('formalEducation').updateOrCreate(
          { majors: el.majors },
          {
            institution: el.institution,
            majors: el.majors,
            score: el.score,
            start: DateTime.fromJSDate(new Date(el.start)),
            finish: DateTime.fromJSDate(new Date(el.finish)),
            description: el.description,
            certification: el.certification,
          }
        )
      })
    }
    if (existing && data.informal_education) {
      const input = await profileEducationInformalValidator.validate(data.informal_education)
      input.forEach(async (el) => {
        await existing.related('informalEducation').updateOrCreate(
          { name: el.name },
          {
            name: el.name,
            start: DateTime.fromJSDate(new Date(el.start)),
            finish: DateTime.fromJSDate(new Date(el.finish)),
            expired: DateTime.fromJSDate(new Date(el.expired)),
            type: el.type,
            duration: el.duration,
            fee: el.fee,
            description: el.description,
            certification: el.certification,
          }
        )
      })
    }
    if (existing && data.work_experiences) {
      const input = await profileWorkExperiencesValidator.validate(data.work_experiences)
      input.forEach(async (el) => {
        await existing.related('workExperience').updateOrCreate(
          { company: el.company },
          {
            company: el.company,
            position: el.position,
            from: DateTime.fromJSDate(new Date(el.from)),
            to: DateTime.fromJSDate(new Date(el.to)),
            lengthOfService: el.length_of_service,
          }
        )
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
