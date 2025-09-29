Done
- add sampler dicts linking notes to cdn served from https://github.com/jmonlabs/midi-js-soundfonts/tree/gh-pages/FluidR3_GM

Now
- deprecating abcjs in favor of vexflow

Future
- add a jmon cleaner utility to remove unused graph nodes and other stuff
- add contexts to jm.play() to return different things
  - jm.play(piece, { returnType: 'controls' })  // default: returns player
controls
  - jm.play(piece, { returnType: 'audio' })     // returns raw audio data
  - jm.play(piece, { returnType: 'context' })   // returns Tone.js context
