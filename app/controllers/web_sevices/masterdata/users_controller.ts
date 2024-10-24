import Branch from '#models/MasterData/Configs/brance'
import Company from '#models/MasterData/Configs/company'
import JobLevel from '#models/MasterData/Configs/job_levels'
import JobPosition from '#models/MasterData/Configs/job_position'
import Organization from '#models/MasterData/Configs/organization'
import Role from '#models/MasterData/Configs/role'
import User from '#models/user'
import { UserRepository } from '#services/repositories/user_repository'
import { createUsersValidator, updateProfileValidator } from '#validators/authenticated/user'
import type { HttpContext } from '@adonisjs/core/http'
import CloudinaryService from '#services/CloudinaryService'

export default class UsersController {
  private process: UserRepository

  constructor() {
    this.process = new UserRepository()
  }
  /**
   * Display a list of resource
   */
  async index({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')
    const input = request.all()
    const q = await this.process.list(input.page, input.limit, input.search)
    return response.ok(q)
  }

  /**
   * Display a list of resource
   */
  async ListMobile({ auth, request, response }: HttpContext) {
    const input = request.all()
    const q = await this.process.listMobile(auth.user!.id, input.search)
    return response.ok(q)
  }

  /**
   * Handle form submission for the create action
   */
  async store({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('create')
    const input = request.all()
    const payload = await createUsersValidator.validate(input)

    const user = await this.process.create(payload)
    return response.send(user)
  }

  /**
   * Show individual record
   */
  async show({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('view')
    const userId = request.param('id')
    const q = await this.process.show(userId)
    return response.ok(q)
  }

  /**
   * Edit individual record
   */
  async edit({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('update')
    const userId = request.param('id')
    const q = await this.process.show(userId)
    return response.ok(q)
  }

  /**
   * Handle form submission for the edit action
   */
  async update({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('update')
    const userId = request.param('id')
    const input = request.all()
    const payload = await updateProfileValidator(userId).validate(input)
    const avatar = request.file('user.image', {
      extnames: ['jpg', 'png', 'jpeg'],
    })
    if (avatar) {
      const u = await User.findOrFail(userId)
      if ((u && u.image !== null) || (u && u.image !== '')) {
        const publicId = await CloudinaryService.extractPublicId(u.image)
        if (publicId.status) {
          await CloudinaryService.delete(publicId.res)
        }
      }
      const uploadResult = await CloudinaryService.upload(avatar, 'users-profile')
      payload['user']['image'] = uploadResult.secure_url
    }
    const user = await this.process.update(userId, payload)
    return response.send(user)
  }

  /**
   * Delete record
   */
  async destroy({ bouncer, request, response }: HttpContext) {
    await bouncer.with('UserPolicy').authorize('delete')
    const userId = request.param('id')
    const user = await this.process.delete(userId)
    return response.send(user)
  }
  /**
   * Kelengkapan form
   */
  async kelengkapan_form({ response }: HttpContext) {
    const role = await Role.all()
    const company = await Company.all()
    const branch = await Branch.all()
    const departemen = await Organization.all()
    const jabatan = await JobPosition.all()
    const level = await JobLevel.all()
    const approval = await User.all()
    return response.send({
      role,
      company,
      branch,
      departemen,
      jabatan,
      level,
      approval,
    })
  }
}
