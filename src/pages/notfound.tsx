import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";

function NotFound() {
  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background animation layer */}
      <BackgroundBeams className="absolute inset-0 z-0" />
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.h1
          className="text-9xl font-extrabold text-blue-600"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          404
        </motion.h1>
        <motion.h2
          className="text-3xl md:text-4xl font-semibold text-gray-300 mt-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Page not found
        </motion.h2>
        <motion.p
          className="mt-4 text-gray-300 max-w-md"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Oops! The page you're looking for doesn’t exist or has been moved. But
          don’t worry — we’ll help you find your way back.
        </motion.p>
        
      </div>
    </div>
  );
}

export default NotFound;
