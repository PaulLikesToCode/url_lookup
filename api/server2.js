'use strict';
let start = function () {
	let config = require('./app_config');
	let express = require('express');
	let morgan = require('morgan');
	let cassandra = require('cassandra-driver');
	let app = express();
	let helpers = require('helpers').helpers;
	let cass_client = new cassandra.Client({contactPoints: config.cassandra_contactPoints, keyspace: config.cassandra_keyspace});
	// For now we're just doing this level of logging. Real app would do much more
	app.use(morgan('dev'));
	// Allow CORS, since we don't know what domain we're interacting with. 
	// TODO: Move some of this into a middleware file. 
	app.use(function(req, res, next) {
		res.header("Access-Control-Allow-Origin", "*");
		res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
		next();
	});
	// Host might include a port, which we have to strip because we don't need it. 
	// We don't care at all about params, but it's in the api spec. Maybe in the future. 
	// So if we get www.example.com/something, the route will look like /api/v1/www.example.com/something, and all we care about is www.example.com. 
	app.get('/api/v1/:host*', (req, res) => {
		// Pass to a function here, validating hostname
		let hostname = req.params.host;
		// FIX ME: I'm not happy about those escaped quotes. It looks like Cassandra doesn't like double quotes. 
		const get_query = 'SELECT count(*) FROM blacklist WHERE url=\''+hostname+'\'';
		const yes_message = 'Watch out, url is in darklist.';
		const no_message = 'URL not found. Should be ok.';
		// OK ready to query Cassandra - 
		cass_client.execute(get_query, (err, result) => {
			if (err) {
				console.log(err);
				res.send(api_error_message);
			}
			if (result.rows[0].count > 0) {
				res.send(yes_message);
			} else {
				res.send(no_message);
			}
		});

	});
	app.post('/api/v1/:url*', (req, res) => {
		// When should we send this? 
		const thanks_message = 'Thank you for updating the blacklist';
		const problem_message = 'The URL you send seems to have a problem.';
		// 
		let url_ok = true;
		// Grab the hostname
		let url = req.params.url;
		// Run the url through some tests. Make sure basic formatting is all there. 
		// First decode any encoding
		url = helpers.decodeURL(url);
		// now make sure all we have is actually the hostname, no protocol, 
		hostname = helpers.getHostname(url);
		// Now check if it's obviously not a real url (ie has no period)
		url_ok = helpers.checkForPeriod(hostname);
		// More testing needed here? 
		
		// Send back a problem message if needed. 
		if (url_ok === false) {
			// Just close the connection
			// Improve this logic at some point. Maybe send back a different http status, rather than setting res.set('Connection', 'close')?
			res.set('Connection', 'close');
			res.send(problem_message);
		} else {
			const insert_query = 'INSERT INTO blacklist (url, ts) VALUES (\''+hostname+'\', toTimestamp(now()));';
			cass_client.execute(insert_query, (err, result) => {
				if (err) {
					console.log(err);
					res.send(api_error_message);
				}
				else {
					res.send(thanks_message);
				}
			});		
		}
	});
	app.listen(config.node_port, function() {
		console.log('app running on '+config.node_port);
	});
}

exports.start = start;