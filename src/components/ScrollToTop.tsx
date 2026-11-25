'use client';

import { useActiveSection } from '@/lib/useActiveSection';

export default function ScrollToTop() {
    const { showTop } = useActiveSection();
    if (!showTop) return null;
    return (
        <button
            className="totop"
            type="button"
            aria-label="Voltar ao topo"
            onClick={() => {
                const el = document.getElementById('inicio');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                else window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
        </button>
    );
}