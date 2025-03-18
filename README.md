# **Rociny Backend**

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
  <a href="https://www.postgresql.org/" target="blank"><img src="https://www.postgresql.org/media/img/about/press/elephant.png" width="110" alt="PostgresSQL Logo" /></a>
  <a href="https://www.docker.com/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Docker_%28container_engine%29_logo_%28cropped%29.png" width="180" alt="Docker Logo" /></a>
</p>

<p align="center">A Docker-based backend project using NestJS, PostgreSQL, and pgAdmin.</p>

<p align="center">
<a href="http://commitizen.github.io/cz-cli/" target="_blank"><img src="https://img.shields.io/badge/commitizen-friendly-brightgreen.svg" alt="Commitizen" /></a>

## **Description**

This project uses Docker to run a backend application powered by NestJS and PostgreSQL. PgAdmin is included for database management.

## **Installation Instructions**

### **1. Install Docker Desktop**

- Download and install Docker Desktop from [here](https://docs.docker.com/compose/install/).
- Ensure Docker Desktop is running.

### **2. Clone the Repository**

Clone this repository to your local machine:

```bash
# Clone project
$ git clone git@github.com:arnaud-roncari/rociny-nestjs-api.git
```

## **Configuration**

### **1. Create a `.env` File**

In the root directory of the project, create a `.env` file with the following content:

```bash
# POSTGRES
POSTGRES_PORT=5432
POSTGRES_PASSWORD=yourpassword
POSTGRES_DB=rociny-spostgres

# PGADMIN
PGADMIN_PORT_OUT=5050
PGADMIN_PORT_IN=80
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=admin

# NESTJS
NESTJS_PORT=3000
JWT_SECRET=mysecret

# MINIO
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=yourpassword
MINIO_SCHEME=http
```

Replace youruser, yourpassword, and yourdbname with your desired PostgreSQL credentials.

## **Running the Project**

### **1. Start Docker Desktop**

Ensure Docker Desktop is running.

### **2. Start Docker Compose**

In the root directory of the project, open PowerShell (or your terminal in Visual Studio Code) and run the following command:

```bash
# Compile and run the project
$ docker compose up

# Stop docker
$ docker compose down
```

## **Accessing Services**

### **1. pgAdmin**

- Open a browser and go to http://localhost:5050.
- Login credentials (from .env):
  - Email: admin@admin.com
  - Password: admin

**Connect to PostgreSQL Database**

- Name: postgres (or any name you prefer).
- Host: postgres (Docker service name).
- Port: 5432 (as defined in .env).
- Username: postgres
- Password: Use the POSTGRES_PASSWORD value from .env.

### **2. NestJS API**

- Open a browser or API client (e.g., Postman) and go to http://localhost:3000.

## Run tests

```bash
# unit tests
$ npm run test
```

## **Project Details**

**Technologies Used**

- Docker: Containerization
- PostgreSQL: Database
- pgAdmin: Database management tool
- NestJS: Backend framework

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.

## License

This project uses **MinIO** which is licensed under the [Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

You can find the full text of the Apache License 2.0 in the `LICENSE` file at the root of this repository.
