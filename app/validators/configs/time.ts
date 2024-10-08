import vine from '@vinejs/vine'

export const TimeValidator = vine.compile(
  vine.object({
    data: vine.array(
      vine.object({
        type: vine.string().minLength(2),
        in: vine.string(),
        out: vine.string(),
        patternName: vine.enum(['production', 'warehouse', 'maintenance', 'office', 'customs']),
        rules: vine.number().optional(),
      })
    ),
  })
)
