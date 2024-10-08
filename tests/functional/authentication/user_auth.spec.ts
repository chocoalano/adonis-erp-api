import User from '#models/user'
import { test } from '@japa/runner'

test.group('Authentication user auth', () => {
  test('success (200)', async ({ client }) => {
    const account = await User.findByOrFail('nik', 24020007)
    const response = await client.get('/user-auth').loginAs(account)
    response.assertStatus(200)
    const body = response.body()
    response.assertBody({
      account: body.account,
      role: body.role,
      permission: body.permission,
    })
  })

  test('update profile success (200)', async ({ client }) => {
    const account = await User.findByOrFail('nik', 24020007)
    const response = await client
      .post('/user-update')
      .json({
        user: {
          name: 'ALAN GENTINA',
          nik: '24020007',
          email: 'alangentina95@gmail.com',
          password: '',
          mobile_password: '',
          phone: '81212439564',
          placebirth: 'Rangkasbitung',
          datebirth: '1995-09-07',
          gender: 'm',
          blood: 'a',
          maritalStatus: 'single',
          religion: 'islam',
          image: '',
        },
        employe: {
          organization_id: 17,
          job_position_id: 29,
          job_level_id: 1,
          approval_line: 1,
          approval_manager: 1,
          company_id: 1,
          branch_id: 1,
          status: 'contract',
          join_date: '2024-07-11',
          sign_date: '2024-07-11',
        },
      })
      .loginAs(account)
    response.assertStatus(200)
    const body = response.body()
    response.assertBody(body)
  })
  test('update profile required entity key (422)', async ({ client }) => {
    const account = await User.findByOrFail('nik', 24020007)
    const response = await client
      .post('/user-update')
      .json({
        user: {
          name: '',
          nik: '',
          email: '',
          password: '',
          mobile_password: '',
          phone: '',
          placebirth: '',
          datebirth: '',
          gender: '',
          blood: '',
          maritalStatus: '',
          religion: '',
          image: '',
        },
        employe: {
          organization_id: null,
          job_position_id: null,
          job_level_id: null,
          approval_line: null,
          approval_manager: null,
          company_id: null,
          branch_id: null,
          status: null,
          join_date: null,
          sign_date: null,
        },
      })
      .loginAs(account)
    response.assertStatus(422)
    const body = response.body()
    response.assertBody(body)
  })
  test('logout (200)', async ({ client }) => {
    const account = await User.findByOrFail('nik', 24020007)
    const response = await client.get('/logout').loginAs(account)
    response.assertStatus(200)
    const body = response.body()
    response.assertBody(body)
  })
})
