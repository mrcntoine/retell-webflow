import*as N from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var Se=window.gsap;var _t=()=>{throw new Error("[Retell] exports are not included")},lt=_t,ct=_t;import*as D from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var Tt=1.7,Be=1.2,Rt=1.667,At={1:{streaks:3.2,fine:.7,smear:.2,rim:.75,back:.75,pole:1.2,halo:.3,exposure:.7,grain:.15,loop:5.76,seed:3.7},2:{streaks:1,fine:1.14,smear:0,rim:.41,back:.75,pole:0,halo:.3,exposure:.65,grain:.4,loop:20,seed:81.4}},kt={idle:{spin:1,breathe:0,exp:0,pole:0,halo:0,flow:0,wave:0,react:.25},listening:{spin:1.6,breathe:.04,exp:.1,pole:.2,halo:.2,flow:.22,wave:.22,react:.7},speaking:{spin:1.3,breathe:0,exp:.06,pole:.12,halo:.15,flow:.12,wave:.1,react:1},thinking:{spin:2.4,breathe:.03,exp:.04,pole:.3,halo:.12,flow:.5,wave:.04,react:0}},ut=r=>{let e=parseInt(r.replace("#",""),16);return[(e>>16&255)/255,(e>>8&255)/255,(e&255)/255]},Mt=`
uniform float uRadius;
out vec2 vP;
void main() {
  vec4 c = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vP = position.xy * ${Tt.toFixed(3)};
  gl_Position = projectionMatrix * vec4(c.xy + vP * uRadius, c.z, 1.0);
}`,Ct=`
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
`,di=`
${Ct}
uniform float uSmear;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  float mask = 1.0 - clamp((length(vP) - ${Be.toFixed(3)}) / ${(Rt-Be).toFixed(3)}, 0.0, 1.0);
  if (mask < 0.002) discard;
  outColor = ink(blurred(vP, 0.035, uSmear, 12)) * mask;
}`,hi=`
precision highp float;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  float d = length(vP), aa = fwidth(d);
  float a = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, d);
  if (a < 0.5) discard; // depth only inside the sphere
  outColor = vec4(0.9647, 0.9647, 0.9725, 1.0); // #F6F6F8
}`,mi=`
uniform float uRadius;
out vec2 vP;
void main() {
  vec4 c = modelViewMatrix * vec4(0.0, -2.0 * uRadius, 0.0, 1.0);
  vP = position.xy * ${Tt.toFixed(3)};
  gl_Position = projectionMatrix * vec4(c.xy + vP * uRadius, c.z, 1.0);
}`,fi=`
${Ct}
uniform float uRefl;
in vec2 vP;
layout(location = 0) out highp vec4 outColor;

void main() {
  // distance from the contact point, measured in an ellipse lying on the floor (wide, shallow), so the fade
  // rings out round the base instead of running in straight bands
  float far = length(vec2(vP.x * 0.36, max(0.0, 0.976 - vP.y))) / 0.6;
  float fade = exp(-2.4 * far * far);
  float a = uRefl * fade * (1.0 - clamp((length(vP) - ${Be.toFixed(3)}) / ${(Rt-Be).toFixed(3)}, 0.0, 1.0));
  if (a < 0.002) discard;
  // a wide blur needs more samples than the orb's, or its bright flare breaks up into speckles
  float blur = mix(0.05, 0.3, min(far, 1.0));
  outColor = ink(blurred(vec2(vP.x, -vP.y), blur, blur, 24)) * a;
}`,gi=["streaks","fine","smear","rim","back","pole","halo","exposure","grain"],Ve=class{constructor(e){this.group=new D.Group;this.drive={state:"idle",listen:0,speak:0};this.style=1;this.cur={...kt.idle};this.level=0;this.thinking=0;this.clock=0;this.flow=0;this.phase=0;this.energy=0;this.hueShift=0;this.params={...e},this.look={...e.looks[this.style]};let t=n=>new D.Vector3(...ut(n));this.uniforms={uRadius:{value:e.radius},uClock:{value:0},uFlow:{value:0},uWave:{value:0},uT:{value:0},uStreaks:{value:0},uFine:{value:0},uSmear:{value:0},uRim:{value:0},uBack:{value:0},uPole:{value:0},uHalo:{value:0},uGrain:{value:0},uExposure:{value:0},uSeed:{value:0},uCore:{value:t(e.highlight)},uMid:{value:t(e.mid)},uRefl:{value:e.reflection}};let i=(n,a)=>new D.ShaderMaterial({glslVersion:D.GLSL3,vertexShader:n,fragmentShader:a,uniforms:this.uniforms,transparent:!0,premultipliedAlpha:!0,depthWrite:!1});this.mesh=new D.Mesh(new D.PlaneGeometry(2,2),i(Mt,di)),this.mesh.frustumCulled=!1,this.mesh.renderOrder=2.5,this.mesh.name="orb",this.backdrop=new D.Mesh(new D.PlaneGeometry(2,2),new D.ShaderMaterial({glslVersion:D.GLSL3,vertexShader:Mt,fragmentShader:hi,uniforms:this.uniforms})),this.backdrop.frustumCulled=!1,this.backdrop.renderOrder=2,this.backdrop.name="orb-backdrop",this.reflection=new D.Mesh(new D.PlaneGeometry(2,2),i(mi,fi)),this.reflection.material.depthTest=!1,this.reflection.frustumCulled=!1,this.reflection.renderOrder=-3,this.reflection.name="orb-reflection",this.group.add(this.backdrop,this.mesh,this.reflection),this.setParams(e),this.writeLook(0)}get highlightNow(){return this.uniforms.uCore.value}get midNow(){return this.uniforms.uMid.value}get radius(){return this.params.radius}setParams(e){Object.assign(this.params,e);let t=this.params.radius;this.group.position.set(0,t,0),this.uniforms.uRadius.value=t,this.uniforms.uRefl.value=this.params.reflection}setStyle(e,t=!1){this.style=e,t&&(this.look={...this.params.looks[e]})}writeLook(e){let{look:t,uniforms:i}=this,n=this.params.looks[this.style];for(let a of gi)t[a]+=(n[a]-t[a])*e;t.loop=n.loop,t.seed=n.seed,i.uStreaks.value=t.streaks,i.uFine.value=t.fine,i.uSmear.value=t.smear,i.uRim.value=t.rim,i.uBack.value=t.back,i.uGrain.value=t.grain,i.uSeed.value=t.seed}update(e){e=Math.min(e,.1);let{drive:t,cur:i,uniforms:n}=this,a=h=>Number.isFinite(h)?h:0,s=t.state==="listening"?a(t.listen):t.state==="speaking"?a(t.speak):0,o=kt[t.state],c=1-Math.exp(-e*5);for(let h of Object.keys(o))i[h]+=(o[h]-i[h])*c;this.level+=(s-this.level)*Math.min(1,(s>this.level?30:7)*e),this.clock+=e,this.flow+=e*(i.flow+this.level*i.react*1.2),this.writeLook(c);let{look:l}=this,w=i.spin*(1+this.level*i.react*.5)*this.params.speed/Math.max(.1,l.loop);this.phase=(this.phase+e*w)%1;let u=this.level*i.react,f=i.breathe*Math.sin(this.clock*2.4);n.uClock.value=this.clock,n.uFlow.value=this.flow,n.uT.value=this.phase,n.uWave.value=i.wave+u*1.1,n.uPole.value=l.pole*(1+i.pole+u*.7),n.uHalo.value=l.halo*(1+i.halo+u*.3),n.uExposure.value=l.exposure*(1+i.exp+u*.3+f*3);let d=1-Math.exp(-e*8);n.uCore.value.lerp(new D.Vector3(...ut(this.params.highlight)),d),n.uMid.value.lerp(new D.Vector3(...ut(this.params.mid)),d),this.thinking+=((t.state==="thinking"?1:0)-this.thinking)*c,this.energy+=(Math.min(1,.25+.75*Math.max(this.level,this.thinking*.6))-this.energy)*(1-Math.exp(-e*6))}settle(){for(let e=0;e<90;e++)this.update(1/30)}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.backdrop.geometry.dispose(),this.backdrop.material.dispose(),this.reflection.geometry.dispose(),this.reflection.material.dispose()}};import*as U from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as te from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var ve=(r,e=0,t=1)=>Math.min(t,Math.max(e,r)),L=(r,e,t)=>r+(e-r)*t,bi=r=>r-Math.floor(r),ie=(r,e,t)=>{let i=ve((t-r)/(e-r));return i*i*(3-2*i)},Ge=r=>1-Math.pow(1-ve(r),3),oe=r=>(r=ve(r),r<.5?4*r*r*r:1-Math.pow(-2*r+2,3)/2);function dt(r,e,t,i=.3,n=.3){return r<=e||r>=t?0:Math.min(oe((r-e)/i),oe((t-r)/n),1)}var B=r=>bi(Math.sin(r*12.9898+78.233)*43758.5453);function ht(r){let e=r>>>0||1;return()=>{e|=0,e=e+1831565813|0;let t=Math.imul(e^e>>>15,1|e);return t=t+Math.imul(t^t>>>7,61|t)^t,((t^t>>>14)>>>0)/4294967296}}function xe(r,e=0){let i=Math.floor(r/.17),n=r/.17-i,a=Math.floor(r/.62+B(e*3.1)*7);return B(a*1.7+e)<.18?0:(.45+.55*B(i*.73+e*11.3))*Math.pow(Math.sin(Math.PI*n),.7)}function ae(r,e=new te.Vector3){let t=new te.Color;t.setStyle(r,te.SRGBColorSpace);let i=t.clone().convertLinearToSRGB();return e.set(i.r,i.g,i.b)}var pt=new te.Color,Pe={h:0,s:0,l:0};function mt(r,e,t){return pt.setRGB(r,e,t,te.SRGBColorSpace).getHSL(Pe,te.SRGBColorSpace).h}function He(r,e){return Math.abs(e)<1e-4?r:(pt.setStyle(r,te.SRGBColorSpace).getHSL(Pe,te.SRGBColorSpace),`#${pt.setHSL(((Pe.h+e)%1+1)%1,Pe.s,Pe.l,te.SRGBColorSpace).getHexString(te.SRGBColorSpace)}`)}var P=Math.PI*2;var de=16,je=24,vi=`
varying vec3 vWorld;
void main() {
  vec4 w = modelMatrix * vec4(position, 1.0);
  vWorld = w.xyz;
  gl_Position = projectionMatrix * viewMatrix * w;
}`,yi=`
precision highp float;
varying vec3 vWorld;
uniform float uCell, uWidth, uOpacity, uMajor, uStyle;
uniform vec3 uLine, uAccent, uGlowColor, uShadowColor;
uniform vec2 uFade;
uniform float uGlow, uShadow, uOrbR, uGlobal;
uniform vec2 uViewR, uViewF;   // floor axes facing the camera: across the screen, and into it
uniform float uSquash;
uniform vec4 uRip[${de}];
uniform vec2 uRipXZ[${de}];
uniform float uRipKind[${de}];
uniform int uRipN;
uniform vec4 uTile[${je}];
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
  for (int i = 0; i < ${de}; i++) {
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
  for (int i = 0; i < ${je}; i++) {
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
}`,We=class{constructor(){this.ripples=[];this.tiles=[];this.glowAdd=0;this.baseGlow=.3;let e=Array.from({length:de},()=>new U.Vector4);this.u={uCell:{value:.75},uWidth:{value:1},uOpacity:{value:.1},uMajor:{value:0},uStyle:{value:0},uLine:{value:new U.Vector3},uAccent:{value:new U.Vector3},uGlowColor:{value:new U.Vector3},uShadowColor:{value:new U.Vector3},uFade:{value:new U.Vector2(3,7)},uGlow:{value:.3},uShadow:{value:.3},uOrbR:{value:1},uViewR:{value:new U.Vector2(1,0)},uViewF:{value:new U.Vector2(0,1)},uSquash:{value:1},uGlobal:{value:1},uRip:{value:e},uRipXZ:{value:Array.from({length:de},()=>new U.Vector2)},uRipKind:{value:new Array(de).fill(0)},uRipN:{value:0},uTile:{value:Array.from({length:je},()=>new U.Vector4)},uTileN:{value:0}};let t=new U.ShaderMaterial({vertexShader:vi,fragmentShader:yi,uniforms:this.u,transparent:!0,depthWrite:!1});this.mesh=new U.Mesh(new U.PlaneGeometry(80,80),t),this.mesh.rotation.x=-Math.PI/2,this.mesh.renderOrder=-2,this.mesh.name="floor"}setLook(e,t){let i=this.u;i.uStyle.value={lines:0,dots:1,cross:2}[e.style],ae(e.color,i.uLine.value),ae(e.accent,i.uAccent.value),ae(e.glowColor,i.uGlowColor.value),ae(e.shadowColor,i.uShadowColor.value),i.uOpacity.value=e.opacity,i.uCell.value=e.cell,i.uWidth.value=e.width,i.uMajor.value=e.major,i.uFade.value.set(e.fadeInner,e.fadeOuter),i.uGlow.value=e.glow,i.uShadow.value=e.shadow,i.uOrbR.value=t,this.baseGlow=e.glow}set shadowColor(e){ae(e,this.u.uShadowColor.value)}set glowColor(e){this.u.uGlowColor.value.copy(e)}setView(e,t){this.u.uViewR.value.set(Math.cos(e),-Math.sin(e)),this.u.uViewF.value.set(Math.sin(e),Math.cos(e)),this.u.uSquash.value=.2/Math.max(.05,Math.sin(t))}set opacity(e){this.u.uGlobal.value=e}beginFrame(){this.ripples.length=0,this.tiles.length=0,this.glowAdd=0}ripple(e){this.ripples.length<de&&e.strength>.002&&this.ripples.push(e)}tile(e){this.tiles.length<je&&e.strength>.002&&this.tiles.push(e)}endFrame(e){let t=this.u,i=t.uRip.value,n=t.uRipXZ.value,a=t.uRipKind.value;this.ripples.forEach((o,c)=>{i[c].set(o.radius,o.strength,o.width,0),n[c].set(o.x??0,o.z??0),a[c]=o.kind??0}),t.uRipN.value=this.ripples.length;let s=t.uTile.value;this.tiles.forEach((o,c)=>s[c].set(o.x,o.z,o.strength,o.size??t.uCell.value)),t.uTileN.value=this.tiles.length,t.uGlow.value=this.baseGlow*(.6+.6*e)+this.glowAdd}get frameEffects(){return{ripples:this.ripples.slice(),tiles:this.tiles.slice()}}get cell(){return this.u.uCell.value}dispose(){this.mesh.geometry.dispose(),this.mesh.material.dispose()}};import*as H from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as Mi,InstancedInterleavedBuffer as Ti,InterleavedBufferAttribute as Ft,Line3 as Ri,MathUtils as Ai,Matrix4 as Ci,Mesh as Oi,Sphere as zi,Vector3 as me,Vector4 as Le}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import{Box3 as Ht,Float32BufferAttribute as Ot,InstancedBufferGeometry as wi,InstancedInterleavedBuffer as zt,InterleavedBufferAttribute as Ne,Sphere as Si,Vector3 as xi,WireframeGeometry as Ei}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var Pt=new Ht,qe=new xi,Ee=class extends wi{constructor(){super(),this.isLineSegmentsGeometry=!0,this.type="LineSegmentsGeometry";let e=[-1,2,0,1,2,0,-1,1,0,1,1,0,-1,0,0,1,0,0,-1,-1,0,1,-1,0],t=[-1,2,1,2,-1,1,1,1,-1,-1,1,-1,-1,-2,1,-2],i=[0,2,1,2,3,1,2,4,3,4,5,3,4,6,5,6,7,5];this.setIndex(i),this.setAttribute("position",new Ot(e,3)),this.setAttribute("uv",new Ot(t,2))}applyMatrix4(e){let t=this.attributes.instanceStart,i=this.attributes.instanceEnd;return t!==void 0&&(t.applyMatrix4(e),i.applyMatrix4(e),t.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}setPositions(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new zt(t,6,1);return this.setAttribute("instanceStart",new Ne(i,3,0)),this.setAttribute("instanceEnd",new Ne(i,3,3)),this.instanceCount=this.attributes.instanceStart.count,this.computeBoundingBox(),this.computeBoundingSphere(),this}setColors(e){let t;e instanceof Float32Array?t=e:Array.isArray(e)&&(t=new Float32Array(e));let i=new zt(t,6,1);return this.setAttribute("instanceColorStart",new Ne(i,3,0)),this.setAttribute("instanceColorEnd",new Ne(i,3,3)),this}fromWireframeGeometry(e){return this.setPositions(e.attributes.position.array),this}fromEdgesGeometry(e){return this.setPositions(e.attributes.position.array),this}fromMesh(e){return this.fromWireframeGeometry(new Ei(e.geometry)),this}fromLineSegments(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ht);let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;e!==void 0&&t!==void 0&&(this.boundingBox.setFromBufferAttribute(e),Pt.setFromBufferAttribute(t),this.boundingBox.union(Pt))}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Si),this.boundingBox===null&&this.computeBoundingBox();let e=this.attributes.instanceStart,t=this.attributes.instanceEnd;if(e!==void 0&&t!==void 0){let i=this.boundingSphere.center;this.boundingBox.getCenter(i);let n=0;for(let a=0,s=e.count;a<s;a++)qe.fromBufferAttribute(e,a),n=Math.max(n,i.distanceToSquared(qe)),qe.fromBufferAttribute(t,a),n=Math.max(n,i.distanceToSquared(qe));this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&console.error("THREE.LineSegmentsGeometry.computeBoundingSphere(): Computed radius is NaN. The instanced position data is likely to have NaN values.",this)}}toJSON(){}};import{ShaderLib as Ke,ShaderMaterial as _i,UniformsLib as $e,UniformsUtils as Lt,Vector2 as ki}from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";$e.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new ki},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Ke.line={uniforms:Lt.merge([$e.common,$e.fog,$e.line]),vertexShader:`
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
		`};var he=class extends _i{constructor(e){super({type:"LineMaterial",uniforms:Lt.clone(Ke.line.uniforms),vertexShader:Ke.line.vertexShader,fragmentShader:Ke.line.fragmentShader,clipping:!0}),this.isLineMaterial=!0,this.setValues(e)}get color(){return this.uniforms.diffuse.value}set color(e){this.uniforms.diffuse.value=e}get worldUnits(){return"WORLD_UNITS"in this.defines}set worldUnits(e){e===!0!==this.worldUnits&&(this.needsUpdate=!0),e===!0?this.defines.WORLD_UNITS="":delete this.defines.WORLD_UNITS}get linewidth(){return this.uniforms.linewidth.value}set linewidth(e){this.uniforms.linewidth&&(this.uniforms.linewidth.value=e)}get dashed(){return"USE_DASH"in this.defines}set dashed(e){e===!0!==this.dashed&&(this.needsUpdate=!0),e===!0?this.defines.USE_DASH="":delete this.defines.USE_DASH}get dashScale(){return this.uniforms.dashScale.value}set dashScale(e){this.uniforms.dashScale.value=e}get dashSize(){return this.uniforms.dashSize.value}set dashSize(e){this.uniforms.dashSize.value=e}get dashOffset(){return this.uniforms.dashOffset.value}set dashOffset(e){this.uniforms.dashOffset.value=e}get gapSize(){return this.uniforms.gapSize.value}set gapSize(e){this.uniforms.gapSize.value=e}get opacity(){return this.uniforms.opacity.value}set opacity(e){this.uniforms&&(this.uniforms.opacity.value=e)}get resolution(){return this.uniforms.resolution.value}set resolution(e){this.uniforms.resolution.value.copy(e)}get alphaToCoverage(){return"USE_ALPHA_TO_COVERAGE"in this.defines}set alphaToCoverage(e){this.defines&&(e===!0!==this.alphaToCoverage&&(this.needsUpdate=!0),e===!0?this.defines.USE_ALPHA_TO_COVERAGE="":delete this.defines.USE_ALPHA_TO_COVERAGE)}};var ft=new Le,Dt=new me,It=new me,G=new Le,j=new Le,se=new Le,gt=new me,bt=new Ci,W=new Ri,Ut=new me,Xe=new Mi,Ye=new zi,le=new Le,ce,ye;function Bt(r,e,t){return le.set(0,0,-e,1).applyMatrix4(r.projectionMatrix),le.multiplyScalar(1/le.w),le.x=ye/t.width,le.y=ye/t.height,le.applyMatrix4(r.projectionMatrixInverse),le.multiplyScalar(1/le.w),Math.abs(Math.max(le.x,le.y))}function Pi(r,e){let t=r.matrixWorld,i=r.geometry,n=i.attributes.instanceStart,a=i.attributes.instanceEnd,s=Math.min(i.instanceCount,n.count);for(let o=0,c=s;o<c;o++){W.start.fromBufferAttribute(n,o),W.end.fromBufferAttribute(a,o),W.applyMatrix4(t);let l=new me,w=new me;ce.distanceSqToSegment(W.start,W.end,w,l),w.distanceTo(l)<ye*.5&&e.push({point:w,pointOnLine:l,distance:ce.origin.distanceTo(w),object:r,face:null,faceIndex:o,uv:null,uv1:null})}}function Hi(r,e,t){let i=e.projectionMatrix,a=r.material.resolution,s=r.matrixWorld,o=r.geometry,c=o.attributes.instanceStart,l=o.attributes.instanceEnd,w=Math.min(o.instanceCount,c.count),u=-e.near;ce.at(1,se),se.w=1,se.applyMatrix4(e.matrixWorldInverse),se.applyMatrix4(i),se.multiplyScalar(1/se.w),se.x*=a.x/2,se.y*=a.y/2,se.z=0,gt.copy(se),bt.multiplyMatrices(e.matrixWorldInverse,s);for(let f=0,d=w;f<d;f++){if(G.fromBufferAttribute(c,f),j.fromBufferAttribute(l,f),G.w=1,j.w=1,G.applyMatrix4(bt),j.applyMatrix4(bt),G.z>u&&j.z>u)continue;if(G.z>u){let b=G.z-j.z,k=(G.z-u)/b;G.lerp(j,k)}else if(j.z>u){let b=j.z-G.z,k=(j.z-u)/b;j.lerp(G,k)}G.applyMatrix4(i),j.applyMatrix4(i),G.multiplyScalar(1/G.w),j.multiplyScalar(1/j.w),G.x*=a.x/2,G.y*=a.y/2,j.x*=a.x/2,j.y*=a.y/2,W.start.copy(G),W.start.z=0,W.end.copy(j),W.end.z=0;let x=W.closestPointToPointParameter(gt,!0);W.at(x,Ut);let M=Ai.lerp(G.z,j.z,x),_=M>=-1&&M<=1,S=gt.distanceTo(Ut)<ye*.5;if(_&&S){W.start.fromBufferAttribute(c,f),W.end.fromBufferAttribute(l,f),W.start.applyMatrix4(s),W.end.applyMatrix4(s);let b=new me,k=new me;ce.distanceSqToSegment(W.start,W.end,k,b),t.push({point:k,pointOnLine:b,distance:ce.origin.distanceTo(k),object:r,face:null,faceIndex:f,uv:null,uv1:null})}}}var Qe=class extends Oi{constructor(e=new Ee,t=new he({color:Math.random()*16777215})){super(e,t),this.isLineSegments2=!0,this.type="LineSegments2"}computeLineDistances(){let e=this.geometry,t=e.attributes.instanceStart,i=e.attributes.instanceEnd,n=new Float32Array(2*t.count);for(let s=0,o=0,c=t.count;s<c;s++,o+=2)Dt.fromBufferAttribute(t,s),It.fromBufferAttribute(i,s),n[o]=o===0?0:n[o-1],n[o+1]=n[o]+Dt.distanceTo(It);let a=new Ti(n,2,1);return e.setAttribute("instanceDistanceStart",new Ft(a,1,0)),e.setAttribute("instanceDistanceEnd",new Ft(a,1,1)),this}raycast(e,t){let i=this.material.worldUnits,n=e.camera;if(n===null&&!i&&console.error('LineSegments2: "Raycaster.camera" needs to be set in order to raycast against LineSegments2 while worldUnits is set to false.'),i===!1&&(this.material.resolution.x===0||this.material.resolution.y===0))return;let a=e.params.Line2!==void 0&&e.params.Line2.threshold||0;ce=e.ray;let s=this.matrixWorld,o=this.geometry,c=this.material;ye=c.linewidth+a,o.boundingSphere===null&&o.computeBoundingSphere(),Ye.copy(o.boundingSphere).applyMatrix4(s);let l;if(i)l=ye*.5;else{let u=Math.max(n.near,Ye.distanceToPoint(ce.origin));l=Bt(n,u,c.resolution)}if(Ye.radius+=l,ce.intersectsSphere(Ye)===!1)return;o.boundingBox===null&&o.computeBoundingBox(),Xe.copy(o.boundingBox).applyMatrix4(s);let w;if(i)w=ye*.5;else{let u=Math.max(n.near,Xe.distanceToPoint(ce.origin));w=Bt(n,u,c.resolution)}Xe.expandByScalar(w),ce.intersectsBox(Xe)!==!1&&(i?Pi(this,t):Hi(this,n,t))}onBeforeRender(e){let t=this.material.uniforms;t&&t.resolution&&(e.getViewport(ft),this.material.uniforms.resolution.value.set(ft.z,ft.w))}};var _e=class extends Ee{constructor(){super(),this.isLineGeometry=!0,this.type="LineGeometry"}setPositions(e){let t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setPositions(i),this}setColors(e){let t=e.length-3,i=new Float32Array(2*t);for(let n=0;n<t;n+=3)i[2*n]=e[n],i[2*n+1]=e[n+1],i[2*n+2]=e[n+2],i[2*n+3]=e[n+3],i[2*n+4]=e[n+4],i[2*n+5]=e[n+5];return super.setColors(i),this}setFromPoints(e){let t=e.length-1,i=new Float32Array(6*t);for(let n=0;n<t;n++)i[6*n]=e[n].x,i[6*n+1]=e[n].y,i[6*n+2]=e[n].z||0,i[6*n+3]=e[n+1].x,i[6*n+4]=e[n+1].y,i[6*n+5]=e[n+1].z||0;return super.setPositions(i),this}fromLine(e){let t=e.geometry;return this.setPositions(t.attributes.position.array),this}};var Je=class extends Qe{constructor(e=new _e,t=new he({color:Math.random()*16777215})){super(e,t),this.isLine2=!0,this.type="Line2"}};var vt=class extends Je{constructor(e,t){let i=new _e;i.setPositions(new Float32Array(e*3)),i.setColors(new Float32Array(e*3).fill(1)),super(i,t),this.computeLineDistances(),this.cap=e,this.pos=i.attributes.instanceStart.data.array,this.col=i.attributes.instanceColorStart.data.array,this.dist=i.attributes.instanceDistanceStart.data.array,this.frustumCulled=!1,this.renderOrder=3,i.instanceCount=0}setPoints(e,t){let i=Array.isArray(e)&&e[0]instanceof H.Vector3,n=Math.min(this.cap,i?e.length:e.length/3),a=(c,l)=>i?e[c].getComponent(l):e[c*3+l],s=0;for(let c=0;c<n-1;c++){let l=c*6;for(let d=0;d<3;d++)this.pos[l+d]=a(c,d),this.pos[l+3+d]=a(c+1,d),t&&(this.col[l+d]=t[c*3+d],this.col[l+3+d]=t[(c+1)*3+d]);let w=this.pos[l+3]-this.pos[l],u=this.pos[l+4]-this.pos[l+1],f=this.pos[l+5]-this.pos[l+2];this.dist[c*2]=s,s+=Math.sqrt(w*w+u*u+f*f),this.dist[c*2+1]=s}let o=this.geometry;return o.attributes.instanceStart.data.needsUpdate=!0,t&&(o.attributes.instanceColorStart.data.needsUpdate=!0),o.attributes.instanceDistanceStart.data.needsUpdate=!0,o.instanceCount=Math.max(0,n-1),s}get opacity(){return this.material.opacity}set opacity(e){this.material.opacity=e,this.visible=e>.003}},Li=`
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
}`,Fi=`
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
}`,fe=class extends H.Points{constructor(e,t,i=0){let n=new H.BufferGeometry,a=new Float32Array(e*3),s=new Float32Array(e),o=new Float32Array(e*4);n.setAttribute("position",new H.BufferAttribute(a,3).setUsage(H.DynamicDrawUsage)),n.setAttribute("aSize",new H.BufferAttribute(s,1).setUsage(H.DynamicDrawUsage)),n.setAttribute("aColor",new H.BufferAttribute(o,4).setUsage(H.DynamicDrawUsage));let c=new H.ShaderMaterial({vertexShader:Li,fragmentShader:Fi,uniforms:{uScale:t,uOpacity:{value:1},uSoft:{value:i}},transparent:!0,depthWrite:!1});super(n,c),this.count=e,this.pos=a,this.size=s,this.color=o,this.frustumCulled=!1,this.renderOrder=3}set(e,t,i,n,a,s,o){let c=e*3,l=e*4;this.pos[c]=t,this.pos[c+1]=i,this.pos[c+2]=n,this.size[e]=a,this.color[l]=s[0],this.color[l+1]=s[1],this.color[l+2]=s[2],this.color[l+3]=o}commit(){let e=this.geometry.attributes;e.position.needsUpdate=!0,e.aSize.needsUpdate=!0,e.aColor.needsUpdate=!0}set soft(e){this.material.uniforms.uSoft.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},Di=`
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
}`,Ii=`
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
}`,ke=class extends H.Mesh{constructor(e,t,i=0){let n=new H.InstancedBufferGeometry;n.setAttribute("position",new H.BufferAttribute(new Float32Array([0,-1,0,1,-1,0,1,1,0,0,1,0]),3)),n.setIndex([0,1,2,0,2,3]);let a=new Float32Array(e*3),s=new Float32Array(e*3),o=new Float32Array(e*4),c=new Float32Array(e),l=(u,f)=>new H.InstancedBufferAttribute(u,f).setUsage(H.DynamicDrawUsage);n.setAttribute("aStart",l(a,3)),n.setAttribute("aEnd",l(s,3)),n.setAttribute("aColor",l(o,4)),n.setAttribute("aWidth",l(c,1)),n.instanceCount=e;let w=new H.ShaderMaterial({vertexShader:Di,fragmentShader:Ii,uniforms:{uRes:{value:t},uTail:{value:i},uOpacity:{value:1}},transparent:!0,depthWrite:!1});super(n,w),this.count=e,this.start=a,this.end=s,this.color=o,this.width=c,this.frustumCulled=!1,this.renderOrder=3,this.userData.kind="streaks"}set(e,t,i,n,a,s,o,c,l,w){let u=e*3,f=e*4;this.start[u]=t,this.start[u+1]=i,this.start[u+2]=n,this.end[u]=a,this.end[u+1]=s,this.end[u+2]=o,this.width[e]=c,this.color[f]=l[0],this.color[f+1]=l[1],this.color[f+2]=l[2],this.color[f+3]=w}commit(){let e=this.geometry.attributes;e.aStart.needsUpdate=!0,e.aEnd.needsUpdate=!0,e.aColor.needsUpdate=!0,e.aWidth.needsUpdate=!0}set tail(e){this.material.uniforms.uTail.value=e}get opacity(){return this.material.uniforms.uOpacity.value}set opacity(e){this.material.uniforms.uOpacity.value=e,this.visible=e>.003}},Ze=class{constructor(e,t,i){this.look=e;this.resolution=t,this.pointScale=i}lineMaterial(e={}){let t=new he({color:e.vertexColors?16777215:new H.Color(e.color??this.look.ink).getHex(),linewidth:e.width??1.25,transparent:!0,opacity:e.opacity??1,dashed:!!e.dashed,dashSize:e.dash??.08,gapSize:e.gap??.08,vertexColors:!!e.vertexColors,depthWrite:!1});return t.uniforms.resolution.value=this.resolution,t}line(e,t={}){let i=new vt(e,this.lineMaterial(t));return i.userData.baseWidth=t.width??1.25,t.vertexColors||(i.userData.role=(t.color??this.look.ink).toLowerCase()===this.look.accent.toLowerCase()?"active":"muted"),i}particles(e,t=0){return new fe(e,this.pointScale,t)}streaks(e,t=0){return new ke(e,this.resolution,t)}linear(e){let t=new H.Color(e);return[t.r,t.g,t.b]}srgb(e){let t=ae(e);return[t.x,t.y,t.z]}};import*as jt from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var Vt=.3,Ui=10,Wt=.01;function Fe(r){let e=[];return r.traverse(t=>{(t instanceof fe||t instanceof ke)&&e.push(t)}),e}var et=()=>({x:0,y:0,z:0,s:0,c:[0,0,0,0]});function Bi(r,e,t,i){let n=e*3,a=e*4,s=r instanceof fe?r.pos:r.end;return i.x=s[n],i.y=s[n+1],i.z=s[n+2],i.s=r instanceof fe?Math.max(r.size[e]*t,.5):r.width[e],i.c[0]=r.color[a],i.c[1]=r.color[a+1],i.c[2]=r.color[a+2],i.c[3]=r.visible?r.color[a+3]*r.opacity:0,i}function it(r){let e=r.reduce((a,s)=>a+s.count,0),t=new Uint16Array(e),i=new Uint32Array(e),n=0;return r.forEach((a,s)=>{for(let o=0;o<a.count;o++,n++)t[n]=s,i[n]=o}),{n:e,fields:r,field:t,local:i,read:(a,s,o)=>Bi(r[t[a]],i[a],s,o)}}function Nt(r,e){let t=it(r),i=et(),n=[],a=[],s=[];for(let o=0;o<t.n;o++)t.read(o,e,i),!(i.c[3]<Wt)&&(n.push(i.x,i.y,i.z),a.push(i.s),s.push(...i.c));return{n:a.length,read(o,c,l){l.x=n[o*3],l.y=n[o*3+1],l.z=n[o*3+2],l.s=a[o];for(let w=0;w<4;w++)l.c[w]=s[o*4+w];return l}}}function Gt(r,e){let t=et(),i=[],n=[],a=[];for(let s=0;s<r.n;s++)r.read(s,e,t),!(t.c[3]<Wt)&&(i.push(s),n.push(Math.hypot(t.x,t.z)),a.push(Math.atan2(t.z,t.x)));return{idx:i,r:Float64Array.from(n),a:Float64Array.from(a)}}var tt=class{constructor(e,t,i,n,a){this.src=e;this.look=i;this.resolution=n;this.pointScale=a;this.group=new jt.Group;this.dots=null;this.trails=null;this.p=0;this.links=null;this.carried=new Uint8Array(0);this.sd=et();this.td=et();this.target=it(t),this.group.name="morph"}get done(){return this.p>=1}link(e){let t=Gt(this.src,e),i=Gt(this.target,e),n=t.idx.length,a=i.idx.length,s=(x,M)=>Array.from({length:x},(_,S)=>S).sort((_,S)=>M[_]-M[S]),o={s:s(n,t.r),t:s(a,i.r)},c=Math.max(1,Math.min(Ui,n,a)),l=[],w=[],u=[],f=[],d=[];if(n&&a)for(let x=0;x<c;x++){let M=o.s.slice(Math.floor(x*n/c),Math.floor((x+1)*n/c)).sort((b,k)=>t.a[b]-t.a[k]),_=o.t.slice(Math.floor(x*a/c),Math.floor((x+1)*a/c)).sort((b,k)=>i.a[b]-i.a[k]),S=Math.max(M.length,_.length);for(let b=0;b<S;b++){let k=Math.floor(b*M.length/S),E=Math.floor(b*_.length/S);l.push(t.idx[M[k]]),w.push(i.idx[_[E]]),u.push(b===0||Math.floor((b-1)*M.length/S)!==k?1:0),f.push(b===0||Math.floor((b-1)*_.length/S)!==E?1:0),d.push(Vt*(.7*(c>1?x/(c-1):0)+.3*B(l.length*.731)))}}let h=l.length;this.links={n:h,s:Uint32Array.from(l),t:Uint32Array.from(w),sKeep:Uint8Array.from(u),tKeep:Uint8Array.from(f),delay:Float32Array.from(d)},this.carried=new Uint8Array(this.target.n);for(let x of w)this.carried[x]=1;h&&(this.trails=new ke(h,this.resolution,0),this.dots=new fe(h,this.pointScale),this.group.add(this.trails,this.dots))}update(e,t,i){if(this.links||this.link(t),this.p=Math.min(1,this.p+e/Math.max(.05,this.look.duration)),this.done)return;let n=this.links,{src:a,target:s,sd:o,td:c}=this,l=i,w=this.look.swirl,u=this.look.trail,f=[0,0,0],d=[0,0,0],h=[0,0,0],x=(b,k)=>{let E=Math.atan2(o.z,o.x),R=Math.hypot(o.x,o.z),O=Math.atan2(c.z,c.x),p=Math.hypot(c.x,c.z),g=O-E;g-=Math.round(g/(2*Math.PI))*2*Math.PI;let v=E+g*k+w*Math.sin(Math.PI*k),y=L(R,p,k);b[0]=Math.cos(v)*y,b[1]=L(o.y,c.y,k),b[2]=Math.sin(v)*y},{dots:M,trails:_}=this;if(M&&_){for(let b=0;b<n.n;b++){a.read(n.s[b],t,o),s.read(n.t[b],t,c);let k=ve((this.p-n.delay[b])/(1-Vt)),E=oe(k);x(f,E),x(d,oe(k-u));for(let v=0;v<3;v++)h[v]=L(o.c[v],c.c[v],E);let R=L(o.c[3]*n.sKeep[b],c.c[3]*n.tKeep[b],E),O=f[0]*f[0]+(f[1]-l)**2+f[2]*f[2]<l*l*1.02?0:R,p=L(o.s,c.s,E);M.set(b,f[0],f[1],f[2],p/t,h,O);let g=Math.hypot(f[0]-d[0],f[1]-d[1],f[2]-d[2]);_.set(b,d[0],d[1],d[2],f[0],f[1],f[2],p,h,O*.7*ie(0,.08,g))}M.commit(),_.commit()}let S=oe(this.p);for(let b=0;b<s.n;b++)s.fields[s.field[b]].color[s.local[b]*4+3]*=this.carried[b]?0:S;for(let b of s.fields)b.commit()}dispose(){this.group.removeFromParent();for(let e of[this.dots,this.trails])e?.geometry.dispose(),e?.material.dispose()}};import*as Q from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";import*as Vi from"https://cdn.jsdelivr.net/npm/three@0.186.1/+esm";var yt=10,nt=[{who:"caller",a:.4,b:2.6},{who:"agent",a:3.15,b:5.55},{who:"caller",a:4.15,b:4.55,kind:"backchannel"},{who:"caller",a:5.4,b:7.6,kind:"interrupt"},{who:"agent",a:8.15,b:9.55}];function Gi(r,e,t,i,n){let a=t+i,s=Math.floor(r/a),o=(r-s*a)/t;return o>1||B(s*1.7+e)<n?0:(.6+.4*B(s*2.1+e))*Math.pow(Math.sin(Math.PI*o),1.2)}function De(r,e,t,i,n){for(let a of nt){if(a.who!==e)continue;let s=a.b;if(e==="agent"){let c=nt.find(l=>l.kind==="interrupt"&&l.a>a.a&&l.a<a.b);c&&(s=Math.min(s,c.a+.12))}if(r<a.a||r>s)continue;let o=Math.min(1,(r-a.a)/.06,(s-r)/.06);return a.kind==="backchannel"?.55*Math.sin(Math.PI*ve((r-a.a)/(s-a.a))):Gi(r-a.a,e==="caller"?3:7,t,i,n)*o}return 0}var wt=[{name:"Nova",trait:"Warm, natural",mid:"#00ccff",high:"#3d64ff"},{name:"Aria",trait:"Bright, upbeat",mid:"#8fb4ff",high:"#5b6cff"},{name:"Ember",trait:"Warm, bold",mid:"#f7962f",high:"#ff6000"},{name:"Iris",trait:"Clear, friendly",mid:"#a99bff",high:"#6d5cff"},{name:"Jun",trait:"Soft, steady",mid:"#7fd3ff",high:"#3d64ff"}];var qt=[0,0,0],ue=(r,e,t)=>{for(let i=0;i<3;i++)qt[i]=L(r[i],e[i],t);return qt},ne=r=>r.params,$t=(r,e,t,i)=>r*r+(e-i)*(e-i)+t*t<i*i*1.02;function Me(r){let{kit:e,particles:t,hueShift:i}=r;return{ink:e.srgb(t.muted),accent:e.srgb(He(t.active,i)),high:e.srgb(He(t.highlight,i))}}var ji=42,Xt=(r,e,t,i)=>Math.round(r*i/e/(P/t)),Yt=(r,e,t,i,n)=>r+((t-n*i)%e+e)%e,V="Particle look \xB7 this scene",Te={own_size:{value:!1,label:"own dot size",group:V},p_size:{value:1.5,min:.5,max:5,step:.05,label:"dot size",group:V},own_emphasis:{value:!1,label:"own lit / crest \xD7",group:V},p_emphasis:{value:1.6,min:1,max:3,step:.05,label:"lit / crest \xD7",group:V},own_density:{value:!1,label:"own density",group:V,rebuild:!0},p_density:{value:1,min:.2,max:3,step:.05,label:"density",group:V,rebuild:!0},own_scatter:{value:!1,label:"own scatter",group:V},p_scatter:{value:.025,min:0,max:.15,step:.001,label:"scatter",group:V},own_idle:{value:!1,label:"own idle movement",group:V},p_idle:{value:.012,min:0,max:.08,step:.001,label:"idle movement",group:V},own_idleSpeed:{value:!1,label:"own idle speed",group:V},p_idleSpeed:{value:3,min:0,max:12,step:1,label:"idle wiggles / loop",group:V},own_muted:{value:!1,label:"own muted colour",group:V},p_muted:{value:"#1A1C22",label:"muted colour",group:V},own_active:{value:!1,label:"own active colour",group:V},p_active:{value:"#3E6AEF",label:"active colour",group:V},own_highlight:{value:!1,label:"own highlight colour",group:V},p_highlight:{value:"#3E8CF7",label:"highlight colour",group:V}},rt=(r,e)=>Math.max(12,Math.round(P*e*ji*r.particles.density)),Re=r=>({s:.75+B(r*1.31)*.5,sr:B(r*2.17+3)-.5,sy:B(r*3.71+7),ph:B(r*5.03+11)*P});function Ae(r,e,t,i,n){let a=Math.max(0,Math.round(r.idleSpeed)),s=P*a*t/i;return n[0]=r.scatter*2*e.sr+r.idle*Math.sin(s+e.ph),n[1]=r.scatter*e.sy+r.idle*.7*(1+Math.sin(P*(a+1)*t/i+e.ph*2)),n}var Wi={outer:{value:3.6,min:2,max:5,step:.05,label:"field radius",rebuild:!0},cloud:{value:1.6,min:.2,max:3,step:.05,label:"cloud height",rebuild:!0},lanes:{value:.14,min:.05,max:.5,step:.01,label:"lane spacing",rebuild:!0},jitter:{value:.08,min:0,max:.4,step:.005,label:"noise jitter"},bob:{value:.14,min:0,max:.6,step:.005,label:"noise vertical"},waveStart:{value:1.6,min:0,max:6,step:.05,label:"clear at s"},waveTime:{value:2.8,min:.3,max:6,step:.05,label:"clear over s"},front:{value:.6,min:.05,max:2,step:.05,label:"front softness"},flow:{value:.35,min:0,max:2,step:.01,label:"lane speed"},trail:{value:.45,min:0,max:2,step:.01,label:"trail s"},dotOpacity:{value:.38,min:0,max:1,step:.01,label:"dust opacity"},streakOpacity:{value:.85,min:0,max:1,step:.01,label:"streak opacity"},tail:{value:0,min:0,max:1,step:.01,label:"tail opacity"},...Te},Ni={duration:9,orb:"listening",params:Wi,create(r){let{kit:e,group:t}=r,i=r.orbRadius,n=9,a=ne(r),s=Math.max(100,Math.round(2600*r.particles.density)),o=e.particles(s),c=e.streaks(s);t.add(o,c);let l=ht(3),w=d=>Math.max(1,Math.round(d*n/P))*P/n,u=Array.from({length:s},(d,h)=>{let x=Math.sqrt(L((i*1.25)**2,a.outer**2,l())),M=i*1.25+Math.round((x-i*1.25)/a.lanes)*a.lanes,_=.7+l()*1.4,S=[1.3,2.1,5.3,4.7,3.1,7].map(b=>w(_*b));return{r:x,rl:M,a:l()*P,y:.05+Math.pow(l(),1.7)*a.cloud,w:S,g:Re(h)}}),f=[0,0];return{update({t:d,age:h,presence:x,loopOut:M}){let _=Me(r),S=ne(r),b=r.particles,k=d<S.waveStart?0:i*1.1+Ge((d-S.waveStart)/S.waveTime)*(a.outer+S.front+.2-i*1.1),E=h-d>n/2,R=dt(d,E?0:-1/0,M?n:1/0,.5,.7)*x;for(let O=0;O<s;O++){let p=u[O],g=oe(ie(p.r-S.front*.3,p.r+S.front*.7,k)),v=p.w,y=p.g.ph*16,m=p.a+Math.sin(d*v[0]+y)*.1,A=p.r+Math.sin(d*v[1]+y*1.7)*S.jitter*2,F=Math.cos(m)*A+Math.sin(d*v[2]+y)*S.jitter,z=Math.sin(m)*A+Math.cos(d*v[3]+y)*S.jitter,C=p.y+Math.sin(d*v[4]+y*2.3)*S.bob;Ae(b,p.g,d,n,f);let q=p.rl+f[0],$=.02+f[1],X=S.flow/p.rl,Y=p.a-d*X,I=Y+X*S.trail,J=L(F,Math.cos(Y)*q,g),K=L(C,$,g),Z=L(z,Math.sin(Y)*q,g),pe=L(J,Math.cos(I)*q,g),ze=L(Z,Math.sin(I)*q,g),T=$t(J,K,Z,i)?0:1,ee=1-ie(i*1.2,a.outer,p.rl);o.set(O,J,K,Z,b.size*p.g.s,_.ink,(1-g)*S.dotOpacity*R*T*(.75+.25*Math.sin(d*v[5]+y))),c.set(O,pe,$,ze,J,K,Z,b.size*p.g.s,ue(_.accent,_.high,ee*.6),g*S.streakOpacity*R*T*(.55+.45*ee))}c.tail=S.tail,o.commit(),c.commit(),r.orb.listen=xe(d,3)*.8}}}};function qi(r,e,t,i,n){for(let a=0;a<e;a++){let s=a/(e-1)*P;r[a*3]=Math.cos(s)*t,r[a*3+1]=i+n(s),r[a*3+2]=Math.sin(s)*t}}var Ki={rotation:{value:0,min:-180,max:180,step:1,label:"rotation \xB0"},spin:{value:3,min:-30,max:30,step:.5,label:"spin \xB0/s"},radius:{value:1.95,min:1.2,max:3.5,step:.01,label:"radius \xD7orb"},height:{value:.26,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:64,min:8,max:200,step:1,label:"wave cycles"},wordLength:{value:.4,min:.1,max:1.2,step:.01,label:"word length s"},wordGap:{value:.2,min:0,max:1,step:.01,label:"word gap s"},pauses:{value:.15,min:0,max:.8,step:.01,label:"pause chance"},lineWidth:{value:1.4,min:.5,max:4,step:.05,label:"caller line width"},lineColor:{value:"#1A1C22",label:"caller colour"},lineOpacity:{value:.85,min:0,max:1,step:.01,label:"caller opacity"},dotOpacity:{value:1,min:0,max:1,step:.01,label:"agent opacity"},previous:{value:.35,min:0,max:1,step:.01,label:"previous pass"},guide:{value:!0,label:"guide ring"},guideOpacity:{value:.2,min:0,max:1,step:.01,label:"guide opacity"},playhead:{value:!0},playheadLength:{value:.3,min:.05,max:1,step:.01,label:"playhead length"},playheadWidth:{value:1.3,min:.5,max:6,step:.05,label:"playhead width"},playheadColor:{value:"#1A1C22",label:"playhead colour"},playheadOpacity:{value:.45,min:0,max:1,step:.01,label:"playhead opacity"},markers:{value:!0,label:"hand-off ticks"},markerLength:{value:.22,min:.05,max:1,step:.01,label:"tick length"},markerWidth:{value:1.1,min:.5,max:6,step:.05,label:"tick width"},markerColor:{value:"#1A1C22",label:"tick colour"},markerOpacity:{value:.4,min:0,max:1,step:.01,label:"tick opacity"},...Te},$i={duration:yt,orb:"listening",params:Ki,morph:!1,create(r){let{kit:e,group:t,look:i}=r,n=r.orbRadius,a=yt,s=(p,g,v=.015)=>new Q.Vector3(Math.cos(g)*p,v,Math.sin(g)*p),o=e.line(240,{width:1,color:i.ink,opacity:.2,dashed:!0,dash:.05,gap:.07}),c=new Float32Array(720);t.add(o);let l=Math.max(400,Math.round(1600*r.particles.density)),w=24,u=Array.from({length:w},()=>{let p=e.line(l,{width:1.4,vertexColors:!0});return t.add(p),p}),f=new Float32Array(l*3),d=e.particles(l);t.add(d);let h=Array.from({length:l},(p,g)=>Re(g)),x=new Float32Array(l),M=new Uint8Array(l),_=[],S="",b=(p,g,v)=>{let y=`${p}|${g}|${v}`;if(y===S)return;S=y;for(let A=0;A<l;A++){let F=A/l*a,z=De(F,"caller",p,g,v),C=De(F,"agent",p,g,v);x[A]=Math.max(z,C),M[A]=C>z?1:0}_=[];let m=-1;for(let A=0;A<=l;A++){let F=A<l&&!M[A];F&&m<0&&(m=A),!F&&m>=0&&(_.push([m,A]),m=-1)}},k=new Float32Array(l*3),E=[0,0],R=e.line(2,{width:1.3,color:i.ink,opacity:.5});t.add(R);let O=[{t:3,title:"End of turn"},{t:4.25,title:"Backchannel"},{t:5.45,title:"Interrupt \u2192 yield"},{t:8,title:"End of turn"}].map(p=>{let g=e.line(2,{width:1.1,color:i.ink,opacity:.4});return t.add(g),{...p,l:g}});return{update({t:p,age:g,presence:v}){let y=Me(r),m=ne(r),A=r.particles,F=Math.PI*.75+Q.MathUtils.degToRad(m.rotation+m.spin*g),z=T=>F+T/a*P,C=m.radius*n;b(m.wordLength,m.wordGap,m.pauses);let q=g<a,$=q?Math.min(l,Math.floor(p/a*l)+1):l,X=T=>1-(1-m.previous)*(((p-T)%a+a)%a)/a,Y=e.linear(m.lineColor),I=e.linear(i.bg),J=Math.round(m.cycles);for(let T=0;T<$;T++){let ee=z(T/l*a);k[T*3]=Math.cos(ee)*C,k[T*3+1]=.015+x[T]*m.height*Math.sin(J*(ee-F)),k[T*3+2]=Math.sin(ee)*C;let be=X(T/l*a);for(let re=0;re<3;re++)f[T*3+re]=L(I[re],Y[re],be)}_.forEach(([T,ee],be)=>{if(be>=w)return;let re=u[be],st=Math.min(ee+1,$);if(st-T<2){re.opacity=0;return}re.setPoints(k.subarray(T*3,st*3),f.subarray(T*3,st*3)),re.material.linewidth=m.lineWidth,re.opacity=m.lineOpacity*v});for(let T=_.length;T<w;T++)u[T].opacity=0;for(let T=0;T<l;T++){if(T>=$||!M[T]){d.color[T*4+3]=0;continue}let ee=h[T];Ae(A,ee,p,a,E);let be=z(T/l*a);d.set(T,Math.cos(be)*(C+E[0]),k[T*3+1]+E[1],Math.sin(be)*(C+E[0]),A.size*ee.s,ue(y.accent,y.high,.15),m.dotOpacity*v*X(T/l*a))}d.commit(),qi(c,240,C,.015,()=>0),o.setPoints(c),o.opacity=m.guide?m.guideOpacity*v:0;let K=z(p);R.setPoints([s(C-m.playheadLength,K),s(C+m.playheadLength,K)]),R.material.linewidth=m.playheadWidth,R.material.color.set(m.playheadColor),R.opacity=m.playhead?m.playheadOpacity*v:0,O.forEach(T=>{let ee=q&&p<=T.t?0:v*X(T.t)*(q?Ge((p-T.t)/.3):1);T.l.setPoints([s(C+.12,z(T.t)),s(C+.12+m.markerLength,z(T.t))]),T.l.material.linewidth=m.markerWidth,T.l.material.color.set(m.markerColor),T.l.opacity=m.markers?m.markerOpacity*ee:0});let Z=De(p,"caller",m.wordLength,m.wordGap,m.pauses),pe=De(p,"agent",m.wordLength,m.wordGap,m.pauses),ze=nt.some(T=>T.who==="agent"&&p>=T.a&&p<=Math.min(T.b,5.52));r.orb.state=pe>0||ze?"speaking":"listening",r.orb.listen=Z,r.orb.speak=pe}}}},Xi={rings:{value:5,min:1,max:9,step:1,rebuild:!0},inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.2,min:.05,max:.6,step:.01,label:"ring spacing",rebuild:!0},tilt:{value:24,min:0,max:60,step:1,label:"max tilt \xB0",rebuild:!0},speed:{value:1,min:0,max:4,step:1,label:"turns / loop"},comets:{value:1,min:0,max:4,step:1,label:"comets per ring"},cometSpeed:{value:3,min:1,max:8,step:1,label:"comet turns / loop"},comet:{value:.9,min:.1,max:3,step:.05,label:"comet length"},opacity:{value:.42,min:0,max:1,step:.01,label:"ring opacity"},cometOpacity:{value:1,min:0,max:1,step:.01,label:"comet opacity"},...Te},Yi={duration:9,orb:"thinking",params:Xi,create(r){let{kit:e,group:t}=r,i=r.orbRadius,n=9,a=ne(r),s=Math.round(a.rings),o=ht(17),c=0,l=Array.from({length:s},(d,h)=>{let x=Q.MathUtils.degToRad(a.tilt)*(.35+.65*B(h*3.7+1)),M=h/s*Math.PI+B(h*1.9)*.6,_=new Q.Quaternion().setFromEuler(new Q.Euler(x,M,0,"YXZ")),S=new Q.Vector3(1,0,0).applyQuaternion(_),b=new Q.Vector3(0,0,1).applyQuaternion(_),k=new Q.Vector3(0,1,0).applyQuaternion(_),E=i*a.inner+h*a.spacing,R=rt(r,E),O=Array.from({length:R},(p,g)=>({a:g/R*P+(o()-.5)*(P/R),g:Re(c+g)}));return c+=R,{ax:S,ay:b,n:k,r:E,dir:h%2?-1:1,phase:B(h*5.3)*P,dots:O}}),w=e.particles(c);t.add(w);let u=new Q.Vector3,f=[0,0];return{update({t:d,presence:h}){let x=Me(r),M=ne(r),_=r.particles,S=Math.round(M.comets),b=0;l.forEach((k,E)=>{let R=k.dir*(P*d*Math.round(M.speed)*(1+E%2))/n,O=k.phase+k.dir*(P*d*Math.round(M.cometSpeed))/n;for(let p of k.dots){let g=p.a+R;Ae(_,p.g,d,n,f);let v=k.r*L(.85,1,Ge(h))+f[0];u.set(0,i,0).addScaledVector(k.ax,Math.cos(g)*v).addScaledVector(k.ay,Math.sin(g)*v).addScaledVector(k.n,f[1]-_.scatter*.5);let y=0;for(let A=0;A<S;A++){let F=((O+A*P/Math.max(1,S)-g)*k.dir%P+P)%P;y=Math.max(y,Math.exp(-F/(M.comet*.35)))}let m=ie(0,.12,u.y)*($t(u.x,u.y,u.z,i)?0:1)*h;w.set(b++,u.x,u.y,u.z,_.size*L(1,_.emphasis,y)*p.g.s,ue(x.ink,ue(x.accent,x.high,y),Math.min(1,.35+y)),L(M.opacity,M.cometOpacity,y)*m)}}),w.commit()}}}},Qi={steps:{value:4,min:2,max:6,step:1,rebuild:!0},inner:{value:1.4,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.5,min:.15,max:1.2,step:.01,label:"ring spacing",rebuild:!0},start:{value:135,min:0,max:360,step:1,label:"start angle \xB0"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},opacity:{value:.32,min:0,max:1,step:.01,label:"ring opacity"},litOpacity:{value:.95,min:0,max:1,step:.01,label:"comet opacity"},doneOpacity:{value:.7,min:0,max:1,step:.01,label:"done opacity"},comet:{value:.5,min:.05,max:2,step:.01,label:"comet length"},flash:{value:.6,min:0,max:2,step:.01,label:"check flash"},...Te},Ji={duration:10,orb:"thinking",params:Qi,create(r){let{kit:e,group:t}=r,i=r.orbRadius,n=10,a=ne(r),s=Math.round(a.steps),o=Array.from({length:s},(h,x)=>i*a.inner+x*a.spacing),c=o.map(h=>rt(r,h)),l=[],w=o.map(()=>0);o.forEach((h,x)=>{w[x]=l.length;for(let M=0;M<c[x];M++)l.push({ring:x,j:M,a:M/c[x]*P,g:Re(l.length)})});let u=e.particles(l.length);t.add(u);let f=8.4/s,d=[0,0];return{update({t:h,age:x,presence:M,loopOut:_}){let S=Me(r),b=ne(r),k=r.particles,E=Q.MathUtils.degToRad(b.start),R=_?1-ie(9.2,9.9,h):1,O=o.map((y,m)=>{let A=.3+m*f,F=oe((h-A)/(f*.65)),z=h>A+f*.65?Math.exp(-(h-A-f*.65)/.25):0;return{run:F,flash:z,active:h>=A&&h<A+f*.65}}),p=o.map((y,m)=>(m%2?-1:1)*Xt(b.ringSpeed,y,c[m],n)),g=p.map((y,m)=>y*(P/c[m])*h/n),v=Math.round((x-h)/n);for(let y=0;y<l.length;y++){let{ring:m,j:A}=l[y],F=l[Yt(w[m],c[m],A,p[m],v)].g,z=O[m],C=l[y].a+g[m];Ae(k,F,h,n,d);let q=o[m]+d[0],$=((C-E)%P+P)%P/P,X=$<=z.run?1:0,Y=z.run-$,I=z.active&&Y>=0?Math.exp(-Y/(b.comet*.12)):0,J=Math.max(I,X*(z.run>=1?1:.55)),K=z.flash*b.flash*R,Z=k.size*L(1,k.emphasis,Math.max(I,X*.5)*R)*F.s*(1+K*.4),pe=Math.max(b.opacity,L(b.opacity,Math.max(X*(z.run>=1?b.doneOpacity:b.doneOpacity*.8),I*b.litOpacity),R))*(1+K*.4),ze=ue(S.ink,ue(S.accent,S.high,I*.5),Math.min(1,J/.02)*R);u.set(y,Math.cos(C)*q,.02+d[1]+K*.05,Math.sin(C)*q,Z,ze,Math.min(1,pe)*M)}u.commit()}}}},Zi={spacing:{value:.14,min:.05,max:.4,step:.005,label:"ring spacing",rebuild:!0},inner:{value:1.2,min:1,max:2,step:.01,label:"inner radius \xD7orb",rebuild:!0},outer:{value:3.7,min:2,max:5.5,step:.05,label:"outer radius",rebuild:!0},height:{value:.3,min:0,max:.8,step:.005,label:"wave height"},waves:{value:5,min:1,max:16,step:1,label:"waves / loop"},wavelength:{value:.55,min:.15,max:2,step:.01},hold:{value:.55,min:.05,max:.95,step:.01,label:"crest hold"},crestColor:{value:1,min:0,max:1,step:.01,label:"crest colour"},phrase:{value:1.5,min:.3,max:4,step:.05,label:"phrase s"},pause:{value:.5,min:0,max:2,step:.05,label:"pause s"},swell:{value:.35,min:0,max:1,step:.01,label:"phrase variation"},drift:{value:1,min:0,max:4,step:1,label:"drift turns / loop"},spokenFrom:{value:2.2,min:0,max:9,step:.1,label:"spoken from s"},spokenTo:{value:3.6,min:0,max:9,step:.1,label:"spoken by s"},decay:{value:.5,min:0,max:1,step:.01,label:"height decay"},opacity:{value:.3,min:0,max:1,step:.01,label:"rest opacity"},crestOpacity:{value:.95,min:0,max:1,step:.01,label:"crest opacity"},...Te},en={duration:10,orb:"speaking",params:Zi,create(r){let{kit:e,group:t}=r,i=r.orbRadius,n=10,a=ne(r),s=i*a.inner,o=[];for(let u=s,f=0;u<=a.outer;u+=a.spacing,f++){let d=rt(r,u),h=B(u*13.1)*P;for(let x=0;x<d;x++)o.push({r:u,a:h+x/d*P,ring:f,g:Re(o.length)})}let c=o.length,l=e.particles(c);t.add(l);let w=[0,0];return{update({t:u,presence:f}){let d=Me(r),h=ne(r),x=r.particles,M=g=>ie(h.spokenFrom,Math.max(h.spokenFrom+.01,h.spokenTo),g)*(1-ie(8.4,9.8,g)),_=Math.round(h.waves),S=_*h.wavelength/n,b=a.outer-s,k=h.phrase+h.pause,E=g=>{let v=Math.floor(g/k),y=(g-v*k)/h.phrase;return y>1?0:Math.pow(Math.sin(Math.PI*y),.9)*(1-h.swell+h.swell*B(v*4.7+1))},R=P*Math.round(h.drift)*u/n;for(let g=0;g<c;g++){let{r:v,ring:y,g:m}=o[g],A=v-s;Ae(x,m,u,n,w);let F=v+w[0],z=o[g].a+(y%2?-R:R)*(.4+.6*(s/v)),C=A/h.wavelength-_*u/n,q=((u-A/S)%n+n)%n,$=M(q),X=.5+.5*Math.sin(P*C),Y=ie(1-h.hold,1-h.hold*.35,X),I=L(.75*Y,Y*E(q),$)*(1-h.decay*(A/b)),J=ie(0,.25,A)*(1-ie(b*.7,b,A)),K=ue(d.accent,d.high,Math.min(1,Y*.35+$*.3)),Z=ue(d.ink,K,Math.min(1,I*1.6)*h.crestColor);l.set(g,Math.cos(z)*F,.02+w[1]+h.height*I,Math.sin(z)*F,x.size*L(1,x.emphasis,I)*m.s,Z,L(h.opacity,h.crestOpacity,I)*J*f)}l.commit();let O=M(u),p=L(.5,xe(u,5),O);r.orb.speak=p}}}},tn={inner:{value:1.35,min:1.05,max:2.5,step:.01,label:"inner radius \xD7orb",rebuild:!0},spacing:{value:.4,min:.1,max:1,step:.01,label:"ring spacing",rebuild:!0},height:{value:.24,min:0,max:.8,step:.005,label:"wave height"},cycles:{value:1,min:.25,max:3,step:.05,label:"wave density"},drift:{value:1,min:-4,max:4,step:1,label:"drift / loop"},ringSpeed:{value:.35,min:0,max:2,step:.01,label:"ring speed"},fade:{value:.35,min:.05,max:.9,step:.01,label:"unmute s"},lead:{value:.8,min:0,max:3,step:.05,label:"all muted s"},tail:{value:.6,min:0,max:3,step:.05,label:"muted at end s"},opacity:{value:.32,min:0,max:1,step:.01,label:"muted opacity"},activeOpacity:{value:1,min:0,max:1,step:.01,label:"voice opacity"},tint:{value:!0,label:"tint orb per voice"},...Te},Kt=[{cycles:18,peak:1},{cycles:28,peak:1.8},{cycles:12,peak:.8},{cycles:34,peak:2.4},{cycles:22,peak:1.3}],nn={duration:10,orb:"speaking",params:tn,create(r){let{kit:e,group:t}=r,i=r.orbRadius,n=10,a=ne(r),s=wt.length,o=Array.from({length:s},(d,h)=>i*a.inner+h*a.spacing),c=o.map(d=>rt(r,d)),l=[],w=o.map(()=>0);o.forEach((d,h)=>{w[h]=l.length;for(let x=0;x<c[h];x++)l.push({ring:h,j:x,a:x/c[h]*P,g:Re(l.length)})});let u=e.particles(l.length);t.add(u);let f=[0,0];return{update({t:d,age:h,presence:x}){let M=Me(r),_=ne(r),S=r.particles,b=Math.max(1,n-_.lead-_.tail),k=b/s,E=d-_.lead,R=E>=0&&E<b?Math.min(s-1,Math.floor(E/k)):-1,O=E-R*k,p=o.map((z,C)=>C===R?dt(O,0,k,_.fade,_.fade):0),g=o.map((z,C)=>.3+.7*xe(d,C*5)),v=P*d*_.drift/n,y=o.map((z,C)=>(C%2?-1:1)*Xt(_.ringSpeed,z,c[C],n)),m=y.map((z,C)=>z*(P/c[C])*d/n),A=Math.round((h-d)/n);for(let z=0;z<l.length;z++){let{ring:C,j:q,a:$}=l[z],X=l[Yt(w[C],c[C],q,y[C],A)].g;Ae(S,X,d,n,f);let Y=o[C]+f[0],I=p[C],J=Kt[C%Kt.length],K=.5+.5*Math.sin(Math.round(J.cycles*_.cycles)*$-v*(C%2?-1:1)),Z=I*Math.pow(K,J.peak)*g[C],pe=$+m[C];u.set(z,Math.cos(pe)*Y,.02+f[1]+_.height*Z,Math.sin(pe)*Y,S.size*L(1,S.emphasis,I*K)*X.s,ue(M.ink,ue(M.accent,M.high,Z),I),L(_.opacity,_.activeOpacity,I*(.45+.55*K))*x)}u.commit();let F=R<0?0:xe(d,R*5)*p[R];r.orb.speak=F,r.orb.tint=_.tint&&R>=0?wt[R]:null}}}},Ie={id:"particles",name:"Particles",tagline:"Rings of particles",description:"Crisp particles around the orb: rings of dust, waves and dots that carry each model's job \u2014 clearing noise, taking turns, orbiting thought, stepping the call forward, speaking.",preset:{background:"#F6F6F8",grid:{style:"lines",color:"#1A1C22",opacity:.06,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.3,contactShadow:.8,camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"}},scenes:{denoise:Ni,turns:$i,llm:Yi,flow:Ji,colloquial:en,voices:nn}};var Ue={line:Ie,particles:Ie};var Ce=[{id:"listen",title:"Listen",blurb:"Hear the caller clearly. Clean audio. Natural timing. A conversation that starts with understanding.",scenes:["denoise","turns"]},{id:"think",title:"Think",blurb:"Reason over the call in real time, and keep it moving toward the outcome that matters.",scenes:["llm","flow"]},{id:"speak",title:"Speak",blurb:"Answer in a voice that sounds like a person on the phone, not a page being read aloud.",scenes:["colloquial","voices"]}],St={denoise:{step:"listen",title:"Denoising"},turns:{step:"listen",title:"Turn-taking"},llm:{step:"think",title:"Retell LLM"},flow:{step:"think",title:"Conversation flow"},colloquial:{step:"speak",title:"Colloquial"},voices:{step:"speak",title:"Retell voices"}},ot=["denoise","turns","llm","flow","colloquial","voices"],Qt=["size","emphasis","density","scatter","idle","idleSpeed","muted","active","highlight"],Jt=r=>Object.fromEntries(Object.entries(r).map(([e,t])=>[e,t.value]));function Zt(){return""}var xt={direction:"line",scene:"denoise",playing:!0,speed:1,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#3E6AEF",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3.4,fadeOuter:8},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35,looks:At},particles:{size:1.5,emphasis:1.6,density:1,scatter:.025,idle:.012,idleSpeed:3,muted:"#1A1C22",active:"#3E6AEF",highlight:"#3E8CF7"},lines:{width:1.3,emphasis:1.25,muted:"#1A1C22",active:"#3E6AEF"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{}},ei=r=>!!r&&typeof r=="object"&&!Array.isArray(r);function ge(r,e){if(!e)return structuredClone(r);let t=structuredClone(r);for(let[i,n]of Object.entries(e))n!==void 0&&(t[i]=ei(n)&&ei(t[i])?ge(t[i],n):n);return t}function ti(r,e){return ge(ge(xt,r),{direction:e})}var ii=N.MathUtils.degToRad,at=class{constructor(e,t={}){this.scene=new N.Scene;this.camera=new N.OrthographicCamera(-1,1,1,-1,.1,200);this.floor=new We;this.resolution=new N.Vector2(1,1);this.pointScale={value:1};this.active=[];this.raf=0;this.last=0;this.w=1;this.h=1;this.dpr=1;this.viewH=5;this.onScreen=!0;this.listeners={scene:new Set,loop:new Set};this.frozen=!1;this.morph=null;this.morphFrom=null;this.lookKey="";this.loaded=!1;this.shown=!1;this.loop=e=>{this.raf=requestAnimationFrame(this.loop);let t=Math.max(0,Math.min((e-this.last)/1e3,.1));this.last=e,!(this.frozen||!this.onScreen||!this.loaded)&&(this.step(this.config.playing?t*this.config.speed:0),this.render(),this.shown||(this.shown=!0,this.renderer.domElement.style.opacity="1"),this.onFrame?.())};this.container=e,this.config=ge(xt,t),this.direction=Ue[this.config.direction],this.renderer=new N.WebGLRenderer({antialias:!0,alpha:!0,preserveDrawingBuffer:!0,powerPreference:"high-performance"}),this.renderer.outputColorSpace=N.SRGBColorSpace;let i=this.renderer.domElement;i.style.cssText="position:absolute;inset:0;width:100%;height:100%;display:block;opacity:0;transition:opacity 0.9s cubic-bezier(.2,.7,.2,1)",e.appendChild(i),this.orb=new Ve({...this.config.orb}),this.scene.add(this.floor.mesh,this.orb.group),this.ro=new ResizeObserver(()=>this.resize()),this.io=new IntersectionObserver(([s])=>this.onScreen=s.isIntersecting),this.io.observe(e),this.ro.observe(e),this.resize(),this.applyConfig({},!0),this.setScene(this.config.scene,{instant:!0});let n=new Promise(s=>setTimeout(s,5e3)),a=this.renderer.compileAsync(this.scene,this.camera).then(()=>{},()=>{});this.ready=Promise.race([a,n]).then(()=>{this.loaded=!0}),this.last=performance.now(),this.raf=requestAnimationFrame(this.loop)}on(e,t){return this.listeners[e].add(t),()=>this.listeners[e].delete(t)}emit(e,...t){this.listeners[e].forEach(i=>i(...t))}get look(){let e=this.config;return{bg:e.background,ink:e.ink,accent:e.accent,orbMid:e.orb.mid,orbHigh:e.orb.highlight,line:e.grid.color}}sceneParams(e){let t=this.direction.scenes[e].params;return{...t?Jt(t):{},...this.config.sceneParams?.[e]??{}}}applyConfig(e,t=!1){let i=this.config.direction,n=this.config.scene,a=this.sceneParams(n),s=this.config.particles?.density;this.config=ge(this.config,e);let o=this.config;this.renderer.setClearColor(o.background,1),this.orb.setParams(o.orb),this.floor.setLook({...o.grid,glowColor:o.orb.mid,glow:o.floorGlow,shadow:o.contactShadow,shadowColor:o.contactColor,accent:o.accent},o.orb.radius),this.layoutCamera(),o.direction!==i?(this.direction=Ue[o.direction],this.setScene(o.scene,{instant:!1,force:!0})):o.scene!==n&&this.setScene(o.scene),o.direction===i&&s!==void 0&&o.particles.density!==s&&this.setScene(o.scene,{instant:!0,force:!0});let c=this.direction.scenes[o.scene].params;if(c&&o.scene===n&&o.direction===i){let w=this.sceneParams(o.scene);Object.entries(c).some(([u,f])=>f.rebuild&&w[u]!==a[u])&&this.setScene(o.scene,{instant:!0,force:!0})}let l=JSON.stringify(this.look)+o.orb.radius;if(l!==this.lookKey){let w=this.lookKey!=="";this.lookKey=l,w&&!t&&o.direction===i&&this.setScene(o.scene,{instant:!0,force:!0})}}setScene(e,t={}){let i=this.active.find(E=>!E.leaving);if(i&&i.id===e&&!t.force&&i.def===this.direction.scenes[e])return;this.config.scene=e;let n=null,a=null;!t.instant&&this.config.transition.morph&&i&&i.def.morph!==!1&&this.direction.scenes[e].morph!==!1&&(this.morph?n=Nt([...Fe(i.group),...Fe(this.morph.group)],this.pxScale):(n=it(Fe(i.group)),a=i)),this.endMorph();for(let E of this.active)E.leaving||(E.leaving=!0,E.endAt=(Math.floor(E.age/E.def.duration)+1)*E.def.duration,Se.killTweensOf(E.scope),t.instant?this.disposeActive(E):Se.to(E.scope,{presence:0,duration:.55,ease:"power2.in",onComplete:()=>this.disposeActive(E)}));t.instant&&(this.active=this.active.filter(E=>!E.leaving));let s=this.direction.scenes[e],o=new N.Group;o.name=`scene:${this.direction.id}:${e}`,this.scene.add(o);let c={presence:t.instant?1:0},l={state:s.orb,listen:0,speak:0},w=this.floor,u=this,f=this.direction,d=this.sceneParams(e),x={group:o,floor:{ripple:E=>this.floor.ripple({...E,strength:E.strength*c.presence}),tile:E=>this.floor.tile({...E,strength:E.strength*c.presence}),glow:E=>this.floor.glowAdd+=E*c.presence,get cell(){return w.cell}},orb:l,orbRadius:this.config.orb.radius,look:this.look,kit:new Ze(this.look,this.resolution,this.pointScale),camera:this.camera,get params(){return u.direction===f&&(d=u.sceneParams(e)),d},get particles(){let E=u.config.particles,R=this.params,O=null;for(let p of Qt)R[`own_${p}`]!==!0||R[`p_${p}`]===void 0||(O??(O={...E}),O[p]=R[`p_${p}`]);return O??E},get lines(){return u.config.lines},get hueShift(){return u.orb.hueShift}},M=s.create(x),_=Fe(o),S=!!n&&n.n>0&&_.length>0,b=S?-this.config.transition.duration:0,k={id:e,def:s,inst:M,group:o,orb:l,scope:c,age:b,leaving:!1,morphOut:!1,drawn:!1};S&&(i.group.visible=!1,a&&(a.morphOut=!0,Se.killTweensOf(a.scope),Se.to(a.scope,{presence:0,duration:.55,ease:"power2.in"}),this.morphFrom=a),c.presence=1,this.morph=new tt(n,_,{...this.config.transition},this.resolution,this.pointScale),this.scene.add(this.morph.group)),this.active.push(k),!t.instant&&!S&&Se.to(c,{presence:1,duration:.9,delay:.25,ease:"power2.out"}),this.emit("scene",e)}endMorph(){this.morph?.dispose(),this.morph=null,this.morphFrom&&this.active.includes(this.morphFrom)&&this.disposeActive(this.morphFrom),this.morphFrom=null}restart(){this.setScene(this.config.scene,{instant:!0,force:!0})}disposeActive(e){e.inst.dispose?.(),this.scene.remove(e.group),e.group.traverse(t=>{let i=t;i.geometry?.dispose();let n=i.material;Array.isArray(n)?n.forEach(a=>a.dispose()):n?.dispose()}),this.active=this.active.filter(t=>t!==e)}get current(){return this.active.find(e=>!e.leaving)}get duration(){return this.current?.def.duration??8}get progress(){let e=this.current;return e?Math.max(0,e.age%e.def.duration)/e.def.duration:0}step(e){this.floor.beginFrame();let t,i=0,n=0,a=(u,f)=>{let d=u.def.duration,h=u.age%d;u.age+=f,!u.leaving&&u.age%d<h&&(this.emit("loop",u.id),u.leaving&&(u.endAt=u.age-u.age%d));let x=u.leaving&&u.endAt!==void 0&&u.age>=u.endAt?d+u.age-u.endAt:u.age%d;u.inst.update({t:x,age:u.age,dt:f,presence:u.morphOut?1:u.scope.presence,loopOut:!u.morphOut&&!this.advances}),u.drawn=!0;let M=u.scope.presence;(!t||M>t.scope.presence)&&(t=u),i+=u.orb.listen*M,n+=u.orb.speak*M};for(let u of[...this.active])this.active.includes(u)&&a(u,e);for(let u of[...this.active])u.drawn||a(u,0);this.morph&&(this.morph.update(e,this.pxScale,this.config.orb.radius),this.morph.done&&this.endMorph());let s=this.orb.drive;s.state=t?t.orb.state:"idle";let o=t?.orb.tint;this.orb.params.mid=o?o.mid:this.config.orb.mid,this.orb.params.highlight=o?o.high:this.config.orb.highlight;let c=this.orb.highlightNow,l=ae(this.config.orb.highlight),w=mt(c.x,c.y,c.z)-mt(l.x,l.y,l.z);this.orb.hueShift=w-Math.round(w),this.floor.shadowColor=He(this.config.contactColor,this.orb.hueShift),this.floor.glowColor=this.orb.midNow,s.listen=Math.min(1,i),s.speak=Math.min(1,n),this.orb.update(e),this.floor.endFrame(this.orb.energy)}get advances(){return this.config.autoplay&&!this.frozen&&!this.onFrame}get pxScale(){return this.pointScale.value/this.renderer.getPixelRatio()}render(){this.renderer.render(this.scene,this.camera)}resize(){let e=Math.max(1,this.container.clientWidth),t=Math.max(1,this.container.clientHeight);this.w=e,this.h=t,this.dpr=Math.min(window.devicePixelRatio||1,2),this.renderer.setPixelRatio(this.dpr),this.renderer.setSize(e,t,!1),this.layoutCamera(),!this.frozen&&this.raf&&this.render()}layoutCamera(){let e=this.config.camera,t=ii(e.azimuth),i=ii(e.elevation),n=new N.Vector3(0,e.height,0),a=new N.Vector3(Math.sin(t)*Math.cos(i),Math.sin(i),Math.cos(t)*Math.cos(i));this.camera.position.copy(n).addScaledVector(a,40),this.camera.up.set(0,1,0),this.camera.lookAt(n),this.floor.setView(t,i),this.viewH=5.2/Math.max(.05,e.zoom);let s=this.w/this.h,o=this.viewH*s/2,c=this.viewH/2;this.camera.left=-o-e.panX,this.camera.right=o-e.panX,this.camera.top=c-e.panY,this.camera.bottom=-c-e.panY,this.camera.near=.1,this.camera.far=200,this.camera.updateProjectionMatrix(),this.resolution.set(this.w,this.h),this.syncPixelScale(this.dpr)}syncPixelScale(e){this.pointScale.value=e*(5.2/this.viewH)*(this.h/640)}async snapshot(e={}){let{scale:t=2,transparent:i=!1}=e;return this.withSize(t,i,async()=>(this.renderer.render(this.scene,this.camera),this.compose()))}async exportLayers(e=2){let t={};return await this.withSize(e,!0,async()=>{let i=[["floor","1-floor.png"],["objects","2-objects.png"],["orb","3-orb.png"]];for(let[n,a]of i)this.renderLayer(n),t[a]=new Uint8Array(await(await this.compose()).arrayBuffer());this.renderer.render(this.scene,this.camera),t["0-composite.png"]=new Uint8Array(await(await this.compose()).arrayBuffer())}),this.renderer.setClearColor(this.config.background,1),t["config.json"]=ct(JSON.stringify(this.config,null,2)),new Blob([lt(t)],{type:"application/zip"})}sceneSVG(){let e=this.floor.frameEffects;return Zt({camera:this.camera,w:this.w,h:this.h,dpr:this.dpr,config:this.config,groups:[...this.active.filter(t=>t.group.visible).map(t=>t.group),...this.morph?[this.morph.group]:[]],ripples:e.ripples,tiles:e.tiles})}async exportSequence(e={}){let{fps:t=30,scale:i=1,transparent:n=!1,onProgress:a}=e;this.restart();let s=e.seconds??this.duration,o=Math.round(s*t),c={};this.frozen=!0;try{this.orb.settle(),await this.withSize(i,n,async()=>{for(let l=0;l<o;l++){l>0?this.step(1/t):this.step(0),this.renderer.render(this.scene,this.camera);let w=await this.compose();c[`frame-${String(l).padStart(4,"0")}.png`]=new Uint8Array(await w.arrayBuffer()),a?.((l+1)/o)}})}finally{this.frozen=!1,this.last=performance.now()}return c["config.json"]=ct(JSON.stringify(this.config,null,2)),new Blob([lt(c,{level:0})],{type:"application/zip"})}async record(e={}){let{loops:t=1,fps:i=60,scale:n=Math.min(2,this.dpr),onProgress:a}=e,o=["video/mp4;codecs=avc1.640028","video/mp4","video/webm;codecs=vp9","video/webm"].find(S=>MediaRecorder.isTypeSupported(S))??"video/webm",c=document.createElement("canvas");c.width=Math.round(this.w*n),c.height=Math.round(this.h*n);let l=c.getContext("2d"),w=this.dpr;this.dpr=n,this.renderer.setPixelRatio(n),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(n),this.restart(),this.orb.settle();let u=c.captureStream(i),f=new MediaRecorder(u,{mimeType:o,videoBitsPerSecond:16e6}),d=[];f.ondataavailable=S=>S.data.size&&d.push(S.data);let h=this.duration*t/Math.max(.05,this.config.speed),x=this.config.playing;this.config.playing=!0;let M=performance.now(),_=new Promise(S=>f.onstop=()=>S());return this.onFrame=()=>{l.fillStyle=this.config.background,l.fillRect(0,0,c.width,c.height),l.drawImage(this.renderer.domElement,0,0);let S=(performance.now()-M)/1e3/h;a?.(Math.min(1,S)),S>=1&&f.state==="recording"&&f.stop()},f.start(250),await _,this.onFrame=void 0,this.config.playing=x,this.dpr=w,this.resize(),new Blob(d,{type:o.split(";")[0]})}async withSize(e,t,i){let n=this.frozen;this.frozen=!0,this.renderer.setPixelRatio(e),this.renderer.setSize(this.w,this.h,!1),this.syncPixelScale(e),this.renderer.setClearColor(this.config.background,t?0:1);try{return await i()}finally{this.renderer.setClearColor(this.config.background,1),this.frozen=n,this.resize(),this.last=performance.now()}}async compose(){return rn(this.renderer.domElement)}renderLayer(e){let t=[],i=n=>n===this.floor.mesh||n===this.orb.reflection?e==="floor":n===this.orb.mesh||n===this.orb.backdrop?e==="orb":e==="objects";this.scene.traverse(n=>{let a=n.material;if(!a)return;let s=i(n);for(let o of Array.isArray(a)?a:[a])t.push([o,o.colorWrite]),s||(o.colorWrite=!1)}),this.renderer.render(this.scene,this.camera);for(let[n,a]of t)n.colorWrite=a}dispose(){cancelAnimationFrame(this.raf),this.ro.disconnect(),this.io.disconnect(),this.endMorph();for(let e of[...this.active])this.disposeActive(e);this.orb.dispose(),this.floor.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}};function rn(r){return new Promise((e,t)=>r.toBlob(i=>i?e(i):t(new Error("toBlob failed")),"image/png"))}var ni={direction:"line",scene:"denoise",playing:!0,speed:.8,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#007cff",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:0,fadeOuter:8},floorGlow:0,contactShadow:0,camera:{azimuth:46,elevation:10,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:.73,mid:"#00ccff",highlight:"#3d64ff",speed:.83,reflection:.35},particles:{size:2,emphasis:1,density:2,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},sceneParams:{denoise:{rings:2,passes:1,outer:3.1,inner:1.14,height:3,noiseFreq:51,noiseFreq2:90,noiseMix:.62,cleanFreq:43,cleanHeight:.21,cleanFrom:.08,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.39,cleanOpacity:.95,fadeIn:.19,fadeOut:.15,count:800,cloud:1.6,lanes:.05,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:.59,dotSize:1.6,dotOpacity:.38,streakWidth:1.5,streakOpacity:.85,tail:0,own_size:!0,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.35,own_scatter:!0,p_scatter:.016,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.85,height:.155,cycles:64,width:1.5,wordLength:1.2,wordGap:.64,pauses:.15,guide:!0,guideOpacity:.26,playhead:!0,playheadLength:.27,markers:!0,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1,lineOpacity:.15,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:-94,spin:3,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:.041,own_idle:!0,p_idle:.07,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},llm:{rings:3,dots:470,inner:1.49,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:1.35,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.3,own_scatter:!1,p_scatter:.025,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.18,spacing:.99,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.22,litOpacity:.1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.093,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},voices:{inner:1.13,spacing:.57,dotSpacing:.03,height:.8,cycles:.65,drift:-4,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.28,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!0,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!0,p_density:2,own_scatter:!0,p_scatter:.039,own_idle:!0,p_idle:.047,own_idleSpeed:!0,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},colloquial:{spacing:.06,inner:1.14,outer:3.45,height:3,waves:8,wavelength:2,crest:6,variation:.75,spokenFrom:5.6,spokenTo:3.1,decay:.55,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.65,drift:0,hold:.95,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var ri={direction:"particles",scene:"denoise",playing:!0,speed:.9,autoplay:!0,background:"#F6F6F8",ink:"#1A1C22",accent:"#183387",grid:{style:"lines",color:"#1A1C22",opacity:.1,cell:1,width:1,major:0,fadeInner:3,fadeOuter:7.5},floorGlow:.07,contactShadow:.14,contactColor:"#3d64ff",camera:{azimuth:45,elevation:12,zoom:1,height:1.25,panX:0,panY:0},orb:{radius:1,mid:"#00ccff",highlight:"#3d64ff",speed:1,reflection:.35},particles:{size:1.6,emphasis:1,density:1.65,scatter:.1,idle:.02,idleSpeed:3,muted:"#5e5e67",active:"#007cff",highlight:"#007cff"},lines:{width:.6,emphasis:1.1,muted:"#1A1C22",active:"#7b5cff"},transition:{morph:!0,duration:1.4,trail:.03,swirl:.25},sceneParams:{denoise:{rings:3,passes:1,outer:3.1,inner:1,height:3,noiseFreq:51,noiseFreq2:81,noiseMix:.62,cleanFreq:18,cleanHeight:.21,cleanFrom:.04,cleanTo:.71,drift:2,noisyWidth:1,cleanWidth:1,noisyOpacity:.4,cleanOpacity:.95,fadeIn:.2,fadeOut:.15,count:1900,cloud:1.6,lanes:.31,jitter:.08,bob:.14,waveStart:1.6,waveTime:2.8,front:.6,flow:.35,trail:0,dotSize:2.45,dotOpacity:.95,streakWidth:1.25,streakOpacity:1,tail:0,own_size:!1,p_size:1.3,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1.35,own_scatter:!0,p_scatter:.02,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},turns:{radius:2.65,height:.425,cycles:72,width:1.5,wordLength:.51,wordGap:.15,pauses:.15,guide:!1,guideOpacity:.18,playhead:!1,playheadLength:.06,markers:!1,interval:.45,travel:2.2,inner:1.15,outer:3.2,threshold:.12,callerHeight:2.02,callerFreq:36,callerWidth:1.3,callerOpacity:.75,agentDots:220,agentHeight:.8,agentFreq:12,agentSize:1.8,agentOpacity:.95,fadeIn:.12,fadeOut:.3,lineWidth:1.5,lineOpacity:1,dotStep:1,dotSize:1.85,dotOpacity:1,shimmer:.005,rotation:64,spin:14.5,own_size:!1,p_size:1.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:3,own_scatter:!0,p_scatter:0,own_idle:!0,p_idle:.021,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",playheadWidth:1.5,playheadColor:"#007cff",playheadOpacity:1,markerLength:.05,markerWidth:1.35,markerColor:"#1A1C22",markerOpacity:.25,lineColor:"#b2b5c0",previous:.35},llm:{rings:4,dots:470,inner:1.76,spacing:.6,tilt:16,thickness:.06,speed:1,comets:2,cometSpeed:3,comet:2.7,dotSize:1.5,cometSize:2.05,opacity:.53,cometOpacity:1,distance:2.6,plate:1,corner:.2,plateOpacity:.55,stems:!0,stemHeight:.32,guideOpacity:.3,dash:.5,gap:.01,flowSpeed:0,highlight:1,own_size:!1,p_size:.5,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:1.5,own_scatter:!1,p_scatter:.05,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"},flow:{steps:4,inner:1.05,spacing:.68,dotSpacing:.075,start:110,dotSize:1.3,litSize:4.35,opacity:.5,litOpacity:1,doneOpacity:1,comet:.66,flash:0,hopWidth:1.55,drift:1,distance:3,plate:1,corner:.1,plateOpacity:.55,stems:!0,stemHeight:.66,guideOpacity:.3,dash:.08,gap:.12,flowSpeed:1,highlight:1,own_size:!1,p_size:1.6,own_emphasis:!1,p_emphasis:1.6,own_density:!1,p_density:1,own_scatter:!0,p_scatter:.075,own_idle:!0,p_idle:.02,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35},voices:{inner:1.13,spacing:.64,dotSpacing:.03,height:.8,cycles:1.05,drift:2,fade:.35,dotSize:1.75,activeSize:2.45,opacity:.5,activeOpacity:1,tint:!0,rings:3,first:2.13,wobble:3,rest:.3,voice:.4,lift:.4,falloff:.12,firstAccent:!0,firstOpacity:.95,opacityStep:.08,phrasing:.45,ownDensity:!0,density:1,own_size:!1,p_size:2.25,own_emphasis:!1,p_emphasis:1,own_density:!1,p_density:1.65,own_scatter:!0,p_scatter:.05,own_idle:!0,p_idle:.03,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7",ringSpeed:.35,lead:.8},colloquial:{spacing:.06,inner:1.54,outer:4.1,height:.8,waves:8,wavelength:1.44,crest:6,variation:.75,spokenFrom:6.2,spokenTo:3.1,decay:1,dotSize:1.3,crestSize:4.55,opacity:.45,crestOpacity:1,phrase:2.95,pause:.5,swell:.57,drift:2,hold:.41,crestColor:1,ownDensity:!0,density:.45,rings:3,passes:2,writtenFreq:31,writtenHeight:.6,spokenFreq:62,phrases:3,phraseShape:1.15,writtenOpacity:.5,spokenOpacity:.95,fadeIn:.12,fadeOut:.25,own_size:!1,p_size:2,own_emphasis:!1,p_emphasis:1.6,own_density:!0,p_density:.25,own_scatter:!0,p_scatter:.046,own_idle:!1,p_idle:.012,own_idleSpeed:!1,p_idleSpeed:3,own_muted:!1,p_muted:"#1A1C22",own_active:!1,p_active:"#3E6AEF",own_highlight:!1,p_highlight:"#3E8CF7"}}};var sn={line:ni,particles:ri};function oi(r){return ge(ti(Ue[r].preset,r),sn[r])}var Oe=oi("particles"),Et="(max-width: 767px)",ai="cubic-bezier(.2, .7, .2, 1)",we="https://cdn.prod.website-files.com/64ada0f2685b2d18caa5e699/",si={denoise:we+"6ae8a749b0e4540540117407_rh26-1-3557-imgframe1.svg",turns:we+"6aee36467f8a2aff35987e19_rh26-stage-turns.svg",llm:we+"6aee3647fa2b31b84c7d8f51_rh26-stage-llm.svg",flow:we+"6aee3648c05c00492a4ab53c_rh26-stage-flow.svg",colloquial:we+"6aee3648cbd92d9c99154f85_rh26-stage-colloquial.svg",voices:we+"6aee3649b9640aa82eafc06b_rh26-stage-voices.svg",listening:we+"6ae8a737d9c697e56fe36d78_rh26-1-2952-imgvector.svg"},li={denoise:{text:"Cancels background noise on the line.",width:132},turns:{text:"Knows when to speak and when to stop.",width:152},llm:{text:`Text model built
for live calls`,width:132},flow:{text:"Checks outcomes, moves the call forward",width:152},voices:{text:"Retell\u2019s own text to speech models",width:132},colloquial:{text:"Makes replies sound spoken, not written",width:152}},ln=876;var cn=172,un=209,pn=105,dn=265,ci=16,hn=97,mn=41,ui=r=>r?{...Oe.camera,zoom:Oe.camera.zoom*1.04,panY:.75}:Oe.camera,fn=r=>{let e=r.match(/\d+(\.\d+)?/g);return e&&e.length>=3?"#"+e.slice(0,3).map(t=>Math.round(+t).toString(16).padStart(2,"0")).join(""):Oe.background};function gn(r){if(r.hasAttribute("data-rh26-stage"))return;let e=r.querySelector(".rh26-agent-visual"),t=Array.from(r.querySelectorAll("[data-rh26-tab]"));if(!e||t.length!==Ce.length)return console.warn("[Retell] Conversational Dynamics: stage markup not found");r.setAttribute("data-rh26-stage","");let i=t.map(p=>document.getElementById(p.getAttribute("aria-controls")||"")),n=Array.from(r.querySelectorAll("[data-rh26-scene]")),a=matchMedia("(prefers-reduced-motion: reduce)").matches,s=matchMedia(Et).matches,o=document.createElement("div");o.className="rh26-stage-canvas";let c=document.createElement("div");c.className="rh26-stage-cards",c.setAttribute("aria-hidden","true");let l=document.createElement("div");l.className="rh26-stage-frame";let w=document.createElement("div");w.className="rh26-stage-float",l.appendChild(w),c.appendChild(l),e.append(o,c);let u=null;try{u=new at(o,{...Oe,background:fn(getComputedStyle(e).backgroundColor),camera:ui(s)}),u.orb.setStyle(1,!0)}catch(p){console.warn("[Retell] Conversational Dynamics: WebGL unavailable, keeping the static artwork",p)}let f=u?u.config.scene:Oe.scene,d=new Map,h=null,x=p=>{let g=s?c.clientHeight-ci:void 0;if(p==="listening")return[{id:p,top:g===void 0?dn:g-mn}];if(g!==void 0)return[{id:p,top:g-hn}];let v=Ce.find(m=>m.scenes.includes(p)),y=v.scenes.slice(0,v.scenes.indexOf(p)+1);return y.map((m,A)=>({id:m,top:un-pn*(y.length-1-A)}))},M=p=>{let g=document.createElement("div");if(g.className="rh26-stage-slot",p==="listening")g.innerHTML='<div class="rh26-stage-card rh26-stage-pill"><img src="'+si.listening+'" alt="" width="16" height="16"><p>Listening to the caller...</p></div>';else{g.innerHTML='<div class="rh26-stage-card"><img src="'+si[p]+'" alt="" width="20" height="20"><p class="rh26-stage-card-title"></p><p class="rh26-stage-card-text"></p></div>',g.querySelector(".rh26-stage-card-title").textContent=St[p].title;let v=g.querySelector(".rh26-stage-card-text");v.textContent=li[p].text,v.style.width=li[p].width+"px"}return g};function _(p){if(p===h)return;h=p;let g=x(p);d.forEach((v,y)=>{g.some(m=>m.id===y)||(d.delete(y),v.firstElementChild.classList.add("is-out"),setTimeout(()=>v.remove(),600))}),g.forEach(({id:v,top:y})=>{let m=d.get(v);m||(m=M(v),d.set(v,m),w.appendChild(m)),m.style.left=(s?ci:cn)+"px",m.style.transform="translateY("+y+"px)"})}function S(){s=matchMedia(Et).matches,c.classList.toggle("is-mobile",s),l.style.transform=s?"":"scale("+e.clientWidth/ln+")";let p=h;h=null,p&&_(p)}let b=-1;function k(p,g,v){if(p){if(p.getAnimations().forEach(y=>y.cancel()),v||a){p.hidden=!g;return}if(g){p.hidden=!1;let y=p.offsetHeight;p.animate([{height:"0px",paddingTop:"0px",opacity:0},{height:y+"px",paddingTop:getComputedStyle(p).paddingTop,opacity:1}],{duration:500,easing:ai})}else{let y=p.offsetHeight;p.animate([{height:y+"px",paddingTop:getComputedStyle(p).paddingTop,opacity:1},{height:"0px",paddingTop:"0px",opacity:0}],{duration:400,easing:ai}).onfinish=()=>{p.hidden=!0}}}}function E(p,g=!1){f=p;let v=Ce.findIndex(y=>y.id===St[p].step);t.forEach((y,m)=>{y.setAttribute("aria-selected",String(m===v)),y.tabIndex=m===v?0:-1}),v!==b&&(i.forEach((y,m)=>{(m===v||m===b||g)&&k(y,m===v,g)}),b=v),n.forEach(y=>{y.getAttribute("data-rh26-scene")===p?y.setAttribute("aria-current","step"):y.removeAttribute("aria-current");let A=y.querySelector(".rh26-scene-bar");A&&(A.style.transform="scaleY(0)")}),_(p==="denoise"&&u?"listening":p)}let R=p=>{if(!u)return E(p);p!==u.config.scene&&u.applyConfig({scene:p})};if(t.forEach((p,g)=>{p.addEventListener("click",v=>{v.preventDefault(),R(Ce[g].scenes[0])}),p.addEventListener("keydown",v=>{if(!["ArrowDown","ArrowUp","ArrowRight","ArrowLeft","Home","End"].includes(v.key))return;v.preventDefault();let m=v.key==="Home"?0:v.key==="End"?t.length-1:(g+(v.key==="ArrowDown"||v.key==="ArrowRight"?1:-1)+t.length)%t.length;R(Ce[m].scenes[0]),t[m].focus()})}),n.forEach(p=>p.addEventListener("click",()=>R(p.getAttribute("data-rh26-scene")))),E(f,!0),S(),new ResizeObserver(S).observe(e),matchMedia(Et).addEventListener("change",()=>{S(),u?.applyConfig({camera:ui(s)})}),!u)return;let O=u;O.on("scene",p=>E(p)),O.on("loop",p=>O.config.autoplay&&O.applyConfig({scene:ot[(ot.indexOf(p)+1)%ot.length]})),O.ready.then(()=>e.classList.add("is-live")),(function p(){if(requestAnimationFrame(p),!e.classList.contains("is-live"))return;let g=r.querySelector('[data-rh26-scene="'+f+'"] .rh26-scene-bar');if(g&&(g.style.transform="scaleY("+O.progress.toFixed(4)+")"),f==="denoise"){let v=O.progress*O.duration;_(v<Number(O.sceneParams("denoise").waveStart)+.6?"listening":"denoise")}})()}function pi(){document.querySelectorAll('[data-rh26-component="Conversational Dynamics"]').forEach(gn)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",pi):pi();
