$.post("/get/help", {}, (data) => {
	if (data.redirect) window.location.href = data.redirect;
	$("#loading").hide();
	$("#body").html(data.html);
});
function back() {
	window.location.href = "/admin";
}
function edit() {
	var text = $("#body").html();
	$("#body").html("");
	$("#preview").html(text);
	$("#edit_text").val(text);
	$("#edit_form").show();
}
function updatePreview() {
	var html = $("#edit_text").val();
	$("#preview").html(html);
}
function submit_edit() {
	$("#edit_form").hide();
	var html = $("#edit_text").val();
	$("#body").html(html);
	$("#edit_text").text("");
	$("#preview").html("");
	$.post("/edit/help", { text: html }, (data) => {
		if (data.redirect) window.location.href = data.redirect;
	});
}
function cancel() {
	$.post("/get/help", {}, (data) => {
		$("#edit_form").hide();
		$("#edit_text").text("");
		$("#preview").html("");
		if (data.redirect) window.location.href = data.redirect;
		$("#loading").hide();
		$("#body").html(data.html);
	});
}
