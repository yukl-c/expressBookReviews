const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
    let userWithSameName = users.filter(user => user.username === username);
    return (userWithSameName.length === 0) ? true : false;
}

const authenticatedUser = (username,password)=>{ //returns boolean
// Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  //Write your code here
  const loginUserName = req.body.username;
  const loginPassword = req.body.password;

  if (!loginUserName || !loginPassword) {return res.status(404).json({message: "Missing Input"});}

  if (authenticatedUser(loginUserName, loginPassword)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: loginPassword
        }, 'access', { expiresIn: 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, loginUserName
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Main endpoint to be accessed by authenticated users
regd_users.get("/auth/get_message", (req, res) => {
    return res.status(200).json({ message: "Hello, You are an authenticated user. Congratulations!" });
  });


// Add a book review
regd_users.put("/auth/review/:isbn", async (req, res) => {
    const isbn = req.params.isbn;
    console.log("ISBN:", isbn);
    const newComment = req.body.review;
    // Log the request body for debugging
    console.log("Request review:", newComment);

    if (!newComment) {
        return res.status(400).json({ message: "Review content is required." });
    }

    let filtered_book = books[isbn];
    
    if (filtered_book) {
        try {
            // Simulate an asynchronous operation (e.g., database save)
            // Assuming you might have a function to save the review
            filtered_book['reviews'] = newComment; // Update review
            books[isbn] = filtered_book;

            // If you have an async operation, it would look something like this:
            // await saveReviewToDatabase(isbn, req.body.review);

            return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated. Current review: ${books[isbn].reviews}`);
        } catch (error) {
            console.error("Error updating review:", error);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    } else {
        return res.status(404).json({ message: "Unable to find this ISBN!" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    console.log("ISBN:", isbn);

    if (books[isbn]) {
        try {
            books[isbn].reviews = {}; // Delete the specific review
            return res.status(200).json({ message: "Book review successfully deleted." });
        } catch(err) {
            return res.status(404).json({ message: "Book doesn't exist!" });
        }
    }
});

module.exports.authenticated = regd_users; // module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
