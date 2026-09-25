import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PageLoader } from './components/ui/LoadingState.jsx';
import PublicLayout from './components/layout/PublicLayout.jsx';
import AuthLayout from './components/layout/AuthLayout.jsx';
import { ProtectedRoute, RoleRoute } from './components/layout/RouteGuards.jsx';

const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const CatalogPage = lazy(() => import('./pages/CatalogPage.jsx'));
const CoursePage = lazy(() => import('./pages/CoursePage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const QuizPage = lazy(() => import('./pages/QuizPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader label="Chargement de l’interface" />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="catalogue" element={<CatalogPage />} />
          <Route path="cours/:slug" element={<CoursePage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="connexion" element={<LoginPage />} />
          <Route path="inscription" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="tableau-de-bord" element={<DashboardPage />} />
          <Route path="quiz/:quizId" element={<QuizPage />} />
          <Route path="profil" element={<ProfilePage />} />
        </Route>

        <Route element={<RoleRoute role="admin" />}>
          <Route path="admin" element={<AdminPage />} />
        </Route>

        <Route path="/connexion" element={<Navigate to="/connexion" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
