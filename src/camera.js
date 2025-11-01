import * as cfg from './config.js';

export function makeTransform(x=0, y=0, scale=0.28){ return { x, y, scale }; }

export function worldToScreen(state, x,y){ return { x:(x+state.transform.x)*state.transform.scale, y:(y+state.transform.y)*state.transform.scale }; }
export function screenToWorld(state, x,y){ return { x:x/state.transform.scale - state.transform.x, y:y/state.transform.scale - state.transform.y }; }

export function centerView(state, canvas){
  const cx = canvas.width/2, cy = canvas.height/2;
  state.transform.x = (cx/state.transform.scale);
  state.transform.y = (cy/state.transform.scale);
}

export function clampTransform(state, canvas){
  const pad = cfg.CAMERA_PAD;
  const viewW = canvas.width  / state.transform.scale;
  const viewH = canvas.height / state.transform.scale;
  const minTx = -(state.worldBounds.maxX + pad - viewW);
  const maxTx = -state.worldBounds.minX + pad;
  const minTy = -(state.worldBounds.maxY + pad - viewH);
  const maxTy = -state.worldBounds.minY + pad;
  state.transform.x = Math.min(maxTx, Math.max(minTx, state.transform.x));
  state.transform.y = Math.min(maxTy, Math.max(minTy, state.transform.y));
}
