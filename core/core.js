/*
     This code, the project core, the implementation in this file is the intellectual property of Talkenson.
                           This code is made for study purposes, feel free to use it!
                  I hope, I can help you with some fields of your subject. By the way, welcome!

                                         Talkenson (Vitaly Shatalov)
                                                Autumn, 2020

    Project started on 10th Sept 2020.
*/

let FRAME_RATE = 10;
let PIXEL_SIZE = 15;
let CANVAS_W = 1150;
let CANVAS_H = 930;
let CANVAS_HC = Math.round(CANVAS_H / PIXEL_SIZE);
let CANVAS_WC = Math.round(CANVAS_W / PIXEL_SIZE);
let CENTER_H = PIXEL_SIZE * Math.round(CANVAS_H / PIXEL_SIZE / 2);
let CENTER_W = PIXEL_SIZE * Math.round(CANVAS_W / PIXEL_SIZE / 2);

const COLORS = {
  BLACK: [0, 0, 0],
  WHITE: [255, 255, 255],
  WHAY: [190, 190, 190],
  RED: [255, 163, 163],
  GREEN: [138, 255, 154],
  YELLOW: [255, 246, 138],
  GRAY: [193, 193, 193],
  STROKE: [193, 193, 193],
  BG: 255,
};

const _SETTINGS = {
  toolbar: {
    width: 60,
    height: 240,
    offset: {
      top: 30,
      left: 15,
      right: 15,
      inner: {
        top: 20,
      }
    },
    buttonOffset: {
      top: 10,
      left: 15,
    },
    innerTextOffset: {
      top: 10,
      left: 2,
    }
  },
  general: {
    activeArea: {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      cellBorders: {
        left: -32,
        right: 37,
        top: 30,
        bottom: -30,
      }
    },
    color: {
      current: 0,
      palette: [COLORS.RED, COLORS.GREEN, COLORS.YELLOW, COLORS.BLACK, COLORS.WHITE],
    }
  },
  cursors:
    [
      {
        region: 'activeArea',
        cursor: 'crosshair',
      },
      {
        region: 'toolbar',
        cursor: 'pointer',
      },
      {
        region: 'none',
        cursor: 'default',
      }
    ],
  setup: {
    modules: {
      grid: {
        isActive: true,
        render: null,
      },
      toolbar: {
        isActive: true,
        model: null,
      },
    }
  }
};

let STATE;

STATE = {
  activeTool: 'Line',
  activeRegion: null,
  currentColor: _SETTINGS.general.color.palette[_SETTINGS.general.color.current],
  processes: {
    created: 0,
    terminatedByColor: 0,
    terminatedByEnd: 0,
  }
};

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

const getRegion = () => {
  if (testXY(_SETTINGS.general.activeArea.left,
    _SETTINGS.general.activeArea.left + _SETTINGS.general.activeArea.width,
    _SETTINGS.general.activeArea.top,
    _SETTINGS.general.activeArea.top + _SETTINGS.general.activeArea.height)) {
    return 'activeArea'
  }
  if (testXY(_SETTINGS.toolbar.offset.left,
    _SETTINGS.toolbar.offset.left + _SETTINGS.toolbar.width,
    _SETTINGS.toolbar.offset.top,
    _SETTINGS.toolbar.offset.top + _SETTINGS.toolbar.height)) {
    return 'toolbar'
  }
};

const utilsFixedUpdate = () => {
  const rg = getRegion();
  if (STATE.activeRegion !== rg || STATE.activeRegion === null) {
    STATE.activeRegion = rg;
    console.log('changed to ', rg);
    _SETTINGS.cursors.forEach(setup => {
      if (STATE.activeRegion === setup.region) {
        console.log('cur set', setup.cursor);
        cursor(setup.cursor);
        return;
      }
    });
    cursor(_SETTINGS.cursors.filter(cur => cur.region === 'none')[0])
  }
};

const drawLineRaw = (point1, point2, color = COLORS.BLACK, thickness = 1) => {
  stroke(`rgba(${color.join(',')},0.9)`);
  strokeWeight(thickness);
  line(point1[0], point1[1], point2[0], point2[1]);
};

const C2Pix = (xc, yc) => {
  return [Math.round((xc - CENTER_W) / PIXEL_SIZE - 0.5), -Math.round((yc - CENTER_H) / PIXEL_SIZE + 0.5)];
};


