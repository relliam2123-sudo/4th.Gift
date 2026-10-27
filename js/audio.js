// Two separate sound systems: MUSIC (one song) and BOOK AUDIO (page flips + scene ambience).
(() => {
    const C = CONFIG, $ = s => document.querySelector(s);

    /* ---------- music: one song ---------- */
    const tape = $('#tape'); tape.src = C.music.file; tape.loop = true; tape.volume = store.get('log_mvol', .6);
    $('#vol').value = tape.volume; $('#tname').textContent = C.music.name;
    const miss = () => $('#tname').textContent = 'Add ' + C.music.file;
    tape.onerror = miss;
    $('#pp').onclick = () => tape.paused ? tape.play().catch(miss) : tape.pause();
    tape.onplay = () => { $('#deck').classList.add('on'); $('#pp').textContent = 'Pause' };
    tape.onpause = () => { $('#deck').classList.remove('on'); $('#pp').textContent = 'Play' };
    $('#vol').oninput = e => { tape.volume = +e.target.value; store.set('log_mvol', tape.volume) };

    /* ---------- book audio ---------- */
    const Snd = window.Snd = { vol: store.get('log_bvol', .6), ctx: null, bus: null, key: null, cur: null, started: false };
    $('#bvol').value = Snd.vol;
    Snd.startMusic = () => { if (Snd.started) return; Snd.started = true; tape.play().catch(() => {}) };
    Snd.init = () => {
        try {
            if (!Snd.ctx) {
                const x = Snd.ctx = new AudioContext(); Snd.bus = x.createGain(); Snd.bus.gain.value = Snd.vol; Snd.bus.connect(x.destination);
                const n = x.sampleRate * 2, b = x.createBuffer(1, n, x.sampleRate), d = b.getChannelData(0);
                for (let j = 0; j < n; j++) d[j] = Math.random() * 2 - 1; Snd.noise = b;
            }
            if (Snd.ctx.state === 'suspended') Snd.ctx.resume();
        } catch (e) {}
    };
    const nz = () => { const s = Snd.ctx.createBufferSource(); s.buffer = Snd.noise; s.loop = true; return s };
    const filt = (type, f, q = 1) => { const b = Snd.ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b };
    const tryFile = (src, fallback) => { const a = new Audio(src); a.volume = Snd.vol; a.play().catch(fallback); return a };
    const fade = (a, to, ms, done) => {
        const from = a.volume, st = performance.now();
        const t = setInterval(() => { const p = Math.min(1, (performance.now() - st) / ms); a.volume = Math.max(0, Math.min(1, from + (to - from) * p)); if (p === 1) { clearInterval(t); done && done() } }, 50);
    };

    function synthFlip() {
        if (!Snd.ctx) return;
        const x = Snd.ctx, t = x.currentTime, s = nz(), f = filt('bandpass', 900, .8), g = x.createGain();
        f.frequency.exponentialRampToValueAtTime(3800, t + .6);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5, t + .15); g.gain.linearRampToValueAtTime(0, t + .65);
        s.connect(f); f.connect(g); g.connect(Snd.bus); s.start(t); s.stop(t + .7);
    }
    Snd.flip = () => {
        Snd.init(); if (Snd.noFlip) return synthFlip();
        tryFile(C.sounds.flip, e => { if (e.name === 'NotSupportedError') Snd.noFlip = true; synthFlip() });
    };
    Snd.thunder = () => {
        if (Snd.key !== 'storm' || !Snd.ctx) return;
        const syn = () => {
            const x = Snd.ctx, t = x.currentTime, s = nz(), l = filt('lowpass', 170), g = x.createGain();
            g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(1, t + .08); g.gain.exponentialRampToValueAtTime(.001, t + 2.6);
            s.connect(l); l.connect(g); g.connect(Snd.bus); s.start(t); s.stop(t + 2.7);
        };
        if (Snd.noThunder) return syn();
        tryFile(C.sounds.thunder, e => { if (e.name === 'NotSupportedError') Snd.noThunder = true; syn() });
    };

// built-in ambience, used when the audio file for that scene is missing
    function synth(key) {
        const x = Snd.ctx, ag = x.createGain(), nodes = [], t = x.currentTime; ag.gain.value = 0; ag.connect(Snd.bus);
        const add = n => (nodes.push(n), n);
        if (key === 'rain' || key === 'storm') {
            const n = add(nz()), h = filt('highpass', 900), l = filt('lowpass', key === 'storm' ? 6500 : 9000);
            n.connect(h); h.connect(l); l.connect(ag); n.start(); ag.gain.linearRampToValueAtTime(key === 'storm' ? .5 : .3, t + 1.5);
        } else if (key === 'snow') {
            const n = add(nz()), b = filt('bandpass', 380, .5), o = add(x.createOscillator()), og = x.createGain();
            o.frequency.value = .15; og.gain.value = .06; o.connect(og); og.connect(ag.gain);
            n.connect(b); b.connect(ag); n.start(); o.start(); ag.gain.linearRampToValueAtTime(.14, t + 1.5);
        } else if (key === 'night') {
            [[4300, 8], [3900, 6.3]].forEach(([f, r]) => {
                const c = add(x.createOscillator()), cg = x.createGain(), l = add(x.createOscillator()), lg = x.createGain();
                c.frequency.value = f; cg.gain.value = .03; l.frequency.value = r; lg.gain.value = .03;
                l.connect(lg); lg.connect(cg.gain); c.connect(cg); cg.connect(ag); c.start(); l.start();
            });
            ag.gain.linearRampToValueAtTime(1, t + 1.5);
        }
        return { stop() { ag.gain.cancelScheduledValues(x.currentTime); ag.gain.setTargetAtTime(0, x.currentTime, .3); setTimeout(() => { nodes.forEach(n => { try { n.stop() } catch (e) {} }); ag.disconnect() }, 1500) } };
    }
    Snd.ambient = key => {
        if (key === Snd.key) return; Snd.key = key;
        const old = Snd.cur; Snd.cur = null; if (old) old.stop();
        if (!key) return;
        Snd.init(); if (!Snd.ctx) return;
        const a = new Audio(C.sounds[key]); a.loop = true; a.volume = 0;
        const cur = Snd.cur = { a, syn: null, stop() { if (cur.syn) cur.syn.stop(); else fade(a, 0, 800, () => a.pause()) } };
        a.play().then(() => fade(a, Snd.vol * .7, 1200)).catch(() => { if (Snd.cur === cur) cur.syn = synth(key) });
    };
    $('#bvol').oninput = e => {
        Snd.vol = +e.target.value; store.set('log_bvol', Snd.vol);
        if (Snd.bus) Snd.bus.gain.value = Snd.vol;
        if (Snd.cur && !Snd.cur.syn) Snd.cur.a.volume = Snd.vol * .7;
    };
})();