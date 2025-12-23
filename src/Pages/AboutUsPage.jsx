import React from "react";
import { Button } from "flowbite-react";
import { Link } from "react-router-dom";
import {
  FaBrain,
  FaBullseye,
  FaLightbulb,
  FaHeart,
  FaUsers,
  FaMicroscope,
  FaAward,
  FaShieldAlt,
  FaUserMd,
} from "react-icons/fa";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-800 dark:to-teal-800 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl top-1/3 -right-20 animate-pulse animation-delay-1000"></div>
          <div className="absolute w-72 h-72 bg-white/10 rounded-full blur-3xl bottom-0 left-1/4 animate-pulse animation-delay-1500"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-center lg:text-left space-y-8">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-1 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse-scale"></span>
                Clinical AI Excellence
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white animate-fade-in">
                Precision Care Powered by AURA
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl">
                We combine dermatological expertise with neural imaging models to deliver accurate
                urticaria assessments in seconds, giving clinicians clarity when it matters most.
              </p>
              <div className="flex flex-wrap gap-4">
                {["Dermatology Labs", "Real-Time Insights", "HIPAA Secure"].map((label, index) => (
                  <div
                    key={label}
                    className={`flex-1 min-w-[150px] bg-white/10 rounded-2xl px-5 py-4 text-left backdrop-blur border border-white/20 ${
                      index === 0 ? "animate-glow" : ""
                    }`}
                  >
                    <p className="text-blue-100 text-sm">{index === 0 ? "Trusted By" : index === 1 ? "Response" : "Compliance"}</p>
                    <p className="text-white text-xl font-semibold">
                      {index === 0 ? "120+" : index === 1 ? "< 2 sec" : "Tier IV"}
                    </p>
                    <p className="text-blue-100 text-sm">{label}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/sign-up" className="group">
                  <button className="relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-blue-700 dark:text-blue-600 transition-all duration-500 bg-white rounded-xl shadow-lg hover:shadow-xl overflow-hidden hover:scale-105">
                    <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-100 to-purple-100 transition-all duration-500 ease-out group-hover:w-full"></span>
                    <span className="relative z-10">Launch Assessment</span>
                  </button>
                </Link>
                <Link to="/contact" className="group">
                  <button className="relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-500 bg-transparent border-2 border-white rounded-xl hover:bg-white/10 overflow-hidden hover:scale-105">
                    <span className="relative z-10">Speak With Specialists</span>
                  </button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-white/20 rounded-[40px] blur-3xl animate-glow"></div>
              <div className="relative bg-white/10 backdrop-blur-xl rounded-[32px] border border-white/30 p-6 text-white shadow-2xl overflow-hidden">
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.3),_transparent_60%)]"></div>
                <div className="relative rounded-3xl overflow-hidden mb-6">
                  <img
                    src="https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1000&q=80"
                    alt="Dermatology Lab"
                    className="w-full h-72 object-cover animate-float-medium"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-blue-100">Live Analysis</p>
                      <p className="text-2xl font-semibold">Lesion Clarity: 97%</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur px-3 py-2 rounded-xl text-sm font-semibold">
                      Stable
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {["AI Confidence", "Dermis Depth"].map((metric, idx) => (
                    <div key={metric} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                      <p className="text-xs uppercase tracking-widest text-blue-100">{metric}</p>
                      <p className="text-2xl font-semibold">{idx === 0 ? "98.4%" : "2.1 mm"}</p>
                      <p className="text-blue-100 text-sm">{idx === 0 ? "Verified" : "Ultrastrata"}</p>
                    </div>
                  ))}
                </div>
                <div className="absolute -bottom-8 -right-6 bg-emerald-400 text-blue-900 font-semibold px-6 py-3 rounded-3xl shadow-2xl animate-float-slow">
                  ISO 13485
                </div>
                <div className="absolute -top-6 -left-4 bg-white/90 text-blue-800 font-semibold px-5 py-2 rounded-2xl shadow-xl animate-orbit">
                  Neural Scan v3.2
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block">
              <span className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
                Our Story
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Transforming{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-teal-600">
                Urticaria Diagnosis
              </span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              AURA was born from a critical need in dermatology. Chronic
              urticaria affects millions worldwide, yet diagnosis remains
              challenging and time-consuming. Traditional methods rely heavily
              on clinical observation and can take weeks for proper assessment.
            </p>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              Our team of dermatologists, AI researchers, and software engineers
              collaborated to create an AI-powered solution that delivers
              instant, accurate diagnoses. By training our deep learning models
              on thousands of clinically verified cases, AURA achieves 98%
              diagnostic accuracy - rivaling expert dermatologists.
            </p>
            <div className="flex gap-4 pt-4">
              <Link to="/contact" className="group">
                <button className="relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-white transition-all duration-500 bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 rounded-xl shadow-lg hover:shadow-cyan-500/50 hover:scale-105 overflow-hidden">
                  <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-64 group-hover:h-64 opacity-10"></span>
                  <span className="relative z-10">Get in Touch</span>
                </button>
              </Link>
              <Link to="/sign-up" className="group">
                <button className="relative inline-flex items-center justify-center px-8 py-3 text-base font-bold text-cyan-600 dark:text-cyan-400 transition-all duration-500 bg-white dark:bg-gray-800 border-2 border-cyan-500 dark:border-cyan-400 rounded-xl shadow-lg hover:shadow-xl overflow-hidden hover:scale-105">
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 ease-out group-hover:w-full"></span>
                  <span className="relative z-10 transition-colors duration-300 group-hover:text-white">Try AURA</span>
                </button>
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl blur-2xl opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    98%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Accuracy Rate
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    50K+
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Diagnoses
                  </div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                    2s
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Analysis Time
                  </div>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-700 dark:to-gray-600 rounded-2xl p-6 text-center transform hover:scale-105 transition-all duration-300">
                  <div className="text-4xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                    24/7
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Available
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Immersive Gallery */}
      <div className="bg-gradient-to-br from-white to-blue-50 dark:from-gray-900 dark:to-indigo-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Immersive Diagnostic Gallery
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Visual evidence from real-world urticaria cases powering our continuous learning engine
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Histamine Triggers",
                spec: "Dual-spectrum lens",
                img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: "Dermal Perfusion",
                spec: "OCT captured",
                img: "https://images.unsplash.com/photo-1487412720507-7c51c89b89c8?auto=format&fit=crop&w=800&q=80",
              },
              {
                title: "Lateration Map",
                spec: "AI overlay",
                img: "https://images.unsplash.com/photo-1521790797524-b2497295b8a0?auto=format&fit=crop&w=800&q=80",
              },
            ].map((item, index) => (
              <div
                key={item.title}
                className={`relative rounded-3xl overflow-hidden shadow-2xl group border border-white/40 dark:border-white/10 ${
                  index === 1 ? "lg:translate-y-10" : ""
                }`}
              >
                <img src={item.img} alt={item.title} className="w-full h-80 object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white space-y-2">
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-200">{item.spec}</p>
                  <h3 className="text-3xl font-bold">{item.title}</h3>
                  <div className="flex items-center justify-between text-sm text-blue-100">
                    <span>Confidence {index === 0 ? "96%" : index === 1 ? "93%" : "99%"}</span>
                    <span>Frame {index + 14}</span>
                  </div>
                </div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs">
                  Calibrated
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="bg-white dark:bg-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Mission & Vision
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Driven by innovation, guided by medical excellence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-10 shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                <FaBullseye className="text-4xl text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Mission
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To democratize access to accurate urticaria diagnosis by providing
                an AI-powered platform that delivers instant, reliable results. We
                aim to reduce diagnostic delays, improve patient outcomes, and
                support healthcare professionals worldwide.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-10 shadow-xl transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-indigo-500 w-20 h-20 rounded-2xl flex items-center justify-center mb-6">
                <FaLightbulb className="text-4xl text-white" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Our Vision
              </h3>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                To become the global standard for AI-assisted dermatological
                diagnosis, expanding beyond urticaria to cover all skin
                conditions. We envision a future where quality medical diagnosis
                is accessible to everyone, regardless of location or resources.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Core Values */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The principles that guide our medical AI innovation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FaMicroscope className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Scientific Rigor
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Every algorithm is validated through peer-reviewed research and
                clinical trials, ensuring medical accuracy and reliability.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FaHeart className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Patient-Centered
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We prioritize patient needs, privacy, and outcomes in every
                decision we make, from design to deployment.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg transform hover:scale-105 transition-all duration-300">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                <FaBrain className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Continuous Innovation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously improve our AI models with new data and
                research, staying at the forefront of medical technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clinical Timeline */}
      <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Clinical Validation Timeline
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Milestones that shaped our regulatory-grade platform
            </p>
          </div>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 h-full w-1 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
            <div className="space-y-16">
              {[
                {
                  year: "2019",
                  title: "Dermal Data Initiative",
                  desc: "Launched multi-center image collection with 8 hospitals across three continents.",
                  icon: <FaMicroscope className="text-xl" />,
                },
                {
                  year: "2021",
                  title: "Regulatory Sandbox",
                  desc: "Completed 12-week sandbox with EU regulators validating safety and transparency.",
                  icon: <FaShieldAlt className="text-xl" />,
                },
                {
                  year: "2023",
                  title: "ISO Certification",
                  desc: "Achieved ISO 13485 and MDR readiness with continuous monitoring pipelines.",
                  icon: <FaAward className="text-xl" />,
                },
              ].map((item, index) => (
                <div key={item.year} className={`relative flex flex-col ${index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} lg:items-center gap-8`}>
                  <div className="lg:w-1/2 bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-blue-100 dark:border-gray-700">
                    <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 font-semibold text-lg">
                      <span className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        {item.icon}
                      </span>
                      {item.title}
                    </div>
                    <p className="text-4xl font-bold text-gray-900 dark:text-white mt-4">{item.year}</p>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="hidden lg:block flex-1"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Our Expert Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Combining medical expertise with cutting-edge AI technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: FaUserMd,
                role: "Dermatologists",
                count: "15+",
                description:
                  "Board-certified specialists providing medical oversight and validation",
              },
              {
                icon: FaBrain,
                role: "AI Researchers",
                count: "20+",
                description:
                  "PhD-level experts in machine learning and computer vision",
              },
              {
                icon: FaAward,
                role: "Awards & Recognition",
                count: "10+",
                description:
                  "Industry awards for innovation in healthcare AI",
              },
            ].map((team, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg text-center transform hover:scale-105 transition-all duration-300"
              >
                <div className="bg-gradient-to-br from-blue-500 to-purple-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <team.icon className="text-3xl text-white" />
                </div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {team.count}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {team.role}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {team.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-800 dark:to-teal-800 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FaUsers className="text-6xl text-white mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the AURA Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Be part of the revolution in dermatological diagnosis. Start using
            AURA today and experience the future of medical AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/sign-up">
              <Button
                size="xl"
                className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3 text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                Start Free Trial
              </Button>
            </Link>
            <Link to="/contact">
              <Button
                size="xl"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-8 py-3 text-lg transition-all duration-300 transform hover:scale-105"
              >
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 7s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-pulse-scale {
          animation: pulse-scale 2s ease-in-out infinite;
        }
        .animate-orbit {
          animation: orbit 6s linear infinite;
          transform-origin: center;
        }
        @keyframes pulse-glow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.7;
          }
        }
        @keyframes pulse-scale {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }
        @keyframes float-medium {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-12px) translateX(6px);
          }
        }
        @keyframes float-slow {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-16px) translateX(-8px);
          }
        }
        @keyframes orbit {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(6px) rotate(4deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUsPage;
