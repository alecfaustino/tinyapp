const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// convert request body to a readable string from the request body
// then it will add the data into req.body
app.use(express.urlencoded({ extended: true }));

// maybe will remove this in finished version
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// for urls_show when we have a path to a specific shortened url id
app.get("/urls/:id", (req, res) => {
  const templateVars = {
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random() // generates random 1 > num > 0
  .toString(36) // converting the number to base 36 (0-9 & a-z)
  .substring(2, 2 + 6); // removes the 0. from beginning (from how random generates #) 
  // will only provide 6 characters max 
}