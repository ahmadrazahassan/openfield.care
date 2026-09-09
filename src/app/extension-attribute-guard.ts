// Bitdefender's browser extension (and a few others) walk the DOM and stamp
// their own attributes -- bis_skin_checked, bis_register, __processed_<uuid>__,
// data-gr-* from Grammarly -- onto every element, including the server HTML
// that React is about to hydrate. React sees attributes the client render does
// not produce and reports a hydration mismatch for the whole tree.
//
// suppressHydrationWarning only covers the element it is set on, so the flags
// on <html> and <body> in the root layout cannot help the hundreds of divs
// underneath. Instead this runs as the first thing in <body>, before any of the
// page markup is parsed, and strips those attributes back off as they appear so
// the DOM React hydrates against matches what React rendered.
//
// It disconnects shortly after load: by then hydration is done and whatever the
// extension does to the DOM is no longer our problem.
export const EXTENSION_ATTRIBUTE_GUARD = `(function(){
try{
var junk=/^(bis_skin_checked|bis_register|bis_id|bis_size|__processed_|data-gr-|data-new-gr-)/;
var strip=function(el,name){if(junk.test(name))el.removeAttribute(name)};
var clean=function(el){var a=el.attributes;for(var i=a.length-1;i>=0;i--)strip(el,a[i].name)};
var sweep=function(){var all=document.getElementsByTagName("*");for(var i=0;i<all.length;i++)clean(all[i])};
var obs=new MutationObserver(function(records){
for(var i=0;i<records.length;i++){var r=records[i];
if(r.type==="attributes"){strip(r.target,r.attributeName)}
else{for(var j=0;j<r.addedNodes.length;j++){var n=r.addedNodes[j];
if(n.nodeType!==1)continue;
clean(n)}}}});
obs.observe(document.documentElement,{attributes:true,childList:true,subtree:true});
sweep();
document.addEventListener("DOMContentLoaded",sweep);
var stop=function(){obs.disconnect()};
if(document.readyState==="complete")setTimeout(stop,2000);
else window.addEventListener("load",function(){setTimeout(stop,2000)});
setTimeout(stop,15000);
}catch(e){}
})();`;
