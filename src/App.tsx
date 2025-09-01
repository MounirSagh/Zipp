import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/admin';
import CuisinePanel from './pages/cuisine';
import SignIn from './pages/SignIn'
import Menu from './pages/menu';
import NotFound from './pages/notfound';
import Analytics from './pages/analytics';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<SignIn /> } />
        <Route path="/admin" element={<Admin />} />
        <Route path="/cuisine" element={<CuisinePanel />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;