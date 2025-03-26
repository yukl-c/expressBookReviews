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

  if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

const isExistBook = (bookauthor, booktitle)=>{ //returns boolean
    //write code to check is the username is valid
        let bookWithSameTitleAndAuthor = books.filter(
            book => book.title === booktitle && book.author === bookauthor
        );
        return (bookWithSameTitleAndAuthor.length > 0) ? true : false;
    }

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const bookauthor = req.body.author;
  const booktitle = req.body.title;
  const bookreviews = req.body.reviews;

  if ( bookauthor && booktitle) {
    if (!isExistBook(bookauthor, booktitle)) {
        books[Object.keys(books).length] = {
            "author": bookauthor,
            "title": booktitle,
             "reviews": bookreviews
          }
        return res.status(200).json({message: "Book successfully registered."});  
    } else {
        return res.status(404).json({message: "Book already exists!"});  
    }
  } else {
    return res.status(404).json({message: "Unable to register book"});
  }
  
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
