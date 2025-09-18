'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000

function loadCartFromStorage() {
  try {
    const data = JSON.parse(localStorage.getItem('cart'))
    if (data && data.expiry > Date.now()) {
      return data.items || []
    }
    localStorage.removeItem('cart')
  } catch (e) {
    return []
  }
  return []
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    setCartItems(loadCartFromStorage())
  }, [])

  useEffect(() => {
    const cartData = {
      items: cartItems,
      expiry: Date.now() + CART_EXPIRY_MS,
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }, [cartItems])

  const addToCart = (product, quantity) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.id === product.id && item.size === product.size
      )
      if (idx >= 0) {
        const updated = [...prev]
        updated[idx].quantity += quantity
        return updated
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.size === size))
    )
  }

  const clearCart = () => setCartItems([])

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, removeFromCart, clearCart, cartCount }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}
