/* eslint-disable */
$("#error").modal();
$.post("/get/selected_region", (regiondata) => {
	if (regiondata.region) {
		$("#region").empty();
		$("#region").append("<option selected>Select Region</option>");
		$.post("/get/regions", (data) => {
			var names = data.names;
			for (var i = 0; i < names.length; i++) {
				var html = `<option>${names[i]}</option>`;
				$("#region").append(html);
			}
			$("#region").val(regiondata.region);
			$("#nodata").hide();
			$("#loading").show();
			GetDataFromServer();
			if (showAddMenu) {
				addICCToggle();
			}
		});
	}
});

$("#region_modal").on("show.bs.modal", function (e) {
	$("#region").empty();
	$("#region").append("<option selected>Select Region</option>");
	$.post("/get/regions", (data) => {
		var names = data.names;
		for (var i = 0; i < names.length; i++) {
			var html = `<option>${names[i]}</option>`;
			$("#region").append(html);
		}
	});
});

function back() {
	window.location.href = "/admin";
}

$("#region_form").submit((e) => {
	e.preventDefault();
	$("#region").removeClass("is-invalid");
	if ($("#region").val() == "Select Region") {
		$("#region").addClass("is-invalid");
		return;
	}
	$("#region_modal").modal("hide");
	$("#nodata").hide();
	$("#loading").show();
	$.post("/save/selected_region", { region: $("#region").val() }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		GetDataFromServer();
		if (showAddMenu) {
			addICCToggle();
		}
	});
});

function GetDataFromServer() {
	$("#loading").show();
	$("#select").hide();
	$.post("/get/employees", { region: $("#region").val() }, (data) => {
		if (data.redirect) {
			window.location.href = data.redirect;
		} else {
			$("#table_body").empty();
			$("#loading").hide();
			var employees = data.employees;
			if (employees.length == 0) {
				$("#nodata").show();
				return;
			}

			for (var i = 0; i < employees.length; i++) {
				var employee = employees[i];
				var html = `
				<tr>
					<td>${employee.first_name} ${employee.last_name}</td>
					<td>${employee.email}</td>
					<td>${employee.notes.replace(/(?:\r\n|\r|\n)/g, "<br>")}</td>
					<td><button class="btn btn-outline-info" onclick="view('${employee.email}')">View ICCs</button></td>
					<td><button class="btn btn-outline-secondary" onclick="showRecover('${employee.email}')">Recover Password</button></td>
					<td><button class="btn btn-outline-info" onclick="edit('${employee.email}')">Edit Employee</button></td>
					<td><button class="btn btn-outline-danger" onclick="deleteEmployee('${employee.email}')">Delete Employee</button></td>
				</tr>`;
				$("#table_body").append(html);
			}
		}
	});
}
var prevEmail = "";
function edit(email) {
	prevEmail = email;
	$("#edit_region").empty();
	$("#edit_region").append("<option selected>Select Region</option>");
	$.post("/get/regions", (data) => {
		var names = data.names;
		for (var i = 0; i < names.length; i++) {
			var html = `<option>${names[i]}</option>`;
			$("#edit_region").append(html);
		}
		$("#edit_employee").modal("show");
		$.post("/get/employee", { email: email }, (data) => {
			if (data.error) {
				window.location.href = data.error;
			}
			$("#first_name").val(data.user.first_name);
			$("#last_name").val(data.user.last_name);
			$("#email").val(data.user.email);
			$("#admin").prop("checked", data.user.admin_access);
			$("#edit_region").val(data.user.region);
			$("#edit_notes").val(data.user.notes);
		});
	});
}

