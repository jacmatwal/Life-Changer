(function () {
  'use strict';

  const CONTENT = window.LC_CONTENT;
  const LANGS = Object.keys(CONTENT);
  // The language in use. English is read first because question ids are the same in every language.
  let lang = 'en';
  let C = CONTENT.en;
  let LOCALE = 'en-US';
  // Set by embedded builds whose host frame blocks file downloads.
  const EMBED = !!window.LC_EMBED;
  const STORE_KEY = 'life-changer:v1';
  const ROUTES = ['start', 'ideas', 'morning', 'day', 'evening', 'game', 'review'];
  const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
  const INSTALLED = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  const view = document.getElementById('view');
  const toastEl = document.getElementById('toast');
  const noticeEl = document.getElementById('notice');

  /* ---------- state ---------- */

  function blankState() {
    return {
      answers: {},
      quests: {},
      times: {},
      pos: { morning: 0, evening: 0 },
      loop: 0,
      stage: 3,
      run: null, // { start: 'YYYY-MM-DD' }, set when the first answer is written
      cycle: null, // { n, start } for the one-month project in play
      months: [], // closed months, oldest first
      past: [], // earlier runs of the protocol, kept as readable text
      remindAt: 8 * 60,
      lastBackup: null,
      lang: null // 'en' or 'es' once chosen; until then it follows the browser
    };
  }

  // Takes anything (an old save, a pasted backup) and returns a complete, well-formed state.
  function normalise(saved) {
    const base = blankState();
    if (!saved || typeof saved !== 'object') return base;
    const entries = (obj) => (obj && typeof obj === 'object' ? Object.keys(obj).map((key) => [key, obj[key]]) : []);
    const text = (value) => (typeof value === 'string' ? value : '');
    const dated = (value) => (value && typeof value === 'object' && DATE_KEY.test(value.start) ? value : null);

    entries(saved.answers).forEach(([key, value]) => {
      if (typeof value === 'string') base.answers[key] = value;
    });
    entries(saved.quests).forEach(([key, value]) => {
      if (!DATE_KEY.test(key) || !value || !Array.isArray(value.done)) return;
      base.quests[key] = { done: value.done.filter((item) => typeof item === 'string'), n: Number(value.n) || 0 };
    });
    entries(saved.times).forEach(([key, value]) => {
      if (Number.isInteger(value) && value >= 0 && value < 24 * 60) base.times[key] = value;
    });
    Object.assign(base.pos, saved.pos);
    base.loop = Number(saved.loop) || 0;
    if (Number.isInteger(saved.stage)) base.stage = saved.stage;
    if (dated(saved.run)) base.run = { start: saved.run.start };
    if (dated(saved.cycle)) base.cycle = { n: Number(saved.cycle.n) || 1, start: saved.cycle.start };
    if (Array.isArray(saved.months)) {
      base.months = saved.months
        .filter((m) => dated(m) && DATE_KEY.test(m.end))
        .map((m) => ({
          n: Number(m.n) || 1,
          start: m.start,
          end: m.end,
          project: text(m.project),
          result: text(m.result),
          compare: text(m.compare),
          adjust: text(m.adjust),
          full: Number(m.full) || 0,
          days: Number(m.days) || 0
        }));
    }
    if (Array.isArray(saved.past)) {
      base.past = saved.past
        .filter((p) => dated(p) && DATE_KEY.test(p.end))
        .map((p) => ({ start: p.start, end: p.end, text: text(p.text) }));
    }
    if (Number.isInteger(saved.remindAt) && saved.remindAt >= 0 && saved.remindAt < 24 * 60) base.remindAt = saved.remindAt;
    if (typeof saved.lastBackup === 'string') base.lastBackup = saved.lastBackup;
    if (LANGS.includes(saved.lang)) base.lang = saved.lang;
    return base;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return normalise(raw ? JSON.parse(raw) : null);
    } catch (err) {
      return blankState();
    }
  }

  let state = loadState();
  let storageOk = true;
  let saveTimer = 0;

  function flush() {
    clearTimeout(saveTimer);
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
      storageOk = true;
    } catch (err) {
      storageOk = false;
    }
    paintNotice();
  }

  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, 250);
  }

  function paintNotice() {
    noticeEl.hidden = storageOk;
    noticeEl.innerHTML = storageOk
      ? ''
      : '<p>' + t('notice.storage') + '</p>';
  }

  /* ---------- helpers ---------- */

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
  const answer = (key) => (state.answers[key] || '').trim();
  const filled = (key) => answer(key) !== '';
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pad = (n) => String(n).padStart(2, '0');

  // Interface text in the current language, falling back to English. {name} is filled from vars.
  function t(key, vars) {
    let text = C.ui[key];
    if (text === undefined) text = CONTENT.en.ui[key];
    if (text === undefined) return key;
    return vars ? text.replace(/\{(\w+)\}/g, (match, name) => (name in vars ? vars[name] : match)) : text;
  }
  // The same, choosing the singular or plural wording by n.
  const tn = (key, n, vars) => t(key + (n === 1 ? '.one' : '.other'), Object.assign({ n: n }, vars));
  // "3 days", "1 quest": a count with its unit.
  const plural = (n, unit) => n + ' ' + t('unit.' + unit + (n === 1 ? '.one' : '.other'));

  function flatQuestions(phase) {
    return C[phase].groups.flatMap((group) =>
      group.questions.map((q, i) => Object.assign({}, q, { group: group.name, groupIntro: i === 0 ? group.intro : '' }))
    );
  }

  let QUESTIONS = { morning: flatQuestions('morning'), evening: flatQuestions('evening') };

  const KEYS = {
    morning: QUESTIONS.morning.map((q) => q.id),
    day: C.day.checkins.map((c) => c.id),
    evening: QUESTIONS.evening.map((q) => q.id),
    game: C.game.tiles.map((tile) => tile.key)
  };

  const countDone = (phase) => KEYS[phase].filter(filled).length;

  // Every key the protocol itself asks for (the monthly review drafts are not part of it).
  const PROTOCOL_KEYS = KEYS.morning.concat(KEYS.day, C.day.extras.map((x) => x.id), KEYS.evening);

  function currentRoute() {
    const name = location.hash.replace(/^#/, '');
    if (ROUTES.includes(name)) return name;
    // Once the board is filled in, it is the home screen.
    return KEYS.game.every(filled) ? 'game' : 'start';
  }

  // Date and time formats follow the chosen language; applyLanguage() builds them.
  let timeFormat, shortDate, longDate, datedDay;
  const atTime = (minutes) => new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60);
  const formatTime = (minutes) => timeFormat.format(atTime(minutes));
  const formatTimeShort = (minutes) =>
    timeFormat
      .formatToParts(atTime(minutes))
      .filter((part) => part.type !== 'dayPeriod')
      .map((part) => part.value)
      .join('')
      .trim();

  const dateKey = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  const parseKey = (key) => {
    const parts = key.split('-').map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  const dayDiff = (from, to) => Math.round((startOfDay(to) - startOfDay(from)) / 86400000);
  // Same day of the month n months on, pulled back to the month's last day when it is shorter.
  const addMonths = (d, n) => {
    const first = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const lastDay = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    return new Date(first.getFullYear(), first.getMonth(), Math.min(d.getDate(), lastDay));
  };
  const dateRange = (from, to) => t('common.range', { a: shortDate.format(from), b: shortDate.format(to) });
  const minutesNow = () => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  };

  function fit(textarea) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 2 + 'px';
  }

  // Shows an earlier answer next to a question that builds on it.
  function recallHtml(recall) {
    if (!recall || !filled(recall.key)) return '';
    return `<blockquote class="recall"><span class="recall-label">${esc(recall.label)}</span><p>${esc(answer(recall.key))}</p></blockquote>`;
  }

  let toastTimer = 0;
  function toast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), 2800);
  }

  /* ---------- start ---------- */

  function nextStep() {
    const order = ['morning', 'day', 'evening', 'game'];
    if (!order.some((route) => countDone(route) > 0)) return { route: 'morning', label: t('start.begin') };
    const next = order.find((route) => countDone(route) < KEYS[route].length);
    if (!next) return { route: 'game', label: t('start.open') };
    return { route: next, label: t('start.continue.' + next) };
  }

  function startView() {
    const S = C.start;
    const next = nextStep();
    const total = KEYS.morning.length + KEYS.day.length + KEYS.evening.length;
    return `
      <header class="hero">
        <p class="eyebrow"><span class="dot"></span>${esc(S.eyebrow)}</p>
        <h1>${esc(S.title)}</h1>
        <p class="lede">${t('start.lede', { author: esc(C.source.author), title: esc(C.source.title), total: total })}</p>
        <div class="actions">
          <a class="btn btn-primary" href="#${next.route}">${esc(next.label)}</a>
          <a class="btn" href="#ideas">${t('start.readIdea')}</a>
        </div>
      </header>

      <section aria-labelledby="plan-h">
        <h2 id="plan-h" class="section-h">${t('start.yourDay')}</h2>
        <ol class="plan">
          ${S.plan
            .map((row) => {
              const year = row.year ? yearInfo() : null;
              const done = countDone(row.route);
              const all = KEYS[row.route].length;
              const share = row.year ? (year ? clamp(year.day / year.length, 0, 1) : 0) : done / all;
              const tally = row.year ? (year ? t('start.dayN', { n: Math.min(year.day, year.length) }) : '–') : done + '/' + all;
              return `
                <li data-route="${row.route}">
                  <a href="#${row.route}">
                    <span class="plan-mark" style="--p:${share.toFixed(3)}"></span>
                    <span class="plan-name">${esc(row.name)} <span class="plan-kind">· ${esc(row.kind)}</span></span>
                    <span class="plan-count mono">${esc(tally)}</span>
                    <span class="plan-text">${esc(row.text)}</span>
                  </a>
                </li>`;
            })
            .join('')}
        </ol>
      </section>

      <section aria-labelledby="notes-h">
        <h2 id="notes-h" class="section-h">${t('start.know')}</h2>
        <ul class="notes">
          ${S.notes.map((note) => `<li><h3>${esc(note.title)}</h3><p>${esc(note.text)}</p></li>`).join('')}
        </ul>
      </section>`;
  }

  /* ---------- ideas ---------- */

  function ringHtml() {
    const steps = C.ideas.loop.steps;
    const radius = 37;
    const arc = 360 / steps.length;
    const point = (deg) => {
      const rad = (deg * Math.PI) / 180;
      return { x: 50 + radius * Math.cos(rad), y: 50 + radius * Math.sin(rad) };
    };
    const cutIndex = C.ideas.loop.breakAfter - 1;
    const arrows = steps
      .map((_, i) => {
        const deg = -90 + (i + 0.5) * arc;
        const p = point(deg);
        if (i === cutIndex) {
          // Local x runs along the radius here, so this draws two short strokes across the ring.
          return `<g class="ring-cut" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${deg})">
            <rect x="-2" y="-1.4" width="4" height="2.8"/><path d="M-3.6,-1.4 L3.6,-1.4 M-3.6,1.4 L3.6,1.4"/></g>`;
        }
        return `<path class="ring-arrow" d="M-1.6,-1.5 L1.8,0 L-1.6,1.5 Z" transform="translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${deg + 90})"/>`;
      })
      .join('');
    const nodes = steps
      .map((step, i) => {
        const p = point(-90 + i * arc);
        return `<button type="button" class="ring-node" data-act="loop-go" data-i="${i}" aria-pressed="false"
          aria-label="${t('ideas.stepLabel', { n: i + 1, title: esc(step.title) })}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%">${i + 1}</button>`;
      })
      .join('');
    return `
      <div class="ring">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <circle class="ring-path" cx="50" cy="50" r="${radius}"/>
          ${arrows}
        </svg>
        ${nodes}
        <div class="ring-center" aria-hidden="true">
          <span class="mono" id="loop-count"></span>
          <span class="ring-title" id="loop-title"></span>
        </div>
      </div>`;
  }

  function paintLoop() {
    const steps = C.ideas.loop.steps;
    const i = clamp(state.loop, 0, steps.length - 1);
    view.querySelectorAll('.ring-node').forEach((node, n) => node.setAttribute('aria-pressed', String(n === i)));
    document.getElementById('loop-count').textContent = t('common.nOfM', { n: i + 1, m: steps.length });
    document.getElementById('loop-title').textContent = steps[i].title;
    document.getElementById('loop-text').innerHTML =
      '<strong>' + esc(steps[i].title) + '.</strong> ' + esc(steps[i].text);
  }

  function loopHtml() {
    return `
      <div class="loop">
        ${ringHtml()}
        <div class="loop-panel">
          <p class="loop-text" id="loop-text" aria-live="polite"></p>
          <div class="actions">
            <button type="button" class="btn" data-act="loop-prev">${t('ideas.prev')}</button>
            <button type="button" class="btn btn-primary" data-act="loop-next">${t('ideas.next')}</button>
          </div>
        </div>
      </div>`;
  }

  function stagesHtml() {
    const S = C.ideas.stages;
    return `
      <ol class="stages" lang="${lang}">
        ${S.items
          .map((stage, i) => {
            const inRange = i + 1 >= S.range[0] && i + 1 <= S.range[1];
            return `<li><button type="button" class="stage${inRange ? ' in-range' : ''}" data-act="stage" data-i="${i}"
              aria-pressed="false"><span class="mono">${i + 1}</span>${esc(stage.name)}</button></li>`;
          })
          .join('')}
      </ol>
      <p class="stage-text" id="stage-text" aria-live="polite"></p>
      <p class="small">${esc(S.note)}</p>`;
  }

  function paintStage() {
    const items = C.ideas.stages.items;
    const i = clamp(state.stage, 0, items.length - 1);
    view.querySelectorAll('.stage').forEach((button, n) => button.setAttribute('aria-pressed', String(n === i)));
    document.getElementById('stage-text').innerHTML =
      '<strong>' + (i + 1) + '. ' + esc(items[i].name) + '.</strong> ' + esc(items[i].text);
  }

  function blockHtml(block) {
    if (block.p) return `<p class="body">${esc(block.p)}</p>`;
    if (block.callout) return `<p class="callout">${esc(block.callout)}</p>`;
    if (block.loop) return loopHtml();
    if (block.stages) return stagesHtml();
    if (block.chain) return `<ol class="chain">${block.chain.map((link) => `<li><span>${esc(link)}</span></li>`).join('')}</ol>`;
    if (block.list) return `<ol class="numbered">${block.list.map((item) => `<li>${esc(item)}</li>`).join('')}</ol>`;
    if (block.table) {
      return `
        <table class="pairs">
          <thead><tr>${block.table.head.map((cell) => `<th scope="col">${esc(cell)}</th>`).join('')}</tr></thead>
          <tbody>${block.table.rows.map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>`;
    }
    return '';
  }

  function ideasView() {
    const I = C.ideas;
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(I.eyebrow)}</p>
        <h1>${esc(I.title)}</h1>
        <p class="lede">${esc(I.intro)}</p>
      </header>

      ${I.sections
        .map(
          (section, i) => `
          <section class="idea" aria-labelledby="idea-h-${i}">
            <p class="eyebrow">${t('ideas.count', { n: i + 1, m: I.sections.length })}</p>
            <h2 id="idea-h-${i}" class="section-h">${esc(section.title)}</h2>
            ${section.blocks.map(blockHtml).join('')}
          </section>`
        )
        .join('')}

      <div class="actions">
        <a class="btn btn-primary" href="#morning">${t('ideas.toMorning')}</a>
      </div>`;
  }

  /* ---------- stepper (morning, evening) ---------- */

  function stepperView(phase) {
    const P = C[phase];
    const questions = QUESTIONS[phase];
    const i = clamp(state.pos[phase] || 0, 0, questions.length - 1);
    const q = questions[i];
    const last = i === questions.length - 1;

    let offset = 0;
    const segs = P.groups
      .map((group) => {
        const html = group.questions
          .map((gq, n) => {
            const index = offset + n;
            const classes = ['seg', filled(gq.id) ? 'is-filled' : '', index === i ? 'is-current' : ''].join(' ');
            return `<button type="button" class="${classes}" data-act="goto" data-i="${index}" data-seg="${esc(gq.id)}"
              aria-label="${t('step.segLabel', { group: esc(group.name), n: n + 1 })}"${index === i ? ' aria-current="step"' : ''}></button>`;
          })
          .join('');
        offset += group.questions.length;
        return `<div class="seg-group" style="flex:${group.questions.length}">${html}</div>`;
      })
      .join('');

    const forward = last
      ? `<a class="btn btn-primary" href="#${P.done.route}">${esc(P.done.label)}</a>`
      : `<button type="button" class="btn btn-primary" data-act="next">${t('step.next')}</button>`;

    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(P.eyebrow)}</p>
        <h1>${esc(P.title)}</h1>
      </header>

      ${phase === 'evening' ? reviewHtml() : ''}

      <section class="step" aria-labelledby="q-title">
        <div class="segs" role="group" aria-label="${t('step.questions')}">${segs}</div>
        <p class="step-meta mono">${esc(q.group)} · ${t('common.nOfM', { n: i + 1, m: questions.length })}</p>
        ${q.groupIntro ? `<p class="group-intro">${esc(q.groupIntro)}</p>` : ''}
        <h2 id="q-title" tabindex="-1">${esc(q.prompt)}</h2>
        ${q.hint ? `<p class="hint">${esc(q.hint)}</p>` : ''}
        ${recallHtml(q.recall)}
        <label class="sr-only" for="f-${esc(q.id)}">${t('step.answer')}</label>
        <textarea id="f-${esc(q.id)}" data-key="${esc(q.id)}" rows="6"
          placeholder="${esc(q.placeholder || t('step.placeholder'))}"></textarea>
        <div class="step-nav">
          <button type="button" class="btn" data-act="prev"${i === 0 ? ' disabled' : ''}>${t('step.back')}</button>
          <span class="saved">${t('step.saved')}</span>
          ${forward}
        </div>
      </section>`;
  }

  // Everything written earlier in the day, for rereading before the evening questions.
  function reviewHtml() {
    const items = QUESTIONS.morning
      .map((q) => ({ id: q.id, label: q.prompt }))
      .concat(C.day.checkins.map((c) => ({ id: c.id, label: formatTime(timeOf(c)) + '  ' + c.prompt })))
      .concat(C.day.extras.map((x) => ({ id: x.id, label: x.prompt })))
      .filter((item) => filled(item.id));
    if (!items.length) return '';
    return `
      <details class="review">
        <summary>${t('step.reread', { n: items.length })}</summary>
        <dl>${items.map((item) => `<dt>${esc(item.label)}</dt><dd>${esc(answer(item.id))}</dd>`).join('')}</dl>
      </details>`;
  }

  function moveStep(phase, index) {
    state.pos[phase] = clamp(index, 0, QUESTIONS[phase].length - 1);
    flush();
    render();
    window.scrollTo(0, 0);
    const title = document.getElementById('q-title');
    if (title) title.focus({ preventScroll: true });
  }

  /* ---------- day ---------- */

  // A check-in fires at the suggested time unless the person picked their own.
  function timeOf(checkin) {
    const own = state.times[checkin.id];
    return Number.isInteger(own) ? own : checkin.at;
  }

  const sortedCheckins = () => C.day.checkins.slice().sort((a, b) => timeOf(a) - timeOf(b));
  const firstCheckinTime = () => Math.min.apply(null, C.day.checkins.map(timeOf));

  // The timeline spans 10:00 to 22:00 and widens by whole hours if a custom time falls outside.
  function railRange() {
    const times = C.day.checkins.map(timeOf);
    const earliest = Math.floor(Math.min.apply(null, times) / 60) * 60 - 60;
    const latest = Math.ceil(Math.max.apply(null, times) / 60) * 60 + 60;
    return { start: Math.max(0, Math.min(10 * 60, earliest)), end: Math.min(24 * 60, Math.max(22 * 60, latest)) };
  }

  function checkinState(checkin, now) {
    if (filled(checkin.id)) return 'done';
    return now >= timeOf(checkin) ? 'due' : 'later';
  }

  function dayView() {
    const D = C.day;
    const range = railRange();
    const customised = Object.keys(state.times).length > 0;
    const ticks = D.checkins
      .map((c, i) => {
        const at = timeOf(c);
        const left = ((at - range.start) / (range.end - range.start)) * 100;
        return `<button type="button" class="rail-tick" data-act="jump" data-i="${i}" data-tick="${esc(c.id)}"
          style="left:${left.toFixed(2)}%" aria-label="${t('day.goTo', { time: esc(formatTime(at)) })}">
          <span class="rail-dot"></span><span>${esc(formatTimeShort(at))}</span></button>`;
      })
      .join('');

    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(D.eyebrow)}</p>
        <h1>${esc(D.title)}</h1>
        <p class="lede">${esc(D.intro)}</p>
      </header>

      <section aria-label="${t('day.schedule')}" data-copy-host>
        <div class="rail-box">
          <div class="rail">
            <div class="rail-track"></div>
            ${ticks}
            <div class="rail-now" id="rail-now" hidden><span>${t('day.now')}</span></div>
          </div>
        </div>
        <p class="small body">${esc(D.remind)}</p>
        <div class="actions">
          <button type="button" class="btn" data-act="copy-schedule">${t('day.copySchedule')}</button>
          <button type="button" class="btn" data-act="ics" data-standalone>${t(minutesNow() >= firstCheckinTime() ? 'day.addCalTomorrow' : 'day.addCalToday')}</button>
          ${customised ? `<button type="button" class="btn" data-act="reset-times">${t('day.resetTimes')}</button>` : ''}
        </div>
      </section>

      <section aria-label="${t('day.checkins')}">
        <ol class="checkins">
          ${D.checkins
            .map(
              (c, i) => `
              <li class="checkin" id="ci-${i}" data-checkin="${esc(c.id)}">
                <div class="ci-head">
                  <label class="sr-only" for="time-${esc(c.id)}">${t('day.reminderTime')}</label>
                  <input type="time" class="ci-time" id="time-${esc(c.id)}" data-time="${esc(c.id)}"
                    value="${pad(Math.floor(timeOf(c) / 60))}:${pad(timeOf(c) % 60)}">
                  <span class="badge"></span>
                </div>
                <h2 id="ci-h-${i}">${esc(c.prompt)}</h2>
                ${c.hint ? `<p class="small">${esc(c.hint)}</p>` : ''}
                <textarea id="f-${esc(c.id)}" data-key="${esc(c.id)}" rows="2" aria-labelledby="ci-h-${i}"
                  placeholder="${t('day.placeholder')}"></textarea>
              </li>`
            )
            .join('')}
        </ol>
      </section>

      <section aria-labelledby="extras-h">
        <h2 id="extras-h" class="section-h">${esc(D.extraTitle)}</h2>
        <p class="body small">${esc(D.extraIntro)}</p>
        <div class="extras">
          ${D.extras
            .map(
              (x) => `
              <div class="extra">
                <h3 id="x-h-${esc(x.id)}">${esc(x.prompt)}</h3>
                ${x.hint ? `<p class="small">${esc(x.hint)}</p>` : ''}
                ${recallHtml(x.recall)}
                <textarea id="f-${esc(x.id)}" data-key="${esc(x.id)}" rows="2" aria-labelledby="x-h-${esc(x.id)}"
                  placeholder="${t('day.optional')}"></textarea>
              </div>`
            )
            .join('')}
        </div>
      </section>

      <div class="actions">
        <a class="btn btn-primary" href="#evening">${t('day.toEvening')}</a>
      </div>`;
  }

  function paintDay() {
    if (currentRoute() !== 'day') return;
    const now = minutesNow();
    C.day.checkins.forEach((c) => {
      const s = checkinState(c, now);
      const card = view.querySelector('[data-checkin="' + c.id + '"]');
      const tick = view.querySelector('[data-tick="' + c.id + '"]');
      if (card) {
        card.dataset.state = s;
        card.querySelector('.badge').textContent = t('day.state.' + s);
      }
      if (tick) tick.dataset.state = s;
    });
    const marker = document.getElementById('rail-now');
    if (marker) {
      const range = railRange();
      const inRange = now >= range.start && now <= range.end;
      const left = ((now - range.start) / (range.end - range.start)) * 100;
      marker.hidden = !inRange;
      marker.style.left = left.toFixed(2) + '%';
      marker.classList.toggle('flip', left > 80);
    }
  }

  // Reminders go on today's calendar until the first one has passed, then on tomorrow's.
  function reminderDate() {
    const d = new Date();
    if (minutesNow() >= firstCheckinTime()) d.setDate(d.getDate() + 1);
    return d;
  }

  function scheduleText() {
    return sortedCheckins().map((c) => formatTime(timeOf(c)) + '  ' + c.prompt).join('\n');
  }

  // Builds a calendar file. Each event is { uid, date, at, summary, description, rrule }.
  function icsCalendar(events) {
    const ymd = (d) => '' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate());
    const hm = (minutes) => pad(Math.floor(minutes / 60)) + pad(minutes % 60) + '00';
    const icsEscape = (text) => text.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
    // RFC 5545 wants lines folded at 75 octets; fold at 60 characters to stay clear of it.
    const fold = (line) => line.replace(/(.{60})(?=.)/g, '$1\r\n ');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Life Changer//One-day reset//EN', 'CALSCALE:GREGORIAN'];
    events.forEach((event) => {
      const summary = icsEscape(event.summary);
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + event.uid + '@life-changer',
        'DTSTAMP:' + stamp,
        'DTSTART:' + ymd(event.date) + 'T' + hm(event.at),
        'DTEND:' + ymd(event.date) + 'T' + hm(Math.min(event.at + 10, 24 * 60 - 1))
      );
      if (event.rrule) lines.push('RRULE:' + event.rrule);
      lines.push(
        'SUMMARY:' + summary,
        'DESCRIPTION:' + icsEscape(event.description),
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + summary,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }

  function icsText() {
    const day = reminderDate();
    return icsCalendar(
      sortedCheckins().map((c) => ({
        uid: dateKey(day) + '-' + c.id,
        date: day,
        at: timeOf(c),
        summary: c.prompt,
        description: t('ics.checkin')
      }))
    );
  }

  // A daily reminder for the quests until the year is up, and a monthly one for the review.
  function yearIcsText() {
    const at = state.remindAt;
    const today = startOfDay(new Date());
    const first = minutesNow() < at ? today : addDays(today, 1);
    const year = yearInfo();
    const days = year && !year.over ? Math.max(1, dayDiff(first, year.end)) : 365;
    const where = location.href.split('#')[0];
    const events = [
      {
        uid: 'daily-' + dateKey(first),
        date: first,
        at: at,
        rrule: 'FREQ=DAILY;COUNT=' + days,
        summary: t('ics.dailySummary'),
        description: t('ics.dailyDesc') + ' ' + where
      }
    ];
    const cycle = cycleInfo();
    if (cycle) {
      const due = cycle.end > today ? cycle.end : first;
      events.push({
        uid: 'monthly-' + dateKey(due),
        date: due,
        at: at,
        rrule: 'FREQ=MONTHLY;COUNT=12',
        summary: t('ics.monthlySummary'),
        description: t('ics.monthlyDesc') + ' ' + where + '#review'
      });
    }
    return icsCalendar(events);
  }

  /* ---------- the year: clocks and quest history ---------- */

  // Starts the year clock at the first answer and the month clock when a project is first written.
  function syncDates() {
    const todayKey = dateKey(new Date());
    if (!state.run && PROTOCOL_KEYS.some(filled)) {
      const firstLogged = Object.keys(state.quests).sort()[0];
      state.run = { start: firstLogged && firstLogged < todayKey ? firstLogged : todayKey };
    }
    if (!state.cycle && filled('month')) state.cycle = { n: state.months.length + 1, start: todayKey };
  }

  function yearInfo() {
    if (!state.run) return null;
    const start = parseKey(state.run.start);
    const end = addMonths(start, 12);
    const length = dayDiff(start, end);
    const day = dayDiff(start, new Date()) + 1;
    return { start: start, end: end, length: length, day: day, over: day > length };
  }

  function cycleInfo() {
    if (!state.cycle) return null;
    const start = parseKey(state.cycle.start);
    const end = addMonths(start, 1);
    const left = dayDiff(new Date(), end);
    return { n: state.cycle.n, start: start, end: end, left: left, due: left <= 0 };
  }

  // Quests done and quests set on a given day. Today is counted against the current list.
  function dayRecord(key) {
    const rec = state.quests[key];
    if (key === dateKey(new Date())) {
      const quests = questList();
      return { done: rec ? quests.filter((text) => rec.done.includes(text)).length : 0, total: quests.length };
    }
    return rec ? { done: Math.min(rec.done.length, rec.n), total: rec.n } : { done: 0, total: 0 };
  }

  function dayStatus(key) {
    const rec = dayRecord(key);
    if (!rec.total || !rec.done) return 'none';
    return rec.done >= rec.total ? 'full' : 'some';
  }

  // Counts days in [from, to) and how many of them had every quest done.
  function countFullDays(from, to) {
    let days = 0;
    let full = 0;
    for (let d = startOfDay(from); d < to; d = addDays(d, 1)) {
      days += 1;
      if (dayStatus(dateKey(d)) === 'full') full += 1;
    }
    return { days: days, full: full };
  }

  // Full days in a row, ending today, or yesterday while today is still open.
  function currentStreak() {
    let d = startOfDay(new Date());
    if (dayStatus(dateKey(d)) !== 'full') d = addDays(d, -1);
    let streak = 0;
    while (dayStatus(dateKey(d)) === 'full') {
      streak += 1;
      d = addDays(d, -1);
    }
    return streak;
  }

  function readoutText(key) {
    const rec = dayRecord(key);
    const date = longDate.format(parseKey(key));
    return rec.total
      ? t('readout.some', { date: date, done: rec.done, quests: plural(rec.total, 'quest') })
      : t('readout.none', { date: date });
  }

  /* ---------- game ---------- */

  function questList() {
    return (state.answers.daily || '')
      .split('\n')
      .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, '').trim())
      .filter(Boolean);
  }

  function questsHtml() {
    const quests = questList();
    const today = startOfDay(new Date());
    const record = state.quests[dateKey(today)] || { done: [], n: 0 };
    const dateLabel = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
    const weekday = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });

    const list = quests.length
      ? `<ul class="quest-list">
          ${quests
            .map(
              (text, i) => `
              <li><label>
                <input type="checkbox" id="quest-${i}" data-quest="${i}"${record.done.includes(text) ? ' checked' : ''}>
                <span>${esc(text)}</span>
              </label></li>`
            )
            .join('')}
        </ul>`
      : '<p class="callout">' + t('quests.empty') + '</p>';

    const cells = [];
    for (let back = 6; back >= 0; back--) {
      const day = addDays(today, -back);
      const rec = dayRecord(dateKey(day));
      cells.push(`
        <li class="${back === 0 ? 'is-today' : ''}">
          <span>${esc(weekday.format(day))}</span>
          <span class="week-bar" style="--f:${rec.total ? rec.done / rec.total : 0}"></span>
          <span>${rec.total ? rec.done + '/' + rec.total : '–'}</span>
        </li>`);
    }

    return `
      <div class="quest-head">
        <h2 id="quests-h" class="section-h">${t('quests.title')}</h2>
        <span class="mono">${esc(dateLabel)}</span>
      </div>
      ${list}
      <ol class="week" aria-label="${t('quests.weekLabel')}">${cells.join('')}</ol>`;
  }

  function toggleQuest(index, checked) {
    const quests = questList();
    const text = quests[index];
    if (text === undefined) return;
    const key = dateKey(new Date());
    const record = state.quests[key] || { done: [], n: 0 };
    const kept = record.done.filter((item) => item !== text && quests.includes(item));
    if (checked) kept.push(text);
    state.quests[key] = { done: kept, n: quests.length };
    save();
    paintQuests();
    paintYear();
    const box = document.getElementById('quest-' + index);
    if (box) box.focus();
  }

  function paintQuests() {
    const host = document.getElementById('quests');
    if (host) host.innerHTML = questsHtml();
  }

  function paintYear() {
    const host = document.getElementById('year');
    if (host) host.innerHTML = yearHtml();
  }

  function statusHtml() {
    const year = yearInfo();
    if (!year) return '';
    const cycle = cycleInfo();
    const parts = [year.over ? t('status.yearComplete') : t('status.day', { n: year.day, m: year.length })];
    if (cycle && !year.over) {
      parts.push(t('status.month', { n: cycle.n }), cycle.due ? t('status.reviewDue') : tn('status.left', cycle.left));
    }
    let alert = '';
    if (year.over) {
      alert = `
        <div class="alert">
          <p>${t('status.yearUp')}</p>
          <div class="actions"><button type="button" class="btn btn-primary" data-act="newrun-ask">${t('again.newRun')}</button></div>
        </div>`;
    } else if (cycle && cycle.due) {
      alert = `
        <div class="alert">
          <p>${t('status.monthUp', { n: cycle.n })}</p>
          <div class="actions"><a class="btn btn-primary" href="#review">${t('status.reviewMonth', { n: cycle.n })}</a></div>
        </div>`;
    }
    return `
      <section class="status" aria-label="${t('status.label')}">
        <p class="status-line mono">${esc(parts.join(' · '))}</p>
        <div class="yearbar" style="--p:${clamp(year.day / year.length, 0, 1).toFixed(4)}"></div>
        ${alert}
      </section>`;
  }

  // One row per calendar month, one square per day, shaded by how many quests got done.
  function yearHtml() {
    const year = yearInfo();
    if (!year) return '';
    const today = startOfDay(new Date());
    const lastDay = today < year.end ? today : addDays(year.end, -1);
    const stats = countFullDays(year.start, addDays(lastDay, 1));
    const streak = currentStreak();
    const monthName = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
    const rows = [];
    for (let first = new Date(year.start.getFullYear(), year.start.getMonth(), 1); first < year.end; first = new Date(first.getFullYear(), first.getMonth() + 1, 1)) {
      const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
      let cells = '';
      for (let day = 1; day <= 31; day++) {
        const date = new Date(first.getFullYear(), first.getMonth(), day);
        const inYear = day <= daysInMonth && date >= year.start && date < year.end;
        const status = !inYear ? 'void' : date > today ? 'future' : dayStatus(dateKey(date));
        const logged = status !== 'void' && status !== 'future';
        const isToday = inYear && date.getTime() === today.getTime();
        cells += `<span class="cell${isToday ? ' is-today' : ''}" data-s="${status}"${logged ? ` data-day="${dateKey(date)}"` : ''}></span>`;
      }
      rows.push(`<div class="year-row"><span class="year-month">${esc(monthName.format(first))}</span>${cells}</div>`);
    }
    const axis = Array.from({ length: 31 }, (_, i) => `<span>${[1, 8, 15, 22, 29].includes(i + 1) ? i + 1 : ''}</span>`).join('');
    const summary =
      t('year.summary', { full: stats.full, days: plural(stats.days, 'day') }) + (streak > 1 ? t('year.streak', { n: streak }) : '');
    return `
      <h2 id="year-h" class="section-h">${t('year.title')}</h2>
      <p class="body small">${esc(summary)}. ${t('year.help')}</p>
      <div class="year" role="img" aria-label="${t('year.aria')} ${esc(summary)}.">
        <div class="year-row year-axis" aria-hidden="true"><span></span>${axis}</div>
        ${rows.join('')}
      </div>
      <p class="readout mono" id="year-readout">${esc(readoutText(dateKey(lastDay)))}</p>
      <ul class="legend" aria-hidden="true">
        <li><span class="cell" data-s="none"></span>${t('year.legend.none')}</li>
        <li><span class="cell" data-s="some"></span>${t('year.legend.some')}</li>
        <li><span class="cell" data-s="full"></span>${t('year.legend.full')}</li>
      </ul>`;
  }

  function monthsHtml() {
    const cycle = cycleInfo();
    if (!cycle && !state.months.length) return '';
    const current = cycle
      ? `<p class="body small">${t('months.current', { n: cycle.n, range: esc(dateRange(cycle.start, cycle.end)) })}</p>`
      : '';
    const blank = t('common.blank');
    const closed = state.months
      .slice()
      .reverse()
      .map(
        (m) => `
        <details class="review">
          <summary>${esc(t('months.summary', { n: m.n, range: dateRange(parseKey(m.start), parseKey(m.end)), full: m.full, days: m.days }))}</summary>
          <dl>
            <dt>${t('months.project')}</dt><dd>${esc(m.project || blank)}</dd>
            <dt>${t('months.result')}</dt><dd>${esc(m.result || blank)}</dd>
            <dt>${t('months.compare')}</dt><dd>${esc(m.compare || blank)}</dd>
            <dt>${t('months.adjust')}</dt><dd>${esc(m.adjust || blank)}</dd>
          </dl>
        </details>`
      )
      .join('');
    return `
      <section aria-labelledby="months-h">
        <h2 id="months-h" class="section-h">${t('months.title')}</h2>
        ${current}
        ${closed}
      </section>`;
  }

  function pastHtml() {
    if (!state.past.length) return '';
    return `
      <h3 class="past-h">${t('past.title')}</h3>
      ${state.past
        .map(
          (run, i) => `
          <details class="review" data-copy-host>
            <summary>${esc(t('common.range', { a: datedDay.format(parseKey(run.start)), b: datedDay.format(parseKey(run.end)) }))}</summary>
            <pre class="past-text">${esc(run.text)}</pre>
            <div class="actions past-actions"><button type="button" class="btn" data-act="copy-past" data-i="${i}">${t('past.copy')}</button></div>
          </details>`
        )
        .join('')}`;
  }

  function backupLine() {
    if (!state.lastBackup) return t('backup.never');
    const days = dayDiff(new Date(state.lastBackup), new Date());
    return days <= 0 ? t('backup.today') : t('backup.ago', { days: plural(days, 'day') });
  }

  function gameView() {
    const G = C.game;
    const ready = KEYS.game.every(filled);
    const cycle = cycleInfo();
    const monthMeta = !cycle
      ? ''
      : cycle.due
        ? t('game.monthDue', { n: cycle.n })
        : t('game.monthEnds', { n: cycle.n, date: shortDate.format(cycle.end) });
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(G.eyebrow)}</p>
        <h1>${esc(G.title)}</h1>
        ${ready ? '' : `<p class="lede">${esc(G.intro)}</p>`}
      </header>

      ${statusHtml()}

      <section id="quests" aria-labelledby="quests-h">${questsHtml()}</section>

      <section aria-labelledby="board-h">
        <h2 id="board-h" class="section-h">${t('game.pieces')}</h2>
        <div class="board">
          ${G.tiles
            .map(
              (tile) => `
              <div class="tile">
                <span class="tile-mech">${esc(tile.mechanic)}</span>
                <h3 id="tile-h-${esc(tile.key)}">${esc(tile.name)}</h3>
                ${tile.key === 'month' && monthMeta ? `<span class="tile-meta">${esc(monthMeta)}</span>` : ''}
                <textarea id="b-${esc(tile.key)}" data-key="${esc(tile.key)}" rows="3" aria-labelledby="tile-h-${esc(tile.key)}"
                  placeholder="${esc(tile.prompt)}"></textarea>
              </div>`
            )
            .join('')}
        </div>
      </section>

      ${state.run ? `<section id="year" aria-labelledby="year-h">${yearHtml()}</section>` : ''}

      ${monthsHtml()}

      <section aria-labelledby="stay-h">
        <h2 id="stay-h" class="section-h">${t('stay.title')}</h2>
        <p class="body small" data-standalone>${t('stay.intro')}</p>
        <div class="actions" data-standalone>
          <label class="sr-only" for="remind-at">${t('stay.time')}</label>
          <input type="time" class="ci-time" id="remind-at" data-remind
            value="${pad(Math.floor(state.remindAt / 60))}:${pad(state.remindAt % 60)}">
          <button type="button" class="btn" data-act="year-ics">${t('stay.add')}</button>
        </div>
        <p class="body small" data-embed>${t('stay.embed')}</p>
        ${INSTALLED ? '' : `<p class="callout" data-standalone>${t('stay.install')}</p>`}
      </section>

      <section aria-labelledby="keep-h" data-copy-host>
        <h2 id="keep-h" class="section-h">${t('keep.title')}</h2>
        <p class="body small">${t('keep.intro')} <span id="backup-line">${esc(backupLine())}</span></p>
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="backup-download" data-standalone>${t('keep.download')}</button>
          <button type="button" class="btn" data-act="backup-copy">${t('keep.copy')}</button>
          <button type="button" class="btn" data-act="restore-open">${t('keep.restore')}</button>
        </div>
        <div class="restore" id="restore" hidden>
          <label for="restore-text">${t('keep.paste')}</label>
          <textarea id="restore-text" class="code-box" rows="4" spellcheck="false" autocapitalize="off"></textarea>
          <input type="file" id="restore-file" accept=".json,application/json,text/plain" aria-label="${t('keep.file')}">
          <div class="actions">
            <button type="button" class="btn" data-act="restore-check">${t('keep.check')}</button>
            <button type="button" class="btn" data-act="restore-cancel">${t('common.cancel')}</button>
          </div>
          <div class="alert" id="restore-confirm" hidden>
            <p id="restore-summary"></p>
            <div class="actions"><button type="button" class="btn btn-danger" data-act="restore-yes">${t('keep.replace')}</button></div>
          </div>
        </div>
        <p class="body small">${t('keep.plain')}</p>
        <div class="actions">
          <button type="button" class="btn" data-act="copy-board">${t('keep.copyBoard')}</button>
          <button type="button" class="btn" data-act="copy-all">${t('keep.copyAll')}</button>
          <button type="button" class="btn" data-act="download" data-standalone>${t('keep.downloadText')}</button>
        </div>
      </section>

      <section class="erase" aria-labelledby="erase-h">
        <h2 id="erase-h" class="section-h">${t('again.title')}</h2>
        <p class="body small">${t('again.intro')}</p>
        <div class="actions" id="over-ask">
          <button type="button" class="btn" data-act="newrun-ask">${t('again.newRun')}</button>
          <button type="button" class="btn" data-act="erase-ask">${t('again.erase')}</button>
        </div>
        <div class="alert" id="newrun-confirm" hidden>
          <p>${t('again.confirmNew')}</p>
          <div class="actions">
            <button type="button" class="btn btn-primary" data-act="newrun-yes">${t('again.yesNew')}</button>
            <button type="button" class="btn" data-act="over-no">${t('again.notNow')}</button>
          </div>
        </div>
        <div class="alert" id="erase-confirm" hidden>
          <p>${t('again.confirmErase')}</p>
          <div class="actions">
            <button type="button" class="btn btn-danger" data-act="erase-yes">${t('again.yesErase')}</button>
            <button type="button" class="btn" data-act="over-no">${t('again.keep')}</button>
          </div>
        </div>
        ${pastHtml()}
      </section>`;
  }

  /* ---------- monthly review ---------- */

  function fieldHtml(key, label, extra) {
    return `
      <div class="extra">
        <h3 id="fl-${key}">${esc(label)}</h3>
        ${extra || ''}
        <textarea id="f-${key}" data-key="${key}" rows="3" aria-labelledby="fl-${key}"></textarea>
      </div>`;
  }

  function reviewView() {
    const cycle = cycleInfo();
    if (!cycle) {
      return `
        <header class="phase-head">
          <p class="eyebrow"><span class="dot"></span>${esc(C.game.eyebrow)}</p>
          <h1>${t('review.noneTitle')}</h1>
          <p class="lede">${t('review.noneLede')}</p>
        </header>
        <div class="actions"><a class="btn btn-primary" href="#game">${t('review.back')}</a></div>`;
    }
    const stats = countFullDays(cycle.start, addDays(startOfDay(new Date()), 1));
    const bossFight = C.game.tiles.find((tile) => tile.key === 'month').mechanic;
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(C.game.eyebrow)} · ${t('review.eyebrow', { n: cycle.n })}</p>
        <h1>${t('review.title', { n: cycle.n })}</h1>
        <p class="lede">${t('review.lede')}</p>
      </header>

      <section aria-label="${t('review.thisMonth')}">
        <blockquote class="recall">
          <span class="recall-label">${esc(bossFight)} · ${esc(dateRange(cycle.start, cycle.end))}</span>
          <p>${esc(answer('month') || t('common.blank'))}</p>
        </blockquote>
        <p class="body small">${t('review.stats', { full: stats.full, days: plural(stats.days, 'day') })}${cycle.due ? '' : ' ' + tn('review.early', cycle.left)}</p>
      </section>

      <section class="fields" aria-label="${t('review.section')}">
        ${fieldHtml('r1', t('review.q1'))}
        ${fieldHtml('r2', t('review.q2'), recallHtml({ key: 'year', label: t('review.yearGoal') }))}
        ${fieldHtml('r3', t('review.q3'))}
      </section>

      <section class="fields" aria-labelledby="next-h">
        <h2 id="next-h" class="section-h">${t('status.month', { n: cycle.n + 1 })}</h2>
        ${fieldHtml('nextMonth', t('review.nextProject'), `<p class="small">${t('review.nextProjectHint')}</p>`)}
        ${fieldHtml('nextDaily', t('review.levers'), `<p class="small">${t('review.leversHint')}</p>`)}
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="month-close">${t('review.start', { n: cycle.n + 1 })}</button>
          <a class="btn" href="#game">${t('review.notYet')}</a>
        </div>
      </section>`;
  }

  const REVIEW_KEYS = ['r1', 'r2', 'r3', 'nextMonth', 'nextDaily'];

  function closeMonth() {
    const cycle = cycleInfo();
    if (!cycle) return;
    if (!filled('nextMonth')) {
      toast(t('review.needProject'));
      document.getElementById('f-nextMonth').focus();
      return;
    }
    const today = startOfDay(new Date());
    const stats = countFullDays(cycle.start, addDays(today, 1));
    state.months.push({
      n: cycle.n,
      start: state.cycle.start,
      end: dateKey(today),
      project: answer('month'),
      result: answer('r1'),
      compare: answer('r2'),
      adjust: answer('r3'),
      full: stats.full,
      days: stats.days
    });
    state.answers.month = answer('nextMonth');
    if (filled('nextDaily')) state.answers.daily = answer('nextDaily');
    REVIEW_KEYS.forEach((key) => delete state.answers[key]);
    state.cycle = { n: cycle.n + 1, start: dateKey(today) };
    flush();
    location.hash = 'game';
    toast(t('review.started', { n: cycle.n + 1 }));
  }

  /* ---------- backup ---------- */

  function backupText() {
    return JSON.stringify({ app: 'life-changer', version: 1, exported: new Date().toISOString(), state: state });
  }

  function readBackup(text) {
    try {
      const data = JSON.parse(text.trim());
      if (data && data.app === 'life-changer' && data.state && typeof data.state === 'object') return data;
    } catch (err) {
      /* fall through */
    }
    return null;
  }

  function markBackup() {
    state.lastBackup = new Date().toISOString();
    flush();
    const line = document.getElementById('backup-line');
    if (line) line.textContent = backupLine();
  }

  // A checked backup waiting for the person to confirm the restore.
  let pendingRestore = null;

  function reveal(id, on) {
    const el = document.getElementById(id);
    if (el) el.hidden = !on;
    return el;
  }

  /* ---------- export ---------- */

  function boardText() {
    const lines = [t('export.board'), new Date().toLocaleDateString(LOCALE), ''];
    C.game.tiles.forEach((tile) => {
      const text = tile.key === 'daily' ? questList().map((quest) => '- ' + quest).join('\n') : answer(tile.key);
      lines.push(tile.name.toUpperCase() + ' (' + tile.mechanic.toLowerCase() + ')', text || t('common.blank'), '');
    });
    return lines.join('\n').trim() + '\n';
  }

  function allText() {
    const blank = t('common.blank');
    const lines = [boardText(), ''];
    if (state.months.length) {
      lines.push('--- ' + t('export.months') + ' ---', '');
      state.months.forEach((m) => {
        lines.push(
          t('export.monthLine', { n: m.n, start: m.start, end: m.end, full: m.full, days: m.days }),
          t('export.project') + (m.project || blank),
          t('export.result') + (m.result || blank),
          t('export.compare') + (m.compare || blank),
          t('export.adjust') + (m.adjust || blank),
          ''
        );
      });
    }
    const section = (title, items) => {
      lines.push('--- ' + title.toUpperCase() + ' ---', '');
      items.forEach((item) => lines.push(item.label, answer(item.id) || blank, ''));
    };
    section(t('export.morning'), QUESTIONS.morning.map((q) => ({ id: q.id, label: q.prompt })));
    section(
      t('export.day'),
      sortedCheckins()
        .map((c) => ({ id: c.id, label: formatTime(timeOf(c)) + '  ' + c.prompt }))
        .concat(C.day.extras.map((x) => ({ id: x.id, label: x.prompt })))
    );
    section(t('export.evening'), QUESTIONS.evening.map((q) => ({ id: q.id, label: q.prompt })));
    lines.push(t('export.based', { title: C.source.title, author: C.source.author, url: C.source.url }));
    return lines.join('\n').trim() + '\n';
  }

  function copyText(text, doneMessage, button) {
    const fallback = () => {
      const host = button.closest('[data-copy-host]');
      let box = host.querySelector('.copy-fallback');
      if (!box) {
        box = document.createElement('textarea');
        box.className = 'copy-fallback';
        box.readOnly = true;
        box.setAttribute('aria-label', t('copy.label'));
        host.appendChild(box);
      }
      box.value = text;
      box.focus();
      box.select();
      toast(t('copy.blocked'));
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => toast(doneMessage), fallback);
    } else {
      fallback();
    }
  }

  function downloadFile(name, text, type) {
    const url = URL.createObjectURL(new Blob([text], { type: type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /* ---------- render ---------- */

  const VIEWS = {
    start: startView,
    ideas: ideasView,
    morning: () => stepperView('morning'),
    day: dayView,
    evening: () => stepperView('evening'),
    game: gameView,
    review: reviewView
  };

  function paintNav() {
    const route = currentRoute() === 'review' ? 'game' : currentRoute();
    document.querySelectorAll('.nav a').forEach((link) => {
      const name = link.dataset.route;
      if (name === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (KEYS[name]) link.style.setProperty('--p', (countDone(name) / KEYS[name].length).toFixed(3));
    });
  }

  function render() {
    const route = currentRoute();
    // The review opens with this month's levers already filled in for next month.
    if (route === 'review' && state.answers.nextDaily === undefined) state.answers.nextDaily = state.answers.daily || '';
    view.dataset.phase = route;
    view.innerHTML = VIEWS[route]();
    view.querySelectorAll(EMBED ? '[data-standalone]' : '[data-embed]').forEach((el) => el.remove());
    view.querySelectorAll('textarea[data-key]').forEach((field) => {
      field.value = state.answers[field.dataset.key] || '';
      fit(field);
    });
    if (route === 'ideas') {
      paintLoop();
      paintStage();
    }
    if (route === 'day') paintDay();
    paintNav();
  }

  /* ---------- events ---------- */

  let askedToPersist = false;

  view.addEventListener('input', (event) => {
    const field = event.target.closest('textarea[data-key]');
    if (!field) return;
    const key = field.dataset.key;
    state.answers[key] = field.value;
    fit(field);
    syncDates();
    save();
    if (!askedToPersist && navigator.storage && navigator.storage.persist) {
      // Asks the browser not to clear this site's data when the device runs short of space.
      askedToPersist = true;
      navigator.storage.persist().catch(() => {});
    }
    paintNav();
    const seg = view.querySelector('[data-seg="' + key + '"]');
    if (seg) seg.classList.toggle('is-filled', filled(key));
    if (currentRoute() === 'day') paintDay();
    if (currentRoute() === 'game' && key === 'daily') paintQuests();
  });

  view.addEventListener('change', (event) => {
    const box = event.target.closest('input[data-quest]');
    if (box) toggleQuest(Number(box.dataset.quest), box.checked);

    const remind = event.target.closest('input[data-remind]');
    if (remind) {
      const picked = /^(\d{2}):(\d{2})/.exec(remind.value);
      if (picked) {
        state.remindAt = Number(picked[1]) * 60 + Number(picked[2]);
        save();
      }
    }

    if (event.target.id === 'restore-file' && event.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        document.getElementById('restore-text').value = String(reader.result);
      };
      reader.readAsText(event.target.files[0]);
    }

    const timeField = event.target.closest('input[data-time]');
    if (timeField) {
      const id = timeField.dataset.time;
      const match = /^(\d{2}):(\d{2})/.exec(timeField.value);
      const suggested = C.day.checkins.find((c) => c.id === id).at;
      const minutes = match ? Number(match[1]) * 60 + Number(match[2]) : suggested;
      if (minutes === suggested) delete state.times[id];
      else state.times[id] = minutes;
      flush();
      render();
      const again = document.getElementById('time-' + id);
      if (again) again.focus({ preventScroll: true });
    }
  });

  const ACTIONS = {
    prev: () => moveStep(currentRoute(), state.pos[currentRoute()] - 1),
    next: () => moveStep(currentRoute(), state.pos[currentRoute()] + 1),
    goto: (button) => moveStep(currentRoute(), Number(button.dataset.i)),
    'loop-go': (button) => setLoop(Number(button.dataset.i)),
    'loop-prev': () => setLoop(state.loop - 1),
    'loop-next': () => setLoop(state.loop + 1),
    stage: (button) => {
      state.stage = Number(button.dataset.i);
      save();
      paintStage();
    },
    'reset-times': () => {
      state.times = {};
      flush();
      render();
      toast(t('toast.times'));
    },
    jump: (button) => {
      const card = document.getElementById('ci-' + button.dataset.i);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      card.querySelector('textarea').focus({ preventScroll: true });
    },
    'copy-schedule': (button) => copyText(scheduleText(), t('toast.schedule'), button),
    ics: () => {
      downloadFile('life-changer-check-ins.ics', icsText(), 'text/calendar');
      toast(t('toast.ics'));
    },
    'copy-board': (button) => copyText(boardText(), t('toast.board'), button),
    'copy-all': (button) => copyText(allText(), t('toast.all'), button),
    download: () => downloadFile('life-changer.txt', allText(), 'text/plain'),
    'year-ics': () => {
      downloadFile('life-changer-reminders.ics', yearIcsText(), 'text/calendar');
      toast(t('toast.yearIcs'));
    },
    'month-close': closeMonth,
    'backup-copy': (button) => {
      markBackup();
      copyText(backupText(), t('toast.backupCopied'), button);
    },
    'backup-download': () => {
      markBackup();
      downloadFile('life-changer-backup-' + dateKey(new Date()) + '.json', backupText(), 'application/json');
      toast(t('toast.backupSaved'));
    },
    'restore-open': () => {
      reveal('restore', true);
      document.getElementById('restore-text').focus();
    },
    'restore-cancel': () => {
      pendingRestore = null;
      reveal('restore-confirm', false);
      reveal('restore', false);
    },
    'restore-check': () => {
      const data = readBackup(document.getElementById('restore-text').value);
      if (!data) {
        pendingRestore = null;
        reveal('restore-confirm', false);
        toast(t('toast.badBackup'));
        return;
      }
      pendingRestore = normalise(data.state);
      const made = new Date(data.exported);
      const when = isNaN(made) ? t('restore.unknownDate') : datedDay.format(made);
      const answers = Object.keys(pendingRestore.answers).filter((key) => pendingRestore.answers[key].trim()).length;
      document.getElementById('restore-summary').textContent = t('restore.summary', { when: when, answers: plural(answers, 'answer') });
      reveal('restore-confirm', true);
    },
    'restore-yes': () => {
      if (!pendingRestore) return;
      state = pendingRestore;
      state.lang = lang;
      pendingRestore = null;
      flush();
      render();
      window.scrollTo(0, 0);
      toast(t('toast.restored'));
    },
    'copy-past': (button) => copyText(state.past[Number(button.dataset.i)].text, t('toast.runCopied'), button),
    'newrun-ask': () => {
      reveal('over-ask', false);
      reveal('erase-confirm', false);
      const box = reveal('newrun-confirm', true);
      box.scrollIntoView({ block: 'center' });
      box.querySelector('[data-act="over-no"]').focus({ preventScroll: true });
    },
    'erase-ask': () => {
      reveal('over-ask', false);
      reveal('newrun-confirm', false);
      reveal('erase-confirm', true).querySelector('[data-act="over-no"]').focus();
    },
    'over-no': () => {
      reveal('newrun-confirm', false);
      reveal('erase-confirm', false);
      reveal('over-ask', true);
    },
    'newrun-yes': () => {
      const today = dateKey(new Date());
      const filed = { start: state.run ? state.run.start : today, end: today, text: allText() };
      state = Object.assign(blankState(), {
        past: state.past.concat([filed]),
        times: state.times,
        remindAt: state.remindAt,
        lastBackup: state.lastBackup,
        lang: state.lang
      });
      flush();
      location.hash = 'start';
      toast(t('toast.newRun'));
    },
    'erase-yes': () => {
      state = Object.assign(blankState(), { lang: state.lang });
      flush();
      render();
      window.scrollTo(0, 0);
      toast(t('toast.erased'));
    }
  };

  // Hovering or tapping a square in the year grid reads that day out below it.
  function pickDay(event) {
    const cell = event.target.closest && event.target.closest('.cell[data-day]');
    const readout = document.getElementById('year-readout');
    if (!cell || !readout) return;
    view.querySelectorAll('.cell.is-picked').forEach((other) => other.classList.remove('is-picked'));
    cell.classList.add('is-picked');
    readout.textContent = readoutText(cell.dataset.day);
  }

  view.addEventListener('pointerover', pickDay);
  view.addEventListener('click', pickDay);

  function setLoop(index) {
    const count = C.ideas.loop.steps.length;
    state.loop = ((index % count) + count) % count;
    save();
    paintLoop();
  }

  view.addEventListener('click', (event) => {
    const button = event.target.closest('[data-act]');
    if (!button || button.disabled) return;
    const action = ACTIONS[button.dataset.act];
    if (action) action(button);
  });

  window.addEventListener('hashchange', () => {
    flush();
    render();
    window.scrollTo(0, 0);
    view.focus({ preventScroll: true });
  });

  window.addEventListener('resize', () => view.querySelectorAll('textarea[data-key]').forEach(fit));
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) flush();
    else paintDay();
  });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => view.querySelectorAll('textarea[data-key]').forEach(fit));
  }
  setInterval(paintDay, 30000);

  /* ---------- language ---------- */

  // The viewer's own regional variant of the language when the browser lists one (es-MX, en-GB).
  function localeFor(code) {
    const listed = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ''];
    const match = listed.find((tag) => String(tag).toLowerCase().split('-')[0] === code);
    return match || (code === 'es' ? 'es-419' : 'en-US');
  }

  // Fills in the parts of the page that sit outside the view: nav, language switch, footer.
  function paintShell() {
    document.documentElement.lang = lang;
    document.querySelector('.nav').setAttribute('aria-label', t('nav.label'));
    document.querySelectorAll('.nav a').forEach((link) => {
      link.textContent = t('nav.' + link.dataset.route);
    });
    langSwitch.setAttribute('aria-label', t('lang.label'));
    langSwitch.querySelectorAll('button').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.lang === lang));
    });
    const link = `<a href="${esc(C.source.url)}" target="_blank" rel="noopener">${esc(C.source.title)}</a>`;
    document.getElementById('foot-source').innerHTML = t('foot.source', { link: link });
    document.getElementById('foot-privacy').textContent = t('foot.privacy');
  }

  function applyLanguage(code) {
    lang = LANGS.includes(code) ? code : 'en';
    C = CONTENT[lang];
    LOCALE = localeFor(lang);
    QUESTIONS = { morning: flatQuestions('morning'), evening: flatQuestions('evening') };
    timeFormat = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' });
    shortDate = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' });
    longDate = new Intl.DateTimeFormat(LOCALE, { weekday: 'short', day: 'numeric', month: 'short' });
    datedDay = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
    paintShell();
  }

  const langSwitch = document.getElementById('lang');
  langSwitch.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-lang]');
    if (!button || button.dataset.lang === lang) return;
    state.lang = button.dataset.lang;
    applyLanguage(state.lang);
    flush();
    render();
  });

  // First visit: Spanish for a Spanish-language browser, English otherwise. After that, whatever was chosen.
  const browserSpeaksSpanish = String(navigator.language || '').toLowerCase().startsWith('es');
  applyLanguage(state.lang || (browserSpeaksSpanish ? 'es' : 'en'));
  syncDates();
  flush();
  render();

  // Lets the installed app open with no connection. Embedded previews have no service workers.
  if (!EMBED && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
