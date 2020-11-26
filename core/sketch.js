document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener('clearEvent', event => {
  ldm.__reset();
});
document.addEventListener("keydown", event => {
  //console.log(event.key, event.keyCode);
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  handleHotkey(event.key);
  // do something
});
document.addEventListener("color-block", event => {
  console.log(event);
  STATE.colorBlocked = event.detail.value;
});


const ldm = new LDM(PolyMan);
const tbar = new Toolbar();
let [x, y] = [0, 0];

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  frameRate(FRAME_RATE);
  countSizes();

  STATE.activeTool = Tools.Line;
  STATE.currentColor = COLORS.RED;

  _SettingsManager.setHotkeys({
    'q': ToolActions[Tools.Clear],
    'p': () => {
      STATE.activeTool = Tools.Pixel;
      tbar.render();
    },
    'l': () => {
      STATE.activeTool = Tools.Line;
      tbar.render();
    },
    'f': () => {
      STATE.activeTool = Tools.Fill;
      tbar.render();
    },
    'r': () => {
      STATE.activeTool = Tools.Rectangle;
      tbar.render();
    },
    'm': () => {
      STATE.activeTool = Tools.Masking;
      tbar.render();
    },
    'c': () => {
      ToolActions[Tools.Colorizer](LEFT);
      tbar.render();
    },
    'x': () => {
      ToolActions[Tools.Colorizer](RIGHT);
      tbar.render();
    },
  });
  _SettingsManager.enableHotkeys();

  drawGrid();
  draw();
  tbar.render();
  setInterval(utilsFixedUpdate, 50);

  // Debug: painting area size in cells
  // console.log(_SETTINGS.general.activeArea.cellBorders);

  noLoop();
}

function mousePressed() {
  loop();
}

function mouseReleased() {
  switch (STATE.activeRegion) {
    case 'activeArea':
      switch (STATE.activeTool) {
        case 'Line':
        case 'Rectangle':
        case 'Masking':
          if (mouseButton === LEFT) {
            ldm.setCoord(0, x, y);
          }
          if (mouseButton === RIGHT) {
            ldm.setCoord(1, x, y);
            ldm.draw();
          }
          break;
        case 'Polygon':
          if (mouseButton === LEFT) {
            ldm.setCoord(ldm.firstpoint ? 0 : 1, x, y);
            if (!ldm.firstpoint) {
              ldm.draw().then(() => ldm.setCoord(0, x, y));
            } else {
              ldm.firstpoint = false;
            }
            /*
            if (figure_closed) {
              ldm.firstpoint = true;
            }
             */
          }
          if (mouseButton === RIGHT) {
            ldm.setCoord(0, x, y);
            ldm.firstpoint = false;
          }
          break;
        case 'Fill':
          if (mouseButton === LEFT) {
            let sc = get(mouseX, mouseY).slice(0, 3);
            if (arraysEqual(sc, STATE.currentColor)) {
              break;
            }
            startFillFrom(mouseX, mouseY, true, sc);
          }
          break;
      }
      break;

    case 'toolbar':
      if (mouseButton === LEFT || mouseButton === RIGHT) {
        tbar.pressButton(mouseButton);
        tbar.render();
      }
      break;
  }
  noLoop();
}

function draw() {
  [x, y] = C2Pix(mouseX, mouseY);
  //console.log(x, y);

  // Funny dot-area in center
  /*stroke('purple');
  strokeWeight(4);
  let i = 0, j = 0;
  while (i < 30) {
    j = 0;
    while (j < 30) {
      let cr = Pix2C([i - 15, j - 15]);
      point(cr[0], cr[1]);
      j++;
    }
    i++;
  }*/

  switch (STATE.activeRegion) {
    case 'activeArea':
      switch (STATE.activeTool) {
        case 'Pixel':
          if (mouseButton === LEFT) {
            putPixel([x, y]);
          }
          break;
      }
      break;
  }

}

