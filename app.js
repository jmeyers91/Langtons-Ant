const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const instructionsInput = document.querySelector('#instructions');
const height = canvas.height = window.innerHeight;
const width = canvas.width = height;
const fps = 1000;
const columns = 50;
const rows = 50;
const cellWidth = width / columns;
const cellHeight = height / rows;
const directions = {UP: 'UP', DOWN: 'DOWN', LEFT: 'LEFT', RIGHT: 'RIGHT'};
const rightTurnMap = {UP: 'RIGHT', DOWN: 'LEFT', LEFT: 'UP', RIGHT: 'DOWN'};
const leftTurnMap = {UP: 'LEFT', DOWN: 'RIGHT', LEFT: 'DOWN', RIGHT: 'UP'};
const moveMap = {UP: {x: 0, y: -1}, DOWN: {x: 0, y: 1}, LEFT: {x: -1, y: 0}, RIGHT: {x: 1, y: 0}};
let ants, grid, cells, paused;

function last(array) {
  return array[array.length - 1];
}

function reset() {
  instructions = instructionsInput.value
    .toUpperCase()
    .trim()
    .split('')
    .filter((c) => /L|R/.test(c))
    .map((c) => c === 'L' ? 'LEFT' : 'RIGHT')
    .map((direction, i, {length}) => {
      return {direction, color: i === 0 ? 'WHITE' : `hsl(${(i / (length - 1)) * 360}, 80%, 80%)`};
    });
  grid = Array.from({length: rows}).map((_, y) => {
    return Array.from({length: columns}).map((_, x) => {
      return {x, y, color: instructions[0].color};
    });
  });
  cells = grid.reduce((cells, row) => [...cells, ...row], []);
  ants = [{x: Math.floor(columns / 2), y: Math.floor(rows / 2), direction: 'UP'}];
  paused = true;
}

function step() {
  if(paused) return;
  ants.forEach((ant) => {
    const square = grid[ant.y][ant.x];
    if(!square) return;
    const lastInstruction = last(instructions);
    const squareInstruction = instructions.find((inst) => inst.color === square.color);
    const nextInstruction = squareInstruction === lastInstruction ?
      instructions[0] :
      instructions[instructions.indexOf(squareInstruction) + 1];

    if(squareInstruction.direction === 'LEFT') {
      ant.direction = leftTurnMap[ant.direction];
    } else {
      ant.direction = rightTurnMap[ant.direction];
    }
    const movement = moveMap[ant.direction];
    ant.x += movement.x;
    ant.y += movement.y;
    square.color = nextInstruction.color;
  });
  render();
}

function render() {
  context.clearRect(0, 0, width, height);
  context.save();
  context.strokeStyle = '#AAA';
  context.fillStyle = '#444';
  cells.forEach((cell) => {
    const {x, y, color} = cell;
    context.fillStyle = color;
    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    context.strokeRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
  });
  context.restore();
  ants.forEach((ant) => {
    const {x, y} = ant;
    context.fillStyle = '#A00';
    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
  });
}

function pointToCell(point) {
  const cellX = Math.floor(point.x / cellWidth);
  const cellY = Math.floor(point.y / cellHeight);
  return grid[cellY][cellX];
}

function getClickPoint(canvas, event) {
  const {top, left} = canvas.getBoundingClientRect();
  const {clientX, clientY} = event;
  return {
    x: clientX - left,
    y: clientY - top
  };
}

canvas.addEventListener('click', (event) => {
  const cell = pointToCell(getClickPoint(canvas, event));
  const existsAlready = ants.some((ant) => ant.x === cell.x && ant.y === cell.y);
  if(!existsAlready && cell) {
    ants.push({x: cell.x, y: cell.y, direction: directions.UP});
  }
});

window.addEventListener('keydown', (event) => {
  console.log(event.which);
  if(event.which === 32) paused = !paused;
  else if(event.which === 82) {
    reset();
  }
});

instructionsInput.addEventListener('change', reset);

reset();

setInterval(() => {
  step();
  render();
}, 1000 / fps);

document.body.appendChild(canvas);
