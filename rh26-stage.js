import*as J from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var ze=window.gsap;var qt=()=>{throw new Error("[Retell] exports are not included")},vt=qt,bt=qt;import*as K from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var $t=1.7,Ze=1.2,Xt=1.667,Yt={1:{streaks:3.2,fine:.7,smear:.2,rim:.75,back:.75,pole:1.2,halo:.3,exposure:.7,grain:.15,loop:5.76,seed:3.7},2:{streaks:1,fine:1.14,smear:0,rim:.41,back:.75,pole:0,halo:.3,exposure:.65,grain:.4,loop:20,seed:81.4}},Kt={idle:{spin:1,breathe:0,exp:0,pole:0,halo:0,flow:0,wave:0,react:.25},listening:{spin:1.6,breathe:.04,exp:.1,pole:.2,halo:.2,flow:.22,wave:.22,react:.7},speaking:{spin:1.3,breathe:0,exp:.06,pole:.12,halo:.15,flow:.12,wave:.1,react:1},thinking:{spin:2.4,breathe:.03,exp:.04,pole:.3,halo:.12,flow:.5,wave:.04,react:0}},yt=i=>{let e=parseInt(i.replace("#",""),16);return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]},Zt=`
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
  float mask = 1.0 - clamp((length(vP) - ${Ze.toFixed(3)}) / ${(Xt-Ze).toFixed(3)}, 0.0, 1.0);
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
  float a = uRefl * fade * (1.0 - clamp((length(vP) - ${Ze.toFixed(3)}) / ${(Xt-Ze).toFixed(3)}, 0.0, 1.0));
  if (a < 0.002) discard;
  // a wide blur needs more samples than the orb's, or its bright flare breaks up into speckles
  float blur = mix(0.05, 0.3, min(far, 1.0));
  outColor = ink(blurred(vec2(vP.x, -vP.y), blur, blur, 24)) * a;
}`,ei=["streaks","fine","smear","rim","back","pole","halo","exposure","grain"],$e=class{constructor(e){this.group=new K.Group;this.drive={state:"idle",listen:0,speak:0};this.style=1;this.cur={...Kt.idle};this.level=0;this.thinking=0;this.clock=0;this.flow=0;this.phase=0;this.energy=0;this.hueShift=0;this.params={...e},this.look={...e.looks[this.style]};let t=r=>new K.Vector3(...yt(r));this.uniforms={uRadius:{value:e.radius},uClock:{value:0},uFlow:{value:0},uWave:{value:0},uT:{value:0},uStreaks:{value:0},uFine:{value:0},uSmear:{value:0},uRim:{value:0},uBack:{value:0},uPole:{value:0},uHalo:{value:0},uGrain:{value:0},uExposure:{value:0},uSeed:{value:0},uCore:{value:t(e.highlight)},uMid:{value:t(e.mid)},uRefl:{value:e.reflection}};let n=(r,o)=>new K.ShaderMaterial({glslVersion:K.GLSL3,vertexShader:r,fragmentShader:o,uniforms:this.uniforms,transparent:!0,premultipliedAlpha:!0,depthWrite:!1});this.mesh=new K.Mesh(new K.PlaneGeometry(2,2),n(Zt,Xn)),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2.5,this.mesh.name="orb",this.backdrop=new K.Mesh(new K.PlaneGeometry(2,2),new K.ShaderMaterial({glslVersion:K.GLSL3,vertexShader:Zt,fragmentShader:Yn,uniforms:this.uniforms})),this.backdrop.frustumCulled=!1,this.backdrop.renderOrder=2,this.backdrop.name="orb-backdrop",this.reflection=new K.Mesh(new K.PlaneGeometry(2,2),n(Qn,Jn)),this.reflection.material.depthTest=!1,this.reflection.frustumCulled=!1,this.reflection.renderOrder=-3,this.reflection.name="orb-reflection",this.group.add(this.backdrop,this.mesh,this.reflection),this.setParams(e),this.writeLook(0)}get highlightNow(){return this.uniforms.uCore.value}get midNow(){return this.uniforms.uMid.value}get radius(){return this.params.radius}setParams(e){Object.assign(this.params,e);let t=this.params.radius;this.group.position.set(0,t,0),this.uniforms.uRadius.value=t,this.uniforms.uRefl.value=this.params.reflection}setStyle(e,t=!1){this.style=e,t&&(this.look={...this.params.looks[e]})}writeLook(e){let{look:t,uniforms:n}=this,r=this.params.looks[this.style];for(let o of ei)t[o]+=(r[o]-t[o])*e;t.loop=r.loop,t.seed=r.seed,n.uStreaks.value=t.streaks,n.uFine.value=t.fine,n.uSmear.value=t.smear,n.uRim.value=t.rim,n.uBack.value=t.back,n.uGrain.value=t.grain,n.uSeed.value=t.seed}update(e){e=Math.min(e,.1);let{drive:t,cur:n,uniforms:r}=this,o=b=>Number.isFinite(b)?b:0,s=t.state==="listening"?o(t.listen):t.state==="speaking"?o(t.speak):0,a=Kt[t.state],l=1-Math.exp(-e*5);for(let b of Object.keys(a))n[b]+=(a[b]-n[b])*l;this.level+=(s-this.level)*Math.min(1,(s>this.level?30:7)*e),this.clock+=e,this.flow+=e*(n.flow+this.level*n.react*1.2),this.writeLook(l);let{look:c}=this,k=n.spin*(1+this.level*n.react*.5)*this.params.speed/Math.max(.1,c.loop);this.phase=(this.phase+e*k)%1;let p=this.level*n.react,f=n.breathe*Math.sin(this.clock*2.4);r.uClock.value=this.clock,r.uFlow.value=this.flow,r.uT.value=this.phase,r.uWave.value=n.wave+p*1.1,r.uPole.value=c.pole*(1+n.pole+p*.7),r.uHalo.value=c.halo*(1+n.halo+p*.3),r.uExposure.value=c.exposure*(1+n.exp+p*.3+f*3);let w=1-Math.exp(-e*8);r.uCore.value.lerp(new K.Vector3(...yt(this.params.highlight)),w),r.uMid.value.lerp(new K.Vector3(...yt(this.params.mid)),w),this.thinking+=((t.state==="thinking"?1:0)-this.thinking)*l,this.energy+=(Math.min(1,.25+.75*Math.max(this.level,this.thinking*.6))-this.energy)*(1-Math.exp(-e*6))}settle(){for(let e=0;e<90;e++)this.update(1/30)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.backdrop.geometry.dispose(),this.backdrop.material.dispose(),this.reflection.geometry.dispose(),this.reflection.material.dispose()}};import*as Z from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as de from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var fe=(i,e=0,t=1)=>Math.min(t,Math.max(e,i)),V=(i,e,t)=>i+(e-i)*t,ti=i=>i-Math.floor(i),W=(i,e,t)=>{let n=fe((t-i)/(e-i));return n*n*(3-2*n)},Ue=i=>1-Math.pow(1-fe(i),3),se=i=>(i=fe(i),i<.5?4*i*i*i:1-Math.pow(-2*i+2,3)/2);function xt(i,e,t,n=.3,r=.3){return i<=e||i>=t?0:Math.min(se((i-e)/n),se((t-i)/r),1)}var N=i=>ti(Math.sin(i*12.9898+78.233)*43758.5453);function St(i){let e=i>>>0||1;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function Ee(i,e=0){let n=Math.floor(i/.17),r=i/.17-n,o=Math.floor(i/.62+N(e*3.1)*7);return N(o*1.7+e)<.18?0:(.45+.55*N(n*.73+e*11.3))*Math.pow(Math.sin(Math.PI*r),.7)}function ge(i,e=new de.Vector3){let t=new de.Color;t.setStyle(i,de.SRGBColorSpace);let n=t.clone().convertLinearToSRGB();return e.set(n.r,n.g,n.b)}var wt=new de.Color,Ve={h:0,s:0,l:0};function Et(i,e,t){return wt.setRGB(i,e,t,de.SRGBColorSpace).getHSL(Ve,de.SRGBColorSpace).h}function Be(i,e){return Math.abs(e)<1e-4?i:(wt.setStyle(i,de.SRGBColorSpace).getHSL(Ve,de.SRGBColorSpace),`#${wt.setHSL(((Ve.h+e)%1+1)%1,Ve.s,Ve.l,de.SRGBColorSpace).getHexString(de.SRGBColorSpace)}`)}var H=Math.PI*2;var ke=16,Xe=24,ni=`
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
uniform vec4 uTile[${Xe}];
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
  for (int i = 0; i < ${Xe}; i++) {
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
}`,Ye=class{constructor(){this.ripples=[];this.tiles=[];this.glowAdd=0;this.baseGlow=.3;let e=Array.from({length:ke},()=>new Z.Vector4);this.u={uCell:{value:.75},uWidth:{value:1},uOpacity:{value:.1},uMajor:{value:0},uStyle:{value:0},uLine:{value:new Z.Vector3},uAccent:{value:new Z.Vector3},uGlowColor:{value:new Z.Vector3},uShadowColor:{value:new Z.Vector3},uFade:{value:new Z.Vector2(3,7)},uGlow:{value:.3},uShadow:{value:.3},uOrbR:{value:1},uViewR:{value:new Z.Vector2(1,0)},uViewF:{value:new Z.Vector2(0,1)},uSquash:{value:1},uGlobal:{value:1},uRip:{value:e},uRipXZ:{value:Array.from({length:ke},()=>new Z.Vector2)},uRipKind:{value:new Array(ke).fill(0)},uRipN:{value:0},uTile:{value:Array.from({length:Xe},()=>new Z.Vector4)},uTileN:{value:0}};let t=new Z.ShaderMaterial({vertexShader:ni,fragmentShader:ii,uniforms:this.u,transparent:!0,depthWrite:!1});this.mesh=new Z.Mesh(new Z.PlaneGeometry(80,80),t),this.mesh.rotation.x=-Math.PI/2,this.mesh.renderOrder=-2,this.mesh.name="floor"}setLook(e,t){let n=this.u;n.uStyle.value={lines:0,dots:1,cross:2}[e.style],ge(e.color,n.uLine.value),ge(e.accent,n.uAccent.value),ge(e.glowColor,n.uGlowColor.value),ge(e.shadowColor,n.uShadowColor.value),n.uOpacity.value=e.opacity,n.uCell.value=e.cell,n.uWidth.value=e.width,n.uMajor.value=e.major,n.uFade.value.set(e.fadeInner,e.fadeOuter),n.uGlow.value=e.glow,n.uShadow.value=e.shadow,n.uOrbR.value=t,this.baseGlow=e.glow}set shadowColor(e){ge(e,this.u.uShadowColor.value)}set glowColor(e){this.u.uGlowColor.value.copy(e)}setView(e,t){this.u.uViewR.value.set(Math.cos(e),-Math.sin(e)),this.u.uViewF.value.set(Math.sin(e),Math.cos(e)),this.u.uSquash.value=.2/Math.max(.05,Math.sin(t))}set opacity(e){this.u.uGlobal.value=e}beginFrame(){this.ripples.length=0,this.tiles.length=0,this.glowAdd=0}ripple(e){this.ripples.length<ke&&e.strength>.002&&this.ripples.push(e)}tile(e){this.tiles.length<Xe&&e.strength>.002&&this.tiles.push(e)}endFrame(e){let t=this.u,n=t.uRip.value,r=t.uRipXZ.value,o=t.uRipKind.value;this.ripples.forEach((a,l)=>{n[l].set(a.radius,a.strength,a.width,0),r[l].set(a.x??0,a.z??0),o[l]=a.kind??0}),t.uRipN.value=this.ripples.length;let s=t.uTile.value;this.tiles.forEach((a,l)=>s[l].set(a.x,a.z,a.strength,a.size??t.uCell.value)),t.uTileN.value=this.tiles.length,t.uGlow.value=this.baseGlow*(.6+.6*e)+this.glowAdd}get frameEffects(){return{ripples:this.ripples.slice(),tiles:this.tiles.slice()}}get cell(){return this.u.uCell.value}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}};import*as G from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as di,InstancedInterleavedBuffer as pi,InterleavedBufferAttribute as on,Line3 as ui,MathUtils as hi,Matrix4 as mi,Mesh as fi,Sphere as gi,Vector3 as Ce,Vector4 as je}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as nn,Float32BufferAttribute as Jt,InstancedBufferGeometry as ri,InstancedInterleavedBuffer as en,InterleavedBufferAttribute as Qe,Sphere as oi,Vector3 as ai,WireframeGeometry as si}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var tn=new nn,Je=new ai,He=class extends ri{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],n=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(n),this.setAttribute("position",new Jt(e,3)),this.setAttribute("uv",new Jt(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,n=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),n.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new en(t,6,1);return this.setAttribute("instanceStart",new Qe(n,3,0)),this.setAttribute("instanceEnd",new Qe(n,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let n=new en(t,6,1);return this.setAttribute("instanceColorStart",new Qe(n,3,0)),this.setAttribute("instanceColorEnd",new Qe(n,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new si(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new nn);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),tn.setFromBufferAttribute(t),this.boundingBox.union(tn))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new oi),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let n=this.boundingSphere.center;this.boundingBox.getCenter(n);let r=0;for(let o=0,s=e.count;o<s;o++)Je.fromBufferAttribute(e,o),r=Math.max(r,n.distanceToSquared(Je)),Je.fromBufferAttribute(t,o),r=Math.max(r,n.distanceToSquared(Je));this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};import{ShaderLib as et,ShaderMaterial as li,UniformsLib as tt,UniformsUtils as rn,Vector2 as ci}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";tt.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ci},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};et.line={uniforms:rn.merge([tt.common,tt.fog,tt.line]),vertexShader:`
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
		`};var Me=class extends li{constructor(e){super({type:"LineMaterial",uniforms:rn.clone(et.line.uniforms),vertexShader:et.line.vertexShader,fragmentShader:et.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var kt=new je,an=new Ce,sn=new Ce,ne=new je,ie=new je,ve=new je,Mt=new Ce,Ct=new mi,re=new ui,ln=new Ce,nt=new di,it=new gi,be=new je,ye,Te;function cn(i,e,t){return be.set(0,0,-e,1).applyMatrix4(i.projectionMatrix),be.multiplyScalar(1/be.w),be.x=Te/t.width,be.y=Te/t.height,be.applyMatrix4(i.projectionMatrixInverse),be.multiplyScalar(1/be.w),Math.abs(Math.max(be.x,be.y))}function vi(i,e){let t=i.matrixWorld,n=i.geometry,r=n.attributes.instanceStart,o=n.attributes.instanceEnd,s=Math.min(n.instanceCount,r.count);for(let a=0,l=s;a<l;a++){re.start.fromBufferAttribute(r,a),re.end.fromBufferAttribute(o,a),re.applyMatrix4(t);let c=new Ce,k=new Ce;ye.distanceSqToSegment(re.start,re.end,k,c),k.distanceTo(c)<Te*.5&&e.push({point:k,pointOnLine:c,distance:ye.origin.distanceTo(k),object:i,face:null,faceIndex:a,uv:null,uv1:null})}}function bi(i,e,t){let n=e.projectionMatrix,o=i.material.resolution,s=i.matrixWorld,a=i.geometry,l=a.attributes.instanceStart,c=a.attributes.instanceEnd,k=Math.min(a.instanceCount,l.count),p=-e.near;ye.at(1,ve),ve.w=1,ve.applyMatrix4(e.matrixWorldInverse),ve.applyMatrix4(n),ve.multiplyScalar(1/ve.w),ve.x*=o.x/2,ve.y*=o.y/2,ve.z=0,Mt.copy(ve),Ct.multiplyMatrices(e.matrixWorldInverse,s);for(let f=0,w=k;f<w;f++){if(ne.fromBufferAttribute(l,f),ie.fromBufferAttribute(c,f),ne.w=1,ie.w=1,ne.applyMatrix4(Ct),ie.applyMatrix4(Ct),ne.z>p&&ie.z>p)continue;if(ne.z>p){let m=ne.z-ie.z,h=(ne.z-p)/m;ne.lerp(ie,h)}else if(ie.z>p){let m=ie.z-ne.z,h=(ie.z-p)/m;ie.lerp(ne,h)}ne.applyMatrix4(n),ie.applyMatrix4(n),ne.multiplyScalar(1/ne.w),ie.multiplyScalar(1/ie.w),ne.x*=o.x/2,ne.y*=o.y/2,ie.x*=o.x/2,ie.y*=o.y/2,re.start.copy(ne),re.start.z=0,re.end.copy(ie),re.end.z=0;let C=re.closestPointToPointParameter(Mt,!0);re.at(C,ln);let u=hi.lerp(ne.z,ie.z,C),x=u>=-1&&u<=1,E=Mt.distanceTo(ln)<Te*.5;if(x&&E){re.start.fromBufferAttribute(l,f),re.end.fromBufferAttribute(c,f),re.start.applyMatrix4(s),re.end.applyMatrix4(s);let m=new Ce,h=new Ce;ye.distanceSqToSegment(re.start,re.end,h,m),t.push({point:h,pointOnLine:m,distance:ye.origin.distanceTo(h),object:i,face:null,faceIndex:f,uv:null,uv1:null})}}}var rt=class extends fi{constructor(e=new He,t=new Me({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,n=e.attributes.instanceEnd,r=new Float32Array(2*t.count);for(let s=0,a=0,l=t.count;s<l;s++,a+=2)an.fromBufferAttribute(t,s),sn.fromBufferAttribute(n,s),r[a]=a===0?0:r[a-1],r[a+1]=r[a]+an.distanceTo(sn);let o=new pi(r,2,1);return e.setAttribute("instanceDistanceStart",new on(o,1,0)),e.setAttribute("instanceDistanceEnd",new on(o,1,1)),this}raycast(e,t){let n=this.material.worldUnits,r=e.camera;if(r===null&&!n&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),n===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let o=e.params.Line2!==void 0&&e.params.Line2.threshold||0;ye=e.ray;let s=this.matrixWorld,a=this.geometry,l=this.material;Te=l.linewidth+o,a.boundingSphere===null&&a.computeBoundingSphere(),it.copy(a.boundingSphere).applyMatrix4(s);let c;if(n)c=Te*.5;else{let p=Math.max(r.near,it.distanceToPoint(ye.origin));c=cn(r,p,l.resolution)}if(it.radius+=c,ye.intersectsSphere(it)===!1)return;a.boundingBox===null&&a.computeBoundingBox(),nt.copy(a.boundingBox).applyMatrix4(s);let k;if(n)k=Te*.5;else{let p=Math.max(r.near,nt.distanceToPoint(ye.origin));k=cn(r,p,l.resolution)}nt.expandByScalar(k),ye.intersectsBox(nt)!==!1&&(n?vi(this,t):bi(this,r,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(kt),this.material.uniforms.resolution.value.set(kt.z,kt.w))}};var Le=class extends He{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setPositions(n),this}setColors(e){let t=e.length-3,n=new Float32Array(2*t);for(let r=0;r<t;r+=3)n[2*r]=e[r],n[2*r+1]=e[r+1],n[2*r+2]=e[r+2],n[2*r+3]=e[r+3],n[2*r+4]=e[r+4],n[2*r+5]=e[r+5];return super.setColors(n),this}setFromPoints(e){let t=e.length-1,n=new Float32Array(6*t);for(let r=0;r<t;r++)n[6*r]=e[r].x,n[6*r+1]=e[r].y,n[6*r+2]=e[r].z||0,n[6*r+3]=e[r+1].x,n[6*r+4]=e[r+1].y,n[6*r+5]=e[r+1].z||0;return super.setPositions(n),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}};var ot=class extends rt{constructor(e=new Le,t=new Me({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}};var _t=class extends ot{constructor(e,t){let n=new Le;n.setPositions(new Float32Array(e*3)),n.setColors(new Float32Array(e*3).fill(1)),super(n,t),this.computeLineDistances(),this.cap=e,this.pos=n.attributes.instanceStart.data.array,this.col=n.attributes.instanceColorStart.data.array,this.dist=n.attributes.instanceDistanceStart.data.array,this.frustumCulled=!1,this.renderOrder=3,n.instanceCount=0}setPoints(e,t){let n=Array.isArray(e)&&e[0]instanceof G.Vector3,r=Math.min(this.cap,n?e.length:e.length/3),o=(l,c)=>n?e[l].getComponent(c):e[l*3+c],s=0;for(let l=0;l<r-1;l++){let c=l*6;for(let w=0;w<3;w++)this.pos[c+w]=o(l,w),this.pos[c+3+w]=o(l+1,w),t&&(this.col[c+w]=t[l*3+w],this.col[c+3+w]=t[(l+1)*3+w]);let k=this.pos[c+3]-this.pos[c],p=this.pos[c+4]-this.pos[c+1],f=this.pos[c+5]-this.pos[c+2];this.dist[l*2]=s,s+=Math.sqrt(k*k+p*p+f*f),this.dist[l*2+1]=s}let a=this.geometry;return a.attributes.instanceStart.data.needsUpdate=!0,t&&(a.attributes.instanceColorStart.data.needsUpdate=!0),a.attributes.instanceDistanceStart.data.needsUpdate=!0,a.instanceCount=Math.max(0,r-1),s}get opacity(){return this.material.opacity}set opacity(e){this.material.opacity=e,this.visible=e>.003}},yi=`
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
}`,_e=class extends G.Points{constructor(e,t,n=0){let r=new G.BufferGeometry,o=new Float32Array(e*3),s=new Float32Array(e),a=new Float32Array(e*4);r.setAttribute("position",new G.BufferAttribute(o,3).setUsage(G.DynamicDrawUsage)),r.setAttribute("aSize",new G.BufferAttribute(s,1).setUsage(G.DynamicDrawUsage)),r.setAttribute("aColor",new G.BufferAttribute(a,4).setUsage(G.DynamicDrawUsage));let l=new G.ShaderMaterial({vertexShader:yi,fragmentShader:wi,uniforms:{uScale:t,uOpacity:{value:1},uSoft:{value:n}},transparent:!0,depthWrite:!1});super(r,l),this.count=e,this.pos=o,this.size=s,this.color=a,this.frustumCulled=!1,this.renderOrder=3}set(e,t,n,r,o,s,a){let l=e*3,c=e*4;this.pos[l]=t,this.pos[l+1]=n,this.pos[l+2]=r,this.size[e]=o,this.color[c]=s[0],this.color[c+1]=s[1],this.color[c+2]=s[2],this.color[c+3]=a}commit(){let e=this.geometry.attributes;e.position.needsUpdate=!0,e.aSize.needsUpdate=!0,e.aColor.needsUpdate=!0}set soft(e){this.material.uniforms.uSoft.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},xi=`
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
}`,Fe=class extends G.Mesh{constructor(e,t,n=0){let r=new G.InstancedBufferGeometry;r.setAttribute("position",new G.BufferAttribute(new Float32Array([0,-1,0,1,-1,0,1,1,0,0,1,0]),3)),r.setIndex([0,1,2,0,2,3]);let o=new Float32Array(e*3),s=new Float32Array(e*3),a=new Float32Array(e*4),l=new Float32Array(e),c=(p,f)=>new G.InstancedBufferAttribute(p,f).setUsage(G.DynamicDrawUsage);r.setAttribute("aStart",c(o,3)),r.setAttribute("aEnd",c(s,3)),r.setAttribute("aColor",c(a,4)),r.setAttribute("aWidth",c(l,1)),r.instanceCount=e;let k=new G.ShaderMaterial({vertexShader:xi,fragmentShader:Si,uniforms:{uRes:{value:t},uTail:{value:n},uOpacity:{value:1}},transparent:!0,depthWrite:!1});super(r,k),this.count=e,this.start=o,this.end=s,this.color=a,this.width=l,this.frustumCulled=!1,this.renderOrder=3,this.userData.kind="streaks"}set(e,t,n,r,o,s,a,l,c,k){let p=e*3,f=e*4;this.start[p]=t,this.start[p+1]=n,this.start[p+2]=r,this.end[p]=o,this.end[p+1]=s,this.end[p+2]=a,this.width[e]=l,this.color[f]=c[0],this.color[f+1]=c[1],this.color[f+2]=c[2],this.color[f+3]=k}commit(){let e=this.geometry.attributes;e.aStart.needsUpdate=!0,e.aEnd.needsUpdate=!0,e.aColor.needsUpdate=!0,e.aWidth.needsUpdate=!0}set tail(e){this.material.uniforms.uTail.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},at=class{constructor(e,t,n){this.look=e;this.resolution=t,this.pointScale=n}lineMaterial(e={}){let t=new Me({color:e.vertexColors?16777215:new G.Color(e.color??this.look.ink).getHex(),linewidth:e.width??1.25,transparent:!0,opacity:e.opacity??1,dashed:!!e.dashed,dashSize:e.dash??.08,gapSize:e.gap??.08,vertexColors:!!e.vertexColors,depthWrite:!1});return t.uniforms.resolution.value=this.resolution,t}line(e,t={}){let n=new _t(e,this.lineMaterial(t));return n.userData.baseWidth=t.width??1.25,t.vertexColors||(n.userData.role=(t.color??this.look.ink).toLowerCase()===this.look.accent.toLowerCase()?"active":"muted"),n}particles(e,t=0){return new _e(e,this.pointScale,t)}streaks(e,t=0){return new Fe(e,this.resolution,t)}linear(e){let t=new G.Color(e);return[t.r,t.g,t.b]}srgb(e){let t=ge(e);return[t.x,t.y,t.z]}};import*as un from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var dn=.3,Ei=10,hn=.01;function Ge(i){let e=[];return i.traverse(t=>{(t instanceof _e||t instanceof Fe)&&e.push(t)}),e}var st=()=>({x:0,y:0,z:0,s:0,c:[0,0,0,0]});function ki(i,e,t,n){let r=e*3,o=e*4,s=i instanceof _e?i.pos:i.end;return n.x=s[r],n.y=s[r+1],n.z=s[r+2],n.s=i instanceof _e?Math.max(i.size[e]*t,.5):i.width[e],n.c[0]=i.color[o],n.c[1]=i.color[o+1],n.c[2]=i.color[o+2],n.c[3]=i.visible?i.color[o+3]*i.opacity:0,n}function ct(i){let e=i.reduce((o,s)=>o+s.count,0),t=new Uint16Array(e),n=new Uint32Array(e),r=0;return i.forEach((o,s)=>{for(let a=0;a<o.count;a++,r++)t[r]=s,n[r]=a}),{n:e,fields:i,field:t,local:n,read:(o,s,a)=>ki(i[t[o]],n[o],s,a)}}function mn(i,e){let t=ct(i),n=st(),r=[],o=[],s=[];for(let a=0;a<t.n;a++)t.read(a,e,n),!(n.c[3]<hn)&&(r.push(n.x,n.y,n.z),o.push(n.s),s.push(...n.c));return{n:o.length,read(a,l,c){c.x=r[a*3],c.y=r[a*3+1],c.z=r[a*3+2],c.s=o[a];for(let k=0;k<4;k++)c.c[k]=s[a*4+k];return c}}}function pn(i,e){let t=st(),n=[],r=[],o=[];for(let s=0;s<i.n;s++)i.read(s,e,t),!(t.c[3]<hn)&&(n.push(s),r.push(Math.hypot(t.x,t.z)),o.push(Math.atan2(t.z,t.x)));return{idx:n,r:Float64Array.from(r),a:Float64Array.from(o)}}var lt=class{constructor(e,t,n,r,o){this.src=e;this.look=n;this.resolution=r;this.pointScale=o;this.group=new un.Group;this.dots=null;this.trails=null;this.p=0;this.links=null;this.carried=new Uint8Array(0);this.sd=st();this.td=st();this.target=ct(t),this.group.name="morph"}get done(){return this.p>=1}link(e){let t=pn(this.src,e),n=pn(this.target,e),r=t.idx.length,o=n.idx.length,s=(C,u)=>Array.from({length:C},(x,E)=>E).sort((x,E)=>u[x]-u[E]),a={s:s(r,t.r),t:s(o,n.r)},l=Math.max(1,Math.min(Ei,r,o)),c=[],k=[],p=[],f=[],w=[];if(r&&o)for(let C=0;C<l;C++){let u=a.s.slice(Math.floor(C*r/l),Math.floor((C+1)*r/l)).sort((m,h)=>t.a[m]-t.a[h]),x=a.t.slice(Math.floor(C*o/l),Math.floor((C+1)*o/l)).sort((m,h)=>n.a[m]-n.a[h]),E=Math.max(u.length,x.length);for(let m=0;m<E;m++){let h=Math.floor(m*u.length/E),y=Math.floor(m*x.length/E);c.push(t.idx[u[h]]),k.push(n.idx[x[y]]),p.push(m===0||Math.floor((m-1)*u.length/E)!==h?1:0),f.push(m===0||Math.floor((m-1)*x.length/E)!==y?1:0),w.push(dn*(.7*(l>1?C/(l-1):0)+.3*N(c.length*.731)))}}let b=c.length;this.links={n:b,s:Uint32Array.from(c),t:Uint32Array.from(k),sKeep:Uint8Array.from(p),tKeep:Uint8Array.from(f),delay:Float32Array.from(w)},this.carried=new Uint8Array(this.target.n);for(let C of k)this.carried[C]=1;b&&(this.trails=new Fe(b,this.resolution,0),this.dots=new _e(b,this.pointScale),this.group.add(this.trails,this.dots))}update(e,t,n){if(this.links||this.link(t),this.p=Math.min(1,this.p+e/Math.max(.05,this.look.duration)),this.done)return;let r=this.links,{src:o,target:s,sd:a,td:l}=this,c=n,k=this.look.swirl,p=this.look.trail,f=[0,0,0],w=[0,0,0],b=[0,0,0],C=(m,h)=>{let y=Math.atan2(a.z,a.x),R=Math.hypot(a.x,a.z),A=Math.atan2(l.z,l.x),z=Math.hypot(l.x,l.z),O=A-y;O-=Math.round(O/(2*Math.PI))*2*Math.PI;let F=y+O*h+k*Math.sin(Math.PI*h),I=V(R,z,h);m[0]=Math.cos(F)*I,m[1]=V(a.y,l.y,h),m[2]=Math.sin(F)*I},{dots:u,trails:x}=this;if(u&&x){for(let m=0;m<r.n;m++){o.read(r.s[m],t,a),s.read(r.t[m],t,l);let h=fe((this.p-r.delay[m])/(1-dn)),y=se(h);C(f,y),C(w,se(h-p));for(let F=0;F<3;F++)b[F]=V(a.c[F],l.c[F],y);let R=V(a.c[3]*r.sKeep[m],l.c[3]*r.tKeep[m],y),A=f[0]*f[0]+(f[1]-c)**2+f[2]*f[2]<c*c*1.02?0:R,z=V(a.s,l.s,y);u.set(m,f[0],f[1],f[2],z/t,b,A);let O=Math.hypot(f[0]-w[0],f[1]-w[1],f[2]-w[2]);x.set(m,w[0],w[1],w[2],f[0],f[1],f[2],z,b,A*.7*W(0,.08,O))}u.commit(),x.commit()}let E=se(this.p);for(let m=0;m<s.n;m++)s.fields[s.field[m]].color[s.local[m]*4+3]*=this.carried[m]?0:E;for(let m of s.fields)m.commit()}dispose(){this.group.removeFromParent();for(let e of[this.dots,this.trails])e?.geometry.dispose(),e?.material.dispose()}};import*as oe from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as De from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";function fn(i){i.updateMatrixWorld();let e=i.matrixWorld.elements,t=new De.Vector3(e[0],e[1],e[2]).normalize(),n=new De.Vector3(e[4],e[5],e[6]).normalize(),r=new De.Vector3(e[8],e[9],e[10]).normalize(),o=new De.Vector3(t.x,0,t.z).normalize(),s=new De.Vector3(r.x,0,r.z).normalize();return{right:t,up:n,toViewer:r,floorRight:o,floorFront:s}}var Rt=10,dt=[{who:"caller",a:.4,b:2.6},{who:"agent",a:3.15,b:5.55},{who:"caller",a:4.15,b:4.55,kind:"backchannel"},{who:"caller",a:5.4,b:7.6,kind:"interrupt"},{who:"agent",a:8.15,b:9.55}];function Mi(i,e,t,n,r){let o=t+n,s=Math.floor(i/o),a=(i-s*o)/t;return a>1||N(s*1.7+e)<r?0:(.6+.4*N(s*2.1+e))*Math.pow(Math.sin(Math.PI*a),1.2)}function Ne(i,e,t,n,r){for(let o of dt){if(o.who!==e)continue;let s=o.b;if(e==="agent"){let l=dt.find(c=>c.kind==="interrupt"&&c.a>o.a&&c.a<o.b);l&&(s=Math.min(s,l.a+.12))}if(i<o.a||i>s)continue;let a=Math.min(1,(i-o.a)/.06,(s-i)/.06);return o.kind==="backchannel"?.55*Math.sin(Math.PI*fe((i-o.a)/(s-o.a))):Mi(i-o.a,e==="caller"?3:7,t,n,r)*a}return 0}var At=[{name:"Nova",trait:"Warm, natural",mid:"#00ccff",high:"#3d64ff"},{name:"Aria",trait:"Bright, upbeat",mid:"#8fb4ff",high:"#5b6cff"},{name:"Ember",trait:"Warm, bold",mid:"#f7962f",high:"#ff6000"},{name:"Iris",trait:"Clear, friendly",mid:"#a99bff",high:"#6d5cff"},{name:"Jun",trait:"Soft, steady",mid:"#7fd3ff",high:"#3d64ff"}];var Oe=["query","retrieval","flow"],Tt=12,Ot=[{part:"query",t:.7,dir:"out"},{part:"retrieval",t:1.6,dir:"in"},{part:"flow",t:4.4,dir:"in"},{part:"retrieval",t:6.5,dir:"in"},{part:"query",t:8.6,dir:"out"},{part:"retrieval",t:9.5,dir:"in"}],gn=1.5,pt=.6;function ut(i,e){let t=0;for(let n of Ot){if(n.part!==i)continue;let r=e-n.t;r<0||r>gn||(t=Math.max(t,Math.min(se(fe(r/(pt*.9))),se(fe((gn-r)/.6)))))}return t}var vn=[0,0,0],q=(i,e,t)=>{for(let n=0;n<3;n++)vn[n]=V(i[n],e[n],t);return vn},Q=i=>i.params,zt=(i,e,t,n)=>i*i+(e-n)*(e-n)+t*t<n*n*1.02;function we(i){let{kit:e,particles:t,hueShift:n}=i;return{ink:e.srgb(t.muted),accent:e.srgb(Be(t.active,n)),high:e.srgb(Be(t.highlight,n))}}var Ht=42,Lt=(i,e,t,n)=>Math.round(i*n/e/(H/t)),Ft=(i,e,t,n,r)=>i+((t-r*n)%e+e)%e,Y="Particle look \xB7 this scene",xe={own_size:{value:!1,label:"own dot size",group:Y},p_size:{value:1.5,min:.5,max:5,step:.05,label:"dot size",group:Y},own_emphasis:{value:!1,label:"own lit / crest \xD7",group:Y},p_emphasis:{value:1.6,min:1,max:3,step:.05,label:"lit / crest \xD7",group:Y},own_density:{value:!1,label:"own density",group:Y,rebuild:!0},p_density:{value:1,min:.2,max:3,step:.05,label:"density",group:Y,rebuild:!0},own_scatter:{value:!1,label:"own scatter",group:Y},p_scatter:{value:.025,min:0,max:.15,step:.001,label:"scatter",group:Y},own_idle:{value:!1,label:"own idle movement",group:Y},p_idle:{value:.012,min:0,max:.08,step:.001,label:"idle movement",group:Y},own_idleSpeed:{value:!1,label:"own idle speed",group:Y},p_idleSpeed:{value:3,min:0,max:12,step:1,label:"idle wiggles / loop",group:Y},own_muted:{value:!1,label:"own muted colour",group:Y},p_muted:{value:"#1A1C22",label:"muted colour",group:Y},own_active:{value:!1,label:"own active colour",group:Y},p_active:{value:"#3E6AEF",label:"active colour",group:Y},own_highlight:{value:!1,label:"own highlight colour",group:Y},p_highlight:{value:"#3E8CF7",label:"highlight colour",group:Y}},Ie=(i,e)=>Math.max(12,Math.round(H*e*Ht*i.particles.density)),he=i=>({s:.75+N(i*1.31)*.5,sr:N(i*2.17+3)-.5,sy:N(i*3.71+7),ph:N(i*5.03+11)*H});function me(i,e,t,n,r){let o=Math.max(0,Math.round(i.idleSpeed)),s=H*o*t/n;return r[0]=i.scatter*2*e.sr+i.idle*Math.sin(s+e.ph),r[1]=i.scatter*e.sy+i.idle*.7*(1+Math.sin(H*(o+1)*t/n+e.ph*2)),r}function We(i){let e=i.arch==="s2s"?1:0;return t=>e+=((i.arch==="s2s"?1:0)-e)*(1-Math.exp(-t*3))}var Ci={outer:{value:3.6,min:2,max:5,step:.05,label:"field radius",rebuild:!0},cloud:{value:1.6,min:.2,max:3,step:.05,label:"cloud height",rebuild:!0},lanes:{value:.14,min:.05,max:.5,step:.01,label:"lane spacing",rebuild:!0},jitter:{value:.08,min:0,max:.4,step:.005,label:"noise jitter"},bob:{value:.14,min:0,max:.6,step:.005,label:"noise vertical"},waveStart:{value:1.6,min:0,max:6,step:.05,label:"clear at s"},waveTime:{value:2.8,min:.3,max:6,step:.05,label:"clear over s"},front:{value:.6,min:.05,max:2,step:.05,label:"front softness"},flow:{value:.35,min:0,max:2,step:.01,label:"lane speed"},trail:{value:.45,min:0,max:2,step:.01,label:"trail s"},dotOpacity:{value:.38,min:0,max:1,step:.01,label:"dust opacity"},streakOpacity:{value:.85,min:0,max:1,step:.01,label:"streak opacity"},tail:{value:0,min:0,max:1,step:.01,label:"tail opacity"},...xe},_i={duration:9,orb:"listening",params:Ci,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=Math.max(100,Math.round(2600*i.particles.density)),a=e.particles(s),l=e.streaks(s);t.add(a,l);let c=St(3),k=b=>Math.max(1,Math.round(b*r/H))*H/r,p=Array.from({length:s},(b,C)=>{let u=Math.sqrt(V((n*1.25)**2,o.outer**2,c())),x=n*1.25+Math.round((u-n*1.25)/o.lanes)*o.lanes,E=.7+c()*1.4,m=[1.3,2.1,5.3,4.7,3.1,7].map(h=>k(E*h));return{r:u,rl:x,a:c()*H,y:.05+Math.pow(c(),1.7)*o.cloud,w:m,g:he(C)}}),f=[0,0],w=We(i);return{update({t:b,age:C,dt:u,presence:x,loopOut:E}){let m=we(i),h=Q(i),y=w(u),R=n*1.25,A=o.outer-R,z=i.particles,O=b<h.waveStart?0:n*1.1+Ue((b-h.waveStart)/h.waveTime)*(o.outer+h.front+.2-n*1.1),F=C-b>r/2,I=xt(b,F?0:-1/0,E?r:1/0,.5,.7)*x;for(let T=0;T<s;T++){let M=p[T],g=se(W(M.r-h.front*.3,M.r+h.front*.7,O)),d=M.w,v=M.g.ph*16,S=M.a+Math.sin(b*d[0]+v)*.1,P=M.r+Math.sin(b*d[1]+v*1.7)*h.jitter*2,_=Math.cos(S)*P+Math.sin(b*d[2]+v)*h.jitter,L=Math.sin(S)*P+Math.cos(b*d[3]+v)*h.jitter,U=M.y+Math.sin(b*d[4]+v*2.3)*h.bob;me(z,M.g,b,r,f);let B=.45*y*Math.max(0,b-h.waveStart),j=R+((M.rl-R-B)%A+A)%A,X=y>.01?W(R,R+.35,j)*(1-W(o.outer-.5,o.outer,j)):1,ae=V(M.rl,j,y)+f[0],pe=.02+f[1],ue=h.flow/M.rl,Se=M.a-b*ue,Pe=Se+ue*h.trail,D=ae+.45*y*h.trail,ee=V(_,Math.cos(Se)*ae,g),ce=V(U,pe,g),te=V(L,Math.sin(Se)*ae,g),Ae=V(ee,Math.cos(Pe)*D,g),$n=V(te,Math.sin(Pe)*D,g),Nt=zt(ee,ce,te,n)?0:1,Wt=1-W(n*1.2,o.outer,V(M.rl,ae,y));a.set(T,ee,ce,te,z.size*M.g.s,m.ink,(1-g)*h.dotOpacity*I*Nt*(.75+.25*Math.sin(b*d[5]+v))),l.set(T,Ae,pe,$n,ee,ce,te,z.size*M.g.s,q(m.accent,m.high,Wt*.6),g*h.streakOpacity*I*Nt*X*(.55+.45*Wt))}l.tail=h.tail,a.commit(),l.commit(),i.orb.listen=Ee(b,3)*.8}}}};function Pt(i,e,t,n,r){for(let o=0;o<e;o++){let s=o/(e-1)*H;i[o*3]=Math.cos(s)*t,i[o*3+1]=n+r(s),i[o*3+2]=Math.sin(s)*t}}var Ri={rotation:{value:0,min:-180,max:180,step:1,label:"rotation \xB0"},spin:{value:3,min:-30,max:30,step:.5,label:"spin \xB0/s"},radius:{value:1.95,min:1.2,max:3.5,step:.01,label:"radius \xD7orb"},height:{value:.26,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:64,min:8,max:200,step:1,label:"wave cycles"},wordLength:{value:.4,min:.1,max:1.2,step:.01,label:"word length s"},wordGap:{value:.2,min:0,max:1,step:.01,label:"word gap s"},pauses:{value:.15,min:0,max:.8,step:.01,label:"pause chance"},lineWidth:{value:1.4,min:.5,max:4,step:.05,label:"caller line width"},lineColor:{value:"#1A1C22",label:"caller colour"},lineOpacity:{value:.85,min:0,max:1,step:.01,label:"caller opacity"},dotOpacity:{value:1,min:0,max:1,step:.01,label:"agent opacity"},previous:{value:.35,min:0,max:1,step:.01,label:"previous pass"},guide:{value:!0,label:"guide ring"},guideOpacity:{value:.2,min:0,max:1,step:.01,label:"guide opacity"},playhead:{value:!0},playheadLength:{value:.3,min:.05,max:1,step:.01,label:"playhead length"},playheadWidth:{value:1.3,min:.5,max:6,step:.05,label:"playhead width"},playheadColor:{value:"#1A1C22",label:"playhead colour"},playheadOpacity:{value:.45,min:0,max:1,step:.01,label:"playhead opacity"},markers:{value:!0,label:"hand-off ticks"},markerLength:{value:.22,min:.05,max:1,step:.01,label:"tick length"},markerWidth:{value:1.1,min:.5,max:6,step:.05,label:"tick width"},markerColor:{value:"#1A1C22",label:"tick colour"},markerOpacity:{value:.4,min:0,max:1,step:.01,label:"tick opacity"},...xe},Ai={duration:Rt,orb:"listening",params:Ri,morph:!1,create(i){let{kit:e,group:t,look:n}=i,r=i.orbRadius,o=Rt,s=(O,F,I=.015)=>new oe.Vector3(Math.cos(F)*O,I,Math.sin(F)*O),a=e.line(240,{width:1,color:n.ink,opacity:.2,dashed:!0,dash:.05,gap:.07}),l=new Float32Array(720);t.add(a);let c=Math.max(400,Math.round(1600*i.particles.density)),k=24,p=Array.from({length:k},()=>{let O=e.line(c,{width:1.4,vertexColors:!0});return t.add(O),O}),f=new Float32Array(c*3),w=e.particles(c);t.add(w);let b=Array.from({length:c},(O,F)=>he(F)),C=new Float32Array(c),u=new Uint8Array(c),x=[],E="",m=(O,F,I)=>{let T=`${O}|${F}|${I}`;if(T===E)return;E=T;for(let g=0;g<c;g++){let d=g/c*o,v=Ne(d,"caller",O,F,I),S=Ne(d,"agent",O,F,I);C[g]=Math.max(v,S),u[g]=S>v?1:0}x=[];let M=-1;for(let g=0;g<=c;g++){let d=g<c&&!u[g];d&&M<0&&(M=g),!d&&M>=0&&(x.push([M,g]),M=-1)}},h=new Float32Array(c*3),y=[0,0],R=e.line(2,{width:1.3,color:n.ink,opacity:.5});t.add(R);let A=[{t:3,title:"End of turn"},{t:4.25,title:"Backchannel"},{t:5.45,title:"Interrupt \u2192 yield"},{t:8,title:"End of turn"}].map(O=>{let F=e.line(2,{width:1.1,color:n.ink,opacity:.4});return t.add(F),{...O,l:F}}),z=We(i);return{update({t:O,age:F,dt:I,presence:T}){let M=we(i),g=Q(i),d=z(I),v=i.particles,S=Math.PI*.75+oe.MathUtils.degToRad(g.rotation+g.spin*F),P=D=>S+D/o*H,_=g.radius*r;m(g.wordLength,g.wordGap,g.pauses);let L=F<o,U=L?Math.min(c,Math.floor(O/o*c)+1):c,B=D=>1-(1-g.previous)*(((O-D)%o+o)%o)/o,j=e.linear(g.lineColor),X=e.linear(n.bg),ae=Math.round(g.cycles);for(let D=0;D<U;D++){let ee=P(D/c*o);h[D*3]=Math.cos(ee)*_,h[D*3+1]=.015+C[D]*g.height*Math.sin(ae*(ee-S)),h[D*3+2]=Math.sin(ee)*_;let ce=B(D/c*o);for(let te=0;te<3;te++)f[D*3+te]=V(X[te],j[te],ce)}x.forEach(([D,ee],ce)=>{if(ce>=k)return;let te=p[ce],Ae=Math.min(ee+1,U);if(Ae-D<2){te.opacity=0;return}te.setPoints(h.subarray(D*3,Ae*3),f.subarray(D*3,Ae*3)),te.material.linewidth=g.lineWidth,te.opacity=g.lineOpacity*T*(1-d)});for(let D=x.length;D<k;D++)p[D].opacity=0;for(let D=0;D<c;D++){if(D>=U||!u[D]&&d<.01){w.color[D*4+3]=0;continue}let ee=b[D];me(v,ee,O,o,y);let ce=P(D/c*o),te=u[D]?q(M.accent,M.high,.15):M.ink,Ae=u[D]?g.dotOpacity:g.lineOpacity*.75*d;w.set(D,Math.cos(ce)*(_+y[0]),h[D*3+1]+y[1],Math.sin(ce)*(_+y[0]),v.size*ee.s,te,Ae*T*B(D/c*o))}w.commit(),Pt(l,240,_,.015,()=>0),a.setPoints(l),a.opacity=g.guide?g.guideOpacity*T:0;let pe=P(O);R.setPoints([s(_-g.playheadLength,pe),s(_+g.playheadLength,pe)]),R.material.linewidth=g.playheadWidth,R.material.color.set(g.playheadColor),R.opacity=g.playhead?g.playheadOpacity*T:0,A.forEach(D=>{let ee=L&&O<=D.t?0:T*B(D.t)*(L?Ue((O-D.t)/.3):1);D.l.setPoints([s(_+.12,P(D.t)),s(_+.12+g.markerLength,P(D.t))]),D.l.material.linewidth=g.markerWidth,D.l.material.color.set(g.markerColor),D.l.opacity=g.markers?g.markerOpacity*ee:0});let ue=Ne(O,"caller",g.wordLength,g.wordGap,g.pauses),Se=Ne(O,"agent",g.wordLength,g.wordGap,g.pauses),Pe=dt.some(D=>D.who==="agent"&&O>=D.a&&O<=Math.min(D.b,5.52));i.orb.state=Se>0||Pe?"speaking":"listening",i.orb.listen=ue,i.orb.speak=Se}}}},Ti={rings:{value:5,min:1,max:9,step:1,rebuild:!0},inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.2,min:.05,max:.6,step:.01,label:"ring spacing",rebuild:!0},tilt:{value:24,min:0,max:60,step:1,label:"max tilt \xB0",rebuild:!0},speed:{value:1,min:0,max:4,step:1,label:"turns / loop"},comets:{value:1,min:0,max:4,step:1,label:"comets per ring"},cometSpeed:{value:3,min:1,max:8,step:1,label:"comet turns / loop"},comet:{value:.9,min:.1,max:3,step:.05,label:"comet length"},opacity:{value:.42,min:0,max:1,step:.01,label:"ring opacity"},cometOpacity:{value:1,min:0,max:1,step:.01,label:"comet opacity"},...xe},Oi={duration:9,orb:"thinking",params:Ti,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=Math.round(o.rings),a=St(17),l=0,c=Array.from({length:s},(w,b)=>{let C=oe.MathUtils.degToRad(o.tilt)*(.35+.65*N(b*3.7+1)),u=b/s*Math.PI+N(b*1.9)*.6,x=new oe.Quaternion().setFromEuler(new oe.Euler(C,u,0,"YXZ")),E=new oe.Vector3(1,0,0).applyQuaternion(x),m=new oe.Vector3(0,0,1).applyQuaternion(x),h=new oe.Vector3(0,1,0).applyQuaternion(x),y=n*o.inner+b*o.spacing,R=Ie(i,y),A=Array.from({length:R},(z,O)=>({a:O/R*H+(a()-.5)*(H/R),g:he(l+O)}));return l+=R,{ax:E,ay:m,n:h,r:y,dir:b%2?-1:1,phase:N(b*5.3)*H,dots:A}}),k=e.particles(l);t.add(k);let p=new oe.Vector3,f=[0,0];return{update({t:w,presence:b}){let C=we(i),u=Q(i),x=i.particles,E=Math.round(u.comets),m=0;c.forEach((h,y)=>{let R=h.dir*(H*w*Math.round(u.speed)*(1+y%2))/r,A=h.phase+h.dir*(H*w*Math.round(u.cometSpeed))/r;for(let z of h.dots){let O=z.a+R;me(x,z.g,w,r,f);let F=h.r*V(.85,1,Ue(b))+f[0];p.set(0,n,0).addScaledVector(h.ax,Math.cos(O)*F).addScaledVector(h.ay,Math.sin(O)*F).addScaledVector(h.n,f[1]-x.scatter*.5);let I=0;for(let M=0;M<E;M++){let g=((A+M*H/Math.max(1,E)-O)*h.dir%H+H)%H;I=Math.max(I,Math.exp(-g/(u.comet*.35)))}let T=W(0,.12,p.y)*(zt(p.x,p.y,p.z,n)?0:1)*b;k.set(m++,p.x,p.y,p.z,x.size*V(1,x.emphasis,I)*z.g.s,q(C.ink,q(C.accent,C.high,I),Math.min(1,.35+I)),V(u.opacity,u.cometOpacity,I)*T)}}),k.commit()}}}},Pi={outer:{value:3.6,min:2,max:5,step:.05,label:"arm reach",rebuild:!0},swirl:{value:-60,min:-180,max:180,step:1,label:"arm swirl \xB0",rebuild:!0},lanes:{value:9,min:1,max:15,step:1,rebuild:!0},width:{value:.45,min:.05,max:1,step:.01,label:"ribbon width",rebuild:!0},loops:{value:1,min:1,max:3,step:1,label:"passes / loop"},height:{value:.32,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:70,min:10,max:200,step:1,label:"wave cycles"},phrases:{value:5,min:1,max:12,step:1,label:"phrases"},dive:{value:.7,min:0,max:1.2,step:.01,label:"dive into orb \xD7orb"},opacity:{value:.6,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:1,min:0,max:1,step:.01,label:"crest opacity"},...xe},zi={duration:9,orb:"speaking",params:Pi,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=9,o=Q(i),s=n*.9,a=o.outer,l=oe.MathUtils.degToRad(o.swirl),c=Math.PI*.75,k=(h,y)=>{let R=h<.5,A=R?h*2:(1-h)*2;return y[0]=V(a,s,A),y[1]=c+(R?0:Math.PI)+l*A,y[2]=n*o.dive*W(.7,1,A),y[3]=A,y},p=[0,0,0,0],f=[0,0,0,0],w=0;for(let h=0;h<400;h++)k(h/400,p),k((h+1)/400,f),h!==199&&(w+=Math.hypot(f[0]*Math.cos(f[1])-p[0]*Math.cos(p[1]),f[0]*Math.sin(f[1])-p[0]*Math.sin(p[1]),f[2]-p[2]));let b=Math.round(o.lanes),C=Math.max(60,Math.round(w*Ht*i.particles.density)),u=[];for(let h=0;h<b;h++){let y=b>1?(h/(b-1)-.5)*o.width:0,R=N(h*7.3)/C;for(let A=0;A<C;A++)u.push({u:A/C+R,w:y,g:he(u.length)})}let x=e.particles(u.length);t.add(x);let E=[0,0],m=[0,0,0,0];return{update({t:h,presence:y}){let R=we(i),A=Q(i),z=i.particles,O=Math.round(A.loops)*h/r,F=Math.round(A.phrases),I=M=>{let g=M*F,d=Math.floor(g),v=g-d;return(v>.8?0:Math.pow(Math.sin(Math.PI*v/.8),.8)*(.6+.4*N(d*4.7+1)))*(.5+.5*Math.sin(H*A.cycles*M))},T=0;for(let M=0;M<u.length;M++){let g=u[M],d=((g.u+O)%1+1)%1;k(d,m),me(z,g.g,h,r,E);let v=m[0]+(g.w*(1-m[3]*.6)+E[0]),S=I((g.u%1+1)%1),P=Math.cos(m[1])*v,_=Math.sin(m[1])*v,L=.02+E[1]+m[2]+A.height*S*(1-W(.75,1,m[3])),U=W(0,.15,m[3])*(zt(P,L,_,n)?0:1),B=d<.5?.55+.45*S:.75+.25*S,j=q(R.ink,q(R.accent,R.high,S),B);x.set(M,P,L,_,z.size*V(1,z.emphasis,S)*g.g.s,j,V(A.opacity,A.crestOpacity,S)*U*y),d>=.5&&m[3]>.85&&(T=Math.max(T,S))}x.commit(),i.orb.speak=.35+.55*T,i.orb.listen=.4}}}},Hi={steps:{value:4,min:2,max:6,step:1,rebuild:!0},inner:{value:1.4,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.5,min:.15,max:1.2,step:.01,label:"ring spacing",rebuild:!0},start:{value:135,min:0,max:360,step:1,label:"start angle \xB0"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},opacity:{value:.32,min:0,max:1,step:.01,label:"ring opacity"},litOpacity:{value:.95,min:0,max:1,step:.01,label:"comet opacity"},doneOpacity:{value:.7,min:0,max:1,step:.01,label:"done opacity"},comet:{value:.5,min:.05,max:2,step:.01,label:"comet length"},flash:{value:.6,min:0,max:2,step:.01,label:"check flash"},...xe},Li={duration:10,orb:"thinking",params:Hi,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=Math.round(o.steps),a=Array.from({length:s},(b,C)=>n*o.inner+C*o.spacing),l=a.map(b=>Ie(i,b)),c=[],k=a.map(()=>0);a.forEach((b,C)=>{k[C]=c.length;for(let u=0;u<l[C];u++)c.push({ring:C,j:u,a:u/l[C]*H,g:he(c.length)})});let p=e.particles(c.length);t.add(p);let f=8.4/s,w=[0,0];return{update({t:b,age:C,presence:u,loopOut:x}){let E=we(i),m=Q(i),h=i.particles,y=oe.MathUtils.degToRad(m.start),R=x?1-W(9.2,9.9,b):1,A=a.map((I,T)=>{let M=.3+T*f,g=se((b-M)/(f*.65)),d=b>M+f*.65?Math.exp(-(b-M-f*.65)/.25):0;return{run:g,flash:d,active:b>=M&&b<M+f*.65}}),z=a.map((I,T)=>(T%2?-1:1)*Lt(m.ringSpeed,I,l[T],r)),O=z.map((I,T)=>I*(H/l[T])*b/r),F=Math.round((C-b)/r);for(let I=0;I<c.length;I++){let{ring:T,j:M}=c[I],g=c[Ft(k[T],l[T],M,z[T],F)].g,d=A[T],v=c[I].a+O[T];me(h,g,b,r,w);let S=a[T]+w[0],P=((v-y)%H+H)%H/H,_=P<=d.run?1:0,L=d.run-P,U=d.active&&L>=0?Math.exp(-L/(m.comet*.12)):0,B=Math.max(U,_*(d.run>=1?1:.55)),j=d.flash*m.flash*R,X=h.size*V(1,h.emphasis,Math.max(U,_*.5)*R)*g.s*(1+j*.4),ae=Math.max(m.opacity,V(m.opacity,Math.max(_*(d.run>=1?m.doneOpacity:m.doneOpacity*.8),U*m.litOpacity),R))*(1+j*.4),pe=q(E.ink,q(E.accent,E.high,U*.5),Math.min(1,B/.02)*R);p.set(I,Math.cos(v)*S,.02+w[1]+j*.05,Math.sin(v)*S,X,pe,Math.min(1,ae)*u)}p.commit()}}}},Fi={spacing:{value:.14,min:.05,max:.4,step:.005,label:"ring spacing",rebuild:!0},inner:{value:1.2,min:1,max:2,step:.01,label:"inner radius \xD7orb",rebuild:!0},outer:{value:3.7,min:2,max:5.5,step:.05,label:"outer radius",rebuild:!0},height:{value:.3,min:0,max:.8,step:.005,label:"wave height"},waves:{value:5,min:1,max:16,step:1,label:"waves / loop"},wavelength:{value:.55,min:.15,max:2,step:.01},hold:{value:.55,min:.05,max:.95,step:.01,label:"crest hold"},crestColor:{value:1,min:0,max:1,step:.01,label:"crest colour"},phrase:{value:1.5,min:.3,max:4,step:.05,label:"phrase s"},pause:{value:.5,min:0,max:2,step:.05,label:"pause s"},swell:{value:.35,min:0,max:1,step:.01,label:"phrase variation"},drift:{value:1,min:0,max:4,step:1,label:"drift turns / loop"},spokenFrom:{value:2.2,min:0,max:9,step:.1,label:"spoken from s"},spokenTo:{value:3.6,min:0,max:9,step:.1,label:"spoken by s"},decay:{value:.5,min:0,max:1,step:.01,label:"height decay"},opacity:{value:.3,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:.95,min:0,max:1,step:.01,label:"crest opacity"},...xe},Di={duration:10,orb:"speaking",params:Fi,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=n*o.inner,a=[];for(let f=s,w=0;f<=o.outer;f+=o.spacing,w++){let b=Ie(i,f),C=N(f*13.1)*H;for(let u=0;u<b;u++)a.push({r:f,a:C+u/b*H,ring:w,g:he(a.length)})}let l=a.length,c=e.particles(l);t.add(c);let k=[0,0],p=We(i);return{update({t:f,dt:w,presence:b}){let C=we(i),u=Q(i),x=i.particles,E=p(w),m=T=>V(W(u.spokenFrom,Math.max(u.spokenFrom+.01,u.spokenTo),T),1,E)*(1-W(8.4,9.8,T)),h=Math.round(u.waves),y=h*u.wavelength/r,R=o.outer-s,A=u.phrase+u.pause,z=T=>{let M=Math.floor(T/A),g=(T-M*A)/u.phrase;return g>1?0:Math.pow(Math.sin(Math.PI*g),.9)*(1-u.swell+u.swell*N(M*4.7+1))},O=H*Math.round(u.drift)*f/r;for(let T=0;T<l;T++){let{r:M,ring:g,g:d}=a[T],v=M-s;me(x,d,f,r,k);let S=M+k[0],P=a[T].a+(g%2?-O:O)*(.4+.6*(s/M)),_=v/u.wavelength-h*f/r,L=((f-v/y)%r+r)%r,U=m(L),B=.5+.5*Math.sin(H*_),j=W(1-u.hold,1-u.hold*.35,B),X=V(.75*j,j*z(L),U)*(1-u.decay*(v/R)),ae=W(0,.25,v)*(1-W(R*.7,R,v)),pe=q(C.accent,C.high,Math.min(1,j*.35+U*.3)),ue=q(C.ink,pe,Math.min(1,X*1.6)*u.crestColor);c.set(T,Math.cos(P)*S,.02+k[1]+u.height*X,Math.sin(P)*S,x.size*V(1,x.emphasis,X)*d.s,ue,V(u.opacity,u.crestOpacity,X)*ae*b)}c.commit();let F=m(f),I=V(.5,Ee(f,5),F);i.orb.speak=I}}}},Ii={inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.4,min:.1,max:1,step:.01,label:"ring spacing",rebuild:!0},height:{value:.24,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:1,min:.25,max:3,step:.05,label:"wave density"},drift:{value:1,min:-4,max:4,step:1,label:"drift / loop"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},fade:{value:.35,min:.05,max:.9,step:.01,label:"unmute s"},lead:{value:.8,min:0,max:3,step:.05,label:"all muted s"},tail:{value:.6,min:0,max:3,step:.05,label:"muted at end s"},opacity:{value:.32,min:0,max:1,step:.01,label:"muted opacity"},activeOpacity:{value:1,min:0,max:1,step:.01,label:"voice opacity"},tint:{value:!0,label:"tint orb per voice"},...xe},bn=[{cycles:18,peak:1},{cycles:28,peak:1.8},{cycles:12,peak:.8},{cycles:34,peak:2.4},{cycles:22,peak:1.3}],Vi={duration:10,orb:"speaking",params:Ii,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Q(i),s=At.length,a=Array.from({length:s},(w,b)=>n*o.inner+b*o.spacing),l=a.map(w=>Ie(i,w)),c=[],k=a.map(()=>0);a.forEach((w,b)=>{k[b]=c.length;for(let C=0;C<l[b];C++)c.push({ring:b,j:C,a:C/l[b]*H,g:he(c.length)})});let p=e.particles(c.length);t.add(p);let f=[0,0];return{update({t:w,age:b,presence:C}){let u=we(i),x=Q(i),E=i.particles,m=Math.max(1,r-x.lead-x.tail),h=m/s,y=w-x.lead,R=y>=0&&y<m?Math.min(s-1,Math.floor(y/h)):-1,A=y-R*h,z=a.map((d,v)=>v===R?xt(A,0,h,x.fade,x.fade):0),O=a.map((d,v)=>.3+.7*Ee(w,v*5)),F=H*w*x.drift/r,I=a.map((d,v)=>(v%2?-1:1)*Lt(x.ringSpeed,d,l[v],r)),T=I.map((d,v)=>d*(H/l[v])*w/r),M=Math.round((b-w)/r);for(let d=0;d<c.length;d++){let{ring:v,j:S,a:P}=c[d],_=c[Ft(k[v],l[v],S,I[v],M)].g;me(E,_,w,r,f);let L=a[v]+f[0],U=z[v],B=bn[v%bn.length],j=.5+.5*Math.sin(Math.round(B.cycles*x.cycles)*P-F*(v%2?-1:1)),X=U*Math.pow(j,B.peak)*O[v],ae=P+T[v];p.set(d,Math.cos(ae)*L,.02+f[1]+x.height*X,Math.sin(ae)*L,E.size*V(1,E.emphasis,U*j)*_.s,q(u.ink,q(u.accent,u.high,X),U),V(x.opacity,x.activeOpacity,U*(.45+.55*j))*C)}p.commit();let g=R<0?0:Ee(w,R*5)*z[R];i.orb.speak=g,i.orb.tint=x.tint&&R>=0?At[R]:null}}}},Ui={rotation:{value:0,min:-180,max:180,step:1,label:"rotation \xB0"},radius:{value:1.95,min:1.2,max:3.5,step:.01,label:"radius \xD7orb"},height:{value:.24,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:72,min:8,max:200,step:1,label:"wave cycles"},previous:{value:.3,min:0,max:1,step:.01,label:"older audio"},opacity:{value:.45,min:0,max:1,step:.01,label:"unrecognised opacity"},litOpacity:{value:1,min:0,max:1,step:.01,label:"recognised opacity"},hiss:{value:.05,min:0,max:.3,step:.005,label:"line hiss"},ripple:{value:.8,min:0,max:2,step:.01,label:"detect ripple"},...xe},ht=[{kind:"menu",a:.5,b:4.1,detect:2.1},{kind:"voicemail",a:5,b:8.5,detect:8.05}];function yn(i,e){e.v=0,e.seg=-1,e.tone=0;for(let t=0;t<ht.length;t++){let n=ht[t];if(i<n.a||i>n.b)continue;e.seg=t;let r=i-n.a,o=Math.min(1,r/.05,(n.b-i)/.05);if(n.kind==="menu"){let s=r%.42/.3;e.v=s>1?0:.78*Math.min(1,Math.sin(Math.PI*s)*2.4)*o}else i<7.6?e.v=(.35+.35*Ee(r,9))*o:i>7.85&&(e.v=.95*o,e.tone=1);return e}return e}var Bi={duration:10,orb:"listening",params:Ui,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=10,o=Math.max(400,Math.round(1500*i.particles.density)),s=e.particles(o);t.add(s);let a=Array.from({length:o},(p,f)=>he(f)),l={v:0,seg:-1,tone:0},c=[0,0],k=We(i);return{update({t:p,age:f,dt:w,presence:b}){let C=k(w),u=we(i),x=Q(i),E=i.particles,m=x.radius*n,h=Math.PI*.75+oe.MathUtils.degToRad(x.rotation),y=f<r,R=Math.round(x.cycles);for(let A=0;A<o;A++){let z=A/o,O=z*r,F=p-O;if(y&&F<0){s.color[A*4+3]=0;continue}let I=(F%r+r)%r;yn(I,l);let T=l.seg>=0?ht[l.seg]:null,M=T?F-I+T.detect:1/0,g=T&&p>=M?Ue((p-M)/.35):0,d=1-(1-x.previous)*z,v=a[A];me(E,v,p,r,c);let S=h-z*H,P=x.hiss*(N(A*1.37+Math.floor(p*14))-.5),_=l.tone?3:1,L=.015+c[1]+(l.v*x.height*Math.sin(R/_*z*H)+(l.v?0:P)),U=q(u.ink,q(u.accent,u.high,l.tone*.5),g),B=V(x.opacity*(l.v?1:.7),x.litOpacity,g)*d*b,j=C*(A%3-1)*.11;s.set(A,Math.cos(S)*(m+j+c[0]),L,Math.sin(S)*(m+j+c[0]),E.size*V(1,E.emphasis,g*l.v)*v.s,U,B)}s.commit();for(let A of ht){let z=p-A.detect;z<0||z>1.6||i.floor.ripple({radius:n*1.1+z*2.2,strength:x.ripple*(1-z/1.6),width:.35,kind:1})}yn(p,l),i.orb.listen=l.v,i.orb.speak=0}}}},ji={radius:{value:2.1,min:1.4,max:3.5,step:.01,label:"harness radius \xD7orb",rebuild:!0},ringSpeed:{value:.2,min:0,max:2,step:.01,label:"ring speed"},opacity:{value:.3,min:0,max:1,step:.01,label:"ring opacity"},nodeSize:{value:.3,min:.1,max:.8,step:.01,label:"node radius",rebuild:!0},nodeOpacity:{value:.55,min:0,max:1,step:.01,label:"idle node opacity"},arc:{value:.45,min:0,max:1.5,step:.01,label:"comet arc height"},comet:{value:.32,min:.05,max:1,step:.01,label:"comet length"},ripple:{value:.7,min:0,max:2,step:.01,label:"node ripple"},...xe},Gi={query:-112,retrieval:-28,flow:58},Ni={duration:Tt,orb:"thinking",params:ji,create(i){let{kit:e,group:t}=i,n=i.orbRadius,r=Tt,o=Q(i),s=n*o.radius,a=Ie(i,s),l=Array.from({length:a},(u,x)=>({a:x/a*H,g:he(x)})),c=fn(i.camera),k=Oe.map((u,x)=>{let E=oe.MathUtils.degToRad(Gi[u]),m=c.floorRight.clone().multiplyScalar(Math.cos(E)).addScaledVector(c.floorFront,Math.sin(E)).normalize(),h=Math.max(18,Math.round(H*o.nodeSize*Ht*1.4*i.particles.density));return{part:u,dir:m,n:h,g:Array.from({length:h},(y,R)=>he(5e3+x*200+R))}}),p=34,f=a+k.reduce((u,x)=>u+x.n+1,0)+p*Oe.length,w=e.particles(f);t.add(w);let b=[0,0],C=We(i);return{update({t:u,age:x,dt:E,presence:m}){let h=we(i),y=Q(i),R=C(E),A=i.particles,z=0,O=Lt(y.ringSpeed,s,a,r),F=O*(H/a)*u/r,I=Math.round((x-u)/r),T=Oe.map(M=>ut(M,u));for(let M=0;M<a;M++){let g=l[Ft(0,a,M,O,I)].g;me(A,g,u,r,b);let d=l[M].a+F,v=Math.cos(d),S=Math.sin(d),P=0;k.forEach((L,U)=>P=Math.max(P,T[U]*Math.pow(Math.max(0,v*L.dir.x+S*L.dir.z),18)));let _=R*Math.pow(.5+.5*Math.sin(l[M].a*9-H*3*u/r),2);w.set(z++,v*(s+b[0]),.02+b[1]+.09*_,S*(s+b[0]),A.size*g.s,q(h.ink,h.accent,Math.max(P,_*.6)),V(y.opacity,.9,Math.max(P,_*.5))*m)}k.forEach((M,g)=>{let d=T[g],v=M.dir.x*s,S=M.dir.z*s,P=o.nodeSize*(1+.25*d),_=H*u*(g%2?-1:1)/r;for(let L=0;L<M.n;L++){let U=M.g[L];me(A,U,u,r,b);let B=L/M.n*H+_;w.set(z++,v+Math.cos(B)*(P+b[0]*.5),.03+b[1]+d*.12,S+Math.sin(B)*(P+b[0]*.5),A.size*V(1,A.emphasis,d)*U.s,q(h.ink,q(h.accent,h.high,d*.4),Math.min(1,.15+d)),V(y.nodeOpacity,1,d)*m)}w.set(z++,v,.05+d*.12,S,A.size*V(1.6,2.6,d),q(h.ink,h.accent,Math.min(1,.25+d)),V(.7,1,d)*m),d>.01&&i.floor.ripple({x:v,z:S,radius:P+.15+(1-d)*.5,strength:y.ripple*d,width:.18,kind:1})}),Oe.forEach((M,g)=>{let d=k[g],v=Ot.find(S=>S.part===M&&u>=S.t&&u<=S.t+pt+y.comet);for(let S=0;S<p;S++){if(!v){w.set(z++,0,0,0,0,h.ink,0);continue}let P=S/p*y.comet,_=(u-v.t-P)/pt;if(_<0||_>1){w.set(z++,0,0,0,0,h.ink,0);continue}let L=v.dir==="out"?se(_):1-se(_),U=V(n*1.05,s-o.nodeSize,L),B=1-S/p,j=R*.16*Math.sin(H*(L*3-u*1.5))*Math.sin(Math.PI*L);w.set(z++,d.dir.x*U-d.dir.z*j,.04+Math.sin(Math.PI*L)*y.arc*(1-R*.6),d.dir.z*U+d.dir.x*j,A.size*V(1,A.emphasis*1.2,B)*(.6+.4*B),q(h.accent,h.high,B),B*m)}}),w.commit(),i.floor.glow(.15*Math.max(...T))}}}},Wi={spacing:{value:.15,min:.05,max:.4,step:.005,label:"ring spacing",rebuild:!0},inner:{value:1.2,min:1,max:2,step:.01,label:"inner radius \xD7orb",rebuild:!0},outer:{value:3.6,min:2,max:5.5,step:.05,label:"outer radius",rebuild:!0},fence:{value:2.2,min:1.4,max:3.2,step:.01,label:"fence radius \xD7orb"},height:{value:.2,min:0,max:.8,step:.005,label:"wave height"},spike:{value:2.2,min:0,max:4,step:.05,label:"spike \xD7"},spikeChance:{value:.35,min:0,max:1,step:.01,label:"spike chance"},waves:{value:5,min:1,max:12,step:1,label:"waves / loop"},wavelength:{value:.6,min:.15,max:2,step:.01},opacity:{value:.22,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:.95,min:0,max:1,step:.01,label:"crest opacity"},fenceOpacity:{value:.42,min:0,max:1,step:.01,label:"fence opacity"},...xe},qi={duration:10,orb:"speaking",params:Wi,create(i){let{kit:e,group:t,look:n}=i,r=i.orbRadius,o=10,s=Q(i),a=r*s.inner,l=[];for(let u=a,x=0;u<=s.outer;u+=s.spacing,x++){let E=Ie(i,u),m=N(u*7.7)*H;for(let h=0;h<E;h++)l.push({r:u,a:m+h/E*H,ring:x,g:he(l.length)})}let c=l.length,k=e.particles(c);t.add(k);let p=e.line(240,{width:1,color:n.ink,opacity:.3,dashed:!0,dash:.05,gap:.07}),f=e.line(240,{width:1,color:n.ink,opacity:.3,dashed:!0,dash:.05,gap:.07});t.add(p,f);let w=new Float32Array(720),b=14,C=[0,0];return{update({t:u,presence:x}){let E=we(i),m=Q(i),h=i.particles,y=r*m.fence,R=Math.round(m.waves),A=m.height*1.05,z=0;for(let O=0;O<c;O++){let{r:F,a:I,ring:T,g:M}=l[O];me(h,M,u,o,C);let g=F+C[0],d=I+(T%2?-1:1)*(H*u/o)*.25*(a/F),v=(F-a)/m.wavelength-R*u/o,S=Math.floor(v),P=.5+.5*Math.sin(H*v),_=W(.4,.95,P),L=(S%R+R)%R,U=Math.floor((d%H+H)%H/(H/b)),B=(d%H+H)%H/(H/b)-U,j=N(L*13.1+U*3.7)<m.spikeChance?Math.pow(Math.sin(Math.PI*B),2):0,X=W(y-.05,y+.15,F),ae=Math.exp(-Math.pow((F-y)/.12,2)),pe=j*_*(1-X),ue=j*_*ae;z=Math.max(z,ue);let Se=W(0,.2,F-a)*(1-W(s.outer-.9,s.outer,F)),Pe=.02+C[1]+Math.min(m.height*_*(1+m.spike*pe),X>.5?A:1/0),D=Math.max(_*V(.35,1,X)*(1-pe),ue),ee=q(E.ink,q(E.accent,E.high,ue),Math.min(1,D*1.4)),ce=V(m.opacity,m.crestOpacity,Math.max(_,ue))*Se*x;k.set(O,Math.cos(d)*g,Pe,Math.sin(d)*g,h.size*V(1,h.emphasis,Math.max(_*X,ue))*M.s,ee,ce)}k.commit(),Pt(w,240,y,.015,()=>0),p.setPoints(w),Pt(w,240,y,.015+A,()=>0),f.setPoints(w),p.opacity=m.fenceOpacity*x,f.opacity=m.fenceOpacity*.6*x,i.floor.ripple({radius:y,strength:.25*z*x,width:.2,kind:2}),i.orb.speak=.4+.5*Ee(u,4)}}}},qe={id:"particles",name:"Particles",tagline:"Rings of particles",description:"Crisp particles around the orb: rings of dust, waves and dots that carry each model's job \u2014 clearing noise, taking turns, orbiting thought, stepping the call forward, speaking.",preset:{background:"#F6F6F8",grid:{style:"lines",color:"#1A1C22",opacity:.06,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.3,contactShadow:.8,camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"}},scenes:{denoise:_i,turns:Ai,ivr:Bi,llm:Oi,s2s:zi,harness:Ni,flow:Li,colloquial:Di,guardrails:qi,voices:Vi}};var Ke={line:qe,particles:qe};var Dt=[{id:"listen",icon:"listen",title:"Speech perception",blurb:"Detect speech, recognize call conditions, and determine when to listen, wait, or respond.",scenes:["denoise","turns","ivr"]},{id:"think",icon:"think",title:"Reasoning & orchestration",blurb:"Bring together models, knowledge, and tools to move every conversation forward.",scenes:["llm","harness"]},{id:"speak",icon:"speak",title:"Response generation",blurb:"Deliver clear, natural responses shaped for live conversation.",scenes:["colloquial","guardrails"]}],Ki=[{id:"semantic",icon:"conversation",title:"Semantic perception & generation",blurb:"Handles interruptions, turn-taking, and backchannels in real time. Understands emotion and semantic meaning, then responds with context-aware, human-like speech. Retell duplex model coming soon.",scenes:["turns","denoise","colloquial"]},{id:"think",icon:"think",title:"Reasoning & orchestration",blurb:"Bring together models, knowledge, and tools to move every conversation forward.",scenes:["s2s","harness"]}],mt={denoise:{step:"listen",title:"Denoising Model",tab:"Denoising",s2s:{title:"Emotion and meaning",tab:"Emotion and meaning"}},turns:{step:"listen",title:"Turn-Taking Model",tab:"Turn-taking",s2s:{title:"Conversation dynamics",tab:"Conversation dynamics"}},ivr:{step:"listen",title:"Voicemail & IVR Detection",tab:"Voicemail & IVR"},llm:{step:"think",title:"Tell-1",tab:"Tell-1"},s2s:{step:"think",title:"Reasoning model",tab:"Reasoning model"},harness:{step:"think",title:"Retell Agent Harness",tab:"Agent harness"},flow:{step:"think",title:"Conversation flow",tab:"Flow"},colloquial:{step:"speak",title:"Colloquial Rewrite Model",tab:"Colloquial rewrite",s2s:{title:"Expressive speech",tab:"Expressive speech"}},guardrails:{step:"speak",title:"Response Guardrails",tab:"Guardrails"},voices:{step:"speak",title:"Retell voices",tab:"Voices"}},It=(i="cascaded")=>i==="s2s"?Ki:Dt;var ft=(i="cascaded")=>It(i).flatMap(e=>e.scenes),wn=(i,e)=>{let t=ft(e);return t.includes(i)?i:t.find(n=>mt[n].step===mt[i].step)??t[0]},xn=(i,e="cascaded")=>e==="s2s"&&mt[i].s2s||mt[i],ao=ft("cascaded");var Sn=["size","emphasis","density","scatter","idle","idleSpeed","muted","active","highlight"],En=i=>Object.fromEntries(Object.entries(i).map(([e,t])=>[e,t.value]));function kn(){return""}var Vt={direction:"line",scene:"denoise",playing:!0,arch:"cascaded",speed:1,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#3E6AEF",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3.4,fadeOuter:8},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35,looks:Yt},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"},lines:{width:1.3,emphasis:1.25,muted:"#1A1C22",active:"#3E6AEF"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{}},Mn=i=>!!i&&typeof i=="object"&&!Array.isArray(i);function Re(i,e){if(!e)return structuredClone(i);let t=structuredClone(i);for(let[n,r]of Object.entries(e))r!==void 0&&(t[n]=Mn(r)&&Mn(t[n])?Re(t[n],r):r);return t}function Cn(i,e){return Re(Re(Vt,i),{direction:e})}var _n=J.MathUtils.degToRad,gt=class{constructor(e,t={}){this.scene=new J.Scene;this.camera=new J.OrthographicCamera(-1,1,1,-1,.1,200);this.floor=new Ye;this.resolution=new J.Vector2(1,1);this.pointScale={value:1};this.active=[];this.raf=0;this.last=0;this.w=1;this.h=1;this.dpr=1;this.viewH=5;this.onScreen=!0;this.listeners={scene:new Set,loop:new Set};this.frozen=!1;this.morph=null;this.morphFrom=null;this.lookKey="";this.loaded=!1;this.shown=!1;this.loop=e=>{this.raf=requestAnimationFrame(this.loop);let t=Math.max(0,Math.min((e-this.last)/1e3,.1));this.last=e,!(this.frozen||!this.onScreen||!this.loaded)&&(this.step(this.config.playing?t*this.config.speed:0),this.render(),this.shown||(this.shown=!0,this.renderer.domElement.style.opacity="1"),this.onFrame?.())};this.container=e,this.config=Re(Vt,t),this.direction=Ke[this.config.direction],this.renderer=new J.WebGLRenderer({antialias:!0,alpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),this.renderer.outputColorSpace=J.SRGBColorSpace;let n=this.renderer.domElement;n.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 0.9s cubic-bezier(.2,.7,.2,1)",e.appendChild(n),this.orb=new $e({...this.config.orb}),this.scene.add(this.floor.mesh,this.orb.group),this.ro=new ResizeObserver(()=>this.resize()),this.io=new IntersectionObserver(([s])=>this.onScreen=s.isIntersecting),this.io.observe(e),this.ro.observe(e),this.resize(),this.applyConfig({},!0),this.setScene(this.config.scene,{instant:!0});let r=new Promise(s=>setTimeout(s,5e3)),o=this.renderer.compileAsync(this.scene,this.camera).then(()=>{},()=>{});this.ready=Promise.race([o,r]).then(()=>{this.loaded=!0}),this.last=performance.now(),this.raf=requestAnimationFrame(this.loop)}on(e,t){return this.listeners[e].add(t),()=>this.listeners[e].delete(t)}emit(e,...t){this.listeners[e].forEach(n=>n(...t))}get look(){let e=this.config;return{bg:e.background,ink:e.ink,accent:e.accent,orbMid:e.orb.mid,orbHigh:e.orb.highlight,line:e.grid.color}}sceneParams(e){let t=this.direction.scenes[e].params;return{...t?En(t):{},...this.config.sceneParams?.[e]??{}}}applyConfig(e,t=!1){let n=this.config.direction,r=this.config.scene,o=this.sceneParams(r),s=this.config.particles?.density;this.config=Re(this.config,e);let a=this.config;this.renderer.setClearColor(a.background,1),this.orb.setParams(a.orb),this.floor.setLook({...a.grid,glowColor:a.orb.mid,glow:a.floorGlow,shadow:a.contactShadow,shadowColor:a.contactColor,accent:a.accent},a.orb.radius),this.layoutCamera(),a.direction!==n?(this.direction=Ke[a.direction],this.setScene(a.scene,{instant:!1,force:!0})):a.scene!==r&&this.setScene(a.scene),a.direction===n&&s!==void 0&&a.particles.density!==s&&this.setScene(a.scene,{instant:!0,force:!0});let l=this.direction.scenes[a.scene].params;if(l&&a.scene===r&&a.direction===n){let k=this.sceneParams(a.scene);Object.entries(l).some(([p,f])=>f.rebuild&&k[p]!==o[p])&&this.setScene(a.scene,{instant:!0,force:!0})}let c=JSON.stringify(this.look)+a.orb.radius;if(c!==this.lookKey){let k=this.lookKey!=="";this.lookKey=c,k&&!t&&a.direction===n&&this.setScene(a.scene,{instant:!0,force:!0})}}setScene(e,t={}){let n=this.active.find(y=>!y.leaving);if(n&&n.id===e&&!t.force&&n.def===this.direction.scenes[e])return;this.config.scene=e;let r=null,o=null;!t.instant&&this.config.transition.morph&&n&&n.def.morph!==!1&&this.direction.scenes[e].morph!==!1&&(this.morph?r=mn([...Ge(n.group),...Ge(this.morph.group)],this.pxScale):(r=ct(Ge(n.group)),o=n)),this.endMorph();for(let y of this.active)y.leaving||(y.leaving=!0,y.endAt=(Math.floor(y.age/y.def.duration)+1)*y.def.duration,ze.killTweensOf(y.scope),t.instant?this.disposeActive(y):ze.to(y.scope,{presence:0,duration:.55,ease:"power2.in",onComplete:()=>this.disposeActive(y)}));t.instant&&(this.active=this.active.filter(y=>!y.leaving));let s=this.direction.scenes[e],a=new J.Group;a.name=`scene:${this.direction.id}:${e}`,this.scene.add(a);let l={presence:t.instant?1:0},c={state:s.orb,listen:0,speak:0},k=this.floor,p=this,f=this.direction,w=this.sceneParams(e),C={group:a,floor:{ripple:y=>this.floor.ripple({...y,strength:y.strength*l.presence}),tile:y=>this.floor.tile({...y,strength:y.strength*l.presence}),glow:y=>this.floor.glowAdd+=y*l.presence,get cell(){return k.cell}},orb:c,orbRadius:this.config.orb.radius,look:this.look,kit:new at(this.look,this.resolution,this.pointScale),camera:this.camera,get params(){return p.direction===f&&(w=p.sceneParams(e)),w},get particles(){let y=p.config.particles,R=this.params,A=null;for(let z of Sn)R[`own_${z}`]!==!0||R[`p_${z}`]===void 0||(A??(A={...y}),A[z]=R[`p_${z}`]);return A??y},get lines(){return p.config.lines},get hueShift(){return p.orb.hueShift},get arch(){return p.config.arch??"cascaded"}},u=s.create(C),x=Ge(a),E=!!r&&r.n>0&&x.length>0,m=E?-this.config.transition.duration:0,h={id:e,def:s,inst:u,group:a,orb:c,scope:l,age:m,leaving:!1,morphOut:!1,drawn:!1};E&&(n.group.visible=!1,o&&(o.morphOut=!0,ze.killTweensOf(o.scope),ze.to(o.scope,{presence:0,duration:.55,ease:"power2.in"}),this.morphFrom=o),l.presence=1,this.morph=new lt(r,x,{...this.config.transition},this.resolution,this.pointScale),this.scene.add(this.morph.group)),this.active.push(h),!t.instant&&!E&&ze.to(l,{presence:1,duration:.9,delay:.25,ease:"power2.out"}),this.emit("scene",e)}endMorph(){this.morph?.dispose(),this.morph=null,this.morphFrom&&this.active.includes(this.morphFrom)&&this.disposeActive(this.morphFrom),this.morphFrom=null}restart(){this.setScene(this.config.scene,{instant:!0,force:!0})}disposeActive(e){e.inst.dispose?.(),this.scene.remove(e.group),e.group.traverse(t=>{let n=t;n.geometry?.dispose();let r=n.material;Array.isArray(r)?r.forEach(o=>o.dispose()):r?.dispose()}),this.active=this.active.filter(t=>t!==e)}get current(){return this.active.find(e=>!e.leaving)}get duration(){return this.current?.def.duration??8}get progress(){let e=this.current;return e?Math.max(0,e.age%e.def.duration)/e.def.duration:0}project(e,t,n){let r=new J.Vector3(e,t,n).project(this.camera);return{x:(r.x+1)/2*this.w,y:(1-r.y)/2*this.h}}step(e){this.floor.beginFrame();let t,n=0,r=0,o=(p,f)=>{let w=p.def.duration,b=p.age%w;p.age+=f,!p.leaving&&p.age%w<b&&(this.emit("loop",p.id),p.leaving&&(p.endAt=p.age-p.age%w));let C=p.leaving&&p.endAt!==void 0&&p.age>=p.endAt?w+p.age-p.endAt:p.age%w;p.inst.update({t:C,age:p.age,dt:f,presence:p.morphOut?1:p.scope.presence,loopOut:!p.morphOut&&!this.advances}),p.drawn=!0;let u=p.scope.presence;(!t||u>t.scope.presence)&&(t=p),n+=p.orb.listen*u,r+=p.orb.speak*u};for(let p of[...this.active])this.active.includes(p)&&o(p,e);for(let p of[...this.active])p.drawn||o(p,0);this.morph&&(this.morph.update(e,this.pxScale,this.config.orb.radius),this.morph.done&&this.endMorph());let s=this.orb.drive;s.state=t?t.orb.state:"idle";let a=t?.orb.tint;this.orb.params.mid=a?a.mid:this.config.orb.mid,this.orb.params.highlight=a?a.high:this.config.orb.highlight;let l=this.orb.highlightNow,c=ge(this.config.orb.highlight),k=Et(l.x,l.y,l.z)-Et(c.x,c.y,c.z);this.orb.hueShift=k-Math.round(k),this.floor.shadowColor=Be(this.config.contactColor,this.orb.hueShift),this.floor.glowColor=this.orb.midNow,s.listen=Math.min(1,n),s.speak=Math.min(1,r),this.orb.update(e),this.floor.endFrame(this.orb.energy)}get advances(){return this.config.autoplay&&!this.frozen&&!this.onFrame}get pxScale(){return this.pointScale.value/this.renderer.getPixelRatio()}render(){this.renderer.render(this.scene,this.camera)}resize(){let e=Math.max(1,this.container.clientWidth),t=Math.max(1,this.container.clientHeight);this.w=e,this.h=t,this.dpr=Math.min(window.devicePixelRatio||1,2),this.renderer.setPixelRatio(this.dpr),this.renderer.setSize(e,t,!1),this.layoutCamera(),!this.frozen&&this.raf&&this.render()}layoutCamera(){let e=this.config.camera,t=_n(e.azimuth),n=_n(e.elevation),r=new J.Vector3(0,e.height,0),o=new J.Vector3(Math.sin(t)*Math.cos(n),Math.sin(n),Math.cos(t)*Math.cos(n));this.camera.position.copy(r).addScaledVector(o,40),this.camera.up.set(0,1,0),this.camera.lookAt(r),this.floor.setView(t,n),this.viewH=5.2/Math.max(.05,e.zoom);let s=this.w/this.h,a=this.viewH*s/2,l=this.viewH/2;this.camera.left=-a-e.panX,this.camera.right=a-e.panX,this.camera.top=l-e.panY,this.camera.bottom=-l-e.panY,this.camera.near=.1,this.camera.far=200,this.camera.updateProjectionMatrix(),this.resolution.set(this.w,this.h),this.syncPixelScale(this.dpr)}syncPixelScale(e){this.pointScale.value=e*(5.2/this.viewH)*(this.h/640)}async snapshot(e={}){let{scale:t=2,transparent:n=!1}=e;return this.withSize(t,n,async()=>(this.renderer.render(this.scene,this.camera),this.compose()))}async exportLayers(e=2){let t={};return await this.withSize(e,!0,async()=>{let n=[["floor","1-floor.png"],["objects","2-objects.png"],["orb","3-orb.png"]];for(let[r,o]of n)this.renderLayer(r),t[o]=new Uint8Array(await(await this.compose()).arrayBuffer());this.renderer.render(this.scene,this.camera),t["0-composite.png"]=new Uint8Array(await(await this.compose()).arrayBuffer())}),this.renderer.setClearColor(this.config.background,1),t["config.json"]=bt(JSON.stringify(this.config,null,2)),new Blob([vt(t)],{type:"application/zip"})}sceneSVG(){let e=this.floor.frameEffects;return kn({camera:this.camera,w:this.w,h:this.h,dpr:this.dpr,config:this.config,groups:[...this.active.filter(t=>t.group.visible).map(t=>t.group),...this.morph?[this.morph.group]:[]],ripples:e.ripples,tiles:e.tiles})}async exportSequence(e={}){let{fps:t=30,scale:n=1,transparent:r=!1,onProgress:o}=e;this.restart();let s=e.seconds??this.duration,a=Math.round(s*t),l={};this.frozen=!0;try{this.orb.settle(),await this.withSize(n,r,async()=>{for(let c=0;c<a;c++){c>0?this.step(1/t):this.step(0),this.renderer.render(this.scene,this.camera);let k=await this.compose();l[`frame-${String(c).padStart(4,"0")}.png`]=new Uint8Array(await k.arrayBuffer()),o?.((c+1)/a)}})}finally{this.frozen=!1,this.last=performance.now()}return l["config.json"]=bt(JSON.stringify(this.config,null,2)),new Blob([vt(l,{level:0})],{type:"application/zip"})}async record(e={}){let{loops:t=1,fps:n=60,scale:r=Math.min(2,this.dpr),onProgress:o}=e,a=["video/mp4;codecs=avc1.640028","video/mp4","video/webm;codecs=vp9","video/webm"].find(E=>MediaRecorder.isTypeSupported(E))??"video/webm",l=document.createElement("canvas");l.width=Math.round(this.w*r),l.height=Math.round(this.h*r);let c=l.getContext("2d"),k=this.dpr;this.dpr=r,this.renderer.setPixelRatio(r),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(r),this.restart(),this.orb.settle();let p=l.captureStream(n),f=new MediaRecorder(p,{mimeType:a,videoBitsPerSecond:16e6}),w=[];f.ondataavailable=E=>E.data.size&&w.push(E.data);let b=this.duration*t/Math.max(.05,this.config.speed),C=this.config.playing;this.config.playing=!0;let u=performance.now(),x=new Promise(E=>f.onstop=()=>E());return this.onFrame=()=>{c.fillStyle=this.config.background,c.fillRect(0,0,l.width,l.height),c.drawImage(this.renderer.domElement,0,0);let E=(performance.now()-u)/1e3/b;o?.(Math.min(1,E)),E>=1&&f.state==="recording"&&f.stop()},f.start(250),await x,this.onFrame=void 0,this.config.playing=C,this.dpr=k,this.resize(),new Blob(w,{type:a.split(";")[0]})}async withSize(e,t,n){let r=this.frozen;this.frozen=!0,this.renderer.setPixelRatio(e),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(e),this.renderer.setClearColor(this.config.background,t?0:1);try{return await n()}finally{this.renderer.setClearColor(this.config.background,1),this.frozen=r,this.resize(),this.last=performance.now()}}async compose(){return Zi(this.renderer.domElement)}renderLayer(e){let t=[],n=r=>r===this.floor.mesh||r===this.orb.reflection?e==="floor":r===this.orb.mesh||r===this.orb.backdrop?e==="orb":e==="objects";this.scene.traverse(r=>{let o=r.material;if(!o)return;let s=n(r);for(let a of Array.isArray(o)?o:[o])t.push([a,a.colorWrite]),s||(a.colorWrite=!1)}),this.renderer.render(this.scene,this.camera);for(let[r,o]of t)r.colorWrite=o}dispose(){cancelAnimationFrame(this.raf),this.ro.disconnect(),this.io.disconnect(),this.endMorph();for(let e of[...this.active])this.disposeActive(e);this.orb.dispose(),this.floor.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function Zi(i){return new Promise((e,t)=>i.toBlob(n=>n?e(n):t(new Error("toBlob failed")),"image/png"))}var Rn={direction:"line",scene:"denoise",playing:!0,speed:.8,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#007cff",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:0,fadeOuter:8},floorGlow:0,contactShadow:0,camera:{azimuth:46,elevation:10,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:.73,mid:"#00ccff",highlight:"#3d64ff",speed:.83,reflection:.35},particles:{size:2,emphasis:1,density:2,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},sceneParams:{denoise:{rings:2,passes:1,outer:3.1,inner:1.14,height:3,noiseFreq:51,noiseFreq2:90,noiseMix:.62,cleanFreq:43,cleanHeight:.21,cleanFrom:.08,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.39,cleanOpacity:.95,fadeIn:.19,fadeOut:.15,count:800,cloud:1.6,lanes:.05,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:.59,dotSize:1.6,dotOpacity:.38,streakWidth:1.5,streakOpacity:.85,tail:0,own_size:!0,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.35,own_scatter:!0,p_scatter:.016,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.85,height:.155,cycles:64,width:1.5,wordLength:1.2,wordGap:.64,pauses:.15,guide:!0,guideOpacity:.26,playhead:!0,playheadLength:.27,markers:!0,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1,lineOpacity:.15,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:-94,spin:3,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:.041,own_idle:!0,p_idle:.07,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},llm:{rings:3,dots:470,inner:1.49,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:1.35,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.3,own_scatter:!1,p_scatter:.025,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.18,spacing:.99,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.22,litOpacity:.1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.093,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},voices:{inner:1.13,spacing:.57,dotSpacing:.03,height:.8,cycles:.65,drift:-4,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.28,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!0,p_density:2,own_scatter:!0,p_scatter:.039,own_idle:!0,p_idle:.047,own_idleSpeed:!0,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},colloquial:{spacing:.06,inner:1.14,outer:3.45,height:3,waves:8,wavelength:2,crest:6,variation:.75,spokenFrom:5.6,spokenTo:3.1,decay:.55,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.65,drift:0,hold:.95,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var An={direction:"particles",scene:"denoise",playing:!0,speed:.9,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#183387",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35},particles:{size:1.6,emphasis:1,density:1.65,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{denoise:{rings:3,passes:1,outer:3.1,inner:1,height:3,noiseFreq:51,noiseFreq2:81,noiseMix:.62,cleanFreq:18,cleanHeight:.21,cleanFrom:.04,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.4,cleanOpacity:.95,fadeIn:.2,fadeOut:.15,count:1900,cloud:1.6,lanes:.31,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:0,dotSize:2.45,dotOpacity:.95,streakWidth:1.25,streakOpacity:1,tail:0,own_size:!1,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1.35,own_scatter:!0,p_scatter:.02,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.65,height:.425,cycles:72,width:1.5,wordLength:.51,wordGap:.15,pauses:.15,guide:!1,guideOpacity:.18,playhead:!1,playheadLength:.06,markers:!1,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1.5,lineOpacity:1,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:64,spin:14.5,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:0,own_idle:!0,p_idle:.021,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",playheadWidth:1.5,playheadColor:"#007cff",playheadOpacity:1,markerLength:.05,markerWidth:1.35,markerColor:"#1A1C22",markerOpacity:.25,lineColor:"#b2b5c0",previous:.35},llm:{rings:4,dots:470,inner:1.76,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:2.7,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.5,own_scatter:!1,p_scatter:.05,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.05,spacing:.68,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.5,litOpacity:1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!1,p_size:1.6,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.075,own_idle:!0,p_idle:.02,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35},voices:{inner:1.13,spacing:.64,dotSpacing:.03,height:.8,cycles:1.05,drift:2,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.5,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!1,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!1,p_density:1.65,own_scatter:!0,p_scatter:.05,own_idle:!0,p_idle:.03,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35,lead:.8},colloquial:{spacing:.06,inner:1.54,outer:4.1,height:.8,waves:8,wavelength:1.44,crest:6,variation:.75,spokenFrom:6.2,spokenTo:3.1,decay:1,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.57,drift:2,hold:.41,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var Yi={line:Rn,particles:An};function Tn(i){return Re(Cn(Ke[i].preset,i),Yi[i])}var Ut={denoise:{title:"Denoising Model",text:"Reduces background noise so the agent can hear the caller clearly.",icon:"denoise"},turns:{title:"Turn-Taking Model",text:"Determines when to wait and when to respond.",icon:"turns"},ivr:{title:"Voicemail & IVR Detection",text:"Recognizes voicemail greetings and automated phone menus.",icon:"ivr"},llm:{title:"Tell-1",text:"Retell\u2019s first LLM, built for instruction following, tool use, and conversational reasoning.",icon:"llm"},harness:{title:"Retell Agent Harness",text:"Coordinates context, tool execution, and conversation state across cascaded and speech-to-speech agents.",icon:"harness"},colloquial:{title:"Colloquial Rewrite Model",text:"Refines replies into natural spoken language.",icon:"colloquial"},guardrails:{title:"Response Guardrails",text:"Checks generated responses against configured constraints.",icon:"guardrails"}},On={turns:{title:"Conversation dynamics",text:"Handles interruptions, turn-taking, and backchannels as they happen.",icon:"turns"},denoise:{title:"Emotion and meaning",text:"Understands emotion and intent directly from the caller\u2019s voice.",icon:"listening"},colloquial:{title:"Expressive speech",text:"Responds with context-aware, human-like delivery.",icon:"voices"},s2s:{title:"Reasoning model",text:"Handles complex reasoning and tool use while the conversation keeps flowing.",icon:"llm"}},Bt={query:{title:"Query Refinement Model",text:"Turns conversation context into focused knowledge-base searches.",icon:"query"},retrieval:{title:"Knowledge Retrieval",text:"Finds relevant information and makes it available to the agent.",icon:"retrieval"},flow:{title:"Flow Transition Model",text:"Uses conversation context to select the next step in the workflow.",icon:"flow"}},Pn="Embedding model and vector retrieval";var zn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M5.95168 17.3125V2.6875C5.95168 2.23877 6.31441 1.875 6.76186 1.875C7.20931 1.875 7.57205 2.23877 7.57205 2.6875V17.3125C7.57205 17.7612 7.20931 18.125 6.76186 18.125C6.31441 18.125 5.95168 17.7612 5.95168 17.3125ZM12.4332 15.6875V9.1875C12.4332 8.73875 12.7959 8.375 13.2434 8.375C13.6908 8.375 14.0535 8.73875 14.0535 9.1875V15.6875C14.0535 16.1363 13.6908 16.5 13.2434 16.5C12.7959 16.5 12.4332 16.1363 12.4332 15.6875ZM9.19244 14.0625V5.9375C9.19244 5.48877 9.55519 5.125 10.0026 5.125C10.45 5.125 10.8128 5.48877 10.8128 5.9375V14.0625C10.8128 14.5112 10.45 14.875 10.0026 14.875C9.55519 14.875 9.19244 14.5112 9.19244 14.0625ZM2.71094 12.4375V7.5625C2.71094 7.11377 3.07367 6.75 3.52112 6.75C3.96858 6.75 4.3313 7.11377 4.3313 7.5625V12.4375C4.3313 12.8862 3.96858 13.25 3.52112 13.25C3.07367 13.25 2.71094 12.8862 2.71094 12.4375ZM15.6739 11.625V9.1875C15.6739 8.73875 16.0366 8.375 16.4841 8.375C16.9315 8.375 17.2943 8.73875 17.2943 9.1875V11.625C17.2943 12.0737 16.9315 12.4375 16.4841 12.4375C16.0366 12.4375 15.6739 12.0737 15.6739 11.625Z" fill="black"/>%0A<path id="Vector_2" d="M15.4193 1.875C15.6883 1.875 15.9274 2.04703 16.0125 2.30225L16.4341 3.56771L17.7004 3.99008C17.9556 4.07514 18.1276 4.31432 18.1276 4.58333C18.1276 4.85235 17.9556 5.09152 17.7004 5.17659L16.4341 5.59814L16.0125 6.86442C15.9274 7.11963 15.6883 7.29167 15.4193 7.29167C15.1503 7.29167 14.9111 7.11963 14.826 6.86442L14.4036 5.59814L13.1382 5.17659C12.8829 5.09152 12.7109 4.85235 12.7109 4.58333C12.7109 4.31432 12.8829 4.07514 13.1382 3.99008L14.4036 3.56771L14.826 2.30225L14.8651 2.2111C14.9714 2.00698 15.1838 1.875 15.4193 1.875Z" fill="black"/>%0A</g>%0A</svg>%0A';var Hn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" fill-rule="evenodd" clip-rule="evenodd" d="M13.58 11.0771C13.9054 10.7517 14.4331 10.7517 14.7585 11.0771L17.2586 13.5772C17.4148 13.7335 17.5027 13.9454 17.5027 14.1665C17.5027 14.3875 17.4148 14.5994 17.2585 14.7557L14.7585 17.2556C14.433 17.581 13.9054 17.581 13.58 17.2556C13.2546 16.9301 13.2546 16.4025 13.58 16.0771L15.4908 14.1664L13.58 12.2556C13.2546 11.9302 13.2546 11.4025 13.58 11.0771Z" fill="black"/>%0A<path id="Vector_2" fill-rule="evenodd" clip-rule="evenodd" d="M2.5 5.83333C2.5 5.3731 2.8731 5 3.33333 5H16.6667C17.1269 5 17.5 5.3731 17.5 5.83333C17.5 6.29357 17.1269 6.66667 16.6667 6.66667H3.33333C2.8731 6.66667 2.5 6.29357 2.5 5.83333Z" fill="black"/>%0A<path id="Vector_3" fill-rule="evenodd" clip-rule="evenodd" d="M2.5 14.1663C2.5 13.7061 2.8731 13.333 3.33333 13.333H16.6667C17.1269 13.333 17.5 13.7061 17.5 14.1663C17.5 14.6266 17.1269 14.9997 16.6667 14.9997H3.33333C2.8731 14.9997 2.5 14.6266 2.5 14.1663Z" fill="black"/>%0A<path id="Vector_4" fill-rule="evenodd" clip-rule="evenodd" d="M6.42261 2.7441C6.74803 3.06955 6.74802 3.59718 6.42257 3.92261L4.51184 5.83318L6.42261 7.7441C6.74803 8.06955 6.74802 8.59717 6.42257 8.92258C6.09712 9.248 5.56948 9.248 5.24406 8.92258L2.74406 6.42238C2.58778 6.26609 2.49999 6.05413 2.5 5.83311C2.50001 5.6121 2.58782 5.40014 2.7441 5.24387L5.2441 2.74406C5.56955 2.41863 6.09718 2.41865 6.42261 2.7441Z" fill="black"/>%0A</g>%0A</svg>%0A';var Ln='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="black" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="3.5" r="1.5"/><circle cx="10" cy="3.5" r="1.5"/><circle cx="15" cy="3.5" r="1.5"/><circle cx="5" cy="8.5" r="1.5"/><circle cx="10" cy="8.5" r="1.5"/><circle cx="15" cy="8.5" r="1.5"/><circle cx="5" cy="13.5" r="1.5"/><circle cx="10" cy="13.5" r="1.5"/><circle cx="15" cy="13.5" r="1.5"/><circle cx="10" cy="18" r="1.5"/></svg>%0A';var Fn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<g id="Vector">%0A<path d="M9.2797 17.3179C9.2797 16.3891 8.527 15.6358 7.5984 15.6358C6.66886 15.6358 5.91616 16.3891 5.91616 17.3179C5.91616 18.2467 6.66979 19 7.5984 19C8.527 19 9.2797 18.2467 9.2797 17.3179Z" fill="black"/>%0A<path d="M14.0885 17.3179C14.0885 16.3882 13.3348 15.6358 12.4053 15.6358C11.4767 15.6358 10.724 16.3891 10.724 17.3179C10.724 18.2467 11.4767 19 12.4053 19C13.3348 19 14.0885 18.2467 14.0885 17.3179Z" fill="black"/>%0A<path d="M4.36447 12.4057C4.36447 11.4769 3.61177 10.7236 2.68223 10.7236C1.75363 10.7236 1 11.4769 1 12.4057C1 13.3345 1.75363 14.0878 2.68223 14.0878C3.61177 14.0878 4.36447 13.3345 4.36447 12.4057Z" fill="black"/>%0A<path d="M19 12.4057C19 11.4769 18.2464 10.7236 17.3178 10.7236C16.3892 10.7236 15.6365 11.4769 15.6365 12.4057C15.6365 13.3345 16.3892 14.0878 17.3178 14.0878C18.2464 14.0878 19 13.3345 19 12.4057Z" fill="black"/>%0A<path d="M4.36447 7.5934C4.36447 6.6646 3.61177 5.9113 2.68223 5.9113C1.75363 5.9113 1 6.6646 1 7.5934C1 8.5222 1.75363 9.2755 2.68223 9.2755C3.61177 9.2755 4.36447 8.5222 4.36447 7.5934Z" fill="black"/>%0A<path d="M19 7.5934C19 6.6646 18.2464 5.9113 17.3178 5.9113C16.3892 5.9113 15.6365 6.6646 15.6365 7.5934C15.6365 8.5222 16.3892 9.2755 17.3178 9.2755C18.2464 9.2755 19 8.5222 19 7.5934Z" fill="black"/>%0A<path d="M9.2797 2.6821C9.2797 1.7533 8.527 1 7.5984 1C6.66886 1 5.91616 1.7533 5.91616 2.6821C5.91616 3.6109 6.66886 4.3642 7.5984 4.3642C8.527 4.3642 9.2797 3.6109 9.2797 2.6821Z" fill="black"/>%0A<path d="M14.0885 2.6821C14.0885 1.7533 13.3348 1 12.4053 1C11.4767 1 10.724 1.7533 10.724 2.6821C10.724 3.6109 11.4767 4.3642 12.4053 4.3642C13.3348 4.3642 14.0885 3.6109 14.0885 2.6821Z" fill="black"/>%0A</g>%0A</g>%0A</svg>%0A';var Dn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5 2.5 6.4 10 10.3 17.5 6.4Z" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 10 10 13.9 17.5 10" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 13.6 10 17.5 17.5 13.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var In='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M5.83464 7.0835H3.33464C2.41416 7.0835 1.66797 7.82969 1.66797 8.75016V11.2502C1.66797 12.1707 2.41416 12.9168 3.33464 12.9168H5.83464L11.668 16.6668V3.3335L5.83464 7.0835Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M14.168 7.5C14.6891 8.18307 15.0013 9.05283 15.0013 10C15.0013 10.9472 14.6891 11.8169 14.168 12.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M16.668 5.8335C17.7103 6.97194 18.3346 8.42158 18.3346 10.0002C18.3346 11.5787 17.7103 13.0284 16.668 14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var Vn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.2 16.2 4.6V9.6C16.2 13.4 13.6 16.5 10 17.8 6.4 16.5 3.8 13.4 3.8 9.6V4.6Z" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.3 10 9.3 12 12.9 8.3" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Un='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M10 2.5V17.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M6.66797 5.8335V14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M3.33203 9.1665V10.8332" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_4" d="M13.332 5.8335V14.1668" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A<path id="Vector_5" d="M16.668 9.1665V10.8332" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var Bn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8.6" cy="8.6" r="5.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M12.8 12.8 17.5 17.5" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.4 8.6H10.8M8.6 6.4V10.8" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var jn='data:image/svg+xml,<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><ellipse cx="10" cy="4.6" rx="6" ry="2.4" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 4.6V15.4C4 16.7 6.7 17.8 10 17.8S16 16.7 16 15.4V4.6" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 10C4 11.3 6.7 12.4 10 12.4S16 11.3 16 10" stroke="black" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round"/></svg>%0A';var Gn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Frame">%0A<path id="Vector" d="M18.3333 17.0835V12.9168C18.3333 12.4566 17.9602 12.0835 17.5 12.0835H13.3333C12.8731 12.0835 12.5 12.4566 12.5 12.9168V17.0835C12.5 17.5437 12.8731 17.9168 13.3333 17.9168H17.5C17.9602 17.9168 18.3333 17.5437 18.3333 17.0835Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_2" d="M7.91927 6.6665V2.49984C7.91927 2.0396 7.54617 1.6665 7.08594 1.6665H2.91927C2.45903 1.6665 2.08594 2.0396 2.08594 2.49984V6.6665C2.08594 7.12674 2.45903 7.49984 2.91927 7.49984H7.08594C7.54617 7.49984 7.91927 7.12674 7.91927 6.6665Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_3" d="M4.41074 17.7441C4.73618 18.0695 5.26382 18.0695 5.58926 17.7441L7.74407 15.5892C8.06952 15.2638 8.06952 14.7362 7.74407 14.4108L5.58926 12.2559C5.26382 11.9305 4.73618 11.9305 4.41074 12.2559L2.25593 14.4108C1.93048 14.7362 1.93048 15.2638 2.25593 15.5892L4.41074 17.7441Z" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A<path id="Vector_4" d="M5 7.5V11.6667M8.33335 15H12.5" stroke="black" stroke-width="1.66667" stroke-linejoin="round"/>%0A</g>%0A</svg>%0A';var Nn='data:image/svg+xml,<svg preserveAspectRatio="none" overflow="visible" style="display: block;" width="16" height="16.4592" viewBox="0 0 16 16.4592" fill="none" xmlns="http://www.w3.org/2000/svg">%0A<g id="Vector">%0A<path d="M7.35974 14.9211C7.35974 14.0718 6.69067 13.383 5.86524 13.383C5.03899 13.383 4.36992 14.0718 4.36992 14.9211C4.36992 15.7704 5.03981 16.4592 5.86524 16.4592C6.69067 16.4592 7.35974 15.7704 7.35974 14.9211Z" fill="white"/>%0A<path d="M11.6342 14.9211C11.6342 14.071 10.9643 13.383 10.1381 13.383C9.31262 13.383 8.64356 14.0718 8.64356 14.9211C8.64356 15.7704 9.31262 16.4592 10.1381 16.4592C10.9643 16.4592 11.6342 15.7704 11.6342 14.9211Z" fill="white"/>%0A<path d="M2.99064 10.4294C2.99064 9.58008 2.32157 8.89127 1.49532 8.89127C0.66989 8.89127 0 9.58008 0 10.4294C0 11.2787 0.66989 11.9675 1.49532 11.9675C2.32157 11.9675 2.99064 11.2787 2.99064 10.4294Z" fill="white"/>%0A<path d="M16 10.4294C16 9.58008 15.3301 8.89127 14.5047 8.89127C13.6793 8.89127 13.0102 9.58008 13.0102 10.4294C13.0102 11.2787 13.6793 11.9675 14.5047 11.9675C15.3301 11.9675 16 11.2787 16 10.4294Z" fill="white"/>%0A<path d="M2.99064 6.02901C2.99064 5.17971 2.32157 4.4909 1.49532 4.4909C0.66989 4.4909 0 5.17971 0 6.02901C0 6.8783 0.66989 7.56712 1.49532 7.56712C2.32157 7.56712 2.99064 6.8783 2.99064 6.02901Z" fill="white"/>%0A<path d="M16 6.02901C16 5.17971 15.3301 4.4909 14.5047 4.4909C13.6793 4.4909 13.0102 5.17971 13.0102 6.02901C13.0102 6.8783 13.6793 7.56712 14.5047 7.56712C15.3301 7.56712 16 6.8783 16 6.02901Z" fill="white"/>%0A<path d="M7.35974 1.53811C7.35974 0.688818 6.69067 0 5.86524 0C5.03899 0 4.36992 0.688818 4.36992 1.53811C4.36992 2.38741 5.03899 3.07623 5.86524 3.07623C6.69067 3.07623 7.35974 2.38741 7.35974 1.53811Z" fill="white"/>%0A<path d="M11.6342 1.53811C11.6342 0.688818 10.9643 0 10.1381 0C9.31262 0 8.64356 0.688818 8.64356 1.53811C8.64356 2.38741 9.31262 3.07623 10.1381 3.07623C10.9643 3.07623 11.6342 2.38741 11.6342 1.53811Z" fill="white"/>%0A</g>%0A</svg>%0A';var Wn="[Retell]",dr={denoise:zn,turns:Hn,ivr:Ln,llm:Fn,harness:Dn,colloquial:In,guardrails:Vn,voices:Un,query:Bn,retrieval:jn,flow:Gn,listening:Nn},le=Tn("particles"),jt="(max-width: 767px)",qn="cubic-bezier(.2, .7, .2, 1)",pr=876;var ur={orb:{mid:"#FFB020",highlight:"#FF5A1F"},contactColor:"#FF5A1F",accent:"#F26B1D",particles:{active:"#F26B1D",highlight:"#FF9A3D"},lines:{active:"#F26B1D"}},hr={orb:{mid:le.orb.mid,highlight:le.orb.highlight},contactColor:le.contactColor,accent:le.accent,particles:{active:le.particles.active,highlight:le.particles.highlight},lines:{active:le.lines.active}},Kn=i=>i?{...le.camera,zoom:le.camera.zoom*1.04,panY:.75}:le.camera,mr=i=>{let e=i.match(/\d+(\.\d+)?/g);return e&&e.length>=3?"#"+e.slice(0,3).map(t=>Math.round(+t).toString(16).padStart(2,"0")).join(""):le.background},$=(i,e,t)=>{let n=document.createElement(i);return n.className=e,t!=null&&(n.textContent=t),n},fr=i=>{let e=$("span","rh26-stage-icon");return e.setAttribute("aria-hidden","true"),e.style.setProperty("--icon",'url("data:image/svg+xml,'+encodeURIComponent(decodeURIComponent(dr[i].replace(/^data:image\/svg\+xml,/,"")))+'")'),e};function Gt(i,e){let t=$("div","rh26-stage-card"),n=$("div","rh26-stage-card-body");return n.append($("p","rh26-stage-card-title",i.title),$("p","rh26-stage-card-text",i.text)),e&&n.append(e),t.append(fr(i.icon),n),t}function gr(i,e,t){if(i==="harness"){let r=$("div","rh26-stage-parts");return Oe.forEach(o=>{let s=$("div","rh26-stage-part");s.style.setProperty("--act","0");let a=$("span","rh26-stage-part-dot");a.append($("span","rh26-stage-part-lit"));let l=$("div","rh26-stage-part-copy"),c=$("p","rh26-stage-part-text",Bt[o].text);o==="retrieval"&&c.append($("span","rh26-stage-part-detail",Pn)),l.append($("p","rh26-stage-part-title",Bt[o].title),c),s.append(a,l),r.append(s),t.set(o,s)}),[Gt(Ut.harness,r)]}let n=e==="s2s"?On[i]:void 0;return n?[Gt(n)]:[Gt(Ut[i])]}function vr(i){if(i.hasAttribute("data-rh26-stage"))return;let e=i.querySelector(".rh26-agent-visual"),t=Array.from(i.querySelectorAll("[data-rh26-tab]"));if(!e||t.length!==Dt.length)return console.warn(Wn,"Conversational Dynamics: stage markup not found");i.setAttribute("data-rh26-stage","");let n=t.map(d=>document.getElementById(d.getAttribute("aria-controls")||"")),r=Array.from(i.querySelectorAll("[data-rh26-scene]")),o=Array.from(i.querySelectorAll("[data-rh26-arch]"));r.forEach(d=>{d.dataset.rh26Base=d.getAttribute("data-rh26-scene");let v=d.querySelector(".rh26-scene-label");v&&(v.dataset.rh26Base=v.textContent||"")});let s=t.map((d,v)=>{let S=d.querySelector(".rh26-tab-heading")||d,P=Array.from(S.childNodes).reverse().find(U=>U.nodeType===3&&(U.textContent||"").trim()),_=n[v]?.querySelector(".rh26-muted")||null,L=n[v]?.querySelector(".rh26-scene-list")||null;return{wrap:d.parentElement,titleNode:P,blurb:_,list:L,title:P?.textContent||"",text:_?.textContent||""}}),a=d=>r.find(v=>v.dataset.rh26Base===(d==="s2s"?"llm":d)),l=()=>It(f),c=d=>l().findIndex(v=>v.scenes.includes(d)),k=matchMedia("(prefers-reduced-motion: reduce)").matches,p=matchMedia(jt).matches,f="cascaded",w=$("div","rh26-stage-canvas"),b=$("div","rh26-stage-cards"),C=$("div","rh26-stage-frame"),u=$("div","rh26-stage-col");C.append(u),b.append(C),e.append(w,b);let x=$("div","rh26-stage-below");e.after(x);let E=null;try{E=new gt(w,{...le,speed:le.speed*2.5,background:mr(getComputedStyle(e).backgroundColor),camera:Kn(p)}),E.orb.setStyle(1,!0)}catch(d){console.warn(Wn,"Conversational Dynamics: WebGL unavailable, keeping the static artwork",d)}let m=E?E.config.scene:le.scene,h=new Map,y="";function R(){let d=f+":"+m;if(d===y)return;y=d,h.clear();let v=p?x:u;(p?u:x).replaceChildren(),v.querySelectorAll(".rh26-stage-set").forEach(P=>{P.classList.add("is-out"),P.removeAttribute("data-live"),setTimeout(()=>P.remove(),450)});let S=$("div","rh26-stage-set");S.setAttribute("data-live",""),S.append(...gr(m,f,h)),v.append(S)}function A(){p=matchMedia(jt).matches,i.classList.toggle("rh26-stage-is-mobile",p),C.style.transform="scale("+e.clientWidth/pr+")",y="",R()}let z=-1;function O(d,v,S){if(d){if(d.getAnimations().forEach(P=>P.cancel()),S||k){d.hidden=!v;return}if(v){d.hidden=!1;let P=d.offsetHeight;d.animate([{height:"0px",paddingTop:"0px",opacity:0},{height:P+"px",paddingTop:getComputedStyle(d).paddingTop,opacity:1}],{duration:500,easing:qn})}else{let P=d.offsetHeight;d.animate([{height:P+"px",paddingTop:getComputedStyle(d).paddingTop,opacity:1},{height:"0px",paddingTop:"0px",opacity:0}],{duration:400,easing:qn}).onfinish=()=>{d.hidden=!0}}}}function F(){let d=l(),v=new Set;s.forEach((S,P)=>{let _=d[P];if(S.wrap.style.display=_?"":"none",!_)return;let L=f==="cascaded";S.titleNode&&(S.titleNode.textContent=L?S.title:_.title),S.blurb&&(S.blurb.textContent=L?S.text:_.blurb),_.scenes.forEach(U=>{let B=a(U);if(!B)return;v.add(B),S.list&&S.list.append(B),B.style.display="",B.setAttribute("data-rh26-scene",U);let j=B.querySelector(".rh26-scene-label");j&&(j.textContent=L?j.dataset.rh26Base||"":xn(U,f).tab)})}),r.forEach(S=>{v.has(S)||(S.style.display="none")}),o.forEach(S=>S.setAttribute("aria-pressed",String(S.getAttribute("data-rh26-arch")===f)))}function I(d,v=!1){m=d;let S=Math.max(0,c(d));t.forEach((_,L)=>{_.setAttribute("aria-selected",String(L===S)),_.setAttribute("aria-expanded",String(L===S)),_.tabIndex=L===S?0:-1}),S!==z&&(n.forEach((_,L)=>{(L===S||L===z||v)&&O(_,L===S,v)}),z=S);let P=l()[S].scenes;r.forEach(_=>{let L=_.getAttribute("data-rh26-scene");L===d?_.setAttribute("aria-current","step"):_.removeAttribute("aria-current");let B=_.querySelector(".rh26-scene-bar"),j=P.indexOf(L);B&&(B.style.transform=j>=0&&j<P.indexOf(d)?"scaleY(1)":"scaleY(0)")}),R()}let T=d=>{if(!E)return I(d);d!==E.config.scene&&E.applyConfig({scene:d})};function M(d){if(d===f)return;f=d,F(),E?.applyConfig({...d==="s2s"?ur:hr,arch:d});let v=wn(m,d);v!==m&&T(v),z=-1,y="",I(E?E.config.scene:v,!0)}if(o.forEach(d=>d.addEventListener("click",()=>M(d.getAttribute("data-rh26-arch")==="s2s"?"s2s":"cascaded"))),t.forEach((d,v)=>{d.addEventListener("click",S=>{S.preventDefault();let P=l()[v];P&&T(P.scenes[0])}),d.addEventListener("keydown",S=>{if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(S.key))return;S.preventDefault();let _=l().length,L=S.key==="Home"?0:S.key==="End"?_-1:(v+(S.key==="ArrowDown"||S.key==="ArrowRight"?1:-1)+_)%_;T(l()[L].scenes[0]),t[L].focus()})}),r.forEach(d=>d.addEventListener("click",()=>T(d.getAttribute("data-rh26-scene")))),F(),I(m,!0),A(),new ResizeObserver(A).observe(e),matchMedia(jt).addEventListener("change",()=>{A(),E?.applyConfig({camera:Kn(p)})}),!E){i.classList.add("rh26-stage-is-live");return}let g=E;g.on("scene",d=>I(d)),g.on("loop",d=>{if(!g.config.autoplay)return;let v=ft(f);g.applyConfig({scene:v[(v.indexOf(d)+1)%v.length]})}),g.ready.then(()=>{e.classList.add("is-live"),i.classList.add("rh26-stage-is-live")}),(function d(){if(requestAnimationFrame(d),!e.classList.contains("is-live"))return;let v=i.querySelector('[data-rh26-scene="'+m+'"] .rh26-scene-bar');if(v&&(v.style.transform="scaleY("+g.progress.toFixed(4)+")"),m==="harness"){let S=g.progress*g.duration;h.forEach((P,_)=>P.style.setProperty("--act",ut(_,S).toFixed(3)))}})()}function Zn(){document.querySelectorAll('[data-rh26-component="Conversational Dynamics"]').forEach(vr)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Zn):Zn();
