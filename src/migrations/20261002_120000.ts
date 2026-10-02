import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`image_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`align\` text DEFAULT 'start';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` ADD \`frame\` text DEFAULT 'none';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_feature_grid\` ADD \`variant\` text DEFAULT 'icons';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_feature_grid_items\` ADD \`image_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_stats\` ADD \`centered\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_content_feed\` ADD \`variant\` text DEFAULT 'media';`)
  await db.run(sql`ALTER TABLE \`pages_blocks_content_feed_items\` ADD \`image_url\` text;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_cta\` ADD \`card\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_rich_content\` ADD \`narrow\` integer DEFAULT false;`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.run(sql`ALTER TABLE \`pages_blocks_rich_content\` DROP COLUMN \`narrow\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_cta\` DROP COLUMN \`card\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_content_feed_items\` DROP COLUMN \`image_url\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_content_feed\` DROP COLUMN \`variant\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_stats\` DROP COLUMN \`centered\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_feature_grid_items\` DROP COLUMN \`image_url\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_feature_grid\` DROP COLUMN \`variant\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` DROP COLUMN \`frame\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` DROP COLUMN \`align\`;`)
  await db.run(sql`ALTER TABLE \`pages_blocks_hero\` DROP COLUMN \`image_url\`;`)
}
