# Assignment 2

**Assignment due at 11:59pm on Monday 5/3/2021**<br/>
**Demo due by 11:59pm on Monday 5/17/2021**

The goal of this assignment is to start using a real database to store application data.  The assignment requirements are listed below.

You are provided some starter code in this repository that implements a solution to assignment 1.  The starter code's API server is implemented in `server.js`, and individual routes are modularized within the `api/` directory.  Postman tests for the API and a Postman environment for the tests are included in the `tests/` directory.  You can import these tests into Postman and build on them if you like.  Note that, depending on where you're running your API server, you may need to update the `baseUrl` variable in the included Postman environment to reflect the URL for your own server.

The starter code also includes an `openapi.yaml` file in the `public/` directory.  You can import this file into the OpenAPI editor at https://editor.swagger.io/ to generate documentation for the server to see how its endpoints are set up.

Feel free to use this code as your starting point for this assignment.  You may also use your own solution to assignment 1 as your starting point if you like.

## Use a database to power your API

Your overarching goal for this assignment is to modify the API server to use a database to store the following resources:
  * Businesses
  * Reviews
  * Photos

You may choose either MySQL or MongoDB for this purpose (or another DB implementation you're interested in, with permission).  Whichever database you choose, it should completely replace the starter code's existing JSON/in-memory storage for these resources.  In other words, you should update all API endpoints in the original starter code to use your database.

You should use the [official MySQL Docker image](https://hub.docker.com/_/mysql/) or the [official MongoDB Docker image](https://hub.docker.com/_/mongo) from Docker Hub to power your database.  Whichever database you choose, your implementation should satisfy the criteria described below.

## Database initialization

Before you run your application for the first time, you'll have to make sure your database is initialized and ready to store your application data.  Use the mechanisms described below to initialize your database, so it's ready when you launch your app.

### MySQL

If you're using MySQL, you should make sure to set the following environment variables when launching your database container:
  * `MYSQL_ROOT_PASSWORD` - This specifies the password that is set for the MySQL `root` user.  You can also use `MYSQL_RANDOM_ROOT_PASSWORD` to allow the container to generate a random password.
  * `MYSQL_DATABASE` - This specifies the name of a MySQL database to be created when your container first starts.
  * `MYSQL_USER` and `MYSQL_PASSWORD` - These are used to create a new user, in addition to the `root` user, who will have permissions only for the database named in `MYSQL_DATABASE`.  This is the user you should use to connect to your database from your API server.

In addition, you'll have to make sure all the necessary tables are created in your database, so your app can store data there.  You may also want to store some initial data in these tables, so your app has data to work with right away.  The easiest way to do this is to connect to your MySQL server using the MySQL terminal monitor and issue MySQL queries there to initialize your database, similar to how we initialized the database in lecture.

### MongoDB

If you're using MongoDB, you should make sure to set the following environment variables when launching your database container:
  * `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_USERNAME` - These are used to create the MongoDB `root` user.
  * `MONGO_INITDB_DATABASE` - This specifies the name of a MongoDB database to be created when your container first starts.

In addition, you'll have to make sure to create a lower-privileged user with access to the database you specify in `MONGO_INITDB_DATABASE` above.  Because MongoDB generally uses a "create-on-first-use" approach and doesn't require a schema, you probably won't have to do any further initialization of your MongoDB database if you don't want to.  However, it may still be helpful to store some initial data in your database, so your app has data to work with right away.  The easiest way to do all this is to connect to your MongoDB server using the MongoDB shell and issue commands to create a user and add data to your database, similar to the way we did this in lecture.

## Database organization

Your database should store all resource data (i.e. businesses, photos, and reviews) for the API.  Because the resources you're working with are closely tied to each other (e.g. each review is tied to both a specific business and a specific user), you'll have to think carefully about how you organize and access them in your database.  Some suggestions are included below for each database.

### MySQL

If you're using MySQL, you will likely want to use [foreign keys](https://dev.mysql.com/doc/refman/8.0/en/example-foreign-keys.html) to link reviews and photos to their corresponding business, and when gathering data for a specific business (i.e. for the `GET /businesses/{id}` endpoint), you can either use [`JOIN` operations](http://www.mysqltutorial.org/mysql-join/) or run multiple queries to fetch the corresponding reviews and photos.

### MongoDB

If you're using MongoDB, there are many valid ways to organize data in your database.  For example, you could use three separate collections to store businesses, reviews, and photos.  In this case, you can either use [`$lookup` aggregation](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) or multiple queries to gather data for a specific business (i.e. for the `GET /businesses/{id}` endpoint).

Alternatively, you could store all photos and reviews as subdocuments of their corresponding business document.  In this case, you'll likely want to use [a projection](https://docs.mongodb.com/manual/tutorial/project-fields-from-query-results/) to omit the photo and review data from businesses when returning a list of all businesses (i.e. from the `GET /businesses` endpoint).  You'll also have to think carefully about how you find data for a specific user, e.g. a specific user's photos or reviews.  Do do this, you can use [subdocument array queries](https://docs.mongodb.com/manual/tutorial/query-array-of-documents/) to select businesses with reviews/photos by the specified user, and then you can use some custom JS to select only matching reviews/photos from those businesses.  Alternatively, you can use MongoDB's [aggregation pipeline](https://docs.mongodb.com/manual/core/aggregation-pipeline/) to structure a single query to fetch exactly the reviews/photos you're interested in.

## Data persistence with a Docker volume

Whichever database you use, you should persist its data in a Docker volume (*not a bind mount to a host directory*).  A Docker volume is a mechanism for persisting data created by a Docker container.  You can think of them like portable disks that can be attached to Docker containers.  You can find documentation on how Docker volumes work here:

https://docs.docker.com/storage/volumes/

By default, MySQL stores data in the directory `/var/lib/mysql`, and MongoDB stores data in the directory `/data/db`.  To persist data for your database, it should be sufficient to create a Docker volume (with `docker volume create`) and mount it at the appropriate one of these locations in your database container (using the `-v` option when launching the DB container).

## API server setup

Your API server should read the location (i.e. hostname, port, and database name) and credentials (i.e. username and password) for your database from environment variables.

## Extra credit: Docker Compose specification

For extra credit, you can write a Docker Compose specification that launches your entire application (i.e. API server and database server) from scratch with a single command.  Docker Compose is a tool that allows you to define and launch multi-container applications.  You can find documentation on Docker Compose here:

https://docs.docker.com/compose/

Your Docker Compose specification in this case will specify two containers, one running your API server and one running your database server.  To make this work, you'll have to do the following things:
  * Write a Dockerfile to create a Docker image that will run your API server.  Your Docker Compose specification will use this Dockerfile to launch a container running your API server.  You can read more about Dockerfiles here:

    https://docs.docker.com/engine/reference/builder/

  * Write a database initialization script that will automatically initialize your database (e.g. create tables, load initial data, create a new lower-privileged user, etc.) when the app is launched using Docker compose from scratch for the first time.  See below for more information about how to do this for MySQL and MongoDB.

  * Specify the correct environment variables for each container in the Docker Compose specification to initialize the database container and to allow the API server to connect to the database container.

### MySQL database initialization script

A MySQL database running in a Docker container can be initialized by writing a SQL script (i.e. a `.sql` file) and mounting that file so that it lives in the directory `/docker-entrypoint-initdb.d/` in the MySQL container.  See the "Initializing a fresh instance" section of the [MySQL Docker Image Docs](https://hub.docker.com/_/mysql/) for a description of how this works.  Your database initialization should, at a minimum, create all of the tables you'll need for your API.  If you like, you can also put some initial data into your database.  One easy way to create this file is to manually initialize a database with the tables (and, optionally, initial data) you need and then [create a dump of that database](https://docs.docker.com/samples/library/mysql/#creating-database-dumps).  Once the script is created, put it into a host-machine directory that you bind mount to the directory `/docker-entrypoint-initdb.d/` in your container.  **Note that this script will not run if a database is already initialized for your container, e.g. if you reuse an already-initialized Docker volume for a new container.**

### MongoDB database initialization script

A MongoDB database running in a Docker container can be initialized by writing a JavaScript script (i.e. a `.js` file) and mounting that file so that it lives in the directory `/docker-entrypoint-initdb.d/` in the MongoDB container.  See the "Initializing a fresh instance" section of the [MongoDB Docker Image Docs](https://hub.docker.com/_/mongo/)  Your database initialization script should, at a minimum, create a new, low-privileged user to use to connect to your database from your API server.  If you like, you can also put some initial data into your database.  Your initialization script will use the same syntax as is used to run commands in the MongoDB shell (e.g. `db.createUser(...)`, `db.collection.insert(...)`, etc.).  Once the script is created, put it into a host-machine directory that you bind mount to the directory `/docker-entrypoint-initdb.d/` in your container.  **Note that this script will not run if a database is already initialized for your container, e.g. if you reuse an already-initialized Docker volume for a new container.**

## Submission

We'll be using GitHub Classroom for this assignment, and you will submit your assignment via GitHub.  Just make sure your completed files are committed and pushed by the assignment's deadline to the master branch of the GitHub repo that was created for you by GitHub Classroom.  A good way to check whether your files are safely submitted is to look at the master branch your assignment repo on the github.com website (i.e. https://github.com/osu-cs493-sp21/assignment-2-YourGitHubUsername/). If your changes show up there, you can consider your files submitted.

## Grading criteria

This assignment is worth 100 total points, broken down as follows:

* 20 points: database is running in a Docker container that is correctly initialized (e.g. by using appropriate environment variables the first time the container is launched and by manually connecting to the DB server and issuing commands to perform other needed initialization)
* 50 points: API server is modified to correctly store and fetch individual businesses, photos, and reviews in the database, without consideration for links between these resources
* 20 points: API correctly deals with linked resources, for example, correctly returning photos and reviews when fetching data for a specific business and correctly supporting fetching a specific user's photos/reviews
* 5 points: database data is correctly persisted to a Docker volume
* 5 points: database location information and credentials are correctly provided to API server via environment variables

In addition, you can earn up to 10 points of extra credit for creating the Docker Compose specification described above.
