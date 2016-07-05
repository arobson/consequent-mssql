SELECT 
	modelId,
	modelVector,
	content
FROM <%=entity%>Eventpack
WHERE modelId=@modelId AND modelVector=@modelVector