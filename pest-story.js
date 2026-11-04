(() => {
  const section = document.getElementById('pest-problems');
  const stage = section.querySelector('.pest-story-stage');
  const layer = stage.querySelector('.pest-story-creatures');
  const lines = [...stage.querySelectorAll('.story-line')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = value => Math.max(0, Math.min(1, value));

  // Positions are fractions of the stage. Portrait crops use two arcs with more
  // space above and below the question than to either side of it.
  const specimens = [
    // Species, scale, desktop x/y, portrait x/y, entry delay
    ['termite', .83, .16, .23, .15, .24, .04],
    ['ant', .34, .32, .20, .38, .23, .15],
    ['ant', .28, .38, .16, .46, .18, .20],
    ['ant', .23, .43, .17, .53, .16, .24],
    ['fly', .60, .58, .21, .68, .24, .10],
    ['rat', 1.10, .87, .31, .90, .34, .02],
    ['bedbug', .53, .93, .57, .98, .63, .17],
    ['silverfish', .88, .82, .79, .81, .79, .06],
    ['mosquito', .81, .61, .84, .53, .86, .08],
    ['termite', .46, .42, .81, .35, .76, .16],
    ['termite', .33, .36, .87, .25, .85, .23],
    ['roach', .97, .15, .73, .13, .67, .03],
    ['bedbug', .34, .06, .47, .03, .36, .21]
  ];
  const pests = specimens.map(([species, scale]) => {
    const pest = document.createElement('span');
    pest.className = 'story-pest story-' + species;
    pest.style.setProperty('--scale', scale);
    layer.append(pest);
    return pest;
  });

  let paths = [];
  let frame = 0;
  function measure() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    const portrait = width < height;
    const copyWidth = stage.querySelector('.pest-story-copy').offsetWidth;
    const copyHeight = stage.querySelector('.pest-story-copy').offsetHeight;
    paths = specimens.map(([, , dx, dy, px, py, delay], index) => {
      const size = pests[index].offsetWidth;
      let x = ((portrait ? px : dx) - .5) * width;
      let y = ((portrait ? py : dy) - .5) * height;
      // Keep the entire rotated sprite outside a padded rectangle around the type.
      const clearance = size * Math.SQRT1_2 + 12;
      const push = Math.max(1, Math.min((copyWidth / 2 + clearance) / Math.abs(x),
        (copyHeight / 2 + clearance) / Math.abs(y)));
      x *= push;
      y *= push;
      const start = Math.max(1, Math.min((width / 2 + size) / Math.abs(x),
        (height / 2 + size) / Math.abs(y)));
      const angle = Math.atan2(-x, y) * 180 / Math.PI;
      return {x, y, angle, start, delay};
    });
    draw();
  }

  function draw() {
    frame = 0;
    const progress = reduced.matches ? 1 : clamp(-section.getBoundingClientRect().top /
      Math.max(1, section.offsetHeight - stage.offsetHeight));
    paths.forEach(({x, y, angle, start, delay}, index) => {
      const t = clamp((progress - delay) / .62);
      const ease = t * t * (3 - 2 * t);
      const distance = start + (1 - start) * ease;
      pests[index].style.transform = `translate(-50%, -50%) translate3d(${x * distance}px, ${y * distance}px, 0) rotate(${angle}deg)`;
    });
    lines.forEach((line, index) => {
      const amount = clamp((progress - .10) / .74 * lines.length - index);
      line.style.setProperty('--reveal', amount * 100 + '%');
      line.classList.toggle('is-revealed', amount === 1);
    });
  }
  addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(draw);
  }, {passive: true});
  new ResizeObserver(measure).observe(stage);
  document.fonts.ready.then(measure);
  reduced.addEventListener('change', measure);
  measure();
})();
