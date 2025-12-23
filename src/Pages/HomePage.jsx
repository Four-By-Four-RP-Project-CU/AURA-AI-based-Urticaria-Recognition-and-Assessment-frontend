import React, { useState, useEffect, useRef } from "react";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaCamera,
  FaChartLine,
  FaShieldAlt,
  FaUserMd,
  FaHeartbeat,
  FaMicroscope,
  FaCheckCircle,
} from "react-icons/fa";

const HomePage = () => {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);
  const heroRef = useRef(null);

  // Initialize particles
  useEffect(() => {
    const particleCount = 30;
    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  // Track mouse movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setMousePosition({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="flex flex-col overflow-hidden">
      {/* Hero Section with Animated Medical Background */}
      <div
        ref={heroRef}
        className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-50 via-sky-50 to-teal-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-900"
      >
        {/* Interactive Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute rounded-full bg-gradient-to-br from-cyan-400 to-teal-500"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                opacity: particle.opacity,
                animation: `particle-float-${(particle.id % 4) + 1} ${particle.duration}s ease-in-out infinite`,
                animationDelay: `${particle.delay}s`,
                transform: `translate(${(mousePosition.x - 50) * 0.05}px, ${(mousePosition.y - 50) * 0.05}px)`,
                transition: 'transform 0.3s ease-out',
              }}
            />
          ))}
        </div>

        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"
            style={{
              transform: `translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          ></div>
          <div
            className="absolute w-96 h-96 bg-teal-400/20 rounded-full blur-3xl top-1/3 -right-20 animate-pulse animation-delay-1000"
            style={{
              transform: `translate(${-mousePosition.x * 0.2}px, ${mousePosition.y * 0.2}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          ></div>
          <div
            className="absolute w-96 h-96 bg-sky-400/20 rounded-full blur-3xl bottom-0 left-1/3 animate-pulse animation-delay-2000"
            style={{
              transform: `translate(${mousePosition.x * 0.15}px, ${-mousePosition.y * 0.15}px)`,
              transition: 'transform 0.5s ease-out',
            }}
          ></div>

          {/* Floating Medical Icons */}
          <div
            className="absolute top-20 left-10 animate-float-slow opacity-30 transition-all duration-500"
            style={{
              transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`,
            }}
          >
            <FaMicroscope className="text-6xl text-cyan-400" />
          </div>
          <div
            className="absolute top-40 right-20 animate-float-medium opacity-30 transition-all duration-500"
            style={{
              transform: `translate(${-mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`,
            }}
          >
            <FaHeartbeat className="text-6xl text-teal-400" />
          </div>
          <div
            className="absolute bottom-40 right-40 animate-float-fast opacity-30 transition-all duration-500"
            style={{
              transform: `translate(${mousePosition.x * 0.12}px, ${-mousePosition.y * 0.12}px)`,
            }}
          >
            <FaUserMd className="text-6xl text-sky-400" />
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 min-h-screen flex items-center">
          <main className="w-full px-6 py-12">
            <div className="container mx-auto max-w-7xl">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Text Content */}
                <div className="space-y-8 text-center lg:text-left">
                  <div className="inline-block animate-fade-in">
                    <span className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                      🏥 AI-Powered Medical Diagnosis
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-7xl font-bold leading-tight animate-slide-up">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400">
                      AURA
                    </span>
                    <br />
                    <span className="text-gray-900 dark:text-white text-4xl md:text-5xl">
                      AI-based Urticaria
                    </span>
                    <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-sky-600 dark:from-teal-400 dark:to-sky-400 text-4xl md:text-5xl">
                      Recognition & Assessment
                    </span>
                  </h1>

                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl animate-fade-in-delay">
                    Advanced AI technology for accurate chronic urticaria
                    diagnosis. Upload images, get instant analysis, and receive
                    personalized treatment recommendations.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start animate-fade-in-delay-2">
                    <Link to="/sign-up" className="group">
                      <button className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-500 bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 rounded-xl shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 overflow-hidden group-hover:bg-gradient-to-r group-hover:from-cyan-700 group-hover:via-teal-700 group-hover:to-sky-700">
                        <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
                        <span className="absolute inset-0 w-full h-full -mt-1 rounded-xl opacity-30 bg-gradient-to-b from-transparent via-transparent to-gray-900"></span>
                        <FaCamera className="mr-3 text-xl relative z-10 transition-transform duration-300 group-hover:rotate-12" />
                        <span className="relative z-10">Start Diagnosis</span>
                        <svg className="w-5 h-5 ml-2 relative z-10 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </button>
                    </Link>
                    <Link to="/about" className="group">
                      <button className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-cyan-600 dark:text-cyan-400 transition-all duration-500 bg-white dark:bg-gray-800 border-2 border-cyan-500 dark:border-cyan-400 rounded-xl shadow-lg hover:shadow-xl overflow-hidden hover:scale-105">
                        <span className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 ease-out group-hover:w-full"></span>
                        <span className="relative z-10 transition-colors duration-300 group-hover:text-white flex items-center">
                          Learn More
                          <svg className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </span>
                      </button>
                    </Link>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-6 pt-8 animate-fade-in-delay-3">
                    <div className="text-center transform hover:scale-110 transition-all duration-300">
                      <div className="text-3xl md:text-4xl font-bold text-cyan-600 dark:text-cyan-400 mb-1">
                        98%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Accuracy
                      </div>
                    </div>
                    <div className="text-center transform hover:scale-110 transition-all duration-300">
                      <div className="text-3xl md:text-4xl font-bold text-teal-600 dark:text-teal-400 mb-1">
                        50K+
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Diagnoses
                      </div>
                    </div>
                    <div className="text-center transform hover:scale-110 transition-all duration-300">
                      <div className="text-3xl md:text-4xl font-bold text-sky-600 dark:text-sky-400 mb-1">
                        24/7
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Available
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - 3D Card Display */}
                <div className="hidden lg:block relative h-[600px] perspective-1000">
                  {/* Main AI Brain Card */}
                  <div className="absolute top-20 right-10 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-3xl shadow-2xl p-8 w-80 transform hover:scale-105 transition-all duration-500 animate-float rotate-3">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="bg-white/20 backdrop-blur-lg p-4 rounded-xl">
                        <FaBrain className="text-5xl text-white" />
                      </div>
                      <div className="text-white">
                        <h3 className="text-2xl font-bold">AI Analysis</h3>
                        <p className="text-blue-100">Deep Learning</p>
                      </div>
                    </div>
                    <p className="text-white/90 text-sm">
                      Advanced neural networks trained on thousands of
                      urticaria cases for precise diagnosis
                    </p>
                    <div className="mt-4 bg-white/10 backdrop-blur-lg rounded-lg p-3">
                      <div className="flex justify-between text-white text-xs mb-1">
                        <span>Analysis Progress</span>
                        <span>98%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-white rounded-full h-2 w-[98%] animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Camera Upload Card */}
                  <div className="absolute top-60 right-32 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-72 transform hover:scale-105 transition-all duration-500 animate-float-delayed -rotate-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-br from-teal-500 to-sky-500 p-3 rounded-lg">
                        <FaCamera className="text-2xl text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                          Upload Image
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Instant Analysis
                        </p>
                      </div>
                    </div>
                    <div className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg p-4 text-center">
                      <FaCamera className="text-3xl text-teal-500 mx-auto mb-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Drag & drop or click to upload
                      </p>
                    </div>
                  </div>

                  {/* Results Card */}
                  <div className="absolute bottom-20 right-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 w-64 transform hover:scale-105 transition-all duration-500 animate-float rotate-2">
                    <div className="flex items-center gap-3 mb-3">
                      <FaCheckCircle className="text-3xl text-white" />
                      <div className="text-white">
                        <h4 className="text-xl font-bold">Diagnosis Ready</h4>
                        <p className="text-xs text-green-100">
                          Results in 2 seconds
                        </p>
                      </div>
                    </div>
                    <div className="bg-white/20 backdrop-blur-lg rounded-lg p-3 text-white text-sm">
                      ✓ Type: Chronic Urticaria
                      <br />
                      ✓ Severity: Moderate
                      <br />
                      ✓ Confidence: 98.5%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How AURA{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Works
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Simple, fast, and accurate urticaria diagnosis in three easy steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <div className="absolute -top-6 left-8">
                  <div className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    1
                  </div>
                </div>
                <div className="bg-gradient-to-br from-cyan-500 to-teal-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mt-4 transform group-hover:rotate-12 transition-all duration-300">
                  <FaCamera className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Upload Image
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Take or upload a clear photo of the affected skin area. Our AI
                  accepts multiple image formats.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-teal-50 to-sky-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <div className="absolute -top-6 left-8">
                  <div className="bg-gradient-to-r from-teal-600 to-sky-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    2
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-500 to-sky-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mt-4 transform group-hover:rotate-12 transition-all duration-300">
                  <FaBrain className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  AI Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Our advanced AI analyzes the image using deep learning
                  algorithms trained on thousands of cases.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative group">
              <div className="bg-gradient-to-br from-sky-50 to-cyan-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-8 transform hover:scale-105 transition-all duration-500 shadow-lg hover:shadow-2xl">
                <div className="absolute -top-6 left-8">
                  <div className="bg-gradient-to-r from-sky-600 to-cyan-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shadow-lg">
                    3
                  </div>
                </div>
                <div className="bg-gradient-to-br from-sky-500 to-cyan-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6 mt-4 transform group-hover:rotate-12 transition-all duration-300">
                  <FaChartLine className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Get Results
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Receive detailed diagnosis with severity assessment and
                  personalized treatment recommendations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                AURA
              </span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Advanced AI technology combined with medical expertise for
              accurate urticaria diagnosis
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FaBrain,
                title: "AI-Powered Accuracy",
                description:
                  "98% accuracy rate using state-of-the-art deep learning models trained on extensive medical datasets.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: FaChartLine,
                title: "Detailed Assessment",
                description:
                  "Comprehensive analysis including type identification, severity grading, and progression tracking.",
                gradient: "from-purple-500 to-pink-500",
              },
              {
                icon: FaUserMd,
                title: "Expert Validated",
                description:
                  "Developed and validated by board-certified dermatologists and AI specialists.",
                gradient: "from-indigo-500 to-purple-500",
              },
              {
                icon: FaShieldAlt,
                title: "Secure & Private",
                description:
                  "HIPAA-compliant with end-to-end encryption. Your medical data remains confidential.",
                gradient: "from-green-500 to-teal-500",
              },
              {
                icon: FaHeartbeat,
                title: "Real-time Results",
                description:
                  "Get instant diagnosis in seconds. No waiting for appointments or lab results.",
                gradient: "from-red-500 to-orange-500",
              },
              {
                icon: FaMicroscope,
                title: "Research-Backed",
                description:
                  "Based on latest clinical research and peer-reviewed studies in dermatology.",
                gradient: "from-yellow-500 to-amber-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <div
                  className={`bg-gradient-to-br ${feature.gradient} w-16 h-16 rounded-xl flex items-center justify-center mb-6 ${hoveredFeature === index ? "animate-bounce" : ""
                    }`}
                >
                  <feature.icon className="text-3xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-800 dark:via-purple-800 dark:to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-0 left-0 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-0 right-0 animate-pulse animation-delay-1000"></div>
        </div>
        <div className="container mx-auto max-w-5xl px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients and healthcare professionals using AURA
            for accurate urticaria diagnosis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button
                size="xs"
                className="bg-gradient-to-r from-teal-600 to-lime-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                <FaCamera className="mr-2" />
                Start Free Diagnosis
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="xs"
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold px-8 py-4 text-lg transition-all duration-300 transform hover:scale-105"
              >
                Contact Specialist
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(3deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px) rotate(-2deg);
          }
          50% {
            transform: translateY(-15px) rotate(-2deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-30px);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-25px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 5s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 4s ease-in-out infinite;
        }
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-fade-in-delay {
          animation: fade-in 1s ease-out 0.3s both;
        }
        .animate-fade-in-delay-2 {
          animation: fade-in 1s ease-out 0.6s both;
        }
        .animate-fade-in-delay-3 {
          animation: fade-in 1s ease-out 0.9s both;
        }
        .animate-slide-up {
          animation: slide-up 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default HomePage;