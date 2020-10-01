const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const database = require("../utility/database.js");
const security = require("../utility/security.js");
const mailer = require("../utility/mailer.js");
const classes = require("../utility/classes.js");
const utility = require("../utility/utility.js");

app.get("/profile", async (req, res) => {
	if (req.session.user) {
		var error = req.session.error;
		req.session.error = null;
		var fullname = `${req.session.user.first_name} ${req.session.user.last_name}`;
		res.render("profile", { error: error, name: fullname, admin: req.session.user.admin_access });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.redirect("/login");
	}
});

app.post("/get/qualifications/all", async (req, res) => {
	if (req.session.user) {
		var sql = `SELECT name FROM employee_qualifications INNER JOIN qualification_templates ON template_id = qualification_templates.id WHERE user_id = $1`;
		var result = await database.query(sql, [req.session.user.user_id], true);
		var table = [];
		if (result < 1) {
			return res.send({ table: table });
		}
		var rows = result.rows;
		rows.forEach((row) => {
			table.push(row.name);
		});
		return res.send({ table: table });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.send({ redirect: "/login" });
	}
});

app.post("/get/all/required", async (req, res) => {
	if (req.session.user) {
		var sites = [];
		var products = [];
		var health = [];
		var certifications = [];

		var sql =
			"SELECT site_templates.name AS name FROM employee_site_inductions INNER JOIN site_templates ON template_id = site_templates.id WHERE user_id = $1 AND training_date IS NULL";
		var site_query = await database.query(sql, [req.session.user.user_id], true);
		if (site_query != -1) {
			site_query.rows.forEach((row) => {
				sites.push(row.name);
			});
		}

		sql =
			"SELECT product_templates.name AS name FROM employee_product_certifications INNER JOIN product_templates ON template_id = product_templates.id WHERE user_id = $1 AND training_date IS NULL";
		var product_query = await database.query(sql, [req.session.user.user_id], true);
		if (product_query != -1) {
			product_query.rows.forEach((row) => {
				products.push(row.name);
			});
		}

		sql =
			"SELECT health_templates.name AS name FROM employee_health_qualifications INNER JOIN health_templates ON template_id = health_templates.id WHERE user_id = $1 AND training_date IS NULL";
		var health_query = await database.query(sql, [req.session.user.user_id], true);
		if (health_query != -1) {
			health_query.rows.forEach((row) => {
				health.push(row.name);
			});
		}

		sql =
			"SELECT certification_templates.name AS name FROM employee_certifications INNER JOIN certification_templates ON template_id = certification_templates.id WHERE user_id = $1 AND training_date IS NULL";
		var certification_query = await database.query(sql, [req.session.user.user_id], true);
		if (certification_query != -1) {
			certification_query.rows.forEach((row) => {
				certifications.push(row.name);
			});
		}
		res.send({ result: [sites, products, health, certifications] });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.send({ redirect: "/login" });
	}
});

app.post("/get/all/expired", async (req, res) => {
	if (req.session.user) {
		var sites = [];
		var products = [];
		var health = [];
		var certifications = [];

		var sql =
			"SELECT site_templates.name AS name FROM employee_site_inductions INNER JOIN site_templates ON template_id = site_templates.id WHERE user_id = $1 AND expiration_date < NOW()";
		var site_query = await database.query(sql, [req.session.user.user_id], true);
		if (site_query != -1) {
			site_query.rows.forEach((row) => {
				sites.push(row.name);
			});
		}

		sql =
			"SELECT product_templates.name AS name FROM employee_product_certifications INNER JOIN product_templates ON template_id = product_templates.id WHERE user_id = $1 AND expiration_date < NOW()";
		var product_query = await database.query(sql, [req.session.user.user_id], true);
		if (product_query != -1) {
			product_query.rows.forEach((row) => {
				products.push(row.name);
			});
		}

		sql =
			"SELECT health_templates.name AS name FROM employee_health_qualifications INNER JOIN health_templates ON template_id = health_templates.id WHERE user_id = $1 AND expiration_date < NOW()";
		var health_query = await database.query(sql, [req.session.user.user_id], true);
		if (health_query != -1) {
			health_query.rows.forEach((row) => {
				health.push(row.name);
			});
		}

		sql =
			"SELECT certification_templates.name AS name FROM employee_certifications INNER JOIN certification_templates ON template_id = certification_templates.id WHERE user_id = $1 AND expiration_date < NOW()";
		var certification_query = await database.query(sql, [req.session.user.user_id], true);
		if (certification_query != -1) {
			certification_query.rows.forEach((row) => {
				certifications.push(row.name);
			});
		}
		res.send({ result: [sites, products, health, certifications] });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.send({ redirect: "/login" });
	}
});

app.post("/get/all/expiring", async (req, res) => {
	if (req.session.user) {
		var sites = [];
		var products = [];
		var health = [];
		var certifications = [];

		var sql =
			"SELECT site_templates.name AS name FROM employee_site_inductions INNER JOIN site_templates ON template_id = site_templates.id WHERE user_id = $1 AND expiration_date > NOW() AND expiration_date < NOW() + INTERVAL '90 days'";
		var site_query = await database.query(sql, [req.session.user.user_id], true);
		if (site_query != -1) {
			site_query.rows.forEach((row) => {
				sites.push(row.name);
			});
		}

		sql =
			"SELECT product_templates.name AS name FROM employee_product_certifications INNER JOIN product_templates ON template_id = product_templates.id WHERE user_id = $1 AND expiration_date > NOW() AND expiration_date < NOW() + INTERVAL '90 days'";
		var product_query = await database.query(sql, [req.session.user.user_id], true);
		if (product_query != -1) {
			product_query.rows.forEach((row) => {
				products.push(row.name);
			});
		}

		sql =
			"SELECT health_templates.name AS name FROM employee_health_qualifications INNER JOIN health_templates ON template_id = health_templates.id WHERE user_id = $1 AND expiration_date > NOW() AND expiration_date < NOW() + INTERVAL '90 days'";
		var health_query = await database.query(sql, [req.session.user.user_id], true);
		if (health_query != -1) {
			health_query.rows.forEach((row) => {
				health.push(row.name);
			});
		}

		sql =
			"SELECT certification_templates.name AS name FROM employee_certifications INNER JOIN certification_templates ON template_id = certification_templates.id WHERE user_id = $1 AND expiration_date > NOW() AND expiration_date < NOW() + INTERVAL '90 days'";
		var certification_query = await database.query(sql, [req.session.user.user_id], true);
		if (certification_query != -1) {
			certification_query.rows.forEach((row) => {
				certifications.push(row.name);
			});
		}
		res.send({ result: [sites, products, health, certifications] });
	} else {
		req.session.error = "You have been logged out due to inactivity, please login in again";
		return res.send({ redirect: "/login" });
	}
});

module.exports = app;
