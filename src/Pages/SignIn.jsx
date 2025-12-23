import React, { useState } from "react";
import { BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "react-toastify";
import OAuth from "../components/OAuth";
import { Alert, Button, Label, TextInput } from "flowbite-react";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const { email, password } = formData;
  const navigate = useNavigate();

  function onChange(e) {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        navigate("/", { replace: true });
        toast.success("Welcome back! Successfully logged in.");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setErrorMsg("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden">
          {/* Left Side - Branding */}
          <div className="relative bg-gradient-to-br from-cyan-600 to-teal-600 dark:from-cyan-800 dark:to-teal-800 p-12 flex flex-col justify-center">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-64 h-64 bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
              <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-0 right-0"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Welcome Back to{" "}
                <span className="block mt-2">AURA AI</span>
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Continue your urticaria diagnosis journey with AI precision.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Advanced AI medical analysis</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">98% diagnostic accuracy</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-white">Secure medical data</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="p-8 lg:p-12">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Sign In
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Enter your credentials to access your account
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <Label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={onChange}
                    placeholder="name@example.com"
                    required
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Password
                </Label>
                <div className="relative">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={onChange}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl py-3 pl-12 pr-12 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <BsFillEyeSlashFill className="text-xl" />
                    ) : (
                      <BsFillEyeFill className="text-xl" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <Alert color="failure" className="mb-4">
                  <span className="font-medium">{errorMsg}</span>
                </Alert>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-500 bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 rounded-xl shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-96 group-hover:h-96 opacity-10"></span>
                <span className="absolute inset-0 w-full h-full -mt-1 rounded-xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-900"></span>
                {loading ? (
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Signing in...
                  </div>
                ) : (
                  <span className="relative z-10">Sign In</span>
                )}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <OAuth />

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link
                    to="/sign-up"
                    className="text-blue-600 hover:text-purple-600 dark:text-purple-400 dark:hover:text-purple-300 font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
