// ---------- HELPER FUNCTIONS ---------- //
// loop through the users object to see if the email exists. 
function getUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return null;
};

// finding the urls that only belong to the user
function urlsForUser(id, urlDatabase) {
  let filteredURLS = {};

  // each short URL
  for(const shortURL in urlDatabase) {
    // only put the urls that belong to the same ID to the filtered
    if(urlDatabase[shortURL].userID === id) {
      filteredURLS[shortURL] = urlDatabase[shortURL];
    }
  }

  return filteredURLS;
};

module.exports = {
  getUserByEmail,
  urlsForUser
}