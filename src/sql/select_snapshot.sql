SELECT TOP 1
	id,
	modelId,
	version,
	vector,
	ancestor,
	lastEventId,
	lastCommandId,
	lastCommandHandledOn,
	lastEventAppliedOn,
	JSON_QUERY( content, '$' ) AS content
FROM <%=entity%>Snapshot
WHERE modelId = @modelId
ORDER BY id COLLATE Latin1_General_BIN DESC
FOR JSON AUTO