'use client'

import { LampContainer } from '@/components/ui/lamp'
import { motion } from 'framer-motion'
import {
  BrainCog,
  MessageSquareDashed,
  ShieldCheck
} from 'lucide-react'

const benefits = [
  {
    icon: <BrainCog className="w-10 h-10 text-primary" />,
    title: 'No pressure, just thoughts.',
    desc: 'Write freely without fear of judgment. This is your space.',
  },
  {
    icon: <MessageSquareDashed className="w-10 h-10 text-primary" />,
    title: 'Be seen, even in silence.',
    desc: 'React to others and feel connected without saying a word.',
  },
  {
    icon: <ShieldCheck className="w-10 h-10 text-primary" />,
    title: 'Your identity stays yours.',
    desc: 'We never ask who you are. Here, you’re safe. Always.',
  },
]

export default function WhyThisApp() {
  return (
    <section className="relative">
      <LampContainer>
        <motion.h2
          initial={{ opacity: 0.5, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="text-center text-4xl md:text-6xl font-bold text-primary mb-6"
        >
          A Place Where Emotions Breathe
        </motion.h2>

        {/* Cards responsive + safe */}
        <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-3 py-8 px-0">
          {benefits.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              className="bg-surface/70 backdrop-blur-lg rounded-xl p-6 border border-white/10 shadow-lg"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-semibold text-text mb-2">{item.title}</h3>
              <p className="text-muted text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </LampContainer>
    </section>
  )
}
