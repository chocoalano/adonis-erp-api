import vine from '@vinejs/vine'

export const attendanceInValidator = vine.compile(
  vine.object({
    date: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    lat: vine.number(),
    lng: vine.number(),
  })
)

export const photoValidator = vine.compile(
  vine.object({
    photo: vine.file({
      extnames: ['jpg', 'png', 'jpeg'],
    }),
  })
)

export const attendanceOutValidator = vine.compile(
  vine.object({
    date: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    lat: vine.number(),
    lng: vine.number(),
  })
)

export const attendanceUpdateValidator = vine.compile(
  vine.object({
    nik: vine.number(),
    schedule_group_attendances_id: vine.number(),
    date: vine.date({
      formats: ['YYYY-MM-DD'],
    }),
    time_in: vine.string(),
    status_in: vine.string(),
    time_out: vine.string(),
    status_out: vine.string(),
  })
)
