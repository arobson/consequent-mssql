var templates = require( "./sql" );
var when = require( "when" );
var format = require( "util" ).format;
var sql = require( "mssql" );

function createTable( connection, type ) {
	var command = templates( "create_snapshot_table", type );
	return connection.then( ( c ) => {
		var request = new sql.Request( c );
		return request.batch( command )
			.then( null, ( err ) => {
				console.error( `Creating snapshot table for ${type} failed with: ${err}` );
			} );
		} );
}

function fetch( connection, command, modelId ) {
	return connection.then( 
		( c ) => {
			var request = new sql.Request( c );
			request.input( "modelId", sql.VARCHAR, modelId );
			return request.query( command )
				.then(
					( recordSet ) => {
						return recordSet.length ? recordSet[ 0 ][ 0 ].content : null;
					},
					( err ) => {
						return null;
					}
				);
			}
	);
}

function findAncestor() {
	return when.reject( new Error( "MSSQL model stores don't support siblings or ancestry." ) );
}

function store( connection, command, modelId, vectorClock, model ) {
	return connection.then( ( c ) => {
		var prepared = new sql.PreparedStatement( c );
		prepared.input( 'id', sql.CHAR( 22 ) );
		prepared.input( 'version', sql.BIGINT );
		prepared.input( 'vector', sql.VARCHAR );
		prepared.input( 'ancestor', sql.VARCHAR );
		prepared.input( 'lastEventId', sql.CHAR( 22 ) );
		prepared.input( 'lastCommandId', sql.VARCHAR );
		prepared.input( 'lastCommandHandledOn', sql.VARCHAR );
		prepared.input( 'lastEventAppliedOn', sql.VARCHAR );
		prepared.input( 'modelId', sql.VARCHAR );
		prepared.input( 'content', sql.NVARCHAR );
		return prepared.prepare( command )
			.then( 
				() => {
					var json = JSON.stringify( model );
					return prepared.execute( {
							id: model._snapshotId,
							version: model._version,
							vector: model._vector,
							ancestor: model._ancestor || "",
							lastEventId: model._lastEventId,
							lastCommandId: model._lastCommandId || "",
							lastCommandHandledOn: model._lastCommandHandledOn,
							lastEventAppliedOn: model._lastEventAppliedOn,
							modelId: model.id,
							content: json
						} )
						.then(
							( result ) => {
								return prepared.unprepare()
									.then( 
										() => {
											return model;
										}
									);
							}
						);
				}
			);
		} );
}

module.exports = function( connection, type ) {
	var fetchSql = templates( "select_snapshot", type );
	var storeSql = templates( "insert_snapshot", type );
	createTable( connection, type );
	return {
		fetch: fetch.bind( null, connection, fetchSql ),
		findAncestor: findAncestor,
		store: store.bind( null, connection, storeSql )
	};
};
