IF NOT EXISTS(SELECT name FROM sys.sysobjects  
          WHERE Name = 'secondaryLookup' AND xtype = 'U')
BEGIN
	CREATE TABLE secondaryIndex (
		snapshotId				char(22)		NOT NULL,
		modelId					nvarchar(2048)	NOT NULL,
		modelType 				varchar(1024)	NOT NULL,
		indexName				varchar(1024)	NOT NULL,
		indexValue				text			NOT NULL,
		PRIMARY KEY (snapshotId, modelType, modelId, indexName, indexValue)
	)
END