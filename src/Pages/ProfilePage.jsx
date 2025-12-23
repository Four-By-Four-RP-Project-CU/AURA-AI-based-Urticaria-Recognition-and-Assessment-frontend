import React, { useEffect, useState } from "react";
import { Button } from "flowbite-react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { FaUserShield, FaChartLine, FaCalendarCheck, FaHeartbeat } from "react-icons/fa";

const profileHighlights = [
  {
    label: "Case Reviews",
    value: "128",
    subtext: "Completed this month",
    icon: FaChartLine,
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    label: "Clear Diagnoses",
    value: "94%",
    subtext: "AI confirmation rate",
    icon: FaHeartbeat,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    label: "Follow-up Plans",
    value: "37",
    subtext: "Active care journeys",
    icon: FaCalendarCheck,
    gradient: "from-cyan-500 to-blue-500",
  },
];

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        navigate("/sign-in", { replace: true });
      } else {
        setUser(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-indigo-950 py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl rounded-3xl p-10 shadow-2xl border border-white/30 dark:border-gray-800">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                {(user.displayName || user.email || "AURA").substring(0, 2).toUpperCase()}
              </div>
              <span className="absolute -bottom-3 -right-3 bg-emerald-400 text-emerald-950 text-xs font-semibold px-3 py-1 rounded-full">
                Active
              </span>
            </div>
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="inline-flex items-center gap-3 bg-blue-100/60 dark:bg-blue-900/40 text-blue-700 dark:text-blue-200 px-4 py-2 rounded-full text-sm font-semibold">
                <FaUserShield />
                Verified Clinical Access
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {user.displayName || "AURA Specialist"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    UID
                  </p>
                  <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">
                    {user.uid}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    Member Since
                  </p>
                  <p className="text-base text-gray-900 dark:text-gray-100">
                    {new Date(user.metadata.creationTime).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  as={Link}
                  to="/contact"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold"
                >
                  Request Clinical Support
                </Button>
                <Button
                  color="light"
                  onClick={() => navigate("/", { replace: true })}
                  className="font-semibold"
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {profileHighlights.map((item) => (
            <div
              key={item.label}
              className={`rounded-3xl p-8 text-white shadow-lg bg-gradient-to-br ${item.gradient}`}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="bg-white/20 p-3 rounded-2xl">
                  <item.icon className="text-2xl" />
                </div>
                <span className="text-xs uppercase tracking-widest text-white/70">
                  AURA Insight
                </span>
              </div>
              <p className="text-4xl font-semibold">{item.value}</p>
              <p className="text-lg mt-1">{item.label}</p>
              <p className="text-white/80 text-sm mt-4">{item.subtext}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
