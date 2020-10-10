$("#error").modal();
function back() {
	window.location.href = "/profile";
}

$.post("/get/employee/site/iccs", { self: true }, (data) => {
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
		var html = `<tr>
		<td>${entry[0]}</td>
		<td>${entry[1]}</td>
		<td>${entry[2]}</td>

		<td>${entry[3]}</td>
		<td>${entry[4] == "Yes" ? "<p style='color: red'><b>" + entry[4] + "</b></p>" : entry[4]}</td>

		<td>${entry[5].replace(/(?:\r\n|\r|\n)/g, "<br>")}</td>
		</tr>`;
		$("#table_body").append(html);
	}
});

function filter() {
	var filter = $("#search").val().toLowerCase();
	var row = $("#table_body").children();
	for (var i = 0; i < row.length; i++) {
		var show = false;
		var cols = row.eq(i).children();
		for (var j = 0; j < 1; j++) {
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
/* eslint-disable */
