export function initUI(st,{draw,toGalaxy,toSystem}){
  const ui = document.getElementById('ui'),
        leg = document.getElementById('legend'),
        btn = document.getElementById('toggleHints');
  let vis = false;
  const set = v => { vis = v; ui.classList.toggle('hidden', !v); leg.classList.toggle('hidden', !v); };
  btn.addEventListener('click', ()=> set(!vis)); set(false);

  const backBtn = document.getElementById('backBtn');
  const card = document.getElementById('card'),
        enter = document.getElementById('enterBtn'),
        close = document.getElementById('closeCard');

  enter.onclick = ()=> { if(st.selected) toSystem(st.selected.id); };
  close.onclick = ()=> { card.style.display = 'none'; };

  st.showCard = sys => {
    document.getElementById('cardTitle').textContent = sys.name;
    document.getElementById('cardMeta').textContent = `Тип: ${String(sys.type).toUpperCase()} • Коорд: ${Math.round(sys.x)}, ${Math.round(sys.y)}`;
    card.style.display = 'block';
  };
  st.hideCard = ()=> { card.style.display = 'none'; };
}
