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
	$("#add_title").text(`Add new ${type} template`);
	if (table == "qualification") $("#add_form_duration").hide();
	else $("#add_form_duration").show();
	if (table == "health") $("#add_form_unit").show();
	else $("#add_form_unit").hide();
	$("#add_modal").modal("show");
}
var selectedID;
function edit(id) {}

function remove(id) {
	$("#view_modal").modal("hide");
	selectedID = id;
	$.post(`/get/${table}/templates/references`, { id: selectedID }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#confirm_title").text(`Confirm deleteion of ${data.name} template`);
		$("#disclaimer").html(
			`<strong>WARNING</strong><br>There are <strong>${data.number}</strong> employees with this ICC, deleting this template will remove it from them.<br>This can not be undone`
		);
		$("#confirm_modal").modal("show");
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
	var duration = $("#add_duration").val() == "" ? null : $("#add_duration").val();
	var notes = $("#add_notes").val();
	var unit = $("#add_unit").val();
	if ((duration != null && duration > 96) || (duration != null && duration < 1)) {
		$("#add_duration").addClass("is-invalid");
		return;
	}
	$.post(`/add/${table}/template`, { name: name, duration: table == "qualification" ? null : duration, notes: notes, unit: table == "health" ? null : unit }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
		$("#add_modal").modal("hide");
		$("#add_name").val("");
		$("#add_duration").val("");
		$("#add_notes").val("");
		$("#add_unit").val("");
		$("#success").modal("show");
	});
});
