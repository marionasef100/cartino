const { createCanvas } = require('canvas');
const fs = require('fs');


// Define canvas dimensions
const canvasWidth = 1200;
const canvasHeight = 800;

// Create a canvas

const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = 'lightgray';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

// Draw ruler-like outline
ctx.strokeStyle = 'black';
ctx.lineWidth = 2;

// Draw horizontal lines and numbers
for (let y = 0; y <= canvasHeight; y += 50) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fillText(y, 5, y + 10);
}

// Draw vertical lines and numbers
for (let x = 0; x <= canvasWidth; x += 50) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
    ctx.fillStyle = 'black';
    ctx.fillText(x, x + 5, 15);
}

// Draw aisles
const aisles = [
    { x: 150, y: 100, width: 870, height: 30 },
    { x: 150, y: 225, width: 870, height: 30 },
    { x: 150, y: 350, width: 870, height: 30 },
    { x: 150, y: 460, width: 870, height: 30 },
    { x: 150, y: 585, width: 870, height: 30 },
    { x: 150, y: 700, width: 900, height: 30 },
    { x: 150, y: 100, width: 30, height: 600 },
    { x: 450, y: 100, width: 30, height: 600 },
    { x: 750, y: 100, width: 30, height: 600 },
    { x: 1020, y: 100, width: 30, height: 600 }
];

ctx.fillStyle = 'white';
for (let aisle of aisles) {
    ctx.fillRect(aisle.x, aisle.y, aisle.width, aisle.height);
}

// Draw shelves
ctx.fillStyle = 'gray';
for (let i = 0; i < 5; i++) {
    ctx.fillRect(200, 150 + i * 120, 200, 50);
    ctx.fillRect(500, 150 + i * 120, 200, 50);
    ctx.fillRect(800, 150 + i * 120, 200, 50);
}

//write sections name
ctx.font="35px Arial"
ctx.fillStyle = "purple";
ctx.fillText("section 1",210,190);
ctx.fillText("section 2",510,190);
ctx.fillText("section 3",810,190);

ctx.fillText("section 4",210,300);
ctx.fillText("section 5",510,300);
ctx.fillText("section 6",810,300);

ctx.fillText("section 7",210,430);
ctx.fillText("section 8",510,430);
ctx.fillText("section 9",810,430);

ctx.fillText("section 10",210,540);
ctx.fillText("section 11",510,540);
ctx.fillText("section 12",810,540);

ctx.fillText("section 13",210,670);
ctx.fillText("section 14",510,670);
ctx.fillText("section 15",810,670);


// Draw checkout counter
ctx.fillStyle = 'lightblue';
ctx.fillRect(1100, 100, 100, 600);

// Draw entrance
ctx.fillStyle = 'green';
ctx.fillRect(0, 350, 60, 100);

// Draw exit
ctx.fillStyle = 'red';
ctx.fillRect(1140, 350, 60, 100);

// Draw customer's location
const customerX = 160;
const customerY = 365;
ctx.fillStyle = 'blue';
ctx.beginPath();
ctx.arc(customerX, customerY, 13, 0, Math.PI * 2);
ctx.fill();

// Draw destination
const destinationX = 1150;
const destinationY = 240;
ctx.fillStyle = 'orange';
ctx.beginPath();
ctx.arc(destinationX, destinationY, 13, 0, Math.PI * 2);
ctx.fill();



//a star impelmentation
class PriorityQueue {
    constructor() {
      this.elements = [];
    }
  
    enqueue(element, priority) {
      this.elements.push({ element, priority });
      this.elements.sort((a, b) => a.priority - b.priority);
    }
  
    dequeue() {
      return this.elements.shift().element;
    }
  