$("#edit_form").submit((e) => {
	e.preventDefault();

	var error = false;
	$("#email_error").text("This field is required");
	$("#first_name").removeClass("is-invalid");
	$("#last_name").removeClass("is-invalid");
	$("#email").removeClass("is-invalid");
	$("#admin").removeClass("is-invalid");
	$("#edit_region").removeClass("is-invalid");
	if ($("#edit_region").val() == "Select Region") {
		$("#edit_region").addClass("is-invalid");
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
		var email = $("#email").val();

		if (data.redirect) window.location.href = data.redirect;
		if (email.toLowerCase() != prevEmail.toLowerCase()) {
			if (data.isvalid != true) {
				$("#email_error").text("A user already exists with this email");
				$("#email").addClass("is-invalid");
				error = true;
			}
			if (error) {
				return;
			}
		}
		var first_name = $("#first_name").val();
		var last_name = $("#last_name").val();
		var admin_access = $("#admin").is(":checked") ? true : false;
		var region = $("#edit_region").val();
		var notes = $("#edit_notes").val();
		$.post(
			"/edit/employee",
			{
				first_name: first_name,
				last_name: last_name,
				email: email,
				admin_access: admin_access,
				region: region,
				notes: notes,
				prevEmail: prevEmail,
			},
			(data) => {
				if (data.redirect) {
					window.location.href = data.redirect;
				} else {
					$("#edit_employee").modal("hide");
					$("#success").modal("show");
					GetDataFromServer();
					clearForm();
				}
			}
		);
	});
});
function filter() {
	var filter = $("#search").val().toLowerCase();
	var row = $("#table_body").children();
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
var emailToRecover;
function recoverpassword() {
	$.post("/recover", { email: emailToRecover }, (data) => {
		if (data.redirect) {
			window.location.href = data.redirect;
		}
		$("#success").modal("show");
	});
}
function showRecover(email) {
	emailToRecover = email;
	$("#recoverconfirm").modal("show");
}
var emailToDelete = "";
function deleteEmployee(email) {
	emailToDelete = email;
	$("#confirm").modal("show");
}

function confirm() {
	$("#confirm").modal("hide");
	$.post("/delete/employee", { email: emailToDelete }, (data) => {
		if (data.error) {
			window.location.href = data.error;
		}
		$("#success").modal("show");
		GetDataFromServer();
	});
}
function clearForm() {
	$("#first_name").val("");
	$("#last_name").val("");
	$("#email").val("");
	$("#admin").prop("checked", false);
	$("#edit_region").val("Select Region");
	$("#edit_notes").val("");
}

function view(email) {
	$.post("/set/employee_to_view", { email: email }, (data) => {
		if (data.error) {
			window.location.href = data.error;
		}
		window.location.href = `/admin/employees/view`;
	});
}
var showAddMenu = false;
function addICCToggle() {
	showAddMenu = false;
	if ($("#region").val() != "" && $("#region").val() != "Select Region") {
		$("#icc_modal").modal("show");
		$("#icc_table_body").empty();
		$.post("/get/employees", { region: $("#region").val() }, (data) => {
			if (data.redirect) window.location.href = data.redirect;
			var employees = data.employees;
			for (var i = 0; i < employees.length; i++) {
				var employee = employees[i];
				var html = `
				<tr>
					<td>${employee.first_name} ${employee.last_name}</td>
					<td>
						<div class="form-check">
							<input id="email${i}"  data-email="${employee.email}" style="width: 1rem; height: 1rem" class="form-check-input" type="checkbox" />
						</div>
					</td>
				</tr>
				`;
				$("#icc_table_body").append(html);
			}
		});
	} else {
		showAddMenu = true;
		$("#region_modal").modal("show");
	}
}
var type = "";
function showiccs() {
	if ($("#type").val() != "Select ICC Type") {
		$("#icc_group").show();
		$("#icc_title").text($("#type").val());
		$("#icc").empty();
		$("#training_group").show();
		switch ($("#type").val()) {
			case "Site Induction":
				type = "site";
				break;

			case "Product Certification":
				type = "product";
				break;

			case "Health and Safety Qualification":
				type = "health";
				break;

			case "General Certification":
				type = "certification";
				break;

			case "Qualification":
				type = "qualification";
				$("#training_group").hide();
				break;
		}
		$("#icc").append("<option selected>Select ICC</option>");
		$.post(`/get/${type}/templates`, (data) => {
			if (data.redirect) window.location.href = data.redirect;
			var templates = data.templates;
			templates.forEach((template) => {
				var html = `<option data-duration='${template.duration}' id=${template.id}>${template.name}</option>`;
				$("#icc").append(html);
			});
			calculateExpiration();
		});
	} else {
		$("#icc_group").hide();
	}
}
$("#icc_form").submit((e) => {
	e.preventDefault();
	$("#type").removeClass("is-invalid");
	$("#icc").removeClass("is-invalid");
	$("#training_date").removeClass("is-invalid");

	var selectedtype = $("#type").val();
	var icc = $("#icc").val();
	var training_date = $("#training_date").val();
	var error = false;
	if (selectedtype == "Select ICC type") {
		error = true;
		$("#type").addClass("is-invalid");
	}
	if (icc == "Select ICC") {
		error = true;
		$("#icc").addClass("is-invalid");
	}
	var today = new Date();
	var parts = training_date.split("/");
	var isoDate = training_date == "" || training_date == null ? "" : `${parts[2]}-${parts[1]}-${parts[0]}`;
	if ((isoDate && new Date(isoDate) == "Invalid Date") || (isoDate && today < new Date(isoDate))) {
		error = true;
		$("#training_date").addClass("is-invalid");
	}
	if (error) return;
	var emails = [];
	var children = $("#icc_table_body").children();
	for (var i = 0; i < children.length; i++) {
		var checked = $(`#email${i}`).is(":checked") ? true : false;
		if (checked) {
			var email = $(`#email${i}`).data().email;
			emails.push(email);
		}
	}
	if (emails.length == 0) return;
	icc = $("#icc").children(":selected").attr("id");
	$.post(`/assign/${type}/template`, { emails: emails, icc: icc, training_date: isoDate }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#icc_modal").modal("hide");
		$("#success").modal("show");
		clearICCForm();
	});
});

function clearICCForm() {
	$("#type").val("Select ICC Type");
	$("#icc").val("Select ICC");
	$("#training_date").val("");
	$("#addAll").prop("checked", false);
	toggled = false;
	var children = $("#icc_table_body").children();
	for (var i = 0; i < children.length; i++) {
		$(`#email${i}`).prop("checked", false);
	}
	showiccs();
}
var toggled = false;
function selectAll() {
	toggled = !toggled;
	var children = $("#icc_table_body").children();
	for (var i = 0; i < children.length; i++) {
		$(`#email${i}`).prop("checked", toggled);
	}
}

function calculateExpiration() {
	var text_date = $("#training_date").val();
	var duration = $("#icc").children(":selected").data("duration");
	if (duration) {
		$("#duration").val(duration + " Months");
	} else {
		$("#duration").val("");
	}
	var prelim_expiration = getExpirationDate(duration, text_date);
	$("#expiration_date").val(prelim_expiration);
}

function getExpirationDate(duration, training_date) {
	var expiration_date = null;
	if (duration && training_date && duration != "" && training_date != "") {
		try {
			var td_parts = training_date.split("/");
			var isoDate = `${td_parts[2]}-${td_parts[1]}-${td_parts[0]}`;
			expiration_date = new Date(isoDate);
			expiration_date.setMonth(expiration_date.getMonth() + Number(duration));
			expiration_date = expiration_date.toISOString().substr(0, 10);
			var parts = expiration_date.split("-");
			expiration_date = `${parts[2]}/${parts[1]}/${parts[0]}`;
		} catch (e) {
			return null;
		}
	}
	return expiration_date;
}
