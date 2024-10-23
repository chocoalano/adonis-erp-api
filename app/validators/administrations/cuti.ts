import vine from '@vinejs/vine'

export const CutiValidator = vine.compile(
  vine.object({
    startDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    endDate: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    startTime: vine.string(),
    endTime: vine.string(),
    category: vine.string(),
    type: vine.enum([
      'cuti tahunan',
      'cuti menikah',
      'cuti menikahkan anak',
      'cuti khitan',
      'cuti khitanan anak',
      'cuti baptis',
      'cuti baptis anak',
      'cuti istri melahirkan/keguguran',
      'cuti keluarga meninggal',
      'cuti anggota keluarga serumah meninggal',
      'cuti melahirkan',
      'cuti haid',
      'cuti keguguran',
      'cuti ibadah haji',
    ]),
    description: vine.string(),
    userApproved: vine.string(),
    userLine: vine.number(),
    lineApproved: vine.string(),
    userHr: vine.number(),
    hrgaApproved: vine.string(),
  })
)
