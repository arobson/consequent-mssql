SELECT TOP 1
	S.id,
	S.modelId,
	S.version,
	S.vector,
	S.ancestor,
	S.lastEventId,
	S.lastCommandId,
	S.lastCommandHandledOn,
	S.lastEventAppliedOn,
	JSON_QUERY( S.content, '$' ) as content
FROM SecondaryIndex I
JOIN <%=entity%>Snapshot S ON S.id = I.snapshotId
WHERE 
	I.modelType='<%=entity%>' AND
	I.indexName=@indexName AND
	I.indexValue=@indexValue
ORDER BY S.id COLLATE Latin1_General_BIN DESC
FOR JSON AUTO