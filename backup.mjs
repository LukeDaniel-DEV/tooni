// Portable .tooni files contain a versioned JSON manifest and embedded PNG blobs.
const MAGIC=new TextEncoder().encode('TOONI001'),LIMIT=512*1024*1024;
const png=[137,80,78,71,13,10,26,10];
export async function packProject(data){
  const assets=[],indices=new Map();
  function asset(value){if(indices.has(value))return indices.get(value);let blob=value;if(typeof value==='string'&&/^data:image\/png;base64,/i.test(value)){const bytes=Uint8Array.from(atob(value.slice(value.indexOf(',')+1)),c=>c.charCodeAt(0));blob=new Blob([bytes],{type:'image/png'})}if(!(blob instanceof Blob))throw Error('Could not encode project image.');indices.set(value,assets.length);assets.push(blob);return indices.get(value)}
  const manifest={format:'tooni',version:1,width:960,height:540,name:data.name,fps:data.fps,index:data.index,frames:data.frames.map(f=>({active:f.active,layers:f.layers.map(l=>({id:l.id,name:l.name,visible:l.visible,opacity:l.opacity,pixels:asset(l.pixels),reference:l.reference?{id:l.reference.id,cx:l.reference.cx,cy:l.reference.cy,w:l.reference.w,h:l.reference.h,source:asset(l.reference.source)}:undefined}))})),assets:assets.map(b=>b.size)};
  const json=new TextEncoder().encode(JSON.stringify(manifest)),header=new Uint8Array(12);header.set(MAGIC);new DataView(header.buffer).setUint32(8,json.length,true);const file=new Blob([header,json,...assets],{type:'application/octet-stream'});if(file.size>LIMIT)throw Error('Project backup exceeds the 512 MB file limit.');return file;
}
export async function unpackProject(file){
  const fail=()=>{throw Error('This is not a valid or supported .tooni project file.')};
  if(file.size<12||file.size>LIMIT)fail();const header=new Uint8Array(await file.slice(0,12).arrayBuffer());if(!MAGIC.every((v,i)=>v===header[i]))fail();const length=new DataView(header.buffer).getUint32(8,true);if(length<2||length>16*1024*1024||12+length>file.size)fail();let m;try{m=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(await file.slice(12,12+length).arrayBuffer()))}catch{fail()}
  if(m.format!=='tooni'||m.version!==1||m.width!==960||m.height!==540||!Array.isArray(m.frames)||!m.frames.length||m.frames.length>10000||!Array.isArray(m.assets)||m.assets.length>20000||!Number.isFinite(m.fps)||m.fps<1||m.fps>60)fail();
  const assets=[];let offset=12+length;
  for(const size of m.assets){if(!Number.isSafeInteger(size)||size<24||offset+size>file.size)fail();const blob=new Blob([file.slice(offset,offset+size)],{type:'image/png'}),head=new Uint8Array(await blob.slice(0,24).arrayBuffer()),view=new DataView(head.buffer);if(!png.every((v,i)=>head[i]===v)||view.getUint32(16)<1||view.getUint32(20)<1||view.getUint32(16)>960||view.getUint32(20)>540)fail();assets.push(blob);offset+=size}if(offset!==file.size)fail();
  function asset(i){if(!Number.isInteger(i)||i<0||i>=assets.length)fail();return assets[i]}
  let layers=0;const frames=m.frames.map(f=>{if(!Array.isArray(f.layers)||!f.layers.length||(layers+=f.layers.length)>20000||!Number.isInteger(f.active)||f.active<0||f.active>=f.layers.length)fail();return{active:f.active,layers:f.layers.map(l=>{if(typeof l.name!=='string'||typeof l.visible!=='boolean'||!Number.isFinite(l.opacity)||l.opacity<0||l.opacity>1)fail();let reference;if(l.reference){const r=l.reference;if(typeof r.id!=='string'||!r.id||!['cx','cy','w','h'].every(k=>Number.isFinite(r[k])&&Math.abs(r[k])<1000000)||r.w<=0||r.h<=0)fail();reference={id:r.id,cx:r.cx,cy:r.cy,w:r.w,h:r.h,source:asset(r.source)}}return{id:typeof l.id==='string'?l.id:crypto.randomUUID(),name:l.name.slice(0,300),visible:l.visible,opacity:l.opacity,pixels:asset(l.pixels),reference}})}});
  return{version:3,name:typeof m.name==='string'?m.name.slice(0,80):'Imported animation',fps:m.fps,index:Number.isInteger(m.index)?Math.max(0,Math.min(frames.length-1,m.index)):0,frames};
}

