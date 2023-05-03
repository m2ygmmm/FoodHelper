const express = require('express');
const session = require('express-session')
const hbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const localstatergy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('express-flash');
const app = express(); //app is an instance of the Express web application framework.
const path = require('path')
const moment = require('moment');
const handlebars = require('handlebars')
//Require() method to load each module required within the application 

const db = require('./config/Keys').MongoURI; //Contains the URI for connecting to a MongoDB database.
const User = require('./models/Users');
const locations = require('./models/locations');
///Require() method to load the Mongoose models for each schema required 

mongoose.connect(db, {
useNewUrlParser: true,
useUnifiedTopology: true
});
//Connects the MongoDB database using the Mongoose library.

app.use('/', express.static(path.join(__dirname, 'public')))
//Allows the use of any static file required (within the 'public' directory)

app.engine('hbs', hbs.engine({
    extname: 'hbs',
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true,
    },
}));
app.set('view engine', 'hbs');
//Declaring handlebars as the view engine for the application with .hbs as the default file extension

handlebars.registerHelper('formatDate', function(date, format){
        return moment(date).format(format)
  });
handlebars.registerHelper('allCaps', function(str) {
    return str.toUpperCase()
})
handlebars.registerHelper('ifPostcode', function(postcode, options) {
    if(postcode != "") {
      return postcode
    }
    else{
        return('Please contact first');
    }
    
  });
//Three registered helpers that are used in the views 

app.use(session({
    secret: 'igkBm1LjwE', //fix this
    resave: false,
    saveUninitialized: true
}));
//Creating session handling for the application

app.use(express.urlencoded({ extended: false}));
app.use(express.json());
//Parses any data within the body of a request including URL-encoded data and JSON data

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//Setting up flash messages amd passport authentication

passport.serializeUser(function (user, done){
    done(null, user.id);
});

passport.deserializeUser(function (id, done){
    User.findById(id, function(err, user){
        done(err, user);
    });
});
//Methods to serialize and deserialize user objects for Passport.

passport.use(new localstatergy({passReqToCallback: true,},
(function (req, username, password, done){
    User.findOne({ username: username}, function (err, user){
        if(err) 
            return done(err); 
        if (!user)
         return done(null, false, req.flash('error', 'Incorrect email and/or password'));

        bcrypt.compare(password, user.password, function (err, res) {
            if( err)
             return done(err)
            if (res === false ) return done(null, false, req.flash('error', 'Incorrect email and/or password'));
            
            return done(null, user);
        });
    });
})))
//Configuring PassportJs to authenticate users with an username and password

app.get('/register', (req,res) => {
    const errors = req.flash().error || [];
    res.render('register', {title: 'register', errors})
})
//GET Register method / route to render the register page with any errors

app.post('/register', async(req, res) => {

    const {fname, lname, email, password, passwordCheck,organizationName } = req.body;
    
	const exists = await User.exists({ username: email });
    const errors = req.flash().error || [];
    let msg = '';
    let userExits;
    if(exists){
         msg = 'User already exists with this email';
         userExits = true;
    }

	if (password != passwordCheck || password.length < 6 || userExits == true) {
        
        if(userExits != true){
            msg = 'Please fill in the form correctly to proceed'
        }
        req.flash('error', msg) 
        res.redirect('/register?validationFail=true');
        return;
	};
    
   
    if(password == passwordCheck){
	bcrypt.genSalt(10, function (err, salt) {
		if (err) return next(err);
		bcrypt.hash(password, salt, function (err, hash) {
			if (err) return next(err);
			
			const newUser = new User({
                fname: fname,
                lname: lname,
				username: email,
				password: hash,
                organizationName: organizationName
			});

			newUser.save();
            res.redirect('/dashboard');
            
		});
	});

}

});
//POST Register method / route which handles the form data within the body of the request to create and account. If the form validation
//succeeds, the password will be hashed and stored in the database along with the other user information

