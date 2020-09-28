$("#error").modal();

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
	GetDataFromServer();
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
				var html = `<tr><td>${employee.first_name} ${employee.last_name}</td><td>${employee.email}</td><td><button class="btn btn-outline-info" onclick="view('${employee.email}')">View Inductions</button></td><td><button class="btn btn-outline-secondary" onclick="recoverpassword('${employee.email}')">Recover Password</button></td><td><button class="btn btn-outline-info" onclick="edit('${employee.email}')">Edit Employee</button></td><td><button class="btn btn-outline-danger" onclick="deleteEmployee('${employee.email}')">Delete Employee</button></td></tr>`;
				$("#table_body").append(html);
			}
		}
	});
}

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

function recoverpassword(email) {
	$.post("/recover", { email }, (data) => {
		if (data.redirect) {
			window.location.href = data.redirect;
		}
		$("#success").modal("show");
	});
}
