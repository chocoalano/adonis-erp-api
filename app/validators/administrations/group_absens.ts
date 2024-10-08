import vine from '@vinejs/vine'

export const GroupAbsenOnlyUsersValidator = vine.compile(
  vine.object({
    groupId: vine.number(),
    users: vine.array(vine.number()),
  })
)
export const GroupAbsenValidator = vine.compile(
  vine.object({
    name: vine.string().minLength(6),
    description: vine.string().minLength(6),
    patternName: vine.string().minLength(6),
  })
)
export const ScheduleGroupAbsenValidator = vine.compile(
  vine.object({
    start: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    end: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    group: vine.number(),
    time: vine.number(),
  })
)
export const ScheduleGroupAbsenEditValidator = vine.compile(
  vine.object({
    id: vine.number(),
    user_id: vine.number(),
    group_attendance_id: vine.number(),
    time_attendance_id: vine.number(),
    date: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
  })
)
