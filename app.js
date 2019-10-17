//jshint esversion:6
require('dotenv').config();
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app=express();
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
secret:"my secret is secret",
resave:  false,
saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
const options={
    useUnifiedTopology: true ,
   useNewUrlParser: true

};


mongoose.connect('mongodb://localhost:27017/userDB',options );
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("we're connected!");});
mongoose.set('useCreateIndex', true);
const userSchema=new mongoose.Schema({
  email:String,
  password:String
});

userSchema.plugin(passportLocalMongoose);

const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
  res.render("home");
});
app.get("/login",function(req,res){
  res.render("login");
});
app.get("/logout",function(req,res){
  res.redirect("/login");
});
app.get("/register",function(req,res){
  res.render("register");
});
app.get("/secrets",function(req,res){
if (req.isAuthenticated()) {
  res.render("secrets");

} else {
  res.redirect("/login");
}
});
app.post("/register",function(req,res){
User.register({username:req.body.username},req.body.password,function(err,user){
  if (err) {
    console.log(err);
    res.send(err);
    res.redirect("/register");
  } else {
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});


});
app.post("/login",function(req,res){
const user= new User({
username:req.body.username,
password:  req.body.password
});
req.login(user,function(err){
if (err) {
  console.log(err);
  res.send(err);
} else {
  passport.authenticate("local")(req,res,function(){
    res.redirect("/secrets");
  });
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
