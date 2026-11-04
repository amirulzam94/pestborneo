if (window.Lenis) {
  new Lenis({
    autoRaf: true,
    respectReducedMotion: true,
    prevent: element => element.tagName === 'DIALOG'
  });
}
