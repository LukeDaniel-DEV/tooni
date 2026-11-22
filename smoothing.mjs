// Midpoint curves soften hand jitter while keeping the stroke's exact endpoints.
export class SmoothStroke {
  constructor(context, point) { this.context=context; this.filtered={...point}; this.tip={...point}; this.raw={...point}; }
  add(point) {
    if(point.x===this.raw.x&&point.y===this.raw.y)return;
    const previous=this.filtered;
    const next={x:previous.x+(point.x-previous.x)*.72,y:previous.y+(point.y-previous.y)*.72};
    const midpoint={x:(previous.x+next.x)/2,y:(previous.y+next.y)/2};
    const c=this.context;c.beginPath();c.moveTo(this.tip.x,this.tip.y);
    c.quadraticCurveTo(previous.x,previous.y,midpoint.x,midpoint.y);c.stroke();
    this.filtered=next;this.tip=midpoint;this.raw={...point};
  }
  finish(point=this.raw) {
    this.add(point);
    const c=this.context;c.beginPath();c.moveTo(this.tip.x,this.tip.y);
    c.quadraticCurveTo(this.filtered.x,this.filtered.y,point.x,point.y);c.stroke();
  }
}
