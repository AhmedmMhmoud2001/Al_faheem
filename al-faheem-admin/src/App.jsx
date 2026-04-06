import { Routes, Route, Navigate } from 'react-router-dom';
import { getAccessToken } from './api/client.js';
import { getCurrentRole } from './api/auth-utils.js';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Login from './pages/Login.jsx';
import DashboardOverview from './pages/DashboardOverview.jsx';
import Users from './pages/Users.jsx';
import UserCreate from './pages/UserCreate.jsx';
import UserEdit from './pages/UserEdit.jsx';
import UserDetail from './pages/UserDetail.jsx';
import StaffRoles from './pages/StaffRoles.jsx';
import StaffRoleCreate from './pages/StaffRoleCreate.jsx';
import StaffRoleEdit from './pages/StaffRoleEdit.jsx';
import Subjects from './pages/Subjects.jsx';
import SubjectCreate from './pages/SubjectCreate.jsx';
import SubjectEdit from './pages/SubjectEdit.jsx';
import Subcategories from './pages/Subcategories.jsx';
import SubcategoryCreate from './pages/SubcategoryCreate.jsx';
import SubcategoryEdit from './pages/SubcategoryEdit.jsx';
import QuestionsList from './pages/QuestionsList.jsx';
import QuestionCreate from './pages/QuestionCreate.jsx';
import QuestionEdit from './pages/QuestionEdit.jsx';
import ExamTemplates from './pages/ExamTemplates.jsx';
import ExamTemplateCreate from './pages/ExamTemplateCreate.jsx';
import ExamTemplateEdit from './pages/ExamTemplateEdit.jsx';
import Payments from './pages/Payments.jsx';
import ContactMessages from './pages/ContactMessages.jsx';
import ContactSettings from './pages/ContactSettings.jsx';
import FeedbackList from './pages/FeedbackList.jsx';
import Faq from './pages/Faq.jsx';
import FaqItemCreate from './pages/FaqItemCreate.jsx';
import FaqItemEdit from './pages/FaqItemEdit.jsx';
import TestimonialsManage from './pages/TestimonialsManage.jsx';
import TestimonialCreate from './pages/TestimonialCreate.jsx';
import TestimonialEdit from './pages/TestimonialEdit.jsx';
import AboutSettings from './pages/AboutSettings.jsx';
import HomepageSettings from './pages/HomepageSettings.jsx';
import SubscriptionPlans from './pages/SubscriptionPlans.jsx';
import SubscriptionPlanCreate from './pages/SubscriptionPlanCreate.jsx';
import SubscriptionPlanEdit from './pages/SubscriptionPlanEdit.jsx';
import TrialSettings from './pages/TrialSettings.jsx';

function PrivateRoute({ children }) {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  return children;
}

/** Only ADMIN can access this route; STAFF gets redirected to dashboard */
function AdminRoute({ children }) {
  if (!getAccessToken()) return <Navigate to="/login" replace />;
  if (getCurrentRole() !== 'ADMIN') return <Navigate to="/" replace />;
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

        {/* Users — admin only */}
        <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
        <Route path="users/create" element={<AdminRoute><UserCreate /></AdminRoute>} />
        <Route path="users/:id" element={<AdminRoute><UserDetail /></AdminRoute>} />
        <Route path="users/:id/edit" element={<AdminRoute><UserEdit /></AdminRoute>} />

        {/* Staff Roles — admin only */}
        <Route path="staff-roles" element={<AdminRoute><StaffRoles /></AdminRoute>} />
        <Route path="staff-roles/create" element={<AdminRoute><StaffRoleCreate /></AdminRoute>} />
        <Route path="staff-roles/:id/edit" element={<AdminRoute><StaffRoleEdit /></AdminRoute>} />

        {/* Subjects — accessible by STAFF with MANAGE_SUBJECTS permission */}
        <Route path="subjects" element={<Subjects />} />
        <Route path="subjects/create" element={<SubjectCreate />} />
        <Route path="subjects/:id/edit" element={<SubjectEdit />} />

        {/* Subcategories */}
        <Route path="subcategories" element={<Subcategories />} />
        <Route path="subcategories/create" element={<SubcategoryCreate />} />
        <Route path="subcategories/:id/edit" element={<SubcategoryEdit />} />

        {/* Questions — accessible by STAFF with MANAGE_QUESTIONS permission */}
        <Route path="questions" element={<QuestionsList />} />
        <Route path="questions/create" element={<QuestionCreate />} />
        <Route path="questions/:id/edit" element={<QuestionEdit />} />

        {/* Exam Templates — admin only */}
        <Route path="exam-templates" element={<AdminRoute><ExamTemplates /></AdminRoute>} />
        <Route path="exam-templates/create" element={<AdminRoute><ExamTemplateCreate /></AdminRoute>} />
        <Route path="exam-templates/:id/edit" element={<AdminRoute><ExamTemplateEdit /></AdminRoute>} />

        {/* Payments & Subscription — admin only */}
        <Route path="payments" element={<AdminRoute><Payments /></AdminRoute>} />
        <Route path="subscription-plans" element={<AdminRoute><SubscriptionPlans /></AdminRoute>} />
        <Route path="subscription-plans/create" element={<AdminRoute><SubscriptionPlanCreate /></AdminRoute>} />
        <Route path="subscription-plans/:id/edit" element={<AdminRoute><SubscriptionPlanEdit /></AdminRoute>} />

        {/* Contact — admin only */}
        <Route path="contact" element={<AdminRoute><ContactMessages /></AdminRoute>} />
        <Route path="contact-settings" element={<AdminRoute><ContactSettings /></AdminRoute>} />
        <Route path="feedback" element={<AdminRoute><FeedbackList /></AdminRoute>} />

        {/* FAQ — admin only */}
        <Route path="faq" element={<AdminRoute><Faq /></AdminRoute>} />
        <Route path="faq/create" element={<AdminRoute><FaqItemCreate /></AdminRoute>} />
        <Route path="faq/:id/edit" element={<AdminRoute><FaqItemEdit /></AdminRoute>} />

        {/* Testimonials — admin only */}
        <Route path="testimonials" element={<AdminRoute><TestimonialsManage /></AdminRoute>} />
        <Route path="testimonials/create" element={<AdminRoute><TestimonialCreate /></AdminRoute>} />
        <Route path="testimonials/:id/edit" element={<AdminRoute><TestimonialEdit /></AdminRoute>} />

        {/* Settings — admin only */}
        <Route path="about-settings" element={<AdminRoute><AboutSettings /></AdminRoute>} />
        <Route path="homepage-settings" element={<AdminRoute><HomepageSettings /></AdminRoute>} />
        <Route path="trial-settings" element={<AdminRoute><TrialSettings /></AdminRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
