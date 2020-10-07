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

app.post("/get/employee/site/iccs", urlencodedParser, async (req, res) => {
	if (req.session.user) {
		var table = [];
		if (req.body.self) {
			var user_id = req.session.user.user_id;
		} else {
			if (req.session.employee_to_view && req.session.user.admin_access == true) {
				var user_id = req.session.employee_to_view.user_id;
			} else {
				req.session.error = "You must pick an employee";
				return res.redirect("/admin/employees");
			}
		}
		var siteSQL =
			"SELECT employee_site_inductions.id, site_templates.name, training_date, site_templates.duration, expiration_date, site_templates.notes FROM employee_site_inductions INNER JOIN site_templates ON template_id = site_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
		var siteQuery = await database.query(siteSQL, [user_id], true);
		if (siteQuery < -2) {
			req.session.error = "Failed to fetch data from server";
			return res.send({ redirect: "/admin/employees/view" });
		} else if (siteQuery == -1) {
			return res.send({ table: table });
		}
		var today = new Date();
		for (var i = 0; i < siteQuery.rows.length; i++) {
			var row = siteQuery.rows[i];
			var expired = "No";

			if (row.expiration_date) {
				if (new Date(row.expiration_date) < today) {
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
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

app.post("/get/employee/product/iccs", urlencodedParser, async (req, res) => {
	if (req.session.user) {
		var table = [];
		if (req.body.self) {
			var user_id = req.session.user.user_id;
		} else {
			if (req.session.employee_to_view && req.session.user.admin_access == true) {
				var user_id = req.session.employee_to_view.user_id;
			} else {
				req.session.error = "You must pick an employee";
				return res.redirect("/admin/employees");
			}
		}
		var SQL =
			"SELECT employee_product_certifications.id, product_templates.name, training_date, product_templates.duration, expiration_date, product_templates.notes FROM employee_product_certifications INNER JOIN product_templates ON template_id = product_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
		var Query = await database.query(SQL, [user_id], true);
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
				if (new Date(row.expiration_date) < today) {
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
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

app.post("/get/employee/health/iccs", urlencodedParser, async (req, res) => {
	if (req.session.user) {
		var table = [];
		if (req.body.self) {
			var user_id = req.session.user.user_id;
		} else {
			if (req.session.employee_to_view && req.session.user.admin_access == true) {
				var user_id = req.session.employee_to_view.user_id;
			} else {
				req.session.error = "You must pick an employee";
				return res.redirect("/admin/employees");
			}
		}
		var SQL =
			"SELECT employee_health_qualifications.id, health_templates.name, training_date, health_templates.duration, expiration_date, health_templates.notes, health_templates.unit_standard FROM employee_health_qualifications INNER JOIN health_templates ON template_id = health_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
		var Query = await database.query(SQL, [user_id], true);
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
				if (new Date(row.expiration_date) < today) {
					expired = "Yes";
				}
			}
			var duration = row.duration == null ? "" : row.duration;
			var training_date = row.training_date == null ? "" : row.training_date.toISOString().substr(0, 10);
			var expiration_date = row.expiration_date == null ? "" : row.expiration_date.toISOString().substr(0, 10);
			var unit_standard = row.unit_standard == null ? "" : row.unit_standard;
			table.push([row.name, training_date, duration, expiration_date, expired, unit_standard, row.notes, row.id]);
		}
		res.send({ table: table });
	} else {
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

app.post("/get/employee/certification/iccs", urlencodedParser, async (req, res) => {
	if (req.session.user) {
		var table = [];
		if (req.body.self) {
			var user_id = req.session.user.user_id;
		} else {
			if (req.session.employee_to_view && req.session.user.admin_access == true) {
				var user_id = req.session.employee_to_view.user_id;
			} else {
				req.session.error = "You must pick an employee";
				return res.redirect("/admin/employees");
			}
		}
		var SQL =
			"SELECT employee_certifications.id, certification_templates.name, training_date, certification_templates.duration, expiration_date, certification_templates.notes FROM employee_certifications INNER JOIN certification_templates ON template_id = certification_templates.id WHERE user_id = $1 ORDER BY expiration_date ASC;";
		var Query = await database.query(SQL, [user_id], true);
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
				if (new Date(row.expiration_date) < today) {
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
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

app.post("/get/employee/qualification/iccs", urlencodedParser, async (req, res) => {
	if (req.session.user) {
		var table = [];
		if (req.body.self) {
			var user_id = req.session.user.user_id;
		} else {
			if (req.session.employee_to_view && req.session.user.admin_access == true) {
				var user_id = req.session.employee_to_view.user_id;
			} else {
				req.session.error = "You must pick an employee";
				return res.redirect("/admin/employees");
			}
		}
		var SQL =
			"SELECT employee_qualifications.id, qualification_templates.name, qualification_templates.notes FROM employee_qualifications INNER JOIN qualification_templates ON template_id = qualification_templates.id WHERE user_id = $1 ORDER BY qualification_templates.name ASC;";
		var Query = await database.query(SQL, [user_id], true);
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
		req.session.error = "You have been logged out due to inactivity";
		res.redirect("/login");
	}
});

app.post("/delete/employee/site/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "DELETE FROM employee_site_inductions WHERE id = $1";
		await database.query(sql, [req.body.id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/delete/employee/product/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "DELETE FROM employee_product_certifications WHERE id = $1";
		await database.query(sql, [req.body.id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/delete/employee/health/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "DELETE FROM employee_health_qualifications WHERE id = $1";
		await database.query(sql, [req.body.id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/delete/employee/certification/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "DELETE FROM employee_certifications WHERE id = $1";
		await database.query(sql, [req.body.id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/delete/employee/qualification/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "DELETE FROM employee_qualifications WHERE id = $1";
		await database.query(sql, [req.body.id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/site/data", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT training_date FROM employee_site_inductions WHERE id = $1";
		getICCData(req, res, sql);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/product/data", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT training_date FROM employee_product_certifications WHERE id = $1";
		getICCData(req, res, sql);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/health/data", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT training_date FROM employee_health_qualifications WHERE id = $1";
		getICCData(req, res, sql);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/get/employee/certification/data", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT training_date FROM employee_certifications WHERE id = $1";
		getICCData(req, res, sql);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

async function getICCData(req, res, sql) {
	var query = await database.query(sql, [req.body.id], true);
	if (query < 0) {
		req.session.error = "Failed to fetch ICC from server";
		return res.send({ redirect: "/admin/employees/view" });
	}
	res.send({ training_date: query.rows[0].training_date == null ? "" : new Date(query.rows[0].training_date).toISOString().substr(0, 10) });
}

app.post("/edit/employee/site/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "UPDATE employee_site_inductions SET training_date = $1, template_id = $2, expiration_date = $3 WHERE id = $4";
		var templateSQL = "SELECT duration FROM site_templates WHERE id = $1";
		handleICCEdit(req, res, sql, templateSQL);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/edit/employee/product/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "UPDATE employee_product_certifications SET training_date = $1, template_id = $2, expiration_date = $3 WHERE id = $4";
		var templateSQL = "SELECT duration FROM product_templates WHERE id = $1";
		handleICCEdit(req, res, sql, templateSQL);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/edit/employee/health/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "UPDATE employee_health_qualifications SET training_date = $1, template_id = $2, expiration_date = $3 WHERE id = $4";
		var templateSQL = "SELECT duration FROM health_templates WHERE id = $1";
		handleICCEdit(req, res, sql, templateSQL);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/edit/employee/certification/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "UPDATE employee_certifications SET training_date = $1, template_id = $2, expiration_date = $3 WHERE id = $4";
		var templateSQL = "SELECT duration FROM certification_templates WHERE id = $1";
		handleICCEdit(req, res, sql, templateSQL);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

app.post("/edit/employee/qualification/icc", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "UPDATE employee_product_certifications SET template_id = $1 WHERE id = $2";

		var id = req.body.id;
		var icc = req.body.icc;
		var query = await database.query(sql, [icc, id], true);
		if (query < 0) {
			req.session.error = "Failed to update ICC";
			return res.send({ redirect: "/admin/employees/view" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.redirect("/profile");
	}
});

async function handleICCEdit(req, res, sql, templateSQL) {
	var id = req.body.id;
	var training_date = req.body.training_date;
	var icc = req.body.icc;

	var templatequery = await database.query(templateSQL, [icc], true);
	if (templatequery < 0) {
		req.session.error = "Failed to get template from database";
		return res.send({ redirect: "/admin/employees" });
	}
	var duration = templatequery.rows[0].duration;

	var expiration_date = getExpirationDate(duration, training_date);

	var query = await database.query(sql, [training_date, icc, expiration_date, id], true);
	if (query < 0) {
		req.session.error = "Failed to update ICC";
		return res.send({ redirect: "/admin/employees/view" });
	}
	res.sendStatus(200);
}
function getExpirationDate(duration, training_date) {
	var expiration_date = null;
	if (duration && training_date) {
		expiration_date = new Date(training_date);
		expiration_date = expiration_date.setMonth(expiration_date.getMonth() + Number(duration));
		expiration_date = new Date(expiration_date).toISOString().substr(0, 10);
	}
	return expiration_date;
}
module.exports = app;
