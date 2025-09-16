import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Admin from './pages/admin';
import CuisinePanel from './pages/cuisine';
import SignIn from './pages/SignIn'
import Menu from './pages/menu';
import NotFound from './pages/notfound';
import Analytics from './pages/analytics';
import RestaurantPage from './pages/client'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SignIn /> } />
        <Route path="/orders" element={<Admin />} />
        <Route path="/cuisine" element={<CuisinePanel />} />
        <Route path="/inventory" element={<Menu />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/dashboard" element={<Analytics />} />
        <Route path='*' element={<NotFound />} />
        <Route path="/:code" element={<RestaurantPage />} />
      </Routes>
    </Router>
  );
}

export default App;