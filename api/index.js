'use strict';
let cluster = require('cluster');
let config = require('./app_config');
let server = require('./server');
// let config = require('./app_config');

if (cluster.isMaster && config.use_cluster === true) {
	// Count machine's CPU's - This only runs when you start the server
	let cpuCount = require('os').cpus().length;
	// Create a worker for each CPU
	for (let i=0; i< cpuCount; i++) {
		cluster.fork();
	} 
} else {
	// Everything else is a worker
	server.start();
}

// If a worker dies, fork it again. 
cluster.on('exit', function (worker) {
	cluster.fork();
});