INSERT INTO <%=entity%>Snapshot (
	id,
	version,
	vector,
	ancestor,
	modelId,
	lastEventId,
	lastCommandId,
	lastCommandHandledOn,
	lastEventAppliedOn,
	content
) VALUES (
	@id,
	@version,
	@vector,
	@ancestor,
	@modelId,
	@lastEventId,
	@lastCommandId,
	@lastCommandHandledOn,
	@lastEventAppliedOn,
	@content
)