import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminLayout from './components/AdminLayout';
import RequireRole from './components/RequireRole';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Posts from './pages/Posts';
import Initiatives from './pages/Initiatives';
import Programs from './pages/Programs';
import Events from './pages/Events';
import Testimonials from './pages/Testimonials';
import Volunteers from './pages/Volunteers';
import Newsletter from './pages/Newsletter';
import Donations from './pages/Donations';
import ImpactStats from './pages/ImpactStats';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import Users from './pages/Users';

export default function App() {
  return (
    <BrowserRouter basename="/admin">
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AdminLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/initiatives" element={<Initiatives />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/events" element={<Events />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/volunteers" element={<Volunteers />} />
            <Route path="/newsletter" element={<Newsletter />} />
            <Route path="/donations" element={<Donations />} />
            <Route path="/impact-stats" element={<ImpactStats />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/settings" element={<Settings />} />
            <Route
              path="/users"
              element={
                <RequireRole role="super_admin">
                  <Users />
                </RequireRole>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
