/*
 * util methods
 */
Utils={
		
};
Utils.showLoading = function(){
	$("#loadingDiv").show();
}
Utils.hideLoading = function(){
	$("#loadingDiv").hide();
}
Utils.successMsg = function(message){
	$('.successMsg').text(message);
	 $('.successMsg').slideDown(function() {
			$('.successMsg').delay(3000).slideUp();
			});
}
Utils.moveToolTip = function(obj){
	
	var thumbNailImg = $($(obj).find("img")[0])
	$(thumbNailImg).css({top:mousePos.getY()+15,left:mousePos.getX()+15});
	
}
Utils.RenderTemplate=function(templateId , data,callBack){
	var template = $("#"+templateId).html();
	var compiledTemplate = Handlebars.compile(template);
	var widgetsDiv =$("#contentDiv");
	widgetsDiv.html(compiledTemplate(data));
	if(callBack)
	{
		callBack();
	}
};
var Handler={
		ApiSpec:{
			getFiles : "googledriverl.googledriveconnector.getfiles",
			uploadFile: "googledriverl.googledriveconnector.uploadfile",
			getFileInfo: "googledriverl.googledriveconnector.getfileinfo"
		},
		MetaSpec:{
			folderID : "Street"
		},
		Session:{
			
		}
}
Handler.widgetInit = function(){
	Utils.showLoading();
	Handler.refreshFileList();
};
Handler.refreshFileList = function(){
	
	
	ZOHO.CRM.INTERACTION.getPageInfo()
	.then(Handler.getFolderInfo)
	.then(Handler.getFiles)
	.then(Handler.renderFileListNew)
	.then(function(data){
		var templateData = {
				files  : data
		}
		Utils.RenderTemplate("fileListing",templateData,Utils.hideLoading)
	})
}
Handler.getFolderInfo = function(pageInfo){

	/*
	 * Check for folderID
	 */
	var folderID = pageInfo.data[Handler.MetaSpec.folderID]
	Handler.Session.pageInfo = pageInfo;
	/*
	 * CreateFolder if no folderID is present in the record
	 */
	if(!folderID){
		return Handler.createFolder(pageInfo)
	}
	else{
		Handler.Session.folderID = folderID;
		return folderID;
	}
};
Handler.createFolder = function(response){
	var module = response.entity;
	var rdata = response.data;
	var data = {
		    "CONTENT_TYPE":"multipart",
		    "PARTS":[
		              {
		                  "headers": {  
		                      "Content-Type": "application/json"
		                  },
		                  "content": {"mimeType": "application/vnd.google-apps.folder", "title": rdata.id
		                  }
		              }
		            ]
		  }
	return ZOHO.CRM.CONNECTOR.invokeAPI(Handler.ApiSpec.uploadFile,data)			
	.then(function(response){
		
		var temp = response;
		var googleDriveResp = JSON.parse(temp.response);
		var folderID = googleDriveResp.id;
		Handler.Session.folderID = folderID;
		return folderID;
	}).then(function(folderID){
		
		var updateData = {
		        "id": rdata.id,
		  };
		updateData[Handler.MetaSpec.folderID] = folderID
		var config={
				  Entity:module,
				  APIData:updateData
				}
		return ZOHO.CRM.API.updateRecord(config).then(function(data){
			if(data && data instanceof Array && data[0].code === "SUCCESS"){
				return folderID;
			}
			else{
				return undefined;
			}
		})
	})
};
Handler.getFiles = function(folderID){
	return ZOHO.CRM.CONNECTOR.invokeAPI(Handler.ApiSpec.getFiles,{folderId:folderID})
	.then(function(gDriveResp){
		var resp = JSON.parse(gDriveResp.response)
		var files = resp.items;
		return files;
	})
};
Handler.renderFileListNew = function(files){
	var allFiles =[];
	var pRes;
	return Handler.getFileInfo(files)
	.then(function(data){
		return data;
	});
}
Handler.getFileInfo = function(files,allFiles,callBack){
	
	var promises=[];
	for(file in files){
		var filePromise = ZOHO.CRM.CONNECTOR.invokeAPI(Handler.ApiSpec.getFileInfo,{fileID:files[file].id}).then(function(data){
			return JSON.parse(data.response)
		});
		promises.push(filePromise); 
	}
	return Promise.all(promises);
}
Handler.uploadFile = function(){
	Utils.showLoading();
	var file = $("#gdrive-file")
	var file = document.getElementById("gdrive-file").files[0];
	var fileType;
	  if (file.type === "application/pdf"){
	    fileType = file.type;
	  }
	  else if(file.type === "image/jpeg"){
	    fileType = file.type;
	  }
	  else if(file.type === "text/plain"){
	    fileType = "application/msword";
	  }
	  else if(file.type === ""){
	    fileType = "application/msword";
	  }
	  var data = {
	    "CONTENT_TYPE":"multipart",
	    "PARTS":[
	              {
	                "headers": {  
	                  "Content-Type": "application/json"
	                },
	                "content": {"mimeType": fileType,"description": "TestFile to upload", "title":file.name,"parents":[{id:Handler.Session.folderID}]}
	              },{
	                "headers": {
	                  "Content-Disposition": "file;"
	                },
	                "content": "__FILE__"
	              }
	            ],
	    "FILE":{
	      "fileParam":"content",
	      "file":file
	    },
	  }
	  ZOHO.CRM.CONNECTOR.invokeAPI(Handler.ApiSpec.uploadFile,data)
	  .then(function(){
		  Handler.refreshFileList();
	  })
}