const express = require('express')
const passport = require('passport')
const router = express.Router()

// @desc    Authenticate with google
// @route   GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }))

// @desc    Google Auth Callback
// @route   GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google',{ failureRedirect: '/' }),
function(req, res) {
  // Successful authentication
  res.redirect('/dashboard');
});

// @desc    Logout
// @route   GET /auth/logout
router.get('/logout', (req, res) => {
  req.logOut();
  res.redirect('/');
})

module.exports = router