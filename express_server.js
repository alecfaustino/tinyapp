const express = require("express");
const cookieSession = require("cookie-session");
const methodOverride = require('method-override');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = 8080; // default port 8080
// Helper Functions //
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');




// ---------- PSEUDODATABASES ---------- //
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "easier",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlDatabase = {};



// ---------- MIDDLEWARE? ---------- //
// convert request body to a readable string from the request body
// then it will add the data into req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['aeAWEGgasbz'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");





// ---------- LOGIN ---------- //
//render login ejs
app.get("/login", (req, res) => {
  const user = users[req.session.user_id] || null;
  const templateVars = { user }

  //if there's already a user logged in, they don't need to login
  if(user !== null) {
    return res.redirect("/urls");
  }

  //if not, render the form
  res.render("login", templateVars);
});

// handling log in page
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // user should have been stored in users object
  const user = getUserByEmail(email, users);
  
  // if no user was found, it would return null
  if(!user) {
    return res.status(403).send("Email was not found!");
  } 
  // match the password on the form vs user stored password (hashed)
  if(!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Invalid Password!");
  }
  
  // if both conditions met, login success, set cookie
  req.session.user_id = user.id;
  res.redirect("/urls");
});





// ---------- REGISTRATION ---------- // 
// render the register.ejs 
app.get("/register", (req, res) => {
  const user = users[req.session.user_id] || null;
  const templateVars = { user }

  //if there's already a user, they don't need to register.
  if(user !== null) {
    return res.redirect("/urls");
  }


  res.render("register", templateVars);
});

//handle registration form 
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  //validate that values were entered for both fields
  if (email === "" || password === "") {
    return res.status(400).send("Email and Password cannot be empty!");
  }
  
  // check if email is already inside the users object
  if (getUserByEmail(email, users)) {
    return res.status(400).send("User already exists!");
  }
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const randomID = generateRandomString();
  users[randomID] = {
    id: randomID,
    email,
    password: hashedPassword
  };

  req.session.user_id = randomID;
  res.redirect("/urls");
});




// ---------- MAIN APP ROUTES ---------- //
// *** GET ROUTES *** // 
app.get("/urls", (req, res) => {
  const user = users[req.session.user_id] || null;

  // check if user is logged in 
  if(!user) {
    return res.status(401).send("Please log in or register to see URLs");
  }

  // showing only what belongs to user
  const userURLs = urlsForUser(req.session.user_id, urlDatabase);


  const templateVars = {
    user,
    urls: userURLs,
  };


  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // user is either set or not set 
  const user = users[req.session.user_id] || null;

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
  const user = users[req.session.user_id] || null;

  const entry = urlDatabase[req.params.id];

  // if the user is  not logged in
  if(!user) {
    return res.status(401).send("Please login to access URLs");
  }

  // if the ID doesn't exist
  if(!entry) {
    return res.status(404).send("The url does not exist")
  }

  if(entry.userID !== req.session.user_id) {
    return res.status(403).send("You don't have permission to view this url");
  }
  const templateVars = {
    user,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
  };
  
  res.render("urls_show", templateVars);
});

// when we add a new link through create new URL
app.post("/urls", (req, res) => {
  const user = users[req.session.user_id] || null;

  // user cannot make shortened URLs without login
  if(!user) {
    return res.status(403).send("Please login to shorten URLs");
  }

  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: user.id,
  }

  res.redirect(`/urls/${shortURL}`);
});

// for when we hit the delete button on /urls
app.delete("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const user = users[req.session.user_id] || null;
  const entry = urlDatabase[shortId];
    // if the user is  not logged in
    if(!user) {
      return res.status(401).send("Please login to access URLs");
    }
    // if the ID doesn't exist
    if(!entry) {
      return res.status(404).send("The url does not exist")
    }
    if(entry.userID !== req.session.user_id) {
      return res.status(403).send("You don't have permission to delete this url");
    }
  //req.params.id contains the data from the form 
  delete urlDatabase[req.params.id];
  
  res.redirect("/urls");
});

// for when we submit the edit form, render urls_index again with updated
app.put("/urls/:id", (req, res) => {
  const shortId = req.params.id;
  const user = users[req.session.user_id] || null;
  const entry = urlDatabase[shortId];
  //res.body.longURL is available due to name attribute on input
  const newLongURL = req.body.longURL;
  
  // if the user is  not logged in
  if(!user) {
    return res.status(401).send("Please login to access URLs");
  }
  // if the ID doesn't exist
  if(!entry) {
    return res.status(404).send("The url does not exist")
  }
  if(entry.userID !== req.session.user_id) {
    return res.status(403).send("You don't have permission to edit this url");
  }
  //update urlDatabase
  urlDatabase[shortId].longURL = newLongURL;
  //render urls_index
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

});

app.get("/u/:id", (req, res) => {
  // req.params.id contains the data from the form
  const longURL = urlDatabase[req.params.id];

   // handling if url does not exist (the id always exists because it's in req.params)
   if(!longURL) {
    return res.status(404).send("The shortened URL does not exist");
  }

  res.redirect(longURL);
});

// logged in -> log out
app.post("/logout", (req, res) => {
  //clear the session cookie
  req.session = null;
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
