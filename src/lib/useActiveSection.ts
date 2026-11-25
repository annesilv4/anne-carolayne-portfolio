'use client';

import { useEffect, useState } from 'react';
import { SECTION_IDS } from '@/data/content';

export function useActiveSection() {
    const [active, setActive] = useState<string>(SECTION_IDS[0]);
    const [showTop, setShowTop] = useState(false);

    useEffect(() => {
        const on = () => {
            let cur: string = SECTION_IDS[0];
            for (const id of SECTION_IDS) {
                const el = document.getElementById(id);
                if (el && el.getBoundingClientRect().top <= 140) cur = id;
            }
            setActive(cur);
            setShowTop((window.scrollY || document.documentElement.scrollTop || 0) > 600);
        };
        window.addEventListener('scroll', on, { passive: true });
        document.addEventListener('scroll', on, true);
        on();
        return () => {
            window.removeEventListener('scroll', on);
            document.removeEventListener('scroll', on, true);
        };
    }, []);

    return { active, showTop };
}