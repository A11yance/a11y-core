"use strict";

/**
 * color module
 * @module color
 */

/**
 * Parses a color string in rgb or rgba format into a Color object.
 *
 * @param {string} colorString - The color string from CSS.
 * @return {Color}
 */
export function parseColor (colorString) {
  if (colorString === "transparent") {
    return new Color(0, 0, 0, 0);
  }

  let rgbRegex = /^rgb\((\d+), (\d+), (\d+)\)$/;
  let match = colorString.match(rgbRegex);

  if (match) {
    let r = parseInt(match[1], 10);
    let g = parseInt(match[2], 10);
    let b = parseInt(match[3], 10);
    let a = 1;

    return new Color(r, g, b, a);
  }

  let rgbaRegex = /^rgba\((\d+), (\d+), (\d+), (\d*(\.\d+)?)\)/;
  match = colorString.match(rgbaRegex);

  if (match) {
    let r = parseInt(match[1], 10);
    let g = parseInt(match[2], 10);
    let b = parseInt(match[3], 10);
    let a = parseFloat(match[4]);

    return new Color(r, g, b, a);
  }

  return null;
};

/**
 * Suggests alternative color suggestions to meet a given contrast ratio.
 *
 * @param {Color} bgColor - the background color.
 * @param {Color} fgColor - the foreground color.
 * @param {Object.<string, number>} desiredContrastRatios - A map of label to desired contrast ratio.
 * @return {Object.<string, string>}
 */
export function suggestColors (bgColor, fgColor, desiredContrastRatios) {
  let colors = {};
  let bgLuminance = calculateLuminance(bgColor);
  let fgLuminance = calculateLuminance(fgColor);

  let fgLuminanceIsHigher = fgLuminance > bgLuminance;
  let fgYCbCr = toYCbCr(fgColor);
  let bgYCbCr = toYCbCr(bgColor);

  for (let desiredLabel in desiredContrastRatios) {
    let desiredContrast = desiredContrastRatios[desiredLabel];
    let desiredFgLuminance = luminanceFromContrastRatio(bgLuminance, desiredContrast + 0.02, fgLuminanceIsHigher);

    if (desiredFgLuminance <= 1 && desiredFgLuminance >= 0) {
      let newFgColor = translateColor(fgYCbCr, desiredFgLuminance);
      let newContrastRatio = calculateContrastRatio(newFgColor, bgColor);
      let suggestedColors = {};
      suggestedColors.fg = (colorToString(newFgColor));
      suggestedColors.bg = (colorToString(bgColor));
      suggestedColors.contrast = (newContrastRatio.toFixed(2));
      colors[desiredLabel] = (suggestedColors);
      continue;
    }

    let desiredBgLuminance = luminanceFromContrastRatio(fgLuminance, desiredContrast + 0.02, !fgLuminanceIsHigher);
    if (desiredBgLuminance <= 1 && desiredBgLuminance >= 0) {
      let newBgColor = translateColor(bgYCbCr, desiredBgLuminance);
      let newContrastRatio = calculateContrastRatio(fgColor, newBgColor);
      let suggestedColors = {};
      suggestedColors.bg = (colorToString(newBgColor));
      suggestedColors.fg = (colorToString(fgColor));
      suggestedColors.contrast = (newContrastRatio.toFixed(2));
      colors[desiredLabel] = (suggestedColors);
    }
  }

  return colors;
};

/**
 * Calculate the contrast ratio between the two given colors. Returns the ratio
 * to 1, for example for two two colors with a contrast ratio of 21:1, this
 * function will return 21.
 *
 * @param {Color} fgColor - the foreground color.
 * @param {Color} bgColor - the background color.
 * @return {!number}
 */
export function calculateContrastRatio (fgColor, bgColor) {
  if (fgColor.alpha < 1) {
    fgColor = flattenColors(fgColor, bgColor);
  }

  let fgLuminance = calculateLuminance(fgColor);
  let bgLuminance = calculateLuminance(bgColor);
  let contrastRatio = (Math.max(fgLuminance, bgLuminance) + 0.05) /
    (Math.min(fgLuminance, bgLuminance) + 0.05);

  return contrastRatio;
};

/**
 * Combine the two given color according to alpha blending.
 *
 * @param {Color} fgColor - the foreground color.
 * @param {Color} bgColor - the background color.
 * @return {Color}
 */
export function flattenColors (fgColor, bgColor) {
  let alpha = fgColor.alpha;
  let r = ((1 - alpha) * bgColor.red) + (alpha * fgColor.red);
  let g = ((1 - alpha) * bgColor.green) + (alpha * fgColor.green);
  let b = ((1 - alpha) * bgColor.blue) + (alpha * fgColor.blue);
  let a = fgColor.alpha + (bgColor.alpha * (1 - fgColor.alpha));

  return new Color(r, g, b, a);
};

/**
 * Creates a new Color.
 *
 * @class
 * @param {number} red
 * @param {number} green
 * @param {number} blue
 * @param {number} alpha
 */
