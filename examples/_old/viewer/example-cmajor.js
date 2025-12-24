#!/usr/bin/env -S deno run

import { show, showScore, showPlayer } from "./viewer.js";

// %% Just data
const data = [1, 2, 3, 4, 5];
show(data);

// %% Simple composition
const c_major_piece = {
  metadata: { title: "C-major" },
  tracks: [
    {
      notes: [
        { pitch: 60, duration: 0.5, time: 0 },
        { pitch: 62, duration: 0.5, time: 0.5 },
        { pitch: 64, duration: 0.5, time: 1.0 },
        { pitch: 65, duration: 0.5, time: 1.5 },
      ],
    },
  ],
};

// Show the score
showScore(c_major_piece);

// Show the player
showPlayer(c_major_piece);

// Show the raw data too
show(c_major_piece);
