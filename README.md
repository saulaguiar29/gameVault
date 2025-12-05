# GameVault

A web application for managing video game collections with user authentication.

## Data Model/Schema

### User

**Attributes:**

- **email** (string, required, unique, lowercase)
- **encryptedPassword** (string, required, minlength: 8)
- **firstName** (string, required)
- **lastName** (string, required)

### Videogame

**Attributes:**

- **name** (string, required)
- **platform** (string, required)
- **condition** (string, enum: ["New", "Like New", "Good", "Fair", "Poor", "CIB", "No Box"])
- **rating** (string, enum: ["E", "T", "M"])
- **genre** (string)
- **progress** (number, min: 0, max: 100)
- **wishlist** (boolean)
- **year** (number, min: 1900, max: current year)
- **favorite** (boolean)
- **playing** (boolean)
- **score** (number, min: 1, max: 100)
- **difficulty** (number, min: 1, max: 10)
- **notes** (string)
- **image** (string)
- **createdAt** (date, default: current date)
- **user** (ObjectId, reference to User, required)

## REST Endpoints

### User Authentication

| Name             | Method   | Path       | Description                       |
| ---------------- | -------- | ---------- | --------------------------------- |
| Register         | `POST`   | `/users`   | Create a new user account         |
| Login            | `POST`   | `/session` | Start a new user session          |
| Get Current User | `GET`    | `/session` | Retrieve current user information |
| Logout           | `DELETE` | `/session` | End the current user session      |

### Videogames

| Name           | Method   | Path              | Description                        |
| -------------- | -------- | ----------------- | ---------------------------------- |
| Retrieve Games | `GET`    | `/videogames`     | Get all games for the current user |
| Retrieve Game  | `GET`    | `/videogames/:id` | Get a specific game by ID          |
| Create Game    | `POST`   | `/videogames`     | Add a new game to collection       |
| Update Game    | `PUT`    | `/videogames/:id` | Update an existing game            |
| Delete Game    | `DELETE` | `/videogames/:id` | Remove a game from collection      |

### File Upload

| Name         | Method | Path      | Description               |
| ------------ | ------ | --------- | ------------------------- |
| Upload Image | `POST` | `/upload` | Upload a game cover image |

## Technology Stack

- **Frontend**: Vue.js, HTML, CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: Express-session with bcrypt
- **File Upload**: Multer

## Deployment

https://s25-midterm-project-saulaguiar29.onrender.com
