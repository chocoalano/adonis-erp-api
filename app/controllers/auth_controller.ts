import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import Permission from '#models/MasterData/Configs/permission'
import { AuthRepository } from '#services/repositories/auth_repository'
import CloudinaryService from '#services/CloudinaryService'

export default class AuthController {
  private process: AuthRepository

  constructor() {
    this.process = new AuthRepository()
  }

  async login({ request, response }: HttpContext) {
    // Compile and validate input using Vine validator
    const validator = vine.compile(
      vine.object({
        nik: vine.string(),
        password: vine.string(),
      })
    )
    const input = await request.validateUsing(validator)
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.nik)

    // Retrieve user by email or NIK
    let user: User
    try {
      user = await User.findByOrFail(isEmail ? 'email' : 'nik', input.nik)
    } catch {
      return response.notFound('User not found or Invalid NIK or Email')
    }
    let abilities: string[]
    if (user.name === 'Superadmin') {
      const permissions = await Permission.all()
      abilities = permissions.map((permission) => permission.name)
    } else {
      const account = await User.query()
        .preload('roles', (roleQuery) => {
          roleQuery.preload('permissions')
        })
        .where('id', user.id)
        .firstOrFail()

      abilities = account.roles
        .flatMap((role) => role.permissions.map((permission) => permission.name))
        .filter((v, i, a) => a.indexOf(v) === i)
    }
    // lama
    // $scrypt$n=16384,r=8,p=1$6pP0+pkiQgyViSeayytlzA$pSoUiyWV3apqkhnnYnVztL3mFyo/PN09iSMGVoqMzJ5+3m1+G4HRR7U/s76KAdfUoXCansZvdBTFtC+STMtMZA
    // baru
    // $scrypt$n=16384,r=8,p=1$hfAF32q4iPXdZl1+F3A+wg$IML8nYsZ4atXj65lDSTe+/yw+1n6Wip6lO+PY5k8cXXIPsrq0tDccA+duCDf6u0CoiOig+MlhPfy5401D+Uy4A
    const isPasswordValid = await hash.verify(user.password, input.password)
    if (!isPasswordValid) {
      return response.abort('Invalid credentials')
    }
    const token = await User.accessTokens.create(user, abilities)
    return response.ok(token)
  }

  async user_auth({ auth, response }: HttpContext) {
    const userId = auth.user!.id
    const result = await this.process.show(userId)
    return response.ok(result)
  }

  async update({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const input = request.all()
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
      input.user.image = uploadResult.secure_url
    }
    const profile = await this.process.update(userId, input)
    return response.send(profile)
  }
  async updateMobile({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const datatype = request.param('datatype')
    const input = request.all()
    let profile
    switch (datatype) {
      case 'avatar':
        const avatar = request.file('image')
        const u = await User.findOrFail(userId)
        if ((u && u.image !== null) || (u && u.image !== '')) {
          const publicId = await CloudinaryService.extractPublicId(u.image)
          if (publicId.status) {
            await CloudinaryService.delete(publicId.res)
          }
        }
        const uploadResult = await CloudinaryService.upload(avatar, 'users-profile')
        input.image = uploadResult.secure_url
        profile = await this.process.update(userId, { avatar: input })
        break
      case 'data-diri':
        profile = await this.process.update(userId, { users: input })
        break
      case 'kontak_darurat':
        profile = await this.process.update(userId, input)
        break
      case 'kontak_keluarga':
        profile = await this.process.update(userId, input)
        break
      case 'pendidikan_formal':
        profile = await this.process.update(userId, input)
        break
      case 'pendidikan_informal':
        profile = await this.process.update(userId, input)
        break
      case 'pengalaman_kerja':
        profile = await this.process.update(userId, input)
        break
      case 'update_bank':
        profile = await this.process.update(userId, { bank: input })
        break
      case 'ubah-password':
        profile = await this.process.update(userId, input)
        if (profile === null) {
          return response.notFound(profile)
        }
        break
    }
    return response.ok(profile)
  }

  async remove_data({ auth, request, response }: HttpContext) {
    const datatype = request.param('datatype')
    const id = request.param('id')
    const remove = await this.process.remove_data_auth(auth.user!.id, datatype, id)
    return response.ok(remove)
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.getUserOrFail()
    const token = auth.user?.currentAccessToken.identifier
    if (!token) {
      return response.badRequest({ message: 'Token not found' })
    }
    await User.accessTokens.delete(user, token)
    return response.ok({ message: 'Logged out' })
  }
}
