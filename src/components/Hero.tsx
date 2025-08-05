"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowUpRight, X, Phone, Globe, Clock, Zap } from "lucide-react";
import { useRef, useState } from "react";
import velmabg from "../assets/velmaBg.mp4";
import { useNavigate } from "react-router-dom";
import { SignIn } from '@clerk/clerk-react'

export default function Hero({ id }: { id?: string }) {
  const ref = useRef(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const navigate = useNavigate();

  return (
    <>
      <section
        id={id}
        ref={ref}
        className="relative min-h-screen flex items-center justify-center pt-20 px-6 overflow-hidden"
      >
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0 brightness-[0.3]"
        >
          <source src={velmabg} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 z-[1]" />

        {/* Overlay Content */}
        <motion.div
          style={{ y, opacity }}
          className="max-w-7xl mx-auto text-center z-10 relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-purple-300 via-purple-100 to-purple-300 bg-clip-text text-transparent drop-shadow-lg">
              Never Miss Another Order
            </span>
            <br />
            <span className="bg-gradient-to-r from-orange-300 via-orange-100 to-orange-300 bg-clip-text text-transparent drop-shadow-lg">
              Break Every Language Barrier
            </span>
            <br />
            <span className="bg-white bg-clip-text text-transparent drop-shadow-lg">
              Your AI Restaurant Assistant
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-neutral-100 mb-8 max-w-5xl mx-auto leading-relaxed font-light"
          >
            Transform your restaurant with an AI assistant that answers every call in any language, 
            takes perfect orders, and never sleeps. Boost revenue, eliminate missed opportunities, 
            and serve customers worldwide — all while you focus on what you do best.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-6 mb-10 max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Phone className="h-4 w-4 text-purple-300" />
              <span className="text-white text-sm font-medium">24/7 Availability</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Globe className="h-4 w-4 text-orange-300" />
              <span className="text-white text-sm font-medium">50+ Languages</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Zap className="h-4 w-4 text-green-300" />
              <span className="text-white text-sm font-medium">Instant Setup</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
              <Clock className="h-4 w-4 text-blue-300" />
              <span className="text-white text-sm font-medium">Zero Wait Time</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                onClick={() => setShowSignInModal(true)}
                className="px-10 py-4 text-lg rounded-full bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-white font-semibold shadow-2xl border-0 transition-all duration-300"
              >
                Join The Waitlist
                <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-4 text-lg rounded-full bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/40 font-medium"
              >
                Watch Demo
              </Button>
            </motion.div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center"
          >
            <p className="text-white/70 text-sm mb-3">Trusted by restaurants worldwide</p>
            <div className="flex justify-center items-center gap-8 opacity-60">
              <div className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
              <div className="h-8 w-24 bg-white/20 rounded animate-pulse"></div>
              <div className="h-8 w-16 bg-white/20 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-white/20 rounded animate-pulse"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Sign In Modal */}
      {showSignInModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowSignInModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowSignInModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>

            {/* Modal content */}
            <div className="p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join the Waitlist</h2>
                <p className="text-gray-600">Be among the first to revolutionize your restaurant</p>
              </div>
              
              <SignIn 
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "shadow-none border-0 p-0",
                  }
                }}
                routing="hash"
                signUpUrl="#"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}