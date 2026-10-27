// The animated pixel scene: day/night, real moon phase, weather, lightning, shooting stars, hidden hotspots.
(() => {
    const W = 320, H = 200, $ = s => document.querySelector(s);
    const S = { tgt: 'day', k: 0, wx: 'none', parts: [], t: 0, cvs: [], shoot: [], flash: 0, bolt: [] };
    const stars = Array.from({ length: 45 }, () => [Math.random() * W, Math.random() * 110, Math.random() * 6]);
    const clouds = Array.from({ length: 4 }, (_, j) => [j * 90, 20 + j * 14, 26 + j * 6]);
    const LEAF = ['#d2691e', '#b3121f', '#d4af37', '#8b4513'];
    const mix = (a, b, t) => `rgb(${a.map((v, j) => Math.round(v + (b[j] - v) * t))})`;
    const moonPhase = () => { const d = (Date.now() / 86400000 - 10962.76) / 29.530588853; return d - Math.floor(d) }; // 0 new, .5 full
    let g, nt;
    const notify = () => { clearTimeout(nt); nt = setTimeout(() => Scene.onChange && Scene.onChange(), 60) };

    function setTime(v) { S.tgt = v === 'night' ? 'night' : 'day'; notify() }
    function setWeather(v) {
        S.wx = ['rain', 'storm', 'snow', 'fireflies', 'leaves'].includes(v) ? v : 'none';
        const n = { rain: 70, storm: 110, snow: 55, fireflies: 16, leaves: 40, none: 0 }[S.wx];
        S.parts = Array.from({ length: n }, () => [Math.random() * W, Math.random() * H, 1 + Math.random() * 2, Math.random() * 6, Math.floor(Math.random() * 4)]);
        const w = $('#wx'); if (w) w.value = S.wx; notify();
    }

    function frame() {
        S.cvs = S.cvs.filter(c => c.isConnected);
        if (!S.cvs.length) return requestAnimationFrame(frame);
        g = S.cvs[0].getContext('2d');
        S.t += .016; S.k += ((S.tgt === 'night' ? 1 : 0) - S.k) * .05;
        const k = S.k, wet = S.wx === 'rain' || S.wx === 'storm';
        const sky = g.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, mix([95, 160, 225], [8, 8, 30], k)); sky.addColorStop(1, mix([250, 205, 140], [85, 18, 45], k));
        g.fillStyle = sky; g.fillRect(0, 0, W, H);
        stars.forEach(([x, y, p]) => { g.fillStyle = `rgba(255,240,200,${k * (.5 + .5 * Math.sin(S.t * 2 + p))})`; g.fillRect(x | 0, y | 0, 1, 1) });
        if (k > .6 && Math.random() < .004) S.shoot.push({ x: 40 + Math.random() * 200, y: Math.random() * 50, vx: 3 + Math.random() * 2, vy: 1.4 + Math.random() });
        S.shoot = S.shoot.filter(s => {
            s.x += s.vx; s.y += s.vy; g.strokeStyle = `rgba(255,250,220,${k})`; g.lineWidth = 1;
            g.beginPath(); g.moveTo(s.x, s.y); g.lineTo(s.x - s.vx * 6, s.y - s.vy * 6); g.stroke(); return s.x < W && s.y < 110;
        });
        g.globalAlpha = 1 - k; g.fillStyle = '#ffd45e'; g.fillRect(236, Math.round(30 + k * 110), 18, 18);
        const my = Math.round(140 - k * 110), ph = moonPhase(), d = 14 * (1 - Math.abs(2 * ph - 1)); // moon shows tonight's real phase
        g.globalAlpha = k; g.save(); g.beginPath(); g.arc(77, my + 7, 7, 0, 7); g.clip();
        g.fillStyle = '#f4ecd0'; g.fillRect(70, my, 14, 14); g.fillStyle = mix([95, 160, 225], [8, 8, 30], k);
        g.beginPath(); g.arc(77 + (ph < .5 ? -d : d), my + 7, 7.5, 0, 7); g.fill(); g.restore(); g.globalAlpha = 1;
        const cc = S.wx === 'storm' ? [60, 60, 78] : wet ? [105, 105, 120] : S.wx === 'snow' ? [160, 160, 175] : [250, 245, 240];
        clouds.forEach(c => { c[0] = (c[0] + .08) % (W + 60); g.fillStyle = mix(cc, [40, 35, 60], k); const x = c[0] - 40; g.fillRect(x, c[1], c[2], 6); g.fillRect(x + 6, c[1] - 5, c[2] - 14, 6) });
        g.fillStyle = mix([70, 40, 30], [18, 6, 10], k); g.beginPath(); g.moveTo(0, H); g.lineTo(0, 150);
        for (let x = 0; x <= W; x += 20) g.lineTo(x, 148 + Math.sin(x / 38) * 8);
        g.lineTo(W, H); g.fill();
        g.fillStyle = mix([40, 24, 18], [8, 3, 5], k); g.fillRect(0, 170, W, 30);
        g.fillStyle = mix([150, 60, 50], [48, 12, 18], k); g.fillRect(110, 138, 50, 34);
        g.fillStyle = mix([90, 30, 30], [28, 6, 10], k); g.beginPath(); g.moveTo(106, 138); g.lineTo(135, 118); g.lineTo(164, 138); g.fill();
        g.fillStyle = `rgba(255,200,90,${.25 + .75 * k})`; g.fillRect(118, 148, 10, 10); g.fillRect(142, 148, 10, 10);
        g.fillStyle = '#d4af37'; g.fillRect(132, 156, 8, 16);
        [[200, '#b3121f'], [214, '#d4af37']].forEach(([x, c], j) => {
            const b = Math.round(Math.sin(S.t * 2 + j));
            g.fillStyle = '#f1c9a0'; g.fillRect(x, 150 + b, 5, 5); g.fillStyle = c; g.fillRect(x, 155 + b, 5, 9);
            g.fillStyle = '#222'; g.fillRect(x, 164 + b, 2, 6); g.fillRect(x + 3, 164 + b, 2, 6);
        });
        S.parts.forEach(p => {
            if (wet) { const v = S.wx === 'storm' ? 1.5 : 1; p[1] += p[2] * 3 * v; p[0] -= .6 * v; g.fillStyle = 'rgba(170,200,255,.7)'; g.fillRect(p[0] | 0, p[1] | 0, 1, 4) }
            else if (S.wx === 'snow') { p[1] += p[2] * .5; p[0] += Math.sin(S.t + p[3]) * .3; g.fillStyle = '#fff'; g.fillRect(p[0] | 0, p[1] | 0, 2, 2) }
            else if (S.wx === 'leaves') { p[1] += p[2] * .45; p[0] += Math.sin(S.t * 1.4 + p[3]) * .6; g.fillStyle = LEAF[p[4]]; g.fillRect(p[0] | 0, p[1] | 0, 3, 2) }
            else { p[0] += Math.sin(S.t + p[3]) * .4; p[1] += Math.cos(S.t * .8 + p[3]) * .3; g.fillStyle = `rgba(255,226,122,${(.4 + .6 * Math.sin(S.t * 3 + p[3])) * (.3 + .7 * k)})`; g.fillRect(p[0] | 0, p[1] | 0, 2, 2) }
            if (p[1] > H) { p[1] = -4; p[0] = Math.random() * W }
            if (p[0] < 0) p[0] = W; if (p[0] > W) p[0] = 0;
        });
        if (S.wx === 'storm' && S.flash <= 0 && Math.random() < .004) {
            S.flash = 1; let x = 30 + Math.random() * 260, y = 0; S.bolt = [[x, y]];
            while (y < 150) { y += 12 + Math.random() * 14; x += Math.random() * 24 - 12; S.bolt.push([x, y]) }
            setTimeout(() => window.Snd && Snd.thunder(), 400 + Math.random() * 600);
        }
        if (S.flash > 0) {
            g.fillStyle = `rgba(255,255,255,${S.flash * .4})`; g.fillRect(0, 0, W, H);
            g.strokeStyle = `rgba(255,255,255,${S.flash})`; g.lineWidth = 2; g.beginPath();
            S.bolt.forEach(([x, y], j) => j ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); S.flash -= .07;
        }
        S.cvs.slice(1).forEach(c => c.getContext('2d').drawImage(S.cvs[0], 0, 0));
        requestAnimationFrame(frame);
    }

    const Scene = window.Scene = {
        S, W, H, setTime, setWeather, onChange: null,
        mkCanvas() { const c = document.createElement('canvas'); c.width = W; c.height = H; c.className = 'cv'; S.cvs.push(c); return c },
        freeze(node) { node && node.querySelectorAll('canvas').forEach(c => S.cvs = S.cvs.filter(x => x !== c)) },
        ambientKey() { return S.wx === 'storm' ? 'storm' : S.wx === 'rain' ? 'rain' : S.wx === 'snow' ? 'snow' : S.tgt === 'night' ? 'night' : 'day' },
        hit(c, cx, cy) { // which hidden spot was clicked? (coordinates match the drawing above)
            const r = c.getBoundingClientRect(), x = (cx - r.left) / r.width * W, y = (cy - r.top) / r.height * H, k = S.k;
            const my = Math.round(140 - k * 110), sy = Math.round(30 + k * 110);
            const hs = [k > .5 ? ['moon', 66, my - 4, 22, 22] : ['sun', 232, sy - 4, 26, 26],
                ['windowL', 114, 144, 18, 18], ['windowR', 138, 144, 18, 18], ['door', 130, 154, 12, 20], ['him', 197, 148, 11, 24], ['her', 211, 148, 11, 24]];
            const h = hs.find(([, a, b, w, hh]) => x >= a && x <= a + w && y >= b && y <= b + hh);
            return h && h[0];
        }
    };
    frame();
    $('#dn').onclick = () => setTime(S.tgt === 'night' ? 'day' : 'night');
    $('#wx').onchange = e => setWeather(e.target.value);
})();