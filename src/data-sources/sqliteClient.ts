import initSqlJs, { type SqlJsStatic } from 'sql.js'

const BASE = import.meta.env.BASE_URL // '/hightimized/' in prod, '/' in dev

let SQL: SqlJsStatic | null = null

export async function getSqlJs(): Promise<SqlJsStatic> {
  if (SQL) return SQL
  SQL = await initSqlJs({
    locateFile: (filename: string) => `${BASE}${filename}`,
    // resolves to '/hightimized/sql-wasm.wasm' in production
    // resolves to '/sql-wasm.wasm' in dev
  })
  return SQL
}
