import "./App.css";
import Landing from "./pages/Landing";
import { Route, Routes } from "react-router-dom";
//import Rooms from "./pages/Rooms";
import Temp from "./pages/Temp";
const App = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/rooms/:roomId" element={<Temp />} />
      </Routes>
    </div>
  );
};

export default App;
