import*as J from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var Fe=window.gsap;var qt=()=>{throw new Error("[Retell] exports are not included")},xt=qt,St=qt;import*as Z from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var $t=1.7,Je=1.2,Xt=1.667,Yt={1:{streaks:3.2,fine:.7,smear:.2,rim:.75,back:.75,pole:1.2,halo:.3,exposure:.7,grain:.15,loop:5.76,seed:3.7},2:{streaks:1,fine:1.14,smear:0,rim:.41,back:.75,pole:0,halo:.3,exposure:.65,grain:.4,loop:20,seed:81.4}},Kt={idle:{spin:1,breathe:0,exp:0,pole:0,halo:0,flow:0,wave:0,react:.25},listening:{spin:1.6,breathe:.04,exp:.1,pole:.2,halo:.2,flow:.22,wave:.22,react:.7},speaking:{spin:1.3,breathe:0,exp:.06,pole:.12,halo:.15,flow:.12,wave:.1,react:1},thinking:{spin:2.4,breathe:.03,exp:.04,pole:.3,halo:.12,flow:.5,wave:.04,react:0}},Et=i=>{let e=parseInt(i.replace("#",""),16);return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]},Zt=`
uniform float uRadius;
out vec2 vP;
void main() {
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vP = position.xy * ${$t.toFixed(3)};
  gl_Position = projectionMatrix * vec4(c.xy + vP * uRadius, c.z, 1.0);
}`,Qt=`
precision highp float;
precision highp int;

uniform float uClock, uFlow, uWave, uT;
uniform float uStreaks, uFine, uRim, uBack, uPole, uHalo, uGrain, uExposure, uSeed;
uniform vec3 uCore, uMid;

#define TAU 6.28318530718

vec3 lightPath(float t) {
  float a = TAU * t, b = 2.0 * a;
  return vec3(
    -0.7 - 0.448 * cos(a) - 0.033 * sin(a) + 0.172 * cos(b) + 0.041 * sin(b),
    0.9 - 0.59 * cos(a) - 0.597 * sin(a) + 0.207 * cos(b) - 0.187 * sin(b),
    1.0 + 0.6 * (0.132 * cos(a) - 0.091 * sin(a) - 0.117 * cos(b) + 0.246 * sin(b)));
}
float h13(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}
float vn(vec3 x) {
  vec3 i = floor(x), f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(h13(i), h13(i + vec3(1, 0, 0)), f.x), mix(h13(i + vec3(0, 1, 0)), h13(i + vec3(1, 1, 0)), f.x), f.y),
    mix(mix(h13(i + vec3(0, 0, 1)), h13(i + vec3(1, 0, 1)), f.x), mix(h13(i + vec3(0, 1, 1)), h13(i + vec3(1, 1, 1)), f.x), f.y),
    f.z);
}
// the filaments on the sphere's surface at s
float filaments(vec3 s) {
  float ph = uT * TAU;
  float lon = atan(s.x, s.z);
  float fy = 0.6 * sin(ph * 5.0 + s.x * 2.0);
  vec2 c = vec2(cos(lon), sin(lon));
  float n1 = vn(vec3(c * uStreaks, s.y * 1.1 + uSeed + 0.7 * sin(ph) + uFlow));
  float n2 = vn(vec3(c * uStreaks * 2.7 + 7.1, s.y * 1.6 + uSeed * 1.7 + 0.7 * cos(ph) - uFlow * 1.4));
  float n3 = vn(vec3(c * uStreaks * 7.0 + 3.3, s.y * 0.9 + uSeed * 0.6 + uFlow * 0.5 + fy));
  float n = smoothstep(0.3, 0.95, n1 * 0.55 + n2 * 0.35 + n3 * uFine * 0.45);
  return n * n * 1.6 * (1.0 + uWave * (0.55 + 0.45 * sin(abs(s.y) * 11.0 - uClock * 9.0)));
}
// light at disc point p (1 = the sphere's edge): both sides of the sphere, the flares and the halo
float shade(vec2 p) {
  float r2 = dot(p, p), d = sqrt(r2), I = 0.0;
  if (r2 < 1.0) {
    float z = sqrt(1.0 - r2);
    float w = mix(0.3, 0.12 + pow(1.0 - z, 1.4) * 1.7, uRim);
    I += (filaments(vec3(p, z)) + filaments(vec3(p.x, p.y, -z)) * uBack) * w;
    vec2 ld = lightPath(uT - 0.04).xy * 0.5;
    I *= 0.55 + 0.95 * pow(clamp(dot(p, ld) * 0.5 + 0.5, 0.0, 1.3), 2.0);
    I *= smoothstep(1.0, 0.93, d);
  }
  float wob = 0.1 * sin(uT * TAU * 2.0 + uSeed);
  vec2 pt = (p - vec2(wob, 0.86)) * vec2(1.0, 1.5), pb = (p - vec2(-wob * 0.6, -0.87)) * vec2(1.0, 1.5);
  float pf = 1.0 + 0.35 * sin(uT * TAU * 7.0 + uSeed);
  I += uPole * pf * (exp(-dot(pt, pt) * 55.0) + 0.8 * exp(-dot(pb, pb) * 65.0));
  I += uPole * 0.18 * (exp(-length(pt) * 5.0) + exp(-length(pb) * 6.0));
  I += uHalo * 0.3 * exp(-abs(d - 0.93) * 3.2);
  return I;
}
// light around p, blurred with stochastic samples: smear vertically, jitter sideways
float blurred(vec2 p, float jitter, float smear, int n) {
  float j = h13(vec3(gl_FragCoord.xy, uT * 97.0 + 1.0));
  float jx = h13(vec3(gl_FragCoord.yx * 0.71, uT * 53.0 + 5.0)) - 0.5;
  float I = 0.0, ws = 0.0;
  for (int i = 0; i < n; i++) {
    float k = (float(i) + j) / float(n) - 0.5;
    float w = exp(-k * k * 6.0);
    I += shade(p + vec2(k * 0.03 + jx * jitter, k * smear)) * w;
    ws += w;
  }
  return I / ws;
}
// the reference's Ink mode: light becomes density of colour, premultiplied, so the page shows through
vec4 ink(float I) {
  I *= lightPath(uT - 0.04).z;
  I *= 1.0 + (h13(vec3(gl_FragCoord.xy * 1.37, uT * 61.0 + 3.0)) - 0.5) * uGrain;
  float t = 1.0 - exp(-I * uExposure);
  float a = clamp(t * 1.15, 0.0, 1.0);
  return vec4(mix(uMid, uCore, smoothstep(0.45, 1.0, t)) * a, a);
}
`,Xn=`
${Qt}
uniform float uSmear;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  float mask = 1.0 - clamp((length(vP) - ${Je.toFixed(3)}) / ${(Xt-Je).toFixed(3)}, 0.0, 1.0);
  if (mask < 0.002) discard;
  outColor = ink(blurred(vP, 0.035, uSmear, 12)) * mask;
}`,Yn=`
precision highp float;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  float d = length(vP), aa = fwidth(d);
  float a = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  if (a < 0.5) discard; // depth only inside the sphere
  outColor = vec4(0.9647, 0.9647, 0.9725, 1.0); // #F6F6F8
}`,Qn=`
uniform float uRadius;
out vec2 vP;
void main() {
  vec4 c = modelViewMatrix * vec4(0.0, -2.0 * uRadius, 0.0, 1.0);
  vP = position.xy * ${$t.toFixed(3)};
  gl_Position = projectionMatrix * vec4(c.xy + vP * uRadius, c.z, 1.0);
}`,Jn=`
${Qt}
uniform float uRefl;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  // distance from the contact point, measured in an ellipse lying on the floor (wide, shallow), so the fade
  // rings out round the base instead of running in straight bands
  float far = length(vec2(vP.x * 0.36, max(0.0, 0.976 - vP.y))) / 0.6;
  float fade = exp(-2.4 * far * far);
  float a = uRefl * fade * (1.0 - clamp((length(vP) - ${Je.toFixed(3)}) / ${(Xt-Je).toFixed(3)}, 0.0, 1.0));
  if (a < 0.002) discard;
  // a wide blur needs more samples than the orb's, or its bright flare breaks up into speckles
  float blur = mix(0.05, 0.3, min(far, 1.0));
  outColor = ink(blurred(vec2(vP.x, -vP.y), blur, blur, 24)) * a;
}`,ei=["streaks","fine","smear","rim","back","pole","halo","exposure","grain"],et=class{constructor(e){this.group=new Z.Group;this.drive={state:"idle",listen:0,speak:0};this.style=1;this.cur={...Kt.idle};this.level=0;this.thinking=0;this.clock=0;this.flow=0;this.phase=0;this.energy=0;this.hueShift=0;this.params={...e},this.look={...e.looks[this.style]};let t=r=>new Z.Vector3(...Et(r));this.uniforms={uRadius:{value:e.radius},uClock:{value:0},uFlow:{value:0},uWave:{value:0},uT:{value:0},uStreaks:{value:0},uFine:{value:0},uSmear:{value:0},uRim:{value:0},uBack:{value:0},uPole:{value:0},uHalo:{value:0},uGrain:{value:0},uExposure:{value:0},uSeed:{value:0},uCore:{value:t(e.highlight)},uMid:{value:t(e.mid)},uRefl:{value:e.reflection}};let n=(r,o)=>new Z.ShaderMaterial({glslVersion:Z.GLSL3,vertexShader:r,fragmentShader:o,uniforms:this.uniforms,transparent:!0,premultipliedAlpha:!0,depthWrite:!1});this.mesh=new Z.Mesh(new Z.PlaneGeometry(2,2),n(Zt,Xn)),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2.5,this.mesh.name="orb",this.backdrop=new Z.Mesh(new Z.PlaneGeometry(2,2),new Z.ShaderMaterial({glslVersion:Z.GLSL3,vertexShader:Zt,fragmentShader:Yn,uniforms:this.uniforms})),this.backdrop.frustumCulled=!1,this.backdrop.renderOrder=2,this.backdrop.name="orb-backdrop",this.reflection=new Z.Mesh(new Z.PlaneGeometry(2,2),n(Qn,Jn)),this.reflection.material.depthTest=!1,this.reflection.frustumCulled=!1,this.reflection.renderOrder=-3,this.reflection.name="orb-reflection",this.group.add(this.backdrop,this.mesh,this.reflection),this.setParams(e),this.writeLook(0)}get highlightNow(){return this.uniforms.uCore.value}get midNow(){return this.uniforms.uMid.value}get radius(){return this.params.radius}setParams(e){Object.assign(this.params,e);let t=this.params.radius;this.group.position.set(0,t,0),this.uniforms.uRadius.value=t,this.uniforms.uRefl.value=this.params.reflection}setStyle(e,t=!1){this.style=e,t&&(this.look={...this.params.looks[e]})}writeLook(e){let{look:t,uniforms:n}=this,r=this.params.looks[this.style];for(let o of ei)t[o]+=(r[o]-t[o])*e;t.loop=r.loop,t.seed=r.seed,n.uStreaks.value=t.streaks,n.uFine.value=t.fine,n.uSmear.value=t.smear,n.uRim.value=t.rim,n.uBack.value=t.back,n.uGrain.value=t.grain,n.uSeed.value=t.seed}update(e){e=Math.min(e,.1);let{drive:t,cur:n,uniforms:r}=this,o=g=>Number.isFinite(g)?g:0,s=t.state==="listening"?o(t.listen):t.state==="speaking"?o(t.speak):0,a=Kt[t.state],l=1-Math.exp(-e*5);for(let g of Object.keys(a))n[g]+=(a[g]-n[g])*l;this.level+=(s-this.level)*Math.min(1,(s>this.level?30:7)*e),this.clock+=e,this.flow+=e*(n.flow+this.level*n.react*1.2),this.writeLook(l);let{look:c}=this,M=n.spin*(1+this.level*n.react*.5)*this.params.speed/Math.max(.1,c.loop);this.phase=(this.phase+e*M)%1;let p=this.level*n.react,b=n.breathe*Math.sin(this.clock*2.4);r.uClock.value=this.clock,r.uFlow.value=this.flow,r.uT.value=this.phase,r.uWave.value=n.wave+p*1.1,r.uPole.value=c.pole*(1+n.pole+p*.7),r.uHalo.value=c.halo*(1+n.halo+p*.3),r.uExposure.value=c.exposure*(1+n.exp+p*.3+b*3);let y=1-Math.exp(-e*8);r.uCore.value.lerp(new Z.Vector3(...Et(this.params.highlight)),y),r.uMid.value.lerp(new Z.Vector3(...Et(this.params.mid)),y),this.thinking+=((t.state==="thinking"?1:0)-this.thinking)*l,this.energy+=(Math.min(1,.25+.75*Math.max(this.level,this.thinking*.6))-this.energy)*(1-Math.exp(-e*6))}settle(){for(let e=0;e<90;e++)this.update(1/30)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.backdrop.geometry.dispose(),this.backdrop.material.dispose(),this.reflection.geometry.dispose(),this.reflection.material.dispose()}};import*as $ from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as pe from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var fe=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),D=(i,e,t)=>i+(e-i)*t,ti=i=>i-Math.floor(i),W=(i,e,t)=>{let n=fe((t-i)/(e-i));return n*n*(3-2*n)},We=i=>1-Math.pow(1-fe(i),3),se=i=>(i=fe(i),i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2);function Mt(i,e,t,n=.3,r=.3){return i<=e||i>=t?0:Math.min(se((i-e)/n),se((t-i)/r),1)}var N=i=>ti(Math.sin(i*12.9898+78.233)*43758.5453);function Ct(i){let e=i>>>0||1;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Ee(i,e=0){let n=Math.floor(i/.17),r=i/.17-n,o=Math.floor(i/.62+N(e*3.1)*7);return N(o*1.7+e)<.18?0:(.45+.55*N(n*.73+e*11.3))*Math.pow(Math.sin(Math.PI*r),.7)}function ge(i,e=new pe.Vector3){let t=new pe.Color;t.setStyle(i,pe.SRGBColorSpace);let n=t.clone().convertLinearToSRGB();return e.set(n.r,n.g,n.b)}var kt=new pe.Color,Ne={h:0,s:0,l:0};function _t(i,e,t){return kt.setRGB(i,e,t,pe.SRGBColorSpace).getHSL(Ne,pe.SRGBColorSpace).h}function qe(i,e){return Math.abs(e)<1e-4?i:(kt.setStyle(i,pe.SRGBColorSpace).getHSL(Ne,pe.SRGBColorSpace),`#${kt.setHSL(((Ne.h+e)%1+1)%1,Ne.s,Ne.l,pe.SRGBColorSpace).getHexString(pe.SRGBColorSpace)}`)}var P=Math.PI*2;var ke=16,tt=24,ni=`
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,ii=`
precision highp float;
varying vec3 vWorld;
uniform float uCell, uWidth, uOpacity, uMajor, uStyle;
uniform vec3 uLine, uAccent, uGlowColor, uShadowColor;
uniform vec2 uFade;
uniform float uGlow, uShadow, uOrbR, uGlobal;
uniform vec2 uViewR, uViewF;   // floor axes facing the camera: across the screen, and into it
uniform float uSquash;
uniform vec4 uRip[${ke}];
uniform vec2 uRipXZ[${ke}];
uniform float uRipKind[${ke}];
uniform int uRipN;
uniform vec4 uTile[${tt}];
uniform int uTileN;

// premultiplied "over"
void over(inout vec4 acc, vec3 c, float a) {
  a = clamp(a, 0.0, 1.0);
  acc.rgb = c * a + acc.rgb * (1.0 - a);
  acc.a = a + acc.a * (1.0 - a);
}

float sdRoundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 xz = vWorld.xz;
  float d = length(xz);
  vec2 fw = fwidth(xz);
  float pxw = max(0.5 * (fw.x + fw.y), 1e-5);   // world units per pixel
  float fade = 1.0 - smoothstep(uFade.x, uFade.y, d);

  // ---- grid
  vec2 g = xz / uCell;
  vec2 gd = abs(fract(g - 0.5) - 0.5) * uCell / pxw;    // px to nearest line
  float lines = 1.0 - smoothstep(uWidth * 0.5 - 0.5, uWidth * 0.5 + 0.5, min(gd.x, gd.y));
  if (uMajor > 0.5) {
    vec2 gm = abs(fract(g / uMajor - 0.5) - 0.5) * uCell * uMajor / pxw;
    float maj = 1.0 - smoothstep(uWidth * 0.5, uWidth * 0.5 + 1.0, min(gm.x, gm.y));
    lines = max(lines * 0.7, maj);
  }
  // offset to the nearest intersection, converted to screen px with the inverse screen\u2192world jacobian
  vec2 qw = (fract(g + 0.5) - 0.5) * uCell;
  vec2 jx = dFdx(xz), jy = dFdy(xz);
  float det = jx.x * jy.y - jy.x * jx.y;
  vec2 cellP = abs(det) > 1e-12 ? vec2(jy.y * qw.x - jy.x * qw.y, -jx.y * qw.x + jx.x * qw.y) / det : qw / pxw;
  float dots = 1.0 - smoothstep(uWidth * 0.9, uWidth * 0.9 + 1.0, length(cellP));
  float arm = 4.0 + uWidth * 2.0;
  float cross = max(
    (1.0 - smoothstep(uWidth * 0.5 - 0.5, uWidth * 0.5 + 0.5, abs(cellP.x))) * step(abs(cellP.y), arm),
    (1.0 - smoothstep(uWidth * 0.5 - 0.5, uWidth * 0.5 + 0.5, abs(cellP.y))) * step(abs(cellP.x), arm));
  float grid = uStyle < 0.5 ? lines : (uStyle < 1.5 ? dots : cross);

  // ---- ripples
  float boost = 0.0, ring = 0.0, band = 0.0;
  for (int i = 0; i < ${ke}; i++) {
    if (i >= uRipN) break;
    vec4 rp = uRip[i];
    float rd = length(xz - uRipXZ[i]);
    float k = uRipKind[i];
    if (k < 0.5) {
      float b = exp(-pow((rd - rp.x) / max(rp.z, 1e-3), 2.0)) * rp.y;
      boost += b;
      band += b * 0.12;
    } else if (k < 1.5) {
      ring += (1.0 - smoothstep(0.6, 1.6, abs(rd - rp.x) / pxw / max(rp.z, 0.2))) * rp.y;
    } else {
      band += exp(-pow((rd - rp.x) / max(rp.z, 1e-3), 2.0)) * rp.y;
    }
  }

  // ---- tiles
  float tileFill = 0.0, tileEdge = 0.0;
  for (int i = 0; i < ${tt}; i++) {
    if (i >= uTileN) break;
    vec4 t = uTile[i];
    float hs = 0.5 * t.w;
    float sd = sdRoundBox(xz - t.xy, vec2(hs - 0.03), hs * 0.22);
    tileFill += (1.0 - smoothstep(-pxw, pxw, sd)) * t.z;
    tileEdge += (1.0 - smoothstep(0.0, 1.2, abs(sd) / pxw)) * t.z;
  }

  vec4 acc = vec4(0.0);
  // light pool of the orb
  float pool = uGlow * (exp(-pow(d / (uOrbR * 1.6), 2.0)) * 0.55 + 0.45 / (1.0 + pow(d / (uOrbR * 1.1), 2.0) * 1.6));
  over(acc, uGlowColor, pool * 0.55);
  over(acc, uAccent, clamp(band, 0.0, 1.0) * 0.5 * fade);
  // grid, brightened and tinted where a ripple passes
  float gl = grid * uOpacity * fade * (1.0 + boost * 3.0);
  vec3 lc = mix(uLine, uAccent, clamp(boost * 1.4, 0.0, 1.0));
  over(acc, lc, gl);
  over(acc, uAccent, clamp(tileFill, 0.0, 1.0) * 0.16);
  over(acc, uAccent, clamp(tileEdge, 0.0, 1.0) * 0.7);
  over(acc, uAccent, clamp(ring, 0.0, 1.0) * 0.8);
  // contact shadow: light passes through the orb, so this is only a soft tinted breath where it meets the floor
  vec2 sv = vec2(dot(xz, uViewR), dot(xz, uViewF) / uSquash);
  float su = length(sv) / (uOrbR * 0.9);
  float sh = exp(-su * su * 3.0);
  over(acc, uShadowColor, sh * uShadow);

  acc *= uGlobal;
  if (acc.a < 0.001) discard;
  gl_FragColor = vec4(acc.rgb / acc.a, acc.a);
}`,nt=class{constructor(){this.ripples=[];this.tiles=[];this.glowAdd=0;this.baseGlow=.3;let e=Array.from({length:ke},()=>new $.Vector4);this.u={uCell:{value:.75},uWidth:{value:1},uOpacity:{value:.1},uMajor:{value:0},uStyle:{value:0},uLine:{value:new $.Vector3},uAccent:{value:new $.Vector3},uGlowColor:{value:new $.Vector3},uShadowColor:{value:new $.Vector3},uFade:{value:new $.Vector2(3,7)},uGlow:{value:.3},uShadow:{value:.3},uOrbR:{value:1},uViewR:{value:new $.Vector2(1,0)},uViewF:{value:new $.Vector2(0,1)},uSquash:{value:1},uGlobal:{value:1},uRip:{value:e},uRipXZ:{value:Array.from({length:ke},()=>new $.Vector2)},uRipKind:{value:new Array(ke).fill(0)},uRipN:{value:0},uTile:{value:Array.from({length:tt},()=>new $.Vector4)},uTileN:{value:0}};let t=new $.ShaderMaterial({vertexShader:ni,fragmentShader:ii,uniforms:this.u,transparent:!0,depthWrite:!1});this.mesh=new $.Mesh(new $.PlaneGeometry(80,80),t),this.mesh.rotation.x=-Math.PI/2,this.mesh.renderOrder=-2,this.mesh.name="floor"}setLook(e,t){let n=this.u;n.uStyle.value={lines:0,dots:1,cross:2}[e.style],ge(e.color,n.uLine.value),ge(e.accent,n.uAccent.value),ge(e.glowColor,n.uGlowColor.value),ge(e.shadowColor,n.uShadowColor.value),n.uOpacity.value=e.opacity,n.uCell.value=e.cell,n.uWidth.value=e.width,n.uMajor.value=e.major,n.uFade.value.set(e.fadeInner,e.fadeOuter),n.uGlow.value=e.glow,n.uShadow.value=e.shadow,n.uOrbR.value=t,this.baseGlow=e.glow}set shadowColor(e){ge(e,this.u.uShadowColor.value)}set glowColor(e){this.u.uGlowColor.value.copy(e)}setView(e,t){this.u.uViewR.value.set(Math.cos(e),-Math.sin(e)),this.u.uViewF.value.set(Math.sin(e),Math.cos(e)),this.u.uSquash.value=.2/Math.max(.05,Math.sin(t))}set opacity(e){this.u.uGlobal.value=e}beginFrame(){this.ripples.length=0,this.tiles.length=0,this.glowAdd=0}ripple(e){this.ripples.length<ke&&e.strength>.002&&this.ripples.push(e)}tile(e){this.tiles.length<tt&&e.strength>.002&&this.tiles.push(e)}endFrame(e){let t=this.u,n=t.uRip.value,r=t.uRipXZ.value,o=t.uRipKind.value;this.ripples.forEach((a,l)=>{n[l].set(a.radius,a.strength,a.width,0),r[l].set(a.x??0,a.z??0),o[l]=a.kind??0}),t.uRipN.value=this.ripples.length;let s=t.uTile.value;this.tiles.forEach((a,l)=>s[l].set(a.x,a.z,a.strength,a.size??t.uCell.value)),t.uTileN.value=this.tiles.length,t.uGlow.value=this.baseGlow*(.6+.6*e)+this.glowAdd}get frameEffects(){return{ripples:this.ripples.slice(),tiles:this.tiles.slice()}}get cell(){return this.u.uCell.value}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}};import*as j from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as pi,InstancedInterleavedBuffer as di,InterleavedBufferAttribute as on,Line3 as ui,MathUtils as hi,Matrix4 as mi,Mesh as fi,Sphere as gi,Vector3 as Ce,Vector4 as Ke}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as nn,Float32BufferAttribute as Jt,InstancedBufferGeometry as ri,InstancedInterleavedBuffer as en,InterleavedBufferAttribute as it,Sphere as oi,Vector3 as ai,WireframeGeometry as si}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var tn=new nn,rt=new ai,De=class extends ri{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new Jt(e,3)),this.setAttribute("uv",new Jt(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new en(t,6,1);return this.setAttribute("instanceStart",new it(n,3,0)),this.setAttribute("instanceEnd",new it(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new en(t,6,1);return this.setAttribute("instanceColorStart",new it(n,3,0)),this.setAttribute("instanceColorEnd",new it(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new si(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new nn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),tn.setFromBufferAttribute(t),this.boundingBox.union(tn))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oi),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let o=0,s=e.count;o<s;o++)rt.fromBufferAttribute(e,o),r=Math.max(r,n.distanceToSquared(rt)),rt.fromBufferAttribute(t,o),r=Math.max(r,n.distanceToSquared(rt));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};import{ShaderLib as ot,ShaderMaterial as li,UniformsLib as at,UniformsUtils as rn,Vector2 as ci}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";at.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ci},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};ot.line={uniforms:rn.merge([at.common,at.fog,at.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		float trimSegmentAlpha( const in vec4 start, const in vec4 end ) {

			// compute the interpolation factor needed to trim the segment so it terminates
			// between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column

			// we need different nearEstimate formula for reversed and default depth buffer
			// a is positive with a reversed depth buffer so it can be used for controlling the code flow
			float nearEstimate = ( a > 0.0 ) ? ( - b / ( a + 1.0 ) ) : ( - 0.5 * b / a );

			return ( nearEstimate - start.z ) / ( end.z - start.z );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef USE_DASH

				float lineDistanceStart = dashScale * instanceDistanceStart;
				float lineDistanceEnd = dashScale * instanceDistanceEnd;

			#endif

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( start, end );
					end.xyz = mix( start.xyz, end.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceEnd = mix( lineDistanceStart, lineDistanceEnd, alpha );

					#endif

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					float alpha = trimSegmentAlpha( end, start );
					start.xyz = mix( end.xyz, start.xyz, alpha );

					#ifdef USE_DASH

						lineDistanceStart = mix( lineDistanceEnd, lineDistanceStart, alpha );

					#endif

				}

			}

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? lineDistanceStart : lineDistanceEnd;
				vUv = uv;

			#endif

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			float alpha = opacity;
			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};var Me=class extends li{constructor(e){super({type:"LineMaterial",uniforms:rn.clone(ot.line.uniforms),vertexShader:ot.line.vertexShader,fragmentShader:ot.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var Rt=new Ke,an=new Ce,sn=new Ce,ne=new Ke,ie=new Ke,ve=new Ke,At=new Ce,Tt=new mi,re=new ui,ln=new Ce,st=new pi,lt=new gi,be=new Ke,ye,Oe;function cn(i,e,t){return be.set(0,0,-e,1).applyMatrix4(i.projectionMatrix),be.multiplyScalar(1/be.w),be.x=Oe/t.width,be.y=Oe/t.height,be.applyMatrix4(i.projectionMatrixInverse),be.multiplyScalar(1/be.w),Math.abs(Math.max(be.x,be.y))}function vi(i,e){let t=i.matrixWorld,n=i.geometry,r=n.attributes.instanceStart,o=n.attributes.instanceEnd,s=Math.min(n.instanceCount,r.count);for(let a=0,l=s;a<l;a++){re.start.fromBufferAttribute(r,a),re.end.fromBufferAttribute(o,a),re.applyMatrix4(t);let c=new Ce,M=new Ce;ye.distanceSqToSegment(re.start,re.end,M,c),M.distanceTo(c)<Oe*.5&&e.push({point:M,pointOnLine:c,distance:ye.origin.distanceTo(M),object:i,face:null,faceIndex:a,uv:null,uv1:null})}}function bi(i,e,t){let n=e.projectionMatrix,o=i.material.resolution,s=i.matrixWorld,a=i.geometry,l=a.attributes.instanceStart,c=a.attributes.instanceEnd,M=Math.min(a.instanceCount,l.count),p=-e.near;ye.at(1,ve),ve.w=1,ve.applyMatrix4(e.matrixWorldInverse),ve.applyMatrix4(n),ve.multiplyScalar(1/ve.w),ve.x*=o.x/2,ve.y*=o.y/2,ve.z=0,At.copy(ve),Tt.multiplyMatrices(e.matrixWorldInverse,s);for(let b=0,y=M;b<y;b++){if(ne.fromBufferAttribute(l,b),ie.fromBufferAttribute(c,b),ne.w=1,ie.w=1,ne.applyMatrix4(Tt),ie.applyMatrix4(Tt),ne.z>p&&ie.z>p)continue;if(ne.z>p){let v=ne.z-ie.z,m=(ne.z-p)/v;ne.lerp(ie,m)}else if(ie.z>p){let v=ie.z-ne.z,m=(ie.z-p)/v;ie.lerp(ne,m)}ne.applyMatrix4(n),ie.applyMatrix4(n),ne.multiplyScalar(1/ne.w),ie.multiplyScalar(1/ie.w),ne.x*=o.x/2,ne.y*=o.y/2,ie.x*=o.x/2,ie.y*=o.y/2,re.start.copy(ne),re.start.z=0,re.end.copy(ie),re.end.z=0;let E=re.closestPointToPointParameter(At,!0);re.at(E,ln);let h=hi.lerp(ne.z,ie.z,E),w=h>=-1&&h<=1,C=At.distanceTo(ln)<Oe*.5;if(w&&C){re.start.fromBufferAttribute(l,b),re.end.fromBufferAttribute(c,b),re.start.applyMatrix4(s),re.end.applyMatrix4(s);let v=new Ce,m=new Ce;ye.distanceSqToSegment(re.start,re.end,m,v),t.push({point:m,pointOnLine:v,distance:ye.origin.distanceTo(m),object:i,face:null,faceIndex:b,uv:null,uv1:null})}}}var ct=class extends fi{constructor(e=new De,t=new Me({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let s=0,a=0,l=t.count;s<l;s++,a+=2)an.fromBufferAttribute(t,s),sn.fromBufferAttribute(n,s),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+an.distanceTo(sn);let o=new di(r,2,1);return e.setAttribute("instanceDistanceStart",new on(o,1,0)),e.setAttribute("instanceDistanceEnd",new on(o,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let o=e.params.Line2!==void 0&&e.params.Line2.threshold||0;ye=e.ray;let s=this.matrixWorld,a=this.geometry,l=this.material;Oe=l.linewidth+o,a.boundingSphere===null&&a.computeBoundingSphere(),lt.copy(a.boundingSphere).applyMatrix4(s);let c;if(n)c=Oe*.5;else{let p=Math.max(r.near,lt.distanceToPoint(ye.origin));c=cn(r,p,l.resolution)}if(lt.radius+=c,ye.intersectsSphere(lt)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),st.copy(a.boundingBox).applyMatrix4(s);let M;if(n)M=Oe*.5;else{let p=Math.max(r.near,st.distanceToPoint(ye.origin));M=cn(r,p,l.resolution)}st.expandByScalar(M),ye.intersectsBox(st)!==!1&&(n?vi(this,t):bi(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(Rt),this.material.uniforms.resolution.value.set(Rt.z,Rt.w))}};var Ie=class extends De{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}};var pt=class extends ct{constructor(e=new Ie,t=new Me({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}};var Ot=class extends pt{constructor(e,t){let n=new Ie;n.setPositions(new Float32Array(e*3)),n.setColors(new Float32Array(e*3).fill(1)),super(n,t),this.computeLineDistances(),this.cap=e,this.pos=n.attributes.instanceStart.data.array,this.col=n.attributes.instanceColorStart.data.array,this.dist=n.attributes.instanceDistanceStart.data.array,this.frustumCulled=!1,this.renderOrder=3,n.instanceCount=0}setPoints(e,t){let n=Array.isArray(e)&&e[0]instanceof j.Vector3,r=Math.min(this.cap,n?e.length:e.length/3),o=(l,c)=>n?e[l].getComponent(c):e[l*3+c],s=0;for(let l=0;l<r-1;l++){let c=l*6;for(let y=0;y<3;y++)this.pos[c+y]=o(l,y),this.pos[c+3+y]=o(l+1,y),t&&(this.col[c+y]=t[l*3+y],this.col[c+3+y]=t[(l+1)*3+y]);let M=this.pos[c+3]-this.pos[c],p=this.pos[c+4]-this.pos[c+1],b=this.pos[c+5]-this.pos[c+2];this.dist[l*2]=s,s+=Math.sqrt(M*M+p*p+b*b),this.dist[l*2+1]=s}let a=this.geometry;return a.attributes.instanceStart.data.needsUpdate=!0,t&&(a.attributes.instanceColorStart.data.needsUpdate=!0),a.attributes.instanceDistanceStart.data.needsUpdate=!0,a.instanceCount=Math.max(0,r-1),s}get opacity(){return this.material.opacity}set opacity(e){this.material.opacity=e,this.visible=e>.003}},yi=`
