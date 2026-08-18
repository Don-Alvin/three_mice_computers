'use client'

import { useEffect, type RefObject } from 'react'

/**
 * Modality for a slide-out panel: focus trap, Escape to close, body scroll lock,
 * and focus returned to whatever opened it.
 *
 * Shared by the cart drawer and the mobile nav because `aria-modal="true"` is an
 * *assertion* that the rest of the page is unreachable — a panel that sets it
 * without trapping focus is simply lying, and two hand-rolled copies of this
 * would drift the moment one of them was fixed.
 */
export const useModalPanel = ({
  isOpen,
  onClose,
  panel,
  initialFocus,
}: {
  isOpen: boolean
  onClose: () => void
  panel: RefObject<HTMLElement | null>
  initialFocus: RefObject<HTMLElement | null>
}): void => {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const panelEl = panel.current

    // Captured before focus moves, so this is genuinely the opener.
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null

    /**
     * Queried per keypress rather than cached: panel contents change while open
     * (an empty cart has one control, a full one has many, and the quantity
     * stepper's `+` drops out at MAX_QTY).
     */
    const focusable = (): HTMLElement[] =>
      panelEl
        ? Array.from(
            panelEl.querySelectorAll<HTMLElement>(
              'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
          )
        : []

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()

        return
      }

      if (event.key !== 'Tab' || !panelEl) {
        return
      }

      const items = focusable()

      if (items.length === 0) {
        event.preventDefault()

        return
      }

      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement

      // Without this, Tab walks out into the page behind the scrim and the
      // aria-modal claim becomes false.
      if (!panelEl.contains(active)) {
        event.preventDefault()
        first.focus()

        return
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    const previousOverflow = document.body.style.overflow

    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeyDown)
    initialFocus.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)

      // Only reclaim focus that is still the panel's to give back: if a
      // navigation or anything else has legitimately taken it, leave it alone.
      const active = document.activeElement
      const focusIsOurs = !active || active === document.body || panelEl?.contains(active)

      if (opener && focusIsOurs && document.body.contains(opener)) {
        opener.focus()
      }
    }
  }, [isOpen, onClose, panel, initialFocus])
}
