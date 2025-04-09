const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const registerUserName = req.body.username;
  const registerPassword = req.body.password;

  if (!registerUserName || !registerPassword) {
    return res.status(404).json({message: "Missing Input"});
    }

  if (isValid(username)) {
    users.push({"username": username, "password": password});
    return res.status(200).json({message: "User successfully registered. Now you can login"});
  } else {
    return res.status(404).json({message: "User already exists!"});
  }

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  res.send(JSON.stringify(books, null,4))
  return res.status(200).json({message: "Book list is shown"});
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  try {
    res.send(JSON.stringify(books[isbn]))
    return res.status(200).json({message: "The detail of the book is shown"});
  } catch(err) {
    return res.status(404).json({message: err});
  }
  
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  try {
    res.read(JSON.stringify(
        books.filter(book => book.author === req.params.author)
      ))
    return res.status(200).json({message: "book details based on author is shown"});
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  try {
    res.read(JSON.stringify(
        books.filter(book => book.title === req.params.title)
      ))
      return res.status(200).json({message: "all books based on title are shown"});
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  try {
    res.read(JSON.stringify(books[req.params.isbn].reviews))
    return res.status(200).json({message: "The reveiws of the book is shown"});
  } catch(err) {
    return res.status(404).json({message: err});
  }
});

module.exports.general = public_users;
