const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  account: String,
  email: String,
  verificationCode: String,
  verified: Bool,
  tokens: Number,
  referrelCode: Number,
  referred: Number,
  referrer: Number
});

const User = mongoose.model('User', userSchema);

module.exports = User;
