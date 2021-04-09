const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
let User = require("./models/user.model");

const app = express();

mongoose.connect(`mongodb+srv://admin:${process.env.DBPASS}@cluster0.xpbd4.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true);

app.use(express.static(path.join(__dirname, "build")));
app.use(bodyParser.urlencoded({extended: true}));

app.get("/api/user/:account", (req, res) => {
  User.findOne({account: req.params.account}, (err, user) => {
    if (err) return res.status(400).send({message: err.message});
    if (user) return res.status(200).send({user: user})

    var newUser = new User({
      account: req.params.account,
      email: "",
      verificationCode: util.makeid(9),
      verified: false,
      tokens: 0,
      referrelCode: util.makeid(6),
      referred: 0,
      referrer: 0
    })

    newUser.save()
    return res.status(200).send({user: newUser})
  })
})

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 5000, function() {console.log("server started");});
