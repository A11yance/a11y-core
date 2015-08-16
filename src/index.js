"use strict";

/**
 * Get a foo.
 *
 * @return {string}
 */
export default function () {
  return "foo";
};

/**
 * Get a bar.
 *
 * @return {string}
 */
export function bar () {
  return "bar";
}

export {bar as zoo};
