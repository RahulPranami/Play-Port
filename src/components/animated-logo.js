"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AnimatedLogo({ size = 300, className = "" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Animated Glow Rings */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute rounded-full bg-gradient-to-tr from-violet-500/20 via-pink-500/20 to-amber-500/20 blur-3xl"
        style={{ width: size * 1.5, height: size * 1.5 }}
      />

      <motion.div
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.2, 0.4, 0.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute rounded-full bg-gradient-to-bl from-blue-500/10 via-emerald-500/10 to-rose-500/10 blur-2xl"
        style={{ width: size * 1.8, height: size * 1.8 }}
      />

      {/* Main Logo Container */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
        }}
        className="relative z-10"
      >
        <motion.div
          animate={{
            y: [0, -15, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="drop-shadow-2xl"
        >
          <Image
            src="/Play Port.svg"
            alt="Play Port Logo"
            width={size}
            height={size}
            priority
            className="object-contain"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
