import GroupAttendance from '#models/HR_Administrations/group_attendance'
import User from '#models/user'
import {
  GroupAbsenOnlyUsersValidator,
  GroupAbsenValidator,
} from '#validators/administrations/group_absens'
import type { HttpContext } from '@adonisjs/core/http'

export default class GroupAbsensController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response, request }: HttpContext) {
    const { page, perpage, search } = request.all()
    await bouncer.with('AttendancePolicy').authorize('view')
    const query = GroupAttendance.query()
      .preload('group_users') // Preload related users
      .if(search, (q) => {
        q.where((sql) => {
          sql
            .where('name', 'like', `%${search}%`)
            .orWhere('description', 'like', `%${search}%`)
            .orWhere('pattern_name', 'like', `%${search}%`)
        }).orWhereHas('group_users_id', (userQuery) => {
          userQuery.where('name', 'like', `%${search}%`)
        })
      })
    const groupAttendance = await query.paginate(page, perpage)
    const userOptions = await User.query().select('id', 'name')
    return response.ok({
      group: groupAttendance,
      user_option: userOptions,
    })
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('create')
    const input = request.all()
    if (input.groupId && input.users) {
      const payload = await GroupAbsenOnlyUsersValidator.validate(input)
      console.log(payload);

      // const group = await GroupAttendance.find(payload.groupId)
      // if (!group) {
      //   return response.abort('Group not found!')
      // }
      // const userIds = await Promise.all(
      //   payload.users.map(async (userId) => {
      //     const u = await User.find(userId)
      //     return u ? u.id : null
      //   })
      // )
      // const validUserIds = userIds.filter((id) => id !== null)
      // if (validUserIds.length === 0) {
      //   return response.abort('Users not found!')
      // }
      // await group.related('group_users').sync(validUserIds)
      // return response.ok(group)
    }
    // const payload = await GroupAbsenValidator.validate(input)
    // const groupAttendance = await GroupAttendance.updateOrCreate({ name: payload.name }, payload)
    // return response.ok(groupAttendance)
  }
  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('AttendancePolicy').authorize('delete')
    const q = await GroupAttendance.findOrFail(request.param('id'))
    if (q) {
      await q.delete()
    }
    return response.ok(q)
  }
}
