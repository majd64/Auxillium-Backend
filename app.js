const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
let User = require("./models/user");
const path = require("path");
const util = require('./util')
const nodemailer = require("nodemailer");
const app = express();

mongoose.connect(`mongodb+srv://admin:${process.env.DBPASS}@cluster0.xpbd4.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.urlencoded({extended: true}));

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILERUSER,
    pass: process.env.NODEMAILERPASS
  }
});

const maxTokens = 500;
const airdropAmount = 100;
const refAmount = 50;
app.get("/api/user/:account", (req, res) => {
  User.findOne({account: req.params.account}, (err, user) => {
    if (err) return res.status(400).send({message: err.message});
    if (user) return res.status(200).send({user: user})

    var newUser = new User({
      account: req.params.account,
      email: "",
      referrelCode: util.makeid(9),
      verificationCode: util.makeid(9),
      verified: false,
      tokens: 0,
      referred: 0,
      referrer: 0
    })

    newUser.save()
    return res.status(200).send({user: newUser})
  })
})

app.post("/api/sendVerificationCode/:account", async (req, res) => {
  if (!req.body.email) return res.status(404).send({message: "No email provided"})

  User.findOne({account: req.params.account}, async (err, user) => {
    if (err) return res.status(500).send({message: err.message});
    if (!user) return res.status(404).send({message: "Invalid account"})

    user.email = req.body.email
    await user.save()

    var mailOptions = {
      from: process.env.NODEMAILERUSER,
      to: user.email,
      subject: `Verify your email`,
      text: `Code: ${user.verificationCode}`
    };
    await transporter.sendMail(mailOptions);

    res.sendStatus(200)
  })
})

app.post("/api/verifyEmail/:account", async (req, res) => {
  if (!req.body.verificationCode) return res.status(404).send({message: "No code provided"})

  User.findOne({account: req.params.account}, async (err, user) => {
    if (err) return res.status(500).send({message: err.message});
    if (!user) return res.status(404).send({message: "Invalid account"})

    if (user.verificationCode === req.body.verificationCode){
      user.verified = true
      await user.save();
      res.status(200).send({user: user})
    }else{
      res.status(401).send({message: "Invalid code"})
    }
  })
})

app.post("/api/claimAirDrop/:account", async (req, res) => {
  User.findOne({account: req.params.account}, async (err, user) => {
    if (err) return res.status(500).send({message: err.message});
    if (!user) return res.status(404).send({message: "Invalid account"})

    if (user.tokens != 0) return res.status(401).send({message: "Tokens claimed"})

    if (req.body.refCode){
      User.findOne({referrelCode: req.body.refCode}, (err, refUser) => {
        if (refUser && !err){
          if (refUser.tokens < maxTokens){
            refUser.tokens += refAmount;
            refUser.referred += 1;
            if (refUser.tokens > maxTokens){
              refUser.tokens = maxTokens
            }
            refUser.save();
          }
        }
      })
    }
    user.tokens += airdropAmount;
    await user.save();
    res.status(200).send({user: user})
  })
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 5000, function() {console.log("server started");});
