'use client';

import { useEffect, useRef } from 'react';
import { animate } from 'motion';

/** Cena 3D holográfica do hero (Three.js carregado sob demanda). */
export default function HeroCanvas() {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        let cancelled = false;
        let scene: { dispose: () => void; replay: () => void; reset: () => void } | null = null;
        const onReplay = () => scene?.replay();
        const onReset = () => scene?.reset();
        window.addEventListener('hero:replay', onReplay);
        window.addEventListener('hero:reset', onReset);
        (async () => {
            const canvas = ref.current;
            if (!canvas) return;
            const { init } = await import('@/lib/hero-scene');
            if (cancelled) return;
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            try {
                scene = init(canvas, { animate: reduce ? null : (from, to, o) => animate(from, to, o), reduce });
            } catch {
                canvas.parentElement?.classList.add('no-gl');
            }
        })();
        return () => {
            cancelled = true;
            window.removeEventListener('hero:replay', onReplay);
            window.removeEventListener('hero:reset', onReset);
            scene?.dispose();
        };
    }, []);

    return (
        <canvas
            id="heroCanvas"
            ref={ref}
            role="img"
            aria-label="Interface holográfica em 3D: janela, cartões e botões translúcidos em tons de violeta flutuando em camadas, com os símbolos de código </> e { }"
        />
    );
}