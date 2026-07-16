"use client";

import { useCallback, useState } from "react";

/** Shared open/close state for the mobile menu and FAQ accordion items. */
export function useDisclosure(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);

  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, open, close };
}
