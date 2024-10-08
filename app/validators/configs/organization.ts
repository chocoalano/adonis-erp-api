import vine from '@vinejs/vine'

export const OrganizationValidator = vine.compile(
  vine.object({
    data: vine.array(
      vine.object({
        name: vine.string().minLength(2),
        description: vine.string().minLength(2),
      })
    ),
  })
)
