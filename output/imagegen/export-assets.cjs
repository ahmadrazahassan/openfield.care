const fs=require('fs'),path=require('path'),cp=require('child_process');
const sharp=require('C:/Users/Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const {optimize}=require('./tooling/node_modules/svgo/dist/svgo-node.cjs');
const root=process.cwd();const dir='output/imagegen';
const config={
 A1:[2880,1800,'A lone person walks through a wide meadow beneath a pale, clouded sky.'],
 A2:[2880,1600,'Two oatmeal armchairs face one another in a quiet, naturally lit consultation room.'],
 A3:[2880,1600,'A person rests in an open field beneath distant hills and a pale sky.'],
 A4:[2880,1100,'A person sits at a wooden desk in an otherwise empty grassy field.'],
 A5:[1600,2000,'Soft window light falls across a quiet wall beside a small potted plant.'],
 A6:[2400,1400,'A close view of two linen armchair arms with a narrow space between them.'],
 B1:[1600,1600,'A worried figure holds their head, surrounded by small doodles of tangled thoughts.'],
 B2:[1600,1600,'Three runners in different outfits crouch at the starting line.'],
 B3:[1600,1067,'A relaxed skateboarder in green trousers glides down a gentle slope.'],
 B4:[1600,1600,'Two people sit facing each other, one speaking and one listening.'],
 B5:[1600,1600,'A small figure looks toward two puzzle pieces that almost fit together.'],
 B6:[1600,1600,'A tangled line unwinds into a clear path with a small figure walking along it.'],
 B7:[1600,1600,'An empty calendar with one green dot sits beside a small plant.'],
 B8:[1600,1600,'A small figure stands where a path ends, with a green dot just ahead.'],
 C1:[1600,1600,'A monochrome figure in a white shirt has a dense tangle of cable in place of a head.'],
 C2:[1600,1600,'The same monochrome figure has a single calm loop of cable in place of a head.'],
 J01:[1600,1000,'An empty park bench faces a quiet lawn.'],
 J02:[1600,1000,'Two hands loosely hold a white ceramic mug on an oak table.'],
 J03:[1600,1000,'Rumpled white linen rests on an unmade bed beside a window.'],
 J04:[1600,1000,'A narrow gravel path winds through grass over a low rise.'],
 J05:[1600,1000,'A plain notebook and pencil lie on an otherwise empty desk.'],
 J06:[1600,1000,'Rain beads on a window with a soft green field beyond.'],
 G1:[2880,220,'Decorative torn paper edge.']
};
const people=['a woman with short dark curls','a man with a greying beard and glasses','a woman with long straight black hair','a man with close-cropped hair','a woman with a silver bob','a person with shoulder-length auburn hair'];
people.forEach((p,i)=>config['F'+(i+1)]=[1200,1500,`AI-generated layout placeholder portrait of ${p}; replace before launch.`]);
const mkdir=p=>fs.mkdirSync(path.dirname(p),{recursive:true});
let manifest=fs.existsSync(`${dir}/asset-manifest.json`)?JSON.parse(fs.readFileSync(`${dir}/asset-manifest.json`)):[];
function put(item){manifest=manifest.filter(m=>m.path!==item.path);manifest.push(item);fs.writeFileSync(`${dir}/asset-manifest.json`,JSON.stringify(manifest,null,2));}
async function photo(input,target,w,h,alt,extra={}){
 mkdir(target);const master=await sharp(input).resize(w,h,{fit:'cover'}).removeAlpha().png().toBuffer();
 const encode=()=>target.includes('/team/')?sharp(master).withExif({IFD0:{ImageDescription:'PLACEHOLDER - AI-generated fictional person. Replace before launch.',Artist:'AI-generated layout placeholder'}}):sharp(master);
 await encode().jpeg({quality:82,mozjpeg:true}).toFile(target);
 await encode().webp({quality:82}).toFile(target.replace('.jpg','.webp'));
 let q=52,encoded;do{encoded=await encode().avif({quality:q,effort:5}).toBuffer();q-=5;}while(target.includes('/hero/')&&encoded.length>220000&&q>=22);
 fs.writeFileSync(target.replace('.jpg','.avif'),encoded);
 const blur=await sharp(master).resize(16).jpeg({quality:35}).toBuffer();
 put({path:target.replace(/^public/,''),width:w,height:h,alt,placeholder:target.includes('/team/'),blurDataURL:'data:image/jpeg;base64,'+blur.toString('base64'),avifBytes:encoded.length,...extra});
}
async function illustration(j,w,h,alt){
 const raw=await sharp(j.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 const palette=['131316','F1F1F1','E8E2D6','00D54B','C8563C','9A9AA0','BBC8D2'].map(s=>[parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]);
 let greens=0,opaque=0;
 for(let i=0;i<raw.data.length;i+=4){
  if(raw.data[i+3]<200){raw.data[i+3]=0;continue;}
  raw.data[i+3]=255;opaque++;
  let best=0,dist=Infinity;for(let n=0;n<palette.length;n++){let d=0;for(let k=0;k<3;k++)d+=(raw.data[i+k]-palette[n][k])**2;if(d<dist){dist=d;best=n;}}
  for(let k=0;k<3;k++)raw.data[i+k]=palette[best][k];if(best===3)greens++;
 }
 const temp=`${dir}/${j.id}-palette.png`;mkdir(j.path);
 await sharp(raw.data,{raw:raw.info}).png().toFile(temp);
 cp.execFileSync('C:/Users/Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',[`${dir}/vectorize.py`,temp,j.path],{stdio:'pipe'});
 let svg=fs.readFileSync(j.path,'utf8');
 svg=svg.replace('<svg ','<svg viewBox="0 0 '+raw.info.width+' '+raw.info.height+'" ');
 // Leave generous margins and keep the saturated accent below 8% of canvas.
 const fraction=greens/(raw.info.width*raw.info.height),scale=fraction>.08?Math.sqrt(.078/fraction):1;
 if(scale<1)svg=svg.replace(/(<svg[^>]*>)/,`$1<g transform="translate(${raw.info.width*(1-scale)/2} ${raw.info.height*(1-scale)/2}) scale(${scale})">`).replace('</svg>','</g></svg>');
 // Keep distinct paths so individual doodles remain editable.
 svg=optimize(svg,{plugins:[{name:'preset-default',params:{overrides:{mergePaths:false}}}]}).data;
 fs.writeFileSync(j.path,svg);
 const png=j.path.replace('.svg','.png');await sharp(Buffer.from(svg),{density:96}).resize(w,h).png().toFile(png);
 put({path:j.path.replace(/^public/,''),width:w,height:h,alt,placeholder:false,greenCoverage:Math.min(fraction,.078),source:j.source,format:'true vector paths plus PNG'});
}
(async()=>{
 const sources=JSON.parse(fs.readFileSync(`${dir}/sources.json`));
 for(const j of sources){
  if(manifest.some(m=>m.path===j.path.replace(/^public/,''))&&!process.argv.includes('--force'))continue;
  const [w,h,alt]=config[j.id];mkdir(`${dir}/originals/${j.id}.png`);fs.copyFileSync(j.source,`${dir}/originals/${j.id}.png`);
  if(j.id.startsWith('B'))await illustration(j,w,h,alt);
  else if(j.id==='G1'){
   mkdir(j.path);const raw=await sharp(j.source).ensureAlpha().raw().toBuffer({resolveWithObject:true});
   const edges=[];for(let x=0;x<raw.info.width;x++){let edge=-1;for(let y=0;y<raw.info.height;y++){const i=(y*raw.info.width+x)*4;if(edge<0&&raw.data[i+3]>230)edge=y;if(edge>=0)raw.data[i+3]=255;raw.data[i]=raw.data[i+1]=raw.data[i+2]=255;}if(edge>=0)edges.push(edge);}
   const top=Math.max(0,Math.min(...edges)-30),bottom=Math.min(raw.info.height,Math.max(...edges)+180);
   const strip=await sharp(raw.data,{raw:raw.info}).extract({left:0,top,width:raw.info.width,height:bottom-top}).resize(1440,220,{fit:'fill'}).png().toBuffer();
   const reverse=await sharp(strip).flop().toBuffer();
   await sharp({create:{width:2880,height:220,channels:4,background:'#00000000'}}).composite([{input:strip,left:0,top:0},{input:reverse,left:1440,top:0}]).png().toFile(j.path);
   put({path:j.path.replace(/^public/,''),width:w,height:h,alt,placeholder:false});
  }else await photo(j.source,j.path,w,h,alt,{source:j.source});
  if(j.id==='A1'){
   const m=await sharp(j.source).metadata(),cw=Math.round(m.height*.75),left=Math.min(m.width-cw,Math.round(m.width*.8-cw*.76));
   const mobile=await sharp(j.source).extract({left,top:0,width:cw,height:m.height}).toBuffer();
   await photo(mobile,'public/images/hero/hero-open-field-mobile.jpg',1200,1600,alt);
  }
  console.log('Exported',j.id);
 }
 await sharp('public/brand/og-default.svg').jpeg({quality:85,mozjpeg:true}).toFile('public/brand/og-default.jpg');
 const alt=Object.fromEntries(manifest.map(m=>[m.path,m.alt]));
 mkdir('content/alt-text.ts');fs.writeFileSync('content/alt-text.ts','export const altText = '+JSON.stringify(alt,null,2)+' as const;\n');
 fs.writeFileSync('content/image-metadata.ts','export const imageMetadata = '+JSON.stringify(Object.fromEntries(manifest.map(m=>[m.path,m])),null,2)+' as const;\n');
 console.log('Manifest contains',manifest.length,'images.');
})();
