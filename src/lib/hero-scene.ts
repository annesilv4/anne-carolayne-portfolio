import {
    WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, PlaneGeometry, ShaderMaterial, MeshBasicMaterial,
    Points, BufferGeometry, BufferAttribute, PointsMaterial, CanvasTexture, AdditiveBlending, Color,
    SRGBColorSpace, NoToneMapping, DoubleSide,
} from 'three';

const LILAC = 0xc4b5fd, VIOLET = 0x8b5cf6, DEEP = 0x6d28d9, ROSE = 0xe9b8ff;

// Painel holográfico: retângulo arredondado (SDF) translúcido, com borda luminosa, brilho interno e um reflexo que desliza.
const VERT = 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FRAG = `
varying vec2 vUv;
uniform vec2 uSize; uniform vec2 uInner; uniform float uR; uniform vec3 uColor;
uniform float uFill, uBorder, uBw, uBlur, uSheen, uPhase, uOpacity, uTime;
float sdr(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r; }
void main(){
  vec2 p = (vUv - 0.5) * uSize;
  float d = sdr(p, uInner * 0.5, uR);
  float aa = max(fwidth(d), 0.0005);
  if (uBlur > 0.0) {
    float g = 1.0 - smoothstep(-uBlur, uBlur, d);
    gl_FragColor = vec4(uColor, g * uFill * uOpacity);
    #include <colorspace_fragment>
    return;
  }
  float inside = 1.0 - smoothstep(-aa, aa, d);
  float edge = smoothstep(-uBw - aa, -uBw + aa, d) * inside;
  float rim = smoothstep(-0.2, 0.0, d) * inside;
  float grad = mix(0.55, 1.0, vUv.y);
  float t = vUv.x * 0.7 + vUv.y * 0.5 - mod(uTime * 0.09 + uPhase, 2.4) + 0.6;
  float sheen = exp(-t * t * 18.0) * uSheen;
  float a = inside * uFill * grad + edge * uBorder + rim * uFill * 0.9 + sheen * inside * 0.22;
  vec3 col = mix(uColor, vec3(1.0, 0.95, 1.0), edge * 0.35 + sheen * 0.5);
  gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uOpacity);
  #include <colorspace_fragment>
}`;

function glyphTexture(text: string, px: number) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 256;
    const g = c.getContext('2d')!;
    g.font = '600 ' + px + 'px "JetBrains Mono", ui-monospace, Menlo, monospace';
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(167,139,250,.95)'; g.shadowBlur = 26;
    g.fillStyle = 'rgba(221,214,254,.95)';
    g.fillText(text, 256, 132);
    g.shadowBlur = 0;
    g.fillText(text, 256, 132);
    const t = new CanvasTexture(c);
    t.colorSpace = SRGBColorSpace;
    return t;
}

