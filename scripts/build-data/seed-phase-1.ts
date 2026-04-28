// scripts/build-data/seed-phase-1.ts
import initSqlJs from 'sql.js'
import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'

// Hardcoded WASM path — sql.js always requests 'sql-wasm.wasm'; we never
// interpolate the caller-supplied filename to avoid path traversal (semgrep
// javascript.lang.security.audit.path-traversal.path-join-resolve-traversal).
const SQL_WASM_PATH = resolve('node_modules/sql.js/dist/sql-wasm.wasm')

async function seedPhase1() {
  const SQL = await initSqlJs({
    locateFile: () => SQL_WASM_PATH,
  })
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE chargemaster (
      cpt_code                TEXT PRIMARY KEY,
      description             TEXT NOT NULL,
      hospital_published_rate REAL NOT NULL,
      regional_median         REAL NOT NULL,
      medicare_allowable      REAL NOT NULL
    )
  `)

  db.run('INSERT INTO chargemaster VALUES (?, ?, ?, ?, ?)', [
    '99213',
    'Office visit, est. patient, low complexity',
    187.5,
    198.0,
    92.4,
  ])

  const data = db.export()
  mkdirSync('data/build', { recursive: true })
  const outputPath = resolve('data/build/chargemaster.sqlite')
  writeFileSync(outputPath, Buffer.from(data))
  console.log(`Seeded chargemaster.sqlite at ${outputPath}`)
  db.close()
}

seedPhase1().catch((err) => {
  console.error(err)
  process.exit(1)
})
