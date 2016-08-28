# url_lookup
URL Lookup provides a simple way to build and query a URL blacklist. The appliction uses Cassandra as the database, NodeJS as the API level, and provides a simple front end that can run on any web server. The following instructions are to get it running on a single computer, meaning a single instance for each part of the app, running on a different port.

## Cassandra
Pros for Cassandra: High scalability and performance. Decentralized architecture. Excellent single-row read performance. Consistency can be configured. Several years of development, so a well worn path. Apache license. Key caching is enabled by default. 

Download Cassandra (http://cassandra.apache.org/), and start Cassandra: 
```
cd/install_directory
bin/cassandra
```
Or to run in the foreground:
```
bin/cassandra -f
```

We're only using one keyspace, called urls, and a table called blacklist. Blacklist has two fields, url and ts. The primary key is url, because we need to quickly look up urls. The timestampe (ts) field isn't in use right now, but it might be a nice piece of information to collect. ts updates if a user enters a url that is already in the database. In other words, if a url already exists in the table, Insert will become Update. 

### To create the schema:
```
CREATE KEYSPACE urls WITH replication = {
	'class': 'SimpleStrategy',
	'replication': '1'
};

CREATE TABLE blacklist (
	url text PRIMARY KEY,
	ts bigint
);
```

## NodeJS
As already mentioned, the API level runs in NodeJS. Node version > 5.3 and npm version > 3.4 are recommended. If you're running locally on default ports, you can just start the server. If you change anything (IP address of Cassandra, or the Node port, for example) make your changes in app_config.js. Node is using the cluster module, which allows it to run an instance on each CPU on the machine. To turn this off, set `config.use_cluster = false;` in app_config.js. It's also using morgan for logging, which currently is going to `process.stdout`. Express is used as the http server, and the Datastax Cassandra driver is used to connect to Cassandra. 

Steps to get Node started:
```
cd api
npm install (this will get all the packages listed in package.json)
```
If you want to run in the foreground:
```
node server.js (just to see it work)
```
If you want to run in the background:
```
npm install -g forever
forever start server.js
```
A post request will insert a new url into the table, and a get request will tell you if the url is in the table or not. Both requests use the same format: `http://localhost:3000/api/v1/whatever_url`. The url can include parameters, which we just ignore. We assume that if www&#46;superscaryurl&#46;com/boo is malicious, anything on the www&#46;superscaryurl&#46;com should be on the blacklist. So we only save and lookup the FQDN. 

You can test the API from curl: `curl -X POST http://localhost:3000/api/v1/www.superscaryurl.com/boo`. 

And then check if it was saved: `curl http://localhost:3000/api/v1/www.superscaryurl.com`. 

Or check another path on the FQDN: `curl http://localhost:3000/api/v1/www.superscaryurl.com/boo/hoo`. 

## Front End
The front end is a very simple webpage with a little bit of Bootstrap (v. 3.3.7) and jQuery (v. 3.1.0). Both Bootstrap and jQuery are served by a cdn, mostly to keep the directory clean. To run in production, consider hosting these files yourself. The front end is in `static/index.html`. You can just open the file in a browser, or run a simple web server. For example, from the static directory, you can start a simple web server with `node http-server -p 8000`. Now if you go to http://127.0.0.1:8000, you'll get index.html. 

From the front end, you can send a new url to the blacklist, or check if a url is in the blacklist. It's 2 different forms, very self explainatory. 

## Future
One idea I had was to put a queue (Kafka) in between node and Cassandra. I'm not sure the use case would require it. That would be something to consider in production. 


