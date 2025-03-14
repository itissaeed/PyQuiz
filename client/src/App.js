import { Button } from "antd";
import "./stylesheets/theme.css";
import "./stylesheets/alignments.css";
import "./stylesheets/textelements.css";
import "./stylesheets/custom-components.css";
import "./stylesheets/form-elements.css";
import "./stylesheets/layout.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from 'react';
import Loader from "./components/Loader";
import { useSelector } from "react-redux";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load components
const Login = lazy(() => import("./pages/common/Login"));
const Register = lazy(() => import("./pages/common/Register"));
const Home = lazy(() => import("./pages/common/Home"));
const Exams = lazy(() => import("./pages/admin/Exams"));
const AddEditExam = lazy(() => import("./pages/admin/Exams/AddEditExam"));
const WriteExam = lazy(() => import("./pages/user/WriteExam"));
const UserReports = lazy(() => import("./pages/user/UserReports"));
const AdminReports = lazy(() => import("./pages/admin/AdminReports"));

function App() {
  const { loading } = useSelector((state) => state.loader);
  return (
    <>
      {loading && <Loader />}
      <BrowserRouter>
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Common Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* User Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/write-exam/:id"
              element={
                <ProtectedRoute>
                  <WriteExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/user/reports"
              element={
                <ProtectedRoute>
                  <UserReports />
                </ProtectedRoute>
              }
            />
            {/* Admin Routes */}
            <Route
              path="/admin/exams"
              element={
                <ProtectedRoute>
                  <Exams />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/exams/add"
              element={
                <ProtectedRoute>
                  <AddEditExam />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/exams/edit/:id"
              element={
                <ProtectedRoute>
                  <AddEditExam />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}

export default App;
