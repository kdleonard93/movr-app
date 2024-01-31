## Project Overview
This is the Java API backend implementation of the MovR sample application. 
The application demonstrates how to integrate a Java/Spring Boot 
implementation with CockroachDB. This application can run
standalone to provide a REST API, or in conjunction with a front
end implemented with React.js. 

## Pre-requisites
* Install [CockroachDB](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html). 

* Create a CockroachDB cluster, either using a [CockroachCloud](https://cockroachlabs.cloud/) instance or running [locally](https://www.cockroachlabs.com/docs/v20.2/start-a-local-cluster).

* Install the Java Development Kit (version 8 or later). 
Instructions are on the [Java Website](https://www.oracle.com/java/technologies/javase-downloads.html). Make sure to install the JDK
  (Java Development Kit) and not just the JRE (Java Runtime Environment).

* Install [NodeJS](https://nodejs.org/en/download/).

* Install [Yarn package manager](https://classic.yarnpkg.com/en/docs/install/).


## Project setup
1. Install the MovR data into your CRDB instance using the provided initialization script in the `java` root directory. This will create
a new database called `movr` and populate the required table(s).

    ```
    ../db-setup.sh <Cockroach Connection String>
    ```

    *Note that the connection string must contain your user name, password, the name of the default database, and the location of your .crt certificate file.* For example, a CockroachCloud free tier connection string might look like this: `postgres://myname:mypassword@free-tier.gcp-us-central1.cockroachlabs.cloud:26257/mycluster.defaultdb?sslmode=verify-full&sslrootcert=/Users/username/Downloads/cc-ca.crt`. See [Client Connection Parameters](https://www.cockroachlabs.com/docs/stable/connection-parameters.html) link for more information about how to configure the connection strings.

2. Copy and build the React front end using the provided script. Run the following command from the `java` root directory:

    ```
    ../copy-frontend.sh
    ```

## Building and Running the Application

1. Configure your connection to the `movr` database in the `src/main/resources/application.yaml`. Start by copying the `application.yaml.example` file. 
Then edit the `url`, `username` and `password` properties as shown in the example configuration.


2. Build the application by running the provided Maven wrapper from the `java` root directory:

    ```
    ./mvnw clean install
    ```

    *Note: The first time you build MovR, Maven will download all the required 
packages.* This may take a few minutes. 
    The packages will be cached so subsequent builds will not need to do this.

    If the build is successful, you should see a message similar to the following:

    ```
      [INFO] ----------------------------------------------------------------
      [INFO] BUILD SUCCESS
      [INFO] ----------------------------------------------------------------
      [INFO] Total time:  4.224 s
      [INFO] Finished at: 2021-02-13T16:04:20-04:00
      [INFO] ----------------------------------------------------------------
    ```   

3. Run the MovR application:

    ```
    java -jar target/movr-api-0.0.1-SNAPSHOT.jar 
    ```
   
    You will see Spring startup message and after a few seconds you should see a line that looks something like:
   
    ```
      2021-12-13 16:22:33.291  INFO 29452 --- [main] io.roach.movrapi.MovrApiApplication : *** MovrApiApplication started ***
    ```
      
4. Access the application UI in your browser at `http://localhost:36257/`. 
(You can change the port number by changing the `port` property  in `application.yaml`.)

5. Use `Ctrl+C` in the terminal where the Java process is running to shut down the application.
