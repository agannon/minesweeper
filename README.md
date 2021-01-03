### Install Dependencies

`npm run install`

### Run Server

`npm start`

Open up localhost:3000

### How to play

In the grid there are a number of mines. 

Your goal is to find them all and flag them.

If you click on a cell and see a number, that means there are that many mines adjacent to that cell.
If there is nothing, then there are no mines adjacent.

Using deduction from these numbers, if you suspect a square contains a mine, right click to add a flag.

In this version of minesweeper, adjacency wraps around the board, so that every square including edges and corners have 8 adjacent squares