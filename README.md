# Real Time Events - Client API

Demo api that includes a simple user/client setup for use with UCC Real Time Events

Note: This application is provided without warranty or guarantee of function.

___

## Requirements
- Postgres 13
- Node >= 14.16.x
- NPM >= 7.10.x
- Redis >= 6.2.x
- UCC Owner ID [here](https://cms-ausw2-dt-rts1.downlynk.com/static/cms2/index.html#/settings)
- UCC API Key [here](https://cms-ausw2-dt-rts1.downlynk.com/static/cms2/index.html#/settings/integration-keys)

___

## Getting Started
You will need to create a `.env` file and copy the contents of the `example.env` file into it.

Once you do, you will need to copy your `Owner ID` and `APIKey` into the file

You will need to do this so that proxy operations can be made to the UCC Services endpoints.

Be sure to update any values or secrets in the `.env` file that do not match your local setup

___

## Preparing the DB

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