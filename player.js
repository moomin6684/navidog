// 내비독 프로토타입 플레이어 — Figma 「21 GUI v10」 프로토타입 데이터(data.js)를 그대로 재생한다.
(function () {
  const D = window.PROTO;
  const S = D.S, A = D.A, IMG = D.IMG;
  const W = 393, H = 852;

  // ---------- 변수 ----------
  const vars = [];
  function resetVars() {
    D.V.forEach((v, i) => { vars[i] = v[2]; });
    D.V.forEach((v, i) => { let x = vars[i], guard = 0; while (x && typeof x === 'object' && 'a' in x && guard++ < 20) x = D.V[x.a][2]; vars[i] = x; });
  }
  const fmt = (x) => {
    if (typeof x === 'number') return Number.isInteger(x) ? String(x) : String(parseFloat(x.toFixed(4)));
    if (typeof x === 'boolean') return x ? 'true' : 'false';
    return x == null ? '' : String(x);
  };
  function ev(x) {
    if (x == null || typeof x !== 'object') return x;
    if ('a' in x) return vars[x.a];
    if (!x.f) return null;
    const g = x.x.map(ev);
    const num = (v) => (typeof v === 'number' ? v : parseFloat(v));
    switch (x.f) {
      case 'EQUALS': return typeof g[0] === 'number' || typeof g[1] === 'number' ? num(g[0]) === num(g[1]) : fmt(g[0]) === fmt(g[1]);
      case 'NOT_EQUAL': return !(typeof g[0] === 'number' || typeof g[1] === 'number' ? num(g[0]) === num(g[1]) : fmt(g[0]) === fmt(g[1]));
      case 'LESS_THAN': return num(g[0]) < num(g[1]);
      case 'LESS_THAN_OR_EQUAL': return num(g[0]) <= num(g[1]);
      case 'GREATER_THAN': return num(g[0]) > num(g[1]);
      case 'GREATER_THAN_OR_EQUAL': return num(g[0]) >= num(g[1]);
      case 'AND': return g.every(Boolean);
      case 'OR': return g.some(Boolean);
      case 'NOT': return !g[0];
      case 'NEGATE': return -num(g[0]);
      case 'ADDITION': return g.some((v) => typeof v === 'string') ? g.map(fmt).join('') : g.reduce((s, v) => s + num(v), 0);
      case 'SUBTRACTION': return num(g[0]) - num(g[1]);
      case 'MULTIPLICATION': return num(g[0]) * num(g[1]);
      case 'DIVISION': return num(g[0]) / num(g[1]);
      default: return null;
    }
  }

  // ---------- 화면 만들기 ----------
  const el = (tag, cls, css) => { const e = document.createElement(tag); if (cls) e.className = cls; if (css) Object.assign(e.style, css); return e; };
  const px = (v) => v + 'px';
  function img(id, extra) {
    const m = IMG[id]; if (!m) return el('div');
    const i = el('img', 'lyr', { left: px(-(m.ox || 0)), top: px(-(m.oy || 0)), width: px(m.w), height: px(m.h) });
    i.src = 'img/' + m.f; i.alt = ''; i.draggable = false; i.decoding = 'async';
    if (extra) Object.assign(i.style, extra);
    return i;
  }
  const FONT = { 'Maplestory': "'Maplestory', 'Noto Sans KR', sans-serif", 'Noto Sans KR': "'Noto Sans KR', sans-serif", 'Material Symbols Rounded': "'Material Symbols Rounded'" };
  const WEIGHT = { Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700, ExtraBold: 800, Black: 900 };
  function textNode(it, binds, cw) {
    const [fam, sty, size, color, ah, av, lh, ls, ar, trunc, op] = D.ST[it.s].split('|');
    const [x, y, w, h] = it.b;
    const t = el('div', 'txt');
    const st = t.style;
    st.fontFamily = FONT[fam] || fam; st.fontWeight = WEIGHT[sty] || 400; st.fontSize = px(size);
    if (fam === 'Material Symbols Rounded') st.fontVariationSettings = "'wght' " + (WEIGHT[sty] || 400) + ", 'FILL' 1";
    if (color && color !== 'null') st.color = color;
    st.lineHeight = lh === '0' ? 'normal' : (lh.endsWith('%') ? parseFloat(lh) / 100 : px(lh));
    st.letterSpacing = ls.endsWith('%') ? parseFloat(ls) / 100 + 'em' : px(ls);
    if (+op < 1) st.opacity = op;
    st.top = px(y); st.minHeight = px(h);
    if (ar === 'W') {
      st.whiteSpace = 'pre';
      // 가운데 놓인 자동 너비 글자(버튼 문구 등)는 글자가 바뀌어도 가운데를 지킨다
      const centered = ah === 'C' || (cw && Math.abs(x + w / 2 - cw / 2) < 4);
      if (centered) { st.left = px(x + w / 2); st.transform = 'translateX(-50%)'; }
      else if (ah === 'R') { st.right = 'auto'; st.left = px(x + w); st.transform = 'translateX(-100%)'; }
      else st.left = px(x);
    } else {
      st.left = px(x); st.width = px(w); st.whiteSpace = 'pre-wrap'; st.textAlign = { L: 'left', C: 'center', R: 'right', J: 'justify' }[ah];
      if (ar !== 'H') { st.height = px(h); st.overflow = 'hidden'; }
      if (trunc === '1') { st.whiteSpace = 'nowrap'; st.textOverflow = 'ellipsis'; st.overflow = 'hidden'; }
    }
    if (av === 'C' && ar !== 'W') { st.display = 'flex'; st.alignItems = 'center'; st.height = px(h); }
    binds.texts.push({ e: t, v: it.v });
    return t;
  }
  function hotspot(it, ctx) {
    const [x, y, w, h] = it.b;
    const e = el('div', 'hot', { left: px(x), top: px(y), width: px(w), height: px(h) });
    attachReactions(e, it.r, ctx);
    return e;
  }

  // 드래그/클릭 판별
  function attachReactions(e, refs, ctx) {
    const list = (refs || []).map((k) => A[k]);
    const click = list.filter((a) => a.tg.t === 'ON_CLICK');
    const drag = list.filter((a) => a.tg.t === 'ON_DRAG');
    if (!click.length && !drag.length) return;
    e.classList.add('hot');
    let sx = 0, sy = 0, down = false, fired = false;
    e.addEventListener('pointerdown', (ev2) => { down = true; fired = false; sx = ev2.clientX; sy = ev2.clientY; if (drag.length) e.setPointerCapture(ev2.pointerId); });
    e.addEventListener('pointermove', (ev2) => {
      if (!down || fired || !drag.length) return;
      if (Math.hypot(ev2.clientX - sx, ev2.clientY - sy) > 14 * ctx.scale()) { fired = true; drag.forEach((a) => run(a.a)); }
    });
    e.addEventListener('pointerup', () => { down = false; });
    e.addEventListener('click', (ev2) => {
      ev2.stopPropagation();
      if (fired) return;
      if (click.length) click.forEach((a) => run(a.a));
      else if (drag.length) drag.forEach((a) => run(a.a)); // 데스크톱 클릭으로도 넘길 수 있게
    });
  }

  // 항목 목록을 컨테이너에 그린다
  function renderItems(items, parent, binds, ctx, cw) {
    // 이미지 조각(표시 전환·스크롤)을 먼저, 글자와 누르는 영역은 그 위에
    const rank = (it) => (it.k === 'v' || it.k === 's' ? 0 : 1);
    items = items.map((it, i) => [it, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map((x) => x[0]);
    for (const it of items) {
      if (it.k === 't') parent.appendChild(textNode(it, binds, cw));
      else if (it.k === 'h') parent.appendChild(hotspot(it, ctx));
      else if (it.k === 'v') parent.appendChild(visBox(it, binds, ctx));
      else if (it.k === 's') parent.appendChild(scrollBox(it, binds, ctx));
    }
  }
  function visBox(it, binds, ctx) {
    const [x, y, w, h] = it.b;
    const box = el('div', 'vis', { left: px(x), top: px(y), width: px(w), height: px(h) });
    if (it.img) box.appendChild(img(it.img));
    if (it.r) { const hs = el('div', 'hot', { left: 0, top: 0, width: px(w), height: px(h) }); attachReactions(hs, it.r, ctx); box.appendChild(hs); }
    renderItems(it.c, box, binds, ctx, w);
    binds.vis.push({ e: box, v: it.v });
    return box;
  }
  function scrollBox(it, binds, ctx) {
    const [x, y, w, h] = it.b;
    const box = el('div', 'scr ' + (it.dir === 'B' ? 'both' : it.dir === 'H' ? 'horiz' : 'vert'), { left: px(x), top: px(y), width: px(w), height: px(h) });
    const content = el('div', 'content');
    box.appendChild(content);
    if (it.fl) {
      // 세로 자동 배치 — 아코디언이 열리면 아래 블록이 밀린다
      const m = IMG[it.img], m2 = it.img2 ? IMG[it.img2] : null;
      const blocks = it.fl.map((f, i) => ({ y: f[0], h: f[1], acc: !!f[2], open: false, i }));
      const ends = (fl, total) => fl.map((f, i) => (i + 1 < fl.length ? fl[i + 1][0] : total));
      const end1 = ends(it.fl, it.ih), end2 = it.fl2 ? ends(it.fl2, it.ih2) : null;
      const slices = blocks.map((b, i) => {
        const top0 = i === 0 ? 0 : b.y;
        const s = el('div', 'slice'); s.style.width = px(w);
        content.appendChild(s);
        b.el = s; b.top0 = top0; b.end = end1[i];
        if (b.acc && it.fl2) { b.top2 = i === 0 ? 0 : it.fl2[i][0]; b.end2 = end2[i]; }
        return b;
      });
      // 항목을 블록에 배정
      for (const c of it.c) {
        const cy = c.b[1];
        let bi = blocks.length - 1;
        for (let i = 0; i < blocks.length; i++) if (cy < blocks[i].end) { bi = i; break; }
        const b = blocks[bi];
        const c2 = Object.assign({}, c, { b: [c.b[0], c.b[1] - b.top0, c.b[2], c.b[3]] });
        renderItems([c2], b.el, binds, ctx, w);
      }
      const layout = () => {
        let top = 0;
        for (const b of slices) {
          const useOpen = b.acc && b.open && m2;
          const sy = useOpen ? b.top2 : b.top0, ey = useOpen ? b.end2 : b.end;
          const mm = useOpen ? m2 : m;
          b.el.style.top = px(top); b.el.style.height = px(ey - sy);
          b.el.style.backgroundImage = 'url(img/' + mm.f + ')';
          b.el.style.backgroundSize = px(mm.w) + ' ' + px(mm.h);
          b.el.style.backgroundPosition = px(-(mm.ox || 0)) + ' ' + px(-sy - (mm.oy || 0));
          top += ey - sy;
        }
        content.style.height = px(top); content.style.width = px(w);
      };
      for (const b of slices) if (b.acc && m2) {
        const t = el('div', 'hot', { left: px(20), top: px(b.y - b.top0), width: px(w - 40), height: px(b.h) });
        t.addEventListener('click', (e2) => { e2.stopPropagation(); b.open = !b.open; const keep = box.scrollTop; layout(); box.scrollTop = keep; });
        b.el.appendChild(t);
      }
      layout();
    } else {
      const [cx, cy, cw, ch] = it.cb;
      content.style.width = px(cw); content.style.height = px(ch);
      content.appendChild(img(it.img, { width: px(cw), height: px(ch), left: 0, top: 0 }));
      renderItems(it.c, content, binds, ctx, null);
      ctx.afterMount.push(() => { box.scrollLeft = -cx; box.scrollTop = -cy; });
      enableDragScroll(box, ctx);
    }
    if (it.r) attachReactions(box, it.r, ctx);
    return box;
  }
  // 마우스로 끌어서 지도 이동(터치는 기본 스크롤)
  function enableDragScroll(box, ctx) {
    let on = false, sx, sy, sl, st, moved = false;
    box.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') return; on = true; moved = false; sx = e.clientX; sy = e.clientY; sl = box.scrollLeft; st = box.scrollTop; });
    window.addEventListener('pointermove', (e) => { if (!on) return; const k = ctx.scale(); const dx = (e.clientX - sx) / k, dy = (e.clientY - sy) / k; if (Math.abs(dx) + Math.abs(dy) > 4) moved = true; box.scrollLeft = sl - dx; box.scrollTop = st - dy; });
    window.addEventListener('pointerup', () => { on = false; });
    box.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; } }, true);
  }

  function buildScreen(id) {
    const sc = S[id];
    const binds = { texts: [], vis: [] };
    const ctx = { afterMount: [], scale: () => scale, timers: [] };
    const root = el('div', 'screen', { width: px(sc.w), height: px(sc.h) });
    const cuts = sc.c.filter((c) => c.k === 's' && c.z != null).map((c) => c.z).sort((a, b) => a - b);
    const layerOf = (z) => cuts.filter((c) => c < z).length;
    for (let L = 0; L < sc.L.length; L++) {
      root.appendChild(img(sc.L[L]));
      const items = sc.c.filter((c) => !(c.k === 's' && c.z != null && cuts.includes(c.z)) && layerOf(c.z == null ? 1e9 : c.z) === L);
      renderItems(items, root, binds, ctx, sc.w);
      if (L < cuts.length) renderItems(sc.c.filter((c) => c.k === 's' && c.z === cuts[L]), root, binds, ctx);
    }
    root.addEventListener('click', () => flashHotspots(root));
    const timeouts = (sc.r || []).map((k) => A[k]).filter((a) => a.tg.t === 'AFTER_TIMEOUT');
    const clicks = (sc.r || []).filter((k) => A[k].tg.t !== 'AFTER_TIMEOUT');
    if (clicks.length) { const hs = el('div', 'hot', { left: 0, top: 0, width: px(sc.w), height: px(sc.h) }); attachReactions(hs, clicks, ctx); root.insertBefore(hs, root.firstChild.nextSibling); }
    return { id, root, binds, ctx, timeouts };
  }
  function flashHotspots(root) {
    root.classList.remove('flash'); void root.offsetWidth; root.classList.add('flash');
  }
  function refresh(scr) {
    for (const t of scr.binds.texts) { const v = fmt(vars[t.v]); if (t.e.textContent !== v) t.e.textContent = v; }
    for (const b of scr.binds.vis) b.e.style.display = vars[b.v] ? '' : 'none';
  }

  // ---------- 탐색 ----------
  const stage = document.getElementById('stage');
  const device = document.getElementById('device');
  let scale = 1;
  let current = null; const history = []; const overlays = [];
  function show(id, tr) {
    if (!S[id]) return;
    const next = buildScreen(id);
    refresh(next);
    device.appendChild(next.root);
    next.ctx.afterMount.forEach((f) => f());
    const prev = current;
    current = next;
    if (prev) {
      prev.timers && prev.timers.forEach(clearTimeout);
      const dur = tr ? Math.min(400, Math.max(120, tr[1] * 1000)) : 0;
      if (dur) {
        next.root.style.opacity = 0; next.root.style.transition = 'opacity ' + dur + 'ms ease';
        requestAnimationFrame(() => { next.root.style.opacity = 1; });
        setTimeout(() => prev.root.remove(), dur + 30);
      } else prev.root.remove();
    }
    startTimers(next);
  }
  function startTimers(scr) {
    scr.timers = scr.timeouts.map((a) => setTimeout(() => { if (current === scr || overlays.includes(scr)) run(a.a, scr); }, (a.tg.ms || 0) * 1000));
  }
  function openOverlay(id) {
    const o = buildScreen(id); refresh(o);
    const wrap = el('div', 'overlay');
    wrap.appendChild(o.root); o.wrap = wrap;
    device.appendChild(wrap);
    o.ctx.afterMount.forEach((f) => f());
    overlays.push(o); startTimers(o);
  }
  function closeOverlay(target) {
    const o = target && overlays.includes(target) ? target : overlays[overlays.length - 1];
    if (!o) return;
    o.timers.forEach(clearTimeout);
    overlays.splice(overlays.indexOf(o), 1);
    o.wrap.style.opacity = 0; setTimeout(() => o.wrap.remove(), 180);
  }
  function run(actions, from) {
    for (const a of actions || []) {
      if (a.t === 'SET_VARIABLE') vars[a.v] = ev(a.val);
      else if (a.t === 'CONDITIONAL') {
        for (const b of a.cb) { if (b.c == null || ev(b.c)) { run(b.a, from); break; } }
      } else if (a.t === 'NODE' && (a.n === 'NAVIGATE' || a.n === 'SWAP') && a.d) {
        if (a.n === 'SWAP' && overlays.length) { closeOverlay(); openOverlay(a.d); continue; }
        while (overlays.length) closeOverlay();
        if (current) history.push(current.id);
        show(a.d, a.tr);
      } else if (a.t === 'NODE' && a.n === 'OVERLAY' && a.d) openOverlay(a.d);
      else if (a.t === 'BACK') {
        if (overlays.length) closeOverlay();
        else if (history.length) show(history.pop(), ['DISSOLVE', 0.2]);
      } else if (a.t === 'CLOSE') closeOverlay(from);
      else if (a.t === 'URL' && a.url) window.open(a.url, '_blank');
    }
    if (current) refresh(current);
    overlays.forEach(refresh);
  }

  // ---------- 화면 크기 맞추기 ----------
  function fit() {
    const mobile = window.matchMedia('(max-width: 600px)').matches;
    document.body.classList.toggle('mobile', mobile);
    const availW = mobile ? window.innerWidth : window.innerWidth - 48;
    const chrome = document.querySelector('header').offsetHeight + document.querySelector('footer').offsetHeight + 56;
    const availH = mobile ? window.innerHeight : window.innerHeight - chrome;
    scale = Math.min(availW / W, availH / H, mobile ? 4 : 1.15);
    device.style.transform = 'scale(' + scale + ')';
    stage.style.width = px(W * scale); stage.style.height = px(H * scale);
  }
  window.addEventListener('resize', fit);
  document.getElementById('restart').addEventListener('click', () => { resetVars(); history.length = 0; while (overlays.length) closeOverlay(); show(D.START, ['DISSOLVE', 0.2]); });

  // 확인용: 콘솔에서 NAVI.go('화면 이름')
  window.NAVI = { go: (q) => { const id = S[q] ? q : Object.keys(S).find((k) => S[k].n === q); if (id) show(id); return id; }, cur: () => current && S[current.id].n, vars };
  resetVars(); fit();
  show(D.START);
})();
