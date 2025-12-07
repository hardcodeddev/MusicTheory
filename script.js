const levels = [
  {
    id: 'zero-to-rhythm',
    title: 'Rhythm Bootcamp',
    tag: 'Level 1',
    summary: 'Learn the pulse behind dubstep: half-time feel, kick/snare placement, and groove.',
    xp: 40,
    steps: [
      'Count 4 bars of 140 BPM in half-time (snare on beat 3).',
      'Layer claps and snares, then remove everything but kick + snare.',
      'Add swung hi-hats on off-beats and triplet fills.'
    ],
    reward: 'Unlock groove & timing badge.'
  },
  {
    id: 'notes-to-scale',
    title: 'Scales & Key Signatures',
    tag: 'Level 2',
    summary: 'Move from random notes to key-based writing using minor scales that suit darker styles.',
    xp: 60,
    steps: [
      'Learn natural minor intervals: W-H-W-W-H-W-W.',
      'Practice C, D, and F minor scales ascending/descending.',
      'Build the ♭VII and ♭VI borrowed chords for modal colour.'
    ],
    reward: 'Unlock scale navigator badge.'
  },
  {
    id: 'chords-to-progressions',
    title: 'Chord Craft',
    tag: 'Level 3',
    summary: 'Construct triads, sus chords, and 7ths that work in drops and intros.',
    xp: 70,
    steps: [
      'Build minor triads on i, iv, ♭VI, ♭VII.',
      'Add 7ths to i and iv for width (minor 7ths).',
      'Use suspended chords before a drop for tension.'
    ],
    reward: 'Unlock chord palette badge.'
  },
  {
    id: 'progressions-to-arrangement',
    title: 'Progressions & Energy',
    tag: 'Level 4',
    summary: 'Design progressions that map to dubstep sections and energy curves.',
    xp: 80,
    steps: [
      'Try i - ♭VI - ♭VII - iv as a drop loop.',
      'Use ivsus2 → iv to build pre-drop suspense.',
      'Insert chromatic mediant (III) for a surprise lift.'
    ],
    reward: 'Unlock arrangement architect badge.'
  },
  {
    id: 'bass-melody-hybrid',
    title: 'Bassline & Melody Fusion',
    tag: 'Level 5',
    summary: 'Translate chords into bass riffs with call/response and LFO phrasing.',
    xp: 90,
    steps: [
      'Write a bass riff from chord tones (1, ♭3, 5, ♭7).',
      'Alternate short/long LFO shapes for call/response.',
      'Accent drops with octave jumps and slides.'
    ],
    reward: 'Unlock wobble master badge.'
  }
];

const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const chordTypes = [
  { name: 'Minor', intervals: [0, 3, 7] },
  { name: 'Minor 7', intervals: [0, 3, 7, 10] },
  { name: 'Minor 9', intervals: [0, 3, 7, 10, 14] },
  { name: 'Major', intervals: [0, 4, 7] },
  { name: 'Sus2', intervals: [0, 2, 7] },
  { name: 'Sus4', intervals: [0, 5, 7] },
  { name: 'Dominant 7', intervals: [0, 4, 7, 10] },
  { name: 'Half-diminished', intervals: [0, 3, 6, 10] }
];

const quizBank = [
  {
    prompt: 'Identify the chord quality by ear.',
    options: ['Minor', 'Major', 'Sus2', 'Sus4'],
    generate: () => ({ chord: pick(['Minor', 'Major', 'Sus2', 'Sus4']) })
  },
  {
    prompt: 'Is this chord tense or resolved?',
    options: ['Tense/suspended', 'Resolved/stable'],
    generate: () => ({ chord: pick(['Sus2', 'Sus4', 'Minor 9', 'Half-diminished']) })
  },
  {
    prompt: 'Pick the dubstep-friendly flavor.',
    options: ['Minor 7', 'Major', 'Dominant 7', 'Half-diminished'],
    generate: () => ({ chord: pick(['Minor 7', 'Minor 9', 'Dominant 7']) })
  }
];