attribute float aSize;
attribute vec4 aColor;
uniform float uScale;
varying vec4 vColor;
varying float vPx;
void main() {
  vColor = aColor;
  vPx = max(aSize * uScale, 0.5);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = vPx + 2.0; // room for the anti-aliased edge
  gl_Position = projectionMatrix * mv;
}`,wi=`
varying vec4 vColor;
varying float vPx;
uniform float uOpacity;
uniform float uSoft;
void main() {
  float d = length(gl_PointCoord - 0.5) * (vPx + 2.0); // device px from the centre
  float r = vPx * 0.5;
  float crisp = clamp(r - d + 0.5, 0.0, 1.0);
  float soft = exp(-d * d / (r * r * 0.7));
  float a = mix(crisp, soft, uSoft) * vColor.a * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor.rgb, a);
}`,_e=class extends j.Points{constructor(e,t,n=0){let r=new j.BufferGeometry,o=new Float32Array(e*3),s=new Float32Array(e),a=new Float32Array(e*4);r.setAttribute("position",new j.BufferAttribute(o,3).setUsage(j.DynamicDrawUsage)),r.setAttribute("aSize",new j.BufferAttribute(s,1).setUsage(j.DynamicDrawUsage)),r.setAttribute("aColor",new j.BufferAttribute(a,4).setUsage(j.DynamicDrawUsage));let l=new j.ShaderMaterial({vertexShader:yi,fragmentShader:wi,uniforms:{uScale:t,uOpacity:{value:1},uSoft:{value:n}},transparent:!0,depthWrite:!1});super(r,l),this.count=e,this.pos=o,this.size=s,this.color=a,this.frustumCulled=!1,this.renderOrder=3}set(e,t,n,r,o,s,a){let l=e*3,c=e*4;this.pos[l]=t,this.pos[l+1]=n,this.pos[l+2]=r,this.size[e]=o,this.color[c]=s[0],this.color[c+1]=s[1],this.color[c+2]=s[2],this.color[c+3]=a}commit(){let e=this.geometry.attributes;e.position.needsUpdate=!0,e.aSize.needsUpdate=!0,e.aColor.needsUpdate=!0}set soft(e){this.material.uniforms.uSoft.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},xi=`
attribute vec3 aStart;
attribute vec3 aEnd;
attribute vec4 aColor;
attribute float aWidth;
uniform vec2 uRes;
varying vec4 vColor;
varying vec2 vLocal;
varying float vLen;
varying float vHw;
void main() {
  vec4 a = projectionMatrix * modelViewMatrix * vec4(aStart, 1.0);
  vec4 b = projectionMatrix * modelViewMatrix * vec4(aEnd, 1.0);
  vec2 sa = a.xy / a.w * 0.5 * uRes;
  vec2 sb = b.xy / b.w * 0.5 * uRes;
  vec2 d = sb - sa;
  float len = length(d);
  vec2 dir = len > 1e-4 ? d / len : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  float hw = aWidth * 0.5;
  float pad = hw + 1.0;
  float along = position.x * len + (position.x * 2.0 - 1.0) * pad;
  vec2 p = sa + dir * along + nrm * position.y * pad;
  vLocal = vec2(along, position.y * pad);
  vLen = len;
  vHw = hw;
  vColor = aColor;
  gl_Position = vec4(p / (0.5 * uRes), mix(a.z / a.w, b.z / b.w, position.x), 1.0);
}`,Si=`
uniform float uTail;
uniform float uOpacity;
varying vec4 vColor;
varying vec2 vLocal;
varying float vLen;
varying float vHw;
void main() {
  float t = clamp(vLocal.x, 0.0, vLen);
  float dist = length(vec2(vLocal.x - t, vLocal.y));
  float a = clamp(vHw - dist + 0.5, 0.0, 1.0);
  a *= mix(uTail, 1.0, vLen > 0.0 ? t / vLen : 1.0); // fades toward the tail
  a *= vColor.a * uOpacity;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor.rgb, a);
}`,Ve=class extends j.Mesh{constructor(e,t,n=0){let r=new j.InstancedBufferGeometry;r.setAttribute("position",new j.BufferAttribute(new Float32Array([0,-1,0,1,-1,0,1,1,0,0,1,0]),3)),r.setIndex([0,1,2,0,2,3]);let o=new Float32Array(e*3),s=new Float32Array(e*3),a=new Float32Array(e*4),l=new Float32Array(e),c=(p,b)=>new j.InstancedBufferAttribute(p,b).setUsage(j.DynamicDrawUsage);r.setAttribute("aStart",c(o,3)),r.setAttribute("aEnd",c(s,3)),r.setAttribute("aColor",c(a,4)),r.setAttribute("aWidth",c(l,1)),r.instanceCount=e;let M=new j.ShaderMaterial({vertexShader:xi,fragmentShader:Si,uniforms:{uRes:{value:t},uTail:{value:n},uOpacity:{value:1}},transparent:!0,depthWrite:!1});super(r,M),this.count=e,this.start=o,this.end=s,this.color=a,this.width=l,this.frustumCulled=!1,this.renderOrder=3,this.userData.kind="streaks"}set(e,t,n,r,o,s,a,l,c,M){let p=e*3,b=e*4;this.start[p]=t,this.start[p+1]=n,this.start[p+2]=r,this.end[p]=o,this.end[p+1]=s,this.end[p+2]=a,this.width[e]=l,this.color[b]=c[0],this.color[b+1]=c[1],this.color[b+2]=c[2],this.color[b+3]=M}commit(){let e=this.geometry.attributes;e.aStart.needsUpdate=!0,e.aEnd.needsUpdate=!0,e.aColor.needsUpdate=!0,e.aWidth.needsUpdate=!0}set tail(e){this.material.uniforms.uTail.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},dt=class{constructor(e,t,n){this.look=e;this.resolution=t,this.pointScale=n}lineMaterial(e={}){let t=new Me({color:e.vertexColors?16777215:new j.Color(e.color??this.look.ink).getHex(),linewidth:e.width??1.25,transparent:!0,opacity:e.opacity??1,dashed:!!e.dashed,dashSize:e.dash??.08,gapSize:e.gap??.08,vertexColors:!!e.vertexColors,depthWrite:!1});return t.uniforms.resolution.value=this.resolution,t}line(e,t={}){let n=new Ot(e,this.lineMaterial(t));return n.userData.baseWidth=t.width??1.25,t.vertexColors||(n.userData.role=(t.color??this.look.ink).toLowerCase()===this.look.accent.toLowerCase()?"active":"muted"),n}particles(e,t=0){return new _e(e,this.pointScale,t)}streaks(e,t=0){return new Ve(e,this.resolution,t)}linear(e){let t=new j.Color(e);return[t.r,t.g,t.b]}srgb(e){let t=ge(e);return[t.x,t.y,t.z]}};import*as un from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var pn=.3,Ei=10,hn=.01;function Ze(i){let e=[];return i.traverse(t=>{(t instanceof _e||t instanceof Ve)&&e.push(t)}),e}var ut=()=>({x:0,y:0,z:0,s:0,c:[0,0,0,0]});function ki(i,e,t,n){let r=e*3,o=e*4,s=i instanceof _e?i.pos:i.end;return n.x=s[r],n.y=s[r+1],n.z=s[r+2],n.s=i instanceof _e?Math.max(i.size[e]*t,.5):i.width[e],n.c[0]=i.color[o],n.c[1]=i.color[o+1],n.c[2]=i.color[o+2],n.c[3]=i.visible?i.color[o+3]*i.opacity:0,n}function mt(i){let e=i.reduce((o,s)=>o+s.count,0),t=new Uint16Array(e),n=new Uint32Array(e),r=0;return i.forEach((o,s)=>{for(let a=0;a<o.count;a++,r++)t[r]=s,n[r]=a}),{n:e,fields:i,field:t,local:n,read:(o,s,a)=>ki(i[t[o]],n[o],s,a)}}function mn(i,e){let t=mt(i),n=ut(),r=[],o=[],s=[];for(let a=0;a<t.n;a++)t.read(a,e,n),!(n.c[3]<hn)&&(r.push(n.x,n.y,n.z),o.push(n.s),s.push(...n.c));return{n:o.length,read(a,l,c){c.x=r[a*3],c.y=r[a*3+1],c.z=r[a*3+2],c.s=o[a];for(let M=0;M<4;M++)c.c[M]=s[a*4+M];return c}}}function dn(i,e){let t=ut(),n=[],r=[],o=[];for(let s=0;s<i.n;s++)i.read(s,e,t),!(t.c[3]<hn)&&(n.push(s),r.push(Math.hypot(t.x,t.z)),o.push(Math.atan2(t.z,t.x)));return{idx:n,r:Float64Array.from(r),a:Float64Array.from(o)}}var ht=class{constructor(e,t,n,r,o){this.src=e;this.look=n;this.resolution=r;this.pointScale=o;this.group=new un.Group;this.dots=null;this.trails=null;this.p=0;this.links=null;this.carried=new Uint8Array(0);this.sd=ut();this.td=ut();this.target=mt(t),this.group.name="morph"}get done(){return this.p>=1}link(e){let t=dn(this.src,e),n=dn(this.target,e),r=t.idx.length,o=n.idx.length,s=(E,h)=>Array.from({length:E},(w,C)=>C).sort((w,C)=>h[w]-h[C]),a={s:s(r,t.r),t:s(o,n.r)},l=Math.max(1,Math.min(Ei,r,o)),c=[],M=[],p=[],b=[],y=[];if(r&&o)for(let E=0;E<l;E++){let h=a.s.slice(Math.floor(E*r/l),Math.floor((E+1)*r/l)).sort((v,m)=>t.a[v]-t.a[m]),w=a.t.slice(Math.floor(E*o/l),Math.floor((E+1)*o/l)).sort((v,m)=>n.a[v]-n.a[m]),C=Math.max(h.length,w.length);for(let v=0;v<C;v++){let m=Math.floor(v*h.length/C),x=Math.floor(v*w.length/C);c.push(t.idx[h[m]]),M.push(n.idx[w[x]]),p.push(v===0||Math.floor((v-1)*h.length/C)!==m?1:0),b.push(v===0||Math.floor((v-1)*w.length/C)!==x?1:0),y.push(pn*(.7*(l>1?E/(l-1):0)+.3*N(c.length*.731)))}}let g=c.length;this.links={n:g,s:Uint32Array.from(c),t:Uint32Array.from(M),sKeep:Uint8Array.from(p),tKeep:Uint8Array.from(b),delay:Float32Array.from(y)},this.carried=new Uint8Array(this.target.n);for(let E of M)this.carried[E]=1;g&&(this.trails=new Ve(g,this.resolution,0),this.dots=new _e(g,this.pointScale),this.group.add(this.trails,this.dots))}update(e,t,n){if(this.links||this.link(t),this.p=Math.min(1,this.p+e/Math.max(.05,this.look.duration)),this.done)return;let r=this.links,{src:o,target:s,sd:a,td:l}=this,c=n,M=this.look.swirl,p=this.look.trail,b=[0,0,0],y=[0,0,0],g=[0,0,0],E=(v,m)=>{let x=Math.atan2(a.z,a.x),_=Math.hypot(a.x,a.z),R=Math.atan2(l.z,l.x),T=Math.hypot(l.x,l.z),A=R-x;A-=Math.round(A/(2*Math.PI))*2*Math.PI;let H=x+A*m+M*Math.sin(Math.PI*m),z=D(_,T,m);v[0]=Math.cos(H)*z,v[1]=D(a.y,l.y,m),v[2]=Math.sin(H)*z},{dots:h,trails:w}=this;if(h&&w){for(let v=0;v<r.n;v++){o.read(r.s[v],t,a),s.read(r.t[v],t,l);let m=fe((this.p-r.delay[v])/(1-pn)),x=se(m);E(b,x),E(y,se(m-p));for(let H=0;H<3;H++)g[H]=D(a.c[H],l.c[H],x);let _=D(a.c[3]*r.sKeep[v],l.c[3]*r.tKeep[v],x),R=b[0]*b[0]+(b[1]-c)**2+b[2]*b[2]<c*c*1.02?0:_,T=D(a.s,l.s,x);h.set(v,b[0],b[1],b[2],T/t,g,R);let A=Math.hypot(b[0]-y[0],b[1]-y[1],b[2]-y[2]);w.set(v,y[0],y[1],y[2],b[0],b[1],b[2],T,g,R*.7*W(0,.08,A))}h.commit(),w.commit()}let C=se(this.p);for(let v=0;v<s.n;v++)s.fields[s.field[v]].color[s.local[v]*4+3]*=this.carried[v]?0:C;for(let v of s.fields)v.commit()}dispose(){this.group.removeFromParent();for(let e of[this.dots,this.trails])e?.geometry.dispose(),e?.material.dispose()}};import*as oe from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as Ue from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";function fn(i){i.updateMatrixWorld();let e=i.matrixWorld.elements,t=new Ue.Vector3(e[0],e[1],e[2]).normalize(),n=new Ue.Vector3(e[4],e[5],e[6]).normalize(),r=new Ue.Vector3(e[8],e[9],e[10]).normalize(),o=new Ue.Vector3(t.x,0,t.z).normalize(),s=new Ue.Vector3(r.x,0,r.z).normalize();return{right:t,up:n,toViewer:r,floorRight:o,floorFront:s}}var Pt=10,ft=[{who:"caller",a:.4,b:2.6},{who:"agent",a:3.15,b:5.55},{who:"caller",a:4.15,b:4.55,kind:"backchannel"},{who:"caller",a:5.4,b:7.6,kind:"interrupt"},{who:"agent",a:8.15,b:9.55}];function Mi(i,e,t,n,r){let o=t+n,s=Math.floor(i/o),a=(i-s*o)/t;return a>1||N(s*1.7+e)<r?0:(.6+.4*N(s*2.1+e))*Math.pow(Math.sin(Math.PI*a),1.2)}function $e(i,e,t,n,r){for(let o of ft){if(o.who!==e)continue;let s=o.b;if(e==="agent"){let l=ft.find(c=>c.kind==="interrupt"&&c.a>o.a&&c.a<o.b);l&&(s=Math.min(s,l.a+.12))}if(i<o.a||i>s)continue;let a=Math.min(1,(i-o.a)/.06,(s-i)/.06);return o.kind==="backchannel"?.55*Math.sin(Math.PI*fe((i-o.a)/(s-o.a))):Mi(i-o.a,e==="caller"?3:7,t,n,r)*a}return 0}var zt=[{name:"Nova",trait:"Warm, natural",mid:"#00ccff",high:"#3d64ff"},{name:"Aria",trait:"Bright, upbeat",mid:"#8fb4ff",high:"#5b6cff"},{name:"Ember",trait:"Warm, bold",mid:"#f7962f",high:"#ff6000"},{name:"Iris",trait:"Clear, friendly",mid:"#a99bff",high:"#6d5cff"},{name:"Jun",trait:"Soft, steady",mid:"#7fd3ff",high:"#3d64ff"}];var Pe=["query","retrieval","flow"],Lt=12,Ht=[{part:"query",t:.7,dir:"out"},{part:"retrieval",t:1.6,dir:"in"},{part:"flow",t:4.4,dir:"in"},{part:"retrieval",t:6.5,dir:"in"},{part:"query",t:8.6,dir:"out"},{part:"retrieval",t:9.5,dir:"in"}],gn=1.5,gt=.6;function vt(i,e){let t=0;for(let n of Ht){if(n.part!==i)continue;let r=e-n.t;r<0||r>gn||(t=Math.max(t,Math.min(se(fe(r/(gt*.9))),se(fe((gn-r)/.6)))))}return t}var vn=[0,0,0],q=(i,e,t)=>{for(let n=0;n<3;n++)vn[n]=D(i[n],e[n],t);return vn},Q=i=>i.params,Dt=(i,e,t,n)=>i*i+(e-n)*(e-n)+t*t<n*n*1.02;function we(i){let{kit:e,particles:t,hueShift:n}=i;return{ink:e.srgb(t.muted),accent:e.srgb(qe(t.active,n)),high:e.srgb(qe(t.highlight,n))}}var It=42,Vt=(i,e,t,n)=>Math.round(i*n/e/(P/t)),Ut=(i,e,t,n,r)=>i+((t-r*n)%e+e)%e,Y="Particle look \xB7 this scene",xe={own_size:{value:!1,label:"own dot size",group:Y},p_size:{value:1.5,min:.5,max:5,step:.05,label:"dot size",group:Y},own_emphasis:{value:!1,label:"own lit / crest \xD7",group:Y},p_emphasis:{value:1.6,min:1,max:3,step:.05,label:"lit / crest \xD7",group:Y},own_density:{value:!1,label:"own density",group:Y,rebuild:!0},p_density:{value:1,min:.2,max:3,step:.05,label:"density",group:Y,rebuild:!0},own_scatter:{value:!1,label:"own scatter",group:Y},p_scatter:{value:.025,min:0,max:.15,step:.001,label:"scatter",group:Y},own_idle:{value:!1,label:"own idle movement",group:Y},p_idle:{value:.012,min:0,max:.08,step:.001,label:"idle movement",group:Y},own_idleSpeed:{value:!1,label:"own idle speed",group:Y},p_idleSpeed:{value:3,min:0,max:12,step:1,label:"idle wiggles / loop",group:Y},own_muted:{value:!1,label:"own muted colour",group:Y},p_muted:{value:"#1A1C22",label:"muted colour",group:Y},own_active:{value:!1,label:"own active colour",group:Y},p_active:{value:"#3E6AEF",label:"active colour",group:Y},own_highlight:{value:!1,label:"own highlight colour",group:Y},p_highlight:{value:"#3E8CF7",label:"highlight colour",group:Y}},Be=(i,e)=>Math.max(12,Math.round(P*e*It*i.particles.density)),he=i=>({s:.75+N(i*1.31)*.5,sr:N(i*2.17+3)-.5,sy:N(i*3.71+7),ph:N(i*5.03+11)*P});function me(i,e,t,n,r){let o=Math.max(0,Math.round(i.idleSpeed)),s=P*o*t/n;return r[0]=i.scatter*2*e.sr+i.idle*Math.sin(s+e.ph),r[1]=i.scatter*e.sy+i.idle*.7*(1+Math.sin(P*(o+1)*t/n+e.ph*2)),r}function Xe(i){let e=i.arch==="s2s"?1:0;return t=>e+=((i.arch==="s2s"?1:0)-e)*(1-Math.exp(-t*3))}var Ci={outer:{value:3.6,min:2,max:5,step:.05,label:"field radius",rebuild:!0},cloud:{value:1.6,min:.2,max:3,step:.05,label:"cloud height",rebuild:!0},lanes:{value:.14,min:.05,max:.5,step:.01,label:"lane spacing",rebuild:!0},jitter:{value:.08,min:0,max:.4,step:.005,label:"noise jitter"},bob:{value:.14,min:0,max:.6,step:.005,label:"noise vertical"},waveStart:{value:1.6,min:0,max:6,step:.05,label:"clear at s"},waveTime:{value:2.8,min:.3,max:6,step:.05,label:"clear over s"},front:{value:.6,min:.05,max:2,step:.05,label:"front softness"},flow:{value:.35,min:0,max:2,step:.01,label:"lane speed"},trail:{value:.45,min:0,max:2,step:.01,label:"trail s"},dotOpacity:{value:.38,min:0,max:1,step:.01,label:"dust opacity"},streakOpacity:{value:.85,min:0,max:1,step:.01,label:"streak opacity"},tail:{value:0,min:0,max:1,step:.01,label:"tail opacity"},...xe},_i={duration:9,orb:"listening",params:Ci,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=Math.max(100,Math.round(2600*i.particles.density)),a=e.particles(s),l=e.streaks(s);t.add(a,l);let c=Ct(3),M=g=>Math.max(1,Math.round(g*r/P))*P/r,p=Array.from({length:s},(g,E)=>{let h=Math.sqrt(D((n*1.25)**2,o.outer**2,c())),w=n*1.25+Math.round((h-n*1.25)/o.lanes)*o.lanes,C=.7+c()*1.4,v=[1.3,2.1,5.3,4.7,3.1,7].map(m=>M(C*m));return{r:h,rl:w,a:c()*P,y:.05+Math.pow(c(),1.7)*o.cloud,w:v,g:he(E)}}),b=[0,0],y=Xe(i);return{update({t:g,age:E,dt:h,presence:w,loopOut:C}){let v=we(i),m=Q(i),x=y(h),_=n*1.25,R=o.outer-_,T=i.particles,A=g<m.waveStart?0:n*1.1+We((g-m.waveStart)/m.waveTime)*(o.outer+m.front+.2-n*1.1),H=E-g>r/2,z=Mt(g,H?0:-1/0,C?r:1/0,.5,.7)*w;for(let u=0;u<s;u++){let f=p[u],d=se(W(f.r-m.front*.3,f.r+m.front*.7,A)),S=f.w,k=f.g.ph*16,O=f.a+Math.sin(g*S[0]+k)*.1,V=f.r+Math.sin(g*S[1]+k*1.7)*m.jitter*2,F=Math.cos(O)*V+Math.sin(g*S[2]+k)*m.jitter,I=Math.sin(O)*V+Math.cos(g*S[3]+k)*m.jitter,U=f.y+Math.sin(g*S[4]+k*2.3)*m.bob;me(T,f.g,g,r,b);let G=.45*x*Math.max(0,g-m.waveStart),B=_+((f.rl-_-G)%R+R)%R,X=x>.01?W(_,_+.35,B)*(1-W(o.outer-.5,o.outer,B)):1,ae=D(f.rl,B,x)+b[0],de=.02+b[1],ue=m.flow/f.rl,Se=f.a-g*ue,He=Se+ue*m.trail,L=ae+.45*x*m.trail,ee=D(F,Math.cos(Se)*ae,d),ce=D(U,de,d),te=D(I,Math.sin(Se)*ae,d),Te=D(ee,Math.cos(He)*L,d),$n=D(te,Math.sin(He)*L,d),Nt=Dt(ee,ce,te,n)?0:1,Wt=1-W(n*1.2,o.outer,D(f.rl,ae,x));a.set(u,ee,ce,te,T.size*f.g.s,v.ink,(1-d)*m.dotOpacity*z*Nt*(.75+.25*Math.sin(g*S[5]+k))),l.set(u,Te,de,$n,ee,ce,te,T.size*f.g.s,q(v.accent,v.high,Wt*.6),d*m.streakOpacity*z*Nt*X*(.55+.45*Wt))}l.tail=m.tail,a.commit(),l.commit(),i.orb.listen=Ee(g,3)*.8}}}};function Ft(i,e,t,n,r){for(let o=0;o<e;o++){let s=o/(e-1)*P;i[o*3]=Math.cos(s)*t,i[o*3+1]=n+r(s),i[o*3+2]=Math.sin(s)*t}}var Ri={rotation:{value:0,min:-180,max:180,step:1,label:"rotation \xB0"},spin:{value:3,min:-30,max:30,step:.5,label:"spin \xB0/s"},radius:{value:1.95,min:1.2,max:3.5,step:.01,label:"radius \xD7orb"},height:{value:.26,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:64,min:8,max:200,step:1,label:"wave cycles"},wordLength:{value:.4,min:.1,max:1.2,step:.01,label:"word length s"},wordGap:{value:.2,min:0,max:1,step:.01,label:"word gap s"},pauses:{value:.15,min:0,max:.8,step:.01,label:"pause chance"},lineWidth:{value:1.4,min:.5,max:4,step:.05,label:"caller line width"},lineColor:{value:"#1A1C22",label:"caller colour"},lineOpacity:{value:.85,min:0,max:1,step:.01,label:"caller opacity"},dotOpacity:{value:1,min:0,max:1,step:.01,label:"agent opacity"},previous:{value:.35,min:0,max:1,step:.01,label:"previous pass"},guide:{value:!0,label:"guide ring"},guideOpacity:{value:.2,min:0,max:1,step:.01,label:"guide opacity"},playhead:{value:!0},playheadLength:{value:.3,min:.05,max:1,step:.01,label:"playhead length"},playheadWidth:{value:1.3,min:.5,max:6,step:.05,label:"playhead width"},playheadColor:{value:"#1A1C22",label:"playhead colour"},playheadOpacity:{value:.45,min:0,max:1,step:.01,label:"playhead opacity"},markers:{value:!0,label:"hand-off ticks"},markerLength:{value:.22,min:.05,max:1,step:.01,label:"tick length"},markerWidth:{value:1.1,min:.5,max:6,step:.05,label:"tick width"},markerColor:{value:"#1A1C22",label:"tick colour"},markerOpacity:{value:.4,min:0,max:1,step:.01,label:"tick opacity"},...xe},Ai={duration:Pt,orb:"listening",params:Ri,morph:!1,create(i){let{kit:e,group:t,look:n}=i,r=i.orbRadius,o=Pt,s=(A,H,z=.015)=>new oe.Vector3(Math.cos(H)*A,z,Math.sin(H)*A),a=e.line(240,{width:1,color:n.ink,opacity:.2,dashed:!0,dash:.05,gap:.07}),l=new Float32Array(720);t.add(a);let c=Math.max(400,Math.round(1600*i.particles.density)),M=24,p=Array.from({length:M},()=>{let A=e.line(c,{width:1.4,vertexColors:!0});return t.add(A),A}),b=new Float32Array(c*3),y=e.particles(c);t.add(y);let g=Array.from({length:c},(A,H)=>he(H)),E=new Float32Array(c),h=new Uint8Array(c),w=[],C="",v=(A,H,z)=>{let u=`${A}|${H}|${z}`;if(u===C)return;C=u;for(let d=0;d<c;d++){let S=d/c*o,k=$e(S,"caller",A,H,z),O=$e(S,"agent",A,H,z);E[d]=Math.max(k,O),h[d]=O>k?1:0}w=[];let f=-1;for(let d=0;d<=c;d++){let S=d<c&&!h[d];S&&f<0&&(f=d),!S&&f>=0&&(w.push([f,d]),f=-1)}},m=new Float32Array(c*3),x=[0,0],_=e.line(2,{width:1.3,color:n.ink,opacity:.5});t.add(_);let R=[{t:3,title:"End of turn"},{t:4.25,title:"Backchannel"},{t:5.45,title:"Interrupt \u2192 yield"},{t:8,title:"End of turn"}].map(A=>{let H=e.line(2,{width:1.1,color:n.ink,opacity:.4});return t.add(H),{...A,l:H}}),T=Xe(i);return{update({t:A,age:H,dt:z,presence:u}){let f=we(i),d=Q(i),S=T(z),k=i.particles,O=Math.PI*.75+oe.MathUtils.degToRad(d.rotation+d.spin*H),V=L=>O+L/o*P,F=d.radius*r;v(d.wordLength,d.wordGap,d.pauses);let I=H<o,U=I?Math.min(c,Math.floor(A/o*c)+1):c,G=L=>1-(1-d.previous)*(((A-L)%o+o)%o)/o,B=e.linear(d.lineColor),X=e.linear(n.bg),ae=Math.round(d.cycles);for(let L=0;L<U;L++){let ee=V(L/c*o);m[L*3]=Math.cos(ee)*F,m[L*3+1]=.015+E[L]*d.height*Math.sin(ae*(ee-O)),m[L*3+2]=Math.sin(ee)*F;let ce=G(L/c*o);for(let te=0;te<3;te++)b[L*3+te]=D(X[te],B[te],ce)}w.forEach(([L,ee],ce)=>{if(ce>=M)return;let te=p[ce],Te=Math.min(ee+1,U);if(Te-L<2){te.opacity=0;return}te.setPoints(m.subarray(L*3,Te*3),b.subarray(L*3,Te*3)),te.material.linewidth=d.lineWidth,te.opacity=d.lineOpacity*u*(1-S)});for(let L=w.length;L<M;L++)p[L].opacity=0;for(let L=0;L<c;L++){if(L>=U||!h[L]&&S<.01){y.color[L*4+3]=0;continue}let ee=g[L];me(k,ee,A,o,x);let ce=V(L/c*o),te=h[L]?q(f.accent,f.high,.15):f.ink,Te=h[L]?d.dotOpacity:d.lineOpacity*.75*S;y.set(L,Math.cos(ce)*(F+x[0]),m[L*3+1]+x[1],Math.sin(ce)*(F+x[0]),k.size*ee.s,te,Te*u*G(L/c*o))}y.commit(),Ft(l,240,F,.015,()=>0),a.setPoints(l),a.opacity=d.guide?d.guideOpacity*u:0;let de=V(A);_.setPoints([s(F-d.playheadLength,de),s(F+d.playheadLength,de)]),_.material.linewidth=d.playheadWidth,_.material.color.set(d.playheadColor),_.opacity=d.playhead?d.playheadOpacity*u:0,R.forEach(L=>{let ee=I&&A<=L.t?0:u*G(L.t)*(I?We((A-L.t)/.3):1);L.l.setPoints([s(F+.12,V(L.t)),s(F+.12+d.markerLength,V(L.t))]),L.l.material.linewidth=d.markerWidth,L.l.material.color.set(d.markerColor),L.l.opacity=d.markers?d.markerOpacity*ee:0});let ue=$e(A,"caller",d.wordLength,d.wordGap,d.pauses),Se=$e(A,"agent",d.wordLength,d.wordGap,d.pauses),He=ft.some(L=>L.who==="agent"&&A>=L.a&&A<=Math.min(L.b,5.52));i.orb.state=Se>0||He?"speaking":"listening",i.orb.listen=ue,i.orb.speak=Se}}}},Ti={rings:{value:5,min:1,max:9,step:1,rebuild:!0},inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.2,min:.05,max:.6,step:.01,label:"ring spacing",rebuild:!0},tilt:{value:24,min:0,max:60,step:1,label:"max tilt \xB0",rebuild:!0},speed:{value:1,min:0,max:4,step:1,label:"turns / loop"},comets:{value:1,min:0,max:4,step:1,label:"comets per ring"},cometSpeed:{value:3,min:1,max:8,step:1,label:"comet turns / loop"},comet:{value:.9,min:.1,max:3,step:.05,label:"comet length"},opacity:{value:.42,min:0,max:1,step:.01,label:"ring opacity"},cometOpacity:{value:1,min:0,max:1,step:.01,label:"comet opacity"},...xe},Oi={duration:9,orb:"thinking",params:Ti,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=Math.round(o.rings),a=Ct(17),l=0,c=Array.from({length:s},(y,g)=>{let E=oe.MathUtils.degToRad(o.tilt)*(.35+.65*N(g*3.7+1)),h=g/s*Math.PI+N(g*1.9)*.6,w=new oe.Quaternion().setFromEuler(new oe.Euler(E,h,0,"YXZ")),C=new oe.Vector3(1,0,0).applyQuaternion(w),v=new oe.Vector3(0,0,1).applyQuaternion(w),m=new oe.Vector3(0,1,0).applyQuaternion(w),x=n*o.inner+g*o.spacing,_=Be(i,x),R=Array.from({length:_},(T,A)=>({a:A/_*P+(a()-.5)*(P/_),g:he(l+A)}));return l+=_,{ax:C,ay:v,n:m,r:x,dir:g%2?-1:1,phase:N(g*5.3)*P,dots:R}}),M=e.particles(l);t.add(M);let p=new oe.Vector3,b=[0,0];return{update({t:y,presence:g}){let E=we(i),h=Q(i),w=i.particles,C=Math.round(h.comets),v=0;c.forEach((m,x)=>{let _=m.dir*(P*y*Math.round(h.speed)*(1+x%2))/r,R=m.phase+m.dir*(P*y*Math.round(h.cometSpeed))/r;for(let T of m.dots){let A=T.a+_;me(w,T.g,y,r,b);let H=m.r*D(.85,1,We(g))+b[0];p.set(0,n,0).addScaledVector(m.ax,Math.cos(A)*H).addScaledVector(m.ay,Math.sin(A)*H).addScaledVector(m.n,b[1]-w.scatter*.5);let z=0;for(let f=0;f<C;f++){let d=((R+f*P/Math.max(1,C)-A)*m.dir%P+P)%P;z=Math.max(z,Math.exp(-d/(h.comet*.35)))}let u=W(0,.12,p.y)*(Dt(p.x,p.y,p.z,n)?0:1)*g;M.set(v++,p.x,p.y,p.z,w.size*D(1,w.emphasis,z)*T.g.s,q(E.ink,q(E.accent,E.high,z),Math.min(1,.35+z)),D(h.opacity,h.cometOpacity,z)*u)}}),M.commit()}}}},Pi={outer:{value:3.6,min:2,max:5,step:.05,label:"arm reach",rebuild:!0},swirl:{value:-60,min:-180,max:180,step:1,label:"arm swirl \xB0",rebuild:!0},lanes:{value:9,min:1,max:15,step:1,rebuild:!0},width:{value:.45,min:.05,max:1,step:.01,label:"ribbon width",rebuild:!0},loops:{value:1,min:1,max:3,step:1,label:"passes / loop"},height:{value:.32,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:70,min:10,max:200,step:1,label:"wave cycles"},phrases:{value:5,min:1,max:12,step:1,label:"phrases"},dive:{value:.7,min:0,max:1.2,step:.01,label:"dive into orb \xD7orb"},opacity:{value:.6,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:1,min:0,max:1,step:.01,label:"crest opacity"},...xe},zi={duration:9,orb:"speaking",params:Pi,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=n*.9,a=o.outer,l=oe.MathUtils.degToRad(o.swirl),c=Math.PI*.75,M=(m,x)=>{let _=m<.5,R=_?m*2:(1-m)*2;return x[0]=D(a,s,R),x[1]=c+(_?0:Math.PI)+l*R,x[2]=n*o.dive*W(.7,1,R),x[3]=R,x},p=[0,0,0,0],b=[0,0,0,0],y=0;for(let m=0;m<400;m++)M(m/400,p),M((m+1)/400,b),m!==199&&(y+=Math.hypot(b[0]*Math.cos(b[1])-p[0]*Math.cos(p[1]),b[0]*Math.sin(b[1])-p[0]*Math.sin(p[1]),b[2]-p[2]));let g=Math.round(o.lanes),E=Math.max(60,Math.round(y*It*i.particles.density)),h=[];for(let m=0;m<g;m++){let x=g>1?(m/(g-1)-.5)*o.width:0,_=N(m*7.3)/E;for(let R=0;R<E;R++)h.push({u:R/E+_,w:x,g:he(h.length)})}let w=e.particles(h.length);t.add(w);let C=[0,0],v=[0,0,0,0];return{update({t:m,presence:x}){let _=we(i),R=Q(i),T=i.particles,A=Math.round(R.loops)*m/r,H=Math.round(R.phrases),z=f=>{let d=f*H,S=Math.floor(d),k=d-S;return(k>.8?0:Math.pow(Math.sin(Math.PI*k/.8),.8)*(.6+.4*N(S*4.7+1)))*(.5+.5*Math.sin(P*R.cycles*f))},u=0;for(let f=0;f<h.length;f++){let d=h[f],S=((d.u+A)%1+1)%1;M(S,v),me(T,d.g,m,r,C);let k=v[0]+(d.w*(1-v[3]*.6)+C[0]),O=z((d.u%1+1)%1),V=Math.cos(v[1])*k,F=Math.sin(v[1])*k,I=.02+C[1]+v[2]+R.height*O*(1-W(.75,1,v[3])),U=W(0,.15,v[3])*(Dt(V,I,F,n)?0:1),G=S<.5?.55+.45*O:.75+.25*O,B=q(_.ink,q(_.accent,_.high,O),G);w.set(f,V,I,F,T.size*D(1,T.emphasis,O)*d.g.s,B,D(R.opacity,R.crestOpacity,O)*U*x),S>=.5&&v[3]>.85&&(u=Math.max(u,O))}w.commit(),i.orb.speak=.35+.55*u,i.orb.listen=.4}}}},Li={steps:{value:4,min:2,max:6,step:1,rebuild:!0},inner:{value:1.4,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.5,min:.15,max:1.2,step:.01,label:"ring spacing",rebuild:!0},start:{value:135,min:0,max:360,step:1,label:"start angle \xB0"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},opacity:{value:.32,min:0,max:1,step:.01,label:"ring opacity"},litOpacity:{value:.95,min:0,max:1,step:.01,label:"comet opacity"},doneOpacity:{value:.7,min:0,max:1,step:.01,label:"done opacity"},comet:{value:.5,min:.05,max:2,step:.01,label:"comet length"},flash:{value:.6,min:0,max:2,step:.01,label:"check flash"},...xe},Hi={duration:10,orb:"thinking",params:Li,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=Math.round(o.steps),a=Array.from({length:s},(g,E)=>n*o.inner+E*o.spacing),l=a.map(g=>Be(i,g)),c=[],M=a.map(()=>0);a.forEach((g,E)=>{M[E]=c.length;for(let h=0;h<l[E];h++)c.push({ring:E,j:h,a:h/l[E]*P,g:he(c.length)})});let p=e.particles(c.length);t.add(p);let b=8.4/s,y=[0,0];return{update({t:g,age:E,presence:h,loopOut:w}){let C=we(i),v=Q(i),m=i.particles,x=oe.MathUtils.degToRad(v.start),_=w?1-W(9.2,9.9,g):1,R=a.map((z,u)=>{let f=.3+u*b,d=se((g-f)/(b*.65)),S=g>f+b*.65?Math.exp(-(g-f-b*.65)/.25):0;return{run:d,flash:S,active:g>=f&&g<f+b*.65}}),T=a.map((z,u)=>(u%2?-1:1)*Vt(v.ringSpeed,z,l[u],r)),A=T.map((z,u)=>z*(P/l[u])*g/r),H=Math.round((E-g)/r);for(let z=0;z<c.length;z++){let{ring:u,j:f}=c[z],d=c[Ut(M[u],l[u],f,T[u],H)].g,S=R[u],k=c[z].a+A[u];me(m,d,g,r,y);let O=a[u]+y[0],V=((k-x)%P+P)%P/P,F=V<=S.run?1:0,I=S.run-V,U=S.active&&I>=0?Math.exp(-I/(v.comet*.12)):0,G=Math.max(U,F*(S.run>=1?1:.55)),B=S.flash*v.flash*_,X=m.size*D(1,m.emphasis,Math.max(U,F*.5)*_)*d.s*(1+B*.4),ae=Math.max(v.opacity,D(v.opacity,Math.max(F*(S.run>=1?v.doneOpacity:v.doneOpacity*.8),U*v.litOpacity),_))*(1+B*.4),de=q(C.ink,q(C.accent,C.high,U*.5),Math.min(1,G/.02)*_);p.set(z,Math.cos(k)*O,.02+y[1]+B*.05,Math.sin(k)*O,X,de,Math.min(1,ae)*h)}p.commit()}}}},Fi={spacing:{value:.14,min:.05,max:.4,step:.005,label:"ring spacing",rebuild:!0},inner:{value:1.2,min:1,max:2,step:.01,label:"inner radius \xD7orb",rebuild:!0},outer:{value:3.7,min:2,max:5.5,step:.05,label:"outer radius",rebuild:!0},height:{value:.3,min:0,max:.8,step:.005,label:"wave height"},waves:{value:5,min:1,max:16,step:1,label:"waves / loop"},wavelength:{value:.55,min:.15,max:2,step:.01},hold:{value:.55,min:.05,max:.95,step:.01,label:"crest hold"},crestColor:{value:1,min:0,max:1,step:.01,label:"crest colour"},phrase:{value:1.5,min:.3,max:4,step:.05,label:"phrase s"},pause:{value:.5,min:0,max:2,step:.05,label:"pause s"},swell:{value:.35,min:0,max:1,step:.01,label:"phrase variation"},drift:{value:1,min:0,max:4,step:1,label:"drift turns / loop"},spokenFrom:{value:2.2,min:0,max:9,step:.1,label:"spoken from s"},spokenTo:{value:3.6,min:0,max:9,step:.1,label:"spoken by s"},decay:{value:.5,min:0,max:1,step:.01,label:"height decay"},opacity:{value:.3,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:.95,min:0,max:1,step:.01,label:"crest opacity"},...xe},Di={duration:10,orb:"speaking",params:Fi,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=n*o.inner,a=[];for(let b=s,y=0;b<=o.outer;b+=o.spacing,y++){let g=Be(i,b),E=N(b*13.1)*P;for(let h=0;h<g;h++)a.push({r:b,a:E+h/g*P,ring:y,g:he(a.length)})}let l=a.length,c=e.particles(l);t.add(c);let M=[0,0],p=Xe(i);return{update({t:b,dt:y,presence:g}){let E=we(i),h=Q(i),w=i.particles,C=p(y),v=u=>D(W(h.spokenFrom,Math.max(h.spokenFrom+.01,h.spokenTo),u),1,C)*(1-W(8.4,9.8,u)),m=Math.round(h.waves),x=m*h.wavelength/r,_=o.outer-s,R=h.phrase+h.pause,T=u=>{let f=Math.floor(u/R),d=(u-f*R)/h.phrase;return d>1?0:Math.pow(Math.sin(Math.PI*d),.9)*(1-h.swell+h.swell*N(f*4.7+1))},A=P*Math.round(h.drift)*b/r;for(let u=0;u<l;u++){let{r:f,ring:d,g:S}=a[u],k=f-s;me(w,S,b,r,M);let O=f+M[0],V=a[u].a+(d%2?-A:A)*(.4+.6*(s/f)),F=k/h.wavelength-m*b/r,I=((b-k/x)%r+r)%r,U=v(I),G=.5+.5*Math.sin(P*F),B=W(1-h.hold,1-h.hold*.35,G),X=D(.75*B,B*T(I),U)*(1-h.decay*(k/_)),ae=W(0,.25,k)*(1-W(_*.7,_,k)),de=q(E.accent,E.high,Math.min(1,B*.35+U*.3)),ue=q(E.ink,de,Math.min(1,X*1.6)*h.crestColor);c.set(u,Math.cos(V)*O,.02+M[1]+h.height*X,Math.sin(V)*O,w.size*D(1,w.emphasis,X)*S.s,ue,D(h.opacity,h.crestOpacity,X)*ae*g)}c.commit();let H=v(b),z=D(.5,Ee(b,5),H);i.orb.speak=z}}}},Ii={inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.4,min:.1,max:1,step:.01,label:"ring spacing",rebuild:!0},height:{value:.24,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:1,min:.25,max:3,step:.05,label:"wave density"},drift:{value:1,min:-4,max:4,step:1,label:"drift / loop"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},fade:{value:.35,min:.05,max:.9,step:.01,label:"unmute s"},lead:{value:.8,min:0,max:3,step:.05,label:"all muted s"},tail:{value:.6,min:0,max:3,step:.05,label:"muted at end s"},opacity:{value:.32,min:0,max:1,step:.01,label:"muted opacity"},activeOpacity:{value:1,min:0,max:1,step:.01,label:"voice opacity"},tint:{value:!0,label:"tint orb per voice"},...xe},bn=[{cycles:18,peak:1},{cycles:28,peak:1.8},{cycles:12,peak:.8},{cycles:34,peak:2.4},{cycles:22,peak:1.3}],Vi={duration:10,orb:"speaking",params:Ii,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=zt.length,a=Array.from({length:s},(y,g)=>n*o.inner+g*o.spacing),l=a.map(y=>Be(i,y)),c=[],M=a.map(()=>0);a.forEach((y,g)=>{M[g]=c.length;for(let E=0;E<l[g];E++)c.push({ring:g,j:E,a:E/l[g]*P,g:he(c.length)})});let p=e.particles(c.length);t.add(p);let b=[0,0];return{update({t:y,age:g,presence:E}){let h=we(i),w=Q(i),C=i.particles,v=Math.max(1,r-w.lead-w.tail),m=v/s,x=y-w.lead,_=x>=0&&x<v?Math.min(s-1,Math.floor(x/m)):-1,R=x-_*m,T=a.map((S,k)=>k===_?Mt(R,0,m,w.fade,w.fade):0),A=a.map((S,k)=>.3+.7*Ee(y,k*5)),H=P*y*w.drift/r,z=a.map((S,k)=>(k%2?-1:1)*Vt(w.ringSpeed,S,l[k],r)),u=z.map((S,k)=>S*(P/l[k])*y/r),f=Math.round((g-y)/r);for(let S=0;S<c.length;S++){let{ring:k,j:O,a:V}=c[S],F=c[Ut(M[k],l[k],O,z[k],f)].g;me(C,F,y,r,b);let I=a[k]+b[0],U=T[k],G=bn[k%bn.length],B=.5+.5*Math.sin(Math.round(G.cycles*w.cycles)*V-H*(k%2?-1:1)),X=U*Math.pow(B,G.peak)*A[k],ae=V+u[k];p.set(S,Math.cos(ae)*I,.02+b[1]+w.height*X,Math.sin(ae)*I,C.size*D(1,C.emphasis,U*B)*F.s,q(h.ink,q(h.accent,h.high,X),U),D(w.opacity,w.activeOpacity,U*(.45+.55*B))*E)}p.commit();let d=_<0?0:Ee(y,_*5)*T[_];i.orb.speak=d,i.orb.tint=w.tint&&_>=0?zt[_]:null}}}},Ui={rotation:{value:0,min:-180,max:180,step:1,label:"rotation \xB0"},radius:{value:1.95,min:1.2,max:3.5,step:.01,label:"radius \xD7orb"},height:{value:.24,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:72,min:8,max:200,step:1,label:"wave cycles"},previous:{value:.3,min:0,max:1,step:.01,label:"older audio"},opacity:{value:.45,min:0,max:1,step:.01,label:"unrecognised opacity"},litOpacity:{value:1,min:0,max:1,step:.01,label:"recognised opacity"},hiss:{value:.05,min:0,max:.3,step:.005,label:"line hiss"},ripple:{value:.8,min:0,max:2,step:.01,label:"detect ripple"},...xe},bt=[{kind:"menu",a:.5,b:4.1,detect:2.1},{kind:"voicemail",a:5,b:8.5,detect:8.05}];function yn(i,e){e.v=0,e.seg=-1,e.tone=0;for(let t=0;t<bt.length;t++){let n=bt[t];if(i<n.a||i>n.b)continue;e.seg=t;let r=i-n.a,o=Math.min(1,r/.05,(n.b-i)/.05);if(n.kind==="menu"){let s=r%.42/.3;e.v=s>1?0:.78*Math.min(1,Math.sin(Math.PI*s)*2.4)*o}else i<7.6?e.v=(.35+.35*Ee(r,9))*o:i>7.85&&(e.v=.95*o,e.tone=1);return e}return e}var Bi={duration:10,orb:"listening",params:Ui,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Math.max(400,Math.round(1500*i.particles.density)),s=e.particles(o);t.add(s);let a=Array.from({length:o},(p,b)=>he(b)),l={v:0,seg:-1,tone:0},c=[0,0],M=Xe(i);return{update({t:p,age:b,dt:y,presence:g}){let E=M(y),h=we(i),w=Q(i),C=i.particles,v=w.radius*n,m=Math.PI*.75+oe.MathUtils.degToRad(w.rotation),x=b<r,_=Math.round(w.cycles);for(let R=0;R<o;R++){let T=R/o,A=T*r,H=p-A;if(x&&H<0){s.color[R*4+3]=0;continue}let z=(H%r+r)%r;yn(z,l);let u=l.seg>=0?bt[l.seg]:null,f=u?H-z+u.detect:1/0,d=u&&p>=f?We((p-f)/.35):0,S=1-(1-w.previous)*T,k=a[R];me(C,k,p,r,c);let O=m-T*P,V=w.hiss*(N(R*1.37+Math.floor(p*14))-.5),F=l.tone?3:1,I=.015+c[1]+(l.v*w.height*Math.sin(_/F*T*P)+(l.v?0:V)),U=q(h.ink,q(h.accent,h.high,l.tone*.5),d),G=D(w.opacity*(l.v?1:.7),w.litOpacity,d)*S*g,B=E*(R%3-1)*.11;s.set(R,Math.cos(O)*(v+B+c[0]),I,Math.sin(O)*(v+B+c[0]),C.size*D(1,C.emphasis,d*l.v)*k.s,U,G)}s.commit();for(let R of bt){let T=p-R.detect;T<0||T>1.6||i.floor.ripple({radius:n*1.1+T*2.2,strength:w.ripple*(1-T/1.6),width:.35,kind:1})}yn(p,l),i.orb.listen=l.v,i.orb.speak=0}}}},ji={radius:{value:2.1,min:1.4,max:3.5,step:.01,label:"harness radius \xD7orb",rebuild:!0},ringSpeed:{value:.2,min:0,max:2,step:.01,label:"ring speed"},opacity:{value:.3,min:0,max:1,step:.01,label:"ring opacity"},nodeSize:{value:.3,min:.1,max:.8,step:.01,label:"node radius",rebuild:!0},nodeOpacity:{value:.55,min:0,max:1,step:.01,label:"idle node opacity"},arc:{value:.45,min:0,max:1.5,step:.01,label:"comet arc height"},comet:{value:.32,min:.05,max:1,step:.01,label:"comet length"},ripple:{value:.7,min:0,max:2,step:.01,label:"node ripple"},...xe},Gi={query:-112,retrieval:-28,flow:58},Ni={duration:Lt,orb:"thinking",params:ji,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=Lt,o=Q(i),s=n*o.radius,a=Be(i,s),l=Array.from({length:a},(h,w)=>({a:w/a*P,g:he(w)})),c=fn(i.camera),M=Pe.map((h,w)=>{let C=oe.MathUtils.degToRad(Gi[h]),v=c.floorRight.clone().multiplyScalar(Math.cos(C)).addScaledVector(c.floorFront,Math.sin(C)).normalize(),m=Math.max(18,Math.round(P*o.nodeSize*It*1.4*i.particles.density));return{part:h,dir:v,n:m,g:Array.from({length:m},(x,_)=>he(5e3+w*200+_))}}),p=34,b=a+M.reduce((h,w)=>h+w.n+1,0)+p*Pe.length,y=e.particles(b);t.add(y);let g=[0,0],E=Xe(i);return{update({t:h,age:w,dt:C,presence:v}){let m=we(i),x=Q(i),_=E(C),R=i.particles,T=0,A=Vt(x.ringSpeed,s,a,r),H=A*(P/a)*h/r,z=Math.round((w-h)/r),u=Pe.map(f=>vt(f,h));for(let f=0;f<a;f++){let d=l[Ut(0,a,f,A,z)].g;me(R,d,h,r,g);let S=l[f].a+H,k=Math.cos(S),O=Math.sin(S),V=0;M.forEach((I,U)=>V=Math.max(V,u[U]*Math.pow(Math.max(0,k*I.dir.x+O*I.dir.z),18)));let F=_*Math.pow(.5+.5*Math.sin(l[f].a*9-P*3*h/r),2);y.set(T++,k*(s+g[0]),.02+g[1]+.09*F,O*(s+g[0]),R.size*d.s,q(m.ink,m.accent,Math.max(V,F*.6)),D(x.opacity,.9,Math.max(V,F*.5))*v)}M.forEach((f,d)=>{let S=u[d],k=f.dir.x*s,O=f.dir.z*s,V=o.nodeSize*(1+.25*S),F=P*h*(d%2?-1:1)/r;for(let I=0;I<f.n;I++){let U=f.g[I];me(R,U,h,r,g);let G=I/f.n*P+F;y.set(T++,k+Math.cos(G)*(V+g[0]*.5),.03+g[1]+S*.12,O+Math.sin(G)*(V+g[0]*.5),R.size*D(1,R.emphasis,S)*U.s,q(m.ink,q(m.accent,m.high,S*.4),Math.min(1,.15+S)),D(x.nodeOpacity,1,S)*v)}y.set(T++,k,.05+S*.12,O,R.size*D(1.6,2.6,S),q(m.ink,m.accent,Math.min(1,.25+S)),D(.7,1,S)*v),S>.01&&i.floor.ripple({x:k,z:O,radius:V+.15+(1-S)*.5,strength:x.ripple*S,width:.18,kind:1})}),Pe.forEach((f,d)=>{let S=M[d],k=Ht.find(O=>O.part===f&&h>=O.t&&h<=O.t+gt+x.comet);for(let O=0;O<p;O++){if(!k){y.set(T++,0,0,0,0,m.ink,0);continue}let V=O/p*x.comet,F=(h-k.t-V)/gt;if(F<0||F>1){y.set(T++,0,0,0,0,m.ink,0);continue}let I=k.dir==="out"?se(F):1-se(F),U=D(n*1.05,s-o.nodeSize,I),G=1-O/p,B=_*.16*Math.sin(P*(I*3-h*1.5))*Math.sin(Math.PI*I);y.set(T++,S.dir.x*U-S.dir.z*B,.04+Math.sin(Math.PI*I)*x.arc*(1-_*.6),S.dir.z*U+S.dir.x*B,R.size*D(1,R.emphasis*1.2,G)*(.6+.4*G),q(m.accent,m.high,G),G*v)}}),y.commit(),i.floor.glow(.15*Math.max(...u))}}}},Wi={spacing:{value:.15,min:.05,max:.4,step:.005,label:"ring spacing",rebuild:!0},inner:{value:1.2,min:1,max:2,step:.01,label:"inner radius \xD7orb",rebuild:!0},outer:{value:3.6,min:2,max:5.5,step:.05,label:"outer radius",rebuild:!0},fence:{value:2.2,min:1.4,max:3.2,step:.01,label:"fence radius \xD7orb"},height:{value:.2,min:0,max:.8,step:.005,label:"wave height"},spike:{value:2.2,min:0,max:4,step:.05,label:"spike \xD7"},spikeChance:{value:.35,min:0,max:1,step:.01,label:"spike chance"},waves:{value:5,min:1,max:12,step:1,label:"waves / loop"},wavelength:{value:.6,min:.15,max:2,step:.01},opacity:{value:.22,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:.95,min:0,max:1,step:.01,label:"crest opacity"},fenceOpacity:{value:.42,min:0,max:1,step:.01,label:"fence opacity"},...xe},qi={duration:10,orb:"speaking",params:Wi,create(i){let{kit:e,group:t,look:n}=i,r=i.orbRadius,o=10,s=Q(i),a=r*s.inner,l=[];for(let h=a,w=0;h<=s.outer;h+=s.spacing,w++){let C=Be(i,h),v=N(h*7.7)*P;for(let m=0;m<C;m++)l.push({r:h,a:v+m/C*P,ring:w,g:he(l.length)})}let c=l.length,M=e.particles(c);t.add(M);let p=e.line(240,{width:1,color:n.ink,opacity:.3,dashed:!0,dash:.05,gap:.07}),b=e.line(240,{width:1,color:n.ink,opacity:.3,dashed:!0,dash:.05,gap:.07});t.add(p,b);let y=new Float32Array(720),g=14,E=[0,0];return{update({t:h,presence:w}){let C=we(i),v=Q(i),m=i.particles,x=r*v.fence,_=Math.round(v.waves),R=v.height*1.05,T=0;for(let A=0;A<c;A++){let{r:H,a:z,ring:u,g:f}=l[A];me(m,f,h,o,E);let d=H+E[0],S=z+(u%2?-1:1)*(P*h/o)*.25*(a/H),k=(H-a)/v.wavelength-_*h/o,O=Math.floor(k),V=.5+.5*Math.sin(P*k),F=W(.4,.95,V),I=(O%_+_)%_,U=Math.floor((S%P+P)%P/(P/g)),G=(S%P+P)%P/(P/g)-U,B=N(I*13.1+U*3.7)<v.spikeChance?Math.pow(Math.sin(Math.PI*G),2):0,X=W(x-.05,x+.15,H),ae=Math.exp(-Math.pow((H-x)/.12,2)),de=B*F*(1-X),ue=B*F*ae;T=Math.max(T,ue);let Se=W(0,.2,H-a)*(1-W(s.outer-.9,s.outer,H)),He=.02+E[1]+Math.min(v.height*F*(1+v.spike*de),X>.5?R:1/0),L=Math.max(F*D(.35,1,X)*(1-de),ue),ee=q(C.ink,q(C.accent,C.high,ue),Math.min(1,L*1.4)),ce=D(v.opacity,v.crestOpacity,Math.max(F,ue))*Se*w;M.set(A,Math.cos(S)*d,He,Math.sin(S)*d,m.size*D(1,m.emphasis,Math.max(F*X,ue))*f.s,ee,ce)}M.commit(),Ft(y,240,x,.015,()=>0),p.setPoints(y),Ft(y,240,x,.015+R,()=>0),b.setPoints(y),p.opacity=v.fenceOpacity*w,b.opacity=v.fenceOpacity*.6*w,i.floor.ripple({radius:x,strength:.25*T*w,width:.2,kind:2}),i.orb.speak=.4+.5*Ee(h,4)}}}},Ye={id:"particles",name:"Particles",tagline:"Rings of particles",description:"Crisp particles around the orb: rings of dust, waves and dots that carry each model's job \u2014 clearing noise, taking turns, orbiting thought, stepping the call forward, speaking.",preset:{background:"#F6F6F8",grid:{style:"lines",color:"#1A1C22",opacity:.06,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.3,contactShadow:.8,camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"}},scenes:{denoise:_i,turns:Ai,ivr:Bi,llm:Oi,s2s:zi,harness:Ni,flow:Hi,colloquial:Di,guardrails:qi,voices:Vi}};var Qe={line:Ye,particles:Ye};var Re=[{id:"listen",title:"Speech perception",blurb:"Detect speech, recognize call conditions, and determine when to listen, wait, or respond.",scenes:["denoise","turns","ivr"],s2s:["denoise","turns","ivr"]},{id:"think",title:"Reasoning & orchestration",blurb:"Bring together models, knowledge, and tools to move every conversation forward.",scenes:["llm","harness"],s2s:["s2s","harness"]},{id:"speak",title:"Response generation",blurb:"Deliver clear, natural responses shaped for live conversation.",scenes:["colloquial","guardrails"],s2s:["colloquial"]}],ze={denoise:{step:"listen",title:"Denoising Model",tab:"Denoising"},turns:{step:"listen",title:"Turn-Taking Model",tab:"Turn-taking"},ivr:{step:"listen",title:"Voicemail & IVR Detection",tab:"Voicemail & IVR"},llm:{step:"think",title:"Tell-1",tab:"Tell-1"},s2s:{step:"think",title:"Speech-to-speech model",tab:"Speech-to-speech"},harness:{step:"think",title:"Retell Agent Harness",tab:"Agent harness"},flow:{step:"think",title:"Conversation flow",tab:"Flow"},colloquial:{step:"speak",title:"Colloquial Rewrite Model",tab:"Colloquial rewrite",s2s:{title:"Spoken response",tab:"Spoken response"}},guardrails:{step:"speak",title:"Response Guardrails",tab:"Guardrails"},voices:{step:"speak",title:"Retell voices",tab:"Voices"}},Le=(i,e="cascaded")=>{let t=Re.find(n=>n.id===i);return e==="s2s"?t.s2s:t.scenes},yt=(i="cascaded")=>Re.flatMap(e=>Le(e.id,i)),wn=(i,e="cascaded")=>e==="s2s"&&ze[i].s2s||ze[i],ro=yt("cascaded");var xn=["size","emphasis","density","scatter","idle","idleSpeed","muted","active","highlight"],Sn=i=>Object.fromEntries(Object.entries(i).map(([e,t])=>[e,t.value]));function En(){return""}var Bt={direction:"line",scene:"denoise",playing:!0,arch:"cascaded",speed:1,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#3E6AEF",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3.4,fadeOuter:8},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35,looks:Yt},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"},lines:{width:1.3,emphasis:1.25,muted:"#1A1C22",active:"#3E6AEF"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{}},kn=i=>!!i&&typeof i=="object"&&!Array.isArray(i);function Ae(i,e){if(!e)return structuredClone(i);let t=structuredClone(i);for(let[n,r]of Object.entries(e))r!==void 0&&(t[n]=kn(r)&&kn(t[n])?Ae(t[n],r):r);return t}function Mn(i,e){return Ae(Ae(Bt,i),{direction:e})}var Cn=J.MathUtils.degToRad,wt=class{constructor(e,t={}){this.scene=new J.Scene;this.camera=new J.OrthographicCamera(-1,1,1,-1,.1,200);this.floor=new nt;this.resolution=new J.Vector2(1,1);this.pointScale={value:1};this.active=[];this.raf=0;this.last=0;this.w=1;this.h=1;this.dpr=1;this.viewH=5;this.onScreen=!0;this.listeners={scene:new Set,loop:new Set};this.frozen=!1;this.morph=null;this.morphFrom=null;this.lookKey="";this.loaded=!1;this.shown=!1;this.loop=e=>{this.raf=requestAnimationFrame(this.loop);let t=Math.max(0,Math.min((e-this.last)/1e3,.1));this.last=e,!(this.frozen||!this.onScreen||!this.loaded)&&(this.step(this.config.playing?t*this.config.speed:0),this.render(),this.shown||(this.shown=!0,this.renderer.domElement.style.opacity="1"),this.onFrame?.())};this.container=e,this.config=Ae(Bt,t),this.direction=Qe[this.config.direction],this.renderer=new J.WebGLRenderer({antialias:!0,alpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),this.renderer.outputColorSpace=J.SRGBColorSpace;let n=this.renderer.domElement;n.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 0.9s cubic-bezier(.2,.7,.2,1)",e.appendChild(n),this.orb=new et({...this.config.orb}),this.scene.add(this.floor.mesh,this.orb.group),this.ro=new ResizeObserver(()=>this.resize()),this.io=new IntersectionObserver(([s])=>this.onScreen=s.isIntersecting),this.io.observe(e),this.ro.observe(e),this.resize(),this.applyConfig({},!0),this.setScene(this.config.scene,{instant:!0});let r=new Promise(s=>setTimeout(s,5e3)),o=this.renderer.compileAsync(this.scene,this.camera).then(()=>{},()=>{});this.ready=Promise.race([o,r]).then(()=>{this.loaded=!0}),this.last=performance.now(),this.raf=requestAnimationFrame(this.loop)}on(e,t){return this.listeners[e].add(t),()=>this.listeners[e].delete(t)}emit(e,...t){this.listeners[e].forEach(n=>n(...t))}get look(){let e=this.config;return{bg:e.background,ink:e.ink,accent:e.accent,orbMid:e.orb.mid,orbHigh:e.orb.highlight,line:e.grid.color}}sceneParams(e){let t=this.direction.scenes[e].params;return{...t?Sn(t):{},...this.config.sceneParams?.[e]??{}}}applyConfig(e,t=!1){let n=this.config.direction,r=this.config.scene,o=this.sceneParams(r),s=this.config.particles?.density;this.config=Ae(this.config,e);let a=this.config;this.renderer.setClearColor(a.background,1),this.orb.setParams(a.orb),this.floor.setLook({...a.grid,glowColor:a.orb.mid,glow:a.floorGlow,shadow:a.contactShadow,shadowColor:a.contactColor,accent:a.accent},a.orb.radius),this.layoutCamera(),a.direction!==n?(this.direction=Qe[a.direction],this.setScene(a.scene,{instant:!1,force:!0})):a.scene!==r&&this.setScene(a.scene),a.direction===n&&s!==void 0&&a.particles.density!==s&&this.setScene(a.scene,{instant:!0,force:!0});let l=this.direction.scenes[a.scene].params;if(l&&a.scene===r&&a.direction===n){let M=this.sceneParams(a.scene);Object.entries(l).some(([p,b])=>b.rebuild&&M[p]!==o[p])&&this.setScene(a.scene,{instant:!0,force:!0})}let c=JSON.stringify(this.look)+a.orb.radius;if(c!==this.lookKey){let M=this.lookKey!=="";this.lookKey=c,M&&!t&&a.direction===n&&this.setScene(a.scene,{instant:!0,force:!0})}}setScene(e,t={}){let n=this.active.find(x=>!x.leaving);if(n&&n.id===e&&!t.force&&n.def===this.direction.scenes[e])return;this.config.scene=e;let r=null,o=null;!t.instant&&this.config.transition.morph&&n&&n.def.morph!==!1&&this.direction.scenes[e].morph!==!1&&(this.morph?r=mn([...Ze(n.group),...Ze(this.morph.group)],this.pxScale):(r=mt(Ze(n.group)),o=n)),this.endMorph();for(let x of this.active)x.leaving||(x.leaving=!0,x.endAt=(Math.floor(x.age/x.def.duration)+1)*x.def.duration,Fe.killTweensOf(x.scope),t.instant?this.disposeActive(x):Fe.to(x.scope,{presence:0,duration:.55,ease:"power2.in",onComplete:()=>this.disposeActive(x)}));t.instant&&(this.active=this.active.filter(x=>!x.leaving));let s=this.direction.scenes[e],a=new J.Group;a.name=`scene:${this.direction.id}:${e}`,this.scene.add(a);let l={presence:t.instant?1:0},c={state:s.orb,listen:0,speak:0},M=this.floor,p=this,b=this.direction,y=this.sceneParams(e),E={group:a,floor:{ripple:x=>this.floor.ripple({...x,strength:x.strength*l.presence}),tile:x=>this.floor.tile({...x,strength:x.strength*l.presence}),glow:x=>this.floor.glowAdd+=x*l.presence,get cell(){return M.cell}},orb:c,orbRadius:this.config.orb.radius,look:this.look,kit:new dt(this.look,this.resolution,this.pointScale),camera:this.camera,get params(){return p.direction===b&&(y=p.sceneParams(e)),y},get particles(){let x=p.config.particles,_=this.params,R=null;for(let T of xn)_[`own_${T}`]!==!0||_[`p_${T}`]===void 0||(R??(R={...x}),R[T]=_[`p_${T}`]);return R??x},get lines(){return p.config.lines},get hueShift(){return p.orb.hueShift},get arch(){return p.config.arch??"cascaded"}},h=s.create(E),w=Ze(a),C=!!r&&r.n>0&&w.length>0,v=C?-this.config.transition.duration:0,m={id:e,def:s,inst:h,group:a,orb:c,scope:l,age:v,leaving:!1,morphOut:!1,drawn:!1};C&&(n.group.visible=!1,o&&(o.morphOut=!0,Fe.killTweensOf(o.scope),Fe.to(o.scope,{presence:0,duration:.55,ease:"power2.in"}),this.morphFrom=o),l.presence=1,this.morph=new ht(r,w,{...this.config.transition},this.resolution,this.pointScale),this.scene.add(this.morph.group)),this.active.push(m),!t.instant&&!C&&Fe.to(l,{presence:1,duration:.9,delay:.25,ease:"power2.out"}),this.emit("scene",e)}endMorph(){this.morph?.dispose(),this.morph=null,this.morphFrom&&this.active.includes(this.morphFrom)&&this.disposeActive(this.morphFrom),this.morphFrom=null}restart(){this.setScene(this.config.scene,{instant:!0,force:!0})}disposeActive(e){e.inst.dispose?.(),this.scene.remove(e.group),e.group.traverse(t=>{let n=t;n.geometry?.dispose();let r=n.material;Array.isArray(r)?r.forEach(o=>o.dispose()):r?.dispose()}),this.active=this.active.filter(t=>t!==e)}get current(){return this.active.find(e=>!e.leaving)}get duration(){return this.current?.def.duration??8}get progress(){let e=this.current;return e?Math.max(0,e.age%e.def.duration)/e.def.duration:0}project(e,t,n){let r=new J.Vector3(e,t,n).project(this.camera);return{x:(r.x+1)/2*this.w,y:(1-r.y)/2*this.h}}step(e){this.floor.beginFrame();let t,n=0,r=0,o=(p,b)=>{let y=p.def.duration,g=p.age%y;p.age+=b,!p.leaving&&p.age%y<g&&(this.emit("loop",p.id),p.leaving&&(p.endAt=p.age-p.age%y));let E=p.leaving&&p.endAt!==void 0&&p.age>=p.endAt?y+p.age-p.endAt:p.age%y;p.inst.update({t:E,age:p.age,dt:b,presence:p.morphOut?1:p.scope.presence,loopOut:!p.morphOut&&!this.advances}),p.drawn=!0;let h=p.scope.presence;(!t||h>t.scope.presence)&&(t=p),n+=p.orb.listen*h,r+=p.orb.speak*h};for(let p of[...this.active])this.active.includes(p)&&o(p,e);for(let p of[...this.active])p.drawn||o(p,0);this.morph&&(this.morph.update(e,this.pxScale,this.config.orb.radius),this.morph.done&&this.endMorph());let s=this.orb.drive;s.state=t?t.orb.state:"idle";let a=t?.orb.tint;this.orb.params.mid=a?a.mid:this.config.orb.mid,this.orb.params.highlight=a?a.high:this.config.orb.highlight;let l=this.orb.highlightNow,c=ge(this.config.orb.highlight),M=_t(l.x,l.y,l.z)-_t(c.x,c.y,c.z);this.orb.hueShift=M-Math.round(M),this.floor.shadowColor=qe(this.config.contactColor,this.orb.hueShift),this.floor.glowColor=this.orb.midNow,s.listen=Math.min(1,n),s.speak=Math.min(1,r),this.orb.update(e),this.floor.endFrame(this.orb.energy)}get advances(){return this.config.autoplay&&!this.frozen&&!this.onFrame}get pxScale(){return this.pointScale.value/this.renderer.getPixelRatio()}render(){this.renderer.render(this.scene,this.camera)}resize(){let e=Math.max(1,this.container.clientWidth),t=Math.max(1,this.container.clientHeight);this.w=e,this.h=t,this.dpr=Math.min(window.devicePixelRatio||1,2),this.renderer.setPixelRatio(this.dpr),this.renderer.setSize(e,t,!1),this.layoutCamera(),!this.frozen&&this.raf&&this.render()}layoutCamera(){let e=this.config.camera,t=Cn(e.azimuth),n=Cn(e.elevation),r=new J.Vector3(0,e.height,0),o=new J.Vector3(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));this.camera.position.copy(r).addScaledVector(o,40),this.camera.up.set(0,1,0),this.camera.lookAt(r),this.floor.setView(t,n),this.viewH=5.2/Math.max(.05,e.zoom);let s=this.w/this.h,a=this.viewH*s/2,l=this.viewH/2;this.camera.left=-a-e.panX,this.camera.right=a-e.panX,this.camera.top=l-e.panY,this.camera.bottom=-l-e.panY,this.camera.near=.1,this.camera.far=200,this.camera.updateProjectionMatrix(),this.resolution.set(this.w,this.h),this.syncPixelScale(this.dpr)}syncPixelScale(e){this.pointScale.value=e*(5.2/this.viewH)*(this.h/640)}async snapshot(e={}){let{scale:t=2,transparent:n=!1}=e;return this.withSize(t,n,async()=>(this.renderer.render(this.scene,this.camera),this.compose()))}async exportLayers(e=2){let t={};return await this.withSize(e,!0,async()=>{let n=[["floor","1-floor.png"],["objects","2-objects.png"],["orb","3-orb.png"]];for(let[r,o]of n)this.renderLayer(r),t[o]=new Uint8Array(await(await this.compose()).arrayBuffer());this.renderer.render(this.scene,this.camera),t["0-composite.png"]=new Uint8Array(await(await this.compose()).arrayBuffer())}),this.renderer.setClearColor(this.config.background,1),t["config.json"]=St(JSON.stringify(this.config,null,2)),new Blob([xt(t)],{type:"application/zip"})}sceneSVG(){let e=this.floor.frameEffects;return En({camera:this.camera,w:this.w,h:this.h,dpr:this.dpr,config:this.config,groups:[...this.active.filter(t=>t.group.visible).map(t=>t.group),...this.morph?[this.morph.group]:[]],ripples:e.ripples,tiles:e.tiles})}async exportSequence(e={}){let{fps:t=30,scale:n=1,transparent:r=!1,onProgress:o}=e;this.restart();let s=e.seconds??this.duration,a=Math.round(s*t),l={};this.frozen=!0;try{this.orb.settle(),await this.withSize(n,r,async()=>{for(let c=0;c<a;c++){c>0?this.step(1/t):this.step(0),this.renderer.render(this.scene,this.camera);let M=await this.compose();l[`frame-${String(c).padStart(4,"0")}.png`]=new Uint8Array(await M.arrayBuffer()),o?.((c+1)/a)}})}finally{this.frozen=!1,this.last=performance.now()}return l["config.json"]=St(JSON.stringify(this.config,null,2)),new Blob([xt(l,{level:0})],{type:"application/zip"})}async record(e={}){let{loops:t=1,fps:n=60,scale:r=Math.min(2,this.dpr),onProgress:o}=e,a=["video/mp4;codecs=avc1.640028","video/mp4","video/webm;codecs=vp9","video/webm"].find(C=>MediaRecorder.isTypeSupported(C))??"video/webm",l=document.createElement("canvas");l.width=Math.round(this.w*r),l.height=Math.round(this.h*r);let c=l.getContext("2d"),M=this.dpr;this.dpr=r,this.renderer.setPixelRatio(r),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(r),this.restart(),this.orb.settle();let p=l.captureStream(n),b=new MediaRecorder(p,{mimeType:a,videoBitsPerSecond:16e6}),y=[];b.ondataavailable=C=>C.data.size&&y.push(C.data);let g=this.duration*t/Math.max(.05,this.config.speed),E=this.config.playing;this.config.playing=!0;let h=performance.now(),w=new Promise(C=>b.onstop=()=>C());return this.onFrame=()=>{c.fillStyle=this.config.background,c.fillRect(0,0,l.width,l.height),c.drawImage(this.renderer.domElement,0,0);let C=(performance.now()-h)/1e3/g;o?.(Math.min(1,C)),C>=1&&b.state==="recording"&&b.stop()},b.start(250),await w,this.onFrame=void 0,this.config.playing=E,this.dpr=M,this.resize(),new Blob(y,{type:a.split(";")[0]})}async withSize(e,t,n){let r=this.frozen;this.frozen=!0,this.renderer.setPixelRatio(e),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(e),this.renderer.setClearColor(this.config.background,t?0:1);try{return await n()}finally{this.renderer.setClearColor(this.config.background,1),this.frozen=r,this.resize(),this.last=performance.now()}}async compose(){return Ki(this.renderer.domElement)}renderLayer(e){let t=[],n=r=>r===this.floor.mesh||r===this.orb.reflection?e==="floor":r===this.orb.mesh||r===this.orb.backdrop?e==="orb":e==="objects";this.scene.traverse(r=>{let o=r.material;if(!o)return;let s=n(r);for(let a of Array.isArray(o)?o:[o])t.push([a,a.colorWrite]),s||(a.colorWrite=!1)}),this.renderer.render(this.scene,this.camera);for(let[r,o]of t)r.colorWrite=o}dispose(){cancelAnimationFrame(this.raf),this.ro.disconnect(),this.io.disconnect(),this.endMorph();for(let e of[...this.active])this.disposeActive(e);this.orb.dispose(),this.floor.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function Ki(i){return new Promise((e,t)=>i.toBlob(n=>n?e(n):t(new Error("toBlob failed")),"image/png"))}var _n={direction:"line",scene:"denoise",playing:!0,speed:.8,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#007cff",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:0,fadeOuter:8},floorGlow:0,contactShadow:0,camera:{azimuth:46,elevation:10,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:.73,mid:"#00ccff",highlight:"#3d64ff",speed:.83,reflection:.35},particles:{size:2,emphasis:1,density:2,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},sceneParams:{denoise:{rings:2,passes:1,outer:3.1,inner:1.14,height:3,noiseFreq:51,noiseFreq2:90,noiseMix:.62,cleanFreq:43,cleanHeight:.21,cleanFrom:.08,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.39,cleanOpacity:.95,fadeIn:.19,fadeOut:.15,count:800,cloud:1.6,lanes:.05,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:.59,dotSize:1.6,dotOpacity:.38,streakWidth:1.5,streakOpacity:.85,tail:0,own_size:!0,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.35,own_scatter:!0,p_scatter:.016,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.85,height:.155,cycles:64,width:1.5,wordLength:1.2,wordGap:.64,pauses:.15,guide:!0,guideOpacity:.26,playhead:!0,playheadLength:.27,markers:!0,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1,lineOpacity:.15,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:-94,spin:3,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:.041,own_idle:!0,p_idle:.07,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},llm:{rings:3,dots:470,inner:1.49,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:1.35,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.3,own_scatter:!1,p_scatter:.025,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.18,spacing:.99,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.22,litOpacity:.1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.093,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},voices:{inner:1.13,spacing:.57,dotSpacing:.03,height:.8,cycles:.65,drift:-4,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.28,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!0,p_density:2,own_scatter:!0,p_scatter:.039,own_idle:!0,p_idle:.047,own_idleSpeed:!0,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},colloquial:{spacing:.06,inner:1.14,outer:3.45,height:3,waves:8,wavelength:2,crest:6,variation:.75,spokenFrom:5.6,spokenTo:3.1,decay:.55,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.65,drift:0,hold:.95,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var Rn={direction:"particles",scene:"denoise",playing:!0,speed:.9,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#183387",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35},particles:{size:1.6,emphasis:1,density:1.65,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{denoise:{rings:3,passes:1,outer:3.1,inner:1,height:3,noiseFreq:51,noiseFreq2:81,noiseMix:.62,cleanFreq:18,cleanHeight:.21,cleanFrom:.04,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.4,cleanOpacity:.95,fadeIn:.2,fadeOut:.15,count:1900,cloud:1.6,lanes:.31,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:0,dotSize:2.45,dotOpacity:.95,streakWidth:1.25,streakOpacity:1,tail:0,own_size:!1,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1.35,own_scatter:!0,p_scatter:.02,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.65,height:.425,cycles:72,width:1.5,wordLength:.51,wordGap:.15,pauses:.15,guide:!1,guideOpacity:.18,playhead:!1,playheadLength:.06,markers:!1,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1.5,lineOpacity:1,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:64,spin:14.5,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:0,own_idle:!0,p_idle:.021,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",playheadWidth:1.5,playheadColor:"#007cff",playheadOpacity:1,markerLength:.05,markerWidth:1.35,markerColor:"#1A1C22",markerOpacity:.25,lineColor:"#b2b5c0",previous:.35},llm:{rings:4,dots:470,inner:1.76,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:2.7,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.5,own_scatter:!1,p_scatter:.05,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.05,spacing:.68,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.5,litOpacity:1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!1,p_size:1.6,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.075,own_idle:!0,p_idle:.02,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35},voices:{inner:1.13,spacing:.64,dotSpacing:.03,height:.8,cycles:1.05,drift:2,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.5,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!1,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!1,p_density:1.65,own_scatter:!0,p_scatter:.05,own_idle:!0,p_idle:.03,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35,lead:.8},colloquial:{spacing:.06,inner:1.54,outer:4.1,height:.8,waves:8,wavelength:1.44,crest:6,variation:.75,spokenFrom:6.2,spokenTo:3.1,decay:1,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.57,drift:2,hold:.41,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var Xi={line:_n,particles:Rn};function An(i){return Ae(Mn(Qe[i].preset,i),Xi[i])}var je={denoise:{title:"Denoising Model",text:"Reduces background noise so the agent can hear the caller clearly.",icon:"denoise"},turns:{title:"Turn-Taking Model",text:"Determines when to wait and when to respond.",icon:"turns"},ivr:{title:"Voicemail & IVR Detection",text:"Recognizes voicemail greetings and automated phone menus.",icon:"ivr"},llm:{title:"Tell-1",text:"Retell\u2019s first LLM, built for instruction following, tool use, and conversational reasoning.",icon:"llm"},harness:{title:"Retell Agent Harness",text:"Coordinates context, tool execution, and conversation state across cascaded and speech-to-speech agents.",icon:"harness"},colloquial:{title:"Colloquial Rewrite Model",text:"Refines replies into natural spoken language.",icon:"colloquial"},guardrails:{title:"Response Guardrails",text:"Checks generated responses against configured constraints.",icon:"guardrails"}},Tn={title:"Speech-to-speech model",text:"Hears and replies in audio directly, with the agent harness supplying context, tools, and flow.",icon:"voices"},On="Tell-1 is the text LLM option for cascaded agents.",Pn="Availability to confirm",jt={query:{title:"Query Refinement Model",text:"Turns conversation context into focused knowledge-base searches.",icon:"query"},retrieval:{title:"Knowledge Retrieval",text:"Finds relevant information and makes it available to the agent.",icon:"retrieval"},flow:{title:"Flow Transition Model",text:"Uses conversation context to select the next step in the workflow.",icon:"flow"}},zn="Embedding model and vector retrieval";var Ln='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M5.95168 17.3125V2.6875C5.95168 2.23877 6.31441 1.875 6.76186 1.875C7.20931 1.875 7.57205 2.23877 7.57205 2.6875V17.3125C7.57205 17.7612 7.20931 18.125 6.76186 18.125C6.31441 18.125 5.95168 17.7612 5.95168 17.3125ZM12.4332 15.6875V9.1875C12.4332 8.73875 12.7959 8.375 13.2434 8.375C13.6908 8.375 14.0535 8.73875 14.0535 9.1875V15.6875C14.0535 16.1363 13.6908 16.5 13.2434 16.5C12.7959 16.5 12.4332 16.1363 12.4332 15.6875ZM9.19244 14.0625V5.9375C9.19244 5.48877 9.55519 5.125 10.0026 5.125C10.45 5.125 10.8128 5.48877 10.8128 5.9375V14.0625C10.8128 14.5112 10.45 14.875 10.0026 14.875C9.55519 14.875 9.19244 14.5112 9.19244 14.0625ZM2.71094 12.4375V7.5625C2.71094 7.11377 3.07367 6.75 3.52112 6.75C3.96858 6.75 4.3313 7.11377 4.3313 7.5625V12.4375C4.3313 12.8862 3.96858 13.25 3.52112 13.25C3.07367 13.25 2.71094 12.8862 2.71094 12.4375ZM15.6739 11.625V9.1875C15.6739 8.73875 16.0366 8.375 16.4841 8.375C16.9315 8.375 17.2943 8.73875 17.2943 9.1875V11.625C17.2943 12.0737 16.9315 12.4375 16.4841 12.4375C16.0366 12.4375 15.6739 12.0737 15.6739 11.625Z" fill="black"/>%0A<path id="Vector_2" d="M15.4193 1.875C15.6883 1.875 15.9274 2.04703 16.0125 2.30225L16.4341 3.56771L17.7004 3.99008C17.9556 4.07514 18.1276 4.31432 18.1276 4.58333C18.1276 4.85235 17.9556 5.09152 17.7004 5.17659L16.4341 5.59814L16.0125 6.86442C15.9274 7.11963 15.6883 7.29167 15.4193 7.29167C15.1503 7.29167 14.9111 7.11963 14.826 6.86442L14.4036 5.59814L13.1382 5.17659C12.8829 5.09152 12.7109 4.85235 12.7109 4.58333C12.7109 4.31432 12.8829 4.07514 13.1382 3.99008L14.4036 3.56771L14.826 2.30225L14.8651 2.2111C14.9714 2.00698 15.1838 1.875 15.4193 1.875Z" fill="black"/>%0A</g>%0A</svg>%0A';var Hn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M13.58 11.0771C13.9054 10.7517 14.4331 10.7517 14.7585 11.0771L17.2586 13.5772C17.4148 13.7335 17.5027 13.9454 17.5027 14.1665C17.5027 14.3875 17.4148 14.5994 17.2585 14.7557L14.7585 17.2556C14.433 17.581 13.9054 17.581 13.58 17.2556C13.2546 16.9301 13.2546 16.4025 13.58 16.0771L15.4908 14.1664L13.58 12.2556C13.2546 11.9302 13.2546 11.4025 13.58 11.0771Z" fill="black"/>%0A<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M2.5 5.83333C2.5 5.3731 2.8731 5 3.33333 5H16.6667C17.1269 5 17.5 5.3731 17.5 5.83333C17.5 6.29357 17.1269 6.66667 16.6667 6.66667H3.33333C2.8731 6.66667 2.5 6.29357 2.5 5.83333Z" fill="black"/>%0A<path id="Vector_3" fill-rule="evenodd" clip-rule="evenodd" d="M2.5 14.1663C2.5 13.7061 2.8731 13.333 3.33333 13.333H16.6667C17.1269 13.333 17.5 13.7061 17.5 14.1663C17.5 14.6266 17.1269 14.9997 16.6667 14.9997H3.33333C2.8731 14.9997 2.5 14.6266 2.5 14.1663Z" fill="black"/>%0A<path id="Vector_4" fill-rule="evenodd" clip-rule="evenodd" d="M6.42261 2.7441C6.74803 3.06955 6.74802 3.59718 6.42257 3.92261L4.51184 5.83318L6.42261 7.7441C6.74803 8.06955 6.74802 8.59717 6.42257 8.92258C6.09712 9.248 5.56948 9.248 5.24406 8.92258L2.74406 6.42238C2.58778 6.26609 2.49999 6.05413 2.5 5.83311C2.50001 5.6121 2.58782 5.40014 2.7441 5.24387L5.2441 2.74406C5.56955 2.41863 6.09718 2.41865 6.42261 2.7441Z" fill="black"/>%0A</g>%0A</svg>%0A';var Fn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="black" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="3.5" r="1.5"/><circle cx="10" cy="3.5" r="1.5"/><circle cx="15" cy="3.5" r="1.5"/><circle cx="5" cy="8.5" r="1.5"/><circle cx="10" cy="8.5" r="1.5"/><circle cx="15" cy="8.5" r="1.5"/><circle cx="5" cy="13.5" r="1.5"/><circle cx="10" cy="13.5" r="1.5"/><circle cx="15" cy="13.5" r="1.5"/><circle cx="10" cy="18" r="1.5"/></svg>%0A';var Dn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<g id="Vector">%0A<path d="M9.2797 17.3179C9.2797 16.3891 8.527 15.6358 7.5984 15.6358C6.66886 15.6358 5.91616 16.3891 5.91616 17.3179C5.91616 18.2467 6.66979 19 7.5984 19C8.527 19 9.2797 18.2467 9.2797 17.3179Z" fill="black"/>%0A<path d="M14.0885 17.3179C14.0885 16.3882 13.3348 15.6358 12.4053 15.6358C11.4767 15.6358 10.724 16.3891 10.724 17.3179C10.724 18.2467 11.4767 19 12.4053 19C13.3348 19 14.0885 18.2467 14.0885 17.3179Z" fill="black"/>%0A<path d="M4.36447 12.4057C4.36447 11.4769 3.61177 10.7236 2.68223 10.7236C1.75363 10.7236 1 11.4769 1 12.4057C1 13.3345 1.75363 14.0878 2.68223 14.0878C3.61177 14.0878 4.36447 13.3345 4.36447 12.4057Z" fill="black"/>%0A<path d="M19 12.4057C19 11.4769 18.2464 10.7236 17.3178 10.7236C16.3892 10.7236 15.6365 11.4769 15.6365 12.4057C15.6365 13.3345 16.3892 14.0878 17.3178 14.0878C18.2464 14.0878 19 13.3345 19 12.4057Z" fill="black"/>%0A<path d="M4.36447 7.5934C4.36447 6.6646 3.61177 5.9113 2.68223 5.9113C1.75363 5.9113 1 6.6646 1 7.5934C1 8.5222 1.75363 9.2755 2.68223 9.2755C3.61177 9.2755 4.36447 8.5222 4.36447 7.5934Z" fill="black"/>%0A<path d="M19 7.5934C19 6.6646 18.2464 5.9113 17.3178 5.9113C16.3892 5.9113 15.6365 6.6646 15.6365 7.5934C15.6365 8.5222 16.3892 9.2755 17.3178 9.2755C18.2464 9.2755 19 8.5222 19 7.5934Z" fill="black"/>%0A<path d="M9.2797 2.6821C9.2797 1.7533 8.527 1 7.5984 1C6.66886 1 5.91616 1.7533 5.91616 2.6821C5.91616 3.6109 6.66886 4.3642 7.5984 4.3642C8.527 4.3642 9.2797 3.6109 9.2797 2.6821Z" fill="black"/>%0A<path d="M14.0885 2.6821C14.0885 1.7533 13.3348 1 12.4053 1C11.4767 1 10.724 1.7533 10.724 2.6821C10.724 3.6109 11.4767 4.3642 12.4053 4.3642C13.3348 4.3642 14.0885 3.6109 14.0885 2.6821Z" fill="black"/>%0A</g>%0A</g>%0A</svg>%0A';var In='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5 2.5 6.4 10 10.3 17.5 6.4Z" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 10 10 13.9 17.5 10" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 13.6 10 17.5 17.5 13.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Vn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M5.83464 7.0835H3.33464C2.41416 7.0835 1.66797 7.82969 1.66797 8.75016V11.2502C1.66797 12.1707 2.41416 12.9168 3.33464 12.9168H5.83464L11.668 16.6668V3.3335L5.83464 7.0835Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M14.168 7.5C14.6891 8.18307 15.0013 9.05283 15.0013 10C15.0013 10.9472 14.6891 11.8169 14.168 12.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M16.668 5.8335C17.7103 6.97194 18.3346 8.42158 18.3346 10.0002C18.3346 11.5787 17.7103 13.0284 16.668 14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var Un='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.2 16.2 4.6V9.6C16.2 13.4 13.6 16.5 10 17.8 6.4 16.5 3.8 13.4 3.8 9.6V4.6Z" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.3 10 9.3 12 12.9 8.3" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Bn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M10 2.5V17.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M6.66797 5.8335V14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M3.33203 9.1665V10.8332" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_4" d="M13.332 5.8335V14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_5" d="M16.668 9.1665V10.8332" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var jn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.6" cy="8.6" r="5.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.8 12.8 17.5 17.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 8.6H10.8M8.6 6.4V10.8" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Gn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="10" cy="4.6" rx="6" ry="2.4" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4.6V15.4C4 16.7 6.7 17.8 10 17.8S16 16.7 16 15.4V4.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10C4 11.3 6.7 12.4 10 12.4S16 11.3 16 10" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Nn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M18.3333 17.0835V12.9168C18.3333 12.4566 17.9602 12.0835 17.5 12.0835H13.3333C12.8731 12.0835 12.5 12.4566 12.5 12.9168V17.0835C12.5 17.5437 12.8731 17.9168 13.3333 17.9168H17.5C17.9602 17.9168 18.3333 17.5437 18.3333 17.0835Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M7.91927 6.6665V2.49984C7.91927 2.0396 7.54617 1.6665 7.08594 1.6665H2.91927C2.45903 1.6665 2.08594 2.0396 2.08594 2.49984V6.6665C2.08594 7.12674 2.45903 7.49984 2.91927 7.49984H7.08594C7.54617 7.49984 7.91927 7.12674 7.91927 6.6665Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M4.41074 17.7441C4.73618 18.0695 5.26382 18.0695 5.58926 17.7441L7.74407 15.5892C8.06952 15.2638 8.06952 14.7362 7.74407 14.4108L5.58926 12.2559C5.26382 11.9305 4.73618 11.9305 4.41074 12.2559L2.25593 14.4108C1.93048 14.7362 1.93048 15.2638 2.25593 15.5892L4.41074 17.7441Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_4" d="M5 7.5V11.6667M8.33335 15H12.5" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var Wn="[Retell]",lr={denoise:Ln,turns:Hn,ivr:Fn,llm:Dn,harness:In,colloquial:Vn,guardrails:Un,voices:Bn,query:jn,retrieval:Gn,flow:Nn},le=An("particles"),Gt="(max-width: 767px)",qn="cubic-bezier(.2, .7, .2, 1)",cr=876;var pr={orb:{mid:"#FFB020",highlight:"#FF5A1F"},contactColor:"#FF5A1F",accent:"#F26B1D",particles:{active:"#F26B1D",highlight:"#FF9A3D"},lines:{active:"#F26B1D"}},dr={orb:{mid:le.orb.mid,highlight:le.orb.highlight},contactColor:le.contactColor,accent:le.accent,particles:{active:le.particles.active,highlight:le.particles.highlight},lines:{active:le.lines.active}},Kn=i=>i?{...le.camera,zoom:le.camera.zoom*1.04,panY:.75}:le.camera,ur=i=>{let e=i.match(/\d+(\.\d+)?/g);return e&&e.length>=3?"#"+e.slice(0,3).map(t=>Math.round(+t).toString(16).padStart(2,"0")).join(""):le.background},K=(i,e,t)=>{let n=document.createElement(i);return n.className=e,t!=null&&(n.textContent=t),n},hr=i=>{let e=K("span","rh26-stage-icon");return e.setAttribute("aria-hidden","true"),e.style.setProperty("--icon",'url("data:image/svg+xml,'+encodeURIComponent(decodeURIComponent(lr[i].replace(/^data:image\/svg\+xml,/,"")))+'")'),e};function Ge(i,e,t=!1){let n=K("div","rh26-stage-card"),r=K("div","rh26-stage-card-body");return r.append(K("p","rh26-stage-card-title",i.title),K("p","rh26-stage-card-text",i.text)),t&&r.append(K("p","rh26-stage-card-tag",Pn)),e&&r.append(e),n.append(hr(i.icon),r),n}function mr(i,e,t){let n=e==="s2s";if(i==="harness"){let r=K("div","rh26-stage-parts");return Pe.forEach(o=>{let s=K("div","rh26-stage-part");s.style.setProperty("--act","0");let a=K("span","rh26-stage-part-dot");a.append(K("span","rh26-stage-part-lit"));let l=K("div","rh26-stage-part-copy"),c=K("p","rh26-stage-part-text",jt[o].text);o==="retrieval"&&c.append(K("span","rh26-stage-part-detail",zn)),l.append(K("p","rh26-stage-part-title",jt[o].title),c),s.append(a,l),r.append(s),t.set(o,s)}),[Ge(je.harness,r)]}return i==="llm"||i==="s2s"?n?[Ge(Tn,K("p","rh26-stage-card-note",On))]:[Ge(je.llm)]:n&&ze[i].step==="speak"?[Ge(je.colloquial,null,!0),Ge(je.guardrails,null,!0)]:[Ge(je[i])]}function fr(i){if(i.hasAttribute("data-rh26-stage"))return;let e=i.querySelector(".rh26-agent-visual"),t=Array.from(i.querySelectorAll("[data-rh26-tab]"));if(!e||t.length!==Re.length)return console.warn(Wn,"Conversational Dynamics: stage markup not found");i.setAttribute("data-rh26-stage","");let n=t.map(u=>document.getElementById(u.getAttribute("aria-controls")||"")),r=Array.from(i.querySelectorAll("[data-rh26-scene]")),o=Array.from(i.querySelectorAll("[data-rh26-arch]"));r.forEach(u=>{u.dataset.rh26Base=u.getAttribute("data-rh26-scene");let f=u.querySelector(".rh26-scene-label");f&&(f.dataset.rh26Base=f.textContent||"")});let s=matchMedia("(prefers-reduced-motion: reduce)").matches,a=matchMedia(Gt).matches,l="cascaded",c=K("div","rh26-stage-canvas"),M=K("div","rh26-stage-cards"),p=K("div","rh26-stage-frame"),b=K("div","rh26-stage-col");p.append(b),M.append(p),e.append(c,M);let y=K("div","rh26-stage-below");e.after(y);let g=null;try{g=new wt(c,{...le,speed:le.speed*2.5,background:ur(getComputedStyle(e).backgroundColor),camera:Kn(a)}),g.orb.setStyle(1,!0)}catch(u){console.warn(Wn,"Conversational Dynamics: WebGL unavailable, keeping the static artwork",u)}let E=g?g.config.scene:le.scene,h=new Map,w="";function C(){let u=l+":"+E;if(u===w)return;w=u,h.clear();let f=a?y:b;(a?b:y).replaceChildren(),f.querySelectorAll(".rh26-stage-set").forEach(S=>{S.classList.add("is-out"),S.removeAttribute("data-live"),setTimeout(()=>S.remove(),450)});let d=K("div","rh26-stage-set");d.setAttribute("data-live",""),d.append(...mr(E,l,h)),f.append(d)}function v(){a=matchMedia(Gt).matches,i.classList.toggle("rh26-stage-is-mobile",a),p.style.transform="scale("+e.clientWidth/cr+")",w="",C()}let m=-1;function x(u,f,d){if(u){if(u.getAnimations().forEach(S=>S.cancel()),d||s){u.hidden=!f;return}if(f){u.hidden=!1;let S=u.offsetHeight;u.animate([{height:"0px",paddingTop:"0px",opacity:0},{height:S+"px",paddingTop:getComputedStyle(u).paddingTop,opacity:1}],{duration:500,easing:qn})}else{let S=u.offsetHeight;u.animate([{height:S+"px",paddingTop:getComputedStyle(u).paddingTop,opacity:1},{height:"0px",paddingTop:"0px",opacity:0}],{duration:400,easing:qn}).onfinish=()=>{u.hidden=!0}}}}function _(u){let f=u.dataset.rh26Base;if(l==="cascaded")return f;if(f==="llm")return"s2s";let d=ze[f].step;return Le(d,"s2s").includes(f)?f:null}function R(){r.forEach(u=>{let f=_(u);if(u.hidden=!f,!f)return;u.setAttribute("data-rh26-scene",f);let d=u.querySelector(".rh26-scene-label");d&&(d.textContent=l==="cascaded"?d.dataset.rh26Base||"":wn(f,l).tab)}),o.forEach(u=>u.setAttribute("aria-pressed",String(u.getAttribute("data-rh26-arch")===l)))}function T(u,f=!1){E=u;let d=Re.findIndex(k=>k.id===ze[u].step);t.forEach((k,O)=>{k.setAttribute("aria-selected",String(O===d)),k.setAttribute("aria-expanded",String(O===d)),k.tabIndex=O===d?0:-1}),d!==m&&(n.forEach((k,O)=>{(O===d||O===m||f)&&x(k,O===d,f)}),m=d);let S=Le(Re[d].id,l);r.forEach(k=>{let O=k.getAttribute("data-rh26-scene");O===u?k.setAttribute("aria-current","step"):k.removeAttribute("aria-current");let F=k.querySelector(".rh26-scene-bar"),I=S.indexOf(O);F&&(F.style.transform=I>=0&&I<S.indexOf(u)?"scaleY(1)":"scaleY(0)")}),C()}let A=u=>{if(!g)return T(u);u!==g.config.scene&&g.applyConfig({scene:u})};function H(u){if(u===l)return;l=u,R(),g?.applyConfig({...u==="s2s"?pr:dr,arch:u});let f=yt(u),d=E;f.includes(d)||(d=E==="llm"?"s2s":E==="s2s"?"llm":Le(ze[E].step,u)[0]),d!==E&&A(d),w="",T(g?g.config.scene:d)}if(o.forEach(u=>u.addEventListener("click",()=>H(u.getAttribute("data-rh26-arch")==="s2s"?"s2s":"cascaded"))),t.forEach((u,f)=>{u.addEventListener("click",d=>{d.preventDefault(),A(Le(Re[f].id,l)[0])}),u.addEventListener("keydown",d=>{if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(d.key))return;d.preventDefault();let k=d.key==="Home"?0:d.key==="End"?t.length-1:(f+(d.key==="ArrowDown"||d.key==="ArrowRight"?1:-1)+t.length)%t.length;A(Le(Re[k].id,l)[0]),t[k].focus()})}),r.forEach(u=>u.addEventListener("click",()=>A(u.getAttribute("data-rh26-scene")))),R(),T(E,!0),v(),new ResizeObserver(v).observe(e),matchMedia(Gt).addEventListener("change",()=>{v(),g?.applyConfig({camera:Kn(a)})}),!g){i.classList.add("rh26-stage-is-live");return}let z=g;z.on("scene",u=>T(u)),z.on("loop",u=>{if(!z.config.autoplay)return;let f=yt(l);z.applyConfig({scene:f[(f.indexOf(u)+1)%f.length]})}),z.ready.then(()=>{e.classList.add("is-live"),i.classList.add("rh26-stage-is-live")}),(function u(){if(requestAnimationFrame(u),!e.classList.contains("is-live"))return;let f=i.querySelector('[data-rh26-scene="'+E+'"] .rh26-scene-bar');if(f&&(f.style.transform="scaleY("+z.progress.toFixed(4)+")"),E==="harness"){let d=z.progress*z.duration;h.forEach((S,k)=>S.style.setProperty("--act",vt(k,d).toFixed(3)))}})()}function Zn(){document.querySelectorAll('[data-rh26-component="Conversational Dynamics"]').forEach(fr)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Zn):Zn();
