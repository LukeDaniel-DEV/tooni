export function localPoint(s,p){const dx=p.x-s.cx,dy=p.y-s.cy,c=Math.cos(s.angle),n=Math.sin(s.angle);return{x:dx*c+dy*n,y:-dx*n+dy*c}}
export function worldPoint(s,p){const c=Math.cos(s.angle),n=Math.sin(s.angle);return{x:s.cx+p.x*c-p.y*n,y:s.cy+p.x*n+p.y*c}}
export function resizeFrom(s,handle,p){const anchor=worldPoint(s,{x:-handle.x*s.w/2,y:-handle.y*s.h/2}),c=Math.cos(s.angle),n=Math.sin(s.angle),dx=p.x-anchor.x,dy=p.y-anchor.y;let w=s.w,h=s.h;if(handle.x)w=Math.max(4,handle.x*(dx*c+dy*n));if(handle.y)h=Math.max(4,handle.y*(-dx*n+dy*c));const center=worldPoint({...s,cx:anchor.x,cy:anchor.y},{x:handle.x*w/2,y:handle.y*h/2});return{...s,w,h,cx:center.x,cy:center.y}}
export const handles=[{x:-1,y:-1},{x:0,y:-1},{x:1,y:-1},{x:1,y:0},{x:1,y:1},{x:0,y:1},{x:-1,y:1},{x:-1,y:0}];
