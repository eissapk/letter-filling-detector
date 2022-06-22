let painting = false;
let penWidth = 4;
let penColor = "black";
const originsDataArr = [];
const origins = document.querySelectorAll(".origin");

function getNonWhitePos(ctx, w, h) {
  // start taken from stackoverflow
  const toHex = val => (val & 0xff).toString(16).padStart(2, "0");
  const pixel2CSScolor = px => `#${toHex(px >> 16)}${toHex(px >> 8)}${toHex(px)}`;
  const bufferArr = new Uint32Array(ctx.getImageData(0, 0, w, h).data.buffer);
  // console.log({ bufferArr });
  // end taken from stackoverflow

  let x = 0;
  let y = 0;
  let data = [];
  for (var i = 0; i < bufferArr.length; i += 1) {
    const obj = { x, y, color: pixel2CSScolor(bufferArr[i]) };
    data.push(obj);
    x += 1;
    if (x >= w) {
      y += 1;
      x = 0;
    }
  }

  console.log({ fullData: data });
  return data.filter(item => item.color !== "#ffffff"); // return NON-white pxs positions
}

function handelOrigin(ctx, letter, w, h, y) {
  ctx.rect(0, 0, w, h);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.beginPath();

  const font = "150px serif";
  const lineWidth = 5;
  const textAlign = "left";

  ctx.font = font;
  ctx.lineWidth = lineWidth;
  ctx.textAlign = textAlign;
  ctx.fillStyle = "#c7c7c7";
  ctx.fillText(letter, -10, y);
  ctx.beginPath();

  return getNonWhitePos(ctx, w, h);
}

origins.forEach((origin, index) => {
  const parent = origin.parentElement;
  const originCTX = origin.getContext("2d");
  const letter = origin.getAttribute("data-letter");
  const [W, H, Y] = origin.getAttribute("data-dim").split("x");

  const layer = document.createElement("canvas");
  const layerCTX = origin.getContext("2d");
  layer.className = "layer";
  origin.width = Number(W);
  origin.height = Number(H);
  layer.width = Number(W) - 4;
  layer.height = Number(H) - 4;
  parent.style.width = W + "px";
  parent.style.height = H + "px";
  origin.parentElement.append(layer);

  let data = handelOrigin(originCTX, letter, Number(W), Number(H), Number(Y));
  originsDataArr.push(data);
  console.log("originsDataArr: getNonWhitePos", originsDataArr);

  // -------------------

  function reset(ctx) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  }

  const mousePos = e => {
    let status = e.type == "mousedown" ? true : false;
    if (status) {
      // mouse down
      painting = true;
      draw_via_mouse(e);
    } else {
      // mouse up
      painting = false;
      layerCTX.beginPath();
    }
  };

  const touchPos = e => {
    let status = e.type == "touchstart" ? true : false;
    if (status) {
      // touch start
      painting = true;
      draw_via_touch(e);
    } else {
      // touch end
      painting = false;
      layerCTX.beginPath();
    }
  };

  const draw_via_mouse = e => {
    e.preventDefault();
    const parent = e.target.parentElement;
    e = e || window.event;
    let x = e.clientX - parent.offsetLeft + window.scrollX;
    let y = e.clientY - parent.offsetTop + window.scrollY;
    if (!painting) return;

    if (x >= 0 && x <= e.target.offsetWidth && y >= 0 && y <= e.target.offsetHeight) {
      console.log("inside borders");
    } else {
      console.log("outside borders");
      return (painting = false);
    }

    layerCTX.lineWidth = penWidth;
    layerCTX.lineCap = "round";
    layerCTX.strokeStyle = penColor;
    layerCTX.lineTo(x, y);
    layerCTX.stroke();
    layerCTX.beginPath();
    layerCTX.moveTo(x, y);

    console.log({ x, y });

    // check coords
    const obj = originsDataArr[index].find(item => item.x === x && item.y === y);
    console.log(obj);
    if (obj) {
      console.warn("inside");
    } else {
      console.warn("outside");
      oConfirm({
        title: "Hint",
        desc: `You drew outside the letter ${letter}. Do you want to start over?`,
        btns: { cancel: { exists: true, text: "Cancel" }, okay: { text: "Okay" } },
      }).then(res => {
        if (res) {
          reset(layerCTX);
          handelOrigin(originCTX, letter, Number(W), Number(H), Number(Y));
        } else {
          console.log("cancel");
        }
      });
    }
  };

  const draw_via_touch = e => {
    e.preventDefault();
    const parent = e.target.parentElement;
    e = e || window.event;
    let x = e.touches[0].pageX - parent.offsetLeft + window.scrollX;
    let y = e.touches[0].pageY - parent.offsetTop + window.scrollY;
    if (!painting) return;

    if (x >= 0 && x <= e.target.offsetWidth && y >= 0 && y <= e.target.offsetHeight) {
      console.log("inside borders");
    } else {
      console.log("outside borders");
      return (painting = false);
    }

    layerCTX.lineWidth = penWidth;
    layerCTX.lineCap = "round";
    layerCTX.strokeStyle = penColor;
    layerCTX.lineTo(x, y);
    layerCTX.stroke();
    layerCTX.beginPath();
    layerCTX.moveTo(x, y);

    console.log({ x, y });

    // check coords
    const obj = originsDataArr[index].find(item => item.x === x && item.y === y);
    console.log(obj);
    if (obj) {
      console.warn("inside");
    } else {
      console.warn("outside");
      painting = false;
      oConfirm({
        title: "Hint",
        desc: `You drew outside the letter ${letter}. Do you want to start over?`,
        btns: { cancel: { exists: true, text: "Cancel" }, okay: { text: "Okay" } },
      }).then(res => {
        if (res) {
          reset(layerCTX);
          handelOrigin(originCTX, letter, Number(W), Number(H), Number(Y));
        } else {
          console.log("cancel");
        }
      });
    }
  };

  // events
  // desktop
  layer.onmousedown = mousePos;
  layer.onmouseup = mousePos;
  layer.onmousemove = draw_via_mouse;
  layer.onmouseleave = () => {
    painting = false;
    layerCTX.beginPath();
    console.log("Out Board: " + index);
  };
  // mobile
  layer.ontouchstart = touchPos;
  layer.ontouchend = touchPos;
  layer.ontouchmove = draw_via_touch;
});
