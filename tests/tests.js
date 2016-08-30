'use strict';

let assert = require('assert');
let should = require('../api/node_modules/should');
let helpers = require('../api/helpers').helpers;

describe('Return only the hostname for a url', () => {
	let test_items = ['http://www.example.com:8000/path', 'www.example.com:8000/path', 'https://www.example.com', 'www.example.com/path', 'www.example.com?query=string'];
	test_items.forEach(each => {
		it ('should return www.example.com from ' + each, (done) => {
			let output = helpers.getHostname(each);
			(output).should.equal('www.example.com');
			done();
		});
	})
});

describe('Check a url for a period "." ', () => {
	it ('should contain a period. If so, it will return true. If not, will return false', (done) => {
		let example_url = 'www.example.com';
		let output1 = helpers.checkForPeriod(example_url);
		(output1).should.equal(true);
		let not_url = 'example,something';
		let output2 = helpers.checkForPeriod(not_url);
		(output2).should.equal(false);
		done();
	})
});

// Although this is working, node is having trouble reading percent encoded urls. 
// TODO: Fix percent encoded issue.
describe('Check percent encoded uri, make sure it gets decoded', () => {
	it ('should return the decoded value', (done) => {
		let encoded_uri = 'www.p%C5%99%C3%ADklad.com';
		let decoded_uri = 'www.příklad.com';
		let output = helpers.decodeURL(encoded_uri);
		(output).should.equal(decoded_uri);
		done();
	})
});