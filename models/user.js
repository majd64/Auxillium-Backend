const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  account: String,
  email: String,
  verificationCode: String,
  verified: Boolean,
  tokens: Number,
  referrelCode: String,
  referred: Number,
  referrer: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
