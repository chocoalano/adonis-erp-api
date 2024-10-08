import { uniqueRule } from '#validators/Rules/unique'
import vine from '@vinejs/vine'

// Definisikan nilai enum dengan `as const` untuk validasi yang lebih ketat
const GENDERS = ['m', 'w'] as const
const BLOOD_TYPES = ['a', 'b', 'o', 'ab'] as const
const MARITAL_STATUSES = ['single', 'marriade', 'widow', 'widower'] as const
const RELIGIONS = ['islam', 'protestant', 'catholic', 'hindu', 'buddha', 'khonghucu'] as const

export const profileDataDiriValidator = (userId?: number) =>
  vine.compile(
    vine.object({
      name: vine.string(),
      nik: vine.number().use(
        uniqueRule({
          table: 'users',
          column: 'nik',
          excludeId: userId, // Use userId instead of context
          idColumn: 'id',
        })
      ),
      email: vine.string().use(
        uniqueRule({
          table: 'users',
          column: 'email',
          excludeId: userId, // Use userId instead of context
          idColumn: 'id',
        })
      ),
      password: vine.string().optional(),
      phone: vine.string(),
      placebirth: vine.string(),
      datebirth: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      gender: vine.enum(GENDERS),
      blood: vine.enum(BLOOD_TYPES),
      maritalStatus: vine.enum(MARITAL_STATUSES),
      religion: vine.enum(RELIGIONS),
      image: vine.string().optional(),
    })
  )

export const profileAlamatValidator = vine.compile(
  vine.object({
    idtype: vine.enum(['ktp', 'passport']),
    idnumber: vine.string(),
    ispermanent: vine.boolean(),
    postalcode: vine.string(),
    citizenIdAddress: vine.string(),
    residentialAddress: vine.string(),
    useAsResidential: vine.boolean(),
  })
)
export const profileBankValidator = vine.compile(
  vine.object({
    bankName: vine.string(),
    bankAccount: vine.string(),
    bankAccountHolder: vine.string(),
  })
)
export const profileKontakDaruratValidator = vine.compile(
  vine.array(
    vine.object({
      name: vine.string(),
      relationship: vine.string(),
      phone: vine.string(),
      profession: vine.string(),
    })
  )
)
export const profileEducationFormalValidator = vine.compile(
  vine.array(
    vine.object({
      institution: vine.string(),
      majors: vine.string(),
      score: vine.number(),
      start: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      finish: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      description: vine.string(),
      certification: vine.boolean(),
    })
  )
)
export const profileEducationInformalValidator = vine.compile(
  vine.array(
    vine.object({
      name: vine.string(),
      start: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      finish: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      expired: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      type: vine.enum(['day', 'month', 'year']),
      duration: vine.number(),
      fee: vine.number().decimal([0, 2]),
      description: vine.string(),
      certification: vine.boolean(),
    })
  )
)
export const profileWorkExperiencesValidator = vine.compile(
  vine.array(
    vine.object({
      company: vine.string(),
      position: vine.string(),
      from: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      to: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      length_of_service: vine.number(),
    })
  )
)
export const profileFamiliesValidator = vine.compile(
  vine.array(
    vine.object({
      fullname: vine.string(),
      relationship: vine.enum([
        'wife',
        'husband',
        'mother',
        'father',
        'brother',
        'sister',
        'child',
      ]),
      birthdate: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      marital_status: vine.enum(['single', 'marriade', 'widow', 'widower']),
      job: vine.string(),
    })
  )
)
