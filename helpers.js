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

// used to generate both the short URL and unique userIDs
function generateRandomString() {
  return Math.random() // generates random 1 > num > 0
  .toString(36) // converting the number to base 36 (0-9 & a-z)
  .substring(2, 2 + 6); // removes the 0. from beginning (from how random generates #) 
  // will only provide 6 characters max 
};

module.exports = {
  getUserByEmail,
  urlsForUser,
  generateRandomString,
}