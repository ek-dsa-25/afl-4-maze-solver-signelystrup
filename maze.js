function randomInteger(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

class Cell {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.walls = {
            top: true,
            right: true,
            bottom: true,
            left: true,
        };
        this.visited = false;
        this.image = "none";
    }

    // Hjælpefunktion til generate(): Tegn cellen
    draw(ctx, cellWidth) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const px = this.x * cellWidth;
        const py = this.y * cellWidth;

        ctx.moveTo(px, py);

        if (this.walls.left) {
            ctx.lineTo(px, py + cellWidth);
        } else {
            ctx.moveTo(px, py + cellWidth);
        }

        if (this.walls.bottom) {
            ctx.lineTo(px + cellWidth, py + cellWidth);
        } else {
            ctx.moveTo(px + cellWidth, py + cellWidth);
        }

        if (this.walls.right) {
            ctx.lineTo(px + cellWidth, py);
        } else {
            ctx.moveTo(px + cellWidth, py);
        }

        if (this.walls.top) {
            ctx.lineTo(px, py);
        } else {
            ctx.moveTo(px, py);
        }

        ctx.stroke();
    }

    // Hjælpefunktion til generate(): find naboerne i grid vha. this.x og this.y
    unvisitedNeighbors(grid) {
        let neighbors = [];

        // Vi er ikke den nordligste celle
        if (this.y > 0) {
            const nord_x = this.x;
            const nord_y = this.y - 1;
            const nord_nabo = grid[nord_x][nord_y];
            if (!nord_nabo.visited) {
                neighbors.push(nord_nabo);
            }
        }

        // Vi er ikke cellen mest til venstre
        if (this.x > 0) {
            const venstre_x = this.x - 1;
            const venstre_y = this.y;
            const venstre_nabo = grid[venstre_x][venstre_y];
            if (!venstre_nabo.visited) {
                neighbors.push(venstre_nabo);
            }
        }

        // Vi er ikke den sydligste celle
        if (this.y < grid[0].length - 1) {
            const syd_x = this.x;
            const syd_y = this.y + 1;
            const syd_nabo = grid[syd_x][syd_y];
            if (!syd_nabo.visited) {
                neighbors.push(syd_nabo);
            }
        }

        // Vi er ikke cellen mest til højre
        if (this.x < grid.length - 1) {
            const højre_x = this.x + 1;
            const højre_y = this.y;
            const højre_nabo = grid[højre_x][højre_y];
            if (!højre_nabo.visited) {
                neighbors.push(højre_nabo);
            }
        }

        return neighbors;
    }

    // Hjælpefunktion til generate(): Fjerner en væg
    punchWallDown(otherCell) {
        const dx = this.x - otherCell.x;
        const dy = this.y - otherCell.y;

        if (dx === 1) {
            // otherCell er til venstre for this
            this.walls.left = false;
            otherCell.walls.right = false;
        } else if (dx === -1) {
            // otherCell er til højre for this
            this.walls.right = false;
            otherCell.walls.left = false;
        } else if (dy === 1) {
            // otherCell er over this
            this.walls.top = false;
            otherCell.walls.bottom = false;
        } else if (dy === -1) {
            // otherCell er under this
            this.walls.bottom = false;
            otherCell.walls.top = false;
        }
    }

    // Hjælpefunktion til MazeSolver: Finder de naboer som ikke har en væg
    connectedNeighbors(grid) {
        let neighbors = [];

        
        // Tjek om naboen nord for, hvis den findes, har en væg
        if (this.y > 0 && !this.walls.top){
            const nord_x = this.x;
            const nord_y = this.y - 1;
            const nord_nabo = grid[nord_x][nord_y];
            neighbors.push(nord_nabo)
        }

        // Tjek om naboen til venstre, hvis den findes, har en væg
        if (this.x > 0 && !this.walls.left){
            const left_x = this.x - 1;
            const left_y = this.y ;
            const left_nabo = grid[left_x][left_y];
            neighbors.push(left_nabo)
        }

        // Tjek om naboen syd for, hvis den findes, har en væg
        if (this.y < grid[0].length - 1 && !this.walls.bottom){
            const south_x = this.x;
            const south_y = this.y + 1;
            const south_neighbor = grid[south_x][south_y];
            neighbors.push(south_neighbor)
        }
        // Tjek om naboen til højre, hvis den findes, har en væg
        if (this.x < grid.length - 1 && !this.walls.right){
            const right_x = this.x + 1;
            const right_y = this.y;
            const right_nabo = grid[right_x][right_y];
            neighbors.push(right_nabo)
        }

        return neighbors;
    }

    // Hjælpefunktion til MazeSolver: Sammenligner om to celler er ens
    equals(otherCell) {
        return this.x === otherCell.x && this.y === otherCell.y;
    }

    // Hjælpefunktion til MazeSolver: Fremhæver cellen som en del af stien
    drawPath(ctx, cellWidth, isMouse) {
        /*
        // TODO: Personliggør denne funktion.
        ctx.fillStyle = color;
        const px = this.x * cellWidth + cellWidth * 0.25;
        const py = this.y * cellWidth + cellWidth * 0.25;
        const size = cellWidth * 0.5;
        ctx.fillRect(px, py, size, size);*/
        
        const px = this.x * cellWidth;
        const py = this.y * cellWidth;

        const image = new Image;
        if (isMouse){
            image.src = "images/mouse.png";
        }else{
            image.src = this.image === "none" ? "images/step.png" : "images/" + this.image + ".png";
        }

        ctx.fillStyle = "white";
        ctx.fillRect(px +2,py +2, cellWidth-2, cellWidth-2); //clear previous image.

        ctx.drawImage(image, px +4, py +4, cellWidth-4, cellWidth-4); 
    }
}

