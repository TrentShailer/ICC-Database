const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const database = require("../utility/database.js");
const security = require("../utility/security.js");
const mailer = require("../utility/mailer.js");
const classes = require("../utility/classes.js");
const utility = require("../utility/utility.js");

app.get("/login", async (req, res) => {
	if (req.session.user) {
		return res.redirect("/profile");
	}
	var error = req.session.error;
	req.session.error = null;
	return res.render("login", { error: error });
});

app.post("/login", urlencodedParser, async (req, res) => {
	var email = req.body.email;
	if (utility.ValidEmail(email)) {
		var password = req.body.password;
		var result = await database.query("SELECT password FROM users WHERE email = $1", [email.toLowerCase()]);
		if (result < 0) {
			req.session.error = "Email or password incorrect";
			return res.end("/login");
		} else {
			var encryptedPassword = security.Encrypt(password);
			if (result.rows[0].password == encryptedPassword) {
				var user = await database.query("SELECT user_id, first_name, last_name, email, region_id, admin_access, notes FROM users WHERE email = $1", [email.toLowerCase()]);
				if (user < 0) {
					req.session.error = "Error getting user data";
					return res.end("/login");
				} else {
					var row = user.rows[0];
					req.session.user = new classes.user(row.user_id, row.first_name, row.last_name, row.email, row.region_id, row.admin_access, row.notes);
					return res.end("/profile");
				}
			} else {
				req.session.error = "Email or password incorrect";
				return res.end("/login");
			}
		}
	} else {
		req.session.error = "Invalid email format";
		return res.end("/login");
	}
});

module.exports = app;
