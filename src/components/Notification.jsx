/**
 * components/Notification.jsx
 * Toast de feedback que some automaticamente após 2.8s.
 */
import { useEffect } from 'react';

export default function Notification({ msg, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className={`notif notif-${type}`}>
      <span>{type === 'success' ? '✓' : '✕'}</span>
      {msg}
    </div>
  );
}
