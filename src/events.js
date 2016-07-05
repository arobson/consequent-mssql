var _ = require( "lodash" );
var templates = require( "./sql" );
var when = require( "when" );
var zlib = require( "zlib" );
var format = require( "util" ).format;
var sql = require( "mssql" );

function createEventTable( connection, type ) {
	var command = templates( "create_event_table", type );
	return connection.then( ( c ) => {
		var request = new sql.Request( c );
		return request.batch( command )
			.then( null, ( err ) => {
				console.error( `Creating event table for ${type} failed with: ${err}` );
			} );
		} );
}

function createPackTable( connection, type ) {
	var command = templates( "create_eventpack_table", type );
	return connection.then( ( c ) => {
		var request = new sql.Request( c );
		return request.batch( command )
			.then( null, ( err ) => {
				console.error( `Creating eventpack table for ${type} failed with: ${err}` );
			} );
		} );
}

function getEventsFor( connection, command, modelId, lastEventId ) {
	return connection.then( 
		( c ) => {
			var request = new sql.Request( c ); 
			request.input( "modelId", sql.VARCHAR, modelId );
			request.input( "lastEventId", sql.VARCHAR, lastEventId || "" );
			return request.query( command )
				.then(
					( recordSet ) => {
						return _.map( recordSet[ 0 ], "eventBody" );
					},
					( err ) => {
						console.log( err );
						return [];
					}
				);
			}
	)
	.then( ( x ) => {
		return x ? x : [];
	} );
}

function getEventPackFor( connection, command, modeld, vectorClock ) {
	return connection.then( ( c ) => {
		var prepared = new sql.PreparedStatement( c );
		prepared.input( "modelId", sql.VARCHAR );
		prepared.input( "modelVector", sql.CHAR );
		return prepared.prepare( command )
			.then( () => {
				prepared.execute( {
					modelId: modelId,
					modelVector: vectorClock
				} )
				.then(
					( recordSet ) => {
						return prepared.unprepare().then( () => {
							return recordSet[ 0 ];
						} );
					}
				);
			} );
		} );
}

function storeEvent( connection, command, modeld, event ) {	
	var prepared = new sql.PreparedStatement( connection );
	prepared.input( 'id', sql.CHAR( 22 ) );
	prepared.input( 'createdOn', sql.VARCHAR );
	prepared.input( 'modelId', sql.VARCHAR );
	prepared.input( 'modelType', sql.VARCHAR );
	prepared.input( 'commandType', sql.VARCHAR );
	prepared.input( 'commandId', sql.CHAR( 22 ) );
	prepared.input( 'createdByType', sql.VARCHAR );
	prepared.input( 'createdById', sql.VARCHAR );
	prepared.input( 'createdByVector', sql.VARCHAR );
	prepared.input( 'createdByVersion', sql.VARCHAR );
	prepared.input( 'eventBody', sql.NVARCHAR );
	return prepared.prepare( command )
		.then( () => {
			var json = JSON.stringify( event );
			return prepared.execute( {
				id: event.id,
				createdOn: event._createdOn,
				modelId: event._modelId,
				modelType: event._modelType,
				commandType: event._commandType,
				commandId: event._commandId,
				createdByType: event._createdBy,
				createdById: event._createdById,
				createdByVector: event._createdByVector,
				createdByVersion: event._createdByVersion,
				eventBody: json
			} )
			.then(
				( result ) => {
					return prepared.unprepare().then( () => {
						return event;
					} );
				}
			);
		} );
}

function storeEvents( connection, command, modeld, events ) {
	return connection.then( ( c ) => {
		var transaction = new sql.Transaction( c );
		var rolled = false;
		transaction.on( "rolledback", () => {
			rolled = true;	
		} );
		return transaction.begin()
			.then( 
				() => {
					var promises = events.map( storeEvent.bind( null, transaction, command, modeld ) );
					return when.all( promises )
						.then( 
							() => {
								return transaction.commit();
							},
							( err ) => {
								if( !rolled ) {
									return transaction.rollback();
								} else {
									throw err;
								}
							} );
				}
			);
		} );
}

function storeEventPack( connection, command, modeld, vectorClock, events ) {
	return connection.then( ( c ) => {
		var prepared = new sql.PreparedStatement( c );
		prepared.input( 'modelId', sql.CHAR );
		prepared.input( 'modelVector', sql.VARCHAR );
		prepared.input( 'content', sql.VARBINARY );
		return prepared.prepare( command )
			.then( () => {
				return when.promise( ( resolve, reject ) => {
					var json = JSON.stringify( events );
					zlib.gzip( json, function( err, bytes ) {
						if( err ) {
							reject( err );	
						} else {
							prepared.execute( {
								modelId: modelId,
								modelVector: vectorClock,
								content: bytes
							} )
							.then(
								( result ) => {
									return prepared.unprepare().then( () => {
										return events;
									} );
								}
							);
						}
					} );
				} );
			} );
		} );
}

module.exports = function( connection, type ) {
	var getEventsSql = templates( "select_events_since", type );
	var getEventPackSql = templates( "select_eventpack", type );
	var storeEventsSql = templates( "insert_event", type );
	var storeEventPackSql = templates( "insert_eventpack", type );

	createEventTable( connection, type );
	createPackTable( connection, type );

	return {
		getEventsFor: getEventsFor.bind( null, connection, getEventsSql ),
		getEventPackFor: getEventPackFor.bind( null, connection, getEventPackSql ),
		storeEvents: storeEvents.bind( null, connection, storeEventsSql ),
		storeEventPack: storeEventPack.bind( null, connection, storeEventPackSql )
	};
};
