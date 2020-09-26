const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/admin", async (req, res) => {
	if (req.session.user.admin_access == true) {
		var error = req.session.error;
		req.session.error = null;
		res.render("admin/admin", { error: error, name: fullname, admin: req.session.user.admin_access });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.redirect("/login");
	}
});

module.exports = app;
