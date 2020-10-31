document.addEventListener('contextmenu', event => event.preventDefault());
document.addEventListener("keydown", event => {
  console.log(event.key, event.keyCode);
  if (event.isComposing || event.keyCode === 229) {
    return;
  }
  // do something
});

const ldm = new LDM();
const tbar = new Toolbar();

function setup() {
  createCanvas(CANVAS_W, CANVAS_H);
  frameRate(FRAME_RATE);
  //console.log("Setup completed");
  //console.log(CANVAS_HC, CANVAS_WC);
  cursor(CROSS);

  STATE.activeTool = Tools.Line;
  STATE.currentColor = COLORS.RED;

  drawGrid();
  draw();
  tbar.render();
  //noLoop();


}

function draw() {
  utilsFixedUpdate();
  let [x, y] = C2Pix(mouseX, mouseY);

  if (mouseIsPressed) {
    //console.log(x, y, mouseX, mouseY);
    switch (STATE.activeRegion) {
      case 'activeArea':
        switch (STATE.activeTool) {
          case 'Line':
            if (mouseButton === LEFT) {
              ldm.setCoord(0, x, y);
              putPixel([x, y], COLORS.GRAY);
              //console.log('1 point');
            }
            if (mouseButton === RIGHT) {
              ldm.setCoord(1, x, y);
              //console.log('2 point');
              putPixel([x, y], COLORS.GRAY);
              ldm.draw();
            }
            break;
          case 'Pixel':
            if (mouseButton === LEFT) {
              putPixel([x, y]);
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
          default:
            console.log('Unknown tool used');
            break;
        }
        break;

      case 'toolbar':
        if (mouseButton === LEFT) {
          tbar.pressButton();
          tbar.render();
        }
        break;
      default:
        console.log('Unused area');
        break;
    }


  }
}

