import { expect, test, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'
import { app } from '../src/app'

describe('Task routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  test('user can create a new task', async () => {
    await request(app.server)
      .post('/tasks')
      .send({
        description: 'New description',
        priority: 'high',
      })
      .expect(201)
  })

  test('user can list all tasks', async () => {
    const createTaskResponse = await request(app.server).post('/tasks').send({
      description: 'New description',
      priority: 'high',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    expect(listTasksResponse.body.transactions).toEqual([
      expect.objectContaining({
        description: 'New description',
        priority: 'high',
      }),
    ])
  })

  test('user can get a specific task', async () => {
    const createTaskResponse = await request(app.server).post('/task').send({
      description: 'New description',
      priority: 'high',
    })

    const cookies = createTaskResponse.get('Set-Cookie')

    const listTasksResponse = await request(app.server)
      .get('/tasks')
      .set('Cookie', cookies)
      .expect(200)

    const taskId = listTasksResponse.body.transactions[0].id

    const getTaskResponse = await request(app.server)
      .get(`/tasks/${taskId}`)
      .set('Cookie', cookies)
      .expect(200)

    expect(getTaskResponse.body.transaction).toEqual(
      expect.objectContaining({
        description: 'New description',
        priority: 'high',
      }),
    )
  })
})
