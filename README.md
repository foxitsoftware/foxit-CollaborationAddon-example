## Project structures

```
packages
  web-collab-client   -- collab client sdk
  web-collab-server   -- collab server sdk
  collab-db           -- collab db setup and migration
docs                  -- documents 
samples
  collabClientReactSample/ -- collab client demo based on React Framework
  collabClientVueSample/ -- collab client demo based on Vue3 Framework
  collabServerSample/ -- collab server demo
```

## Development environment setup  

### Setup Nodejs

1. install Nodejs, preferred version: nodejs 20 and 22+ lts.

``` sh
node -v 
# v20.10.0
```

### install Docker

[Reference](https://www.docker.com/get-started/)

## Getting started

### install dependencies

cd into to project root and run command: `npm install`

**Notice**:
Npm workspace is used to manage dependencies between samples and packages.
If you want to use other package manager, like `yarn` or `pnpm`, please change the workspace settings.

### Setup Local Database and Redis for development

**Notice**:

- Make sure Docker or Podman is installed and running.
- Database will be Postgresql and running on port 5432 by default.
- Redis will be on port 6379 by default.

Install Database System using Docker/Podman and run migration:
`npm run collab-cli setup-local-db`

If you already have a Database System, for example MySQL, then you can run migration directly:
`npm run collab-cli init-db -- --type mysql --name collab-db --user <YOUR_DB_USER> --password <YOUR_DB_PASSWORD> --port <YOUR_DB_PORT>`

Install Redis:
`npm run collab-cli setup-redis`

Get help and options:

``` sh
npm run collab-cli help
npm run collab-cli help setup-local-db 
npm run collab-cli help init-db 
npm run collab-cli help setup-redis 
```

For example, if you want to specify a port and name for the database, run commands like the following:

``` sh
npm run collab-cli setup-local-db -- --port 5432 --name collab-db
```

### Start the samples

1. Start the client sample: `samples/collabClientReactSample` (Based on React framework)

`npm run start:sample-React-client`

or Start the client Vue sample: `samples/collabClientVueSample`  (Based on Vue framework)

`npm run start:sample-Vue-client`

2. Start the server sample: `samples/collabServerSample`

`npm run start:sample-server`

you can setup env variables by creating a `.env` file in the project root directory to pass custom configuration.

For example, the following are parameters for setting up a custom database connection.

``` sh
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_DATABASE=collab-db
```
