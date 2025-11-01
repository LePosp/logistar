export function initUI(state,{draw}){
  const ui=document.getElementById('ui'), leg=document.getElementById('legend'), btn=document.getElementById('toggleHints');
  let vis=false; const set=v=>{vis=v; ui.classList.toggle('hidden',!v); leg.classList.toggle('hidden',!v);};
  btn.addEventListener('click',()=>set(!vis)); set(false);
}
