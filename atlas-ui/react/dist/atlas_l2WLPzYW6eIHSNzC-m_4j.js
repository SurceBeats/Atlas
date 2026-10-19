import{W as D}from"./atlas_D0CDU_zgRQ1L3XbOi9taH.js";import{cg as I,P as O,o as P,au as U,m as $,aJ as B,i as S,av as u,cx as W,cB as Y,bE as F,cv as V,cu as q,cw as T,ct as G,C as Z}from"./atlas_BUnHktt_WsVovWPX8BirI.js";import{R as g,j as r,r as X}from"./atlas_CTJpjF3PMF1pOPRUuT4Ak.js";import{P as E,t as w}from"./atlas_O92v5LOL399UMD7ZI6RD2.js";const v=2200,y=60,_=26,H=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,K=`
  uniform float uTime;
  uniform float uAspect;
  uniform float uZoom;
  uniform vec2 uLook;
  uniform float uSpeed;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  // A spiral galaxy: two logarithmic arms of stars and dust round a bright core
  vec3 galaxy(vec2 p) {
    float r = length(p);
    float a = atan(p.y, p.x) - uTime * 0.03;
    float arms = pow(0.5 + 0.5 * cos(2.0 * (a - log(max(r, 1e-3)) * 2.6)), 3.0);
    float disk = exp(-r * 5.5);
    float grain = 0.6 + 0.4 * noise(p * 60.0);
    vec3 col = vec3(0.55, 0.7, 1.0) * arms * disk * grain * 1.1;
    col += vec3(1.0, 0.82, 0.6) * exp(-r * r * 160.0) * 1.4;
    return col;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    vec2 q = p / uZoom + uLook;
    // Nebula: warped turbulence, two lights (cyan, violet) and dark dust
    vec2 w = vec2(fbm(q * 1.4 + uTime * 0.012), fbm(q * 1.4 + vec2(5.2, 1.3) - uTime * 0.01));
    float gas = fbm(q * 1.8 + w * 1.6);
    float glow = smoothstep(0.42, 0.85, gas);
    vec3 col = mix(vec3(0.004, 0.01, 0.025), vec3(0.03, 0.17, 0.26), glow);
    col = mix(col, vec3(0.24, 0.08, 0.32), smoothstep(0.55, 0.9, fbm(q * 2.6 - w + 3.0)) * 0.7);
    float dust = smoothstep(0.45, 0.7, fbm(q * 3.4 + w * 2.0 + 8.0));
    col *= 1.0 - dust * 0.7;
    // Faint background stars, fixed to the sky
    vec2 cell = floor(q * 260.0);
    float star = step(0.9975, hash(cell)) * (0.4 + 0.6 * hash(cell + 3.0));
    col += vec3(0.8, 0.88, 1.0) * star * 0.5;
    // The galaxy, far ahead and a little off centre (above the title on a tall screen)
    vec2 spot = uAspect >= 1.0 ? vec2(0.28, 0.12) : vec2(0.06, 0.3);
    vec2 g = (q - spot) * mat2(0.94, -0.34, 0.34, 0.94) * vec2(1.0, 2.2);
    col += galaxy(g * 1.6) * 0.9;
    // A vignette that tightens as the ship speeds up
    float r = length(p);
    col *= 1.0 - smoothstep(0.35, 1.0, r) * (0.55 + 0.35 * uSpeed);
    gl_FragColor = vec4(col, 1.0);
  }
`;class ue{renderer;scene=new I;camera=new O(70,1,.05,200);backdrop;stars;brightness;points;streaks;frame=0;last=performance.now();start=performance.now();speed=1.2;anticipation=0;dive=null;look=new P;lookTarget=new P;container;constructor(e){this.container=e,this.renderer=new D({antialias:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),this.renderer.autoClear=!1,this.renderer.domElement.style.display="block",e.appendChild(this.renderer.domElement),this.backdrop=new U({uniforms:{uTime:{value:0},uAspect:{value:1},uZoom:{value:1},uLook:{value:new P},uSpeed:{value:0}},vertexShader:H,fragmentShader:K,depthTest:!1,depthWrite:!1});const s=new $(new B(2,2),this.backdrop);s.frustumCulled=!1,s.renderOrder=-1,this.scene.add(s),this.stars=new Float32Array(v*3),this.brightness=new Float32Array(v);for(let i=0;i<v;i++)this.respawn(i,-Math.random()*y);const o=new S;o.setAttribute("position",new u(new Float32Array(v*3),3)),o.setAttribute("color",new u(new Float32Array(v*3),3)),this.points=new W(o,new Y({size:.11,sizeAttenuation:!0,vertexColors:!0,transparent:!0,blending:F,depthWrite:!1,map:J()})),this.points.frustumCulled=!1;const a=new S;a.setAttribute("position",new u(new Float32Array(v*6),3)),a.setAttribute("color",new u(new Float32Array(v*6),3)),this.streaks=new V(a,new q({vertexColors:!0,transparent:!0,blending:F,depthWrite:!1})),this.streaks.frustumCulled=!1,this.scene.add(this.points,this.streaks),window.addEventListener("pointermove",this.onPointer),window.addEventListener("resize",this.resize),this.resize(),this.frame=requestAnimationFrame(this.render)}setAnticipation(e){this.anticipation=e}accelerate(e){this.dive={start:performance.now(),seconds:e}}respawn(e,s){let o=0,a=0;do o=(Math.random()*2-1)*_,a=(Math.random()*2-1)*_;while(o*o+a*a<1.2);this.stars[e*3]=o,this.stars[e*3+1]=a,this.stars[e*3+2]=s,this.brightness[e]=.35+Math.random()*.65}onPointer=e=>{this.lookTarget.set(e.clientX/Math.max(window.innerWidth,1)*2-1,e.clientY/Math.max(window.innerHeight,1)*2-1)};resize=()=>{const e=this.container.clientWidth||window.innerWidth,s=this.container.clientHeight||window.innerHeight;this.renderer.setSize(e,s),this.camera.aspect=e/s,this.camera.updateProjectionMatrix(),this.backdrop.uniforms.uAspect.value=e/s};render=e=>{this.frame=requestAnimationFrame(this.render);const s=Math.min(.05,(e-this.last)/1e3);this.last=e;const o=(e-this.start)/1e3;let a=1.2+this.anticipation*2.2,i=0;this.dive&&(i=T.clamp((e-this.dive.start)/1e3/this.dive.seconds,0,1),a=3.4+Math.pow(i,2.2)*150),this.speed+=(a-this.speed)*Math.min(1,s*(this.dive?6:2));const d=T.clamp((this.speed-1.2)/60,0,1);this.look.lerp(this.lookTarget,Math.min(1,s*1.6)),this.camera.rotation.set(-this.look.y*.06,-this.look.x*.09,0),this.camera.fov=70+34*i*i,this.camera.updateProjectionMatrix();const l=this.backdrop.uniforms;l.uTime.value=o,l.uZoom.value=1+.25*i*i+o*.004,l.uLook.value.set(this.look.x*.05,-this.look.y*.035),l.uSpeed.value=d;const m=this.points.geometry.getAttribute("position"),p=this.points.geometry.getAttribute("color"),h=this.streaks.geometry.getAttribute("position"),x=this.streaks.geometry.getAttribute("color"),k=.02+this.speed*.09;for(let n=0;n<v;n++){let c=this.stars[n*3+2]+this.speed*s;c>-.2&&(this.respawn(n,-y),c=-y),this.stars[n*3+2]=c;const f=this.stars[n*3],b=this.stars[n*3+1],C=this.brightness[n]*T.smoothstep(-c,y,y*.6);m.setXYZ(n,f,b,c),p.setXYZ(n,C*.85,C*.92,C),h.setXYZ(n*2,f,b,c),h.setXYZ(n*2+1,f,b,c-k);const M=C*d;x.setXYZ(n*2,M*.7,M*.85,M),x.setXYZ(n*2+1,0,0,0)}m.needsUpdate=!0,p.needsUpdate=!0,h.needsUpdate=!0,x.needsUpdate=!0,this.renderer.clear(),this.renderer.render(this.scene,this.camera)};dispose(){cancelAnimationFrame(this.frame),window.removeEventListener("pointermove",this.onPointer),window.removeEventListener("resize",this.resize),this.points.geometry.dispose(),this.points.material.map?.dispose(),this.points.material.dispose(),this.streaks.geometry.dispose(),this.streaks.material.dispose(),this.backdrop.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}}function J(){const e=document.createElement("canvas");e.width=e.height=64;const s=e.getContext("2d"),o=s.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return o.addColorStop(0,"rgba(255,255,255,1)"),o.addColorStop(.25,"rgba(220,235,255,0.6)"),o.addColorStop(1,"rgba(200,220,255,0)"),s.fillStyle=o,s.fillRect(0,0,64,64),new G(e)}const j=2,Q=.75,ee=4.6,N=.62,te=`
attribute float aU;
attribute float aV;
attribute float aSpeed;
attribute float aSign;
attribute float aShell;
attribute float aRand;
uniform float uFlow;
uniform float uTime;
uniform float uTension;
uniform float uPinch;
uniform float uUnfold;
uniform float uDrop;
uniform float uMirror;
uniform float uAlpha;
uniform float uPixels;
uniform vec3 uWarm;
uniform vec3 uCool;
varying vec3 vColor;
const float TAU = 6.2831853;
void main() {
  // Round the ring (u) and round the tube (v). The tube turns half over on each loop,
  // so a loop never closes on itself: it closes on its mirror image (the Klein twist)
  float u = aU + uFlow * aSpeed;
  float v = aV + 0.5 * u;
  float loops = u / TAU;
  float f = fract(loops);
  // Every pass through the twist (the far side of the ring) turns +e into -e
  float here = mod(floor(loops), 2.0) < 0.5 ? aSign : -aSign;
  float charge = mix(here, -here, smoothstep(0.45, 0.55, f));
  float seam = exp(-pow((f - 0.5) * 11.0, 2.0));
  // As entropy piles up the torus trembles
  float tremble = uTension * uTension * (0.09 * sin(5.0 * u + 3.0 * v - uTime * 5.0) + 0.05 * sin(13.0 * u - uTime * 9.0 + aRand * 6.0));
  float r = ${Q.toFixed(2)} * (aShell + tremble);
  vec3 torus = vec3((${j.toFixed(2)} + r * cos(v)) * cos(u), r * sin(v), (${j.toFixed(2)} + r * cos(v)) * sin(u));
  // The signature change: everything spirals down through the throat to one vertex
  float pinch = uPinch * uPinch * (3.0 - 2.0 * uPinch);
  float swirl = pinch * 2.4;
  vec3 p = torus * (1.0 - pinch);
  p.xz = mat2(cos(swirl), -sin(swirl), sin(swirl), cos(swirl)) * p.xz;
  // The unfolding: out of the vertex along two cones, matter one way, antimatter the other
  float side = aSign;
  float h = uUnfold * ${ee.toFixed(2)} * (0.06 + 0.94 * pow(fract(aRand * 13.7 + aU * 0.37), 0.65));
  float phi = aU + aV * 0.25 + uTime * 0.12 * side;
  float spread = aShell > 0.9 ? 1.0 : sqrt(aShell / 0.9);
  p += vec3(cos(phi) * h * ${N.toFixed(2)} * spread, side * h, sin(phi) * h * ${N.toFixed(2)} * spread);
  // The mirror falls away, causally disconnected
  float mirror = step(side, 0.0);
  p.y -= mirror * uDrop * 7.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);

  vec3 primordial = mix(uCool, uWarm, charge * 0.5 + 0.5) * (0.5 + 0.5 * aRand) * (0.6 + 0.6 * uTension + 1.5 * seam * (0.4 + uTension));
  vec3 vertex = vec3(1.0, 0.97, 0.92) * 1.4;
  vec3 sector = side > 0.0 ? vec3(1.0, 0.86, 0.66) : uCool * vec3(0.8, 0.75, 1.1);
  vec3 color = mix(primordial, vertex, pinch);
  color = mix(color, sector * (0.55 + 0.6 * (1.0 - uUnfold) + 0.4 * fract(aRand * 7.3)), smoothstep(0.0, 0.35, uUnfold));
  vColor = color * uAlpha * (1.0 - mirror * uMirror);
  gl_PointSize = 0.026 * (0.7 + 0.6 * aRand) * (1.0 - 0.55 * pinch * (1.0 - uUnfold)) * uPixels / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,se=`
varying vec3 vColor;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  gl_FragColor = vec4(vColor * exp(-d * d * 5.0), 1.0);
}
`;function de(t){let e=t%2147483647;return e<=0&&(e+=2147483646),()=>(e=e*16807%2147483647)/2147483647}const oe=t=>Math.sqrt(-2*Math.log(Math.max(t(),1e-9)))*Math.cos(2*Math.PI*t());function me(t,e){const o=new Float32Array(t),a=new Float32Array(t),i=new Float32Array(t),d=new Float32Array(t),l=new Float32Array(t),m=new Float32Array(t);for(let p=0;p<t;p+=2){const h=e()<.72,x=Math.floor(e()*28),k=[e()*Math.PI*2,h?(x+.5)/28*Math.PI*2+oe(e)*.02:e()*Math.PI*2],n=h?.35+.45*(x*.618%1):.3+.5*e();for(let c=0;c<2&&p+c<t;c++){const f=p+c,b=c===0?1:-1;o[f]=k[0],a[f]=k[1],i[f]=n*b,d[f]=b,l[f]=h?.98+.04*e():.9*Math.sqrt(e()),m[f]=h?.45+.55*e():.35*e()}}return{u:o,v:a,speed:i,sign:d,shell:l,rand:m}}function pe(t){const e=t.u.length,s=new S;return s.setAttribute("position",new u(new Float32Array(e*3),3)),s.setAttribute("aU",new u(t.u,1)),s.setAttribute("aV",new u(t.v,1)),s.setAttribute("aSpeed",new u(t.speed,1)),s.setAttribute("aSign",new u(t.sign,1)),s.setAttribute("aShell",new u(t.shell,1)),s.setAttribute("aRand",new u(t.rand,1)),s}function fe(t){return new U({uniforms:{uFlow:{value:0},uTime:{value:0},uTension:{value:0},uPinch:{value:0},uUnfold:{value:0},uDrop:{value:0},uMirror:{value:0},uAlpha:{value:0},uPixels:{value:900},uWarm:{value:new Z(1,.58,.22)},uCool:{value:t}},vertexShader:te,fragmentShader:se,blending:F,transparent:!0,depthWrite:!1})}const ve=({className:t="",children:e})=>r.jsx("div",{className:`bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ${t}`,children:e}),ge=({tone:t="ghost",className:e="",...s})=>r.jsx("button",{...s,className:`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${t==="primary"?"bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.45)]":"bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10"} ${e}`}),xe=({children:t})=>r.jsx("kbd",{className:"hidden sm:inline ml-1.5 px-1 rounded border border-current/30 text-[10px] opacity-70 font-mono",children:t}),A=260,L="cubic-bezier(0.16, 1, 0.3, 1)",R=g.createContext(!0);function be({show:t,children:e}){const[s,o]=g.useState(t),[a,i]=g.useState(!1);return g.useEffect(()=>{if(t){o(!0);let l=0;const m=requestAnimationFrame(()=>l=requestAnimationFrame(()=>i(!0)));return()=>{cancelAnimationFrame(m),cancelAnimationFrame(l)}}i(!1);const d=setTimeout(()=>o(!1),A);return()=>clearTimeout(d)},[t]),s?r.jsx(R.Provider,{value:a,children:e}):null}const we=({onClose:t,children:e})=>{const s=g.useContext(R);return r.jsx("div",{className:"absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto p-4",style:{opacity:s?1:0,transition:`opacity ${A}ms ease`},onClick:t,children:r.jsx("div",{onClick:o=>o.stopPropagation(),className:"max-h-full flex",style:{transform:s?"none":"translateY(14px) scale(0.965)",transition:`transform ${A+60}ms ${L}`},children:e})})},ye=({className:t="",style:e,origin:s="top right",children:o})=>{const a=g.useContext(R);return r.jsx("div",{className:t,style:{...e,opacity:a?1:0,transform:a?"none":"translateY(-10px) scale(0.96)",transformOrigin:s,transition:`opacity ${A-40}ms ease, transform ${A+40}ms ${L}`},children:o})},z="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";function Ae(t,e=520){const[s,o]=g.useState(t);return g.useEffect(()=>{const a=performance.now();let i=0;const d=()=>{const l=Math.min(1,(performance.now()-a)/e),m=Math.floor(l*t.length);let p=t.slice(0,m);for(let h=m;h<t.length;h++)p+=t[h]===" "?" ":z[Math.floor(Math.random()*z.length)];o(p),l<1&&(i=requestAnimationFrame(d))};return i=requestAnimationFrame(d),()=>cancelAnimationFrame(i)},[t,e]),s}const ae="atlas_photosensitivity_mode",ke="photosensitivityChange";function Ce(){return E.isEnabled()}function re(){try{return localStorage.getItem(ae)!==null}catch{return!0}}function ie(t){t?E.enable():E.disable()}function Me(){const[t,e]=X.useState(()=>re());return[t,()=>e(!0)]}function Pe({onChosen:t}){const e=s=>{ie(s),t(s)};return r.jsx("div",{className:"absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4 animate-[fadeIn_0.6s_ease-out]",children:r.jsxs("div",{role:"alertdialog","aria-labelledby":"comfort-title","aria-describedby":"comfort-text",className:"w-full max-w-md rounded-xl border border-amber-200/25 bg-slate-950/85 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 sm:p-6",children:[r.jsxs("div",{className:"flex items-center gap-3",children:[r.jsxs("svg",{width:26,height:26,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round",className:"text-amber-200 shrink-0",children:[r.jsx("path",{d:"M12 3l9.5 16.5h-19z"}),r.jsx("path",{d:"M12 10v4.5M12 17.2v.3"})]}),r.jsxs("div",{children:[r.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-amber-200/80",children:w("BEFORE YOU DIVE")}),r.jsx("div",{id:"comfort-title",className:"text-lg text-white font-light",children:w("Photosensitivity warning")})]})]}),r.jsx("p",{id:"comfort-text",className:"mt-3 text-sm text-gray-300 leading-relaxed",children:w("The Atlas contains flashes of light and fast-moving patterns: jumps through hyperspace, wormholes, the birth of a universe. If you are sensitive to them, reduce flashing.")}),r.jsx("p",{className:"mt-2 text-xs text-gray-500",children:w("You can change this at any time in Graphics & view.")}),r.jsxs("div",{className:"mt-5 flex flex-col-reverse sm:flex-row gap-2",children:[r.jsx("button",{onClick:()=>e(!0),className:"flex-1 px-4 py-2.5 rounded-lg text-sm border border-amber-200/40 bg-amber-200/10 text-amber-100 hover:bg-amber-200/20 transition-colors",children:w("Reduce flashing")}),r.jsx("button",{autoFocus:!0,onClick:()=>e(!1),className:"flex-1 px-4 py-2.5 rounded-lg text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.45)] transition-colors",children:w("Continue")})]})]})})}export{ge as B,Pe as C,ue as D,xe as K,we as M,se as P,j as R,Q as T,fe as a,Ce as b,Ae as c,ke as d,ve as e,be as f,oe as g,ye as h,me as p,de as r,ie as s,pe as t,Me as u};
