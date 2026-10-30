# Deploying to Railway

The arcade runs on [Railway](https://railway.com) as one service built from the GitHub repo
`Novsochetra/fighting-games`, next to a Railway Postgres database for the supporters. The service
sends the pages, the games and the API from one address, `https://<name>.up.railway.app`. Every push
to `main` deploys again.

## How a deploy runs

`.railway/railway.ts` holds the service's settings, so the dashboard needs none of them. Railway does
not read it during a deploy: `railway config apply` sends it once (step 5), and again after any change
to it. It leaves the variables to the dashboard (`variables: { managed: false }`), so the database
password never goes in the repo.

| Step       | What runs                                                      | Why                                                                                                                                               |
| ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Builder    | Railpack (Railway's default builder), Node 22                  | Node comes from `engines` in `package.json`.                                                                                                      |
| Install    | `npm ci`                                                       | Exactly the lockfile.                                                                                                                             |
| Build      | `npm run build && NPM_CONFIG_PRODUCTION= npm prune --omit=dev` | Vite builds the arcade into `dist/`, which the server sends; then the build, test and lint tools go. Railpack sets `NPM_CONFIG_PRODUCTION=false`. |
| Pre-deploy | `node apps/server/src/db/migrate-cli.js`                       | Applies new migrations before the new server starts. If one fails, the deploy stops and the old server keeps serving.                             |
| Start      | `node apps/server/src/main.js`                                 | Node itself, not `npm start`, so it gets Railway's SIGTERM.                                                                                       |
| Health     | `GET /api/health` must answer 200 within 120 s                 | It reads the supporters and scores tables, so a database that is down or never migrated keeps traffic on the old server.                          |
| Stop       | SIGTERM, then SIGKILL after 15 s                               | The old server takes no new requests, finishes the ones under way, then closes the database pool.                                                 |
| Region     | `asia-southeast1-eqsg3a` (Singapore), 1 copy                   | Closest to Cambodia. Keep one copy: the rate limit lives in the server's memory, so a second copy would not see the first one's.                  |

On Railway (`RAILWAY_ENVIRONMENT_ID` is set) the server listens on `0.0.0.0` and trusts one proxy hop
(`TRUST_PROXY=1`), unless you set those variables. It refuses to start unless `DATABASE_URL` is a
`postgres://` URL: without one it would keep gifts in memory, and the next deploy would lose them. The
message never shows the value, which holds the password.

## Before you start

- The repo on GitHub with this work merged into `main`.
- A Railway account, and the [Railway CLI](https://docs.railway.com/cli) on your Mac:
  `brew install railway`.

## 1. Create the Railway project

1. railway.com → **New Project** → **Database** → **PostgreSQL**. Keep the service name `Postgres`.
2. In the project: **Create** → **GitHub Repo** → let Railway's GitHub app see `fighting-games` →
   pick it. A first deploy starts and fails until step 2 is done. That is fine.
3. Leave **Serverless** (app sleeping) off.

## 2. Set the variables

Open the arcade service → **Variables** → **Raw Editor** and paste:

```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
PORT=8765
```

- `${{Postgres.DATABASE_URL}}` is the database's private address (no SSL needed). Paste it as it is,
  without quotes. If you renamed the database service, use its name.
- `PORT=8765` fixes the port, so the domain in step 3 can point at it before anything runs.
- Every variable: `.env.example`.

## 3. Give it a public address

Arcade service → **Settings** → **Networking** → **Generate Domain**. If it asks for a port, enter
`8765`. You get `https://<name>.up.railway.app`.

## 4. Turn off GitHub Pages

The Pages workflow is gone, but Pages still serves the last copy it got. On github.com: the repo →
**Settings** → **Pages** → **Source** → **None** (or leave it up until Railway works).

## 5. Deploy

In the repo folder on your Mac (`npm ci` first, for the `railway` package the settings file imports).
`plan` only shows the changes: it must list build, pre-deploy, start, health check and draining, with
nothing to destroy and `variables: unmanaged`.

```bash
railway login
railway link
railway config plan
railway config apply
```

Then click **Deploy** on the staged changes (or push a commit), and watch **Deployments** → the new one:

- Pre-deploy logs: `Migrating railway on postgres.railway.internal:5432`,
  `Applied 0001_supporters, 0002_scores` (later deploys: `Up to date.`).
- Deploy logs: `Arcade running at http://localhost:8765/` and
  `Supporters and scores in Postgres railway on postgres.railway.internal:5432`.
- It turns **Active** once `/api/health` answers. Open `https://<name>.up.railway.app/api/health`:
  `{"ok":true}`.

## First deploy: what to check

- The home page lists the games, and a game starts.
- On the supporters page, Become a supporter → an amount → Continue shows the KHQR code → I sent it
  → your name is on the list. Reload: it is still there.
- From another site the API refuses: in the browser console on any other page,
  `fetch('https://<name>.up.railway.app/api/supporters')` fails with a CORS error.

## File storage (S3 and CloudFront)

The server can put files in the S3 bucket `fighting-games-arcade-files` (Singapore,
`ap-southeast-1`), which CloudFront sends from `https://dphwn49s8chpb.cloudfront.net`
(`apps/server/src/storage/`). It keeps the runs' posters, under `posters/<game>/`. The bucket is private: all four Block Public
Access settings are on, its policy lets only the CloudFront distribution `E1MCQTXMG16EJB` read it
(Origin Access Control), and versioning keeps every old copy. A key is written once, since CloudFront
and browsers keep a file a year: put a new version under a new name (`hero-v2.png`).

The server signs in as its own AWS user, which may only add files to this bucket:

1. AWS Console → **IAM** → **Users** → **Create user** `arcade-server`, without console access, and
   no permissions yet.
2. The user → **Permissions** → **Add permissions** → **Create inline policy** → **JSON**, paste this,
   and name it `arcade-files-put`:

   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": "s3:PutObject",
         "Resource": "arn:aws:s3:::fighting-games-arcade-files/*"
       }
     ]
   }
   ```

3. The user → **Security credentials** → **Create access key** → **Application running outside
   AWS**. Copy both values now: AWS shows the secret once.
4. Railway → the arcade service → **Variables** → **Raw Editor**, add these and save (it deploys
   again):

   ```bash
   AWS_ACCESS_KEY_ID=<the access key ID>
   AWS_SECRET_ACCESS_KEY=<the secret access key>
   AWS_REGION=ap-southeast-1
   S3_BUCKET=fighting-games-arcade-files
   CLOUDFRONT_URL=https://dphwn49s8chpb.cloudfront.net
   ```

5. Check it with Railway's variables, from a linked repo folder: `railway run npm run storage:check`.
   It uploads `checks/storage-check-<time>.txt` and prints `CloudFront sends it: <address>`.

## Hide a fake gift

No one can check that money arrived, so a gift may be fake. Hide it (it stays in the table, off the
list). Railway → Postgres service → **Data** → `supporters`, find its `id`, then in **Query**:

```sql
UPDATE supporters SET hidden = true WHERE id = 42;
```

Show it again with `hidden = false`.

## Hide a cheated score

A score is checked against the game's rules and the time its run took, but a patient cheat can still
post one that looks real. Hide it the same way, from the `scores` table (the boards drop it within
15 seconds):

```sql
UPDATE scores SET hidden = true WHERE id = 42;
```

Hiding a score takes its poster off the board too.

## Take a poster down

The server checks a poster's size and type, but not what it shows. To take one down and keep its
run, set its `poster` back to `NULL` (the board drops it within 15 seconds):

```sql
UPDATE scores SET poster = NULL WHERE id = 42;
```

Its files stay in the bucket under a random name that nothing links to any more. To delete them
too, take the run's `poster` value first (`posters/steel-and-dust/9f2c…`), delete its three files
(`-192.jpg`, `-640.jpg`, `-1200.png`) in the AWS Console (**S3** → `fighting-games-arcade-files`,
with **Show versions**, as versioning keeps old copies), then **CloudFront** → `E1MCQTXMG16EJB` →
**Invalidations** → **Create invalidation** with `/posters/steel-and-dust/9f2c…*`, since CloudFront
keeps a file a year.

To give a run a poster by hand (one posted before posters existed), upload its files first, then set
`poster` to the key they went up under, exactly as it printed, never a row id or an address:

```sql
UPDATE scores SET poster = 'posters/steel-and-dust/0123456789abcdef01234567' WHERE id = 42;
```

The column takes only a key of that shape, `posters/<game>/` and 24 hex digits
(`0004_poster_key_shape`), and refuses anything else with `scores_poster_key`; the board shows no
poster for a value that is not one (`isPosterKey`), rather than pictures that are not there.

## Run against Postgres on your Mac

`npm run dev` needs no database: gifts stay in memory until the server stops. To try the real store,
point it at any Postgres and migrate first:

```bash
DATABASE_URL=postgres://localhost/arcade npm run db:migrate
```

```bash
DATABASE_URL=postgres://localhost/arcade npm run dev
```

## Backups

Postgres service → **Backups** → **Create backup** before a risky change, and add a **Daily** schedule.
Restore from the same tab.

## Rolling back

**Deployments** → an earlier deployment → **⋮** → **Redeploy**, or `git revert` the commit and push.
Migrations only add (a new table or column), so an older build still runs on a newer database.
