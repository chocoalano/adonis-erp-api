import Cuti from '#models/HR_Administrations/cuti'
import KoreksiAbsen from '#models/HR_Administrations/koreksi_absen'
import PerubahanShift from '#models/HR_Administrations/perubahan_shift'
import WorkOvertime from '#models/HR_Administrations/work_overtime'
import Announcement from '#models/MasterData/announcement'
import BugReport from '#models/MasterData/Configs/bug_report'
import Notification from '#models/notification'
import User from '#models/user'
import Ws from '#services/ws'
import emitter from '@adonisjs/core/services/emitter'

declare module '@adonisjs/core/types' {
  interface EventsList {
    'user:login': User
    'pengajuan:cuti': Cuti
    'pengajuan:shift': PerubahanShift
    'pengajuan:lembur': WorkOvertime[]
    'pengajuan:koreksi-absen': KoreksiAbsen
    'testing': User
    'pengumuman': Announcement
    'bug': BugReport
  }
}

// Function to create and emit notifications
async function createAndEmitNotification(notifications: any[], eventType: string) {
  await Notification.createMany(notifications)
  Ws.io?.emit(eventType, notifications)
}

// Function to build a notification object
function buildNotification(from: number, to: number, type: string, message: string, payload: any) {
  return {
    from,
    to,
    type,
    isread: 'n',
    title: 'Pemberitahuan, ada info nih!',
    message,
    payload,
  }
}
function buildNotificationNonSave(message: string, payload: any) {
  return {
    title: 'Pemberitahuan, ada info nih!',
    message,
    payload,
  }
}

// Event handler for 'user:login'
emitter.on('bug', async (bug: BugReport) => {
  const n = buildNotificationNonSave(`Seseorang telah melaporkan bug. Periksa sekarang!`, bug)
  Ws.io?.emit('connection', n)
})
// Event handler for 'user:login'
emitter.on('pengumuman', async (pengumuman: Announcement) => {
  const n = buildNotificationNonSave(
    `Seseorang telah menginformasikan pengumuman. Periksa sekarang!`,
    pengumuman
  )
  Ws.io?.emit('connection', n)
})

// Event handler for 'user:login'
emitter.on('user:login', async (user: User) => {
  const notification = buildNotification(
    user.id,
    user.id,
    'login',
    `User atas nama ${user.name} sedang online.`,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      datebirth: user.datebirth,
      gender: user.gender,
      image: user.image,
    }
  )
  await Notification.create(notification)
  Ws.io?.emit('connection', notification)
})

// Event handler for 'pengajuan:cuti'
emitter.on('pengajuan:cuti', async (cuti: Cuti) => {
  const message = `User atas nama ${cuti.user.name} mengajukan cuti, periksa sekarang.`
  const payload = {
    id: cuti.id,
    userId: cuti.userId,
    startDate: cuti.startDate,
    endDate: cuti.endDate,
    startTime: cuti.startTime,
    endTime: cuti.endTime,
    category: cuti.category,
    type: cuti.type,
    description: cuti.description,
    userApproved: cuti.userApproved,
    userLine: cuti.userLine,
    lineApproved: cuti.lineApproved,
    userHr: cuti.userHr,
    hrgaApproved: cuti.hrgaApproved,
  }

  const notifications = [
    buildNotification(cuti.userId, cuti.userLine, 'pengajuan-cuti', message, payload),
    buildNotification(cuti.userId, cuti.userHr, 'pengajuan-cuti', message, payload),
  ]

  await createAndEmitNotification(notifications, 'connection')
})

// Event handler for 'pengajuan:shift'
emitter.on('pengajuan:shift', async (shift: PerubahanShift) => {
  const message = `User atas nama ${shift.user.name} mengajukan perubahan shift, periksa sekarang.`
  const payload = {
    id: shift.id,
    userId: shift.userId,
    date: shift.date,
    currentGroup: shift.currentGroup,
    currentShift: shift.currentShift,
    adjustShift: shift.adjustShift,
    status: shift.status,
    lineId: shift.lineId,
    lineApprove: shift.lineApprove,
    hrId: shift.hrId,
    hrApprove: shift.hrApprove,
  }

  const notifications = [
    buildNotification(shift.userId, shift.lineId, 'pengajuan-shift', message, payload),
    buildNotification(shift.userId, shift.hrId, 'pengajuan-shift', message, payload),
  ]

  await createAndEmitNotification(notifications, 'connection')
})

// Event handler for 'pengajuan:lembur'
emitter.on('pengajuan:lembur', async (lemburList: WorkOvertime[]) => {
  const notifications: any[] = []

  lemburList.forEach((lembur) => {
    const message = `Beberapa user mengajukan lembur, periksa sekarang.`
    const approvers = [
      lembur.userAdm,
      lembur.userLine,
      lembur.userGm,
      lembur.userHr,
      lembur.userDirector,
      lembur.userFat,
    ]

    approvers.forEach((approver) => {
      notifications.push(
        buildNotification(lembur.useridCreated, approver, 'pengajuan-lembur', message, lembur)
      )
    })
  })

  await createAndEmitNotification(notifications, 'connection-lembur')
})

// Event handler for 'pengajuan:koreksi-absen'
emitter.on('pengajuan:koreksi-absen', async (koreksiAbsen: KoreksiAbsen) => {
  const message = `User atas nama ${koreksiAbsen.user.name} mengajukan koreksi absen, periksa sekarang.`
  const payload = {
    id: koreksiAbsen.id,
    userId: koreksiAbsen.userId,
    dateAdjustment: koreksiAbsen.dateAdjustment,
    timeinAdjustment: koreksiAbsen.timeinAdjustment,
    timeoutAdjustment: koreksiAbsen.timeoutAdjustment,
    notes: koreksiAbsen.notes,
    status: koreksiAbsen.status,
    lineId: koreksiAbsen.lineId,
    lineApprove: koreksiAbsen.lineApprove,
    hrId: koreksiAbsen.hrId,
    hrApprove: koreksiAbsen.hrApprove,
  }

  const notifications = [
    buildNotification(
      koreksiAbsen.userId,
      koreksiAbsen.lineId,
      'pengajuan-korbsen',
      message,
      payload
    ),
    buildNotification(
      koreksiAbsen.userId,
      koreksiAbsen.hrId,
      'pengajuan-korbsen',
      message,
      payload
    ),
  ]

  await createAndEmitNotification(notifications, 'connection')
})
