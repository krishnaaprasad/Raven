export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private / transactional pages have no search value
      disallow: ["/admin", "/api/", "/checkout", "/Cart", "/my-account", "/order-success", "/auth"],
    },
    sitemap: "https://www.ravenfragrance.in/sitemap.xml",
  };
}
