# Express Book Reviews

An **Express.js** application for managing a book review system. This project allows users to register, log in, add books, update reviews, and manage books. It also includes admin-specific features for managing the book collection.

---

## Features

### Public Features:
1. **Register a New User**:
   - Endpoint: `POST /register`
   - Allows users to register with a username and password.

2. **View All Books**:
   - Endpoint: `GET /`
   - Retrieves the list of all books available in the shop.

3. **View Book Details by ISBN**:
   - Endpoint: `GET /isbn/:isbn`
   - Fetches details of a book based on its ISBN.

4. **View Book Details by Author**:
   - Endpoint: `GET /author/:author`
   - Fetches all books written by a specific author.

5. **View Book Reviews**:
   - Endpoint: `GET /reviews/:isbn`
   - Retrieves the reviews of a book based on its ISBN.

---

### Registered User Features:
1. **Log In**:
   - Endpoint: `POST /auth/login`
   - Allows registered users to log in and receive a JWT token for authentication.

2. **Add or Update a Book Review**:
   - Endpoint: `PUT /auth/review/:isbn`
   - Allows users to add or update a review for a specific book.

3. **Clear a Book Review**:
   - Endpoint: `DELETE /auth/review/:isbn`
   - Allows users to delete their review for a specific book.

4. **Log Out**:
   - Endpoint: `POST /auth/logout`
   - Logs out the user and invalidates their session.

---

### Admin Features:
1. **Add a New Book**:
   - Endpoint: `POST /auth/admin/add_book`
   - Allows admins to add a new book to the collection.

2. **Remove an Existing Book**:
   - Endpoint: `DELETE /auth/admin/remove_book`
   - Allows admins to remove a book from the collection.

3. **Admin-Specific Message**:
   - Endpoint: `GET /auth/admin/get_message`
   - Displays a message for authenticated admins.

---

### Key Modules
1. **auth_users.js**:

    - Handles user authentication, login, logout, and admin-specific routes.
    - Reads and writes user data to users.csv.

2. **general.js**:
    
    - Handles public routes and book-related operations.
    - Reads and writes book data to books.csv.

3. **books.csv**:

   - Stores book data, including ISBN, title, author, and reviews.

4. **users.csv**:

   - Stores user data, including username, password, and admin status.

---

### API Endpoints

### Public Endpoints:
| Method | Endpoint               | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/register`             | Register a new user                 |
| GET    | `/`                     | Get the list of all books           |
| GET    | `/isbn/:isbn`           | Get book details by ISBN            |
| GET    | `/author/:author`       | Get book details by author          |
| GET    | `/reviews/:isbn`        | Get reviews of a book by ISBN       |

### Registered User Endpoints:
| Method | Endpoint               | Description                          |
|--------|-------------------------|--------------------------------------|
| POST   | `/auth/login`           | Log in as a registered user         |
| PUT    | `/auth/review/:isbn`    | Add or update a book review         |
| DELETE | `/auth/review/:isbn`    | Clear a book review                 |
| POST   | `/auth/logout`          | Log out                             |

### Admin Endpoints:
| Method | Endpoint                  | Description                          |
|--------|----------------------------|--------------------------------------|
| POST   | `/auth/admin/add_book`     | Add a new book                      |
| DELETE | `/auth/admin/remove_book`  | Remove an existing book             |
| GET    | `/auth/admin/get_message`  | Get a message for authenticated admins |