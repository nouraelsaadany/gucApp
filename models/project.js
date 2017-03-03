var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var ProjectSchema = mongoose.Schema({
	Title: {
		type: String,
	},
	username: {
		type: String
	},
	link: {
		type: String
	},
	image: {
		type: String
	}

});

var Project = module.exports = mongoose.model('Project', ProjectSchema);

