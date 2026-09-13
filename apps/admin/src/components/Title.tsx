import { Link } from 'react-router-dom';

export const Title = ({ collapsed }: { collapsed: boolean }) => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', textDecoration: 'none' }}>
    <span
      style={{
        display: 'inline-grid',
        placeItems: 'center',
        width: 32,
        height: 32,
        borderRadius: 8,
        background: '#1651e1',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
        flexShrink: 0,
      }}
    >
      EA
    </span>
    {!collapsed && (
      <span style={{ fontWeight: 700, fontSize: 16, color: 'rgba(0,0,0,0.88)' }}>EA Computers</span>
    )}
  </Link>
);
