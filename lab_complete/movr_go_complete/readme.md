## Project Overview
This is the API backend implementation of the MOVR Sample App using Go. The sample will demonstrate how to integrate Go with CockroachDB.  This project contains a frontend single page application written in React with Redux as well as an API backend.

## Install CockroachDB
Download and install the latest version of CockroachDB for your operating system.

## Load Data CockroachDB
If you are using a local install of CockroachDB, you will first need to make sure it is running by going to the CockroachDB install directory and running the following command:

`./cockroach start-single-node --insecure --listen-addr=localhost:26257 --http-addr=localhost:8080`

(This step is not required if you are using a remote database).

The next step is to load the MOVR data into your database instance. You can do so by running the following commands. (the referenced file dbinit.sql is found in the src /main/resources/db folder):

`cat dbinit.sql | cockroach sql --url <db_url>
 cockroach sql -- url <db_url>
 CREATE USER IF NOT EXISTS maxroach;
 GRANT ALL ON DATABASE movr TO maxroach;     
 GRANT ALL ON TABLE movr.* TO maxroach;`

The "<db_url>" can be any CockroachDB or Cockroach Cloud instance.

See our [Client Connection Parameters](https://www.cockroachlabs.com/docs/stable/connection-parameters.html) link for more information about how to configure the connection strings.

## Project Setup
### 1. Install Go
A Go installation is required to run this project.  If you don't have Go installed, you can find instructions to download and install it on the [Go website](https://golang.org/doc/install).

### 2. Install Module Dependencies
Once Go is installed, you can install the module dependencies by running `build.sh`.  

### 3. Configure Database Connection String
Once you have initialize your database instance, you will need to set the connection string.  You may do so by opening up the `.env` file and setting the `PGX_CONNECTION_STRING` variable to the appropriate connection string, likely the same one you used to load sample data into the database.  You may wish to make a copy of `.env-example` and naming it `.env` before modifying the connection string.

## Run Project
If you are running a local CockroachDB instance, you'll want to make sure that is running first.  For example,

```bash
cockroach start \
--insecure \
--store=node1 \
--listen-addr=localhost:26257 \
--http-addr=localhost:8080 \
--join=localhost:26257,localhost:26258,localhost:26259 \
--background
```

To start the API server, run the following command in the root of your directory:

`go run .`

Once running, you can access the API at `http://localhost:5000/`


## Internal Instructions
These instructions are for development purposes and does not need to be included as part of the final product.

### 1. Copy Frontend To API Backend
You will need to have Node.js installed before you can build the frontend (see the Readme file in the `react-frontend` folder for more info). Once it is installed, you can run `copy-frontend.sh` (located in the root folder) to compile the React code and copy it to the static web content folder in the project. You may need to make a copy of `.env-example` and name it `.env` before running the script.

### 2. Create Deployment Package for AWS Elastic Beanstalk
You can run `scripts/deploy.sh` to create a deployment package in the `deployments` directory with a zip file to be deployed.
