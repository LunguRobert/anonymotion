'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Pencil, Send } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      icon: <Pencil className="w-8 h-8 text-primary" />,
      title: '1. Write Anonymously',
      description:
        'Express your thoughts freely, no name, no judgment — just honesty.',
    },
    {
      icon: <Send className="w-8 h-8 text-primary" />,
      title: '2. Share Instantly',
      description:
        'Post with one click and join a safe space where others resonate with you.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-primary" />,
      title: '3. Connect Silently',
      description:
        'Receive silent reactions that show empathy without breaking your anonymity.',
    },
  ]

  return (
    <section className="relative w-full bg-surface py-20 px-4 md:px-8 isolate overflow-hidden mb-4">
    <div className="max-w-7xl mx-auto px-4">
      <div className="absolute inset-0 -z-10 opacity-10 pointer-events-none">
        {/* Decorative gradient background */}
        <div className="absolute top-0 left-1/2 w-[80vw] h-[80vw] -translate-x-1/2 bg-gradient-to-br from-primary/30 to-secondary/30 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-3xl md:text-5xl font-bold text-text mb-12"
        >
          How It Works
        </motion.h2>

        <div className="grid gap-12 md:grid-cols-3">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="flex flex-col items-center text-center space-y-4"
            >
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-card shadow-inner">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-text">{step.title}</h3>
              <p className="text-muted text-sm max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
    </section>
  )
}
