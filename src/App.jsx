import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./Pages/HomePage";
import FooterComponent from "./components/FooterComponent";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import ContactPage from "./Pages/ContactPage";
import AboutUsPage from "./Pages/AboutUsPage";
import ProfilePage from "./Pages/ProfilePage";
import ClinicianDashboard from "./Pages/ClinicianDashboard";
import ClinicianPatientDetail from "./Pages/ClinicianPatientDetail";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Router>
        <Header />
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/clinician-dashboard"
              element={<ClinicianDashboard />}
            />
            <Route
              path="/clinician-dashboard/:patientId"
              element={<ClinicianPatientDetail />}
            />
            {/* <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} /> */}
            {/* <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/patient-profile" element={<DashboardLayout><PatientProfilePage /></DashboardLayout>} />
            <Route path="/lab-entry" element={<DashboardLayout><LabEntryPage /></DashboardLayout>} />
            <Route path="/patient-images" element={<DashboardLayout><PatientImageUploadPage /></DashboardLayout>} />
            <Route path="/drug-recommendations" element={<DashboardLayout><DrugRecommendationPage /></DashboardLayout>} />
            <Route path="/treatment-guidelines" element={<DashboardLayout><GuidelineFlowPage /></DashboardLayout>} />
            <Route path="/safety-alerts" element={<DashboardLayout><SafetyAlertPage /></DashboardLayout>} /> */}
          </Routes>
        </div>
        <FooterComponent />
      </Router>
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
