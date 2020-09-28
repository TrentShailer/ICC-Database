const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/admin/employees", function (req, res) {
	var error = req.session.error;
	req.session.error = null;
	if (req.session.user && req.session.user.admin_access == true) {
		return res.render("admin/employees", { error: error });
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employees", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var employees = [];
		var region = req.body.region;
		var region_id = await database.query("Select id FROM regions WHERE name = $1", [region], false);
		if (region_id == -1 || region_id == -2) {
			req.session.error = "Failed to get region id";
			return res.send({ redirect: "/admin" });
		}
		region_id = region_id.rows[0].id;
		var result = await database.query("SELECT first_name, last_name, email FROM users WHERE region_id = $1", [region_id], false);
		if (result == -2) {
			req.session.error = "Failed to get user";
			return res.send({ error: "/admin" });
		} else if (result == -1) {
			return res.send({ employees: [] });
		}
		result.rows.forEach((row) => {
			var user = new classes.user({ first_name: row.first_name, last_name: row.last_name, email: row.email });
			employees.push(user);
		});

		res.send({ employees: employees });
	} else {
		req.session.error = "You do not have permission to view this page";
		res.send({ redirect: "/profile" });
	}
});

app.post("/recover", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var password = security.GeneratePassword();
		var encryped_password = password.encryped_password;
		password = password.password;

		await database.query("UPDATE users SET password = $1 WHERE email = $2", [encryped_password, req.body.email], true);
		mailer.SendMail(req.body.email, "ASGL ICC Database Password Reset", `<h3>New Password: ${password}</h3>`);
		res.send(200);
	} else {
		res.send({ error: "/profile" });
		return;
	}
});

module.exports = app;
