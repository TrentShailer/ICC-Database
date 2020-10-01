const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });

const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/admin/employees/view", async (req, res) => {
	var error = req.session.error;
	req.session.error = null;
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			return res.render("admin/view_ICCs", { error: error, name: `${req.session.employee_to_view.first_name} ${req.session.employee_to_view.last_name}` });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/site/iccs", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			var table = [];
			var user_id = req.session.employee_to_view.user_id;
			var siteSQL =
				"SELECT employee_site_inductions.id, site_templates.name, training_date, site_templates.duration, expiration_date, site_templates.notes FROM employee_site_inductions INNER JOIN site_templates ON template_id = site_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
			var siteQuery = await database.query(siteSQL, [user_id], false);
			if (siteQuery < -2) {
				req.session.error = "Failed to fetch data from server";
				return res.send({ redirect: "/admin/employees/view" });
			}
			var today = new Date();
			for (var i = 0; i < siteQuery.rows.length; i++) {
				var row = siteQuery.rows[i];
				var expired = "No";

				if (row.expiration_date) {
					if (new Date(expiration_date) < today) {
						expired = "Yes";
					}
				}
				var duration = row.duration == null ? "" : row.duration;
				var training_date = row.training_date == null ? "" : row.training_date.toISOString().substr(0, 10);
				var expiration_date = row.expiration_date == null ? "" : row.expiration_date.toISOString().substr(0, 10);
				table.push([row.name, training_date, duration, expiration_date, expired, row.notes, row.id]);
			}
			res.send({ table: table });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/product/iccs", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			var table = [];
			var user_id = req.session.employee_to_view.user_id;
			var SQL =
				"SELECT employee_product_certifications.id, product_templates.name, training_date, product_templates.duration, expiration_date, product_templates.notes FROM employee_product_certifications INNER JOIN product_templates ON template_id = product_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
			var Query = await database.query(SQL, [user_id], false);
			if (Query < -2) {
				req.session.error = "Failed to fetch data from server";
				return res.send({ redirect: "/admin/employees/view" });
			} else if (Query == -1) {
				return res.send({ table: table });
			}
			var today = new Date();
			for (var i = 0; i < Query.rows.length; i++) {
				var row = Query.rows[i];
				var expired = "No";

				if (row.expiration_date) {
					if (new Date(expiration_date) < today) {
						expired = "Yes";
					}
				}
				var duration = row.duration == null ? "" : row.duration;
				var training_date = row.training_date == null ? "" : row.training_date.toISOString().substr(0, 10);
				var expiration_date = row.expiration_date == null ? "" : row.expiration_date.toISOString().substr(0, 10);
				table.push([row.name, training_date, duration, expiration_date, expired, row.notes, row.id]);
			}
			res.send({ table: table });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/health/iccs", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			var table = [];
			var user_id = req.session.employee_to_view.user_id;
			var SQL =
				"SELECT employee_health_qualifications.id, health_templates.name, training_date, health_templates.duration, expiration_date, health_templates.notes, health_templates.unit_standard FROM employee_health_qualifications INNER JOIN health_templates ON template_id = health_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
			var Query = await database.query(SQL, [user_id], false);
			if (Query < -2) {
				req.session.error = "Failed to fetch data from server";
				return res.send({ redirect: "/admin/employees/view" });
			} else if (Query == -1) {
				return res.send({ table: table });
			}
			var today = new Date();
			for (var i = 0; i < Query.rows.length; i++) {
				var row = Query.rows[i];
				var expired = "No";

				if (row.expiration_date) {
					if (new Date(expiration_date) < today) {
						expired = "Yes";
					}
				}
				var duration = row.duration == null ? "" : row.duration;
				var training_date = row.training_date == null ? "" : row.training_date.toISOString().substr(0, 10);
				var expiration_date = row.expiration_date == null ? "" : row.expiration_date.toISOString().substr(0, 10);
				var unit_standard = row.unit_standard == null ? "" : row.unit_standard;
				// TODO failed to insert unit standard on template creation
				table.push([row.name, training_date, duration, expiration_date, expired, unit_standard, row.notes, row.id]);
			}
			res.send({ table: table });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/certification/iccs", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			var table = [];
			var user_id = req.session.employee_to_view.user_id;
			var SQL =
				"SELECT employee_certifications.id, certification_templates.name, training_date, certification_templates.duration, expiration_date, certification_templates.notes FROM employee_certifications INNER JOIN certification_templates ON template_id = certification_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
			var Query = await database.query(SQL, [user_id], false);
			if (Query < -2) {
				req.session.error = "Failed to fetch data from server";
				return res.send({ redirect: "/admin/employees/view" });
			} else if (Query == -1) {
				return res.send({ table: table });
			}
			var today = new Date();
			for (var i = 0; i < Query.rows.length; i++) {
				var row = Query.rows[i];
				var expired = "No";

				if (row.expiration_date) {
					if (new Date(expiration_date) < today) {
						expired = "Yes";
					}
				}
				var duration = row.duration == null ? "" : row.duration;
				var training_date = row.training_date == null ? "" : row.training_date.toISOString().substr(0, 10);
				var expiration_date = row.expiration_date == null ? "" : row.expiration_date.toISOString().substr(0, 10);
				table.push([row.name, training_date, duration, expiration_date, expired, row.notes, row.id]);
			}
			res.send({ table: table });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/qualification/iccs", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.employee_to_view) {
			var table = [];
			var user_id = req.session.employee_to_view.user_id;
			var SQL =
				"SELECT employee_qualifications.id, qualification_templates.name, qualification_templates.notes FROM employee_qualifications INNER JOIN qualification_templates ON template_id = qualification_templates.id WHERE user_id = $1 ORDER BY qualification_templates.name ASC;";
			var Query = await database.query(SQL, [user_id], false);
			if (Query < -2) {
				req.session.error = "Failed to fetch data from server";
				return res.send({ redirect: "/admin/employees/view" });
			} else if (Query == -1) {
				return res.send({ table: table });
			}
			var today = new Date();
			for (var i = 0; i < Query.rows.length; i++) {
				var row = Query.rows[i];

				table.push([row.name, row.notes, row.id]);
			}
			res.send({ table: table });
		} else {
			req.session.error = "You must pick an employee";
			res.redirect("/admin/employees");
		}
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

module.exports = app;
