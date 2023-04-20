import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExist } from '../middlewares/check-session-id-exist'

export async function tasksRoutes(app: FastifyInstance) {
  app.get(
    '/',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const { sessionId } = request.cookies

      const tasks = await knex('tasks').where('session_id', sessionId).select()

      return { tasks }
    },
  )

  app.get(
    '/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request) => {
      const getTaskParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTaskParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      const task = await knex('tasks')
        .where({
          session_id: sessionId,
          id,
        })
        .first()

      return { task }
    },
  )

  app.post('/', async (request, reply) => {
    const createTaskBodySchema = z.object({
      description: z.string(),
      priority: z.string(),
      isDone: z.boolean(),
    })

    const { description, priority, isDone } = createTaskBodySchema.parse(
      request.body,
    )

    let time = ''

    let sessionId = request.cookies.sessionId

    if (isDone === true) {
      time = new Date().toLocaleDateString()
    }

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('tasks').insert({
      id: randomUUID(),
      description,
      priority,
      isDone,
      isDoneAt: time,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.delete(
    '/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, reply) => {
      const getTaskParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const { id } = getTaskParamsSchema.parse(request.params)

      const { sessionId } = request.cookies

      await knex('tasks')
        .where({
          session_id: sessionId,
          id,
        })
        .delete()

      return reply.status(204).send()
    },
  )

  app.put(
    '/:id',
    {
      preHandler: [checkSessionIdExist],
    },
    async (request, reply) => {
      const getTaskParamsSchema = z.object({
        id: z.string().uuid(),
      })

      const createTaskBodySchema = z.object({
        description: z.string(),
        priority: z.string(),
        isDone: z.boolean(),
      })

      const { id } = getTaskParamsSchema.parse(request.params)

      const { description, priority, isDone } = createTaskBodySchema.parse(
        request.body,
      )

      const { sessionId } = request.cookies

      await knex('tasks')
        .where({
          session_id: sessionId,
          id,
        })
        .update({
          description,
          priority,
        })

      if (isDone === true) {
        await knex('tasks')
          .where({
            session_id: sessionId,
            id,
          })
          .update({ isDone: true, isDoneAt: new Date().toLocaleDateString() })
      } else {
        await knex('tasks')
          .where({
            session_id: sessionId,
            id,
          })
          .update({
            isDone: true,
          })
      }

      return reply.status(204).send()
    },
  )
}
