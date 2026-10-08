import { findGlyphAttachment } from "./navigationLetterAttachment";
function ink(rows) {
 const width=rows[0].length,height=rows.length,data=new Uint8ClampedArray(width*height*4);
 rows.forEach((row,y)=>Array.from(row).forEach((pixel,x)=>{if(pixel==='#') data[(y*width+x)*4+3]=255;}));
 return {data,width,height};
}
test('left cord ties to actual curved glyph ink instead of the span edge',()=>{
 const image=ink(['        ','   ###  ','  #   # ','     #  ','   ##   ','     #  ','  #   # ','   ###  ']);
 const p=findGlyphAttachment(image,'left');
 expect(p.x).toBeGreaterThan(0);
 expect(p.x).toBeLessThan(image.width/2);
 expect(image.data[(Math.floor(p.y)*image.width+Math.floor(p.x))*4+3]).toBe(255);
});
test('right fitting touches the letter shoulder and ignores trailing whitespace',()=>{
 const image=ink(['          ','  #####   ','  #    #  ','  #       ','  #       ']);
 const p=findGlyphAttachment(image,'right');
 expect(p.x).toBeLessThan(image.width-2);
 expect(image.data[(Math.floor(p.y)*image.width+Math.floor(p.x))*4+3]).toBe(255);
});
test('the chosen fitting uses the attached side of the same letter stroke',()=>{
 const image=ink(['         ','  #####  ',' #     # ',' #     # ','  #####  ']);
 expect(findGlyphAttachment(image,'left').x).toBeLessThan(findGlyphAttachment(image,'right').x);
});
test('unavailable glyph ink has a safe geometry fallback',()=>{
 expect(findGlyphAttachment(ink(['     ','     ']),'left')).toBeNull();
});
