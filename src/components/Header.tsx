'use client';

import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "motion";
import { NAV, PROFILE } from "@/data/content";
import { useActiveSection } from "@/lib/useActiveSection";

export default function Header() {
    const { active } = useActiveSection();
    const [menuOpen, setMenuOpen] = useState(false);
    const navRef = useRef<HTMLElement>(null);
    const indRef = useRef<HTMLSpanElement>(null);
    const firstMove = useRef(true);

    const closeMenu = useCallback(() => setMenuOpen(false), []);

    const moveInd = useCallback(
        (instant: boolean) => {
            const nav = navRef.current;
            const ind = indRef.current;
            if (!nav || !ind) return;
            const idx = NAV.findIndex((n) => n.id === active);
            const a = nav.querySelectorAll('a')[idx] as HTMLElement | undefined;
            if (!a || !a.offsetWidth) return;
            const left = a.offsetLeft + 14;
            const w = a.offsetWidth - 28;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            if (instant || reduce) {
                ind.style.transform = `translateX(${left}px)`;
                ind.style.width = `${w}px`;
            } else {
                animate(ind, { x: left, width: w }, { duration: 0.45, ease: [0.2, 0.7, 0.2, 1] });
            }
        },
        [active],
    );

    useEffect(() => {
        moveInd(firstMove.current);
        firstMove.current = false;
    }, [moveInd]);

    useEffect(() => {
        const onResize = () => {
            moveInd(true);
            if (window.innerWidth > 960) setMenuOpen(false);
        };
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setMenuOpen(false);
        }
        window.addEventListener('resize', onResize);
        document.addEventListener('keydown', onKey);
        document.fonts?.ready.then(onResize);
        return () => {
            window.removeEventListener('resize', onResize);
            document.removeEventListener('keydown', onKey);
        };
    }, [moveInd]);

    return (
        <header className="site" data-menu={menuOpen ? 'true' : 'false'}>
            <div className="wrap">
                <a className="brand" href="#inicio" aria-label={`${PROFILE.name}, ir para o início`}>
                    <span className="ln"><span>{PROFILE.name}</span></span>
                </a>
                <nav className="nav-d" aria-label="Principal" ref={navRef}>
                    {NAV.map((n) => (
                        <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'page' : undefined} onClick={closeMenu}>
                            {n.label}
                        </a>
                    ))}
                    <span className="nav-ind" id="navInd" ref={indRef} aria-hidden="true" />
                </nav>
                <a className="hcta" href="#contato">
                    Vamos conversar<span aria-hidden="true">↗</span>
                </a>
                <button
                    className="burger"
                    type="button"
                    aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
                    aria-expanded={menuOpen}
                    aria-controls="mpanel"
                    onClick={() => setMenuOpen((v) => !v)}
                >
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                    <i aria-hidden="true" />
                </button>
            </div>
            <div className="progress" id="progress" aria-hidden="true" />
            <div className="mback" aria-hidden="true" onClick={closeMenu} />
            <nav className="mpanel" id="mpanel" aria-label="Menu móvel">
                {NAV.map((n) => (
                    <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'page' : undefined} onClick={closeMenu}>
                        {n.label}
                    </a>
                ))}
            </nav>
        </header>
    );
}