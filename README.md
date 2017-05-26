`````````````````````
Google Drive RL Widget
`````````````````````


Connector Spec
`````````````````````
Request Token URL
	https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata https://www.googleapis.com/auth/drive.metadata.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.scripts

Access Token URL 
	https://www.googleapis.com/oauth2/v4/token

Refresh Token URL 
	https://www.googleapis.com/oauth2/v4/token
`````````````````````



ConnectorAPI Spec
`````````````````````
getfileinfo
	GET : https://www.googleapis.com/drive/v2/files/${fileID}
uploadFile
	POST : https://www.googleapis.com/upload/drive/v2/files?uploadType=multipart
getFiles
	GET : https://www.googleapis.com/drive/v2/files/${folderId}/children
  
 `````````````````````
