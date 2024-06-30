import { productModel } from "../../../DB/Models/product.model.js";
///
import cloudinary from '../../utils/coludinaryConfigrations.js'
import { customAlphabet } from 'nanoid'
import {createCanvas } from 'canvas';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { stringify } from "querystring";
const nanoid = customAlphabet('123456_=!ascbhdtel', 5)


///////////expo
export const mappp=async(req,res,next )=>{
  const{_barcodepos,_barcodedest}=req.body;
  
//get costumer current position
  const currentPos =await productModel.findOne({barcode:_barcodepos})
    if (!currentPos) {
      res.status(201).json({message:"pls scan again"})
    }
     const posx=currentPos.indexX;
     const posy=currentPos.indexY;
//get wanted item
     const productt = await productModel.findOne({barcode:_barcodedest});
    if (!productt) {
      return next(
        new Error("invalid product please check the qunatity", { cause: 400 })
      );
    }
   const destx=productt.indexX
   const desty=productt.indexY
   ////map generate
   // Define canvas dimensions
const canvasWidth = 1200;
const canvasHeight = 800;

// Create a canvas

const canvas = createCanvas(canvasWidth, canvasHeight);
const ctx = canvas.getContext('2d');

// Draw background
ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvasWidth, canvasHeight);

// Draw ruler-like outline
// ctx.strokeStyle = 'black';
// ctx.lineWidth = 2;

// // Draw horizontal lines and numbers
// for (let y = 0; y <= canvasHeight; y += 50) {
//     ctx.beginPath();
//     ctx.moveTo(0, y);
//     ctx.lineTo(canvasWidth, y);
//     ctx.stroke();
//     ctx.fillStyle = 'black';
//     ctx.fillText(y, 5, y + 10);
// }

// // Draw vertical lines and numbers
// for (let x = 0; x <= canvasWidth; x += 50) {
//     ctx.beginPath();
//     ctx.moveTo(x, 0);
//     ctx.lineTo(x, canvasHeight);
//     ctx.stroke();
//     ctx.fillStyle = 'black';
//     ctx.fillText(x, x + 5, 15);
// }

// Draw aisles
const aisles = [
    { x: 150, y: 100, width: 870, height: 600 },
   
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
ctx.fillStyle = "black";
ctx.fillText("    1",210,190);
ctx.fillText("    2",510,190);
ctx.fillText("    3",810,190);

ctx.fillText("    4",210,300);
ctx.fillText("    5",510,300);
ctx.fillText("    6",810,300);

ctx.fillText("    7",210,430);
ctx.fillText("    8",510,430);
ctx.fillText("    9",810,430);

ctx.fillText("    10",210,540);
ctx.fillText("    11",510,540);
ctx.fillText("    12",810,540);

ctx.fillText("    13",210,670);
ctx.fillText("    14",510,670);
ctx.fillText("    15",810,670);


// Draw checkout counter
// ctx.fillStyle = 'lightblue';
// ctx.fillRect(1100, 100, 100, 600);

// Draw entrance
ctx.fillStyle = 'green';
ctx.fillRect(0, 100, 80, 600);

// Draw exit
ctx.fillStyle = 'red';
ctx.fillRect(1130, 100, 100, 600);

// Draw customer's location
const customerX = posx;
const customerY = posy;
ctx.fillStyle = 'blue';
ctx.beginPath();
ctx.arc(customerX, customerY, 13, 0, Math.PI * 2);
ctx.fill();

// Draw destination
const destinationX = destx;
const destinationY = desty;
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
      const route = [currentNode];
  
      while (currentNode.toString() !== start.toString()) {
        currentNode = cameFrom[currentNode];
        route.push(currentNode);
      }
  
      return route.reverse();
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
const startNode = [destx, desty]
const goalNode = [posx,posy];
const route = astar.astarWithObstacles(startNode, goalNode);


console.log(route);

//draw route
function drawPath() {
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 10;
    ctx.beginPath();
    for (let i = 0; i < route.length - 1; i++) {
      const [x1, y1] = route[i];
      const [x2, y2] = route[i + 1];
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

console.log(posx,posy);

// Save canvas to a file
drawPath();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


    const outPath = path.join(__dirname, 'map.png');
    const out = fs.createWriteStream(outPath);
    const stream = canvas.createPNGStream();

    stream.pipe(out);

    out.on('finish', () => {
      
    });
    const customId = nanoid()
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        outPath,
        {
          folder: `${process.env.PROJECT_FOLDER}/navigation/${customId}`,
        },
      )
      
      res.status(200).json({message:"your map links ",secure_url,public_id})



}
