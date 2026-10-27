// Background decoration: rose bouquets in the corners, a faint gold lattice, drifting petals,
// gold sparkles, and a small burst of petals when you turn a page or open the book.
// Self-contained: no changes to style.css or app.js are needed.
(() => {
    const $ = s => document.querySelector(s);
    const calm = matchMedia('(prefers-reduced-motion:reduce)').matches;
    const rnd = (a, b) => a + Math.random() * (b - a);

    /* ---------- flower parts (SVG strings) ---------- */
    // palette = [outer petals, middle petals, inner petals, outline]
    const PAL = {
        crimson: ['#8e0d18', '#b3121f', '#d62839', '#4a050c'],
        deep:    ['#5e060d', '#8e0d18', '#b3121f', '#2e0307'],
        blush:   ['#c1475a', '#e07a8a', '#f4b6bf', '#7a1f2e'],
        gold:    ['#b88a2e', '#d4af37', '#f1d98a', '#6b4c10']
    };
    const leaf = (x, y, rot, s) =>
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M0 0Q14 -12 40 0Q14 12 0 0Z" fill="#27502f" stroke="#d4af37" stroke-width=".8"/><path d="M2 0L34 0" stroke="#d4af37" stroke-width=".7" opacity=".7"/></g>`;
    const rose = (x, y, r, [o, m, i, st], rot = 0) => {
        const sw = Math.max(.8, r * .025);
        const ring = (rr, n, off, fill) => Array.from({ length: n }, (_, k) =>
            `<ellipse cx="0" cy="${-rr * .55}" rx="${rr * .5}" ry="${rr * .62}" fill="${fill}" stroke="${st}" stroke-width="${sw}" transform="rotate(${off + k * 360 / n})"/>`).join('');
        let sp = '';
        for (let t = .4; t <= 9; t += .25) { const d = r * .05 * t; sp += (sp ? 'L' : 'M') + (Math.cos(t) * d).toFixed(1) + ' ' + (Math.sin(t) * d).toFixed(1) }
        return `<g transform="translate(${x} ${y}) rotate(${rot})">${ring(r, 7, 0, o)}${ring(r * .78, 6, 20, m)}${ring(r * .55, 5, 10, i)}<path d="${sp}" fill="none" stroke="${st}" stroke-width="${Math.max(.9, r * .03)}" stroke-linecap="round" opacity=".8"/></g>`;
    };
    const blossom = (x, y, r, fill, rot = 0) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})">${[0, 1, 2, 3, 4].map(k => `<ellipse cx="0" cy="${-r * .6}" rx="${r * .45}" ry="${r * .62}" fill="${fill}" stroke="#a8566a" stroke-width=".8" transform="rotate(${k * 72})"/>`).join('')}<circle r="${r * .28}" fill="#d4af37"/><circle r="${r * .12}" fill="#8a6a1f"/></g>`;

    // one bouquet, drawn for the bottom-left corner of a 400 x 400 box; the other corners are mirrored copies
    function bouquet() {
        const roses = [
            [320, 382, 24, PAL.blush, 0], [22, 110, 28, PAL.deep, 0], [238, 368, 32, PAL.crimson, 50],
            [160, 352, 44, PAL.deep, -20], [46, 206, 38, PAL.blush, 30], [130, 252, 34, PAL.gold, 0], [78, 318, 54, PAL.crimson, 10]
        ];
        const vines = '<g fill="none" stroke="#d4af37" stroke-width="2.2" stroke-linecap="round" opacity=".85"><path d="M8 405C18 330 70 270 46 190S14 100 62 24"/><path d="M0 392C70 392 110 330 190 346S300 396 400 378"/></g>';
        // leaves tucked behind every rose so they peek out around it
        const behind = roses.map(([x, y, r], k) => [0, 1, 2].map(j => leaf(x, y, (k * 47 + j * 120 + 20) % 360, r / 24)).join('')).join('');
        const small = [[46, 250, -80, .8], [40, 150, -100, .8], [55, 70, -70, .8], [110, 372, -10, .8], [260, 384, 20, .8], [330, 372, -8, .7]].map(a => leaf(...a)).join('');
        const flowers = [[112, 186, 20, '#f7d9df'], [182, 300, 18, '#fbe6ea'], [30, 262, 16, '#f7d9df'], [86, 120, 16, '#fbe6ea'], [292, 372, 16, '#f7d9df'], [200, 232, 14, '#fbe6ea']]
            .map(([x, y, r, c], k) => blossom(x, y, r, c, k * 31)).join('');
        const dots = [[150, 200], [160, 210], [155, 190], [70, 60], [78, 52], [220, 340], [228, 332], [350, 372], [16, 300], [24, 310], [96, 380], [104, 372]]
            .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#d4af37"/>`).join('');
        return `<svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${vines}${behind}${small}${roses.map(a => rose(...a)).join('')}${flowers}${dots}</svg>`;
    }

    /* ---------- faint gold lattice ---------- */
    const lattice = `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><g fill="none" stroke="#d4af37" stroke-width=".8"><path d="M40 0L80 40L40 80L0 40Z"/><path d="M40 14L66 40L40 66L14 40Z" opacity=".6"/>${[0, 90, 180, 270].map(a => `<ellipse cx="40" cy="33" rx="3.5" ry="7" transform="rotate(${a} 40 40)"/>`).join('')}</g><circle cx="40" cy="40" r="2" fill="#d4af37"/><circle cx="0" cy="0" r="1.6" fill="#d4af37"/><circle cx="80" cy="0" r="1.6" fill="#d4af37"/><circle cx="0" cy="80" r="1.6" fill="#d4af37"/><circle cx="80" cy="80" r="1.6" fill="#d4af37"/></svg>`;

    /* ---------- styles + layers ---------- */
    const style = document.createElement('style');
    style.textContent = `
#bgfx{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}
#orn{position:absolute;inset:0;opacity:.09;background-image:url("data:image/svg+xml;utf8,${encodeURIComponent(lattice)}");background-size:80px 80px;-webkit-mask-image:radial-gradient(ellipse at 50% 50%,transparent 30%,#000 95%);mask-image:radial-gradient(ellipse at 50% 50%,transparent 30%,#000 95%)}
.fl{position:absolute;width:min(34vw,430px);aspect-ratio:1;filter:drop-shadow(0 8px 14px #000b)}
.fl svg{display:block;width:100%;height:100%}
.fl.bl{left:0;bottom:0;transform-origin:0 100%;animation:swayL 8s ease-in-out infinite alternate}
.fl.br{right:0;bottom:0;transform-origin:100% 100%;animation:swayR 9s ease-in-out infinite alternate}
.fl.tl{left:0;top:0;width:min(22vw,290px);transform-origin:0 0;animation:swayR 10s ease-in-out infinite alternate}
.fl.tr{right:0;top:0;width:min(22vw,290px);transform-origin:100% 0;animation:swayL 11s ease-in-out infinite alternate}
.fl.br svg{transform:scaleX(-1)}.fl.tl svg{transform:scaleY(-1)}.fl.tr svg{transform:scale(-1,-1)}
@keyframes swayL{to{transform:rotate(1.6deg)}}
@keyframes swayR{to{transform:rotate(-1.6deg)}}
#fx{position:fixed;inset:0;width:100%;height:100%;z-index:8;pointer-events:none}
#ttl{text-shadow:0 0 18px #d4af3766}
@media(max-width:700px){.fl{width:44vw;opacity:.8}.fl.tl,.fl.tr{width:30vw}}
@media(prefers-reduced-motion:reduce){.fl{animation:none}}`;
    document.head.append(style);

    const fx = document.createElement('div'); fx.id = 'bgfx';
    const b = bouquet();
    fx.innerHTML = `<div id="orn"></div>` + ['bl', 'br', 'tl', 'tr'].map(c => `<div class="fl ${c}">${b}</div>`).join('');
    document.body.prepend(fx);

    if (calm) return; // no moving petals for people who asked for less motion

    /* ---------- drifting petals, sparkles, bursts (one canvas) ---------- */
    const cv = document.createElement('canvas'); cv.id = 'fx'; document.body.append(cv);
    const g = cv.getContext('2d'); let W = 0, H = 0;
    const size = () => { const d = Math.min(devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0) };
    size(); addEventListener('resize', size);

    const COL = ['#b3121f', '#d62839', '#8e0d18', '#e8a0a8', '#d4af37', '#f4c6cc'];
    const pick = () => COL[Math.random() * COL.length | 0];
    const petals = Array.from({ length: Math.round(Math.min(30, Math.max(12, W / 60))) }, () => ({
        x: rnd(0, W), y: rnd(-H * .2, H), vx: rnd(-.3, .2), vy: rnd(.35, .9), s: rnd(4, 8), r: rnd(0, 6.28), vr: rnd(-.02, .02), ph: rnd(0, 6.28), c: pick(), a: rnd(.45, .8)
    }));
    const stars = Array.from({ length: 45 }, () => ({ x: Math.random(), y: Math.random(), z: rnd(2, 4), sp: rnd(1, 3), ph: rnd(0, 6.28) }));
    const bursts = [];

    const petal = (x, y, s, r, flip, col, a) => {
        g.save(); g.translate(x, y); g.rotate(r); g.scale(1, flip); g.globalAlpha = a; g.fillStyle = col; g.beginPath();
        g.moveTo(0, -s); g.bezierCurveTo(s * .95, -s * .55, s * .75, s * .75, 0, s); g.bezierCurveTo(-s * .75, s * .75, -s * .95, -s * .55, 0, -s); g.fill(); g.restore();
    };
    const burst = (x, y, n) => {
        for (let k = 0; k < n && bursts.length < 120; k++) bursts.push({ x, y, vx: rnd(-3.5, 3.5), vy: rnd(-5, -1), s: rnd(4, 8), r: rnd(0, 6.28), vr: rnd(-.1, .1), ph: rnd(0, 6.28), c: pick(), life: rnd(70, 120) });
    };

    let t = 0;
    (function tick() {
        t += .016; g.clearRect(0, 0, W, H);
        stars.forEach(s => {
            const a = .5 + .5 * Math.sin(t * s.sp + s.ph), x = s.x * W, y = s.y * H, z = s.z * (.6 + .4 * a);
            g.globalAlpha = a * .8; g.fillStyle = '#ffe9a3';
            g.fillRect(x - z, y - .5, z * 2, 1); g.fillRect(x - .5, y - z, 1, z * 2);
        });
        g.globalAlpha = 1;
        petals.forEach(p => {
            p.y += p.vy; p.x += p.vx + Math.sin(t + p.ph) * .5; p.r += p.vr;
            if (p.y > H + 20) { p.y = -20; p.x = rnd(0, W) }
            if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
            petal(p.x, p.y, p.s, p.r, .25 + .75 * Math.abs(Math.cos(t * 1.6 + p.ph)), p.c, p.a);
        });
        for (let k = bursts.length - 1; k >= 0; k--) {
            const q = bursts[k]; q.vy += .09; q.vx *= .985; q.x += q.vx; q.y += q.vy; q.r += q.vr;
            if (--q.life <= 0) { bursts.splice(k, 1); continue }
            petal(q.x, q.y, q.s, q.r, .25 + .75 * Math.abs(Math.cos(t * 3 + q.ph)), q.c, Math.min(1, q.life / 30) * .85);
        }
        requestAnimationFrame(tick);
    })();

    // petals fly when you open the book or turn a page
    document.addEventListener('click', e => { if (e.target.closest('#nx,#pv,.cover')) burst(e.clientX, e.clientY, 14) });
    document.addEventListener('keydown', e => {
        if (e.target.matches('input,textarea,select') || !/^Arrow(Left|Right)$/.test(e.key)) return;
        const r = $('#book').getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, 14);
    });
})();