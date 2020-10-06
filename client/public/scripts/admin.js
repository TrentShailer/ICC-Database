/* eslint-disable */
$("#error").modal();

function back() {
	window.location.href = "/profile";
}

$("#add_employee").on("show.bs.modal", function (e) {
	$("#region").empty();
	$("#region").append("<option selected>Select Region</option>");
	$.post("/get/regions", (data) => {
		if (data.redirect) window.location.href = data.redirect;
		var results = data.names;
		for (var i = 0; i < results.length; i++) {
			var html = `<option>${results[i]}</option>`;
			$("#region").append(html);
		}
	});
});

var table = "";
var type = "";
function view(id) {
	$("#catagory_body").empty();
	switch (id) {
		case 0:
			type = "Site Induction";
			table = "site";
			break;
		case 1:
			type = "Product Certification";
			table = "product";
			break;
		case 2:
			type = "Health and Safety Qualification";
			table = "health";
			break;
		case 3:
			type = "General Certification";
			table = "certification";
			break;
		case 4:
			type = "Qualification";
			table = "qualification";
			break;
		case 5:
			type = "Region";
			table = "region";
			break;
	}
	$.post(`/get/${table}/templates`, (data) => {
		$("#loading").hide();
		ManageTemplates(data, type);
	});
}

function ManageTemplates(data, type) {
	if (data.redirect) window.location.href = data.redirect;
	var templates = data.templates;
	if (templates.length == 0) {
		$("#nodata").show();
		return showViewModal(type);
	}
	templates.forEach((template) => {
		var html = `
		<tr>
			<td>${template.name}</td>
			<td>
				<a href="#" class="text-decoration-none" onclick="edit(${template.id})">Edit</a>
			</td>
			<td>
				<a href="#" class="text-decoration-none" onclick="remove('${template.id}')">Delete</a>
			</td>
		</tr>`;
		$("#catagory_body").append(html);
	});
	showViewModal(type);
}

function showViewModal(type) {
	$("#view_modal_title").text(type);
	$("#view_modal").modal("show");
}

function add() {
	$("#view_modal").modal("hide");
	$("#loading").show();
	$("#nodata").hide();
	if (table != "region") {
		$("#add_title").text(`Add new ${type.toLowerCase()} template`);
		$("#add_label").text(`${type} Template Name`);
	} else {
		$("#add_title").text(`Add new ${type.toLowerCase()}`);
		$("#add_label").text(`Region Name`);
	}

	if (table == "qualification") $("#add_form_duration").hide();
	else $("#add_form_duration").show();

	if (table == "health") $("#add_form_unit").show();
	else $("#add_form_unit").hide();

	if (table == "region") {
		$("#add_form_duration").hide();
		$("#add_form_unit").hide();
		$("#add_form_notes").hide();
	} else {
		$("#add_form_notes").show();
	}

	$("#add_modal").modal("show");
}
var selectedID;
function edit(id) {
	$("#view_modal").modal("hide");
	selectedID = id;
	$.post(`/get/${table}/template`, { id: selectedID }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#edit_title").text(`Edit ${type}: ${data.name}`);
		$("#edit_name").val(data.name);
		$("#edit_duration").val(data.duration);
		$("#edit_notes").val(data.notes);
		$("#edit_unit").val(data.unit);

		if (table != "region") {
			$("#edit_label").text(`${type} Template Name`);
		} else {
			$("#edit_label").text(`Region Name`);
		}

		if (table == "qualification") $("#edit_form_duration").hide();
		else $("#edit_form_duration").show();

		if (table == "health") $("#edit_form_unit").show();
		else $("#edit_form_unit").hide();

		if (table == "region") {
			$("#edit_form_duration").hide();
			$("#edit_form_unit").hide();
			$("#edit_form_notes").hide();
		} else {
			$("#edit_form_notes").show();
		}

		$("#edit_modal").modal("show");
	});
}
$("#editform").submit((e) => {
	e.preventDefault();
	var name = $("#edit_name").val();
	$("#edit_duration").removeClass("is-invalid");
	$("#edit_name").removeClass("is-invalid");
	var duration = $("#edit_duration").val() == "" ? null : $("#edit_duration").val();
	var notes = $("#edit_notes").val();
	var unit = $("#edit_unit").val();
	var error = false;
	if ((duration != null && duration > 180) || (duration != null && duration < 1)) {
		$("#edit_duration").addClass("is-invalid");
		error = true;
	}
	if (name.length == 0 || name.length > 60) {
		$("#edit_name").addClass("is-invalid");
		error = true;
	}
	if (error) return;
	$.post(
		`/edit/${table}/template`,
		{ id: selectedID, name: name, duration: table == "qualification" ? null : duration, notes: notes, unit: table == "health" ? unit : null },
		(data) => {
			if (data.redirect) window.location.href = data.redirect;
			$("#edit_modal").modal("hide");
			$("#edit_name").val("");
			$("#edit_duration").val("");
			$("#edit_notes").val("");
			$("#edit_unit").val("");
			$("#success").modal("show");
		}
	);
});

