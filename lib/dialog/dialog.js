var Dragger = function () {
  return {
    move: function (divObject, xpos, ypos) {
      divObject.style.left = xpos + 'px';
      divObject.style.top = ypos + 'px';
    },
    startMoving: function (divObject, container, evt) {
      evt = evt || window.event;
      var posX = evt.clientX,
      posY = evt.clientY,
      divTop = divObject.style.top,
      divLeft = divObject.style.left,
      eWi = parseInt(divObject.style.width),
      eHe = parseInt(divObject.style.height),
      cWi = parseInt(container.style.width),
      cHe = parseInt(container.style.height);
      container.style.cursor = 'move';
      divTop = divTop.replace('px', '');
      divLeft = divLeft.replace('px', '');
      var diffX = posX - divLeft,
      diffY = posY - divTop;
      document.onmousemove = function (evt) {
        evt = evt || window.event;
        var posX = evt.clientX,
        posY = evt.clientY,
        aX = posX - diffX,
        aY = posY - diffY;
        if (aX < 0)
          aX = 0;
        if (aY < 0)
          aY = 0;
        if (aX + eWi > cWi)
          aX = cWi - eWi;
        if (aY + eHe > cHe)
          aY = cHe - eHe;
        Dragger.move(divObject, aX, aY);
      }
    },
    stopMoving : function (container) {
      var a = document.createElement('script');
      container.style.cursor = 'default';
      document.onmousemove = function () {}
    },
  }
}();

var Dialog = function() {
  return {
    showDialog : function(dialogId) {
      document.getElementById(dialogId).style.display = "block";
    },
    
    showMessageDialog : function(dialogId, message){
      var dialog = document.getElementById(dialogId);
      dialog.style.display = "block";
      if (message){
        var dialogBody = document.getElementById(dialogId).getElementsByClassName("dialogBody")[0];
        if (dialogBody){
          dialogBody.innerHTML = "<br/>"+message;
        }
      }
    },
    
    closeDialog : function(dialogId) {
      document.getElementById(dialogId).style.display = "none";
    }
  }
}();