IF NOT EXISTS(SELECT name FROM sys.sysobjects  
          WHERE Name = '<%=entity%>Snapshot' AND xtype = 'U')
BEGIN
	CREATE TABLE <%=entity%>Snapshot (
		id							char(22)		PRIMARY KEY NOT NULL,
		version						bigint			NOT NULL,
		vector						varchar(4096)	NOT NULL,
		ancestor					varchar(4096),
		modelId						nvarchar(2048)	NOT NULL,
		lastEventId					char(22)		NOT NULL,
		lastCommandId				char(22)		NOT NULL,
		lastCommandHandledOn		varchar(256)	NOT NULL,
		lastEventAppliedOn			varchar(256)	NOT NULL,
		content						nvarchar(max)	NOT NULL
	)
END