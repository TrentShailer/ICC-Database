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

app.post("/save/selected_region", urlencodedParser, (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		req.session.selected_region = req.body.region;
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.send({ redirect: "/profile" });
	}
});

app.post("/get/selected_region", urlencodedParser, (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (req.session.selected_region) res.send({ region: req.session.selected_region });
		else res.send({ region: null });
	} else {
		req.session.error = "You do not have permission to view this page";
		res.send({ redirect: "/profile" });
	}
});

app.post("/get/employees", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var employees = [];
		var region = req.body.region;
		var region_id = await database.query("SELECT id FROM regions WHERE name = $1", [region], true);
		if (region_id == -1 || region_id == -2) {
			req.session.error = "Failed to get region id";
			return res.send({ redirect: "/admin" });
		}
		region_id = region_id.rows[0].id;
		var result = await database.query("SELECT first_name, last_name, email, notes FROM users WHERE region_id = $1 ORDER BY first_name ASC", [region_id], true);
		if (result == -2) {
			req.session.error = "Failed to get user";
			return res.send({ error: "/admin" });
		} else if (result == -1) {
			return res.send({ employees: [] });
		}
		result.rows.forEach((row) => {
			var user = new classes.user({ first_name: row.first_name, last_name: row.last_name, email: row.email, notes: row.notes == null ? "" : row.notes });
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
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		res.send({ error: "/profile" });
		return;
	}
});

app.post("/delete/employee", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT user_id FROM users WHERE email = $1";
		var email = req.body.email.toLowerCase();
		console.log(email);
		var id_query = await database.query(sql, [req.body.email.toLowerCase()], true);
		if (id_query < 0) {
			req.session.error = "Could not find user";
			return res.send({ redirect: "/admin/employees" });
		}
		var user_id = id_query.rows[0].user_id;
		sql = "DELETE FROM employee_site_inductions WHERE user_id = $1";
		await database.query(sql, [user_id], true);
		sql = "DELETE FROM employee_product_certifications WHERE user_id = $1";
		await database.query(sql, [user_id], true);
		sql = "DELETE FROM employee_health_qualifications WHERE user_id = $1";
		await database.query(sql, [user_id], true);
		sql = "DELETE FROM employee_certifications WHERE user_id = $1";
		await database.query(sql, [user_id], true);
		sql = "DELETE FROM employee_qualifications WHERE user_id = $1";
		await database.query(sql, [user_id], true);
		sql = "DELETE FROM users WHERE user_id = $1";
		await database.query(sql, [user_id], true);

		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/set/employee_to_view", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT user_id, first_name, last_name FROM users WHERE email = $1";
		var result = await database.query(sql, [req.body.email], true);
		if (result < 0) {
			req.session.error = "Could not find employee";
			return res.send({ redirect: "/admin/employees" });
		}
		req.session.employee_to_view = new classes.user({
			user_id: result.rows[0].user_id,
			first_name: result.rows[0].first_name,
			last_name: result.rows[0].last_name,
		});
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/employee", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var email = req.body.email;
		var sql = "SELECT first_name, last_name, email, admin_access, notes, regions.name AS region FROM users INNER JOIN regions ON region_id = id WHERE email = $1";
		var result = await database.query(sql, [email], true);
		if (result < 0) {
			req.session.error = "Could not find employee";
			return res.send({ redirect: "/admin/employees" });
		}
		var employee = result.rows[0];
		res.send({
			user: new classes.user({
				first_name: employee.first_name,
				last_name: employee.last_name,
				email: employee.email,
				admin_access: employee.admin_access,
				notes: employee.notes,
				region: employee.region,
			}),
		});
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/employee", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var first_name = req.body.first_name;
		var last_name = req.body.last_name;
		var email = req.body.email;
		var emailToEdit = req.body.prevEmail;
		var admin_access = req.body.admin_access;
		var region = req.body.region;
		var notes = req.body.notes;

		var region_query = await database.query("SELECT id FROM regions WHERE name = $1", [region], true);
		if (region_query < 0) {
			req.session.error = "Could not find region";
			return res.send({ redirect: "/admin/employees" });
		}

		var sql = "UPDATE users SET first_name = $1, last_name = $2, email = $3, admin_access = $4, region_id = $5, notes = $6 WHERE email = $7";
		var result = await database.query(sql, [first_name, last_name, email, admin_access, region_query.rows[0].id, notes, emailToEdit], true);
		if (result < 0) {
			req.session.error = "Could not update employee";
			return res.send({ redirect: "/admin/employees" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/assign/site/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var templateSQL = "SELECT duration FROM site_templates WHERE id = $1";
		var insertSQL = "INSERT INTO employee_site_inductions (user_id, template_id, training_date, expiration_date) VALUES ($1, $2, $3, $4)";
		handleAssigns(req, res, templateSQL, insertSQL, true);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/assign/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var templateSQL = "SELECT duration FROM product_templates WHERE id = $1";
		var insertSQL = "INSERT INTO employee_product_certifications (user_id, template_id, training_date, expiration_date) VALUES ($1, $2, $3, $4)";
		handleAssigns(req, res, templateSQL, insertSQL, true);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/assign/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var templateSQL = "SELECT duration FROM health_templates WHERE id = $1";
		var insertSQL = "INSERT INTO employee_health_qualifications (user_id, template_id, training_date, expiration_date) VALUES ($1, $2, $3, $4)";
		handleAssigns(req, res, templateSQL, insertSQL, true);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/assign/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var templateSQL = "SELECT duration FROM certification_templates WHERE id = $1";
		var insertSQL = "INSERT INTO employee_certifications (user_id, template_id, training_date, expiration_date) VALUES ($1, $2, $3, $4)";
		handleAssigns(req, res, templateSQL, insertSQL, true);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/assign/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var templateSQL = null;
		var insertSQL = "INSERT INTO employee_qualifications (user_id, template_id) VALUES ($1, $2)";
		handleAssigns(req, res, templateSQL, insertSQL, false);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

function getExpirationDate(duration, training_date) {
	var expiration_date = null;
	if (duration && training_date) {
		expiration_date = new Date(training_date);
		expiration_date.setMonth(expiration_date.getMonth() + Number(duration));
		expiration_date = formatISO(expiration_date, { representation: "date" });
	}
	return expiration_date;
}

async function handleAssigns(req, res, templateSQL, insertSQL, hasDuration) {
	var emails = req.body.emails;
	var template_id = req.body.icc;
	if (templateSQL) {
		var templatequery = await database.query(templateSQL, [template_id], true);
		if (templatequery < 0) {
			req.session.error = "Failed to get template from database";
			return res.send({ redirect: "/admin/employees" });
		}

		if (hasDuration) {
			var duration = templatequery.rows[0].duration;
			var training_date = req.body.training_date;

			var expiration_date = getExpirationDate(duration, training_date);
		}
	}

	emails.forEach(async (email) => {
		var sql = "SELECT user_id FROM users WHERE email = $1";
		var userquery = await database.query(sql, [email.toLowerCase()], true);
		if (userquery < 0) {
			return;
		}
		var user_id = userquery.rows[0].user_id;
		var params = [user_id, template_id];
		if (hasDuration) {
			params.push(training_date == "" ? null : training_date, expiration_date == "" ? null : expiration_date);
		}
		await database.query(insertSQL, params, true);
	});
	res.sendStatus(200);
}

module.exports = app;
