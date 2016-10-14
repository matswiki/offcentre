CircuitType = function(viewerId, graph) {
  this.prefix = "diagram:";
  this.paper = new joint.dia.Paper({
      el: document.getElementById(viewerId),
      width: 2000,
      height: 2000,
      model: graph,
      gridSize: 1
  });
  
  this.currentCellId;
  
  //Add cell listener
  this.paper.on("cell:pointerup", function(cellView, evt, x, y) {
    // Find the first element below that is not a link nor the dragged element itself.
    var elementBelow = graph.get("cells").find(function(cell) {
      if (cell instanceof joint.dia.Link) return false; // Not interested in links.
      if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
      if (cell.getBBox().containsPoint(g.point(x, y))) {
          return true;
      }
      return false;
    });
    // If the two elements are connected already, don't
    // connect them again (this is application specific though).
    if (elementBelow) {
        //&& !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
        
      var newLink = new joint.dia.Link({
          source: { id: cellView.model.id }, 
          target: { id: elementBelow.id },
          attrs: { ".marker-source": { d: "M 10 0 L 0 5 L 10 10 z" } },
          router: {name: 'metro'}, // manhattan | metro | orthogonal
          connector: { name: 'rounded' }
      });
      newLink.label(0, {
          position: .5,
          attrs: {
              rect: { fill: 'white' },
              text: { fill: 'blue', text: '' }
          }
      });
      graph.addCell(newLink);
      // Move the element a bit to the side.
      cellView.model.translate(+150, 0);
    }
  });    
  
  this.paper.on("cell:mouseover",function(cellView, evt, x, y){
    if (cellView.model.attributes.type){
      if (cellView.model.attributes.type == "basic.Path"){
        cellView.highlight();
      }
    }
  });
  
  this.paper.on("cell:mouseout",function(cellView, evt, x, y){
    cellView.unhighlight();
  });

  this.paper.on("cell:contextmenu", function(cellView, evt, x, y){});
    
  
  this.paper.on("cell:pointerdblclick", function(cellView, evt, x, y){
    evt.preventDefault();
    if (cellView.model.attributes.type){
      if (cellView.model.attributes.type == "basic.Path"){
        this.currentCellId = cellView.id;
        var cellContextMenu = document.getElementById("cellContextMenu");
        cellContextMenu.style.left = (x+10)+"px";
        cellContextMenu.style.top = (y+20)+"px";
        document.getElementById("cellViewModelText").value = vkbeautify.json(JSON.stringify(cellView.model));
        var cellName = document.getElementById("cellName");
        var cellWidth = document.getElementById("cellWidth");
        var cellHeight = document.getElementById("cellHeight");
        cellName.value = cellView.model.attributes.attrs.text.text;
        cellWidth.value = cellView.model.attributes.size.width;
        cellHeight.value = cellView.model.attributes.size.height;
        
        function updateName(){
          cellView.model.attributes.attrs.text.text = cellName.value;
          cellView.model.attr("rect/fill",{});
          
          Dialog.closeDialog("cellContextMenu");
        }
        var contextFooter = cellContextMenu.getElementsByClassName("dialogFooter")[0];
        if (contextFooter){
          contextFooter.innerHTML = "";
          var applyChangeToCell = document.createElement("BUTTON");
          contextFooter.appendChild(applyChangeToCell);
          if (applyChangeToCell){
            applyChangeToCell.value="Update";
            applyChangeToCell.className="btn";
            applyChangeToCell.addEventListener("click",updateName);
          }
          Dialog.showDialog("cellContextMenu");
        }
      }
    }
  });

  this.addCustomShape = function (boxId){
    if (boxId){
      var boxName="\t";
      var customShape = document.getElementById(boxId).value;
      if (boxName){
        graph.addCells([new joint.shapes.basic.Path({
                            position: { x: 300, y: 10 },
                            size: { width: 80, height: 80 },
                            attrs: {
                              path: {
                                d: customShape, fill: "#dedede" 
                              },
                              text: { 
                                text: boxName, "ref-y": .40, fill: "blue" 
                              }
                            }
                          })]);
       }
     }
  }
  
  this.addShape = function (svgPath, posX, posY){
    if (svgPath){
      var boxName="\t";
      var cell = new joint.shapes.basic.Path({
                            position: { x: posX, y: posY },
                            size: { width: 60, height: 60 },
                            attrs: {
                              path: {
                                d: svgPath, fill: "blue" 
                              },
                              text: { 
                                text: boxName, "ref-y": .40, fill: "blue" 
                              }
                            }
                          });
      graph.addCells([cell]);
     }
  }
  
  this.clearGraph = function (){
    graph.clear();
  }

  this.importDiagramDialog = function (jsonTextContainerId, importDialogId){
    document.getElementById(jsonTextContainerId).value = JSON.stringify(graph.toJSON());
    this.formatJson(jsonTextContainerId);
    Dialog.showDialog(importDialogId);
  }
  
  this.formatJson = function (jsonTextContainerId){
    var jsonText = document.getElementById(jsonTextContainerId).value;
    document.getElementById(jsonTextContainerId).value = vkbeautify.json(jsonText);
  }
  
  this.minifyJson = function (jsonTextContainerId){
    var jsonText = document.getElementById(jsonTextContainerId).value;
    document.getElementById(jsonTextContainerId).value = vkbeautify.jsonmin(jsonText);
  }
  
  this.importGraphFromJson = function (jsonTextContainerId){
    this.clearGraph();
    var jsonText = document.getElementById(jsonTextContainerId).value;
    graph.fromJSON(JSON.parse(jsonText));
  }

  this.allowShapeDrop = function (ev) {
    ev.preventDefault();
  }

  this.dragShape = function (ev) {
    if (ev.target.id){
      ev.dataTransfer.setData("shape", ev.target.id);
    } else if (ev.target.value){
      ev.dataTransfer.setData("shape", ev.target.value);
    }
  }

  this.dropShape = function (ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("shape");
    var posX = event.clientX - 100;
    var posY = event.clientY - 100;
    this.addShape(data, posX, posY);
  }
  
  this.openDiagramDialog = function (){
    circuit.reloadListFromStorage("diagramList");
    Dialog.showDialog("openDiagramDialog");
  }
  
  this.openDiagram = function(diagramListId){
    var storage = this.getStorage();
    if (storage) {
      var diagramList = document.getElementById(diagramListId);
      var selectedItem = diagramList.options[diagramList.selectedIndex].value;
      var diagramText = storage.getItem(selectedItem);
      this.clearGraph();
      graph.fromJSON(JSON.parse(diagramText));
      document.getElementById("saveDiagramAs").value = selectedItem.replace(this.prefix,"");
    }
  }
  
  this.saveDiagramDialog = function (){
    Dialog.showDialog("saveDiagramDialog");
    var saveDiagramText = document.getElementById("saveDiagramText");
    saveDiagramText.value = JSON.stringify(graph.toJSON());
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
  
  this.changeCell = function (cellLabelId){
    var currentCell = graph.getCell(this.currentCellId);
    if (currentCell){
       currentCell.model.attr({rect: { fill: 'red' }});
    }
  }

};
