"use strict";

let {expect} = require("chai");

import * as a11yCore from "../src/index";

describe("a11yCore", () => {
  describe("color", () => {
    it("has the expected API", () => {
      expect(a11yCore.color.Color).to.exist;
      expect(a11yCore.color.calculateContrastRatio).to.exist;
      expect(a11yCore.color.flattenColors).to.exist;
      expect(a11yCore.color.parseColor).to.exist;
      expect(a11yCore.color.suggestColors).to.exist;
    });
  });
});
