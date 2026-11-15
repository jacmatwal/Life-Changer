(function () {
  'use strict';

  const C = window.LC_CONTENT;
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
      lastBackup: null
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
      : '<p>This browser is blocking storage, so your answers will be lost when you close the page. Copy them out from the Game tab before you leave.</p>';
  }

  /* ---------- helpers ---------- */

  const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (s) => String(s).replace(/[&<>"']/g, (ch) => ESCAPES[ch]);
  const answer = (key) => (state.answers[key] || '').trim();
  const filled = (key) => answer(key) !== '';
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const pad = (n) => String(n).padStart(2, '0');

  function flatQuestions(phase) {
    return C[phase].groups.flatMap((group) =>
      group.questions.map((q, i) => Object.assign({}, q, { group: group.name, groupIntro: i === 0 ? group.intro : '' }))
    );
  }

  const QUESTIONS = { morning: flatQuestions('morning'), evening: flatQuestions('evening') };

  const KEYS = {
    morning: QUESTIONS.morning.map((q) => q.id),
    day: C.day.checkins.map((c) => c.id),
    evening: QUESTIONS.evening.map((q) => q.id),
    game: C.game.tiles.map((t) => t.key)
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

  const timeFormat = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' });
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
  const shortDate = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });
  const longDate = new Intl.DateTimeFormat(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  const datedDay = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  const dateRange = (from, to) => shortDate.format(from) + ' to ' + shortDate.format(to);
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
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
    const order = [
      { route: 'morning', label: 'the morning sitting' },
      { route: 'day', label: 'the daytime check-ins' },
      { route: 'evening', label: 'the evening sitting' },
      { route: 'game', label: 'your game board' }
    ];
    const started = order.some((step) => countDone(step.route) > 0);
    if (!started) return { route: 'morning', label: 'Start the morning sitting' };
    const next = order.find((step) => countDone(step.route) < KEYS[step.route].length);
    if (!next) return { route: 'game', label: 'Open your game board' };
    return { route: next.route, label: 'Continue with ' + next.label };
  }

  function startView() {
    const S = C.start;
    const next = nextStep();
    const total = KEYS.morning.length + KEYS.day.length + KEYS.evening.length;
    return `
      <header class="hero">
        <p class="eyebrow"><span class="dot"></span>${esc(S.eyebrow)}</p>
        <h1>${esc(S.title)}</h1>
        <p class="lede">Life Changer walks you through the protocol in ${esc(C.source.author)}’s essay
          <em>${esc(C.source.title)}</em>: a morning of hard questions, six check-ins through the day, and an evening
          that turns your answers into a one-page game plan. ${total} questions in all.</p>
        <div class="actions">
          <a class="btn btn-primary" href="#${next.route}">${esc(next.label)}</a>
          <a class="btn" href="#ideas">Read the idea first</a>
        </div>
      </header>

      <section aria-labelledby="plan-h">
        <h2 id="plan-h" class="section-h">Your day</h2>
        <ol class="plan">
          ${S.plan
            .map((row) => {
              const year = row.year ? yearInfo() : null;
              const done = countDone(row.route);
              const all = KEYS[row.route].length;
              const share = row.year ? (year ? clamp(year.day / year.length, 0, 1) : 0) : done / all;
              const tally = row.year ? (year ? 'Day ' + Math.min(year.day, year.length) : '–') : done + '/' + all;
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
        <h2 id="notes-h" class="section-h">Know this going in</h2>
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
          aria-label="Step ${i + 1}: ${esc(step.title)}" style="left:${p.x.toFixed(2)}%;top:${p.y.toFixed(2)}%">${i + 1}</button>`;
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
    document.getElementById('loop-count').textContent = i + 1 + ' of ' + steps.length;
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
            <button type="button" class="btn" data-act="loop-prev">Previous</button>
            <button type="button" class="btn btn-primary" data-act="loop-next">Next step</button>
          </div>
        </div>
      </div>`;
  }

  function stagesHtml() {
    const S = C.ideas.stages;
    return `
      <ol class="stages" lang="en">
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
            <p class="eyebrow">Idea ${i + 1} of ${I.sections.length}</p>
            <h2 id="idea-h-${i}" class="section-h">${esc(section.title)}</h2>
            ${section.blocks.map(blockHtml).join('')}
          </section>`
        )
        .join('')}

      <div class="actions">
        <a class="btn btn-primary" href="#morning">Go to the morning sitting</a>
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
              aria-label="${esc(group.name)} question ${n + 1}"${index === i ? ' aria-current="step"' : ''}></button>`;
          })
          .join('');
        offset += group.questions.length;
        return `<div class="seg-group" style="flex:${group.questions.length}">${html}</div>`;
      })
      .join('');

    const forward = last
      ? `<a class="btn btn-primary" href="#${P.done.route}">${esc(P.done.label)}</a>`
      : '<button type="button" class="btn btn-primary" data-act="next">Next</button>';

    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(P.eyebrow)}</p>
        <h1>${esc(P.title)}</h1>
      </header>

      ${phase === 'evening' ? reviewHtml() : ''}

      <section class="step" aria-labelledby="q-title">
        <div class="segs" role="group" aria-label="Questions">${segs}</div>
        <p class="step-meta mono">${esc(q.group)} · ${i + 1} of ${questions.length}</p>
        ${q.groupIntro ? `<p class="group-intro">${esc(q.groupIntro)}</p>` : ''}
        <h2 id="q-title" tabindex="-1">${esc(q.prompt)}</h2>
        ${q.hint ? `<p class="hint">${esc(q.hint)}</p>` : ''}
        ${recallHtml(q.recall)}
        <label class="sr-only" for="f-${esc(q.id)}">Your answer</label>
        <textarea id="f-${esc(q.id)}" data-key="${esc(q.id)}" rows="6"
          placeholder="${esc(q.placeholder || 'Write it out. Nobody else reads this.')}"></textarea>
        <div class="step-nav">
          <button type="button" class="btn" data-act="prev"${i === 0 ? ' disabled' : ''}>Back</button>
          <span class="saved">Saved as you type</span>
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
        <summary>Reread what you wrote today (${items.length})</summary>
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

  const STATE_LABEL = { done: 'Answered', due: 'Ready', later: 'Not yet' };

  function dayView() {
    const D = C.day;
    const range = railRange();
    const customised = Object.keys(state.times).length > 0;
    const ticks = D.checkins
      .map((c, i) => {
        const at = timeOf(c);
        const left = ((at - range.start) / (range.end - range.start)) * 100;
        return `<button type="button" class="rail-tick" data-act="jump" data-i="${i}" data-tick="${esc(c.id)}"
          style="left:${left.toFixed(2)}%" aria-label="Go to the ${esc(formatTime(at))} check-in">
          <span class="rail-dot"></span><span>${esc(formatTimeShort(at))}</span></button>`;
      })
      .join('');

    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(D.eyebrow)}</p>
        <h1>${esc(D.title)}</h1>
        <p class="lede">${esc(D.intro)}</p>
      </header>

      <section aria-label="Schedule" data-copy-host>
        <div class="rail-box">
          <div class="rail">
            <div class="rail-track"></div>
            ${ticks}
            <div class="rail-now" id="rail-now" hidden><span>Now</span></div>
          </div>
        </div>
        <p class="small body">${esc(D.remind)}</p>
        <div class="actions">
          <button type="button" class="btn" data-act="copy-schedule">Copy the schedule</button>
          <button type="button" class="btn" data-act="ics" data-standalone>Add to calendar (${esc(reminderDayLabel())})</button>
          ${customised ? '<button type="button" class="btn" data-act="reset-times">Use the suggested times</button>' : ''}
        </div>
      </section>

      <section aria-label="Check-ins">
        <ol class="checkins">
          ${D.checkins
            .map(
              (c, i) => `
              <li class="checkin" id="ci-${i}" data-checkin="${esc(c.id)}">
                <div class="ci-head">
                  <label class="sr-only" for="time-${esc(c.id)}">Reminder time</label>
                  <input type="time" class="ci-time" id="time-${esc(c.id)}" data-time="${esc(c.id)}"
                    value="${pad(Math.floor(timeOf(c) / 60))}:${pad(timeOf(c) % 60)}">
                  <span class="badge"></span>
                </div>
                <h2 id="ci-h-${i}">${esc(c.prompt)}</h2>
                ${c.hint ? `<p class="small">${esc(c.hint)}</p>` : ''}
                <textarea id="f-${esc(c.id)}" data-key="${esc(c.id)}" rows="2" aria-labelledby="ci-h-${i}"
                  placeholder="A line or two is enough."></textarea>
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
                  placeholder="Optional."></textarea>
              </div>`
            )
            .join('')}
        </div>
      </section>

      <div class="actions">
        <a class="btn btn-primary" href="#evening">Go to the evening sitting</a>
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
        card.querySelector('.badge').textContent = STATE_LABEL[s];
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

  function reminderDayLabel() {
    return minutesNow() >= firstCheckinTime() ? 'tomorrow' : 'today';
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
        description: 'Life Changer check-in. Answer it in the app.'
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
        summary: 'Life Changer: today’s quests',
        description: 'Tick off your daily quests. ' + where
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
        summary: 'Life Changer: review the month and pick the next project',
        description: 'Close out the month. ' + where + '#review'
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
    const label = longDate.format(parseKey(key));
    return rec.total ? label + ': ' + rec.done + ' of ' + plural(rec.total, 'quest') + ' done' : label + ': no quests logged';
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
    const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', day: 'numeric', month: 'long' }).format(today);
    const weekday = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

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
      : '<p class="callout">No quests yet. Write your daily levers in the <a href="#evening">evening sitting</a>, or in the Daily levers tile below, one per line. They show up here as a checklist.</p>';

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
        <h2 id="quests-h" class="section-h">Today’s quests</h2>
        <span class="mono">${esc(dateLabel)}</span>
      </div>
      ${list}
      <ol class="week" aria-label="Quests done over the last seven days">${cells.join('')}</ol>`;
  }

  function toggleQuest(index, checked) {
    const quests = questList();
    const text = quests[index];
    if (text === undefined) return;
    const key = dateKey(new Date());
    const record = state.quests[key] || { done: [], n: 0 };
    const kept = record.done.filter((t) => t !== text && quests.includes(t));
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
    const parts = [year.over ? 'Year complete' : 'Day ' + year.day + ' of ' + year.length];
    if (cycle && !year.over) parts.push('Month ' + cycle.n, cycle.due ? 'review due' : plural(cycle.left, 'day') + ' left');
    let alert = '';
    if (year.over) {
      alert = `
        <div class="alert">
          <p>It has been a year since you ran the protocol. Koe’s advice is to run it again every year.</p>
          <div class="actions"><button type="button" class="btn btn-primary" data-act="newrun-ask">Start a new run</button></div>
        </div>`;
    } else if (cycle && cycle.due) {
      alert = `
        <div class="alert">
          <p>Month ${cycle.n} is up. Review it and choose the next boss fight.</p>
          <div class="actions"><a class="btn btn-primary" href="#review">Review month ${cycle.n}</a></div>
        </div>`;
    }
    return `
      <section class="status" aria-label="Where you are in the year">
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
    const monthName = new Intl.DateTimeFormat(undefined, { month: 'short' });
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
    const summary = stats.full + ' of ' + plural(stats.days, 'day') + ' with every quest done' + (streak > 1 ? ', ' + streak + ' in a row right now' : '');
    return `
      <h2 id="year-h" class="section-h">Your year</h2>
      <p class="body small">${esc(summary)}. Each row is a month and each square is a day. Tap a square to read it.</p>
      <div class="year" role="img" aria-label="Quest history by day. ${esc(summary)}.">
        <div class="year-row year-axis" aria-hidden="true"><span></span>${axis}</div>
        ${rows.join('')}
      </div>
      <p class="readout mono" id="year-readout">${esc(readoutText(dateKey(lastDay)))}</p>
      <ul class="legend" aria-hidden="true">
        <li><span class="cell" data-s="none"></span>No quests done</li>
        <li><span class="cell" data-s="some"></span>Some</li>
        <li><span class="cell" data-s="full"></span>Every quest</li>
      </ul>`;
  }

  function monthsHtml() {
    const cycle = cycleInfo();
    if (!cycle && !state.months.length) return '';
    const current = cycle
      ? `<p class="body small">Month ${cycle.n} runs ${esc(dateRange(cycle.start, cycle.end))}. When it ends you review it and pick the next project. <a href="#review">Close it early</a></p>`
      : '';
    const closed = state.months
      .slice()
      .reverse()
      .map(
        (m) => `
        <details class="review">
          <summary>Month ${esc(m.n)} · ${esc(dateRange(parseKey(m.start), parseKey(m.end)))} · ${esc(m.full)}/${esc(m.days)} full days</summary>
          <dl>
            <dt>The project</dt><dd>${esc(m.project || '(blank)')}</dd>
            <dt>What you built or learned</dt><dd>${esc(m.result || '(blank)')}</dd>
            <dt>Against the one-year goal</dt><dd>${esc(m.compare || '(blank)')}</dd>
            <dt>What you changed</dt><dd>${esc(m.adjust || '(blank)')}</dd>
          </dl>
        </details>`
      )
      .join('');
    return `
      <section aria-labelledby="months-h">
        <h2 id="months-h" class="section-h">Months</h2>
        ${current}
        ${closed}
      </section>`;
  }

  function pastHtml() {
    if (!state.past.length) return '';
    return `
      <h3 class="past-h">Past runs</h3>
      ${state.past
        .map(
          (run, i) => `
          <details class="review" data-copy-host>
            <summary>${esc(datedDay.format(parseKey(run.start)) + ' to ' + datedDay.format(parseKey(run.end)))}</summary>
            <pre class="past-text">${esc(run.text)}</pre>
            <div class="actions past-actions"><button type="button" class="btn" data-act="copy-past" data-i="${i}">Copy this run</button></div>
          </details>`
        )
        .join('')}`;
  }

  function backupLine() {
    if (!state.lastBackup) return 'You have not made a backup yet.';
    const days = dayDiff(new Date(state.lastBackup), new Date());
    return days <= 0 ? 'Last backup: today.' : 'Last backup: ' + plural(days, 'day') + ' ago.';
  }

  function gameView() {
    const G = C.game;
    const ready = KEYS.game.every(filled);
    const cycle = cycleInfo();
    const monthMeta = cycle ? 'Month ' + cycle.n + ' · ' + (cycle.due ? 'review due' : 'ends ' + shortDate.format(cycle.end)) : '';
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(G.eyebrow)}</p>
        <h1>${esc(G.title)}</h1>
        ${ready ? '' : `<p class="lede">${esc(G.intro)}</p>`}
      </header>

      ${statusHtml()}

      <section id="quests" aria-labelledby="quests-h">${questsHtml()}</section>

      <section aria-labelledby="board-h">
        <h2 id="board-h" class="section-h">The six pieces</h2>
        <div class="board">
          ${G.tiles
            .map(
              (t) => `
              <div class="tile">
                <span class="tile-mech">${esc(t.mechanic)}</span>
                <h3 id="tile-h-${esc(t.key)}">${esc(t.name)}</h3>
                ${t.key === 'month' && monthMeta ? `<span class="tile-meta">${esc(monthMeta)}</span>` : ''}
                <textarea id="b-${esc(t.key)}" data-key="${esc(t.key)}" rows="3" aria-labelledby="tile-h-${esc(t.key)}"
                  placeholder="${esc(t.prompt)}"></textarea>
              </div>`
            )
            .join('')}
        </div>
      </section>

      ${state.run ? `<section id="year" aria-labelledby="year-h">${yearHtml()}</section>` : ''}

      ${monthsHtml()}

      <section aria-labelledby="stay-h">
        <h2 id="stay-h" class="section-h">Stay with it</h2>
        <p class="body small" data-standalone>This page can’t remind you by itself. Pick a time and add two repeating reminders to your calendar: a daily one for the quests and a monthly one for the review.</p>
        <div class="actions" data-standalone>
          <label class="sr-only" for="remind-at">Daily reminder time</label>
          <input type="time" class="ci-time" id="remind-at" data-remind
            value="${pad(Math.floor(state.remindAt / 60))}:${pad(state.remindAt % 60)}">
          <button type="button" class="btn" data-act="year-ics">Add reminders to calendar</button>
        </div>
        <p class="body small" data-embed>This page can’t remind you by itself. Set a repeating daily alarm on your phone and name it after your first quest.</p>
        ${INSTALLED ? '' : '<p class="callout" data-standalone>Add this page to your home screen so it opens like an app and your answers are less likely to be cleared. On iPhone: Share, then Add to Home Screen. On Android: the browser menu, then Install app or Add to Home screen.</p>'}
      </section>

      <section aria-labelledby="keep-h" data-copy-host>
        <h2 id="keep-h" class="section-h">Keep it safe</h2>
        <p class="body small">Everything lives in this browser on this device. A backup lets you restore it after your browser data is cleared, or move it to a new phone. <span id="backup-line">${esc(backupLine())}</span></p>
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="backup-download" data-standalone>Download a backup</button>
          <button type="button" class="btn" data-act="backup-copy">Copy a backup code</button>
          <button type="button" class="btn" data-act="restore-open">Restore from a backup</button>
        </div>
        <div class="restore" id="restore" hidden>
          <label for="restore-text">Paste a backup code, or choose a backup file.</label>
          <textarea id="restore-text" class="code-box" rows="4" spellcheck="false" autocapitalize="off"></textarea>
          <input type="file" id="restore-file" accept=".json,application/json,text/plain" aria-label="Backup file">
          <div class="actions">
            <button type="button" class="btn" data-act="restore-check">Check this backup</button>
            <button type="button" class="btn" data-act="restore-cancel">Cancel</button>
          </div>
          <div class="alert" id="restore-confirm" hidden>
            <p id="restore-summary"></p>
            <div class="actions"><button type="button" class="btn btn-danger" data-act="restore-yes">Replace what is on this device</button></div>
          </div>
        </div>
        <p class="body small">To read or share your answers as plain text:</p>
        <div class="actions">
          <button type="button" class="btn" data-act="copy-board">Copy the game board</button>
          <button type="button" class="btn" data-act="copy-all">Copy every answer</button>
          <button type="button" class="btn" data-act="download" data-standalone>Download as text</button>
        </div>
      </section>

      <section class="erase" aria-labelledby="erase-h">
        <h2 id="erase-h" class="section-h">Run it again</h2>
        <p class="body small">Koe suggests rerunning the protocol every year. Starting a new run files this one under past runs, then clears the questions, the board and the quest history.</p>
        <div class="actions" id="over-ask">
          <button type="button" class="btn" data-act="newrun-ask">Start a new run</button>
          <button type="button" class="btn" data-act="erase-ask">Erase everything</button>
        </div>
        <div class="alert" id="newrun-confirm" hidden>
          <p>File this run under past runs and start again from the morning questions?</p>
          <div class="actions">
            <button type="button" class="btn btn-primary" data-act="newrun-yes">Yes, start a new run</button>
            <button type="button" class="btn" data-act="over-no">Not now</button>
          </div>
        </div>
        <div class="alert" id="erase-confirm" hidden>
          <p>Delete every answer, the quest history and all past runs from this device? This cannot be undone.</p>
          <div class="actions">
            <button type="button" class="btn btn-danger" data-act="erase-yes">Yes, erase it all</button>
            <button type="button" class="btn" data-act="over-no">Keep everything</button>
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
          <p class="eyebrow"><span class="dot"></span>Game board</p>
          <h1>No month to review yet</h1>
          <p class="lede">Write a one-month project first, in the evening sitting or on the game board.</p>
        </header>
        <div class="actions"><a class="btn btn-primary" href="#game">Back to the game board</a></div>`;
    }
    const stats = countFullDays(cycle.start, addDays(startOfDay(new Date()), 1));
    const early = cycle.due ? '' : ' The month has ' + plural(cycle.left, 'day') + ' left. Closing it now starts the next one today.';
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>Game board · Month ${cycle.n} review</p>
        <h1>Close out month ${cycle.n}</h1>
        <p class="lede">The essay’s steering loop, applied to your month: sense where you are, compare it with the goal, adjust. The three review questions are this app’s addition, not Koe’s.</p>
      </header>

      <section aria-label="This month">
        <blockquote class="recall">
          <span class="recall-label">The boss fight · ${esc(dateRange(cycle.start, cycle.end))}</span>
          <p>${esc(answer('month') || '(blank)')}</p>
        </blockquote>
        <p class="body small">You finished every quest on ${stats.full} of ${plural(stats.days, 'day')}.${esc(early)}</p>
      </section>

      <section class="fields" aria-label="Review">
        ${fieldHtml('r1', 'What did you build or learn this month?')}
        ${fieldHtml('r2', 'Set that against your one-year goal. Are you closer?', recallHtml({ key: 'year', label: 'Your one-year goal' }))}
        ${fieldHtml('r3', 'What will you do differently next month?')}
      </section>

      <section class="fields" aria-labelledby="next-h">
        <h2 id="next-h" class="section-h">Month ${cycle.n + 1}</h2>
        ${fieldHtml('nextMonth', 'The next one-month project', '<p class="small">What do you need to learn or build next to stay on course for the one-year goal?</p>')}
        ${fieldHtml('nextDaily', 'Daily levers', '<p class="small">One per line. Keep them, or change them to fit the new project.</p>')}
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="month-close">Start month ${cycle.n + 1}</button>
          <a class="btn" href="#game">Not yet</a>
        </div>
      </section>`;
  }

  const REVIEW_KEYS = ['r1', 'r2', 'r3', 'nextMonth', 'nextDaily'];

  function closeMonth() {
    const cycle = cycleInfo();
    if (!cycle) return;
    if (!filled('nextMonth')) {
      toast('Write the next one-month project first.');
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
    toast('Month ' + (cycle.n + 1) + ' started.');
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
    const lines = ['MY GAME BOARD', new Date().toLocaleDateString(), ''];
    C.game.tiles.forEach((t) => {
      const text = t.key === 'daily' ? questList().map((quest) => '- ' + quest).join('\n') : answer(t.key);
      lines.push(t.name.toUpperCase() + ' (' + t.mechanic.toLowerCase() + ')', text || '(blank)', '');
    });
    return lines.join('\n').trim() + '\n';
  }

  function allText() {
    const lines = [boardText(), ''];
    if (state.months.length) {
      lines.push('--- MONTHS ---', '');
      state.months.forEach((m) => {
        lines.push(
          'Month ' + m.n + ' (' + m.start + ' to ' + m.end + ', ' + m.full + '/' + m.days + ' full days)',
          'Project: ' + (m.project || '(blank)'),
          'Built or learned: ' + (m.result || '(blank)'),
          'Against the one-year goal: ' + (m.compare || '(blank)'),
          'Changed: ' + (m.adjust || '(blank)'),
          ''
        );
      });
    }
    const section = (title, items) => {
      lines.push('--- ' + title.toUpperCase() + ' ---', '');
      items.forEach((item) => lines.push(item.label, answer(item.id) || '(blank)', ''));
    };
    section('Morning: excavation', QUESTIONS.morning.map((q) => ({ id: q.id, label: q.prompt })));
    section(
      'Daytime: pattern interrupts',
      sortedCheckins()
        .map((c) => ({ id: c.id, label: formatTime(timeOf(c)) + '  ' + c.prompt }))
        .concat(C.day.extras.map((x) => ({ id: x.id, label: x.prompt })))
    );
    section('Evening: synthesis', QUESTIONS.evening.map((q) => ({ id: q.id, label: q.prompt })));
    lines.push('Based on "' + C.source.title + '" by ' + C.source.author + ': ' + C.source.url);
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
        box.setAttribute('aria-label', 'Text to copy');
        host.appendChild(box);
      }
      box.value = text;
      box.focus();
      box.select();
      toast('Copying was blocked. The text is selected below, so copy it by hand.');
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
      toast('Back to the suggested times.');
    },
    jump: (button) => {
      const card = document.getElementById('ci-' + button.dataset.i);
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      card.querySelector('textarea').focus({ preventScroll: true });
    },
    'copy-schedule': (button) => copyText(scheduleText(), 'Schedule copied. Paste it into your alarms or notes.', button),
    ics: () => {
      downloadFile('life-changer-check-ins.ics', icsText(), 'text/calendar');
      toast('Calendar file saved. Open it to add the six reminders.');
    },
    'copy-board': (button) => copyText(boardText(), 'Game board copied.', button),
    'copy-all': (button) => copyText(allText(), 'Every answer copied.', button),
    download: () => downloadFile('life-changer.txt', allText(), 'text/plain'),
    'year-ics': () => {
      downloadFile('life-changer-reminders.ics', yearIcsText(), 'text/calendar');
      toast('Calendar file saved. Open it to add the reminders.');
    },
    'month-close': closeMonth,
    'backup-copy': (button) => {
      markBackup();
      copyText(backupText(), 'Backup code copied. Paste it somewhere safe.', button);
    },
    'backup-download': () => {
      markBackup();
      downloadFile('life-changer-backup-' + dateKey(new Date()) + '.json', backupText(), 'application/json');
      toast('Backup saved.');
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
        toast('That is not a Life Changer backup. Paste the whole code, or choose the backup file.');
        return;
      }
      pendingRestore = normalise(data.state);
      const made = new Date(data.exported);
      const when = isNaN(made) ? 'an unknown date' : longDate.format(made) + ' ' + made.getFullYear();
      const answers = Object.keys(pendingRestore.answers).filter((key) => pendingRestore.answers[key].trim()).length;
      document.getElementById('restore-summary').textContent =
        'This backup is from ' + when + ' and holds ' + plural(answers, 'answer') + '. Restoring it replaces everything on this device.';
      reveal('restore-confirm', true);
    },
    'restore-yes': () => {
      if (!pendingRestore) return;
      state = pendingRestore;
      pendingRestore = null;
      flush();
      render();
      window.scrollTo(0, 0);
      toast('Backup restored.');
    },
    'copy-past': (button) => copyText(state.past[Number(button.dataset.i)].text, 'Run copied.', button),
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
        lastBackup: state.lastBackup
      });
      flush();
      location.hash = 'start';
      toast('New run started. The last one is under past runs.');
    },
    'erase-yes': () => {
      state = blankState();
      flush();
      render();
      window.scrollTo(0, 0);
      toast('Everything erased.');
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

  syncDates();
  flush();
  render();

  // Lets the installed app open with no connection. Embedded previews have no service workers.
  if (!EMBED && 'serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