const drawLine = (point1, point2, color = STATE.currentColor, thickness = 1, type = [AlgoType.DDA]) => {
  stroke(color);
  strokeWeight(thickness);
  line(CENTER_W + (point1[0] + 0.5) * PIXEL_SIZE, CENTER_H - (point1[1] + 0.5) * PIXEL_SIZE, CENTER_W + point2[0] * PIXEL_SIZE, CENTER_H - (point2[1] + 0.5) * PIXEL_SIZE);

  if (type.includes(AlgoType.BRZnew)) {
    x00 = point1[0];
    x11 = point2[0];
    y00 = point1[1];
    y11 = point2[1];

    if (x00 === x11 && y00 === y11) {
      putPixel([x00, y00], color);
      return;
    }

    let A = y11 - y00;
    let B = x00 - x11;
    if (abs(A) > abs(B)) { sign = 1; }
    else { sign = -1; }
    if (A < 0) {
      signa = -1;
    }
    else
    {
      signa = 1;
    }
    if (B < 0) {
      signb = -1;
    }
    else
    {
      signb = 1;
    }
    let f = 0;
    putPixel([x00, y00], color);
    let x = x00, y = y00;
    if (sign === -1)
    {
      do
      {
        f += A * signa;
        if (f > 0)
        {
          f -= B * signb;
          y += signa;
        }
        x -= signb;
        putPixel([x, y], color);
      }while (x !== x11 || y !== y11);
    }
    else
    {
      do
      {
        f += B * signb;
        if (f > 0)
        {
          f -= A * signa;
          x -= signb;
        }
        y += signa;
        putPixel([x, y], color);
      } while (x !== x11 || y !== y11);
    }
  }
};

class LDM { // LineDrawMouse
  firstpoint = true;
  // true - first point, false - second
  coord = [[0, 0], [0, 0]];

  setCoord = (i, x, y) => {
    this.coord[i] = [x, y];
  };

  draw = () => {
    drawLine(this.coord[0], this.coord[1], STATE.currentColor, 0, [AlgoType.BRZnew]);
  }
}

const drawGrid = (drawBack = null) => {
  background(COLORS.BG);
  _SETTINGS.general.activeArea.left = Math.floor((_SETTINGS.toolbar.width + _SETTINGS.toolbar.offset.left + _SETTINGS.toolbar.offset.right) / PIXEL_SIZE) * PIXEL_SIZE;
  _SETTINGS.general.activeArea.width = Math.floor((CANVAS_W - (_SETTINGS.toolbar.offset.left + _SETTINGS.toolbar.width  + _SETTINGS.toolbar.offset.right)) / PIXEL_SIZE) * PIXEL_SIZE;
  _SETTINGS.general.activeArea.height = (Math.floor(CANVAS_H / PIXEL_SIZE) - 1) * PIXEL_SIZE;

  for (let i = _SETTINGS.general.activeArea.left; i <= _SETTINGS.general.activeArea.left + _SETTINGS.general.activeArea.width; i += PIXEL_SIZE) {
    drawLineRaw([i, 0], [i, _SETTINGS.general.activeArea.height], COLORS.STROKE)
  }

  for (let i = _SETTINGS.general.activeArea.top; i <= _SETTINGS.general.activeArea.height; i += PIXEL_SIZE) {
    drawLineRaw([_SETTINGS.general.activeArea.left, i], [_SETTINGS.general.activeArea.width + _SETTINGS.general.activeArea.left, i], COLORS.STROKE)
  }
};
_SETTINGS.setup.modules.grid.render = drawGrid;
// Initializing

const AlgoType = {
  DDA: 1,
  BRZ: 2,
  BRZold: 3,
  DDAnew: 4,
  BRZnew: 5,
};

const isDrawable = (coords) => {
  return testXY(
    _SETTINGS.general.activeArea.cellBorders.left,
    _SETTINGS.general.activeArea.cellBorders.right,
    _SETTINGS.general.activeArea.cellBorders.bottom,
    _SETTINGS.general.activeArea.cellBorders.top, coords[0], coords[1]);
};

const putPixel = ([cox, coy], color = STATE.currentColor) => {
    fill(color);
    stroke(`rgba(${COLORS.STROKE.join(',')},0.9)`);
    strokeWeight(1);
    square(CENTER_W + cox * PIXEL_SIZE, CENTER_H - (coy + 1) * PIXEL_SIZE, PIXEL_SIZE);
};

function mousePressed() {
  loop();
}

function mouseReleased() {
  //noLoop();
}

