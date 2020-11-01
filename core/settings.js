let FRAME_RATE = 60;
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
  RED: [255, 110, 110],
  YELLOW: [255, 246, 138],

  GREEN: [138, 255, 154],
  BLUE: [62, 78, 235],
  CYAN: [99, 244, 246],
  MAGENTA: [240, 0, 240],
  DARKMAGENTA: [139, 0, 139],
  PINK: [255, 154, 186],
  DARKGREEN: [3, 88, 30],
  ORANGE: [255, 138, 28],

  GRAY: [193, 193, 193],
  DARKGRAY: [140, 140, 140],
  LIGHTBLACK: [40, 40, 40],
  STROKE: [193, 193, 193],
  BG: null, // to be defined
};
COLORS.BG = COLORS.WHITE;

const Directions = {
  Up: 1,
  Left: 2,
  Down: 3,
  Right: 4,
};

const Tools = {
  Pixel: 'Pixel',
  Line: 'Line',
  Fill: 'Fill',
  Colorizer: 'Colorizer',
  Clear: 'Clear',
  Export: 'Export',
};

const AlgoType = {
  BRZ: 0,
};


let _SETTINGS = {
  toolbar: {
    width: 60,
    height: 280,
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
    buttonSize: {
      width: 30,
      height: 30,
    },
    innerTextOffset: {
      top: 10,
      left: 2,
    },
    toolset: [Tools.Pixel, Tools.Line, Tools.Fill, Tools.Colorizer, Tools.Clear, Tools.Export],
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
      palette: [
        COLORS.RED,
        COLORS.PINK,
        COLORS.ORANGE,
        COLORS.YELLOW,
        COLORS.GREEN,
        COLORS.DARKGREEN,
        COLORS.BLUE,
        COLORS.CYAN,
        COLORS.MAGENTA,
        COLORS.DARKMAGENTA,
        COLORS.BLACK,
        COLORS.WHITE
      ],
    },
    hotkeys: {
      isActive: false,
      linker: {},
    },
  },
  cursors:
    [
      {
        region: 'none',
        cursor: 'default',
      },
      {
        region: 'activeArea',
        cursor: 'crosshair',
      },
      {
        region: 'toolbar',
        cursor: 'pointer',
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
    },
    initialState: {
      activeTool: 'Line',
      activeRegion: null,
      currentColor: null,
      processes: {
        created: 0,
        terminatedByColor: 0,
        terminatedByEnd: 0,
      }
    }
  }
};

class SettingsManager {
  enableHotkeys     = () => _SETTINGS.general.hotkeys.isActive = true;
  disableHotkeys    = () => _SETTINGS.general.hotkeys.isActive = false;
  setHotkeys = (object) => {
    if (_SETTINGS.general.hotkeys.isActive)
      throw new Error('For fault tolerance purposes, changing hot keys while they are enabled is prohibited.');
    _SETTINGS.general.hotkeys.linker = object;
  };
}

const _SettingsManager = new SettingsManager();

_SETTINGS.setup.initialState.currentColor = _SETTINGS.general.color.palette[_SETTINGS.general.color.current];

