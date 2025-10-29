'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { getMoodStyles } from '@/utils/mood-utils'
import { X } from 'lucide-react'

export default function JournalEntryModal({ entry, onClose }) {
  const moodStyles = getMoodStyles(entry.mood)

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
      >
        <motion.div
          key="modal"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-xl w-full p-6"
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-pink-600"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`text-2xl ${moodStyles.text}`}>{moodStyles.icon}</div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {format(new Date(entry.createdAt), 'EEEE, MMMM d, yyyy')}
              </p>
              <p className="text-xs text-gray-400">
                {format(new Date(entry.createdAt), 'HH:mm')}
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {entry.content}
          </div>

          {/* Mood bar or info */}
          <div className="mt-4 text-xs text-right text-gray-400">
            Mood: <span className={moodStyles.text}>{entry.mood}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
