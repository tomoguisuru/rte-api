# Real Time Events - Client API

Demo api that includes a simple user/client setup for use with UCC Real Time Events

Note: This application is provided without warranty or guarantee of function.

___

## Requirements
- Postgres >= 13
- Node >= 16.16.x
- NPM >= 8.11.x
- Redis >= 6.2.x

___

## Getting Started

```bash
npm run env:init
```

Three versions of the `.env` file will be created:
- `.env.local`
- `.env.staging`
- `.env.prod`


Copy your `Owner ID` and `APIKey` into the file for the appropriate environments.

#### downlynk

- [Owner ID](https://cms.downlynk.com/static/cms2/index.html#/settings)
- [APIKey](https://cms.downlynk.com/static/cms2/index.html#/settings/integration-keys)

#### uplynk

- [Owner ID](https://cms.upwnlynk.com/static/cms2/index.html#/settings)
- [API Key](https://cms.upwnlynk.com/static/cms2/index.html#/settings/integration-keys)

### Selecting an Environment

_local prod_
```bash
npm run env:prod:local
```

_local staging_
```bash
npm run env:staging:local
```

_staging_
```bash
npm run env:staging
```

_prod_
```bash
npm run env:prod
```

___

## Preparing the DB

Run on initial setup or when changing from production to staging or staging to production envs

```bash
npm run db:init
```

Two default users will be created that you can use to login to the system with.


| email | role | password |
| --- | :---: | --- |
| john.doe@example.com | admin | _password_ |
| bob.ross@example.com | publisher | _password_ |

___

## Running the Server

### Starting Redis
```bash
redis-server
```

### Starting Node
```bash
npm run dev
```

By default, the server will be accessible from `localhost:3000`
