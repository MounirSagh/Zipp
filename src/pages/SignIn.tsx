"use client";

import { useState } from "react";
import { SignIn } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { motion } from "framer-motion";

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="relative h-screen w-full bg-black overflow-hidden">
      <BackgroundBeams className="absolute inset-0 z-0" />

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex items-center gap-2 absolute top-10 left-20 z-20 text-4xl font-semibold tracking-tight bg-white text-transparent bg-clip-text select-none"
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <h1 className="text-4xl font-bold text-white font-qwigley">ZIPP</h1>
            <h1 className="text-3xl font-bold text-yellow-300 font-qwigley mt-4">
              Dine
            </h1>
          </div>
        </div>
      </motion.div>
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-6xl"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-yellow-300 to-white drop-shadow-lg">
            Transform Your Restaurant <br />
            With Smart Ordering Technology
          </h1>

          <p className="mt-6 text-neutral-300 text-xl md:text-xl max-w-4xl mx-auto">
            Revolutionize your dining experience with AI-powered phone ordering
            and seamless QR code table service. Reduce wait times, cut labor
            costs, and delight every customer.
          </p>

          <Dialog open={modalOpen} onOpenChange={setModalOpen}>
            <DialogTrigger asChild>
              <Button className="mt-10 px-8 py-3 text-base md:text-lg font-medium transition-transform hover:scale-105 bg-white hover:bg-neutral-200 text-black">
                Get Started
              </Button>
            </DialogTrigger>
            <DialogContent className="border-none bg-transparent p-6 rounded-2xl shadow-xl flex justify-center items-center">
              <SignIn
                afterSignInUrl="/WjN2Y1hMTk5saEFneUZZeWZScW1uUjVkRkJoU0E9PQ/dashboard"
                appearance={{
                  baseTheme: dark,
                
                }}
              />
            </DialogContent>
          </Dialog>
        </motion.div>
      </div>
    </div>
  );
}
