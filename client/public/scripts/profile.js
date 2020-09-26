$("#error").modal();
function logout() {
	window.location.href = "/logout";
}

$.post("/get/qualifications/all", (data) => {
	if (data.redirect) {
		window.location.href = data.redirect;
	}
	var table = data.table;
	$("#loading").hide();
	if (table.length == 0) {
		$("#nodata").show();
	} else {
		table.forEach((item) => {
			var html = `<tr><td>${item}</td></tr>`;
			$("#qualifications").append(html);
		});
	}
});

$.post("/get/all/required", (data) => {
	if (data.redirect) window.location.href = data.redirect;
	var result = data.result;
	for (var i = 0; i < result.length; i++) {
		var type = "";
		switch (i) {
			case 0:
				type = "Site Induction";
				break;
			case 1:
				type = "Product Certification";
				break;
			case 2:
				type = "Health and Safety Qualification";
				break;
			case 3:
				type = "Certification";
				break;
		}
		result[i].forEach((name) => {
			var html = `
			<div class="child">
				<div class="card border-primary" style="width: 18rem; border-width: 2px">
					<div class="card-body">
						<h5 class="card-title">ICC Completion Required</h5>
						<hr />
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${name}</h6>
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${type}</h6>
					</div>
				</div>
			</div>`;
			$("#required").append(html);
		});
	}
});

$.post("/get/all/expired", (data) => {
	if (data.redirect) window.location.href = data.redirect;
	var result = data.result;
	for (var i = 0; i < result.length; i++) {
		var type = "";
		switch (i) {
			case 0:
				type = "Site Induction";
				break;
			case 1:
				type = "Product Certification";
				break;
			case 2:
				type = "Health and Safety Qualification";
				break;
			case 3:
				type = "Certification";
				break;
		}
		result[i].forEach((name) => {
			var html = `
			<div class="child">
				<div class="card border-danger" style="width: 18rem; border-width: 2px">
					<div class="card-body">
						<h5 class="card-title">ICC Expired</h5>
						<hr />
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${name}</h6>
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${type}</h6>
					</div>
				</div>
			</div>`;
			$("#expired").append(html);
		});
	}
});

$.post("/get/all/expiring", (data) => {
	if (data.redirect) window.location.href = data.redirect;
	var result = data.result;
	for (var i = 0; i < result.length; i++) {
		var type = "";
		switch (i) {
			case 0:
				type = "Site Induction";
				break;
			case 1:
				type = "Product Certification";
				break;
			case 2:
				type = "Health and Safety Qualification";
				break;
			case 3:
				type = "Certification";
				break;
		}
		result[i].forEach((name) => {
			var html = `
			<div class="child">
				<div class="card border-warning" style="width: 18rem; border-width: 2px">
					<div class="card-body">
						<h5 class="card-title">ICC Expiring Soon</h5>
						<hr />
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${name}</h6>
						<h6 class="card-subtitle mb-2 text-muted" style="font-weight: 400">${type}</h6>
					</div>
				</div>
			</div>`;
			$("#expiring").append(html);
		});
	}
});
