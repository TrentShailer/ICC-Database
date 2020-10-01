/* eslint-disable */
$("#error").modal();
$("#loginForm").submit((e) => {
	e.preventDefault();
	var email = $("#email").val();
	var password = $("#password").val();
	$.post("/login", { email: email, password: password }, (data) => {
		window.location.href = data;
	});
});
