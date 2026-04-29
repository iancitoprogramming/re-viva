// Apply a SQL migration file via direct pg connection.
// Use: DATABASE_URL=... npx tsx scripts/apply-migration.ts <path-to-sql>
import { readFileSync } from 'node:fs'
import { Pool } from 'pg'

const file = process.argv[2]
if (!file) { console.error('Uso: tsx scripts/apply-migration.ts <archivo.sql>'); process.exit(1) }

const sql = readFileSync(file, 'utf8')
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})

async function main() {
  console.log(`▸ Aplicando migración: ${file}`)
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log('✓ Migración aplicada con éxito.')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }
}

main()
  .catch(e => { console.error('✗ Error:', e); process.exit(1) })
  .finally(() => pool.end())
