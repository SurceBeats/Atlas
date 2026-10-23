import{S as oe}from"./atlas_DSJ7C9RPCcnrgjWfRLuaL.js";import{c as J}from"./atlas_qHpRbMMkCrnJ67xzvK1rX.js";import{cn as H,V as A,P as ne,ch as j,o as X,co as Q,cp as re,m as Y,cq as ee,C as U,g as ce,cr as le,c6 as Z,D as te,cs as he,B as me,a as de,ct as ue,ad as ie,i as se,cu as ae,cv as pe,F as fe,M as ge,cw as ye}from"./atlas_BUnHktt_WsVovWPX8BirI.js";const be=`
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 10.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

// Fractal sums. uOctaves (float) is the detail the view can resolve: whole octaves plus
// a fade on the last one, so detail grows smoothly while zooming in
uniform float uOctaves;

float fbm(vec3 p) {
  float sum = 0.0, amp = 0.5, norm = 0.0;
  for (int i = 0; i < 9; i++) {
    float w = clamp(uOctaves - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    sum += snoise(p) * amp * w;
    norm += amp * w;
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum / max(norm, 1e-4);
}

float fbmN(vec3 p, float octaves) {
  float sum = 0.0, amp = 0.5, norm = 0.0;
  for (int i = 0; i < 9; i++) {
    float w = clamp(octaves - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    sum += snoise(p) * amp * w;
    norm += amp * w;
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum / max(norm, 1e-4);
}

// Sharp crests: mountain ranges, ice ridges
float ridged(vec3 p, float octaves) {
  float sum = 0.0, amp = 0.5, norm = 0.0, prev = 1.0;
  for (int i = 0; i < 8; i++) {
    float w = clamp(octaves - float(i), 0.0, 1.0);
    if (w <= 0.0) break;
    float n = 1.0 - abs(snoise(p));
    n *= n;
    sum += n * amp * prev * w;
    norm += amp * w;
    prev = n;
    p = p * 2.1 + vec3(3.3, 1.1, 7.7);
    amp *= 0.5;
  }
  return sum / max(norm, 1e-4);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.xxy + p.yxx) * p.zyx);
}

// Cellular noise: x = distance to the nearest feature point, y = to the second one,
// z = a random id of the nearest cell
vec3 cellular(vec3 p) {
  vec3 cell = floor(p);
  vec3 f = fract(p);
  float d1 = 8.0, d2 = 8.0, id = 0.0;
  for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
      for (int z = -1; z <= 1; z++) {
        vec3 o = vec3(float(x), float(y), float(z));
        vec3 h = hash33(cell + o);
        vec3 r = o + h - f;
        float d = dot(r, r);
        if (d < d1) { d2 = d1; d1 = d; id = h.x; }
        else if (d < d2) { d2 = d; }
      }
  return vec3(sqrt(d1), sqrt(d2), id);
}
`,Se=`
uniform vec3 uLightDir;   // towards the star, world space
uniform vec3 uSunColor;
uniform float uSunIntensity;

// Diffuse light with the terminator taken from the round planet (geometric normal), so
// bumps never light up the night side
float daylight(vec3 n, vec3 ng) {
  float geo = dot(ng, uLightDir);
  return max(dot(n, uLightDir), 0.0) * smoothstep(-0.06, 0.18, geo);
}

// Sun specular (GGX) with Schlick fresnel
vec3 specularGGX(vec3 n, vec3 v, float roughness, vec3 f0) {
  vec3 h = normalize(uLightDir + v);
  float nh = max(dot(n, h), 0.0);
  float nl = max(dot(n, uLightDir), 0.0);
  float nv = max(dot(n, v), 1e-3);
  float a = roughness * roughness;
  float a2 = a * a;
  float d = a2 / (3.14159 * pow(nh * nh * (a2 - 1.0) + 1.0, 2.0));
  float k = (roughness + 1.0) * (roughness + 1.0) / 8.0;
  float g = nl / (nl * (1.0 - k) + k) * nv / (nv * (1.0 - k) + k);
  vec3 f = f0 + (1.0 - f0) * pow(1.0 - max(dot(h, v), 0.0), 5.0);
  return d * g * f / max(4.0 * nl * nv, 1e-3) * nl;
}
`,Me=`
${be}
uniform vec4 uDetail;
uniform vec3 uDetailSeed;
varying vec3 vMoonSphere;
varying float vMoonScale;
// The mesh's own normal (view space), before the bump: keeps the round moon's terminator
vec3 moonGeometryNormal;

// Bump mapping from screen derivatives of the height (Mikkelsen), as the planets do
vec3 moonBump(vec3 pos, vec3 n, float h) {
  vec3 dpx = dFdx(pos), dpy = dFdy(pos);
  float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - grad);
}

// How well a pixel spanning footprint radians draws a feature of frequency cycles per
// radian: fully from eight pixels a cycle, nothing below four
float moonResolve(float frequency, float footprint) {
  return clamp(log2(0.25 / (frequency * footprint)) + 1.0, 0.0, 1.0);
}

// A crater in about half the cells, of random size: bowl, then a raised rim. Every
// neighbouring cell's crater is added (the deepest bowl wins), so no rim is cut off where
// the nearest cell changes: a cut would be an edge for the bump
float moonCraters(vec3 p, float scale) {
  vec3 cell = floor(p * scale);
  vec3 f = fract(p * scale);
  float bowl = 0.0, rim = 0.0;
  for (int x = -1; x <= 1; x++)
    for (int y = -1; y <= 1; y++)
      for (int z = -1; z <= 1; z++) {
        vec3 o = vec3(float(x), float(y), float(z));
        vec3 h = hash33(cell + o);
        if (fract(h.x * 3.71) < 0.4) continue;
        float size = 0.18 + 0.32 * fract(h.x * 7.13);
        float t = length(o + h - f) / size;
        if (t < 1.0) bowl = min(bowl, t * t - 1.0);
        float e = (t - 1.0) / 0.2;
        rim += exp(-e * e) * 0.3;
      }
  return bowl + rim;
}

// p: the direction on the moon's sphere; footprint: radians of it one pixel spans.
// Returns the albedo factor (fresh rims brighter, floors darker); height is the bump in
// units of uDetail.z, fractures the icy lines (0..1, stained darker and redder)
float moonDetail(vec3 p, float footprint, out float height, out float fractures) {
  vec3 q = p + uDetailSeed;
  float craters = moonCraters(q, 6.0) * 0.55 * moonResolve(12.0, footprint)
                + moonCraters(q + 3.7, 14.0) * 0.3 * moonResolve(28.0, footprint)
                + moonCraters(q + 9.1, 32.0) * 0.17 * moonResolve(64.0, footprint);
  craters *= uDetail.x;
  float octaves = clamp(log2(0.25 / (24.0 * footprint)) + 1.0, 0.0, 5.0);
  float grit = octaves > 0.0 ? fbmN(q * 24.0, octaves) * clamp(octaves, 0.0, 1.0) * uDetail.w : 0.0;
  fractures = 0.0;
  if (uDetail.y > 0.0) {
    // Lineae, as on Europa: long winding cracks along the zero lines of noise, at two
    // scales, each only where a broad mask lets it through; thin, but never under a pixel
    vec3 warp = vec3(snoise(q * 1.3 + 11.0), snoise(q * 1.3 + 23.0), snoise(q * 1.3 + 37.0)) * 0.25;
    float frequency = 2.5, width = 0.035, weight = 1.0;
    for (int i = 0; i < 2; i++) {
      float n = snoise((q + warp) * frequency + float(i) * 17.0);
      float line = 1.0 - smoothstep(0.0, max(width, fwidth(n) * 1.5), abs(n));
      float mask = smoothstep(-0.1, 0.35, snoise(q * 1.7 + float(i) * 5.3));
      fractures = max(fractures, line * mask * weight * moonResolve(frequency * 4.0, footprint));
      frequency *= 2.2;
      width *= 0.85;
      weight *= 0.75;
    }
    fractures *= uDetail.y;
  }
  height = craters + grit * 0.35 - fractures * 0.4;
  return 1.0 + craters * 0.3 + grit * 0.12;
}
`;class K{scene;planetRadius;moonMeshes=[];orbitalLines=[];smallMoonIndicators=[];moonData=null;cosmicOriginTime;lastRelaxationCheck=0;static LOW_SEGMENTS=64;static HIGH_SEGMENTS=192;setMoonDetail(e,t){const i=this.moonData?.moons.find(b=>b.name===e),n=this.scene.getObjectByName(`moon-surface-${e}`);if(!i||!n||!(n.geometry instanceof H))return;const r=t?K.HIGH_SEGMENTS:K.LOW_SEGMENTS,s=n.geometry;if(s.parameters.widthSegments===r)return;const a=new H(s.parameters.radius,r,Math.floor(r*.75),s.parameters.phiStart);this.generateProceduralSurface(a,i,s.parameters.radius),n.geometry=a,s.dispose()}moonMaterials=new Map;camera;planetPosition;timeOffset=0;orbitalLinesFadeEnabled=!0;orbitalLinesVisible=!0;orbitalLinesTargetOpacity=1;orbitalLinesCurrentOpacity=1;lastCameraPosition=new A;lastCameraTarget=new A;lastInteractionTime=0;fadeOutTimer=null;initialShowTimer=null;cameraMovementThreshold=.01;fadeOutDelay=3e3;initialShowDuration=5e3;fadeSpeed=.05;constructor(e,t,i,n,r){if(this.scene=e,this.planetRadius=t,this.camera=i,this.planetPosition=n,this.cosmicOriginTime=r,this.lastCameraPosition.copy(this.camera.position),this.camera instanceof ne){const s=new A;this.camera.getWorldDirection(s),this.lastCameraTarget.copy(s)}this.startInitialShowTimer(),this.initializeMaterials()}initializeMaterials(){this.moonMaterials.set("rocky",new j({color:9143936,roughness:.9,metalness:.1,normalScale:new X(.8,.8)})),this.moonMaterials.set("icy",new j({color:14737648,roughness:.3,metalness:.05,normalScale:new X(.4,.4)})),this.moonMaterials.set("asteroidal",new j({color:4865578,roughness:.95,metalness:.15,normalScale:new X(1.2,1.2)})),this.moonMaterials.set("captured",new j({color:7035722,roughness:.8,metalness:.08,normalScale:new X(.9,.9)}))}loadMoonSystem(e){this.moonData=e,e.cosmic_origin_time&&(this.cosmicOriginTime=e.cosmic_origin_time),this.clearMoons(),this.createMoons()}clearMoons(){this.orbitalLines.forEach(e=>{this.scene.remove(e),e.traverse(t=>{t instanceof Q&&(t.geometry.dispose(),t.material instanceof re&&t.material.dispose())})}),this.orbitalLines=[],this.moonMeshes.forEach(e=>{this.scene.remove(e),e.traverse(t=>{t instanceof Y&&(t.geometry.dispose(),Array.isArray(t.material)?t.material.forEach(i=>i.dispose()):t.material.dispose())})}),this.moonMeshes=[]}createMoons(){this.moonData&&this.moonData.moons.forEach((e,t)=>{const i=this.createMoonMesh(e,t);this.moonMeshes.push(i),this.scene.add(i)})}createMoonMesh(e,t){const i=new ee;i.name=`moon-${e.name}`;const n=e.visuals.relative_size,r=this.planetRadius*n,s=K.LOW_SEGMENTS,a=Math.floor(s*.75),l=(e.procedural?.seed||0)*.618034%(Math.PI*2),g=new H(r,s,a,l);this.generateProceduralSurface(g,e,r);let o;switch(e.properties.type){case"icy":o=new j({color:16777215,roughness:.2,metalness:.05,transparent:!1});break;case"asteroidal":o=new j({color:16777215,roughness:.95,metalness:.15,transparent:!1});break;case"captured":o=new j({color:16777215,roughness:.8,metalness:.08,transparent:!1});break;default:o=new j({color:16777215,roughness:.8,metalness:.1,transparent:!1});break}switch(this.applyMoonTexture(o,e),e.properties.type){case"icy":const h=e.procedural?.seed||0,M=this.createSeededRandom(h+9999)();let c=1;M>.8?c=1.4:M>.6?c=1.2:M<.2?c=.6:M<.4&&(c=.8),o.emissive=new U(4877194).multiplyScalar(.05*c),o.emissiveIntensity=.6*c,o.envMapIntensity=1*c,o.roughness=Math.max(.05,.15/c),o.metalness=.02,o.transparent=!0,o.opacity=Math.min(1,.95+(c-1)*.1);break;case"asteroidal":o.emissive=new U(2759178).multiplyScalar(.03),o.emissiveIntensity=.3,o.envMapIntensity=.1,o.roughness=.98,o.metalness=.18;break;case"captured":o.emissive=new U(5917242).multiplyScalar(.04),o.emissiveIntensity=.4,o.envMapIntensity=.3,o.roughness=.75,o.metalness=.12;break;default:o.emissive=new U(9136404).multiplyScalar(.04),o.emissiveIntensity=.4,o.envMapIntensity=.4,o.roughness=.85,o.metalness=.08;break}o.transparent=!1,o.side=ce,o.aoMapIntensity=.8,o.normalScale=new X(1,1),this.applyMoonDetail(o,e,r);const d=new Y(g,o);d.name=`moon-surface-${e.name}`,d.castShadow=!0,d.receiveShadow=!0,d.userData={moonData:e,moonIndex:t,isMoon:!0},i.add(d),this.createOrbitalTrail(e,t);const p=Math.max(r*2,this.planetRadius*.04),u=new le(p,32),m=new Z({side:te,depthTest:!1,depthWrite:!1,colorWrite:!1}),f=new Y(u,m);f.name=`moon-indicator-hitarea-${e.name}`,f.renderOrder=998,f.userData={isMoonIndicator:!0,moonData:e},i.add(f);const w=new he(p*.85,p,48),E=new Z({color:65348,transparent:!0,opacity:0,side:te,depthTest:!1}),v=new Y(w,E);if(v.name=`moon-indicator-${e.name}`,v.renderOrder=999,v.userData={isMoonIndicator:!0,moonData:e},i.add(v),this.smallMoonIndicators.push(v),this.smallMoonIndicators.push(f),e.visuals.has_atmosphere&&e.visuals.atmosphere_color){const h=new H(r*1.05,16,8),M=new Z({color:e.visuals.atmosphere_color,transparent:!0,opacity:e.visuals.atmosphere_opacity||.1,side:me}),c=new Y(h,M);c.name=`moon-atmosphere-${e.name}`,i.add(c)}return this.updateMoonPosition(i,e,0,t),i}applyMoonDetail(e,t,i){const n=t.properties.type,r=t.procedural??{},s=n==="icy"?.45:n==="asteroidal"?1.15:1,a=this.createSeededRandom((r.seed||0)%1e9+31337),b=new A(a()*100,a()*100,a()*100),l=(.35+(r.crater_density??.5))*s,g=n==="icy"?1:0,o=n==="icy"?.5:n==="asteroidal"?1.2:1,d=.012,p={uDetail:{value:new de(l,g,i*d,o)},uDetailSeed:{value:b}},u=oe.lights_physical_pars_fragment.replace("vec3 irradiance = dotNL * directLight.color;","vec3 irradiance = dotNL * saturate( dot( moonGeometryNormal, directLight.direction ) * 10.0 + 0.5 ) * directLight.color;");e.onBeforeCompile=m=>{Object.assign(m.uniforms,p),m.vertexShader=m.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vMoonSphere;
varying float vMoonScale;`).replace("#include <begin_vertex>",`#include <begin_vertex>
vMoonSphere = position;
vMoonScale = length(modelMatrix[0].xyz);`),m.fragmentShader=m.fragmentShader.replace("#include <common>",`#include <common>
${Me}`).replace("#include <lights_physical_pars_fragment>",u).replace("#include <map_fragment>",`#include <map_fragment>
          vec3 moonSphere = normalize(vMoonSphere);
          float moonHeight, moonFractures;
          diffuseColor.rgb *= moonDetail(moonSphere, max(length(fwidth(moonSphere)), 1e-6), moonHeight, moonFractures);
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(0.72, 0.58, 0.5), moonFractures * 0.6);`).replace("#include <normal_fragment_maps>",`#include <normal_fragment_maps>
          moonGeometryNormal = normal;
          normal = moonBump(-vViewPosition, normal, moonHeight * uDetail.z * vMoonScale);
          nonPerturbedNormal = normal;`)},e.needsUpdate=!0}generateProceduralSurface(e,t,i){const n=t.procedural?.seed||0,r=J(this.createSeededRandom(n)),s=e.attributes.position.array,a=this.calculateHydrostaticRelaxation(t),b=this.reliefModel(t,r),l=i,g=l*(1-a),o=new Float32Array(s.length),d=new Float32Array(s.length/3),p=new A;for(let u=0;u<s.length;u+=3){p.set(s[u],s[u+1],s[u+2]).normalize();const m=b(p);o[u]=p.x,o[u+1]=p.y,o[u+2]=p.z,d[u/3]=m;const f=i+m*g;s[u]=p.x*f,s[u+1]=p.y*f,s[u+2]=p.z*f}e.userData.relaxation={directions:o,relief:d,radius:i,amplitude:l,factor:a},e.attributes.position.needsUpdate=!0,e.computeVertexNormals()}reliefModel(e,t){const i=e.properties.type,n=e.procedural??{},r=e.surface??{},s=this.createSeededRandom((n.seed||0)%1e9+4242),a=n.surface_variation??.15,l=(i==="asteroidal"?.14:i==="captured"?.09:i==="icy"?.025:.035)*(.7+a*2),g=i==="asteroidal"?.18:i==="captured"?.1:0,o=new A(s()-.5,s()-.5,s()-.5).normalize(),d=(h,M)=>{const c=h*Math.PI/180,P=M*Math.PI/180;return new A(Math.cos(c)*Math.cos(P),Math.sin(c),Math.cos(c)*Math.sin(P))},p=.06,u=[],m=(h,M,c)=>{M=Math.max(p,M),u.push({centre:h,radius:M,depth:c,reach:Math.cos(Math.min(Math.PI,M*2.4))})};for(const h of r.craters??[])m(d(h.position.lat,h.position.lon),h.radius*Math.PI,h.depth*.55);const f=n.crater_density??.5,w=Math.round(f*(i==="icy"?22:45));for(let h=0;h<w;h++){const M=p*(1+Math.pow(s(),3)*3.5);m(new A(s()*2-1,s()*2-1,s()*2-1).normalize(),M,.25+s()*.25)}const E=[];if(i==="icy")for(const h of r.cracks??[]){const M=d(h.start.lat,h.start.lon),c=d(h.end.lat,h.end.lon),P=new A().crossVectors(M,c);P.lengthSq()<1e-6||E.push({a:M,b:c,normal:P.normalize(),width:.018+h.width*2.5,height:.006+h.brightness*.012})}const v=new A;return h=>{let M=(t(h.x*1.1,h.y*1.1,h.z*1.1)*.7+t(h.x*2.3+7,h.y*2.3,h.z*2.3)*.3)*l;if(g){const c=h.dot(o);M+=g*(c*c-.33)}for(const c of u){const P=h.dot(c.centre);if(P<c.reach)continue;const _=Math.acos(Math.min(1,P))/c.radius,x=c.depth*c.radius;if(_<1){const k=_*_-1;M+=x*Math.max(k,c.radius>.15?-.75:-1)}M+=x*.32*Math.exp(-Math.pow((_-1)/.16,2)),_>1&&(M+=x*.08*Math.exp(-(_-1)*3))}for(const c of E){const P=Math.abs(h.dot(c.normal));if(P>c.width*3||v.crossVectors(c.a,h).dot(c.normal)<0||v.crossVectors(h,c.b).dot(c.normal)<0)continue;const _=P/c.width;M+=c.height*(Math.exp(-Math.pow(_-.7,2)*6)+Math.exp(-Math.pow(_+.7,2)*6)-.8*Math.exp(-_*_*10))}return M+=t(h.x*7+3,h.y*7,h.z*7)*.004*(.5+a*3),M}}applyMoonTexture(e,t){this.createProceduralColorTexture(e,t)}createProceduralColorTexture(e,t){const n=document.createElement("canvas");n.width=256,n.height=256;const r=n.getContext("2d"),s=t.visuals.base_color;let a;if(s&&s.startsWith("#")){const x=s.slice(1);a={r:parseInt(x.slice(0,2),16),g:parseInt(x.slice(2,4),16),b:parseInt(x.slice(4,6),16)}}else switch(t.properties.type){case"icy":a={r:160,g:170,b:190};break;case"asteroidal":a={r:74,g:62,b:42};break;case"captured":a={r:107,g:91,b:74};break;default:a={r:139,g:134,b:128};break}const b=t.procedural?.seed||Math.abs(t.name.split("").reduce((x,k)=>x+k.charCodeAt(0),0)),l=Math.abs(b)%1e6,g=l===0?12345:l,o=J(this.createSeededRandom(g+777));let d=0,p=0,u=0;const m=g%100*.1,f=g/100%100*.1,w=g/1e4%100*.1;switch(t.properties.type){case"icy":d=o(m+1,f+2,w+3)*120,p=o(m+4,f+5,w+6)*100,u=o(m+7,f+8,w+9)*110;const x=o(m*.5,f*.5,w*.5),k=o(m*.3,f*.7,w*.4),I=o(m*.8,f*.2,w*.6);let N=1;I>.4?N=1.4:I>.1?N=1.2:I<-.4?N=.6:I<-.1&&(N=.8),x>.3?(d-=40,p+=50,u+=60):x<-.3?(d+=60,p-=20,u+=20):k>.4?(d+=40,p+=35,u-=30,N*=.9):k<-.4&&(d-=30,p-=20,u+=50),d*=N,p*=N,u*=N;break;case"asteroidal":d=o(m+10,f+11,w+12)*60,p=o(m+13,f+14,w+15)*55,u=o(m+16,f+17,w+18)*50;break;case"captured":d=o(m+19,f+20,w+21)*50,p=o(m+22,f+23,w+24)*45,u=o(m+25,f+26,w+27)*40;break;default:d=o(m+28,f+29,w+30)*55,p=o(m+31,f+32,w+33)*50,u=o(m+34,f+35,w+36)*45;break}({...a},a={r:Math.max(20,Math.min(255,a.r+d)),g:Math.max(20,Math.min(255,a.g+p)),b:Math.max(30,Math.min(255,a.b+u))}),r.fillStyle=`rgb(${a.r}, ${a.g}, ${a.b})`,r.fillRect(0,0,256,256);const E=(g*7919+41)%233280,v=J(this.createSeededRandom(E)),h=r.getImageData(0,0,256,256),M=h.data;for(let x=0;x<256;x++)for(let k=0;k<256;k++){const I=(x*256+k)*4,N=k/256,V=x/256,$=(N-.5)*2*Math.PI,D=(V-.5)*Math.PI,O=Math.cos(D)*Math.cos($),F=Math.cos(D)*Math.sin($),T=Math.sin(D),B=(E*17+8901)%1e3,y=.5+B/1e3*1,R=.8+B/1e3*.4;let S=0;switch(t.properties.type){case"icy":S+=v(O*(2*y),F*(2*y),T*(2*y))*(.5*R),S+=v(O*(6*y),F*(6*y),T*(6*y))*(.3*R),S+=v(O*(15*y),F*(15*y),T*(15*y))*(.2*R);const G=v(O*30,F*30,T*30)*.1;S+=G*R;break;case"asteroidal":S+=v(O*(1.2*y),F*(1.2*y),T*(1.2*y))*(.75*R),S+=v(O*(4*y),F*(4*y),T*(4*y))*(.55*R),S+=v(O*(10*y),F*(10*y),T*(10*y))*(.35*R),S+=v(O*(25*y),F*(25*y),T*(25*y))*(.22*R);break;case"captured":S+=v(O*(1.8*y),F*(1.8*y),T*(1.8*y))*(.6*R),S+=v(O*(5*y),F*(5*y),T*(5*y))*(.38*R),S+=v(O*(12*y),F*(12*y),T*(12*y))*(.2*R);break;default:S+=v(O*(2*y),F*(2*y),T*(2*y))*(.55*R),S+=v(O*(6*y),F*(6*y),T*(6*y))*(.33*R),S+=v(O*(16*y),F*(16*y),T*(16*y))*(.18*R);break}let C,L,z;if(t.properties.type==="icy"){if(C=a.r,L=a.g,z=a.b,S>0){const q=S*.5;C=C*(1-q*.15),L=L*(1+q*.2),z=z*(1+q*.25)}else{const q=Math.abs(S)*.5;C=C*(1+q*.1),L=L*(1-q*.15),z=z*(1+q*.05)}const G=1+S*.3;C=C*G,L=L*G,z=z*G;const W=v(O*8,F*8,T*8);W>.5?(C=Math.min(255,C*1.05),L=Math.min(255,L*1.08),z=Math.min(255,z*1.1)):W<-.5&&(C=C*.95,L=L*.97,z=z*1.02),C=Math.max(0,Math.min(255,C)),L=Math.max(0,Math.min(255,L)),z=Math.max(0,Math.min(255,z))}else{const G=1+S;C=Math.max(0,Math.min(255,a.r*G)),L=Math.max(0,Math.min(255,a.g*G)),z=Math.max(0,Math.min(255,a.b*G))}M[I]=C,M[I+1]=L,M[I+2]=z,M[I+3]=255}r.putImageData(h,0,0);const c=new ue(n);c.wrapS=ie,c.wrapT=ie,c.generateMipmaps=!0,c.needsUpdate=!0;const _=(t.procedural?.seed||0)*.618034%1;c.offset.x=_,c.repeat.set(1,1),e.map=c,e.needsUpdate=!0}drawCrater(e,t,i){const n=(i.position.lon+180)/360*t,r=(90-i.position.lat)/180*t,s=Math.max(20,i.radius*t*.8),a=e.createRadialGradient(n,r,0,n,r,s);a.addColorStop(0,"rgba(0, 0, 0, 0.95)"),a.addColorStop(.2,"rgba(10, 10, 10, 0.8)"),a.addColorStop(.5,"rgba(40, 40, 40, 0.6)"),a.addColorStop(.8,"rgba(100, 100, 100, 0.4)"),a.addColorStop(.95,"rgba(180, 180, 180, 0.3)"),a.addColorStop(1,"rgba(0, 0, 0, 0)"),e.fillStyle=a,e.beginPath(),e.arc(n,r,s,0,2*Math.PI),e.fill(),e.strokeStyle="rgba(255, 255, 255, 0.7)",e.lineWidth=3,e.beginPath(),e.arc(n,r,s*.9,0,2*Math.PI),e.stroke(),e.strokeStyle="rgba(220, 220, 220, 0.5)",e.lineWidth=1,e.beginPath(),e.arc(n,r,s*.95,0,2*Math.PI),e.stroke()}createSeededRandom(e){let t=e*9301+49297;return()=>(t=(t*9301+49297)%233280,t/233280)}calculateHydrostaticRelaxation(e){const t=e.properties.radius_km*1e3,i=e.properties.mass_kg,n=e.properties.density_kg_m3;if(!isFinite(t)||!isFinite(i)||!isFinite(n)||t<=0||i<=0||n<=0)return 0;const s=66743e-15*i/(t*t);if(!isFinite(s)||s<=0)return 0;let a;switch(e.properties.type){case"icy":const p=e.tidal_heating?.tidal_power_watts||0,u=4*Math.PI*t*t,m=p/u;m>1e3?a=1e12:m>100?a=1e15:m>10?a=1e18:m>1?a=1e20:a=1e21;break;case"asteroidal":a=1e26;break;case"captured":a=1e24;break;default:t>5e5?a=1e22:t>1e5?a=1e23:a=1e25;break}let b;e.properties.type==="icy"?(e.tidal_heating?.tidal_power_watts||0)>1e12?b=1e9:b=35e8:b=3e10;const l=a/b;if(!isFinite(l)||l<=0)return 0;const g=Date.now()/1e3-this.cosmicOriginTime+this.timeOffset;if(!isFinite(g)||g<0)return 0;const o=g/l,d=1-Math.exp(-o);return Math.max(0,Math.min(1,d))}updateMoonSurfaceRelaxation(e,t){const i=e.getObjectByName(`moon-surface-${t.name}`),n=i?.geometry.userData.relaxation;if(!i||!n)return;const r=this.calculateHydrostaticRelaxation(t);if(Math.abs(r-n.factor)<.001)return;n.factor=r;const s=i.geometry,a=s.attributes.position.array,b=n.amplitude*(1-r);for(let l=0,g=0;l<a.length;l+=3,g++){const o=n.radius+n.relief[g]*b;a[l]=n.directions[l]*o,a[l+1]=n.directions[l+1]*o,a[l+2]=n.directions[l+2]*o}s.attributes.position.needsUpdate=!0,s.computeVertexNormals(),s.computeBoundingSphere()}drawMaria(e,t,i,n=0){const r=(i.position.lon+180)/360*t,s=(90-i.position.lat)/180*t,a=Math.max(15,i.radius*t*.4),b=e.createRadialGradient(r,s,0,r,s,a);b.addColorStop(0,`rgba(10, 10, 10, ${i.darkness*.9})`),b.addColorStop(.6,`rgba(25, 25, 25, ${i.darkness*.7})`),b.addColorStop(1,`rgba(40, 40, 40, ${i.darkness*.3})`),e.fillStyle=b,e.beginPath(),e.arc(r,s,a,0,2*Math.PI),e.fill();const l=this.createSeededRandom(n+Math.floor(r+s));e.fillStyle=`rgba(60, 50, 40, ${i.darkness*.2})`;for(let g=0;g<5;g++){const o=r+(l()-.5)*a*.8,d=s+(l()-.5)*a*.8;e.beginPath(),e.arc(o,d,2+l()*3,0,2*Math.PI),e.fill()}}calculateOrbitalParameters(e){const t=Math.max(...this.moonData.moons.map(c=>c.orbit.semi_major_axis_km)),i=e.orbit.semi_major_axis_km/t,n=Math.log10(1+i*9),s=e.properties.origin==="co-formation"&&e.properties.density_kg_m3<1500?2.5:1.8,b=this.planetRadius*s*1.2,l=this.planetRadius*4,g=b+n*l,o=this.planetRadius*10,d=Math.min(g,o),p=e.orbit.eccentricity,m=Math.min(3,1/.5),f=Math.min(.8,p*m),E=Math.min(e.orbit.inclination_deg*3,60),v=ye.degToRad(E),h=e.orbit.argument_of_periapsis||0,M=e.orbit.longitude_of_ascending_node||0;return{semiMajorAxis:d,eccentricity:f,inclination:v,argumentOfPeriapsis:h,longitudeOfAscendingNode:M}}createOrbitalTrail(e,t){const i=this.calculateOrbitalParameters(e),n=i.semiMajorAxis,r=i.eccentricity,s=i.inclination,a=i.argumentOfPeriapsis,b=i.longitudeOfAscendingNode,l=[],g=128;for(let f=0;f<=g;f++){const w=f/g*Math.PI*2,E=n*(1-r*r)/(1+r*Math.cos(w)),v=E*Math.cos(w+a),h=E*Math.sin(w+a),M=0,c=Math.cos(s),P=Math.sin(s),_=Math.cos(b),x=Math.sin(b),k=v,I=h*c-M*P,N=h*P+M*c,V=k*_-I*x,$=k*x+I*_,D=N;l.push(new A(V,D,-$))}const o=new se().setFromPoints(l);let d;switch(e.properties.type){case"icy":d=6724095;break;case"asteroidal":d=9127187;break;case"captured":d=16737894;break;default:d=16755302;break}const p=new ee;p.name=`moon-orbit-${e.name}`;const u=[];for(let f=0;f+1<l.length;f+=3)u.push(l[f],l[f+1]);if(u.length>=2){const f=new ae({color:d,opacity:0,transparent:!0,linewidth:1}),w=new pe(new se().setFromPoints(u),f);w.name=`moon-orbit-segment-${e.name}`,p.add(w)}o.dispose();const m=p;m.visible=!1,m.position.copy(this.planetPosition),this.scene.add(m),this.orbitalLines||(this.orbitalLines=[]),this.orbitalLines.push(m)}drawIceCracks(e,t,i){const n=(i.start.lon+180)/360*t,r=(90-i.start.lat)/180*t,s=(i.end.lon+180)/360*t,a=(90-i.end.lat)/180*t,b=Math.max(8,i.width*t*500);e.shadowColor="rgba(150, 200, 255, 1.0)",e.shadowBlur=20,e.strokeStyle=`rgba(255, 255, 255, ${Math.min(1,i.brightness*3)})`,e.lineWidth=b,e.lineCap="round",e.beginPath(),e.moveTo(n,r),e.lineTo(s,a),e.stroke(),e.shadowColor="rgba(100, 150, 255, 0.8)",e.shadowBlur=30,e.strokeStyle=`rgba(200, 230, 255, ${Math.min(1,i.brightness*2.5)})`,e.lineWidth=b*.7,e.beginPath(),e.moveTo(n,r),e.lineTo(s,a),e.stroke(),e.shadowBlur=0,e.shadowColor="transparent",e.shadowBlur=0}setTimeOffset(e){this.timeOffset=e}getTimeOffset(){return this.timeOffset}update(){if(!this.moonData)return;this.detectCameraMovement()&&this.onCameraMovement(),this.updateOrbitalLinesFade();const e=Date.now()/1e3;if(!isFinite(this.cosmicOriginTime))return;const t=e-this.cosmicOriginTime+this.timeOffset;if(!isFinite(t)||t<0)return;const i=performance.now()-this.lastRelaxationCheck>500;i&&(this.lastRelaxationCheck=performance.now()),this.moonData.moons.forEach((n,r)=>{r<this.moonMeshes.length&&(this.updateMoonPosition(this.moonMeshes[r],n,t,r),i&&this.updateMoonSurfaceRelaxation(this.moonMeshes[r],n))}),this.updateLOD()}updateMoonPosition(e,t,i,n=0){if(!isFinite(i))return;const r=t.orbit.orbital_period_seconds;if(!isFinite(r)||r<=0)return;const s=2*Math.PI/r,a=t.orbit.initial_phase||0,b=(s*i+a)%(2*Math.PI);if(!isFinite(b))return;const l=this.calculateOrbitalParameters(t),g=l.semiMajorAxis,o=l.eccentricity,d=l.inclination,p=l.argumentOfPeriapsis,u=l.longitudeOfAscendingNode;let m=b;for(let W=0;W<5;W++){const q=b+o*Math.sin(m);if(!isFinite(q))break;m=q}if(!isFinite(m))return;const f=Math.sqrt(1+o),w=Math.sqrt(1-o),E=Math.sin(m/2),v=Math.cos(m/2);if(!isFinite(f)||!isFinite(w)||!isFinite(E)||!isFinite(v))return;const h=2*Math.atan2(f*E,w*v);if(!isFinite(h))return;const M=g*(1-o*o)/(1+o*Math.cos(h)),c=h+p,P=M*Math.cos(c),_=M*Math.sin(c),x=0;if(!isFinite(P)||!isFinite(_)||!isFinite(x))return;const k=Math.cos(d),I=Math.sin(d);if(!isFinite(k)||!isFinite(I)||!isFinite(u))return;let N=P,V=_*k-x*I,$=_*I+x*k;const D=Math.cos(u),O=Math.sin(u);if(!isFinite(D)||!isFinite(O))return;const F=N*D-V*O,T=N*O+V*D,B=$;if(!isFinite(F)||!isFinite(T)||!isFinite(B)||!isFinite(this.planetPosition.x)||!isFinite(this.planetPosition.y)||!isFinite(this.planetPosition.z))return;const y=F,R=B,S=-T,C=this.planetPosition.x+y,L=this.planetPosition.y+R,z=this.planetPosition.z+S;if(!isFinite(C)||!isFinite(L)||!isFinite(z))return;e.position.set(C,L,z);const G=e.getObjectByName(`moon-surface-${t.name}`);G&&this.applyTidalLockingWithLibration(G,t,h,i)}calculatePeriapsisWithPrecession(e,t){const i=e.orbit.argument_of_periapsis||0;if(!isFinite(t)||!isFinite(i))return i;const n=this.planetRadius,r=e.orbit.semi_major_axis_km;if(!isFinite(r)||r<=0||r/n>10)return i;const a=.001,b=2*Math.PI/e.orbit.orbital_period_seconds,l=e.orbit.inclination_deg*Math.PI/180;if(!isFinite(b)||!isFinite(l))return i;const g=3/2*a*b*Math.pow(n/r,2)*Math.cos(l);if(!isFinite(g))return i;const o=g*t,d=(i+o)%(2*Math.PI);return isFinite(d)?d:i}applyTidalLockingWithLibration(e,t,i,n){if(!isFinite(i))return;if(t.rotation?.is_tidally_locked??!0){e.lookAt(this.planetPosition);const s=t.orbit.eccentricity;if(isFinite(s)&&s>=0&&s<1){const a=2*s*Math.sin(i),l=t.orbit.inclination_deg*Math.PI/180*Math.sin(i)*.1;if(isFinite(a)&&isFinite(l)){const g=a+l;isFinite(g)&&e.rotateY(g)}}}else{const s=t.rotation?.angular_velocity_rad_s??2*Math.PI/t.orbit.orbital_period_seconds;if(isFinite(s)&&s>0){const a=Date.now()/1e3,b=this.moonData?.cosmic_origin_time||0,l=a-b,g=s*l;isFinite(g)&&(e.rotation.y=g%(2*Math.PI))}}}updateLOD(){if(!this.moonData)return;const e=this.camera.position,t=new fe,i=new ge;i.multiplyMatrices(this.camera.projectionMatrix,this.camera.matrixWorldInverse),t.setFromProjectionMatrix(i),this.moonMeshes.forEach((n,r)=>{const s=e.distanceTo(n.position),a=this.moonData.moons[r];if(!t.containsPoint(n.position)&&s>this.moonData.render_settings.lod_distances[1]){n.visible=!1;return}const l=this.moonData.render_settings.max_visible_distance*2;if(n.visible=s<l,!n.visible)return;const o=a.properties.radius_km/s;let d=2;s<this.moonData.render_settings.lod_distances[0]||o>.001?d=0:(s<this.moonData.render_settings.lod_distances[1]||o>1e-4)&&(d=1);const p=n.getObjectByName(`moon-surface-${a.name}`);p&&p.geometry instanceof H&&this.applyGeometryLOD(p,d,s);const u=this.moonData.render_settings.max_visible_distance;if(s>u*.5){const m=Math.max(.3,1-(s-u*.5)/(u*.5));n.scale.setScalar(m)}else n.scale.setScalar(1)})}applyGeometryLOD(e,t,i){e.geometry;const n=e.material;i>1e3&&(n.roughness=Math.min(1,n.roughness+.1),n.metalness=Math.max(0,n.metalness-.05))}getMoonAtPosition(e){const t=e.intersectObjects(this.scene.children,!0);for(const i of t)if(i.object.userData?.isMoon||i.object.userData?.isMoonIndicator)return i.object.userData.moonData;return null}getMoonPosition(e){const t=this.moonMeshes.find(i=>i.name===`moon-${e}`);return t?t.position.clone():null}dispose(){this.fadeOutTimer&&(clearTimeout(this.fadeOutTimer),this.fadeOutTimer=null),this.initialShowTimer&&(clearTimeout(this.initialShowTimer),this.initialShowTimer=null),this.clearMoons(),this.moonMaterials.forEach(e=>e.dispose()),this.moonMaterials.clear()}startInitialShowTimer(){this.orbitalLinesTargetOpacity=0,this.orbitalLinesCurrentOpacity=0,this.lastInteractionTime=Date.now(),this.initialShowTimer=null}detectCameraMovement(){const e=this.camera.position.clone(),t=new A;this.camera.getWorldDirection(t);const i=e.distanceTo(this.lastCameraPosition)>this.cameraMovementThreshold,n=t.distanceTo(this.lastCameraTarget)>this.cameraMovementThreshold;return i||n?(this.lastCameraPosition.copy(e),this.lastCameraTarget.copy(t),!0):!1}isCameraMoving(){return this.detectCameraMovement()}onCameraMovement(){this.lastInteractionTime=Date.now(),this.fadeOutTimer&&(clearTimeout(this.fadeOutTimer),this.fadeOutTimer=null),this.initialShowTimer&&(clearTimeout(this.initialShowTimer),this.initialShowTimer=null),this.fadeInOrbitalLines(),this.fadeOutTimer=window.setTimeout(()=>{this.fadeOutOrbitalLines(),this.fadeOutTimer=null},this.fadeOutDelay)}fadeInOrbitalLines(){this.orbitalLinesFadeEnabled&&(this.orbitalLinesTargetOpacity=.4)}fadeOutOrbitalLines(){this.orbitalLinesFadeEnabled&&(this.orbitalLinesTargetOpacity=0)}updateOrbitalLinesFade(){if(!this.orbitalLinesFadeEnabled)return;const e=this.orbitalLinesTargetOpacity-this.orbitalLinesCurrentOpacity;Math.abs(e)>.001&&(this.orbitalLinesCurrentOpacity+=e*this.fadeSpeed,this.orbitalLines.forEach(r=>{if(r.name&&r.name.startsWith("moon-orbit-")){const s=this.orbitalLinesCurrentOpacity>.05;r.visible=s,s&&r.traverse(a=>{a instanceof Q&&a.material instanceof ae&&a.name&&a.name.startsWith("moon-orbit-segment-")&&(a.material.opacity=this.orbitalLinesCurrentOpacity)})}}));const t=Date.now()/1e3,i=.5+Math.sin(t*4)*.4,n=this.orbitalLinesCurrentOpacity*i;this.smallMoonIndicators.forEach(r=>{if(r.material instanceof Z&&(r.visible=this.orbitalLinesCurrentOpacity>.05,r.material.opacity=n,r.parent)){const s=new A;r.parent.getWorldPosition(s),r.lookAt(this.camera.position)}})}enableOrbitalLinesFade(e){this.orbitalLinesFadeEnabled=e,e||(this.orbitalLinesTargetOpacity=.4,this.orbitalLinesCurrentOpacity=.4,this.updateOrbitalLinesFade())}isOrbitalLinesFadeEnabled(){return this.orbitalLinesFadeEnabled}}export{Se as L,K as M,be as N};
