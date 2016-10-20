storageman = {}

 || storageman;

var stringUtils = new za.co.offcentreit.StringUtils();

storageman.removeMessageDefinition = function (recordName) {
	var storage = window.localStorage;
	if (!storage) {
		storage = localStorage;
	}
	if (storage) {
		storage.removeItem(recordName);
		storageManager.loadFromLocalStorage("messageDefinitionList");
	}
}

storageman.StorageManager = function () {

	this.getStorage = function () {
		var storage = window.localStorage;
		if (!storage) {
			storage = localStorage;
		}
		return storage;
	}

	this.loadFromLocalStorage = function (listName, filter, replace) {
		var storage = this.getStorage();
		if (storage) {
			var messageDefinitionList = document.getElementById(listName);
			for (var i = messageDefinitionList.options.length - 1; i >= 0; i--) {
				messageDefinitionList.remove(i);
			}
			var option = document.createElement("option");
      /*
			option.text = "";
			option.value = "";
			messageDefinitionList.add(option);
      */
			for (var key in storage) {
				var option = document.createElement("option");
				option.text = key;
				if ("|key|getItem|setItem|removeItem|clear|length|".indexOf(key) < 0) {
					option.value = key;
					if (filter && filter.length > 0) {
						if (key.indexOf(filter) > -1) {
							if (replace && replace.toUpperCase() == "TRUE") {
								option.text = option.text.replace(filter, "");
							}
							messageDefinitionList.add(option);
						}
					} else {
						messageDefinitionList.add(option);
					}
				}
			}
		}
	}
  
  this.retrieveMessageDefinition = function () {
		var storage = window.localStorage;
		if (!storage) {
			storage = localStorage;
		}
		if (storage) {
			var messageDefinitionList = document.getElementById("messageDefinitionList");
			var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
			var recordName = selectedItem;
			document.getElementById("recordName").innerHTML = recordName;
			var output = storage.getItem(recordName);
			document.getElementById("contentViewer").value = output;
      this.formatContent();
		}
	}

	this.removeSelectedMessageDefinition = function () {
		var responseButton = document.getElementById("IamSureButton");
		var responseFunction = function () {
			storageman.removeMessageDefinition(recordName);
			document.getElementById("recordName").innerHTML = "";
			document.getElementById("contentViewer").value = "";
			Dialog.closeDialog("areYouSureDialog");
		};
		if (responseButton.removeEventListener) {
			responseButton.removeEventListener("click", responseFunction);
		}
		var messageDefinitionList = document.getElementById("messageDefinitionList");
		var selectedItem = messageDefinitionList.options[messageDefinitionList.selectedIndex].value;
		var recordName = selectedItem;
		var areYouSureMessage = document.getElementById("areYouSureMessage");
		areYouSureMessage.innerHTML = "Do you want to delete <b>" + recordName + "</b> from local storage?";
		responseButton.addEventListener("click", responseFunction);
		Dialog.showDialog("areYouSureDialog");
	}

	this.formatContent = function () {
		try {
			var contentViewer = document.getElementById("contentViewer");
			var content = contentViewer.value;
			contentViewer.value = vkbeautify.json(content);
		} catch (exception) {}
	}

	this.minifyContent = function () {
		try {
			var contentViewer = document.getElementById("contentViewer");
			var content = contentViewer.value;
			contentViewer.value = vkbeautify.jsonmin(content);
		} catch (exception) {}
	}
}
var storageManager = new storageman.StorageManager();
