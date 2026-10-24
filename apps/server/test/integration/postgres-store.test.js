import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { appliedMigrations, migrate } from '../../src/db/migrate.js';
import { MIGRATIONS } from '../../src/db/migrations.js';
import { createPostgresSupportersStore } from '../../src/supporters/postgres-store.js';
import { createPgliteDatabase } from '../support/pglite-database.js';
import { sendRequest, startTestServer } from '../support/test-server.js';

let database;

beforeEach(async () => {
  database = await createPgliteDatabase();
});

afterEach(() => database.close());

describe('migrate', () => {
  it('applies every migration once, then has nothing to do', async () => {
    expect(await migrate(database)).toEqual(MIGRATIONS.map((migration) => migration.name));
    expect(await migrate(database)).toEqual([]);
    expect([...(await appliedMigrations(database))]).toEqual(['0001_supporters']);
  });

  it('leaves nothing behind when a migration fails, so the next run tries it again', async () => {
    const broken = [{ name: '0002_broken', statements: ['CREATE TABLE half (id int)', 'NOT SQL'] }];
    await expect(migrate(database, broken)).rejects.toThrow();
    expect((await appliedMigrations(database)).has('0002_broken')).toBe(false);
    const { rows } = await database.query("SELECT to_regclass('half') AS found");
    expect(rows[0].found).toBeNull();
  });
});

describe('the Postgres supporters store', () => {
  beforeEach(() => migrate(database));

  it('saves gifts and lists them oldest first', async () => {
    const store = createPostgresSupportersStore(database);
    const saved = await store.add({ name: 'Sok Dara', amountCents: 2500, message: 'Hi' });
    await store.add({ name: '', amountCents: 500, message: '' });
    expect(saved).toMatchObject({ name: 'Sok Dara', amountCents: 2500, message: 'Hi' });
    expect(saved.createdAt).toBeInstanceOf(Date);
    const listed = await store.list();
    expect(listed.map(({ name, amountCents }) => [name, amountCents])).toEqual([
      ['Sok Dara', 2500],
      ['', 500],
    ]);
  });

  it('leaves out a gift the owner hid', async () => {
    const store = createPostgresSupportersStore(database);
    await store.add({ name: 'Spam', amountCents: 1000000, message: '' });
    await store.add({ name: 'Mey', amountCents: 100, message: '' });
    await database.query("UPDATE supporters SET hidden = true WHERE name = 'Spam'");
    expect((await store.list()).map((supporter) => supporter.name)).toEqual(['Mey']);
  });

  it('holds the limits in the table too', async () => {
    const insert = (name, cents) =>
      database.query('INSERT INTO supporters (name, amount_cents) VALUES ($1, $2)', [name, cents]);
    await expect(insert('Mey', 0)).rejects.toThrow(/check/);
    await expect(insert('Mey', 1000001)).rejects.toThrow(/check/);
    await expect(insert('x'.repeat(41), 100)).rejects.toThrow(/check/);
    await expect(insert('ក'.repeat(40), 100)).resolves.toBeDefined();
  });

  it('answers the health check once migrated', async () => {
    await expect(createPostgresSupportersStore(database).ping()).resolves.toBeUndefined();
  });

  it('serves gifts through the API end to end', async () => {
    const server = await startTestServer({ supporters: createPostgresSupportersStore(database) });
    try {
      const body = JSON.stringify({ name: 'Arun', amount: 7.5 });
      const reply = await sendRequest(server.port, {
        method: 'POST',
        path: '/api/supporters',
        headers: {
          origin: server.baseUrl,
          'content-type': 'application/json',
          'content-length': Buffer.byteLength(body),
        },
        body,
      });
      expect(reply.status).toBe(201);
      const listed = JSON.parse((await sendRequest(server.port, { path: '/api/supporters' })).text);
      expect(listed.supporters).toEqual([expect.objectContaining({ name: 'Arun', amount: 7.5 })]);
    } finally {
      await server.close();
    }
  });
});

describe('a database the pre-deploy never migrated', () => {
  it('fails the health check', async () => {
    await expect(createPostgresSupportersStore(database).ping()).rejects.toThrow();
  });
});
