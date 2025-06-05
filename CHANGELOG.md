# Changelog

All notable changes to Tomoshibi will be documented in this file.

## [1.0.3] - 2025-06-05

### Added
- Complete JLPT content organization system (N5-N1)
- Dynamic content page with tabs for vocabulary, kanji, and grammar
- Authentic N5 vocabulary dataset with 10 essential terms
- Authentic N5 kanji dataset with stroke counts and readings
- Authentic N5 grammar points with detailed explanations
- Search and filtering functionality by tags and content
- SRS-ready JSON structure for future progress tracking
- API endpoints for serving JLPT content files
- Navigation integration with Japanese kanji icon (級)

### Enhanced
- Furigana display system with working test examples
- Audio pronunciation system for vocabulary terms
- Content organization by JLPT levels with proper file structure

## [1.0.2] - 2025-06-05

### Added
- Audio debugging system with voice diagnostics button
- Advanced furigana parser with intelligent kanji-to-reading mapping
- Enhanced Japanese voice selection with premium voice prioritization
- Absolute positioning for furigana display with improved CSS
- Comprehensive audio error handling and logging

### Fixed
- Furigana display issues with proper HTML ruby/rt structure
- Audio quality improvements with better voice loading timing
- Character detection accuracy using WanaKana library
- Browser compatibility for speech synthesis

### Changed
- Updated audio system to prioritize Microsoft Ayumi, Haruka, and Sayaka voices
- Enhanced furigana positioning with relative/absolute CSS layout
- Improved voice selection algorithm with fallback mechanisms

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