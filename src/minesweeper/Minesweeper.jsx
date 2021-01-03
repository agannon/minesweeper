import {useState} from "react";
import "./Minesweeper.css"
import {useStopwatch} from "react-timer-hook";

const feather = require('feather-icons');


const CELL_STATUSES = Object.freeze({
  unClicked: 'unClicked',
  clicked: 'clicked',
  flagged: 'flagged'
});

const CELL_CONTENTS = Object.freeze({
  mine: 'mine',
  empty: 'empty'
});

const COLOR_BY_NUMBER = Object.freeze({
  1: 'blue',
  2: 'green',
  3: 'red',
  4: 'purple',
  5: 'orange',
  6: 'cyan',
  7: 'white',
  8: 'black'
})

const MinesweeperContainer = (props) => {

  const [numFlags, setNumFlags] = useState(props.numMines);

  const {
    seconds,
    minutes,
    hours,
    days,
    isRunning,
    start,
    pause,
    reset,
  } = useStopwatch();

  const changeFlagCount = (incr) => {
    setNumFlags(incr ? numFlags + 1 : numFlags - 1);
  }

  return (
    <>
      <div className={'minesweeper-container'}>
        <div className={'header-item'}>{numFlags}</div>
        <div className={'header-item'}
             onClick={() => window.location.reload()}
        >Reset
        </div>
        <div className={'header-item'}>{minutes}:{seconds.toString().padStart(2, '0')}</div>
      </div>
      <Grid
        length={props.length}
        numMines={props.numMines}
        changeFlagCount={changeFlagCount}
        startTimer={start}
        stopTimer={pause}
        timerIsRunning={isRunning}
      />
    </>
  );
}

const Grid = (props) => {
  const mines = getNRandomNumFromNaturalsLessThanM(props.numMines, props.length * props.length);
  let emptyArray = new Array(props.length);

  // Fill grid with mines
  for (let i = 0; i < props.length; i++) {
    emptyArray[i] = new Array(props.length);
    for (let j = 0; j < props.length; j++) {
      const absVal = i * props.length + j;
      emptyArray[i][j] = {
        status: CELL_STATUSES.unClicked,
        contents: mines.includes(absVal) ? CELL_CONTENTS.mine : CELL_CONTENTS.empty
      };
    }
  }

  /**
   * If there is a mine, show mine and stop clock
   * Else show the number of adjacent mines if any
   * @param x - x position in the grid
   * @param y - y posiiton in the grid
   */
  const handleLeftClick = (x, y) => {
    if (!props.timerIsRunning) {
      props.startTimer();
    }

    let cell = grid[x][y];
    cell.status = CELL_STATUSES.clicked;

    if (cell.contents === CELL_CONTENTS.empty) {
      cell.contents = getNeighborMineCount(x, y);
    } else {
      // If there is a mine the game is over
      props.stopTimer();
    }

    const grid2 = JSON.parse(JSON.stringify(grid));
    grid2[x][y] = cell;
    setGrid(grid2);

  }

  /**
   * If a user suspects there is a mine here
   * Add a flag to the board and decrease the number of remaining flags
   * @param x - x position in the grid
   * @param y - y posiiton in the grid
   */
  const handleRightClick = (x, y) => {
    let cell = grid[x][y];
    cell.status = CELL_STATUSES.flagged;

    const grid2 = JSON.parse(JSON.stringify(grid));
    grid2[x][y] = cell;
    setGrid(grid2);

    props.changeFlagCount(false);
  }

  /**
   * Gets the number of mines in the 8 adjacent cells
   * Ranges from 0 to 8
   * @param x - x position in the grid
   * @param y - y posiiton in the grid
   * @returns {number}
   */
  const getNeighborMineCount = (x, y) => {
    let is, js;
    let count = 0;

    // Get the adjacent cells for the cell located at (x, y)
    is = [props.length + x - 1, x, x + 1].map(item => item % props.length);
    js = [props.length + y - 1, y, y + 1].map(item => item % props.length);

    for (let i of is) {
      for (let j of js) {
        if (i === x && j === y) {
          continue
        }
        if (grid[i][j].contents === CELL_CONTENTS.mine) {
          count += 1;
        }
      }
    }

    return count;
  }


  const [grid, setGrid] = useState(emptyArray);
  const rows = grid.map((row, index) =>
    <Row
      key={index}
      cells={row}
      // Using bind here in order to curry the function for partial application
      handleLeftClick={handleLeftClick.bind(null, index)}
      handleRightClick={handleRightClick.bind(null, index)}
    />);


  return (
    <>
      {rows}
    </>
  );
};

const Row = (props) => {
  const rowItems = props.cells.map((cell, index) =>
    <Cell
      key={index}
      status={cell.status}
      contents={cell.contents}
      // Using bind here in order to curry the function for partial application
      handleLeftClick={props.handleLeftClick.bind(null, index)}
      handleRightClick={props.handleRightClick.bind(null, index)}
    />);

  return (
    <div className={'grid-row'}>
      {rowItems}
    </div>
  );
}

const Cell = (props) => {
  let className, icon, display, iconOptions, style;
  switch (props.status) {
    case CELL_STATUSES.unClicked:
      className = 'unclicked-cell';
      break;
    case CELL_STATUSES.flagged:
      className = 'unclicked-cell';
      icon = 'flag';
      iconOptions = {color: "red"};
      break;
    default:
      if (props.contents === CELL_CONTENTS.mine) {
        className = 'clicked-cell';
        icon = 'sun';
      } else {
        className = 'clicked-cell';
        display = props.contents > 0 ? props.contents : '';
        const color = COLOR_BY_NUMBER[display];
        style = color ? {color: color} : null;
      }
  }
  let svg;
  if (icon) {
    const blob = new Blob([feather.icons[icon].toSvg(iconOptions)], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(blob);
    svg = <img src={url} alt={"YO"}/>
  }

  return (
    <div
      onClick={props.handleLeftClick}
      onContextMenu={(event) => {
        event.preventDefault();
        props.handleRightClick()
      }}
      className={className}
      style={style}
    >
      {display}
      {svg}
    </div>
  );
}

/**
 * Gets n random natural number from range 1..m without replacement
 * @param n
 * @param m
 * @returns {[]}
 */
const getNRandomNumFromNaturalsLessThanM = (n, m) => {
  let bucket = new Array(m);
  let choices = [];

  for (let i = 0; i < m; i++) {
    bucket[i] = i;
  }
  let randomIndex;

  while (n > 0) {
    randomIndex = Math.floor(Math.random() * bucket.length);
    choices.push(bucket[randomIndex]);
    bucket.splice(randomIndex, 1);
    n--;
  }

  return choices;
}

export {
  MinesweeperContainer
};