/**
 * Just a test function to show that addon-test-support coverage is counted
 */
export function uncoveredFunction(condition) {
  if (condition) {
    return 'Was true';
  } else {
    return 'Was false';
  }
}

export function anotherUncoveredFunction() {
  return 'Not covered';
}
