'use client';
import { useEffect } from 'react';

/**
 * ✅ usePageMetadata(title, description)
 * Dynamically sets <title> and <meta description> for client components.
 * Works safely in all 'use client' pages without build errors.
 */
export default function usePageMetadata(title, description) {
  useEffect(() => {
    if (!title && !description) return;

    // 🏷️ Set Page Title
    if (title) document.title = title;

    // 🧾 Set or Create Meta Description
    if (description) {
      const existingMeta = document.querySelector('meta[name="description"]');
      if (existingMeta) {
        existingMeta.setAttribute('content', description);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = description;
        document.head.appendChild(meta);
      }
    }
  }, [title, description]);
}
