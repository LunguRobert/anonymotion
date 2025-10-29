'use client'

import { useState } from 'react'

const faqs = [
  {
    question: "Is this really anonymous?",
    answer:
      "Yes. We don’t store your name next to your posts. You can express freely without fear of being identified.",
  },
  {
    question: "Can others see who I am?",
    answer:
      "No. Your identity is hidden. Even if you log in, your posts and reactions remain detached from your name.",
  },
  {
    question: "How can I connect with others?",
    answer:
      "You can react to other people's anonymous posts using emotion-based icons. It's a quiet way to say 'I feel you'.",
  },
]


export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section className="bg-surface py-20 px-4">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-text mb-8">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-card border border-muted/30 rounded-lg p-4 transition-all duration-300"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full text-left text-lg font-medium text-text focus:outline-none flex justify-between items-center"
              >
                {faq.question}
                <span className="text-muted text-xl">
                  {openIndex === index ? '−' : '+'}
                </span>
              </button>
              {openIndex === index && (
                <p className="mt-2 text-muted text-base">{faq.answer}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
