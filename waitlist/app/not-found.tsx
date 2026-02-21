"use client"

import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-16">
      <motion.h1
        className="text-8xl sm:text-9xl font-bold text-foreground mb-4 select-none"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.02 }}
      >
        404
      </motion.h1>
      <motion.p
        className="text-lg sm:text-xl text-muted-foreground mb-2 text-center max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        Page not found
      </motion.p>
      <motion.p
        className="text-base sm:text-lg text-foreground/80 mb-10 text-center max-w-lg font-medium italic"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Verily, this path hath led to naught — thy yield awaiteth elsewhere. Return to the homestead.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-6 py-3 text-base font-medium hover:bg-primary/90 transition-colors"
        >
          Return to the homestead
        </Link>
      </motion.div>
    </div>
  )
}
