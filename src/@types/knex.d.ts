// eslint-disable-next-line
import { Knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    tasks: {
      id: string
      description: string
      priority: string
      created_at: string
      session_id?: string
      isDone: boolean
      isDoneAt?: string
    }
  }
}
