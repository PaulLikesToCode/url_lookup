'use strict';
$(document).ready( () => {
	// TODO: Move these to a config file. 
	var api_url = "http://127.0.0.1:3000/api/v1/";

	$('#search_btn').on('click', () => {
		var url = api_url + $('#search_input').val();
		// TODO: Data validation here before sending to server, like making sure input is the form of a url.
		$.get(url, (result) => {
			console.log(result);
			$('p#search_result').text(result);
		});
	});

	$('#post_btn').on('click', () => {
		var url = api_url + $('#post_input').val();
		$.post(url, (result) => {
			console.log('post', result);
			$('p#post_result').text(result);
		})
	});


});