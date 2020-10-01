const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const app = express.Router();

const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/site", async (req, res) => {
	var error = req.session.error;
	req.session.error = null;
	if (req.session.user) {
		var user = req.session.user;
		return res.render("ICC/site", { name: `${user.first_name} ${user.last_name}`, error: error });
	} else {
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

module.exports = app;
