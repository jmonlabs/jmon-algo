// %%
import { show, showScore, showPlayer, clear } from "./viewer.js";
import jm from "../../src/index.js";
clear();

// %% Execute this
const c_major = new jm.theory.harmony.Scale("C", "major").generate({
  start: "C4",
  end: 72,
});

const durations = new Array(c_major.length).fill(1); // an array of ones for durations
const time = durations.map(
  (duration, i) =>
    durations.slice(0, i + 1).reduce((sum, d) => sum + d, 0) - durations[0],
);

const c_major_track = c_major.map((pitch, i) => ({
  pitch: pitch,
  duration: durations[i],
  time: time[i],
}));

const c_major_piece = {
  metadata: { title: "C-major" },
  tracks: [{ notes: c_major_track }], // must be an object!
};

// %% Show raw data
show(c_major_piece);

// %% Show musical notation
showScore(c_major_piece);

// %% Show interactive player
showPlayer(c_major_piece);
