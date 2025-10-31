"use client";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Rebel Eau De Parfum",
      price: 2499,
      stock: 30,
      size: "100ml",
      image: "/perfume1.jpg",
    },
    {
      id: 2,
      name: "Midnight Essence",
      price: 1899,
      stock: 15,
      size: "50ml",
      image: "/perfume2.jpg",
    },
  ]);

  return (
    <div className="text-gray-800 dark:text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg font-semibold hover:scale-105 transition-transform"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-[#1c1c1c] rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 dark:bg-[#2a2a2a] text-left text-gray-700 dark:text-gray-300">
            <tr>
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">Size</th>
              <th className="py-3 px-4">Stock</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition"
              >
                <td className="py-3 px-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded-md border"
                  />
                </td>
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4">₹{product.price}</td>
                <td className="py-3 px-4">{product.size}</td>
                <td className="py-3 px-4">{product.stock}</td>
                <td className="py-3 px-4 text-right space-x-2">
                  <button className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                    <Pencil size={16} />
                  </button>
                  <button className="p-2 rounded-md bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-800 transition">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
