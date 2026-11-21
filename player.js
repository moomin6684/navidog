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
    if (av === 'C' && ar !== 'W') { st.display = 'flex'; st.alignItems = 'center'; st.height = px(h); if (ah === 'C') st.justifyContent = 'center'; }
    // 오늘의 코스 개수 배지: 그림 속 배지(30pt)를 덮는 큰 배지(36pt)에 흰 숫자
    if (it.s === 'nd_cnt') {
      const d = 36, cx = x + w / 2, cy = y + h / 2 - 1.5;
      Object.assign(st, { left: px(cx - d / 2), top: px(cy - d / 2), width: px(d), height: px(d), minHeight: px(d), borderRadius: '50%', transform: 'none',
        background: '#1ea94a', boxShadow: `inset 0 0 0 ${px(1.2)} #bcfed1, 0 ${px(2.5)} 0 #167832`, color: '#fff', fontSize: px(17), lineHeight: '1', paddingTop: px(1) });
      t.classList.add('cnt');
    }
    binds.texts.push({ e: t, v: it.v });
    return t;
  }
  function hotspot(it, ctx) {
    const [x, y, w, h] = it.b;
    if (MAPS && MAPS.S[ctx.sid] && ZOOM_BTN[x + ',' + y] && w === 44 && h === 44) return zoomButton(it, ctx, ZOOM_BTN[x + ',' + y]);
    const e = el('div', 'hot', { left: px(x), top: px(y), width: px(w), height: px(h) });
    attachReactions(e, it.r, ctx);
    if (isLocate(it.r)) {
      e.classList.add('gps'); e.innerHTML = GPS_SVG; ctx.gps = e;
      e.addEventListener('click', () => { if (ctx.map) ctx.map.locate(); });
    }
    return e;
  }
  // 지도 + − 버튼: 「크게 보기」·「도시 전체」 화면으로 넘어가면(화면을 통째로 다시 그려 새로고침처럼 보였다) 대신 지금 지도를 그 자리에서 확대·축소한다.
  // 끝까지 확대·축소하면 그 버튼은 원래 디자인의 회색 그림으로 바뀌고, 더 누르면 지도가 살짝 튕기기만 한다.
  const ZOOM_BTN = { '328,461': 1, '328,506': -1 };
  // 「크게 보기」·「도시 전체」 화면은 눌리는 쪽 버튼 하나만 있으므로 반대쪽 버튼도 채워 넣는다
  if (MAPS) for (const sid of Object.keys(MAPS.S)) {
    const sc = S[sid]; if (!sc) continue;
    const has = (k) => sc.c.some((c) => c.k === 'h' && c.b[0] + ',' + c.b[1] === k && c.b[2] === 44);
    const ks = Object.keys(ZOOM_BTN);
    if (ks.some(has)) for (const k of ks) if (!has(k)) { const [x, y] = k.split(',').map(Number); sc.c.push({ k: 'h', b: [x, y, 44, 44], r: [] }); }
  }
  function zoomButton(it, ctx, dir) {
    const [x, y, w, h] = it.b, k = dir > 0 ? 'plus' : 'minus';
    const e = el('div', 'hot zoom', { left: px(x), top: px(y), width: px(w), height: px(h) });
    const on = el('img', 'zg', { left: px(10), top: px(9), width: px(24), height: px(24) }), off = el('img', 'zg off', { left: px(10), top: px(9), width: px(24), height: px(24) });
    on.src = 'img/zoom/' + k + '-on.webp'; off.src = 'img/zoom/' + k + '-off.webp';
    on.alt = off.alt = ''; on.draggable = off.draggable = false;
    e.append(on, off);
    e.addEventListener('click', (ev2) => { ev2.stopPropagation(); if (ctx.map) ctx.map.zoomStep(dir); });
    (ctx.zoomBtns || (ctx.zoomBtns = [])).push({ e, dir });
    ctx.afterMount.push(() => { if (ctx.map) ctx.map.apply(); });
    return e;
  }

  // 「현재 위치」 알림을 띄우는 버튼 = 지도의 현재 위치(GPS) 버튼
  const isLocate = (refs) => (refs || []).some((k) => A[k] && A[k].a.some((a) => a.t === 'NODE' && a.n === 'OVERLAY' && S[a.d] && /^Toast · 현재 위치/.test(S[a.d].n)));

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
      if (!down || fired || !drag.length || ctx.swipe) return;
      if (Math.hypot(ev2.clientX - sx, ev2.clientY - sy) > 14 * ctx.scale()) { fired = true; drag.forEach((a) => run(a.a)); }
    });
    e.addEventListener('pointerup', () => { down = false; });
    e.addEventListener('click', (ev2) => {
      ev2.stopPropagation();
      if (fired) return;
      tapAt = devRect(e);
      if (click.length) click.forEach((a) => run(a.a));
      else if (drag.length) drag.forEach((a) => run(a.a)); // 데스크톱 클릭으로도 넘길 수 있게
      tapAt = null;
    });
  }

  // 항목 목록을 컨테이너에 그린다
  function renderItems(items, parent, binds, ctx, cw) {
    // 이미지 조각(표시 전환·스크롤)을 먼저, 글자와 누르는 영역은 그 위에
    const rank = (it) => (it.k === 'a' ? -1 : it.k === 'v' || it.k === 's' ? 0 : 1);
    items = items.map((it, i) => [it, i]).sort((a, b) => rank(a[0]) - rank(b[0]) || a[1] - b[1]).map((x) => x[0]);
    for (const it of items) {
      if (it.k === 'a') parent.appendChild(dogAnim(it));
      else if (it.k === 't') parent.appendChild(textNode(it, binds, cw));
      else if (it.k === 'h') parent.appendChild(hotspot(it, ctx));
      else if (it.k === 'v') parent.appendChild(visBox(it, binds, ctx));
      else if (it.k === 's') parent.appendChild(scrollBox(it, binds, ctx));
    }
  }
  // 강아지 루프 애니메이션: 강아지를 지운 바탕(plate) 위에 초당 12프레임 그림띠를 넘긴다
  function dogAnim(it) {
    const M = (D.ANIM || {})[it.p];
    if (!M) return el('div');
    const [x, y, w, h] = it.b;
    const box = el('div', 'dog', { left: px(x), top: px(y), width: px(w), height: px(h) });
    const pl = el('img', 'dog-pl'); pl.src = 'img/anim/plate-' + it.pl + '.webp'; pl.alt = ''; pl.draggable = false;
    // sb: 그림띠 상자가 바탕 상자와 다를 때(배치에서 그림이 확대된 포즈)
    const [sx, sy, sw, sh] = it.sb || it.b;
    const win = el('div', 'dog-win', { left: px(sx - x), top: px(sy - y), width: px(sw), height: px(sh) });
    // 넓은 띠를 CSS 이동 애니메이션으로 밀면 일부 휴대폰(사파리)에서 그림이 멈추거나 사라진다 → 칸 크기 그대로 두고 그림 위치만 프레임마다 바꾼다
    const strip = el('div', 'dog-strip', { width: px(sw), backgroundImage: 'url(img/anim/' + M.file + ')', backgroundSize: (M.frames * 100) + '% 100%' });
    strip.dataset.n = M.frames; strip.dataset.fps = M.fps; strip.dataset.w = sw;
    win.appendChild(strip);
    box.append(pl, win);
    return box;
  }
  // 화면에 있는 모든 강아지 그림띠를 한 시계로 넘긴다(복제된 전환용 화면 포함)
  const dogStrips = document.getElementsByClassName('dog-strip');
  (function dogTick(now) {
    for (const s of dogStrips) {
      const n = +s.dataset.n, f = Math.floor(now / 1000 * s.dataset.fps) % n;
      if (s.dogF !== f) { s.dogF = f; s.style.backgroundPosition = (-f * s.dataset.w) + 'px 0'; }
    }
    requestAnimationFrame(dogTick);
  })(performance.now());
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
  // 한 손가락 확대(두 번 톡 후 위아래로 끌기) 빠르기: 140pt 끌면 2배(예전 0.012는 58pt에 2배라 너무 빨랐다)
  const QZ_RATE = 0.005;
  // 내 위치(경로 출발점 = 우리 집 앞). 원의 가운데가 출발점에 오도록 그린 핀이다.
  const ME = { f: 'me2', t: 's', cx: 2100, cy: 2580, w: 64, h: 64 };
  const marksOf = (M) => (M.mk.some((m) => /^me/.test(m.f)) ? M.mk : M.mk.concat([ME]));
  const GPS_SVG = '<svg viewBox="0 0 24 24" width="24" height="24"><g fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><path d="M12 1.6v3.4M12 19v3.4M1.6 12h3.4M19 12h3.4"/></g><circle class="gps-dot" cx="12" cy="12" r="2.7" fill="currentColor"/></svg>';
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
    const halo = el('div', 'me-halo'); halo.appendChild(el('i'));
    const marks = marksOf(M).map((m) => {
      if (/^me/.test(m.f)) ov.appendChild(halo);
      const e = el('img', 'mk'); e.alt = ''; e.draggable = false; e.decoding = 'async';
      e.src = 'map/mk/' + m.f + (/^me/.test(m.f) ? '.webp' : '.svg');
      if (m.t === 'r') e.classList.add('route');
      ov.appendChild(e);
      return Object.assign({ e }, m);
    });
    const me = marks.find((m) => /^me/.test(m.f));
    const placeOrder = marks.filter((m) => !m.target).concat(marks.filter((m) => m.target));
    // 포커스 링은 그 시설 핀의 둥근 머리에 맞춘다(핀은 확대해도 일정 크기 이상 커지지 않으므로)
    for (const m of marks) if (m.f === 'focus') {
      let bd = 1e9; for (const p of marks) if (p.pin) { const d = Math.hypot(p.x + p.w / 2 - m.cx, p.y + p.w / 2 - m.cy); if (d < bd) { bd = d; m.target = p; } }
      if (bd > 60) m.target = null;
    }
    // 지도 안의 누르는 곳(시설 핀)은 그 핀에 붙인다
    // 같은 경로의 「크게 보기」·「도시 전체」 화면에만 있던 시설 핀도 여기서 누를 수 있게 한다(+ − 버튼이 이제 화면을 바꾸지 않으므로)
    const base = (n) => n.replace(/ · (크게 보기|도시 전체)$/, '');
    const famIds = [ctx.sid].concat(Object.keys(MAPS.S).filter((k) => k !== ctx.sid && S[k] && base(S[k].n) === base(S[ctx.sid].n)));
    for (const sid of famIds) {
      const it2 = sid === ctx.sid ? it : S[sid].c.find((c) => c.k === 's' && !c.fl), M2 = MAPS.S[sid];
      if (!it2 || it2.b[1] !== it.b[1] || it2.b[3] !== it.b[3]) continue;
      for (const c of it2.c || []) {
        if (c.k !== 'h') continue;
        const mx = (c.b[0] + it2.cb[0] + c.b[2] / 2 - M2.ix) / M2.s0, my = (c.b[1] + it2.cb[1] + c.b[3] / 2 - M2.iy) / M2.s0;
        let best = null, bd = 1e9;
        for (const m of marks) if (m.t === 'm') { const d = Math.hypot(m.x + m.w / 2 - mx, m.y + m.h / 2 - my); if (d < bd) { bd = d; best = m; } }
        if (best && bd < 80 && !best.e.classList.contains('tap')) { best.e.classList.add('tap'); attachReactions(best.e, c.r, ctx); }
      }
    }
    function placeMarks() {
      const { s, tx, ty } = cam, ms = Math.min(s, MK_CAP);
      for (const m of placeOrder) {
        let l, t, mw, mh;
        if (m.t === 'r') { l = tx + m.x * s; t = ty + m.y * s; mw = m.w * s; mh = m.h * s; }
        else if (m.t === 's') {
          mw = m.w; mh = m.h;
          const p = m.target, cx = p ? p.pl + (p.w / 2) * p.ms : tx + m.cx * s, cy = p ? p.pt + (p.w / 2) * p.ms : ty + m.cy * s;
          l = cx - mw / 2; t = cy - mh / 2;
        }
        else {
          const ax = m.x + m.w / 2, ay = m.pin ? m.y + m.h : m.y + m.h / 2;
          mw = m.w * ms; mh = m.h * ms; l = tx + ax * s - (ax - m.x) * ms; t = ty + ay * s - (ay - m.y) * ms;
          m.pl = l; m.pt = t; m.ms = ms;
        }
        m.e.style.transform = 'translate3d(' + l + 'px,' + t + 'px,0)'; m.e.style.width = px(mw); m.e.style.height = px(mh);
        if (m === me) halo.style.transform = 'translate3d(' + (l + mw / 2) + 'px,' + (t + mh / 2) + 'px,0)';
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
    let zEdge = '';
    function apply() {
      world.style.transform = 'translate3d(' + cam.tx + 'px,' + cam.ty + 'px,0) scale(' + cam.s + ')';
      placeMarks(); needTiles();
      const edge = (cam.s >= sMax * 0.999 ? '+' : '') + (cam.s <= sMin * 1.001 ? '-' : '');
      const nb = (ctx.zoomBtns || []).length;
      if (edge + nb !== zEdge) { zEdge = edge + nb; for (const b of ctx.zoomBtns || []) b.e.classList.toggle('off', edge.includes(b.dir > 0 ? '+' : '-')); }
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
    // + − 버튼: 지도 가운데를 기준으로 두 배씩. 이미 끝이면 그쪽으로 살짝 밀렸다 돌아온다
    function zoomStep(dir) {
      const atEdge = dir > 0 ? cam.s >= sMax * 0.999 : cam.s <= sMin * 1.001;
      if (!atEdge) { zoomAnim(w / 2, h / 2, dir > 0 ? 2 : 0.5, 300); return; }
      const c0 = { ...cam }, f = dir > 0 ? 1.06 : 0.94;
      animate(260, (k) => { const s2 = c0.s * Math.pow(f, Math.sin(Math.PI * k)); cam.s = s2; cam.tx = w / 2 - (w / 2 - c0.tx) * (s2 / c0.s); cam.ty = h / 2 - (h / 2 - c0.ty) * (s2 / c0.s); clampCam(true); }, () => { Object.assign(cam, c0); apply(); });
    }
    function settle() { const c = { ...cam }; clampCam(false); if (Math.abs(c.s - cam.s) > 1e-4) { const t = { ...cam }; Object.assign(cam, c); flyTo(t, 220); } else apply(); }

    // 손가락 조작
    const local = (e) => { const r = box.getBoundingClientRect(), k = ctx.scale(); return [(e.clientX - r.left) / k, (e.clientY - r.top) / k]; };
    const pts = new Map(); let last = null, moved = false, vel = [], lastTap = null, multi = false, downAt = 0;
    // 한 손가락 확대: 두 번째로 누른 채 아래로 끌면 확대, 위로 끌면 축소(지도 앱과 같은 방향)
    let qz = null;
    const center = () => { const a = [...pts.values()]; return a.length === 1 ? [a[0][0], a[0][1], 0] : [(a[0][0] + a[1][0]) / 2, (a[0][1] + a[1][1]) / 2, Math.hypot(a[0][0] - a[1][0], a[0][1] - a[1][1])]; };
    function down(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      stop(); pts.set(e.pointerId, local(e));
      if (pts.size === 1) {
        moved = false; multi = false; vel = []; downAt = performance.now(); qz = null;
        const [x0, y0] = pts.get(e.pointerId);
        if (lastTap && downAt - lastTap.t < 320 && Math.hypot(x0 - lastTap.x, y0 - lastTap.y) < 40) { qz = { x: lastTap.x, y: lastTap.y, y0, s0: cam.s, tx0: cam.tx, ty0: cam.ty, on: false }; lastTap = null; }
      }
      if (pts.size === 2) { multi = true; qz = null; }
      last = center(); box.classList.add('moving');
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }
    function move(e) {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, local(e));
      if (qz) {
        const dy = pts.get(e.pointerId)[1] - qz.y0;
        if (!qz.on && Math.abs(dy) < 6) return;
        if (!qz.on) { qz.on = true; moved = true; unfollow(); }
        const s2 = Math.min(sMax * 1.25, Math.max(sMin * 0.8, qz.s0 * Math.exp(dy * QZ_RATE)));
        cam.s = s2; cam.tx = qz.x - (qz.x - qz.tx0) * (s2 / qz.s0); cam.ty = qz.y - (qz.y - qz.ty0) * (s2 / qz.s0);
        clampCam(true); apply(); return;
      }
      const c = center();
      if (pts.size >= 2 && last[2]) zoomAt(c[0], c[1], c[2] / last[2], true);
      const dx = c[0] - last[0], dy = c[1] - last[1];
      cam.tx += dx; cam.ty += dy;
      vel.push({ t: performance.now(), dx, dy }); if (vel.length > 6) vel.shift();
      if (!moved) { const st = vel.reduce((a, v) => a + Math.abs(v.dx) + Math.abs(v.dy), 0); if (st > 6 || pts.size > 1) { moved = true; unfollow(); } }
      clampCam(true); apply(); last = c;
    }
    function up(e) {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (pts.size) { last = center(); return; }
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      box.classList.remove('moving');
      const now = performance.now(), [lx, ly] = last;
      if (qz) { const q = qz; qz = null; if (q.on) { settle(); return; } unfollow(); zoomAnim(q.x, q.y, 2); return; } // 두 번 톡(끌지 않음): 확대
      if (!moved) {
        if (multi && now - downAt < 300) { zoomAnim(w / 2, h / 2, 0.5); return; }       // 두 손가락 톡: 축소
        if (lastTap && now - lastTap.t < 320 && Math.hypot(lx - lastTap.x, ly - lastTap.y) < 30) { lastTap = null; unfollow(); zoomAnim(lx, ly, 2); return; } // 두 번 톡: 확대
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
      e.preventDefault(); stop(); unfollow();
      const [lx, ly] = local(e);
      // 지도 앱처럼 휠·트랙패드 스크롤·핀치는 모두 확대·축소(이동은 끌기로)
      const dy = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
      zoomAt(lx, ly, Math.exp(-dy * (e.ctrlKey ? 0.01 : 0.0022)));
      clampCam(false); apply();
    }, { passive: false });
    box.addEventListener('dblclick', (e) => e.preventDefault());

    // 현재 위치 버튼: 내 위치가 지도 가운데로 오도록 부드럽게 옮기고, 끌기 전까지 따라가기 상태를 보여 준다
    let following = false;
    function unfollow() { if (!following) return; following = false; box.classList.remove('follow'); if (ctx.gps) ctx.gps.classList.remove('on'); }
    function locate() {
      if (!me) return;
      const s = Math.min(sMax, Math.max(cam.s, M.s0));
      const c2 = { s, tx: w / 2 - me.cx * s, ty: h / 2 - me.cy * s };
      const far = Math.hypot((w / 2 - cam.tx) / cam.s - me.cx, (h / 2 - cam.ty) / cam.s - me.cy) * cam.s;
      following = true; box.classList.add('follow'); if (ctx.gps) ctx.gps.classList.add('on');
      halo.classList.remove('ping'); void halo.offsetWidth;
      flyTo(c2, Math.min(720, 380 + far * 0.6)).then(() => { if (following) halo.classList.add('ping'); });
    }

    clampCam(false); apply();
    ctx.map = { flyTo, box, top: by, h, apply, locate, zoomStep, urls: () => initialUrls() };
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
    for (const m of marksOf(M)) out.push('map/mk/' + m.f + (/^me/.test(m.f) ? '.webp' : '.svg'));
    for (let j = Math.max(0, Math.floor(-M.iy / s / TN)); j * TN <= (h - M.iy) / s && j * TN < MAPS.H; j++)
      for (let i = Math.max(0, Math.floor(-M.ix / s / TN)); i * TN <= (w - M.ix) / s && i * TN < MAPS.W; i++) out.push('map/' + li + '/' + i + '_' + j + '.webp');
    return out;
  }

  // ---------- 하단 시트: 평소 거리 입력 ----------
  // 「S00 · 거리 입력」·「S00 · 입력 확인」은 앞 화면 위로 아래에서 올라오는 시트로 보여 준다.
  // 원래 화면 그림에서 제목·입력칸~키패드·저장 버튼 띠를 잘라 시트 안에 다시 배치한다([원래 y0, y1, 시트 안 y]).
  const SHEET_IDS = new Set(['616:9009', '616:9043']);
  const isSheet = (id) => SHEET_IDS.has(id);
  const SHEET_TOP = 170, SHEET_SEG = [[134, 172, 30], [186, 676, 72], [748, 852, 578]];
  const CLOSE_SVG = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  function buildSheet(id) {
    const sc = S[id];
    const binds = { texts: [], vis: [] };
    const ctx = { afterMount: [], scale: () => scale, timers: [], sid: id, map: null };
    const root = el('div', 'screen sheet-scr', { width: px(sc.w), height: px(sc.h) });
    const under = el('div', 'sheet-under'), dim = el('div', 'sheet-dim hot full');
    const panel = el('div', 'sheet', { top: px(SHEET_TOP), height: px(sc.h - SHEET_TOP) });
    for (const [a, b, d] of SHEET_SEG) {
      const seg = el('div', 'sheet-seg', { top: px(d), height: px(b - a) });
      seg.appendChild(img(sc.L[0], { top: px(-a) }));
      panel.appendChild(seg);
    }
    panel.appendChild(el('i', 'sheet-grab'));
    const at = (y) => { for (const [a, b, d] of SHEET_SEG) if (y >= a && y < b) return y - a + d; return null; };
    const items = []; let closeRefs = null;
    for (const c of sc.c) {
      const y = at(c.b[1]);
      if (y != null) items.push(Object.assign({}, c, { b: [c.b[0], y, c.b[2], c.b[3]] }));
      else if (c.k === 'h' && c.b[1] < 120) closeRefs = c.r;            // 뒤로(‹) 버튼 → 시트 닫기
    }
    renderItems(items, panel, binds, ctx, sc.w);
    const x = el('div', 'hot sheet-close', { left: px(333), top: px(27), width: px(44), height: px(44) });
    x.innerHTML = '<span>' + CLOSE_SVG + '</span>'; x.setAttribute('aria-label', '닫기');
    attachReactions(x, closeRefs, ctx); attachReactions(dim, closeRefs, ctx);
    panel.appendChild(x);
    root.append(under, dim, panel);
    const scr = { id, root, binds, ctx, timeouts: [], sheet: { under, dim, panel, dy: 0 } };
    enableSheetDrag(scr, closeRefs);
    return scr;
  }
  // 시트 윗부분(손잡이·제목)을 아래로 끌면 따라 내려오고, 충분히 끌면 닫힌다
  function enableSheetDrag(scr, closeRefs) {
    const { panel, dim } = scr.sheet; let st = null;
    panel.addEventListener('pointerdown', (e) => {
      const r = panel.getBoundingClientRect(); if ((e.clientY - r.top) / scale > 72 || e.target.closest('.sheet-close')) return;
      st = { pid: e.pointerId, y0: e.clientY, v: [] }; try { panel.setPointerCapture(e.pointerId); } catch (er) {}
    });
    panel.addEventListener('pointermove', (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const d = (e.clientY - st.y0) / scale, dy = d > 0 ? d : -Math.min(14, -d * 0.2);
      scr.sheet.dy = dy; panel.style.transform = 'translate3d(0,' + dy + 'px,0)';
      dim.style.opacity = String(Math.max(0, 1 - Math.max(0, dy) / (H - SHEET_TOP)));
      st.v.push([performance.now(), dy]); if (st.v.length > 5) st.v.shift();
    });
    const up = (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const s = st; st = null; const dy = scr.sheet.dy;
      const v = s.v.length > 1 ? (s.v[s.v.length - 1][1] - s.v[0][1]) / Math.max(1, s.v[s.v.length - 1][0] - s.v[0][0]) : 0;
      if (dy > 120 || (v > 0.5 && dy > 20)) { run(A[closeRefs[0]].a, scr); return; }
      scr.sheet.dy = 0;
      anim(panel, [{ transform: 'translate3d(0,' + dy + 'px,0)' }, { transform: 'none' }], 260).finished.then(() => { panel.getAnimations().forEach((a) => a.cancel()); panel.style.transform = ''; }).catch(() => {});
      dim.style.opacity = '';
    };
    panel.addEventListener('pointerup', up); panel.addEventListener('pointercancel', up);
  }

  function buildScreen(id) {
    if (isSheet(id)) return buildSheet(id);
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
    const scr = { id, root, binds, ctx, timeouts };
    if (isCard(id) && (cardNeighbors(id).next || cardNeighbors(id).prev)) ctx.swipe = true;
    return scr;
  }
  function flashHotspots(root) {
    root.classList.remove('flash'); void root.offsetWidth; root.classList.add('flash');
  }
  function refresh(scr) {
    for (const t of scr.binds.texts) { const v = fmt(vars[t.v]); if (t.e.textContent !== v) t.e.textContent = v; }
    for (const b of scr.binds.vis) {
      const on = !!vars[b.v], was = b.e.style.display !== 'none';
      b.e.style.display = on ? '' : 'none';
      // 이미 보이는 화면에서 새로 나타나는 요소(선택 표시·안내 문구)는 살짝 떠오르며 나타난다
      if (on && !was && scr.mounted && !REDUCE) b.e.animate([{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'none' }], { duration: 200, easing: EASE });
    }
  }

  // ---------- 이미지 미리 불러오기 ----------
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const loaded = new Map();
  // 디코드까지 끝낸 이미지 객체를 최근 것부터 붙잡아 둔다 — 놓으면 브라우저가 디코드 결과를 버려서 다시 열 때 깜빡인다
  const KEEP = 90, keep = new Map();
  const hold = (url, i) => { keep.delete(url); keep.set(url, i); if (keep.size > KEEP) keep.delete(keep.keys().next().value); };
  // 한꺼번에 수십 장을 요청하면 지금 열 화면이 뒤로 밀린다 → 동시 6장, 급한 것(now) 먼저
  const queue = { hi: [], lo: [] }; let active = 0;
  function pump() {
    while (active < 6 && (queue.hi.length || queue.lo.length)) {
      const job = queue.hi.shift() || queue.lo.shift(); active++;
      job().finally(() => { active--; pump(); });
    }
  }
  function load(url, now) {
    let p = loaded.get(url);
    if (p) { if (keep.has(url)) hold(url, keep.get(url)); if (now && p.bump) p.bump(); return p; }
    let start;
    p = new Promise((res) => {
      start = () => new Promise((fin) => {
        const i = new Image(); i.decoding = 'async';
        i.onload = () => (i.decode ? i.decode().catch(() => {}) : Promise.resolve()).then(() => { hold(url, i); res(true); fin(); });
        i.onerror = () => { loaded.delete(url); res(false); fin(); };
        i.src = url;
      });
    });
    let queued = start; const job = () => { queued = null; return start(); };
    (now ? queue.hi : queue.lo).push(job);
    // 나중에 급해지면(그 화면으로 바로 가면) 줄 앞으로 옮긴다
    p.bump = () => { if (!queued) return; const k = queue.lo.indexOf(job); if (k >= 0) { queue.lo.splice(k, 1); queue.hi.push(job); pump(); } };
    loaded.set(url, p); pump();
    return p;
  }
  // 새로 만든 화면의 <img> 를 붙이기 전에 디코드해 둔다(디코드 전 한 프레임 비어 보이는 깜빡임 방지)
  function decodeAll(root, ms) {
    const imgs = [...root.querySelectorAll('img')].filter((i) => i.decode);
    if (!imgs.length) return Promise.resolve();
    return Promise.race([Promise.all(imgs.map((i) => i.decode().catch(() => {}))), wait(ms)]);
  }
  function screenUrls(id) {
    const sc = S[id], out = []; if (!sc) return out;
    const add = (k) => { const m = IMG[k]; if (m) out.push('img/' + m.f); };
    sc.L.forEach(add);
    const isMap = MAPS && MAPS.S[id];
    const walk = (c) => { for (const k of c || []) {
      if (k.k === 'a') { const M = (D.ANIM || {})[k.p]; out.push('img/anim/plate-' + k.pl + '.webp'); if (M) out.push('img/anim/' + M.file); continue; }
      if (k.k === 's' && !k.fl && isMap) continue; if (k.img) add(k.img); if (k.img2) add(k.img2); walk(k.c); } };
    walk(sc.c);
    if (sc.cp) { const f = id.replace(':', '_'); out.push('img/card/sh-' + f + '.webp', 'img/card/it-' + f + '.webp'); }  // 카드 넘기기 보정 그림
    if (isMap) for (const k of ['plus-on', 'plus-off', 'minus-on', 'minus-off']) out.push('img/zoom/' + k + '.webp');  // 지도 + − 버튼 그림
    return out.concat(mapUrls(id));
  }
  const preload = (id) => Promise.all(screenUrls(id).map((u) => load(u, true)));
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
  const idle = window.requestIdleCallback || ((f) => setTimeout(f, 300));
  function prefetchAround(id) {
    const near = [...destsOf(id)];
    // 카드 넘기기 이웃은 손가락이 닿자마자 보이므로 가장 먼저
    const cn = isCard(id) ? cardNeighbors(id) : {};
    [cn.next, cn.prev].filter(Boolean).forEach((d) => screenUrls(d).forEach((u) => load(u, true)));
    near.forEach((d) => screenUrls(d).forEach((u) => load(u)));
    idle(() => { const seen = new Set(near); for (const d of near) for (const d2 of destsOf(d)) if (!seen.has(d2)) { seen.add(d2); screenUrls(d2).forEach((u) => load(u)); } }, { timeout: 1500 });
  }
  // 어느 화면에서든 쓰는 공용 그림(강아지 애니메이션 전부·코스 찾는 중 화면)은 시작하자마자 받아 둔다
  const COMMON = Object.values(D.ANIM || {}).map((m) => 'img/anim/' + m.file)
    .concat([...new Set(JSON.stringify(S).match(/"pl":"[^"]+"/g) || [])].map((m) => 'img/anim/plate-' + m.slice(6, -1) + '.webp'))
    .concat(['img/ld/status.webp', 'img/ld/appbar.webp', 'img/ld/dog.webp']);
  // 글꼴: 구글 글꼴은 글자 묶음별로 처음 쓰일 때 받는다 → 앱에 나오는 글자를 미리 불러 글자가 늦게 뜨지 않게
  function warmFonts() {
    if (!document.fonts || !document.fonts.load) return;
    const txt = new Set('0123456789.,:·~%-+()분km시간걸음m ');
    const add = (v) => String(v == null ? '' : v).split('').forEach((c) => txt.add(c));
    Object.values(D.V || {}).forEach((v) => add(typeof v === 'object' ? JSON.stringify(v) : v));
    Object.values(LOADERS).forEach((L) => { add(L.title); L.steps.forEach(add); });
    const t = [...txt].join('');
    ['400', '500', '700', '900'].forEach((w) => document.fonts.load(w + " 16px 'Noto Sans KR'", t).catch(() => {}));
    document.fonts.load("700 16px 'Maplestory'", t).catch(() => {});
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

  // ---------- 움직임 공통 ----------
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EASE = 'cubic-bezier(.22,.8,.24,1)';          // 앱처럼 빠르게 출발해 부드럽게 멈춤
  const EASE_IO = 'cubic-bezier(.4,0,.2,1)';
  const dur = (ms) => (REDUCE ? Math.min(ms, 120) : ms);
  const anim = (e, kf, ms, easing) => e.animate(kf, { duration: dur(ms), easing: easing || EASE, fill: 'both' });
  const settled = (a) => a.finished.catch(() => {});
  // 마지막으로 누른 곳(기기 좌표) — 뒤로 가기 버튼인지, 아래 큰 버튼인지 판단한다
  let tapAt = null;
  function devRect(t) {
    const r = t.getBoundingClientRect(), d = device.getBoundingClientRect();
    return { x: (r.left - d.left) / scale, y: (r.top - d.top) / scale, w: r.width / scale, h: r.height / scale };
  }
  const isBackTap = (t) => t && t.x < 80 && t.y > 40 && t.y < 130 && t.w <= 64;
  const isCtaTap = (t) => t && t.y >= 640 && t.w >= 200;
  // 우리 강아지 설정 단계(머리글 오른쪽 발자국 3개 = 진행 단계)
  const STEP_NAMES = { 'S00 · 강아지 크기': 1, 'S00 · 나이와 건강': 2, 'S00 · 추천 기준 확인': 3 };
  const stepOf = (id) => (S[id] && STEP_NAMES[S[id].n]) || 0;
  const STEP_HDR = 124, STEP_PAW = [[313, 73, 23, 23], [333, 73, 23, 23], [353, 73, 23, 23]];

  // ---------- 코스 카드 묶음 ----------
  const RES = /^(S01 · (오늘의 코스|넘기기|필터 결과)|PR · )/;
  const isCard = (id) => !!S[id] && RES.test(S[id].n);
  // 「끝에서 더 넘김」(E08)은 디자인 확인용 정지 화면(옛 배지·틀린 점 위치)이라 쓰지 않는다 — 마지막 카드에서는 고무줄처럼 되돌아온다
  const isEndBounce = (id) => !!S[id] && /넘기기 E08/.test(S[id].n);
  const cardIdx = (id) => { const n = S[id].n; if (/E08/.test(n)) return 99; const m = n.match(/(\d+)번째/); return m ? +m[1] : 1; };
  const fam = (id) => { const f = S[id].n.split(' · ')[0]; return f === 'PR' ? 'S01' : f === 'PF' ? 'S02' : f; };
  const nbCache = new Map();
  // 이 카드 화면에서 손가락으로 넘길 이전·다음 카드와 그때 실행할 반응(프로토타입의 < > 버튼·끌기와 같은 것)
  function cardNeighbors(id) {
    if (nbCache.has(id)) return nbCache.get(id);
    const me = cardIdx(id), out = { next: null, prev: null };
    const firstNav = (acts) => { for (const a of acts || []) { if (a.t === 'NODE' && a.n === 'NAVIGATE' && a.d) return a.d; if (a.t === 'CONDITIONAL') { const d = firstNav(a.cb[0] && a.cb[0].a); if (d) return d; } } return null; };
    const consider = (k) => {
      const a = A[k]; if (!a || (a.tg.t !== 'ON_CLICK' && a.tg.t !== 'ON_DRAG')) return;
      const d = firstNav(a.a); if (!d || !isCard(d) || d === id || isEndBounce(d)) return;
      const di = cardIdx(d); if (di === me) return;
      const drag = a.tg.t === 'ON_DRAG';
      if (di > me) { if (!out.next || di < out.next.i || (di === out.next.i && drag)) out.next = { d, k, i: di }; }
      else if (!out.prev || di > out.prev.i) out.prev = { d, k, i: di };
    };
    const walk = (c) => { for (const it of c || []) { (it.r || []).forEach(consider); walk(it.c); } };
    walk(S[id].c); (S[id].r || []).forEach(consider);
    nbCache.set(id, out);
    return out;
  }
  // 카드가 차지하는 세로 범위(넘기는 띠). 끌기 반응이 걸린 카드 영역을 쓴다.
  // 위 경계는 필터 버튼과 카드 사이 빈 줄(291), 아래는 카드 그림자가 끝나는 줄(691)까지 — 그림자를 중간에서 자르면 카드가 빠진 자리에 가로선이 남는다.
  const CARD_SH = [672, 691], ROW_END = 722;   // 카드 아래 그림자 구간: 이 안의 화살표·점·발자국 장식은 보정 그림으로 제자리에 고정한다
  function cardBand(id, other) {
    const find = (sid) => { if (!sid || !S[sid]) return null; for (const it of S[sid].c) if (it.k === 'h' && (it.r || []).some((k) => A[k] && A[k].tg.t === 'ON_DRAG')) return it.b; return null; };
    // 끌기 반응이 없는 카드 화면(필터 결과의 2·3번째 등)도 카드 자리는 같다
    const b = find(id) || find(other) || [12, 287.5, 369, 397.3];
    const cp = (S[id] && S[id].cp) || (other && S[other] && S[other].cp);
    return [Math.max(0, b[1] + 3.5), cp ? CARD_SH[1] : Math.min(H, b[1] + b[3] - 5.8)];
  }
  const cardPatch = (kind, sid) => { const i = el('img', 'card-patch'); i.src = 'img/card/' + kind + '-' + sid.replace(':', '_') + '.webp'; i.alt = ''; i.draggable = false; return i; };
  // 넘기는 띠: 화면 전체 폭으로 카드 높이만큼 잘라 낸 그림을 가로로 이어 붙인다.
  // parts: [화면 root, 가로 위치, 화면 id]. 움직이는 카드에는 장식을 지운 그림자 그림을 붙이고, 장식은 띠 위에 제자리로 고정한다.
  function makeBand(y0, y1, parts) {
    const band = el('div', 'swipe-band', { top: px(y0), height: px(y1 - y0) });
    const track = el('div', 'swipe-track');
    const pins = [];
    for (const [root, off, sid] of parts) {
      const c = root.cloneNode(true);
      c.style.cssText += ';position:absolute;top:' + px(-y0) + ';left:' + px(off) + ';transform:none;opacity:1;z-index:auto';
      c.querySelectorAll('.ripple').forEach((r) => r.remove());
      if (sid && S[sid] && S[sid].cp && y1 >= CARD_SH[1]) { const sh = cardPatch('sh', sid); sh.style.top = px(CARD_SH[0]); c.appendChild(sh); }
      track.appendChild(c);
    }
    band.appendChild(track); device.appendChild(band);
    // 점·화살표 줄은 한 덩어리로 고정한다: 그림자 구간(672~691)은 장식만 든 보정 그림, 그 아래(689~722)는 그 화면을 그대로 잘라 붙인다.
    // 줄의 위아래 반쪽이 서로 다른 화면 것이 되면 점 옆에 선이 생기므로, 앞 화면 덩어리는 새 덩어리와 같은 시간에 사라지게 한다.
    const pin = (sid, fade, root) => {
      if (!sid || !S[sid] || !S[sid].cp || y1 < CARD_SH[1]) return;
      const it = el('div', 'card-pin', { position: 'absolute', left: 0, top: 0, width: px(W), height: px(H), zIndex: 6, pointerEvents: 'none' });
      if (root) {
        const low = root.cloneNode(true);
        low.style.cssText += ';position:absolute;left:0;top:0;transform:none;opacity:1;z-index:auto;clip-path:inset(' + (CARD_SH[1] - 2) + 'px 0 ' + (H - ROW_END) + 'px 0)';
        low.querySelectorAll('.ripple,.dim,.card-patch').forEach((r) => r.remove());
        it.appendChild(low);
      }
      const deco = cardPatch('it', sid); deco.style.top = px(CARD_SH[0]); it.appendChild(deco);
      // 새 덩어리는 밑에 불투명하게 깔고 앞 덩어리만 사라지게 한다(둘 다 반투명이면 띠 경계가 비친다)
      if (fade && pins.length) { pins.forEach((o) => anim(o, [{ opacity: 1 }, { opacity: 0 }], fade, EASE_IO)); device.insertBefore(it, pins[0]); }
      else device.appendChild(it);
      pins.push(it);
    };
    pin(parts[0] && parts[0][2], 0, parts[0] && parts[0][0]);
    return { band, track, pin, set: (x) => { track.style.transform = 'translate3d(' + x + 'px,0,0)'; }, remove: () => { band.remove(); pins.forEach((p) => p.remove()); } };
  }
  let swipeHint = null, swiping = false;
  function enableSwipe(scr) {
    const { root, id } = scr, nb = cardNeighbors(id), [y0, y1] = cardBand(id);
    let st = null, eatClick = false;
    const local = (e) => { const d = device.getBoundingClientRect(); return [(e.clientX - d.left) / scale, (e.clientY - d.top) / scale]; };
    root.addEventListener('pointerdown', (e) => {
      if (current !== scr || swiping || overlays.length || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const [, y] = local(e); if (y < y0 || y > y1) return;
      st = { pid: e.pointerId, x0: e.clientX, y0: e.clientY, on: false, d: 0, v: [] };
      window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    }, true);
    const move = (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const dx = (e.clientX - st.x0) / scale, dy = (e.clientY - st.y0) / scale;
      if (!st.on) {
        if (Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy) * 1.2) {
          st.on = true; swiping = true;
          // 끌기 시작하면 카드 누름 표시(옅은 회색 둥근 박스)를 끈다 — 띠가 박스 대부분을 덮고 띠 위로 윗부분만 남아 가로선처럼 보인다
          root.classList.add('swiping');
          try { root.setPointerCapture(e.pointerId); } catch (er) {}
          const parts = [[root, 0, id]];
          for (const [k, off] of [['next', W], ['prev', -W]]) if (nb[k]) { const n = buildScreen(nb[k].d); refresh(n); parts.push([n.root, off, nb[k].d]); }
          st.fx = makeBand(y0, y1, parts);
          st.x0 = e.clientX;
        } else if (Math.abs(dy) > 14) { st = null; window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); }
        return;
      }
      let d = (e.clientX - st.x0) / scale;
      if ((d < 0 && !nb.next) || (d > 0 && !nb.prev)) d = Math.sign(d) * Math.min(70, Math.abs(d) * 0.32); // 끝에서는 고무줄처럼
      st.d = d; st.fx.set(d);
      st.v.push([performance.now(), d]); if (st.v.length > 5) st.v.shift();
    };
    const up = (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const s = st; st = null;
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up);
      if (!s.on) return;
      eatClick = true; setTimeout(() => { eatClick = false; }, 60);
      const v = s.v.length > 1 ? (s.v[s.v.length - 1][1] - s.v[0][1]) / Math.max(1, s.v[s.v.length - 1][0] - s.v[0][0]) : 0;
      let dir = 0;
      if (nb.next && (s.d < -W * 0.2 || (v < -0.35 && s.d < -10))) dir = 1;
      else if (nb.prev && (s.d > W * 0.2 || (v > 0.35 && s.d > 10))) dir = -1;
      if (!dir) {
        const a = anim(s.fx.track, [{ transform: 'translate3d(' + s.d + 'px,0,0)' }, { transform: 'none' }], 320);
        settled(a).then(() => { s.fx.remove(); swiping = false; root.classList.remove('swiping'); });
        return;
      }
      if (navigator.vibrate) navigator.vibrate(6);
      swipeHint = { fx: s.fx, d: s.d, dir };
      run(A[nb[dir > 0 ? 'next' : 'prev'].k].a);
      if (swipeHint) { s.fx.remove(); swipeHint = null; swiping = false; root.classList.remove('swiping'); }
    };
    root.addEventListener('click', (e) => { if (eatClick) { e.stopPropagation(); e.preventDefault(); eatClick = false; } }, true);
  }
  // PC: 키보드 ← → 로 카드 넘기기
  window.addEventListener('keydown', (e) => {
    if (!current || !current.id || !isCard(current.id) || overlays.length || swiping) return;
    const nb = cardNeighbors(current.id), t = e.key === 'ArrowRight' ? nb.next : e.key === 'ArrowLeft' ? nb.prev : null;
    if (t) { e.preventDefault(); run(A[t.k].a); }
  });

  // ---------- 탐색 ----------
  const stage = document.getElementById('stage');
  const device = document.getElementById('device');
  let scale = 1;
  let current = null; const hist = []; const overlays = [];
  // 화면 바꾸기. mode: fade · push(앞으로) · pop(뒤로) · slide(카드 넘기기) · rise(로딩 뒤 결과)
  function mount(next, mode, skel) {
    device.appendChild(next.root);
    const prev = current;
    current = next;
    if (prev) (prev.timers || []).forEach(clearTimeout);
    const gone = [prev && prev.root, skel].filter(Boolean);
    const done = () => { gone.forEach((g) => g.remove()); next.root.style.zIndex = ''; next.root.classList.remove('lift'); };
    const k = prev && mode ? mode.k : null;
    // 세로가 모자라 페이지를 내려 둔 상태에서 새 화면으로 가면 맨 위부터 보이게 한다(카드 넘기기·시트는 그대로)
    if (prev && document.body.scrollTop > 0 && k !== 'slide' && k !== 'sheetup' && k !== 'sheetdown' && prev.id !== next.id) document.body.scrollTop = 0;
    if (!k) { done(); return; }
    if (skel && (k === 'push' || k === 'pop' || k === 'slide')) mode = { k: 'fade', ms: 200 };
    if (k === 'sheetup' && next.sheet) {
      // 시트 뒤에는 앞 화면을 그대로 둔다(시트끼리 바뀔 때는 같은 바탕을 넘겨받는다)
      const u = next.sheet.under;
      if (prev.sheet) { while (prev.sheet.under.firstChild) u.appendChild(prev.sheet.under.firstChild); }
      else { const c = prev.root.cloneNode(true); c.style.cssText += ';transform:none;opacity:1;z-index:auto'; c.querySelectorAll('.ripple,.dim').forEach((r) => r.remove()); u.appendChild(c); }
      next.root.style.zIndex = 2;
      if (prev.sheet) { settled(anim(next.sheet.panel, [{ opacity: 0.4 }, { opacity: 1 }], 160, EASE_IO)).then(() => { next.sheet.panel.getAnimations().forEach((a) => a.cancel()); done(); }); return; }
      prev.root.style.visibility = 'hidden';
      anim(next.sheet.dim, [{ opacity: 0 }, { opacity: 1 }], 300, EASE_IO);
      settled(anim(next.sheet.panel, [{ transform: 'translate3d(0,100%,0)' }, { transform: 'none' }], 420)).then(() => {
        [next.sheet.panel, next.sheet.dim].forEach((r) => r.getAnimations().forEach((a) => a.cancel())); done();
      });
      return;
    }
    if (k === 'sheetdown' && prev.sheet) {
      prev.root.style.zIndex = 2; next.root.style.zIndex = 1;
      const { panel, dim, dy } = prev.sheet;
      anim(dim, [{ opacity: dim.style.opacity || 1 }, { opacity: 0 }], 280, EASE_IO);
      settled(anim(panel, [{ transform: 'translate3d(0,' + dy + 'px,0)' }, { transform: 'translate3d(0,100%,0)' }], 300, EASE_IO)).then(done);
      return;
    }
    if ((k === 'push' || k === 'pop') && stepOf(prev.id) && stepOf(next.id) && stepOf(prev.id) !== stepOf(next.id)) {
      // 우리 강아지 1~3단계: 머리글(뒤로·제목·발자국)은 그대로 두고 아래 내용만 짧게 밀며 바꾼다.
      // 바뀐 발자국은 앞으로 갈 때 톡 채워지고, 뒤로 갈 때 작아지며 빠진다.
      const a = stepOf(prev.id), b = stepOf(next.id), fwd = b > a, sgn = fwd ? 1 : -1, ms = 340;
      const clip = (y0, y1, x0, x1) => 'inset(' + y0 + 'px ' + (W - x1) + 'px ' + (H - y1) + 'px ' + x0 + 'px)';
      const layer = (root, cp, z) => { const c = root.cloneNode(true); c.style.cssText += ';transform:none;opacity:1;z-index:' + z + ';clip-path:' + cp; c.querySelectorAll('.ripple,.dim').forEach((r) => r.remove()); device.appendChild(c); return c; };
      [prev.root, next.root].forEach((r) => { r.style.clipPath = clip(STEP_HDR, H, 0, W); });
      prev.root.style.zIndex = 1; next.root.style.zIndex = 2;
      const head = layer((fwd ? prev : next).root, clip(0, STEP_HDR, 0, W), 3);
      const pops = [];
      for (let i = Math.min(a, b) + 1; i <= Math.max(a, b); i++) {
        const [px0, py0, pw, ph] = STEP_PAW[i - 1], p = layer((fwd ? next : prev).root, clip(py0, py0 + ph, px0, px0 + pw), 4);
        p.style.transformOrigin = (px0 + pw / 2) + 'px ' + (py0 + ph / 2) + 'px';
        pops.push(anim(p, fwd ? [{ transform: 'scale(.2)', opacity: 0 }, { transform: 'scale(1.3)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }]
          : [{ transform: 'none', opacity: 1 }, { transform: 'scale(.2)', opacity: 0 }], fwd ? 460 : 260, fwd ? 'cubic-bezier(.3,1.4,.5,1)' : EASE_IO));
        if (!REDUCE) pops[pops.length - 1].effect.updateTiming({ delay: fwd ? 90 : 0 });
      }
      anim(prev.root, [{ transform: 'none', opacity: 1 }, { transform: 'translate3d(' + (-sgn * 56) + 'px,0,0)', opacity: 0 }], ms * 0.8, EASE_IO);
      const enter = anim(next.root, [{ transform: 'translate3d(' + (sgn * 56) + 'px,0,0)', opacity: 0 }, { transform: 'none', opacity: 1 }], ms);
      Promise.all([enter].concat(pops).map(settled)).then(() => {
        head.remove(); pops.forEach((p) => p.effect.target.remove());
        [prev.root, next.root].forEach((r) => { r.getAnimations().forEach((x) => x.cancel()); r.style.clipPath = ''; });
        done();
      });
    } else if (k === 'push' || k === 'pop') {
      const fwd = k === 'push', top = fwd ? next.root : prev.root, under = fwd ? prev.root : next.root;
      top.style.zIndex = 2; under.style.zIndex = 1; top.classList.add('lift');
      const dim = el('div', 'dim'); under.appendChild(dim);
      const ms = 380;
      anim(top, fwd ? [{ transform: 'translate3d(100%,0,0)' }, { transform: 'none' }] : [{ transform: 'none' }, { transform: 'translate3d(100%,0,0)' }], ms);
      anim(under, fwd ? [{ transform: 'none' }, { transform: 'translate3d(-28%,0,0)' }] : [{ transform: 'translate3d(-28%,0,0)' }, { transform: 'none' }], ms);
      settled(anim(dim, fwd ? [{ opacity: 0 }, { opacity: 1 }] : [{ opacity: 1 }, { opacity: 0 }], ms)).then(() => {
        dim.remove(); [top, under].forEach((r) => r.getAnimations().forEach((a) => a.cancel())); top.classList.remove('lift'); done();
      });
    } else if (mode.k === 'slide') {
      const [y0, y1] = cardBand(prev.id, next.id), dir = mode.dir;
      const fx = mode.fx || makeBand(y0, y1, [[prev.root, 0, prev.id], [next.root, dir * W, next.id]]);
      fx.pin(next.id, 180, next.root);
      fx.band.style.zIndex = 5;
      const from = mode.d || 0, ms = mode.fx ? 300 : 420;
      next.root.style.zIndex = 2;
      anim(next.root, [{ opacity: 0 }, { opacity: 1 }], 180, EASE_IO);
      settled(anim(fx.track, [{ transform: 'translate3d(' + from + 'px,0,0)' }, { transform: 'translate3d(' + (-dir * W) + 'px,0,0)' }], ms)).then(() => {
        fx.remove(); next.root.getAnimations().forEach((a) => a.cancel()); swiping = false; done();
      });
    } else if (mode.k === 'rise') {
      next.root.style.zIndex = 2;
      settled(anim(next.root, [{ opacity: 0, transform: 'translate3d(0,22px,0) scale(.985)' }, { opacity: 1, transform: 'none' }], 460)).then(() => { next.root.getAnimations().forEach((a) => a.cancel()); done(); });
    } else {
      next.root.style.zIndex = 2;
      settled(anim(next.root, [{ opacity: 0 }, { opacity: 1 }], mode.ms || 220, EASE_IO)).then(() => { next.root.getAnimations().forEach((a) => a.cancel()); done(); });
    }
  }
  async function show(id, mode, skel, seq) {
    if (!S[id]) return;
    const next = buildScreen(id);
    refresh(next);
    await decodeAll(next.root, 250);
    if (seq != null && seq !== navSeq) { if (skel) skel.remove(); if (mode && mode.fx) { mode.fx.remove(); swiping = false; } return; }
    mount(next, mode, skel);
    next.ctx.afterMount.forEach((f) => f());
    next.mounted = true;
    if (next.ctx.swipe) enableSwipe(next);
    startTimers(next);
    keepAwake(/^S05/.test(S[id].n));
    prefetchAround(id);
  }
  // 이미지가 220ms 안에 준비되면 바로 넘어가고, 늦으면 그 화면의 스켈레톤을 먼저 보여 준다
  let navSeq = 0;
  async function go(id, mode, loader) {
    const seq = ++navSeq;
    const p = preload(id);
    if (loader) {
      showLoader(loader, mode);
      await Promise.all([Promise.race([p, wait(12000)]), wait(dur(loader.ms))]);
      if (seq !== navSeq) return;
      show(id, { k: 'rise' }, null, seq);
      return;
    }
    if (mode && (mode.k === 'sheetup' || mode.k === 'sheetdown')) {
      await Promise.race([p, wait(1500)]);
      if (seq !== navSeq) return;
      show(id, mode, null, seq); return;
    }
    const fast = await Promise.race([p.then(() => true), wait(220).then(() => false)]);
    if (seq !== navSeq) { if (mode && mode.fx) { mode.fx.remove(); swiping = false; } return; }
    if (fast) { show(id, mode, null, seq); return; }
    if (mode && mode.fx) { mode.fx.remove(); swiping = false; }
    const sk = skeleton(id);
    sk.style.opacity = 0; sk.style.transition = 'opacity 150ms ease';
    device.appendChild(sk); requestAnimationFrame(() => { sk.style.opacity = 1; });
    const t0 = performance.now();
    await Promise.race([p, wait(12000)]);
    const spent = performance.now() - t0; if (spent < 380) await wait(380 - spent);
    if (seq !== navSeq) { sk.remove(); return; }
    show(id, { k: 'fade', ms: 220 }, sk, seq);
  }

  // ---------- 코스 찾는 중(로딩 화면) — Figma 「S01 · 코스 확인 중」 ----------
  const PAWS = [[[32.3,47.2,20,17,-20],[26.7,40.7,6.5,8,-20],[30.6,33.9,6.5,8,-20],[38.2,31.2,6.5,8,-20],[45.5,33.9,6.5,8,-20]],[[45.5,195.2,18,15.3,-30],[39.6,190.3,5.8,7.2,-30],[42,183.7,5.8,7.2,-30],[48.2,180.1,5.8,7.2,-30],[55.1,181.3,5.8,7.2,-30]],[[89.2,125.5,16,13.6,15],[88.6,118.7,5.2,6.4,15],[94.2,116,5.2,6.4,15],[100.4,117.7,5.2,6.4,15],[104,122.8,5.2,6.4,15]],[[120.7,15.2,12,10.2,-5],[118.5,10.6,3.9,4.8,-5],[121.8,7.3,3.9,4.8,-5],[126.6,6.9,3.9,4.8,-5],[130.4,9.5,3.9,4.8,-5]],[[162,67.5,18,15.3,-10],[158.1,60.8,5.8,7.2,-10],[162.6,55.5,5.8,7.2,-10],[169.7,54.2,5.8,7.2,-10],[175.8,57.7,5.8,7.2,-10]],[[174.8,206.6,15,12.8,30],[175.9,200.2,4.9,6,30],[181.6,199.3,4.9,6,30],[186.8,202.3,4.9,6,30],[188.9,207.7,4.9,6,30]],[[229.6,160,22,18.7,25],[230.4,150.6,7.2,8.8,25],[238.7,148.4,7.2,8.8,25],[246.7,152.1,7.2,8.8,25],[250.3,159.9,7.2,8.8,25]],[[302.8,78.6,17,14.4,-15],[298.6,72.7,5.5,6.8,-15],[302.4,67.3,5.5,6.8,-15],[308.9,65.5,5.5,6.8,-15],[315,68.3,5.5,6.8,-15]],[[317.2,15.5,12,10.2,20],[317.2,10.4,3.9,4.8,20],[321.6,8.8,3.9,4.8,20],[326.1,10.5,3.9,4.8,20],[328.5,14.5,3.9,4.8,20]],[[351,178.3,18,15.3,5],[348.9,170.9,5.8,7.2,5],[354.7,166.9,5.8,7.2,5],[361.9,167.5,5.8,7.2,5],[366.8,172.5,5.8,7.2,5]]];
  const LOADERS = {
    search: { ms: 2300, title: '우리 동네 코스를\n확인하고 있어요', steps: ['주변 산책길을 찾고 있어요.', '시설과 혼잡도 정보를 함께 살펴볼게요.', '우리 강아지에게 맞는 코스를 고르고 있어요.'] },
    filter: { ms: 1500, title: '조건에 맞는 코스를\n찾고 있어요', steps: ['고른 시설이 있는 코스만 모으고 있어요.', '걷는 시간에 맞는 코스를 정리하고 있어요.'] },
  };
  function showLoader(L, mode) {
    const root = el('div', 'screen loader', { width: px(W), height: px(H) });
    const svg = '<svg class="paws" viewBox="0 0 393 240" width="393" height="240">' + PAWS.map((p, i) =>
      '<g class="paw" style="animation-delay:' + (i * 0.17).toFixed(2) + 's">' + p.map(([x, y, w, h, r]) =>
        '<ellipse transform="translate(' + x + ' ' + y + ') rotate(' + r + ')" cx="' + w / 2 + '" cy="' + h / 2 + '" rx="' + w / 2 + '" ry="' + h / 2 + '"/>').join('') + '</g>').join('') + '</svg>';
    root.innerHTML =
      '<img class="ld-status" src="img/ld/status.webp" alt="">' +
      '<img class="ld-bar" src="img/ld/appbar.webp" alt="">' + svg +
      '<div class="ld-shadow"></div><img class="ld-dog" src="img/ld/dog.webp" alt="">' +
      '<svg class="ld-sparkle" viewBox="0 0 18 18"><path d="M9 0C9.75 5.25 12.75 8.25 18 9C12.75 9.75 9.75 12.75 9 18C8.25 12.75 5.25 9.75 0 9C5.25 8.25 8.25 5.25 9 0Z" fill="#F2C14E"/></svg>' +
      '<svg class="ld-heart" viewBox="0 0 13 12"><path d="M6.5 11.8182C2.36364 8.86364 0 6.5 0 3.54545C0 1.47727 1.53636 0 3.42727 0C4.72727 0 5.90909 0.768182 6.5 1.95C7.09091 0.768182 8.27273 0 9.57273 0C11.4636 0 13 1.47727 13 3.54545C13 6.5 10.6364 8.86364 6.5 11.8182Z" fill="#F29A93"/></svg>' +
      '<i class="ld-dot"></i>' +
      '<div class="ld-title"></div><div class="ld-sub"><span></span></div>' +
      '<div class="ld-dots"><i></i><i></i><i></i></div><i class="ld-home"></i>';
    root.querySelector('.ld-title').textContent = L.title;
    const sub = root.querySelector('.ld-sub span'); sub.textContent = L.steps[0];
    const scr = { id: null, root, binds: { texts: [], vis: [] }, ctx: { map: null, afterMount: [] }, timeouts: [], timers: [], loader: true };
    const per = dur(L.ms) / L.steps.length;
    L.steps.slice(1).forEach((t, i) => scr.timers.push(setTimeout(() => {
      settled(anim(sub, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-6px)' }], 160, EASE_IO)).then(() => {
        sub.textContent = t; anim(sub, [{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], 220);
      });
    }, per * (i + 1))));
    mount(scr, mode || { k: 'fade', ms: 220 });
    keepAwake(false);
  }
  function startTimers(scr) {
    scr.timers = scr.timeouts.map((a) => setTimeout(() => { if (current === scr || overlays.includes(scr)) run(a.a, scr); }, (a.tg.ms || 0) * 1000));
  }
  // 겹쳐 뜨는 화면: 알림(Toast)은 위에서 내려오고, 확인 창은 살짝 커지며 나타난다
  async function openOverlay(id) {
    await Promise.race([preload(id), wait(1500)]);
    const o = buildScreen(id); refresh(o);
    await decodeAll(o.root, 250);
    const wrap = el('div', 'overlay');
    wrap.appendChild(o.root); o.wrap = wrap; o.toast = /^Toast/.test(S[id].n);
    if (o.toast) wrap.style.pointerEvents = 'none';  // 알림은 아래 화면 조작을 막지 않는다
    device.appendChild(wrap);
    if (o.toast) anim(o.root, [{ opacity: 0, transform: 'translate3d(0,-36px,0)' }, { opacity: 1, transform: 'none' }], 360);
    else anim(o.root, [{ opacity: 0, transform: 'scale(1.04)' }, { opacity: 1, transform: 'none' }], 260);
    o.ctx.afterMount.forEach((f) => f());
    o.mounted = true;
    overlays.push(o); startTimers(o);
  }
  function closeOverlay(target) {
    const o = target && overlays.includes(target) ? target : overlays[overlays.length - 1];
    if (!o) return;
    o.timers.forEach(clearTimeout);
    overlays.splice(overlays.indexOf(o), 1);
    o.root.getAnimations().forEach((a) => a.cancel());
    settled(anim(o.root, o.toast ? [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translate3d(0,-24px,0)' }] : [{ opacity: 1 }, { opacity: 0 }], 200, EASE_IO)).then(() => o.wrap.remove());
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
  // 어떤 움직임으로 넘어갈지 정한다
  function pickMode(src, dest, tr, back) {
    if (swipeHint) { const h = swipeHint; swipeHint = null; return { k: 'slide', dir: h.dir, d: h.d, fx: h.fx }; }
    if (!src) return { k: 'fade', ms: 220 };
    if (isCard(src) && isCard(dest) && cardIdx(src) !== cardIdx(dest)) return { k: 'slide', dir: cardIdx(dest) > cardIdx(src) ? 1 : -1 };
    if (back || isBackTap(tapAt)) return { k: 'pop' };
    if (fam(src) !== fam(dest) || fam(src) === 'S00') return { k: 'push' };
    return { k: 'fade', ms: tr ? Math.min(320, Math.max(160, tr[1] * 1000)) : 200 };
  }
  function navigate(dest, tr) {
    const src = current && current.id;
    if (src) hist.push(src);
    window.history.pushState({ navi: hist.length }, '');
    if (isSheet(dest)) { go(dest, src ? { k: 'sheetup' } : { k: 'fade', ms: 200 }); return; }
    const fly = mapTransition(dest);
    if (fly) { fly.then(() => go(dest, { k: 'fade', ms: 150 })); return; }
    const mode = pickMode(src, dest, tr, false);
    // 입력·필터에서 코스를 찾으러 갈 때는 「코스 확인 중」 화면을 거친다
    let loader = null;
    if (src && fam(dest) === 'S01' && mode.k !== 'pop' && mode.k !== 'slide') {
      if (fam(src) === 'S00' || fam(src) === 'S06') loader = LOADERS.search;
      else if (fam(src) === 'S02' && isCtaTap(tapAt)) loader = LOADERS.filter;
    }
    go(dest, loader ? { k: fam(src) === 'S00' ? 'push' : 'fade', ms: 220 } : mode, loader);
  }
  let ignorePop = 0;
  function back(fromBrowser) {
    if (overlays.some((o) => !o.toast)) { closeOverlay(); if (fromBrowser) window.history.pushState({ navi: hist.length }, ''); return; }
    while (overlays.length) closeOverlay();   // 알림은 닫고 그대로 뒤로 간다
    if (!hist.length) return;
    // 시트(거리 입력·입력 확인)는 한 화면의 상태라 뒤로 가면 시트를 통째로 닫는다
    let dest = hist.pop(), skip = 0;
    while (isSheet(dest) && hist.length) { dest = hist.pop(); skip++; }
    const steps = (fromBrowser ? 0 : 1) + skip;
    if (steps) { ignorePop++; window.history.go(-steps); }
    if (current && current.sheet) { go(dest, { k: 'sheetdown' }); return; }
    const fly = mapTransition(dest);
    if (fly) fly.then(() => go(dest, { k: 'fade', ms: 150 }));
    else go(dest, current && current.id && isCard(current.id) && isCard(dest) && cardIdx(current.id) !== cardIdx(dest)
      ? { k: 'slide', dir: cardIdx(dest) > cardIdx(current.id) ? 1 : -1 } : { k: 'pop' });
  }
  window.addEventListener('popstate', () => { if (ignorePop) { ignorePop--; return; } back(true); });
  function run(actions, from) {
    for (const a of actions || []) {
      if (a.t === 'SET_VARIABLE') vars[a.v] = ev(a.val);
      else if (a.t === 'CONDITIONAL') {
        for (const b of a.cb) { if (b.c == null || ev(b.c)) { run(b.a, from); break; } }
      } else if (a.t === 'NODE' && (a.n === 'NAVIGATE' || a.n === 'SWAP') && a.d) {
        if (a.n === 'SWAP' && overlays.length) { closeOverlay(); openOverlay(a.d); continue; }
        if (isEndBounce(a.d)) continue;
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
    // 휴대폰에서는 그림 속 가짜 상태 표시줄(위 54)·홈 막대(아래 28)·둥근 모서리(양옆 2)를 잘라 실제 앱처럼 화면만 보이게 한다
    const cut = mobile ? { t: 54, b: 28, x: 2 } : { t: 0, b: 0, x: 0 };
    const vw = W - cut.x * 2, vh = H - cut.t - cut.b;
    const padT = mobile ? parseFloat(getComputedStyle(document.body).paddingTop) || 0 : 0;
    const availW = mobile ? window.innerWidth : window.innerWidth - 48;
    const chrome = document.querySelector('header').offsetHeight + document.querySelector('footer').offsetHeight + 56;
    const availH = mobile ? window.innerHeight - padT : window.innerHeight - chrome;
    // 휴대폰은 항상 가로를 꽉 채운다. 세로가 모자라면(사파리 주소창이 펼쳐진 경우) 페이지를 살짝 끌어 올려 보게 하고, 그러면 사파리가 주소창을 접는다
    scale = mobile ? Math.min(availW / vw, 4) : Math.min(availW / vw, availH / vh, 1.15);
    document.documentElement.classList.toggle('mscroll', mobile && vh * scale > availH + 1);
    device.style.transform = 'translate(' + (-cut.x * scale) + 'px,' + (-cut.t * scale) + 'px) scale(' + scale + ')';
    stage.style.width = px(vw * scale); stage.style.height = px(vh * scale);
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 300));
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  if (!standalone && /Android/i.test(navigator.userAgent) && document.documentElement.requestFullscreen) {
    const goFull = () => { if (!document.fullscreenElement && document.body.classList.contains('mobile')) document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {}); };
    document.addEventListener('pointerup', goFull, { once: true, capture: true });
  }
  document.getElementById('restart').addEventListener('click', () => { resetVars(); hist.length = 0; while (overlays.length) closeOverlay(); go(D.START, { k: 'fade', ms: 220 }); });

  // 확인용: 콘솔에서 NAVI.go('화면 이름')
  window.NAVI = { go: (q) => { const id = S[q] ? q : Object.keys(S).find((k) => S[k].n === q); if (id) go(id, { k: 'fade', ms: 200 }); return id; }, cur: () => current && S[current.id].n, vars };

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
    await show(D.START);
    COMMON.forEach((u) => load(u));
    warmFonts();
    window.history.replaceState({ navi: 0 }, '');
    if (splash) { splash.classList.add('hide'); setTimeout(() => splash.remove(), 400); }
  })();

  // ---------- 앱처럼: 눌림 진동, 화면 확대 막기, 오프라인·새 버전 알림 ----------
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.hot,.tap') && navigator.vibrate) navigator.vibrate(8); }, true);
  // 누른 자리에서 물결이 퍼진다(버튼을 눌렀다는 느낌)
  document.addEventListener('pointerdown', (e) => {
    const h = e.target.closest && e.target.closest('.hot:not(.full)');
    if (!h || REDUCE || swiping) return;
    const r = h.getBoundingClientRect(), k = scale, size = Math.hypot(r.width, r.height) / k * 2;
    const s = el('span', 'ripple', { width: px(size), height: px(size), left: px((e.clientX - r.left) / k - size / 2), top: px((e.clientY - r.top) / k - size / 2) });
    h.appendChild(s);
    settled(s.animate([{ transform: 'scale(0)', opacity: 1 }, { transform: 'scale(1)', opacity: 0 }], { duration: 560, easing: EASE, fill: 'forwards' })).then(() => s.remove());
  }, true);
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  // 화면 밖으로 끌려가는 것을 막되, 페이지가 화면보다 길 때(휴대폰 세로 부족)는 세로로 끄는 손짓만 페이지 스크롤로 넘긴다
  let tg = null;
  document.addEventListener('touchstart', (e) => { const t = e.touches[0]; tg = e.touches.length === 1 ? { x: t.clientX, y: t.clientY, v: null } : null; }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.scr,.map')) return;
    if (tg && document.documentElement.classList.contains('mscroll') && e.touches.length === 1) {
      if (tg.v === null) { const t = e.touches[0], dx = Math.abs(t.clientX - tg.x), dy = Math.abs(t.clientY - tg.y); if (dx + dy < 3) return; tg.v = dy > dx; }
      if (tg.v) return;
    }
    e.preventDefault();
  }, { passive: false });
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
