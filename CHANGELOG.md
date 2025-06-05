# Changelog

All notable changes to Tomoshibi will be documented in this file.

## [1.0.1] - 2025-06-05

### Added
- Version control system with persistent version display in bottom-right corner
- WanaKana integration for accurate Japanese character detection
- Enhanced furigana parser with proper kanji-to-reading mapping
- Priority-based Japanese voice selection for natural pronunciation
- Comprehensive error handling for theme provider and localStorage

### Fixed
- React hook error in ThemeProvider with proper localStorage safeguards
- Furigana display using proper HTML ruby/rt structure
- Audio quality improvements with enhanced voice loading
- Browser compatibility issues with character detection

### Changed
- Optimized speech synthesis for learning with 0.75 rate
- Enhanced voice selection with fallback mechanisms
- Improved furigana CSS positioning and styling

## [1.0.0] - 2025-06-04

### Added
- Initial release of Tomoshibi Japanese learning platform
- Google OAuth authentication system
- SRS-based learning with authentic JLPT N5 content
- Dashboard with progress tracking and achievements
- Study session functionality with review queue
- Responsive mobile-first design with Japanese aesthetic
- Basic furigana support and Japanese audio playback