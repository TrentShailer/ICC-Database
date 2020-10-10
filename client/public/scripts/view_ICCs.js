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

var selectedID;

function remove(id) {
	selectedID = id;
	$("#confirm_modal").modal("show");
}

function confirm() {
	if (type != null) {
		$.post(`/delete/employee/${type}/icc`, { id: selectedID }, (data) => {
			if (data.redirect) window.location.href = data.redirect;
			$("#success").modal("show");
			view(type);
		});
	}
}
$("#edit_form").submit((e) => {
	e.preventDefault();
	$("#edit_training_date").removeClass("is-invalid");
	var today = new Date();
	var training_date = $("#edit_training_date").val();
	var error = false;
	if ((training_date && new Date(training_date) == "Invalid Date") || (training_date && today < new Date(training_date))) {
		error = true;
		$("#edit_training_date").addClass("is-invalid");
	}
	if (error) return;
	var newICCID = $("#edit_icc").find(":selected").attr("id");
	$.post(`/edit/employee/${type}/icc`, { id: selectedID, icc: newICCID, training_date: training_date }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#edit_modal").modal("hide");
		$("#success").modal("show");
		view(type);
	});
});

function edit(id) {
	selectedID = id;
	var display_name;
	switch (type) {
		case "site":
			display_name = "Site Induction";
			break;
		case "product":
			display_name = "Product Certification";
			break;
		case "health":
			display_name = "Health and Safety Qualification";
			break;
		case "certification":
			display_name = "General Certification";
			break;
		case "qualification":
			display_name = "Qualification";
			break;
	}
	$("#edit_title").text(`Edit ${display_name}`);
	$("#edit_icc_title").text(`${display_name}`);
	$("#edit_icc").empty();
	if (type != "qualification") {
		$.post(`/get/employee/${type}/data`, { id: id }, (data) => {
			if (data.redirect) window.location.href = data.redirect;
			var training_date = data.training_date;
			$("#training_group").show();
			$("#edit_training_date").val(training_date);
			var template_id = data.template_id;
			$.post(`/get/${type}/templates`, (data) => {
				if (data.redirect) window.location.href = data.redirect;
				var templates = data.templates;
				templates.forEach((template) => {
					if (template.id == template_id) {
						var html = `<option selected id=${template.id}>${template.name}</option>`;
					} else {
						var html = `<option id=${template.id}>${template.name}</option>`;
					}

					$("#edit_icc").append(html);
				});
				$("#edit_modal").modal("show");
			});
		});
	} else {
		$("#training_group").hide();
		$("#edit_training_date").val("");
	}
}

function view(table) {
	$("#loading").hide();
	$("#nodata").hide();
	$("#table_head").empty();
	$("#table_body").empty();
	switch (table) {
		case "site":
			type = types.site;

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
			type = types.product;

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
			type = types.health;

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
			type = types.certification;

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
			type = types.qualification;

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
				var entryToAdd = entry[j];
				if (entry[j] == "Yes") entryToAdd = `<p style="color: red"><b>${entry[j]}</b></p>`;
				if (j == entry.length - 2) entryToAdd = entryToAdd.replace(/(?:\r\n|\r|\n)/g, "<br>");
				html += `<td >${entryToAdd}</td>`;
			}
			html += `<td><button class="btn btn-outline-info" onclick="edit(${entry[colNum]})">Edit</button></td>`;
			html += `<td><button class="btn btn-outline-danger" onclick="remove(${entry[colNum]})">Delete</button></td>`;
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
