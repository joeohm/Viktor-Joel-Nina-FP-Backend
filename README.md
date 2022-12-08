# Project Auth API

In this weeks project we have built an API with authentication and a frontend with forms to either register or sign in. And a welcome page showing when logged in. The project has been made in a pair.

## The problem

- The API has routes to:
1. register
2. login
3. authenticated endpoint: Main
4. Not Found

- A frontend page which POSTs a new user to the API

- The password is encrypted by using bcrypt.

- the API valideates the user input when creating a new user  anf return error messages shown by the frontend.

If we had more time for this project we would:
- Show error messages next to the field which has the error. (from the API)
- Try to implement Google authentication with Firebase.
- Add more routes, perhaps even a POST route to create new objects in your database as a logged-in user.
-  Improve validations in the backend to ensure unique email addresses, or validate the email address format using a regular expression.

## View it live

Frontend: https://viktor-sofia-project-auth.netlify.app

Backend:  https://project-auth-4wtcpuirwa-lz.a.run.app
