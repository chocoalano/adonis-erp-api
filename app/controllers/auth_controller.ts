import User from '#models/user'
import type { HttpContext } from '@adonisjs/core/http'
import emitter from '@adonisjs/core/services/emitter'
import hash from '@adonisjs/core/services/hash'
import vine from '@vinejs/vine'
import Permission from '#models/MasterData/Configs/permission'
import { AuthRepository } from '#services/repositories/auth_repository'
import { unlinkFile } from '../helpers/file_uploads.js'
import app from '@adonisjs/core/services/app'
import { updateProfileValidator } from '#validators/authenticated/user'

export default class AuthController {
  private process: AuthRepository

  constructor() {
    this.process = new AuthRepository()
  }

  async login({ request, response }: HttpContext) {
    // Kompilasi validator
    const validator = vine.compile(
      vine.object({
        nik: vine.string(),
        password: vine.string(),
      })
    )
    // Validasi input
    const input = await request.validateUsing(validator)
    // Tentukan apakah nik adalah email
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.nik)
    // Cari user berdasarkan email atau NIK
    let user: User
    try {
      user = await User.findByOrFail(isEmail ? 'email' : 'nik', input.nik)
    } catch (error) {
      return response.notFound('User not found or Invalid NIK or Email')
    }
    // Tentukan kemampuan (abilities) berdasarkan peran
    let abilities: string[]
    if (user.name === 'Superadmin') {
      const permissions = await Permission.all()
      abilities = [...new Set(permissions.flatMap((permission) => [permission.name]))]
    } else {
      const account = await User.query()
        .preload('roles', (roleQuery) => {
          roleQuery.preload('permissions')
        })
        .where('id', user.id)
        .firstOrFail()

      abilities = [
        ...new Set(
          account!.roles.flatMap((role) => role.permissions.map((permission) => permission.name))
        ),
      ]
    }
    // Periksa dan perbarui password
    if (user.password !== null) {
      user.password = input.password
      await user.save()
      emitter.emit('user:login', user)
      const token = await User.accessTokens.create(user, abilities)
      return response.send(token)
    }
    if (await hash.verify(user.password, input.password)) {
      user.password = input.password
      await user.save()
      emitter.emit('user:login', user)
      const token = await User.accessTokens.create(user, abilities)
      return response.send(token)
    }
    return response.unauthorized('Invalid credential!')
  }

  async user_auth({ auth, response }: HttpContext) {
    const userId = auth.user!.id
    const result = await this.process.show(userId)
    return response.ok(result)
  }

  async update({ request, auth, response }: HttpContext) {
    const userId = auth.user!.id
    const input = request.all()
    const avatar = request.file('users.image', {
      extnames: ['jpg', 'png', 'jpeg'],
    })
    if (input.users && avatar) {
      let path = 'storage/uploads/user-profile'
      const u = await User.findOrFail(userId)
      if ((u && u.image !== null) || (u && u.image !== '')) {
        await unlinkFile(`storage/uploads/${u.image}`)
      }
      await avatar!.move(app.makePath(path), {
        name: `${u.nik}.${avatar!.extname}`,
      })
      input.users.image = `user-profile/${avatar!.fileName!}`
    }
    const payload = await updateProfileValidator(userId).validate(input)
    const profile = await this.process.update(userId, payload)
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
        let path = 'storage/uploads/user-profile'
        const u = await User.findOrFail(userId)
        if ((u && u.image !== null) || (u && u.image !== '')) {
          await unlinkFile(`storage/uploads/${u.image}`)
        }
        await avatar!.move(app.makePath(path), {
          name: `${u.nik}.jpg`,
        })
        input.image = `user-profile/${avatar!.fileName!}`
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
