const { useState, useEffect, useMemo, useRef } = React;

const STORAGE_KEY = "dubstep-theory-quest";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

const CHORD_TYPES = [
  { id: "maj", name: "Major", intervals: [0, 4, 7], vibe: "Bright, triumphant" },
  { id: "min", name: "Minor", intervals: [0, 3, 7], vibe: "Moody, dubstep staple" },
  { id: "min7", name: "Minor 7", intervals: [0, 3, 7, 10], vibe: "Lush & liquid" },
  { id: "sus2", name: "Sus2", intervals: [0, 2, 7], vibe: "Floaty tension" },
  { id: "sus4", name: "Sus4", intervals: [0, 5, 7], vibe: "Pre-drop suspension" },
  { id: "dim", name: "Diminished", intervals: [0, 3, 6], vibe: "Horror stabs" },
  { id: "aug", name: "Augmented", intervals: [0, 4, 8], vibe: "Chromatic lift" },
];

const QUESTS = [
  {
    id: "foundation",
    title: "Foundation Runner",
    detail: "Intervals, triads, and groove basics.",
    reward: 120,
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    steps: [
      "Build 3 basic triads in the Chord Forge.",
      "Finish 2 theory quiz questions in the Arcade.",
      "Score 1 correct ear-training question.",
    ],
  },
  {
    id: "wobble",
    title: "Wobble Architect",
    detail: "Modal swaps, dissonance, and drop prep.",
    reward: 180,
    image:
      "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?auto=format&fit=crop&w=800&q=80",
    steps: [
      "Play 2 suspended chords and hear the release.",
      "Complete 3 ear-training rounds in a row.",
      "Finish a MIDI pad drill lesson.",
    ],
  },
  {
    id: "melodic",
    title: "Melodic Dubstep Sage",
    detail: "Extended chords, pads, and soaring lifts.",
    reward: 240,
    image:
      "https://images.unsplash.com/photo-1524678195330-4e77c0d1e5d4?auto=format&fit=crop&w=800&q=80",
    steps: [
      "Chain 4 chords into a progression.",
      "Perfect score on a 4-question theory sprint.",
      "Hit a minor 7 pad chord on your MIDI controller.",
    ],
  },
];

const COURSES = [
  {
    id: "starter",
    name: "Starter Rave",
    chords: ["Cmin", "G#maj", "Fmin", "Gmin"],
    flavor: "Classic minor tonic cycle for heavy drops.",
  },
  {
    id: "melodic",
    name: "Melodic Lift",
    chords: ["D#maj7", "Cmin7", "G#maj", "A#sus4"],
    flavor: "Major 7 lift with suspended pre-drop release.",
  },
  {
    id: "future",
    name: "Future Edge",
    chords: ["Fmin", "Dbmaj", "Ebsus2", "Bbmin7"],
    flavor: "Modal swaps and airy sus chords for color.",
  },
];

const QUESTION_BANK = [
  {
    prompt: "Which chord type creates the classic dubstep tension before a drop?",
    options: ["Major triad", "Suspended 4th", "Augmented", "Diminished"],
    answer: "Suspended 4th",
    tip: "Sus4 wants to resolve down to a major/minor third.",
  },
  {
    prompt: "What interval separates the root and fifth?",
    options: ["Perfect fifth", "Major third", "Perfect fourth", "Tritone"],
    answer: "Perfect fifth",
    tip: "Seven semitones builds a stable foundation.",
  },
  {
    prompt: "A minor 7 chord is built by adding which note?",
    options: ["Major 6", "Minor 7", "Major 2", "Tritone"],
    answer: "Minor 7",
    tip: "10 semitones above the root completes the color.",
  },
  {
    prompt: "Which scale degree works great as a modal interchange for grit?",
    options: ["♭VII", "III", "II", "V"],
    answer: "♭VII",
    tip: "Borrowed flat-seven is a dubstep hero move.",
  },
];

