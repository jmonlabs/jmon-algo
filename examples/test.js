// %%
import { jm } from '/dist/jmon.esm.js';

// %%
window.addEventListener('load', () => {
  const notes = [
    { pitch: 60, duration: 1, time: 0 },
    { pitch: 62, duration: 1, time: 1 },
    { pitch: 64, duration: 1, time: 2 },
    { pitch: 65, duration: 1, time: 3 },
    { pitch: 67, duration: 1, time: 4 },
    { pitch: 69, duration: 1, time: 5 },
    { pitch: 71, duration: 1, time: 6 },
    { pitch: 72, duration: 1, time: 7 }
  ];

  const piece = {
    metadata: { title: "C Major" },
    tracks: [{ notes }]
  };

  const VF = window.Vex?.Flow || window.VF;
  if (VF) {
    const scoreElement = jm.score(piece, VF);
    document.getElementById('score').appendChild(scoreElement);
  }

  const playerElement = jm.render(piece, { Tone: window.Tone });
  document.getElementById('player').appendChild(playerElement);
});
