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

const Pix2C = (coords = [0, 0]) => {
  console.log('requested', coords);
  return [
    CANVAS_W / 2 + (coords[0] * PIXEL_SIZE),
    CANVAS_H / 2 - PIXEL_SIZE / 2 - (coords[1] * PIXEL_SIZE)
  ];
};

function arraysEqual(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

function createCanvasName() {
  let currentDate = new Date();
  return "dycanvas" + currentDate.getDate()
    + (currentDate.getMonth() + 1)
    + currentDate.getFullYear() + "_"
    + currentDate.getHours()
    + currentDate.getMinutes()
    + currentDate.getSeconds()
}

const isDrawable = (coords) => {
  return testXY(
    _SETTINGS.general.activeArea.cellBorders.left,
    _SETTINGS.general.activeArea.cellBorders.right,
    _SETTINGS.general.activeArea.cellBorders.bottom,
    _SETTINGS.general.activeArea.cellBorders.top, coords[0], coords[1]);
};


class PolygonContainer {
  constructor() {
    this.__reset();

  }
  globalPolygonContainer = [];
  storage = [];
  isClosed = true;
  firstPointCoords = [];
  polygonCrud = new Crud(CrudStore.Polygons);

  __reset = () => {
    this.storage = [];
    this.isClosed = true;
  };

  addSegment = ([xs, ys], [xe, ye]) => {
    if (this.storage.length === 0) {
      this.firstPointCoords = [xs, ys];
      this.isClosed = false;
      STATE.colorBlocked = true;
      EventManager.dispatchEvent('color-block', {value: true}, 'polygon-first-point');
    }
    this.storage.push({from: [xs, ys], to: [xe, ye]});
    if (arraysEqual([xe, ye], this.firstPointCoords)) {
      putPixel([this.firstPointCoords[0], this.firstPointCoords[1]]);
      this.closeFigure();
    }
  };

  closeFigure = () => {
    console.log('Figure Closed');
    this.globalPolygonContainer.push({name: 'Polygon', path: this.storage});
    this.storage = [];
    this.polygonCrud.update(this.globalPolygonContainer);
    this.isClosed = true;
    EventManager.dispatchEvent('color-block', {value: false}, 'polygon-closed');

    document.dispatchEvent(new CustomEvent('LDM', {"detail": {"type": 'reset'}}));
  }
}

class LDM {
  firstpoint = true;
  coord;
  colors;
  mark = COLORS.WHAY;
  polygonManager = null;

  constructor(polyMan) {
    this.__reset();
    if (!polyMan) {
      throw new Error('No Polygon Manager provided to LineDrawingModule');
    }
    this.polygonManager = polyMan;

    document.addEventListener('LDM', this.eventHandler);
  }

  __reset = () => {
    this.colors = [null, null];
    this.coord = [[0, 0], [0, 0]];
    this.firstpoint = true;
  };

  eventHandler = (event) => {
    if (event.detail.type && event.detail.type === 'reset') {
      this.__reset();
    }
  };

  setCoord = (i, x, y) => {
    if (i === 0 && this.colors[i] !== null && !arraysEqual(this.colors[i], this.mark)) {
      putPixel([this.coord[i][0], this.coord[i][1]], this.colors[i]);
    }

    this.colors[i] = get(mouseX, mouseY).slice(0, 3);
    putPixel([x, y], this.mark);
    this.coord[i] = [x, y];
  };

  draw = async () => {
    this.colors = [STATE.currentColor, STATE.currentColor];
    switch (STATE.activeTool) {
      case 'Line':
        drawLine(this.coord[0], this.coord[1], STATE.currentColor, 0, [AlgoType.BRZ]);
        break;
      case 'Rectangle':
        drawRectangle(this.coord[0], this.coord[1], STATE.currentColor, 0, [AlgoType.BRZ]);
        break;
      case 'Polygon':
        drawLine(this.coord[0], this.coord[1], STATE.currentColor, 0, [AlgoType.BRZ]);
        this.polygonManager.addSegment(this.coord[0], this.coord[1]);
        break;
      case 'Masking':
        drawRectangle(this.coord[0], this.coord[1], COLORS._MASK, 0, [AlgoType.BRZ]);
        STATE.maskOptions.lt = [this.coord[0][0], this.coord[0][1]];
        STATE.maskOptions.rt = [this.coord[1][0], this.coord[0][1]];
        STATE.maskOptions.lb = [this.coord[1][0], this.coord[1][1]];
        STATE.maskOptions.rb = [this.coord[0][0], this.coord[1][1]];
        this.__reset();
        break;
    }
  }
}

class EventManagerClass {
  _storage = [];
  getFormat = (eve, initiator, payload) => {
    return {eve, initiator, payload}
  };
  addListener = (eve, handler, purpose) => {
    document.addEventListener(eve, handler);
    this._storage.push({event: eve, handler, purpose})
  };
  dispatchEvent = (eve, payload, initiator) =>
    document.dispatchEvent(new CustomEvent(eve, {"detail": {...payload, initiator}}));
  findListeners = (eve) => {
    return this._storage.filter(el => el.event === eve)
  }
}
let EventManager = new EventManagerClass();
