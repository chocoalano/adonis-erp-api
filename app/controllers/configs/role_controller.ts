import PermissionGroup from '#models/MasterData/Configs/permission_group'
import Role from '#models/MasterData/Configs/role'
import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class RoleController {
  /**
   * Display a list of resource
   */
  async index({ bouncer, response, request }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('view')
    const { page, limit, search } = request.all()
    if ((page && limit) || (page && limit && search)) {
      const q = await Role.query()
        .preload('permissions')
        .preload('users')
        .if(search, (query) => {
          query.where('name', 'like', `%${search}%`).orWhereHas('users', (uQuery) => {
            uQuery.where('name', 'like', `%${search}%`)
          })
        })
        .where('name', '!=', 'Developer')
        .orderBy('id', 'desc')
        .paginate(page, limit)
      return response.ok(q)
    }
    const userList = await User.all()
    const permissionList = await PermissionGroup.query().preload('childPermission')
    return response.ok({ userList, permissionList })
  }
  // /**
  //  * Handle form submission for the create action
  //  */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('create')
    const { name, userId, permissionId } = request.all()
    const q = new Role()
    if (name && userId && permissionId) {
      q.name = name
      await q.save()
      await q.related('users').sync(userId)
      await q.related('permissions').sync(permissionId)
    }
    return response.ok(q)
  }
  // /**
  //  * Handle form submission for the show action
  //  */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('update')
    const input = request.param('id')
    const q = await Role.query()
      .preload('permissions')
      .preload('users')
      .where('id', input)
      .firstOrFail()
    return response.ok(q)
  }
  // /**
  //  * Handle form submission for the create action
  //  */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('RolePolicy').authorize('update')
    const { name, userId, permissionId } = request.all()
    const id = request.param('id')
    const q = await Role.findOrFail(id)
    if (id && name && userId && permissionId && q) {
      q.name = name
      await q.save()
      await q.related('users').sync(userId)
      await q.related('permissions').sync(permissionId)
    }
    return response.ok(q)
  }
  // /**
  //  * Delete record
  //  */
  // async destroy({ bouncer, request, response }: HttpContext) {
  //   await bouncer.with('RolePolicy').authorize('delete')
  //   const q = await JobPosition.findOrFail(request.param('id'))
  //   if (q) {
  //     await q.delete()
  //   }
  //   return response.ok(q)
  // }
}
