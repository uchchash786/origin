//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app=express();
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));


const options={
    useUnifiedTopology: true ,
   useNewUrlParser: true
};


mongoose.connect('mongodb://localhost:27017/userDB',options );
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");});

const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(encrypt, { secret:process.env.SECRET, encryptedFields: ["password"] });
const User=new mongoose.model("User",userSchema);
app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/register",function(req,res){
  res.render("register");
});

app.post("/register",function(req,res){
const newuser= new User({
    email:req.body.username,
    password:req.body.password
});
newuser.save(function(err){
  if (err) {
    console.log(err);
  } else {

  }
});

});
app.post("/login",function(req,res){
  const username=req.body.username;
  const password=req.body.password;

  User.findOne({email:username},function(err,foundUser){
    if (err) {
      console.log(err);

    } else {
      if (foundUser) {
        if (foundUser.password===password) {
          res.render("secrets");
        }else {
        res.send("you have entered a wrong password");
        }
      }else {
          res.send("There is no user with such name");
      }
    }
  });

});

process
  .on('unhandledRejection', (reason, p) => {
    console.error(reason, 'Unhandled Rejection at Promise', p);
  })
  .on('uncaughtException', err => {
    console.error(err, 'Uncaught Exception thrown');
    process.exit(1);
  });



app.listen(3000,function(){
  console.log("Server is Started on Port 3000");
});