const storageKey = 'dubstep-theory-progress';
let audioCtx;
let currentQuiz;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getProgress() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return { completed: [], xp: 0 };
  try {
    return JSON.parse(saved);
  } catch (e) {
    return { completed: [], xp: 0 };
  }
}

function saveProgress(progress) {
  localStorage.setItem(storageKey, JSON.stringify(progress));
}

function renderLevels() {
  const progress = getProgress();
  const grid = document.getElementById('level-grid');
  grid.innerHTML = '';

  levels.forEach(level => {
    const card = document.createElement('div');
    card.className = 'level';

    const header = document.createElement('div');
    const title = document.createElement('h3');
    title.className = 'level__title';
    title.textContent = level.title;
    const tag = document.createElement('span');
    tag.className = 'level__tag';
    tag.textContent = level.tag;
    header.appendChild(title);
    header.appendChild(tag);

    const summary = document.createElement('p');
    summary.className = 'level__summary';
    summary.textContent = level.summary;

    const steps = document.createElement('ul');
    level.steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step;
      steps.appendChild(li);
    });

    const footer = document.createElement('div');
    footer.className = 'level__actions';
    const xp = document.createElement('span');
    xp.className = 'level__xp';
    xp.textContent = `+${level.xp} XP`;

    const button = document.createElement('button');
    button.className = 'button button--secondary';
    button.textContent = progress.completed.includes(level.id) ? 'Replay' : 'Complete quest';
    button.addEventListener('click', () => handleComplete(level));

    footer.appendChild(xp);
    footer.appendChild(button);

    if (progress.completed.includes(level.id)) {
      const badge = document.createElement('span');
      badge.className = 'badge';
      badge.textContent = 'Completed';
      card.appendChild(badge);
    }

    card.appendChild(header);
    card.appendChild(summary);
    card.appendChild(steps);
    card.appendChild(footer);
    grid.appendChild(card);
  });
}

function handleComplete(level) {
  const progress = getProgress();
  if (!progress.completed.includes(level.id)) {
    progress.completed.push(level.id);
    progress.xp += level.xp;
    saveProgress(progress);
    updateHero(level.title, level.reward);
    updateXP(progress.xp);
    renderLevels();
  } else {
    updateHero(level.title, 'Revisit the steps to reinforce muscle memory.');
  }
}

function updateHero(title, detail) {
  document.getElementById('mission-title').textContent = title;
  document.getElementById('mission-detail').textContent = detail;
}

function updateXP(xp) {
  const totalPossible = levels.reduce((sum, l) => sum + l.xp, 0);
  const pct = Math.min(100, Math.round((xp / totalPossible) * 100));
  document.getElementById('xp-points').textContent = xp;
  document.getElementById('xp-bar').style.width = `${pct}%`;
}

function initChordBuilder() {
  const keySelect = document.getElementById('key-select');
  const chordSelect = document.getElementById('chord-select');
  keys.forEach(k => {
    const option = document.createElement('option');
    option.value = k;
    option.textContent = k;
    keySelect.appendChild(option);
  });
  chordTypes.forEach(ch => {
    const option = document.createElement('option');
    option.value = ch.name;
    option.textContent = ch.name;
    chordSelect.appendChild(option);
  });

  keySelect.value = 'F';
  chordSelect.value = 'Minor 7';
  updateChordNotes();

  keySelect.addEventListener('change', updateChordNotes);
  chordSelect.addEventListener('change', updateChordNotes);
  document.getElementById('play-chord').addEventListener('click', playSelectedChord);
}

function noteFrequency(noteIndex) {
  const a4 = 440;
  const semitoneRatio = Math.pow(2, 1 / 12);
  const midiNumber = 57 + noteIndex; // base of A3
  return a4 * Math.pow(semitoneRatio, midiNumber - 69);
}

function buildChord(key, chordName) {
  const rootIndex = keys.indexOf(key);
  const chord = chordTypes.find(c => c.name === chordName);
  return chord.intervals.map(interval => keys[(rootIndex + interval) % 12]);
}

