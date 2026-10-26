export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-surface)',
      padding: 'var(--space-6) 0',
      marginTop: 'auto',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '0.85rem',
        color: 'var(--color-text-muted)',
        flexWrap: 'wrap',
        gap: 'var(--space-4)',
      }}>
        <span>© {new Date().getFullYear()} SubastasRT — Sistema de subastas en tiempo real</span>
        <span>Desarrollado con Spring Boot + React</span>
      </div>
    </footer>
  );
}
