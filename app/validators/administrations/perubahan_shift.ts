import vine from '@vinejs/vine'

export const PerubahanShiftValidator = vine.compile(
  vine.object({
    userId: vine.number(),
    date: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    currentGroup: vine.number(),
    currentShift: vine.number(),
    adjustShift: vine.number(),
    status: vine.enum(['y', 'n', 'w']),
    lineId: vine.number(),
    lineApprove: vine.enum(['y', 'n', 'w']),
    hrId: vine.number(),
    hrApprove: vine.enum(['y', 'n', 'w']),
  })
)