    isEmpty() {
      return this.elements.length === 0;
    }
  }
  
  class AStar {
    constructor(costs) {
      this.costs = costs;
    }
  
    heuristic(node, goal) {
      const [x1, y1] = node;
      const [x2, y2] = goal;
      return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    }
  
    reconstructPath(cameFrom, start, goal) {
      let currentNode = goal;
      const path = [currentNode];
  
      while (currentNode.toString() !== start.toString()) {
        currentNode = cameFrom[currentNode];
        path.push(currentNode);
      }
  
      return path.reverse();
    }
  
    astarWithObstacles(start, goal) {
      const gCosts = { [start]: 0 };
      const fCosts = { [start]: this.heuristic(start, goal) };
      const openList = new PriorityQueue();
      openList.enqueue(start, fCosts[start]);
      const cameFrom = {};
  
      while (!openList.isEmpty()) {
        const currentNode = openList.dequeue();
  
        if (currentNode.toString() === goal.toString()) {
          break;
        }
  
        for (const neighbor of Object.keys(this.costs[currentNode])) {
          const tentativeGCost = gCosts[currentNode] + this.costs[currentNode][neighbor];
  
          if (!(neighbor in gCosts) || tentativeGCost < gCosts[neighbor]) {
            gCosts[neighbor] = tentativeGCost;
            fCosts[neighbor] = tentativeGCost + this.heuristic(neighbor.split(',').map(Number), goal);
            openList.enqueue(neighbor.split(',').map(Number), fCosts[neighbor]);
            cameFrom[neighbor] = currentNode;
          }
        }
      }
  
      return this.reconstructPath(cameFrom, start, goal);
    }
  }
  
//draw fixed points on the map
const costsWithObstacles = {
  //first line
    '160,110': { '460,110': 7, '160,240': 3 },
    '160,240': { '160,110': 3, '460,240': 3,'160,365':3 },
    '160,365': { '160,240': 3, '460,365': 7,'160,475':3 },
    '160,475': { '160,365': 3, '460,475': 7, '160,600': 3 },
    '160,600': { '160,475': 3, '460,600': 7,'160,725':3 },
    '160,725': { '160,600': 3, '460,725': 7 },
    //second line
    '460,110': { '160,110': 7, '460,240': 3, '760,110': 7 },
    '460,240': { '460,110': 3, '160,240': 7 ,'760,240':7,'460,365':3},
    '460,365': { '460,240': 3, '160,365': 7 ,'760,365':7,'460,475':3 },
    '460,475': { '460,365': 3, '160,475': 7 ,'760,475':7,'460,600':3 },
    '460,600': { '460,475': 3, '160,600': 7 ,'760,600':7,'460,725':3 },
    '460,725': { '460,600': 3, '160,725': 7 ,'760,725':7 },
    //third line
    '760,110': { '460,110': 7, '760,240': 3,'1040,110':3},
    '760,240': { '460,240': 7, '760,365': 3,'1040,240':7,'760,110':3},
    '760,365': { '460,365': 7, '760,240': 3,'1040,365':7,'760,475':3},
    '760,475': { '460,475': 7, '760,365': 3,'1040,475':7,'760,600':3},
    '760,600': { '460,600': 7, '760,475': 3,'1040,600':7,'760,725':3},
    '760,725': { '460,725': 7, '760,600': 3,'1040,725':7},
    //forth line
    '1040,110':{'760,110':7,'1040,240':3},
    '1040,240':{'1040,110':3,'1040,365':3,'760,240':7,'1150,240':5},
    '1040,365':{'1040,240':3,'1040,475':3,'760,365':7},
    '1040,475':{'1040,365':3,'1040,600':3,'760,475':7},
    '1040,600':{'1040,475':3,'1040,725':3,'760,600':7},
    '1040,725':{'1040,600':3,'760,725':7},
    //cahair 
    '1150,240':{'1040,240':5}

   
  };


const astar = new AStar(costsWithObstacles);
const startNode = [destinationX, destinationY]
const goalNode = [customerX,customerY];
const path = astar.astarWithObstacles(startNode, goalNode);


console.log(path);

//draw path
function drawPath() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < path.length - 1; i++) {
      const [x1, y1] = path[i];
      const [x2, y2] = path[i + 1];
      ctx.moveTo(x1 , y1 );
      ctx.lineTo(x2 , y2 );
    }
    ctx.stroke();
  }
  function drawStartAndGoal() {
    ctx.fillStyle = 'green';
    ctx.fillRect(startNode[0] , startNode[1] );
  
    ctx.fillStyle = 'red';
    ctx.fillRect(goalNode[0] , goalNode[1]);
  }



// Save canvas to a file
drawPath();

const out = fs.createWriteStream(__dirname + '/map.png');
const stream = canvas.createPNGStream();
stream.pipe(out);
out.on('finish', () => console.log('Map image created.'));



