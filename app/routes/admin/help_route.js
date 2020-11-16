const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const formatISO = require("date-fns/formatISO");
const fs = require("fs");
const path = require("path");

const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/admin/help", function (req, res) {
	var error = req.session.error;
	req.session.error = null;
	if (req.session.user && req.session.user.admin_access == true) {
		var admin = req.session.user.email == "admin@icc.asgl.co.nz";
		return res.render("admin/help", { error: error, admin: admin });
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/help", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var buffer = fs.readFileSync(path.join(process.cwd() + "/app/data" + "/help.txt"));
		res.send({ html: buffer.toString() });
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});
app.post("/edit/help", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var html = req.body.text;
		fs.writeFileSync(path.join(process.cwd() + "/app/data" + "/help.txt"), html);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});
module.exports = app;
