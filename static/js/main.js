'use strict';
$(document).ready(function () {
	// TODO: Move this to a config file. 
	var api_url = "http://127.0.0.1:3000/api/v1/";

	$('#search_btn').on('click', function () {
		var url = api_url + $('#search_input').val();
		// TODO: Data validation here before sending to server, like making sure input is the form of a url.
		$.get(url, function (result) {
			console.log(result);
			$('p#search_result').text(result);
		});
	});

	$('#post_btn').on('click', function () {
		var url = api_url + $('#post_input').val();
		$.post(url)
			.done(function (result) {
				$('p#post_result').text(result);		
			})
			.fail(function (err) {
				console.log(err);
				$('p#post_result').text(err.responseText);
		});
	});
});