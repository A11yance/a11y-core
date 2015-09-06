"use strict";

let {expect} = require("chai");

import * as a11yCore from "../src/a11yCore";

describe("parseColor", () => {
  describe("with a transparent value", () => {
    it("returns a Color object with zeros for values", () => {
      let transparentColor = a11yCore.color.parseColor("transparent");

      expect(transparentColor).to.deep.equal({
        red: 0,
        blue: 0,
        green: 0,
        alpha: 0
      });
    });
  });

  describe("with an rgb value", () => {
    it("returns a Color object with matching values and alpha of 1", () => {
      let rgbColor = a11yCore.color.parseColor("rgb(255, 255, 255)");

      expect(rgbColor).to.deep.equal({
        red: 255,
        blue: 255,
        green: 255,
        alpha: 1
      });
    });
  });

  describe("with an rgba value", () => {
    it("returns a Color object with matching values and alpha", () => {
      let rgbaColor = a11yCore.color.parseColor("rgba(255, 255, 255, 0.5)");

      expect(rgbaColor).to.deep.equal({
        red: 255,
        blue: 255,
        green: 255,
        alpha: 0.5
      });
    });
  });
});

describe("suggestColors", () => {
  describe("with white foreground color on white background color", () => {
    it("returns a gray value", () => {
      let white = a11yCore.color.parseColor("rgba(255, 255, 255, 1)");
      let foregroundColor = white;
      let backgroundColor = white;
      let desiredContrastRatios = {
        AA: 4.5,
        AAA: 7.0
      };

      let suggestions = a11yCore.color.suggestColors(foregroundColor, backgroundColor, desiredContrastRatios);

      expect(suggestions).to.deep.equal({
        AA: {
          bg: "#ffffff",
          contrast: "4.54",
          fg: "#767676"
        },
        AAA: {
          bg: "#ffffff",
          contrast: "7.00",
          fg: "#595959"
        }
      });
    });
  });
});

describe("calculateContrastRatio", () => {
  describe("with a white background", () => {
    describe("with a black foreground", () => {
      it("returns 21", () => {
        let backgroundColor = a11yCore.color.parseColor("rgb(255, 255, 255)");
        let foregroundColor = a11yCore.color.parseColor("rgb(0, 0, 0)");

        let contrastRatio = a11yCore.color.calculateContrastRatio(foregroundColor, backgroundColor);

        expect(contrastRatio).to.equal(21);
      });
    });
  });

  describe("with a white background", () => {
    describe("with a white foreground", () => {
      it("returns 1", () => {
        let backgroundColor = a11yCore.color.parseColor("rgb(255, 255, 255)");
        let foregroundColor = a11yCore.color.parseColor("rgb(255, 255, 255)");

        let contrastRatio = a11yCore.color.calculateContrastRatio(foregroundColor, backgroundColor);

        expect(contrastRatio).to.equal(1);
      });
    });
  });
});

describe("Color", () => {
  it("sets values for red, green, blue, and alpha", () => {
    let color = new a11yCore.color.Color(255, 255, 255, 1);

    expect(color).to.deep.equal({
      red: 255,
      blue: 255,
      green: 255,
      alpha: 1
    });
  });
});
