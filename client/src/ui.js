export function initUI(state, { draw }){
  const ui = document.getElementById('ui');
  const legend = document.getElementById('legend');
  const toggle = document.getElementById('toggleHints');
  let visible = false;
  const set = v => { visible = v; ui.classList.toggle('hidden', !v); legend.classList.toggle('hidden', !v); };
  toggle.addEventListener('click', ()=> set(!visible));
  set(false);
}

export function setHintsVisible(v){
  const ui = document.getElementById('ui');
  const legend = document.getElementById('legend');
  ui.classList.toggle('hidden', !v);
  legend.classList.toggle('hidden', !v);
}
