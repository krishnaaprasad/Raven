"use client";

import { motion } from "framer-motion";

/**
 * A lightweight scroll animation wrapper. 
 * Doesn't affect layout or speed because it uses GPU-accelerated translate.
 */
export default function ScrollReveal({ children, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.215, 0.610, 0.355, 1.000] // smooth cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
}
