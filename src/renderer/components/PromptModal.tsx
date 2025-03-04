import React, { useState, useEffect, useRef } from 'react'

interface PromptModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (value: string) => void
  title: string
  defaultValue: string
  anchorElement?: HTMLElement | null
}

export function PromptModal({ isOpen, onClose, onConfirm, title, defaultValue, anchorElement }: PromptModalProps) {
  const [value, setValue] = useState(defaultValue)
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Focus input on modal open and position modal
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
    
    // Position modal relative to the anchor element if provided
    if (isOpen && anchorElement && modalRef.current) {
      const anchorRect = anchorElement.getBoundingClientRect()
      const modalRect = modalRef.current.getBoundingClientRect()
      
      // Position to the right of the button with more spacing
      const left = anchorRect.right + 16
      // Align vertically centered with the button, but slightly higher
      const top = anchorRect.top - (modalRect.height / 2) + (anchorRect.height / 2) - 20
      
      // Make sure the modal doesn't go off-screen on the top
      const adjustedTop = Math.max(20, top)
      // Make sure the modal doesn't go off-screen on the bottom
      const maxBottom = window.innerHeight - 20
      const adjustedBottom = adjustedTop + modalRect.height
      const finalTop = adjustedBottom > maxBottom 
        ? maxBottom - modalRect.height 
        : adjustedTop
      
      modalRef.current.style.position = 'fixed'
      modalRef.current.style.left = `${left}px`
      modalRef.current.style.top = `${finalTop}px`
      modalRef.current.style.transform = 'none'
    }
  }, [isOpen, anchorElement])

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      } else if (e.key === 'Enter' && isOpen) {
        handleConfirm()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, value])

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value)
    }
  }

  if (!isOpen) return null

  // Create floating modal when we have an anchor element, or centered modal when not
  if (anchorElement) {
    return (
      <div className="fixed inset-0 z-40" onClick={onClose}>
        <div 
          ref={modalRef}
          onClick={e => e.stopPropagation()}
          className="modal-container bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg z-50"
          style={{ width: "280px" }}
        >
          <h2 className="text-md font-semibold mb-3 dark:text-white">{title}</h2>
          
          <div className="flex justify-center mb-6">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full px-2 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              placeholder="Enter a name"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button 
              onClick={onClose}
              className="btn-sm btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              className="btn-sm btn-primary"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  // Fallback to centered modal
  return (
    <div className="fixed inset-0 modal-overlay flex items-center justify-center z-50">
      <div 
        ref={modalRef}
        className="modal-container bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg"
        style={{ width: "280px" }}
      >
        <h2 className="text-md font-semibold mb-3 dark:text-white">{title}</h2>
        
        <div className="flex justify-center mb-6">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-full px-2 py-1 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            placeholder="Enter a name"
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose}
            className="btn-sm btn-secondary"
          >
            Cancel
          </button>
          <button 
            onClick={handleConfirm}
            className="btn-sm btn-primary"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}