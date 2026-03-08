import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import DashboardLayout from "./components/IT22577160/DashboardLayout";
import HomePage from "./Pages/HomePage";
import FooterComponent from "./components/FooterComponent";
import SignUp from "./Pages/SignUp";
import SignIn from "./Pages/SignIn";
import ContactPage from "./Pages/ContactPage";
import AboutUsPage from "./Pages/AboutUsPage";
import ProfilePage from "./Pages/ProfilePage";
import DashboardPage from "./Pages/IT22577160/DashboardPage";
import PatientProfilePage from "./Pages/IT22577160/PatientProfilePage";
import LabEntryPage from "./Pages/IT22577160/LabEntryPage";
import PatientImageUploadPage from "./Pages/IT22577160/PatientImageUploadPage";
import AnalyzePage from './Pages/IT22577160/AnalyzePage';
import AnalysisRecordsPage from './Pages/IT22577160/AnalysisRecordsPage';
import DrugRecommendationPage from "./components/IT22577160/DrugRecommendationCard";
import GuidelineFlowPage from "./components/IT22577160/GuidelineStepFlow";
import SafetyAlertPage from "./components/IT22577160/SafetyAlert";
// IT22607232 — Risk & Side-Effect Profiling
import DashboardNew from "./Pages/IT22607232/DashboardNew";
import RiskAssessment from "./Pages/IT22607232/RiskAssessment";
import RiskResultsPage from "./Pages/IT22607232/RiskResultsPage";
import RiskHistoryPage from "./Pages/IT22607232/RiskHistoryPage";
import ReviewQueuePage from "./Pages/active-learning/ReviewQueuePage";
import ReviewCaseDetailPage from "./Pages/active-learning/ReviewCaseDetailPage";
import ActiveLearningStatusPage from "./Pages/active-learning/ActiveLearningStatusPage";
import ModelRegistryPage from "./Pages/ModelRegistryPage"
import AdminReviewQueuePage from "./Pages/ReviewQueuePage"
import DeveloperIntegrationGuide from "./Pages/DeveloperIntegrationGuide";
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
            <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/active-learning/review" element={<ReviewQueuePage />} />
            <Route
              path="/active-learning/review/:caseId"
              element={<ReviewCaseDetailPage />}
            />
            <Route
              path="/active-learning/status"
              element={<ActiveLearningStatusPage />}
            />
            <Route path="/admin/models" element={<ModelRegistryPage />} />
            <Route path="/admin/review-queue" element={<AdminReviewQueuePage />} />
            <Route
              path="/developer-integration-guide"
              element={<DeveloperIntegrationGuide />}
            />
             <Route path="/profile" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
            <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
            <Route path="/patient-profile" element={<DashboardLayout><PatientProfilePage /></DashboardLayout>} />
            <Route path="/lab-entry" element={<DashboardLayout><LabEntryPage /></DashboardLayout>} />
            <Route path="/patient-images" element={<DashboardLayout><PatientImageUploadPage /></DashboardLayout>} />
            <Route path="/drug-recommendations" element={<DashboardLayout><DrugRecommendationPage /></DashboardLayout>} />
            <Route path="/treatment-guidelines" element={<DashboardLayout><GuidelineFlowPage /></DashboardLayout>} />
            <Route path="/safety-alerts" element={<DashboardLayout><SafetyAlertPage /></DashboardLayout>} />
            <Route path="/analyze" element={<DashboardLayout><AnalyzePage /></DashboardLayout>} />
            <Route path="/analysis-records" element={<DashboardLayout><AnalysisRecordsPage /></DashboardLayout>} />

            {/* IT22607232 — Risk & Side-Effect Profiling */}
            <Route path="/risk-dashboard" element={<DashboardLayout><DashboardNew /></DashboardLayout>} />
            <Route path="/risk-assessment" element={<DashboardLayout><RiskAssessment /></DashboardLayout>} />
            <Route path="/risk-results" element={<DashboardLayout><RiskResultsPage /></DashboardLayout>} />
            <Route path="/risk-history" element={<DashboardLayout><RiskHistoryPage /></DashboardLayout>} />
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
