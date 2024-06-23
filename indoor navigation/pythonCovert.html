<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Supermarket Map</title>
<style>
  canvas {
    border: 1px solid black;
  }
</style>
</head>
<body>
<canvas id="mapCanvas" width="500" height="500"></canvas>
<script>
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

const costsWithObstacles = {
  '0,0': { '1,0': 1, '0,1': 1 },
  '0,1': { '0,0': 1, '0,2': 1 },
  '0,2': { '0,1': 1, '0,3': 1 },
  '0,3': { '0,2': 1, '0,4': 1, '1,3': 1 },
  '0,4': { '0,3': 1, '1,4': 1 },
  '1,0': { '0,0': 1, '2,0': 1, '1,1': 1 },
  '1,1': { '1,0': 1, '1,2': 1 },
  '1,2': { '1,1': 1, '1,3': 1 },
  '1,3': { '0,3': 1, '1,2': 1, '1,4': 1, '2,3': 1 },
  '1,4': { '0,4': 1, '1,3': 1, '2,4': 1 },
  '2,0': { '1,0': 1, '3,0': 1, '2,1': 1 },
  '2,1': { '2,0': 1, '2,2': 1 },
  '2,2': { '2,1': 1, '2,3': 1 },
  '2,3': { '1,3': 1, '2,2': 1, '3,3': 1 },
  '2,4': { '1,4': 1, '3,4': 1 },
  '3,0': { '2,0': 1, '3,1': 1 },
  '3,1': { '3,0': 1, '3,2': 1 },
  '3,2': { '3,1': 1, '3,3': 1, '4,2': 1 },
  '3,3': { '2,3': 1, '3,2': 1, '3,4': 1 },
  '3,4': { '2,4': 1, '3,3': 1 },
  '4,2': { '3,2': 1 },
};

const sectionNames = {
  '0,0': 'Entrance',
  '0,1': 'Aisle',
  '0,2': 'Aisle',
  '0,3': 'Aisle',
  '0,4': 'Aisle',
  '1,0': 'Section 1',
  '1,1': 'Aisle',
  '1,2': 'Aisle',
  '1,3': 'Section 5',
  '1,4': 'Aisle',
  '2,0': 'Aisle',
  '2,1': 'Aisle',
  '2,2': 'Aisle',
  '2,3': 'Aisle',
  '2,4': 'Aisle',
  '3,0': 'Section 2',
  '3,1': 'Aisle',
  '3,2': 'Section 3',
  '3,3': 'Checkout',
  '3,4': 'Aisle',
  '4,2': 'Section 4',
};

const astar = new AStar(costsWithObstacles);
const startNode = [0, 4];
const goalNode = [3, 3];
const path = astar.astarWithObstacles(startNode, goalNode);

const canvas = document.getElementById('mapCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 100;

function drawGrid() {
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, 500);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(500, i * cellSize);
    ctx.stroke();
  }
}

function drawSections() {
  ctx.fillStyle = 'gray';
  for (const node in costsWithObstacles) {
    const [x, y] = node.split(',').map(Number);
    if (!(x === startNode[0] && y === startNode[1]) && !(x === goalNode[0] && y === goalNode[1])) {
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }

  ctx.fillStyle = 'white';
  ctx.font = '12px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const section in sectionNames) {
    const [x, y] = section.split(',').map(Number);
    ctx.fillText(sectionNames[section], x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);
  }
}

function drawPath() {
  ctx.strokeStyle = 'blue';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i < path.length - 1; i++) {
    const [x1, y1] = path[i];
    const [x2, y2] = path[i + 1];
    ctx.moveTo(x1 * cellSize + cellSize / 2, y1 * cellSize + cellSize / 2);
    ctx.lineTo(x2 * cellSize + cellSize / 2, y2 * cellSize + cellSize / 2);
  }
  ctx.stroke();
}

function drawStartAndGoal() {
  ctx.fillStyle = 'green';
  ctx.fillRect(startNode[0] * cellSize, startNode[1] * cellSize, cellSize, cellSize);

  ctx.fillStyle = 'red';
  ctx.fillRect(goalNode[0] * cellSize, goalNode[1] * cellSize, cellSize, cellSize);
}

function drawMap() {
  drawGrid();
  drawSections();
  drawPath();
  drawStartAndGoal();
}

drawMap();
</script>
</body>
</html>
