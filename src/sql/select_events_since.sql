SELECT
	id,
	createdOn,
	modelId,
	modelType,
	commandId,
	commandType,
	createdByType,
	createdById,
	createdByVector,
	createdByVersion,
	JSON_QUERY( eventBody, '$' ) as eventBody
FROM <%=entity%>Event
WHERE modelId=@modelId AND CONVERT( binary, id ) > CONVERT( binary, @lastEventId )
ORDER BY id COLLATE Latin1_General_BIN DESC
FOR JSON AUTO