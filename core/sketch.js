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

const ldm = new LDM();
const tbar = new Toolbar();
let [x, y] = [0, 0];

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  frameRate(FRAME_RATE);
  //console.log("Setup completed");
  //console.log(CANVAS_HC, CANVAS_WC);

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
          if (mouseButton === LEFT) {
            ldm.setCoord(0, x, y);
          }
          if (mouseButton === RIGHT) {
            ldm.setCoord(1, x, y);
            ldm.draw();
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

