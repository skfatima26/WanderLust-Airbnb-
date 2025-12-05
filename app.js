if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override"); 
const ejsMate = require("ejs-mate");
const ExpressError=require("./utils/ExpressError.js");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user.js')



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// const MONGO_URL = "mongodb://127.0.0.1:27017/WanderLusts";
const dbUrl = process.env.ATLAS_DB_URL;
main()
    .then(() => {
        console.log("connected to Database");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

app.engine("ejs", ejsMate); 
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600,
});

store.on('error', function(){
    console.log("Error in mongo session store",err);
});

const sessionOptions = {
    store, // mongo store related info which will be stored in sessions (mongo atlas)
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 120 * 24 * 60 * 60 * 1000,
        maxAge: 120 * 24 * 60 * 60 * 1000,
        httpOnly: true, //cross scripting attacks
      
    }
};

// app.get("/", (req, res) => {
//     res.send("Hello world");
// });



app.use(session(sessionOptions));
app.use(flash());

//For passport setup
//Passport will use implementation of session it should be after session
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Middleware for flash
app.use((req , res , next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});


app.use("/listings" , listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not Found"));
});

//Error handling 
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { message })
    // res.status(statusCode).send(message);
});
app.listen(8080, () => {
    console.log("server is listening to port 8080");
});