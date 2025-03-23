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

module.exports = {
  getUserByEmail,
  
}