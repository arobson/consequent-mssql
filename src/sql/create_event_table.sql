IF NOT EXISTS(SELECT name FROM sys.sysobjects  
          WHERE Name = '<%=entity%>Event' AND xtype = 'U')
BEGIN
	CREATE TABLE <%=entity%>Event (
		id						char(22)		PRIMARY KEY NOT NULL,
		createdOn				varchar(256)	NOT NULL,
		modelId					nvarchar(2048)	NOT NULL,
		modelType				varchar(1024)	NOT NULL,
		commandId				char(22)		NOT NULL,
		commandType				varchar(1024)	NOT NULL,
		createdByType			varchar(1024)	NOT NULL,
		createdById				varchar(4096)	NOT NULL,
		createdByVector			varchar(4096),
		createdByVersion		bigint,
		eventBody				nvarchar(max)	NOT NULL
	)
END