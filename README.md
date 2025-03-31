## Project Structure

```
packages/
  web-collab-client/   - Collaboration client SDK
  web-collab-server/   - Collaboration server SDK
  collab-db/           - Database setup and migration scripts
docs/                  - Documentation files
samples/
  collabClientReactSample/ - React-based client demo
  collabClientVueSample/   - Vue3-based client demo
  collabServerSample/      - Server demo
```

## Development Environment Setup  

### Prerequisites

1. **Install Node.js**  
   Preferred versions: Node.js 20 or 22+ LTS.  
   Verify installation:  

   ```sh
   node -v 
   # Example output: v20.10.0
   ```

2. **Install Docker**  
   Follow the [Docker installation guide](https://www.docker.com/get-started).

---

## Getting Started

### Install Dependencies

Navigate to the project root and run:  

```sh
npm install
```

### Notices

- **Dependency Management**:  
  This project uses npm workspaces to manage dependencies across samples and packages. If you prefer using other package managers like `yarn` or `pnpm`, update the workspace settings accordingly.

- **Database and Redis Setup**:  
  - Ensure Docker or Podman is installed and running.  
  - The default database system is PostgreSQL, running on port `5432`.  
  - Redis will run on port `6379` by default.

---

### Setup Local Database and Redis

#### Using Docker/Podman

1. **Install and Configure Database**  
   Run the following command to set up a PostgreSQL database (default port: 5432):  

   ```sh
   npm run collab-cli setup-local-db
   ```

    If you already have a database system (e.g., MySQL), you can directly run migrations:  

   ```sh
   npm run collab-cli init-db -- --type mysql --name collab-db --user <YOUR_DB_USER> --password <YOUR_DB_PASSWORD> --port <YOUR_DB_PORT>
   ```

2. **Install Redis**  
   Run the following command to set up Redis (default port: 6379):  

   ```sh
   npm run collab-cli setup-redis
   ```

#### Additional Help

For more options, run:  

```sh
npm run collab-cli help
npm run collab-cli help setup-local-db 
npm run collab-cli help init-db 
npm run collab-cli help setup-redis 
```

**Example**: To specify a custom port and database name:  

```sh
npm run collab-cli setup-local-db -- --port 5432 --name collab-db
```

---

### Start the Samples

1. **Start the Client Sample**  
   - React-based client:  

     ```sh
     npm run start:sample-React-client
     ```

   - Vue3-based client:  

     ```sh
     npm run start:sample-Vue-client
     ```

2. **Start the Server Sample**  

   ```sh
   npm run start:sample-server
   ```

---

## Environment Configuration

You can customize configurations by creating a `.env` file in the project root. Example for database setup:  

```sh
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=123456
DB_DATABASE=collab-db
```
