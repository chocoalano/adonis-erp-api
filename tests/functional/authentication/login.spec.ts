import { test } from '@japa/runner'

test.group('Login', () => {
  test('success (200)', async ({ client }) => {
    const response = await client.post('/login').json({
      nik: 24020007,
      password: '24020007',
    })
    response.assertStatus(200)
    response.assertBody({
      type: 'bearer',
      name: null,
      token: response.body().token,
      abilities: response.body().abilities,
      lastUsedAt: response.body().lastUsedAt,
      expiresAt: response.body().expiresAt,
    })
  })
  test('error required field (422)', async ({ client }) => {
    const response = await client.post('/login').json({
      nik: '',
      password: '',
    })
    response.assertStatus(422)
    response.assertBody(response.body())
  })
  test('error unauthorized (401)', async ({ client }) => {
    const response = await client.post('/login').json({
      nik: 24020007,
      password: 'fdsgsdfg5436',
    })
    response.assertStatus(401)
    response.assertBody(response.body())
  })
})
