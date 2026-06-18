export function greet(name) {
  if (name) {
    return `Hello, ${name}!`;
  }
  return 'Hello, World!';
}

export function isActive(value) {
  if (value > 0) {
    return true;
  }
  return false;
}