class Maze {
    constructor(cols, rows, canvas) {
        this.grid = [];
        this.cols = cols;
        this.rows = rows;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellWidth = canvas.width / cols;
        this.initializeGrid();
    }

    initializeGrid() {
        for (let i = 0; i < this.rows; i += 1) {
            this.grid.push([]);
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i].push(new Cell(i, j));
            }
        }
    }

    draw() {
        for (let i = 0; i < this.rows; i += 1) {
            for (let j = 0; j < this.cols; j += 1) {
                this.grid[i][j].draw(this.ctx, this.cellWidth);
            }
        }
    }

    generate() {
        const start_x = randomInteger(0, this.cols);
        const start_y = randomInteger(0, this.rows);
        let currentCell = this.grid[start_x][start_y];
        let stack = [];

        currentCell.visited = true;
        console.log("connected neighbors: ", currentCell.connectedNeighbors(this.grid) );
        // Get unvisited neighbors
        // If there are unvisited neighbors:
        // - pick a random one of them
        // - carve a hole through the wall
        // - push current cell on stack
        // - make that neighbor the current cell
        // If not, make the top of stack the current cell
        // If still not, you're done

        while (currentCell != null) {
            let unvisitedNeighbors = currentCell.unvisitedNeighbors(this.grid);
            if (unvisitedNeighbors.length > 0) {
                const randomNeighborCell = unvisitedNeighbors[randomInteger(0, unvisitedNeighbors.length)];
                currentCell.punchWallDown(randomNeighborCell);
                stack.push(currentCell);
                currentCell = randomNeighborCell;
                currentCell.visited = true;
            } else {
                currentCell = stack.pop();
            }
        }
    }

}

class MazeSolver {
    constructor(maze) {
        this.maze = maze;
    }

    resetPathfindingState() {
        for (let i = 0; i < this.maze.rows; i += 1) {
            for (let j = 0; j < this.maze.cols; j += 1) {
                this.maze.grid[i][j].visited = false;
                this.maze.grid[i][j].parent = null;
            }
        }
    }

    findPath(startX, startY, endX, endY) {
        this.resetPathfindingState();

        const startCell = this.maze.grid[startX][startY];
        const endCell = this.maze.grid[endX][endY];

        startCell.image = "start";
        endCell.image = "cheese";

        // TODO: Lav `findPath()` vha. enten DFS (stak) eller BFS (queue)
        
        let path = [];
        let stack = [];
        let visited = [];
        stack.push(startCell);

        while(stack.length > 0){
            const currentCell = stack.pop();
            visited.push(currentCell);
            path.push(currentCell);

            //console.log("current cell: ", currentCell);

            if (currentCell === endCell){
                return path;
            }
            
            //add neighbors to stack:
            const connectedNeighbors = currentCell.connectedNeighbors(this.maze.grid);
            for (let i = 0; i < connectedNeighbors.length; i++){
                if( !visited.includes(connectedNeighbors[i]) ){
                    stack.push(connectedNeighbors[i]);
                }else{
                    
                }
            }//end of for loop

            if (connectedNeighbors.length <= 1){
                currentCell.image = "backtrack";
                console.log("backtrack...");
            }

            console.log(currentCell.image);


        }//end of while

        return null;
    }

    reconstructPath(startCell, endCell) {
        const path = [];
        let currentCell = endCell;

        while (currentCell !== null) {
            path.unshift(currentCell);
            currentCell = currentCell.parent;
        }

        return path.length > 0 && path[0].equals(startCell) ? path : null;
    }

    drawPath(path, color = '#ff0000') {
        if (!path) return;

        for (const cell of path) {
            cell.drawPath(this.maze.ctx, this.maze.cellWidth, false);
        }
    }

    async drawPathStepwise(path, color = '#ff0000', delay = 100) {
        if (!path) return;

        let prevCell = null;

        path[0].drawPath(this.maze.ctx, this.maze.cellWidth, false);

        for (const cell of path) {

            if (prevCell != null){
                prevCell.drawPath(this.maze.ctx, this.maze.cellWidth, false);
            }
            cell.drawPath(this.maze.ctx, this.maze.cellWidth, true);

            prevCell = cell;
        path[path.length -1].drawPath(this.maze.ctx, this.maze.cellWidth, false);

            await this.sleep(delay);
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const maze = new Maze(20, 20, canvas);

    maze.generate();

    maze.draw();

    // Demonstrate pathfinding - find path from top-left to bottom-right
    const solver = new MazeSolver(maze);
    const startX = 0;
    const startY = 0;
    const endX = maze.cols - 1;
    const endY = maze.rows - 1;

    const path = solver.findPath(startX, startY, endX, endY);
    console.log("path, ", path);
    solver.drawPathStepwise(path, '#ff0000', 100);

    console.log(maze);
})
