let h = 8;
let w = 12;

class MazeGenerator {
    constructor(w, h, holes) {
        this.w = w;
        this.h = h;
        this.holes = holes;
    }

    generate() {
        this.H = 2 * this.h + 1;
        this.W = 2 * this.w + 1;

        this.grid = new Array(this.H);
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = new Array(this.W);
            this.grid[i].fill(1);
        }

        let current_row = Math.floor(Math.random() * this.h) * 2 + 1;
        let current_col = Math.floor(Math.random() * this.w) * 2 + 1;
        this.grid[current_row][current_col] = 0;

        let num_trials = 0;

        while (current_row != -1 && current_col != -1) {
            num_trials += 1;
            this.walk(current_row, current_col);

            [current_row, current_col] = this.hunt(num_trials);
        }

        this.generateEntrances();
        this.printPretty();
        this.addHoles();

        this.printPretty();
    }

    walk(row, col) {
        if (this.grid[row][col] == 0) {
            let this_row = row;
            let this_col = col;

            let unvisited_neighbors = this.find_neighbors(
                this_row, this_col, 2);

            while (unvisited_neighbors.length > 0) {
                let neighbor = unvisited_neighbors[Math.floor(Math.random() * unvisited_neighbors.length)];
                this.grid[neighbor[0]][neighbor[1]] = 0;
                this.grid[Math.floor((neighbor[0] + this_row) / 2)][Math.floor((neighbor[1] + this_col) / 2)] = 0;
                [this_row, this_col] = neighbor;

                unvisited_neighbors = this.find_neighbors(
                    this_row, this_col, 2);
            }
        }
    }

    find_neighbors(r, c, dist) {
        let ns = [];
        if (r > 1 && this.grid[r - dist][c])
            ns.push([r - dist, c]);

        if (r < this.H - dist && this.grid[r + dist][c])
            ns.push([r + dist, c]);

        if (c > 1 && this.grid[r][c - dist])
            ns.push([r, c - dist]);

        if (c < this.W - dist && this.grid[r][c + dist])
            ns.push([r, c + dist]);

        return ns;
    }

    hunt(count) {
        if (count >= (this.H * this.W))
            return [-1, -1];

        return [Math.floor(Math.random() * this.h) * 2 + 1, Math.floor(Math.random() * this.w) * 2 + 1];
    }

    generateEntrances() {
        let start_side = Math.floor(Math.random() * 4);
        switch (start_side) {
            case 0:
                this.start = [0, Math.floor(Math.random() * this.w) * 2 + 1]; // North
                this.end = [this.H - 1, Math.floor(Math.random() * this.w) * 2 + 1];
                break;
            case 1:
                this.start = [this.H - 1, Math.floor(Math.random() * this.w) * 2 + 1];  // South
                this.end = [0, Math.floor(Math.random() * this.w) * 2 + 1];
                break;
            case 2:
                this.start = [Math.floor(Math.random() * this.h) * 2 + 1, 0];  // West
                this.end = [Math.floor(Math.random() * this.h) * 2 + 1, this.W - 1];
                break;
            default:
                this.start = [Math.floor(Math.random() * this.h) * 2 + 1, this.W - 1]  // East
                this.end = [Math.floor(Math.random() * this.h) * 2 + 1, 0];
        }

        if (Math.abs(this.start[0] - this.end[0]) + Math.abs(this.start[1] - this.end[1]) < 2)
            this.generateEntrances();
    }

    addHoles() {
        let holesAdded = this.holes;
        while (holesAdded > 0) {
            let current_row = Math.floor(Math.random() * (this.H - 2)) + 1;
            let current_col = Math.floor(Math.random() * (this.W - 2)) + 1;

            if (this.grid[current_row][current_col] == 0) continue;

            //Check if it has both (above or below) and (left or right)
            //If it does, skip, because it is a junction
            if ((this.grid[current_row][current_col-1] == 1 || this.grid[current_row][current_col+1] == 1) &&
                (this.grid[current_row-1][current_col] == 1 || this.grid[current_row+1][current_col] == 1)) continue;

            this.grid[current_row][current_col] = 0;
            console.log(current_col + " " + current_row);
            holesAdded--;
        }
    }

    printPretty() {
        for (let i = 0; i < this.grid.length; i++) {
            let ret = "";
            for (let j = 0; j < this.grid[i].length; j++) {
                if (j == this.start[1] && i == this.start[0]) {
                    ret += "🟩";
                } else if (j == this.end[1] && i == this.end[0]) {
                    ret += "🟥";
                } else {
                    ret += (this.grid[i][j] == 1) ? "⬛️" : "⬜️";
                }

            }
            console.log(ret);
        }
    }
}

m = new MazeGenerator(h, w, 30);
m.generate();
console.log(m.start + " " + m.end);
