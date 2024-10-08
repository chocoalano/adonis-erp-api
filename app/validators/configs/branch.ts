import vine from '@vinejs/vine'

export const BranchValidator = vine.compile(
  vine.object({
    data: vine.array(
      vine.object({
        name: vine.string().trim().minLength(6),
        latitude: vine.string().trim().minLength(6),
        longitude: vine.string().trim().minLength(6),
        fullAddress: vine.string().trim().minLength(6),
      })
    ),
  })
)
