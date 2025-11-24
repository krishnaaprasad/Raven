export default function AdminLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ background: '#eee', minHeight: '100vh' }}>
        <div style={{ border: '4px solid red', padding: 16 }}>
          <h1>ADMIN ONLY LAYOUT</h1>
          {children}
        </div>
      </body>
    </html>
  );
}
