import vine from '@vinejs/vine'

export const KoreksiAbsenValidator = vine.compile(
  vine.object({
    userId: vine.number(),
    dateAdjustment: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    timeinAdjustment: vine.string(),
    timeoutAdjustment: vine.string(),
    notes: vine.string(),
    status: vine.enum(['y', 'n', 'w']),
    lineId: vine.number(),
    hrId: vine.number(),
  })
)
