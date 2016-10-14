za = {} || za;
za.co = {} || za.co;
za.co.offcentreit = {} || za.co.offcentreit;
za.co.offcentreit.sequence = {} || za.co.offcentreit.sequence;
za.co.offcentreit.sequence.Sequence = function () {
  this.prefix = "sequence:";
	this.diagram = {};
	this.themeChoice = "simple"; //hand

	this.changeTheme = function () {
		this.themeChoice = document.getElementById("themeSelect").options[document.getElementById("themeSelect").selectedIndex].value;
		this.drawSequenceDiagram();
	}

	this.clearDiagram = function () {
		document.getElementById("diagramViewer").innerHTML = "";
	}
  
	this.clearDiagramText = function () {
		document.getElementById("sequenceText").value = "";
	}

	this.drawSequenceDiagram = function () {
		this.clearDiagram();
		var sequenceTextValue = document.getElementById("sequenceText").value;
		this.diagram = Diagram.parse(sequenceTextValue);
		this.diagram.drawSVG("diagramViewer", {
			theme : this.themeChoice
		});
	}
  
  this.openDiagramDialog = function (){
    this.reloadListFromStorage("diagramList");
    Dialog.showDialog("openDiagramDialog");
  }
  
  this.openDiagram = function(diagramListId){
    var storage = this.getStorage();
    if (storage) {
      var diagramList = document.getElementById(diagramListId);
      var selectedItem = diagramList.options[diagramList.selectedIndex].value;
      var diagramText = storage.getItem(selectedItem);
      this.clearDiagram();
      document.getElementById("saveDiagramAs").value = selectedItem.replace(this.prefix,"");
      document.getElementById("sequenceText").value = diagramText;
      this.drawSequenceDiagram();
    }
  }
  
  this.saveDiagramDialog = function (){
    Dialog.showDialog("saveDiagramDialog");
    var saveDiagramText = document.getElementById("saveDiagramText");
    saveDiagramText.value = document.getElementById("sequenceText").value;
  }
  
  this.saveDiagramAs = function() {
    var saveDiagramText = document.getElementById("saveDiagramText").value;
    var saveDiagramAs = document.getElementById("saveDiagramAs").value;
    if (saveDiagramText){
      if (saveDiagramAs && saveDiagramAs.length>0){
        var storage = this.getStorage();
        if (storage) {
          storage.setItem(this.prefix+saveDiagramAs, saveDiagramText);
          this.reloadListFromStorage("diagramList");
          Dialog.closeDialog("saveDiagramDialog");
        } else {
          Dialog.showMessageDialog("messageDialog","Failed to save to storage.");
        }
      } else {
        Dialog.showMessageDialog("messageDialog","Please provide the name of the diagram.");
      }
    } else {
      Dialog.showMessageDialog("messageDialog","There is no data to save.");
    }
  }
  
  this.getStorage = function () {
    var storage = window.localStorage;
    if (!storage) {
      storage = localStorage;
    }
    return storage;
  }
  
  this.reloadListFromStorage = function (diagramListId){
    var storage = this.getStorage();
    if (storage) {
      var diagramList = document.getElementById(diagramListId);
      for (var i = diagramList.options.length - 1; i >= 0; i--) {
        diagramList.remove(i);
      }
      var option = document.createElement("option");
      for (var key in storage) {
        if (key.indexOf(this.prefix) > -1){
          var option = document.createElement("option");
          option.text = key.replace(this.prefix,"");
          if ("|key|getItem|setItem|removeItem|clear|length|".indexOf(key) < 0){
            option.value = key;
            diagramList.add(option);
          }
        }
      }
    }    
  }
  
}
var sequence = new za.co.offcentreit.sequence.Sequence();
