const { program, Option } = require('commander');
const os = require('os');
const path = require('path');
const { exec, fork } = require('child_process');
const nodeResolve = require('resolve/sync');
const fs = require('fs');

program.name('collab-cli').description('CLI for collab sdk').version('1.0.0').showHelpAfterError();

const runtimeOption = new Option('-r, --runtime <runtime>', 'container runtime to use: docker or podman').default('docker').choices(['docker', 'podman']);
const dbTypeOption = new Option('-t, --type <database type>', 'DBMS to use: postgres or mysql').default('postgresql').choices(['postgresql', 'mysql']);

function customEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/\./g, '%2E');
}

// prisma schema do not support dynamic provider so we update the provider here
function updateSchemaProvider(dbType){

  const filePath = path.resolve(__dirname, '../prisma/schema.prisma');

  const searchWord = 'postgresql';
  const replaceWord = dbType;
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const updatedData = data.replace(new RegExp(searchWord, 'g'), replaceWord);

    fs.writeFileSync(filePath, updatedData, 'utf8');

    console.log('Prisma schema provider updated successfully.');
  } catch (err) {
    console.error(err);
  }
}

function dbMigration(options, callback) {
  if (options.type && options.type !== 'postgres') {
    path.resolve(__dirname, `../prisma/${options.type}/schema.prisma`);
  } else {
    path.resolve(__dirname, '../prisma/schema.prisma');
  }

  const dbType = options.type || 'postgresql';
  updateSchemaProvider(dbType);

  fork(
    nodeResolve('prisma'),
    ['migrate', 'dev', '--name', 'init'],
    {
      cwd: path.resolve(__dirname, '..'),
      env: {
        DATABASE_URL: `${dbType}://${options.user}:${options.password}@${options.host || 'localhost'}:${options.port}/${
          options.name
        }`
      },
    },
    callback,
  );
}

program
  .command('setup-local-db')
  .description('setup local postgreSQL with Docker or Podman')
  .addOption(runtimeOption)
  .option('-n, --name <name>', 'name of container', 'collab-db')
  .option('-d, --dir <dir>', 'dir for database data', `${os.homedir()}/foxit-collabsdk/database`)
  .option('-u, --user <user>', 'username of database', 'postgres')
  .option('-p, --port <number>', 'exposed port of database', 5432)
  .option('-P, --password <password>', 'password for database user', '123456')
  .action((options) => {
    const command = [
      `${options.runtime} run -d`,
      `--name ${options.name}`,
      `-e POSTGRES_PASSWORD=${options.password}`,
      `-p ${options.port}:5432`,
      `-v ${options.dir}:/var/lib/postgresql/data`,
      `postgres:14.3-alpine3.16`,
    ].join(' ');

    exec(command, (err) => {
      if (err) {
        console.log(err.message);
        process.exit(err.code);
      }

      console.log('database is running, now start to init db ...');

      setTimeout(function () {
        dbMigration(options, function () {
          console.log('database is setup successfully and ready to use!');
        });
      }, 15000);
    });
  });

program
  .command('setup-redis')
  .description('setup local redis with Docker or Podman')
  .addOption(runtimeOption)
  .option('-n, --name <name>', 'name of container', 'collab-redis')
  .option('-p, --port <number>', 'exposed port of redis', 6379)
  .action((options) => {
    const command = [`${options.runtime} run -d`, `--name ${options.name}`, `-p ${options.port}:6379`, `redis:5.0`].join(' ');
    exec(command, (err, output) => {
      if (err) {
        console.log(err.message);
        process.exit(err.code);
      }
      console.log('redis is started successfully!');
    });
  });

program
  .command('init-db')
  .description('create database and tables for collab sdk')
  .addOption(dbTypeOption)
  .option('-n, --name <db-name>', 'name of database', 'collab-db')
  .option('-u, --user <db-user>', 'username of database', 'postgres')
  .option('-P, --password <db-password>', 'password of database', '123456')
  .option('-h, --host <db-host>', 'host of database', 'localhost')
  .option('-p, --port <db-port>', 'port of database', 5432)
  .action((options) => {
    dbMigration(options);
  });

program.parse();
