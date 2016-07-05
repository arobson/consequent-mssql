var when = require( "when" );
var rethinkdb = require( "rethinkdb" );
var modelStore = require( "./models" );
var eventStore = require( "./events" );
var sliver = require( "sliver" )();
var sql = require( "mssql" );

function createPool( config ) {
	config.server = config.host;
	var cfg = Object.assign( {
		server: "localhost",
		port: 1433,
		parseJSON: true,
		connectionTimeout: 2000,
		options: {
			abortTransactionOnError: true
		}
	}, config );
	var pool = new sql.Connection( cfg );
	var deferred = when.defer();
	
	pool.on( "connect", function() {
		pool.removeAllListeners();
		deferred.resolve( pool );
	} );

	pool.on( "error", function( error ) {
		pool.removeAllListeners();
		deferred.reject( error );
	} );
	pool.connect();
	return deferred.promise;
}

function initialize( config ) {
	var connection = createPool( config );
	return {
		model: { create: modelStore.bind( null, connection ) },
		event: { create: eventStore.bind( null, connection ) }
	}
}

module.exports = initialize;