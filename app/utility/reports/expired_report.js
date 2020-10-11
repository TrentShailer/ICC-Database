const express = require("express");
const app = express.Router();
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: true });
const HTML5ToPDF = require("html5-to-pdf");
var format = require("date-fns/format");
var formatISO = require("date-fns/formatISO");
const path = require("path");
const fs = require("fs");

const database = require("../database.js");
const security = require("../security.js");
const mailer = require("../mailer.js");
const classes = require("../classes.js");
const utility = require("../utility.js");

app.post("/generate/type3/report", urlencodedParser, async (req, res) => {
	if (req.session.user && req.session.user.admin_access) {
		var start = process.hrtime();
		var now = new Date();

		var outputPath = path.join(__dirname, "output");
		var outputName = `Expired Report ${format(now, "yyyy-MM-dd hh-mm a")}.pdf`;

		var buffer = await GenerateBuffer(req);

		fs.closeSync(fs.openSync(path.join(outputPath, outputName), "w"));

		const html5ToPDF = new HTML5ToPDF({
			inputBody: buffer,
			outputPath: path.join(outputPath, outputName),
			include: [path.join(__dirname, "css", "template.css")],
			options: { printBackground: true },
		});

		await html5ToPDF.start();
		await new Promise((resolve) => setTimeout(resolve, 1000));
		await html5ToPDF.build();
		await html5ToPDF.close();

		var end = process.hrtime(start);
		var time = Math.round((end[0] * 1000000000 + end[1]) / 1000000) + "ms";

		console.log(`Expired report generated in ${time}`);
		await mailer.SendReport(req.session.user.email, "Expired Report", path.join(outputPath, outputName));
		fs.unlink(path.join(outputPath, outputName), (err) => {
			if (err) {
				throw err;
			}
		});
		res.sendStatus(200);
	} else {
		req.session.error = "You do not have permission to do this";
		return res.send({ redirect: "/profile" });
	}
});

async function GenerateBuffer(req) {
	var buffer = `
	<html>
		<head>
			<link rel="stylesheet" type="text/css" href="./template.css" />
		</head>
		<body>
			<div class="center">
				<p class="header" id="title">Expired ICCs Report</p>
			</div>
			<div class="flex justify-between" style="margin-top: -15px">
				<div>
					<p class="info">Report Generated on ${formatISO(new Date(), { representation: "date" })}</p>
				</div>
				<div>
					<p class="info">Report Type: Expired</p>
				</div>
			</div>
			<hr class="thick divider" />
			<div id="template-body">`;
	for (var i = 0; i < req.body.regions.length; i++) {
		var regionQuery = await database.query("SELECT id FROM regions WHERE name = $1", [req.body.regions[i]], true);
		var result = await GenerateRegion(regionQuery.rows[0].id, req.body.regions[i]);
		if (result != "") {
			buffer += result;
		} else {
			buffer += `<div>
			<hr class="divider" />
			<div>
				<p class="sub-header">Region - ${req.body.regions[i]}</p>
			</div>
			<div class="center">
				<p class="sub-header">No Applicable Data</p>
			</div>`;
		}
	}
	buffer += `
			</div>
		</body>
	</html>`;
	return buffer;
}

async function GenerateRegion(region_id, region_name) {
	var flag = false;
	var userQuery = await database.query("SELECT user_id, first_name, last_name FROM users WHERE region_id = $1 ORDER BY first_name ASC", [region_id]);
	var html = `
	<div>
		<hr class="divider" />
		<div>
			<p class="sub-header">Region - ${region_name}</p>
		</div>
		<div>
			<table style="width: 100%">
				<thead>
					<tr>
						<th align="left" class="sub-header">Name</th>
						<th align="left" class="sub-header">ICC</th>
						<th align="left" class="sub-header">Expiration Date</th>
					</tr>
				</thead>
				<tbody>`;
	for (var i = 0; i < userQuery.rows.length; i++) {
		var user_id = userQuery.rows[i].user_id;
		var name = `${userQuery.rows[i].first_name} ${userQuery.rows[i].last_name}`;
		var rows = await GetICCs(user_id);
		for (var j = 0; j < rows.length; j++) {
			flag = true;
			var row = rows[j];
			html += `
			<tr>
				<td>${name}</td>
				<td>${row.icc}</td>
				<td>${row.expiration_date}</td>
			</tr>`;
		}
		html += `<tr><td></td></tr>`;
	}
	html += `
				</tbody>
			</table>
		</div>
	</div>`;
	if (flag) {
		return html;
	} else {
		return "";
	}
}

async function GetICCs(user_id) {
	var rows = [];
	var siteQuery = await database.query(
		"SELECT site_templates.name AS name, expiration_date FROM employee_site_inductions INNER JOIN site_templates ON site_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(siteQuery < 0)) {
		for (var i = 0; i < siteQuery.rows.length; i++) {
			var dataRow = siteQuery.rows[i];
			if (validateRow(dataRow)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = formatISO(dataRow.expiration_date, { representation: "date" });
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var productQuery = await database.query(
		"SELECT product_templates.name AS name, expiration_date FROM employee_product_certifications INNER JOIN product_templates ON product_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(productQuery < 0)) {
		for (var i = 0; i < productQuery.rows.length; i++) {
			var dataRow = productQuery.rows[i];
			if (validateRow(dataRow)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = formatISO(dataRow.expiration_date, { representation: "date" });
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var healthQuery = await database.query(
		"SELECT health_templates.name AS name, expiration_date FROM employee_health_qualifications INNER JOIN health_templates ON health_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(healthQuery < 0)) {
		for (var i = 0; i < healthQuery.rows.length; i++) {
			var dataRow = healthQuery.rows[i];
			if (validateRow(dataRow)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = formatISO(dataRow.expiration_date, { representation: "date" });
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}

	var certificationQuery = await database.query(
		"SELECT certification_templates.name AS name, expiration_date FROM employee_certifications INNER JOIN certification_templates ON certification_templates.id = template_id WHERE user_id = $1 ORDER BY expiration_date ASC",
		[user_id]
	);
	if (!(certificationQuery < 0)) {
		for (var i = 0; i < certificationQuery.rows.length; i++) {
			var dataRow = certificationQuery.rows[i];
			if (validateRow(dataRow)) {
				var expiration_date = dataRow.expiration_date;
				if (expiration_date != "" && expiration_date != null) {
					expiration_date = formatISO(dataRow.expiration_date, { representation: "date" });
				} else {
					expiration_date = "";
				}
				rows.push({ icc: dataRow.name, expiration_date: expiration_date });
			}
		}
	}
	rows.sort((a, b) => {
		return a.expiration_date - b.expiration_date;
	});
	return rows;
}

function validateRow(row) {
	var expiration_date = row.expiration_date;

	var now = new Date();
	if (expiration_date < now) return true;

	return false;
}

module.exports = app;
