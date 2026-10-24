const COLUMNS = 'name, amount_cents, message, created_at';

const LIST = `SELECT ${COLUMNS} FROM supporters WHERE NOT hidden ORDER BY created_at, id`;
const ADD = `INSERT INTO supporters (name, amount_cents, message) VALUES ($1, $2, $3) RETURNING ${COLUMNS}`;
// Reads the table, not just SELECT 1, so a database the pre-deploy never migrated fails the check.
const PING = 'SELECT 1 FROM supporters LIMIT 1';

const toSupporter = (row) => ({
  name: row.name,
  amountCents: Number(row.amount_cents),
  message: row.message,
  createdAt: new Date(row.created_at),
});

export function createPostgresSupportersStore(database) {
  return {
    async list() {
      const { rows } = await database.query(LIST);
      return rows.map(toSupporter);
    },
    async add({ name, amountCents, message }) {
      const { rows } = await database.query(ADD, [name, amountCents, message]);
      return toSupporter(rows[0]);
    },
    async ping() {
      await database.query(PING);
    },
  };
}
