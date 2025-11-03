'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

function loadCartFromStorage() {
  try {
    // 🧾 Check for failed order retry first
    const failedOrder = localStorage.getItem('failedOrder')
    if (failedOrder) {
      const parsed = JSON.parse(failedOrder)
      if (parsed.cartItems && Array.isArray(parsed.cartItems)) {
        return parsed.cartItems
      }
    }

    // 🛒 Otherwise load normal cart
    const data = JSON.parse(localStorage.getItem('cart'))
    if (data && data.expiry > Date.now() && Array.isArray(data.items)) {
      return data.items.map(item => ({
        ...item,
        // ✅ Ensure backward compatibility
        slug: item.slug || '', 
        image: item.image || '',
      }))
    }

    localStorage.removeItem('cart')
  } catch (e) {
    console.error('Error loading cart:', e)
  }

  return []
}

// 🧩 Helper to save failed order for retry
export function saveFailedOrder(cartItems, userData) {
  try {
    localStorage.setItem(
      'failedOrder',
      JSON.stringify({
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        userData,
      })
    )
  } catch (e) {
    console.error('Error saving failed order:', e)
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // 🔹 Load cart once
  useEffect(() => {
    setCartItems(loadCartFromStorage())
  }, [])

  // 🔹 Persist cart with expiry
  useEffect(() => {
    const cartData = {
      items: cartItems,
      expiry: Date.now() + CART_EXPIRY_MS,
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }, [cartItems])

  // ✅ Add product (with slug)
  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const idx = prev.findIndex(
        item => item.id === product.id && item.size === product.size
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx].quantity += quantity
        return updated
      }

      return [
        ...prev,
        {
          ...product,
          slug: product.slug || '',
          image: product.image || '',
          quantity,
        },
      ]
    })
  }

  // ✅ Remove product
  const removeFromCart = (productId, size) => {
    setCartItems(prev =>
      prev.filter(item => !(item.id === productId && item.size === size))
    )
  }

  // ✅ Update product quantity
  const updateQuantity = (productId, size, newQty) => {
    if (newQty < 1) return
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId && item.size === size
          ? { ...item, quantity: newQty }
          : item
      )
    )
  }

  // ✅ Clear all
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
    localStorage.removeItem('failedOrder')
  }

  // ✅ Cart count
  const cartCount = Array.isArray(cartItems)
    ? cartItems.reduce((acc, item) => acc + item.quantity, 0)
    : 0

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