function arraysEqual(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

const Directions = {
  Up: 1,
  Left: 2,
  Down: 3,
  Right: 4,
};

const startFillFrom = async (x, y, isColored = false, startColor = COLORS.WHITE, blockDir = null) => {
  STATE.processes.created++;
  let c = get(x, y).slice(0, 3);
  if (arraysEqual(c, STATE.currentColor) || !arraysEqual(c, startColor)) {
    STATE.processes.terminatedByColor++;
    return;
  }
  putPixel(C2Pix(x, y), STATE.currentColor);

  blockDir !== Directions.Left && isDrawable(C2Pix(x - PIXEL_SIZE, y)) &&
  await setTimeout(() => startFillFrom(x - PIXEL_SIZE, y, true, startColor, Directions.Right), 30);
  blockDir !== Directions.Up && isDrawable(C2Pix(x, y - PIXEL_SIZE)) &&
  await setTimeout(() => startFillFrom(x, y - PIXEL_SIZE, true, startColor, Directions.Down), 30);
  blockDir !== Directions.Right && isDrawable(C2Pix(x + PIXEL_SIZE, y)) &&
  await setTimeout(() => startFillFrom(x + PIXEL_SIZE, y, true, startColor, Directions.Left), 30);
  blockDir !== Directions.Down && isDrawable(C2Pix(x, y + PIXEL_SIZE)) &&
  await setTimeout(() => startFillFrom(x, y + PIXEL_SIZE, true, startColor, Directions.Up), 30);
  STATE.processes.terminatedByEnd++;
};

const changeColor = () => {
  _SETTINGS.general.color.current = (_SETTINGS.general.color.current + 1) % _SETTINGS.general.color.palette.length;
  STATE.currentColor = _SETTINGS.general.color.palette[_SETTINGS.general.color.current];
};

const Tools = {
  Pixel: 'Pixel',
  Line: 'Line',
  Fill: 'Fill',
  Colorizer: 'Colorizer',
  Clear: 'Clear',
};

const ToolsRenderer = {
  'Pixel': (x, y, sx, sy) => {
    fill(50);
    text('Pix', x, y, sx, sy);
  },
  'Line': (x, y, sx, sy) => {
    fill(50);
    text('Line', x, y, sx, sy);
  },
  'Fill': (x, y, sx, sy) => {
    fill(50);
    text('Fill', x, y, sx, sy);
  },
  'Colorizer': (x, y, sx, sy) => {
    fill(STATE.currentColor);
    rect(x, y, sx, sy);
    fill(50);
    text('COL', x, y, sx, sy);
  },
  'Clear': (x, y, sx, sy) => {
    fill(230, 40, 40);
    text('ERS', x, y, sx, sy);
  },
};

const ToolActions = {
  'Pixel': () => {STATE.activeTool = 'Pixel'},
  'Line': () => {STATE.activeTool = 'Line'},
  'Fill': () => {STATE.activeTool = 'Fill'},
  'Colorizer': () => {changeColor()},
  'Clear': () => {
    Object.keys(_SETTINGS.setup.modules).forEach(key => {
      _SETTINGS.setup.modules[key].model ?
        _SETTINGS.setup.modules[key].model.render()
        : (_SETTINGS.setup.modules[key].render ? _SETTINGS.setup.modules[key].render() : console.log('drawGrid isn\'t inited before clearing'))
    })
  },
};

class Toolbar {
  constructor() {
    _SETTINGS.setup.modules.toolbar.isActive = true;
    _SETTINGS.setup.modules.toolbar.model = this;
  }
  width = _SETTINGS.toolbar.width;
  height = _SETTINGS.toolbar.height;
  pos = {
    x: _SETTINGS.toolbar.offset.left,
    y: _SETTINGS.toolbar.offset.top,
  };
  borderRadius = 5;
  tools = [Tools.Pixel, Tools.Line, Tools.Fill, Tools.Colorizer, Tools.Clear];
  _margins = {
    top: _SETTINGS.toolbar.buttonOffset.top,
    left: _SETTINGS.toolbar.buttonOffset.left,
    innerTop: _SETTINGS.toolbar.offset.inner.top,
  };
  _blockSize = {
    height: 30,
    width: 30,
    textMargin: {
      top: _SETTINGS.toolbar.innerTextOffset.top,
      left: _SETTINGS.toolbar.innerTextOffset.left,
    }
  };
  _buttons = [];

  pressButton = () => {
    // Detecting button
    console.log(this._buttons);
    this._buttons.forEach(btn => {
      if (testXY(btn.from.x, btn.to.x, btn.from.y, btn.to.y)) {
        if (!['Clear', 'Colorizer'].includes(btn.name)) {
          STATE.activeTool = btn.name;
        }
        btn.callback();
        return;
      }
    })
  };

  render = () => {
    fill(COLORS.WHITE);
    stroke(COLORS.STROKE, 90);
    strokeWeight(1);

    rect(this.pos.x, this.pos.y,
      this.width, this.height,
      this.borderRadius, this.borderRadius, this.borderRadius, this.borderRadius
    );
    this.tools.forEach((tool, ind) => {
      if (tool === STATE.activeTool) {
        fill(COLORS.WHAY);
        stroke(COLORS.STROKE, 90);
      } else {
        fill(COLORS.WHITE);
        stroke(COLORS.STROKE, 10);
      }
      let px = this.pos.x + this._margins.left,
        py = this.pos.y + this._margins.innerTop + this._margins.top * (ind + 1) + this._blockSize.height * ind,
        sx = this._blockSize.width,
        sy = this._blockSize.height;
      (this._buttons.length < ind + 1) && this._buttons.push({name: tool, from: {x: px, y: py}, to: {x: px + sx, y: py + sy}, callback: ToolActions[tool]});
      rect(px, py, sx, sy);
      textAlign(CENTER, CENTER);
      ToolsRenderer[tool](
        px,
        py,
        sx,
        sy,
      );
    });

    fill(50);
    text('Toolbar', this.pos.x + 3, this.pos.y + 5, 60, 15);
  }
}
