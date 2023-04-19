import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { tasksRoutes } from './routes/task'

export const app = fastify()

app.register(cookie)

app.register(tasksRoutes, {
  prefix: 'tasks',
})
