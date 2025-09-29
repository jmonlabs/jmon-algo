/**
 * UI Constants for the Music Player
 */

// Player dimensions
export const PLAYER_DIMENSIONS = {
  MAX_WIDTH: 800,
  MIN_WIDTH: 0,
  MOBILE_MAX_WIDTH: '100vw',
  PADDING: 16,
  MOBILE_PADDING: 8,
  BORDER_RADIUS: 12,
  MOBILE_BORDER_RADIUS: 8
};

// Responsive breakpoints
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 800,
  DESKTOP: 1200
};

// Timeline constants
export const TIMELINE_CONFIG = {
  MARGIN: '8px 0',
  MOBILE_MARGIN: '6px 0',
  GAP: 12,
  MOBILE_GAP: 8,
  UPDATE_INTERVAL: 100 // ms between timeline updates
};

// Button dimensions
export const BUTTON_DIMENSIONS = {
  PLAY_BUTTON: {
    WIDTH: 40,
    HEIGHT: 40,
    PADDING: 8,
    MOBILE_WIDTH: 40,
    MOBILE_HEIGHT: 40,
    MOBILE_PADDING: 8
  },
  STOP_BUTTON: {
    WIDTH: 32,
    HEIGHT: 32,
    PADDING: 6
  },
  DOWNLOAD_BUTTON: {
    MIN_HEIGHT: 44,
    PADDING: '12px 16px',
    MOBILE_MIN_HEIGHT: 40,
    MOBILE_PADDING: '10px 0'
  }
};

// Color scheme
export const COLORS = {
  BACKGROUND: "#FFFFFF",
  PRIMARY: "#333",
  SECONDARY: "#F0F0F0", 
  ACCENT: "#333",
  TEXT: "#000000",
  LIGHT_TEXT: "#666666",
  BORDER: "#CCCCCC"
};

// Layout constants
export const LAYOUT = {
  MAIN_GAP: 16,
  TOP_CONTAINER_GAP: 24,
  MOBILE_TOP_CONTAINER_GAP: 12,
  RIGHT_COLUMN_MIN_WIDTH: 120,
  RIGHT_COLUMN_MAX_WIDTH: 160,
  LARGE_SCREEN_RIGHT_COLUMN_MIN_WIDTH: 140,
  LARGE_SCREEN_RIGHT_COLUMN_MAX_WIDTH: 160
};

export default {
  PLAYER_DIMENSIONS,
  BREAKPOINTS,
  TIMELINE_CONFIG,
  BUTTON_DIMENSIONS,
  COLORS,
  LAYOUT
};