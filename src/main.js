import './style.css';

const questions = [
  {
    kind: 'BASELINE',
    title: 'What does your starting point look like?',
    note: 'There is no “right” answer. A useful plan begins with an honest one.',
    render: () => `
      <div class="question-body">
        <h2>Right now, how much financial runway do you have?</h2>
        <div class="choice-grid" data-field="runway">
          <button class="choice selected" data-value="Starting from zero"><strong>Starting from zero</strong><small>I need income right away</small></button>
          <button class="choice" data-value="Under one month"><strong>Under one month</strong><small>A little room to move</small></button>
          <button class="choice" data-value="One to three months"><strong>1–3 months</strong><small>Enough to build deliberately</small></button>
          <button class="choice" data-value="More than three months"><strong>3+ months</strong><small>I can invest in a longer bet</small></button>
        </div>
      </div>`
  },
  {
    kind: 'CAPACITY',
    title: 'Time is your first currency.',
    note: 'We’ll protect the life you need while building the one you want.',
    render: () => `
      <div class="question-body split-question">
        <div><h2>How many focused hours can you give this each week?</h2><div class="range-wrap"><output id="hours-output">20 hrs</output><input id="hours" type="range" min="3" max="60" value="20" /><div class="range-labels"><span>3 hrs</span><span>60 hrs</span></div></div></div>
        <div class="mini-field"><label for="responsibility">What needs your attention first?</label><input id="responsibility" placeholder="e.g. family, health, studies…" /></div>
      </div>`
  },
  {
    kind: 'STRENGTHS',
    title: 'What can you already work with?',
    note: 'Hands, feet, curiosity, a phone—every asset counts.',
    render: () => `
      <div class="question-body"><h2>Choose the strengths you could put to use this month.</h2>
      <div class="tag-grid" data-field="strengths">
        ${['Physical work','Talking to people','Making / fixing','Selling','Writing / design','Learning quickly','Organizing','Technology'].map((item, i) => `<button class="tag ${i === 0 ? 'active' : ''}" data-value="${item}">${item}<span>+</span></button>`).join('')}
      </div></div>`
  },
  {
    kind: 'DIRECTION',
    title: 'What would “better” actually feel like?',
    note: 'Money matters. So does the shape of the days you earn it in.',
    render: () => `
      <div class="question-body"><h2>Pick the two outcomes that matter most right now.</h2>
      <div class="outcome-list" data-field="outcomes">
        ${[['Stable income','Knowing bills are covered'],['More freedom','Control over time and choices'],['Useful work','Making or helping in a real way'],['A bigger future','Building skills and options']].map((item, i) => `<button class="outcome ${i < 2 ? 'picked' : ''}" data-value="${item[0]}"><span class="check">✓</span><span><strong>${item[0]}</strong><small>${item[1]}</small></span></button>`).join('')}
      </div></div>`
  },
  {
    kind: 'TARGET',
    title: 'Give the loop a destination.',
    note: 'Start with a number that would make a meaningful difference.',
    render: () => `
      <div class="question-body final-question"><h2>What is the first financial milestone you want to reach?</h2>
        <div class="money-input"><span>$</span><input id="goal" inputmode="numeric" type="number" min="1" value="1000" /><span class="per">total</span></div>
        <div class="timeline"><label>Over what timeframe?</label><div class="segmented" data-field="timeline"><button data-value="30 days">30 days</button><button class="selected" data-value="90 days">90 days</button><button data-value="6 months">6 months</button></div></div>
      </div>`
  }
];

let step = 0;
const answers = { runway: 'Starting from zero', hours: 20, strengths: ['Physical work'], outcomes: ['Stable income', 'More freedom'], timeline: '90 days', goal: 1000 };
const content = document.querySelector('#question-content');
const card = document.querySelector('#question-card');
const next = document.querySelector('#next-button');
const back = document.querySelector('#back-button');

function render() {
  const item = questions[step];
  document.querySelector('#question-number').textContent = String(step + 1).padStart(2, '0');
  document.querySelector('#question-kind').textContent = item.kind;
  document.querySelector('#progress-text').textContent = `${step + 1} of ${questions.length}`;
  document.querySelector('#progress-fill').style.width = `${((step + 1) / questions.length) * 100}%`;
  content.innerHTML = `${item.render()}<p class="question-note">${item.note}</p>`;
  back.style.visibility = step === 0 ? 'hidden' : 'visible';
  next.innerHTML = step === questions.length - 1 ? 'Build my first loop <span>↗</span>' : 'Continue <span>→</span>';
  bindInputs();
}

function bindInputs() {
  content.querySelectorAll('.choice').forEach(button => button.addEventListener('click', () => {
    answers.runway = button.dataset.value;
    content.querySelectorAll('.choice').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected');
  }));
  const hours = content.querySelector('#hours');
  if (hours) hours.addEventListener('input', () => { answers.hours = Number(hours.value); content.querySelector('#hours-output').textContent = `${hours.value} hrs`; });
  const responsibility = content.querySelector('#responsibility');
  if (responsibility) responsibility.addEventListener('input', () => { answers.responsibility = responsibility.value; });
  content.querySelectorAll('.tag').forEach(button => button.addEventListener('click', () => {
    button.classList.toggle('active');
    answers.strengths = [...content.querySelectorAll('.tag.active')].map(item => item.dataset.value);
  }));
  content.querySelectorAll('.outcome').forEach(button => button.addEventListener('click', () => {
    const selected = content.querySelectorAll('.outcome.picked');
    if (!button.classList.contains('picked') && selected.length >= 2) showToast('Choose your two strongest priorities.');
    else button.classList.toggle('picked');
    answers.outcomes = [...content.querySelectorAll('.outcome.picked')].map(item => item.dataset.value);
  }));
  const goal = content.querySelector('#goal');
  if (goal) goal.addEventListener('input', () => { answers.goal = Number(goal.value); });
  content.querySelectorAll('.segmented button').forEach(button => button.addEventListener('click', () => {
    content.querySelectorAll('.segmented button').forEach(item => item.classList.remove('selected'));
    button.classList.add('selected'); answers.timeline = button.dataset.value;
  }));
}

next.addEventListener('click', () => {
  if (step < questions.length - 1) { step += 1; animateRender(); }
  else complete();
});
back.addEventListener('click', () => { if (step > 0) { step -= 1; animateRender(); } });
function animateRender() { card.classList.add('changing'); setTimeout(() => { render(); card.classList.remove('changing'); }, 160); }
function complete() {
  const monthly = Math.max(1, Math.ceil(answers.goal / (answers.timeline === '30 days' ? 1 : answers.timeline === '90 days' ? 3 : 6)));
  card.innerHTML = `<div class="complete-state"><span class="complete-mark">✓</span><p class="tiny-label">YOUR LOOP IS READY</p><h2>A first path toward <em>$${answers.goal.toLocaleString()}</em>.</h2><p>We’ll start with work that uses ${answers.strengths.slice(0, 2).join(' and ') || 'your available strengths'}, then test it in small, measurable steps.</p><div class="plan-preview"><span>FIRST MONTHLY TARGET</span><strong>$${monthly.toLocaleString()}</strong><span>EST. FOCUSED TIME</span><strong>${answers.hours} hrs / week</strong></div><button class="primary-button" type="button" id="restart">Start the first experiment <span>→</span></button></div>`;
  card.querySelector('#restart').addEventListener('click', () => showToast('Your first experiment has been saved.');
}
function showToast(message) { const toast = document.querySelector('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
render();
