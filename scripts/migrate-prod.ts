/**
 * `prisma migrate deploy` equivalent for Turso/libSQL (M8.6).
 *
 * Why this exists: Prisma 7's CLI rejects libsql:// URLs for a sqlite-provider
 * schema (P1013), so production migrations are applied through @libsql/client
 * directly. Bookkeeping mirrors Prisma's `_prisma_migrations` table, so repeat
 * runs are no-ops and future migrations apply incrementally.
 *
 * Usage:
 *   TURSO_DATABASE_URL="libsql://…" TURSO_AUTH_TOKEN="…" npm run db:migrate:prod
 * (DATABASE_URL with an embedded ?authToken= also works.)
 */
import 'dotenv/config'
import { createClient } from '@libsql/client'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const url = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || ''
const isRemote = url.startsWith('libsql://') || url.startsWith('https://')
// file: URLs are only honored for local testing of this script itself.
const isTestFile = url.startsWith('file:') && process.env.MIGRATE_ALLOW_FILE === '1'
if (!isRemote && !isTestFile) {
  console.error(`Expected a libsql:// URL via TURSO_DATABASE_URL (got "${url || '(empty)'}").
For local dev use \`npm run db:migrate\` instead.`)
  process.exit(1)
}

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN })

async function main() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      "id"                  TEXT PRIMARY KEY NOT NULL,
      "checksum"            TEXT NOT NULL,
      "finished_at"         DATETIME,
      "migration_name"      TEXT NOT NULL,
      "logs"                TEXT,
      "rolled_back_at"      DATETIME,
      "started_at"          DATETIME NOT NULL DEFAULT current_timestamp,
      "applied_steps_count" INTEGER UNSIGNED NOT NULL DEFAULT 0
    )
  `)

  const applied = await client.execute(
    'SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL',
  )
  const done = new Set(applied.rows.map((r) => r.migration_name as string))

  const migrationsDir = join(import.meta.dirname, '..', 'prisma', 'migrations')
  const names = readdirSync(migrationsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort()

  let count = 0
  for (const name of names) {
    if (done.has(name)) continue
    const sql = readFileSync(join(migrationsDir, name, 'migration.sql'), 'utf8')
    const checksum = createHash('sha256').update(sql, 'utf8').digest('hex')

    console.log(`Applying migration '${name}'…`)
    const tx = await client.transaction('write')
    try {
      await tx.executeMultiple(sql)
      await tx.execute({
        sql: 'INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, finished_at, applied_steps_count) VALUES (?, ?, ?, ?, ?, ?)',
        args: [crypto.randomUUID(), checksum, name, new Date().toISOString(), new Date().toISOString(), 1],
      })
      await tx.commit()
      count++
    } catch (err) {
      await tx.rollback()
      console.error(`Migration '${name}' failed and was rolled back.`)
      throw err
    }
  }

  console.log(count ? `Applied ${count} migration(s).` : 'Already up to date — nothing to apply.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => client.close())
