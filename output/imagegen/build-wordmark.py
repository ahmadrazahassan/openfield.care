from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.varLib.instancer import instantiateVariableFont
ROOT=Path(__file__).parent
OUT=Path('public/brand'); OUT.mkdir(parents=True,exist_ok=True)
def font(name,weight=None):
    f=TTFont(ROOT/'fonts'/name)
    if weight and 'fvar' in f: f=instantiateVariableFont(f,{'wght':weight},inplace=False)
    return f
def outline(f,text,size,x=0,y=0,tracking=0):
    gs=f.getGlyphSet(); cm=f.getBestCmap(); scale=size/f['head'].unitsPerEm
    pen=SVGPathPen(gs)
    for char in text:
        gn=cm[ord(char)]; g=gs[gn]
        g.draw(TransformPen(pen,(scale,0,0,-scale,x,y)))
        x+=g.width*scale+tracking*size
    return pen.getCommands(),x
semi=font('MontserratAlternates-SemiBold.ttf')
word,x=outline(semi,'openfield',100,tracking=-.02)
dot,_=outline(semi,'.',100,x)
for suffix,color in [('', '#131316'),('-light','#F1F1F1')]:
    (OUT/f'openfield-wordmark{suffix}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -82 {x+26:.2f} 105"><path fill="{color}" d="{word}"/><path fill="#00D54B" d="{dot}"/></svg>')
cap=semi['OS/2'].sCapHeight/semi['head'].unitsPerEm
w,x=outline(semi,'openfield',72/cap,80,152,tracking=-.02)
d,_=outline(semi,'.',72/cap,x,152)
h,_=outline(font('DMSans.ttf',500),'Room to think.',84,80,390,tracking=-.03)
m,_=outline(font('MontserratAlternates-Medium.ttf'),'LICENSED THERAPY · BOOK IN MINUTES',20,80,535,tracking=.14)
svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><path fill="#F1F1F1" d="M0 0h1200v630H0z"/><path fill="#131316" d="{w}"/><path fill="#00D54B" d="{d}"/><path fill="#131316" d="{h}"/><path stroke="#131316" stroke-opacity=".12" d="M80 470h1040"/><path fill="#131316" fill-opacity=".55" d="{m}"/><circle cx="1064" cy="512" r="8" fill="#00D54B"/></svg>'
(OUT/'og-default.svg').write_text(svg)
print('Outlined Montserrat Alternates wordmarks and OG composition.')
