import './App.css';
import { MinesweeperContainer } from "./minesweeper/Minesweeper.jsx";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <MinesweeperContainer
          length={10}
          numMines={25}
        />
      </header>
    </div>
  );
}

export default App;
