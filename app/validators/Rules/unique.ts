import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import { FieldContext } from '@vinejs/vine/types'

/**
 * Options accepted by the unique rule
 */
type Options = {
  table: string
  column: string
  excludeId?: string | number // Optional: ID to exclude when updating
  idColumn?: string // Optional: Column name for the ID
}

/**
 * Implementation
 */
async function unique(value: unknown, options: Options, field: FieldContext) {
  if (typeof value !== 'string') {
    return
  }

  const query = db.from(options.table).select(options.column).where(options.column, value)

  // Exclude the current record from the uniqueness check
  if (options.excludeId && options.idColumn) {
    query.whereNot(options.idColumn, options.excludeId)
  }

  const row = await query.first()

  if (row) {
    field.report('The {{ field }} field is not unique', 'unique', field)
  }
}

/**
 * Converting a function to a VineJS rule
 */
export const uniqueRule = vine.createRule(unique)
