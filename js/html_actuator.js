function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");

  this.score = 0;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    grid.cells.forEach(function (column) {
      column.forEach(function (cell) {
        if (cell) {
          self.addTile(cell);
        }
      });
    });

    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

// Continues the game (both restart and keep playing)
HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.addTile = function (tile) {
  var self = this;

  var wrapper   = document.createElement("div");
  var inner     = document.createElement("div");
  var bar       = document.createElement("div");
  var barwrap   = document.createElement("div");
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var positionClass = this.positionClass(position);

  // We can't use classlist because it somehow glitches when replacing classes
  var classes = ["tile", "tile-" + tile.value, positionClass];

  if (tile.value > 2048) classes.push("tile-super");

  this.applyClasses(wrapper, classes);

  inner.classList.add("tile-inner");
  inner.textContent = Math.floor(tile.value);

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    window.requestAnimationFrame(function () {
      classes[2] = self.positionClass({ x: tile.x, y: tile.y });
      self.applyClasses(wrapper, classes); // Update the position
    });
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    this.applyClasses(wrapper, classes);
    
    barwrap.classList.add("tile-merged");
    bar.classList.add("tile-merged");

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      self.addTile(merged);
    });
  } else {
    classes.push("tile-new");
    this.applyClasses(wrapper, classes);
    bar.classList.add("tile-new");
  }
  
  timePercent = Math.floor(tile.time*100/tile.maxtime);
  bar.setAttribute("style","width: "+timePercent+"%; background-color: #FFF; height:10%; border-radius: 10px 10px 10px 10px; position:absolute; top:-15%; left:+2.5%;");
  bar.classList.add("tile-bar");
  if (tile.value == 2){
    bar.style.visibility = "hidden";
  }
  
  barwrap.classList.add("tile-barwrap");
  barwrap.classList.add("text-center");
  barwrap.style.height = "100%";
  barwrap.style.width = "95%";
  barwrap.style.position = "absolute";
  bar.style.transform = "translateZ(0)";

  // Add the inner part of the tile to the wrapper
  wrapper.appendChild(inner);
  wrapper.appendChild(barwrap);
  barwrap.appendChild(bar);

  // Put the tile on the board
  this.tileContainer.appendChild(wrapper);
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score) {
  this.clearContainer(this.scoreContainer);
  var difference = score - this.score;
  
  var min = Math.floor(this.score/1000/60);
  var sec = ("0"+((this.score/1000) % 60 << 0)).slice(-2);
  var totalSec = (this.score/1000) << 0;
  var newTotalSec = (score/1000) << 0;
  
  
  var diffSecs = newTotalSec - totalSec;
  
  this.score = score;
   

  this.scoreContainer.textContent = min + ":" + sec;

  if (diffSecs >= 2) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + diffSecs + "s";

    this.scoreContainer.appendChild(addition);
  } else if (diffSecs ==1 && sec.slice(-1) == 0) {
    var addition = document.createElement("div");
    addition.classList.add("score-addition");
    addition.textContent = "+" + diffSecs + "0s";

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  var min = (bestScore/1000/60) << 0;
  var sec = ("0"+((bestScore/1000) % 60 << 0)).slice(-2);
  this.bestContainer.textContent = min + ":" + sec;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "You win!" : "Game over!";

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
};

HTMLActuator.prototype.updateTiles = function (grid, metadata) {
  self = this;
  
  window.requestAnimationFrame(function () {
    grid.tiles().forEach(function (tile) {
      self.updateTile(tile);
    })
  })
  
  self.updateScore(metadata.score);
  self.updateBestScore(metadata.bestScore);
}

HTMLActuator.prototype.updateTile = function (tile) {

  positionClass = this.positionClass({x: tile.x, y:tile.y })
  tileElements = document.getElementsByClassName(positionClass);
  
  timePercent = Math.floor(100*tile.time/tile.maxtime);
  var classes = ["tile", "tile-" + tile.value, positionClass];
    
  
  for (i = 0; i < tileElements.length; i++) {
    var wrapper = tileElements[i];
    var tileBarWrap = wrapper.getElementsByClassName("tile-barwrap")[0];
    var tileBar = tileBarWrap.getElementsByClassName("tile-bar")[0];
    var inner = wrapper.getElementsByClassName("tile-inner")[0];
    
    var currentContent = inner.textContent;
    
    if (currentContent != tile.value) {
      inner.textContent = tile.value;
      if (currentContent >= tile.value){
        inner.style.animation = "wiggle 250ms 1 forwards";
      }
      this.applyClasses(wrapper, classes);
    }
    
    tileBar.style.width = timePercent+"%";
    
    if (tile.value > 2 && tileBar.style.visibility != "visible") {
      tileBar.style.visibility = "visible";
    }
    if (tile.value == 2 && tileBar.style.visibility != "hidden") {
      tileBar.style.visibility = "hidden";
    }
    
  }
}