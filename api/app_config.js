var config = {};

config.cassandra_contactPoints = ['127.0.0.1'];
config.cassandra_keyspace = 'urls';
config.node_port = 3000;
config.use_cluster = true;


module.exports = config;