export class Color {
  constructor (red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

/**
 * @private
 */
function calculateLuminance (color) {
  let ycc = toYCbCr(color);

  return ycc.luma;
}

/**
 * @private
 */
function toYCbCr (color) {
  let rSRGB = color.red / 255;
  let gSRGB = color.green / 255;
  let bSRGB = color.blue / 255;

  let r = rSRGB <= 0.03928 ? rSRGB / 12.92 : Math.pow(((rSRGB + 0.055) / 1.055), 2.4);
  let g = gSRGB <= 0.03928 ? gSRGB / 12.92 : Math.pow(((gSRGB + 0.055) / 1.055), 2.4);
  let b = bSRGB <= 0.03928 ? bSRGB / 12.92 : Math.pow(((bSRGB + 0.055) / 1.055), 2.4);

  return new YCbCr(multiplyMatrixVector(YCC_MATRIX, [r, g, b]));
}

/**
 * @private
 */
class YCbCr {
  constructor (coords) {
    this.luma = this.z = coords[0];
    this.Cb = this.x = coords[1];
    this.Cr = this.y = coords[2];
  }

  multiply (scalar) {
    let result = [this.luma * scalar, this.Cb * scalar, this.Cr * scalar];

    return new YCbCr(result);
  }

  add (other) {
    let result = [this.luma + other.luma, this.Cb + other.Cb, this.Cr + other.Cr];

    return new YCbCr(result);
  }

  subtract (other) {
    let result = [this.luma - other.luma, this.Cb - other.Cb, this.Cr - other.Cr];

    return new YCbCr(result);
  }
}

/**
 * @private
 */
function multiplyMatrixVector (matrix, vector) {
  let a = matrix[0][0];
  let b = matrix[0][1];
  let c = matrix[0][2];
  let d = matrix[1][0];
  let e = matrix[1][1];
  let f = matrix[1][2];
  let g = matrix[2][0];
  let h = matrix[2][1];
  let k = matrix[2][2];

  let x = vector[0];
  let y = vector[1];
  let z = vector[2];

  return [
    a * x + b * y + c * z,
    d * x + e * y + f * z,
    g * x + h * y + k * z
      ];
}

const kR = 0.2126;
const kB = 0.0722;
const YCC_MATRIX = RGBToYCbCrMatrix(kR, kB);
const INVERTED_YCC_MATRIX = invert3x3Matrix(YCC_MATRIX);

const BLACK = new Color(0, 0, 0, 1.0);
const BLACK_YCC = toYCbCr(BLACK);
const WHITE = new Color(255, 255, 255, 1.0);
const WHITE_YCC = toYCbCr(WHITE);
const RED = new Color(255, 0, 0, 1.0);
const RED_YCC = toYCbCr(RED);
const GREEN = new Color(0, 255, 0, 1.0);
const GREEN_YCC = toYCbCr(GREEN);
const BLUE = new Color(0, 0, 255, 1.0);
const BLUE_YCC = toYCbCr(BLUE);
const CYAN = new Color(0, 255, 255, 1.0);
const CYAN_YCC = toYCbCr(CYAN);
const MAGENTA = new Color(255, 0, 255, 1.0);
const MAGENTA_YCC = toYCbCr(MAGENTA);
const YELLOW = new Color(255, 255, 0, 1.0);
const YELLOW_YCC = toYCbCr(YELLOW);

const YCC_CUBE_FACES_BLACK = [{p0: BLACK_YCC, p1: RED_YCC, p2: GREEN_YCC},
                               {p0: BLACK_YCC, p1: GREEN_YCC, p2: BLUE_YCC},
                               {p0: BLACK_YCC, p1: BLUE_YCC, p2: RED_YCC}];
const YCC_CUBE_FACES_WHITE = [{p0: WHITE_YCC, p1: CYAN_YCC, p2: MAGENTA_YCC},
                               {p0: WHITE_YCC, p1: MAGENTA_YCC, p2: YELLOW_YCC},
                               {p0: WHITE_YCC, p1: YELLOW_YCC, p2: CYAN_YCC}];

/**
 * @private
 */
function RGBToYCbCrMatrix (kR, kB) {
  return [
      [
          kR,
          (1 - kR - kB),
          kB
      ],
      [
          -kR / (2 - 2 * kB),
          (kR + kB - 1) / (2 - 2 * kB),
          (1 - kB) / (2 - 2 * kB)
      ],
      [
          (1 - kR) / (2 - 2 * kR),
          (kR + kB - 1) / (2 - 2 * kR),
          -kB / (2 - 2 * kR)
      ]
  ];
}

/**
 * @private
 */
function invert3x3Matrix (matrix) {
  let a = matrix[0][0];
  let b = matrix[0][1];
  let c = matrix[0][2];
  let d = matrix[1][0];
  let e = matrix[1][1];
  let f = matrix[1][2];
  let g = matrix[2][0];
  let h = matrix[2][1];
  let k = matrix[2][2];

  let A = (e * k - f * h);
  let B = (f * g - d * k);
  let C = (d * h - e * g);
  let D = (c * h - b * k);
  let E = (a * k - c * g);
  let F = (g * b - a * h);
  let G = (b * f - c * e);
  let H = (c * d - a * f);
  let K = (a * e - b * d);

  let det = a * (e * k - f * h) - b * (k * d - f * g) + c * (d * h - e * g);
  let z = 1 / det;

  return scalarMultiplyMatrix([
      [A, D, G],
      [B, E, H],
      [C, F, K]
      ], z);
}

/**
 * @private
 */
function scalarMultiplyMatrix (matrix, scalar) {
  var result = [];

  for (var i = 0; i < 3; i++) {
    result[i] = scalarMultiplyVector(matrix[i], scalar);
  }

  return result;
}

/**
 * @private
 */
function scalarMultiplyVector (vector, scalar) {
  var result = [];

  for (var i = 0; i < vector.length; i++) {
    result[i] = vector[i] * scalar;
  }

  return result;
}

/**
 * @private
 */
function luminanceFromContrastRatio (luminance, contrast, higher) {
  if (higher) {
    let newLuminance = (luminance + 0.05) * contrast - 0.05;
    return newLuminance;
  }
  else {
    let newLuminance = (luminance + 0.05) / contrast - 0.05;
    return newLuminance;
  }
}

/**
 * @private
 */
function translateColor (ycc, luma) {
  let endpoint = (luma > ycc.luma) ? WHITE_YCC : BLACK_YCC;
  let cubeFaces = (endpoint == WHITE_YCC) ? YCC_CUBE_FACES_WHITE
    : YCC_CUBE_FACES_BLACK;

  let a = new YCbCr([0, ycc.Cb, ycc.Cr]);
  let b = new YCbCr([1, ycc.Cb, ycc.Cr]);

  let line = {a: a, b: b};

  let intersection = null;

  for (let i = 0; i < cubeFaces.length; i++) {
    let cubeFace = cubeFaces[i];
    intersection = findIntersection(line, cubeFace);

    if (intersection.z >= 0 && intersection.z <= 1) {
      break;
    }
  }

  if (!intersection) {
    throw "Couldn't find intersection with YCbCr color cube for Cb=" + ycc.Cb + ", Cr=" + ycc.Cr + ".";
  }

  if (intersection.x != ycc.x || intersection.y != ycc.y) {
    throw "Intersection has wrong Cb/Cr values.";
  }

  if (Math.abs(endpoint.luma - intersection.luma) < Math.abs(endpoint.luma - luma)) {
    let translatedColor = [luma, ycc.Cb, ycc.Cr];
    return fromYCbCrArray(translatedColor);
  }

  let dLuma = luma - intersection.luma;
  let scale = dLuma / (endpoint.luma - intersection.luma);
  let translatedColor = [luma,
      intersection.Cb - (intersection.Cb * scale),
      intersection.Cr - (intersection.Cr * scale)];

  return fromYCbCrArray(translatedColor);
}

/**
 * @private
 */
function findIntersection (l, p) {
  let lhs = [l.a.x - p.p0.x, l.a.y - p.p0.y, l.a.z - p.p0.z];
  let matrix = [[l.a.x - l.b.x, p.p1.x - p.p0.x, p.p2.x - p.p0.x],
      [l.a.y - l.b.y, p.p1.y - p.p0.y, p.p2.y - p.p0.y],
      [l.a.z - l.b.z, p.p1.z - p.p0.z, p.p2.z - p.p0.z]];
  let invertedMatrix = invert3x3Matrix(matrix);
  let tuv = multiplyMatrixVector(invertedMatrix, lhs);
  let t = tuv[0];

  let result = l.a.add(l.b.subtract(l.a).multiply(t));

  return result;
}

/**
 * @private
 */
function fromYCbCrArray (yccArray) {
  let rgb = multiplyMatrixVector(INVERTED_YCC_MATRIX, yccArray);

  let r = rgb[0];
  let g = rgb[1];
  let b = rgb[2];
  let rSRGB = r <= 0.00303949 ? (r * 12.92) : (Math.pow(r, (1 / 2.4)) * 1.055) - 0.055;
  let gSRGB = g <= 0.00303949 ? (g * 12.92) : (Math.pow(g, (1 / 2.4)) * 1.055) - 0.055;
  let bSRGB = b <= 0.00303949 ? (b * 12.92) : (Math.pow(b, (1 / 2.4)) * 1.055) - 0.055;

  let red = Math.min(Math.max(Math.round(rSRGB * 255), 0), 255);
  let green = Math.min(Math.max(Math.round(gSRGB * 255), 0), 255);
  let blue = Math.min(Math.max(Math.round(bSRGB * 255), 0), 255);

  return new Color(red, green, blue, 1);
}

/**
 * @private
 */
function colorToString (color) {
  if (color.alpha == 1) {
    return "#" + colorChannelToString(color.red) +
      colorChannelToString(color.green) + colorChannelToString(color.blue);
  }
  else {
    return "rgba(" + [color.red, color.green, color.blue, color.alpha].join(",") + ")";
  }
}

/**
 * @private
 */
function colorChannelToString (value) {
  value = Math.round(value);

  if (value <= 0xF) {
    return "0" + value.toString(16);
  }

  return value.toString(16);
}
