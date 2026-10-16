import{W as N}from"./atlas_D0CDU_zgRQ1L3XbOi9taH.js";import{cg as R,P as L,o as C,au as q,m as B,aJ as U,i as P,av as b,cx as Y,cB as D,bE as S,cv as Z,cu as W,cw as M,ct as O}from"./atlas_BUnHktt_WsVovWPX8BirI.js";import{R as d,j as a,r as X}from"./atlas_CTJpjF3PMF1pOPRUuT4Ak.js";import{P as E}from"./atlas_BxTMsX-kgk6eYB29rUQmm.js";const l=2200,v=60,F=26,$=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,G=`
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
`;class se{renderer;scene=new R;camera=new L(70,1,.05,200);backdrop;stars;brightness;points;streaks;frame=0;last=performance.now();start=performance.now();speed=1.2;anticipation=0;dive=null;look=new C;lookTarget=new C;container;constructor(e){this.container=e,this.renderer=new N({antialias:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),this.renderer.autoClear=!1,this.renderer.domElement.style.display="block",e.appendChild(this.renderer.domElement),this.backdrop=new q({uniforms:{uTime:{value:0},uAspect:{value:1},uZoom:{value:1},uLook:{value:new C},uSpeed:{value:0}},vertexShader:$,fragmentShader:G,depthTest:!1,depthWrite:!1});const t=new B(new U(2,2),this.backdrop);t.frustumCulled=!1,t.renderOrder=-1,this.scene.add(t),this.stars=new Float32Array(l*3),this.brightness=new Float32Array(l);for(let o=0;o<l;o++)this.respawn(o,-Math.random()*v);const r=new P;r.setAttribute("position",new b(new Float32Array(l*3),3)),r.setAttribute("color",new b(new Float32Array(l*3),3)),this.points=new Y(r,new D({size:.11,sizeAttenuation:!0,vertexColors:!0,transparent:!0,blending:S,depthWrite:!1,map:I()})),this.points.frustumCulled=!1;const i=new P;i.setAttribute("position",new b(new Float32Array(l*6),3)),i.setAttribute("color",new b(new Float32Array(l*6),3)),this.streaks=new Z(i,new W({vertexColors:!0,transparent:!0,blending:S,depthWrite:!1})),this.streaks.frustumCulled=!1,this.scene.add(this.points,this.streaks),window.addEventListener("pointermove",this.onPointer),window.addEventListener("resize",this.resize),this.resize(),this.frame=requestAnimationFrame(this.render)}setAnticipation(e){this.anticipation=e}accelerate(e){this.dive={start:performance.now(),seconds:e}}respawn(e,t){let r=0,i=0;do r=(Math.random()*2-1)*F,i=(Math.random()*2-1)*F;while(r*r+i*i<1.2);this.stars[e*3]=r,this.stars[e*3+1]=i,this.stars[e*3+2]=t,this.brightness[e]=.35+Math.random()*.65}onPointer=e=>{this.lookTarget.set(e.clientX/Math.max(window.innerWidth,1)*2-1,e.clientY/Math.max(window.innerHeight,1)*2-1)};resize=()=>{const e=this.container.clientWidth||window.innerWidth,t=this.container.clientHeight||window.innerHeight;this.renderer.setSize(e,t),this.camera.aspect=e/t,this.camera.updateProjectionMatrix(),this.backdrop.uniforms.uAspect.value=e/t};render=e=>{this.frame=requestAnimationFrame(this.render);const t=Math.min(.05,(e-this.last)/1e3);this.last=e;const r=(e-this.start)/1e3;let i=1.2+this.anticipation*2.2,o=0;this.dive&&(o=M.clamp((e-this.dive.start)/1e3/this.dive.seconds,0,1),i=3.4+Math.pow(o,2.2)*150),this.speed+=(i-this.speed)*Math.min(1,t*(this.dive?6:2));const h=M.clamp((this.speed-1.2)/60,0,1);this.look.lerp(this.lookTarget,Math.min(1,t*1.6)),this.camera.rotation.set(-this.look.y*.06,-this.look.x*.09,0),this.camera.fov=70+34*o*o,this.camera.updateProjectionMatrix();const c=this.backdrop.uniforms;c.uTime.value=r,c.uZoom.value=1+.25*o*o+r*.004,c.uLook.value.set(this.look.x*.05,-this.look.y*.035),c.uSpeed.value=h;const m=this.points.geometry.getAttribute("position"),f=this.points.geometry.getAttribute("color"),u=this.streaks.geometry.getAttribute("position"),w=this.streaks.geometry.getAttribute("color"),z=.02+this.speed*.09;for(let n=0;n<l;n++){let p=this.stars[n*3+2]+this.speed*t;p>-.2&&(this.respawn(n,-v),p=-v),this.stars[n*3+2]=p;const y=this.stars[n*3],k=this.stars[n*3+1],x=this.brightness[n]*M.smoothstep(-p,v,v*.6);m.setXYZ(n,y,k,p),f.setXYZ(n,x*.85,x*.92,x),u.setXYZ(n*2,y,k,p),u.setXYZ(n*2+1,y,k,p-z);const A=x*h;w.setXYZ(n*2,A*.7,A*.85,A),w.setXYZ(n*2+1,0,0,0)}m.needsUpdate=!0,f.needsUpdate=!0,u.needsUpdate=!0,w.needsUpdate=!0,this.renderer.clear(),this.renderer.render(this.scene,this.camera)};dispose(){cancelAnimationFrame(this.frame),window.removeEventListener("pointermove",this.onPointer),window.removeEventListener("resize",this.resize),this.points.geometry.dispose(),this.points.material.map?.dispose(),this.points.material.dispose(),this.streaks.geometry.dispose(),this.streaks.material.dispose(),this.backdrop.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}}function I(){const e=document.createElement("canvas");e.width=e.height=64;const t=e.getContext("2d"),r=t.createRadialGradient(64/2,64/2,0,64/2,64/2,64/2);return r.addColorStop(0,"rgba(255,255,255,1)"),r.addColorStop(.25,"rgba(220,235,255,0.6)"),r.addColorStop(1,"rgba(200,220,255,0)"),t.fillStyle=r,t.fillRect(0,0,64,64),new O(e)}const re=({className:s="",children:e})=>a.jsx("div",{className:`bg-slate-950/75 backdrop-blur-md border border-white/10 rounded-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] ${s}`,children:e}),ae=({tone:s="ghost",className:e="",...t})=>a.jsx("button",{...t,className:`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-40 ${s==="primary"?"bg-cyan-400 hover:bg-cyan-300 text-slate-950 shadow-[0_0_16px_rgba(34,211,238,0.45)]":"bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10"} ${e}`}),ie=({children:s})=>a.jsx("kbd",{className:"hidden sm:inline ml-1.5 px-1 rounded border border-current/30 text-[10px] opacity-70 font-mono",children:s}),g=260,T="cubic-bezier(0.16, 1, 0.3, 1)",j=d.createContext(!0);function oe({show:s,children:e}){const[t,r]=d.useState(s),[i,o]=d.useState(!1);return d.useEffect(()=>{if(s){r(!0);let c=0;const m=requestAnimationFrame(()=>c=requestAnimationFrame(()=>o(!0)));return()=>{cancelAnimationFrame(m),cancelAnimationFrame(c)}}o(!1);const h=setTimeout(()=>r(!1),g);return()=>clearTimeout(h)},[s]),t?a.jsx(j.Provider,{value:i,children:e}):null}const ne=({onClose:s,children:e})=>{const t=d.useContext(j);return a.jsx("div",{className:"absolute inset-0 z-50 flex items-center justify-center bg-black/50 pointer-events-auto p-4",style:{opacity:t?1:0,transition:`opacity ${g}ms ease`},onClick:s,children:a.jsx("div",{onClick:r=>r.stopPropagation(),className:"max-h-full flex",style:{transform:t?"none":"translateY(14px) scale(0.965)",transition:`transform ${g+60}ms ${T}`},children:e})})},ce=({className:s="",style:e,origin:t="top right",children:r})=>{const i=d.useContext(j);return a.jsx("div",{className:s,style:{...e,opacity:i?1:0,transform:i?"none":"translateY(-10px) scale(0.96)",transformOrigin:t,transition:`opacity ${g-40}ms ease, transform ${g+40}ms ${T}`},children:r})},_="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=<>/";function le(s,e=520){const[t,r]=d.useState(s);return d.useEffect(()=>{const i=performance.now();let o=0;const h=()=>{const c=Math.min(1,(performance.now()-i)/e),m=Math.floor(c*s.length);let f=s.slice(0,m);for(let u=m;u<s.length;u++)f+=s[u]===" "?" ":_[Math.floor(Math.random()*_.length)];r(f),c<1&&(o=requestAnimationFrame(h))};return o=requestAnimationFrame(h),()=>cancelAnimationFrame(o)},[s,e]),t}const K="atlas_photosensitivity_mode",de="photosensitivityChange";function he(){return E.isEnabled()}function H(){try{return localStorage.getItem(K)!==null}catch{return!0}}function V(s){s?E.enable():E.disable()}function me(){const[s,e]=X.useState(()=>H());return[s,()=>e(!0)]}function ue({onChosen:s}){const e=t=>{V(t),s(t)};return a.jsx("div",{className:"absolute inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-[2px] px-4 animate-[fadeIn_0.6s_ease-out]",children:a.jsxs("div",{role:"alertdialog","aria-labelledby":"comfort-title","aria-describedby":"comfort-text",className:"w-full max-w-md rounded-xl border border-amber-200/25 bg-slate-950/85 backdrop-blur-md shadow-[0_0_40px_rgba(0,0,0,0.6)] p-5 sm:p-6",children:[a.jsxs("div",{className:"flex items-center gap-3",children:[a.jsxs("svg",{width:26,height:26,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round",className:"text-amber-200 shrink-0",children:[a.jsx("path",{d:"M12 3l9.5 16.5h-19z"}),a.jsx("path",{d:"M12 10v4.5M12 17.2v.3"})]}),a.jsxs("div",{children:[a.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-amber-200/80",children:"Before you dive"}),a.jsx("div",{id:"comfort-title",className:"text-lg text-white font-light",children:"Photosensitivity warning"})]})]}),a.jsx("p",{id:"comfort-text",className:"mt-3 text-sm text-gray-300 leading-relaxed",children:"The Atlas contains flashes of light and fast-moving patterns: jumps through hyperspace, wormholes, the birth of a universe. If you are sensitive to them, reduce flashing."}),a.jsx("p",{className:"mt-2 text-xs text-gray-500",children:"You can change this at any time in Graphics & view."}),a.jsxs("div",{className:"mt-5 flex flex-col-reverse sm:flex-row gap-2",children:[a.jsx("button",{onClick:()=>e(!0),className:"flex-1 px-4 py-2.5 rounded-lg text-sm border border-amber-200/40 bg-amber-200/10 text-amber-100 hover:bg-amber-200/20 transition-colors",children:"Reduce flashing"}),a.jsx("button",{autoFocus:!0,onClick:()=>e(!1),className:"flex-1 px-4 py-2.5 rounded-lg text-sm bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.45)] transition-colors",children:"Continue"})]})]})})}export{ae as B,ue as C,se as D,ie as K,ne as M,re as P,le as a,de as b,oe as c,ce as d,he as r,V as s,me as u};
