"use client";

import { createContext, useContext, useState } from "react";

const QuickViewContext = createContext(null);

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  const openQuickView = (productData) => {
    setProduct(productData);
    setIsOpen(true);

    // close mini cart if open
    window.dispatchEvent(new Event("close-mini-cart"));
  };

  const closeQuickView = () => {
    setIsOpen(false);
    setProduct(null);
  };

  return (
    <QuickViewContext.Provider
      value={{
        product,
        isOpen,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export const useQuickView = () => useContext(QuickViewContext);
