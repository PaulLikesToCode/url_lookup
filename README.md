# url_lookup
Fun project, stack tbd


## Cassandra
Pros for Cassandra: High scalability and performance. Decentralized architecture. Excellent single-row read performance. Consistency can be configured. Several years of development, so a well worn path. Apache license. Key caching is enabled by default. 

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



