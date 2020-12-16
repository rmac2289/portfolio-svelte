export function fadeScale() {
  return {
    css: (t) => {
      return `opacity: ${t}; transform: scale(${t})`;
    },
  };
}
