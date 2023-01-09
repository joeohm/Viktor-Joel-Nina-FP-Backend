# Project Viktor Joel and Ninas Final project backend

This is the final project to our Technigo bootcamp!
We built a birthday reminder app, Remindyo, and this is the backend.
Frontend here: https://github.com/ViktorSvenssonN/Viktor-Joel-Nina-FP-Frontend

## Link to API

https://email-sender-pw346p3yuq-lz.a.run.app/

## About

Below is documentation for the server.js file. For additional documentation, see Documentation folder.

## server.js

## Imports

- `express`: A web framework for Node.js
- `cors`: A middleware that allows the server to accept requests from different origins
- `mongoose`: A library that provides an easy way to connect to MongoDB and perform operations on it
- `crypto`: A built-in Node.js module for performing cryptographic operations
- `bcrypt`: A library for generating and verifying password hashes
- `MailService`: A module for sending emails
- `regenerator-runtime/runtime`: A runtime that supports async/await syntax

## Database Connection

A connection to MongoDB is established using the `mongoUrl` string, which is either the value of the `MONGO_URL` environment variable or `mongodb://localhost/project-final`. The `useNewUrlParser` and `useUnifiedTopology` options are passed to the `connect` method to specify the options to be used when connecting to MongoDB.

## Application setup

The `express` instance is created and stored in the `app` variable. The `app` object is then exported so that it can be used in other parts of the application. The `cors` middleware is then applied to the `app` object to allow it to accept requests from different origins. The `app` object is also configured to parse incoming request bodies as JSON.

## Error Handling Middleware

A middleware function is defined that checks the status of the MongoDB connection before handling a request. If the connection is not ready, the middleware sends a `503` status code and a JSON response with an error message to the client. If the connection is ready, the middleware passes the request to the next middleware or route handler.

## Email Scheduling

A `node-cron` job is scheduled to run every day at 07:00 GMT. When the job is run, it retrieves all birthdays and users from the database and passes them to the `MailService` module for sending emails.

## Mongoose Schemas

Two Mongoose schemas are defined: `UserSchema` and `BirthdaySchema`. The `UserSchema` includes fields for the user's email, password, access token, and an array of birthday reminders. The `BirthdaySchema` includes fields for a person's first and last name, birth date, user ID, birthday reminder settings, and other information.

## Mongoose Models

Two Mongoose models are created using the previously defined schemas: `User` and `Birthday`. These models allow the application to perform CRUD operations on the corresponding collections in the MongoDB database.

## Endpoints

### user

- GET `/`: Lists all available endpoints in the application
- POST `/register`: Registers a new user
- POST `/login`: Logs in a user
- DELETE `/user` - Deletes a user
- PATCH `/change-password` - Changes a user´s password

### birthdays

- POST `/birthday`: Adds a new birthday for a specific user
- PATCH `/birthday`: Changes a birthday for a specific user
- DELETE `/birthday`: Deletes a birthday for a specific user
- GET `/birthday`: Retrieves a specific birthday for a specific user
- GET `/all-birthdays`: Retrieves all birthdays for a specific user

All of these endpoints expect and return JSON objects.
