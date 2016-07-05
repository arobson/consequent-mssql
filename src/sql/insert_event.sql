INSERT INTO <%=entity%>Event (
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
	eventBody
)
VALUES (
	@id,
	@createdOn,
	@modelId,
	@modelType,
	@commandId,
	@commandType,
	@createdByType,
	@createdById,
	@createdByVector,
	@createdByVersion,
	@eventBody
)