function remove(id) {
	$("#view_modal").modal("hide");
	selectedID = id;
	$.post(`/get/${table}/templates/references`, { id: selectedID }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		if (table != "region") {
			$("#confirm_title").text(`Confirm Deleteion of ${data.name} Template`);
			if (data.number > 0) {
				$("#disclaimer").html(
					`<strong>WARNING</strong><br>There are <strong>${data.number}</strong> employees with this ICC, deleting this template will remove it from them.<br>This can not be undone`
				);
			} else {
				$("#disclaimer").html(`<strong>WARNING</strong><br>This can not be undone`);
			}

			$("#confirm_modal").modal("show");
		} else {
			$("#confirm_title").text(`Confirm Deleteion of ${data.name} Region`);

			$("#disclaimer").html(`<strong>WARNING</strong><br>This can not be undone`);

			$("#confirm_modal").modal("show");
		}
	});
}

function confirm() {
	$("#confirm_modal").modal("hide");
	$.post(`/delete/${table}/template`, { id: selectedID }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#success").modal("show");
	});
}

$("#addform").submit((e) => {
	e.preventDefault();
	var name = $("#add_name").val();
	$("#add_duration").removeClass("is-invalid");
	$("#add_name").removeClass("is-invalid");
	var duration = $("#add_duration").val() == "" ? null : $("#add_duration").val();
	var notes = $("#add_notes").val();
	var unit = $("#add_unit").val();
	var error = false;
	if ((duration != null && duration > 180) || (duration != null && duration < 1)) {
		$("#add_duration").addClass("is-invalid");
		error = true;
	}
	if (name.length == 0 || name.length > 60) {
		$("#add_name").addClass("is-invalid");
		error = true;
	}
	if (error) return;
	$.post(`/add/${table}/template`, { name: name, duration: duration, notes: notes, unit: unit }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#add_modal").modal("hide");
		$("#add_name").val("");
		$("#add_duration").val("");
		$("#add_notes").val("");
		$("#add_unit").val("");
		$("#success").modal("show");
	});
});

function clearForm() {
	$("#first_name").val("");
	$("#last_name").val("");
	$("#email").val("");
	$("#admin").prop("checked", false);
	$("#region").val("Select Region");
	$("#notes").val("");
}

$("#add_employee_form").submit((e) => {
	e.preventDefault();
	var error = false;
	$("#email_error").text("This field is required");
	$("#first_name").removeClass("is-invalid");
	$("#last_name").removeClass("is-invalid");
	$("#email").removeClass("is-invalid");
	$("#admin").removeClass("is-invalid");
	$("#region").removeClass("is-invalid");

	if ($("#region").val() == "Select Region") {
		$("#region").addClass("is-invalid");
		error = true;
	}
	if ($("#first_name").val() == "") {
		$("#first_name").addClass("is-invalid");
		error = true;
	}
	if ($("#last_name").val() == "") {
		$("#last_name").addClass("is-invalid");
		error = true;
	}
	if ($("#email").val() == "") {
		$("#email").addClass("is-invalid");
		error = true;
	}
	if (error) {
		return;
	}
	$.post("/emailexists", { email: $("#email").val() }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		if (data.isvalid != true) {
			$("#email_error").text("A user already exists with this email");
			$("#email").addClass("is-invalid");
			error = true;
		}
		if (error) {
			return;
		} else {
			var first_name = $("#first_name").val();
			var last_name = $("#last_name").val();
			var email = $("#email").val();
			var admin_access = $("#admin").is(":checked") ? true : false;
			var region = $("#region").val();
			var notes = $("#notes").val();
			$.post(
				"/adduser",
				{
					first_name: first_name,
					last_name: last_name,
					email: email,
					admin_access: admin_access,
					region: region,
					notes: notes,
				},
				(data) => {
					if (data.redirect) {
						clearForm();
						window.location.href = data.redirect;
					} else {
						$("#add_employee").modal("hide");
						$("#success").modal("show");
						clearForm();
					}
				}
			);
		}
	});
});

function filter() {
	var filter = $("#search").val().toLowerCase();
	var row = $("#catagory_body").children();
	for (var i = 0; i < row.length; i++) {
		var show = false;
		var cols = row.eq(i).children();
		var col = cols.eq(0);
		if (col.text().toLowerCase().includes(filter)) {
			show = true;
		}
		if (show) {
			row.eq(i).show();
		} else {
			row.eq(i).hide();
		}
	}
}
