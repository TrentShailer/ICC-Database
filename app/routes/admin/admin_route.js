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
		var sql = "SELECT name FROM regions";
		var result = await database.query(sql, [], true);

		var names = [];
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
		var sql = "SELECT id, name FROM site_templates";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/product/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM product_templates";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/health/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM health_templates";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/certification/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM certification_templates";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/get/qualification/templates", async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var sql = "SELECT id, name FROM qualification_templates";
		SendTemplates(sql, req, res);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

async function SendTemplates(sql, req, res) {
	var result = await database.query(sql, [], false);
	var templates = [];
	if (result < 0) {
		return res.send({ templates: templates });
	}
	result.rows.forEach((row) => {
		var name = row.name;
		var id = row.id;
		templates.push({ name: name, id: id });
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
		res.send(200);
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
		res.send(200);
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
		var unit_standard = req.body.unit_standard;
		var sql = "INSERT INTO health_templates (name, duration, notes, unit_standard) VALUES ($1, $2, $3, $4)";
		var result = await database.query(sql, [name, duration, notes, unit_standard], true);
		if (result < 1) {
			req.session.error = "Failed to insert data into database";
			return res.send({ redirect: "/admin" });
		}
		res.send(200);
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
		res.send(200);
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
		res.send(200);
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

async function HandleReferences(sql1, sql2, id, req, res) {
	var result = await database.query(sql1, [id], false);
	var name_query = await database.query(sql2, [id], false);
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
		await database.query(sql, [id], false);
		sql = "DELETE FROM site_templates WHERE id = $1";
		await database.query(sql, [id], false);
		res.send(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/product/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_product_certifications WHERE template_id = $1";
		await database.query(sql, [id], false);
		sql = "DELETE FROM product_templates WHERE id = $1";
		await database.query(sql, [id], false);
		res.send(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/health/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_health_qualifications WHERE template_id = $1";
		await database.query(sql, [id], false);
		sql = "DELETE FROM health_templates WHERE id = $1";
		await database.query(sql, [id], false);
		res.send(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/certification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_certifications WHERE template_id = $1";
		await database.query(sql, [id], false);
		sql = "DELETE FROM certification_templates WHERE id = $1";
		await database.query(sql, [id], false);
		res.send(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

app.post("/delete/qualification/template", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access == true) {
		var id = req.body.id;
		var sql = "DELETE FROM employee_qualifications WHERE template_id = $1";
		await database.query(sql, [id], false);
		sql = "DELETE FROM qualification_templates WHERE id = $1";
		await database.query(sql, [id], false);
		res.send(200);
	} else {
		req.session.error = "You dont have permission to view this";
		return res.send({ redirect: "/profile" });
	}
});

module.exports = app;
