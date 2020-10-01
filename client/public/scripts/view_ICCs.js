/* eslint-disable */
$("#error").modal();
function back() {
	window.location.href = "/admin/employees";
}

const types = {
	site: "site",
	product: "product",
	health: "health",
	certification: "certification",
	qualification: "qualification",
};
var type = null;

function view(table) {
	$("#loading").hide();
	$("#nodata").hide();
	$("#table_head").empty();
	$("#table_body").empty();
	switch (table) {
		case "site":
			var head = `
			<th>Site Induction Name</th>
			<th>Training Date</th>
			<th>Duration</th>
			<th>Expiration Date</th>
			<th>Expired</th>
			<th>Notes</th>
			<th>Edit</th>
			<th>Delete</th>`;
			$("#table_head").append(head);
			break;
		case "product":
			var head = `
			<th>Product Certification Name</th>
			<th>Training Date</th>
			<th>Duration</th>
			<th>Expiration Date</th>
			<th>Expired</th>
			<th>Notes</th>
			<th>Edit</th>
			<th>Delete</th>`;
			$("#table_head").append(head);
			break;
		case "health":
			var head = `
			<th>Health and Safety Qualification Name</th>
			<th>Training Date</th>
			<th>Duration</th>
			<th>Expiration Date</th>
			<th>Expired</th>
			<th>Unit Standard</th>
			<th>Notes</th>
			<th>Edit</th>
			<th>Delete</th>`;
			$("#table_head").append(head);
			break;
		case "certification":
			var head = `
			<th>Certification Name</th>
			<th>Training Date</th>
			<th>Duration</th>
			<th>Expiration Date</th>
			<th>Expired</th>
			<th>Notes</th>
			<th>Edit</th>
			<th>Delete</th>`;
			$("#table_head").append(head);
			break;
		case "qualification":
			var head = `
			<th>Qualification</th>
			<th>Notes</th>
			<th>Edit</th>
			<th>Delete</th>`;
			$("#table_head").append(head);
			break;
	}
	$("#loading").show();
	$.post(`/get/employee/${table}/iccs`, (data) => {
		$("#loading").hide();
		if (data.redirect) {
			window.location.href = data.redirect;
		}
		if (data.table.length == 0) {
			$("#nodata").show();
			return;
		}
		for (var i = 0; i < data.table.length; i++) {
			var entry = data.table[i];
			var colNum = entry.length - 1;
			var html = `<tr>`;
			for (var j = 0; j < colNum; j++) {
				html += `<td>${entry[j]}</td>`;
			}
			html += `<td><button class="btn btn-outline-info" onclick="edit(${entry[colNum]})">Edit</button></td>`;
			html += `<td><button class="btn btn-outline-danger" onclick="delete(${entry[colNum]})">Delete</button></td>`;
			html += `</tr>`;
			$("#table_body").append(html);
		}
	});
}
function filter() {
	var filter = $("#search").val().toLowerCase();
	var row = $("#table_body").children();
	for (var i = 0; i < row.length; i++) {
		var show = false;
		var cols = row.eq(i).children();
		for (var j = 0; j < 2; j++) {
			var col = cols.eq(j);
			if (col.text().toLowerCase().includes(filter)) {
				show = true;
			}
		}

		if (show) {
			row.eq(i).show();
		} else {
			row.eq(i).hide();
		}
	}
}
