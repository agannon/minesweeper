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

  const handleLeftClick = (x, y) => {
    if (!props.timerIsRunning) {
      props.startTimer();
    }

    let cell = grid[x][y];
    cell.status = CELL_STATUSES.clicked;

    if (cell.contents === CELL_CONTENTS.empty) {
      cell.contents = getNeighborMineCount(x, y);
    } else {
      props.stopTimer();
    }

    const grid2 = JSON.parse(JSON.stringify(grid));
    grid2[x][y] = cell;
    setGrid(grid2);

  }

  const handleRightClick = (x, y) => {
    let cell = grid[x][y];
    cell.status = CELL_STATUSES.flagged;

    const grid2 = JSON.parse(JSON.stringify(grid));
    grid2[x][y] = cell;
    setGrid(grid2);

    props.changeFlagCount(false);

  }

  const getNeighborMineCount = (x, y) => {
    //console.log(grid);
    let is, js;
    let count = 0;
    // if (x === 0) {
    //   is = [x, x + 1];
    // } else if (x === props.length - 1) {
    //   is = [x - 1, x];
    // } else {
    //   is = [x - 1, x, x + 1];
    // }
    is = [props.length + x - 1, x, x + 1].map(item => item % props.length);
    js = [props.length + y - 1, y, y + 1].map(item => item % props.length);

    // if (y === 0) {
    //   js = [y, y + 1];
    // } else if (y === props.length - 1) {
    //   js = [y - 1, y];
    // } else {
    //   js = [y - 1, y, y + 1];
    // }

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