function updateChordNotes() {
  const key = document.getElementById('key-select').value;
  const chordName = document.getElementById('chord-select').value;
  const notes = buildChord(key, chordName);
  const noteContainer = document.getElementById('chord-notes');
  noteContainer.innerHTML = '';
  notes.forEach(n => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.textContent = n;
    noteContainer.appendChild(chip);
  });
}

function ensureAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playNotes(noteNames) {
  ensureAudio();
  const now = audioCtx.currentTime;
  noteNames.forEach((note, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const noteIndex = keys.indexOf(note);
    osc.type = 'sawtooth';
    osc.frequency.value = noteFrequency(noteIndex);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now + i * 0.04);
    osc.stop(now + 1.5);
  });
}

function playSelectedChord() {
  const key = document.getElementById('key-select').value;
  const chordName = document.getElementById('chord-select').value;
  const notes = buildChord(key, chordName);
  playNotes(notes);
}

function newQuizQuestion() {
  currentQuiz = pick(quizBank);
  const data = currentQuiz.generate();
  currentQuiz.data = data;
  document.getElementById('quiz-prompt').textContent = currentQuiz.prompt;
  const choices = document.getElementById('quiz-choices');
  const feedback = document.getElementById('quiz-feedback');
  feedback.textContent = '';
  choices.innerHTML = '';
  currentQuiz.options.forEach(option => {
    const btn = document.createElement('button');
    btn.className = 'button button--secondary';
    btn.textContent = option;
    btn.addEventListener('click', () => checkQuiz(option));
    choices.appendChild(btn);
  });
}

function playQuizChord() {
  if (!currentQuiz) newQuizQuestion();
  const chordNotes = buildChord('F', currentQuiz.data.chord);
  playNotes(chordNotes);
}

function checkQuiz(answer) {
  if (!currentQuiz) return;
  const correct = currentQuiz.data.chord;
  const feedback = document.getElementById('quiz-feedback');
  if (answer.toLowerCase().includes(correct.toLowerCase().split(' ')[0])) {
    feedback.textContent = `Correct! That was a ${correct} chord.`;
  } else if (answer.toLowerCase().includes('tense') && (correct.includes('Sus') || correct.includes('Half'))) {
    feedback.textContent = `Yep – ${correct} chords love tension before drops.`;
  } else if (answer.toLowerCase().includes('resolved') && (correct === 'Minor' || correct === 'Major')) {
    feedback.textContent = `Right – ${correct} chords feel stable compared to suspensions.`;
  } else {
    feedback.textContent = `Not quite. It was ${correct}. Listen for the sus/7th color.`;
  }
}

function setupQuiz() {
  document.getElementById('new-quiz').addEventListener('click', newQuizQuestion);
  document.getElementById('play-quiz').addEventListener('click', () => {
    newQuizQuestion();
    setTimeout(playQuizChord, 250);
  });
  document.getElementById('reveal-answer').addEventListener('click', () => {
    if (currentQuiz) {
      document.getElementById('quiz-feedback').textContent = `Answer: ${currentQuiz.data.chord}`;
    }
  });
}

function setupHeroButtons() {
  document.getElementById('start-journey').addEventListener('click', () => {
    const progress = getProgress();
    const nextLevel = levels.find(l => !progress.completed.includes(l.id)) || levels[levels.length - 1];
    updateHero(nextLevel.title, nextLevel.summary);
  });

  document.getElementById('continue-journey').addEventListener('click', () => {
    const progress = getProgress();
    const lastCompleted = levels.findLast?.(l => progress.completed.includes(l.id));
    const level = lastCompleted || levels[0];
    updateHero(level.title, level.reward || level.summary);
  });

  document.getElementById('reset-progress').addEventListener('click', () => {
    saveProgress({ completed: [], xp: 0 });
    renderLevels();
    updateXP(0);
    updateHero('Progress reset', 'Pick any level to restart your climb.');
  });
}

function init() {
  renderLevels();
  const progress = getProgress();
  updateXP(progress.xp);
  initChordBuilder();
  setupQuiz();
  setupHeroButtons();
}

document.addEventListener('DOMContentLoaded', init);