function usePersistentState() {
  const [state, setState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return (
      saved && JSON.parse(saved)
    ) || { xp: 0, streak: 0, completed: {}, lessons: 0, earWins: 0, activeQuest: QUESTS[0].id };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  return [state, setState];
}

function midiToName(note) {
  return NOTE_NAMES[note % 12];
}

function buildChord(key, chordType) {
  const rootIndex = NOTE_NAMES.indexOf(key);
  return chordType.intervals.map((i) => NOTE_NAMES[(rootIndex + i) % 12]);
}

function useAudioEngine() {
  const ctxRef = useRef(null);

  const ensureContext = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  };

  const playChord = (key, chordType) => {
    const ctx = ensureContext();
    const notes = buildChord(key, chordType);
    const now = ctx.currentTime;
    notes.forEach((note, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const freq = 440 * Math.pow(2, (NOTE_NAMES.indexOf(note) - 9) / 12 + 1);
      osc.frequency.value = freq;
      osc.type = "sawtooth";
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + idx * 0.02);
      osc.stop(now + 1.4 + idx * 0.02);
    });
    return notes;
  };

  return { playChord };
}

function Hero({ xp, streak, onStart }) {
  return (
    <section className="hero">
      <div className="hero__copy">
        <div className="badge">Dubstep Theory Quest · React Edition</div>
        <h1>Play your way to brutal drops</h1>
        <p>
          Hero-style progression with quizzes, ear training, MIDI pad drills, and chord-forging mini games. Build melodic
          dubstep instincts from zero to stage-ready.
        </p>
        <div className="hero__actions">
          <button className="button" onClick={onStart}>
            Enter the arena
          </button>
          <button className="button secondary" onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}>
            Explore modules
          </button>
        </div>
        <div className="row">
          <span className="chip">XP: {xp}</span>
          <span className="chip">Streak: {streak} correct</span>
        </div>
      </div>
      <div className="panel panel--accent">
        <h3>Live Quest Status</h3>
        <p>Unlock worlds with music theory wins, quizzes, and MIDI pad targets.</p>
        <div className="progress-bar" aria-label="xp">
          <div className="progress-bar__fill" style={{ width: `${Math.min(100, (xp % 500) / 5)}%` }}></div>
        </div>
        <p className="meta">Next reward at 500 XP cycles.</p>
        <div className="row">
          <span className="tag">Quizzes</span>
          <span className="tag">Ear training</span>
          <span className="tag">Pad drills</span>
          <span className="tag">Chord forge</span>
        </div>
      </div>
    </section>
  );
}