function isLoggedIn( req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/login');
}
function isLoggedOut( req, res, next) {
    if (!req.isAuthenticated()) return next();
    res.redirect('/');
}
//Middleware functions that calls the isAuthenticated() method that will verify if a user is authenticated or not and is subsequently
//used to authenticate users

app.get('/', async (req, res) => {
    const locationsDB = await locations.find();
    res.render("index", { title: "Home" , locationsDB: locationsDB})
});
//GET '/' method / route which renders the home page 

app.get('/add', isLoggedIn,  (req, res) => {
    res.render("add", { title: 'New Location'})
});
//GET add method / route which renders the add page. Can only be accesed if the user is logged in.

app.post('/map', async (req, res) => {
    const locationDB = await locations.find();
    res.send(locationDB)
});
//POST map method / route which sends the queried location data within the repsonse s

app.post('/added', async (req, res) => {
    const documentCount = await locations.countDocuments();
    const {locationName, locationType, check, postcode, Number, lat, lon, descriptionBox} = req.body
    var Website = req.body.websiteURL
    var newWebsite = 'http://' + Website
    const newLocation = new locations({
        location: {
            type: 'Point',
            coordinates: [lat, lon]
        },
        locationName: locationName,
        type: locationType,
        number: Number,
        served: check,
        websiteURL: newWebsite,
        postcode: postcode,
        lat: lat,
        lon: lon,
        SubmittedBy: req.user.username,
        codeNum: documentCount,
        descriptionBox: descriptionBox
    });
    newLocation.save();
    res.redirect('/')
});
//POST added method / route which takes the form data within the body of the request and creates a new location with said data

app.post('/liked', async (req, res) => {
    const ratingType = req.body.ratingType;
    const locationDB = await locations.findOne({ codeNum: req.body.locationName})
    const click = {clickTime: new Date()};
    if(ratingType === 1){
        locations.findByIdAndUpdate( locationDB._id, 
            {$push: {likes: click}},
            {safe: true, upsert: true},
            function(err, doc) {
                if(err) throw (err);
            }
            );
    }
    else{
        locations.findByIdAndUpdate( locationDB._id, 
            {$push: {dislikes: click}},
            {safe: true, upsert: true},
                function(err, doc) {
                    if(err) throw (err);
                }
            );
    }
    res.redirect('/')
})
//POST liked method / route which takes creates a new 'rating' as the type from the body of the request and saves it into the databse
//as either a like or dislike, followed by the time it was called.

app.get('/dashboard',isLoggedIn ,async (req, res) => {
    var query = { SubmittedBy: req.user.username}
    const locationPointsByAccount = await locations.find(query)
    const errors = req.flash().error || [];
    res.render("dashboard", { title: "Dashboard", 
    userData: req.user, 
    locationData: locationPointsByAccount, 
    errors })
});
//GET dashboard method / route which renders the dashboard page, followed by the queried location data, user data and any error messages

app.post('/dashboard', isLoggedIn, async (req, res) => {
    const loggedInUsername = req.user.username;
    const exists = await User.exists({ username: req.body.username });
    let msg = '';
    if(exists){
        msg = 'Email is already in Use'
    }
    else{
        const removeEmptyObject = (object) => {
            Object.keys(object).forEach(k =>
              (object[k] && typeof object[k] === 'object') && removeEmptyObject(object[k]) ||
              (!object[k] && object[k] !== undefined) && delete object[k]
            );
            return object;
          };
          finalObject = removeEmptyObject(req.body);

          if(finalObject.password){
            var passwordNew = finalObject.password

            bcrypt.hash(passwordNew, 10, function(err, hash) {
                User.findOneAndUpdate(
                    { username: req.user.username },
                    { password: hash },
                    { new: true },
                    (err, updatedUser) => {
                      if (err) {return;}
                      msg = 'Password has been updated'
                    }
                  );
            });
          }
          for(const x in finalObject){
            delete finalObject.password 
            delete finalObject.passwordCheck 
            const updateUser = await User.findOneAndUpdate({username: loggedInUsername}, { $set: { [x]: finalObject[x]}});
            msg = 'Your details have been updated!'
          }
          const updateLocationUserNames = await locations.updateMany({SubmittedBy: loggedInUsername}, { $set: {SubmittedBy: req.body.username}})

    }
    req.flash('error', msg);
    res.redirect('/dashboard');
    return;
})
//POST dashboard method / route which allows the user to change their account info. Form data is taken in the body of the request and validated
//before being updated to the database

