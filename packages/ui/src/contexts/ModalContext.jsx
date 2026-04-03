import { createContext, useCallback, useEffect, useMemo, useState } from 'react'

import {
  Dialog,
  DialogBackdrop,
  DialogContent,
  DialogPortal
} from '@/components/ui'

const ModalContext = createContext()

export const ModalProvider = ({ children }) => {
  const [modals, setModals] = useState([])

  const closeModal = useCallback(id => {
    setModals(prev => prev.filter(modal => modal.id !== id))
  }, [])

  const openModal = useCallback(
    modalConfig => {
      const id = crypto.randomUUID()
      const modal = {
        id,
        size: 'md',
        ...modalConfig
      }

      setModals(prev => [...prev, modal])

      return () => closeModal(id)
    },
    [closeModal]
  )

  const closeAllModals = useCallback(() => {
    setModals([])
  }, [])

  const updateModal = useCallback((id, updates) => {
    setModals(prev =>
      prev.map(modal => (modal.id === id ? { ...modal, ...updates } : modal))
    )
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      if (modals.length > 0) {
        closeAllModals()
      }
    }

    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [modals.length, closeAllModals])

  const value = useMemo(
    () => ({
      modals,
      openModal,
      closeModal,
      closeAllModals,
      updateModal
    }),
    [modals, openModal, closeModal, closeAllModals, updateModal]
  )

  return (
    <ModalContext value={value}>
      {children}

      {modals.map(modal => (
        <Dialog
          key={modal.id}
          defaultOpen
          onOpenChange={open => {
            if (!open) {
              closeModal(modal.id)
            }
          }}
        >
          <DialogPortal>
            <DialogBackdrop />
            <DialogContent size={modal.size} className={modal.className}>
              {modal.children}
            </DialogContent>
          </DialogPortal>
        </Dialog>
      ))}
    </ModalContext>
  )
}

export default ModalContext
