(function () {
  'use strict';

  const C = window.LC_CONTENT;
  // Set by embedded builds whose host frame blocks file downloads.
  const EMBED = !!window.LC_EMBED;
  const STORE_KEY = 'life-changer:v1';
  const ROUTES = ['start', 'ideas', 'morning', 'day', 'evening', 'game'];

  const view = document.getElementById('view');
  const toastEl = document.getElementById('toast');
  const noticeEl = document.getElementById('notice');

  /* ---------- state ---------- */

  function blankState() {
    return { answers: {}, quests: {}, times: {}, pos: { morning: 0, evening: 0 }, loop: 0, stage: 3 };
  }

  function loadState() {
    const base = blankState();
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return base;
      const saved = JSON.parse(raw);
      return {
        answers: Object.assign(base.answers, saved.answers),
        quests: Object.assign(base.quests, saved.quests),
        times: Object.assign(base.times, saved.times),
        pos: Object.assign(base.pos, saved.pos),
        loop: Number(saved.loop) || 0,
        stage: Number.isInteger(saved.stage) ? saved.stage : base.stage
      };
    } catch (err) {
      return base;
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

  function currentRoute() {
    const name = location.hash.replace(/^#/, '');
    return ROUTES.includes(name) ? name : 'start';
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
              const done = countDone(row.route);
              const all = KEYS[row.route].length;
              return `
                <li data-route="${row.route}">
                  <a href="#${row.route}">
                    <span class="plan-mark" style="--p:${done / all}"></span>
                    <span class="plan-name">${esc(row.name)} <span class="plan-kind">· ${esc(row.kind)}</span></span>
                    <span class="plan-count mono" aria-label="${done} of ${all} done">${done}/${all}</span>
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

  function icsText() {
    const day = reminderDate();
    const ymd = '' + day.getFullYear() + pad(day.getMonth() + 1) + pad(day.getDate());
    const hm = (minutes) => pad(Math.floor(minutes / 60)) + pad(minutes % 60) + '00';
    const icsEscape = (s) => s.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
    // RFC 5545 wants lines folded at 75 octets; fold at 60 characters to stay clear of it.
    const fold = (line) => line.replace(/(.{60})(?=.)/g, '$1\r\n ');
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Life Changer//One-day reset//EN', 'CALSCALE:GREGORIAN'];
    sortedCheckins().forEach((c) => {
      const at = timeOf(c);
      const text = icsEscape(c.prompt);
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + ymd + '-' + c.id + '@life-changer',
        'DTSTAMP:' + stamp,
        'DTSTART:' + ymd + 'T' + hm(at),
        'DTEND:' + ymd + 'T' + hm(Math.min(at + 10, 24 * 60 - 1)),
        'SUMMARY:' + text,
        'DESCRIPTION:Life Changer check-in. Answer it in the app.',
        'BEGIN:VALARM',
        'ACTION:DISPLAY',
        'DESCRIPTION:' + text,
        'TRIGGER:PT0M',
        'END:VALARM',
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
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
    const today = new Date();
    const todayKey = dateKey(today);
    const record = state.quests[todayKey] || { done: [], n: 0 };
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
      const d = new Date(today);
      d.setDate(today.getDate() - back);
      const key = dateKey(d);
      const rec = state.quests[key];
      let done = 0;
      let total = 0;
      if (back === 0) {
        total = quests.length;
        done = quests.filter((text) => record.done.includes(text)).length;
      } else if (rec) {
        total = rec.n;
        done = Math.min(rec.done.length, rec.n);
      }
      cells.push(`
        <li class="${back === 0 ? 'is-today' : ''}">
          <span>${esc(weekday.format(d))}</span>
          <span class="week-bar" style="--f:${total ? done / total : 0}"></span>
          <span>${total ? done + '/' + total : '–'}</span>
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
    const box = document.getElementById('quest-' + index);
    if (box) box.focus();
  }

  function paintQuests() {
    const host = document.getElementById('quests');
    if (host) host.innerHTML = questsHtml();
  }

  function gameView() {
    const G = C.game;
    return `
      <header class="phase-head">
        <p class="eyebrow"><span class="dot"></span>${esc(G.eyebrow)}</p>
        <h1>${esc(G.title)}</h1>
        <p class="lede">${esc(G.intro)}</p>
      </header>

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
                <textarea id="b-${esc(t.key)}" data-key="${esc(t.key)}" rows="3" aria-labelledby="tile-h-${esc(t.key)}"
                  placeholder="${esc(t.prompt)}"></textarea>
              </div>`
            )
            .join('')}
        </div>
      </section>

      <section aria-labelledby="keep-h" data-copy-host>
        <h2 id="keep-h" class="section-h">Keep a copy</h2>
        <p class="body small">Everything you wrote lives in this browser and nowhere else. Clearing your browser data deletes it, so paste a copy into your notes.</p>
        <div class="actions">
          <button type="button" class="btn btn-primary" data-act="copy-board">Copy the game board</button>
          <button type="button" class="btn" data-act="copy-all">Copy every answer</button>
          <button type="button" class="btn" data-act="download" data-standalone>Download as a file</button>
        </div>
      </section>

      <section class="erase" aria-labelledby="erase-h">
        <h2 id="erase-h" class="sr-only">Start over</h2>
        <p class="body small">Running the protocol again? Erasing clears every answer and the quest history on this device.</p>
        <div class="actions" id="erase-ask">
          <button type="button" class="btn" data-act="erase-ask">Erase everything</button>
        </div>
        <div class="actions" id="erase-confirm" hidden>
          <button type="button" class="btn btn-danger" data-act="erase-yes">Yes, erase it all</button>
          <button type="button" class="btn" data-act="erase-no">Keep my answers</button>
        </div>
      </section>`;
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
    game: gameView
  };

  function paintNav() {
    const route = currentRoute();
    document.querySelectorAll('.nav a').forEach((link) => {
      const name = link.dataset.route;
      if (name === route) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
      if (KEYS[name]) link.style.setProperty('--p', (countDone(name) / KEYS[name].length).toFixed(3));
    });
  }

  function render() {
    const route = currentRoute();
    view.dataset.phase = route;
    view.innerHTML = VIEWS[route]();
    if (EMBED) view.querySelectorAll('[data-standalone]').forEach((el) => el.remove());
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

  view.addEventListener('input', (event) => {
    const field = event.target.closest('textarea[data-key]');
    if (!field) return;
    const key = field.dataset.key;
    state.answers[key] = field.value;
    fit(field);
    save();
    paintNav();
    const seg = view.querySelector('[data-seg="' + key + '"]');
    if (seg) seg.classList.toggle('is-filled', filled(key));
    if (currentRoute() === 'day') paintDay();
    if (currentRoute() === 'game' && key === 'daily') paintQuests();
  });

  view.addEventListener('change', (event) => {
    const box = event.target.closest('input[data-quest]');
    if (box) toggleQuest(Number(box.dataset.quest), box.checked);

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
    'erase-ask': () => {
      document.getElementById('erase-ask').hidden = true;
      document.getElementById('erase-confirm').hidden = false;
      document.querySelector('[data-act="erase-no"]').focus();
    },
    'erase-no': () => {
      document.getElementById('erase-confirm').hidden = true;
      document.getElementById('erase-ask').hidden = false;
    },
    'erase-yes': () => {
      state = blankState();
      flush();
      render();
      window.scrollTo(0, 0);
      toast('Everything erased.');
    }
  };

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

  flush();
  render();
})();