app.get('/login', isLoggedOut, (req, res) =>{
    const errors = req.flash().error || [];
    res.render('login', { title: "Login",  errors })
})
//GET login method / route which renders the login page with any other messages

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  //GET logout method / route which calls the logout function and returns the user to the home page

  app.get('/editLocation:id' , isLoggedIn ,async (req,res) => {
    const UrlId = req.params.id;
    const id = mongoose.Types.ObjectId(req.params.id); // Cast to ObjectId
    const locationPointsByName = await locations.findById({ _id: id })
    if(locationPointsByName.SubmittedBy === req.user.username){
        res.render('locationToEdit', { title: 'Edit Location', locationDataByName: locationPointsByName })
    }
});
//GET editLocation method / route which renders the locationToEdit page with the relevant location data, if the user has been validated

  app.post('/editLocation:id',async (req,res) => {
    const locationPointsByName = await locations.find({ _id: req.params.id })
    const removeEmptyObject = (object) => {
        Object.keys(object).forEach(k =>
          (object[k] && typeof object[k] === 'object') && removeEmptyObject(object[k]) ||
          (!object[k] && object[k] !== undefined) && delete object[k]
        );
        return object;
      };
      finalObject = removeEmptyObject(req.body);
      for(const x in finalObject){
        const updateLocation = await locations.updateMany({_id: req.params.id}, {$set: {[x]:finalObject[x]}})
      }
      res.redirect('/'+ req.params.id)
   });
//POST editLocation method / route which takes the form data from the body of the request and validates it before updating to the database

app.post('/login', passport.authenticate('local', 
{    
    successRedirect: '/dashboard',
    failureRedirect: '/login?validationFail=true',
    failureFlash: true
}))
//POST login method / route which handles the user login requests

app.post('/deleteLocation/:id', isLoggedIn, async (req,res) => {
    const UrlId = req.params.id;
    const id = mongoose.Types.ObjectId(req.params.id); // Cast to ObjectId
    const result = await locations.findOneAndDelete({ _id: id });
    res.redirect('/dashboard')
    
})
//POST deleteLocation method / route which deletes the location by ID within the URL params

app.get('/location/:id', async (req, res) => {
    const locationDataByLat = await locations.find({ _id: req.params.id})
    res.render('location', { title: locationDataByLat[0].locationName, locationDataByLat: locationDataByLat})

})
//GET location method / route which renders the location page with the location data specific to what has been queried via the URL ID

app.post('/addcomment/:id', async (req,res) => {
    const UrlId = req.params.id;
    const id = mongoose.Types.ObjectId(req.params.id); // Cast to ObjectId
    const AddComment = await locations.updateOne({ _id: id }, {
        $push: {
            commentsList: {
                CommentText: req.body.commentInput,
                DateOfComment: new Date()
            }
        }
    });
    res.redirect('/location/' + req.params.id);
})
//POST addcomment method / route which adds a comment from the body of the request into the database

app.get('/delete/:id', isLoggedIn, async (req, res) => {
    User
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(doc => {
        if(!doc) { return res.status(404).end(); }  
        return res.redirect('/');
     })
    .catch(err => next(err));    
    const deleteLocationsWithUser = await locations.deleteMany({SubmittedBy: req.user.username})
});
//GET delete method / route which deletes the user according to the ID within the the URL

app.listen(3000, () => {})
//Starts the web server and listens for incoming HTTP requests on port 3000 