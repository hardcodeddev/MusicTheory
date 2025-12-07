# Dubstep Theory Quest (React Edition)

A browser-based learning game that takes you from zero theory knowledge to dubstep-ready chord progressions with hands-on quizzes, ear training, MIDI pad drills, and chord-forging tools. Progress is stored locally so you can return to your campaign any time.

## Play it

Open `index.html` in a modern Chromium-based browser. Web MIDI is available in Chrome/Edge; other browsers still get the full theory and ear-training experience.

## Features

- **React-powered game loop** with XP tracking, quest milestones, and tiered campaign cards.
- **Chord Forge** for quickly auditioning dubstep-friendly chords and seeing their tones.
- **Ear Training Arena** that randomizes chord flavors; earn streaks by listening and selecting the right sound.
- **Theory Arcade** multiple-choice quizzes that boost XP when answered correctly.
- **MIDI Pad Lab** with device selection, live note logging, and progression drills that advance when you play the target chord on your pad.
- **Cheat Deck** summarizing rhythm, harmony, and sound-design tactics for drops.

## Development notes

- The UI is a React 18 single page rendered directly in the browser using Babel (no build step).
- Audio is generated with the Web Audio API; MIDI drills rely on `navigator.requestMIDIAccess` when available.
- Game state (XP, streaks, completions) is stored in `localStorage` under the key `dubstep-theory-quest`.
