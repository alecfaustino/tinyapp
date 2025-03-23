const { assert } = require('chai');

const { urlsForUser } = require('../helpers.js');

const testUrlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user456" },
  "abc123": { longURL: "http://www.example.com", userID: "user123" }
};

describe('urlsForUser', function() {
  it('should return only the URLs that belong to the specified user', function() {
    const userUrls = urlsForUser("user123", testUrlDatabase);
    const expectedOutput = {
      "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user123" },
      "abc123": { longURL: "http://www.example.com", userID: "user123" }
    };
    assert.deepEqual(userUrls, expectedOutput);
  });

  it('should return an empty object if the urlDatabase does not contain any URLs for the specified user', function() {
    const userUrls = urlsForUser("user789", testUrlDatabase);
    assert.deepEqual(userUrls, {});
  });

  it('should return an empty object if the urlDatabase is empty', function() {
    const userUrls = urlsForUser("user123", {});
    assert.deepEqual(userUrls, {});
  });

  it('should not return any URLs that do not belong to the specified user', function() {
    const userUrls = urlsForUser("user123", testUrlDatabase);
    assert.notProperty(userUrls, "9sm5xK"); // Ensure "9sm5xK" is NOT in the result
  });
});