function LevelMap({ state, setState }) {
  const tiers = [
    { id: "fundamentals", name: "Launch Pad", focus: "Intervals, rhythm", tasks: 3, reward: 80 },
    { id: "mode", name: "Mode Crafter", focus: "Modal swaps", tasks: 4, reward: 120 },
    { id: "progressions", name: "Progression Pilot", focus: "4-chord lifters", tasks: 4, reward: 140 },
    { id: "pad", name: "Pad Lab", focus: "MIDI drills", tasks: 3, reward: 100 },
  ];

  const toggleComplete = (id) => {
    setState((prev) => {
      const completed = { ...prev.completed, [id]: !prev.completed[id] };
      const xpDelta = completed[id] ? tiers.find((t) => t.id === id).reward : -tiers.find((t) => t.id === id).reward;
      return { ...prev, completed, xp: Math.max(0, prev.xp + xpDelta) };
    });
  };

  return (
    <div>
      <div className="section-heading">
        <h2>Campaign map</h2>
        <p className="meta">Mark tiers complete after finishing the drills inside each module.</p>
      </div>
      <div className="grid">
        {tiers.map((tier) => (
          <div key={tier.id} className="level-card">
            <h4>{tier.name}</h4>
            <p className="meta">Focus: {tier.focus}</p>
            <p className="meta">Steps: {tier.tasks} · Reward {tier.reward} XP</p>
            <div className="actions">
              <button className="button secondary" onClick={() => toggleComplete(tier.id)}>
                {state.completed[tier.id] ? "Mark unplayed" : "Mark complete"}
              </button>
              <span className={`status-pill ${state.completed[tier.id] ? "complete" : "active"}`}>
                {state.completed[tier.id] ? "Complete" : "In progress"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuestBoard({ state, setState }) {
  const quest = QUESTS.find((q) => q.id === state.activeQuest) || QUESTS[0];

  const progress = useMemo(() => {
    const completedSteps = Math.min(quest.steps.length, state.lessons + Math.floor(state.earWins / 2));
    return {
      completed: completedSteps,
      percent: Math.round((completedSteps / quest.steps.length) * 100),
    };
  }, [quest, state.lessons, state.earWins]);

  const completeQuest = () => {
    setState((prev) => ({
      ...prev,
      xp: prev.xp + quest.reward,
      lessons: 0,
      earWins: 0,
      activeQuest: QUESTS[(QUESTS.indexOf(quest) + 1) % QUESTS.length].id,
    }));
  };

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>{quest.title}</h2>
        <span className="chip">Reward: {quest.reward} XP</span>
      </div>
      <div className="card-layout">
        <div>
          <p>{quest.detail}</p>
          <div className="progress-bar" aria-label="quest progress">
            <div className="progress-bar__fill" style={{ width: `${progress.percent}%` }}></div>
          </div>
          <p className="meta">{progress.completed} / {quest.steps.length} milestones</p>
          <button className="button" disabled={progress.completed < quest.steps.length} onClick={completeQuest}>
            Claim reward & jump to next quest
          </button>
        </div>
        <div className="panel" style={{ backgroundImage: `linear-gradient(120deg, rgba(18,18,42,0.9), rgba(12,12,32,0.9)), url(${quest.image})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <h3>Milestones</h3>
          {quest.steps.map((s, i) => (
            <div key={i} className="course-step">
              <span className="tag">Step {i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChordForge({ onPlay, onLogged }) {
  const [key, setKey] = useState("C");
  const [type, setType] = useState(CHORD_TYPES[1]);
  const [lastNotes, setLastNotes] = useState([]);

  const play = () => {
    const notes = onPlay(key, type);
    setLastNotes(notes);
    onLogged();
  };

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>Chord Forge</h2>
        <span className="chip">Hear it · Build it · Memorize it</span>
      </div>
      <div className="row">
        <label>
          Key
          <select value={key} onChange={(e) => setKey(e.target.value)}>
            {NOTE_NAMES.map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
        <label>
          Flavor
          <select value={type.id} onChange={(e) => setType(CHORD_TYPES.find((c) => c.id === e.target.value))}>
            {CHORD_TYPES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button className="button" onClick={play}>
          Play chord
        </button>
      </div>
      <p>{type.vibe}</p>
      <div className="row" style={{ marginTop: 10 }}>
        {lastNotes.map((n) => (
          <span key={n} className="chord-pill">
            {n}
          </span>
        ))}
      </div>
    </div>
  );
}

function EarTraining({ onSuccess, audio }) {
  const [question, setQuestion] = useState(null);
  const [feedback, setFeedback] = useState("");

  const newQuestion = () => {
    const key = NOTE_NAMES[Math.floor(Math.random() * NOTE_NAMES.length)];
    const chord = CHORD_TYPES[Math.floor(Math.random() * CHORD_TYPES.length)];
    const choices = [...CHORD_TYPES]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    if (!choices.find((c) => c.id === chord.id)) choices[0] = chord;
    setQuestion({ key, chord, choices: choices.sort(() => 0.5 - Math.random()) });
    setFeedback("Press play and pick the chord flavor.");
  };

  const play = () => {
    if (!question) newQuestion();
    const target = question || { key: NOTE_NAMES[0], chord: CHORD_TYPES[0] };
    audio.playChord(target.key, target.chord);
  };

  const answer = (choice) => {
    if (!question) return;
    if (choice.id === question.chord.id) {
      setFeedback("Correct! That texture fits dubstep color.");
      onSuccess();
      setTimeout(newQuestion, 800);
    } else {
      setFeedback("Not quite. Listen for the suspension or third quality.");
    }
  };

  useEffect(() => {
    newQuestion();
  }, []);

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>Ear Training Arena</h2>
        <span className="chip">Audio quiz</span>
      </div>
      <p>{feedback}</p>
      <div className="row" style={{ margin: "8px 0" }}>
        <button className="button" onClick={play}>
          Play question
        </button>
        <button className="button secondary" onClick={newQuestion}>
          New round
        </button>
      </div>
      <div className="quiz-grid">
        {question?.choices.map((c) => (
          <div key={c.id} className="quiz-option" onClick={() => answer(c)}>
            <strong>{c.name}</strong>
            <p className="meta">{c.vibe}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TheoryQuiz({ onCorrect }) {
  const [current, setCurrent] = useState(() => QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)]);
  const [selected, setSelected] = useState(null);

  const choose = (option) => {
    setSelected(option);
    if (option === current.answer) {
      onCorrect();
    }
  };

  const next = () => {
    setSelected(null);
    setCurrent(QUESTION_BANK[Math.floor(Math.random() * QUESTION_BANK.length)]);
  };

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>Theory Arcade</h2>
        <span className="chip">Multiple choice</span>
      </div>
      <h3>{current.prompt}</h3>
      <div className="quiz-grid">
        {current.options.map((option) => {
          const state = selected
            ? option === current.answer
              ? "correct"
              : option === selected
                ? "wrong"
                : ""
            : "";
          return (
            <div key={option} className={`quiz-option ${state}`} onClick={() => choose(option)}>
              {option}
            </div>
          );
        })}
      </div>
      <p className="meta" style={{ marginTop: 10 }}>
        {selected ? current.tip : "Tap an answer to earn XP."}
      </p>
      <button className="button secondary" style={{ marginTop: 10 }} onClick={next}>
        Next question
      </button>
    </div>
  );
}

function PadLab({ onLessonComplete, state, setState }) {
  const [midiSupported, setMidiSupported] = useState("requestMIDIAccess" in navigator);
  const [access, setAccess] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [log, setLog] = useState(["Waiting for device..."]);
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [course, setCourse] = useState(COURSES[0]);
  const [step, setStep] = useState(0);

  const appendLog = (line) => setLog((l) => [line, ...l].slice(0, 12));

  const refreshInputs = () => {
    if (!access) return;
    setInputs(Array.from(access.inputs.values()));
  };

  const handleMessage = (message) => {
    const [status, note, velocity] = message.data;
    const command = status & 0xf0;
    if (command === 0x90 && velocity > 0) {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.add(midiToName(note));
        return next;
      });
      appendLog(`Note on: ${midiToName(note)}`);
    }
    if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      setActiveNotes((prev) => {
        const next = new Set(prev);
        next.delete(midiToName(note));
        return next;
      });
      appendLog(`Note off: ${midiToName(note)}`);
    }
  };

  const bindInput = (input) => {
    if (!input) return;
    input.onmidimessage = handleMessage;
    appendLog(`Connected to ${input.name}`);
  };

  useEffect(() => {
    if (!midiSupported) return;
    navigator.requestMIDIAccess().then((acc) => {
      setAccess(acc);
      setInputs(Array.from(acc.inputs.values()));
      acc.onstatechange = refreshInputs;
    });
  }, [midiSupported]);

  useEffect(() => {
    if (selectedId && inputs.length) {
      const input = inputs.find((i) => i.id === selectedId);
      bindInput(input);
    }
  }, [selectedId, inputs]);

  useEffect(() => {
    if (!course) return;
    const target = course.chords[step];
    const chordNotes = target.match(/[A-G]#?|Bb|Db|Eb|Gb|min7|min|maj7|maj|sus4|sus2/g);
    if (!chordNotes) return;
    const normalizedTarget = target
      .replace("maj7", "maj")
      .replace("min7", "min")
      .replace("sus2", "sus2")
      .replace("sus4", "sus4");
    const base = normalizedTarget.match(/[A-G]#?|Bb|Db|Eb|Gb/)[0];
    const flavor = normalizedTarget.replace(base, "");
    const type =
      flavor === "maj" || flavor === "maj7"
        ? CHORD_TYPES.find((c) => c.id === "maj")
        : flavor === "min" || flavor === "min7"
          ? CHORD_TYPES.find((c) => c.id === "min")
          : flavor.includes("sus2")
            ? CHORD_TYPES.find((c) => c.id === "sus2")
            : flavor.includes("sus4")
              ? CHORD_TYPES.find((c) => c.id === "sus4")
              : CHORD_TYPES[0];
    const expected = new Set(buildChord(base.replace("b", "b"), type));

    const interval = setInterval(() => {
      const names = activeNotes;
      const cleaned = new Set(Array.from(names).map((n) => n.replace("Bb", "A#").replace("Db", "C#").replace("Eb", "D#")));
      const match = expected.size && Array.from(expected).every((n) => cleaned.has(n));
      if (match && cleaned.size === expected.size) {
        appendLog(`Matched ${target}!`);
        setStep((s) => {
          const next = (s + 1) % course.chords.length;
          if (next === 0) {
            onLessonComplete();
          }
          return next;
        });
      }
    }, 400);
    return () => clearInterval(interval);
  }, [activeNotes, course, step, onLessonComplete]);

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>MIDI Pad Lab</h2>
        <span className="chip">Hardware quests</span>
      </div>
      {!midiSupported && <p>Your browser does not expose Web MIDI. Try Chrome for pad quests.</p>}
      {midiSupported && (
        <>
          <div className="row">
            <label>
              Device
              <select value={selectedId || ""} onChange={(e) => setSelectedId(e.target.value)}>
                <option value="">Select MIDI input</option>
                {inputs.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </label>
            <button className="button secondary" onClick={refreshInputs}>
              Refresh
            </button>
          </div>
          <div className="panel" style={{ marginTop: 12 }}>
            <h3>Pad progression course</h3>
            <select value={course.id} onChange={(e) => setCourse(COURSES.find((c) => c.id === e.target.value))}>
              {COURSES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="meta">{course.flavor}</p>
            <div className="row" style={{ marginTop: 8 }}>
              {course.chords.map((c, idx) => (
                <span key={c + idx} className={`chord-pill ${idx === step ? "active" : ""}`}>
                  {idx === step ? "▶" : ""} {c}
                </span>
              ))}
            </div>
          </div>
          <div className="log" aria-live="polite">
            {log.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SoundDesignCheats() {
  const cheats = [
    {
      title: "Rhythm rules",
      tips: [
        "Half-time snares on beat 3 keep space for bass growls.",
        "Use swing or triplet hats to create movement.",
        "Automate filter cutoff on off-beats for pump."
      ],
    },
    {
      title: "Harmony magic",
      tips: [
        "Borrow ♭VII and iv from parallel minor for grit.",
        "Resolve sus4 to minor 3rd right before the drop.",
        "Chromatic mediants make cinematic lifts."
      ],
    },
    {
      title: "Texture stack",
      tips: [
        "Layer saws with sub sine; carve space with multiband.",
        "Tiny reverb on percussion keeps it dark but wide.",
        "Pitch envelopes turn bass into talking wubs."
      ],
    },
  ];

  return (
    <div className="panel">
      <div className="section-heading">
        <h2>Dubstep Cheat Deck</h2>
        <span className="chip">Bookmark</span>
      </div>
      <div className="tier-grid">
        {cheats.map((c) => (
          <div key={c.title} className="panel">
            <h3>{c.title}</h3>
            <ul>
              {c.tips.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [state, setState] = usePersistentState();
  const audio = useAudioEngine();

  const handleChordPlay = (key, type) => {
    const notes = audio.playChord(key, type);
    setState((prev) => ({ ...prev, lessons: prev.lessons + 1, xp: prev.xp + 10 }));
    return notes;
  };

  const handleQuizCorrect = () => {
    setState((prev) => ({ ...prev, xp: prev.xp + 15, streak: prev.streak + 1 }));
  };

  const handleEarSuccess = () => {
    setState((prev) => ({ ...prev, xp: prev.xp + 20, earWins: prev.earWins + 1, streak: prev.streak + 1 }));
  };

  const handleLessonComplete = () => {
    setState((prev) => ({ ...prev, xp: prev.xp + 50, lessons: prev.lessons + 1 }));
  };

  return (
    <div>
      <Hero xp={state.xp} streak={state.streak} onStart={() => window.scrollTo({ top: 350, behavior: "smooth" })} />
      <QuestBoard state={state} setState={setState} />
      <LevelMap state={state} setState={setState} />
      <div className="card-layout" style={{ marginTop: 24 }}>
        <ChordForge onPlay={handleChordPlay} onLogged={() => {}} />
        <EarTraining onSuccess={handleEarSuccess} audio={audio} />
      </div>
      <div className="card-layout" style={{ marginTop: 16 }}>
        <TheoryQuiz onCorrect={handleQuizCorrect} />
        <PadLab onLessonComplete={handleLessonComplete} state={state} setState={setState} />
      </div>
      <SoundDesignCheats />
      <p className="footer">Progress saves locally. Built for quick practice loops and hardware integration.</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
