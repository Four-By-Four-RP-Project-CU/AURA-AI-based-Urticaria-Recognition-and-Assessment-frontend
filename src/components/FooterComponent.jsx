import { Footer } from "flowbite-react";
import {
  BsFacebook,
  BsInstagram,
  BsLinkedin,
  BsTwitter,
  BsGithub,
} from "react-icons/bs";
import { Link } from "react-router-dom";

const FooterComponent = () => {
  return (
    <Footer container className="border-t-4 border-blue-500 dark:border-purple-600 shadow-lg bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid w-full justify-between gap-8 sm:flex md:grid-cols-1">
          <div className="mt-5">
            <Link
              to="/"
              className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
            >
              <div className="flex items-center">
                <div className="w-12 h-12 mr-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-7 h-7 bg-blue-300 dark:bg-blue-400 opacity-80 rounded-tr-full rounded-bl-full transform rotate-45 translate-x-0.5 translate-y-0.5"></div>
                    <div className="absolute w-6 h-6 bg-purple-400 dark:bg-purple-300 opacity-90 rounded-tl-full rounded-br-full transform -rotate-12 -translate-x-1 -translate-y-1"></div>
                    <div className="absolute w-2 h-2 bg-white rounded-full transform translate-x-2 translate-y-2 animate-pulse"></div>
                  </div>
                </div>
                <div className="font-bold tracking-tight text-lg md:text-2xl">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    AURA
                  </span>
                  <span className="block text-xs text-gray-600 dark:text-gray-400 font-normal">
                    AI Medical Diagnosis
                  </span>
                </div>
              </div>
            </Link>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
              Advanced AI technology for accurate chronic urticaria diagnosis.
              Revolutionizing dermatological assessment with medical expertise.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6">
            <div>
              <Footer.Title title="Company" className="text-blue-600 dark:text-purple-400" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="/about"
                  className="hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  About Us
                </Footer.Link>
                <Footer.Link
                  href="/contact"
                  className="hover:text-blue-600 dark:hover:text-purple-400 transition-colors"
                >
                  Contact
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Resources" className="text-blue-600 dark:text-purple-400" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="/sign-in"
                  className="hover:text-green-600 dark:hover:text-teal-400 transition-colors"
                >
                  Sign In
                </Footer.Link>
                <Footer.Link
                  href="/sign-up"
                  className="hover:text-green-600 dark:hover:text-teal-400 transition-colors"
                >
                  Sign Up
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title="Legal" className="text-blue-600 dark:text-purple-400" />
              <Footer.LinkGroup col>
                <Footer.Link
                  href="#"
                  className="hover:text-green-600 dark:hover:text-teal-400 transition-colors"
                >
                  Privacy Policy
                </Footer.Link>
                <Footer.Link
                  href="#"
                  className="hover:text-green-600 dark:hover:text-teal-400 transition-colors"
                >
                  Terms of Service
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider className="my-6 border-gray-300 dark:border-gray-700" />
        <div className="w-full sm:flex sm:items-center sm:justify-between">
          <Footer.Copyright
            href="#"
            by="AURA AI Medical™"
            year={new Date().getFullYear()}
            className="text-gray-600 dark:text-gray-400"
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Icon
              href="#"
              icon={BsFacebook}
              className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-purple-400 transition-colors"
            />
            <Footer.Icon
              href="#"
              icon={BsInstagram}
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            />
            <Footer.Icon
              href="#"
              icon={BsTwitter}
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            />
            <Footer.Icon
              href="#"
              icon={BsLinkedin}
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            />
            <Footer.Icon
              href="#"
              icon={BsGithub}
              className="text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-teal-400 transition-colors"
            />
          </div>
        </div>
      </div>
    </Footer>
  );
};

export default FooterComponent;
