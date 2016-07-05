IF NOT EXISTS ( SELECT * FROM SecondaryIndex WHERE modelId = @modelId AND indexName = @indexName ) THEN
	INSERT INTO SecondaryIndex ( snapshotId, modelId, modelType, indexName, indexValue )
	VALUES ( @snapshotId, @modelId, @modelType, @indexName, @indexValue );
ELSE
	UPDATE SecondaryIndex
	SET IndexValue = @indexValue, snapshotId = @snapshotId
	WHERE modelId = @modelId AND modelType = @modelType AND indexName = @indexName
END IF