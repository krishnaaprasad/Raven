'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";
import { event } from "@/lib/ga";

const CartContext = createContext()
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// Guest Session ID
if (typeof window !== "undefined" && !localStorage.getItem("guestSessionId")) {
  localStorage.setItem("guestSessionId", uuidv4());
}

const sessionId = typeof window !== "undefined"
  ? localStorage.getItem("guestSessionId")
  : null;

// Load Cart
function loadCartFromStorage() {
  try {
    const failedOrder = localStorage.getItem('failedOrder')
    if (failedOrder) {
      const parsed = JSON.parse(failedOrder)
      if (parsed.cartItems && Array.isArray(parsed.cartItems)) {
        return parsed.cartItems
      }
    }

    const data = JSON.parse(localStorage.getItem('cart'))
    if (data && data.expiry > Date.now() && Array.isArray(data.items)) {
      return data.items
    }

    localStorage.removeItem('cart')
  } catch (e) {}
  return []
}

function saveToLocal(items) {
  localStorage.setItem(
    "cart",
    JSON.stringify({ items, expiry: Date.now() + CART_EXPIRY_MS })
  );
}

// Failed Order
export function saveFailedOrder(cartItems, userData) {
  try {
    localStorage.setItem('failedOrder', JSON.stringify({
      cartItems: Array.isArray(cartItems) ? cartItems : [],
      userData: userData || {},
    }))
  } catch {}
}

export function loadFailedOrderData() {
  try {
    const data = JSON.parse(localStorage.getItem('failedOrder'))
    return data?.userData || null
  } catch { return null }
}

export function clearFailedOrder() {
  localStorage.removeItem('failedOrder')
}

export function CartProvider({ children }) {

  // 🛍 CART ITEMS
  const [cartItems, setCartItems] = useState([])

  // ⭐ MINI CART OPEN/CLOSE STATE
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = () => setIsCartOpen(true)
  const closeCart = () => setIsCartOpen(false)

  // Load Cart on mount
  useEffect(() => {
    setCartItems(loadCartFromStorage())
  }, [])

  // Clear Cart Event
  useEffect(() => {
    const handleClearCart = () => setCartItems([])

    window.addEventListener("clear-cart", handleClearCart)
    return () => window.removeEventListener("clear-cart", handleClearCart)
  }, [])

  // Sync Cart to backend
  const lastSentRef = React.useRef(null)
  const firstLoadRef = React.useRef(true)

  useEffect(() => {
    if (firstLoadRef.current) {
      firstLoadRef.current = false
      return;
    }

    if (!cartItems.length) return;

    const json = JSON.stringify(cartItems)
    if (json === lastSentRef.current) return;

    lastSentRef.current = json;

    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems, sessionId }),
        })
      } catch (err) {}
    }, 800)

    return () => clearTimeout(timeout)
  }, [cartItems, sessionId])

  // Add
  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.id === product.id && item.size === product.size)
      let updated

      if (idx >= 0) {
        updated = [...prev]
        updated[idx].quantity += quantity
      } else {
        updated = [...prev, { ...product, quantity }]
      }

      saveToLocal(updated)
      // 🔥 GA4 Track add_to_cart (safe + non-blocking)
      event({
        action: "add_to_cart",
        params: {
          currency: "INR",
          value: product.price * quantity,
          items: [
            {
              item_id: product.id,
              item_name: product.name,
              price: product.price,
              quantity,
              item_variant: product.size,
            },
          ],
        },
      })
      return updated
    })
  }

  // Remove
  const removeFromCart = (productId, size) => {
    setCartItems(prev => {
      const updated = prev.filter(item => !(item.id === productId && item.size === size))
      saveToLocal(updated)
      return updated
    })
  }

  // Update Qty
  const updateQuantity = (productId, size, newQty) => {
    if (newQty < 1) return
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
      saveToLocal(updated)
      return updated
    })
  }

  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  const saveCart = (items) => {
    setCartItems(items)
    saveToLocal(items)
  }

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,

        addToCart,
        removeFromCart,
        updateQuantity,

        clearCart,
        saveCart,

        // ⭐ MINI CART CONTROL
        isCartOpen,
        openCart,
        closeCart
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
