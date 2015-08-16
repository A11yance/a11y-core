"use strict";

let should = require("should");

import core, {bar, zoo} from '../src/index';

describe("Test core", () => {
  it("should return foo", () => {
    core().should.equal("foo");
  });
});

describe("Test bar", function () {
  it("should return bar", () => {
    bar().should.equal("bar");
  });
});

describe("Test zoo", function () {
  it("should return bar", () => {
    zoo().should.equal("bar");
  });
});
