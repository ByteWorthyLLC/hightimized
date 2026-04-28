import type { Database } from 'sql.js'
import { getSqlJs } from './sqliteClient'
import sqliteUrl from '../../data/build/chargemaster.sqlite?url'

export interface ChargemasterRow {
  cpt_code: string
  description: string
  hospital_published_rate: number
  regional_median: number
  medicare_allowable: number
}

let db: Database | null = null

export async function getChargemasterDb(): Promise<Database> {
  if (db) return db
  const SQL = await getSqlJs()
  const response = await fetch(sqliteUrl)
  if (!response.ok) {
    throw new Error(`Failed to fetch chargemaster.sqlite: ${response.statusText}`)
  }
  const buffer = await response.arrayBuffer()
  db = new SQL.Database(new Uint8Array(buffer))
  return db
}

const CHARGEMASTER_SELECT =
  'SELECT cpt_code, description, hospital_published_rate, regional_median, medicare_allowable FROM chargemaster WHERE cpt_code = ?'

export function lookupChargemaster(database: Database, cptCode: string): ChargemasterRow | null {
  const results = database.exec(CHARGEMASTER_SELECT, [cptCode])
  if (!results.length || !results[0].values.length) return null
  const { columns, values } = results[0]
  return Object.fromEntries(columns.map((c, i) => [c, values[0][i]])) as unknown as ChargemasterRow
}
