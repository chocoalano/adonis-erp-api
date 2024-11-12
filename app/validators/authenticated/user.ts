import { uniqueRule } from '#validators/Rules/unique'
import vine from '@vinejs/vine'

const user = (userId?: number) => {
  return vine.object({
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
    role: vine.string(),
    password: vine.string().optional(),
    phone: vine.string(),
    placebirth: vine.string(),
    datebirth: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    gender: vine.enum(['m', 'w']),
    blood: vine.enum(['a', 'b', 'o', 'ab']),
    maritalStatus: vine.enum(['single', 'married', 'widow', 'widower']),
    religion: vine.enum(['ISLAM','PROTESTAN','KHATOLIK','HINDU','BUDHA','KHONGHUCU']),
    image: vine.string().optional(),
  })
}
const address = vine.object({
  idtype: vine.enum(['ktp', 'passport']),
  idnumber: vine.string().optional().requiredIfExists('idtype'),
  ispermanent: vine.boolean().optional().requiredIfExists('ispermanent'),
  postalcode: vine.string().optional().requiredIfExists('ispermanent'),
  citizenIdAddress: vine.string().optional().requiredIfExists('postalcode'),
  residentialAddress: vine.string().optional().requiredIfExists('citizenIdAddress'),
  useAsResidential: vine.boolean().optional().requiredIfExists('residentialAddress'),
})
const bank = vine
  .object({
    bankName: vine.string(),
    bankAccount: vine.string().optional().requiredIfExists('bankName'),
    bankAccountHolder: vine.string().optional().requiredIfExists('bankAccount'),
  })
  .optional()
const bpjs = vine
  .object({
    bpjsKetenagakerjaan: vine.string().optional(),
    nppBpjsKetenagakerjaan: vine.string().optional().requiredIfExists('bpjsKetenagakerjaan'),
    bpjsKetenagakerjaanDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional()
      .requiredIfExists('nppBpjsKetenagakerjaan'),
    bpjsKesehatan: vine.string().optional().requiredIfExists('bpjsKetenagakerjaanDate'),
    bpjsKesehatanFamily: vine.string().optional().requiredIfExists('bpjsKesehatan'),
    bpjsKesehatanDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional()
      .requiredIfExists('bpjsKesehatanFamily'),
    bpjsKesehatanCost: vine.number().optional().requiredIfExists('bpjsKesehatanDate'),
    jhtCost: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional()
      .requiredIfExists('bpjsKesehatanCost'),
    jaminanPensiunCost: vine.string().optional().requiredIfExists('jhtCost'),
    jaminanPensiunDate: vine
      .date({
        formats: ['YYYY-MM-DD'],
      })
      .optional()
      .requiredIfExists('jaminanPensiunCost'),
  })
  .optional()
const ec = vine
  .array(
    vine.object({
      name: vine.string(),
      relationship: vine.string().optional().requiredIfExists('name'),
      phone: vine.string().optional().requiredIfExists('relationship'),
      profession: vine.string().optional().requiredIfExists('phone'),
    })
  )
  .optional()
const employe = vine.object({
  organizationId: vine.number(),
  jobPositionId: vine.number(),
  jobLevelId: vine.number(),
  approvalLine: vine.number(),
  approvalManager: vine.number(),
  companyId: vine.number(),
  branchId: vine.number(),
  status: vine.enum(['contract','permanent','magang','last daily','probation']),
  joinDate: vine.date({
    formats: ['YYYY-MM-DD'],
  }),
  signDate: vine.date({
    formats: ['YYYY-MM-DD'],
  }),
})
const family = vine
  .array(
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
  .optional()
const fe = vine
  .array(
    vine.object({
      institution: vine.string().optional().requiredIfExists('grade_id'),
      majors: vine.string().optional().requiredIfExists('institution'),
      score: vine.number().optional().requiredIfExists('majors'),
      start: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('score'),
      finish: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('start'),
      description: vine.string().optional().requiredIfExists('finish'),
      certification: vine.boolean().optional(),
    })
  )
  .optional()
const ie = vine
  .array(
    vine.object({
      name: vine.string(),
      start: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('name'),
      finish: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('start'),
      expired: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('finish'),
      type: vine.enum(['day', 'month', 'year']).optional().requiredIfExists('expired'),
      duration: vine.number().optional().requiredIfExists('type'),
      fee: vine.number().optional().requiredIfExists('duration'),
      description: vine.string().optional().requiredIfExists('fee'),
      certification: vine.boolean().optional(),
    })
  )
  .optional()
const salary = vine.object({
  basicSalary: vine.number(),
  salaryType: vine.enum(['Monthly', 'Weakly', 'Dayly']).optional().requiredIfExists('basic_salary'),
  paymentSchedule: vine.string().optional().requiredIfExists('salary_type'),
  prorateSettings: vine.string().optional().requiredIfExists('payment_schedule'),
  overtimeSettings: vine.string().optional().requiredIfExists('prorate_settings'),
  costCenter: vine.string().optional(),
  costCenterCategory: vine.string().optional(),
  currency: vine.string().optional().requiredIfExists('cost_center_category'),
})
const tax = vine.object({
  npwp15DigitOld: vine.string(),
  npwp16DigitNew: vine.string().optional().requiredIfExists('npwp15DigitOld'),
  ptkpStatus: vine
    .enum(['TK0', 'TK1', 'TK2', 'TK3', 'K0', 'K1', 'K2', 'K3', 'K/I/0', 'K/I/1', 'K/I/2', 'K/I/3'])
    .optional()
    .requiredIfExists('npwp16DigitNew'),
  taxMethod: vine.enum(['gross','net','tax']).optional().requiredIfExists('ptkpStatus'),
  taxSalary: vine.enum(['taxable']).optional().requiredIfExists('taxMethod'),
  empTaxStatus: vine
    .enum(['permanent', 'contract', 'last-daily'])
    .optional()
    .requiredIfExists('taxSalary'),
  beginningNetto: vine.number().optional().requiredIfExists('empTaxStatus'),
  pph21_paid: vine.number().optional().requiredIfExists('beginningNetto'),
})
const we = vine
  .array(
    vine.object({
      company: vine.string(),
      position: vine.string().optional().requiredIfExists('company'),
      from: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('position'),
      to: vine
        .date({
          formats: ['YYYY-MM-DD'],
        })
        .optional()
        .requiredIfExists('from'),
        lengthOfService: vine.string().optional().requiredIfExists('to'),
    })
  )
  .optional()

export const createUsersValidator = vine.compile(
  vine.object({
    user: user(),
    address: address,
    bank: bank,
    bpjs: bpjs,
    salary: salary,
    tax: tax,
    employe: employe,
    emergency_contacts: ec,
    family: family,
    formal_education: fe,
    informal_education: ie,
    work_experience: we,
  })
)

export const updateProfileValidator = (userId: number) =>
  vine.compile(
    vine.object({
      user: user(userId),
      address: address,
      bank: bank,
      bpjs: bpjs,
      employe: employe,
      salary: salary,
      tax: tax,
      emergency_contacts: ec,
      family: family,
      formal_education: fe,
      informal_education: ie,
      work_experience: we,
    })
  )
