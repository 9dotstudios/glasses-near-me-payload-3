import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`countries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`code\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`countries_code_idx\` ON \`countries\` (\`code\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`countries_slug_idx\` ON \`countries\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`countries_updated_at_idx\` ON \`countries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`countries_created_at_idx\` ON \`countries\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`countries_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`countries\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`countries_locales_locale_parent_id_unique\` ON \`countries_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`towns\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`country_id\` integer NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`country_id\`) REFERENCES \`countries\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`towns_slug_idx\` ON \`towns\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`towns_country_idx\` ON \`towns\` (\`country_id\`);`)
  await db.run(sql`CREATE INDEX \`towns_updated_at_idx\` ON \`towns\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`towns_created_at_idx\` ON \`towns\` (\`created_at\`);`)
  await db.run(
    sql`CREATE UNIQUE INDEX \`slug_country_idx\` ON \`towns\` (\`slug\`,\`country_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`towns_locales\` (
  	\`name\` text NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`towns\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`towns_locales_locale_parent_id_unique\` ON \`towns_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`shops\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`slug\` text NOT NULL,
  	\`country_id\` integer NOT NULL,
  	\`town_id\` integer NOT NULL,
  	\`phone\` text,
  	\`lat\` numeric,
  	\`lng\` numeric,
  	\`place_id\` text,
  	\`website\` text,
  	\`claim_status\` text DEFAULT 'unclaimed' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`country_id\`) REFERENCES \`countries\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`town_id\`) REFERENCES \`towns\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`shops_slug_idx\` ON \`shops\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`shops_country_idx\` ON \`shops\` (\`country_id\`);`)
  await db.run(sql`CREATE INDEX \`shops_town_idx\` ON \`shops\` (\`town_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`shops_place_id_idx\` ON \`shops\` (\`place_id\`);`)
  await db.run(sql`CREATE INDEX \`shops_claim_status_idx\` ON \`shops\` (\`claim_status\`);`)
  await db.run(sql`CREATE INDEX \`shops_updated_at_idx\` ON \`shops\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`shops_created_at_idx\` ON \`shops\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`slug_town_idx\` ON \`shops\` (\`slug\`,\`town_id\`);`)
  await db.run(sql`CREATE TABLE \`shops_locales\` (
  	\`name\` text NOT NULL,
  	\`address\` text,
  	\`hours\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`_locale\` text NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`shops\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`CREATE UNIQUE INDEX \`shops_locales_locale_parent_id_unique\` ON \`shops_locales\` (\`_locale\`,\`_parent_id\`);`,
  )
  await db.run(sql`CREATE TABLE \`shops_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`media_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`shops\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`shops_rels_order_idx\` ON \`shops_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`shops_rels_parent_idx\` ON \`shops_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`shops_rels_path_idx\` ON \`shops_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`shops_rels_media_id_idx\` ON \`shops_rels\` (\`media_id\`);`)
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`countries_id\` integer REFERENCES countries(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`towns_id\` integer REFERENCES towns(id);`,
  )
  await db.run(
    sql`ALTER TABLE \`payload_locked_documents_rels\` ADD \`shops_id\` integer REFERENCES shops(id);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_countries_id_idx\` ON \`payload_locked_documents_rels\` (\`countries_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_towns_id_idx\` ON \`payload_locked_documents_rels\` (\`towns_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_shops_id_idx\` ON \`payload_locked_documents_rels\` (\`shops_id\`);`,
  )
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`shops_rels\`;`)
  await db.run(sql`DROP TABLE \`shops_locales\`;`)
  await db.run(sql`DROP TABLE \`shops\`;`)
  await db.run(sql`DROP TABLE \`towns_locales\`;`)
  await db.run(sql`DROP TABLE \`towns\`;`)
  await db.run(sql`DROP TABLE \`countries_locales\`;`)
  await db.run(sql`DROP TABLE \`countries\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`media_id\` integer,
  	\`pages_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(
    sql`INSERT INTO \`__new_payload_locked_documents_rels\`("id", "order", "parent_id", "path", "users_id", "media_id", "pages_id") SELECT "id", "order", "parent_id", "path", "users_id", "media_id", "pages_id" FROM \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(
    sql`ALTER TABLE \`__new_payload_locked_documents_rels\` RENAME TO \`payload_locked_documents_rels\`;`,
  )
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`,
  )
  await db.run(
    sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`,
  )
}
