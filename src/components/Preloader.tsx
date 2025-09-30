import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const words = [
  "Hello", // English
  "Hola", // Spanish
  "Bonjour", // French
  "مرحبا", // Arabic
  "你好", // Chinese
  "Hallo", // German/Dutch
  "Ciao", // Italian
  "Olá", // Portuguese
];

const opacity = {
  initial: {
    opacity: 0,
  },
  enter: {
    opacity: 0.9,
    transition: { duration: 0.8, delay: 0.1 },
  },
};

const slideUp = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100vh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

interface PreloaderProps {
  onComplete: () => void;
}

export default function Preloader({ onComplete }: PreloaderProps) {
  const [index, setIndex] = useState(0);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (index === words.length - 1) {
      // Start exit animation after showing the last word
      setTimeout(() => {
        onComplete();
      }, 1200);
      return;
    }

    const timeout = setTimeout(
      () => {
        setIndex(index + 1);
      },
      index === 0 ? 1000 : 400
    );

    return () => clearTimeout(timeout);
  }, [index, onComplete]);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
    dimension.height
  } Q${dimension.width / 2} ${dimension.height + 300} 0 ${
    dimension.height
  } L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${
    dimension.height
  } Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height} L0 0`;

  const curve = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 99,
        backgroundColor: "#141516",
        overflow: "hidden",
      }}
    >
      {dimension.width > 0 && (
        <>
          {/* Background decorative elements */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "120px",
                height: "120px",
                border: "2px solid transparent",
                borderLeftColor: "rgba(252, 211, 77, 0.3)",
                borderTopColor: "rgba(252, 211, 77, 0.3)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: "120px",
                height: "120px",
                border: "2px solid transparent",
                borderRightColor: "rgba(252, 211, 77, 0.3)",
                borderTopColor: "rgba(252, 211, 77, 0.3)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                width: "120px",
                height: "120px",
                border: "2px solid transparent",
                borderLeftColor: "rgba(252, 211, 77, 0.3)",
                borderBottomColor: "rgba(252, 211, 77, 0.3)",
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: "120px",
                height: "120px",
                border: "2px solid transparent",
                borderRightColor: "rgba(252, 211, 77, 0.3)",
                borderBottomColor: "rgba(252, 211, 77, 0.3)",
              }}
            ></div>
          </div>

          {/* Main content */}
          <motion.div
            style={{
              position: "relative",
              zIndex: 2,
            }}
            variants={opacity}
            initial="initial"
            animate="enter"
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                color: "oklch(90.5% 0.182 98.111)",
                fontSize: "80px",
                fontWeight: 700,
                fontFamily: '"Qwigley", cursive',
                letterSpacing: "0.02em",
              }}
            >
              <span
                style={{
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {words[index]}
              </span>
            </div>
          </motion.div>

          {/* Brand at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: "80px",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "8px",
              }}
            >
              <h1
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: "white",
                  fontFamily: '"Qwigley", cursive',
                  margin: 0,
                  lineHeight: 1,
                }}
              >
                ZIPP
              </h1>
              <h1
                style={{
                  fontSize: "36px",
                  fontWeight: 700,
                  color: "#fcd34d",
                  fontFamily: '"Qwigley", cursive',
                  margin: 0,
                  marginTop: "16px",
                  lineHeight: 1,
                }}
              >
                Dine
              </h1>
            </div>
          </div>

          {/* SVG Curve */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "calc(100% + 300px)",
              pointerEvents: "none",
            }}
          >
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
              fill="#141516"
            />
          </svg>
        </>
      )}
    </motion.div>
  );
}
