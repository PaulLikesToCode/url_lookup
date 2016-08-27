'use strict'
var cluster = require('cluster');
var path = require('path');
var config = require('./app_config');

if (cluster.isMaster) {
	// Count machine's CPU's - This only runs when you start the server
	var cpuCount = require('os').cpus().length;
	// Create a worker for each CPU
	for (let i=0; i< cpuCount; i++) {
		cluster.fork();
	} 
} else {
	// Everything else is a worker
	var express = require('express');
	var morgan = require('morgan');
	var cassandra = require('cassandra-driver');
	var app = express();
	var cass_client = new cassandra.Client({contactPoints: config.cassandra_contactPoints, keyspace: config.cassandra_keyspace});
	// For now we're just doing this level of logging. Real app would do much more
	app.use(morgan('dev'));

	app.get('/:name', function (req, res) {
		res.send('hi there '+req.params.name);
	})
	// Host might include a port, which we have to strip because we don't need it. 
	// We don't care at all about params, but it's in the api spec. Maybe in the future. 
	app.get('/api/v1/:host/:para', function (req, res) {
		// Pass to a function here, validating hostname
		var hostname = req.params.host;
		// OK ready to query Cassandra - 
		// FIX ME: I'm not happy about those escaped quotes. It looks like Cassandra doesn't like double quotes. 
		const get_query = 'SELECT url FROM blacklist WHERE url=\''+hostname+'\'';
		const yes_message = 'Watch out, url is in darklist';
		const no_message = 'URL not found. Should be ok';
		cass_client.execute(get_query, function (err, result) {
			if (err) {
				console.log(err);
				res.send('sorry, we had an error');
			}
			if (result.rows.length) {
				res.send(yes_message);
			} else {
				res.send(no_message);
			}
		});

	});
	app.listen(3000, function() {
		console.log('app running on 3000');
	});
}

/* 
This are some ideas to help validate the url is in the right format (ie, no path params, etc) before looking up or inserting into Cassandra
Make some helpful functions later, during testing

if (hostname[hostname.length - 1] === '/' || hostname[hostname.length - 1] === '#') {
	hostname = hostname.slice(0, -1);
}
// Strip out the port. If it doesn't have one, no big deal
hostname = hostname.split(':')[0];
*/

// Replace a dead worker
cluster.on('exit', function (worker) {
	cluster.fork();
})
