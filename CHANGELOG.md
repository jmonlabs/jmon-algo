# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- deno.json configuration for JSR (Deno/JSR package registry) publishing
- package.json for npm publishing
- GitHub Actions workflow for automated npm publishing on git tags
- Dynamic documentation builder script (scripts/build-docs.js)
- CHANGELOG.md for tracking project changes

### Changed
- Updated project structure to support both Deno and npm ecosystems

### Infrastructure
- Configured dual publishing: npm and JSR (Deno's package registry)
- Added automated versioning from git tags
- Set up automated GitHub releases on tag push

---

## [1.0.0] - Prior Releases

### Features Complete
- ✅ **Music Theory** - Scales, chords, progressions, voice leading, ornaments, articulations
- ✅ **Generative Algorithms** - Cellular automata, fractals, random walks, genetic algorithms, Gaussian processes, minimalism
- ✅ **Analysis** - 11+ musical metrics for evaluation
- ✅ **Visualization** - Fractal zone selectors, cellular automata strip selection, Observable integration
- ✅ **Format Conversion** - MIDI, ABC notation, Tone.js, VexFlow, WAV, SuperCollider
- ✅ **Browser Integration** - Music player with General MIDI support, score renderer
- ✅ **Observable Support** - Full compatibility with Observable notebooks

### Test Coverage
- 82.8% passing rate (24/29 comprehensive tests)
- All generative algorithms: 100% tested
- Music theory core: 73% tested
- Analysis functions: 100% tested
- Format converters: 100% tested

### Documentation
- Complete JavaScript translation of Djalgo Python user guide
- 9 comprehensive tutorials covering all major features
- Feature comparison with Djalgo
- Extensive API documentation

---

## Version History Notes

For detailed development history and comparisons with Djalgo, see:
- [FINAL_SUMMARY.md](./FINAL_SUMMARY.md) - Complete project overview
- [TEST_RESULTS.md](./TEST_RESULTS.md) - Comprehensive test report
- [COMPARISON_SUMMARY.md](./COMPARISON_SUMMARY.md) - Djalgo vs algo comparison
- [TUTORIAL_STATUS.md](./TUTORIAL_STATUS.md) - Tutorial completion status
