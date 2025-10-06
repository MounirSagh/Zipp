import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Admin from "./pages/admin";
import CuisinePanel from "./pages/cuisine";
import SignIn from "./pages/SignIn";
import Menu from "./pages/menu";
import NotFound from "./pages/notfound";
import Analytics from "./pages/analytics";
import RestaurantPage from "./pages/client";
import Feedbacks from "./pages/feedbacks";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/orders" element={<Admin />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/cuisine" element={<CuisinePanel />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/inventory" element={<Menu />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/menu" element={<Menu />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/dashboard" element={<Analytics />} />
        <Route path="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/feedbacks" element={<Feedbacks />} />
        <Route path="/:code/:table" element={<RestaurantPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
