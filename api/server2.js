'use strict';
let start = function () {
	let config = require('./app_config');
	let express = require('express');
	let morgan = require('morgan');
	let cassandra = require('cassandra-driver');
	let app = express();
	let helpers = require('./helpers').helpers;
	let constants = require('./constants').constants;
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
	// So if we get www.example.com:8000/something, the route will look like /api/v1/www.example.com:8000/something, and all we care about is www.example.com. 
	app.get('/api/v1/:host*', (req, res) => {
		let url = req._parsedUrl.pathname.slice(8);
		url = helpers.decodeURL(url);
		// Get rid of the protocol, if it's there
		let hostname = helpers.getHostname(url);
		const get_query = `SELECT count(*) FROM blacklist WHERE url='${hostname}'`;
		// OK ready to query Cassandra - 
		cass_client.execute(get_query, (err, result) => {
			if (err) {
				res.send(constants.api_error_message);
			}
			if (result.rows[0].count > 0) {
				res.send(constants.yes_message);
			} else {
				res.send(constants.no_message);
			}
		});

	});
	app.post('/api/v1/:url*', (req, res) => {
		// If the url doesn't pass certain checks, we won't hit the db, just return a message. 
		let url_ok = true;
		// Grab the url
		let url = req._parsedUrl.pathname.slice(8);
		// Run the url through some tests. Make sure basic formatting is all there. We could wrap this in one function. 
		// First decode any encoding
		url = helpers.decodeURL(url);
		// now make sure all we have is actually the hostname, no protocol. This also makes the string lower case
		let hostname = helpers.getHostname(url);
		// Now check if it's obviously not a real url (ie has no period)
		url_ok = helpers.checkForPeriod(hostname);
		// More testing needed here? 
		// Send back a problem message if needed. 
		// TO DO: Rewrite this in promises. This is too many nested callbacks. 
		if (url_ok === false) {
			// TO DO: Improve this logic at some point. Maybe send back a different http status, rather than setting res.set('Connection', 'close')?
			res.set('Connection', 'close');
			res.send(problem_message);
		} else {
			const insert_query = `INSERT INTO blacklist (url, created, last_updated, is_bad) VALUES ('${hostname}', toTimestamp(now()), toTimestamp(now()), 1) IF NOT EXISTS;`;
			cass_client.execute(insert_query, (err, result) => {
				if (err) {
					res.send(constants.api_error_message);
				} else {
					if (result.rows[0]['[applied]'] === false) {
						const update_query = `UPDATE blacklist SET last_updated = toTimestamp(now()) WHERE url = '${hostname}'`;
						cass_client.execute(update_query, (err, result) => {
							if (err) {
								res.send(constants.api_error_message);
							} else {
								res.send(constants.thanks_message);
							}
						});
					} else {
						res.send(constants.thanks_message);
					}
				}
			});		
		}
	});
	app.listen(config.node_port, function() {
		console.log('app running on '+config.node_port);
	});
}

exports.start = start;