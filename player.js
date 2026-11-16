// 내비독 프로토타입 플레이어 — Figma 「21 GUI v10」 프로토타입 데이터(data.js)를 그대로 재생한다.
(function () {
  const D = window.PROTO;
  const S = D.S, A = D.A, IMG = D.IMG;
  const MAPS = window.MAPS, LQIP = window.LQIP || {};
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
    if (!it.fl && MAPS && MAPS.S[ctx.sid]) return mapView(it, ctx);
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

  // ---------- 지도: 타일 + 핀치 줌 ----------
  // 지도 바탕은 4200×5000(원본 단위) 한 장을 4단계 타일로 나눠 두고, 지금 배율에 맞는 타일만 불러온다.
  // 경로·라벨·핀은 SVG라 어느 배율에서도 선명하다. 핀·라벨은 일정 배율 이상 커지지 않는다.
  const MK_CAP = 1.3;
  function mapView(it, ctx) {
    const M = MAPS.S[ctx.sid], MW = MAPS.W, MH = MAPS.H, T = MAPS.tile;
    const [bx, by, w, h] = it.b;
    const box = el('div', 'map', { left: px(bx), top: px(by), width: px(w), height: px(h) });
    const world = el('div', 'world', { width: px(MW), height: px(MH) });
    const prev = el('img', 'tile', { left: 0, top: 0, width: px(MW), height: px(MH) });
    prev.src = 'map/preview.webp'; prev.alt = ''; prev.draggable = false;
    world.appendChild(prev);
    const levels = MAPS.levels.map((ls, i) => { const d = el('div', 'lvl'); world.appendChild(d); return { ls, i, d, tiles: new Map() }; });
    const ov = el('div', 'ov');
    box.append(world, ov);
    const cam = { s: M.s0, tx: M.ix, ty: M.iy };
    const sMin = Math.min(M.s0, Math.max(w / MW, h / MH)), sMax = 1.6;

    // 덮개(경로·핀·라벨·내 위치)
    const marks = M.mk.map((m) => {
      const e = el('img', 'mk'); e.alt = ''; e.draggable = false; e.decoding = 'async';
      e.src = 'map/mk/' + m.f + (m.f === 'me' ? '.webp' : '.svg');
      if (m.t === 'r') e.classList.add('route');
      ov.appendChild(e);
      return Object.assign({ e }, m);
    });
    // 지도 안의 누르는 곳(시설 핀)은 그 핀에 붙인다
    for (const c of it.c || []) {
      if (c.k !== 'h') continue;
      const mx = (c.b[0] + it.cb[0] + c.b[2] / 2 - M.ix) / M.s0, my = (c.b[1] + it.cb[1] + c.b[3] / 2 - M.iy) / M.s0;
      let best = null, bd = 1e9;
      for (const m of marks) if (m.t === 'm') { const d = Math.hypot(m.x + m.w / 2 - mx, m.y + m.h / 2 - my); if (d < bd) { bd = d; best = m; } }
      if (best && bd < 80) { best.e.classList.add('tap'); attachReactions(best.e, c.r, ctx); }
    }
    function placeMarks() {
      const { s, tx, ty } = cam, ms = Math.min(s, MK_CAP);
      for (const m of marks) {
        let l, t, mw, mh;
        if (m.t === 'r') { l = tx + m.x * s; t = ty + m.y * s; mw = m.w * s; mh = m.h * s; }
        else if (m.t === 's') { mw = m.w; mh = m.h; l = tx + m.cx * s - mw / 2; t = ty + m.cy * s - mh / 2; }
        else {
          const ax = m.x + m.w / 2, ay = m.pin ? m.y + m.h : m.y + m.h / 2;
          mw = m.w * ms; mh = m.h * ms; l = tx + ax * s - (ax - m.x) * ms; t = ty + ay * s - (ay - m.y) * ms;
        }
        m.e.style.transform = 'translate3d(' + l + 'px,' + t + 'px,0)'; m.e.style.width = px(mw); m.e.style.height = px(mh);
      }
    }
    // 타일
    let tileRaf = 0;
    function needTiles() { if (!tileRaf) tileRaf = requestAnimationFrame(updateTiles); }
    function updateTiles() {
      tileRaf = 0;
      const need = cam.s * ctx.scale() * (window.devicePixelRatio || 1);
      let li = levels.findIndex((L) => L.ls >= need * 0.92); if (li < 0) li = levels.length - 1;
      const x0 = -cam.tx / cam.s, y0 = -cam.ty / cam.s, x1 = (w - cam.tx) / cam.s, y1 = (h - cam.ty) / cam.s;
      const L = levels[li], TN = T / L.ls, nx = Math.ceil(MW / TN), ny = Math.ceil(MH / TN);
      const i0 = Math.max(0, Math.floor(x0 / TN)), i1 = Math.min(nx - 1, Math.floor(x1 / TN)), j0 = Math.max(0, Math.floor(y0 / TN)), j1 = Math.min(ny - 1, Math.floor(y1 / TN));
      let pending = 0;
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
        const key = i + '_' + j; let t = L.tiles.get(key);
        if (!t) {
          t = el('img', 'tile', { left: px(i * TN), top: px(j * TN), width: px(TN + 1 / L.ls), height: px(TN + 1 / L.ls) });
          t.alt = ''; t.draggable = false; t.decoding = 'async';
          t.onload = () => { t.classList.add('on'); needTiles(); };
          t.src = 'map/' + li + '/' + key + '.webp';
          L.d.appendChild(t); L.tiles.set(key, t);
        }
        if (!t.complete) pending++;
      }
      // 보이지 않는 고해상도 타일은 버려 메모리를 아낀다(현재 단계의 타일이 다 뜬 뒤 윗단계를 비운다)
      for (const L2 of levels) {
        if (L2.i < 2 && L2.i !== li) continue;
        const TN2 = T / L2.ls, m = L2.i === li ? 1 : 0;
        for (const [key, t] of L2.tiles) {
          const [i, j] = key.split('_').map(Number);
          const out = (i + 1) * TN2 < x0 - m * TN2 || i * TN2 > x1 + m * TN2 || (j + 1) * TN2 < y0 - m * TN2 || j * TN2 > y1 + m * TN2;
          if (out || (L2.i > li && !pending)) { t.remove(); L2.tiles.delete(key); }
        }
      }
    }
    function clampCam(soft) {
      const lo = soft ? sMin * 0.8 : sMin, hi = soft ? sMax * 1.25 : sMax;
      cam.s = Math.min(hi, Math.max(lo, cam.s));
      const fit = (t, size, view) => (size * cam.s <= view ? (view - size * cam.s) / 2 : Math.min(0, Math.max(view - size * cam.s, t)));
      cam.tx = fit(cam.tx, MW, w); cam.ty = fit(cam.ty, MH, h);
    }
    function apply() {
      world.style.transform = 'translate3d(' + cam.tx + 'px,' + cam.ty + 'px,0) scale(' + cam.s + ')';
      placeMarks(); needTiles();
    }
    function zoomAt(px0, py0, f, soft) { const s2 = Math.min(soft ? sMax * 1.25 : sMax, Math.max(soft ? sMin * 0.8 : sMin, cam.s * f)); cam.tx = px0 - (px0 - cam.tx) * (s2 / cam.s); cam.ty = py0 - (py0 - cam.ty) * (s2 / cam.s); cam.s = s2; }

    // 움직임(관성·애니메이션)
    let anim = 0;
    const stop = () => { if (anim) cancelAnimationFrame(anim); anim = 0; box.classList.remove('moving'); };
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function animate(dur, step, done) {
      stop(); const t0 = performance.now(); box.classList.add('moving');
      const f = (now) => { const k = Math.min(1, (now - t0) / dur); step(ease(k)); apply(); if (k < 1) anim = requestAnimationFrame(f); else { anim = 0; box.classList.remove('moving'); done && done(); } };
      anim = requestAnimationFrame(f);
    }
    function zoomAnim(px0, py0, f, dur) {
      const s0 = cam.s, target = Math.min(sMax, Math.max(sMin, s0 * f)), tx0 = cam.tx, ty0 = cam.ty;
      animate(dur || 280, (k) => { const s = s0 * Math.pow(target / s0, k); cam.s = s; cam.tx = px0 - (px0 - tx0) * (s / s0); cam.ty = py0 - (py0 - ty0) * (s / s0); clampCam(false); });
    }
    function flyTo(c2, dur) {
      return new Promise((res) => {
        const a = { s: cam.s, cx: (w / 2 - cam.tx) / cam.s, cy: (h / 2 - cam.ty) / cam.s };
        const b = { s: c2.s, cx: (w / 2 - c2.tx) / c2.s, cy: (h / 2 - c2.ty) / c2.s };
        animate(dur || 420, (k) => { const s = a.s * Math.pow(b.s / a.s, k), cx = a.cx + (b.cx - a.cx) * k, cy = a.cy + (b.cy - a.cy) * k; cam.s = s; cam.tx = w / 2 - cx * s; cam.ty = h / 2 - cy * s; }, res);
      });
    }
    function settle() { const c = { ...cam }; clampCam(false); if (Math.abs(c.s - cam.s) > 1e-4) { const t = { ...cam }; Object.assign(cam, c); flyTo(t, 220); } else apply(); }

    // 손가락 조작
    const local = (e) => { const r = box.getBoundingClientRect(), k = ctx.scale(); return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
    const pts = new Map(); let last = null, moved = false, vel = [], lastTap = null, multi = false, downAt = 0;
    const center = () => { const a = [...pts.values()]; return a.length === 1 ? [a[0][0], a[0][1], 0] : [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2, Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1])]; };
    function down(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stop(); pts.set(e.pointerId, local(e));
      if (pts.size === 1) { moved = false; multi = false; vel = []; downAt = performance.now(); }
      if (pts.size === 2) multi = true;
      last = center(); box.classList.add('moving');
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    function move(e) {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, local(e));
      const c = center();
      if (pts.size >= 2 && last[2]) zoomAt(c[0], c[1], c[2] / last[2], true);
      const dx = c[0] - last[0], dy = c[1] - last[1];
      cam.tx += dx; cam.ty += dy;
      vel.push({ t: performance.now(), dx, dy }); if (vel.length > 6) vel.shift();
      if (!moved) { const st = vel.reduce((a, v) => a + Math.abs(v.dx) + Math.abs(v.dy), 0); if (st > 6 || pts.size > 1) moved = true; }
      clampCam(true); apply(); last = c;
    }
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size) { last = center(); return; }
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      box.classList.remove('moving');
      const now = performance.now(), [lx, ly] = last;
      if (!moved) {
        if (multi && now - downAt < 300) { zoomAnim(w / 2, h / 2, 0.5); return; }       // 두 손가락 톡: 축소
        if (lastTap && now - lastTap.t < 320 && Math.hypot(lx - lastTap.x, ly - lastTap.y) < 30) { lastTap = null; zoomAnim(lx, ly, 2); return; } // 두 번 톡: 확대
        lastTap = { t: now, x: lx, y: ly }; return;
      }
      lastTap = null;
      const recent = vel.filter((v) => now - v.t < 90);
      const span = recent.length > 1 ? now - recent[0].t : 0;
      let vx = span ? recent.reduce((a, v) => a + v.dx, 0) / span : 0, vy = span ? recent.reduce((a, v) => a + v.dy, 0) / span : 0;
      if (cam.s < sMin || cam.s > sMax) { settle(); return; }
      if (Math.hypot(vx, vy) < 0.15) { settle(); return; }
      // 관성 이동
      stop(); box.classList.add('moving'); let tPrev = performance.now();
      const f = (t) => {
        const dt = Math.min(32, t - tPrev); tPrev = t;
        const bx0 = cam.tx, by0 = cam.ty; cam.tx += vx * dt; cam.ty += vy * dt; clampCam(false);
        if (cam.tx === bx0) vx = 0; if (cam.ty === by0) vy = 0;
        const d = Math.pow(0.94, dt / 16); vx *= d; vy *= d; apply();
        if (Math.hypot(vx, vy) > 0.02) anim = requestAnimationFrame(f); else { anim = 0; box.classList.remove('moving'); }
      };
      anim = requestAnimationFrame(f);
    }
    box.addEventListener('pointerdown', down);
    box.addEventListener('click', (e) => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; return; } if (!e.target.closest('.tap')) e.stopPropagation(); }, true);
    box.addEventListener('wheel', (e) => {
      e.preventDefault(); stop();
      const [lx, ly] = local(e);
      // 지도 앱처럼 휠·트랙패드 스크롤·핀치는 모두 확대·축소(이동은 끌기로)
      const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
      zoomAt(lx, ly, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022)));
      clampCam(false); apply();
    }, { passive: false });
    box.addEventListener('dblclick', (e) => e.preventDefault());

    clampCam(false); apply();
    ctx.map = { flyTo, box, top: by, h, apply, urls: () => initialUrls() };
    function initialUrls() {
      const need = cam.s * ctx.scale() * (window.devicePixelRatio || 1);
      let li = levels.findIndex((L) => L.ls >= need * 0.92); if (li < 0) li = levels.length - 1;
      const TN = T / levels[li].ls, out = ['map/preview.webp'];
      for (let j = Math.max(0, Math.floor(-cam.ty / cam.s / TN)); j * TN <= (h - cam.ty) / cam.s && j * TN < MH; j++)
        for (let i = Math.max(0, Math.floor(-cam.tx / cam.s / TN)); i * TN <= (w - cam.tx) / cam.s && i * TN < MW; i++) out.push('map/' + li + '/' + i + '_' + j + '.webp');
      return out;
    }
    return box;
  }
  // 아직 만들지 않은 화면의 첫 지도 타일 주소(미리 불러오기용)
  function mapUrls(id) {
    const M = MAPS && MAPS.S[id]; if (!M) return [];
    const it = S[id].c.find((c) => c.k === 's' && !c.fl); if (!it) return [];
    const [, , w, h] = it.b, T = MAPS.tile, s = M.s0;
    const need = s * scale * (window.devicePixelRatio || 1);
    let li = MAPS.levels.findIndex((ls) => ls >= need * 0.92); if (li < 0) li = MAPS.levels.length - 1;
    const TN = T / MAPS.levels[li], out = ['map/preview.webp'];
    for (const m of M.mk) out.push('map/mk/' + m.f + (m.f === 'me' ? '.webp' : '.svg'));
    for (let j = Math.max(0, Math.floor(-M.iy / s / TN)); j * TN <= (h - M.iy) / s && j * TN < MAPS.H; j++)
      for (let i = Math.max(0, Math.floor(-M.ix / s / TN)); i * TN <= (w - M.ix) / s && i * TN < MAPS.W; i++) out.push('map/' + li + '/' + i + '_' + j + '.webp');
    return out;
  }

  function buildScreen(id) {
    const sc = S[id];
    const binds = { texts: [], vis: [] };
    const ctx = { afterMount: [], scale: () => scale, timers: [], sid: id, map: null };
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
    if (clicks.length) { const hs = el('div', 'hot full', { left: 0, top: 0, width: px(sc.w), height: px(sc.h) }); attachReactions(hs, clicks, ctx); root.insertBefore(hs, root.firstChild.nextSibling); }
    return { id, root, binds, ctx, timeouts };
  }
  function flashHotspots(root) {
    root.classList.remove('flash'); void root.offsetWidth; root.classList.add('flash');
  }
  function refresh(scr) {
    for (const t of scr.binds.texts) { const v = fmt(vars[t.v]); if (t.e.textContent !== v) t.e.textContent = v; }
    for (const b of scr.binds.vis) b.e.style.display = vars[b.v] ? '' : 'none';
  }

  // ---------- 이미지 미리 불러오기 ----------
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const loaded = new Map();
  function load(url) {
    let p = loaded.get(url);
    if (!p) {
      p = new Promise((res) => {
        const i = new Image(); i.decoding = 'async';
        i.onload = () => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()).then(() => res(true));
        i.onerror = () => res(false);
        i.src = url;
      });
      loaded.set(url, p);
    }
    return p;
  }
  function screenUrls(id) {
    const sc = S[id], out = []; if (!sc) return out;
    const add = (k) => { const m = IMG[k]; if (m) out.push('img/' + m.f); };
    sc.L.forEach(add);
    const isMap = MAPS && MAPS.S[id];
    const walk = (c) => { for (const k of c || []) { if (k.k === 's' && !k.fl && isMap) continue; if (k.img) add(k.img); if (k.img2) add(k.img2); walk(k.c); } };
    walk(sc.c);
    return out.concat(mapUrls(id));
  }
  const preload = (id) => Promise.all(screenUrls(id).map(load));
  function destsOf(id) {
    const out = new Set(), sc = S[id]; if (!sc) return out;
    const acts = (list) => { for (const a of list || []) { if (a.d) out.add(a.d); (a.cb || []).forEach((b) => acts(b.a)); } };
    const refs = (r) => (r || []).forEach((k) => A[k] && acts(A[k].a));
    refs(sc.r);
    const walk = (c) => { for (const k of c || []) { refs(k.r); walk(k.c); } };
    walk(sc.c);
    return out;
  }
  // 지금 화면에서 갈 수 있는 화면을 쉬는 시간에 미리 받아 둔다
  function prefetchAround(id) {
    const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
    idle(() => { for (const d of destsOf(id)) screenUrls(d).forEach(load); });
  }

  // ---------- 스켈레톤 ----------
  function skeleton(id) {
    const sc = S[id];
    const root = el('div', 'screen skel', { width: px(sc.w), height: px(sc.h) });
    if (LQIP[id]) { const b = el('div', 'skel-bg'); b.style.backgroundImage = 'url(' + LQIP[id] + ')'; root.appendChild(b); }
    root.appendChild(el('div', 'skel-veil'));
    const boxes = [];
    const items = sc.c.slice();
    // 세로 스크롤 화면은 그 안의 카드 블록 자리를 그린다
    for (const c of sc.c) if (c.k === 's' && c.fl) for (const f of c.fl) if (f[0] < c.b[3] && f[1] > 16) items.push({ k: 'h', b: [c.b[0] + 4, c.b[1] + f[0], c.b[2] - 8, Math.min(f[1], c.b[3] - f[0])] });
    for (const c of items) {
      const [x, y, w, h] = c.b;
      if (!['h', 't', 'v'].includes(c.k) && !(c.k === 's' && !c.fl) || w < 24 || h < 12 || w * h > sc.w * sc.h * 0.55) continue;
      if (boxes.some((b) => x >= b[0] - 2 && y >= b[1] - 2 && x + w <= b[0] + b[2] + 2 && y + h <= b[1] + b[3] + 2)) continue;
      boxes.push(c.b);
      root.appendChild(el('div', 'skel-blk', { left: px(x), top: px(y), width: px(w), height: px(h), borderRadius: px(Math.min(16, h / 2)) }));
    }
    return root;
  }

  // ---------- 탐색 ----------
  const stage = document.getElementById('stage');
  const device = document.getElementById('device');
  let scale = 1;
  let current = null; const hist = []; const overlays = [];
  function show(id, tr, skel) {
    if (!S[id]) return;
    const next = buildScreen(id);
    refresh(next);
    device.appendChild(next.root);
    next.ctx.afterMount.forEach((f) => f());
    const prev = current;
    current = next;
    const gone = [prev && prev.root, skel].filter(Boolean);
    if (prev) prev.timers && prev.timers.forEach(clearTimeout);
    const dur = prev ? (tr ? Math.min(400, Math.max(120, tr[1] * 1000)) : 0) : 0;
    if (dur) {
      next.root.style.opacity = 0; next.root.style.transition = 'opacity ' + dur + 'ms ease';
      requestAnimationFrame(() => { next.root.style.opacity = 1; });
      setTimeout(() => gone.forEach((g) => g.remove()), dur + 30);
    } else gone.forEach((g) => g.remove());
    startTimers(next);
    keepAwake(/^S05/.test(S[id].n));
    prefetchAround(id);
  }
  // 이미지가 220ms 안에 준비되면 바로 넘어가고, 늦으면 그 화면의 스켈레톤을 먼저 보여 준다
  let navSeq = 0;
  async function go(id, tr) {
    const seq = ++navSeq;
    const p = preload(id);
    const fast = await Promise.race([p.then(() => true), wait(220).then(() => false)]);
    if (seq !== navSeq) return;
    if (fast) { show(id, tr); return; }
    const sk = skeleton(id);
    sk.style.opacity = 0; sk.style.transition = 'opacity 150ms ease';
    device.appendChild(sk); requestAnimationFrame(() => { sk.style.opacity = 1; });
    const t0 = performance.now();
    await Promise.race([p, wait(12000)]);
    const spent = performance.now() - t0; if (spent < 380) await wait(380 - spent);
    if (seq !== navSeq) { sk.remove(); return; }
    show(id, ['DISSOLVE', 0.22], sk);
  }
  function startTimers(scr) {
    scr.timers = scr.timeouts.map((a) => setTimeout(() => { if (current === scr || overlays.includes(scr)) run(a.a, scr); }, (a.tg.ms || 0) * 1000));
  }
  async function openOverlay(id) {
    await Promise.race([preload(id), wait(1500)]);
    const o = buildScreen(id); refresh(o);
    const wrap = el('div', 'overlay');
    wrap.appendChild(o.root); o.wrap = wrap;
    wrap.style.opacity = 0; device.appendChild(wrap); requestAnimationFrame(() => { wrap.style.opacity = 1; });
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
  // 지도 화면끼리 오갈 때(+ − 버튼, 시설 핀)는 지도를 목적지 배율·위치로 부드럽게 옮긴 뒤 화면을 바꾼다
  function mapTransition(dest) {
    const m = current && current.ctx.map, dm = MAPS && MAPS.S[dest];
    if (!m || !dm || overlays.length) return null;
    const it = S[dest].c.find((c) => c.k === 's' && !c.fl);
    if (!it || Math.abs(it.b[1] - m.top) > 1) return null;
    preload(dest);
    return m.flyTo({ s: dm.s0, tx: dm.ix, ty: dm.iy }, 420);
  }
  function navigate(dest, tr) {
    if (current) hist.push(current.id);
    window.history.pushState({ navi: hist.length }, '');
    const fly = mapTransition(dest);
    if (fly) fly.then(() => go(dest, ['DISSOLVE', 0.15])); else go(dest, tr);
  }
  let ignorePop = 0;
  function back(fromBrowser) {
    if (overlays.length) { closeOverlay(); if (fromBrowser) window.history.pushState({ navi: hist.length }, ''); return; }
    if (!hist.length) return;
    const dest = hist.pop();
    if (!fromBrowser) { ignorePop++; window.history.back(); }
    const fly = mapTransition(dest);
    if (fly) fly.then(() => go(dest, ['DISSOLVE', 0.15])); else go(dest, ['DISSOLVE', 0.2]);
  }
  window.addEventListener('popstate', () => { if (ignorePop) { ignorePop--; return; } back(true); });
  function run(actions, from) {
    for (const a of actions || []) {
      if (a.t === 'SET_VARIABLE') vars[a.v] = ev(a.val);
      else if (a.t === 'CONDITIONAL') {
        for (const b of a.cb) { if (b.c == null || ev(b.c)) { run(b.a, from); break; } }
      } else if (a.t === 'NODE' && (a.n === 'NAVIGATE' || a.n === 'SWAP') && a.d) {
        if (a.n === 'SWAP' && overlays.length) { closeOverlay(); openOverlay(a.d); continue; }
        while (overlays.length) closeOverlay();
        navigate(a.d, a.tr);
      } else if (a.t === 'NODE' && a.n === 'OVERLAY' && a.d) openOverlay(a.d);
      else if (a.t === 'BACK') back(false);
      else if (a.t === 'CLOSE') closeOverlay(from);
      else if (a.t === 'URL' && a.url) window.open(a.url, '_blank');
    }
    if (current) refresh(current);
    overlays.forEach(refresh);
  }

  // ---------- 산책 안내 중 화면 꺼짐 방지 ----------
  let wakeLock = null, wantAwake = false;
  async function keepAwake(on) {
    wantAwake = on;
    try {
      if (on && !wakeLock && 'wakeLock' in navigator) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { wakeLock = null; }
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && wantAwake) keepAwake(true); });

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
  document.getElementById('restart').addEventListener('click', () => { resetVars(); hist.length = 0; while (overlays.length) closeOverlay(); go(D.START, ['DISSOLVE', 0.2]); });

  // 확인용: 콘솔에서 NAVI.go('화면 이름')
  window.NAVI = { go: (q) => { const id = S[q] ? q : Object.keys(S).find((k) => S[k].n === q); if (id) go(id, ['DISSOLVE', 0.2]); return id; }, cur: () => current && S[current.id].n, vars };

  // ---------- 시작: 스플래시에서 첫 화면·글꼴을 준비 ----------
  resetVars(); fit();
  (async () => {
    const splash = document.getElementById('splash'), bar = splash && splash.querySelector('.bar i');
    const urls = screenUrls(D.START);
    let done = 0; const total = urls.length + 1;
    const tick = () => { done++; if (bar) bar.style.width = Math.round((done / total) * 100) + '%'; };
    const t0 = performance.now();
    await Promise.race([Promise.all([...urls.map((u) => load(u).then(tick)), document.fonts.ready.then(tick)]), wait(8000)]);
    const spent = performance.now() - t0; if (spent < 700) await wait(700 - spent);
    show(D.START);
    window.history.replaceState({ navi: 0 }, '');
    if (splash) { splash.classList.add('hide'); setTimeout(() => splash.remove(), 400); }
  })();

  // ---------- 앱처럼: 눌림 진동, 화면 확대 막기, 오프라인·새 버전 알림 ----------
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.hot,.tap') && navigator.vibrate) navigator.vibrate(8); }, true);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('touchmove', (e) => { if (!e.target.closest('.scr,.map')) e.preventDefault(); }, { passive: false });
  const toast = document.getElementById('toast');
  function say(msg, action) {
    if (!toast) return;
    toast.textContent = msg; toast.onclick = action || null; toast.classList.toggle('act', !!action); toast.classList.add('on');
    clearTimeout(say.t); if (!action) say.t = setTimeout(() => toast.classList.remove('on'), 3200);
  }
  window.addEventListener('offline', () => say('인터넷 연결이 끊겼어요. 본 화면은 그대로 볼 수 있어요.'));
  window.addEventListener('online', () => say('다시 연결됐어요.'));
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then((reg) => {
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw && nw.addEventListener('statechange', () => {
          if (nw.state === 'activated' && hadController) say('새 버전이 올라왔어요. 눌러서 새로 고침', () => location.reload());
        });
      });
    }).catch(() => {});
  }
})();
