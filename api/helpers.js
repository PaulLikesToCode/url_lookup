'use strict';
// This is a bunch of functions that sanitize the url input data. 
let url = require('url')
let helpers = {

	// Strips the protocol, port, path, query, or anything but hostname from input
	getHostname: function (urlString) {
		let urlObj = url.parse(urlString);
		return urlObj.hostname;
	}, 
	// Makes sure there's at least one period in the url. If not, it can't be a url. 
	checkForPeriod: function (urlString) {
		return (urlString.indexOf('.') === -1) ? false : true;
	},
	// If somebody is sending us a percent encoded URI. Seems funny to put just this in helpers, but maybe this needs to expand later. 
	decodeURL: function (urlString) {	
		return decodeURI(urlString);
	}








}

exports.helpers = helpers;