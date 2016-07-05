IF NOT EXISTS(SELECT name FROM sys.sysobjects  
          WHERE Name = '<%=entity%>Eventpack' AND xtype = 'U')
BEGIN
	CREATE TABLE <%=entity%>Eventpack (
		modelId			char(22)		NOT NULL,
		modelVector		varchar(4096) 	NOT NULL,
		content			varbinary(max)  NOT NULL,
		PRIMARY KEY ( modelId, modelVector )
	)
END