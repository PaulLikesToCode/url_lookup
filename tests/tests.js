'use strict';
/* 
This are some ideas to help validate the url is in the right format (ie, no path params, etc) before looking up or inserting into Cassandra
Make some helpful functions later, during testing
Also, need to deal with non-ascii languages. Maybe check for the pattern %..%..%..%.., in that case decodeURI? 
*/

let assert = require('assert');
let should = require('../api/node_modules/should');
let helpers = require('../api/helpers').helpers;

describe('Return only the hostname for a url', function () {
	it ('should return www.example.com from http://www.example.com:8000/path/to/nowhere', function (done) {
		let output = helpers.getHostname('www.example.com:8000/path/to/nowhere');
		(output).should.equal('www.example.com');
		console.log('output, ', output);
		done();
	});
});

describe('Check a url for a period "." ', function () {
	it ('should contain a period. If so, it will return true. If not, will return false', function (done) {
		let example_url = 'www.example.com';
		let output1 = helpers.checkForPeriod(example_url);
		(output1).should.equal(true);
		let not_url = 'example,something';
		let output2 = helpers.checkForPeriod(not_url);
		(output2).should.equal(false);
		done();
	})
});

describe('Check percent encoded uri, make sure it gets decoded', function () {
	it ('should return the decoded value', function (done) {
		let encoded_uri = 'www.p%C5%99%C3%ADklad.com';
		let decoded_uri = 'www.příklad.com';
		let output = helpers.decodeURL(encoded_uri);
		(output).should.equal(decoded_uri);
		done();
	})
});