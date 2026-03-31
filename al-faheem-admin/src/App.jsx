import { Routes, Route, Navigate } from 'react-router-dom';
import { getAccessToken } from './api/client.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import Users from './pages/Users.jsx';
import Subjects from './pages/Subjects.jsx';
import QuestionsList from './pages/QuestionsList.jsx';
import ExamTemplates from './pages/ExamTemplates.jsx';
import Payments from './pages/Payments.jsx';
import ContactMessages from './pages/ContactMessages.jsx';
import ContactSettings from './pages/ContactSettings.jsx';
import FeedbackList from './pages/FeedbackList.jsx';
import Faq from './pages/Faq.jsx';
import TestimonialsManage from './pages/TestimonialsManage.jsx';
import AboutSettings from './pages/AboutSettings.jsx';
import HomepageSettings from './pages/HomepageSettings.jsx';
import SubscriptionPlans from './pages/SubscriptionPlans.jsx';

function PrivateRoute({ children }) {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="users" element={<Users />} />
        <Route path="subjects" element={<Subjects />} />
        <Route path="questions" element={<QuestionsList />} />
        <Route path="exam-templates" element={<ExamTemplates />} />
        <Route path="payments" element={<Payments />} />
        <Route path="subscription-plans" element={<SubscriptionPlans />} />
        <Route path="contact" element={<ContactMessages />} />
        <Route path="contact-settings" element={<ContactSettings />} />
        <Route path="feedback" element={<FeedbackList />} />
        <Route path="faq" element={<Faq />} />
        <Route path="testimonials" element={<TestimonialsManage />} />
        <Route path="about-settings" element={<AboutSettings />} />
        <Route path="homepage-settings" element={<HomepageSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
