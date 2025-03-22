const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080




// ---------- PSEUDODATABASES ---------- //
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

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};



// ---------- MIDDLEWARE? ---------- //
// convert request body to a readable string from the request body
// then it will add the data into req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");





// ---------- LOGIN ---------- //
//render login ejs
app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id] || null;
  const templateVars = { user }

  //if there's already a user logged in, they don't need to login
  if(user !== null) {
    return res.redirect("/urls");
  }
  res.render("login", templateVars);
});

// handling log in page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // user should have been store in users object
  const user = getUserByEmail(email);
  
  // if no user was found, it would return null
  if(!user) {
    return res.status(403).send("Email was not found!");
  } 
  // match the password on the form vs user stored password
  if(user.password !== password) {
    return res.status(403).send("Invalid Password!");
  }
  
  // if both conditions met, login success, set cookie
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});





// ---------- REGISTRATION ---------- // 
// render the register.ejs 
app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id] || null;
  const templateVars = { user }

  //if there's already a user, they don't need to register.
  if(user !== null) {
    return res.redirect("/urls");
  }


  res.render("register", templateVars);
});

//handle registration form 
app.post("/register", (req, res) => {

  //validate that values were entered for both fields
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Email and Password cannot be empty!");
  }

  // check if email is already inside the users object
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




// ---------- MAIN APP ROUTES ---------- //
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id] || null;
  const templateVars = {
    user,
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // user is either set or not set 
  const user = users[req.cookies.user_id] || null;

  // if the user is not logged in, send to login page
  if(!user) {
    return res.redirect("/login");
  }
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
  const user = users[req.cookies.user_id] || null;

  // user cannot make shortened URLs without login
  if(!user) {
    return res.status(403).send("Please login to shorten URLs");
  }

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

app.get("/u/:id", (req, res) => {
  // req.params.id contains the data from the form
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

// logged in -> log out
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});





// ---------- HELPER FUNCTIONS ---------- //
// used to generate both the short URL and unique userIDs
function generateRandomString() {
  return Math.random() // generates random 1 > num > 0
  .toString(36) // converting the number to base 36 (0-9 & a-z)
  .substring(2, 2 + 6); // removes the 0. from beginning (from how random generates #) 
  // will only provide 6 characters max 
}

// loop through the users object to see if the email exists. 
function getUserByEmail(email) {
  for (const user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}