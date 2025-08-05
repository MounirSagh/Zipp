"use client";

import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      {/* Background animation layer */}
      <BackgroundBeams className="absolute inset-0 z-0" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center gap-2 absolute top-10 left-20 z-20 text-4xl font-semibold tracking-tight bg-white text-transparent bg-clip-text select-none"
      >
        <Zap className="text-white" size={40} />
        Zipp<span className="text-white">.</span>
      </motion.div>
      {/* Foreground content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-4xl"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-300 to-white drop-shadow-lg">
            Never Miss a Call. <br />
            Never Lose a Customer.
          </h1>

          <p className="mt-6 text-neutral-300 text-lg md:text-xl">
            Every call. Every language. Perfectly handled. Delight guests, boost
            revenue, and focus on what you do best - creating exceptional
            experiences.
          </p>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="mt-10 px-8 py-3 text-base md:text-lg font-medium transition-transform hover:scale-105 bg-gradient-to-br from-blue-300 via-blue-100 to-blue-300 text-black">
                Sign In
              </Button>
            </DialogTrigger>
            <DialogContent className="border-none bg-transparent p-6 rounded-2xl shadow-xl flex justify-center items-center">
              <SignIn
                afterSignInUrl="/admin"
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}
