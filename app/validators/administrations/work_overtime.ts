import vine from '@vinejs/vine'

export const WorkOvertimeCreateValidator = vine.compile(
  vine.object({
    datapost: vine.array(
      vine.object({
        userIdCreated: vine.number(),
        organizationId: vine.number(),
        jobPositionId: vine.number(),
        overtimeDayStatus: vine.boolean(),
        dateSpl: vine.date({
          formats: ['YYYY-MM-DD'],
        }),
        dateOvertimeAt: vine.date({
          formats: ['YYYY-MM-DD'],
        }),
        userAdm: vine.number(),
        userLine: vine.number(),
        userGm: vine.number(),
        userHr: vine.number(),
        userDirector: vine.number(),
        userFat: vine.number(),
      })
    ),
  })
)

export const WorkOvertimeEditValidator = vine.compile(
  vine.object({
    datapost: vine.object({
      useridCreated: vine.number(),
      organizationId: vine.number(),
      jobPositionId: vine.number(),
      overtimeDayStatus: vine.boolean(),
      dateSpl: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      dateOvertimeAt: vine.date({
        formats: ['YYYY-MM-DD'],
      }),
      adminApproved: vine.enum(['y', 'n', 'w']),
      lineApproved: vine.enum(['y', 'n', 'w']),
      gmApproved: vine.enum(['y', 'n', 'w']),
      hrgaApproved: vine.enum(['y', 'n', 'w']),
      fatApproved: vine.enum(['y', 'n', 'w']),
    }),
  })
)
