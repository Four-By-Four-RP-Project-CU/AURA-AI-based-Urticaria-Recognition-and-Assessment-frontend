import { Avatar, Button, Dropdown, Navbar } from "flowbite-react";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../redux/theme/themeSlice";

const Header = () => {
  const [user, setUser] = useState(null);
  const path = useLocation().pathname;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.theme);

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
      setUser(null);
      navigate("/sign-in", { replace: true });
    } catch (err) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Navbar className="border-b-2 sticky top-0 bg-white dark:bg-gray-900 shadow-md z-50">
      <Link
        to="/"
        className="self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white"
      >
        <div className="flex items-center">
          <div className="w-10 h-10 mr-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 bg-blue-300 dark:bg-blue-400 opacity-80 rounded-tr-full rounded-bl-full transform rotate-45 translate-x-0.5 translate-y-0.5"></div>
              <div className="absolute w-5 h-5 bg-purple-400 dark:bg-purple-300 opacity-90 rounded-tl-full rounded-br-full transform -rotate-12 -translate-x-1 -translate-y-1"></div>
              <div className="absolute w-2 h-2 bg-white rounded-full transform translate-x-1.5 translate-y-1.5 animate-pulse"></div>
            </div>
          </div>
          <div className="font-bold tracking-tight text-base md:text-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-400">
              AURA
            </span>
            <span className="text-xs md:text-sm block text-gray-600 dark:text-gray-400 font-normal -mt-1">
              AI Urticaria Diagnosis
            </span>
          </div>
        </div>
      </Link>

      <div className="flex gap-2 md:order-2">
        <Button
          className="w-12 h-10 inline"
          color="gray"
          pill
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === "light" ? (
            <FaSun className="text-yellow-500" />
          ) : (
            <FaMoon className="text-blue-500" />
          )}
        </Button>
        {user ? (
          <Dropdown
            arrowIcon={false}
            inline
            label={
              <Avatar
                img={
                  user.photoURL ||
                  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1EbhMbqdCA85UXXAxxXvcc0PN9xvHOZF6yYVUVRAYSlQC_B9aPU-tEdU&s"
                }
                alt="user"
                rounded
              />
            }
          >
            <Dropdown.Header>
              <span className="block text-sm">
                @{user.displayName || "User"}
              </span>
              <span className="block text-sm font-medium truncate">
                {user.email}
              </span>
            </Dropdown.Header>
            <Link to="/dashboard">
              <Dropdown.Item>Dashboard</Dropdown.Item>
            </Link>
            <Link to="/profile">
              <Dropdown.Item>Profile</Dropdown.Item>
            </Link>
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleSignOut}>Sign Out</Dropdown.Item>
          </Dropdown>
        ) : (
          <Link to="/sign-in">
            <button className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-bold text-white transition-all duration-500 bg-gradient-to-r from-cyan-600 via-teal-600 to-sky-600 rounded-lg shadow-lg hover:shadow-cyan-500/50 hover:scale-105 overflow-hidden group">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-32 group-hover:h-32 opacity-10"></span>
              <span className="relative z-10">Sign In</span>
            </button>
          </Link>
        )}
        <Navbar.Toggle />
      </div>
      <Navbar.Collapse>
        <Navbar.Link active={path === "/"} as={"div"}>
          <Link
            to="/"
            className={`text-lg font-semibold ${
              path === "/"
                ? "text-blue-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:text-blue-600 dark:hover:text-purple-400 transition-colors`}
          >
            Home
          </Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/clinician-dashboard"} as={"div"}>
          <Link
            to="/clinician-dashboard"
            className={`text-lg font-semibold ${
              path === "/clinician-dashboard"
                ? "text-blue-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:text-blue-600 dark:hover:text-purple-400 transition-colors`}
          >
            Clinician Dashboard
          </Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/about"} as={"div"}>
          <Link
            to="/about"
            className={`text-lg font-semibold ${
              path === "/about"
                ? "text-blue-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:text-blue-600 dark:hover:text-purple-400 transition-colors`}
          >
            About
          </Link>
        </Navbar.Link>
        <Navbar.Link active={path === "/contact"} as={"div"}>
          <Link
            to="/contact"
            className={`text-lg font-semibold ${
              path === "/contact"
                ? "text-blue-600 dark:text-purple-400"
                : "text-gray-700 dark:text-gray-300"
            } hover:text-blue-600 dark:hover:text-purple-400 transition-colors`}
          >
            Contact
          </Link>
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default Header;
