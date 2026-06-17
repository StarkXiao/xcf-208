import { useGameStore } from './game/store';
import RebirthScreen from './components/RebirthScreen';
import GameScreen from './components/GameScreen';
import './App.css';

function App() {
  const { screen } = useGameStore();

  return (
    <div className="app">
      {screen === 'rebirth' ? <RebirthScreen /> : <GameScreen />}
    </div>
  );
}

export default App;
