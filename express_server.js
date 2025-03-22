const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.set("view engine", "ejs");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// convert request body to a readable string from the request body
// then it will add the data into req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// maybe will remove this in finished version
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id] || null;
  const templateVars = {
    user,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

// render the register.ejs 
app.get("/register", (req, res) => {
  res.render("register");
});

//handle registration form 
app.post("/register", (req, res) => {

  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and Password cannot be empty!");
  }

  if (getUserByEmail(req.body.email)) {
    return res.status(400).send("User already exists!");
  }
  const randomID = generateRandomString();

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password,
  };

  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  // username is either set or not set 
  const user = users[req.cookies.user_id] || null;
  // pass user
  res.render("urls_new", { user });
});

// for urls_show when we have a path to a specific shortened url id
app.get("/urls/:id", (req, res) => {
  // user is either logged in or not
  const user = users[req.cookies.user_id] || null;
  const templateVars = {
    user,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
  };

  res.render("urls_show", templateVars);
});

// when we add a new link through create new URL
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;

  res.redirect(`/urls/${shortURL}`);
});

// for when we hit the delete button on /urls
app.post("/urls/:id/delete", (req, res) => {
  //req.params.id contains the data from the form 
  delete urlDatabase[req.params.id];

  res.redirect("/urls");
});

// for when we submit the edit form, render urls_index again with updated
app.post("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  //res.body.longURL is available due to name attribute on input
  const newLongURL = req.body.longURL;

  //update urlDatabase
  urlDatabase[shortId] = newLongURL;
  //render urls_index
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// maybe remove this in finished version of project
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/u/:id", (req, res) => {
  // req.params.id contains the data from the form
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// when we add a username and submit login
app.post("/login", (req, res) => {
  // req.body.username accessible due to the form 
  const username = users[req.cookies.user_id];
  res.cookie("username", username);

  res.redirect("/urls");
});

// logged in -> log out
app.post("/logout", (req, res) => {
  //make username falsey value
  res.clearCookie("user_id");

  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random() // generates random 1 > num > 0
  .toString(36) // converting the number to base 36 (0-9 & a-z)
  .substring(2, 2 + 6); // removes the 0. from beginning (from how random generates #) 
  // will only provide 6 characters max 
}

function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}