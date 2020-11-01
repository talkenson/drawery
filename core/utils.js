/*

      THIS IS AN UTILITIES SCRIPT, CHANGE IT ON YOUR OW RISK

 */
const testXY = (xgte, xlte, ygte, ylte, x = null, y = null) => {
  if (x === null || y === null) {
    x = mouseX;
    y = mouseY;
  }
  return (x >= xgte &&
    x <= xlte &&
    y >= ygte &&
    y <= ylte)
};

const C2Pix = (xc = 0, yc = 0) => {
  return [Math.round((xc - CENTER_W) / PIXEL_SIZE - 0.5), -Math.round((yc - CENTER_H) / PIXEL_SIZE + 0.5)];
};

const CAr2Pix = (coords = [0, 0]) => {
  return [Math.round((coords[0] - CENTER_W) / PIXEL_SIZE - 0.5), -Math.round((coords[1] - CENTER_H) / PIXEL_SIZE + 0.5)];
};

function mousePressed() {
  loop();
}

function mouseReleased() {
  noLoop();
}

function arraysEqual(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function createCanvasName() {
  return 'myCanvas'
}

const isDrawable = (coords) => {
  return testXY(
    _SETTINGS.general.activeArea.cellBorders.left,
    _SETTINGS.general.activeArea.cellBorders.right,
    _SETTINGS.general.activeArea.cellBorders.bottom,
    _SETTINGS.general.activeArea.cellBorders.top, coords[0], coords[1]);
};
