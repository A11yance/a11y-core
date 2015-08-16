"use strict";

let should = require("should");
let {assert, expect} = require("chai");

import core, {bar, zoo} from '../src/index';

describe("Test core", () => {
  it("should return foo", () => {
    expect(true).to.equal(true);
    assert(3, 3, 'Three is 3');
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
