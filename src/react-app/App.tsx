import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Credits from "./pages/Credits/Credits";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/credits" element={<Credits />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
