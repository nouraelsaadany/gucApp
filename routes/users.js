var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var multer = require('multer');
var crypto = require('crypto');
var User = require('../models/user');
var path = require('path');
var Project= require('../models/project');


/**
 * Multer Configurations
 */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function(req, file, cb) {
        const buf = crypto.randomBytes(48);
        cb(null, Date.now() + buf.toString('hex') + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage
});

router.use(function(req, res, next) {
	
    res.locals.currentUser = req.user;	
    next();
});

router.post('/upload', upload.single('file'),function(req,res,next){
	if( req.file != undefined){
		var image = req.file.filename;
		req.user.image = image;

		req.user.save(function(err) {
        if (err) {
            next(err);
            res.render('/users/uploadProfile',{
			errors:errors
		});
            return;
        }
        console.log(req.user.image);
      
        res.redirect("/users/uploadProfile");
        	req.flash('success_msg', "Image uploaded");
       // window.alert('hi');
  //alert("image uploaded");
    });
	}

});


// Register
router.get('/users/register', function(req, res){
	res.render('register',{
		user:req.user
	});
});

// Login
router.get('/users/login', function(req, res){
	res.render('login',{
		user:req.user
	});
});


router.get('/',function(req,res,next){
	User.find().exec((err,users)=>{
		if(err){next(err);return;}
	//	project.find()exec((err,projects)=>{
		//	if(err){next(err);return;}
			res.render('index',{
			users,
			//projects
		});
			
		});
	});
	

router.get('/users/logout', function(req,res){
	req.logout();
	res.redirect('/');
});

router.get('/edit', function(req, res){
	res.render('edit');
});
router.get('/users/uploadProfile', function(req,res){
	res.render('uploadProfile',{
		user:req.user
	});
});

router.get('/projects/:username',function(req,res,next){
	User.findOne({username : req.params.username}).
	exec((err,user)=>{
		if(err){next(err);return;}
		Project.find({username: user.username}).
		exec((err,projects) => {
			res.render('portfolio',{
				user: user,
				projects: projects
			});
		});
	});
	
});

function ensureAuthenticated(req, res, next) {
if (req.isAuthenticated()) {
next();
} else {
var error = "You must be logged in to see this page.";
res.render('login',{
	error
});
}
}
router.get('/addproject', ensureAuthenticated,  function(req, res){
	res.render('addproject',{
		user:req.user
	});
});


/*router.post('/addproject',upload.single('file') ,function(req,res, next){
	var title = req.body.title;
	var url= req.body.url;
	var file = req.file;
	var username = req.user.username; 
	if(file == undefined && url == ""){
		var error='Please Submit either a URL or a file of your project!!';
		res.render('addproject',{
			error:error
		});
	}
	else
	if (title == ""){
         var error='Please write the title';
		res.render('addproject',{
			error:error
		});
	}
	
	else {
		var success_msg = 'Project added successfully.';
		var newProject = new Project({
			title: title,
			
			username: username,
			
		});
		if(url != ""){
			newProject.link=url;
		}
		if(image != undefined){
			newProject.file= req.file.filename;
		}

		newProject.save();


		res.render('addproject',{
			success_msg:success_msg
		});
	}

	

});*/
router.post('/addproject',upload.single('file') ,function(req,res, next){
	var title = req.body.title;
	var url= req.body.url;
	var file = req.file;
	var username = req.user.username; 
	if(file == undefined && url == ""){
		var error='Please Submit either a URL or a file of your project!!';
		res.render('addproject',{
			error:error
		});
	}
	else
	if (title == ""){
         var error='Please write the title';
		res.render('addproject',{
			error:error
		});
	}
	else {
		var success_msg = 'Project added successfully.';
		var newProject = new Project({
			title: title,
			username :username
		});


		if(file != undefined){
			newProject.file = file.filename;
		}

		if(url != ""){
			newProject.link = url;
		}
		newProject.save();

		console.log(newProject);

		res.render('addproject',{
			success_msg:success_msg
		});
	}
	

});
// Register User
router.post('/users/register', function(req, res){
	var name = req.body.name;
	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	 User.findOne({ username: username}, function(err, user) {
        if (err) { return next(err); }
        if (user) {
            req.flash("error", "User already exists");
            return res.redirect("/users/register");
        }

        User.findOne({ email: email }, function(err, user) {
            if (err) { return next(err); }
            if (user) {
                req.flash("error", "Email already exists");
                return res.redirect("/users/register");
            }
            var newUser = new User({
            	name: name,
                username: username,
                password: password,
                email: email,
            });
           // newUser.save(next);
            User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	
        });
    });

	/*if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({
			name: name,
			email:email,
			username: username,
			password: password
		});
*/
		
});

passport.use(new LocalStrategy(
  function(username, password, done) {
   User.getUserByUsername(username, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.get('/index',function(req,res){
	res.render('uploadProfile');
})

router.post('/users/login',
  passport.authenticate('local', {successRedirect:'/users/uploadProfile', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('uploadProfile');
  });





module.exports = router;