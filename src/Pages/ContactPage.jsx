import React, { useState } from "react";
import { Button, Label, TextInput, Textarea } from "flowbite-react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaHeartbeat } from "react-icons/fa";
import { toast } from "react-toastify";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // You can integrate EmailJS or your backend API here
      // For now, just showing success message
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Message sent successfully! We'll get back to you soon.");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-800 dark:to-teal-800 py-20">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 animate-fade-in">
            Contact AURA Support
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Have questions about urticaria diagnosis or our AI platform? Our medical team
            is here to help. Get in touch with us today.
          </p>
        </div>
      </div>

      {/* Contact Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-cyan-500 to-teal-500 p-4 rounded-full">
                  <FaPhone className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Medical Hotline
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    +1 (800) AURA-AI1
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-teal-500 to-sky-500 p-4 rounded-full">
                  <FaEnvelope className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Email Support
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    support@aura-ai.medical
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-sky-500 to-cyan-500 p-4 rounded-full">
                  <FaMapMarkerAlt className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Headquarters
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    SLIIT, Malabe, Sri Lanka
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 transform hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-4 rounded-full">
                  <FaHeartbeat className="text-2xl text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Availability
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    24/7 AI Support
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 md:p-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                Consultation Request
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Your Name *
                    </Label>
                    <TextInput
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-gray-700 dark:text-gray-300 font-medium mb-2"
                    >
                      Your Email *
                    </Label>
                    <TextInput
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="subject"
                    className="text-gray-700 dark:text-gray-300 font-medium mb-2"
                  >
                    Subject *
                  </Label>
                  <TextInput
                    id="subject"
                    type="text"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="text-gray-700 dark:text-gray-300 font-medium mb-2"
                  >
                    Message *
                  </Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

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
                      Sending...
                    </div>
                  ) : (
                    <span className="relative z-10">Send Message</span>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="mt-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <FaMapMarkerAlt className="text-3xl text-blue-600 dark:text-blue-400" />
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Our Location
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    SLIIT, Malabe, Sri Lanka
                  </p>
                </div>
              </div>
            </div>
            <div className="h-96 w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.0827653647766!2d79.97036097475633!3d6.914682993083124!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae256db1a6771c5%3A0x2c63e344ab9a7536!2sSri%20Lanka%20Institute%20of%20Information%20Technology!5e0!3m2!1sen!2slk!4v1701849284000!5m2!1sen!2slk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="SLIIT Malabe Location"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
