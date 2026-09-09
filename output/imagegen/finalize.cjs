const fs=require('fs'),path=require('path'),assert=require('assert');
const sharp=require('C:/Users/Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const dir='output/imagegen';
const manifest=JSON.parse(fs.readFileSync(`${dir}/asset-manifest.json`));
const save=m=>{const i=manifest.findIndex(x=>x.path===m.path);if(i>=0)manifest[i]=m;else manifest.push(m)};
(async()=>{
 const faces=[[.60,.223],[.60,.215],[.61,.207],[.607,.178],[.64,.195]];
 for(let i=1;i<=5;i++){
  const source=`public/images/team/therapist-0${i}.jpg`,target=`public/images/team/avatar-0${i}.jpg`;
  if(!fs.existsSync(source))continue;
  const meta=await sharp(source).metadata(),side=Math.round(meta.width*.50);
  const left=Math.round(meta.width*faces[i-1][0]-side*.5),top=Math.max(0,Math.round(meta.height*faces[i-1][1]-side*.4));
  const crop=await sharp(source).extract({left,top,width:side,height:side}).resize(256,256).png().toBuffer();
  const encode=()=>sharp(crop).withExif({IFD0:{ImageDescription:'PLACEHOLDER - AI-generated fictional person. Replace before launch.'}});
  await encode().jpeg({quality:85,mozjpeg:true}).toFile(target);
  await encode().webp({quality:85}).toFile(target.replace('.jpg','.webp'));
  await encode().avif({quality:55}).toFile(target.replace('.jpg','.avif'));
  const blur=await sharp(crop).resize(16).jpeg({quality:35}).toBuffer();
  save({path:target.replace('public',''),width:256,height:256,alt:`AI-generated layout placeholder avatar ${i}; replace before launch.`,placeholder:true,source:source.replace('public',''),blurDataURL:'data:image/jpeg;base64,'+blur.toString('base64')});
 }
 save({path:'/images/texture/texture-halftone-dots.png',width:1024,height:1024,alt:'Decorative halftone dots.',placeholder:false});
 const alt=Object.fromEntries(manifest.map(m=>[m.path,m.alt]));
 for(const f of fs.readdirSync('public/icons').filter(f=>f.endsWith('.svg')))alt['/icons/'+f]=f.replace('.svg','').replaceAll('-',' ')+' icon';
 for(const f of fs.readdirSync('public/brand').filter(f=>/\.(svg|png|jpg)$/.test(f)))alt['/brand/'+f]=f.startsWith('og-')?'Openfield — Room to think.':f.includes('wordmark')?'Openfield.':'Openfield symbol: a knot unwinding into a straight line.';
 fs.writeFileSync(`${dir}/asset-manifest.json`,JSON.stringify(manifest,null,2));
 fs.writeFileSync('content/alt-text.ts','export const altText = '+JSON.stringify(alt,null,2)+' as const;\n');
 fs.writeFileSync('content/image-metadata.ts','export const imageMetadata = '+JSON.stringify(Object.fromEntries(manifest.map(m=>[m.path,m])),null,2)+' as const;\n');
 const problems=[],checks=[];
 const expected=JSON.parse(fs.readFileSync(`${dir}/prompts.json`)).map(j=>j.path).concat('public/images/hero/hero-open-field-mobile.jpg','public/images/texture/texture-halftone-dots.png');
 for(let i=1;i<=5;i++)expected.push(`public/images/team/avatar-0${i}.jpg`);
 const brands=['openfield-wordmark.svg','openfield-wordmark-light.svg','openfield-mark.svg','openfield-mark-light.svg','favicon.svg','favicon-32.png','apple-touch-icon-180.png','icon-512.png','og-default.jpg'];
 expected.push(...brands.map(f=>'public/brand/'+f));
 const iconNames=['anxiety','low-mood','burnout','relationships','grief','sleep','trauma','focus','self-esteem','stress','couples','teens','session-video','session-in-person','session-phone','calendar','clock','privacy','notes','growth','breathing','matching','assessment','follow-up'];
 expected.push(...iconNames.map(f=>'public/icons/'+f+'.svg'));
 for(const f of expected)if(!fs.existsSync(f))problems.push('Missing '+f);
 for(const m of manifest){
  const f='public'+m.path;if(!fs.existsSync(f))continue;
  const meta=await sharp(f).metadata();
  if(!f.endsWith('.svg')&&(meta.width!==m.width||meta.height!==m.height))problems.push('Wrong dimensions '+f);
  if(f.endsWith('.jpg'))for(const ext of ['webp','avif']){const other=f.replace('.jpg','.'+ext);if(!fs.existsSync(other))problems.push('Missing '+other);else{const mm=await sharp(other).metadata();if(mm.width!==m.width||mm.height!==m.height)problems.push('Wrong dimensions '+other);}}
  if(f.includes('/hero/')&&fs.statSync(f.replace('.jpg','.avif')).size>=220000)problems.push('Hero AVIF exceeds 220 KB '+f);
  if(f.includes('/team/')&&(!m.placeholder||!meta.exif))problems.push('Missing placeholder marker '+f);
  if(f.endsWith('.svg')){
   const text=fs.readFileSync(f,'utf8');if(/gradient|<image/.test(text))problems.push('Raster or gradient in SVG '+f);
   const allowed=new Set(['#131316','#f1f1f1','#e8e2d6','#00d54b','#c8563c','#9a9aa0','#bbc8d2']);
   const colors=[...text.matchAll(/fill="(#[0-9a-f]+)"/ig)].map(m=>m[1].toLowerCase());
   if(colors.some(c=>!allowed.has(c)))problems.push('Unexpected palette '+f+' '+[...new Set(colors)].join(','));
   const png=f.replace('.svg','.png'),data=await sharp(png).ensureAlpha().raw().toBuffer();let greens=0;
   for(let k=0;k<data.length;k+=4)if(data[k]<20&&data[k+1]>180&&data[k+2]<110&&data[k+3]>220)greens++;
   const coverage=greens/(data.length/4);if(coverage>.081)problems.push('Green coverage > 8% '+f);
   checks.push({path:m.path,greenCoverage:coverage,transparent:meta.hasAlpha});
  }
 }
 for(const name of iconNames){const f=`public/icons/${name}.svg`;if(!fs.existsSync(f))continue;const text=fs.readFileSync(f,'utf8');for(const required of ['viewBox="0 0 24 24"','stroke="currentColor"','fill="none"','stroke-width="1.5"'])if(!text.includes(required))problems.push('Icon spec '+name+' '+required);}
 const report={requiredAssets:expected.length,presentAssets:expected.filter(f=>fs.existsSync(f)).length,photographicAssets:manifest.filter(m=>m.path.endsWith('.jpg')).length,illustrations:manifest.filter(m=>m.path.endsWith('.svg')).length,problems,illustrationChecks:checks};
 fs.writeFileSync(`${dir}/validation.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(problems.length)process.exitCode=1;
})();