function dotTexture() {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(0.3, 'rgba(255,255,255,.5)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
    return new CanvasTexture(c);
}

type Spec = Record<string, number>;

interface Item {
    mesh: Mesh;
    m?: ShaderMaterial;
    glyph?: MeshBasicMaterial;
    z0: number;
    delay: number;
    op: number;
}

type AnimateFn = (from: number, to: number, opts: { duration: number; ease: 'linear'; onUpdate: (t: number) => void }) => { stop: () => void };

export interface HeroSceneOptions {
    animate?: AnimateFn | null;
    reduce?: boolean;
}

export function init(canvas: HTMLCanvasElement, opts: HeroSceneOptions = {}) {
    const { animate, reduce = false } = opts;
    const host = canvas.parentElement as HTMLElement;
    const small = window.matchMedia && window.matchMedia('(max-width: 700px)').matches;

    const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = NoToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;
    const scene = new Scene();
    const camera = new PerspectiveCamera(30, 1, 0.1, 60);

    const root = new Group();   // inclinação com o cursor
    const ui = new Group();     // rotação lenta da interface
    root.add(ui);
    scene.add(root);
    ui.rotation.set(0.1, -0.42, 0);

    const geo = new PlaneGeometry(1, 1);
    const uTime = { value: 0.6 };
    const mats: ShaderMaterial[] = [];
    const items: Item[] = [];
    const disposables: { dispose: () => void }[] = [geo];

    const layerBack = new Group(), layerMid = new Group(), layerFront = new Group();
    ui.add(layerBack, layerMid, layerFront);

    // cria um painel; (x, y, z) é o centro; "o" ordena a montagem na entrada
    const panel = (layer: Group, s: Spec) => {
        const o = Object.assign({ r: s.blur ? Math.min(s.w, s.h) * 0.12 : Math.min(0.07, Math.min(s.w, s.h) / 2), color: LILAC, fill: 0.1, border: 0.6, bw: 0.012, blur: 0, sheen: 0, phase: 0 }, s);
        const pad = o.blur ? o.blur * 3 : 0;
        const m = new ShaderMaterial({
            vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: AdditiveBlending,
            uniforms: {
                uSize: { value: [o.w + 2 * pad, o.h + 2 * pad] }, uInner: { value: [o.w, o.h] }, uR: { value: o.r }, uColor: { value: new Color(o.color) },
                uFill: { value: o.fill }, uBorder: { value: o.border }, uBw: { value: o.bw }, uBlur: { value: o.blur },
                uSheen: { value: o.sheen }, uPhase: { value: o.phase }, uOpacity: { value: reduce ? 1 : 0 }, uTime,
            },
        });
        const mesh = new Mesh(geo, m);
        mesh.scale.set(o.w + 2 * pad, o.h + 2 * pad, 1);
        mesh.position.set(o.x, o.y, o.z);
        mesh.renderOrder = Math.round(o.z * 10);
        layer.add(mesh);
        m.userData.f0 = o.fill; m.userData.b0 = o.border;
        mats.push(m);
        items.push({ mesh, m, z0: o.z, delay: items.length * 0.045, op: 1 });
        return mesh;
    };
    const circle = (layer: Group, s: Spec) => panel(layer, Object.assign({ r: s.d / 2, w: s.d, h: s.d }, s));
    const line = (layer: Group, s: Spec) => panel(layer, Object.assign({ h: 0.06, r: 0.03, fill: 0.34, border: 0, bw: 0.001 }, s));

    const glyph = (layer: Group, text: string, x: number, y: number, z: number, w: number, h: number, op: number, px: number) => {
        const tex = glyphTexture(text, px);
        const mat = new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: reduce ? op : 0 });
        const mesh = new Mesh(geo, mat);
        mesh.scale.set(w, h, 1);
        mesh.position.set(x, y, z);
        mesh.renderOrder = Math.round(z * 10);
        layer.add(mesh);
        disposables.push(tex, mat);
        items.push({ mesh, glyph: mat, z0: z, delay: items.length * 0.045, op });
    };

    // ── camada de trás: janela do navegador ──
    const Z0 = -1.0;
    panel(layerBack, { w: 4.9, h: 3.5, x: 0, y: 0, z: Z0 - 0.15, blur: 0.5, fill: 0.2, color: DEEP });
    panel(layerBack, { w: 4.0, h: 2.7, x: 0, y: 0, z: Z0, r: 0.14, fill: 0.075, border: 0.6, sheen: 1, phase: 0.2 });
    [-1.75, -1.6, -1.45].forEach((x) => circle(layerBack, { d: 0.085, x, y: 1.15, z: Z0 + 0.01, fill: 0.5, border: 0 }));
    panel(layerBack, { w: 1.7, h: 0.15, x: 0.25, y: 1.15, z: Z0 + 0.01, fill: 0.12, border: 0.3 });
    panel(layerBack, { w: 0.72, h: 1.95, x: -1.55, y: -0.12, z: Z0 + 0.01, r: 0.08, fill: 0.09, border: 0.28 });
    line(layerBack, { w: 1.05, h: 0.12, x: -0.2, y: 0.78, z: Z0 + 0.01, fill: 0.5 });
    line(layerBack, { w: 2.1, x: 0.35, y: 0.5, z: Z0 + 0.01 });
    line(layerBack, { w: 1.7, x: 0.15, y: 0.32, z: Z0 + 0.01 });
    [-0.45, 0.2, 0.85].forEach((x) => panel(layerBack, { w: 0.5, h: 0.5, x, y: -0.5, z: Z0 + 0.01, r: 0.07, fill: 0.1, border: 0.4 }));
    [-1.55, -1.55, -1.55].forEach((x, i) => line(layerBack, { w: 0.4, x, y: 0.55 - i * 0.28, z: Z0 + 0.02, fill: 0.28 }));

    // ── camada do meio: cartão com imagem e botão ──
    const Z1 = 0.15;
    panel(layerMid, { w: 2.8, h: 2.0, x: -0.95, y: -0.8, z: Z1 - 0.1, blur: 0.4, fill: 0.2, color: VIOLET });
    panel(layerMid, { w: 2.2, h: 1.45, x: -0.95, y: -0.8, z: Z1, r: 0.1, fill: 0.13, border: 0.78, sheen: 1, phase: 1.1 });
    panel(layerMid, { w: 0.78, h: 0.78, x: -1.32, y: -0.62, z: Z1 + 0.01, r: 0.08, fill: 0.3, border: 0.5, color: ROSE });
    line(layerMid, { w: 0.85, h: 0.1, x: -0.28, y: -0.46, z: Z1 + 0.01, fill: 0.55 });
    line(layerMid, { w: 0.6, x: -0.4, y: -0.66, z: Z1 + 0.01 });
    panel(layerMid, { w: 0.82, h: 0.24, x: -0.55, y: -1.2, z: Z1 + 0.01, r: 0.12, fill: 0.5, border: 0.9 });

    // ── camada da frente: cartão de perfil, botão e detalhes ──
    const Z2 = 0.85;
    panel(layerFront, { w: 1.9, h: 2.2, x: 1.55, y: 0.45, z: Z2 - 0.1, blur: 0.35, fill: 0.18, color: VIOLET });
    panel(layerFront, { w: 1.35, h: 1.55, x: 1.55, y: 0.45, z: Z2, r: 0.1, fill: 0.14, border: 0.8, sheen: 1, phase: 0.6 });
    circle(layerFront, { d: 0.42, x: 1.55, y: 0.92, z: Z2 + 0.01, fill: 0.34, border: 0.8, bw: 0.014, color: ROSE });
    line(layerFront, { w: 0.8, h: 0.09, x: 1.55, y: 0.52, z: Z2 + 0.01, fill: 0.55 });
    line(layerFront, { w: 0.95, x: 1.55, y: 0.34, z: Z2 + 0.01 });
    line(layerFront, { w: 0.7, x: 1.43, y: 0.18, z: Z2 + 0.01 });
    panel(layerFront, { w: 0.46, h: 0.22, x: 1.3, y: -0.12, z: Z2 + 0.01, r: 0.11, fill: 0.3, border: 0.8 });
    circle(layerFront, { d: 0.16, x: 1.4, y: -0.12, z: Z2 + 0.02, fill: 0.85, border: 0, color: 0xffffff });
    panel(layerFront, { w: 1.25, h: 0.4, x: -0.55, y: 1.3, z: 1.35, r: 0.2, fill: 0.34, border: 0.95, sheen: 1, phase: 1.7 });
    line(layerFront, { w: 0.6, h: 0.07, x: -0.55, y: 1.3, z: 1.36, fill: 0.7, color: 0xffffff });
    panel(layerFront, { w: 0.85, h: 0.3, x: 1.15, y: -1.2, z: 1.05, r: 0.15, fill: 0.2, border: 0.85 });
    line(layerFront, { w: 0.42, h: 0.06, x: 1.15, y: -1.2, z: 1.06, fill: 0.55 });

    // símbolos de código, discretos
    glyph(layerFront, '</>', -1.55, 1.5, 1.6, 1.0, 0.5, 0.8, 130);
    glyph(layerFront, '{ }', 2.1, -0.75, 1.15, 0.9, 0.45, 0.55, 130);

    // partículas luminosas, poucas
    const N = small ? 36 : 70;
    const pp = new Float32Array(N * 3), pc = new Float32Array(N * 3), tint = new Color(0xdccfff);
    for (let i = 0; i < N; i++) {
        pp[i * 3] = (Math.random() - 0.5) * 7.5;
        pp[i * 3 + 1] = (Math.random() - 0.5) * 5;
        pp[i * 3 + 2] = (Math.random() - 0.5) * 4.5;
        const b = 0.25 + Math.random() * 0.75;
        pc[i * 3] = tint.r * b; pc[i * 3 + 1] = tint.g * b; pc[i * 3 + 2] = tint.b * b;
    }
    const pGeo = new BufferGeometry();
    pGeo.setAttribute('position', new BufferAttribute(pp, 3));
    pGeo.setAttribute('color', new BufferAttribute(pc, 3));
    const dtex = dotTexture();
    const pMat = new PointsMaterial({ size: 0.09, map: dtex, vertexColors: true, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: reduce ? 0.8 : 0 });
    const pts = new Points(pGeo, pMat);
    ui.add(pts);
    disposables.push(pGeo, pMat, dtex);

    // enquadramento
    const resize = () => {
        const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
        renderer.setSize(w, h, false);
        const a = w / h;
        camera.aspect = a;
        camera.position.set(0, 0, Math.max(6.9, 5.5 / (0.536 * a)));
        camera.updateProjectionMatrix();
        if (!running) renderer.render(scene, camera);
    };

    // movimento controlado pelo Motion
    const anims: { stop: () => void }[] = [];
    let introEnd = 0;
    const A = animate && !reduce ? animate : null;
    const apply = (it: Item, v: number) => {
        if (it.m) it.m.uniforms.uOpacity.value = v;
        else if (it.glyph) it.glyph.opacity = v * it.op;
        it.mesh.position.z = it.z0 - (1 - v) * 0.7;
    };
    let introAnim: { stop: () => void } | null = null;
    // Entrada da cena: pode ser tocada de novo (replay) quando a pessoa volta ao hero.
    const intro = () => {
        if (!A) return;
        try { introAnim?.stop(); } catch (e) { }
        items.forEach((it) => apply(it, 0));
        pMat.opacity = 0;
        const total = items.length * 0.045 + 1.1;
        introEnd = uTime.value + total + 0.3;
        introAnim = A(0, total, {
            duration: total, ease: 'linear',
            onUpdate: (t: number) => {
                items.forEach((it) => {
                    const k = Math.min(1, Math.max(0, (t - it.delay) / 1.0));
                    apply(it, 1 - Math.pow(1 - k, 3));
                });
                pMat.opacity = Math.min(1, t / total) * 0.8;
            },
        });
        anims.push(introAnim);
    };
    // Deixa a cena "apagada", pronta para o replay (a respiração da luz fica suspensa).
    const reset = () => {
        if (!A) return;
        try { introAnim?.stop(); } catch (e) { }
        items.forEach((it) => apply(it, 0));
        pMat.opacity = 0;
        introEnd = Infinity;
        if (!running) renderer.render(scene, camera);
    };
    if (A) {
        canvas.style.opacity = '1';
        intro();
    } else if (!reduce) {
        // sem Motion: a cena aparece direto e continua animada
        canvas.style.opacity = '1';
        items.forEach((it) => apply(it, 1));
        pMat.opacity = 0.8;
        introEnd = 0.1;
    }

    // Loops infinitos: funções contínuas do relógio (uTime). Não dependem de controles que possam terminar, pausar ou reiniciar.
    const TAU = Math.PI * 2;
    const loops = (t: number) => {
        layerBack.position.y = Math.sin(t * TAU / 18) * 0.08; layerBack.rotation.z = Math.sin(t * TAU / 18) * 0.006;
        layerMid.position.y = Math.sin(t * TAU / 14.4 + 1.1) * 0.12; layerMid.rotation.z = Math.sin(t * TAU / 14.4 + 1.1) * 0.01;
        layerFront.position.y = Math.sin(t * TAU / 11.6 + 2.2) * 0.17; layerFront.rotation.z = Math.sin(t * TAU / 11.6 + 2.2) * 0.014;
        ui.rotation.y = -0.42 + Math.sin(t * TAU / 28) * 0.13; ui.rotation.x = 0.1 + Math.sin(t * TAU / 28 + 0.8) * 0.03;
        pts.rotation.y = (t * TAU / 140) % TAU;
    };
    let running = false, visible = true, raf = 0, lastFrame = 0, lost = false;
    const t0 = performance.now();
    const frame = (now: number) => {
        raf = 0;
        if (!running) return;
        lastFrame = performance.now();
        uTime.value = (now - t0) / 1000;
        loops(uTime.value);
        const t = uTime.value;
        if (introEnd && t > introEnd) {
            // respiração da luz: pequenas variações de intensidade, sempre ativas
            for (let i = 0; i < mats.length; i++) {
                const u = mats[i].uniforms, d = mats[i].userData;
                const k = 0.9 + 0.1 * Math.sin(t * 0.55 + i * 0.8);
                u.uFill.value = d.f0 * k; u.uBorder.value = d.b0 * (0.88 + 0.12 * Math.sin(t * 0.7 + i * 0.5));
            }
            for (let i = 0; i < items.length; i++) { const g = items[i].glyph; if (g) g.opacity = items[i].op * (0.82 + 0.18 * Math.sin(t * 0.9 + i)); }
            pMat.opacity = 0.72 + 0.1 * Math.sin(t * 0.8);
        }
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
    };
    const start = () => {
        if (reduce || running || lost || !visible || document.hidden) return;
        running = true; lastFrame = performance.now(); raf = requestAnimationFrame(frame);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); raf = 0; };

    const io = new IntersectionObserver((es) => { visible = es[0].isIntersecting; visible ? start() : stop(); }, { threshold: 0 });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); lost = true; stop(); });
    canvas.addEventListener('webglcontextrestored', () => { lost = false; host.classList.remove('no-gl'); resize(); start(); });
    // vigia: garante que o loop continue mesmo se o navegador perder um evento (observador, aba, rAF suspenso)
    const watch = setInterval(() => {
        if (reduce) return;
        const r = canvas.getBoundingClientRect();
        const vis = r.bottom > 0 && r.top < (window.innerHeight || 0) && r.right > 0 && r.left < (window.innerWidth || 0);
        if (vis !== visible) { visible = vis; if (!vis) stop(); }
        if (visible && !document.hidden && !lost) {
            if (!running) start();
            else if (performance.now() - lastFrame > 1500) { cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
        }
    }, 1500);

    resize();
    if (reduce) renderer.render(scene, camera); else start();

    return {
        replay: intro,
        reset,
        dispose() {
            stop(); clearInterval(watch); io.disconnect(); ro.disconnect();
            document.removeEventListener('visibilitychange', onVis);
            anims.forEach((a) => { try { a.stop(); } catch (e) { } });
            disposables.forEach((d) => d.dispose());
            mats.forEach((m) => m.dispose());
            renderer.dispose();
        },
    };
}