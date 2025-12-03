'use client'
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from "uuid";


const CartContext = createContext()
const CART_EXPIRY_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

if (typeof window !== "undefined" && !localStorage.getItem("guestSessionId")) {
  localStorage.setItem("guestSessionId", uuidv4());
}

const sessionId = typeof window !== "undefined"
  ? localStorage.getItem("guestSessionId")
  : null;


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

function saveToLocal(items) {
  localStorage.setItem(
    "cart",
    JSON.stringify({ items, expiry: Date.now() + CART_EXPIRY_MS })
  );
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

  }, []);


  // // ✅ Persist cart in localStorage on change
  // useEffect(() => {
  //   const cartData = {
  //     items: cartItems,
  //     expiry: Date.now() + CART_EXPIRY_MS,
  //   }
  //   localStorage.setItem('cart', JSON.stringify(cartData))
  // }, [cartItems])
  

  useEffect(() => {
  function handleClearCart() {
    setCartItems([]);
  }

  window.addEventListener("clear-cart", handleClearCart);
  return () => window.removeEventListener("clear-cart", handleClearCart);
}, []);

  const lastSentRef = React.useRef(null);

// 🛑 Prevent re-syncing on first page load
  const firstLoadRef = React.useRef(true);

  useEffect(() => {
   if (firstLoadRef.current) {
    firstLoadRef.current = false;
    return;
  }

  if (!cartItems || cartItems.length === 0) return;

  const json = JSON.stringify(cartItems);
  if (json === lastSentRef.current) return; // prevent identical resync loop

  lastSentRef.current = json;

    const timeout = setTimeout(async () => {
      try {
        await fetch("/api/cart/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems, sessionId }),
        });
      } catch (err) {
        console.log("Cart sync error:", err);
      }
    }, 800); // ⏳ Calls after 800ms pause

    return () => clearTimeout(timeout);
   }, [cartItems, sessionId]);


  // ✅ Add product
  const addToCart = (product, quantity) => {
    setCartItems(prev => {
      const idx = prev.findIndex(item => item.id === product.id && item.size === product.size);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx].quantity += quantity;
      } else {
        updated = [...prev, { ...product, slug: product.slug || '', image: product.image || '', quantity }];
      }
      saveToLocal(updated);
      return updated;
    });
  };


  // ✅ Remove product
  const removeFromCart = (productId, size) => {
    setCartItems(prev => {
      const updated = prev.filter(item => !(item.id === productId && item.size === size));
      saveToLocal(updated);
      return updated;
    });
  };

  // ✅ Update quantity
  const updateQuantity = (productId, size, newQty) => {
    if (newQty < 1) return;
    setCartItems(prev => {
      const updated = prev.map(item =>
        item.id === productId && item.size === size ? { ...item, quantity: newQty } : item
      );
      saveToLocal(updated);
      return updated;
    });
  };


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
