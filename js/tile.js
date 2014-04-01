function Tile(position, value, time) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;
  
  this.time             = time || value*1000; // Timer in ms
  this.maxtime          = value * 1000; // Max value of timer (for time bar)

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

Tile.prototype.serialize = function () {
  return {
    position: {
      x: this.x,
      y: this.y
    },
    value: this.value,
    time: this.time
  };
};

Tile.prototype.halveValue = function () {
  this.value = this.value > 2 ? this.value/2 : 2
}
