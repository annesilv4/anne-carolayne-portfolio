import { animate, hover, press, scroll, stagger } from 'motion';

type Ease = [number, number, number, number];
type Stop = () => void;

/**
 * Animações de entrada, rolagem, loops e microinterações da página.
 * Chame dentro de um useEffect e use o retorno como cleanup (seguro no StrictMode).
 *
 * Regra do projeto: nenhum efeito acompanha o ponteiro (sem cursor customizado, rastros ou tilt).
 */
export function initEffects(): () => void {
    const $$ = <T extends Element = HTMLElement>(sel: string) => Array.from(document.querySelectorAll<T>(sel));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const stops: Stop[] = []; // tudo que precisa ser desfeito
    const on = (target: EventTarget, type: string, fn: EventListener, opts?: boolean | AddEventListenerOptions) => {
        target.addEventListener(type, fn, opts);
        stops.push(() => target.removeEventListener(type, fn, opts));
    };

    /* ------------------------------------------------------------------
     * 1) Loops em CSS: pausam fora da tela / aba oculta e SEMPRE retomam.
     *    O CSS lê --hps (página) e --vps (cada bloco).
     * ------------------------------------------------------------------ */
    const page = document.querySelector<HTMLElement>('.page');
    const refreshLoops = () => {
        const h = window.innerHeight || 0;
        $$('.hero,.marq,.sec,.foot').forEach((e) => {
            const r = e.getBoundingClientRect();
            const v = r.bottom > -160 && r.top < h + 160 ? 'running' : 'paused';
            if (e.style.getPropertyValue('--vps') !== v) e.style.setProperty('--vps', v);
        });
        if (page) {
            if (document.hidden) page.style.setProperty('--hps', 'paused');
            else if (page.style.getPropertyValue('--hps')) page.style.removeProperty('--hps');
        }
    };
    let rq = 0;
    const schedule = () => {
        if (rq) return;
        rq = requestAnimationFrame(() => {
            rq = 0;
            refreshLoops();
        });
    };
    on(window, 'scroll', schedule, { passive: true });
    on(document, 'scroll', schedule, true);
    on(window, 'resize', schedule);
    on(document, 'visibilitychange', schedule);
    const timer = window.setInterval(refreshLoops, 1500);
    stops.push(() => {
        window.clearInterval(timer);
        if (rq) cancelAnimationFrame(rq);
        $$('.hero,.marq,.sec,.foot').forEach((e) => e.style.removeProperty('--vps'));
        page?.style.removeProperty('--hps');
    });
    refreshLoops();

    /* ------------------------------------------------------------------
     * 2) Links âncora (#secao). Placeholders (data-ph) nunca navegam.
     *    Sem reduce, a rolagem é animada e pode ser interrompida pelo usuário.
     * ------------------------------------------------------------------ */
    const se = (document.scrollingElement || document.documentElement) as HTMLElement;
    let scrollAnim: { stop: () => void } | null = null;
    const stopScroll = () => {
        if (scrollAnim) {
            try {
                scrollAnim.stop();
            } catch {
                /* nada */
            }
            scrollAnim = null;
            se.style.scrollBehavior = '';
        }
    };
    const onClick = (ev: Event) => {
        const a = (ev.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
        if (!a) return;
        if (a.hasAttribute('data-ph')) {
            ev.preventDefault();
            return;
        }
        if (reduce) return; // o navegador rola sozinho (há scroll-margin-top no CSS)
        const id = a.getAttribute('href')?.slice(1);
        const t = id ? document.getElementById(id) : null;
        if (!t) return;
        ev.preventDefault();
        stopScroll();
        const from = se.scrollTop;
        const to = Math.max(0, t.getBoundingClientRect().top + from - (id === 'inicio' ? 0 : 68));
        se.style.scrollBehavior = 'auto';
        scrollAnim = animate(from, to, {
            duration: Math.min(1.4, 0.55 + Math.abs(to - from) / 3200),
            ease: [0.65, 0, 0.35, 1] as Ease,
            onUpdate: (v: number) => se.scrollTo(0, v),
            onComplete: () => {
                scrollAnim = null;
                se.style.scrollBehavior = '';
            },
        });
    };
    on(document, 'click', onClick);
    (['wheel', 'touchstart', 'keydown'] as const).forEach((t) => on(window, t, stopScroll, { passive: true }));
    stops.push(stopScroll);

    // Com "reduzir movimento" ligado: loops e âncoras já foram tratados, o resto fica estático.
    if (reduce) return () => stops.reverse().forEach((s) => s());

    /* ------------------------------------------------------------------
     * 3) Entradas e rolagem (Motion)
     * ------------------------------------------------------------------ */
    const ease: Ease = [0.2, 0.7, 0.2, 1];
    const touched = new Set<HTMLElement>(); // elementos cujo estilo inline precisamos restaurar
    const hide = (e: HTMLElement, prop: 'opacity' | 'transform', value: string) => {
        e.style[prop] = value;
        touched.add(e);
    };
    const clear = (e: HTMLElement) => {
        e.style.transform = '';
        e.style.opacity = '';
    };
    const after = (a: { finished: Promise<unknown> }, fn: () => void) => {
        try {
            a.finished.then(fn, fn);
        } catch {
            setTimeout(fn, 1500);
        }
    };
    const track = <T extends { stop: () => void }>(a: T): T => {
        stops.push(() => {
            try {
                a.stop();
            } catch {
                /* nada */
            }
        });
        return a;
    };
    const hero = document.getElementById('inicio');

    // Entrada do hero (toca ao carregar e de novo quando a pessoa volta ao topo)
    const heroEls = $$('.m-in');
    const heroSp = Array.from(document.querySelectorAll<HTMLElement>('#inicio h1 .ln>span'));
    const playHeroEls = () => {
        heroEls.forEach((e) => hide(e, 'opacity', '0'));
        const a = track(
            animate(heroEls, { opacity: [0, 1], y: [28, 0] }, { duration: 0.9, delay: stagger(0.1, { startDelay: 0.1 }), ease }),
        );
        after(a, () => heroEls.forEach(clear));
    };
    const playHeroTitle = () => {
        heroSp.forEach((s) => hide(s, 'transform', 'translateY(110%)'));
        const a = track(
            animate(heroSp, { transform: ['translateY(110%)', 'translateY(0%)'] }, { duration: 0.95, delay: stagger(0.1, { startDelay: 0.25 }), ease }),
        );
        after(a, () => heroSp.forEach((s) => (s.style.transform = '')));
    };
    playHeroEls();

    // Revelação repetível: esconde quando o elemento sai da tela por completo e toca de novo
    // sempre que ele volta (em toda visita, não só na primeira).
    const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
    const reveal = (el: Element, amount: number, hideIt: () => void, play: () => { stop: () => void } | void) => {
        let armed = true; // começa escondido, aguardando entrar
        let running: { stop: () => void } | void;
        const io = new IntersectionObserver(
            (entries) => {
                const e = entries[entries.length - 1];
                const big = e.intersectionRect.height >= window.innerHeight * 0.45; // elementos mais altos que a tela
                if (armed && e.isIntersecting && (e.intersectionRatio >= amount || big)) {
                    armed = false;
                    running = play();
                } else if (!armed && !e.isIntersecting) {
                    armed = true;
                    try {
                        running?.stop();
                    } catch {
                        /* nada */
                    }
                    hideIt();
                }
            },
            { threshold: THRESHOLDS },
        );
        io.observe(el);
        stops.push(() => io.disconnect());
    };

    // Títulos em linhas mascaradas
    $$('h1,h2').forEach((h) => {
        const sp = Array.from(h.querySelectorAll<HTMLElement>('.ln>span'));
        if (!sp.length) return;
        if (h.closest('.hero')) {
            playHeroTitle();
            return;
        }
        const hideIt = () => sp.forEach((s) => hide(s, 'transform', 'translateY(110%)'));
        hideIt();
        reveal(h, 0.4, hideIt, () => {
            const a = track(
                animate(sp, { transform: ['translateY(110%)', 'translateY(0%)'] }, { duration: 0.95, delay: stagger(0.1), ease }),
            );
            after(a, () => sp.forEach((s) => (s.style.transform = '')));
            return a;
        });
    });

    // Replay: quando a maior parte do hero sai da tela, a entrada é "rearmada";
    // ao voltar a aparecer, toca de novo (em toda visita, não só na primeira).
    if (hero) {
        let armed = false;
        const io = new IntersectionObserver(
            (entries) => {
                const ratio = entries[entries.length - 1].intersectionRatio;
                if (ratio <= 0.25 && !armed) {
                    armed = true;
                    heroEls.forEach((e) => hide(e, 'opacity', '0'));
                    heroSp.forEach((s) => hide(s, 'transform', 'translateY(110%)'));
                    window.dispatchEvent(new Event('hero:reset'));
                } else if (ratio >= 0.4 && armed) {
                    armed = false;
                    playHeroEls();
                    playHeroTitle();
                    window.dispatchEvent(new Event('hero:replay'));
                }
            },
            { threshold: [0, 0.1, 0.25, 0.4, 0.55, 0.7, 1] },
        );
        io.observe(hero);
        stops.push(() => io.disconnect());
    }

    // Linha de abertura de cada seção
    const secs = $$('.sec');
    secs.forEach((sc) => {
        sc.classList.add('pre');
        reveal(sc, 0.05, () => sc.classList.remove('in'), () => void sc.classList.add('in'));
    });
    stops.push(() => secs.forEach((sc) => sc.classList.remove('pre', 'in')));

    // Revelações .rv
    $$('.rv').forEach((el) => {
        const hideIt = () => hide(el, 'opacity', '0');
        hideIt();
        reveal(el, 0.12, hideIt, () => {
            const a = track(animate(el, { opacity: [0, 1], y: [32, 0] }, { duration: 0.85, ease }));
            after(a, () => clear(el));
            return a;
        });
    });

    // Grupos com filhos escalonados
    ['.tags', '.chips', '.path', '.facts', '.links'].forEach((sel) => {
        $$(sel).forEach((g) => {
            const kids = Array.from(g.children) as HTMLElement[];
            const hideIt = () => kids.forEach((k) => hide(k, 'opacity', '0'));
            hideIt();
            reveal(g, 0.3, hideIt, () => {
                const a = track(
                    animate(kids, { opacity: [0, 1], y: [14, 0] }, { duration: 0.6, delay: stagger(0.06, { startDelay: 0.15 }), ease }),
                );
                after(a, () => kids.forEach(clear));
                return a;
            });
        });
    });

    /* ------------------------------------------------------------------
     * 4) Efeitos ligados à rolagem (parallax discreto e barra de progresso)
     * ------------------------------------------------------------------ */
    const linked = (el: Element | string, keyframes: Record<string, number[]>, opts: Parameters<typeof scroll>[1]) => {
        const a = track(animate(el as Element, keyframes, { ease: 'linear' }));
        stops.push(scroll(a, opts));
        touched.add(el as HTMLElement);
    };
    $$('.pc').forEach((pc) => {
        const n = pc.querySelector('.num');
        if (n) linked(n, { y: [24, -24] }, { target: pc, offset: ['start end', 'end start'] });
    });
    $$('.sh h2').forEach((h) => linked(h, { y: [36, -36] }, { target: h, offset: ['start end', 'end start'] }));
    if (hero) {
        const text = document.getElementById('heroText');
        if (text) linked(text, { opacity: [1, 0], y: [0, -40] }, { target: hero, offset: ['start start', '70% start'] });
        const vis = hero.querySelector('.vis');
        if (vis) linked(vis, { y: [0, -70] }, { target: hero, offset: ['start start', 'end start'] });
    }
    const bar = document.getElementById('progress');
    if (bar) linked(bar, { scaleX: [0, 1] }, undefined);

    /* ------------------------------------------------------------------
     * 5) Microinterações (só em dispositivos com hover real)
     * ------------------------------------------------------------------ */
    const to = (el: Element, v: Record<string, number>, d: number, e?: Ease) =>
        animate(el, v, e ? { duration: d, ease: e } : { duration: d });
    stops.push(
        hover('.hcta', (el) => {
            to(el, { scale: 1.04 }, 0.25);
            return () => to(el, { scale: 1 }, 0.3);
        }),
        press('.links a', (el) => {
            to(el, { scale: 0.98 }, 0.12);
            return () => to(el, { scale: 1 }, 0.25);
        }),
        hover('.sk', (el) => {
            const ic = el.querySelector('.sk-ic');
            if (ic) to(ic, { scale: 1.08, rotate: -4 }, 0.35, ease);
            return () => {
                if (ic) to(ic, { scale: 1, rotate: 0 }, 0.4, ease);
            };
        }),
        hover('.btn', (el) => {
            to(el, { scale: 1.03, y: -2 }, 0.25);
            return () => to(el, { scale: 1, y: 0 }, 0.3);
        }),
        press('.btn', (el) => {
            to(el, { scale: 0.96 }, 0.12);
            return () => to(el, { scale: 1 }, 0.25);
        }),
        hover('.tags li', (el) => {
            to(el, { y: -3 }, 0.2);
            return () => to(el, { y: 0 }, 0.25);
        }),
        hover('.pc', (el) => {
            const m = el.querySelector('.shot');
            if (m) to(m, { scale: 1.035, y: -4 }, 0.5, ease);
            return () => {
                if (m) to(m, { scale: 1, y: 0 }, 0.5, ease);
            };
        }),
    );

    /* ------------------------------------------------------------------
     * Cleanup: para tudo e devolve os elementos ao estado original.
     * ------------------------------------------------------------------ */
    return () => {
        stops.reverse().forEach((s) => {
            try {
                s();
            } catch {
                /* nada */
            }
        });
        touched.forEach((e) => {
            e.style.opacity = '';
            e.style.transform = '';
        });
    };
}