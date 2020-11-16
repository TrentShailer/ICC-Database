const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
var formatISO = require("date-fns/formatISO");
const database = require("../../utility/database.js");
const security = require("../../utility/security.js");
const mailer = require("../../utility/mailer.js");
const classes = require("../../utility/classes.js");
const utility = require("../../utility/utility.js");

app.get("/admin", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var error = req.session.error;
		req.session.error = null;
		res.render("admin/admin", { error: error });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.redirect("/profile");
	}
});

app.post("/get/regions", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT name FROM regions ORDER BY name ASC";
		var result = await database.query(sql, [], true);

		var names = [];
		var ids = [];
		if (result != -1 && result != -2 && result != -3) {
			result.rows.forEach((row) => {
				var name = row.name;
				if (name.toLowerCase() != "admin") {
					names.push(name);
				}
			});
		}
		res.send({ names: names });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/site/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name, duration FROM site_templates ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/product/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name, duration FROM product_templates ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/health/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name, duration FROM health_templates ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/certification/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name, duration FROM certification_templates ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/qualification/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM qualification_templates ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/region/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM regions ORDER BY name ASC";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

async function SendTemplates(sql, req, res) {
	var result = await database.query(sql, [], true);
	var templates = [];
	if (result < 0) {
		return res.send({ templates: templates });
	}
	result.rows.forEach((row) => {
		var name = row.name;
		var id = row.id;
		var duration = row.duration == null || row.duration == undefined ? "" : row.duration;
		if (name != "admin") {
			templates.push({ name: name, id: id, duration: duration });
		}
	});
	res.send({ templates: templates });
}

app.post("/add/site/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "INSERT INTO site_templates (name, duration, notes) VALUES ($1, $2, $3)";
		var result = await database.query(sql, [name, duration, notes], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/add/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "INSERT INTO product_templates (name, duration, notes) VALUES ($1, $2, $3)";
		var result = await database.query(sql, [name, duration, notes], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/add/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var unit_standard = req.body.unit;
		var sql = "INSERT INTO health_templates (name, duration, notes, unit_standard) VALUES ($1, $2, $3, $4)";
		var result = await database.query(sql, [name, duration, notes, unit_standard], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/add/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "INSERT INTO certification_templates (name, duration, notes) VALUES ($1, $2, $3)";
		var result = await database.query(sql, [name, duration, notes], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/add/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var notes = req.body.notes;
		var sql = "INSERT INTO qualification_templates (name, notes) VALUES ($1, $2)";
		var result = await database.query(sql, [name, notes], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/add/region/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var name = req.body.name;
		var sql = "INSERT INTO regions (name) VALUES ($1)";
		var result = await database.query(sql, [name], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/site/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT id FROM employee_site_inductions WHERE template_id = $1";
		var sql2 = "SELECT name FROM site_templates WHERE id = $1";
		HandleReferences(sql1, sql2, id, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/product/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT id FROM employee_product_certifications WHERE template_id = $1";
		var sql2 = "SELECT name FROM product_templates WHERE id = $1";
		HandleReferences(sql1, sql2, id, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/health/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT id FROM employee_health_qualifications WHERE template_id = $1";
		var sql2 = "SELECT name FROM health_templates WHERE id = $1";
		HandleReferences(sql1, sql2, id, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/certification/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT id FROM employee_certifications WHERE template_id = $1";
		var sql2 = "SELECT name FROM certification_templates WHERE id = $1";
		HandleReferences(sql1, sql2, id, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/qualification/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT id FROM employee_qualifications WHERE template_id = $1";
		var sql2 = "SELECT name FROM qualification_templates WHERE id = $1";
		HandleReferences(sql1, sql2, id, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/region/templates/references", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql1 = "SELECT user_id FROM users WHERE region_id = $1";
		var sql2 = "SELECT name FROM regions WHERE id = $1";
		var result = await database.query(sql1, [id], true);
		var name_query = await database.query(sql2, [id], true);
		var name = name_query.rows[0].name;
		if (result == -1) {
			return res.send({ name: name });
		} else {
			req.session.error = "You may not delete a region with employees still assigned to it";
			return res.send({ redirect: "/admin" });
		}
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

async function HandleReferences(sql1, sql2, id, req, res) {
	var result = await database.query(sql1, [id], true);
	var name_query = await database.query(sql2, [id], true);
	var name = name_query.rows[0].name;
	var num;
	if (result == -1) {
		num = 0;
	} else {
		num = result.rows.length;
	}
	res.send({ name: name, number: num });
}

app.post("/delete/site/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_site_inductions WHERE template_id = $1";
		await database.query(sql, [id], true);
		sql = "DELETE FROM site_templates WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_product_certifications WHERE template_id = $1";
		await database.query(sql, [id], true);
		sql = "DELETE FROM product_templates WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_health_qualifications WHERE template_id = $1";
		await database.query(sql, [id], true);
		sql = "DELETE FROM health_templates WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_certifications WHERE template_id = $1";
		await database.query(sql, [id], true);
		sql = "DELETE FROM certification_templates WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_qualifications WHERE template_id = $1";
		await database.query(sql, [id], true);
		sql = "DELETE FROM qualification_templates WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});
app.post("/delete/region/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM regions WHERE id = $1";
		await database.query(sql, [id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

async function UpdateExpirations(id, duration, getSQL, updateSQL) {
	var getQuery = await database.query(getSQL, [id]);
	if (getQuery < 0) {
		return;
	}
	for (var i = 0; i < getQuery.rows.length; i++) {
		var row = getQuery.rows[i];
		var training_date = row.training_date;
		var icc_id = row.id;
		var expiration_date = getExpirationDate(duration, training_date);
		await database.query(updateSQL, [expiration_date, icc_id]);
	}
}

function getExpirationDate(duration, training_date) {
	var expiration_date = null;
	if (duration && training_date) {
		expiration_date = new Date(training_date);
		expiration_date.setMonth(expiration_date.getMonth() + Number(duration));
		expiration_date = formatISO(expiration_date, { representation: "date" });
	}
	return expiration_date;
}

app.post("/edit/site/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "UPDATE site_templates SET name = $1, duration = $2, notes = $3 WHERE id = $4";
		await database.query(sql, [name, duration, notes, id], true);

		var getSQL = "SELECT id, training_date FROM employee_site_inductions WHERE template_id = $1";
		var updateSQL = "UPDATE employee_site_inductions SET expiration_date = $1 WHERE id = $2";

		await UpdateExpirations(id, duration, getSQL, updateSQL);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "UPDATE product_templates SET name = $1, duration = $2, notes = $3 WHERE id = $4";
		await database.query(sql, [name, duration, notes, id], true);

		var getSQL = "SELECT id, training_date FROM employee_product_certifications WHERE template_id = $1";
		var updateSQL = "UPDATE employee_product_certifications SET expiration_date = $1 WHERE id = $2";

		await UpdateExpirations(id, duration, getSQL, updateSQL);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var unit = req.body.unit;
		var sql = "UPDATE health_templates SET name = $1, duration = $2, notes = $3, unit_standard = $4 WHERE id = $5";
		await database.query(sql, [name, duration, notes, unit, id], true);

		var getSQL = "SELECT id, training_date FROM employee_health_qualifications WHERE template_id = $1";
		var updateSQL = "UPDATE employee_health_qualifications SET expiration_date = $1 WHERE id = $2";

		await UpdateExpirations(id, duration, getSQL, updateSQL);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var duration = req.body.duration == "" ? null : req.body.duration;
		var notes = req.body.notes;
		var sql = "UPDATE certification_templates SET name = $1, duration = $2, notes = $3 WHERE id = $4";
		await database.query(sql, [name, duration, notes, id], true);

		var getSQL = "SELECT id, training_date FROM employee_certifications WHERE template_id = $1";
		var updateSQL = "UPDATE employee_certifications SET expiration_date = $1 WHERE id = $2";

		await UpdateExpirations(id, duration, getSQL, updateSQL);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var notes = req.body.notes;
		var sql = "UPDATE qualification_templates SET name = $1, notes = $2 WHERE id = $3";
		await database.query(sql, [name, notes, id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/edit/region/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var name = req.body.name;
		var sql = "UPDATE regions SET name = $1 WHERE id = $2";
		await database.query(sql, [name, id], true);
		res.sendStatus(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/site/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name, duration, notes FROM site_templates WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: result.rows[0].duration, notes: result.rows[0].notes, unit: "" });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name, duration, notes FROM product_templates WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: result.rows[0].duration, notes: result.rows[0].notes, unit: "" });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name, duration, notes, unit_standard FROM health_templates WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: result.rows[0].duration, notes: result.rows[0].notes, unit: result.rows[0].unit_standard });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name, duration, notes FROM certification_templates WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: result.rows[0].duration, notes: result.rows[0].notes, unit: "" });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name, notes FROM qualification_templates WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: "", notes: result.rows[0].notes, unit: "" });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/region/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "SELECT name FROM regions WHERE id = $1 ORDER BY name ASC";
		var result = await database.query(sql, [id], true);
		if (result < 0) {
			req.session.error = "Failed to get data from server";
			res.send({ redirect: "/admin" });
		}
		res.send({ name: result.rows[0].name, duration: "", notes: "", unit: "" });
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/emailexists", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		if (utility.ValidEmail(req.body.email)) {
			var row = await database.query("SELECT user_id FROM users WHERE email = $1", [req.body.email], true);
			if (row == -1) {
				res.send({ isvalid: true });
				return;
			} else {
				res.send({ isvalid: false });
				return;
			}
		} else {
			res.send({ isvalid: false });
			return;
		}
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/adduser", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var first_name = req.body.first_name;
		var last_name = req.body.last_name;
		var email = req.body.email.toLowerCase();
		var admin_access = req.body.admin_access == "true" ? true : false;
		var region = req.body.region;
		var notes = req.body.notes;
		var user_id = security.GetUUID();
		var password = security.GeneratePassword();
		var encryptedPassword = password.encryped_password;
		password = password.password;
		var region_id = await database.query("SELECT id FROM regions WHERE name = $1", [region], true);
		if (region_id < 0) {
			req.session.error = "Error adding data to database";
			return res.send({ redirect: "/admin" });
		}
		var sql = "INSERT INTO users (user_id, first_name, last_name, email, password, region_id, admin_access, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
		var user = await database.query(sql, [user_id, first_name, last_name, email, encryptedPassword, region_id.rows[0].id, admin_access, notes], true);
		if (user == -1) {
			req.session.error = "Error adding data to database";
			return res.send({ redirect: "/admin" });
		}
		mailer.SendMail(
			email,
			"ASGL ICC Database login",
			`<h3>Advanced Security Inductions, Certifications, and Competencies Database Access</h3>
			<br />
			<h3>Username: ${email}</h3>
			<h3>Password: ${password}</h3>`
		);
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to view this page";
		return res.send({ redirect: "/profile" });
	}
});

module.exports = app;
