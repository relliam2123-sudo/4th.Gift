// The book itself: cover, real page turns (button, keys, or dragging a corner), locks, letter, diary, secrets.
(() => {
    const C = CONFIG, P = PAGES, $ = s => document.querySelector(s), S = Scene.S;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    // "open" is kept in memory only, so sealed chapters lock again after every refresh
    let open = {}, i = -1, saved = Math.min(store.get('log_page', 0), P.length - 1), busy = false, pend, vo;
    let found = store.get('log_secrets', {}), entries = store.get('log_entries', []);
    const lockOf = n => { const k = C.chapterLocks[P[n].ch]; return k && !open[k] ? k : null };
    while (saved > 0 && lockOf(saved)) saved--;
    const ph = src => Object.assign(document.createElement('div'), { className: 'ph', textContent: 'Add ' + src });
    const el = (c, h = '') => Object.assign(document.createElement('div'), { className: c, innerHTML: h });
    const stage = $('#stage'), book = $('#book'), L = $('#slotL'), R = $('#slotR'), SEC = Object.keys(C.secrets);

    /* ---------- hidden secrets ---------- */
    let tt;
    const toast = m => { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => t.classList.remove('show'), 4200) };
    const badge = () => $('#sec').textContent = `Secrets ${Object.keys(found).length}/${SEC.length}`;
    book.addEventListener('click', e => {
        const c = e.target; if (!(c instanceof HTMLCanvasElement) || c.closest('.cover')) return;
        const id = Scene.hit(c, e.clientX, e.clientY); if (!id || !C.secrets[id]) return;
        found[id] = 1; store.set('log_secrets', found); badge(); toast(C.secrets[id]);
        if (Object.keys(found).length === SEC.length) setTimeout(() => toast(C.allFound), 4600);
    });

    /* ---------- building pages ---------- */
    function buildCover() {
        const d = el('page cover', `<div class="spine"><span>${C.title}</span></div><div class="frame"><h1>${C.title}</h1><div class="medal"></div><p>${C.subtitle || ''}</p></div>`);
        const m = d.querySelector('.medal'); m.append(Scene.mkCanvas());
        if (C.cover) { const im = new Image(); im.onload = () => m.append(im); im.src = C.cover }
        d.onclick = () => i < 0 && go(saved);
        return d;
    }
    function fillEntries(box) {
        box.replaceChildren();
        if (!entries.length) { box.append(el('empty', 'No entries yet. Write the first one on the right page.')); return }
        entries.forEach(en => {
            const a = el('entry'), w = el('when'), t = document.createElement('p'), x = document.createElement('button');
            w.textContent = new Date(en.t).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }); t.textContent = en.text;
            x.className = 'del'; x.textContent = '×'; x.title = 'Delete this entry';
            x.onclick = () => { entries = entries.filter(q => q.t !== en.t); store.set('log_entries', entries); document.querySelectorAll('.entries').forEach(fillEntries) };
            a.append(w, t, x); box.append(a);
        });
    }
    function buildLeft(n) {
        const p = P[n];
        const d = el('page lp', `<div class="chap">Chapter ${p.ch}: ${C.chapters[p.ch]}</div><h2>${p.title}</h2>` +
            p.text.map(t => `<p>${t}</p>`).join('') +
            (p.ink ? `<div class="ink">${p.ink}</div>` : '') +
            (p.photo ? `<figure class="polaroid"><img src="${p.photo}" alt=""><figcaption>${p.caption || ''}</figcaption></figure>` : '') +
            (p.voice ? `<button class="voice" data-src="${p.voice}">Play voice note</button>` : '') +
            `<div class="pn">${n + 1}</div>` +
            (p.notes || []).map((o, k) => `<button class="sticky" style="left:${o.x}%;top:${o.y}%" data-k="${k}">${o.label}</button>`).join('') +
            `<div class="pop" hidden></div>`);
        if (p.right === 'diary') { const box = el('entries'); d.insertBefore(box, d.querySelector('.pn')); fillEntries(box) }
        d.querySelectorAll('img').forEach(m => m.onerror = () => m.replaceWith(ph(m.getAttribute('src'))));
        d.addEventListener('click', e => {
            const v = e.target.closest('.voice'), s = e.target.closest('.sticky'), pop = d.querySelector('.pop');
            if (v) { vo && vo.pause(); vo = new Audio(v.dataset.src); vo.onerror = () => v.textContent = 'Add ' + v.dataset.src; vo.play().catch(() => {}) }
            if (s) { const same = !pop.hidden && pop.dataset.k === s.dataset.k; pop.dataset.k = s.dataset.k; pop.textContent = p.notes[s.dataset.k].text; pop.hidden = same }
        });
        return d;
    }
    function typeText(node, text) {
        let n = 0; const t = setInterval(() => { if (!node.isConnected) return clearInterval(t); node.textContent = text.slice(0, ++n); if (n >= text.length) clearInterval(t) }, 38);
    }
    function buildRight(n) {
        const p = P[n], d = el('page rp');
        if (p.right === 'clip' || p.right === 'film') {
            const src = p.clip || p.film, v = document.createElement('video'); v.src = src;
            if (p.right === 'clip') { v.autoplay = v.muted = v.loop = true; v.playsInline = true } else { v.controls = true; v.preload = 'metadata' }
            v.onerror = () => v.replaceWith(ph(src)); d.append(v);
        } else if (p.right === 'letter') {
            d.classList.add('lt');
            d.innerHTML = '<div class="env"><i class="back"></i><div class="paper"><span class="typed"></span></div><i class="front"></i><i class="flap"></i><b class="wax">&hearts;</b></div><p class="tap">Tap the envelope to open it</p>';
            const env = d.querySelector('.env');
            env.onclick = () => { if (env.classList.contains('open')) return; env.classList.add('open'); d.querySelector('.tap').style.opacity = 0; setTimeout(() => typeText(d.querySelector('.typed'), p.letter), 900) };
        } else if (p.right === 'diary') {
            d.classList.add('dy');
            d.innerHTML = '<h3>Write something new</h3><textarea placeholder="Today I..."></textarea><div><button class="save">Save entry</button> <button class="exp">Download all</button></div><p class="msg"></p>';
            const ta = d.querySelector('textarea'), msg = d.querySelector('.msg');
            d.querySelector('.save').onclick = () => {
                const t = ta.value.trim(); if (!t) { msg.textContent = 'Write something first.'; return }
                entries.unshift({ t: Date.now(), text: t }); store.set('log_entries', entries); ta.value = ''; msg.textContent = 'Saved in this browser.';
                document.querySelectorAll('.entries').forEach(fillEntries);
            };
            d.querySelector('.exp').onclick = () => {
                const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([entries.map(en => new Date(en.t).toLocaleString() + '\n' + en.text).join('\n\n')], { type: 'text/plain' }));
                a.download = 'our-diary.txt'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
            };
        } else {
            d.append(Scene.mkCanvas());
            if (p.right === 'code') {
                d.insertAdjacentHTML('beforeend', '<textarea spellcheck="false"></textarea><button class="run">Run code</button><span class="out"></span>');
                const ta = d.querySelector('textarea'), out = d.querySelector('.out'); ta.value = p.code;
                const run = () => { try { new Function('setTime', 'setWeather', ta.value)(Scene.setTime, Scene.setWeather); out.textContent = 'Ran without errors' } catch (e) { out.textContent = 'Error: ' + e.message } };
                d.querySelector('.run').onclick = run; run();
            } else { Scene.setTime(p.time || 'day'); Scene.setWeather(p.weather || 'none') }
        }
        d.append(el('pn r', n + 1));
        return d;
    }

    /* ---------- turning pages: one leaf = front is a right page, back is the next left page ---------- */
    const DUR = matchMedia('(prefers-reduced-motion:reduce)').matches ? 250 : 1200, EASE = 'cubic-bezier(.5,.05,.2,1)';
    const pose = (c, p) => `translateZ(${36 * Math.sin(Math.PI * p)}px) rotateY(${c.fwd ? -180 * p : -180 + 180 * p}deg)`;
    function setup(n, drag) {
        const prev = i, fwd = n > i, oldL = L.firstElementChild, oldR = R.firstElementChild, snap = { tgt: S.tgt, wx: S.wx };
        busy = true; i = n; book.classList.add('turning');
        if (!drag) { stage.classList.toggle('closed', n < 0); document.body.classList.toggle('closed', n < 0) }
        Snd.flip(); Scene.freeze(oldR);
        const newR = n < 0 ? buildCover() : buildRight(n), newL = n < 0 ? null : buildLeft(n);
        const leaf = el('leaf'), front = el('face front'), back = el('face back'), cast = el('cast ' + (fwd ? 'r' : 'l'));
        front.append(fwd ? oldR : newR, el('shade')); back.append(fwd ? newL : oldL, el('shade'));
        if (fwd) R.append(newR); else if (newL) L.append(newL);
        leaf.append(front, back); book.append(leaf); (fwd ? R : L).append(cast);
        const c = { n, prev, fwd, oldL, oldR, newL, newR, snap, leaf, front, back, cast };
        leaf.style.transform = pose(c, 0); return c;
    }
    function play(c, p0, p1, dur, full) {
        const o = { duration: dur, easing: full ? EASE : 'ease-out' }, sh = p => .55 * Math.sin(Math.PI * p);
        const kf = full ? [0, .5, 1].map(p => ({ transform: pose(c, p), offset: p })) : [{ transform: pose(c, p0) }, { transform: pose(c, p1) }];
        const so = full ? [0, .5, 1].map(p => ({ opacity: sh(p), offset: p })) : [{ opacity: sh(p0) }, { opacity: sh(p1) }];
        c.front.lastChild.animate(so, o); c.back.lastChild.animate(so, o);
        c.cast.animate(so.map(f => ({ ...f, opacity: f.opacity / .55 })), o);
        return c.leaf.animate(kf, o).finished;
    }
    function finish(c) {
        if (c.fwd) L.replaceChildren(c.newL); else R.replaceChildren(c.newR);
        c.leaf.remove(); c.cast.remove(); book.classList.remove('turning');
        stage.classList.toggle('closed', c.n < 0); document.body.classList.toggle('closed', c.n < 0);
        book.classList.toggle('last', c.n === P.length - 1);
        if (c.n >= 0) store.set('log_page', c.n);
        $('#toc').value = c.n; Scene.onChange();
        if (c.prev < 0 && c.n >= 0) Snd.startMusic();
        busy = false;
    }
    function cancel(c) { // a drag that was let go too early: put everything back
        if (c.fwd) R.replaceChildren(c.oldR); else L.replaceChildren(c.oldL);
        c.oldR.querySelectorAll('canvas').forEach(x => S.cvs.push(x));
        c.leaf.remove(); c.cast.remove(); book.classList.remove('turning');
        i = c.prev; Scene.setTime(c.snap.tgt); Scene.setWeather(c.snap.wx); busy = false;
    }
    async function go(n) {
        if (busy || n < -1 || n >= P.length || n === i) return;
        const k = n >= 0 && lockOf(n); if (k) return askLock(k, n);
        const c = setup(n, false); await play(c, 0, 1, DUR, true); finish(c);
    }
    function drag(curl, dir) { // dir 1: right corner turns forward; -1: left corner turns back
        let st = null;
        curl.onpointerdown = e => { if (busy || i < 0) return; st = { x: e.clientX, c: null, p: 0 }; curl.setPointerCapture(e.pointerId); e.preventDefault() };
        curl.onpointermove = e => {
            if (!st) return;
            const dx = (st.x - e.clientX) * dir;
            if (!st.c) {
                if (dx < 10) return;
                const n = i + dir; if (n < -1 || n >= P.length) return;
                const k = n >= 0 && lockOf(n); if (k) { st = null; return askLock(k, n) }
                st.c = setup(n, true); st.w = R.getBoundingClientRect().width * 1.1;
            }
            st.p = Math.min(1, Math.max(0, dx / st.w)); const s = Math.sin(Math.PI * st.p);
            st.c.leaf.style.transform = pose(st.c, st.p); st.c.front.lastChild.style.opacity = st.c.back.lastChild.style.opacity = .55 * s; st.c.cast.style.opacity = s;
        };
        curl.onpointerup = curl.onpointercancel = async e => {
            const s = st; st = null; if (!s) return;
            if (!s.c) return Math.abs(e.clientX - s.x) < 10 ? go(i + dir) : undefined;
            if (s.p > .3) { await play(s.c, s.p, 1, DUR * (1 - s.p) + 150, false); finish(s.c) }
            else { await play(s.c, s.p, 0, 260, false); cancel(s.c) }
        };
    }
    drag($('#curlR'), 1); drag($('#curlL'), -1);

    function buildToc() { $('#toc').innerHTML = '<option value="-1">Cover</option>' + P.map((p, n) => `<option value="${n}">${n + 1}. ${p.title}${lockOf(n) ? ' (sealed)' : ''}</option>`).join(''); $('#toc').value = i }
    $('#toc').onchange = e => { const n = +e.target.value; $('#toc').value = i; go(n) };
    $('#pv').onclick = () => go(i - 1);
    $('#nx').onclick = () => go(i < 0 ? saved : i + 1);
    document.addEventListener('keydown', e => {
        if (e.target.matches('input,textarea,select') || !$('#lock').hidden) return;
        if (e.key === 'ArrowRight') go(i < 0 ? saved : i + 1); if (e.key === 'ArrowLeft') go(i - 1);
    });

    /* ---------- sealed chapters ---------- */
    function askLock(k, n) { pend = [k, n]; $('#seal').classList.remove('broken'); $('#pw').value = ''; $('#lm').textContent = ''; $('#lock').hidden = false; $('#pw').focus() }
    $('#lgo').onclick = async () => {
        if (!pend) return; const [k, n] = pend, norm = t => t.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
        if (norm($('#pw').value) === norm(C.locks[k].pass)) {
            pend = null; open[k] = 1; $('#seal').classList.add('broken'); await wait(800);
            $('#lock').hidden = true; buildToc(); go(n);
        } else { const b = $('#lbox'); b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); $('#lm').textContent = 'Wrong passcode.' }
    };
    $('#lhint').onclick = () => pend && ($('#lm').textContent = C.locks[pend[0]].hint);
    $('#lx').onclick = () => $('#lock').hidden = true;
    $('#pw').onkeydown = e => { if (e.key === 'Enter') $('#lgo').click() };

    /* ---------- start ---------- */
    Scene.onChange = () => Snd.ambient(i >= 0 ? Scene.ambientKey() : null);
    $('#ttl').textContent = C.title; document.title = C.title; buildToc(); badge();
    Scene.setTime('night'); Scene.setWeather('fireflies'); R.append(buildCover()); $('#toc').value = -1;
    $('#hint').textContent = saved > 0 ? `Tap the cover to continue on page ${saved + 1}` : 'Tap the cover to open the book';
})();