const fs=require('fs');
const sharp=require('C:/Users/Ahmed/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const palette=['131316','f1f1f1','e8e2d6','00d54b','c8563c','9a9aa0','bbc8d2'];
const rgb=s=>{if(s.length===3)s=s.split('').map(c=>c+c).join('');return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16))};
const values=palette.map(rgb);
(async()=>{
for(const name of fs.readdirSync('public/images/illustration').filter(f=>f.endsWith('.svg'))){
 const file='public/images/illustration/'+name;
 let svg=fs.readFileSync(file,'utf8');
 svg=svg.replace(/fill="#([0-9a-f]+)"/gi,(match,hex)=>{const color=rgb(hex);let best=0,dist=Infinity;values.forEach((p,i)=>{const d=p.reduce((v,c,k)=>v+(c-color[k])**2,0);if(d<dist){best=i;dist=d}});return `fill="#${palette[best]}"`});
 fs.writeFileSync(file,svg);
 await sharp(Buffer.from(svg)).resize(1600,name.includes('diagonal')?1067:1600).png().toFile(file.replace('.svg','.png'));
}
console.log('Snapped all SVG fills to the exact palette and refreshed PNGs.');
})();
