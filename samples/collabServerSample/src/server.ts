import {WebCollabServer} from "@foxitsoftware/web-collab-server";
import type {DatabaseConfig} from "@foxitsoftware/web-collab-server";
import {setupFileService} from './file-service';
import {userService} from './user-service'
import dotenv from "dotenv"

// Get config from .env files
dotenv.config()

export let serverPort = process.env['SERVER_PORT'] ? +process.env['SERVER_PORT'] : 8080;

const databaseConfig: DatabaseConfig = {
  //@ts-ignore
  type: process.env['DB_TYPE'] || 'postgres',
  host: process.env['DB_HOST'] || 'localhost',
  port: process.env['DB_PORT'] ? +process.env['DB_PORT'] : 5432,
  database: process.env['DB_DATABASE'] || 'collab-db',
  user: process.env['DB_USER'] || 'postgres',
  password: process.env['DB_PASSWORD'] || '123456',
};

const server = new WebCollabServer({
  databaseConfig,
  userService
})

server.applyConfig(setupFileService)

server.start(serverPort);
