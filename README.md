# Consequent-MSSQL
Provides minimal support for event and actor storage adapter in MSSQL 2016 using node-mssql.

## Usage

```javascript
var consequentFn = require( "consequent" );

var mssql = require( "consequent-mssql" )( {
	host: "",
	database: "test",
	user: "",
	password: "",
	domain: ""
} );

consequentFn( {
	actorStore: mssql.actor,
	eventStore: mssql.event,
	models: "./models"
} ).then( ( consequent ) => {
	// consequent is ready and intitialized
} );
```

## To Do
 * actor snapshotting still has some problems due to JSON support being very experimental
 * test coverage