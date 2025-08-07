import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-6 text-center">
      <motion.h1
        className="text-9xl font-extrabold text-purple-600"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        404
      </motion.h1>
      <motion.h2
        className="text-3xl md:text-4xl font-semibold text-gray-800 mt-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        Page not found
      </motion.h2>
      <motion.p
        className="mt-4 text-gray-600 max-w-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Oops! The page you're looking for doesn’t exist or has been moved. But don’t worry — we’ll help you find your way back.
      </motion.p>
      <motion.div
        className="mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <Link
          to="/"
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
        >
          Go to Homepage
        </Link>
      </motion.div>
    </div>
  );
}

export default NotFound;