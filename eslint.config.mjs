import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

export default [
  ...nextCoreWebVitals,
  {
    rules: {
      // These experimental React compiler lint rules are overly strict and
      // flag standard patterns (setState in useEffect, function hoisting).
      // Safe to disable until the rules stabilize.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      "react-hooks/refs": "off",
      "react-hooks/purity": "off",

      // Allow <img> in admin / internal pages
      "@next/next/no-img-element": "warn",

      // Suppress missing-dep warnings (too noisy, can cause infinite loops if blindly followed)
      "react-hooks/exhaustive-deps": "warn",
    },
  },
];
