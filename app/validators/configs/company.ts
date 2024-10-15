import vine from '@vinejs/vine'

export const CompanyValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(6),
    latitude: vine.string().trim().minLength(6),
    longitude: vine.string().trim().minLength(6),
    radius: vine.number(),
    fullAddress: vine.string().trim().minLength(6),
  })
)
