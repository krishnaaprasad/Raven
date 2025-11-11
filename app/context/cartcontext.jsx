'use client'
import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

// ✅ Load cart or failed order data from storage
function loadCartFromStorage() {
  try {
    // 🧾 If failed order exists, restore its cart items first
    const failedOrder = localStorage.getItem('failedOrder')
    if (failedOrder) {
      const parsed = JSON.parse(failedOrder)
      if (parsed.cartItems && Array.isArray(parsed.cartItems)) {
        console.log('🛒 Restored cart from failed order:', parsed.cartItems)
        return parsed.cartItems
      }
    }

    // 🛒 Otherwise, load normal cart
    const data = JSON.parse(localStorage.getItem('cart'))
    if (data && data.expiry > Date.now() && Array.isArray(data.items)) {
      return data.items.map(item => ({
        ...item,
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

// 🧩 Save full failed order (cart + address)
export function saveFailedOrder(cartItems, userData) {
  try {
    if (!cartItems?.length) return
    localStorage.setItem(
      'failedOrder',
      JSON.stringify({
        cartItems: Array.isArray(cartItems) ? cartItems : [],
        userData: userData || {},
      })
    )
    console.log('💾 Saved failed order for retry')
  } catch (e) {
    console.error('Error saving failed order:', e)
  }
}

// 🧩 Load failed order address data
export function loadFailedOrderData() {
  try {
    const data = JSON.parse(localStorage.getItem('failedOrder'))
    return data?.userData || null
  } catch {
    return null
  }
}

// ✅ Clear failed order explicitly
export function clearFailedOrder() {
  localStorage.removeItem('failedOrder')
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  // ✅ Always attempt to load on mount
    useEffect(() => {
    const loadCart = () => {
      const storedCart = loadCartFromStorage();
      setCartItems(storedCart);
    };

    // ✅ Load immediately
    loadCart();

    // ✅ Re-sync if failedOrder is saved later (like from OrderSuccess)
    window.addEventListener('storage', loadCart);

    return () => {
      window.removeEventListener('storage', loadCart);
    };
  }, []);


  // ✅ Persist cart in localStorage on change
  useEffect(() => {
    const cartData = {
      items: cartItems,
      expiry: Date.now() + CART_EXPIRY_MS,
    }
    localStorage.setItem('cart', JSON.stringify(cartData))
  }, [cartItems])

  // ✅ Add product
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

  // ✅ Update quantity
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

  // ✅ Clear cart (but not failed order)
  const clearCart = () => {
    setCartItems([])
    localStorage.removeItem('cart')
  }

  // ✅ Save specific cart
  const saveCart = (items) => {
    setCartItems(items)
    localStorage.setItem(
      'cart',
      JSON.stringify({ items, expiry: Date.now() + CART_EXPIRY_MS })
    )
  }

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
        saveCart,
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
