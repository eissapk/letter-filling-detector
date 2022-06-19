let painting = false;
let eraserToggle = true;
let penWidth = 5;
let penColor = "blue";
let lastWidth;
let lastColor;
let timeout = [];
// select canvas
const canvas1 = document.querySelector("#one");
const ctx1 = canvas1.getContext("2d");
const w = 200;
const h = 200;
canvas1.width = w;
canvas1.height = h;

//! try with rectangle
// draw white firstly
// ctx1.rect(0, 0, 200, 200);
// ctx1.fillStyle = "white";
// ctx1.fill();
// ctx1.beginPath();
// draw desired color secondly
// ctx1.rect(0, 0, 100, 100);
// ctx1.fillStyle = "#FF0000";
// ctx1.fill();

//! try with text
// draw white background
ctx1.rect(0, 0, 200, 200);
ctx1.fillStyle = "white";
ctx1.fill();
ctx1.beginPath();

const font = "150px serif";
const lineWidth = 5;
const textAlign = "left";
const letter = ["ت", 0, 100];

// draw text as fallback to fill the space between dashes
ctx1.font = font;
ctx1.lineWidth = lineWidth;
ctx1.textAlign = textAlign;
ctx1.fillStyle = "#eee";
ctx1.fillText(...letter);
ctx1.beginPath();

// draw desired text
ctx1.font = font;
ctx1.lineWidth = 2;
ctx1.textAlign = textAlign;
ctx1.setLineDash([5, 7]);
ctx1.strokeStyle = "#000";
ctx1.strokeText(...letter);

const data = getNonWhitePos(ctx1, w, h);
console.log("getNonWhitePos", data);

// ------------

const canvas2 = document.querySelector("#two");
canvas2.width = window.innerWidth - 20;
canvas2.height = window.innerHeight - 20;
const ctx2 = canvas2.getContext("2d");

// mouse position
const mousePos = e => {
  let status = e.type == "mousedown" ? true : false;
  if (status) {
    // mouse down
    painting = true;
    draw_via_mouse(e);
  } else {
    // mouse up
    painting = false;
    ctx2.beginPath();
  }
};

// draw via mouse
const draw_via_mouse = e => {
  // prevent default behavior
  e.preventDefault();

  // !start getting cursor pos
  e = e || window.event;
  let a = e.target.getBoundingClientRect();
  let x = e.pageX - a.left;
  let y = e.pageY - a.top;
  // !end getting cursor pos
  if (!painting) return;

  ctx2.lineWidth = penWidth;
  ctx2.lineCap = "round";
  ctx2.strokeStyle = penColor;
  ctx2.lineTo(x, y);
  ctx2.stroke();
  ctx2.beginPath();
  ctx2.moveTo(x, y);
  // console.log(ctx1.isPointInPath(x, y)); // this is used with rect methods only not with text
  console.log({ x, y });

  const obj = data.find(item => item.x === x && item.y === y);
  console.log(obj);

  if (obj) {
    console.warn("inside");
  } else {
    console.warn("outside");
    const time = setTimeout(() => {
      alert("you are ouside the letter, start over");
      location.reload();
    }, 200);
    timeout.push(time);
    timeout.forEach((item, index, array) => {
      if (index !== array.length - 1) clearTimeout(item);
    });
  }
};

canvas2.addEventListener("mousedown", mousePos);
canvas2.addEventListener("mouseup", mousePos);
canvas2.addEventListener("mousemove", draw_via_mouse);

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
