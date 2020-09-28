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
		$("#add_label").text(`${type} template name`);
	} else {
		$("#add_title").text(`Add new ${type.toLowerCase()}`);
		$("#add_label").text(`Region name`);
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
			$("#edit_label").text(`${type} template name`);
		} else {
			$("#edit_label").text(`Region name`);
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
	if ((duration != null && duration > 96) || (duration != null && duration < 1)) {
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
		{ id: selectedID, name: name, duration: table == "qualification" ? null : duration, notes: notes, unit: table == "health" ? null : unit },
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
			$("#confirm_title").text(`Confirm deleteion of ${data.name} template`);
			if (data.number > 0) {
				$("#disclaimer").html(
					`<strong>WARNING</strong><br>There are <strong>${data.number}</strong> employees with this ICC, deleting this template will remove it from them.<br>This can not be undone`
				);
			} else {
				$("#disclaimer").html(`<strong>WARNING</strong><br>This can not be undone`);
			}

			$("#confirm_modal").modal("show");
		} else {
			$("#confirm_title").text(`Confirm deleteion of ${data.name} region`);

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
	$("#add_nane").removeClass("is-invalid");
	var duration = $("#add_duration").val() == "" ? null : $("#add_duration").val();
	var notes = $("#add_notes").val();
	var unit = $("#add_unit").val();
	var error = false;
	if ((duration != null && duration > 96) || (duration != null && duration < 1)) {
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
	$("#start_date_error").text("This field is required");
	$("#birthday_error").text("This field is required");
	$("#industry_experience_error").text("This field is required");
	$("#first_name").removeClass("is-invalid");
	$("#last_name").removeClass("is-invalid");
	$("#email").removeClass("is-invalid");
	$("#admin").removeClass("is-invalid");
	$("#region").removeClass("is-invalid");
	$("#start_date").removeClass("is-invalid");
	$("#job_title").removeClass("is-invalid");
	$("#phonenumber").removeClass("is-invalid");
	$("#vehicle").removeClass("is-invalid");
	$("#licenceplate").removeClass("is-invalid");
	$("#birthday").removeClass("is-invalid");
	$("#industry_experience").removeClass("is-invalid");
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
	if ($("#start_date").val() == "") {
		$("#start_date").addClass("is-invalid");
		error = true;
	}
	if ($("#job_title").val() == "") {
		$("#job_title").addClass("is-invalid");
		error = true;
	}
	if ($("#birthday").val() == "") {
		$("#birthday").addClass("is-invalid");
		error = true;
	}
	var today = new Date();
	var startDate = new Date($("#start_date").val());
	if (startDate > today || startDate == "Invalid Date") {
		$("#start_date").addClass("is-invalid");
		$("#start_date_error").text("Invalid date");
		error = true;
	}
	var birthday = new Date($("#birthday").val());
	if (birthday > today || birthday == "Invalid Date") {
		$("#birthday").addClass("is-invalid");
		$("#birthday_error").text("Invalid date");
		error = true;
	}

	if (Number($("#industry_experience").val()) > 100 || Number($("#industry_experience").val()) < 0) {
		$("#industry_experience").addClass("is-invalid");
		$("#industry_experience_error").text("Number is too large to too small");
		error = true;
	}
	if (error) {
		return;
	}
	$.post("/emailexists", { email: $("#email").val() }, (data) => {
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
			var access_level = $("#admin").is(":checked") ? true : false;
			var region = $("#region").val();
			var start_date = $("#start_date").val();
			var job_title = $("#job_title").val();
			var phone_number = $("#phonenumber").val();
			var vehicle = $("#vehicle").val();
			var licenceplate = $("#licenceplate").val();
			var birthday = $("#birthday").val();
			var industry_experience = $("#industry_experience").val();
			$.post(
				"/adduser",
				{
					first_name: first_name,
					last_name: last_name,
					email: email,
					access_level: access_level,
					region: region,
					start_date: start_date,
					job_title: job_title,
					phone_number: phone_number,
					vehicle: vehicle,
					licenceplate: licenceplate,
					birthday: birthday,
					industry_experience: industry_experience,
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
