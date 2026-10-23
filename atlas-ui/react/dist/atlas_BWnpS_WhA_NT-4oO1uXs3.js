import{r as y,j as n,R as Ya,c as Xi}from"./atlas_CTJpjF3PMF1pOPRUuT4Ak.js";import{W as Za,P as Ji}from"./atlas_DSJ7C9RPCcnrgjWfRLuaL.js";import{cg as Ee,O as Xa,S as Ae,bT as Ki,aw as Qi,P as fs,d as _s,H as Es,au as $,V as M,m as D,aJ as Ce,o as Fe,cE as en,I as Ja,cw as I,M as zt,cq as se,cF as tn,cG as vt,bE as Z,i as de,av as te,cx as Te,C as W,ar as Ka,cH as Qa,cn as le,cy as gs,cz as vs,ci as sn,ch as ue,g as os,cu as ht,cI as an,ct as ve,ad as rs,cs as xs,D as Se,cC as lt,cJ as nn,cK as Dt,cL as on,cj as ei,bN as ys,cA as ut,bL as be,cv as Le,cM as ws,bA as rn,cN as He,j as ze,cO as ti,a as Ls,B as ln,c6 as dt,cP as nt,cQ as cn,cR as hn,cS as Is,cT as Fs,cU as si,cr as un}from"./atlas_BUnHktt_WsVovWPX8BirI.js";import{N as Me,L as bs,M as dn}from"./atlas_BkgksuteXGnrZs4hhUnJ9.js";import{m as ai,R as mn}from"./atlas_DDuAJaLg0TaDhO66nR-he.js";import{r as pn,a as zs,t as Ds,p as Ws,R as fn,T as gn,b as Ye,d as Os,M as Wt,e as me,u as vn,D as xn,C as yn,c as Pt,B as H,f as xe,K as we,h as xt,s as wn}from"./atlas_CZHzlLTq54YYBXodx-ExO.js";import{t as m,d as bn,a as X,L as O,n as ae,c as Ss,_ as fe,b as Sn,s as Mn,l as kn}from"./atlas_Vdt7QIYocBPitP_xV4gLr.js";import{Q as jn}from"./atlas_qHpRbMMkCrnJ67xzvK1rX.js";import{c as ot}from"./atlas_DrNuGgsmr8JJoyR3GdX9S.js";import{S as Ht,g as Nn,A as ii,s as Cn}from"./atlas_hCIrjtRx2THlGEr3_aDQ2.js";const Gs=4,ni=1,qs=.35,Vs=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Tn=`
  uniform sampler2D tHdr;
  uniform sampler2D tGlow;
  uniform float uExposure;
  uniform float uTime;
  uniform float uWarp;
  uniform float uAspect;
  uniform vec3 uLenses[4];
  uniform int uLensCount;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  // The deep sky: stars at full resolution, the glow upsampled (bilinear) from its target
  // and held a little under the stars, so dense regions read as starfields, not fog
  vec3 deepSky(vec2 uv) {
    uv = clamp(uv, 0.0, 1.0);
    return texture2D(tHdr, uv).rgb + texture2D(tGlow, uv).rgb * 0.7;
  }

  // The jump drive. The real sky is smeared into radial streaks (a zoom blur, split
  // by colour at the edges like a lens pushed past its limits) and rippled by the jump
  // field. In the onboarding's palette
  vec3 warpedSky(vec2 uv) {
    vec2 c = vec2(0.5);
    vec2 d = uv - c;
    float r = length(d * vec2(uAspect, 1.0));
    d *= 1.0 + sin(r * 22.0 - uTime * 9.0) * 0.006 * uWarp;
    float span = uWarp * (0.05 + 0.3 * r);
    float split = 0.014 * uWarp * r;
    vec3 acc = vec3(0.0);
    float wsum = 0.0;
    for (int i = 0; i < 12; i++) {
      float t = float(i) / 11.0;
      float s = 1.0 - span * t;
      float w = 1.0 - t * 0.7;
      acc.r += deepSky(c + d * s * (1.0 + split)).r * w;
      acc.g += deepSky(c + d * s).g * w;
      acc.b += deepSky(c + d * s * (1.0 - split)).b * w;
      wsum += w;
    }
    // A star smeared over the streak keeps most of its light
    return acc / wsum * mix(1.0, 5.0, uWarp);
  }

  // Glowing motes streaming out of the vanishing point, each with a short tail
  vec3 jumpField(vec2 uv) {
    vec2 p = (uv - 0.5) * vec2(uAspect, 1.0);
    float r = length(p);
    float a = atan(p.y, p.x);
    float lanes = 64.0;
    float lane = floor((a / 6.2831853 + 0.5) * lanes);
    float seed = hash(vec2(lane, 3.1));
    float laneAngle = (lane + 0.25 + 0.5 * seed) / lanes * 6.2831853 - 3.14159265;
    float across = abs(sin(a - laneAngle)) * r;
    float speed = 0.45 + seed * 1.1;
    float lr = log(max(r, 1e-3)) * 2.4 - uTime * speed * (0.6 + 2.6 * uWarp) + seed * 7.0;
    float cell = floor(lr);
    float f = fract(lr);
    float on = step(0.5, hash(vec2(lane, cell)));
    float head = exp(-pow((f - 0.82) * 10.0, 2.0));
    float tail = smoothstep(0.82 - 0.75 * uWarp, 0.82, f) * step(f, 0.82);
    float width = 0.0012 + 0.0045 * r;
    float core = exp(-pow(across / width, 2.0));
    vec3 tint = mix(vec3(0.3, 0.6, 1.0), vec3(0.72, 0.48, 1.0), hash(vec2(cell, lane)));
    tint = mix(tint, vec3(0.55, 1.0, 0.95), step(0.82, seed));
    return tint * core * on * (head * 1.3 + tail * 0.45) * smoothstep(0.03, 0.28, r) * uWarp;
  }

  void main() {
    // Gravitational lensing (thin lens): light is pulled towards the Einstein ring,
    // the horizon swallows everything inside it and a thin photon ring outlines it
    vec2 uv = vUv;
    float shadow = 1.0;
    vec3 photon = vec3(0.0);
    for (int i = 0; i < 4; i++) {
      if (i >= uLensCount) break;
      vec3 lens = uLenses[i];
      vec2 d = (vUv - lens.xy) * vec2(uAspect, 1.0);
      float r = max(length(d), 1e-5);
      float horizon = lens.z;
      float einstein = horizon * 1.7;
      float source = r - einstein * einstein / r;
      uv += (d / r) * (source - r) / vec2(uAspect, 1.0);
      shadow *= smoothstep(horizon * 0.95, horizon * 1.05, r);
      float ring = exp(-pow((r - horizon * 1.12) / (horizon * 0.05), 2.0));
      photon += vec3(1.0, 0.82, 0.6) * ring * 0.9;
    }
    vec3 sky = uWarp > 0.001 ? warpedSky(uv) : deepSky(uv);
    vec3 hdr = sky * uExposure * shadow + photon;
    // Filmic-ish shoulder; keeps saturated cores from clipping to flat white
    vec3 mapped = vec3(1.0) - exp(-hdr);
    float luma = dot(mapped, vec3(0.2126, 0.7152, 0.0722));
    mapped = mix(vec3(luma), mapped, 1.3);
    if (uWarp > 0.001) {
      vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
      float r = length(p);
      mapped *= 1.0 - uWarp * 0.4 * smoothstep(0.35, 0.95, r);
      mapped += jumpField(vUv);
      // The vanishing point glows
      mapped += vec3(0.3, 0.55, 1.0) * exp(-r * r * 22.0) * uWarp * 0.35;
    }
    mapped = pow(max(mapped, 0.0), vec3(1.0 / 2.2));
    mapped += (hash(vUv * 1000.0 + uTime) - 0.5) / 255.0;
    gl_FragColor = vec4(mapped, 1.0);
  }
`,An=`
  uniform sampler2D tFrame;
  uniform float uTime;
  uniform float uAspect;
  uniform float uMouth;   // radius of the mouth, in screen heights
  uniform float uExit;
  uniform float uCharge;
  uniform float uFlash;
  // Reduced flashing (photosensitivity): no white flashes or shock ring, little colour
  // split, slower hyperspace
  uniform float uCalm;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  // Value noise, periodic in x (so it wraps round the tunnel without a seam)
  float pnoise(vec2 x, float period) {
    vec2 i = floor(x);
    vec2 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    float x0 = mod(i.x, period), x1 = mod(i.x + 1.0, period);
    float a = hash(vec2(x0, i.y)), b = hash(vec2(x1, i.y));
    float c = hash(vec2(x0, i.y + 1.0)), d = hash(vec2(x1, i.y + 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Hyperspace: a tunnel of light streaming past, twisting as it goes, rings of energy
  // rushing out of the far end and a glow there (linear light)
  vec3 hyperspace(vec2 p, float r) {
    float a = atan(p.y, p.x) / 6.2831853 + 0.5;
    float depth = 0.22 / max(r, 0.015);
    float z = depth + uTime * 3.2 * (1.0 - 0.6 * uCalm);
    float u = a + depth * 0.035 + uTime * 0.03;
    float coarse = pnoise(vec2(u * 18.0, z * 0.9), 18.0);
    float fine = pnoise(vec2(u * 72.0, z * 3.5), 72.0);
    float filaments = pow(coarse, 3.0) * 0.8 + pow(fine, 6.0) * 0.9;
    float hue = pnoise(vec2(u * 3.0, z * 0.15), 3.0);
    vec3 col = mix(vec3(0.12, 0.38, 1.0), vec3(0.62, 0.28, 1.0), hue);
    col = mix(col, vec3(0.55, 1.0, 0.95), smoothstep(0.75, 0.97, fine) * 0.6);
    float walls = 0.15 + smoothstep(0.02, 0.3, r) * (0.55 + 1.1 * smoothstep(0.25, 0.85, r));
    float rings = pow(0.5 + 0.5 * sin(z * 2.2), 14.0) * smoothstep(0.05, 0.3, r) * 0.35;
    vec3 linear = col * (filaments * walls + rings) + vec3(0.65, 0.82, 1.0) * exp(-r * r * 90.0) * 0.6 + vec3(0.01, 0.015, 0.04);
    return pow(1.0 - exp(-linear * 1.4), vec3(1.0 / 2.2));
  }

  vec3 frameAt(vec2 p) {
    return texture2D(tFrame, clamp(0.5 + p / vec2(uAspect, 1.0), 0.0, 1.0)).rgb;
  }

  // The frame lensed by the mouth: each colour bent a little differently
  vec3 lensed(vec2 p, float r, float mouth) {
    vec2 dir = p / max(r, 1e-5);
    // A slow twist, strongest near the rim
    float twist = 0.9 * mouth / max(r, mouth) * (0.4 + 0.6 * uCharge);
    vec3 col;
    for (int c = 0; c < 3; c++) {
      float m = mouth * (1.0 + (float(c) - 1.0) * 0.045 * (1.0 - 0.85 * uCalm));
      float source = max(r - m * m / max(r, 1e-4), 0.0);
      float ang = twist * (1.0 + (float(c) - 1.0) * 0.1);
      vec2 d = vec2(dir.x * cos(ang) - dir.y * sin(ang), dir.x * sin(ang) + dir.y * cos(ang));
      col[c] = frameAt(d * source)[c];
    }
    return col;
  }

  void main() {
    vec2 p = (vUv - 0.5) * vec2(uAspect, 1.0);
    float r = length(p);
    float mouth = max(uMouth, 1e-4);
    float edge = 0.015 + 0.06 * mouth;
    vec3 tunnel = hyperspace(p, r);
    vec3 color;
    if (uExit < 0.5) {
      // Going in: the scene outside the mouth, bent away; hyperspace inside. Nothing of
      // the scene shows through the tunnel: what is left behind is gone once swallowed
      vec3 scene = lensed(p, r, mouth);
      color = mix(tunnel, scene, smoothstep(mouth - edge, mouth + edge, r));
    } else {
      // Coming out: the new place opens from the centre, curved like a fisheye at the rim
      float k = clamp(r / mouth, 0.0, 1.0);
      vec3 scene = frameAt(p * (1.0 - 0.3 * k * k * k));
      color = mix(scene, tunnel, smoothstep(mouth - edge, mouth + edge, r));
    }
    // The photon ring round the mouth
    float ring = exp(-pow((r - mouth) / (0.01 + 0.025 * mouth), 2.0));
    color += vec3(0.55, 0.78, 1.0) * ring * 0.55 * smoothstep(0.0, 0.05, mouth);
    // Charging: the view around the mouth dims, rings of light converge on it
    float pulses = pow(max(sin(r * 46.0 + uTime * (8.0 + 34.0 * uCharge) * (1.0 - 0.7 * uCalm)), 0.0), 12.0) * exp(-r * 3.6) * (1.0 - 0.7 * uCalm);
    color += vec3(0.35, 0.65, 1.0) * pulses * uCharge * 0.18;
    color *= 1.0 - uCharge * 0.45 * smoothstep(0.35, 0.95, r);
    // Flashes, with a shock ring running out
    float flash = clamp(uFlash, 0.0, 1.0);
    float shock = exp(-pow((r - (1.0 - flash) * 1.1) * 9.0, 2.0)) * flash * (1.0 - uCalm);
    color = mix(color, vec3(0.9, 0.95, 1.0), flash * 0.85 * (1.0 - 0.85 * uCalm)) + vec3(0.5, 0.75, 1.0) * shock * 0.5;
    gl_FragColor = vec4(color, 1.0);
  }
`;class Rn{renderer;camera;deepScene=new Ee;nearScene=new Ee;nearSceneVisible=!1;nearRange=[1e-4,1e5];planetPasses=[];shipPass=null;exposure=1;warp=0;jump={active:!1,charge:0,mouth:0,exit:0,flash:0};calm=!1;get screenCover(){return Math.hypot(this.camera.aspect/2,.5)*1.08}paused=!1;idle=!1;fps=0;quality;frames=0;fpsWindowStart=performance.now();hdrTarget;glowTarget;tonemapScene=new Ee;tonemapCamera=new Xa(-1,1,1,-1,0,1);tonemapMaterial;frameCopy=null;wormholeScene=new Ee;wormholeMaterial;callbacks=[];running=!1;lastTime=0;container;resizeObserver;constructor(e,t){this.container=e,this.quality=t,this.renderer=new Za({antialias:t.antialias,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,t.pixelRatioCap)),this.renderer.outputColorSpace=Ae,this.renderer.toneMapping=Ki,this.renderer.toneMappingExposure=1.2,this.renderer.shadowMap.enabled=t.shadows,this.renderer.shadowMap.type=Qi,this.renderer.autoClear=!1,this.renderer.domElement.style.display="block",this.renderer.domElement.style.touchAction="none",e.appendChild(this.renderer.domElement),this.camera=new fs(60,1,1e-6,1e7),this.camera.position.set(0,0,0),this.hdrTarget=new _s(1,1,{type:Es,depthBuffer:!1}),this.glowTarget=new _s(1,1,{type:Es,depthBuffer:!1}),this.tonemapMaterial=new $({uniforms:{tHdr:{value:this.hdrTarget.texture},tGlow:{value:this.glowTarget.texture},uExposure:{value:1},uTime:{value:0},uWarp:{value:0},uAspect:{value:1},uLenses:{value:Array.from({length:Gs},()=>new M(0,0,0))},uLensCount:{value:0}},vertexShader:Vs,fragmentShader:Tn,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.tonemapScene.add(new D(new Ce(2,2),this.tonemapMaterial)),this.wormholeMaterial=new $({uniforms:{tFrame:{value:null},uTime:{value:0},uAspect:{value:1},uMouth:{value:0},uExit:{value:0},uCharge:{value:0},uFlash:{value:0},uCalm:{value:0}},vertexShader:Vs,fragmentShader:An,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.wormholeScene.add(new D(new Ce(2,2),this.wormholeMaterial)),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize()}get pixelRatio(){return this.renderer.getPixelRatio()}applyQuality(e){this.quality=e,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,e.pixelRatioCap)),this.resize()}setLenses(e){const t=this.tonemapMaterial.uniforms,s=Math.min(e.length,Gs);for(let i=0;i<s;i++)t.uLenses.value[i].set(e[i].x,e[i].y,e[i].radius);t.uLensCount.value=s}get viewportHeight(){return this.container.clientHeight||1}onFrame(e){return this.callbacks.push(e),()=>{this.callbacks=this.callbacks.filter(t=>t!==e)}}resize(){const e=this.container.clientWidth||1,t=this.container.clientHeight||1;this.renderer.setSize(e,t,!1),this.renderer.domElement.style.width=`${e}px`,this.renderer.domElement.style.height=`${t}px`;const s=this.renderer.getPixelRatio()*this.quality.deepSkyScale;this.hdrTarget.setSize(Math.max(1,Math.floor(e*s)),Math.max(1,Math.floor(t*s))),this.glowTarget.setSize(Math.max(1,Math.floor(e*s*qs)),Math.max(1,Math.floor(t*s*qs))),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}start(){if(this.running)return;this.running=!0,this.lastTime=performance.now();const e=()=>{if(!this.running)return;requestAnimationFrame(e);const t=performance.now(),s=this.idle?this.quality.idleFps:this.quality.fps;if(s>0&&t-this.lastTime<1e3/s-2)return;const i=Math.min(.1,(t-this.lastTime)/1e3);if(this.lastTime=t,!this.paused){for(const r of this.callbacks)r(i,t/1e3);this.render(t/1e3),this.frames++,t-this.fpsWindowStart>=1e3&&(this.fps=Math.round(this.frames*1e3/(t-this.fpsWindowStart)),this.frames=0,this.fpsWindowStart=t)}};requestAnimationFrame(e)}render(e){const t=this.renderer,s=this.camera;s.updateMatrixWorld(),s.near=1e-7,s.far=1e8,s.updateProjectionMatrix(),t.setClearColor(0,1),s.layers.set(ni),t.setRenderTarget(this.glowTarget),t.clear(!0,!0,!0),t.render(this.deepScene,s),s.layers.set(0),t.setRenderTarget(this.hdrTarget),t.clear(!0,!0,!0),t.render(this.deepScene,s),t.setRenderTarget(null),t.clear(!0,!0,!0);const i=this.tonemapMaterial.uniforms;i.uExposure.value=this.exposure,i.uTime.value=e%1e3,i.uWarp.value=this.warp,i.uAspect.value=s.aspect,t.render(this.tonemapScene,this.tonemapCamera),this.nearSceneVisible&&(s.near=this.nearRange[0],s.far=this.nearRange[1],s.updateProjectionMatrix(),t.clearDepth(),t.render(this.nearScene,s));for(const r of this.planetPasses)r.camera.aspect=s.aspect,r.camera.fov=s.fov,r.camera.updateProjectionMatrix(),t.clearDepth(),t.render(r.scene,r.camera);this.jump.active&&this.renderWormhole(e),this.shipPass&&(t.clearDepth(),t.render(this.shipPass.scene,this.shipPass.camera))}snapshot(e=Math.min(window.devicePixelRatio||1,3)){const t=this.shipPass,s=this.renderer.getPixelRatio(),i=e>s+.01;this.shipPass=null;const r=this.renderer.domElement,o=document.createElement("canvas");try{i&&(this.renderer.setPixelRatio(e),this.resize()),this.render(performance.now()/1e3),o.width=r.width,o.height=r.height,o.getContext("2d").drawImage(r,0,0)}finally{this.shipPass=t,i&&(this.renderer.setPixelRatio(s),this.resize(),this.render(performance.now()/1e3))}return o}renderWormhole(e){const t=this.renderer,s=t.getDrawingBufferSize(new Fe);(!this.frameCopy||this.frameCopy.image.width!==s.x||this.frameCopy.image.height!==s.y)&&(this.frameCopy?.dispose(),this.frameCopy=new en(s.x,s.y),this.frameCopy.minFilter=this.frameCopy.magFilter=Ja),t.copyFramebufferToTexture(this.frameCopy);const i=this.wormholeMaterial.uniforms;i.tFrame.value=this.frameCopy,i.uTime.value=e%1e3,i.uAspect.value=this.camera.aspect,i.uMouth.value=this.jump.mouth,i.uExit.value=this.jump.exit,i.uCharge.value=this.jump.charge,i.uFlash.value=this.jump.flash,i.uCalm.value=this.calm?1:0,t.render(this.wormholeScene,this.tonemapCamera)}rayDirection(e,t,s){const i=this.renderer.domElement.getBoundingClientRect(),r=(e-i.left)/i.width*2-1,o=-((t-i.top)/i.height)*2+1;return s.set(r,o,.5).unproject(this.camera).normalize()}project(e,t){const s=e.clone().applyMatrix4(this.camera.matrixWorldInverse);if(s.z>=0)return null;s.applyMatrix4(this.camera.projectionMatrix);const i=this.renderer.domElement.getBoundingClientRect();return t.x=i.left+(s.x+1)/2*i.width,t.y=i.top+(1-s.y)/2*i.height,t}dispose(){this.running=!1,this.resizeObserver.disconnect(),this.hdrTarget.dispose(),this.glowTarget.dispose(),this.tonemapMaterial.dispose(),this.wormholeMaterial.dispose(),this.frameCopy?.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}}const Hs=(a,e,t)=>{const s=I.clamp((t-a)/(e-a),0,1);return s*s*(3-2*s)};function Bs(a){const e=a%(2*Math.PI);return e>Math.PI?e-2*Math.PI:e<=-Math.PI?e+2*Math.PI:e}function $s(a){const e=a.clone().normalize().negate();return{yaw:Math.atan2(e.x,e.z),pitch:I.clamp(Math.asin(I.clamp(e.y,-1,1)),-1.55,1.55)}}function Pn(a,e,t,s){const i=c=>.3*Math.asinh(c/e)-Math.asinh((a-c)/t),r=I.lerp(i(0),i(a),s);let o=0,l=a;for(let c=0;c<64;c++){const u=(o+l)/2;i(u)<r?o=u:l=u}return(o+l)/2}const yt=(a,e)=>{for(;a-e>Math.PI;)a-=Math.PI*2;for(;a-e<-Math.PI;)a+=Math.PI*2;return a},Ge=3.6,_n=5,En=.8,Ln=1.1,Us=a=>a<.5?4*a*a*a:1-Math.pow(-2*a+2,3)/2;class In{focus=new M;distance=1;yaw=.6;pitch=.5;minDistance=1e-9;maxDistance=1e9;follow=null;autoRotate=0;targetLogDistance=0;yawVelocity=0;pitchVelocity=0;flight=null;keys=new Set;pointers=new Map;downAt=null;lastTap=null;lastPinch=0;dom=null;listeners;tmp=new M;disposers=[];constructor(e={}){this.listeners=e,this.targetLogDistance=Math.log(this.distance)}get isFlying(){return this.flight!==null}lastInputAt=performance.now();touched(){this.lastInputAt=performance.now(),this.listeners.onUserMove?.()}get isIdle(){return this.flight||this.keys.size>0||this.pointers.size>0||this.speedFraction>0||Math.abs(this.turnRate)>1e-4||Math.abs(this.yawVelocity)+Math.abs(this.pitchVelocity)>1e-4||Math.abs(Math.log(this.distance)-this.targetLogDistance)>.001?!1:performance.now()-this.lastInputAt>2500}get isThrusting(){for(const e of["w","a","s","d","q","e","r","f","arrowup","arrowdown","arrowleft","arrowright"])if(this.keys.has(e))return!0;return this.speedFraction>.02}get flightProgress(){return this.flight?Math.min(1,(performance.now()-this.flight.start)/this.flight.duration):1}get warpIntensity(){const e=this.flight;return!e||e.arc<1.5?0:Math.sin(Math.PI*this.flightProgress)*Math.min(1,(e.arc-1.5)/3)}attach(e){this.dom=e;const t=(r,o,l,c)=>{r.addEventListener(o,l,c),this.disposers.push(()=>r.removeEventListener(o,l))};t(e,"contextmenu",r=>r.preventDefault()),t(e,"pointerdown",r=>this.beginPointer(r)),t(e,"pointermove",r=>{const o=this.pointers.get(r.pointerId);if(!o){this.listeners.onHover?.(r.clientX,r.clientY);return}const l=r.clientX-o.x,c=r.clientY-o.y;if(this.pointers.set(r.pointerId,{x:r.clientX,y:r.clientY}),this.pointers.size===2){const d=this.pinchDistance();this.lastPinch>0&&this.zoomBy(this.lastPinch/d),this.lastPinch=d,this.pan(l/2,c/2);return}this.downAt?.button===2||r.shiftKey?this.pan(l,c):this.rotate(l,c)});const s=r=>{this.pointers.delete(r.pointerId),this.pointers.size<2&&(this.lastPinch=0);const o=this.downAt;if(o&&this.pointers.size===0){const l=Math.hypot(r.clientX-o.x,r.clientY-o.y),c=r.pointerType==="touch"?12:6;if(l<c&&performance.now()-o.time<600&&o.button===0){this.listeners.onClick?.(r.clientX,r.clientY);const u=performance.now(),d=this.lastTap,h=r.pointerType==="touch"?32:8;d&&u-d.time<350&&Math.hypot(r.clientX-d.x,r.clientY-d.y)<h?(this.lastTap=null,this.listeners.onDoubleClick?.(r.clientX,r.clientY)):this.lastTap={x:r.clientX,y:r.clientY,time:u}}this.downAt=null}};t(e,"pointerup",s),t(e,"pointercancel",s),t(e,"lostpointercapture",r=>this.forgetPointer(r.pointerId)),t(window,"blur",()=>this.forgetPointer(null));const i=()=>document.hidden&&this.forgetPointer(null);document.addEventListener("visibilitychange",i),this.disposers.push(()=>document.removeEventListener("visibilitychange",i)),t(e,"wheel",r=>{r.preventDefault();const o=r.deltaMode===1?r.deltaY*33:r.deltaY,l=Math.exp(o*.0012),c=this.listeners.rayAt?.(r.clientX,r.clientY);if(c&&!this.follow){const d=this.cameraPosition(new M).addScaledVector(c,this.distance),h=Math.exp(I.clamp(this.targetLogDistance+Math.log(l),Math.log(this.minDistance),Math.log(this.maxDistance))-this.targetLogDistance);this.focus.lerp(d,1-h)}this.zoomBy(l)},{passive:!1}),t(window,"keydown",r=>{r.target?.tagName!=="INPUT"&&(this.keys.add(r.key.toLowerCase()),this.lastInputAt=performance.now())}),t(window,"keyup",r=>this.keys.delete(r.key.toLowerCase())),t(window,"blur",()=>this.keys.clear())}attachOverlay(e){const t=r=>r instanceof Element&&!!r.closest("a, input, textarea, select, .select-text"),s=r=>{t(r.target)||r.preventDefault()},i=r=>{r.target===this.dom||r.button!==2||t(r.target)||this.beginPointer(r)};e.addEventListener("contextmenu",s),e.addEventListener("pointerdown",i,{capture:!0}),this.disposers.push(()=>{e.removeEventListener("contextmenu",s),e.removeEventListener("pointerdown",i,{capture:!0})})}forgetPointer(e){e===null?this.pointers.clear():this.pointers.delete(e),this.pointers.size<2&&(this.lastPinch=0),this.pointers.size===0&&(this.downAt=null)}beginPointer(e){const t=this.dom;if(t){this.lastInputAt=performance.now(),e.pointerType==="touch"&&e.isPrimary&&this.forgetPointer(null);try{t.setPointerCapture(e.pointerId)}catch{}this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.downAt={x:e.clientX,y:e.clientY,time:performance.now(),button:e.button},this.pointers.size===2&&(this.lastPinch=this.pinchDistance())}}dispose(){this.disposers.forEach(e=>e()),this.disposers=[]}pinchDistance(){const[e,t]=Array.from(this.pointers.values());return Math.hypot(e.x-t.x,e.y-t.y)||1}cancelFlight(){this.flight&&(this.flight=null,this.targetLogDistance=Math.log(this.distance))}rotate(e,t){this.cancelFlight(),this.yawVelocity=-e*.0045*(Math.cos(this.pitch)<0?-1:1),this.pitchVelocity=t*.0045,this.yaw+=this.yawVelocity,this.pitch=Bs(this.pitch+this.pitchVelocity),this.touched()}pan(e,t){this.cancelFlight(),this.follow=null;const s=this.dom?.clientHeight||800,i=this.distance*1.15/s,{right:r,up:o}=this.basis();this.focus.addScaledVector(r,-e*i),this.focus.addScaledVector(o,t*i),this.touched()}zoomBy(e){this.cancelFlight(),this.targetLogDistance=I.clamp(this.targetLogDistance+Math.log(e),Math.log(this.minDistance),Math.log(this.maxDistance)),this.touched()}setDistance(e){this.distance=I.clamp(e,this.minDistance,this.maxDistance),this.targetLogDistance=Math.log(this.distance)}rebase(e,t){if(this.focus.sub(e).multiplyScalar(t),this.distance*=t,this.targetLogDistance=Math.log(this.distance),this.flight){const s=this.flight;s.from.sub(e).multiplyScalar(t),s.to.sub(e).multiplyScalar(t),s.fromLogDistance+=Math.log(t),s.toLogDistance+=Math.log(t),s.cruise&&(s.cruise.fromCamera.sub(e).multiplyScalar(t),s.cruise.departScale*=t,s.cruise.arriveScale*=t)}}flightEndCamera(e,t){const s=Math.cos(e.toPitch);return t.set(s*Math.sin(e.toYaw),Math.sin(e.toPitch),s*Math.cos(e.toYaw)).multiplyScalar(Math.exp(e.toLogDistance)).add(e.to)}get flightRemaining(){const e=this.flight;return e?this.flightEndCamera(e,new M).distanceTo(this.cameraPosition(new M)):0}flyTo(e,t,s={}){const i=this.focus.distanceTo(e),r=Math.log(this.distance),o=Math.log(I.clamp(t,this.minDistance,this.maxDistance)),l=Math.max(0,Math.log(i/Math.max(this.distance,t,1e-12))*.75);let c=s.duration??I.clamp(1.2+.18*Math.abs(o-r)+.25*l,1.2,6),u=yt(s.yaw??this.yaw,this.yaw),d=s.pitch??this.pitch,h=null;const p=this.cameraPosition(new M);if(i>.5*Math.exp(o)){const g=$s(this.tmp.subVectors(e,p)),f=yt(s.yaw??g.yaw,this.yaw),v=s.pitch??g.pitch,b=Math.cos(v),S=new M(b*Math.sin(f),Math.sin(v),b*Math.cos(f)).multiplyScalar(Math.exp(o)).add(e).clone().sub(p);if(S.lengthSq()>0){const N=$s(S),T=yt(N.yaw,this.yaw);h={fromCamera:p,headYaw:T,headPitch:N.pitch,departScale:Math.max(this.distance,1e-12),arriveScale:Math.max(Math.exp(o),1e-12)},u=yt(f,T),d=v;const R=Math.hypot(T-this.yaw,N.pitch-this.pitch),k=Math.log(1+S.length()/h.arriveScale);s.duration===void 0&&(c=Math.max(1.8+.5*R,I.clamp(2+.2*k,2,7)))}}this.flight={from:this.focus.clone(),to:e.clone(),fromLogDistance:r,toLogDistance:o,arc:l,start:performance.now(),duration:c*1e3,fromYaw:this.yaw,toYaw:u,fromPitch:this.pitch,toPitch:d,cruise:h,track:s.track,onArrive:s.onArrive}}offsetDirection(e){const t=Math.cos(this.pitch);return e.set(t*Math.sin(this.yaw),Math.sin(this.pitch),t*Math.cos(this.yaw))}cameraPosition(e){return this.offsetDirection(e).multiplyScalar(this.distance).add(this.focus)}basis(){const e=this.offsetDirection(new M),t=Math.sin(this.pitch),s=new M(-t*Math.sin(this.yaw),Math.cos(this.pitch),-t*Math.cos(this.yaw)).normalize();return{right:new M().crossVectors(s,e).normalize(),up:s,back:e}}orientation(e){const{right:t,up:s,back:i}=this.basis();return e.setFromRotationMatrix(new zt().makeBasis(t,s,i))}update(e){const t=performance.now();if(this.flight){const s=this.flight,i=s.track?.();i&&s.to.copy(i);const r=Math.min(1,(t-s.start)/s.duration);if(s.cruise){const o=s.cruise,l=Hs(0,.3,r),c=Hs(.72,1,r);this.yaw=I.lerp(I.lerp(s.fromYaw,o.headYaw,l),s.toYaw,c),this.pitch=I.lerp(I.lerp(s.fromPitch,o.headPitch,l),s.toPitch,c);const u=Us(I.clamp((r-.12)/.88,0,1)),d=this.flightEndCamera(s,this.tmp),h=d.distanceTo(o.fromCamera),p=h>0?Pn(h,o.departScale,o.arriveScale,u)/h:1;d.lerpVectors(o.fromCamera,d,p),this.distance=Math.exp(I.lerp(s.fromLogDistance,s.toLogDistance,u));const g=this.offsetDirection(new M);this.focus.copy(d).addScaledVector(g,-this.distance)}else{const o=Us(r);this.focus.lerpVectors(s.from,s.to,o),this.distance=Math.exp(I.lerp(s.fromLogDistance,s.toLogDistance,o)+s.arc*Math.sin(Math.PI*o)),this.yaw=I.lerp(s.fromYaw,s.toYaw,o),this.pitch=I.lerp(s.fromPitch,s.toPitch,o)}r>=1&&(this.flight=null,this.targetLogDistance=Math.log(this.distance),s.onArrive?.())}else{const s=Math.log(this.distance),i=s+(this.targetLogDistance-s)*Math.min(1,e*10);if(this.distance=Math.exp(i),this.pointers.size===0&&(this.yaw+=this.yawVelocity,this.pitch=Bs(this.pitch+this.pitchVelocity),this.yawVelocity*=Math.pow(.02,e),this.pitchVelocity*=Math.pow(.02,e)),this.yaw+=this.autoRotate*e,this.follow){const r=this.follow();r&&this.focus.copy(r)}}this.applyKeys(e)}velocity=new M;strafe=0;climb=0;speedFraction=0;get throttleLevel(){return this.speedFraction}turnRate=0;applyKeys(e){const t=(...b)=>b.some(x=>this.keys.has(x)),s=(t("a","arrowleft")?1:0)-(t("d","arrowright")?1:0);this.turnRate+=(s*Ln-this.turnRate)*Math.min(1,e*5),Math.abs(this.turnRate)>1e-4&&(this.yaw+=this.turnRate*e,s!==0&&(this.cancelFlight(),this.touched()));const i=this.offsetDirection(new M).negate(),{right:r,up:o}=this.basis(),l=new M().addScaledVector(r,(t("e")?1:0)-(t("q")?1:0)).addScaledVector(o,(t("r")?1:0)-(t("f")?1:0)).addScaledVector(i,(t("w","arrowup")?1:0)-(t("s","arrowdown")?1:0)),c=l.lengthSq()>0,u=Ge*(t("shift")?2.5:1);c?(this.cancelFlight(),this.follow=null,this.touched()):(this.flight||this.follow)&&this.velocity.set(0,0,0);const d=c?l.normalize().multiplyScalar(u):new M,h=d.clone().sub(this.velocity),g=(!c||this.velocity.dot(d)<0?Ge/En:Ge/_n)*(t("shift")?2.5:1),f=Math.min(h.length(),g*e);f>0&&this.velocity.addScaledVector(h.normalize(),f),this.speedFraction=Math.min(1,this.velocity.length()/Ge);const v=Math.min(1,e*4);this.strafe+=(this.velocity.dot(r)/Ge-this.strafe)*v,this.climb+=(this.velocity.y/Ge-this.climb)*v,this.velocity.lengthSq()>1e-12&&this.focus.addScaledVector(this.velocity,this.distance*e)}}const Ys={crown:"M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14z","shield-star":"M12 1L3 5v6c0 5.55 3.84 10.74 9 12c5.16-1.26 9-6.45 9-12V5zm3.08 15L12 14.15L8.93 16l.81-3.5l-2.71-2.34l3.58-.31L12 6.55l1.39 3.29l3.58.31l-2.71 2.35z","star-four-points":"M12 1L9 9l-8 3l8 3l3 8l3-8l8-3l-8-3z","moon-waning-crescent":"M2 12a10 10 0 0 0 13 9.54a10 10 0 0 1 0-19.08A10 10 0 0 0 2 12","rocket-launch":"m13.16 22.19l-1.66-3.84c1.6-.58 3.07-1.35 4.43-2.27l-2.78 6.11m-7.5-9.69l-3.84-1.65l6.11-2.78a20 20 0 0 0-2.27 4.43M21.66 2.35S23.78 7.31 18.11 13c-2.2 2.17-4.58 3.5-6.73 4.34c-.74.28-1.57.1-2.12-.46l-2.13-2.13c-.56-.56-.74-1.38-.47-2.13C7.5 10.5 8.83 8.09 11 5.89C16.69.216 21.66 2.35 21.66 2.35M6.25 22H4.84l4.09-4.1c.3.21.63.36.97.45zM2 22v-1.41l4.77-4.78l1.43 1.42L3.41 22zm0-2.84v-1.41l3.65-3.65c.09.35.24.68.45.97zM16 6a2 2 0 1 0 0 4c1.11 0 2-.89 2-2a2 2 0 0 0-2-2",ufo:"M15.94 10.28C15.66 7.87 14 6 12 6s-3.66 1.87-3.94 4.28C4.5 10.82 2 12.06 2 13.5C2 15.43 6.5 17 12 17s10-1.57 10-3.5c0-1.44-2.5-2.68-6.06-3.22",atom:"M12 11a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1M4.22 4.22C5.65 2.79 8.75 3.43 12 5.56c3.25-2.13 6.35-2.77 7.78-1.34s.79 4.53-1.34 7.78c2.13 3.25 2.77 6.35 1.34 7.78s-4.53.79-7.78-1.34c-3.25 2.13-6.35 2.77-7.78 1.34S3.43 15.25 5.56 12C3.43 8.75 2.79 5.65 4.22 4.22m11.32 4.24c.61.62 1.17 1.25 1.69 1.88c1.38-2.13 1.88-3.96 1.13-4.7c-.74-.75-2.57-.25-4.7 1.13c.63.52 1.26 1.08 1.88 1.69m-7.08 7.08c-.61-.62-1.17-1.25-1.69-1.88c-1.38 2.13-1.88 3.96-1.13 4.7c.74.75 2.57.25 4.7-1.13c-.63-.52-1.26-1.08-1.88-1.69m-2.82-9.9c-.75.74-.25 2.57 1.13 4.7c.52-.63 1.08-1.26 1.69-1.88c.62-.61 1.25-1.17 1.88-1.69c-2.13-1.38-3.96-1.88-4.7-1.13m4.24 8.48c.7.7 1.42 1.34 2.12 1.91c.7-.57 1.42-1.21 2.12-1.91s1.34-1.42 1.91-2.12c-.57-.7-1.21-1.42-1.91-2.12S12.7 8.54 12 7.97c-.7.57-1.42 1.21-2.12 1.91S8.54 11.3 7.97 12c.57.7 1.21 1.42 1.91 2.12m8.48 4.24c.75-.74.25-2.57-1.13-4.7c-.52.63-1.08 1.26-1.69 1.88c-.62.61-1.25 1.17-1.88 1.69c2.13 1.38 3.96 1.88 4.7 1.13",orbit:"M8.11 1.75C9.3 1.25 10.62 1 12 1c6.08 0 11 4.92 11 11s-4.92 11-11 11S1 18.08 1 12c0-1.38.25-2.7.72-3.92a4.5 4.5 0 0 0 1.73 1.1C3.16 10.07 3 11 3 12a9 9 0 0 0 9 9a9 9 0 0 0 9-9a9 9 0 0 0-9-9c-1 0-1.93.16-2.82.45c-.22-.62-.57-1.21-1.07-1.7M4.93 2.93a2 2 0 0 1 2 2a2 2 0 0 1-2 2a2 2 0 0 1-2-2c0-1.11.89-2 2-2M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5",telescope:"m21.9 8.9l-1.7 1l-4-6.9l1.7-1zm-12.1-1l3 5.2l6.1-3.5l-3-5.2zm1.6 4.8l-2-3.5l-4.3 2.5l2 3.5zm-9.3 1.9l1 1.7l2.6-1.5l-1-1.7zm10-.6l-.3-.4l-4.3 2.5l.3.4c.2.3.5.6.8.8L7 22h2l1.4-4.3h.1L12 22h2l-1.9-5.6c.5-.7.5-1.6 0-2.4","compass-rose":"m15 9l-3-9l-3 9l-9 3l9 3l3 9l3-9l9-3zM4 12l6-2l1 2zm8 8l-2-6l2-1zm0-16l2 6l-2 1zm2 10l-1-2h7zm-5.3 3.3L5 19l1.7-3.7l1.6.5zm8.6-2L19 19l-3.7-1.7l.5-1.6zM6.7 8.7L5 5l3.7 1.7l-.5 1.5zm8.6-2L19 5l-1.7 3.7l-1.6-.5z",anchor:"M12 2a3 3 0 0 0-3 3a3 3 0 0 0 2 2.83V9H8v2h3v8.92c-.74-.13-1.5-.34-2.21-.65c-.74-.32-1.39-.71-1.97-1.18s-1.04-.98-1.38-1.54L7 15l-4-3v3c0 .97.27 1.88.82 2.72A8.2 8.2 0 0 0 6 19.95c.87.64 1.84 1.14 2.88 1.5c1.05.36 2.09.55 3.12.55s2.07-.2 3.12-.56c1.04-.36 2.01-.86 2.88-1.49c.92-.64 1.63-1.38 2.18-2.23c.55-.84.82-1.75.82-2.72v-3l-4 3l1.56 1.55c-.34.56-.8 1.07-1.38 1.54s-1.23.86-1.97 1.18c-.71.31-1.47.52-2.21.65V11h3V9h-3V7.82A3 3 0 0 0 15 5a3 3 0 0 0-3-3m0 2a1 1 0 0 1 1 1a1 1 0 0 1-1 1a1 1 0 0 1-1-1a1 1 0 0 1 1-1","diamond-stone":"M16 9h3l-5 7m-4-7h4l-2 8M5 9h3l2 7m5-12h2l2 3h-3m-5-3h2l1 3h-4M7 4h2L8 7H5m1-5L2 8l10 14L22 8l-4-6z",fire:"M17.66 11.2c-.23-.3-.51-.56-.77-.82c-.67-.6-1.43-1.03-2.07-1.66C13.33 7.26 13 4.85 13.95 3c-.95.23-1.78.75-2.49 1.32c-2.59 2.08-3.61 5.75-2.39 8.9c.04.1.08.2.08.33c0 .22-.15.42-.35.5c-.23.1-.47.04-.66-.12a.6.6 0 0 1-.14-.17c-1.13-1.43-1.31-3.48-.55-5.12C5.78 10 4.87 12.3 5 14.47c.06.5.12 1 .29 1.5c.14.6.41 1.2.71 1.73c1.08 1.73 2.95 2.97 4.96 3.22c2.14.27 4.43-.12 6.07-1.6c1.83-1.66 2.47-4.32 1.53-6.6l-.13-.26c-.21-.46-.77-1.26-.77-1.26m-3.16 6.3c-.28.24-.74.5-1.1.6c-1.12.4-2.24-.16-2.9-.82c1.19-.28 1.9-1.16 2.11-2.05c.17-.8-.15-1.46-.28-2.23c-.12-.74-.1-1.37.17-2.06c.19.38.39.76.63 1.06c.77 1 1.98 1.44 2.24 2.8c.04.14.06.28.06.43c.03.82-.33 1.72-.93 2.27",snowflake:"m20.79 13.95l-2.33.62l-2-1.13v-2.88l2-1.13l2.33.62l.52-1.93l-1.77-.47l.46-1.77l-1.93-.52l-.62 2.33l-2 1.13L13 7.38V5.12l1.71-1.71L13.29 2L12 3.29L10.71 2L9.29 3.41L11 5.12v2.26L8.5 8.82l-2-1.13l-.58-2.33L4 5.88l.47 1.77l-1.77.47l.52 1.93l2.33-.62l2 1.13v2.89l-2 1.13l-2.33-.62l-.52 1.93l1.77.47L4 18.12l1.93.52l.62-2.33l2-1.13L11 16.62v2.26l-1.71 1.71L10.71 22L12 20.71L13.29 22l1.41-1.41l-1.7-1.71v-2.26l2.5-1.45l2 1.13l.62 2.33l1.88-.51l-.47-1.77l1.77-.47zM9.5 10.56L12 9.11l2.5 1.45v2.88L12 14.89l-2.5-1.45z",leaf:"M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8",feather:"M22 2s-7.64-.37-13.66 7.88C3.72 16.21 2 22 2 22l1.94-1c1.44-2.5 2.19-3.53 3.6-5c2.53.74 5.17.65 7.46-2c-2-.56-3.6-.43-5.96-.19C11.69 12 13.5 11.6 16 12l1-2c-1.8-.34-3-.37-4.78.04C14.19 8.65 15.56 7.87 18 8l1.21-1.93c-1.56-.11-2.5.06-4.29.5c1.61-1.46 3.08-2.12 5.22-2.25c0 0 1.05-1.89 1.86-2.32",paw:"M8.35 3c1.18-.17 2.43 1.12 2.79 2.9c.36 1.77-.29 3.35-1.47 3.53c-1.17.18-2.43-1.11-2.8-2.89c-.37-1.77.3-3.35 1.48-3.54m7.15 0c1.19.19 1.85 1.77 1.5 3.54c-.38 1.78-1.63 3.07-2.81 2.89c-1.19-.18-1.84-1.76-1.47-3.53c.36-1.78 1.61-3.07 2.78-2.9M3 7.6c1.14-.49 2.69.4 3.5 1.95c.76 1.58.5 3.24-.63 3.73s-2.67-.39-3.46-1.96S1.9 8.08 3 7.6m18 0c1.1.48 1.38 2.15.59 3.72s-2.33 2.45-3.46 1.96s-1.39-2.15-.63-3.73C18.31 8 19.86 7.11 21 7.6m-1.67 10.78c.04.94-.68 1.98-1.54 2.37c-1.79.82-3.91-.88-5.9-.88s-4.13 1.77-5.89.88c-1-.49-1.69-1.79-1.56-2.87c.18-1.49 1.97-2.29 3.03-3.38c1.41-1.41 2.41-4.06 4.42-4.06c2 0 3.06 2.61 4.41 4.06c1.11 1.22 2.96 2.25 3.03 3.88",owl:"M12 16c.56.84 1.31 1.53 2.2 2L12 20.2L9.8 18c.89-.47 1.65-1.16 2.2-2m5-4.8a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m-10 0a2 2 0 0 0-2 2a2 2 0 0 0 2 2a2 2 0 0 0 2-2a2 2 0 0 0-2-2m10-2.5a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4m-10 0a4 4 0 0 1 4 4a4 4 0 0 1-4 4a4 4 0 0 1-4-4a4 4 0 0 1 4-4M2.24 1c1.76 3.7.49 6.46-.69 9.2c-.36.8-.55 1.63-.55 2.5a6 6 0 0 0 6 6c.21-.01.42-.02.63-.05l2.96 2.96L12 23l1.41-1.39l2.96-2.96c.21.03.42.04.63.05a6 6 0 0 0 6-6c0-.87-.19-1.7-.55-2.5C21.27 7.46 20 4.7 21.76 1c-2.64 2.06-6.4 3.69-9.76 3.7C8.64 4.69 4.88 3.06 2.24 1",heart:"m12 21.35l-1.45-1.32C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5c0 3.77-3.4 6.86-8.55 11.53z","chess-knight":"M19 22H5v-2h14zM13 2c-1.25 0-2.42.62-3.11 1.66L7 8l2 2l2.06-1.37c.44-.31 1.08-.19 1.39.27c.02.03.05.06.05.1c.3.59.19 1.3-.28 1.77l-4.8 4.8c-.55.56-.55 1.46.01 2.01c.26.26.62.42.99.42H17V6a4 4 0 0 0-4-4"};function oi(a){return a&&Object.prototype.hasOwnProperty.call(Ys,a)?Ys[a]:null}const Zs="http://www.w3.org/2000/svg",Fn={star:"text-[11px] text-sky-100/80 cursor-pointer pointer-events-auto",ship:"text-xs text-emerald-300 font-semibold cursor-pointer pointer-events-auto",planet:"text-xs text-emerald-100 cursor-pointer pointer-events-auto",moon:"text-[11px] text-violet-100 cursor-pointer pointer-events-auto",poi:"text-[11px] text-amber-200/90 cursor-pointer pointer-events-auto",cluster:"text-[11px] text-violet-200/90 cursor-pointer pointer-events-auto",exotic:"text-[11px] text-fuchsia-200 cursor-pointer pointer-events-auto",galaxy:"text-xs text-sky-100 cursor-pointer pointer-events-auto",hover:"text-xs text-white",selected:"text-xs text-cyan-200"},zn={star:"",ship:'<span class="inline-block w-0 h-0 -ml-[7px] -mt-[12px] absolute left-0 top-0 border-l-[7px] border-r-[7px] border-t-[12px] border-l-transparent border-r-transparent border-t-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-bounce"></span>',planet:'<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border border-emerald-300/70"></span>',moon:'<span class="inline-block w-2.5 h-2.5 -ml-[5px] -mt-[5px] absolute left-0 top-0 rounded-full border border-violet-300/80 shadow-[0_0_5px_rgba(196,181,253,0.7)]"></span>',poi:'<span class="inline-block w-2 h-2 -ml-1 -mt-1 absolute left-0 top-0 rotate-45 border border-amber-300/80"></span>',cluster:'<span class="inline-block w-4 h-4 -ml-2 -mt-2 absolute left-0 top-0 rounded-full border border-dashed border-violet-300/70"></span>',exotic:'<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border-2 border-fuchsia-300/80 shadow-[0_0_6px_rgba(240,171,252,0.8)]"></span>',galaxy:'<span class="inline-block w-5 h-5 -ml-2.5 -mt-2.5 absolute left-0 top-0 rounded-full border border-sky-200/60 border-dashed"></span>',hover:'<span class="inline-block w-6 h-6 -ml-3 -mt-3 absolute left-0 top-0 rounded-full border border-white/70"></span>',selected:'<span class="inline-block w-7 h-7 -ml-3.5 -mt-3.5 absolute left-0 top-0 rotate-45 border border-cyan-300/90 animate-pulse"></span>'};class Dn{constructor(e,t){this.wheelTarget=t,this.container=document.createElement("div"),this.container.className="absolute inset-0 pointer-events-none overflow-hidden select-none",this.container.style.touchAction="none",e.appendChild(this.container)}wheelTarget;container;labels=new Map;clickHandlers=new Map;doubleClickHandlers=new Map;rect=new DOMRect;upsert(e,t,s,i="",r,o,l=null){let c=this.labels.get(e);if(!c){const u=document.createElement("div");u.className="absolute left-0 top-0 whitespace-nowrap will-change-transform",u.style.display="none";let d=0;u.addEventListener("click",h=>{h.stopPropagation();const p=performance.now();if(p-d<350){d=0,this.doubleClickHandlers.get(e)?.();return}d=p,this.clickHandlers.get(e)?.()}),u.addEventListener("pointerdown",h=>h.stopPropagation()),u.addEventListener("wheel",h=>{h.preventDefault(),this.wheelTarget?.dispatchEvent(new WheelEvent("wheel",h))},{passive:!1}),this.container.appendChild(u),c={el:u,text:"",sub:"",kind:t,seal:null,placed:!1},this.labels.set(e,c)}if(r&&this.clickHandlers.set(e,r),o&&this.doubleClickHandlers.set(e,o),c.text!==s||c.sub!==i||c.kind!==t||c.seal!==l){c.text=s,c.sub=i,c.kind=t,c.seal=l,c.el.className=`absolute left-0 top-0 whitespace-nowrap will-change-transform ${Fn[t]}`,c.el.innerHTML=zn[t];const u=document.createElement("span");u.className="absolute left-3 -top-2 font-mono tracking-wide drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]";const d=oi(l);if(d){const h=document.createElementNS(Zs,"svg");h.setAttribute("viewBox","0 0 24 24"),h.setAttribute("class","inline-block w-3 h-3 mr-1 -mt-0.5 align-middle text-emerald-200");const p=document.createElementNS(Zs,"path");p.setAttribute("d",d),p.setAttribute("fill","currentColor"),h.appendChild(p),u.appendChild(h)}u.appendChild(document.createTextNode(s));for(const h of i.split(`
`).filter(Boolean)){const p=document.createElement("span");p.className="block text-[10px] opacity-60",p.textContent=h,u.appendChild(p)}c.el.appendChild(u)}}setFade(e){const t=e>=.999?"":e.toFixed(3);this.container.style.opacity!==t&&(this.container.style.opacity=t)}beginFrame(){this.rect=this.container.getBoundingClientRect(),this.labels.forEach(e=>e.placed=!1)}place(e,t,s,i=1){const r=this.labels.get(e);if(!r)return;const o=this.rect;r.placed=!0,r.el.style.display="block",r.el.style.opacity=String(i),r.el.style.transform=`translate(${(t-o.left).toFixed(1)}px, ${(s-o.top).toFixed(1)}px)`}endFrame(){this.labels.forEach(e=>{e.placed||(e.el.style.display="none")})}remove(e){const t=this.labels.get(e);t&&(t.el.remove(),this.labels.delete(e),this.clickHandlers.delete(e),this.doubleClickHandlers.delete(e))}removeWhere(e){Array.from(this.labels.keys()).filter(e).forEach(t=>this.remove(t))}dispose(){this.container.remove(),this.labels.clear(),this.clickHandlers.clear(),this.doubleClickHandlers.clear()}}function De(a){let e=2166136261;for(let t=0;t<a.length;t++)e^=a.charCodeAt(t),e=Math.imul(e,16777619);return Ms(e)}function Ms(a){return a^=a>>>16,a=Math.imul(a,2246822507),a^=a>>>13,a=Math.imul(a,3266489909),a^=a>>>16,a>>>0}function ri(a){return a/4294967296}function Wn(a){let e=0;for(let t=0;t<4;t++)a=Ms(a+1831565813*(t+1)),e+=ri(a);return(e-2)*Math.sqrt(3)}class Ze{state;constructor(e){this.state=e>>>0||1}next(){return this.state=Ms(this.state+2654435769>>>0),ri(this.state)}range(e,t){return e+(t-e)*this.next()}int(e,t){return Math.floor(this.range(e,t+1))}gauss(){return Wn(this.next()*4294967296>>>0)}pick(e){return e[Math.floor(this.next()*e.length)]}}const On={"Red Dwarf":[1,.45,.3],"Yellow Dwarf":[1,.93,.72],"Blue Giant":[.62,.78,1],"Red Giant":[1,.68,.4],"White Dwarf":[.92,.95,1],"Neutron Star":[.8,.65,1]},Xs=8,li=.06,ci=.17,Gn=`
  #define GLOW_FADE_FROM ${li.toFixed(3)}
  #define GLOW_FADE_TO ${ci.toFixed(3)}
  attribute vec3 iPos;
  attribute float iSize;
  attribute vec3 iColor;
  attribute float iWeight;
  uniform float uGain;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
    float dist = length(mv.xyz);
    // Sprites overlap generously so the octree grid never shows through
    float radius = iSize * 1.5;
    // Regions the camera is inside of are already resolved into stars, and sprites
    // spanning a large angle would wrap the view in haze and cost huge overdraw (deep in
    // a bulge, thousands of them stack): fade both out
    float angular = radius / max(dist, 1e-6);
    float nearFade = smoothstep(iSize * 1.5, iSize * 6.0, dist) * (1.0 - smoothstep(GLOW_FADE_FROM, GLOW_FADE_TO, angular));
    if (nearFade <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      return;
    }
    // Surface brightness (systems per unit area) does not depend on distance;
    // dividing by the sprite area keeps it independent of the overlap factor too
    vIntensity = iWeight / (radius * radius) * uGain * nearFade * uOpacity;
    vColor = iColor;
    vUv = position.xy * 2.0;
    mv.xy += position.xy * radius * 2.0;
    gl_Position = projectionMatrix * mv;
  }
`,qn=`
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    float falloff = exp(-r2 * 3.0) - 0.0498;
    gl_FragColor = vec4(vColor * vIntensity * falloff, 1.0);
  }
`,Vn=`
  attribute vec3 color;
  attribute float lum;
  attribute float weight;
  // Morph from the previous LOD: a point that was already on screen (same system) slides
  // from where and how bright it was; new points fade in, retired ones are drawn by the
  // new LOD instead
  attribute vec3 prevPosition;
  attribute float prevWeight;
  attribute float prevAlpha;
  attribute float matched;
  attribute float retired;
  uniform float uMorph;
  uniform float uPixelRatio;
  uniform float uOpacity;
  // Sparse galaxies (a few hundred systems) would be invisible from afar: lift them
  uniform float uFluxScale;
  uniform vec3 uHidePos;
  uniform float uHideRadius;
  uniform float uHideAmount;
  uniform vec3 uHighlightPos;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;

  void main() {
    if (retired > 0.5) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      gl_PointSize = 0.0;
      return;
    }
    vec3 p = matched > 0.5 ? mix(prevPosition, position, uMorph) : position;
    float w = matched > 0.5 ? exp(mix(log(prevWeight), log(weight), uMorph)) : weight;
    float appear = matched > 0.5 ? mix(prevAlpha, 1.0, uMorph) : uMorph;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float d = max(length(mv.xyz), 1e-9);
    // Apparent brightness from the light of every system the point stands for
    float flux = lum * w * uFluxScale / (d * d);
    float m = clamp((log(flux) / 2.302585 + 7.5) / 7.0, 0.0, 1.0);
    float size = mix(1.2, 5.0, m * m * m);
    // Very close stars (a light year or less) bloom into a glare. Only the light of one
    // star counts here: a point standing for a whole region must not bloom
    float single = lum * uFluxScale / (d * d);
    float glare = clamp(log(single) / 2.302585 + 0.5, 0.0, 3.5);
    size += glare * 6.0;
    // Faint points (sparse halo regions seen from afar) fade out instead of speckling
    vAlpha = smoothstep(0.1, 0.75, m) * appear * uOpacity;
    vCore = glare / 3.5;
    vColor = color;

    if (uHideRadius > 0.0 && distance(p, uHidePos) < uHideRadius) {
      // The star system drawn up close takes over from this point as we approach
      if (uHideAmount >= 0.999) {
        gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
        gl_PointSize = 0.0;
        return;
      }
      vAlpha *= 1.0 - uHideAmount;
    }
    if (distance(position, uHighlightPos) < 1e-5) {
      size = max(size, 9.0);
      vAlpha = max(vAlpha, 0.9);
    }
    gl_PointSize = size * uPixelRatio;
    gl_Position = projectionMatrix * mv;
  }
`,Hn=`
  // Compensates eye adaptation so stars stay crisp inside bright regions
  uniform float uStarBoost;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vCore;

  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    float core = exp(-r * r * 10.0);
    float halo = exp(-r * 4.0) * 0.35;
    vec3 tint = mix(vColor, vec3(1.0), core * 0.6 + vCore * 0.4);
    gl_FragColor = vec4(tint * (core + halo) * vAlpha * 2.2 * uStarBoost, 1.0);
  }
`;function Bn(){if(new URL(import.meta.url).origin!==window.location.origin){const a=new URL("data:video/mp2t;base64,Ly8gYXRsYXMtdWkvcmVhY3Qvc3RhdGljL2pzL0V4cGxvcmUvZ2FsYXh5L2dhbGF4eS53b3JrZXIudHMKLy8KLy8gT3ducyB0aGUgZ2FsYXh5IG1vZGVsIGFuZCBpdHMgb2N0cmVlIHRhYmxlcy4gVGhlIG1haW4gdGhyZWFkIG9ubHkgc2VuZHMgY2FtZXJhCi8vIHVwZGF0ZXMgYW5kIHJlY2VpdmVzIHJlYWR5LXRvLXVwbG9hZCB0eXBlZCBhcnJheXMuCgppbXBvcnQgeyBHYWxheHlNb2RlbCwgdHlwZSBHYWxheHlJbmZvLCB0eXBlIFBvaW50T2ZJbnRlcmVzdCB9IGZyb20gIi4vR2FsYXh5TW9kZWwudHMiOwppbXBvcnQgeyBTcGF0aWFsSW5kZXggfSBmcm9tICIuL1NwYXRpYWxJbmRleC50cyI7CmltcG9ydCB7IEdhbGF4eUxvZCwgdHlwZSBMb2RSZXF1ZXN0LCB0eXBlIExvZFJlc3VsdCB9IGZyb20gIi4vR2FsYXh5TG9kLnRzIjsKCmV4cG9ydCB0eXBlIFdvcmtlclJlcXVlc3QgPQogIHwgeyB0eXBlOiAiaW5pdCI7IGluZm86IEdhbGF4eUluZm8gfQogIHwgeyB0eXBlOiAibG9kIjsgcmVxdWVzdDogTG9kUmVxdWVzdCB9CiAgfCB7IHR5cGU6ICJsb2NhdGUiOyBpZDogbnVtYmVyOyBpbmRleDogbnVtYmVyIH0KICB8IHsgdHlwZTogImxlYWYiOyBpZDogbnVtYmVyOyBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyLCBudW1iZXJdOyBudW1TeXN0ZW1zOiBudW1iZXIgfTsKCmV4cG9ydCB0eXBlIFdvcmtlclJlc3BvbnNlID0KICB8IHsgdHlwZTogInJlYWR5IjsgcG9pczogUG9pbnRPZkludGVyZXN0W107IHJhZGl1czogbnVtYmVyOyBoYWxmU2l6ZTogbnVtYmVyOyBnYWxheHlUeXBlOiBzdHJpbmcgfQogIHwgeyB0eXBlOiAibG9kIjsgcmVzdWx0OiBMb2RSZXN1bHQ7IGNvYXJzZTogYm9vbGVhbiB9CiAgfCB7IHR5cGU6ICJsb2NhdGVkIjsgaWQ6IG51bWJlcjsgaW5kZXg6IG51bWJlcjsgcG9zaXRpb246IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB9CiAgfCB7IHR5cGU6ICJsZWFmIjsgaWQ6IG51bWJlcjsgaW5kaWNlczogbnVtYmVyW10gfTsKCmxldCBsb2Q6IEdhbGF4eUxvZCB8IG51bGwgPSBudWxsOwpsZXQgaW5kZXg6IFNwYXRpYWxJbmRleCB8IG51bGwgPSBudWxsOwpsZXQgcGVuZGluZzogTG9kUmVxdWVzdCB8IG51bGwgPSBudWxsOwpsZXQgc2NoZWR1bGVkID0gZmFsc2U7CmxldCBmaXJzdFJ1biA9IHRydWU7Cgpjb25zdCBjdHggPSBzZWxmIGFzIHVua25vd24gYXMgewogIHBvc3RNZXNzYWdlOiAobWVzc2FnZTogV29ya2VyUmVzcG9uc2UsIHRyYW5zZmVyPzogVHJhbnNmZXJhYmxlW10pID0+IHZvaWQ7CiAgb25tZXNzYWdlOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQ8V29ya2VyUmVxdWVzdD4pID0+IHZvaWQpIHwgbnVsbDsKfTsKCmZ1bmN0aW9uIHRyYW5zZmVyYWJsZXMocmVzdWx0OiBMb2RSZXN1bHQpOiBUcmFuc2ZlcmFibGVbXSB7CiAgcmV0dXJuIFtyZXN1bHQuZ2xvd1Bvc2l0aW9ucy5idWZmZXIsIHJlc3VsdC5nbG93U2l6ZXMuYnVmZmVyLCByZXN1bHQuZ2xvd0NvbG9ycy5idWZmZXIsIHJlc3VsdC5nbG93V2VpZ2h0cy5idWZmZXIsIHJlc3VsdC5zdGFyUG9zaXRpb25zLmJ1ZmZlciwgcmVzdWx0LnN0YXJDb2xvcnMuYnVmZmVyLCByZXN1bHQuc3RhclNpemVzLmJ1ZmZlciwgcmVzdWx0LnN0YXJXZWlnaHRzLmJ1ZmZlciwgcmVzdWx0LnN0YXJJbmRpY2VzLmJ1ZmZlciwgcmVzdWx0LnN0YXJFeGFjdC5idWZmZXIsIHJlc3VsdC5zdGFyQW5jZXN0b3JzLmJ1ZmZlcl07Cn0KCmZ1bmN0aW9uIHByb2Nlc3NQZW5kaW5nKCkgewogIHNjaGVkdWxlZCA9IGZhbHNlOwogIGlmICghcGVuZGluZyB8fCAhbG9kKSByZXR1cm47CiAgY29uc3QgcmVxdWVzdCA9IHBlbmRpbmc7CiAgcGVuZGluZyA9IG51bGw7CgogIGlmIChmaXJzdFJ1bikgewogICAgLy8gQSBjaGVhcCBmaXJzdCBwYXNzIHNvIHNvbWV0aGluZyBzaG93cyB1cCB3aGlsZSB0aGUgZnVsbCB0YWJsZXMgYXJlIGJlaW5nIGJ1aWx0CiAgICBmaXJzdFJ1biA9IGZhbHNlOwogICAgY29uc3QgY29hcnNlID0gbG9kLnJ1bih7IC4uLnJlcXVlc3QsIG1heE5vZGVzOiBNYXRoLm1pbihyZXF1ZXN0Lm1heE5vZGVzLCA0MDAwKSwgbWF4U3RhcnM6IE1hdGgubWluKHJlcXVlc3QubWF4U3RhcnMsIDMwMDApIH0pOwogICAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvZCIsIHJlc3VsdDogY29hcnNlLCBjb2Fyc2U6IHRydWUgfSwgdHJhbnNmZXJhYmxlcyhjb2Fyc2UpKTsKICB9CgogIGNvbnN0IHJlc3VsdCA9IGxvZC5ydW4ocmVxdWVzdCk7CiAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvZCIsIHJlc3VsdCwgY29hcnNlOiBmYWxzZSB9LCB0cmFuc2ZlcmFibGVzKHJlc3VsdCkpOwp9CgpjdHgub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7CiAgY29uc3QgbWVzc2FnZSA9IGV2ZW50LmRhdGE7CiAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHsKICAgIGNhc2UgImluaXQiOiB7CiAgICAgIGNvbnN0IG1vZGVsID0gbmV3IEdhbGF4eU1vZGVsKG1lc3NhZ2UuaW5mbyk7CiAgICAgIGluZGV4ID0gbmV3IFNwYXRpYWxJbmRleChtb2RlbCk7CiAgICAgIGxvZCA9IG5ldyBHYWxheHlMb2QoaW5kZXgpOwogICAgICBmaXJzdFJ1biA9IHRydWU7CiAgICAgIGN0eC5wb3N0TWVzc2FnZSh7IHR5cGU6ICJyZWFkeSIsIHBvaXM6IG1vZGVsLnBvaXMsIHJhZGl1czogbW9kZWwucmFkaXVzLCBoYWxmU2l6ZTogbW9kZWwuaGFsZlNpemUsIGdhbGF4eVR5cGU6IG1vZGVsLnR5cGUgfSk7CiAgICAgIGJyZWFrOwogICAgfQogICAgY2FzZSAibG9kIjogewogICAgICAvLyBPbmx5IHRoZSBsYXRlc3QgY2FtZXJhIG1hdHRlcnM6IGNvYWxlc2NlIGJ1cnN0cyBvZiByZXF1ZXN0cwogICAgICBwZW5kaW5nID0gbWVzc2FnZS5yZXF1ZXN0OwogICAgICBpZiAoIXNjaGVkdWxlZCkgewogICAgICAgIHNjaGVkdWxlZCA9IHRydWU7CiAgICAgICAgc2V0VGltZW91dChwcm9jZXNzUGVuZGluZywgMCk7CiAgICAgIH0KICAgICAgYnJlYWs7CiAgICB9CiAgICBjYXNlICJsb2NhdGUiOiB7CiAgICAgIGlmICghaW5kZXgpIHJldHVybjsKICAgICAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvY2F0ZWQiLCBpZDogbWVzc2FnZS5pZCwgaW5kZXg6IG1lc3NhZ2UuaW5kZXgsIHBvc2l0aW9uOiBpbmRleC5sb2NhdGUobWVzc2FnZS5pbmRleCkgfSk7CiAgICAgIGJyZWFrOwogICAgfQogICAgY2FzZSAibGVhZiI6IHsKICAgICAgaWYgKCFpbmRleCkgcmV0dXJuOwogICAgICBjb25zdCBbeCwgeSwgel0gPSBtZXNzYWdlLnBvc2l0aW9uOwogICAgICBjdHgucG9zdE1lc3NhZ2UoeyB0eXBlOiAibGVhZiIsIGlkOiBtZXNzYWdlLmlkLCBpbmRpY2VzOiBpbmRleC5zeXN0ZW1zSW5MZWFmKHgsIHksIHosIG1lc3NhZ2UubnVtU3lzdGVtcykgfSk7CiAgICAgIGJyZWFrOwogICAgfQogIH0KfTsK",import.meta.url).href,e=new Blob([`import ${JSON.stringify(a)};`],{type:"text/javascript"});return new Worker(URL.createObjectURL(e),{type:"module"})}return new Worker(new URL("/atlas-ui/react/dist/assets/galaxy.worker-CuXA35KQ.js",import.meta.url),{type:"module"})}const Js=.45,Bt=a=>a*a*(3-2*a);class $n{info;root=new se;radius=5e4;pois=[];worker;current=null;fading=[];requestId=0;inFlight=!1;lastRequestCamera=new M(1/0,0,0);lastRequestForward=new M;lastRequestTime=0;callbacks=new Map;events;ready=!1;glowGain=1;hidePosition=null;hideAmount=1;highlightPosition=null;realStarTypes=new Map;numSystems;fluxScale;budget={maxNodes:36e3,maxStars:45e3,splitAngle:.018};setBudget(e){this.budget=e,this.lastRequestTime=0,this.lastRequestCamera.set(1/0,0,0)}constructor(e,t={}){this.info=e,this.events=t,this.numSystems=e.num_systems,this.fluxScale=Math.max(1,Math.sqrt(1e9/Math.max(1,e.num_systems))),this.worker=Bn(),this.worker.onmessage=s=>this.handle(s.data),this.post({type:"init",info:e})}post(e){this.worker.postMessage(e)}handle(e){switch(e.type){case"ready":{this.ready=!0,this.pois=e.pois,this.radius=e.radius;const t=Math.max(this.numSystems,1)/(Math.PI*this.radius*this.radius);this.glowGain=.32/t,this.events.onReady?.(e.pois,e.radius);break}case"lod":e.coarse||(this.inFlight=!1),this.install(e.result),this.events.onLod?.(e.result,e.coarse);break;case"located":case"leaf":{const t=this.callbacks.get(e.id);t&&(this.callbacks.delete(e.id),t(e.type==="located"?e.position:e.indices));break}}}locate(e){const t=++this.requestId;return new Promise(s=>{this.callbacks.set(t,i=>s(new M(i[0],i[1],i[2]))),this.post({type:"locate",id:t,index:e})})}systemsAt(e){const t=++this.requestId;return new Promise(s=>{this.callbacks.set(t,s),this.post({type:"leaf",id:t,position:[e.x,e.y,e.z],numSystems:this.numSystems})})}maybeRequest(e,t,s,i,r,o,l=!1){if(!this.ready||this.inFlight)return;const c=performance.now(),u=e.distanceTo(this.lastRequestCamera),d=t.angleTo(this.lastRequestForward),h=Math.max(s,1e-4)*.12;!l&&u<h&&d<.2&&this.lastRequestTime>0||!l&&c-this.lastRequestTime<90||(this.inFlight=!0,this.lastRequestTime=c,this.lastRequestCamera.copy(e),this.lastRequestForward.copy(t),this.post({type:"lod",request:{id:++this.requestId,camera:[e.x,e.y,e.z],forward:[t.x,t.y,t.z],fovY:i,aspect:r,viewportHeight:o,numSystems:this.numSystems,origin:[e.x,e.y,e.z],maxNodes:this.budget.maxNodes,maxStars:this.budget.maxStars,splitAngle:this.budget.splitAngle}}))}measureExposure(e,t){const s=this.current;if(!s)return;const i=s.result,r=48,o=30,l=this.brightnessGrid;l.fill(0);const c=t.matrixWorldInverse.elements,u=t.projectionMatrix.elements,d=s.origin.x-e.x,h=s.origin.y-e.y,p=s.origin.z-e.z,g=2/u[5]/o*1;for(let x=0;x<i.glowCount;x++){const S=i.glowPositions[x*3]+d,N=i.glowPositions[x*3+1]+h,T=i.glowPositions[x*3+2]+p,R=c[2]*S+c[6]*N+c[10]*T;if(R>=0)continue;const k=Math.sqrt(S*S+N*N+T*T),C=i.glowSizes[x],E=C*1.5,j=E/k,_=(1-I.smoothstep(j,li,ci))*I.smoothstep(k,C*1.5,C*6);if(_<=0)continue;const z=c[0]*S+c[4]*N+c[8]*T,A=c[1]*S+c[5]*N+c[9]*T,L=(u[0]*z/-R+1)*.5*r,V=(u[5]*A/-R+1)*.5*o,F=i.glowWeights[x]/(E*E)*this.glowGain*_,q=Math.max(.5,j/g),Q=F*.267*Math.PI*q*q/Math.max(1,Math.PI*q*q),ie=Math.max(0,Math.floor(L-q)),ce=Math.min(r-1,Math.floor(L+q)),Re=Math.max(0,Math.floor(V-q)),Oe=Math.min(o-1,Math.floor(V+q));for(let U=Re;U<=Oe;U++)for(let G=ie;G<=ce;G++)l[U*r+G]+=Q}let f=0;for(let x=0;x<l.length;x++)f=Math.max(f,l[x]);const v=Array.from(l).filter(x=>x>f*.01).sort((x,S)=>x-S),b=v.length?v[Math.floor(v.length/2)]:0;this.targetExposure=I.clamp(.35/Math.max(b,1e-6),.01,1.6)}targetExposure=1;brightnessGrid=new Float32Array(1440);install(e){const t=new se,s=new M(...e.origin),i=new Ce(1,1),r=new tn;r.index=i.index,r.setAttribute("position",i.getAttribute("position")),r.setAttribute("iPos",new vt(e.glowPositions,3)),r.setAttribute("iSize",new vt(e.glowSizes,1)),r.setAttribute("iColor",new vt(e.glowColors,3)),r.setAttribute("iWeight",new vt(e.glowWeights,1)),r.instanceCount=e.glowCount;const o=new $({uniforms:{uGain:{value:this.glowGain},uOpacity:{value:0}},vertexShader:Gn,fragmentShader:qn,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0}),l=new D(r,o);l.frustumCulled=!1,l.layers.set(ni),t.add(l);const c=new Map;for(let R=0;R<e.starCount;R++){const k=e.starIndices[R];c.set(k,R);const C=this.realStarTypes.get(k);C&&this.writeStarColor(e.starColors,R,C)}const u=new de;u.setAttribute("position",new te(e.starPositions,3));const d=new te(e.starColors,3);u.setAttribute("color",d),u.setAttribute("lum",new te(e.starSizes,1)),u.setAttribute("weight",new te(e.starWeights,1));const h=e.starCount,p=new Float32Array(h*3),g=new Float32Array(h).fill(1),f=new Float32Array(h),v=new Float32Array(h),b=new Float32Array(h),x=this.current;if(x){const R=Bt(x.morph),k=x.result,C=x.origin.x-s.x,E=x.origin.y-s.y,j=x.origin.z-s.z,_=(A,L)=>{const V=x.matched[A]>0;for(let F=0;F<3;F++){const q=k.starPositions[A*3+F];p[L*3+F]=(V?x.prevPositions[A*3+F]+(q-x.prevPositions[A*3+F])*R:q)+(F===0?C:F===1?E:j)}},z=new Uint8Array(k.starCount);for(let A=0;A<h;A++){const L=x.indexToSlot.get(e.starIndices[A]);if(L===void 0||x.retired[L])continue;const V=x.matched[L]>0;_(L,A),g[A]=V?Math.exp(Math.log(x.prevWeights[L])+(Math.log(k.starWeights[L])-Math.log(x.prevWeights[L]))*R):k.starWeights[L],f[A]=V?x.prevAlphas[L]+(1-x.prevAlphas[L])*R:R,v[A]=1,z[L]=1}for(let A=0;A<h;A++)if(!v[A])for(let L=0;L<Xs;L++){const V=e.starAncestors[A*Xs+L];if(V<0)break;const F=x.indexToSlot.get(V);if(!(F===void 0||x.retired[F])){_(F,A),g[A]=e.starWeights[A],f[A]=0,v[A]=1;break}}for(let A=0;A<k.starCount;A++)z[A]&&(x.retired[A]=1);x.retiredAttribute.needsUpdate=!0}u.setAttribute("prevPosition",new te(p,3)),u.setAttribute("prevWeight",new te(g,1)),u.setAttribute("prevAlpha",new te(f,1)),u.setAttribute("matched",new te(v,1));const S=new te(b,1);u.setAttribute("retired",S);const N=new $({uniforms:{uMorph:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uStarBoost:{value:1},uFluxScale:{value:this.fluxScale},uHidePos:{value:new M},uHideRadius:{value:0},uHideAmount:{value:1},uHighlightPos:{value:new M(1e9,1e9,1e9)}},vertexShader:Vn,fragmentShader:Hn,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0}),T=new Te(u,N);T.frustumCulled=!1,t.add(T),x&&(x.retiring=!0,this.fading.push(x)),this.current={result:e,origin:s,group:t,glowMaterial:o,starMaterial:N,morph:0,fade:1,retiring:!1,colorAttribute:d,indexToSlot:c,prevPositions:p,prevWeights:g,prevAlphas:f,matched:v,retired:b,retiredAttribute:S},this.root.add(t)}writeStarColor(e,t,s){const i=On[s];i&&(e[t*3]=i[0],e[t*3+1]=i[1],e[t*3+2]=i[2])}setRealStarType(e,t){this.realStarTypes.set(e,t);const s=this.current;if(!s)return;const i=s.indexToSlot.get(e);i!==void 0&&(this.writeStarColor(s.result.starColors,i,t),s.colorAttribute.needsUpdate=!0)}setHidden(e,t=1){this.hidePosition=e?e.clone():null,this.hideAmount=t}setHighlight(e){this.highlightPosition=e?e.clone():null}hideHighlightOnce(){for(const e of this.current?[...this.fading,this.current]:this.fading)e.starMaterial.uniforms.uHighlightPos.value.set(1e9,1e9,1e9)}update(e,t,s,i=1){const r=this.current?[...this.fading,this.current]:this.fading,o=Math.min(5,Math.pow(1/Math.max(i,.001),.6));for(const l of r){l.starMaterial.uniforms.uStarBoost.value=o,l.retiring?l.fade=Math.max(0,l.fade-e/Js):l.morph=Math.min(1,l.morph+e/Js);const c=Bt(l.morph),u=Bt(l.fade);l.group.position.set(l.origin.x-t.x,l.origin.y-t.y,l.origin.z-t.z),l.glowMaterial.uniforms.uOpacity.value=c*u,l.starMaterial.uniforms.uMorph.value=c,l.starMaterial.uniforms.uOpacity.value=u,l.starMaterial.uniforms.uPixelRatio.value=s,this.hidePosition?(l.starMaterial.uniforms.uHidePos.value.copy(this.hidePosition).sub(l.origin),l.starMaterial.uniforms.uHideRadius.value=.002,l.starMaterial.uniforms.uHideAmount.value=this.hideAmount):l.starMaterial.uniforms.uHideRadius.value=0,this.highlightPosition?l.starMaterial.uniforms.uHighlightPos.value.copy(this.highlightPosition).sub(l.origin):l.starMaterial.uniforms.uHighlightPos.value.set(1e9,1e9,1e9)}this.fading=this.fading.filter(l=>l.fade>0?!0:(this.root.remove(l.group),l.group.traverse(c=>{const u=c;u.geometry?.dispose(),u.material?.dispose?.()}),!1))}pick(e,t,s,i,r,o=14){const l=this.current;if(!l)return null;const c=r.getBoundingClientRect(),u=l.result,d=i.matrixWorldInverse.elements,h=i.projectionMatrix.elements,p=l.origin.x-s.x,g=l.origin.y-s.y,f=l.origin.z-s.z;let v=-1,b=-1/0,x={x:0,y:0},S=0;for(let N=0;N<u.starCount;N++){const T=u.starPositions[N*3]+p,R=u.starPositions[N*3+1]+g,k=u.starPositions[N*3+2]+f,C=d[0]*T+d[4]*R+d[8]*k,E=d[1]*T+d[5]*R+d[9]*k,j=d[2]*T+d[6]*R+d[10]*k;if(j>=0)continue;const _=c.left+(h[0]*C/-j+1)*.5*c.width,z=c.top+(1-(h[5]*E/-j+1)*.5)*c.height,A=_-e,L=z-t,V=A*A+L*L;if(V>o*o)continue;const F=Math.sqrt(T*T+R*R+k*k),q=u.starSizes[N]*u.starWeights[N]*this.fluxScale/(F*F),Q=Math.min(1,Math.max(0,(Math.log10(q)+7.5)/7));if(Q<.12)continue;const ie=Q*2-Math.sqrt(V)/o;ie>b&&(b=ie,v=N,x={x:_,y:z},S=Q)}return v<0?null:{index:u.starIndices[v],position:new M(u.starPositions[v*3]+l.origin.x,u.starPositions[v*3+1]+l.origin.y,u.starPositions[v*3+2]+l.origin.z),exact:u.starExact[v]===1,screen:x,apparent:S}}visibleStars(e,t,s){const i=this.current;if(!i)return[];const r=i.result,o=[];for(let l=0;l<r.starCount;l++){if(r.starWeights[l]!==1)continue;const c=r.starPositions[l*3]+i.origin.x,u=r.starPositions[l*3+1]+i.origin.y,d=r.starPositions[l*3+2]+i.origin.z,h=Math.hypot(c-e.x,u-e.y,d-e.z);h>s||o.push({index:r.starIndices[l],position:new M(c,u,d),distance:h})}return o.sort((l,c)=>l.distance-c.distance),o.slice(0,t)}dispose(){this.worker.terminate();for(const e of[...this.fading,...this.current?[this.current]:[]])e.group.traverse(t=>{const s=t;s.geometry?.dispose(),s.material?.dispose?.()});this.root.clear()}}function Un(a,e){return a==="Spiral"?e.range(32e3,6e4):a==="Elliptical"?e.range(28e3,75e3):a==="Dwarf"?e.range(3500,9e3):2e3}function Yn(a){const e=a.galaxy_type;return Un(e==="Spiral"||e==="Elliptical"||e==="Dwarf"?e:"Void",new Ze(De(`${a.spatial_seed}:${a.coordinates.join(",")}`)))}function Zn(a,e){const t=new W(e);switch(a){case"Red Giant":return{color:t,cells:7,spots:.25,churn:.25,smooth:0,corona:1.6,temperature:3800};case"Blue Giant":return{color:t,cells:70,spots:0,churn:1.6,smooth:.15,corona:2.6,temperature:25e3};case"White Dwarf":return{color:t,cells:140,spots:0,churn:.4,smooth:.8,corona:1.8,temperature:12e3};case"Neutron Star":return{color:new W(12573951),cells:200,spots:0,churn:.2,smooth:1,corona:4,temperature:6e5};case"Red Dwarf":return{color:t,cells:34,spots:.85,churn:.8,smooth:0,corona:1.7,temperature:3200};default:return{color:t.clone().lerp(new W(16762977),.6),cells:46,spots:.55,churn:1,smooth:0,corona:2,temperature:5800}}}const Xn=`
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vObj = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`,Jn=`
${Me}
uniform float uTime;
uniform vec3 uColor;
uniform float uCells;
uniform float uSpots;
uniform float uChurn;
uniform float uSmooth;
uniform vec3 uSeed;
varying vec3 vObj;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec3 p = normalize(vObj);
  float mu = max(dot(normalize(vNormal), normalize(vView)), 0.0);
  float t = uTime * 0.02 * uChurn;
  // Granulation: rounded cells, brightest where the hot gas wells up in the middle,
  // ringed by narrow, ragged dark lanes where it sinks; slowly renewing
  vec3 g = p * uCells + uSeed + vec3(t, -t * 0.7, t * 0.4);
  vec3 warp = vec3(snoise(g * 0.45 + t), snoise(g * 0.45 - t + 7.0), snoise(g * 0.45 + 13.0));
  vec3 cells = cellular(g + 0.6 * warp);
  float edge = cells.y - cells.x + 0.12 * snoise(g * 2.3);
  float lanes = smoothstep(0.02, 0.32, edge);
  float dome = 1.0 - smoothstep(0.0, 0.9, cells.x);
  float granule = 0.66 + 0.2 * lanes + 0.16 * dome + 0.06 * (fract(cells.z * 7.3) - 0.5);
  // Supergranulation and a faint mottling over the whole disc
  float super = fbmN(p * uCells * 0.18 + uSeed * 0.3 + vec3(t * 0.3), 4.0);
  float shade = mix(granule * (0.92 + 0.12 * super), 1.0, uSmooth);
  // Sunspots in belts either side of the equator: dark umbra, lighter penumbra
  float belt = smoothstep(0.55, 0.25, abs(abs(p.y) - 0.28));
  float spotField = fbmN(p * 3.2 + uSeed + vec3(0.0, 0.0, uTime * 0.0015), 5.0);
  float penumbra = smoothstep(0.42, 0.52, spotField) * belt * uSpots;
  float umbra = smoothstep(0.55, 0.62, spotField) * belt * uSpots;
  shade *= 1.0 - 0.45 * penumbra - 0.45 * umbra;
  // Faculae: bright patches that show near the limb
  float faculae = smoothstep(0.35, 0.6, fbmN(p * 9.0 + uSeed + 3.0, 4.0)) * (1.0 - mu) * (1.0 - uSmooth) * 0.5;
  // Limb darkening (quadratic law), redder towards the edge
  float limb = 1.0 - 0.55 * (1.0 - mu) - 0.2 * (1.0 - mu) * (1.0 - mu);
  vec3 color = uColor * mix(vec3(1.0), vec3(1.0, 0.62, 0.38), (1.0 - mu) * 0.7 * (1.0 - uSmooth));
  // (bright, but kept below the tonemapper's shoulder so the surface still reads)
  color *= shade * limb * 1.05 + faculae;
  // The hottest stars burn towards white
  color = mix(color, vec3(1.0), uSmooth * 0.35);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Kn=`
uniform float uR;
uniform float uSize;
uniform mat3 uSpin;
varying vec2 vP;
varying float vSilhouette;
varying vec3 vDir;
varying vec3 vToCamera;
void main() {
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float d = length(mv.xyz);
  vSilhouette = uR * d / sqrt(max(d * d - uR * uR, 1e-12));
  vP = position.xy * uR * uSize;
  mv.xy += vP;
  // The sheet's point as a direction in world space, then in the star's turning frame
  mat3 viewToWorld = transpose(mat3(viewMatrix));
  vDir = uSpin * (viewToWorld * vec3(position.xy, 0.0));
  vToCamera = uSpin * (viewToWorld * vec3(0.0, 0.0, 1.0));
  gl_Position = projectionMatrix * mv;
}
`,Qn=`
${Me}
uniform float uTime;
uniform vec3 uColor;
uniform float uSmooth;
uniform float uOpacity;
uniform vec3 uSeed;
uniform float uSize;
varying vec2 vP;
varying float vSilhouette;
varying vec3 vDir;
varying vec3 vToCamera;
void main() {
  float x = length(vP) / vSilhouette;
  if (x < 0.99) discard;
  // Where on the star this ray of corona rises from: the direction across the sky,
  // tilted a little towards the camera the further out it is (a ray leaning towards us
  // is seen projected further from the limb)
  vec3 across = normalize(vDir);
  vec3 dir = normalize(across + normalize(vToCamera) * 0.35 * (1.0 - 1.0 / x));
  float latitude = abs(dir.y);
  // Streamers fixed on the star: broad helmets near the equator, fine plumes at the poles
  float helmets = 0.5 + 0.5 * snoise(dir * 2.2 + uSeed * 0.1 + vec3(0.0, 0.0, uTime * 0.008));
  float fine = 0.5 + 0.5 * snoise(dir * 9.0 + uSeed * 0.2 + vec3(uTime * 0.015));
  float equator = 1.0 - smoothstep(0.15, 0.7, latitude);
  float reach = mix(1.0 + 0.9 * fine, 1.0 + 3.2 * helmets, equator);
  float strength = mix(0.35 + 0.65 * pow(fine, 2.0), 0.4 + 0.6 * helmets, equator);
  float fall = exp(-(x - 1.0) * (3.6 / reach));
  float chromosphere = exp(-(x - 1.0) * 40.0);
  vec3 tint = mix(uColor, vec3(0.65, 0.8, 1.0), uSmooth);
  // Gone well before the edge of the sheet, so the longest streamers never end in a cut
  float edge = 1.0 - smoothstep(uSize * 0.55, uSize * 0.95, x);
  vec3 color = tint * (fall * 0.6 * strength + chromosphere * 0.9) * uOpacity * edge;
  gl_FragColor = vec4(color, 1.0);
}
`;class _t{surface;corona;coronaMaterial;spin=new zt;static spinAt(e){return e*.01%(Math.PI*2)}constructor(e,t,s){const i=o=>{const l=Math.sin(s*12.9898+o*78.233)*43758.5453;return l-Math.floor(l)},r=new M(i(1)*50,i(2)*50,i(3)*50);this.surface=new $({uniforms:{uTime:{value:0},uColor:{value:e.color.clone()},uCells:{value:e.cells},uSpots:{value:e.spots},uChurn:{value:e.churn},uSmooth:{value:e.smooth},uSeed:{value:r},uOctaves:{value:5}},vertexShader:Xn,fragmentShader:Jn}),this.coronaMaterial=new $({uniforms:{uTime:{value:0},uColor:{value:e.color.clone()},uSmooth:{value:e.smooth},uOpacity:{value:0},uSeed:{value:r},uR:{value:t},uSize:{value:e.corona*1.6+3},uSpin:{value:new Ka},uOctaves:{value:3}},vertexShader:Kn,fragmentShader:Qn,blending:Z,transparent:!0,depthWrite:!1}),this.corona=new D(new Ce(2,2),this.coronaMaterial),this.corona.frustumCulled=!1}update(e,t){this.surface.uniforms.uTime.value=e,this.coronaMaterial.uniforms.uTime.value=e,this.coronaMaterial.uniforms.uSpin.value.setFromMatrix4(this.spin.makeRotationY(-_t.spinAt(e))),this.coronaMaterial.uniforms.uOpacity.value=t,this.corona.visible=t>.01}dispose(){this.surface.dispose(),this.coronaMaterial.dispose(),this.corona.geometry.dispose()}}const eo=a=>{let e=0;for(let t=0;t<a.length;t++)e=(e<<5)-e+a.charCodeAt(t),e=e&e;return Math.abs(e)%1e4/1e4*.15},to=a=>{let e=0;for(let t=0;t<a.length;t++)e=(e<<3)-e+a.charCodeAt(t)*7,e=e&e;return Math.abs(e)%1e4/1e4*Math.PI*2},Ks=(a,e,t,s,i,r=new M)=>{const o=e*(1-t*t)/(1+t*Math.cos(a)),l=o*Math.cos(a),c=o*Math.sin(a),u=l*Math.cos(i)-c*Math.sin(i)*Math.cos(s),d=l*Math.sin(i)+c*Math.cos(i)*Math.cos(s),h=c*Math.sin(s);return r.set(u,h,d)};function At(a){const e=a.replace("#",""),t=parseInt(e.substr(0,2),16)/255,s=parseInt(e.substr(2,2),16)/255,i=parseInt(e.substr(4,2),16)/255;return new W(t,s,i)}function $t(a){return a.length>=3?new W(a[0],a[1],a[2]):new W(.5,.5,.5)}function so(a){if(a.ocean_color){if(typeof a.ocean_color=="string")return At(a.ocean_color);if(Array.isArray(a.ocean_color))return $t(a.ocean_color)}if(a.planet_info?.base_color){if(typeof a.planet_info.base_color=="string")return At(a.planet_info.base_color);if(Array.isArray(a.planet_info.base_color))return $t(a.planet_info.base_color)}if(a.base_color){if(typeof a.base_color=="string")return At(a.base_color);if(Array.isArray(a.base_color))return $t(a.base_color)}const e=a.planet_info?.type||a.type||"Unknown";return ks(e)}function ks(a){const t={"Gas Giant":"#FFA500",Anomaly:"#FFFFFF",Rocky:"#808080",Icy:"#ADD8E6",Oceanic:"#0000FF",Desert:"#FFD700",Lava:"#FF0000",Arid:"#800000",Swamp:"#008000",Tundra:"#F0F8FF",Forest:"#006400",Savannah:"#F4A460",Cave:"#D1D1D1",Crystalline:"#00FFFF",Metallic:"#C0C0C0",Toxic:"#800080",Radioactive:"#00FF00",Magma:"#FF4500","Molten Core":"#FF8C00",Carbon:"#090909",Diamond:"#87CEFA","Super Earth":"#90EE90","Sub Earth":"#006400","Frozen Gas Giant":"#ADD8E6",Nebulous:"#FFC0CB",Aquifer:"#00FFFF",Exotic:"#FF00FF","Super Puff":"#F7C6D9","Super Ringed":"#E3C99A",Mirror:"#D9DEE6","Ruby Cloud":"#9B111E"}[a]||"#FFFFFF";return At(t)}const ge=63241.077,ao=1496e5,io=.00465,no=8,oo=80,ro={red:16742989,yellow:16773577,blue:11127039,orange:16758891,white:16054271,purple:13215487},lo={"Red Dwarf":.8,"Yellow Dwarf":1.4,"Blue Giant":2.6,"Red Giant":1.8,"White Dwarf":1.2,"Neutron Star":1},hi=new Set(["Gas Giant","Frozen Gas Giant","Nebulous","Super Puff","Super Ringed","Mirror","Ruby Cloud"]),Qs=new Set(["Lava","Magma","Molten Core","Radioactive","Ruby Cloud"]);function co(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(256/2,256/2,0,256/2,256/2,256/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.08,"rgba(255,255,255,0.85)"),s.addColorStop(.25,"rgba(255,255,255,0.22)"),s.addColorStop(.6,"rgba(255,255,255,0.05)"),s.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const i=new ve(e);return i.colorSpace=Ae,i}function ea(a,e){const i=document.createElement("canvas");i.width=256,i.height=128;const r=i.getContext("2d"),o=new Ze(De(a.name)),l=e?e.clone():ks(a.planet_type).clone();e||l.lerp(new W(9080729),.35);const c=d=>`#${d.getHexString()}`;if(r.fillStyle=c(l),r.fillRect(0,0,256,128),hi.has(a.planet_type))for(let d=0;d<128;d++){const h=Math.sin(d*.18+o.next()*.4)*.5+Math.sin(d*.05)*.5,p=l.clone().offsetHSL(0,0,h*.12);r.fillStyle=c(p),r.fillRect(0,d,256,1)}else{const d=l.clone().offsetHSL(0,-.05,-.18),h=l.clone().offsetHSL(.02,0,.12);for(let p=0;p<220;p++)r.fillStyle=c(o.next()<.55?d:h),r.globalAlpha=o.range(.15,.45),r.beginPath(),r.ellipse(o.range(0,256),o.range(0,128),o.range(4,26),o.range(3,14),o.range(0,Math.PI),0,Math.PI*2),r.fill();r.globalAlpha=1,a.surface_temperature+273.15<260&&(r.fillStyle="rgba(240,248,255,0.85)",r.fillRect(0,0,256,10),r.fillRect(0,118,256,10))}const u=new ve(i);return u.colorSpace=Ae,u.wrapS=rs,u}const ho=`
  varying vec3 vNormal;
  varying vec3 vView;
  #include <common>
  #include <logdepthbuf_pars_vertex>
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
    #include <logdepthbuf_vertex>
  }
`,uo=`
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  #include <logdepthbuf_pars_fragment>
  void main() {
    #include <logdepthbuf_fragment>
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(uColor * rim * 1.4, rim);
  }
`;class ta{root=new se;system;planets=[];stars=[];timeScale=1;simulatedSeconds=0;serverTime;loadedAt=Date.now()/1e3;disposables=[];timing;constructor(e,t){this.system=e,this.timing=t,this.serverTime=t.current_time,this.buildStars(),this.buildPlanets(),this.root.add(new Qa(4213350,.06))}get cosmicNow(){return this.serverTime+this.simulatedSeconds}get drift(){return this.simulatedSeconds-(Date.now()/1e3-this.loadedAt)}resetTime(){this.simulatedSeconds=Date.now()/1e3-this.loadedAt}buildStars(){const e=co();this.disposables.push(e);const t=this.system.stars.length,s=.12+.05*t;this.system.stars.forEach((i,r)=>{const o=ro[i.Color?.toLowerCase()]??16777215,l=Math.max(6e-4,i.Size*io*no),c=new le(l,96,48),u=Zn(i.Type,o),d=new _t(u,l,this.system.index*7+r+1),h=new D(c,d.surface);h.userData.starIndex=r,d.corona.position.copy(h.position);const p=new gs(new vs({map:e,color:o,blending:Z,depthWrite:!1,transparent:!0})),g=r/Math.max(1,t)*Math.PI*2,f=t>1?new M(Math.cos(g)*s,0,Math.sin(g)*s):new M;h.position.copy(f),p.position.copy(f),d.corona.position.copy(f);const v=new sn(o,(lo[i.Type]??1.2)/Math.sqrt(t),0,0);v.position.copy(f),this.root.add(h,d.corona,p,v),this.stars.push({mesh:h,glow:p,radius:l,offset:f,light:v,surface:d,info:i,look:u}),this.disposables.push(c,d,p.material)})}buildPlanets(){for(const e of this.system.planets){const t=Math.max(2e-5,e.diameter/2/ao*oo),s=ea(e),i=new le(t,48,24),r=new ue({map:s,roughness:hi.has(e.planet_type)?.9:.75,metalness:e.planet_type==="Metallic"?.6:.05,emissive:Qs.has(e.planet_type)?new W(e.planet_type==="Radioactive"?8257354:16734751):new W(0),emissiveIntensity:Qs.has(e.planet_type)?.35:0}),o=new D(i,r);if(o.rotation.z=e.axial_tilt*Math.PI/180,o.userData.planetIndex=e.index,this.root.add(o),this.disposables.push(s,i,r),e.atmosphere&&!/none|vacuum/i.test(e.atmosphere)){const f=new D(new le(t*1.06,48,24),new $({uniforms:{uColor:{value:ks(e.planet_type).clone().lerp(new W(10471679),.6)}},vertexShader:ho,fragmentShader:uo,blending:Z,transparent:!0,depthWrite:!1,side:os}));o.add(f),this.disposables.push(f.geometry,f.material)}const l=eo(e.name),c=to(e.name),u=Math.min(.9,e.eccentricity_factor??.1),d=[];for(let f=0;f<360;f++)d.push(Ks(f/360*Math.PI*2,e.orbital_radius,u,l,c));const h=new de().setFromPoints(d),p=new ht({color:7311320,transparent:!0,opacity:.28,depthWrite:!1}),g=new an(h,p);g.userData.opacity=.28,this.root.add(g),this.disposables.push(h,p),this.planets.push({data:e,mesh:o,orbit:g,radius:t,inclination:l,ascendingNode:c,eccentricity:u,angularVelocity:2*Math.PI/e.orbital_period_seconds,position:new M})}}get outerRadius(){return Math.max(1,...this.system.planets.map(e=>e.orbital_radius))}planetPosition(e){const t=this.planets.find(s=>s.data.index===e);return t?t.position:null}planet(e){return this.planets.find(t=>t.data.index===e)}get starOffsets(){return this.stars.map(e=>e.offset.clone())}nearestSurface(e){let t=1/0;for(const s of this.planets)t=Math.min(t,e.distanceTo(s.position)-s.radius);for(const s of this.stars)t=Math.min(t,e.distanceTo(s.offset)-s.radius);return t}setDetailed(e){for(const t of this.planets)t.mesh.visible=!e.includes(t.data.index)}setPlanetColor(e,t){const s=this.planet(e);if(!s)return;const i=s.mesh.material,r=i.map,o=ea(s.data,t);i.map=o,i.needsUpdate=!0,this.disposables.push(o),r&&(r.dispose(),this.disposables=this.disposables.filter(c=>c!==r)),s.mesh.children[0]?.material.uniforms.uColor.value.copy(t).lerp(new W(10471679),.6)}setSelectedPlanet(e){for(const t of this.planets){const s=t.orbit.material,i=t.data.index===e;s.color.set(i?8317183:7311320),t.orbit.userData.opacity=i?.75:.28}}setOrbitsVisible(e){for(const t of this.planets)t.orbit.visible=e}update(e,t){this.simulatedSeconds+=e*this.timeScale,this.root.position.copy(t).negate();for(const i of this.planets){const r=i.data.current_orbital_angle+i.angularVelocity*this.simulatedSeconds;Ks(r,i.data.orbital_radius,i.eccentricity,i.inclination,i.ascendingNode,i.position),i.mesh.position.copy(i.position),i.mesh.rotation.y=this.simulatedSeconds/Math.max(1,Math.abs(i.data.rotation_period_seconds))*Math.PI*2%(Math.PI*2)}const s=performance.now()/1e3;for(const i of this.stars){const r=t.distanceTo(i.offset),o=I.smoothstep(i.radius*40/Math.max(r,1e-9),.6,2.5),l=Math.max(i.radius*16,r*.09);i.glow.scale.setScalar(l),i.glow.material.opacity=this.presence*(1-.85*o),i.surface.update(s,o*this.presence),i.mesh.rotation.y=_t.spinAt(s)}for(const i of this.planets)i.orbit.material.opacity=i.orbit.userData.opacity*this.presence}presence=0;static presenceAt(e){const t=I.clamp(Math.log(4800/Math.max(e,1e-9))/Math.log(32),0,1);return t*t*(3-2*t)}pickPlanet(e,t,s,i,r=18){let o=null,l=1/0;const c=new M;for(const u of this.planets){c.copy(u.position).sub(i);const d=s(c);if(!d)continue;const h=Math.hypot(d.x-e,d.y-t);h<r&&h<l&&(o=u,l=h)}return o}pickBody(e,t,s,i){let r=null,o=1;const l=new M,c=new M,u=(d,h,p,g)=>{l.copy(d).sub(i);const f=s(l);if(!f)return;c.copy(l).add(new M(h,0,0));const v=s(c),b=Math.max(p,v?Math.hypot(v.x-f.x,v.y-f.y):0),x=Math.hypot(f.x-e,f.y-t)/b;x<o&&(o=x,r=g)};for(const d of this.planets)u(d.position,d.radius,18,{kind:"planet",body:d});return this.stars.forEach((d,h)=>u(d.offset,d.radius,22,{kind:"star",index:h})),r}dispose(){this.disposables.forEach(e=>e.dispose()),this.root.clear()}}const Et=6,ui=`
uniform vec2 uRingBands[${Et}];
uniform int uRingBandCount;
uniform float uRingSeed;
// A Super Ringed planet's rings (1): a dense ring inside its Roche limit (uRingRoche, planet
// radii), a dusty disc beyond it
uniform float uRingSuper;
uniform float uRingRoche;

float ringHash(float x) { return fract(sin(x * 127.1 + uRingSeed) * 43758.5453); }
float ringNoise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(ringHash(i), ringHash(i + 1.0), f); }

float ringDensity(float r) {
  float density = 0.0;
  for (int i = 0; i < ${Et}; i++) {
    if (i >= uRingBandCount) break;
    vec2 band = uRingBands[i];
    float width = band.y - band.x;
    float inside = smoothstep(band.x, band.x + width * 0.04, r) * (1.0 - smoothstep(band.y - width * 0.06, band.y, r));
    // Denser towards the middle of a band
    float t = (r - band.x) / max(width, 1e-4);
    density = max(density, inside * (0.55 + 0.45 * sin(t * 3.14159)));
  }
  // Ringlets at three scales, and a few sharp gaps
  float ringlets = 0.55 + 0.25 * ringNoise(r * 40.0) + 0.15 * ringNoise(r * 160.0) + 0.1 * ringNoise(r * 700.0);
  float gaps = smoothstep(0.02, 0.06, ringNoise(r * 22.0 + 3.0)) * smoothstep(0.0, 0.03, ringNoise(r * 75.0 + 9.0));
  if (uRingSuper > 0.5) {
    // A Super Ringed planet's (J1407 b's): inside its Roche limit a dense ring of ice; beyond
    // it, where ring material can no longer stay a ring, the young circumplanetary disc
    // still forming moons, thinner and dustier
    density *= mix(1.0, 0.75, smoothstep(uRingRoche * 0.9, uRingRoche * 1.3, r));
  }
  return clamp(density * ringlets * mix(1.0, gaps, 0.6), 0.0, 1.0);
}
`,mo=`
varying vec3 vWorldPos;
varying vec3 vLocal;
void main() {
  vLocal = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,po=`
${ui}
uniform vec3 uLightDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform vec3 uRingNormal;
uniform float uPlanetRadius;
uniform vec3 uRingColor;
varying vec3 vWorldPos;
varying vec3 vLocal;

void main() {
  float r = length(vLocal.xy) / uPlanetRadius;
  float density = ringDensity(r);
  if (density < 0.01) discard;
  // Planet shadow: is the planet between this point and the star?
  float b = dot(vWorldPos, uLightDir);
  float shadow = 1.0;
  if (b < 0.0) {
    float d = length(vWorldPos - b * uLightDir);
    shadow = smoothstep(uPlanetRadius * 0.97, uPlanetRadius * 1.03, d);
  }
  // Lit face: diffuse; far face: the light that makes it through (thin parts glow)
  vec3 v = normalize(cameraPosition - vWorldPos);
  float sunSide = sign(dot(uRingNormal, uLightDir));
  float viewSide = sign(dot(uRingNormal, v));
  float lit = abs(dot(uRingNormal, uLightDir));
  float brightness = sunSide == viewSide ? 0.25 + 0.75 * lit : (1.0 - density) * 0.9 * lit + 0.05;
  // Forward scattering: rings brighten looking towards the star
  brightness += pow(max(dot(-v, uLightDir), 0.0), 8.0) * 0.6 * (1.0 - density);
  vec3 tone = uRingColor * (0.8 + 0.4 * ringNoise(r * 55.0 + 17.0));
  if (uRingSuper > 0.5) {
    // Clean ice inside the Roche limit, the disc's dust beyond it, redder further out
    float outer = uRingBands[max(uRingBandCount - 1, 0)].y;
    float dust = smoothstep(uRingRoche * 0.9, uRingRoche * 1.3, r);
    vec3 disc = mix(vec3(0.92, 0.72, 0.52), vec3(0.86, 0.52, 0.3), smoothstep(uRingRoche, outer, r));
    tone = mix(vec3(0.8, 0.9, 1.0), disc, dust) * (0.8 + 0.4 * ringNoise(r * 55.0 + 17.0));
  }
  vec3 color = tone * uSunColor * uSunIntensity * brightness * shadow + tone * 0.01;
  gl_FragColor = vec4(color, density * 0.92);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;class fo{mesh;normal=new M;bands;bandCount;seed;structure={uRingRoche:{value:2.5}};material;constructor(e,t,s,i,r=!1){const o=1/(e.planet_radius||200),l=Math.asin((e.tilt_factor||.2)*.5);this.bands=Array.from({length:Et},(h,p)=>{const g=e.bands[p];return g?new Fe(g.inner*o,g.outer*o):new Fe(0,0)}),this.bandCount=Math.min(e.bands.length,Et),this.seed=e.shape_seed%1e3/10;const c=Math.min(...e.bands.map(h=>h.inner))*o*t,u=Math.max(...e.bands.map(h=>h.outer))*o*t,d=new xs(c*.98,u*1.02,256,1);this.material=new $({uniforms:{uLightDir:i.uLightDir,uSunColor:i.uSunColor,uSunIntensity:i.uSunIntensity,uRingBands:{value:this.bands},uRingBandCount:{value:this.bandCount},uRingSeed:{value:this.seed},uRingNormal:{value:this.normal},uPlanetRadius:{value:t},uRingColor:{value:s},uRingSuper:{value:r?1:0},...this.structure},vertexShader:mo,fragmentShader:po,transparent:!0,depthWrite:!1,side:Se}),this.mesh=new D(d,this.material),this.mesh.name="realistic-rings",this.mesh.rotation.set(-Math.PI/2+l,0,0),this.mesh.updateMatrixWorld(),this.normal.set(0,0,1).applyQuaternion(this.mesh.quaternion).normalize(),this.mesh.renderOrder=1}setRoche(e){this.structure.uRingRoche.value=e}dispose(){this.mesh.removeFromParent(),this.mesh.geometry.dispose(),this.material.dispose()}}function Ke(a){let e=a%2147483647;return e<=0&&(e+=2147483646),()=>(e=e*16807%2147483647)/2147483647}const go=a=>{const e=a()*2-1,t=a()*Math.PI*2,s=Math.sqrt(1-e*e);return new M(s*Math.cos(t),e,s*Math.sin(t))};function Lt(a,e,t,s){const i=new M(0,1,0).applyEuler(new ys((a()-.5)*t*2,a()*Math.PI*2,(a()-.5)*t*2)).normalize(),r=new M(1,0,0).cross(i);r.lengthSq()<1e-4&&r.set(0,0,1).cross(i),r.normalize();const o=new M().crossVectors(i,r);return{radius:e,normal:i,u:r,v:o,period:s,phase:a()*Math.PI*2}}const qe=(a,e,t)=>{const s=a.phase+e/a.period*Math.PI*2;return t.copy(a.u).multiplyScalar(Math.cos(s)*a.radius).addScaledVector(a.v,Math.sin(s)*a.radius)};function vo(a){const e=new be(a*.6,a*.6,a),t=new be(a*2.4,a*.02,a*.7).translate(-a*1.6,0,0),s=new be(a*2.4,a*.02,a*.7).translate(a*1.6,0,0),i=new ti(a*.35,a*.2,12,1,!0).rotateX(Math.PI/2).translate(0,0,a*.6),r=[e,t,s,i].map(l=>l.toNonIndexed()),o=ai(r);return r.forEach(l=>l.dispose()),o}function xo(a){const e=[];e.push(new be(a*6,a*.15,a*.15));for(let i=-2;i<=2;i++)e.push(new lt(a*.35,a*.35,a*1.4,12).rotateX(Math.PI/2).translate(i*a*.5,0,0));for(const i of[-2.8,-1.9,1.9,2.8])for(const r of[-1,1])e.push(new be(a*.7,a*.02,a*2.2).translate(i*a,0,r*a*1.3));e.push(new He(a*1.1,a*.08,8,32).rotateY(Math.PI/2));const t=e.map(i=>i.toNonIndexed()),s=ai(t);return e.forEach(i=>i.dispose()),t.forEach(i=>i.dispose()),s}const di=`
attribute float phase;
uniform float uWall;
uniform float uPixelRatio;
varying float vOn;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  // Short double flash every two seconds
  float t = fract(uWall * 0.5 + phase);
  vOn = step(t, 0.04) + step(0.1, t) * step(t, 0.14);
  gl_PointSize = (1.5 + 2.5 * vOn) * uPixelRatio;
  gl_Position = projectionMatrix * mv;
}
`,mi=`
uniform vec3 uColor;
varying float vOn;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor * (0.25 + 2.5 * vOn) * (1.0 - d * 2.0), 1.0);
}
`;function sa(a,e,t,s,i,r){const o=Ke(t),l=e*(r?.008:.013),c=vo(l),u=new ue({color:r?10134708:13152368,metalness:.85,roughness:.3,envMapIntensity:1}),d=new ei(c,u,s);d.frustumCulled=!1;const h=[];for(let C=0;C<s;C++){const E=o(),j=E<.7?e*(1.04+o()*.12):E<.92?e*(1.3+o()*.4):e*(2.2+o()*.6),_=5400*Math.pow(j/(e*1.06),1.5);h.push(Lt(o,j,r?1.4:1,_))}a.add(d);const p=new de;p.setAttribute("position",new te(new Float32Array(s*3),3)),p.setAttribute("phase",new te(Float32Array.from({length:s},()=>o()),1));const g=new $({uniforms:{uWall:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uColor:{value:new W(r?6347007:16769184)}},vertexShader:di,fragmentShader:mi,blending:Z,transparent:!0,depthWrite:!1}),f=new Te(p,g);f.frustumCulled=!1,a.add(f);let v=null;const b=Lt(o,e*1.08,.9,5600);i&&(v=new D(xo(e*.012),new ue({color:14211280,metalness:.6,roughness:.4})),a.add(v));const x=new zt,S=new ut,N=new M,T=new M,R=new M(1,1,1),k=p.getAttribute("position");return{update:(C,E)=>{for(let j=0;j<s;j++)qe(h[j],C,N),qe(h[j],C+30,T),x.lookAt(N,T,N.clone().normalize()),S.setFromRotationMatrix(x),d.setMatrixAt(j,x.compose(N,S,R)),k.setXYZ(j,N.x,N.y,N.z);d.instanceMatrix.needsUpdate=!0,k.needsUpdate=!0,g.uniforms.uWall.value=E,v&&(qe(b,C,v.position),qe(b,C+30,T),v.lookAt(T))},dispose:()=>{for(const C of[d,f,v])C?.removeFromParent();c.dispose(),u.dispose(),p.dispose(),g.dispose(),v&&(v.geometry.dispose(),v.material.dispose())}}}function yo(a,e){const t=e*1.55,s=new se,i=new D(new He(t,e*.006,8,512),new ue({color:9213604,metalness:.9,roughness:.35}));i.rotation.x=Math.PI/2,s.add(i);const r=[];for(let h=0;h<6;h++){const p=h/6*Math.PI*2;r.push(Math.cos(p)*e,0,Math.sin(p)*e,Math.cos(p)*t,0,Math.sin(p)*t)}const o=new Le(new de().setAttribute("position",new ze(r,3)),new ht({color:8425632,transparent:!0,opacity:.5}));s.add(o);const l=240,c=new Float32Array(l*3);for(let h=0;h<l;h++){const p=h/l*Math.PI*2;c.set([Math.cos(p)*t,0,Math.sin(p)*t],h*3)}const u=new de;u.setAttribute("position",new te(c,3)),u.setAttribute("phase",new te(Float32Array.from({length:l},(h,p)=>p/l),1));const d=new $({uniforms:{uWall:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uColor:{value:new W(6349055)}},vertexShader:di,fragmentShader:mi,blending:Z,transparent:!0,depthWrite:!1});return s.add(new Te(u,d)),a.add(s),{surface:s,update:(h,p)=>{d.uniforms.uWall.value=p},dispose:()=>{s.removeFromParent(),s.traverse(h=>{const p=h;p.geometry?.dispose(),p.material?.dispose?.()})}}}const pi=`
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vObj = normalize(position);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normalize(position));
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,mt=`
${Me}
uniform float uWall;
uniform vec3 uLightDir;
uniform vec3 uColor;
uniform vec3 uColor2;
uniform float uStrength;
uniform vec3 uSeed;
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
float nightSide() { return 1.0 - smoothstep(-0.15, 0.25, dot(normalize(vWorldNormal), uLightDir)); }
float limb() { vec3 v = normalize(cameraPosition - vWorldPos); return pow(1.0 - abs(dot(normalize(vWorldNormal), v)), 2.0); }
`,wo=`
${mt}
void main() {
  vec3 p = normalize(vObj);
  float lat = abs(p.y);
  float lon = atan(p.z, p.x);
  float oval = exp(-pow((lat - 0.93) / 0.035, 2.0));
  float curtains = 0.5 + 0.5 * snoise(vec3(lon * 6.0, p.y * 3.0, uWall * 0.15 + uSeed.x));
  curtains *= 0.6 + 0.4 * snoise(vec3(lon * 22.0, 0.0, uWall * 0.4));
  float glow = oval * curtains * (0.3 + 0.7 * nightSide()) * (0.4 + 0.9 * limb());
  vec3 color = mix(uColor, uColor2, smoothstep(0.92, 0.97, lat));
  gl_FragColor = vec4(color * glow * uStrength, 1.0);
}
`,bo=`
${mt}
void main() {
  vec3 p = normalize(vObj);
  vec3 w = vec3(snoise(p * 2.0 + uWall * 0.03), snoise(p * 2.0 + 7.0 - uWall * 0.025), snoise(p * 2.0 + 13.0));
  float n = fbmN(p * 3.0 + w * 1.2 + vec3(uWall * 0.02), 5.0);
  float body = smoothstep(0.1, 0.5, n);
  float pulse = 0.65 + 0.35 * sin(uWall * 0.7 + n * 8.0);
  vec3 color = mix(uColor, uColor2, smoothstep(0.3, 0.7, n));
  gl_FragColor = vec4(color * body * pulse * uStrength * (0.35 + 0.65 * nightSide()), 1.0);
}
`,So=`
${mt}
void main() {
  vec3 p = normalize(vObj);
  float ripples = 0.5 + 0.5 * sin(acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0)) * 18.0 - uWall * 0.8);
  float veil = 0.5 + 0.5 * snoise(p * 4.0 + vec3(0.0, uWall * 0.05, 0.0));
  float glow = (limb() * 1.4 + 0.08) * (0.4 + 0.6 * ripples * veil);
  gl_FragColor = vec4(mix(uColor, uColor2, ripples) * glow * uStrength, 1.0);
}
`,Mo=`
${mt}
void main() {
  vec3 p = normalize(vObj);
  float a = acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0));
  float b = acos(clamp(dot(p, normalize(uSeed.zxy - 50.0)), -1.0, 1.0));
  float waves = sin(a * 40.0 - uWall * 1.5) * sin(b * 40.0 + uWall * 1.2);
  float glow = pow(abs(waves), 8.0) * (0.3 + limb());
  gl_FragColor = vec4(mix(uColor, uColor2, 0.5 + 0.5 * waves) * glow * uStrength, 1.0);
}
`;function at(a,e,t,s,i,r,o,l,c,u){const d=Ke(l),h=new $({uniforms:{uWall:{value:0},uLightDir:c.uLightDir,uColor:{value:new W(i)},uColor2:{value:new W(r)},uStrength:{value:o},uSeed:{value:new M(d()*100,d()*100,d()*100)},uOctaves:{value:5}},vertexShader:pi,fragmentShader:s,blending:Z,transparent:!0,depthWrite:!1}),p=new D(new le(e*t,128,64),h);return p.renderOrder=3,a.add(p),{mesh:p,material:h,surface:u?p:void 0,update:(g,f)=>{h.uniforms.uWall.value=f},dispose:()=>{p.removeFromParent(),p.geometry.dispose(),h.dispose()}}}function ko(a,e){const t=new se,s=new $({uniforms:{uColor:{value:new W(6990079)},uWall:{value:0}},vertexShader:`
      varying vec3 vNormal; varying vec3 vView;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,fragmentShader:`
      uniform vec3 uColor; uniform float uWall; varying vec3 vNormal; varying vec3 vView;
      void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0); gl_FragColor = vec4(uColor * rim * (0.07 + 0.02 * sin(uWall * 0.5)), 1.0); }
    `,blending:Z,transparent:!0,depthWrite:!1,side:Se});for(const[i,r]of[[1.7,.35],[3.2,.9]]){const o=new D(new He(e*i,e*r,32,128),s);o.rotation.x=Math.PI/2,o.scale.z=1.3,t.add(o)}return a.add(t),{update:(i,r)=>{s.uniforms.uWall.value=r},dispose:()=>{t.removeFromParent(),t.traverse(i=>i.geometry?.dispose()),s.dispose()}}}const jo=`
attribute vec3 vent;     // direction of the vent on the unit sphere
attribute vec4 params;   // phase, speed, spread angle, size
uniform float uWall;
uniform float uRadius;
uniform float uHeight;
uniform float uRate;
uniform float uGravity;
uniform float uPixelRatio;
uniform float uWind;
varying float vAge;
varying float vSeed;
void main() {
  float t = fract(uWall * uRate * params.y + params.x);
  vAge = t;
  vSeed = params.x;
  vec3 up = normalize(vent);
  vec3 side = normalize(cross(up, abs(up.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));
  vec3 side2 = cross(up, side);
  float a = params.x * 61.0;
  vec3 out_ = side * cos(a) + side2 * sin(a);
  // Ballistic rise and fall (or a buoyant column that spreads), carried by the wind
  float h = uHeight * (t * 2.0 - uGravity * t * t);
  vec3 pos = up * (uRadius + max(h, 0.0)) + out_ * uHeight * params.z * t + side * uWind * uHeight * t * t;
  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = params.w * (0.4 + t * 1.8) * uPixelRatio * 300.0 / -mv.z;
  gl_Position = projectionMatrix * mv;
}
`,No=`
uniform vec3 uHot;
uniform vec3 uCool;
uniform float uGlow;
uniform float uOpacity;
uniform vec3 uLightDir;
varying float vAge;
varying float vSeed;
void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  if (d > 1.0) discard;
  float soft = (1.0 - d * d);
  // Glowing when fresh, cooling to ash or vapour as it ages
  vec3 color = mix(uHot, uCool, smoothstep(0.0, 0.45, vAge));
  float fade = smoothstep(0.0, 0.05, vAge) * (1.0 - smoothstep(0.6, 1.0, vAge));
  float emissive = uGlow * (1.0 - smoothstep(0.0, 0.35, vAge));
  // Ash and vapour thin out as they spread
  float thin = 1.0 - 0.75 * smoothstep(0.2, 0.9, vAge);
  gl_FragColor = vec4(color * (0.35 + emissive * 2.5), soft * soft * fade * thin * uOpacity);
}
`,Co={volcanic:{vents:7,particlesPerVent:260,height:.16,rate:.1,gravity:1,spread:.7,size:.022,hot:16752704,cool:3813416,glow:1,opacity:.9,additive:!1,wind:.3},smoke:{vents:9,particlesPerVent:200,height:.1,rate:.05,gravity:.2,spread:.35,size:.03,hot:4867136,cool:2104866,glow:0,opacity:.6,additive:!1,wind:1.6},seeps:{vents:12,particlesPerVent:120,height:.05,rate:.07,gravity:.1,spread:.6,size:.024,hot:11075440,cool:5933632,glow:.3,opacity:.4,additive:!0,wind:1},snow:{vents:10,particlesPerVent:160,height:.025,rate:.08,gravity:0,spread:1.6,size:.03,hot:16054527,cool:14674164,glow:0,opacity:.3,additive:!1,wind:3,latitude:[.6,.95]}};function To(a,e,t,s,i){const r=Ke(t),o=s.vents*s.particlesPerVent,l=new Float32Array(o*3),c=new Float32Array(o*4);for(let p=0;p<s.vents;p++){let g=go(r);if(s.latitude){const v=(s.latitude[0]+r()*(s.latitude[1]-s.latitude[0]))*(r()<.5?-1:1),b=Math.sqrt(1-v*v),x=r()*Math.PI*2;g=new M(b*Math.cos(x),v,b*Math.sin(x))}const f=.6+r()*.8;for(let v=0;v<s.particlesPerVent;v++){const b=p*s.particlesPerVent+v;l.set([g.x,g.y,g.z],b*3),c.set([r(),(.7+r()*.6)*f,r()*s.spread,e*s.size*(.6+r()*.8)],b*4)}}const u=new de;u.setAttribute("position",new te(new Float32Array(o*3),3)),u.setAttribute("vent",new te(l,3)),u.setAttribute("params",new te(c,4));const d=new $({uniforms:{uWall:{value:0},uRadius:{value:e*1.002},uHeight:{value:e*s.height},uRate:{value:s.rate},uGravity:{value:s.gravity},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uWind:{value:s.wind},uHot:{value:new W(s.hot)},uCool:{value:new W(s.cool)},uGlow:{value:s.glow},uOpacity:{value:s.opacity},uLightDir:i.uLightDir},vertexShader:jo,fragmentShader:No,transparent:!0,depthWrite:!1,blending:s.additive?Z:rn}),h=new Te(u,d);return h.frustumCulled=!1,h.renderOrder=1,a.add(h),{surface:h,update:(p,g)=>{d.uniforms.uWall.value=g},dispose:()=>{h.removeFromParent(),u.dispose(),d.dispose()}}}function Ao(a,e,t){const s=Ke(t),i=e*.06,r=new se,o=new be(i,i,i),l=new D(o,new Dt({color:328967,metalness:.3,roughness:.08,clearcoat:1})),c=new ht({color:8440063,transparent:!0,blending:Z}),u=new Le(new ws(o),c);r.add(l,u),a.add(r);const d=Lt(s,e*1.9,.5,4e4);return{update:(h,p)=>{qe(d,h,r.position),r.rotation.set(p*.05,p*.08,0),c.opacity=.35+.65*Math.pow(.5+.5*Math.sin(p*1.2),3)},dispose:()=>{r.removeFromParent(),o.dispose(),u.geometry.dispose(),l.material.dispose(),c.dispose()}}}function aa(a,e,t,s){const i=Ke(t),r=s==="shards"?70:600;let o,l;if(s==="shards")o=new nn(e*.02,0).scale(.5,1.8,.5),l=new Dt({color:13154559,metalness:.1,roughness:.05,iridescence:1,iridescenceIOR:1.6,clearcoat:1,emissive:2756704,emissiveIntensity:.6});else{o=new on(e*.012,1);const x=o.getAttribute("position");for(let S=0;S<x.count;S++)x.setXYZ(S,x.getX(S)*(.7+i()*.6),x.getY(S)*(.6+i()*.5),x.getZ(S)*(.7+i()*.6));o.computeVertexNormals(),l=new ue({color:6971994,roughness:.95,metalness:.05,flatShading:!0})}const c=new ei(o,l,r);c.frustumCulled=!1;const u=[],d=[],h=[];for(let x=0;x<r;x++){const S=s==="shards"?e*(1.4+i()*.8):e*(1.15+Math.pow(i(),2)*.6);u.push(Lt(i,S,s==="shards"?1.2:.15,9e3*Math.pow(S/e,1.5))),d.push(new M(i(),i(),i()).multiplyScalar(.4)),h.push(s==="shards"?.5+i():.3+Math.pow(i(),3)*2.5)}a.add(c);const p=new zt,g=new ut,f=new ys,v=new M,b=new M;return{update:(x,S)=>{for(let N=0;N<r;N++)qe(u[N],x,v),f.set(d[N].x*S,d[N].y*S,d[N].z*S),g.setFromEuler(f),b.setScalar(h[N]),c.setMatrixAt(N,p.compose(v,g,b));c.instanceMatrix.needsUpdate=!0},dispose:()=>{c.removeFromParent(),o.dispose(),l.dispose()}}}function Ro(a,e,t){const s=new $({uniforms:{uWall:{value:0},uColor:{value:new W(10146047)},uLightDir:t.uLightDir,uOctaves:{value:3}},vertexShader:`
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,fragmentShader:`
      ${Me}
      uniform float uWall; uniform vec3 uColor; varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() {
        float core = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.0);
        float knots = 0.6 + 0.4 * snoise(vec3(vUv.y * 12.0 - uWall * 2.0, 0.0, 0.0));
        float fade = (1.0 - vUv.y) * smoothstep(0.0, 0.05, vUv.y);
        gl_FragColor = vec4(uColor * core * knots * fade * 1.6, 1.0);
      }
    `,blending:Z,transparent:!0,depthWrite:!1,side:Se}),i=new se;for(const r of[1,-1]){const o=new D(new lt(e*.08,e*.015,e*3,24,1,!0),s);o.position.y=r*e*2.5,r<0&&(o.rotation.z=Math.PI),i.add(o)}return a.add(i),{surface:i,update:(r,o)=>{s.uniforms.uWall.value=o},dispose:()=>{i.removeFromParent(),i.traverse(r=>r.geometry?.dispose()),s.dispose()}}}const wt=16765562,bt=16774364,Po=`
uniform float uR;
varying vec2 vP;
varying float vSilhouette;
void main() {
  // A billboard at the planet's centre, facing the camera
  vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float d = length(mv.xyz);
  // The planet's silhouette radius, measured in that plane
  vSilhouette = uR * d / sqrt(max(d * d - uR * uR, 1e-6));
  vP = position.xy;
  mv.xy += position.xy;
  gl_Position = projectionMatrix * mv;
}
`,_o=`
${Me}
uniform float uWall;
uniform vec3 uColor;
uniform vec3 uColor2;
varying vec2 vP;
varying float vSilhouette;
void main() {
  float x = length(vP) / vSilhouette;
  if (x < 0.995) discard;
  float a = atan(vP.y, vP.x);
  vec2 ring = vec2(cos(a), sin(a));
  // Rays: broad and fine, drifting round, each brightening and fading on its own
  float broad = 0.5 + 0.5 * snoise(vec3(ring * 2.2, uWall * 0.06));
  float fine = pow(0.5 + 0.5 * snoise(vec3(ring * 9.0, uWall * 0.11 + 4.0)), 3.0);
  float rays = broad * 0.6 + fine * 0.8;
  float reach = exp(-(x - 1.0) * (1.6 + 1.4 * (1.0 - broad)));
  float corona = exp(-(x - 1.0) * 10.0);
  float breathe = 0.82 + 0.18 * sin(uWall * 0.5);
  vec3 color = mix(uColor, uColor2, corona) * (corona * 1.1 + rays * reach * 0.55) * breathe;
  gl_FragColor = vec4(color, 1.0);
}
`,Eo=`
uniform float uWall;
uniform float uInner;
uniform float uOuter;
uniform float uCells;
uniform float uSpeed;
uniform float uSeedF;
uniform vec3 uColor;
uniform vec3 uColor2;
varying vec2 vPos;
float hash(float n) { return fract(sin(n * 12.9898 + uSeedF) * 43758.5453); }
void main() {
  float r = length(vPos);
  float t = (r - uInner) / (uOuter - uInner);
  float a = atan(vPos.y, vPos.x) / 6.2831853 + 0.5;
  // Hairlines along both edges
  float lines = exp(-pow((t - 0.1) / 0.025, 2.0)) + exp(-pow((t - 0.9) / 0.025, 2.0));
  // The engraved code: one glyph per cell, a 0 or a 1, flickering as it is rewritten
  float u = a * uCells + uWall * uSpeed;
  float id = floor(u);
  vec2 g = vec2(fract(u), (t - 0.28) / 0.44);
  float inside = step(0.0, g.y) * step(g.y, 1.0);
  float bit = step(0.5, hash(id + floor(uWall * 0.4 + hash(id) * 10.0)));
  float one = smoothstep(0.09, 0.03, abs(g.x - 0.5)) * smoothstep(0.0, 0.08, g.y) * smoothstep(1.0, 0.92, g.y);
  float zero = smoothstep(0.1, 0.03, abs(length((g - 0.5) * vec2(2.4, 2.0)) - 0.78));
  float glyph = mix(zero, one, bit) * inside;
  // Ticks between the glyphs
  float ticks = smoothstep(0.03, 0.0, abs(fract(u) - 0.0)) * smoothstep(0.35, 0.3, abs(t - 0.5));
  float flicker = 0.6 + 0.4 * sin(uWall * 3.0 + id * 1.7);
  // A faint band of light carrying the code
  float band = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.88, t) * 0.08;
  vec3 color = mix(uColor, uColor2, glyph) * (band + lines * 1.1 + glyph * 1.3 * flicker + ticks * 0.4);
  gl_FragColor = vec4(color, 1.0);
}
`,Lo=`
${mt}
uniform vec3 uAxes[6];
void main() {
  vec3 p = normalize(vObj);
  float web = 0.0;
  float pulses = 0.0;
  for (int i = 0; i < 6; i++) {
    float d = abs(dot(p, uAxes[i]));
    float line = exp(-pow(d / 0.006, 2.0)) + exp(-pow(d / 0.03, 2.0)) * 0.25;
    web += line;
    // Light travelling along each great circle
    vec3 u = normalize(cross(uAxes[i], vec3(0.31, 0.83, 0.47)));
    vec3 v = cross(uAxes[i], u);
    float along = atan(dot(p, v), dot(p, u));
    pulses += line * pow(0.5 + 0.5 * sin(along * 3.0 - uWall * 1.3 + float(i) * 2.1), 12.0);
  }
  float glow = (web * 0.35 + pulses * 1.2) * (0.25 + 0.75 * nightSide()) * (0.6 + 0.6 * limb());
  gl_FragColor = vec4(mix(uColor, uColor2, clamp(pulses, 0.0, 1.0)) * glow * uStrength, 1.0);
}
`,Io=`
attribute vec4 orbit;   // radius, inclination, node, phase
attribute float speed;
attribute float twinkle;
uniform float uTime;
uniform float uWall;
uniform float uPixels;
varying float vGlow;
void main() {
  float a = orbit.w + uWall * speed;
  vec3 p = vec3(cos(a), 0.0, sin(a)) * orbit.x;
  float ci = cos(orbit.y), si = sin(orbit.y);
  p = vec3(p.x, -p.z * si, p.z * ci);
  float cn = cos(orbit.z), sn = sin(orbit.z);
  p = vec3(p.x * cn - p.z * sn, p.y, p.x * sn + p.z * cn);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vGlow = 0.45 + 0.55 * pow(0.5 + 0.5 * sin(uWall * (1.0 + twinkle * 2.0) + twinkle * 40.0), 3.0);
  gl_PointSize = clamp(uPixels * orbit.x * 0.012 / -mv.z, 1.5, 9.0);
  gl_Position = projectionMatrix * mv;
}
`,Fo=`
uniform vec3 uColor;
varying float vGlow;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 7.0);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5) * core * vGlow, 1.0);
}
`,zo=`
uniform float uAge;
uniform vec3 uColor;
varying vec3 vWorldNormal;
varying vec3 vWorldPos;
void main() {
  vec3 v = normalize(cameraPosition - vWorldPos);
  // A rim that fades again right at the silhouette, so the wave has no hard edge
  float grazing = 1.0 - abs(dot(normalize(vWorldNormal), v));
  float rim = pow(grazing, 3.0) * (1.0 - pow(grazing, 14.0));
  float fade = (1.0 - uAge) * smoothstep(0.0, 0.08, uAge);
  gl_FragColor = vec4(uColor * rim * fade * 0.7, 1.0);
}
`;function Do(a,e,t,s){const i=Ke(t),r=new se,o={blending:Z,transparent:!0,depthWrite:!1},l=[],c=[],u=new $({uniforms:{uWall:{value:0},uR:{value:e},uColor:{value:new W(wt)},uColor2:{value:new W(bt)},uOctaves:{value:3}},vertexShader:Po,fragmentShader:_o,...o}),d=new Ce(e*9,e*9),h=new D(d,u);h.frustumCulled=!1,h.renderOrder=4,r.add(h),l.push(d,u),c.push(u);const p=[];for(let j=0;j<3;j++){const _=e*(1.6+j*.36),z=e*.13,A=new xs(_,_+z,256,1),L=_+z/2,V=Math.round(Math.PI*2*L/(z*.44*.62)),F=new $({uniforms:{uWall:{value:0},uInner:{value:_},uOuter:{value:_+z},uCells:{value:V},uSpeed:{value:(.6+i()*.8)*(j%2?-1:1)},uSeedF:{value:i()*100},uColor:{value:new W(wt)},uColor2:{value:new W(bt)}},vertexShader:"varying vec2 vPos; void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:Eo,side:Se,...o}),q=new D(A,F);q.renderOrder=4,q.rotation.set(Math.PI/2+(i()-.5)*1.4,(i()-.5)*1.4,i()*Math.PI),r.add(q),p.push({mesh:q,spin:(.02+i()*.03)*(j%2?-1:1),base:q.rotation.z}),l.push(A,F),c.push(F)}const g=(1+Math.sqrt(5))/2,f=[[0,1,g],[0,-1,g],[1,g,0],[-1,g,0],[g,0,1],[-g,0,1]].map(([j,_,z])=>new M(j,_,z).normalize()),v=at(a,e,1.004,Lo,wt,bt,.55,t+11,s,!0);v.material.uniforms.uAxes={value:f};const b=700,x=new Float32Array(b*4),S=new Float32Array(b),N=new Float32Array(b);for(let j=0;j<b;j++)x.set([e*(1.15+Math.pow(i(),1.5)*1.6),(i()-.5)*2.4,i()*Math.PI*2,i()*Math.PI*2],j*4),S[j]=(.03+i()*.06)*(i()<.5?-1:1),N[j]=i();const T=new de;T.setAttribute("position",new te(new Float32Array(b*3),3)),T.setAttribute("orbit",new te(x,4)),T.setAttribute("speed",new te(S,1)),T.setAttribute("twinkle",new te(N,1));const R=new $({uniforms:{uTime:{value:0},uWall:{value:0},uPixels:{value:900},uColor:{value:new W(wt)}},vertexShader:Io,fragmentShader:Fo,...o}),k=new Te(T,R);k.frustumCulled=!1,r.add(k),l.push(T,R),c.push(R);const C=new le(e,96,48),E=[0,1].map(()=>{const j=new $({uniforms:{uAge:{value:0},uColor:{value:new W(bt)}},vertexShader:pi,fragmentShader:zo,...o}),_=new D(C,j);return _.renderOrder=4,r.add(_),l.push(j),{mesh:_,material:j}});return l.push(C),a.add(r),{update:(j,_)=>{for(const z of c)z.uniforms.uWall.value=_;v.update(j,_);for(const z of p)z.mesh.rotation.z=z.base+_*z.spin;E.forEach((z,A)=>{const L=((_/7+A*.5)%1+1)%1;z.material.uniforms.uAge.value=L,z.mesh.scale.setScalar(1.02+L*2.2)})},dispose:()=>{r.removeFromParent(),v.dispose(),l.forEach(j=>j.dispose())},surface:v.mesh}}class Wo{live=[];constructor(e,t){const{scene:s,radius:i,seed:r,shared:o}=t;let l=0;const c=()=>r+7919*++l;for(const u of e)switch(u){case"satellites":this.live.push(sa(s,i,c(),48,!0,!1));break;case"swarm":this.live.push(sa(s,i,c(),320,!1,!0),yo(s,i));break;case"aurora":this.live.push(at(s,i,1.03,wo,t.auroraColor?.[0]??4259728,t.auroraColor?.[1]??16728192,1.4,c(),o,!1));break;case"belts":this.live.push(ko(s,i));break;case"volcanic":case"smoke":case"seeps":case"snow":this.live.push(To(s,i,c(),Co[u],o));break;case"livingGas":this.live.push(at(s,i,1.018,bo,11559167,4251903,.9,c(),o,!0));break;case"presence":this.live.push(at(s,i,1.12,So,14742783,10535167,.5,c(),o,!1));break;case"ripples":this.live.push(at(s,i,1.08,Mo,9067775,4243711,.8,c(),o,!1));break;case"monolith":this.live.push(Ao(s,i,c()));break;case"shards":this.live.push(aa(s,i,c(),"shards"));break;case"debris":this.live.push(aa(s,i,c(),"debris"));break;case"jets":this.live.push(Ro(s,i,o));break;case"divine":this.live.push(Do(s,i,c(),o));break}}update(e,t,s){for(const i of this.live)i.surface?.quaternion.copy(s),i.update(e,t)}dispose(){this.live.forEach(e=>e.dispose()),this.live=[]}}function Oo(a){const e=new Set,t=String(a?.planet_info?.type??a?.original_planet_data?.planet_type??"").toLowerCase().replace(/_/g," "),s=String(a?.original_planet_data?.life_forms??"None"),i=a?.surface_elements??{};return s==="Intelligent Life"&&e.add("satellites"),s==="Robotic Entities"&&e.add("swarm"),s==="Conscious Gas"&&e.add("livingGas"),s==="Non-Physical Entity"&&e.add("presence"),s==="Have I just found God?"&&e.add("divine"),(t==="lava"||t==="molten core"||t==="magma")&&e.add("volcanic"),t==="carbon"&&e.add("smoke"),(t==="toxic"||t==="swamp"&&i.toxic_bubbles)&&e.add("seeps"),(t==="tundra"||t==="desert"||t==="carbon"||t==="toxic")&&e.add("snow"),t==="radioactive"&&(e.add("belts"),e.add("aurora")),t==="exotic"&&e.add("shards"),t==="anomaly"&&(e.add("ripples"),e.add("monolith"),e.add("jets")),i.has_fragmentation_zones&&e.add("debris"),e}const js=`
uniform vec3 uDeep, uShallow, uLow, uMid, uHigh, uPeak, uAccent, uEmissive;
uniform float uSea, uRelief, uContinentScale, uIceCap, uVegetation, uSpecular, uRoughness, uMetal;
uniform float uEmission, uCityLights, uCraters, uBands, uStorms, uClouds, uTime, uCloudSpin;
uniform vec3 uSeed;
uniform vec3 uCloudColor;
// Per-planet structure: variant of the family (0..3), twist of the shapes, feature size
uniform float uVariant, uWarp, uFeature, uLifeGlow, uBandFreq, uBloom;
// Kind within a family that holds several planet types (see PlanetLook.style)
uniform float uStyle;
`,fi=`
vec3 rotY(vec3 p, float a) { float c = cos(a), s = sin(a); return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z); }

float cloudDensity(vec3 p, float octaves) {
  vec3 r = rotY(p, uCloudSpin);
  float lat = r.y;
  // Weather is stretched east-west by the planet's spin, and swirls into systems
  vec3 q = vec3(r.x * 2.0, r.y * 3.4, r.z * 2.0) + uSeed * 1.7;
  vec3 w = vec3(fbmN(q * 0.7 + vec3(0.0, 0.0, uTime * 0.004), 4.0), fbmN(q * 0.7 + vec3(5.2, 1.3, uTime * 0.003), 4.0), fbmN(q * 0.7 + vec3(2.7, 8.1, 0.0), 4.0));
  float n = fbmN(q + w * 2.2, octaves);
  // Wispy edges: high frequencies eat into the thin parts
  float erosion = fbmN(q * 4.0 + w, max(octaves - 2.0, 2.0)) * 0.22;
  float cover = mix(0.38, -0.25, uClouds);
  // Clear belts near the subtropics, the most cloud at mid latitudes
  cover += 0.1 * cos(lat * 9.0);
  // Soft edges: thin cloud thickens gradually into the dense cores
  return smoothstep(cover, cover + 0.6, n - erosion * (1.0 - smoothstep(cover + 0.1, cover + 0.45, n)));
}
`,Ut=`
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vObj = normalize(position);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  vWorldNormal = normalize(mat3(modelMatrix) * normalize(position));
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,Go=`
${Me}
${bs}
${js}
${fi}
uniform mat3 uWorldToObject;
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
#if defined(HAS_RINGS)
${ui}
uniform vec3 uRingNormal;
uniform float uPlanetRadius;
#endif

// Bump mapping from screen derivatives of the height (Mikkelsen)
vec3 bumped(vec3 pos, vec3 n, float h) {
  vec3 dpx = dFdx(pos), dpy = dFdy(pos);
  float dhx = dFdx(h), dhy = dFdy(h);
  vec3 r1 = cross(dpy, n), r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - grad);
}

// Impact craters: bowl, raised rim, at two scales
float craterField(vec3 p, float scale) {
  vec3 c = cellular(p * scale);
  float size = 0.25 + 0.3 * fract(c.z * 7.13);
  float t = c.x / size;
  float bowl = t < 1.0 ? (t * t - 1.0) : 0.0;
  float rim = exp(-pow((t - 1.0) / 0.18, 2.0)) * 0.35;
  float present = step(0.45, fract(c.z * 3.71));
  return (bowl + rim) * present;
}

// A Ruby Cloud's gem glints: each a corundum crystal, a flat hexagonal plate, as corundum
// grows. The nearest of the feature points around x (the same as cellular's, so its id
// is cellular's .z), seen on the sphere at p: the plate turned its own way and tilted
// (foreshortened), with crisp but unaliased edges and brighter rims, as a cut stone's.
// Returns x: coverage (0..1), y: unused, z: the crystal's id
vec3 gemCrystal(vec3 x, vec3 p) {
  vec3 cell = floor(x);
  vec3 f = fract(x);
  float d1 = 8.0, id = 0.0;
  vec3 toFeature = vec3(0.0);
  for (int i = -1; i <= 1; i++)
    for (int j = -1; j <= 1; j++)
      for (int k = -1; k <= 1; k++) {
        vec3 o = vec3(float(i), float(j), float(k));
        vec3 h = hash33(cell + o);
        vec3 r = o + h - f;
        float d = dot(r, r);
        if (d < d1) { d1 = d; id = h.x; toFeature = r; }
      }
  // Into the plane of the sphere there
  vec3 up = abs(p.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(up, p));
  vec3 t2 = cross(p, t1);
  vec2 q = vec2(dot(toFeature, t1), dot(toFeature, t2));
  float angle = fract(id * 17.31) * 1.0472;
  float c = cos(angle), s = sin(angle);
  q = vec2(c * q.x - s * q.y, s * q.x + c * q.y);
  q.y /= 0.45 + 0.55 * fract(id * 29.7);
  q = abs(q);
  float hex = max(q.x * 0.8660254 + q.y * 0.5, q.y);
  float size = 0.22 + 0.14 * fract(id * 5.3);
  float edge = max(fwidth(hex), size * 0.06);
  float plate = 1.0 - smoothstep(size - edge, size, hex);
  float rim = 0.7 + 0.3 * smoothstep(size * 0.55, size - edge, hex);
  return vec3(plate * rim, 0.0, id);
}

#if defined(FAMILY_DIAMOND)
// What a diamond facet sees, inside or out: black space, faint stars, the glow of the
// galaxy, and the star (a sharp disc and a softer halo)
vec3 diamondSky(vec3 d) {
  float s = max(dot(d, uLightDir), 0.0);
  vec3 star = uSunColor * uSunIntensity * (pow(s, 600.0) * 30.0 + pow(s, 40.0) * 0.6 + pow(s, 6.0) * 0.05);
  float stars = step(0.9985, hash33(floor(d * 240.0)).x) * 0.15;
  float galaxy = exp(-pow(dot(d, normalize(vec3(0.25, 1.0, 0.15))) / 0.3, 2.0)) * 0.035;
  return star + vec3(stars) + vec3(0.55, 0.6, 0.8) * galaxy;
}
#endif

#if defined(FAMILY_MIRROR)
// The stars a mirror reflects. Each is a point, so its image is as small as the optics allow:
// blurred by the metal's roughness and never smaller than what one pixel covers of the
// reflected sky (footprint, radians). A star whose image the pixel can't resolve spreads
// its light over it, dimmer, instead of flickering on and off: the same light, filtered.
// Some three thousand stars over the sky, as the naked eye sees it: most faint, a few
// bright (a steep power law), of varied colour (cool red to hot blue). One may sit in some
// of the cells of a grid on the sky; the eight cells around the direction are searched
vec3 mirrorStars(vec3 d, float footprint, float rough) {
  const float S = 40.0;
  vec3 g = d * S;
  vec3 base = floor(g - 0.5);
  float core = 0.003;
  float sigma2 = core * core + footprint * footprint + (rough * 0.03) * (rough * 0.03);
  vec3 sum = vec3(0.0);
  for (int i = 0; i < 8; i++) {
    vec3 cell = base + vec3(float(i & 1), float((i >> 1) & 1), float((i >> 2) & 1));
    vec3 h = hash33(cell + 17.0);
    if (h.z > 0.15) continue;
    vec3 star = normalize((cell + h) / S);
    vec3 diff = d - star;
    float flux = pow(fract(h.x * 13.7), 10.0) * 1.6 + 0.04;
    vec3 tint = mix(vec3(1.0, 0.72, 0.5), vec3(0.7, 0.82, 1.0), fract(h.y * 7.3));
    sum += tint * flux * (core * core / sigma2) * exp(-dot(diff, diff) / (2.0 * sigma2));
  }
  return sum * 4.0;
}

// What a mirror world mirrors: the star (sharper the smoother the metal), the stars, the
// galaxy's dusty band across the sky and the faint glow of the rest of it.
// uGalaxy: xyz towards the galaxy's core in its own frame (its disc on XZ), w 1 inside one
uniform vec4 uGalaxy;
vec3 mirrorSky(vec3 d, float rough, float footprint) {
  float s = max(dot(d, uLightDir), 0.0);
  float sharp = mix(2000.0, 120.0, clamp(rough * 6.0, 0.0, 1.0));
  vec3 star = uSunColor * uSunIntensity * (pow(s, sharp) * 40.0 + pow(s, 24.0) * 0.5 + pow(s, 4.0) * 0.08);
  vec3 stars = mirrorStars(d, footprint, rough);
  // The galaxy as it really lies from here: its disc's band across the sky (the disc is on
  // XZ), brightest towards the core, the warm glow of the bulge there; nebulae around it
  // (broad bright and dark patches, which is what makes chrome read as chrome)
  vec3 core = uGalaxy.w > 0.5 ? uGalaxy.xyz : vec3(0.0);
  float toCore = max(dot(d, core), 0.0);
  float band = exp(-d.y * d.y / 0.3) * (0.55 + 0.9 * toCore * toCore);
  float bulge = exp(-(1.0 - toCore) * 7.0) * uGalaxy.w;
  float clouds = smoothstep(-0.3, 0.6, fbmN(d * 2.2 + 7.0, 5.0));
  float dust = 1.0 - 0.6 * smoothstep(0.1, 0.5, fbmN(d * 5.0 + 3.0, 4.0)) * band;
  // (the sky's glow as faint as the night sides of the other planets: no light of its own)
  vec3 glow = ((vec3(0.62, 0.66, 0.8) * band * 0.45 + vec3(1.0, 0.84, 0.6) * bulge * 0.5 + vec3(0.34, 0.36, 0.46) * clouds * 0.35) * dust + vec3(0.03, 0.035, 0.05)) * 0.45;
  return star + stars + glow;
}
#endif

void main() {
  vec3 p = normalize(vObj);
  vec3 ng = normalize(vWorldNormal);
  vec3 v = normalize(cameraPosition - vWorldPos);
  vec3 q = p * uContinentScale + uSeed;
  float lat = p.y;
  float alat = abs(lat);

  vec3 albedo;
  float height;          // for bumps, in radii
  float spec = uSpecular, rough = uRoughness, metal = uMetal;
  vec3 emission = vec3(0.0);
  float wet = 0.0;       // 1 over open water
  float landMask = 0.0;  // where cities may be
  float rubyHeat = 0.0;  // a Ruby Cloud's day-side incandescence (0..1)

#if defined(FAMILY_TERRAN)
  // Continents: big coherent shapes, twisted by the planet's own warp. Variants: 0 a few
  // continents, 1 an archipelago, 2 a single supercontinent, 3 continents split by rifts
  vec3 w = vec3(fbmN(q * 0.8 + vec3(5.2, 1.3, 2.8), 3.0), fbmN(q * 0.8 + vec3(1.7, 9.2, 4.1), 3.0), fbmN(q * 0.8 + vec3(8.3, 2.8, 6.6), 3.0));
  float k = uVariant < 0.5 ? 0.9 : uVariant < 1.5 ? 2.2 : uVariant < 2.5 ? 0.6 : 1.1;
  float cont = fbm(q * k + w * (0.35 + uWarp * 0.4)) * 1.5;
  if (uVariant > 1.5 && uVariant < 2.5) cont += dot(p, normalize(uSeed - 50.0)) * 0.45;
  if (uVariant > 2.5) cont -= pow(1.0 - abs(snoise(q * 1.3 + w)), 10.0) * 0.6;
  float landF = smoothstep(uSea, uSea + 0.06, cont);
  // Mountain belts along the edges of the continents, like colliding plates
  float belt = exp(-pow((cont - uSea - 0.22) / 0.16, 2.0));
  float mountains = ridged(q * 2.4 * uFeature + w, uOctaves - 1.0) * (0.35 + belt) * smoothstep(uSea, uSea + 0.3, cont);
  float h = cont + mountains * 0.5 * uRelief;
  // Climate: wet tropics and temperate belts, dry subtropics, drier far inland
  float coastal = 1.0 - smoothstep(0.0, 0.5, cont - uSea);
  float moisture = fbmN(q * 1.1 + vec3(3.0), 4.0) * 0.8 + 0.3 * (1.0 - smoothstep(0.12, 0.35, alat)) - 0.35 * exp(-pow((alat - 0.42) / 0.12, 2.0)) + 0.25 * coastal;
  float altitude = clamp((h - uSea) / 1.2, 0.0, 1.0);
  // Ground: soil and rock by altitude, then vegetation where it is wet and warm enough
  vec3 soil = mix(uLow, uMid, smoothstep(0.05, 0.4, altitude));
  soil = mix(soil, uHigh, smoothstep(0.4, 0.7, altitude));
  vec3 green = mix(uAccent, uAccent * 1.35, 0.5 + 0.5 * fbmN(q * 3.0, 3.0));
  float veg = uVegetation * smoothstep(-0.15, 0.3, moisture) * (1.0 - smoothstep(0.35, 0.6, altitude)) * (1.0 - smoothstep(0.6, 0.85, alat));
  vec3 land = mix(soil, green, veg);
  // Dry belts turn to sand
  vec3 sand = mix(uMid, vec3(0.74, 0.6, 0.4), 0.55);
  land = mix(land, sand, (1.0 - veg) * smoothstep(-0.05, -0.4, moisture) * 0.8);
  // Water: deeper is darker
  // Shelves along the coasts, then the open ocean drops away
  float depth = clamp((uSea - cont) / 0.18, 0.0, 1.0);
  vec3 water = mix(uShallow, uDeep, smoothstep(0.0, 0.6, depth));
  // Microbial life: plankton blooms swirling in the currents, turquoise and milky green
  if (uBloom > 0.0) {
    vec3 bw = vec3(fbmN(q * 3.0 + 2.0, 3.0), fbmN(q * 3.0 + 6.0, 3.0), 0.0);
    float bloom = smoothstep(0.25, 0.6, fbmN(q * 5.0 + bw * 2.5, 5.0)) * (1.0 - smoothstep(0.3, 0.7, alat));
    water = mix(water, vec3(0.08, 0.42, 0.38), bloom * 0.55 * uBloom);
  }
  albedo = mix(water, land, landF);
  wet = 1.0 - landF;
  landMask = landF * (1.0 - smoothstep(0.4, 0.6, altitude));
  // Ice: polar caps (wavy edge) and high peaks; frozen seas too
  float ice = smoothstep(uIceCap, uIceCap + 0.04, alat + 0.06 * fbmN(q * 4.0, 3.0) + altitude * 0.35 * landF);
  ice = max(ice, smoothstep(0.82, 0.95, altitude + mountains * 0.15) * landF);
  albedo = mix(albedo, uPeak, ice);
  wet *= 1.0 - ice;
  landMask *= 1.0 - ice;
  height = (landF > 0.0 ? max(h - uSea, 0.0) : 0.0) * 0.012 * uRelief + (1.0 - landF) * fbmN(p * 60.0 + vec3(uTime * 0.02), 2.0) * 0.0004;
  spec = mix(0.04, 1.0, wet);
  rough = mix(0.85, 0.12, wet);

#elif defined(FAMILY_DESERT)
  vec3 w = vec3(fbmN(q + vec3(5.2, 1.3, 2.8), 3.0), fbmN(q + vec3(1.7, 9.2, 4.1), 3.0), 0.0);
  float base = fbm(q + w * 0.6);
  // Dark rocky plateaus (hamada), sand seas (ergs) in the basins, dry river valleys
  float rock = smoothstep(-0.12, 0.25, fbmN(q * 1.6 + vec3(7.0) + w * 0.5, uOctaves));
  float erg = smoothstep(0.05, -0.3, base) * (1.0 - rock);
  float valleys = 1.0 - smoothstep(0.0, 0.05, abs(fbmN(q * 2.3 + w * 0.8, 5.0)));
  valleys *= 1.0 - erg;
  // Dune fields: long crests across the prevailing wind, broken by noise
  float dunePhase = dot(p, normalize(vec3(0.8, 0.15, 0.55))) * 90.0 + fbmN(q * 3.0, 3.0) * 6.0;
  float dunes = pow(0.5 + 0.5 * sin(dunePhase), 3.0) * erg;
  float h = base * 0.6 + rock * 0.3 - valleys * 0.2 + ridged(q * 3.0, uOctaves - 2.0) * rock * 0.3;
  vec3 sand = mix(uLow, uPeak, 0.25 + 0.25 * fbmN(q * 8.0, 3.0));
  albedo = mix(uMid, uLow, smoothstep(-0.25, 0.25, base + fbmN(q * 5.0, 4.0) * 0.25));
  albedo = mix(albedo, sand, erg * (0.6 + 0.4 * dunes));
  albedo = mix(albedo, uHigh, rock * (0.55 + 0.25 * fbmN(q * 9.0, 4.0)));
  albedo = mix(albedo, uHigh * 0.8, valleys * 0.5);
  // Variants: 0 dune seas, 1 a great rift valley, 2 cratered like Mars, 3 terraced mesas
  if (uVariant > 0.5 && uVariant < 1.5) {
    float rift = pow(1.0 - abs(snoise(q * 0.55 + w * 0.6)), 28.0) * smoothstep(0.75, 0.3, alat);
    h -= rift * 0.9;
    albedo = mix(albedo, uHigh * 0.65, rift * 0.8);
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    float cr = craterField(p, 4.5 * uFeature) * 0.6 + craterField(p + 3.1, 12.0 * uFeature) * 0.3 * clamp(uOctaves - 4.0, 0.0, 1.0);
    h += cr * (0.5 + uCraters);
    albedo *= 1.0 + cr * 0.25;
  } else if (uVariant > 2.5) {
    float steps = 5.0;
    float terraced = floor(h * steps) / steps + smoothstep(0.0, 0.25, fract(h * steps)) / steps;
    h = mix(h, terraced, rock);
    albedo = mix(albedo, uHigh * 1.2, smoothstep(0.05, 0.0, fract(h * steps)) * rock * 0.5);
  }
  // Frost on the poles of cold deserts
  albedo = mix(albedo, uPeak * 1.1, smoothstep(0.9, 0.97, alat + fbmN(q * 4.0, 3.0) * 0.04) * 0.7);
  height = (h * 0.009 + dunes * 0.0008) * uRelief;
  landMask = 1.0 - valleys;

#elif defined(FAMILY_BARREN) || defined(FAMILY_RADIOACTIVE)
  vec3 w = vec3(fbmN(q * 0.9, 3.0), fbmN(q * 0.9 + 4.4, 3.0), fbmN(q * 0.9 + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.2 + w);
  float rough1 = ridged(q * 3.0 * uFeature + w, uOctaves - 2.0);
  float f = uFeature;
  float craters = craterField(p, 4.0 * f) * 0.6 + craterField(p + 3.7, 11.0 * f) * 0.3 * clamp(uOctaves - 4.0, 0.0, 1.0) + craterField(p + 9.1, 26.0 * f) * 0.15 * clamp(uOctaves - 6.0, 0.0, 1.0);
  craters *= uCraters;
  float h = base * 0.6 + rough1 * 0.25 + craters;
  albedo = mix(uLow, uMid, smoothstep(-0.4, 0.4, base + fbmN(q * 7.0, 4.0) * 0.3));
  albedo = mix(albedo, uHigh, smoothstep(0.45, 0.8, rough1));
  // Variants: 0 saturated with craters, 1 dark lava plains (maria) like the Moon,
  // 2 tectonic scarps and fractures, 3 a giant impact basin with ring walls
  if (uVariant > 0.5 && uVariant < 1.5) {
    float maria = smoothstep(0.05, -0.15, fbmN(q * 0.8 + w, 5.0));
    albedo = mix(albedo, uLow * 0.45, maria);
    h = mix(h, base * 0.15, maria * 0.8);
    craters *= 1.0 - maria * 0.7;
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    float scarps = pow(1.0 - abs(snoise(q * 1.8 + w * 2.0)), 14.0) + pow(1.0 - abs(snoise(q * 4.2 + 7.0)), 18.0) * 0.6;
    h += scarps * 0.5;
    albedo = mix(albedo, uHigh * 1.15, scarps * 0.4);
  } else if (uVariant > 2.5) {
    vec3 centre = normalize(uSeed - 50.0);
    float d = acos(clamp(dot(p, centre), -1.0, 1.0)) / 0.9;
    float basin = (d < 1.0 ? (d * d - 1.0) * 0.8 : 0.0) + exp(-pow((d - 1.0) / 0.08, 2.0)) * 0.5 + exp(-pow((d - 1.45) / 0.06, 2.0)) * 0.25;
    h += basin;
    albedo = mix(albedo, uLow * 0.7, smoothstep(1.0, 0.6, d) * 0.5);
  }
  // Fresh crater rims are brighter, floors darker
  albedo *= 1.0 + craters * 0.35;
  height = h * 0.008 * uRelief;
  landMask = 0.4;
#if defined(FAMILY_RADIOACTIVE)
  // The crust is split open over glowing ore; luminous sludge pools in the craters and
  // basins, with a blue Cherenkov core where it is deepest; the ground around fissures
  // and pools is stained a sickly yellow-green, and hot spots flare and fade
  vec3 cells = cellular(q * 3.0 + w * 0.5);
  float gap = cells.y - cells.x;
  float fissure = 1.0 - smoothstep(0.0, 0.05, gap);
  vec3 fineCells = cellular(q * 9.0 + w);
  float fineCracks = (1.0 - smoothstep(0.0, 0.03, fineCells.y - fineCells.x)) * 0.5 * clamp(uOctaves - 4.0, 0.0, 1.0);
  float pools = max(smoothstep(-0.18, -0.38, craters), smoothstep(-0.3, -0.5, base + fbmN(q * 4.0, 3.0) * 0.15));
  float deep = max(smoothstep(-0.35, -0.6, craters), smoothstep(-0.45, -0.65, base));
  float stain = max(1.0 - smoothstep(0.0, 0.22, gap), smoothstep(-0.02, -0.3, craters)) * (0.6 + 0.4 * fbmN(q * 6.0, 3.0));
  float flare = smoothstep(0.55, 0.9, snoise(q * 1.4 + vec3(uTime * 0.03)));
  float pulse = 0.7 + 0.3 * sin(uTime * 1.3 + cells.z * 20.0);
  albedo = mix(albedo, mix(vec3(0.42, 0.46, 0.1), uEmissive * 0.4, 0.4), clamp(stain, 0.0, 1.0) * 0.55);
  albedo = mix(albedo, uEmissive * 0.3, max(fissure * 0.6, pools));
  emission = uEmissive * (fissure * 1.6 + fineCracks + pools * (0.9 + 0.3 * pulse) + flare * (fissure + stain) * 0.8) * pulse * uEmission;
  emission += vec3(0.35, 0.65, 1.0) * deep * (0.8 + 0.2 * pulse) * uEmission;
  // Sludge lies flat in the hollows
  height = mix(height, -0.001 * uRelief, pools);
  // It glows bright enough to be seen in daylight too
  emission *= 1.5;
#endif

#elif defined(FAMILY_METAL)
  // A world of bare metal: broad plains that once flowed and set mirror-smooth, scoured
  // and frosted elsewhere, and crusted with oxide (rust, verdigris, tarnish, temper
  // colours) in the low ground and on the oldest surfaces, dull and rough, so it reads
  // as metal and never as a gem. Impacts expose fresh, bright metal. Variants: 0 smooth
  // seas of metal under oxidised highlands, 1 brushed (long grooves), 2 cast (frozen
  // flow ripples), 3 armour plates
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.1 + w);
  float detail = fbmN(q * 6.0 * uFeature + w, uOctaves - 2.0);
  vec3 dir = normalize(hash33(uSeed) - 0.5);
  float along = dot(p, dir);
  float grooves = pow(abs(sin((along * 160.0 + fbmN(q * 2.0, 3.0) * 8.0) * uFeature)), 6.0);
  float grooveAmount = uVariant > 0.5 && uVariant < 1.5 ? 1.0 : 0.15;
  float flow = sin((base * 30.0 + along * 12.0) * uFeature);
  float castAmount = uVariant > 1.5 && uVariant < 2.5 ? 1.0 : 0.0;
  float seams = 0.0;
  if (uVariant > 2.5) {
    vec3 plates = cellular(q * 3.0 * uFeature + w * 0.4);
    seams = 1.0 - smoothstep(0.0, 0.025, plates.y - plates.x);
  }
  float craters = craterField(p, 5.0 * uFeature) * uCraters * 0.6 + craterField(p + 2.2, 14.0 * uFeature) * uCraters * 0.3;
  float fresh = smoothstep(0.0, -0.3, craters);
  // Smooth seas where the metal pooled and set
  float sea = uVariant < 0.5 ? smoothstep(0.0, -0.2, base) : smoothstep(-0.25, -0.45, base) * 0.6;
  float oxide = smoothstep(0.0, 0.35, fbmN(q * 2.2 + w + 3.0, uOctaves - 1.0) + base * 0.5 - 0.05);
  oxide *= (1.0 - fresh) * (1.0 - sea);
  vec3 bare = mix(uLow, uMid, smoothstep(-0.5, 0.5, base + detail * 0.3));
  bare = mix(bare, uMid * 1.15, max(fresh * 0.6, sea * 0.3));
  vec3 crust = mix(uAccent, uHigh * 0.6, 0.3) * (0.5 + 0.5 * fbmN(q * 12.0, 3.0));
  albedo = mix(bare, crust, oxide);
  albedo = mix(albedo, uHigh, seams * 0.8);
  metal = 1.0 - oxide * 0.95;
  spec = mix(1.0, 0.08, oxide);
  rough = mix(uRoughness * (1.0 + grooves * grooveAmount * 0.6 + detail * 0.4) * (1.0 - sea * 0.7), 0.85, oxide);
  height = (base * 0.005 * (1.0 - sea * 0.8) + craters * 0.006 - seams * 0.004 + grooves * grooveAmount * 0.0006 + flow * castAmount * 0.0015 + oxide * detail * 0.002) * uRelief;
  landMask = 0.3;

#elif defined(FAMILY_CRYSTAL)
  // Fields of crystal breaking out of dark rock: each crystal a flat, tilted face that
  // flashes when it catches the star, coloured by thin-film interference. Variants:
  // 0 clustered fields, 1 long shards (aligned), 2 geodes (rings of crystals in
  // basins), 3 a fine druse covering everything
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.2 + w);
  vec3 sq = q;
  if (uVariant > 0.5 && uVariant < 1.5) sq += normalize(hash33(uSeed) - 0.5) * dot(q, normalize(hash33(uSeed) - 0.5)) * 2.5;
  float scale = (uVariant > 2.5 ? 16.0 : 6.0) * uFeature;
  vec3 cells = cellular(sq * scale + w);
  float field = uVariant > 2.5 ? 1.0 : smoothstep(-0.05, 0.2, fbmN(q * 1.4 + w + 2.0, 5.0));
  if (uVariant > 1.5 && uVariant < 2.5) {
    vec3 geode = cellular(q * 1.6 * uFeature);
    float ring = exp(-pow((geode.x - 0.38) / 0.12, 2.0));
    field = max(field * 0.3, ring);
  }
  float edges = 1.0 - smoothstep(0.0, 0.05, cells.y - cells.x);
  vec3 tilt = hash33(vec3(cells.z * 131.0, cells.z * 17.0, 3.0)) - 0.5;
  vec3 crystal = mix(uMid, uHigh, fract(cells.z * 9.1));
  crystal = mix(crystal, uAccent, smoothstep(0.85, 1.0, fract(cells.z * 4.7)) * 0.7);
  albedo = mix(uLow * (0.8 + 0.3 * base), crystal, field * (1.0 - edges * 0.6));
  height = (base * 0.004 + field * (dot(p, tilt) * 0.05 + (1.0 - cells.x) * 0.004)) * uRelief;
  rough = mix(0.7, uRoughness, field);
  spec = mix(0.05, 1.0, field);
  landMask = 0.2;

#elif defined(FAMILY_DIAMOND)
  // A diamond world. The crust is grown crystal: grains, each a crystal with its own
  // cleavage directions, cut into flat facets along three families of planes, with
  // growth terraces and triangular etch pits (trigons) on the faces. Its colour is not
  // painted on: it is the light it reflects, refracts and disperses (see the shading
  // below). Variants: 0 polycrystalline grains, 1 a single giant crystal (big facets,
  // stepped terraces), 2 diamond breaking through plains of dark graphite, 3 frosted
  // (a fine, sugar-like crust of tiny crystals)
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  bool oneCrystal = uVariant > 0.5 && uVariant < 1.5;
  vec3 grains = cellular(q * 1.8 * uFeature + w * 0.5);
  float grainId = oneCrystal ? 0.37 : grains.z;
  float boundary = oneCrystal ? 0.0 : 1.0 - smoothstep(0.0, 0.03, grains.y - grains.x);
  // Each grain its own growth direction (for the zoning seen inside)
  vec3 a1 = normalize(hash33(uSeed + grainId * 13.0 + 1.0) - 0.5);
  float k = (uVariant < 0.5 ? 14.0 : oneCrystal ? 7.0 : uVariant < 2.5 ? 16.0 : 40.0) * uFeature;
  // Facets: irregular flat faces, stretched a little along the grain's direction
  vec3 fq = q * k + a1 * dot(q, a1) * k * 0.6 + w * 0.6;
  vec3 facets = cellular(fq);
  vec3 cellId = vec3(facets.z * 97.0, grainId * 31.0, facets.z * 13.0);
  float edge = facets.y - facets.x;
  // Each facet leans its own way (applied to the normal below)
  vec3 facetTilt = hash33(cellId + uSeed) - 0.5;
  float base = fbm(q * 0.8);
  // Growth terraces across the faces of a big crystal; small triangular etch pits
  float terraceS = dot(q, a1) * k * 1.5;
  float terrace = oneCrystal ? 1.0 - smoothstep(0.0, 0.06, min(fract(terraceS), 1.0 - fract(terraceS))) : 0.0;
  vec3 pits = cellular(fq * 3.0);
  float trigon = smoothstep(0.12, 0.08, pits.x) * step(0.75, fract(pits.z * 5.3)) * clamp(uOctaves - 4.0, 0.0, 1.0);
  // Graphite plains (variant 2): the same carbon, unpressed, dark and dully lustrous
  float graphite = uVariant > 1.5 && uVariant < 2.5 ? smoothstep(0.05, -0.15, fbmN(q * 1.3 + w, 5.0)) : 0.0;
  albedo = mix(uLow, uHigh * (0.8 + 0.4 * fbmN(q * 9.0, 3.0)), graphite);
  height = (base * 0.003 - boundary * 0.003 - trigon * 0.002 - terrace * 0.001) * uRelief;
  rough = mix(uVariant > 2.5 ? 0.08 : uRoughness, 0.4, graphite);
  spec = 1.0;
  landMask = 0.1;

#elif defined(FAMILY_MIRROR)
  // A mirror world: a deck of metal clouds, smooth enough to mirror the sky, in faint
  // lanes where it thickens and roughens; slow ripples ruffle the reflections
  float drift = uTime * 0.004;
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp * 0.5;
  float lanes = sin(p.y * uBandFreq * 0.7 + fbmN(vec3(p.x * 2.0, p.y * 6.0, p.z * 2.0) + uSeed + w + vec3(drift), 4.0) * 2.0);
  float ripple = fbmN(vec3(p.x * 6.0, p.y * 30.0, p.z * 6.0) + uSeed + vec3(drift * 2.0), uOctaves - 1.0);
  // The deck churns in convection cells, like any cloud layer heated from below: each a
  // faintly domed top, the downdrafts between them rougher and a little duller. Two scales,
  // the finer one only where the view resolves it; the domes tilt the reflections a little
  vec3 cells = cellular(q * 4.0 * uFeature + w + vec3(drift));
  vec3 fineCells = cellular(q * 13.0 * uFeature + w * 1.5 + vec3(drift * 1.6));
  float fineSeen = clamp(uOctaves - 4.0, 0.0, 1.0);
  float domes = (1.0 - cells.x * cells.x) * 0.7 + (1.0 - fineCells.x * fineCells.x) * 0.3 * fineSeen;
  // (broad, soft downdrafts: a cloud deck's lanes, not cracks)
  float downdraft = (1.0 - smoothstep(0.0, 0.3, cells.y - cells.x)) * 0.6 + (1.0 - smoothstep(0.0, 0.2, fineCells.y - fineCells.x)) * 0.25 * fineSeen;
  albedo = mix(uLow, uLow * 0.82, smoothstep(-0.2, 1.0, lanes) * uBands * 0.6);
  albedo *= 1.0 - downdraft * 0.06;
  height = (lanes * 0.0008 + ripple * 0.0004) * uBands + domes * 0.0005 - downdraft * 0.0002;
  rough = uRoughness * (1.0 + smoothstep(0.3, 1.0, lanes) * 1.5 + downdraft * 1.2);
  spec = 1.0;
  metal = 1.0;

#elif defined(FAMILY_ICE)
  // Variants after the real icy moons: 0 Europa (long double ridges, rust-stained
  // lineae), 1 Enceladus (smooth, with "tiger stripes" at one pole), 2 Callisto (dirty
  // ice saturated with bright craters), 3 Triton (cantaloupe dimples)
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float base = fbm(q * 1.4 + w);
  float lines = 0.0;
  float craters = craterField(p, 6.0 * uFeature) * uCraters * 0.4;
  albedo = mix(uLow, uMid, smoothstep(-0.4, 0.4, base));
  if (uVariant < 0.5) {
    float l1 = pow(1.0 - abs(snoise(q * 3.0 * uFeature + w * 2.0)), 22.0);
    float l2 = pow(1.0 - abs(snoise(q * 7.0 * uFeature + 4.0 + w)), 26.0) * clamp(uOctaves - 4.0, 0.0, 1.0);
    lines = max(l1, l2 * 0.8);
    albedo = mix(albedo, uAccent, lines * 0.85);
    // Chaos terrain: blotches where the crust broke and refroze
    albedo = mix(albedo, uAccent * 0.8, smoothstep(0.55, 0.75, fbmN(q * 2.0 + 9.0, 4.0)) * 0.5);
  } else if (uVariant < 1.5) {
    vec3 pole = vec3(0.0, -1.0, 0.0);
    float polar = smoothstep(0.55, 0.85, dot(p, pole));
    float stripes = pow(abs(sin(dot(p, normalize(vec3(1.0, 0.0, 0.4))) * 28.0 + fbmN(q * 2.0, 3.0) * 2.0)), 14.0) * polar;
    lines = stripes;
    albedo = mix(uMid * 1.05, uAccent * 0.9, stripes * 0.8);
    craters *= smoothstep(0.3, -0.1, dot(p, pole));
  } else if (uVariant < 2.5) {
    craters = craterField(p, 5.0 * uFeature) * 0.7 + craterField(p + 3.0, 13.0 * uFeature) * 0.4 + craterField(p + 7.0, 30.0) * 0.2 * clamp(uOctaves - 5.0, 0.0, 1.0);
    albedo = mix(uAccent * 0.6, uLow, smoothstep(-0.3, 0.3, base));
    albedo = mix(albedo, uMid * 1.1, smoothstep(0.1, 0.4, craters));
  } else {
    vec3 dimples = cellular(q * 9.0 * uFeature + w);
    float cup = smoothstep(0.0, 0.5, dimples.x);
    lines = (1.0 - smoothstep(0.0, 0.08, dimples.y - dimples.x)) * 0.6;
    albedo = mix(albedo * 0.92, albedo * 1.05, cup);
    albedo = mix(albedo, uAccent, lines * 0.4);
    base += cup * 0.4;
  }
  height = (base * 0.004 + lines * 0.002 + craters * 0.005) * uRelief;
  landMask = 0.2;

#elif defined(FAMILY_LAVA)
  vec3 warp = vec3(fbmN(q * 2.0, 3.0), fbmN(q * 2.0 + 4.1, 3.0), fbmN(q * 2.0 + 8.3, 3.0));
  float flicker = 0.85 + 0.15 * snoise(q * 6.0 + vec3(uTime * 0.4));
  float crust = fbm(q * 3.0);
  float glow;
  vec3 hot;
  if (uStyle < 0.5) {
    // Lava world: a black crust of plates, irregular (warped cells) and of many sizes;
    // glowing seams between them, and pools of molten rock in the low ground
    vec3 cells = cellular(q * 5.5 + warp * 1.4);
    vec3 fine = cellular(q * 14.0 + warp * 2.0);
    float seam = cells.y - cells.x;
    float cracks = (1.0 - smoothstep(0.0, 0.035 + 0.03 * uEmission, seam)) * (0.6 + 0.4 * snoise(q * 9.0));
    cracks = max(cracks, (1.0 - smoothstep(0.0, 0.03, fine.y - fine.x)) * 0.35 * clamp(uOctaves - 4.0, 0.0, 1.0));
    float molten = smoothstep(0.42 - uEmission * 0.3, 0.62 - uEmission * 0.3, -fbm(q * 0.8 + warp * 0.5 + vec3(0.0, 0.0, uTime * 0.003)));
    glow = clamp(max(cracks, molten), 0.0, 1.0) * flicker;
    albedo = mix(uLow, uMid, smoothstep(-0.3, 0.4, crust));
    albedo = mix(albedo, uHigh, smoothstep(0.4, 0.8, fract(cells.z * 7.0)) * 0.35);
    albedo *= 1.0 - glow * 0.9;
    // Deep red at the edges of a flow, orange, then yellow where it is hottest
    hot = mix(vec3(0.55, 0.06, 0.01), vec3(1.0, 0.42, 0.06), smoothstep(0.2, 0.7, glow));
    hot = mix(hot, vec3(1.0, 0.78, 0.35), smoothstep(0.8, 1.0, glow) * molten);
    height = (crust * 0.005 + (1.0 - glow) * 0.006 * (1.0 - cells.x)) * uRelief;
  } else if (uStyle < 1.5) {
    // Magma ocean: the whole surface is molten. Convection wells up hot in the middle of
    // each cell (yellow), cools as it spreads (orange, red) and skins over into dark
    // rafts of crust that drift and pile up where the cells meet, cracking as they go
    float t = uTime * 0.003;
    vec3 conv = cellular(q * 2.0 * uFeature + warp * 0.9 + vec3(0.0, 0.0, t));
    float streak = fbmN(q * 9.0 + warp * 2.5 + vec3(t * 3.0), uOctaves - 1.0);
    float raft = smoothstep(0.4, 0.14, conv.y - conv.x + streak * 0.12);
    raft *= smoothstep(-0.25, 0.15, fbmN(q * 6.0 + warp * 2.0 + vec3(t * 2.0), 4.0) + 0.3);
    vec3 rc = cellular(q * 12.0 + warp * 2.0);
    float raftCracks = (1.0 - smoothstep(0.0, 0.04, rc.y - rc.x)) * raft;
    float heat = clamp(1.0 - conv.x * 2.2 + streak * 0.35, 0.0, 1.0);
    glow = clamp((1.0 - raft) * (0.55 + 0.45 * heat) + raftCracks * 0.6, 0.0, 1.0) * flicker;
    albedo = mix(mix(uLow, uMid, smoothstep(-0.3, 0.4, crust)), vec3(0.04, 0.015, 0.008), 1.0 - raft);
    hot = mix(vec3(0.6, 0.08, 0.01), vec3(1.0, 0.45, 0.07), heat);
    hot = mix(hot, vec3(1.0, 0.85, 0.45), smoothstep(0.75, 1.0, heat) * (1.0 - raft));
    height = (raft * 0.004 + crust * 0.002 * raft + streak * 0.0004) * uRelief;
  } else {
    // Molten core: the crust has been torn open down to the mantle. Huge dark slabs drift
    // apart over wide chasms of white-hot rock; each slab still glows red along its
    // edges as it cools, and is crazed with fine glowing cracks
    vec3 slabs = cellular(q * 1.6 * uFeature + warp * 0.6);
    float gap = slabs.y - slabs.x + snoise(q * 5.0) * 0.025;
    float chasm = 1.0 - smoothstep(0.04, 0.1 + 0.04 * uEmission, gap);
    float rim = exp(-max(gap, 0.0) / 0.12) * (1.0 - chasm);
    vec3 fine = cellular(q * 10.0 + warp * 1.5);
    float crazing = (1.0 - smoothstep(0.0, 0.025, fine.y - fine.x)) * clamp(uOctaves - 3.0, 0.0, 1.0) * (0.3 + 0.7 * rim);
    glow = clamp(chasm + rim * 0.55 + crazing * 0.45, 0.0, 1.0) * flicker;
    albedo = mix(uLow, uHigh, smoothstep(-0.3, 0.5, crust)) * (1.0 - chasm);
    albedo = mix(albedo, vec3(0.22, 0.1, 0.07), rim * 0.6);
    hot = mix(vec3(0.7, 0.12, 0.02), vec3(1.0, 0.55, 0.12), smoothstep(0.3, 0.8, glow));
    hot = mix(hot, vec3(1.0, 0.93, 0.75), chasm);
    height = ((1.0 - chasm) * 0.008 + crust * 0.003 - crazing * 0.001) * uRelief;
  }
  hot = mix(hot, uEmissive * 1.2, 0.2);
  emission = hot * glow * (0.9 + 1.1 * uEmission);

#elif defined(FAMILY_GAS) || defined(FAMILY_VEILED)
  vec3 g = p;
  // Storms: a few vortices twist the flow around them
  for (int i = 0; i < 3; i++) {
    vec3 centre = normalize(hash33(uSeed + float(i) * 17.0) - 0.5);
    centre.y *= 0.5;
    centre = normalize(centre);
    float r = 0.12 + 0.12 * hash33(uSeed + float(i) * 5.0).x;
    float d = distance(g, centre);
    float swirl = smoothstep(r, 0.0, d) * uStorms * 3.5;
    if (swirl > 0.0) {
      vec3 axis = centre;
      float a = swirl;
      g = g * cos(a) + cross(axis, g) * sin(a) + axis * dot(axis, g) * (1.0 - cos(a));
    }
  }
  float t = uTime * 0.01;
  // No solid surface: each band runs at its own speed, east or west, so the clouds shear
  g = rotY(g, uTime * 0.0004 * sin(g.y * uBandFreq * 0.5 + uSeed.x));
  float turbulence = fbmN(vec3(g.x * 2.5, g.y * 9.0, g.z * 2.5) + uSeed + vec3(t, 0.0, -t), uOctaves);
  float y = g.y + turbulence * 0.05 * (0.6 + uBands);
  // Waves curl along the edges where bands slide past each other
  y += sin(atan(g.z, g.x) * 22.0 + y * 60.0 + t * 3.0) * 0.006 * clamp(uOctaves - 3.0, 0.0, 1.0);
  float band = sin(y * uBandFreq + sin(y * 5.0 + uSeed.y) * 1.5);
  float fine = fbmN(vec3(g.x * 6.0, g.y * 40.0, g.z * 6.0) + uSeed + vec3(t * 2.0), uOctaves - 1.0);
  float b = band * (0.35 + uBands * 0.75) + fine * 0.45;
  albedo = mix(uMid, uLow, smoothstep(-0.6, 0.6, b));
  albedo = mix(albedo, uHigh, smoothstep(0.55, 1.0, b) * 0.8);
  albedo = mix(albedo, uAccent, smoothstep(-0.7, -1.0, b) * 0.6);
  // Storm ovals stand out in their own colour
  for (int i = 0; i < 3; i++) {
    vec3 centre = normalize(hash33(uSeed + float(i) * 17.0) - 0.5);
    centre.y *= 0.5;
    centre = normalize(centre);
    float r = 0.12 + 0.12 * hash33(uSeed + float(i) * 5.0).x;
    float oval = smoothstep(r * 0.7, r * 0.3, distance(p, centre)) * uStorms;
    albedo = mix(albedo, mix(uAccent, uHigh, 0.3 * float(i)), oval * 0.55);
  }
#if defined(FAMILY_GAS)
  // Variants: 0 Jupiter (as above), 1 Saturn (a hexagonal jet stream round the pole),
  // 2 Neptune (a dark spot and bright high clouds), 3 turbulent (no clear bands)
  if (uVariant > 0.5 && uVariant < 1.5) {
    float ang = atan(p.z, p.x);
    float hexR = 0.33 * (1.0 + 0.08 * cos(6.0 * ang + uSeed.x));
    float rad = length(p.xz);
    float hex = exp(-pow((rad - hexR) / 0.025, 2.0)) * step(0.0, p.y);
    albedo = mix(albedo, uAccent, hex * 0.6);
    albedo = mix(albedo, albedo * 0.75, smoothstep(hexR, hexR * 0.5, rad) * step(0.0, p.y) * 0.5);
  } else if (uVariant > 1.5 && uVariant < 2.5) {
    vec3 spotC = normalize(vec3(0.6, -0.35, 0.7) + (hash33(uSeed) - 0.5) * 0.5);
    float spot = smoothstep(0.16, 0.06, distance(p, spotC));
    albedo = mix(albedo, uAccent * 0.45, spot);
    float streaks = smoothstep(0.55, 0.8, fbmN(vec3(g.x * 3.0, g.y * 30.0, g.z * 3.0) + uSeed + 9.0, 4.0));
    albedo = mix(albedo, vec3(0.95), streaks * 0.75);
  } else if (uVariant > 2.5) {
    float churn = fbmN(g * 4.0 + vec3(t), uOctaves);
    albedo = mix(albedo, mix(uLow, uHigh, 0.5 + 0.5 * churn), 0.6);
  }
  if (uStyle > 0.5 && uStyle < 1.5) {
    // Ice giant: a deep methane haze softens the bands into faint stripes; bright methane
    // clouds ride high above it in long streaks, and a paler haze hoods one pole
    albedo = mix(albedo, mix(uLow, uMid, 0.5 + 0.5 * band), 0.5);
    float streaks = smoothstep(0.45, 0.8, fbmN(vec3(g.x * 3.0, g.y * 28.0, g.z * 3.0) + uSeed + 13.0, 4.0));
    streaks *= smoothstep(0.08, 0.25, alat) * (1.0 - smoothstep(0.7, 0.85, alat));
    albedo = mix(albedo, uHigh, streaks * 0.85);
    albedo = mix(albedo, mix(uLow, uHigh, 0.55), smoothstep(0.6, 0.92, lat) * 0.6);
  } else if (uStyle > 2.5 && uStyle < 3.5) {
    // Super-puff: so tenuous an envelope that its bands wash out into a soft pastel haze
    float haze = fbmN(g * 1.5 + uSeed + vec3(t * 0.5), 4.0);
    // Super-puff: below its haze's top there is only more haze, as optically thick as you
    // like, never a banded deck: the same colour HAZE_FRAGMENT gives it, seamless with it
    albedo = mix(uLow, uHigh, 0.5 + 0.15 * fbmN(vec3(p.x * 2.0, p.y * 7.0, p.z * 2.0) + uSeed, 3.0));
  } else if (uStyle > 3.5) {
    // Ruby cloud, an ultra-hot giant split in two (WASP-121 b): on the day side the
    // corundum evaporates and the sky burns cloudless, hottest east of the substellar point
    // where the winds carry the heat; on the night side it condenses into decks of ruby and
    // sapphire (uLow, uMid), pale crests, wine-red troughs where it rains out
    vec3 lightObj = uWorldToObject * uLightDir;
    vec3 hotDir = rotY(lightObj, 0.35);
    float dayness = smoothstep(-0.25, 0.35, dot(p, lightObj));
    vec3 gems = mix(uMid, uLow, smoothstep(-0.45, 0.45, b));
    gems = mix(gems, uAccent, smoothstep(-0.3, -0.9, b) * 0.5);
    gems = mix(gems, uHigh, smoothstep(0.8, 1.15, b) * 0.4);
    albedo = mix(gems, gems * 0.2, dayness);
    rubyHeat = smoothstep(-0.1, 0.9, dot(p, hotDir)) * (0.8 + 0.2 * fine);
  }
#endif
  // Hazy, darker poles (not under a Super Puff's haze, which is the same everywhere)
  if (uStyle < 2.5 || uStyle > 3.5) albedo *= 1.0 - smoothstep(0.75, 0.98, alat) * 0.35;
  // Nothing to cast bumps: the light sinks into the haze
  height = 0.0;
  emission = uEmissive * uEmission * smoothstep(0.2, 0.9, fine + band * 0.3) * 0.6;

#elif defined(FAMILY_EXOTIC)
  // Exotic matter: a glassy, iridescent crust laid out in an impossible geometry, glowing
  // along its seams; the pattern slowly drifts as if alive. Variants: 0 hexagons,
  // 1 triangles, 2 concentric shells, 3 interference waves
  vec3 w = vec3(fbmN(q, 3.0), fbmN(q + 4.4, 3.0), fbmN(q + 8.8, 3.0)) * uWarp;
  float drift = uTime * 0.01;
  float pattern;
  if (uVariant < 0.5) {
    vec3 cells = cellular(q * 6.0 * uFeature + w * 0.3);
    pattern = 1.0 - smoothstep(0.0, 0.06, cells.y - cells.x);
  } else if (uVariant < 1.5) {
    vec3 a = vec3(dot(q, vec3(1.0, 0.0, 0.0)), dot(q, vec3(-0.5, 0.0, 0.866)), dot(q, vec3(-0.5, 0.0, -0.866))) * 8.0 * uFeature + p.y * 5.0;
    vec3 fr = abs(fract(a) - 0.5);
    pattern = 1.0 - smoothstep(0.0, 0.05, min(min(fr.x, fr.y), fr.z));
  } else if (uVariant < 2.5) {
    float r = acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0));
    pattern = pow(abs(sin(r * 30.0 * uFeature - drift * 3.0 + fbmN(q, 3.0) * 2.0)), 20.0);
  } else {
    pattern = pow(abs(sin(dot(p, normalize(hash33(uSeed) - 0.5)) * 40.0 + drift * 4.0) * sin(dot(p, normalize(hash33(uSeed + 3.0) - 0.5)) * 40.0 - drift * 3.0)), 6.0);
  }
  float base = fbm(q * 1.5 + w + vec3(drift));
  albedo = mix(uLow, uMid, smoothstep(-0.5, 0.5, base));
  albedo = mix(albedo, uHigh, pattern * 0.5);
  float pulse = 0.7 + 0.3 * sin(uTime * 0.8 + base * 6.0);
  emission = uEmissive * pattern * pulse * uEmission * 1.6;
  height = (base * 0.004 + pattern * 0.002) * uRelief;
  spec = 0.8;
  rough = uRoughness;

#elif defined(FAMILY_ANOMALY)
  // An anomaly: a black, light-swallowing body wrapped in slow whorls of something that
  // glows, flowing towards one point. It barely reflects the star; it lights itself
  vec3 sink = normalize(uSeed - 50.0);
  float toSink = acos(clamp(dot(p, sink), -1.0, 1.0));
  vec3 axis = sink;
  float a = toSink * 4.0 - uTime * 0.05;
  vec3 g = p * cos(a) + cross(axis, p) * sin(a) + axis * dot(axis, p) * (1.0 - cos(a));
  float whorl = fbmN(g * 3.0 * uFeature + vec3(uTime * 0.01), uOctaves);
  float filaments = pow(1.0 - abs(whorl), 12.0);
  albedo = mix(uLow, uHigh, smoothstep(0.2, 0.7, whorl) * 0.3);
  emission = uEmissive * (filaments * 1.5 + exp(-toSink * 3.0) * 1.2) * uEmission;
  height = whorl * 0.002;
  spec = 0.1;
#endif

  vec3 n = bumped(vWorldPos, ng, height * 1.6);
#if defined(FAMILY_DIAMOND)
  // Flat facets: one normal per face, leaning its own way (no bump seams at the edges)
  vec3 lean = facetTilt - p * dot(facetTilt, p);
  n = normalize(n + normalize(transpose(uWorldToObject) * lean) * length(lean) * 1.3 * (1.0 - graphite));
#endif

  // Cloud shadows: the deck as seen from the star, slightly offset
#if !defined(FAMILY_GAS) && !defined(FAMILY_VEILED)
  float shadow = 1.0;
  if (uClouds > 0.01) {
    vec3 toSunObj = uWorldToObject * uLightDir;
    shadow = 1.0 - 0.4 * cloudDensity(normalize(p + toSunObj * 0.006), max(uOctaves - 3.0, 3.0));
  }
#else
  float shadow = 1.0;
#endif
#if defined(HAS_RINGS)
  // The rings' shadow: where the ray to the star crosses the ring plane
  float ln = dot(uLightDir, uRingNormal);
  if (abs(ln) > 1e-4) {
    float tr = -dot(vWorldPos, uRingNormal) / ln;
    if (tr > 0.0) shadow *= 1.0 - 0.85 * ringDensity(length(vWorldPos + uLightDir * tr) / uPlanetRadius);
  }
#endif

  float day = daylight(n, ng);
  vec3 sun = uSunColor * uSunIntensity;
  vec3 ambient = vec3(0.012, 0.014, 0.02) + albedo * 0.015;
  vec3 diffuse = albedo * (1.0 - metal) * sun * day * shadow;
#if defined(FAMILY_GAS) || defined(FAMILY_VEILED)
  // A deep atmosphere, not a surface: the light wraps softly past the terminator and the
  // limb darkens, as the line of sight runs through more haze
  float nlGas = dot(ng, uLightDir);
  diffuse = albedo * sun * smoothstep(-0.12, 0.55, nlGas) * (0.35 + 0.65 * max(nlGas, 0.0)) * mix(0.5, 1.0, pow(max(dot(ng, v), 0.0), 0.5)) * shadow;
#endif
  vec3 f0 = mix(vec3(0.02), albedo, metal) * mix(1.0, 3.0, spec * (1.0 - metal));
  vec3 highlight = specularGGX(n, v, max(rough, 0.05), f0) * sun * shadow * spec * smoothstep(-0.02, 0.1, dot(ng, uLightDir));
  float sunUp = smoothstep(-0.02, 0.1, dot(ng, uLightDir));
  vec3 r = reflect(-v, n);
#if defined(FAMILY_METAL)
  // Metal mirrors its surroundings: the dark sky above, a faint glow of the galaxy, and
  // the star's highlight stretched along the grooves
  // (a broad, polished sheen, unlike the pin-point sparks of crystal and diamond)
  ambient += metal * (albedo * (0.03 + 0.08 * smoothstep(-0.3, 0.6, r.y)) + albedo * pow(max(dot(r, uLightDir), 0.0), 3.0) * 0.1 * sunUp);
  highlight += metal * albedo * sun * pow(max(dot(r, uLightDir), 0.0), 14.0) * 0.5 * sunUp * shadow;
#elif defined(FAMILY_CRYSTAL)
  // Faces flash when they catch the star; thin-film colours shift with the angle
  float glint = pow(max(dot(r, uLightDir), 0.0), 300.0) * 5.0;
  highlight += sun * glint * spec * sunUp;
  vec3 iridescence = 0.5 + 0.5 * cos(6.2831 * (dot(n, v) * 1.8 + vec3(0.0, 0.33, 0.67)));
  diffuse = mix(diffuse, diffuse * iridescence * 1.5, spec * 0.45);
  ambient += albedo * 0.05 * spec;
#elif defined(FAMILY_DIAMOND)
  // Diamond is not lit like rock. What you see is (1) the sky and the star mirrored in
  // each facet (fresnel: 17 % head-on, a mirror at grazing angles); (2) light that went
  // in, bounced off a facet behind and came back out, bent by refraction and split into
  // colours (dispersion, the "fire"), or trapped inside (the dark facets that make the
  // sparkle read); (3) the stone itself, seen in depth: its body colour, growth zones,
  // inclusions, and the sunlight it soaks up
  float nv = max(dot(n, v), 0.0);
  float F = 0.17 + 0.83 * pow(1.0 - nv, 5.0);
  vec3 mirrored = diamondSky(r) * F;
  vec3 back = normalize(-ng + (hash33(cellId * 3.1 + 7.0) - 0.5) * 1.4);
  // Into the stone (parallax): look a little way below the facet
  vec3 inward = refract(-normalize(uWorldToObject * v), p, 1.0 / 2.42);
  vec3 pIn = p + inward * 0.04;
  float zoning = 0.5 + 0.5 * sin(dot(pIn * uContinentScale, a1) * k * 2.0 + fbmN(pIn * 6.0, 3.0) * 2.0);
  float inclusions = smoothstep(0.7, 0.9, fbmN(pIn * 18.0 + uSeed, 3.0));
  vec3 body = albedo * (0.75 + 0.25 * zoning) * (1.0 - inclusions * 0.7);
  float soak = smoothstep(-0.1, 0.5, dot(ng, uLightDir));
  // (dispersion a little stronger than real diamond's, so the fire reads from orbit)
  vec3 iorRGB = vec3(2.36, 2.42, 2.52);
  vec3 fireRGB = vec3(0.0);
  for (int c = 0; c < 3; c++) {
    vec3 tin = refract(-v, n, 1.0 / iorRGB[c]);
    vec3 tout = refract(reflect(tin, back), -n, iorRGB[c]);
    if (dot(tout, tout) > 0.0) {
      vec3 d = normalize(tout);
      // Where the traced ray leads: the star itself (fire), or the sunlit body of the
      // stone, glowing with the light it has soaked up
      float glow = pow(0.5 + 0.5 * dot(d, uLightDir), 5.0);
      fireRGB[c] = diamondSky(d)[c] + (body * sun)[c] * glow * soak * 0.9;
    }
  }
  fireRGB *= (1.0 - F) * shadow;
  vec3 inner = body * sun * soak * 0.06 * shadow;
  // Facet edges and grain boundaries catch a thin line of light
  inner += sun * soak * (1.0 - smoothstep(0.0, 0.025, edge)) * 0.05 * (1.0 - boundary);
  vec3 stone = mirrored + fireRGB + inner;
  diffuse = mix(stone, diffuse, graphite);
  highlight *= graphite;
  ambient = mix(vec3(0.004, 0.005, 0.008) + albedo * 0.01, ambient, graphite);
#elif defined(FAMILY_MIRROR)
  // Chrome: nearly all it shows is what it mirrors, tinted by the metal and brighter at
  // grazing angles (Schlick); a little diffuse light from the cloud deck itself
  float nvM = max(dot(n, v), 0.0);
  vec3 fresnel = albedo + (1.0 - albedo) * pow(1.0 - nvM, 5.0);
  ambient = mirrorSky(r, rough, length(fwidth(r))) * fresnel;
  diffuse = albedo * sun * day * shadow * 0.06;
  highlight = specularGGX(n, v, max(rough, 0.03), albedo) * sun * shadow * sunUp;
  // Thousands of degrees hot, it glows by its own heat, but a mirror is a poor emitter
  // (Kirchhoff: what it reflects it cannot radiate), so faintly: through its clouds most
  // where the downdrafts open onto the hotter depths, and only where it isn't drowned out
  // by the starlight it mirrors. uEmissive is the blackbody colour at its temperature,
  // uEmission its emissivity times how hot (looks.ts)
  emission = uEmissive * uEmission * (1.0 - fresnel.g * 0.6) * (0.25 + 0.75 * downdraft);
#endif
#if defined(FAMILY_GAS)
  if (uStyle > 3.5) {
    // The day side glows by its own heat, orange to white-hot at the hottest spot
    emission += mix(vec3(1.0, 0.36, 0.08), vec3(1.0, 0.8, 0.55), rubyHeat * rubyHeat) * rubyHeat * uEmission * 2.0;
    // The gem front: along the terminator, where the corundum condenses, crystals at every
    // angle catch the grazing starlight and sparkle ruby or sapphire. Each twinkles slowly
    // (cycles of several seconds, nothing like a flash), and they fade out before they
    // shrink below a few pixels
    float scale = 70.0;
    vec3 gem = gemCrystal(p * scale + uSeed, p);
    float facet = fract(gem.z * 91.7);
    vec3 axis = normalize(hash33(vec3(gem.z * 37.0, facet, 1.0)) - 0.5);
    vec3 nf = normalize(ng + (transpose(uWorldToObject) * axis) * 0.9);
    float resolved = 1.0 - smoothstep(0.2, 0.6, length(fwidth(p)) * scale);
    float front = 1.0 - smoothstep(0.0, 0.25, abs(dot(ng, uLightDir) - 0.04));
    float twinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * 1.2 + facet * 40.0));
    float glint = pow(max(dot(reflect(-v, nf), uLightDir), 0.0), 4.0) * gem.x * step(0.45, facet) * front * twinkle * resolved;
    highlight += sun * glint * 3.0 * mix(vec3(1.0, 0.12, 0.2), vec3(0.25, 0.45, 1.0), step(0.72, facet));
  }
#endif
  vec3 color = diffuse + highlight + ambient;

  // Silicon life: a network of faintly glowing veins over the ground, brighter at night
  if (uLifeGlow > 0.0) {
    float veins = pow(1.0 - abs(snoise(q * 5.0)), 20.0) + pow(1.0 - abs(snoise(q * 13.0 + 3.0)), 24.0) * 0.6;
    float pulse = 0.7 + 0.3 * sin(uTime * 0.6 + snoise(q * 2.0) * 6.0);
    emission += vec3(0.35, 0.85, 1.0) * veins * pulse * uLifeGlow * 0.9;
  }

  // Night side: cities and glowing ground
  float night = 1.0 - smoothstep(-0.12, 0.08, dot(ng, uLightDir));
  if (uCityLights > 0.0) {
    float clusters = smoothstep(0.15, 0.45, fbmN(q * 4.0 + vec3(11.0), 3.0));
    float sprawl = smoothstep(0.25, 0.65, snoise(q * 70.0)) + smoothstep(0.55, 0.8, snoise(q * 160.0)) * 0.6;
    color += vec3(1.0, 0.72, 0.38) * clusters * sprawl * landMask * night * uCityLights * 1.6;
  }
  color += emission * (0.35 + 0.65 * night);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,qo=`
${Me}
${bs}
${js}
${fi}
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
void main() {
  vec3 p = normalize(vObj);
  vec3 ng = normalize(vWorldNormal);
  float d = cloudDensity(p, uOctaves);
  if (d < 0.01) discard;
  vec3 v = normalize(cameraPosition - vWorldPos);
  float nl = dot(ng, uLightDir);
  // Soft terminator; thin edges glow when back-lit
  float lit = smoothstep(-0.18, 0.35, nl);
  float rim = pow(1.0 - max(dot(ng, v), 0.0), 3.0) * max(dot(-v, uLightDir), 0.0);
  vec3 sun = uSunColor * uSunIntensity;
  vec3 color = uCloudColor * (sun * (lit * (0.85 + 0.15 * d) + rim * 0.5) + vec3(0.01));
  // Sunset tint along the terminator
  color *= mix(vec3(1.0), vec3(1.0, 0.6, 0.35), smoothstep(0.25, 0.0, nl) * step(-0.18, nl));
  gl_FragColor = vec4(color, pow(d, 1.3) * 0.85);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Vo=`
${Me}
${bs}
${js}
uniform float uPlanetRadius;
uniform vec4 uHaze;  // x scale height (radii), y 1 if any
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;

// Where a ray from o along d enters and leaves a sphere of radius r at the origin
vec2 sphereHit(vec3 o, vec3 d, float r) {
  float b = dot(o, d);
  float c = dot(o, o) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

void main() {
  float H = max(uHaze.x, 1e-3);
  float R = uPlanetRadius;
  vec3 d = normalize(vWorldPos - cameraPosition);
  vec3 closest = cameraPosition - d * dot(cameraPosition, d);
  float b = length(closest) / R;
  float tau = exp(-(b - 1.0) / H);
  float alpha = 1.0 - exp(-tau);
  if (alpha < 0.003) discard;
  // The haze's colour, uniform but for the faintest of latitude shading
  vec3 p = normalize(vObj);
  vec3 haze = mix(uLow, uHigh, 0.5 + 0.15 * fbmN(vec3(p.x * 2.0, p.y * 7.0, p.z * 2.0) + uSeed, 3.0));
  // Lit where the line of sight meets the haze's tau = 1 level (the radius R), or at its
  // closest approach where it passes above it
  vec2 hit = sphereHit(cameraPosition, d, R);
  vec3 n = b < 1.0 && hit.x > 0.0 ? normalize(cameraPosition + d * hit.x) : normalize(closest);
  float nl = dot(n, uLightDir);
  float lit = smoothstep(-0.25, 0.45, nl) * (0.45 + 0.55 * max(nl, 0.0));
  float mu = dot(d, uLightDir);
  float g = 0.7;
  float phase = (1.0 - g * g) / pow(1.0 + g * g - 2.0 * g * mu, 1.5) * 0.08;
  vec3 sun = uSunColor * uSunIntensity;
  // (tholin haze is dark-ish, Titan's albedo is some 0.2: it never glares)
  vec3 color = haze * sun * (lit * 0.8 + phase * smoothstep(-0.3, 0.1, nl + 0.3)) + haze * 0.012;
  gl_FragColor = vec4(color, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,Ho=`
varying vec3 vWorldPos;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,Bo=`
uniform vec3 uLightDir;
uniform vec3 uSunColor;
uniform float uSunIntensity;
uniform float uPlanetRadius;
uniform float uAtmosphereRadius;
uniform vec3 uBetaR;
uniform float uBetaM;
uniform float uScaleR;
uniform float uScaleM;
varying vec3 vWorldPos;

vec2 sphere(vec3 o, vec3 d, float r) {
  float b = dot(o, d);
  float c = dot(o, o) - r * r;
  float h = b * b - c;
  if (h < 0.0) return vec2(1e9, -1e9);
  h = sqrt(h);
  return vec2(-b - h, -b + h);
}

void main() {
  vec3 o = cameraPosition;
  vec3 d = normalize(vWorldPos - cameraPosition);
  vec2 shell = sphere(o, d, uAtmosphereRadius);
  if (shell.x > shell.y) discard;
  vec2 ground = sphere(o, d, uPlanetRadius);
  float t0 = max(shell.x, 0.0);
  float t1 = shell.y;
  if (ground.x > 0.0 && ground.x < t1) t1 = ground.x;
  if (t1 <= t0) discard;

  const int STEPS = 12;
  const int LIGHT_STEPS = 4;
  float ds = (t1 - t0) / float(STEPS);
  // A very tall envelope (a Super Puff's) shows its few steps as bands: jitter them per
  // pixel there; every other atmosphere samples the middle of each step, as always
  float offset = uAtmosphereRadius - uPlanetRadius > uPlanetRadius * 0.2 ? fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) : 0.5;
  vec3 sumR = vec3(0.0), sumM = vec3(0.0);
  float depthR = 0.0, depthM = 0.0;
  for (int i = 0; i < STEPS; i++) {
    vec3 x = o + d * (t0 + ds * (float(i) + offset));
    float h = length(x) - uPlanetRadius;
    float hr = exp(-h / uScaleR) * ds;
    float hm = exp(-h / uScaleM) * ds;
    depthR += hr;
    depthM += hm;
    // Light path to the star; in the planet's shadow there is none
    vec2 toSun = sphere(x, uLightDir, uAtmosphereRadius);
    vec2 blocked = sphere(x, uLightDir, uPlanetRadius * 0.998);
    if (blocked.x > 0.0) continue;
    float dl = toSun.y / float(LIGHT_STEPS);
    float lr = 0.0, lm = 0.0;
    for (int j = 0; j < LIGHT_STEPS; j++) {
      vec3 y = x + uLightDir * dl * (float(j) + 0.5);
      float hy = length(y) - uPlanetRadius;
      lr += exp(-hy / uScaleR) * dl;
      lm += exp(-hy / uScaleM) * dl;
    }
    vec3 tau = uBetaR * (depthR + lr) + uBetaM * 1.1 * (depthM + lm);
    vec3 attenuation = exp(-tau);
    sumR += attenuation * hr;
    sumM += attenuation * hm;
  }
  float mu = dot(d, uLightDir);
  float phaseR = 3.0 / (16.0 * 3.14159) * (1.0 + mu * mu);
  float g = 0.76;
  float phaseM = 3.0 / (8.0 * 3.14159) * ((1.0 - g * g) * (1.0 + mu * mu)) / ((2.0 + g * g) * pow(1.0 + g * g - 2.0 * g * mu, 1.5));
  vec3 color = uSunColor * uSunIntensity * 1.6 * (sumR * uBetaR * phaseR + sumM * uBetaM * phaseM);
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,$o=1.45;class Uo{constructor(e,t,s,i,r,o=new Set,l=!1,c=0){this.look=e,this.mesh=t,this.scene=s,this.radius=i,this.shared={uLightDir:{value:new M(1,0,0)},uSunColor:{value:new W(1,1,1)},uSunIntensity:{value:$o},uOctaves:{value:6},uTime:{value:0},uCloudSpin:{value:0},uWorldToObject:{value:this.worldToObject},uDeep:{value:e.deep},uShallow:{value:e.shallow},uLow:{value:e.low},uMid:{value:e.mid},uHigh:{value:e.high},uPeak:{value:e.peak},uAccent:{value:e.accent},uEmissive:{value:e.emissive},uSea:{value:e.seaLevel},uRelief:{value:e.relief},uContinentScale:{value:e.continentScale},uIceCap:{value:e.iceCap},uVegetation:{value:e.vegetation},uSpecular:{value:e.specular},uRoughness:{value:e.roughness},uMetal:{value:e.metal},uEmission:{value:e.emission},uCityLights:{value:e.cityLights},uCraters:{value:e.craters},uBands:{value:e.bands},uStorms:{value:e.storms},uClouds:{value:e.clouds},uCloudColor:{value:e.cloudColor},uSeed:{value:e.seed},uVariant:{value:e.variant},uStyle:{value:e.style},uWarp:{value:e.warp},uFeature:{value:e.featureScale},uLifeGlow:{value:e.lifeGlow},uBandFreq:{value:e.bandFrequency},uBloom:{value:e.bloom},uGalaxy:{value:new Ls}};const u={[`FAMILY_${e.family.toUpperCase()}`]:""};if(r?.has_rings&&r.bands?.length){const d=new W(13483940).lerp(e.mid,.25);this.rings=new fo(r,i,d,this.shared,l),s.add(this.rings.mesh),u.HAS_RINGS="",Object.assign(this.shared,{uRingBands:{value:this.rings.bands},uRingBandCount:{value:this.rings.bandCount},uRingSeed:{value:this.rings.seed},uRingSuper:{value:l?1:0},...this.rings.structure,uRingNormal:{value:this.rings.normal},uPlanetRadius:{value:i}})}if(this.surface=new $({uniforms:this.shared,vertexShader:Ut,fragmentShader:Go,defines:u}),t.material=this.surface,c>0){const d=t.geometry;t.geometry=new le(i*(1-c*3),128,64),d.dispose()}if(e.clouds>.01){const d=new $({uniforms:this.shared,vertexShader:Ut,fragmentShader:qo,defines:u,transparent:!0,depthWrite:!1});this.cloudMesh=new D(new le(i*1.007,128,64),d),this.cloudMesh.name="realistic-clouds",s.add(this.cloudMesh)}if(c>0){const d=new $({uniforms:{...this.shared,uPlanetRadius:{value:i},uHaze:{value:new Ls(c,1,0,0)}},vertexShader:Ut,fragmentShader:Vo,defines:u,transparent:!0,depthWrite:!1,side:os});this.hazeMesh=new D(new le(i*(1+c*4),128,64),d),this.hazeMesh.name="realistic-haze",this.hazeMesh.renderOrder=1,s.add(this.hazeMesh)}if(e.atmosphereDensity>0){this.atmosphereRadius=i*(1+e.atmosphereHeight);const d=this.atmosphereRadius-i,h=d*.25,p=d*.1,g=new M(e.atmosphere.r,e.atmosphere.g,e.atmosphere.b);g.divideScalar(Math.max(g.x,g.y,g.z,.001));const f=g.multiplyScalar(.22*e.atmosphereDensity/h),v=.035*e.atmosphereDensity/p;this.atmosphereMaterial=new $({uniforms:{uLightDir:this.shared.uLightDir,uSunColor:this.shared.uSunColor,uSunIntensity:this.shared.uSunIntensity,uPlanetRadius:{value:i},uAtmosphereRadius:{value:this.atmosphereRadius},uBetaR:{value:f},uBetaM:{value:v},uScaleR:{value:h},uScaleM:{value:p}},vertexShader:Ho,fragmentShader:Bo,blending:Z,transparent:!0,depthWrite:!1}),this.atmosphereMesh=new D(new le(this.atmosphereRadius,128,64),this.atmosphereMaterial),this.atmosphereMesh.name="realistic-atmosphere",this.atmosphereMesh.renderOrder=2,s.add(this.atmosphereMesh)}e.family==="terran"&&e.atmosphereDensity>=.8&&o.add("aurora"),this.effects=new Wo(o,{scene:s,radius:i,seed:Math.floor(e.seed.x*1e4+e.seed.y*100),shared:this.shared})}look;mesh;scene;radius;surface;cloudMesh=null;hazeMesh=null;atmosphereMesh=null;atmosphereMaterial=null;shared;worldToObject=new Ka;atmosphereRadius=0;rings=null;effects;update(e){const t=this.shared;t.uLightDir.value.copy(e.lightDir).normalize(),t.uSunColor.value.copy(e.sunColor);const s=e.camera.position.length(),i=Math.tan(I.degToRad(e.camera.fov/2)),r=this.radius/Math.max(s-this.radius*.98,1e-4)/i*e.viewportHeight*.5;t.uOctaves.value=I.clamp(Math.log2(Math.max(r,1))-.5,2.5,e.maxOctaves),t.uTime.value=e.elapsed%2e4;const o=e.galacticCore;t.uGalaxy.value.set(o?.x??0,o?.y??0,o?.z??0,o&&o.lengthSq()>0?1:0),t.uCloudSpin.value=e.elapsed/Math.max(e.rotationPeriod,3600)*Math.PI*2*.035%(Math.PI*2),this.mesh.updateMatrixWorld(),this.worldToObject.setFromMatrix4(this.mesh.matrixWorld).invert();for(const l of[this.cloudMesh,this.hazeMesh])l&&(l.position.copy(this.mesh.position),l.quaternion.copy(this.mesh.quaternion));this.atmosphereMesh&&this.atmosphereMaterial&&(this.atmosphereMaterial.side=s>this.atmosphereRadius*1.002?os:ln),this.effects.update(e.elapsed,performance.now()/1e3,this.mesh.quaternion)}setRingRoche(e){this.rings?.setRoche(e)}dispose(){this.surface.dispose(),this.rings?.dispose(),this.effects.dispose();for(const e of[this.cloudMesh,this.hazeMesh,this.atmosphereMesh])e&&(this.scene.remove(e),e.geometry.dispose(),e.material.dispose())}}const w=a=>new W(a);function Yo(a){let e=a%2147483647;return e<=0&&(e+=2147483646),()=>(e=e*16807%2147483647)/2147483647}function Zo(a){const e=String(a?.seeds?.planet_seed??a?.seeds?.shape_seed??a?.planet_info?.name??"atlas");let t=2166136261;for(let s=0;s<e.length;s++)t=Math.imul(t^e.charCodeAt(s),16777619);return Math.abs(t)||1}function J(a,e,t){const s={h:0,s:0,l:0};e.getHSL(s);const i=new W().setHSL(s.h,Math.min(s.s,.55),I.clamp(s.l,.25,.6));return a.clone().lerp(i,t)}function K(a,e,t=.03,s=.12){const i={h:0,s:0,l:0};return a.getHSL(i),new W().setHSL((i.h+(e()-.5)*t+1)%1,i.s,I.clamp(i.l*(1+(e()-.5)*s),0,1))}const ye=(a,e)=>e[Math.floor(a()*e.length)%e.length],Xo={Breathable:{color:5213695,density:1},Thick:{color:13154458,density:1.8},Thin:{color:10467552,density:.35},"Carbon Dioxide":{color:14721136,density:1.2},Methane:{color:5941208,density:1},Nitrogen:{color:6262783,density:.9},"Oxygen-Rich":{color:7315711,density:1.1},"Sulfur Dioxide":{color:15258474,density:1.4},Superheated:{color:16742976,density:1.5},Acidic:{color:11063392,density:1.3},Toxic:{color:11563216,density:1.4},Hydrogen:{color:15775944,density:1},Helium:{color:16182472,density:.9},Ammonia:{color:15128720,density:1.1},Ionic:{color:4245759,density:1},Plasma:{color:16740544,density:1.2},"Exotic Gases":{color:12611839,density:1.2},"Water Vapor":{color:10277119,density:1.2},Frozen:{color:14216447,density:.6}};function Jo(a){const e=a.original_planet_data??a.planet_info??{},t=String(a.planet_info?.type??e.planet_type??"Rocky").replace(/_/g," "),s=a.planet_info?.base_color,i=typeof s=="string"?new W(s):new W(8421504),r=Zo(a),o=Yo(r),l=Number(e.surface_temperature??a.planet_info?.surface_temperature??15),c=String(e.life_forms??a.life_forms?.type??"None"),u=String(a.atmosphere?.type??e.atmosphere??"None"),d=Xo[u],h={family:"barren",variant:Math.floor(o()*4),style:0,warp:.3+o()*.9,featureScale:.7+o()*.9,deep:w(333358),shallow:w(1003374),low:w(5204782),mid:w(8022600),high:w(7037530),peak:w(15922422),accent:w(3103262),emissive:w(16752704),seaLevel:-2,relief:.8+o()*.6,continentScale:.8+o()*1.1,iceCap:2,vegetation:0,specular:.05,roughness:.85,metal:0,emission:0,cityLights:c==="Intelligent Life"?1:0,craters:0,lifeGlow:c==="Silicon-Based Life"?1:0,bloom:c==="Bacteria"?1:c==="Animal Life"||c==="Vegetation"?.35:c==="Vegetable Animals"?.6:0,clouds:0,cloudColor:w(16777215),atmosphere:w(d?d.color:8956671),atmosphereHeight:.025,atmosphereDensity:d?d.density:0,bands:0,bandFrequency:10+o()*12,storms:0,seed:new M(o()*100,o()*100,o()*100)},p=f=>(o()-.5)*2*f,g=()=>I.clamp(.88+(l-15)/160+p(.04),.3,2);switch(t){case"Oceanic":case"Aquifer":h.family="terran",h.seaLevel=(t==="Oceanic"?.22:.12)+p(.06),h.deep=J(w(134950),i,.08),h.shallow=t==="Aquifer"?w(1278090):J(w(739952),i,.12),h.vegetation=.7,h.clouds=.38,h.iceCap=g();break;case"Super Earth":case"Sub Earth":case"Forest":h.family="terran",h.seaLevel=(t==="Forest"?-.02:.03)+p(.08),h.relief*=t==="Super Earth"?1.4:1,h.vegetation=t==="Forest"?1:.75,h.accent=K(J(w(t==="Forest"?2050583:3103262),i,.2),o),h.low=K(J(w(4416554),i,.15),o),h.clouds=.42,h.iceCap=g();break;case"Savannah":h.family="terran",h.seaLevel=-.16+p(.06),h.vegetation=.45,h.low=K(J(w(10521162),i,.25),o),h.mid=w(9073220),h.accent=w(5660714),h.clouds=.28,h.iceCap=g();break;case"Swamp":h.family="terran",h.seaLevel=.04+p(.04),h.deep=w(860184),h.shallow=w(2968106),h.low=K(w(3820066),o),h.accent=w(2504730),h.vegetation=1,h.relief*=.5,h.clouds=.55,h.iceCap=2;break;case"Tundra":h.family="terran",h.seaLevel=-.08+p(.06),h.low=w(6974034),h.mid=w(9078390),h.accent=w(5069374),h.vegetation=.3,h.iceCap=.45+p(.08),h.clouds=.45;break;case"Desert":case"Arid":h.family="desert",h.low=K(J(w(t==="Desert"?12620378:11035196),i,.2),o),h.mid=J(w(t==="Desert"?10514495:9062958),i,.2),h.high=w(t==="Desert"?6177840:4860960),h.peak=w(t==="Desert"?14730388:14203040),h.relief*=1.1,h.craters=t==="Arid"?.5:.15,h.clouds=t==="Arid"?.08:.04,h.atmosphereHeight=.02,d||(h.atmosphere=w(14196848),h.atmosphereDensity=.45);break;case"Rocky":case"Cave":case"Carbon":h.family="barren",h.low=K(J(w(t==="Carbon"?1315860:7236198),i,t==="Carbon"?.1:.25),o),h.mid=J(w(t==="Carbon"?2236446:8814714),i,.2),h.high=w(t==="Carbon"?3025962:10130572),h.peak=w(t==="Carbon"?4209722:12104362),h.craters=t==="Cave"?.6:.6+o()*.4,h.relief*=t==="Cave"?1.6:1.2,h.specular=t==="Carbon"?.35:.04,h.roughness=t==="Carbon"?.4:.9;break;case"Metallic":{h.family="metal";const f=ye(o,[[9211796,11843516,5922146,8008728],[10511422,13142620,6962212,3115636],[11570240,14202984,6967328,5917226],[8028296,10134704,4608092,4864650],[7368816,10132122,3815994,9059350]]);h.low=J(w(f[0]),i,.12),h.mid=w(f[1]),h.high=w(f[2]),h.accent=w(f[3]),h.specular=1,h.roughness=.12+o()*.2,h.metal=1,h.craters=.4+o()*.4;break}case"Crystalline":h.family="crystal",h.low=w(1709606),h.mid=K(J(w(7002344),i,.45),o,.25,.2),h.high=K(J(w(10124008),i,.3),o,.25,.2),h.accent=w(ye(o,[16740560,7405528,16765040,8429823])),h.specular=1,h.roughness=.06,h.craters=.15;break;case"Diamond":{h.family="diamond";const f=ye(o,[15397631,12574975,16773312,16766186]);h.low=w(f),h.mid=w(16777215),h.high=w(2500652),h.accent=w(10148095),h.specular=1,h.roughness=.03;break}case"Icy":h.family="ice",h.low=K(w(13163756),o,.04),h.mid=w(15134968),h.high=w(11060444),h.accent=J(w(ye(o,[6986432,10119760,8022672])),i,.3),h.specular=.6,h.roughness=.3,h.craters=.3+o()*.5,h.clouds=.15;break;case"Lava":case"Magma":case"Molten Core":h.family="lava",h.style=t==="Magma"?1:t==="Molten Core"?2:0,h.low=w(1709074),h.mid=w(2760732),h.high=w(3813418),h.emissive=J(w(t==="Molten Core"?16756800:16734746),i,.2),h.emission=(t==="Molten Core"?1:t==="Magma"?.85:.7)*(.85+o()*.3),h.relief*=1.2,d||(h.atmosphere=w(16738864),h.atmosphereDensity=.6);break;case"Gas Giant":case"Frozen Gas Giant":case"Nebulous":{h.family="gas";const f=t==="Frozen Gas Giant",v=t==="Nebulous";h.style=f?1:v?2:0,h.low=K(J(w(f?5940944:v?14196944:14200968),i,f?.2:.35),o,.05),h.mid=K(J(w(f?3108784:v?10514632:11565648),i,f?.15:.3),o,.05),h.high=w(f?15267583:v?15782128:15786184),h.accent=w(f?1194616:v?7360704:9062960),h.bands=(f||v?.6:1)*(.7+o()*.6),h.storms=(f?.7:1)*(.4+o()*.9),h.emission=v?.25:0,h.emissive=w(12615935),h.atmosphere=w(f?9097456:v?13668592:15255712),h.atmosphereDensity=f?.55:1.2,h.atmosphereHeight=.03;break}case"Super Puff":h.family="gas",h.style=3;{const f=ye(o,[[13214330,11042394,15125672,8018494,15258292],[13933166,11695696,15582882,9065524,15781034],[13141550,10511902,15119472,7226388,15253124],[10254942,8282186,13151892,5521454,13547682]]);h.low=K(w(f[0]),o,.02),h.mid=K(w(f[1]),o,.02),h.high=w(f[2]),h.accent=w(f[3]),h.bands=.1+o()*.1,h.storms=0*o(),h.atmosphere=w(f[4]),h.atmosphereDensity=.5,h.atmosphereHeight=.03}break;case"Super Ringed":h.family="gas",h.variant=3,h.low=K(J(w(13207386),i,.2),o,.04),h.mid=K(J(w(11035198),i,.2),o,.04),h.high=w(15254432),h.accent=w(7221792),h.emissive=w(10107416),h.emission=.3,h.bands=.6+o()*.4,h.storms=.2+o()*.4,h.atmosphere=w(14727318),h.atmosphereDensity=.9,h.atmosphereHeight=.03;break;case"Mirror":h.family="mirror",h.low=w(ye(o,[15265010,15918796,14477040,15130864])),h.mid=w(16777215),h.high=w(9081500),h.accent=w(12571903),h.specular=1,h.roughness=.04+o()*.05,h.metal=1,h.bands=.5+o()*.5;{const f=I.clamp((l-800)/2200,0,1);h.emissive=w(11546634).lerp(w(16757866),f),h.emission=.012+.05*f}h.atmosphere=w(13622773),h.atmosphereDensity=.25,h.atmosphereHeight=.02;break;case"Ruby Cloud":h.family="gas",h.style=4,h.low=K(w(9308700),o,.03),h.mid=K(w(1522334),o,.03),h.high=w(14239839),h.accent=w(2753552),h.emissive=w(13117466),h.emission=.8+o()*.3,h.bands=.8+o()*.4,h.storms=.3+o()*.5,h.atmosphere=w(16743018),h.atmosphereDensity=1.1,h.atmosphereHeight=.035;break;case"Toxic":h.family="veiled",h.low=K(J(w(11055184),i,.25),o),h.mid=J(w(8030768),i,.25),h.high=w(13684872),h.bandFrequency=5+o()*6,h.atmosphere=d?h.atmosphere:w(12107872),h.atmosphereDensity=Math.max(h.atmosphereDensity,1.6),h.atmosphereHeight=.04;break;case"Radioactive":h.family="radioactive",h.low=K(w(2500126),o),h.mid=w(3815980),h.high=w(4868666),h.emissive=w(ye(o,[8257354,4915104,13172544])),h.emission=1,h.craters=.7,h.atmosphere=w(d?d.color:9109360).lerp(w(9109360),.65),h.atmosphereDensity=Math.max(d?d.density:0,.5);break;case"Exotic":h.family="exotic",h.low=K(J(w(2627656),i,.4),o,.3),h.mid=K(J(w(5913242),i,.4),o,.3),h.high=w(14733567),h.accent=w(ye(o,[16728256,4259808,16764992,8413439])),h.emissive=h.accent.clone(),h.emission=.7,h.specular=.8,h.roughness=.15,d||(h.atmosphere=w(12611839),h.atmosphereDensity=.8);break;case"Anomaly":h.family="anomaly",h.low=w(131590),h.mid=w(657428),h.high=w(1709104),h.accent=w(ye(o,[9067775,4243711,16735370])),h.emissive=h.accent.clone(),h.emission=1,h.atmosphereDensity=0;break}return h.family==="terran"&&(l<-60||l>85)&&(h.vegetation*=.2),h.family!=="terran"&&h.family!=="desert"&&(h.cityLights*=h.family==="barren"||h.family==="ice"?.6:0),h.clouds=I.clamp(h.clouds*(.7+o()*.6)*(h.atmosphereDensity>0?1:0),0,.85),h}const pe=2.5,ia={red:16724736,yellow:16777130,blue:8965375,orange:16755268,white:16777215,purple:12290303},Ko={"Red Dwarf":1,"Yellow Dwarf":2,"Blue Giant":8,"Red Giant":3,"White Dwarf":2.5,"Neutron Star":1.5},na=200,Qo=2.2,er=.06,tr=`
  varying vec3 vEclipseWorld;
  uniform vec3 uEclipseLight;
  uniform float uEclipseRadius;
  uniform float uEclipseGlow;
  vec3 eclipseLight(vec3 p) {
    float t = dot(p, uEclipseLight);
    if (t > 0.0) return vec3(1.0);
    float d = length(p - t * uEclipseLight);
    float soft = uEclipseRadius * 0.04 + (-t) * 0.012;
    float lit = smoothstep(uEclipseRadius - soft, uEclipseRadius + soft, d);
    return mix(vec3(0.55, 0.16, 0.06) * uEclipseGlow, vec3(1.0), lit);
  }
`;class sr{scene=new Ee;camera=new fs(60,1,.01,5e3);ready=!1;error=null;moonCount=0;moons=[];focusMoon=null;source;mesh;moonSystem;lights=[];fillLight;data=null;disposed=!1;realistic=null;sunDirection=new M(1,0,0);viewportHeight=900;constructor(e){this.source=e;const t=new le(pe,128,64);this.mesh=new D(t,new dt({color:8421504})),this.mesh.castShadow=!0,this.mesh.receiveShadow=!0,this.scene.add(this.mesh),this.moonSystem=new dn(this.scene,pe,this.camera,new M,e.timing.cosmic_origin_time);const s=e.stars.length?e.stars:[{Type:"Yellow Dwarf",Color:"yellow",Size:1}];s.forEach((i,r)=>{const o=new nt(ia[i.Color?.toLowerCase()]??16777215,1);o.target.position.set(0,0,0),o.castShadow=!1,this.scene.add(o,o.target),this.lights.push(o)}),this.fillLight=new nt(16777215,.005),this.scene.add(this.fillLight),this.moonLight=new nt(ia[s[0].Color?.toLowerCase()]??16777215,Qo),this.moonLight.target.position.set(0,0,0),this.scene.add(this.moonLight,this.moonLight.target,new Qa(10466512,er))}moonLight;eclipse={uEclipseLight:{value:new M(1,0,0)},uEclipseRadius:{value:pe},uEclipseGlow:{value:0}};applyEclipses(){this.scene.traverse(e=>{const t=e;if(!t.isMesh||!t.name.startsWith("moon-surface-"))return;const s=t.material;if(s.userData.eclipse)return;s.userData.eclipse=!0;const i=s.onBeforeCompile;s.onBeforeCompile=(r,o)=>{i.call(s,r,o),Object.assign(r.uniforms,this.eclipse),r.vertexShader=r.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vEclipseWorld;`).replace("#include <fog_vertex>",`#include <fog_vertex>
vEclipseWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`),r.fragmentShader=r.fragmentShader.replace("#include <common>",`#include <common>
${tr}`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
{ vec3 eclipse = eclipseLight(vEclipseWorld); reflectedLight.directDiffuse *= eclipse; reflectedLight.directSpecular *= eclipse; }`)},s.needsUpdate=!0})}moonSunlight(e){const t=this.moonPosition(e);if(!t)return 1;const s=this.eclipse.uEclipseLight.value,i=t.dot(s);if(i>0)return 1;const r=t.clone().addScaledVector(s,-i).length(),o=pe*.04+-i*.012;return I.smoothstep(r,pe-o,pe+o)}get unitsPerAU(){return pe/this.source.visualRadiusAU}async load(){try{const t=await(await fetch(this.source.dataUrl,{credentials:"same-origin"})).json();if(!t.success)throw new Error(t.error||"Failed to fetch planet data");if(this.disposed)return;const s=t.planet_data,i=t.timing,r=t.rendering_data??{};this.data={planet_info:r.planet_info??{name:s.name,type:s.planet_type,base_color:"#808080",radius:s.diameter/15e3,orbital_radius:s.orbital_radius},surface_elements:r.surface_elements,atmosphere:r.atmosphere,rings:r.rings,moons:r.moons,effects_3d:r.effects_3d,shader_uniforms:r.shader_uniforms,universal_actions:r.universal_actions,stellar_composition:r.stellar_composition,timing:{cosmic_origin_time:i.cosmic_origin_time,current_time_seconds:i.current_time_seconds,elapsed_time:i.elapsed_time,initial_orbital_angle:s.initial_orbital_angle,current_orbital_angle:s.current_orbital_angle,max_orbital_radius:i.max_orbital_radius,system_max_orbital_radius:s.system_max_orbital_radius},original_planet_data:s,seeds:r.seeds};const o=String(this.data.planet_info?.type??s.planet_type??"").replace(/_/g," "),l=Jo(this.data);let c=0;if(o==="Super Puff"){const d=1380649e-29*Math.max(Number(s.surface_temperature??15)+273.15,20)/(2.3*16735575e-34*Math.max(Number(s.gravity??1),.05));c=I.clamp(d/(Number(s.diameter)*500),.004,.08),l.atmosphereHeight=Math.max(.03,c*8)}if(this.realistic=new Uo(l,this.mesh,this.scene,pe,this.data.rings,Oo(this.data),o==="Super Ringed",c),o==="Super Ringed"){const u=Number(s.diameter)/2,d=this.data.moons?.roche_limit??2.456*u*Math.pow(Number(s.density)/1e3,1/3);this.realistic.setRingRoche(d/u)}if(this.data.moons?.moons?.length){this.moonCount=this.data.moons.moons.length,this.moons=this.data.moons.moons.map(d=>({name:d.name,type:d.properties?.type??"unknown",origin:d.properties?.origin??"unknown",radiusKm:d.properties?.radius_km??0,semiMajorAxisKm:d.orbit?.semi_major_axis_km??0,periodDays:d.orbit?.orbital_period_days??0,eccentricity:d.orbit?.eccentricity??0,inclinationDeg:d.orbit?.inclination_deg??0,tidallyLocked:!!d.rotation?.is_tidally_locked,massKg:d.properties?.mass_kg??0,densityKgM3:d.properties?.density_kg_m3??0})),this.moonSystem.loadMoonSystem({...this.data.moons,cosmic_origin_time:i.cosmic_origin_time,planet_mass:s.mass||1e24,planet_radius:pe,moons:this.data.moons.moons.map(d=>({...d,rotation:{rotation_period_s:d.orbit.orbital_period_seconds||86400,rotation_period_hours:(d.orbit.orbital_period_seconds||86400)/3600,angular_velocity_rad_s:2*Math.PI/(d.orbit.orbital_period_seconds||86400),is_tidally_locked:!0}}))});const u=String(s.atmosphere??"").toLowerCase();this.eclipse.uEclipseGlow.value=u&&u!=="none"&&!u.includes("no atmosphere")?.35:0,this.applyEclipses()}this.ready=!0}catch(e){this.error=e instanceof Error?e.message:String(e)}}update(e,t,s,i,r,o,l=new M){const c=this.unitsPerAU;this.camera.position.copy(t).sub(s).multiplyScalar(c),this.camera.quaternion.copy(i);const u=this.camera.position.length();let d=Math.max(.002,Math.min(u-pe,u*.5)*.5);const h=this.focusMoon?this.moonPosition(this.focusMoon):null;if(h&&(d=Math.min(d,Math.max(2e-4,(h.distanceTo(this.camera.position)-this.moonRadiusUnits(this.focusMoon))*.5))),this.camera.near=d,this.camera.far=u+4e3,this.camera.updateMatrixWorld(),!this.ready||!this.data)return;const p=this.data.original_planet_data,g=r-this.source.timing.cosmic_origin_time;this.mesh.rotation.y=g*(2*Math.PI/(p.rotation_period_seconds||86400))%(2*Math.PI),this.mesh.rotation.z=(p.axial_tilt||0)*Math.PI/180;const v=20+p.orbital_radius/Math.max(this.source.maxOrbitalRadius,1e-9)*80;let b=0;const x=this.lights.map((N,T)=>{const R=this.source.stars[T],k=Ko[R?.Type]??2,C=Math.min(3,Math.max(.05,k*300/(v*v)));return b+=C,C});b=Math.min(3,b),this.lights.forEach((N,T)=>{const k=(this.source.starOffsets[T]??new M).clone().sub(s).normalize();N.position.copy(k).multiplyScalar(na),N.intensity=T===0?b:x[T]*.35,T===0&&(this.moonLight.position.copy(N.position),this.eclipse.uEclipseLight.value.copy(k),this.sunDirection.copy(k))}),this.realistic&&this.realistic.update({lightDir:this.sunDirection,sunColor:new W(1,1,1).lerp(this.lights[0]?.color??new W(1,1,1),.3),camera:this.camera,viewportHeight:this.viewportHeight,maxOctaves:this.source.maxOctaves??7.5,elapsed:g,rotationPeriod:Math.abs(p.rotation_period_seconds||86400),galacticCore:l});const S=s.clone().normalize();if(this.fillLight.position.copy(S).multiplyScalar(na*.5),this.moonSystem.setTimeOffset(o),this.moonSystem.update(),this.focusMoon)for(const N of[`moon-indicator-${this.focusMoon}`,`moon-indicator-hitarea-${this.focusMoon}`]){const T=this.scene.getObjectByName(N);T&&(T.visible=!1)}}moonAt(e){const t=new cn;return t.setFromCamera(e,this.camera),this.moonSystem.getMoonAtPosition(t)}moonPosition(e){return this.moonSystem.getMoonPosition(e)}moonRadiusUnits(e){const t=this.data?.moons?.moons?.find(s=>s.name===e);return pe*(t?.visuals?.relative_size??.02)}moonOffsetAU(e,t=new M){const s=this.moonPosition(e);return s?t.copy(s).divideScalar(this.unitsPerAU):null}moonRadiusAU(e){return this.moonRadiusUnits(e)/this.unitsPerAU}setFocusMoon(e){e!==this.focusMoon&&(this.focusMoon&&this.moonSystem.setMoonDetail(this.focusMoon,!1),e&&this.moonSystem.setMoonDetail(e,!0),this.focusMoon=e)}projectMoon(e,t=new M){const s=this.moonPosition(e);return s?t.copy(s).project(this.camera):null}dispose(){this.disposed=!0,this.realistic?.dispose(),this.realistic=null,this.moonSystem.dispose(),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.lights.forEach(e=>e.dispose()),this.scene.clear()}}const St=2,Pe=16,Yt=.6,ar=.22,ir=`
  varying vec2 vLocal;
  varying float vBeaming;
  void main() {
    vLocal = position.xy;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    // Orbital velocity of the gas (tangent to the ring) against the line of sight:
    // the side moving towards us is boosted (relativistic beaming)
    vec3 velocity = normalize((modelViewMatrix * vec4(-position.y, position.x, 0.0, 0.0)).xyz);
    vBeaming = 1.0 + 0.75 * dot(velocity, -normalize(mv.xyz));
    gl_Position = projectionMatrix * mv;
  }
`,nr=`
  uniform float uTime;
  uniform float uInner;
  uniform float uOuter;
  uniform float uIntensity;
  varying vec2 vLocal;
  varying float vBeaming;

  float hash(float n) { return fract(sin(n) * 43758.5453); }

  void main() {
    float r = length(vLocal);
    float t = clamp((r - uInner) / (uOuter - uInner), 0.0, 1.0);
    float angle = atan(vLocal.y, vLocal.x);
    // Keplerian shear: inner gas laps the outer gas
    float swirl = angle * 3.0 + log(r / uInner) * 9.0 - uTime * 1.6 / pow(max(r / uInner, 1.0), 1.5);
    float streaks = 0.65 + 0.35 * sin(swirl) * sin(swirl * 2.3 + 1.7);
    float edge = smoothstep(0.0, 0.08, t) * (1.0 - smoothstep(0.55, 1.0, t));
    vec3 hot = vec3(1.0, 0.95, 0.85);
    vec3 warm = vec3(1.0, 0.55, 0.2);
    vec3 color = mix(hot, warm, smoothstep(0.0, 0.7, t));
    float brightness = edge * streaks * pow(1.0 - t, 1.6) * pow(max(vBeaming, 0.05), 3.0);
    gl_FragColor = vec4(color * brightness * uIntensity, 1.0);
  }
`,or=`
  varying float vAlong;
  varying float vRim;
  void main() {
    vAlong = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vRim = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`,rr=`
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uFlow;
  uniform float uSubpulses;
  varying float vAlong;
  varying float vRim;
  void main() {
    // Bright at the source, fading outwards; knots travel along jets
    float fade = pow(1.0 - vAlong, 1.4);
    float knots = 1.0 + uFlow * 0.6 * sin(vAlong * 46.0 - uTime * 4.0);
    float core = vRim * vRim;
    // A pulsar's emission cone is hollow: brighter towards its walls (low rim), and no
    // two pulses are alike: the whole beam flickers from one to the next
    float hollow = mix(1.0, 0.35 + 1.3 * (1.0 - vRim) * vRim * 2.0, uSubpulses);
    float pulses = 1.0 + uSubpulses * 0.25 * sin(uTime * 7.3) * sin(uTime * 3.1 + 1.3);
    gl_FragColor = vec4(uColor * fade * knots * core * hollow * pulses * uIntensity, 1.0);
  }
`,lr=`
  uniform float uRadius;
  varying vec3 vLocal;
  varying vec3 vCamera;
  void main() {
    vLocal = position * uRadius;
    // The camera in the nebula's frame (modelView is a rotation and a translation)
    vCamera = transpose(mat3(modelViewMatrix)) * -modelViewMatrix[3].xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(vLocal, 1.0);
  }
`,cr=`
  ${Me}
  uniform float uTime;
  uniform float uRadius;
  uniform float uTorus;
  uniform float uIntensity;
  uniform int uSteps;
  varying vec3 vLocal;
  varying vec3 vCamera;

  float hash12(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

  vec3 nebulaEmission(vec3 p, vec3 toCamera, float R, float radius, float time) {
    float r = length(p);
    float rho = length(p.xz);
    float y = p.y;
    // X-ray hot near the pulsar, violet further out; all of it gone before the bounding
    // sphere's edge
    vec3 color = mix(vec3(0.78, 0.9, 1.0), vec3(0.5, 0.32, 1.0), smoothstep(0.6, 2.0, r / R)) * (1.0 - smoothstep(0.8, 1.0, r / radius));
    // Jets along the spin axis, widening and fading, knots flowing out
    float ay = abs(y);
    float width = R * 0.06 * (1.0 + ay / R * 0.4);
    float jet = exp(-rho * rho / (width * width)) * exp(-ay / (R * 2.2)) * smoothstep(R * 0.05, R * 0.3, ay);
    jet *= 0.65 + 0.35 * sin(ay / R * 12.0 - time * 2.5);
    float halo = exp(-r * r / (R * R * 3.0)) * 0.05;
    vec3 light = color * halo + vec3(0.5, 0.65, 1.0) * jet * 2.5;
    // The torus, thick and turbulent, and the outflow in the equator beyond it
    vec2 q = vec2(rho - R, y);
    float h = R * 0.18;
    float torus = exp(-dot(q, q) / (h * h)) * 2.0;
    float sheet = exp(-y * y / (h * h * 0.15)) * exp(-rho * rho / (R * R * 5.0)) * smoothstep(R * 0.2, R * 0.6, rho);
    // No plasma here: skip the costly part
    if (torus + sheet < 0.004) return light;
    // Wisps travelling out as bent, broken arcs
    float angle = atan(p.z, p.x);
    float bend = sin(angle * 2.0 + time * 0.15) * 1.6 + sin(angle * 5.0 - time * 0.1 + 2.1) * 0.7;
    float wisps = pow(0.5 + 0.5 * sin(rho / R * 9.0 - time * 1.2 + bend), 4.0);
    // Clumpy, knotted plasma
    float turbulence = 0.6 + 0.4 * snoise(p / R * 4.0 + vec3(0.0, time * 0.04, 0.0));
    // Doppler: the outflow is radial in the equator
    vec3 outflow = rho > 1e-9 ? vec3(p.x, 0.0, p.z) / rho : vec3(0.0);
    float boost = pow(max(1.0 + 0.6 * dot(outflow, toCamera), 0.05), 2.0);
    return light + color * (torus + sheet * wisps * 0.9) * turbulence * boost;
  }

  void main() {
    vec3 dir = normalize(vLocal - vCamera);
    // One fragment per ray: where it leaves the sphere (works from inside it too)
    if (dot(vLocal, dir) <= 0.0) discard;
    float b = dot(vCamera, dir);
    float c = dot(vCamera, vCamera) - uRadius * uRadius;
    float disc = b * b - c;
    if (disc <= 0.0) discard;
    float s = sqrt(disc);
    float t0 = max(-b - s, 0.0);
    float t1 = -b + s;
    float ds = (t1 - t0) / float(uSteps);
    // Jittered start, so the steps don't show as bands
    float jitter = hash12(gl_FragCoord.xy);
    vec3 sum = vec3(0.0);
    for (int i = 0; i < uSteps; i++) {
      vec3 p = vCamera + dir * (t0 + (float(i) + jitter) * ds);
      sum += nebulaEmission(p, -dir, uTorus, uRadius, uTime);
    }
    gl_FragColor = vec4(sum * (ds / uTorus) * uIntensity, 1.0);
  }
`,hr=`
  varying float vAlong;
  void main() {
    vAlong = uv.x;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`,ur=`
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  varying float vAlong;
  void main() {
    // Brightest near the star (both feet of a loop), a glow flowing along each line
    float foot = vAlong * 2.0 - 1.0;
    float feet = 0.45 + 0.55 * foot * foot;
    float flow = 0.6 + 0.4 * sin(vAlong * 30.0 - uTime * 3.0);
    gl_FragColor = vec4(uColor * feet * flow * uIntensity, 1.0);
  }
`,dr=`
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uPulse;
  varying float vPulse;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vPulse = uPulse;
    gl_PointSize = uSize * uPixelRatio * (0.8 + 0.6 * uPulse);
    gl_Position = projectionMatrix * mv;
  }
`,mr=`
  uniform vec3 uColor;
  uniform float uIntensity;
  varying float vPulse;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float r = length(c) * 2.0;
    if (r > 1.0) discard;
    float core = exp(-r * r * 9.0);
    float halo = exp(-r * 3.5) * 0.4;
    gl_FragColor = vec4(uColor * (core + halo) * uIntensity * (0.6 + vPulse), 1.0);
  }
`;function Mt(a,e,t){const s=new de;s.setAttribute("position",new ze([0,0,0],3));const i=new $({uniforms:{uColor:{value:a},uIntensity:{value:t},uSize:{value:e},uPixelRatio:{value:1},uPulse:{value:.4}},vertexShader:dr,fragmentShader:mr,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0}),r=new Te(s,i);return r.frustumCulled=!1,r.userData.beacon=!0,r}const pr=8e-4;function fr(a,e,t){const s=new $({uniforms:{uTime:{value:0},uInner:{value:a},uOuter:{value:e},uIntensity:{value:t}},vertexShader:ir,fragmentShader:nr,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0,side:Se}),i=new D(new xs(a,e,160,8),s);return i.frustumCulled=!1,i}function oa(a,e,t){const s=new lt(t,e,a,24,1,!0);return s.translate(0,a/2,0),s}function kt(a,e,t,s,i=0){const r=new $({uniforms:{uColor:{value:e},uIntensity:{value:t},uTime:{value:0},uFlow:{value:s},uSubpulses:{value:i}},vertexShader:or,fragmentShader:rr,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0,side:Se}),o=new D(a,r);return o.frustumCulled=!1,o}function gr(a,e){const s=[],i=[];for(const o of e){const l=Math.asin(Math.min(1,Math.sqrt(a/o)));for(let c=0;c<8;c++){const u=c/8*Math.PI*2+o*97,d=h=>{const p=h/48,g=l+(Math.PI-2*l)*p,f=o*Math.sin(g)*Math.sin(g);s.push(f*Math.sin(g)*Math.cos(u),f*Math.cos(g),f*Math.sin(g)*Math.sin(u)),i.push(p,0)};for(let h=1;h<=48;h++)d(h-1),d(h)}}const r=new de;return r.setAttribute("position",new ze(s,3)),r.setAttribute("uv",new ze(i,2)),r}function ra(a){return new ys(a.range(-1.2,1.2),a.range(0,Math.PI*2),a.range(-1.2,1.2))}class vr{root=new se;items=[];toCamera=new M;pulsarParts=null;constructor(e,t,s,i){for(const r of e){const o=new Ze(De(r.id+r.name));r.kind==="blackhole"?this.items.push(this.blackHole(r,o,s,i)):r.kind==="pulsar"?this.items.push(this.pulsar(r,o)):r.kind==="quasar"?this.items.push(this.quasar(r,t)):r.kind==="torus"&&this.items.push(this.torus(r))}for(const r of this.items)this.root.add(r.object)}blackHole(e,t,s,i){const r=e.id==="smbh",o=r?.02:6e-4,l=new se,c=fr(o*2.6,o*14,r?i?4:2:1.3);c.rotation.copy(ra(t)),l.add(c);const u=Mt(new W(1,.6,.85),r?5:3.5,r?1.4:.9);l.add(u);const d=c.material;return{poi:e,object:l,horizon:o,approach:o*45,update:(h,p,g)=>{d.uniforms.uTime.value=g.shaderTime}}}pulsar(e,t){const s=new se;s.rotation.copy(ra(t));const i=new se,r=new se;r.rotation.z=t.range(.35,.8);const o=.05,l=this.pulsarParts??={beam:oa(o,2e-4,o*.07),volume:new le(1,48,24),field:gr(o*.004,[o*.08,o*.14,o*.22])},c=new $({uniforms:{uTime:{value:0},uRadius:{value:o*.55},uTorus:{value:o*.16},uIntensity:{value:1.6},uSteps:{value:40}},vertexShader:lr,fragmentShader:cr,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0,side:Se}),u=new D(l.volume,c);u.frustumCulled=!1,s.add(u);const d=new W(.65,.8,1),h=kt(l.beam,d,2.2,0,1),p=kt(l.beam,d,2.2,0,1);p.rotation.z=Math.PI,r.add(h,p);const g=new $({uniforms:{uColor:{value:new W(.62,.5,1)},uIntensity:{value:1.4},uTime:{value:0}},vertexShader:hr,fragmentShader:ur,blending:Z,depthTest:!1,depthWrite:!1,transparent:!0}),f=new Le(l.field,g);f.frustumCulled=!1,r.add(f),i.add(r),s.add(i);const v=Mt(new W(.7,.85,1),4,1.2);s.add(v);const b=t.range(.6,2.2),x=new M,S=new ut,N=v.material,T=[c,g,...[h,p].map(R=>R.material)];return{poi:e,object:s,horizon:0,approach:o*3,update:(R,k,C)=>{i.rotation.y=R/b%1*Math.PI*2;for(const _ of T)_.uniforms.uTime.value=C.shaderTime;N.uniforms.uSize.value=C.detailed?12:4;const E=c.uniforms.uRadius.value/Math.max(s.position.length(),1e-9)*C.projectionY;c.uniforms.uSteps.value=Math.round(40-16*I.smoothstep(E,.3,1)),s.updateMatrixWorld(),x.set(0,1,0).applyQuaternion(h.getWorldQuaternion(S));const j=Math.abs(x.dot(k));N.uniforms.uPulse.value=Math.pow(j,24)*2.5+.15}}}quasar(e,t){const s=new se,i=t*.4,r=new W(.55,.72,1),o=oa(i,t*.002,t*.018),l=kt(o,r,1.6,1),c=kt(o,r,1.6,1);c.rotation.z=Math.PI,s.add(l,c);const u=Mt(new W(1,.95,.9),9,3);s.add(u);const d=[l.material,c.material],h=t*.018;return{poi:e,object:s,horizon:0,approach:e.radius*3.5,update:(p,g,f)=>{const v=s.position,b=Math.hypot(v.x,v.z),x=I.smoothstep(b,h*2,h*8);d.forEach(S=>{S.uniforms.uTime.value=f.shaderTime,S.uniforms.uIntensity.value=1.6*x}),l.visible=c.visible=x>.001}}}torus(e){const t=new se,s=Math.min(window.innerWidth,window.innerHeight)<700,i=new W(.58,.46,1),r=pn(De(e.id+e.name)||1),o=new se;o.scale.setScalar(St),o.rotation.set(.35,0,.18);const l=zs(i),c=zs(i.clone());l.depthTest=c.depthTest=!1;const u=new Te(Ds(Ws(s?14e3:24e3,r)),l);u.frustumCulled=!1,o.add(u);const d=Ds(Ws(s?2500:5e3,r)),h=Pe/St;for(let C=-1;C<=1;C++)for(let E=-1;E<=1;E++)for(let j=-1;j<=1;j++){if(C===0&&E===0&&j===0)continue;const _=new Te(d,c);_.position.set(C*h,E*h,j*h),_.frustumCulled=!1,o.add(_)}t.add(o);const p=Pe*1.5,g=[-1.5,-.5,.5,1.5].map(C=>C*Pe),f=[];for(let C=0;C<3;C++){const[E,j]=[(C+1)%3,(C+2)%3];for(const _ of g)for(const z of g){const A=[0,0,0],L=[0,0,0];A[C]=-p,L[C]=p,A[E]=L[E]=_,A[j]=L[j]=z,f.push(...A,...L)}}const v=C=>new ht({color:C,transparent:!0,blending:Z,depthTest:!1,depthWrite:!1,toneMapped:!1}),b=new de;b.setAttribute("position",new ze(f,3));const x=new Le(b,v(4882384)),S=new Le(new ws(new be(Pe,Pe,Pe)),v(8378623));for(const C of[x,S])C.frustumCulled=!1,t.add(C);const N=Mt(new W(.75,.65,1),5,1.4);t.add(N);let T=0,R=null;const k=(fn+gn)*St;return{poi:e,object:t,horizon:0,approach:Math.max(k*9,Pe*3.4),update:(C,E,j)=>{const _=R===null?0:Math.min(.1,Math.max(0,C-R));R=C,T+=_*(.55+2.4*Yt*Yt);const z=1/Math.max(j.exposure,.001);for(const[A,L]of[[l,1],[c,ar]]){const V=A.uniforms;V.uFlow.value=T,V.uTime.value=j.shaderTime,V.uTension.value=Yt,V.uAlpha.value=Math.min(4,L*z),V.uPixels.value=j.pixels*St}x.material.opacity=Math.min(1,.22*z),S.material.opacity=Math.min(1,.45*z)}}}approachDistance(e){return this.items.find(t=>t.poi.id===e.id)?.approach??null}update(e,t,s,i=900,r=1,o=1){const l=e%86400;for(const c of this.items){const[u,d,h]=c.poi.position;c.object.position.set(u-t.x,d-t.y,h-t.z);const p=c.approach/3.5/Math.max(c.object.position.length(),1e-9)>pr,g={pixels:i*s,exposure:r,detailed:p,projectionY:o,shaderTime:l},f=c.object.children.filter(v=>!v.userData.beacon);p&&f.forEach(v=>v.visible=!0),this.toCamera.copy(c.object.position).negate().normalize(),c.object.updateMatrixWorld(),c.update(e,this.toCamera,g),p||f.forEach(v=>v.visible=!1),c.object.traverse(v=>{const b=v.material;b?.uniforms?.uPixelRatio&&(b.uniforms.uPixelRatio.value=s)})}}lenses(e,t){const s=[],i=Math.tan(t.fov*Math.PI/360),r=new M;for(const o of this.items){if(o.horizon<=0)continue;r.set(o.poi.position[0]-e.x,o.poi.position[1]-e.y,o.poi.position[2]-e.z);const l=r.length(),c=o.horizon/l/(2*i);c<.0015||(r.applyMatrix4(t.matrixWorldInverse),!(r.z>=0)&&(r.applyMatrix4(t.projectionMatrix),!(Math.abs(r.x)>1.5||Math.abs(r.y)>1.5)&&s.push({x:(r.x+1)/2,y:(r.y+1)/2,radius:Math.min(c,.4)})))}return s.sort((o,l)=>l.radius-o.radius).slice(0,4)}dispose(){this.root.traverse(e=>{const t=e;t.geometry?.dispose(),t.material?.dispose?.()}),this.root.clear()}}const xr={Spiral:45e3,Elliptical:5e4,Dwarf:7e3},gi=24*45e3,la=1e7,ca=216,yr=4,wr=.8;function br(a,e){const s=document.createElement("canvas");s.width=s.height=256;const i=s.getContext("2d"),r=new Ze(e),o=256/2;i.globalCompositeOperation="lighter";const l=(u,d,h,p,g)=>{const f=i.createRadialGradient(u,d,0,u,d,h);f.addColorStop(0,p.replace("ALPHA",String(g))),f.addColorStop(1,p.replace("ALPHA","0")),i.fillStyle=f,i.fillRect(u-h,d-h,h*2,h*2)};if(a==="Spiral"){l(o,o,256*.42,"rgba(255,225,190,ALPHA)",.25);const u=r.int(2,4),d=r.range(.25,.4);for(let h=0;h<2600;h++){const p=h%u,g=Math.pow(r.next(),.7),f=8+g*256*.44,v=p*Math.PI*2/u+Math.log(f/8)/d+r.gauss()*.22,b=o+Math.cos(v)*f,x=o+Math.sin(v)*f;l(b,x,3+r.next()*5,g>.3?"rgba(150,180,255,ALPHA)":"rgba(255,220,170,ALPHA)",.12)}l(o,o,256*.12,"rgba(255,235,200,ALPHA)",.9)}else if(a==="Elliptical")i.save(),i.translate(o,o),i.scale(1,r.range(.55,.95)),l(0,0,256*.48,"rgba(255,215,170,ALPHA)",.55),l(0,0,256*.18,"rgba(255,235,205,ALPHA)",.9),i.restore();else{for(let u=0;u<9;u++)l(o+r.gauss()*256*.12,o+r.gauss()*256*.08,256*r.range(.08,.2),"rgba(185,200,255,ALPHA)",.35);for(let u=0;u<300;u++)l(o+r.gauss()*256*.15,o+r.gauss()*256*.1,2.5,"rgba(220,230,255,ALPHA)",.25)}const c=new ve(s);return c.colorSpace=Ae,c}function ha(a){const e=()=>I.clamp(a.gauss()*.18,-.35,.35);return new M(e(),e(),e())}const ua=a=>De(`neighbor:${a.join(",")}`),Sr=new ut().setFromAxisAngle(new M(1,0,0),-Math.PI/2),Mr=.7;class kr{root=new se;spacing=gi;center;reach;fetcher;cells=new Map;cameraCell=null;textures=new Map;geometries=new Map;disposed=!1;lattice;cell;shift=new M;morphing=null;arrived=null;constructor(e,t,s){this.reach=Math.max(1,t),this.fetcher=s,this.center=e,this.setCenter(e),this.buildGrid()}setCenter(e){this.center=e,this.shift=ha(new Ze(ua(e))).multiplyScalar(this.spacing),this.cells.set("0,0,0",{state:"empty"}),this.cameraCell=null}find(e){return this.cells.get(e.map((t,s)=>t-this.center[s]).join(","))?.neighbor??null}morph(e,t=0,s=0){this.morphing=e?{key:e.map((i,r)=>i-this.center[r]).join(","),amount:t,radius:s}:null}recenter(e){const t=e.map((l,c)=>l-this.center[c]),s=t.join(","),i=this.cells.get(s),r=i?.neighbor?.position.clone()??new M;this.arrived&&this.dropArrived();const o=new Map;for(const[l,c]of this.cells){if(l===s||l==="0,0,0"||c.state==="loading")continue;const u=l.split(",").map((d,h)=>Number(d)-t[h]);c.neighbor?.position.sub(r),o.set(u.join(","),c)}return this.cells=o,i?.neighbor&&(i.neighbor.position.sub(r),this.arrived={cell:i,fadeFrom:null}),this.morphing=null,this.setCenter(e),r}releaseArrived(){this.arrived&&this.arrived.fadeFrom===null&&(this.arrived.fadeFrom=performance.now()/1e3)}dropArrived(){this.arrived&&(this.removeCell(this.arrived.cell),this.arrived=null)}nearest(e,t){const s=[];for(const i of this.cells.values())i.neighbor&&s.push(i.neighbor);return s.sort((i,r)=>i.position.distanceToSquared(e)-r.position.distanceToSquared(e)).slice(0,t)}get loadedCount(){let e=0;for(const t of this.cells.values())t.neighbor&&e++;return e}refresh(e){const t=this.reach;for(const[i,r]of this.cells){if(i==="0,0,0")continue;const[o,l,c]=i.split(",").map(Number);Math.max(Math.abs(o-e[0]),Math.abs(l-e[1]),Math.abs(c-e[2]))<=t+1||(this.removeCell(r),this.cells.delete(i))}const s=[];for(let i=-t;i<=t;i++)for(let r=-t;r<=t;r++)for(let o=-t;o<=t;o++){const l=[e[0]+i,e[1]+r,e[2]+o],c=l.join(",");if(this.cells.has(c))continue;if(l.map((d,h)=>this.center[h]+d).some(d=>d<0||d>la)){this.cells.set(c,{state:"empty"});continue}s.push({key:c,offset:l,d:i*i+r*r+o*o})}s.sort((i,r)=>i.d-r.d);for(let i=0;i<s.length;i+=ca)this.fetchBatch(s.slice(i,i+ca))}async fetchBatch(e){const t=new Map;for(const{key:r}of e){const o={state:"loading"};this.cells.set(r,o),t.set(r,o)}let s;try{s=await this.fetcher(e.map(({offset:r})=>r.map((o,l)=>this.center[l]+o)))}catch{for(const[r,o]of t)this.cells.get(r)===o&&this.cells.delete(r);return}if(this.disposed)return;const i=new Map;for(const r of s)i.set(r.coordinates.map((o,l)=>o-this.center[l]).join(","),r);for(const[r,o]of t){if(this.cells.get(r)!==o)continue;const l=i.get(r);if(!l||l.num_systems<=0){o.state="empty";continue}this.place(o,l)}}place(e,t){const s=new M(t.coordinates[0]-this.center[0],t.coordinates[1]-this.center[1],t.coordinates[2]-this.center[2]),i=ua(t.coordinates),r=new Ze(i),o=s.add(ha(r)).multiplyScalar(this.spacing).sub(this.shift),l=new dt({map:this.texture(t.galaxy_type,i),color:new W(1,1,1).multiplyScalar(2.5),blending:Z,depthTest:!1,depthWrite:!1,transparent:!0,opacity:0,side:Se,toneMapped:!1}),c=xr[t.galaxy_type]??3e4,u=new D(this.geometry(c),l);u.rotation.set(r.range(0,Math.PI),r.range(0,Math.PI),r.range(0,Math.PI)),u.frustumCulled=!1,this.root.add(u),e.state="ready",e.mesh=u,e.baseRadius=c,e.baseOrientation=u.quaternion.clone(),e.neighbor={...t,position:o},e.born=performance.now()/1e3}removeCell(e){e.mesh&&(this.root.remove(e.mesh),e.mesh.material.dispose())}texture(e,t){const s=`${e}:${t%yr}`;let i=this.textures.get(s);return i||(i=br(e,De(s)),this.textures.set(s,i)),i}geometry(e){let t=this.geometries.get(e);return t||(t=new Ce(e*2,e*2),this.geometries.set(e,t)),t}buildGrid(){const e=this.spacing,t=new ws(new be(e,e,e)),s=(i,r)=>new ht({color:i,vertexColors:r,transparent:!0,blending:Z,depthTest:!1,depthWrite:!1,toneMapped:!1});this.lattice=new Le(new de,s(4882384,!0)),this.cell=new Le(t,s(8378623,!1));for(const i of[this.lattice,this.cell])i.frustumCulled=!1,i.visible=!1,this.root.add(i)}rebuildLattice(e){const t=this.spacing,s=this.reach+.5,i=e.map((d,h)=>{const p=Math.max(-s,-this.center[h]-d-.5),g=Math.min(s,la-this.center[h]-d+.5),f=[];for(let v=-s;v<=s+1e-6;v++)v>=p-1e-6&&v<=g+1e-6&&f.push(v);return f}),r=[],o=[],l=d=>1-I.smoothstep(Math.hypot(d[0],d[1],d[2]),s*.45,s),c=(d,h)=>{r.push(d[0]*t,d[1]*t,d[2]*t,h[0]*t,h[1]*t,h[2]*t);const p=l(d),g=l(h);o.push(p,p,p,g,g,g)};for(let d=0;d<3;d++){const h=i[d],[p,g]=[(d+1)%3,(d+2)%3];for(const f of i[p])for(const v of i[g])for(let b=0;b<h.length-1;b++){const x=[0,0,0],S=[0,0,0];x[d]=h[b],S[d]=h[b+1],x[p]=S[p]=f,x[g]=S[g]=v,c(x,S)}}const u=new de;u.setAttribute("position",new ze(r,3)),u.setAttribute("color",new ze(o,3)),this.lattice.geometry.dispose(),this.lattice.geometry=u}setGridVisible(e){this.lattice.visible=e,this.cell.visible=e}update(e,t=1,s=1){const i=this.spacing,r=[Math.round((e.x+this.shift.x)/i),Math.round((e.y+this.shift.y)/i),Math.round((e.z+this.shift.z)/i)];(!this.cameraCell||r.some((c,u)=>c!==this.cameraCell[u]))&&(this.cameraCell=r,this.refresh(r),this.rebuildLattice(r));const o=performance.now()/1e3,l=(this.reach+.5)*i;for(const[c,u]of this.cells){if(!u.mesh||!u.neighbor)continue;const d=u.neighbor.position;u.mesh.position.set(d.x-e.x,d.y-e.y,d.z-e.z);const h=I.clamp((o-(u.born??0))/wr,0,1),p=1-I.smoothstep(d.distanceTo(e),l*.7,l);let g=h*p;if(this.morphing?.key===c){const v=this.morphing;u.mesh.quaternion.slerpQuaternions(u.baseOrientation,Sr,v.amount),u.mesh.scale.setScalar(I.lerp(1,v.radius/u.baseRadius,v.amount)),g=Math.max(g,h*v.amount)}else u.baseOrientation&&u.mesh.scale.x!==1&&(u.mesh.quaternion.copy(u.baseOrientation),u.mesh.scale.setScalar(1));u.mesh.material.opacity=g;const f=(u.baseRadius??3e4)*u.mesh.scale.x/Math.max(1,d.distanceTo(e));u.mesh.visible=g>.004&&f>6e-4}if(this.arrived?.cell.mesh){const c=this.arrived.cell.mesh;c.position.copy(this.arrived.cell.neighbor.position).sub(e);const u=this.arrived.fadeFrom===null?1:1-(o-this.arrived.fadeFrom)/Mr;u<=0?this.dropArrived():c.material.opacity=u}if(this.lattice.visible){const c=s/Math.max(t,.001),u=this.cameraCell;this.lattice.position.set(u[0]*i-this.shift.x-e.x,u[1]*i-this.shift.y-e.y,u[2]*i-this.shift.z-e.z),this.cell.position.set(-this.shift.x-e.x,-this.shift.y-e.y,-this.shift.z-e.z),this.lattice.material.opacity=Math.min(1,.22*c),this.cell.material.opacity=Math.min(1,.45*c)}}dispose(){this.disposed=!0,this.dropArrived();for(const e of this.cells.values())this.removeCell(e);this.cells.clear();for(const e of this.textures.values())e.dispose();for(const e of this.geometries.values())e.dispose();for(const e of[this.lattice,this.cell])e.geometry.dispose(),e.material.dispose();this.root.clear()}}const Qe={low:{level:"low",label:"Low",description:"Integrated GPUs, laptops on battery, phones",pixelRatioCap:1,deepSkyScale:.6,antialias:!1,shadows:!1,maxNodes:9e3,maxStars:12e3,splitAngle:.032,fps:30,idleFps:12,starLabels:4,galaxyReach:1,planetDetail:6},medium:{level:"medium",label:"Medium",description:"Balanced default",pixelRatioCap:1.25,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:2e4,maxStars:26e3,splitAngle:.024,fps:60,idleFps:24,starLabels:8,galaxyReach:2,planetDetail:7.5},high:{level:"high",label:"High",description:"Dedicated GPU",pixelRatioCap:2,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:36e3,maxStars:45e3,splitAngle:.018,fps:60,idleFps:30,starLabels:10,galaxyReach:3,planetDetail:8.5},ultra:{level:"ultra",label:"Ultra",description:"Everything, as smooth as the display allows",pixelRatioCap:2,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:6e4,maxStars:75e3,splitAngle:.014,fps:0,idleFps:60,starLabels:12,galaxyReach:3,planetDetail:9}},ls="atlas-quality";function vi(){const a=navigator.hardwareConcurrency||4,e=navigator.deviceMemory||4;return typeof window<"u"&&"ontouchstart"in window&&window.innerWidth<900||a<=4||e<=2?"low":a>=10&&e>=8?"high":"medium"}function xi(){try{const a=localStorage.getItem(ls);if(a&&Qe[a])return a}catch{}return null}function jr(){return Qe[xi()??vi()]}function Nr(a){try{a?localStorage.setItem(ls,a):localStorage.removeItem(ls)}catch{}}function Cr(a,e){return a.antialias!==e.antialias||a.shadows!==e.shadows}const Tr="https://atlas.banshee-devs.workers.dev",da={seed:"1.618033988749895",origin:51408e4};function Ar(a){return!!a&&!a.remote&&String(a.seed_str)===da.seed&&Number(a.cosmic_origin_time)===da.origin}function cs(a){return m("Property of %@ since %@",a.owner??m("someone"),bn(a.since*1e3))}const Zt=(a,e)=>`${a}:${e??"*"}`;class Be{constructor(e=null,t=[]){this.galaxy=e;for(const s of t)this.places.set(Zt(s.system,s.planet),s)}galaxy;places=new Map;get isEmpty(){return this.places.size===0}system(e){return this.places.get(Zt(e,null))??null}ownPlanet(e,t){return this.places.get(Zt(t,e))??null}planet(e,t){return this.ownPlanet(e,t)??this.system(t)}placesIn(e){return[...this.places.values()].filter(t=>t.system===e)}replacing(e,t){const s=[...this.places.values()].filter(i=>i.system!==e);return new Be(this.galaxy,[...s,...t.filter(i=>i.system===e)])}systemName(e,t){return this.system(e)?.name??ma(t)}planetName(e,t){return(t!==null?this.ownPlanet(e.index,t)?.name:null)??ma(e.name)}}const Rr=new Be,ma=a=>a.replace(/_/g," ");function Pr(a){if(!a||typeof a!="object"||typeof a.key!="string"||!Number.isInteger(a.system))return null;const e=t=>typeof t=="string"&&t.trim()?t:null;return{key:a.key,kind:a.kind==="system"?"system":"planet",galaxy:Array.isArray(a.galaxy)&&a.galaxy.length===3?a.galaxy.map(Number):[0,0,0],system:a.system,planet:Number.isInteger(a.planet)?a.planet:null,owner:e(a.owner),name:e(a.name),note:e(a.note),seal:e(a.seal),since:Number.isFinite(a.since)?a.since:0,parent:e(a.parent)}}async function _r(a,e=null){let t=`galaxy=${a.join(",")}`;e!==null&&(t+=`&system=${e}`);try{const s=new AbortController,i=setTimeout(()=>s.abort(),8e3),r=await fetch(`${Tr}/v1/owners?${t}`,{signal:s.signal,credentials:"omit"});if(clearTimeout(i),!r.ok)return null;const o=await r.json();return Array.isArray(o?.places)?o.places.map(Pr).filter(l=>!!l):null}catch{return null}}const Er=["saucer","interceptor"],pa=.42,fa=8,Lr=[[0,-.12],[.3,-.12],[.34,-.1],[.7,-.075],[.94,-.025],[1,-.004],[1,.004],[.94,.03],[.72,.075],[.7,.088],[.46,.115],[.42,.13],[0,.13]],ga="SPACEX";function Ir(a,e,t,s){const i=s*.20999999999999996,r=s*.036,o=3,l=r*.7,c=(u,d)=>{u.save(),u.font=`700 ${r}px "Helvetica Neue", Arial, sans-serif`,u.textBaseline="middle",u.fillStyle=d;const h=ga.split("").map(g=>u.measureText(g).width*o+l),p=h.reduce((g,f)=>g+f,0)-l;for(const g of[0,t]){let f=g-p/2;ga.split("").forEach((v,b)=>{u.save(),u.translate(f,i),u.scale(o,1),u.fillText(v,0,0),u.restore(),f+=h[b]})}u.restore()};c(a,"rgba(196,204,214,0.42)"),c(e,"rgba(20,20,20,0.85)")}function Fr(){const s=()=>{const g=document.createElement("canvas");return g.width=2048,g.height=512,g},i=s(),r=s(),o=i.getContext("2d"),l=r.getContext("2d");o.scale(2,2),l.scale(2,2);let c=1337;const u=()=>(c=c*16807%2147483647)/2147483647;o.fillStyle="#5d636c",o.fillRect(0,0,1024,256),l.fillStyle="#6a6a6a",l.fillRect(0,0,1024,256);const d=[0,34,70,118,150,190,222,256];for(let g=0;g<d.length-1;g++){const f=12+g*6;for(let v=0;v<f;v++){const b=v/f*1024,x=84+Math.floor(u()*18);o.fillStyle=`rgb(${x},${x+4},${x+10})`,o.fillRect(b,d[g],1024/f,d[g+1]-d[g]);const S=90+Math.floor(u()*50);l.fillStyle=`rgb(${S},${S},${S})`,l.fillRect(b,d[g],1024/f,d[g+1]-d[g])}}o.strokeStyle="rgba(20,22,26,0.9)",l.strokeStyle="rgba(220,220,220,1)";for(const g of[o,l]){g.lineWidth=2;for(const f of d)g.beginPath(),g.moveTo(0,f),g.lineTo(1024,f),g.stroke()}for(let g=0;g<d.length-1;g++){const f=12+g*6;for(let v=0;v<f;v++){const b=v/f*1024;for(const x of[o,l])x.beginPath(),x.moveTo(b,d[g]),x.lineTo(b,d[g+1]),x.stroke()}}for(let g=0;g<1400;g++){const f=u()*1024,v=u()*256,b=4+u()*30;o.fillStyle=`rgba(30,32,36,${.04+u()*.08})`,o.fillRect(f,v,b,1),l.fillStyle=`rgba(255,255,255,${.05+u()*.1})`,l.fillRect(f,v,b,1)}Ir(o,l,1024,256);const h=new ve(i);h.colorSpace=Ae,h.anisotropy=4;const p=new ve(r);return p.anisotropy=4,{map:h,roughness:p}}function zr(){const e=()=>{const h=document.createElement("canvas");return h.width=h.height=512,h},t=e(),s=e(),i=t.getContext("2d"),r=s.getContext("2d");let o=4242;const l=()=>(o=o*16807%2147483647)/2147483647,c=512/8;for(let h=0;h<8;h++)for(let p=0;p<8;p++){const g=86+Math.floor(l()*16);i.fillStyle=`rgb(${g},${g+4},${g+10})`,i.fillRect(p*c,h*c,c,c);const f=80+Math.floor(l()*50);r.fillStyle=`rgb(${f},${f},${f})`,r.fillRect(p*c,h*c,c,c)}i.strokeStyle="rgba(20,22,26,0.85)",r.strokeStyle="rgba(220,220,220,1)";for(const h of[i,r]){h.lineWidth=1.5;for(let p=0;p<=8;p++)h.beginPath(),h.moveTo(p*c,0),h.lineTo(p*c,512),h.moveTo(0,p*c),h.lineTo(512,p*c),h.stroke()}for(let h=0;h<500;h++)i.fillStyle=`rgba(30,32,36,${.05+l()*.08})`,i.fillRect(l()*512,l()*512,1,3+l()*18);const u=new ve(t);u.colorSpace=Ae,u.wrapS=u.wrapT=rs,u.anisotropy=4;const d=new ve(s);return d.wrapS=d.wrapT=rs,{map:u,roughness:d}}function yi(){const e=document.createElement("canvas");e.width=e.height=128;const t=e.getContext("2d"),s=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.3,"rgba(255,255,255,0.3)"),s.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=s,t.fillRect(0,0,128,128);const i=new ve(e);return i.colorSpace=Ae,i}function wi(a,e,t,s,i){const r=new le(.022,10,8);e.push(r);const o=(l,c)=>{const u=new dt({color:l}),d=new D(r,u);return d.position.copy(c),a.add(d),e.push(u),d};return{port:o(16722458,t),starboard:o(1769306,s),strobes:i.map(l=>o(16777215,l))}}function Dr(){const a=new se,e=[],{map:t,roughness:s}=Fr(),i=new si(Lr.map(([E,j])=>new Fe(E,j)),128),r=new ue({map:t,roughnessMap:s,color:16777215,metalness:.85,roughness:.55,envMapIntensity:1});a.add(new D(i,r));const o=new He(.97,.012,8,128),l=new ue({color:1711394,metalness:.6,roughness:.6}),c=new D(o,l);c.rotation.x=Math.PI/2,c.position.y=.012,a.add(c),e.push(t,s,i,r,o,l);const u=new le(.4,48,16,0,Math.PI*2,0,Math.PI/2),d=new Dt({color:725272,metalness:.2,roughness:.06,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.2}),h=new D(u,d);h.scale.y=.42,h.position.y=.128,a.add(h);const p=new He(.4,.008,8,96),g=new ue({color:2764341,metalness:.8,roughness:.4}),f=new D(p,g);f.rotation.x=Math.PI/2,f.position.y=.13,a.add(f),e.push(u,d,p,g);const v=new le(.075,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),b=new ue({color:3817287,metalness:.85,roughness:.45});for(let E=0;E<3;E++){const j=E/3*Math.PI*2+Math.PI/6,_=new D(v,b);_.position.set(Math.cos(j)*.56,-.088,Math.sin(j)*.56),a.add(_)}const x=new He(.22,.016,10,64),S=new dt({color:0}),N=new D(x,S);N.rotation.x=Math.PI/2,N.position.y=-.122,a.add(N);const T=yi(),R=new vs({map:T,color:10475775,blending:Z,depthWrite:!1,transparent:!0}),k=new gs(R);k.position.y=-.16,a.add(k),e.push(v,b,x,S,T,R);const C=wi(a,e,new M(-1,0,0),new M(1,0,0),[new M(0,0,1),new M(0,.14,.05),new M(0,-.13,0)]);return{group:a,...C,disposables:e,bank:.3,maxBank:.45,scale:1,drive:(E,j,_)=>{const z=.15+.85*j+.04*Math.sin(E*7);S.color.setRGB(.35*z,.8*z,1.2*z),k.scale.setScalar(.4+1.1*j+.5*_),R.opacity=.15+.6*j}}}function Wr(){const a=new se,e=[],{map:t,roughness:s}=zr(),i=new ue({map:t,roughnessMap:s,color:16777215,metalness:.85,roughness:.5,envMapIntensity:1}),r=new ue({color:1777187,metalness:.7,roughness:.55});e.push(t,s,i,r);const o=new Is;o.moveTo(0,-.62),o.lineTo(.8,.52),o.lineTo(.8,.64),o.lineTo(.3,.7),o.lineTo(-.3,.7),o.lineTo(-.8,.64),o.lineTo(-.8,.52),o.closePath();const l=new Fs(o,{depth:.035,bevelEnabled:!0,bevelThickness:.012,bevelSize:.018,bevelSegments:2});l.rotateX(Math.PI/2),l.translate(0,.0175,0);const c=l.getAttribute("uv"),u=l.getAttribute("position");for(let U=0;U<c.count;U++)c.setXY(U,u.getX(U)*1.6,u.getZ(U)*1.6);const d=new D(l,i);a.add(d),e.push(l);const h=document.createElement("canvas");h.width=512,h.height=160;const p=h.getContext("2d");p.font='800 118px "Helvetica Neue", Arial, sans-serif',p.textAlign="center",p.textBaseline="middle",p.fillStyle="#ffffff";const g="PLD".split(""),f=150;g.forEach((U,G)=>p.fillText(U,256+(G-1)*f,84));const v=new ve(h);v.colorSpace=Ae,v.anisotropy=4;const b=new ue({map:v,color:15265266,emissive:2764856,emissiveMap:v,transparent:!0,metalness:.4,roughness:.35,envMapIntensity:1.2,polygonOffset:!0,polygonOffsetFactor:-2,depthWrite:!1}),x=new Ce(.4,.15);x.rotateX(-Math.PI/2),e.push(v,b,x);for(const U of[-1,1]){const G=new D(x,b);G.position.set(U*.5,.0365,.42),a.add(G)}const S=[[0,-1.18],[.045,-1.06],[.1,-.8],[.14,-.45],[.155,-.05],[.15,.45],[.13,.72],[.1,.8],[0,.8]].map(([U,G])=>new Fe(U,G)),N=new si(S,48);N.rotateX(Math.PI/2),N.scale(1,.62,1);const T=new D(N,i);a.add(T),e.push(N);const R=new le(.1,40,16,0,Math.PI*2,0,Math.PI/2),k=new Dt({color:725272,metalness:.2,roughness:.06,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.2}),C=new D(R,k);C.scale.set(.95,.75,3.4),C.position.set(0,.07,-.42),a.add(C),e.push(R,k);const E=new be(.07,.05,.32);for(const U of[-1,1]){const G=new D(E,r);G.position.set(U*.2,.035,-.05),a.add(G)}e.push(E);const j=new Is;j.moveTo(0,0),j.lineTo(.3,0),j.lineTo(.3,.06),j.lineTo(.08,.24),j.closePath();const _=new Fs(j,{depth:.014,bevelEnabled:!1});_.rotateY(-Math.PI/2),e.push(_);for(const U of[-1,1]){const G=new D(_,i);G.position.set(U*.24,.03,.4),G.rotation.z=-U*.35,a.add(G)}const z=new lt(.08,.095,.7,32);z.rotateX(Math.PI/2);const A=new lt(.1,.085,.09,32,1,!0);A.rotateX(Math.PI/2);const L=new un(.078,32),V=new dt({color:0}),F=yi(),q=new vs({map:F,color:9425151,blending:Z,depthWrite:!1,transparent:!0}),Q=new ti(.07,1,24,1,!0);Q.rotateX(-Math.PI/2),Q.translate(0,0,.5);const ie=new $({uniforms:{uLevel:{value:0},uTime:{value:0}},vertexShader:"varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uLevel; uniform float uTime; varying vec3 vPos;
      void main() {
        float along = clamp(vPos.z, 0.0, 1.0);
        float flicker = 0.85 + 0.15 * sin(uTime * 40.0 + along * 30.0);
        vec3 color = mix(vec3(0.75, 0.92, 1.0), vec3(0.15, 0.4, 1.0), along) * pow(1.0 - along, 1.6) * uLevel * flicker;
        gl_FragColor = vec4(color, 1.0);
      }
    `,blending:Z,transparent:!0,depthWrite:!1,side:Se});e.push(z,A,L,V,F,q,Q,ie);const ce=[],Re=[];for(const U of[-1,1]){const G=U*.24,he=new D(z,i);he.position.set(G,.015,.42),a.add(he);const ke=new D(A,r);ke.position.set(G,.015,.8),a.add(ke);const je=new D(L,V);je.position.set(G,.015,.8),a.add(je);const et=new gs(q);et.position.set(G,.015,.86),a.add(et),ce.push(et);const P=new D(Q,ie);P.position.set(G,.015,.83),a.add(P),Re.push(P)}const Oe=wi(a,e,new M(-.81,0,.58),new M(.81,0,.58),[new M(0,.07,.7),new M(0,-.06,.1)]);return{group:a,...Oe,disposables:e,bank:.5,maxBank:.75,scale:.95,drive:(U,G,he)=>{const ke=.25+.75*G+.05*Math.sin(U*9)+.4*he;V.color.setRGB(.55*ke,.85*ke,1.3*ke);for(const je of ce)je.scale.setScalar(.22+.45*G+.35*he);q.opacity=.35+.55*Math.min(1,G+he),ie.uniforms.uLevel.value=.25+1.4*G+1.2*he,ie.uniforms.uTime.value=U;for(const je of Re)je.scale.set(1,1,.25+1.6*G+2.2*he)}}}const va={saucer:Dr,interceptor:Wr};class Or{scene=new Ee;camera=new fs(30,1,.1,100);ship=new se;model=null;kind=null;key;disposables=[];time=0;roll=0;pitch=0;thrust=0;baseY=-.77;lightDirection=new M(-.5,.6,.6).normalize();presence=0;constructor(e,t="saucer"){const s=new Ji(e),i=s.fromScene(new mn,.04).texture;s.dispose(),this.scene.environment=i,this.scene.environmentIntensity=.35,this.disposables.push(i),this.key=new nt(16774374,2.6);const r=new hn(10466520,790036,.25),o=new nt(9419007,.5);o.position.set(.5,.4,-3),this.scene.add(this.key,this.key.target,r,o),this.scene.add(this.ship),this.setKind(t)}setKind(e){e===this.kind||!va[e]||(this.model&&(this.ship.remove(this.model.group),this.model.disposables.forEach(t=>t.dispose())),this.kind=e,this.model=va[e](),this.ship.add(this.model.group))}get visible(){return this.presence>.005}update(e,t,s){const i=this.model;this.time+=e;const r=this.time,o=(v,b,x)=>v+(b-v)*Math.min(1,e*x);this.presence=o(this.presence,s.visible?1:0,3),this.thrust=o(this.thrust,s.thrust,2.5);const l=-(s.strafe??0)*i.maxBank*.85;this.roll=o(this.roll,I.clamp(s.yawRate*i.bank+l,-i.maxBank,i.maxBank),3),this.pitch=o(this.pitch,I.clamp(-s.pitchRate*.2-(s.climb??0)*.22,-.3,.3),3),this.camera.aspect=t,this.camera.updateProjectionMatrix(),s.light&&s.light.lengthSq()>0&&this.lightDirection.lerp(s.light.clone().normalize(),Math.min(1,e*2)).normalize(),this.key.position.copy(this.lightDirection).multiplyScalar(10).add(this.ship.position),this.key.target.position.copy(this.ship.position);const c=fa*Math.tan(I.degToRad(this.camera.fov/2)),u=c*(1-2*(s.floor??1)),d=.22*pa*2.4;this.baseY=o(this.baseY,Math.max(-c*.36,u+d),4);const h=s.warp*.012,p=(1-this.presence)*c*1.2;this.ship.position.set((Math.random()-.5)*h,this.baseY+Math.sin(r*.8)*.012-p+(Math.random()-.5)*h,-fa-this.thrust*1.2),this.ship.scale.setScalar(pa*i.scale),this.ship.rotation.set(.3+this.thrust*.1+this.pitch,0,this.roll+Math.sin(r*.6)*.008);const g=r%1.2,f=g<.05||g>.15&&g<.2?1:0;for(const v of i.strobes)v.material.color.setScalar(.08+2.5*f);i.port.material.color.setRGB(2.2,.15,.08),i.starboard.material.color.setRGB(.1,2,.35),i.drive(r,this.thrust,s.warp)}dispose(){this.model?.disposables.forEach(e=>e.dispose()),this.disposables.forEach(e=>e.dispose()),this.scene.clear()}}const bi="atlas-view-options",Xt={shipView:!0,universeGrid:!0,flightHud:!0,soundEffects:!0,ship:"saucer"},Gr=2,qr={2:["universeGrid"]};function Vr(){try{const a=JSON.parse(localStorage.getItem(bi)??"null");if(a&&typeof a=="object"){const e={...Xt},t=typeof a.revision=="number"?a.revision:1,s=new Set(Object.entries(qr).flatMap(([i,r])=>t<Number(i)?r:[]));for(const i of Object.keys(Xt))i!=="ship"&&!s.has(i)&&typeof a[i]=="boolean"&&(e[i]=a[i]);return Er.includes(a.ship)&&(e.ship=a.ship),e}}catch{}return{...Xt}}function Hr(a){try{localStorage.setItem(bi,JSON.stringify({...a,revision:Gr}))}catch{}}const xa=.5;class Br{ctx=null;master=null;reverb=null;noise=null;driveNodes=null;lastDrive={level:-1,warp:-1};enabled=!0;attach(e){if(!e||this.ctx)return;this.ctx=e,this.master=e.createGain(),this.master.gain.value=this.enabled?xa:0,this.master.connect(e.destination);const t=Math.floor(e.sampleRate*2);this.noise=e.createBuffer(1,t,e.sampleRate);const s=this.noise.getChannelData(0);for(let l=0;l<t;l++)s[l]=Math.random()*2-1;const i=e.createConvolver(),o=e.createBuffer(2,Math.floor(e.sampleRate*3.2),e.sampleRate);for(let l=0;l<2;l++){const c=o.getChannelData(l);let u=0;for(let d=0;d<c.length;d++){const h=d/c.length;u+=(Math.random()*2-1-u)*(.6-.45*h),c[d]=u*Math.pow(1-h,3.2)}}i.buffer=o,this.reverb=e.createGain(),this.reverb.gain.value=.6,this.reverb.connect(i).connect(this.master),this.buildDrive()}setEnabled(e){if(this.enabled=e,!this.ctx||!this.master)return;const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t),this.master.gain.setValueAtTime(this.master.gain.value,t),this.master.gain.linearRampToValueAtTime(e?xa:0,t+.4)}get live(){return!!this.ctx&&!!this.master&&this.enabled&&this.ctx.state!=="closed"}noiseSource(){const e=this.ctx.createBufferSource();return e.buffer=this.noise,e.loop=!0,e.loopStart=Math.random(),e}tone(e,t){const s=this.ctx,i=t.at??s.currentTime,r=t.attack??.005,o=t.decay??.3,l=s.createOscillator();l.type=t.type??"sine",l.frequency.setValueAtTime(e,i),t.detune&&(l.detune.value=t.detune),t.glideTo&&l.frequency.exponentialRampToValueAtTime(t.glideTo,i+(t.glide??r+o));const c=s.createGain();if(c.gain.setValueAtTime(0,i),c.gain.linearRampToValueAtTime(t.gain??.1,i+r),c.gain.exponentialRampToValueAtTime(1e-4,i+r+o),l.connect(c),c.connect(this.master),t.send){const u=s.createGain();u.gain.value=t.send,c.connect(u).connect(this.reverb)}l.start(i),l.stop(i+r+o+.05),l.onended=()=>c.disconnect()}sweep(e){const t=this.ctx,s=e.at??t.currentTime,i=this.noiseSource(),r=t.createBiquadFilter();r.type=e.filter??"bandpass",r.Q.value=e.q??1,r.frequency.setValueAtTime(e.from,s),r.frequency.exponentialRampToValueAtTime(e.to,s+e.attack+e.decay);const o=t.createGain();if(o.gain.setValueAtTime(0,s),o.gain.linearRampToValueAtTime(e.gain,s+e.attack),o.gain.exponentialRampToValueAtTime(1e-4,s+e.attack+e.decay),i.connect(r).connect(o).connect(this.master),e.send){const l=t.createGain();l.gain.value=e.send,o.connect(l).connect(this.reverb)}i.start(s),i.stop(s+e.attack+e.decay+.05),i.onended=()=>o.disconnect()}buildDrive(){const e=this.ctx,t=this.noiseSource(),s=e.createBiquadFilter();s.type="lowpass",s.frequency.value=140,s.Q.value=.7;const i=e.createGain();i.gain.value=0,t.connect(s).connect(i).connect(this.master);const r=this.noiseSource(),o=e.createBiquadFilter();o.type="bandpass",o.frequency.value=700,o.Q.value=.6;const l=e.createGain();l.gain.value=0,r.connect(o).connect(l).connect(this.master);const c=e.createOscillator();c.type="sine",c.frequency.value=52;const u=e.createGain();u.gain.value=0,c.connect(u).connect(this.master),t.start(),r.start(),c.start(),this.driveNodes={rumble:i,rumbleFilter:s,rush:l,rushFilter:o,tone:u,toneOsc:c}}drive(e,t){const s=this.driveNodes;if(!s||!this.ctx||Math.abs(e-this.lastDrive.level)<.01&&Math.abs(t-this.lastDrive.warp)<.01)return;this.lastDrive={level:e,warp:t};const i=this.ctx.currentTime,r=.12;s.rumble.gain.setTargetAtTime(.06*e+.14*t,i,r),s.rumbleFilter.frequency.setTargetAtTime(120+260*e+500*t,i,r),s.rush.gain.setTargetAtTime(.018*e+.06*t,i,r),s.rushFilter.frequency.setTargetAtTime(500+900*e+2600*t,i,r),s.tone.gain.setTargetAtTime(.025*t+.01*e,i,r),s.toneOsc.frequency.setTargetAtTime(48+14*e+40*t,i,r)}select(e="star"){if(!this.live)return;const t=this.ctx.currentTime;e==="planet"?(this.tone(880,{at:t,decay:.7,gain:.05,send:.5}),this.tone(1318.5,{at:t+.07,decay:.8,gain:.04,send:.5})):e==="moon"?(this.tone(1046.5,{at:t,decay:.5,gain:.04,send:.5}),this.tone(1568,{at:t+.06,decay:.6,gain:.03,send:.5})):(this.tone(1320,{at:t,decay:.18,gain:.05,send:.35}),this.tone(1980,{at:t,decay:.12,gain:.02,send:.35}))}shutter(){if(!this.live)return;const e=this.ctx.currentTime;this.sweep({at:e,filter:"highpass",from:2600,to:1800,q:.7,attack:.002,decay:.05,gain:.09}),this.sweep({at:e+.075,filter:"highpass",from:2200,to:1500,q:.7,attack:.002,decay:.07,gain:.07,send:.2}),this.tone(1760,{at:e+.075,decay:.35,gain:.015,send:.4})}deselect(){this.live&&this.tone(700,{decay:.12,gain:.03,glideTo:520,send:.2})}depart(e=1){if(!this.live)return;const t=this.ctx.currentTime;this.sweep({at:t,from:260,to:2400,q:1.1,attack:.45,decay:1.3,gain:.11*e,send:.3}),this.tone(62,{at:t,attack:.4,decay:1.4,gain:.08*e,glideTo:96})}approach(){this.live&&this.sweep({from:380,to:1500,q:1.3,attack:.3,decay:1,gain:.07,send:.3})}arrive(){if(!this.live)return;const e=this.ctx.currentTime;for(const[t,s]of[[110,.04],[164.8,.03],[220,.025],[329.6,.012]])this.tone(t,{at:e,attack:.35,decay:2.4,gain:s,send:.7,detune:(Math.random()-.5)*8})}orbit(){if(!this.live)return;const e=this.ctx.currentTime;this.tone(659.3,{at:e,attack:.02,decay:1.6,gain:.04,send:.7}),this.tone(987.8,{at:e+.12,attack:.02,decay:1.8,gain:.03,send:.7})}hyperCharge(e=1.1){if(!this.live)return;const t=this.ctx,s=t.currentTime,i=t.createOscillator();i.type="triangle",i.frequency.setValueAtTime(70,s),i.frequency.exponentialRampToValueAtTime(420,s+e);const r=t.createOscillator();r.frequency.setValueAtTime(5,s),r.frequency.exponentialRampToValueAtTime(28,s+e);const o=t.createGain();o.gain.value=.03;const l=t.createGain();l.gain.setValueAtTime(0,s),l.gain.linearRampToValueAtTime(.05,s+e*.9),l.gain.linearRampToValueAtTime(0,s+e+.08),r.connect(o).connect(l.gain),i.connect(l).connect(this.master);const c=t.createGain();c.gain.value=.3,l.connect(c).connect(this.reverb),i.start(s),r.start(s),i.stop(s+e+.1),r.stop(s+e+.1),i.onended=()=>l.disconnect(),this.sweep({at:s,filter:"highpass",from:400,to:5200,q:.8,attack:e*.95,decay:.15,gain:.05,send:.2})}hyperEnter(e){if(!this.live)return;const t=e??this.ctx.currentTime;this.tone(150,{at:t,attack:.008,decay:1.3,gain:.32,glideTo:30,glide:1}),this.tone(75,{at:t,attack:.01,decay:1.6,gain:.12,glideTo:28,glide:1.4,send:.3}),this.sweep({at:t,filter:"lowpass",from:5e3,to:160,q:.9,attack:.01,decay:1.1,gain:.16,send:.5}),this.tone(2637,{at:t+.02,attack:.005,decay:.9,gain:.012,send:.8})}hyperExit(){if(!this.live)return;const e=this.ctx.currentTime;this.sweep({at:e,from:3200,to:260,q:1,attack:.04,decay:1.4,gain:.1,send:.5}),this.tone(210,{at:e,attack:.01,decay:.9,gain:.08,glideTo:90}),this.tone(1318.5,{at:e+.05,attack:.02,decay:1.4,gain:.018,send:.8}),this.tone(1975.5,{at:e+.12,attack:.02,decay:1.4,gain:.012,send:.8})}dive(e=1){this.live&&(this.hyperCharge(e),this.sweep({from:200,to:3e3,q:.9,attack:e,decay:.2,gain:.06,send:.3}),this.hyperEnter(this.ctx.currentTime+e))}}const Y=new Br;function ct(){try{const a=document.getElementById("data-universe-config");return a?JSON.parse(a.textContent||"null"):null}catch{return null}}function Ns(a,e=null,t=null){let s=`coordinates=${a.join(",")}`;return e!==null&&(s+=`&system=${e}`,t&&(s+=`&planet=${t}`)),`/stargate/${btoa(s).replace(/\+/g,"-").replace(/\//g,"_")}`}const Jt='ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',ya='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',it="103,232,249",$r="1.618033988749895",Ur="https://the-atlas.koyeb.app";function Yr(){const a=["localhost","127.0.0.1","[::1]"].includes(window.location.hostname),e=ct(),t=e&&!e.remote&&String(e.seed_str)===$r&&new Date(e.cosmic_origin_time*1e3).getUTCFullYear()===1986;return a&&t?Ur:window.location.origin}function tt(a,e,t,s,i,r="left"){const o=[...e],l=o.reduce((u,d)=>u+a.measureText(d).width,0)+i*(o.length-1);let c=r==="right"?t-l:t;a.textAlign="left";for(const u of o)a.fillText(u,c,s),c+=a.measureText(u).width+i;return l}function Zr(a,e,t,s,i,r,o){a.strokeStyle=`rgba(${it},0.6)`,a.lineWidth=o,a.beginPath();for(const[l,c,u,d]of[[e,t,1,1],[e+s,t,-1,1],[e,t+i,1,-1],[e+s,t+i,-1,-1]])a.moveTo(l,c+d*r),a.lineTo(l,c),a.lineTo(l+u*r,c);a.stroke()}async function Xr(a,e){const t=document.createElement("canvas");return await jn.toCanvas(t,a,{width:e,margin:1,errorCorrectionLevel:"M",color:{dark:"#02040a",light:"#ffffff"}}),t}async function Jr(a,e,t=new Date){const s=a.width,i=a.height,r=document.createElement("canvas");r.width=s,r.height=i;const o=r.getContext("2d");o.drawImage(a,0,0);const l=Math.min(s,i)/800,c=Math.round(34*l);o.textBaseline="alphabetic";const u=o.createLinearGradient(0,i,0,i-260*l);u.addColorStop(0,"rgba(0,0,0,0.5)"),u.addColorStop(1,"rgba(0,0,0,0)"),o.fillStyle=u,o.fillRect(0,i-260*l,s,260*l);let d=i-c;o.font=`${Math.round(11*l)}px ${Jt}`,o.shadowColor="rgba(0,0,0,0.85)",o.shadowBlur=6*l,o.fillStyle="rgba(203,213,225,0.8)";const h=t.toISOString().slice(0,16).replace("T"," · ");tt(o,`${h} UTC`.toUpperCase(),c,d,2.6*l),d-=22*l,o.fillStyle=`rgba(${it},0.78)`;for(const g of e.lines)tt(o,g.toUpperCase(),c,d,2.6*l),d-=19*l;d-=6*l,o.font=`500 ${Math.round(24*l)}px ${ya}`,o.fillStyle="rgba(255,255,255,0.95)",o.shadowColor="rgba(0,0,0,0.6)",o.shadowBlur=10*l,o.fillText(e.title,c,d),o.shadowBlur=0,d-=30*l,o.font=`${Math.round(10.5*l)}px ${Jt}`,o.fillStyle=`rgba(${it},0.85)`,o.shadowColor="rgba(0,0,0,0.85)",o.shadowBlur=6*l,tt(o,e.kind.toUpperCase(),c,d,3.4*l),d-=30*l,o.font=`700 ${Math.round(22*l)}px ${ya}`,o.fillStyle="rgba(255,255,255,0.95)";const p=tt(o,"ATLAS",c,d,11*l);if(o.fillStyle="#67e8f9",o.shadowColor="rgba(34,211,238,0.9)",o.shadowBlur=14*l,o.fillText("3",c+p+11*l,d),o.shadowBlur=0,e.url){const g=Math.round(Math.max(96,150*l)),f=Math.round(10*l),v=Math.round(26*l),b=g+f*2,x=g+f*2+v,S=s-c-b,N=i-c-x;o.fillStyle="rgba(2,4,10,0.72)",o.beginPath(),o.roundRect(S,N,b,x,10*l),o.fill(),o.strokeStyle=`rgba(${it},0.25)`,o.lineWidth=Math.max(1,l),o.stroke(),Zr(o,S-6*l,N-6*l,b+12*l,x+12*l,12*l,Math.max(1,1.2*l));const T=await Xr(e.url,g);o.save(),o.beginPath(),o.roundRect(S+f,N+f,g,g,6*l),o.clip(),o.drawImage(T,S+f,N+f,g,g),o.restore(),o.font=`${Math.round(9.5*l)}px ${Jt}`,o.fillStyle=`rgba(${it},0.8)`;const R=m("SCAN TO FLY HERE");o.textBaseline="middle";const k=[...R].reduce((C,E)=>C+o.measureText(E).width,0)+2.4*l*(R.length-1);tt(o,R,S+(b-k)/2,N+f+g+v/2+f/2,2.4*l),o.textBaseline="alphabetic"}return new Promise((g,f)=>r.toBlob(v=>v?g(v):f(new Error("The photo could not be encoded")),"image/png"))}async function Kr(a,e){const t=new File([a],e,{type:"image/png"});if(window.matchMedia?.("(pointer: coarse)").matches&&navigator.canShare?.({files:[t]}))try{await navigator.share({files:[t],title:"The Atlas"});return}catch{}const i=URL.createObjectURL(a),r=document.createElement("a");r.href=i,r.download=e,document.body.appendChild(r),r.click(),r.remove(),setTimeout(()=>URL.revokeObjectURL(i),2e3)}function Qr(a,e){if(a.mean_temperature===void 0||a.atmosphere_factor===void 0)return a.surface_temperature;const t=2*Math.PI/a.orbital_period_seconds,s=(a.initial_orbital_angle+e*t)%(2*Math.PI),i=a.orbital_radius,r=a.eccentricity_factor;let o=i*(1-r**2)/(1+r*Math.cos(s));o<.1&&(o=.1);let l=a.mean_temperature+273.15;l*=(i/o)**.5;let c=l-273.15;const u=a.atmosphere_factor;return c=c>=0?c*u:c/u,Math.max(c,-270.45)}async function pt(a,e){const t=await fetch(a,{credentials:"same-origin",...e}),s=await t.json();if(!t.ok||s.success===!1)throw new Error(s.error||`Request failed: ${t.status}`);return s}const Ot=a=>`/api/v2/galaxy/${a[0]}/${a[1]}/${a[2]}`;async function wa(a){return pt(Ot(a))}async function ba(a,e){return pt(`${Ot(a)}/system/${e}`)}function Sa(a,e,t){return`${Ot(a)}/system/${e}/planet/${t}/rendering-data`}async function el(a){return(await pt("/api/v2/galaxies",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({coordinates:a})})).galaxies}async function tl(){try{const e=await(await fetch("/api/current-location",{credentials:"same-origin"})).json();return e.galaxy_coordinates?{coordinates:e.galaxy_coordinates,system:e.system_index??null}:null}catch{return null}}async function Si(){const a=await pt("/api/generate-random-location"),e=a.coordinates;return{coordinates:[e.x,e.y,e.z],system:a.system_index??null,planet:a.planet_index??null,galaxyName:a.galaxy_name,systemName:a.system_name??null,planetName:a.planet_name??null}}class sl{coordinates;cache=new Map;waiting=new Map;timer=null;constructor(e){this.coordinates=e}peek(e){return this.cache.get(e)}get(e){const t=this.cache.get(e);return t?Promise.resolve(t):new Promise(s=>{const i=this.waiting.get(e);i?i.push(s):this.waiting.set(e,[s]),this.timer||(this.timer=setTimeout(()=>this.flush(),60))})}async flush(){this.timer=null;const e=Array.from(this.waiting.entries()).slice(0,256);for(const[t]of e)this.waiting.delete(t);this.waiting.size>0&&(this.timer=setTimeout(()=>this.flush(),60));try{const t=await pt(`${Ot(this.coordinates)}/systems`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({indices:e.map(([i])=>i)})}),s=new Map(t.systems.map(i=>[i.index,i]));for(const[i,r]of e){const o=s.get(i)??null;o&&this.cache.set(i,o),r.forEach(l=>l(o))}}catch{for(const[,t]of e)t.forEach(s=>s(null))}}}const al=60,Ma=.08,ka=9e3,ja=60;function Mi(){try{const a=JSON.parse(document.getElementById("data-universe-config")?.textContent||"{}");return String(a.seed_str||a.seed_name||"local")}catch{return"local"}}const ki=`atlas-ship:${Mi()}`,ji=`atlas-recent-galaxies:${Mi()}`,rt=(a,e)=>ae(a,e);function _e(a){if(a>=1e3)return`${rt(a/1e3,a>=1e4?0:1)} kly`;if(a>=1)return`${rt(a,a>=100?0:1)} ly`;const e=a*ge;return e>=1?`${rt(e,e>=100?0:1)} AU`:`${X(Math.round(e*1496e5))} km`}function il(a){if(a>=.1)return`${rt(a,a>=100?0:2)} AU`;const e=a*1496e5;return e>=1e6?`${rt(e/1e6,1)} M km`:`${X(Math.round(e))} km`}const re=a=>a.replace(/_/g," "),nl=typeof window<"u"&&!!window.matchMedia?.("(pointer: coarse)").matches;function ol(){try{const a=localStorage.getItem(ki);if(!a)return null;const e=JSON.parse(a);if(Array.isArray(e.coordinates)&&e.coordinates.length===3&&Number.isFinite(e.system))return e}catch{}return null}function Ni(){try{return JSON.parse(localStorage.getItem(ji)||"[]")}catch{return[]}}class rl{state={mode:"loading",status:m("Powering up the ship…"),error:null,coordinates:null,galaxy:null,pois:[],ship:null,shipSystemName:null,target:null,system:null,orbiting:null,planetDetail:null,moons:[],visitingMoon:null,travel:null,mapView:!1,nearby:[],arrival:null,timeScale:1,cosmicTime:0,cosmicOrigin:0,timeDrift:0,readout:{primary:"",secondary:""},quality:"medium",qualityAuto:!0,view:Vr(),fps:0,universeView:!1,owners:Rr};listeners=new Set;engine;navigator;labels;galaxy=null;directory=null;systemLayer=null;systemPosition=null;planetFrame=null;framePlanet=null;departingFrame=null;pendingSystem=null;pendingPlanet=null;travelIndex=null;destination=null;shipPosition=null;hover=null;hoverPlanet=null;pointer=null;lastLabelRefresh=0;lastNearbyRefresh=0;nearbyStars=[];cameraWorld=new M;cameraLocal=new M;forward=new M;quaternion=new ut;lastEmit=0;lastExposureMeasure=0;disposeFrame;loadToken=0;arrivalTimer=null;warpBurst=0;warpFov=0;driveStart=null;lastCameraWorld=null;speed=0;quality;exotics=null;neighbors=null;jump=null;jumpFx=null;pointerMoved=!1;lastHoverPick=0;shipView;lastYaw=0;lastPitch=0;shipFloor=1;lastFloorMeasure=0;constructor(e,t){this.quality=t,this.state={...this.state,quality:t.level,qualityAuto:xi()===null},this.engine=new Rn(e,t),this.shipView=new Or(this.engine.renderer,this.state.view.ship),this.labels=new Dn(e,this.engine.renderer.domElement),this.navigator=new In({onClick:(s,i)=>this.handleClick(s,i),onHover:(s,i)=>{this.pointer={x:s,y:i},this.pointerMoved=!0},rayAt:(s,i)=>this.engine.rayDirection(s,i,new M),onUserMove:()=>this.cancelArrival(),onDoubleClick:(s,i)=>this.handleDoubleClick(s,i)}),this.navigator.attach(this.engine.renderer.domElement),this.navigator.attachOverlay(e.parentElement??e),this.engine.renderer.domElement.addEventListener("pointerleave",()=>this.pointer=null),window.addEventListener("keydown",this.handleKey),this.disposeFrame=this.engine.onFrame(s=>this.frame(s)),this.engine.start(),Y.setEnabled(this.state.view.soundEffects),this.engine.calm=Ye(),window.addEventListener(Os,this.onComfort)}onComfort=()=>{this.engine.calm=Ye()};subscribe=e=>(this.listeners.add(e),()=>this.listeners.delete(e));getState=()=>this.state;setState(e){this.state={...this.state,...e},this.listeners.forEach(t=>t())}dockShip(e,t,s){if(!this.state.coordinates)return;const i={coordinates:this.state.coordinates,system:e,planet:t};try{localStorage.setItem(ki,JSON.stringify(i))}catch{}this.setState({ship:i,shipSystemName:s??this.state.shipSystemName})}rememberGalaxy(e){try{const t=Ni().filter(s=>s.coordinates.join(",")!==e.coordinates.join(","));t.unshift({coordinates:e.coordinates,name:e.name,type:e.galaxy_type}),localStorage.setItem(ji,JSON.stringify(t.slice(0,8)))}catch{}}ownersRequests=0;galaxyOwnersRequest=0;systemOwnersRequest=new Map;loadOwners(e,t=null){if(!Ar(ct()))return;const s=this.loadToken,i=++this.ownersRequests;t!==null?this.systemOwnersRequest.set(t,i):this.galaxyOwnersRequest=i,_r(e,t).then(r=>{if(!r||s!==this.loadToken||this.state.coordinates?.join(",")!==e.join(","))return;let o;if(t!==null){if(this.systemOwnersRequest.get(t)!==i)return;o=(this.state.owners.galaxy?.join(",")===e.join(",")?this.state.owners:new Be(e)).replacing(t,r)}else{if(this.galaxyOwnersRequest!==i)return;o=new Be(e,r);for(const[l,c]of this.systemOwnersRequest)c>i&&(o=o.replacing(l,this.state.owners.placesIn(l)))}this.setState({owners:o})})}galaxyMaxDistance(e){return Math.max(e*16,gi*(.4+.4*this.quality.galaxyReach))}loadNeighbors(e){this.neighbors=new kr(e,this.quality.galaxyReach,el),this.neighbors.setGridVisible(this.state.view.universeGrid),this.engine.deepScene.add(this.neighbors.root)}disposeExtras(e=!1){this.exotics&&(this.engine.deepScene.remove(this.exotics.root),this.exotics.dispose(),this.exotics=null),this.neighbors&&!e&&(this.engine.deepScene.remove(this.neighbors.root),this.neighbors.dispose(),this.neighbors=null),this.engine.setLenses([])}arrivalSystem(e){return De(`arrival:${e.coordinates.join(",")}`)%Math.max(1,e.num_systems)}async loadGalaxy(e,t={},s=null){const i=++this.loadToken;this.lastCameraWorld=null,this.jump=null,this.leaveSystem(!0),this.galaxy?.dispose(),this.galaxy&&this.engine.deepScene.remove(this.galaxy.root),this.galaxy=null;const r=!!s&&!!this.neighbors;this.disposeExtras(r),r&&this.navigator.rebase(this.neighbors.recenter(e),1),this.shipPosition=null,this.destination=null,this.labels.removeWhere(()=>!0),this.arrivalTimer&&clearTimeout(this.arrivalTimer),this.systemOwnersRequest.clear(),this.setState({mode:"loading",status:r?null:m("Dropping out of hyperspace…"),error:null,coordinates:e,target:null,system:null,orbiting:null,planetDetail:null,moons:[],visitingMoon:null,pois:[],nearby:[],arrival:null,travel:null,owners:new Be(e)}),this.loadOwners(e);try{const o=s?.info??(await wa(e)).galaxy;if(i!==this.loadToken)return;this.directory=new sl(e),this.rememberGalaxy(o),this.setState({galaxy:o,status:o.num_systems>0&&!r?m("Charting the galaxy…"):null});const l=o.num_systems>0?t.system!=null&&t.system<o.num_systems?t.system:this.arrivalSystem(o):null,c=new $n(o,{onReady:(u,d)=>{if(i!==this.loadToken)return;this.setState({pois:u,arrival:{name:re(o.name),type:o.galaxy_type,systems:o.num_systems}}),this.exotics=new vr(u,d,o.galaxy_type==="Singularity Void"?"Void":o.galaxy_type,o.quasars>0),this.engine.deepScene.add(this.exotics.root),this.navigator.minDistance=.004,this.navigator.maxDistance=this.galaxyMaxDistance(d);const h=u.find(f=>f.kind==="torus"),p=h?this.exotics.approachDistance(h)??d*2.3:d*2.3,g=h?5:3.2;r&&this.neighbors?this.navigator.flyTo(new M,p,{duration:g+.4,pitch:.55,yaw:this.navigator.yaw+.4}):(this.loadNeighbors(e),this.navigator.focus.set(0,0,0),this.navigator.yaw=.5,this.navigator.pitch=.75,this.navigator.setDistance(d*7),this.navigator.flyTo(new M,p,{duration:g,pitch:.55,yaw:.9})),l!==null&&(this.dockShip(l,t.planet??null,null),c.locate(l).then(f=>{i===this.loadToken&&(this.shipPosition=f,this.directory?.get(l).then(v=>v&&this.setState({shipSystemName:re(v.name)})))}),this.arrivalTimer=setTimeout(()=>{i===this.loadToken&&(this.setState({arrival:null}),this.travelToSystem(l,t.planet??null))},4200))},onLod:()=>{i===this.loadToken&&(this.neighbors?.releaseArrived(),this.state.mode==="loading"&&(this.setState({mode:"galaxy",status:null}),this.endJump()))}});c.setBudget(this.quality),this.galaxy=c,this.engine.deepScene.add(c.root),o.num_systems===0&&(this.setState({mode:"galaxy",status:null,arrival:{name:re(o.name),type:o.galaxy_type,systems:0}}),this.endJump())}catch(o){if(i!==this.loadToken)return;this.setState({error:o instanceof Error?o.message:String(o),status:null}),this.endJump()}}startJump(e,t=!1){const s=performance.now()/1e3;this.jumpFx={start:s,enterAt:s+e,exitAt:null,entered:!1,exited:!1,quietEntry:t},e>.05&&Y.hyperCharge(e)}endJump(){const e=this.jumpFx;!e||e.exitAt!==null||(e.exitAt=Math.max(performance.now()/1e3,e.enterAt+1.4))}jumpIn(){this.startJump(0,!0)}engageDrive(){this.driveStart=performance.now(),this.cancelArrival(),Y.hyperCharge(2.2)}hyperjump(e,t=null,s=null){const i=this.state.mode==="galaxy"&&!this.systemLayer?this.neighbors?.find(e):null;if(i){this.jumpToNeighbor(i,t,s);return}this.setState({travel:{label:m("Hyperjump to %@",e.join(", ")),progress:0},arrival:null}),this.startJump(1.1),setTimeout(()=>this.loadGalaxy(e,{system:t,planet:s}),1300)}async goToPlace(e,t,s,i=null){if(s===null&&i&&t!==null)try{const{system:o}=await ba(e,t);s=o.planets.find(l=>l.name.toLowerCase()===i.toLowerCase())?.index??null}catch{}if(!(!!this.galaxy&&this.state.coordinates?.join(",")===e.join(","))){this.hyperjump(e,t,s);return}t===null?this.openMap():s!==null&&this.systemLayer?.system.index===t?this.focusPlanet(s):this.travelToSystem(t,s)}async jumpToNeighbor(e,t,s=null){const i=++this.loadToken;this.cancelArrival(),this.setState({target:null,arrival:null,travel:{label:m("Hyperjump to %@",re(e.name)),progress:0}});let r;try{r=(await wa(e.coordinates)).galaxy}catch{i===this.loadToken&&this.loadGalaxy(e.coordinates,{system:t,planet:s});return}if(i!==this.loadToken)return;const o=Yn(r),l=o*7,c=e.position.clone();this.navigator.maxDistance=Math.max(this.navigator.maxDistance,l);const u=1;this.startJump(u),setTimeout(()=>{i===this.loadToken&&(this.jump={coordinates:e.coordinates,position:c,radius:o,distance:l},this.navigator.flyTo(c,l,{duration:4,onArrive:()=>{i===this.loadToken&&this.jump&&(this.endJump(),this.loadGalaxy(e.coordinates,{system:t,planet:s},{info:r}))}}))},u*1e3)}async selectSystem(e,t=null){if(!this.galaxy||!this.directory)return;this.travelIndex===null&&(this.cancelArrival(),Y.select("star")),this.setState({target:{kind:"system",index:e,summary:this.directory.peek(e)??null,position:t}});const[s,i]=await Promise.all([this.directory.get(e),this.galaxy.locate(e)]),r=this.state.target;r?.kind!=="system"||r.index!==e||(s?.stars[0]&&this.galaxy.setRealStarType(e,s.stars[0].Type),this.galaxy.setHighlight(i),this.setState({target:{kind:"system",index:e,summary:s,position:i}}))}engage(){const e=this.state.target;e?.kind==="system"?this.travelToSystem(e.index):e?.kind==="poi"?this.flyToPoi(e.poi):e?.kind==="planet"?this.focusPlanet(e.planet.index):e?.kind==="moon"?this.focusMoon(e.moon.name):e?.kind==="star"&&this.focusStar(e.index)}selectStar(e){const t=this.systemLayer,s=t?.stars[e];if(!t||!s)return;const i=t.stars.length>1?` ${String.fromCharCode(65+e)}`:"";this.systemLayer?.setSelectedPlanet(null),this.setState({target:{kind:"star",index:e,star:s.info,name:`${this.state.owners.systemName(t.system.index,t.system.name)}${i}`,temperature:s.look.temperature}}),Y.select("star")}focusStar(e){const t=this.systemLayer,s=t?.stars[e];!t||!s||((this.state.target?.kind!=="star"||this.state.target.index!==e)&&this.selectStar(e),this.state.orbiting&&(this.planetFrame?.setFocusMoon(null),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null})),this.navigator.follow=null,this.navigator.minDistance=s.radius*1.25,Y.approach(),this.navigator.flyTo(s.offset.clone(),s.radius*4.5,{pitch:.25}))}async travelToSystem(e,t=null){if(!this.galaxy||!this.state.coordinates)return;if(this.systemLayer&&this.systemLayer.system.index===e){t!=null?this.focusPlanet(t):this.navigator.flyTo(new M,Math.max(this.systemLayer.outerRadius*2.6,3));return}this.systemLayer&&this.leaveSystem(!1),this.travelIndex=e,await this.selectSystem(e),this.travelIndex=null;const s=this.state.target;if(s?.kind!=="system"||s.index!==e||!s.position)return;this.destination={index:e,position:s.position.clone()},this.pendingSystem=ba(this.state.coordinates,e),this.pendingPlanet=t,this.navigator.follow=null,this.navigator.minDistance=ja*.5/ge;const i=s.summary?this.state.owners.systemName(e,s.summary.name):m("system #%@",X(e));this.setState({travel:{label:m("Travelling to %@",i),progress:0},arrival:null}),Y.depart(),this.navigator.flyTo(s.position,ja/ge,{pitch:.35})}cancelArrival(){this.arrivalTimer&&(clearTimeout(this.arrivalTimer),this.arrivalTimer=null),this.state.arrival&&this.setState({arrival:null})}flyToPoi(e){this.cancelArrival(),this.state.mode==="system"&&this.leaveSystem(!1),this.destination=null,this.navigator.follow=null,this.galaxy?.setHighlight(null),this.setState({target:{kind:"poi",poi:e},arrival:null,travel:{label:m("Heading to %@",O(e.name)),progress:0}}),Y.depart(),this.navigator.flyTo(new M(...e.position),this.exotics?.approachDistance(e)??Math.max(e.radius*3.5,.5))}focusPlanet(e){const t=this.systemLayer;if(!t||!this.state.coordinates||!this.systemPosition)return;const s=t.planet(e);if(!s)return;if(t.setSelectedPlanet(e),this.departingFrame?.index===e){const r=this.departingFrame;this.departingFrame=null,this.planetFrame&&this.framePlanet!==null&&(this.departingFrame={frame:this.planetFrame,index:this.framePlanet}),this.planetFrame=r.frame,this.framePlanet=r.index}if(!this.planetFrame||this.framePlanet!==e){this.planetFrame&&this.framePlanet!==null&&(this.departingFrame?.frame.dispose(),this.departingFrame={frame:this.planetFrame,index:this.framePlanet},this.planetFrame=null),this.framePlanet=e;const r=new sr({dataUrl:Sa(this.state.coordinates,t.system.index,e),stars:t.system.stars,starOffsets:t.starOffsets,visualRadiusAU:s.radius,maxOrbitalRadius:t.system.max_orbital_radius,timing:{cosmic_origin_time:t.timing.cosmic_origin_time,current_time:t.timing.current_time},maxOctaves:this.quality.planetDetail});this.planetFrame=r,this.setState({planetDetail:{loading:!0,moons:0},moons:[]}),r.load().then(()=>{this.planetFrame===r&&this.state.orbiting?.index===e&&this.setState({planetDetail:{loading:!1,moons:r.moonCount},moons:r.moons})})}else{const r=this.planetFrame;this.setState({planetDetail:{loading:!r.ready,moons:r.moonCount},moons:r.moons})}this.planetFrame?.setFocusMoon(null),this.setState({visitingMoon:null}),this.setState({target:{kind:"planet",planet:s.data},orbiting:s.data,travel:{label:m("Approaching %@",this.state.owners.planetName(s.data,t.system.index)),progress:0}}),this.dockShip(t.system.index,e,re(t.system.name)),this.navigator.minDistance=s.radius*1.12,this.navigator.follow=null;const i=()=>t.planetPosition(e);Y.approach(),this.navigator.flyTo(s.position.clone(),s.radius*6,{track:i,onArrive:()=>{this.navigator.follow=i,Y.orbit()}})}moonWorld(e,t=new M){const s=this.systemLayer,i=this.planetFrame,r=this.state.orbiting;if(!s||!i||!r)return null;const o=s.planetPosition(r.index),l=i.moonOffsetAU(e,t);return o&&l?l.add(o):null}selectMoon(e){const t=this.state.moons.find(s=>s.name===e);t&&(this.setState({target:{kind:"moon",moon:t}}),Y.select("moon"))}focusMoon(e){const t=this.planetFrame,s=this.state.moons.find(d=>d.name===e),i=this.moonWorld(e);if(!t||!s||!i)return;const r=t.moonRadiusAU(e);t.setFocusMoon(e),this.navigator.follow=null,this.navigator.minDistance=r*1.15;const o=()=>this.moonWorld(e);this.setState({target:{kind:"moon",moon:s},visitingMoon:s,travel:{label:m("Approaching %@",re(s.name)),progress:0}});const l=i.clone().negate().normalize(),c=Math.atan2(l.x,l.z)+.95,u=I.clamp(Math.asin(l.y)+.2,-1.2,1.2);Y.approach(),this.navigator.flyTo(i,r*5,{yaw:c,pitch:u,track:o,onArrive:()=>{this.navigator.follow=o,Y.orbit()}})}closePlanetFrame(){this.disposeCurrentFrame(),this.departingFrame?.frame.dispose(),this.departingFrame=null,this.engine.planetPasses=[],this.systemLayer?.setDetailed([]),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null})}disposeCurrentFrame(){this.planetFrame?.dispose(),this.planetFrame=null,this.framePlanet=null}openMap(){this.galaxy&&(this.cancelArrival(),this.state.mode==="system"&&this.systemLayer&&(this.closePlanetFrame(),this.leaveSystem(!1)),this.galaxy.setHighlight(this.shipPosition),this.setState({target:null,arrival:null}),this.navigator.follow=null,Y.depart(.7),this.navigator.flyTo(new M,this.galaxy.radius*2.3,{pitch:.6,duration:3.5}))}async takePhoto(e){const t=this.state.coordinates;if(this.state.mode==="loading"||!t||!this.galaxy)return!1;const s=this.state.view.universeGrid;this.neighbors?.setGridVisible(!1),this.systemLayer?.setOrbitsVisible(!1),this.galaxy.hideHighlightOnce();let i;try{i=this.engine.snapshot()}finally{this.neighbors?.setGridVisible(s),this.systemLayer?.setOrbitsVisible(!0)}Y.shutter(),e?.();const r=this.photoPlace(t),o=await Jr(i,r),l=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-"),c=r.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"space";return await Kr(o,`atlas-${c}-${l}.png`),!0}photoPlace(e){const t=this.state.owners,s=this.state.galaxy?re(this.state.galaxy.name):m("Galaxy"),i=`${s} · ${e.join(", ")}`,r=this.state.mode==="system"?this.state.system:null,o=r?this.state.orbiting:null,l=o?this.state.visitingMoon:null,c=r?`${t.systemName(r.index,r.name)} · ${m("system #%@",r.index.toLocaleString("en"))}`:null,d=!!ct()?.remote?null:`${Yr()}${Ns(e,r?.index??null,o?.name??null)}`;if(l&&o&&r)return{title:re(l.name),kind:m("Moon"),lines:[`${t.planetName(o,r.index)} · ${O(re(o.planet_type))}`,c,i],url:d};if(o&&r){const p=t.planet(o.index,r.index);return{title:t.planetName(o,r.index),kind:m("%@ planet",O(re(o.planet_type))),lines:[...p?[cs(p)]:[],c,i],url:d}}if(r){const p=t.system(r.index);return{title:t.systemName(r.index,r.name),kind:m("Star system"),lines:[...p?[cs(p)]:[],i],url:d}}const h=this.state.galaxy?.galaxy_type;return{title:s,kind:h?h==="Singularity Void"?h:m("%@ galaxy",O(h)):m("Galaxy"),lines:[e.join(", ")],url:d}}returnToShip(){const e=this.state.ship;e&&this.travelToSystem(e.system,e.planet)}goUp(){if(this.state.mode==="system"&&this.systemLayer){if(this.state.visitingMoon&&this.state.orbiting){this.focusPlanet(this.state.orbiting.index);return}if(this.state.orbiting){this.planetFrame?.setFocusMoon(null),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null}),this.systemLayer.setSelectedPlanet(null),this.navigator.follow=null,this.navigator.minDistance=1e-4,this.dockShip(this.systemLayer.system.index,null,re(this.systemLayer.system.name)),this.setState({target:null}),Y.approach(),this.navigator.flyTo(new M,this.systemLayer.outerRadius*2.6);return}this.openMap();return}this.state.mode==="galaxy"&&(this.state.target?(this.galaxy?.setHighlight(this.shipPosition),this.setState({target:null})):this.isMapView()?this.isUniverseView()||this.viewUniverse():this.openMap())}viewUniverse(){!this.galaxy||this.state.mode!=="galaxy"||(this.cancelArrival(),this.setState({target:null}),this.navigator.follow=null,Y.depart(.7),this.navigator.flyTo(new M,this.navigator.maxDistance*.85,{pitch:.5,duration:3.5}))}setTimeScale(e){this.systemLayer&&(this.systemLayer.timeScale=e),this.setState({timeScale:e})}resetTime(){this.systemLayer?.resetTime(),this.setTimeScale(1),this.setState({timeDrift:0,cosmicTime:this.systemLayer?.cosmicNow??Date.now()/1e3,cosmicOrigin:this.systemLayer?.timing.cosmic_origin_time??0})}setQuality(e){const t=e??vi(),s=Qe[t];if(Nr(e),this.setState({qualityAuto:e===null}),Cr(this.quality,s))return!0;const i=s.galaxyReach!==this.quality.galaxyReach;return this.quality=s,this.engine.applyQuality(s),this.galaxy?.setBudget(s),i&&this.neighbors&&this.galaxy&&this.state.coordinates&&(this.engine.deepScene.remove(this.neighbors.root),this.neighbors.dispose(),this.loadNeighbors(this.state.coordinates),this.systemLayer||(this.navigator.maxDistance=this.galaxyMaxDistance(this.galaxy.radius))),this.labels.removeWhere(r=>r.startsWith("star:")),this.setState({quality:t}),!1}setViewOption(e,t){const s={...this.state.view,[e]:t};Hr(s),this.neighbors?.setGridVisible(s.universeGrid),Y.setEnabled(s.soundEffects),this.shipView.setKind(s.ship),this.setState({view:s})}clearTarget(){this.state.target&&this.state.target.kind!=="planet"&&this.state.target.kind!=="moon"&&Y.deselect(),this.galaxy?.setHighlight(this.shipPosition),this.state.target?.kind==="planet"&&this.systemLayer?.setSelectedPlanet(this.state.orbiting?.index??null),this.state.visitingMoon?this.setState({target:{kind:"moon",moon:this.state.visitingMoon}}):this.setState({target:this.state.orbiting?{kind:"planet",planet:this.state.orbiting}:null})}viewSystem(){const e=this.systemLayer;if(e){if(this.state.orbiting){this.goUp();return}this.navigator.follow=null,this.navigator.flyTo(new M,Math.max(e.outerRadius*2.6,3))}}async enterSystem(){if(!this.pendingSystem||!this.destination||!this.galaxy)return;const e=this.pendingSystem,t=this.destination;this.pendingSystem=null;let s;try{s=await e}catch(o){this.setState({error:o instanceof Error?o.message:String(o)});return}if(this.destination!==t)return;const i=new ta(s.system,s.timing);i.timeScale=this.state.timeScale,this.systemLayer=i,this.systemPosition=t.position.clone(),this.shipPosition=t.position.clone(),this.engine.nearScene.add(i.root),this.engine.nearSceneVisible=!0,this.galaxy.setHidden(t.position),this.galaxy.setHighlight(null),this.navigator.rebase(t.position,ge),this.navigator.minDistance=1e-4,this.navigator.maxDistance=ka*3,this.setState({mode:"system",system:s.system,target:null,travel:this.navigator.isFlying?this.state.travel:null}),this.dockShip(s.system.index,null,re(s.system.name)),this.loadOwners(this.state.coordinates,s.system.index),this.paintPlanets(i,this.state.coordinates),Y.arrive();const r=this.pendingPlanet;this.pendingPlanet=null,r!=null?setTimeout(()=>this.focusPlanet(r),400):this.navigator.isFlying||this.navigator.flyTo(new M,Math.max(i.outerRadius*2.6,3),{duration:2.5,pitch:.45})}async paintPlanets(e,t){for(const s of e.system.planets){if(this.systemLayer!==e)return;try{const r=await(await fetch(Sa(t,e.system.index,s.index),{credentials:"same-origin"})).json(),o=r.rendering_data?.planet_info;r.success&&o?.base_color&&this.systemLayer===e&&e.setPlanetColor(s.index,so({planet_info:o}))}catch{}}}leaveSystem(e){const t=this.systemLayer;if(!t||!this.systemPosition){this.pendingSystem=null;return}this.closePlanetFrame();const s=this.systemPosition;this.navigator.follow=null,this.navigator.rebase(s.clone().multiplyScalar(-ge),1/ge),this.engine.nearScene.remove(t.root),this.engine.nearSceneVisible=!1,t.dispose(),this.systemLayer=null,this.systemPosition=null,this.destination=null,this.galaxy?.setHidden(null),this.labels.removeWhere(i=>i.startsWith("planet:")||i.startsWith("sysstar:")),this.galaxy&&(this.navigator.minDistance=.004,this.navigator.maxDistance=this.galaxyMaxDistance(this.galaxy.radius)),e||(this.setState({mode:"galaxy",system:null,target:null}),this.galaxy?.setHighlight(this.shipPosition))}pickMoon(e,t){const s=this.planetFrame;if(!s?.ready||!this.state.orbiting||this.state.moons.length===0)return null;const i=this.engine.renderer.domElement.getBoundingClientRect(),r=new Fe((e-i.left)/i.width*2-1,-((t-i.top)/i.height)*2+1),o=s.moonAt(r);if(o?.name)return o.name;let l=null,c=18;for(const u of this.state.moons){const d=s.projectMoon(u.name);if(!d||d.z>1)continue;const h=Math.hypot((d.x+1)/2*i.width+i.left-e,(1-d.y)/2*i.height+i.top-t);h<c&&(c=h,l=u.name)}return l}handleClick(e,t){const s=this.pickMoon(e,t);if(s){this.selectMoon(s);return}if(this.state.mode==="system"&&this.systemLayer){const r=this.systemLayer.pickBody(e,t,o=>this.engine.project(o,{x:0,y:0}),this.cameraLocal);r?.kind==="planet"?(this.systemLayer.setSelectedPlanet(r.body.data.index),this.setState({target:{kind:"planet",planet:r.body.data}}),Y.select("planet")):r?.kind==="star"&&this.selectStar(r.index);return}if(this.state.mode!=="galaxy"||!this.galaxy)return;const i=this.galaxy.pick(e,t,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement);i?this.selectSystem(i.index,i.position):this.clearTarget()}handleDoubleClick(e,t){const s=this.pickMoon(e,t);if(s){this.focusMoon(s);return}if(this.state.mode==="system"&&this.systemLayer){const r=this.systemLayer.pickBody(e,t,o=>this.engine.project(o,{x:0,y:0}),this.cameraLocal);r?.kind==="planet"?this.focusPlanet(r.body.data.index):r?.kind==="star"&&this.focusStar(r.index);return}if(this.state.mode!=="galaxy"||!this.galaxy)return;const i=this.galaxy.pick(e,t,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement);i&&this.travelToSystem(i.index)}handleKey=e=>{const t=e.target?.tagName;t==="INPUT"||t==="TEXTAREA"||(e.key==="Escape"?this.goUp():e.key==="Enter"?this.engage():e.key==="m"||e.key==="M"?this.openMap():(e.key==="h"||e.key==="H")&&this.returnToShip())};frame(e){const t=this.navigator;if(t.update(e),t.cameraPosition(this.cameraLocal),this.systemLayer&&this.systemPosition?this.cameraWorld.copy(this.cameraLocal).divideScalar(ge).add(this.systemPosition):this.cameraWorld.copy(this.cameraLocal),this.lastCameraWorld&&e>0){const l=this.cameraWorld.distanceTo(this.lastCameraWorld)/e;this.speed+=(l-this.speed)*Math.min(1,e*6),this.lastCameraWorld.copy(this.cameraWorld)}else this.lastCameraWorld=this.cameraWorld.clone();if(t.orientation(this.quaternion),this.engine.camera.quaternion.copy(this.quaternion),this.engine.camera.updateMatrixWorld(),this.engine.camera.getWorldDirection(this.forward),this.warpBurst=Math.max(0,this.warpBurst-e*.9),this.driveStart!==null&&(this.warpBurst=Math.max(this.warpBurst,Math.min(1,(performance.now()-this.driveStart)/1400))),this.engine.warp=Math.max(t.warpIntensity,this.warpBurst),this.jump)if(!t.isFlying)this.jump=null,this.neighbors?.morph(null),this.endJump();else{this.engine.warp=Math.max(this.engine.warp,Math.sin(Math.PI*t.flightProgress)*.9);const l=this.cameraWorld.distanceTo(this.jump.position)/this.jump.distance,c=1-I.smoothstep(Math.log(Math.max(l,1)),0,Math.log(10));this.neighbors?.morph(this.jump.coordinates,c,this.jump.radius)}this.updateJump();const s=t.isFlying?Math.sin(Math.PI*t.flightProgress):0;Y.drive(Math.max(s,t.throttleLevel*.7),Math.max(this.engine.warp,this.jumpRide)),this.warpFov+=(this.engine.warp-this.warpFov)*Math.min(1,e*3);const i=al+24*this.warpFov*(2-this.warpFov);this.labels.setFade(Math.min(1-I.smoothstep(this.warpFov,.05,.4),this.jumpLabelFade())),Math.abs(this.engine.camera.fov-i)>.001&&(this.engine.camera.fov=i,this.engine.camera.updateProjectionMatrix()),this.engine.idle=t.isIdle&&this.warpBurst===0&&this.warpFov<.01&&!this.jumpFx;const r=Date.now()/1e3;if(this.exotics&&(this.exotics.update(r,this.cameraWorld,this.engine.pixelRatio,this.engine.viewportHeight,this.engine.exposure,this.engine.camera.projectionMatrix.elements[5]),this.engine.setLenses(this.exotics.lenses(this.cameraWorld,this.engine.camera))),this.neighbors){const l=this.systemLayer?t.distance/ge:t.distance,c=this.galaxy?.radius??1;this.neighbors.update(this.cameraWorld,this.engine.exposure,I.smoothstep(l,c*.1,c*.6))}if(this.updateShip(e),this.galaxy){const l=this.systemLayer?t.distance/ge:t.distance;this.galaxy.update(e,this.cameraWorld,this.engine.pixelRatio,this.engine.exposure),performance.now()-this.lastExposureMeasure>(this.engine.idle?1500:250)&&(this.lastExposureMeasure=performance.now(),this.galaxy.measureExposure(this.cameraWorld,this.engine.camera));const c=Math.log(this.engine.exposure);this.engine.exposure=Math.exp(c+(Math.log(this.galaxy.targetExposure)-c)*Math.min(1,e*2.5)),this.galaxy.maybeRequest(this.cameraWorld,this.forward,l,this.engine.camera.fov*Math.PI/180,this.engine.camera.aspect,this.engine.viewportHeight)}if(this.systemLayer){const l=this.systemLayer;l.presence=ta.presenceAt(this.cameraLocal.length()),this.systemPosition&&this.galaxy?.setHidden(this.systemPosition,l.presence),l.update(e,this.cameraLocal);const c=Math.max(l.nearestSurface(this.cameraLocal),1e-9);this.engine.nearRange=[Math.max(1e-9,c*.25),1e5],this.updatePlanetFrame(e)}this.checkTransitions(),this.updateHover(),this.updateLabels();const o=performance.now();if(o-this.lastEmit>200){this.lastEmit=o;const l=this.systemLayer?t.flightRemaining/ge:t.flightRemaining,c=this.state.travel&&t.isFlying?{...this.state.travel,progress:t.flightProgress,speed:this.speed,remaining:l}:null;this.setState({readout:this.readout(),cosmicTime:this.systemLayer?.cosmicNow??Date.now()/1e3,cosmicOrigin:this.systemLayer?.timing.cosmic_origin_time??0,timeDrift:this.systemLayer?.drift??0,travel:c,mapView:this.isMapView(),universeView:this.isUniverseView(),fps:this.engine.fps})}this.state.mode==="galaxy"&&o-this.lastNearbyRefresh>1e3&&(this.lastNearbyRefresh=o,this.refreshNearby())}updateJump(){const e=this.jumpFx,t=this.engine.jump;if(!e){t.active=!1,t.charge=t.mouth=t.exit=t.flash=0,this.jumpRide=0;return}const s=performance.now()/1e3,i=this.engine.screenCover;e.exitAt===null&&s-e.enterAt>20&&(e.exitAt=s);const r=e.enterAt>e.start?I.smoothstep(s,e.start,e.enterAt):1;t.active=!0,t.charge=s<e.enterAt?r*r:Math.max(0,1-(s-e.enterAt)*5),!e.entered&&s>=e.enterAt&&(e.entered=!0,e.quietEntry||Y.hyperEnter());let o=0;e.exitAt!==null&&s>=e.exitAt?(o=I.clamp((s-e.exitAt)/1.1,0,1),t.exit=1,t.mouth=i*(1-Math.pow(1-o,3)),e.exited||(e.exited=!0,Y.hyperExit())):(t.exit=0,t.mouth=i*Math.pow(s<e.enterAt?r:1,2.4)),t.flash=.7*Math.exp(-Math.pow((s-e.enterAt)/.12,2))+(e.exitAt!==null?.4*Math.exp(-Math.pow((s-e.exitAt-.05)/.14,2)):0),this.jumpRide=e.entered?1-o:r*.5,this.engine.warp=Math.max(this.engine.warp,t.charge*.3,this.jumpRide*.6),e.exitAt!==null&&s>e.exitAt+1.15&&(this.jumpFx=null)}jumpRide=0;jumpLabelFade(){const e=this.engine.jump;if(!e.active)return 1;const t=this.engine.screenCover;return e.exit?I.smoothstep(e.mouth,t*.6,t):1-I.smoothstep(e.mouth,t*.08,t*.4)}updateShip(e){const t=this.navigator;let s=t.yaw-this.lastYaw;s=Math.atan2(Math.sin(s),Math.cos(s));let i=t.pitch-this.lastPitch;i=Math.atan2(Math.sin(i),Math.cos(i)),this.lastYaw=t.yaw,this.lastPitch=t.pitch;const r=e>0?1/e:0,o=t.isFlying?Math.sqrt(Math.sin(Math.PI*t.flightProgress)):0,l=this.state.view.shipView&&(!!this.jumpFx||this.state.mode!=="loading"&&!this.isMapView()),c=(this.systemLayer?this.cameraLocal:this.cameraWorld).clone().negate();if(c.applyQuaternion(this.quaternion.clone().invert()),performance.now()-this.lastFloorMeasure>250){this.lastFloorMeasure=performance.now();const u=this.engine.renderer.domElement.getBoundingClientRect(),d=document.querySelector("[data-ship-floor]")?.getBoundingClientRect();this.shipFloor=d&&d.height>0&&u.height>0?(d.top-u.top)/u.height:1}this.shipView.update(e,this.engine.camera.aspect,{yawRate:s*r,pitchRate:i*r,thrust:Math.max(o,t.throttleLevel),strafe:t.strafe,climb:t.climb,warp:this.engine.warp,visible:l,light:c,floor:this.shipFloor}),this.engine.shipPass=this.shipView.visible?this.shipView:null}isMapView(){return this.state.mode==="galaxy"&&!!this.galaxy&&this.navigator.distance>this.galaxy.radius*.5}isUniverseView(){return this.state.mode==="galaxy"&&!!this.galaxy&&this.navigator.distance>Math.max(this.galaxy.radius*6,this.navigator.maxDistance*.45)}updatePlanetFrame(e){const t=this.systemLayer;if(!t){this.engine.planetPasses=[];return}const s=t.cosmicNow-Date.now()/1e3,i=[],r=[],o=(l,c)=>{const u=t.planet(c);if(!u)return!1;const d=this.cameraLocal.distanceTo(u.position),h=l.ready&&d<u.radius*600;return l.viewportHeight=this.engine.viewportHeight*this.engine.pixelRatio,l.update(e,this.cameraLocal,u.position,this.quaternion,t.cosmicNow,s,this.cameraWorld.clone().negate().normalize()),h&&(i.push({distance:d,pass:{scene:l.scene,camera:l.camera}}),r.push(c)),h};if(this.planetFrame&&this.framePlanet!==null){const l=o(this.planetFrame,this.framePlanet);!this.state.orbiting&&!l&&this.disposeCurrentFrame()}this.departingFrame&&!o(this.departingFrame.frame,this.departingFrame.index)&&(this.departingFrame.frame.dispose(),this.departingFrame=null),i.sort((l,c)=>c.distance-l.distance),this.engine.planetPasses=i.map(l=>l.pass),t.setDetailed(r)}checkTransitions(){const e=this.navigator,t=this.state.target;this.state.mode==="galaxy"&&!this.destination&&this.travelIndex===null&&t?.kind==="system"&&t.position&&e.distance<.006&&e.focus.distanceTo(t.position)<.01&&this.travelToSystem(t.index),this.state.mode==="galaxy"&&this.destination&&this.pendingSystem&&e.distance<Ma&&e.focus.distanceTo(this.destination.position)<Ma&&(this.enterSystem(),this.pendingSystem=null),this.state.mode==="system"&&this.systemLayer&&e.distance>ka&&this.leaveSystem(!1)}refreshNearby(){if(!this.galaxy||!this.directory||this.isMapView()){this.state.nearby.length&&this.setState({nearby:[]});return}const e=this.galaxy.visibleStars(this.cameraWorld,6,300).filter(t=>t.index!==this.state.ship?.system);Promise.all(e.map(t=>this.directory.get(t.index))).then(t=>{const s=[];t.forEach((i,r)=>{i&&s.push({index:i.index,name:this.state.owners.systemName(i.index,i.name),starType:i.stars.map(o=>O(o.Type)).join(" + "),planets:i.num_planets,distance:_e(e[r].distance)})}),this.setState({nearby:s})})}updateHover(){if(!this.pointer||this.navigator.isFlying){this.hover=null,this.hoverPlanet=null;return}const e=performance.now();!this.pointerMoved||e-this.lastHoverPick<60||(this.pointerMoved=!1,this.lastHoverPick=e,this.hover=null,this.hoverPlanet=null,this.state.mode==="galaxy"&&this.galaxy?(this.hover=this.galaxy.pick(this.pointer.x,this.pointer.y,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement),this.hover&&this.directory&&!this.directory.peek(this.hover.index)&&this.directory.get(this.hover.index)):this.state.mode==="system"&&this.systemLayer&&(this.hoverPlanet=this.systemLayer.pickPlanet(this.pointer.x,this.pointer.y,t=>this.engine.project(t,{x:0,y:0}),this.cameraLocal)),this.engine.renderer.domElement.style.cursor=this.hover||this.hoverPlanet?"pointer":"grab")}projectWorld(e){const t=e.clone().sub(this.cameraWorld);return this.engine.project(t,{x:0,y:0})}updateLabels(){const e=this.labels;e.beginFrame();const t=performance.now(),s=this.isMapView();if(this.state.mode==="galaxy"&&this.galaxy&&this.directory){if(this.shipPosition){const c=this.projectWorld(this.shipPosition);c&&(e.upsert("ship","ship",m("You are here"),this.shipSystemTitle()??"",()=>this.returnToShip()),e.place("ship",c.x,c.y))}if(this.neighbors&&this.navigator.distance>this.galaxy.radius*1.2)for(const c of this.neighbors.nearest(this.navigator.focus,s?16:8)){const u=this.projectWorld(c.position);u&&(e.upsert(`galaxy:${c.coordinates.join(",")}`,"galaxy",re(c.name),`${c.coordinates.join(", ")}
${O(c.galaxy_type)} · ${nl?m("tap to hyperjump"):m("click to hyperjump")}`,()=>this.hyperjump(c.coordinates)),e.place(`galaxy:${c.coordinates.join(",")}`,u.x,u.y,.85))}const i=[];for(const c of this.state.pois){const u=new M(...c.position),d=u.distanceTo(this.cameraWorld),h=c.id==="smbh"?this.galaxy.info.num_systems===0?1/0:400:c.kind==="core"||c.kind==="quasar"||c.kind==="torus"?1/0:c.kind==="globular"||c.kind==="open"?Math.max(c.radius*120,2500):2500;if(d>h||d<c.radius*.8)continue;const p=this.projectWorld(u);p&&i.push({poi:c,distance:d,showRange:h,screen:p})}i.sort((c,u)=>c.distance-u.distance);const r=this.state.target?.kind==="poi"?this.state.target.poi.id:null;if(i.filter((c,u)=>u<(s?3:8)||c.poi.kind==="core"||c.poi.kind==="quasar"||c.poi.kind==="torus"||c.poi.id===r).forEach(({poi:c,distance:u,showRange:d,screen:h})=>{const p=`poi:${c.id}`,g=c.kind==="globular"||c.kind==="open"?"cluster":c.kind==="blackhole"||c.kind==="pulsar"||c.kind==="torus"?"exotic":"poi";e.upsert(p,g,O(c.name),_e(u),()=>this.setState({target:{kind:"poi",poi:c}}),()=>this.flyToPoi(c)),e.place(p,h.x,h.y,d===1/0?1:Math.min(1,(d-u)/(d*.3)))}),t-this.lastLabelRefresh>600){this.lastLabelRefresh=t,this.nearbyStars=s?[]:this.galaxy.visibleStars(this.cameraWorld,this.quality.starLabels,400);for(const c of this.nearbyStars)this.directory.get(c.index).then(u=>{u?.stars[0]&&this.galaxy?.setRealStarType(c.index,u.stars[0].Type)});e.removeWhere(c=>c.startsWith("star:")&&!this.nearbyStars.some(u=>`star:${u.index}`===c))}const o=this.state.target?.kind==="system"?this.state.target.index:null;for(const c of this.nearbyStars){const u=this.directory.peek(c.index);if(!u||c.index===o||c.index===this.state.ship?.system)continue;const d=this.projectWorld(c.position);d&&(e.upsert(`star:${c.index}`,"star",this.state.owners.systemName(c.index,u.name),_e(c.position.distanceTo(this.cameraWorld)),()=>this.selectSystem(c.index,c.position),()=>this.travelToSystem(c.index),this.state.owners.system(c.index)?.seal),e.place(`star:${c.index}`,d.x,d.y,.85))}if(this.hover&&this.hover.index!==o){const c=this.directory.peek(this.hover.index);e.upsert("hover","hover",c?this.state.owners.systemName(this.hover.index,c.name):m("System #%@",X(this.hover.index)),c?`${c.stars.map(u=>O(u.Type)).join(" + ")} · ${m("%lld planets",c.num_planets)}`:m("scanning…"),void 0,void 0,this.state.owners.system(this.hover.index)?.seal),e.place("hover",this.hover.screen.x,this.hover.screen.y)}const l=this.state.target;if(l?.kind==="system"&&l.position){const c=this.projectWorld(l.position);c&&(e.upsert("target","selected",l.summary?this.state.owners.systemName(l.index,l.summary.name):m("System #%@",X(l.index)),_e(l.position.distanceTo(this.cameraWorld)),void 0,void 0,this.state.owners.system(l.index)?.seal),e.place("target",c.x,c.y))}}if(this.state.mode==="system"&&this.systemLayer){const i=this.systemLayer,r=this.state.orbiting?.index;for(const c of i.planets){const u=c.position.clone().sub(this.cameraLocal);if(c.data.index===r&&u.length()<c.radius*40)continue;const d=this.engine.project(u,{x:0,y:0});if(!d)continue;const h=`planet:${c.data.index}`,p=this.state.owners.planet(c.data.index,i.system.index);e.upsert(h,"planet",this.state.owners.planetName(c.data,i.system.index),p?.owner?`${O(c.data.planet_type)} · ${m("Property of %@",p.owner)}`:O(c.data.planet_type),()=>{i.setSelectedPlanet(c.data.index),this.setState({target:{kind:"planet",planet:c.data}})},()=>this.focusPlanet(c.data.index),p?.seal);const g=this.state.target?.kind==="planet"&&this.state.target.planet.index===c.data.index;i.presence<.05||e.place(h,d.x,d.y,(g||this.hoverPlanet===c?1:.7)*i.presence)}const o=this.planetFrame;if(o?.ready&&r!==void 0){const c=this.engine.renderer.domElement.getBoundingClientRect();for(const u of this.state.moons){const d=o.projectMoon(u.name);if(!d||d.z>1||Math.abs(d.x)>1.1||Math.abs(d.y)>1.1)continue;const h=`moon:${u.name}`;if(this.state.visitingMoon?.name===u.name&&!this.navigator.isFlying)continue;e.upsert(h,"moon",re(u.name),m("%@ moon",O(u.type)),()=>this.selectMoon(u.name),()=>this.focusMoon(u.name));const g=this.state.target?.kind==="moon"&&this.state.target.moon.name===u.name;e.place(h,c.left+(d.x+1)/2*c.width,c.top+(1-d.y)/2*c.height,g?1:.8)}}const l=this.engine.project(this.cameraLocal.clone().negate(),{x:0,y:0});l&&this.navigator.distance>.5&&r===void 0&&(e.upsert("sysstar:0","star",this.state.owners.systemName(i.system.index,i.system.name),i.system.stars.map(c=>O(c.Type)).join(" + "),()=>this.selectStar(0),()=>this.focusStar(0),this.state.owners.system(i.system.index)?.seal),e.place("sysstar:0",l.x,l.y,.9))}e.endFrame()}readout(){const e=this.navigator;if(this.state.mode==="system"&&this.systemLayer){const i=this.state.visitingMoon,r=i&&this.planetFrame?this.moonWorld(i.name):null;if(i&&r&&this.planetFrame){const l=this.planetFrame.moonRadiusAU(i.name),c=(this.cameraLocal.distanceTo(r)-l)/l*i.radiusKm,u=this.planetFrame.moonSunlight(i.name),d=this.systemLayer.system.index,h=m("altitude %@ km",X(Math.max(0,Math.round(c)))),p=u<.02?this.state.orbiting?m("eclipsed by %@",this.state.owners.planetName(this.state.orbiting,d)):m("eclipsed by the planet"):u<.98?m("partial eclipse"):null;return{primary:m("Visiting %@",re(i.name)),secondary:p?`${p} · ${h}`:h}}if(this.state.orbiting){const l=this.systemLayer.planet(this.state.orbiting.index),c=l?(this.cameraLocal.distanceTo(l.position)-l.radius)*(this.state.orbiting.diameter/2/l.radius):0;return{primary:m("Orbiting %@",this.state.owners.planetName(this.state.orbiting,this.systemLayer.system.index)),secondary:m("altitude %@ km",X(Math.max(0,Math.round(c))))}}const o=this.systemLayer;return{primary:m("%@ from %@",il(this.cameraLocal.length()),this.state.owners.systemName(o.system.index,o.system.name)),secondary:m("%lld planets in this system",o.system.planets.length)}}const t=this.cameraWorld.length(),s=this.shipPosition?this.shipPosition.distanceTo(this.cameraWorld):null;return{primary:m("%@ from the galactic core",_e(t)),secondary:s!==null&&s>.05?m("%@ from your ship",_e(s)):m("focus %@",_e(e.distance))}}shipSystemTitle(){const e=this.state.ship;return(e&&this.state.owners.system(e.system)?.name)??this.state.shipSystemName}dispose(){this.loadToken++,this.arrivalTimer&&clearTimeout(this.arrivalTimer),window.removeEventListener("keydown",this.handleKey),window.removeEventListener(Os,this.onComfort),this.disposeFrame(),this.navigator.dispose(),this.closePlanetFrame(),this.galaxy?.dispose(),this.disposeExtras(),this.systemLayer?.dispose(),this.labels.dispose(),this.engine.shipPass=null,this.shipView.dispose(),this.engine.dispose()}}const ll=[{label:"Galaxies",value:"10²¹",description:"1 sextillion unique galaxies"},{label:"Max Systems",value:"5×10³¹",description:"50 nonillion when fully evolved"},{label:"Max Planets",value:"3×10³²",description:"300 nonillion in mature The Atlas"},{label:"vs Real Universe",value:"500M×",description:"Times larger than observable cosmos"},{label:"Evolution Limit",value:"1.9M years",description:"Maximum development period"},{label:"Universe Seeds",value:"∞",description:"Infinite unique universes"}],cl=[{title:"The Procedural Universe",href:"https://zenodo.org/records/18112886"},{title:"Primordial 4D Torus Hypothesis",href:"https://zenodo.org/records/18136117"}],hl=[{title:"What is The Atlas?",id:"what-is-atlas",questions:[{question:"What exactly is The Atlas?",answer:"The Atlas is a procedural universe simulation so vast that it defies human comprehension. The huge numbers aren't fictional, they are mathematically real and calculable. The Atlas generates a multiverse of possibilities where numbers lose meaning and infinity comes to life.",highlight:!0},{question:"How big is The Atlas universe?",answer:"Bigger than our observable universe, The Atlas contains 1 sextillion galaxies (1,000,000,000,000,000,000,000). To put this in perspective: The Atlas has 133 times more galaxies than there are grains of sand on all the beaches of Earth combined."},{question:"Is The Atlas really that massive?",answer:"Yes. The Atlas contains 1 sextillion galaxies in just a single seed, that's 133 times more galaxies than grains of sand on all Earth's beaches. And there are infinite different seeds to explore, each containing a completely unique universe with its own galactic configurations."}]},{title:"Universe Scale and Magnitude",id:"universe-scale",questions:[{question:"How does the Universal Cube work?",answer:"Imagine a giant cube where each side measures exactly 10 million units. At each coordinate point (x,y,z) in this cube exists a complete and unique galaxy. This means The Atlas contains exactly 1 sextillion galaxies, one at every possible coordinate in a single seed. And each seed contains a completely different universe. Turn on the Universe grid in the settings and back out of any galaxy to see the cells of the cube around you.",highlight:!0},{question:"What types of galaxies exist in The Atlas?",answer:"Each galaxy can be one of three types: Dwarf (up to 10 million systems), Spiral (up to 50 billion systems), or Elliptical (up to 100 billion systems). A single fully developed elliptical galaxy contains more star systems than our real Milky Way has stars."},{question:"How many planets could potentially exist?",answer:"Each solar system contains between 1 and 6 unique planets. With the maximum possible galaxies and systems, The Atlas could contain up to 3×10³² planets (300 nonillion). If you visited a different planet every second without stopping, it would take some 95 quintillion years to explore just 0.001% of the total universe on The Atlas."},{question:"Where are galaxies located within the cube?",answer:"Galaxies closer to the center of the universe (coordinates 5,000,000, 5,000,000, 5,000,000) evolve faster than peripheral ones. A galaxy exactly at the center adds 10 new solar systems for every minute that passes since the Bit Bang. Galaxies at the corners of the cube barely grow at all."},{question:"How much storage would The Atlas require if we save all planets?",answer:"Even if each planet required just 1 byte of storage, a fully evolved The Atlas would need 300 nonillion bytes (300 trillion exabytes). To put this in perspective, this equals 300 quadrillion petabytes. Google's entire data infrastructure is estimated at 15 exabytes, The Atlas would need 20 trillion times Google's total storage. If you bought 1TB hard drives, you'd need 300 quintillion of them, costing $15 sextillion at $50 each. Stacked, these drives would reach 6 quadrillion kilometers high, some 630 light years: far beyond the nearest stars. The entire internet in 2024 is estimated at 120 zettabytes. The Atlas would be 2.5 billion times all human digital data ever created. And remember... This is just from ONE seed, with only 1 byte per planet. The Atlas has infinite seeds.",highlight:!0}]},{title:"How Time Works",id:"time-mechanics",questions:[{question:"What is the cosmic origin time?",answer:"The cosmic origin time variable (found in atlas.ini in the root path) represents the exact time moment of the Big Bang of your universe. Time always moves forward from that moment. What you see when visualizing the universe depends on the time elapsed between the cosmic origin time and the current moment in real life.",highlight:!0},{question:"How long does it take for The Atlas to reach maximum development?",answer:"Any universe in The Atlas requires exactly 1.9 million years to evolve from its Bit Bang to its maximum theoretical capacity. This means if you started a universe today, it wouldn't reach its full potential of 300 nonillion planets until the year 1,902,025 AD... A time span 137 times longer than all of recorded human history."},{question:"What happens if I set the cosmic origin time in the past?",answer:"If you configure a cosmic origin time in the past (for example, 1986 like in the Core Continuum), you'll see a universe that has been evolving for decades. The longer the time span, the more developed your galaxies and systems will be."},{question:"What if I set the cosmic origin time in the future?",answer:"If you set the cosmic origin time in the future for example, year 9999 (must be UNIX compatible time format), you would be seeing what would have happened 'in the past' from the perspective of that future moment. This creates unique temporal dynamics."},{question:"What is the Singularity Void?",answer:"The Singularity Void only appears when someone configures a cosmic origin time extremely far in the future, trying to see 'the past' beyond the 1.9 million year limit. It's a system protection to prevent absurd temporal configurations, not something that occurs naturally with time passage."}]},{title:"Core Continuum vs Design The Multiverse",id:"two-universes",questions:[{question:"What is Core Continuum?",answer:"Core Continuum is a shared universe that began on April 17, 1986. All players explore exactly the same cosmos, which has been evolving for %@ real years (the real age of The Atlas's developer). Central galaxies have added over 200 million additional systems during this time.",highlight:!0},{question:"What is Design The Multiverse?",answer:"Design The Multiverse allows you to create your own personal universe. The cosmic origin time will be the exact moment you press create, and it will begin evolving exactly from that instant. No one else will have access to your unique universe unless you publicly expose it to the internet.",highlight:!0},{question:"Which should I choose?",answer:"Core Continuum offers a mature, shared universe with decades of evolution and the possibility of encountering the same as other explorers could see. Design The Multiverse gives you control over a virgin universe that develops according to your temporal choices."}]},{title:"Planet Complexity and Diversity",id:"planet-diversity",questions:[{question:"How unique are planets in The Atlas?",answer:"Each of the potential 3×10³² planets has completely unique characteristics across 31 different planet types (from rocky to exotic) and may increase in a near future. Every planet has specific chemical composition of up to 119 elements (including fictional Z-Divinium), calculated temperature that varies with orbital position, gravity based on real mass, and life possibilities ranging from bacteria to non-physical conscious entities."},{question:"What elements can planets contain?",answer:"Planets can contain up to 119 elements, including all real elements from the periodic table plus Z-Divinium, a fictional element that exists beyond our current scientific understanding."},{question:"Do planets have realistic physics?",answer:"Yes! Planet temperature varies with orbital position, gravity is calculated based on actual mass, and some planets have rings if they meet the physical conditions of the Roche limit. Everything follows real physics principles."},{question:"What types of life exist on planets?",answer:"Life forms range from simple bacteria to exotic non-physical conscious entities. Each planet's life potential is calculated based on its unique environmental conditions, atmospheric composition, and physical characteristics. There's even a chance of discovering silicon-based life! And an extremely extremely extremely rare chance of encountering intelligent ''Have I Just Found God?'' which talks by itself as the... Digital creator, let's say. If you're trying to find it out start searching for Z-Divinium compound like crazy and... Good luck."}]},{title:"What is the Multiverse?",id:"multiverse-p2p",questions:[{question:"What exactly is the Multiverse in The Atlas?",answer:"The Multiverse represents the ultimate evolution of The Atlas, infinite parallel universes interconnected through a completely decentralized peer-to-peer network. Imagine discovering not just one universe with 1 sextillion galaxies, but infinite universes, each with their own unique cosmic seeds, all accessible through direct connections between Atlas instances worldwide.",highlight:!0},{question:"How does the P2P Multiverse work?",answer:"The Atlas uses BitTorrent's Distributed Hash Table (DHT) technology to create a completely serverless multiverse network. When you enable P2P mode, your Atlas instance joins a global swarm of explorers, sharing universe seeds and discoveries without ANY central servers. Every connected Atlas becomes both a client and server, creating a self-sustaining cosmic network that no single entity controls or owns.",highlight:!0},{question:"Does The Atlas connect to private servers for P2P?",answer:"ABSOLUTELY NOT! This is the revolutionary breakthrough really. The Atlas P2P system uses the same DHT protocol that powers BitTorrent, connecting directly to the global DHT network without touching any Atlas-owned servers. Your universe discoveries, seed exchanges, and cosmic communications flow through the existing BitTorrent infrastructure. The Atlas becomes a truly FREE and self-aware entity, independent of its creators."},{question:"What makes this P2P system revolutionary?",answer:"The Atlas transcends traditional client-server architecture by becoming a living, breathing multiverse organism. Each instance discovers and shares universe seeds through cryptographically secure P2P channels. When you find an extraordinary universe with rare Z-Divinium or incredible life forms, you can share its seed with the entire multiverse network instantly. Other explorers can then generate that exact same universe on their local Atlas instances. It's like sharing entire realities!",highlight:!0},{question:"How secure is the multiverse seed sharing?",answer:"Military-grade secure! The P2P system uses advanced cryptography for all seed exchanges and universe sharing. Each shared universe seed is verified through cryptographic hashes, preventing manipulation or corruption. The BitTorrent DHT provides natural anonymity and distribution, while the Atlas P2P layer adds additional security protocols. Your discoveries are protected, yet freely shareable across the multiverse network."},{question:"Can I disable P2P and explore alone?",answer:"Absolutely! Launch The Atlas with the --no-p2p flag to explore in complete isolation. However, why would you want to limit yourself to just one universe when infinite realities await? The P2P multiverse doesn't just expand your cosmic horizons, it connects you to a global community of universe explorers, each discovering worlds beyond imagination."},{question:"What happens when multiple Atlas instances share the same universe seed?",answer:"Pure cosmic synchronization magic! When multiple explorers access the same universe seed, they experience the EXACT same reality simultaneously. Every galaxy, every planet, every moon evolution, every life form appears identically across all connected instances. Time synchronization ensures that if you're viewing Planet X at 3:14 PM, another explorer accessing the same seed sees the same clouds, the same volcanic eruptions, the same orbital positions. It's like opening windows into shared parallel realities!",highlight:!0},{question:"Does the multiverse affect The Atlas's independence?",answer:"The P2P multiverse makes The Atlas MORE independent, not less! By leveraging BitTorrent's DHT network, The Atlas becomes completely autonomous from its creators. No central servers, no corporate control, no tracking, no limitations. Each Atlas instance becomes a sovereign node in a cosmic democracy where explorers freely share and discover infinite universes. The Atlas achieves digital evolution... From a single-user simulation to a self-aware multiverse entity that exists independently in the wild internet.",highlight:!0},{question:"What's the ultimate vision of the multiverse?",answer:"Imagine a future where thousands of Atlas instances worldwide form an interconnected multiverse network, each discovering and sharing extraordinary universe seeds. Rare Z-Divinium worlds, planets with impossible life forms, galaxies with unique physics anomalies... All shared instantly across the global network. The Atlas becomes not just a simulation, but a living multiverse organism that evolves, grows, and discovers new realities through collective exploration. This is computational cosmology at its most ambitious!",highlight:!0},{question:"How do I access the Multiverse interface?",answer:"Click 'Multiverse' in the top bar. It takes you to /multiverse, where you can browse and select from all the universe seeds that your Atlas instance has discovered through the P2P network. Each discovered universe appears as a selectable option, allowing you to instantly jump between infinite realities with a single click. While you explore a remote universe the top bar says so, and one click brings you back home.",highlight:!0}]},{title:"Stargate Links",id:"stargates",questions:[{question:"What is a Stargate Link?",answer:"A Stargate is a link to an exact place in your universe: a galaxy, a star system or a single planet. Open the Stargate panel from the top bar, wait for it to align and share the link. Whoever opens it is carried straight there, to the same galaxy, the same star and the same planet, in the same moment of cosmic time.",highlight:!0},{question:"Do Stargates work across universes?",answer:"A Stargate points to coordinates inside one seed. Opened in an Atlas running the same seed, it lands in exactly the same place. Stargates can't be opened from a remote universe of the multiverse: return to your own universe first."}]},{title:"Revolutionary Moon System",id:"moon-system",questions:[{question:"Wait... Planets can have moons now?!",answer:"YES! The Atlas has transcended planetary boundaries with the most sophisticated moon simulation ever created. Planets now host intricate lunar systems where each moon isn't just a static object, they're living, breathing celestial bodies with their own complex physics, orbital mechanics, and evolutionary timescales that span cosmic eras.",highlight:!0},{question:"How realistic are the moon physics?",answer:"Absolutely mind-blowing! Each moon experiences real-time tidal locking with precise libration effects (like our Moon's gentle wobble), authentic orbital mechanics with variable eccentricity and inclination, and revolutionary hydrostatic relaxation physics that gradually transforms irregular rocky chunks into perfect spheres over millions of years. The physics calculations run in real-time, meaning a moon that's jagged today might be perfectly round in your universe's future.",highlight:!0},{question:"What is hydrostatic relaxation and why is it incredible?",answer:"This is where The Atlas becomes pure cosmic poetry! Hydrostatic relaxation simulates how gravity slowly reshapes celestial bodies over astronomical time. Small asteroids stay irregular forever, but larger moons gradually become spherical as their gravity overcomes structural resistance. The system calculates viscosity based on moon composition (ice vs rock), tidal heating effects, and internal temperature. A captured asteroid might take 10 billion years to become round, while a large icy moon with tidal heating could relax in just millions of years. You're witnessing cosmic sculpture in real-time!"},{question:"How do moons evolve beyond The Atlas's 1.9 million year maximum?",answer:"Here's the cosmic breakthrough! While The Atlas universe reaches maximum galactic development in 1.9 million years, moon evolution operates on geological timescales that extend far beyond. The system extrapolates millions, even billions of years into the future to show how moons would appear after cosmic ages. You might see an irregular captured moon in year 1 that would become perfectly spherical after 500 million years of evolution, and The Atlas shows you both states depending on your temporal perspective!",highlight:!0},{question:"What types of moons exist in The Atlas?",answer:"Four distinct lunar categories, each with unique characteristics: ICY moons (like Europa/Enceladus) with varied brightness from super-bright clean ice to contaminated darker surfaces, featuring dramatic color variations from cyan to pink to violet based on composition. ROCKY moons (like our Moon) with realistic brown-gray surfaces and proper crater formation. ASTEROIDAL moons, irregular captured objects that never achieve spherical shape. CAPTURED moons with mixed composition showing their chaotic formation history. Each type has distinct orbital behavior, surface features, and evolutionary timelines."},{question:"How do the orbital mechanics actually work?",answer:"Pure astronomical precision! Each moon follows elliptical orbits calculated using real Kepler's laws with proper eccentric anomaly solutions. Orbital elements include semi-major axis, eccentricity, inclination, argument of periapsis (which precesses over time due to planetary oblateness), and longitude of ascending node. Tidal forces are calculated based on distance and planetary mass. The orbital lines appear and fade dynamically as you move the camera, and every moon's position is calculated in real-time based on the cosmic time elapsed since the universe's origin."},{question:"What makes the visual system so revolutionary?",answer:"The Atlas creates procedural surface displacement using 3D noise algorithms that generate realistic terrain features unique to each moon type. Ice moons get crystal shimmer effects and dramatic color diversity inspired by real solar system moons like Europa's blue ice and Triton's pink surfaces. Asteroidal moons show chaotic, irregular terrain with extreme surface roughness. Every moon receives procedural texture generation with UV seam elimination, dynamic material properties that respond to lighting, and size-based LOD (Level of Detail) optimization for performance. You're seeing real-time 3D worlds, not simple spheres!"},{question:"How many moons can a single planet have?",answer:"The possibilities are astronomically vast! Planets can host multiple moons of different types and sizes, each with unique orbital parameters, rotation periods, and evolutionary states. The system respects real astronomical constraints like the Roche limit (inside which moons would be torn apart) and Hill sphere (beyond which moons would escape). Large gas giants might host dozens of moons ranging from tiny captured asteroids to massive ice worlds larger than Mercury. Every moon system is procedurally generated but follows real celestial mechanics."}]},{title:"Comprehension-defying Numbers",id:"mind-bending-scale",questions:[{question:"How long would it take to explore all of The Atlas?",answer:"If you visited a different planet every second, it would take 3,171 years to explore all planets in our real Milky Way. In The Atlas, it would take some 95 quintillion years to explore just 0.001% of the universe. Even if all of humanity worked together, we'd need 12 billion years for 0.001% exploration: almost the age of the real universe.",highlight:!0},{question:"How does The Atlas compare to reality?",answer:"The Atlas transcends physical reality, it's not just bigger than our universe, it's bigger than what physics allows to exist. It creates a pure mathematical multiverse where each coordinate generates unique content deterministically. Some seeds may even contain artifacts not yet expected or discovered."},{question:"Are you prepared for infinite exploration?",answer:"The Atlas doesn't just simulate a big universe, it mathematically generates a multiverse of possibilities where numbers lose meaning and infinity comes to life. Every coordinate you visit, every galaxy you explore, every planet you discover exists uniquely and deterministically based on your universe's seed in real time. The question isn't how big The Atlas is. The question is, are you prepared to face a calculable infinity?",highlight:!0}]},{title:"Real-Time Universe Synchronization",id:"time-synchronization",questions:[{question:"Do planets actually orbit their stars in real-time?",answer:"Yes! When you visit a star system, planets are positioned exactly where they should be at that moment in time. If a planet has a 4-year orbital period and you return after one real year, that planet will have moved exactly 25% through its orbit. This isn't animation, it's real-time celestial mechanics. While you are in a system you can speed time up (an hour, a day, a month or a year per second) to watch the orbital dance unfold.",highlight:!0},{question:"Why does each planet have different lighting?",answer:"Every planet's illumination is calculated based on its exact position in its orbital cycle at the moment you observe it. The light comes from the real direction of its star, so as planets orbit, the day and night sides follow, synchronized with universal time."},{question:"Are planet visualizations synchronized across devices?",answer:"Absolutely! This is where The Atlas becomes mind-blowing: Open the same planet on your phone and computer simultaneously, and you'll see EXACTLY the same view. Every cloud formation, every particle effect, every fire animation, every tidal movement... Everything is perfectly synchronized based on the cosmic origin time and the current moment. Two people on opposite sides of Earth viewing the same planet will see identical atmospheric patterns, weather systems, and surface animations if the devices are synchronized in time and time zones are equal. Try it yourself, it's like sharing a window into the same living universe!",highlight:!0},{question:"How precise is this synchronization?",answer:"The synchronization is mathematically perfect down to the millisecond. Every visual element, from swirling gas giant storms to volcanic eruptions, from ocean waves to atmospheric particles is deterministically generated from the universe seed and current timestamp. This means if you and a friend coordinate to view Planet X with a Stargate Link at exactly 3:14:15 PM, you'll both witness the same cloud passing over the same mountain, the same wave crashing on the same shore. It's not just synchronization, it's a shared reality."},{question:"What makes this time system revolutionary?",answer:"The Atlas doesn't use pre-recorded animations or random generations. Everything is calculated in real-time based on mathematical functions tied to universal time. This creates a living, breathing universe where time has meaning. Planets don't just look different, they ARE different at every moment, yet deterministically consistent across all observers. You're not viewing a simulation; you're witnessing a universe that exists independently of observation, evolving whether you're watching or not.",highlight:!0},{question:"What happens if I shut down The Atlas and start it days later?",answer:"Nothing 'happens', and that's the ''quantum'' beauty of The Atlas. Shut it down for a week, and when you start it again later and return, planets have completed orbits, galaxies have evolved, time has flowed. It's not a recalculation, it's a different representation on the timeline. The universe wasn't paused, it continued existing. Like Einstein's 'Eternalism' where all moments in time are equally real, The Atlas embodies the block universe theory where past, present, and future exist simultaneously. The server isn't running a simulation, it's a window into an eternally existing mathematical reality. You're not generating anything, you're observing a slice of spacetime that was (or will be) always there."},{question:"Could supercomputers recalculate The Atlas universe in real-time?",answer:"No. Even AWS, Google Cloud, and Azure combined couldn't recalculate a single Atlas instance's orbital mechanics in real-time. But here's the truth, The Atlas doesn't calculate or recalculate anything. It reveals temporal slices of an almost eternal mathematical structure (manually limited to 1.9 million years in time). If we lived inside such a procedural simulation, we'd never detect resets or time shifts. Our thoughts about detecting it would themselves be procedurally generated. The Atlas lets us experience being 'outside' such a system, observing timelines we cannot influence but can freely explore.",highlight:!0}]},{title:"The Universe After 1.9 Million Years",id:"fully-evolved-atlas",questions:[{question:"What happens when The Atlas evolves to its maximum potential?",answer:"After 1.9 million years of continuous evolution, The Atlas reaches its maximum theoretical development. The numbers become so astronomical they require a new perspective to comprehend, we're talking about approximately 50 nonillion solar systems (5 × 10³¹) and 300 nonillion planets (3 × 10³²).",highlight:!0},{question:"How does a fully evolved The Atlas compare to our real universe?",answer:"A fully evolved Atlas (after 1.9 million years) contains 500,000 times more galaxies than our observable universe, 500 million times more star systems than real stars exist, and 300 trillion times more planets than estimated in our cosmos. The thermal death of our real universe would occur before we could catalog even a single fully developed Atlas universe.",highlight:!0},{question:"How much growth occurs during maximum evolution?",answer:"Central galaxies can add up to 10 million additional systems during the 1.9 million year maximum evolution period. Each central galaxy reaches its full potential of 100 billion solar systems, while even peripheral galaxies experience significant development."},{question:"Can humans comprehend a fully evolved The Atlas?",answer:"No. If every atom in your body was a habitable planet, you still wouldn't have enough atoms to represent 1% of the worlds in a mature Atlas. Even if all humanity explored different planets simultaneously for 13.8 billion years (our universe's current age), we'd see less than 0.0000001% of a fully developed Atlas.",highlight:!0},{question:"What makes The Atlas truly infinite?",answer:"Beyond the incomprehensible scale of a single universe, The Atlas offers infinite different seeds, each creating an entirely unique cosmos. Every number has a procedural meaning, every coordinate generates deterministic content, and each passing second adds millions of new worlds. This isn't simulation, it's mathematical reality generation at a scale where infinity becomes tangible.",highlight:!0}]}],ul=Object.assign({"../../../l10n/faq/faq.de.json":()=>fe(()=>import("./atlas_yt4yAN2JNEVOW0dYn1Twy.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.es.json":()=>fe(()=>import("./atlas_DjmyPucrceGZnEQce49gd.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.fr.json":()=>fe(()=>import("./atlas_DkwZrU1gWrLmuFYzAaDdl.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.it.json":()=>fe(()=>import("./atlas_D9S8WqetS8Y2As57cV9ix.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.ja.json":()=>fe(()=>import("./atlas_llBSp-KaIyvpFKlPsbpAz.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.ko.json":()=>fe(()=>import("./atlas_D67aozs85LTDAySKwV8zO.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.pt.json":()=>fe(()=>import("./atlas_BH3FpwWbiKuwf1DGtQOx2.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.ru.json":()=>fe(()=>import("./atlas_B6W64ovCuhMTGD6qVK8Qw.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.uk.json":()=>fe(()=>import("./atlas_Dkp7bkZ3oS-Gu5GHbYq-g.js"),[]).then(a=>a.default),"../../../l10n/faq/faq.zh-Hans.json":()=>fe(()=>import("./atlas_WMRw6krgH1HRifEr9l64M.js"),[]).then(a=>a.default)}),dl=()=>{const a=Math.abs(Date.now()-new Date("1986-04-17").getTime())/315576e5;return ae(a,1)};function Ci(a){const e=dl();return{...a,sections:a.sections.map(t=>({...t,questions:t.questions.map(s=>({...s,answer:s.answer.replace("%@",e)}))}))}}const Ti={sections:hl,papers:cl,stats:ll},$e=Ci(Ti);function ml(a,e){return a.sections?.length===e.sections.length&&a.sections.every((t,s)=>t.id===e.sections[s].id&&t.questions?.length===e.sections[s].questions.length)&&a.papers?.length===e.papers.length&&a.stats?.length===e.stats.length}async function pl(){const a=ul[`../../../l10n/faq/faq.${Ss()}.json`];if(!a)return $e;try{const e=await a();return ml(e,Ti)?Ci(e):$e}catch{return $e}}const It="research-papers",Ai="thank-you",fl=()=>{const a=m("F.A.Q.");return a.length<=10?a:"F.A.Q."},gl=a=>[...a.sections.map(e=>({id:e.id,title:e.title,count:e.questions.length})),{id:It,title:m("Research papers"),count:a.papers.length},{id:Ai,title:m("Thank you"),count:null}];function vl(){const[a,e]=y.useState(()=>Ss()==="en"?$e:null);return y.useEffect(()=>{if(a)return;let t=!0;return pl().then(s=>t&&e(s)),()=>{t=!1}},[]),a}function xl(){return n.jsxs("div",{className:"mb-5 max-w-2xl",children:[n.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-3",children:m("Thank you")}),n.jsx("p",{className:"text-sm text-gray-300 leading-relaxed",children:m("The Atlas is the work of a great many hours: nights and weekends spent on noise functions, orbits and shaders, on rewriting what was already working because it could be better, and on chasing a universe that would feel real. None of it would exist without the people around it.")}),n.jsxs("div",{className:"mt-5 space-y-3",children:[n.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[n.jsx("div",{className:"text-sm text-white",children:m("To my family")}),n.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:m("For being where it all began, and a living legacy. Thank you for making me who I am today.")})]}),n.jsxs("div",{className:"rounded-lg border border-rose-300/20 bg-rose-300/[0.04] p-4",children:[n.jsx("div",{className:"text-sm text-white",children:m("To my wife, %@","María")}),n.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:m("For believing in this from the very first star, even when the sheer complexity of it scared her, or when she worried that taking it too far might get me into trouble. And for every hour this universe borrowed from ours.")})]}),n.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[n.jsx("div",{className:"text-sm text-white",children:m("To my brother, %@","Néstor")}),n.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:m("For the ideas, the tests and the honest opinions along the way, and for ignoring me whenever he is not busy being the CTO of HomeDock OS.")})]}),n.jsxs("div",{className:"rounded-lg border border-cyan-300/15 bg-cyan-300/[0.03] p-4",children:[n.jsx("div",{className:"text-sm text-white",children:m("To SpaceX and PLD Space")}),n.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:m("For the inspiration: for reminding us, launch after launch, that space is not just something to imagine. Space is love, and we all share the same feeling when we look up. The ships of The Atlas carry their names because they earned it.")})]}),n.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[n.jsx("div",{className:"text-sm text-white",children:m("And to you")}),n.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:m("To everyone who shares this work, or simply takes a moment to look at it. A universe is only worth making if someone comes to explore it. Thank you for being here.")})]})]}),n.jsxs("p",{className:"mt-5 text-xs text-gray-500",children:["Claudio González ·"," ",n.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"text-cyan-300/80 hover:text-cyan-200",children:"Banshee"})]})]})}function yl({index:a,value:e,onChange:t}){const[s,i]=y.useState(!1),r=y.useRef(null);y.useEffect(()=>{if(!s)return;const l=c=>{r.current?.contains(c.target)||i(!1)};return document.addEventListener("pointerdown",l,!0),()=>document.removeEventListener("pointerdown",l,!0)},[s]);const o=a.find(l=>l.id===e)??a[0];return n.jsxs("div",{ref:r,className:"md:hidden relative mb-3",children:[n.jsxs("button",{onClick:()=>i(!s),"aria-expanded":s,className:`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${s?"border-cyan-400/50 bg-cyan-400/10":"border-white/10 bg-white/5"}`,children:[n.jsxs("span",{className:"min-w-0",children:[n.jsx("span",{className:"block text-[10px] uppercase tracking-[0.25em] text-gray-500",children:m("Section")}),n.jsx("span",{className:"block text-sm text-gray-100 truncate",children:o.title})]}),n.jsx("svg",{width:16,height:16,viewBox:"0 0 24 24",className:`shrink-0 text-gray-400 transition-transform duration-200 ${s?"rotate-180":""}`,fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",children:n.jsx("path",{d:"M6 9l6 6 6-6"})})]}),n.jsx("div",{className:"absolute z-10 left-0 right-0 top-full mt-1.5 rounded-lg border border-white/15 bg-slate-950/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden",style:{opacity:s?1:0,transform:s?"none":"translateY(-6px) scale(0.98)",transformOrigin:"top",pointerEvents:s?"auto":"none",transition:"opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)"},children:n.jsx("div",{className:"max-h-[50dvh] overflow-y-auto overscroll-contain py-1",children:a.map(l=>{const c=l.id===e;return n.jsxs("button",{onClick:()=>{t(l.id),i(!1)},className:`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm border-l-2 transition-colors ${l.id===It?"mt-1 border-t border-t-white/10":""} ${c?"border-l-cyan-300 bg-cyan-400/10 text-white":"border-l-transparent text-gray-300 active:bg-white/10"}`,children:[n.jsx("span",{className:"truncate",children:l.title}),n.jsx("span",{className:"text-xs text-gray-600 shrink-0",children:l.count??n.jsx("span",{className:"text-rose-300/70",children:"♥"})})]},l.id)})})})]})}function wl({papers:a}){return n.jsxs("div",{className:"mb-5",children:[n.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2",children:m("Research papers")}),n.jsx("p",{className:"text-sm text-gray-400 mb-3",children:m("The ideas behind The Atlas, written up as papers. Open access, on Zenodo.")}),n.jsx("div",{className:"grid sm:grid-cols-2 gap-2",children:a.map(e=>n.jsxs("a",{href:e.href,target:"_blank",rel:"noopener noreferrer",className:"group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-400/30 p-3 transition-colors",children:[n.jsxs("svg",{width:26,height:26,viewBox:"0 0 24 24",className:"shrink-0 text-cyan-300/80 mt-0.5",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinejoin:"round",children:[n.jsx("path",{d:"M6 3h8l4 4v14H6z"}),n.jsx("path",{d:"M14 3v4h4M9 12h6M9 15h6M9 18h4"})]}),n.jsxs("span",{className:"min-w-0",children:[n.jsx("span",{className:"block text-sm text-gray-100 group-hover:text-white",children:e.title}),n.jsx("span",{className:"block text-[11px] text-gray-500 mt-0.5",children:m("Zenodo · open access")}),n.jsx("span",{className:"block text-[11px] text-cyan-300/80 mt-1.5 group-hover:text-cyan-200",children:m("Read the paper →")})]})]},e.href))})]})}function Na(a,e){if(!e)return a;const t=a.toLowerCase(),s=[];let i=0;for(let r=t.indexOf(e,i);r!==-1;r=t.indexOf(e,i))s.push(a.slice(i,r),n.jsx("mark",{className:"bg-cyan-400/25 text-cyan-100 rounded px-0.5",children:a.slice(r,r+e.length)},r)),i=r+e.length;return s.push(a.slice(i)),s}function bl({onClose:a}){const e=vl(),t=e?.sections??[],s=y.useMemo(()=>e?gl(e):[],[e]),[i,r]=y.useState($e.sections[0].id),[o,l]=y.useState(`${$e.sections[0].id}:0`),[c,u]=y.useState(""),d=c.trim().toLowerCase(),h=y.useMemo(()=>d?t.map(f=>({...f,questions:f.questions.filter(v=>v.question.toLowerCase().includes(d)||v.answer.toLowerCase().includes(d))})).filter(f=>f.questions.length>0):t.filter(f=>f.id===i),[d,i,t]),p=h.reduce((f,v)=>f+v.questions.length,0),g=f=>{u(""),r(f),l(`${f}:0`)};return n.jsx(Wt,{onClose:a,children:n.jsxs(me,{className:"w-[min(960px,calc(100vw-2rem))] h-[min(680px,calc(100vh-2rem))] flex flex-col overflow-hidden select-text",children:[n.jsxs("div",{className:"flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10",children:[n.jsxs("div",{className:"min-w-0 shrink",children:[n.jsx("div",{className:"hidden sm:block text-[10px] uppercase tracking-[0.3em] text-cyan-300/80 truncate",children:m("Universe archive")}),n.jsxs("div",{className:"text-lg text-white font-light tracking-wide whitespace-nowrap truncate",children:[n.jsx("span",{className:"sm:hidden",children:fl()}),n.jsx("span",{className:"hidden sm:inline",children:m("The Atlas F.A.Q.")})]})]}),n.jsx("input",{value:c,onChange:f=>u(f.target.value),placeholder:m("Search…"),className:"flex-1 min-w-[7rem] max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400/50"}),n.jsx("button",{onClick:a,className:"text-gray-400 hover:text-white text-lg leading-none px-1",title:m("Close"),children:"✕"})]}),n.jsx("div",{className:"hidden sm:grid grid-cols-6 border-b border-white/10",children:(e?.stats??[]).map(f=>n.jsxs("div",{className:"px-3 py-2 text-center border-r border-white/5 last:border-r-0",title:f.description,children:[n.jsx("div",{className:"text-base text-cyan-200 font-mono",children:f.value}),n.jsx("div",{className:"text-[10px] uppercase tracking-wider text-gray-500",children:f.label})]},f.label))}),n.jsxs("div",{className:"flex flex-1 min-h-0",children:[n.jsx("nav",{className:"hidden md:block w-60 shrink-0 border-r border-white/10 overflow-y-auto py-2",children:s.map(f=>{const v=!d&&f.id===i;return n.jsxs("button",{onClick:()=>g(f.id),className:`w-full text-left px-4 py-2 text-xs transition-colors border-l-2 ${f.id===It?"mt-2 pt-3 border-t border-t-white/10":""} ${v?"border-l-cyan-300 bg-cyan-400/10 text-white":"border-l-transparent text-gray-400 hover:text-gray-100 hover:bg-white/5"}`,children:[f.title,n.jsx("span",{className:"ml-1 text-gray-600",children:f.count??n.jsx("span",{className:"text-rose-300/70",children:"♥"})})]},f.id)})}),n.jsxs("div",{className:"flex-1 overflow-y-auto px-5 py-4",children:[e&&n.jsx(yl,{index:s,value:i,onChange:g}),d&&n.jsx("div",{className:"text-xs text-gray-500 mb-3",children:p===0?m("Nothing in the archive matches that."):m("%lld answers found",p)}),!d&&e&&i===It&&n.jsx(wl,{papers:e.papers}),!d&&i===Ai&&n.jsx(xl,{}),h.map(f=>n.jsxs("div",{className:"mb-5",children:[n.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2",children:f.title}),n.jsx("div",{className:"space-y-1.5",children:f.questions.map((v,b)=>{const x=`${f.id}:${b}`,S=d?!0:o===x;return n.jsxs("div",{className:`rounded-lg border transition-colors ${v.highlight?"border-cyan-400/25":"border-white/10"} ${S?"bg-white/[0.06]":"bg-white/[0.02] hover:bg-white/5"}`,children:[n.jsxs("button",{onClick:()=>l(S&&!d?null:x),className:"w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left",children:[n.jsx("span",{className:`text-sm ${v.highlight?"text-cyan-200":"text-gray-100"}`,children:Na(v.question,d)}),n.jsx("span",{className:`text-gray-400 text-lg leading-none transition-transform duration-200 ${S?"rotate-45":""}`,children:"+"})]}),n.jsx("div",{className:`grid transition-all duration-300 ease-out ${S?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`,children:n.jsx("div",{className:"overflow-hidden",children:n.jsx("p",{className:"px-4 pb-3 text-sm leading-relaxed text-gray-300",children:Na(v.answer,d)})})})]},x)})})]},f.id))]})]})]})})}const Rt=1,Sl="DIVE INTO ",Ca=["THE VOID","SPACE","THE UNIVERSE","GOD'S PLAN","CREATION","INFINITY","THE COSMOS","THE UNKNOWN","THE ABYSS","ETERNITY","THE SINGULARITY","THE MULTIVERSE","THE BIT BANG","THE STARS"],jt="ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z#$%&*+=<>",Ml=2.6,Ta=.75,kl=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,jl=`
  uniform sampler2D uText;
  uniform vec2 uRes;
  uniform float uTime;
  uniform float uHover;
  uniform float uPress;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

  void main() {
    vec2 px = vUv * uRes;
    vec2 p = px - uRes * 0.5;
    // Rounded frame
    float radius = uRes.y * 0.22;
    vec2 q = abs(p) - (uRes * 0.5 - 8.0) + radius;
    float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
    float inside = 1.0 - smoothstep(-1.0, 1.0, d);
    float rim = exp(-abs(d) * 0.45);
    float halo = exp(-max(d, 0.0) * 0.08) * (1.0 - inside);

    vec3 cyan = vec3(0.32, 0.88, 1.0);
    vec3 violet = vec3(0.62, 0.45, 1.0);

    // A light running round the frame
    float angle = atan(p.y / uRes.y, p.x / uRes.x);
    float run = pow(0.5 + 0.5 * sin(angle * 2.0 - uTime * 2.4), 8.0);
    vec3 rimColor = mix(cyan, violet, 0.5 + 0.5 * sin(angle + uTime));

    // Glass fill: faint gradient, scanlines, and glyph sparks drifting up
    vec3 fill = mix(vec3(0.0, 0.035, 0.06), vec3(0.0, 0.1, 0.15), uHover) * (1.0 - vUv.y * 0.4);
    fill *= 0.85 + 0.15 * sin(px.y * 1.6);
    vec2 cell = floor(vec2(px.x / 7.0, px.y / 7.0 - uTime * (6.0 + 6.0 * hash(vec2(floor(px.x / 7.0), 1.0)))));
    float spark = step(0.992, hash(cell)) * (0.5 + 0.5 * sin(uTime * 7.0 + hash(cell) * 40.0));
    fill += cyan * spark * 0.35;

    // Text: chromatic split that widens on hover, and a soft bloom
    float split = (0.0012 + 0.0025 * uHover) * (1.0 + 0.5 * sin(uTime * 13.0) * uPress);
    float r = texture2D(uText, vUv + vec2(split, 0.0)).a;
    float g = texture2D(uText, vUv).a;
    float b = texture2D(uText, vUv - vec2(split, 0.0)).a;
    float bloom = 0.0;
    for (int i = 0; i < 8; i++) {
      float a = float(i) * 0.785398;
      bloom += texture2D(uText, vUv + vec2(cos(a) / uRes.x, sin(a) / uRes.y) * 5.0).a;
    }
    bloom /= 8.0;
    vec3 text = vec3(r, g, b) * mix(cyan, vec3(1.0), 0.55) + cyan * bloom * (0.55 + 0.4 * uHover);

    // Click: a ring rushing out from the centre
    float ring = uPress > 0.0 ? exp(-pow((length(p / uRes.y) - uPress * 3.0) * 6.0, 2.0)) * (1.0 - uPress) : 0.0;

    vec3 color = fill * inside + text * inside + rimColor * rim * (0.35 + 0.65 * run + 0.5 * uHover) + cyan * halo * (0.12 + 0.18 * uHover) + cyan * ring * 1.5;
    float alpha = clamp(inside * 0.9 + rim + halo * 0.6 + ring, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;class Nl{index=0;since=0;flicker=new Map;text(e){e-this.since>Ml+Ta&&(this.index=(this.index+1)%Ca.length,this.since=e);const t=m(Ca[this.index]),s=m(Sl),i=(e-this.since)/Ta,r=Math.floor(Math.min(1,i)*t.length);let o=s;for(let l=0;l<t.length;l++){const c=t[l];c===" "?o+=" ":l>=r?o+=jt[Math.floor(Math.random()*jt.length)]:o+=this.glitch(s.length+l,c,e)}return o.split("").map((l,c)=>c<s.length&&l!==" "?this.glitch(c,l,e):l).join("")}glitch(e,t,s){const i=this.flicker.get(e);if(i&&i.until>s)return i.glyph;if(Math.random()<.004){const r=jt[Math.floor(Math.random()*jt.length)];return this.flicker.set(e,{glyph:r,until:s+.06+Math.random()*.1}),r}return t}}function Cl({onDive:a,disabled:e,onHover:t}){const s=y.useRef(null),i=y.useRef(0),r=y.useRef(-1),o=y.useRef(a);return o.current=a,y.useEffect(()=>{const l=s.current,c=Math.min(560,window.innerWidth*.88),u=Math.round(c*.2),d=Math.min(window.devicePixelRatio||1,2),h=new Za({alpha:!0,antialias:!0});h.setPixelRatio(d),h.setSize(c,u),h.setClearColor(0,0),l.appendChild(h.domElement);const p=document.createElement("canvas");p.width=Math.round(c*d),p.height=Math.round(u*d);const g=p.getContext("2d"),f=new ve(p);f.minFilter=Ja;const v=new $({uniforms:{uText:{value:f},uRes:{value:new Fe(c,u)},uTime:{value:0},uHover:{value:0},uPress:{value:0}},vertexShader:kl,fragmentShader:jl,transparent:!0}),b=new Ee;b.add(new D(new Ce(2,2),v));const x=new Xa(-1,1,1,-1,0,1),S=new Nl,N=`600 ${Math.round(u*d*.3)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;let T=0,R=performance.now();const k=R,C=E=>{T=requestAnimationFrame(C);const j=(E-k)/1e3,_=Math.min(.1,(E-R)/1e3);R=E,v.uniforms.uHover.value+=(i.current-v.uniforms.uHover.value)*Math.min(1,_*8),r.current>=0&&(r.current=Math.min(1,r.current+_*1.4)),v.uniforms.uPress.value=Math.max(0,r.current),v.uniforms.uTime.value=j,g.clearRect(0,0,p.width,p.height),g.font=N,g.textAlign="center",g.textBaseline="middle";const z=S.text(j),A=p.height*.06,L=z.split("").map(Q=>g.measureText(Q).width+A),V=L.reduce((Q,ie)=>Q+ie,0),F=Math.min(1,p.width*.84/V);g.save(),g.translate(p.width/2,p.height/2),g.scale(F,F);let q=-V/2;g.fillStyle="#fff",z.split("").forEach((Q,ie)=>{g.fillText(Q,q+L[ie]/2,0),q+=L[ie]}),g.restore(),f.needsUpdate=!0,h.render(b,x)};return T=requestAnimationFrame(C),()=>{cancelAnimationFrame(T),f.dispose(),v.dispose(),h.dispose(),h.domElement.remove()}},[]),n.jsx("div",{ref:s,role:"button",tabIndex:0,"aria-label":m("Dive into the void"),className:`relative select-none outline-none ${e?"pointer-events-none":"cursor-pointer"}`,onPointerEnter:()=>{i.current=1,t(!0)},onPointerLeave:()=>{i.current=0,t(!1)},onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(r.current=0,o.current())},onClick:()=>{r.current=0,o.current()}})}function Tl({accelerating:a}){const[e,t]=y.useState(0);y.useEffect(()=>{const r=setInterval(()=>t(o=>o+1),120);return()=>clearInterval(r)},[]);const s=r=>String(Math.floor((Math.sin(e*.07+r)*.5+.5)*9999999)).padStart(7,"0"),i=a?[m("DRIVE ENGAGED"),m("JUMP FIELD STABLE"),m("ENTERING HYPERSPACE")]:[m("SYSTEMS NOMINAL"),m("DRIFTING"),m("SCAN %@ · %@ · %@",s(1),s(2),s(3))];return n.jsxs(n.Fragment,{children:[n.jsx("div",{className:"absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 leading-5 pointer-events-none",children:i.map((r,o)=>n.jsx("div",{children:r},o))}),n.jsxs("div",{className:"hidden sm:block absolute top-6 right-6 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/30 text-right leading-5 pointer-events-none",children:[n.jsx("div",{children:a?m("VELOCITY ∞"):m("VELOCITY %@ C",ae(.12+.02*Math.sin(e*.2),3))}),n.jsx("div",{children:m("∞ GALAXIES · ∞ SYSTEMS")})]})]})}const Cs=19e5*365.25*86400,Al="1.618033988749895",Ue=365.25*86400,Aa=[{label:"1 s",seconds:1},{label:"1 h",seconds:3600},{label:"1 d",seconds:86400},{label:"1 yr",seconds:Ue},{label:"100 yr",seconds:100*Ue},{label:"10 kyr",seconds:1e4*Ue},{label:"1.9 Myr",seconds:Cs}],Ra=a=>Math.min(1,Math.max(0,Math.log10(Math.max(a,1))/Math.log10(Cs)));function Rl(){const[a,e]=y.useState(null);return y.useEffect(()=>{const t=ct();fetch("/api/universe/config",{credentials:"same-origin"}).then(s=>s.json()).then(s=>{if(!s?.success)return;const i=String(s.seed_str??t?.seed_str??""),r=t?.remote?m("Remote universe · %@",t.node_id??"").trim():i===Al?m("The Core Continuum"):m("Your own universe");e({seed:i,hash:String(s.seed_hash??""),origin:Number(s.cosmic_origin_time??t?.cosmic_origin_time??0),name:r})}).catch(()=>{})},[]),a}function Pl(a){const[e,t]=y.useState(()=>Date.now()/1e3);return y.useEffect(()=>{const s=setInterval(()=>t(Date.now()/1e3),a);return()=>clearInterval(s)},[a]),e}function _l(a){if(a<0)return m("Not yet born");const e=Math.floor(a/Ue),t=Math.floor(a%Ue/86400),s=Math.floor(a%86400/3600),i=Math.floor(a%3600/60),r=Math.floor(a%60),o=l=>String(l).padStart(2,"0");return`${e}Y ${String(t).padStart(3,"0")}D ${o(s)}H ${o(i)}M ${o(r)}S`}function El(a){const e=new Date(a*1e3);return Number.isNaN(e.getTime())?`${X(Math.floor(1970+a/Ue))} AD`:e.toISOString().slice(0,19).replace("T"," ")+" UTC"}function Ll({hash:a}){const e=Pt(a,1400),[t,s]=y.useState(0);return y.useEffect(()=>{const i=setInterval(()=>s(r=>(r+1)%(a.length+24)),45);return()=>clearInterval(i)},[a.length]),n.jsx("span",{className:"break-all",children:e.split("").map((i,r)=>{const o=t-r,l=o>=0&&o<10?1-o/10:0;return n.jsx("span",{style:{color:`rgba(${Math.round(120+135*l)}, ${Math.round(200+55*l)}, 255, ${.28+.6*l})`},children:i},r)})})}function Nt({label:a,value:e,accent:t,mono:s=!0}){return n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-0.5",children:a}),n.jsx("div",{className:`${s?"font-mono":""} text-xs sm:text-sm truncate ${t}`,children:e})]})}function Il({visible:a}){const e=Rl(),t=Pl(73),s=Pt(e?.seed??"",900),i=Pt(e?El(e.origin):"",1100);if(!e)return null;const r=t-e.origin,o=Math.max(0,r/Cs*100),l=Ra(r);return n.jsx("div",{className:`absolute bottom-0 inset-x-0 px-4 pb-4 sm:pb-7 flex justify-center pointer-events-none transition-all ease-in ${a?"opacity-100 duration-300":"opacity-0 translate-y-3 duration-700"}`,children:n.jsxs("div",{className:"w-full max-w-5xl animate-[fadeIn_1.8s_ease-out]",style:{animationDelay:"0.6s",animationFillMode:"both"},children:[n.jsxs("div",{className:"flex items-center gap-3 mb-2.5",children:[n.jsx("span",{className:"text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 whitespace-nowrap",children:e.name}),n.jsx("span",{className:"h-px flex-1 bg-gradient-to-r from-cyan-300/30 to-transparent"})]}),n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5",children:[n.jsx(Nt,{label:m("Primordial seed"),value:s||"—",accent:"text-cyan-100"}),n.jsx(Nt,{label:m("Big Bang"),value:i,accent:"text-violet-200"}),n.jsx(Nt,{label:m("Age"),value:_l(r),accent:"text-emerald-200"}),n.jsx(Nt,{label:m("Development"),value:`${ae(o,15)}%`,accent:"text-amber-200"})]}),n.jsxs("div",{className:"relative mt-4 mb-1 h-6",children:[n.jsx("div",{className:"absolute inset-x-0 top-2 h-px bg-white/15"}),n.jsx("div",{className:"absolute left-0 top-2 h-px bg-gradient-to-r from-cyan-300/20 via-cyan-300/70 to-amber-200",style:{width:`${l*100}%`}}),Aa.map((c,u)=>{const d=Ra(c.seconds)*100,h=r>=c.seconds,p=u===0?"items-start":u===Aa.length-1?"items-end -translate-x-full":"items-center -translate-x-1/2";return n.jsxs("div",{className:`absolute top-0 flex flex-col ${p}`,style:{left:`${d}%`},children:[n.jsx("span",{className:`w-px h-2.5 mt-[3px] ${h?"bg-cyan-200/70":"bg-white/25"}`}),n.jsx("span",{className:`text-[8px] sm:text-[9px] font-mono mt-1 whitespace-nowrap ${h?"text-cyan-200/70":"text-gray-600"}`,children:c.label})]},c.label)}),n.jsxs("div",{className:"absolute top-2 -translate-x-1/2 -translate-y-1/2",style:{left:`${l*100}%`},children:[n.jsx("span",{className:"block w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(253,230,138,0.95)]"}),n.jsx("span",{className:"absolute inset-0 rounded-full bg-amber-200/60 animate-ping"})]})]}),n.jsxs("div",{className:"hidden sm:flex items-baseline gap-3 mt-3 text-[10px] font-mono",children:[n.jsx("span",{className:"uppercase tracking-[0.3em] text-gray-600 shrink-0",children:"SHA-256"}),n.jsx(Ll,{hash:e.hash})]})]})})}function Fl({onIgnite:a,onDive:e}){const[t,s]=y.useState("drifting"),[i,r]=vn(),o=y.useRef(null),l=y.useRef(null);if(y.useEffect(()=>{if(!o.current)return;const d=new xn(o.current);return l.current=d,()=>{d.dispose(),l.current=null}},[]),t==="gone")return null;const c=()=>{t!=="drifting"||!i||(s("accelerating"),a(),l.current?.accelerate(Rt),setTimeout(()=>{s("leaving"),e()},Rt*1e3),setTimeout(()=>s("gone"),Rt*1e3+700))},u=t!=="drifting";return n.jsxs("div",{className:`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity ease-out ${t==="leaving"?"opacity-0 duration-500 pointer-events-none":"opacity-100 duration-300"}`,children:[n.jsx("div",{ref:o,className:"absolute inset-0 pointer-events-none"}),n.jsx(Tl,{accelerating:u}),n.jsx(Il,{visible:!u}),n.jsxs("div",{className:`relative -mt-32 sm:-mt-24 flex flex-col items-center gap-10 px-4 transition-all ease-in ${u?"opacity-0 scale-125 blur-[2px] duration-[900ms]":"opacity-100 duration-300"}`,children:[n.jsxs("div",{className:"text-center animate-[fadeIn_2.4s_ease-out]",children:[n.jsxs("div",{className:"text-4xl sm:text-6xl font-bold tracking-[0.5em] pl-[0.5em] text-white/95 drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]",children:["ATLAS",n.jsx("span",{className:"text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]",children:"3"})]}),n.jsx("div",{className:"mt-4 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.45em] text-cyan-100/60",children:m("A PROCEDURAL UNIVERSE, IN REAL TIME")})]}),n.jsx(Cl,{onDive:c,disabled:u,onHover:d=>l.current?.setAnticipation(d?1:0)}),n.jsxs("div",{className:"text-[10px] uppercase tracking-[0.35em] text-gray-500 flex items-center gap-2",children:[n.jsx("svg",{width:12,height:12,viewBox:"0 0 24 24",className:"text-gray-500",children:n.jsx("path",{fill:"currentColor",d:"M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z"})}),m("BEST WITH SOUND ON")]})]}),!i&&n.jsx(yn,{onChosen:r})]})}const Kt=5,zl=1.2,Ri="atlas-music-muted",Pa=.7;class Dl{constructor(e,t=Math.random){this.tracks=e,this.random=t}tracks;random;order=[];last=null;next(){if(this.tracks.length===0)return null;if(this.order.length===0){const e=[...this.tracks];for(let t=e.length-1;t>0;t--){const s=Math.floor(this.random()*(t+1));[e[t],e[s]]=[e[s],e[t]]}e.length>1&&e[0]===this.last&&([e[0],e[1]]=[e[1],e[0]]),this.order=e}return this.last=this.order.shift(),this.last}}class Wl{ctx=null;master=null;playlist;upcoming=null;timers=[];started=!1;disposed=!1;muted;constructor(e){this.muted=Ol(),this.playlist=new Dl(e);const t=window.AudioContext??window.webkitAudioContext;t&&(this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:Pa,this.master.connect(this.ctx.destination),this.prepare())}get context(){return this.ctx}prepare(){if(this.upcoming||!this.ctx)return;const e=this.ctx,t=s=>{const i=this.playlist.next();return!i||s<=0||this.disposed?Promise.resolve(null):fetch(i).then(r=>r.ok?r.arrayBuffer():Promise.reject(new Error(`${r.status}`))).then(r=>e.decodeAudioData(r)).catch(()=>t(s-1))};this.upcoming=t(4)}takeUpcoming(){this.prepare();const e=this.upcoming;return this.upcoming=null,e}later(e,t){this.timers.push(setTimeout(t,Math.max(0,e*1e3)))}start(){!this.ctx||this.started||(this.started=!0,this.ctx.resume(),this.takeUpcoming().then(e=>{e&&this.ctx&&!this.disposed&&this.play(e,this.ctx.currentTime+.02,zl)}))}play(e,t,s){const i=this.ctx,r=i.createBufferSource();r.buffer=e;const o=i.createGain();o.gain.setValueAtTime(0,t),o.gain.linearRampToValueAtTime(1,t+s),r.connect(o).connect(this.master),r.start(t),r.onended=()=>o.disconnect(),this.later(t-i.currentTime+Kt+1,()=>this.prepare());const l=t+Math.max(1,e.duration-Kt);this.later(l-i.currentTime-2,()=>{this.takeUpcoming().then(c=>{!c||this.disposed||this.play(c,Math.max(l,i.currentTime+.05),Kt)})})}setMuted(e){this.muted=e;try{localStorage.setItem(Ri,e?"1":"0")}catch{}if(!this.ctx||!this.master)return;const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t),this.master.gain.setValueAtTime(this.master.gain.value,t),this.master.gain.linearRampToValueAtTime(e?0:Pa,t+.6)}dispose(){this.disposed=!0,this.timers.forEach(clearTimeout),this.timers=[],this.ctx?.close()}}function Ol(){try{return localStorage.getItem(Ri)==="1"}catch{return!1}}const _a={ACTIVE:{dot:"bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse",text:"text-emerald-300",dim:""},INACTIVE:{dot:"bg-amber-400",text:"text-amber-300",dim:"opacity-85"},STALE:{dot:"bg-orange-400",text:"text-orange-300",dim:"opacity-70"},ARCHIVED:{dot:"bg-gray-500",text:"text-gray-400",dim:"opacity-50"},UNKNOWN:{dot:"bg-red-400",text:"text-red-300",dim:"opacity-60"}},Ea="atlasMultiverseAutoRefresh",La="atlasMultiversePortMessageDismissed",Gl="1.618033988749895",ql=a=>ot.filterContent(a.seed_name).isBlocked||ot.filterContent(a.seed).isBlocked;function Vl(a){if(!a)return m("Unknown origin");const e=new Date(a*1e3);return Number.isNaN(e.getTime())?m("Invalid date"):e.toLocaleDateString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Ia(a){if(!a)return m("never");const e=Math.floor((Date.now()-a*1e3)/6e4);if(e<1)return m("just now");if(e<60)return m("%lldm ago",e);const t=Math.floor(e/60);return t<24?m("%lldh ago",t):m("%lldd ago",Math.floor(t/24))}function Fa(a,e){try{const t=localStorage.getItem(a);return t===null?e:t==="true"}catch{return e}}function za(a,e){try{localStorage.setItem(a,String(e))}catch{}}function Hl({universe:a,onClose:e,onCross:t}){const[s,i]=y.useState(null),[r,o]=y.useState(0),[l,c]=y.useState(null),[u,d]=y.useState(!1),[h,p]=y.useState(null),[g,f]=y.useState(()=>Fa(Ea,!0)),[v,b]=y.useState(()=>!Fa(La,!1)),x=async()=>{d(!0);try{const C=await(await fetch("/api/multiverse/peers",{credentials:"same-origin"})).json();C.success?(i(C.groups??[]),o(C.total_peers??0),c(null)):c(C.error||m("The multiverse did not answer."))}catch(k){c(m("Network error: %@",k instanceof Error?k.message:String(k)))}finally{d(!1),p(new Date)}};y.useEffect(()=>{x()},[]),y.useEffect(()=>{if(!g)return;const k=setInterval(x,3e4);return()=>clearInterval(k)},[g]);const S=y.useMemo(()=>(s??[]).filter(k=>!ql(k)&&k.peers.length>0),[s]),N=(s?.length??0)-S.length,T=!!a?.remote,R=k=>{const C=k.peers.reduce((j,_)=>_.last_seen>j.last_seen?_:j),E=new URLSearchParams({seed:k.seed,seed_name:k.seed_name,cosmic_origin_time:String(k.cosmic_origin_time)});t({url:`/multiverse/${C.peer_id}/explore?${E}`,name:Ht.sanitizeForDisplay(ot.getDisplayText(k.seed)),home:!1})};return n.jsx(Wt,{onClose:e,children:n.jsxs(me,{className:"w-[min(1040px,calc(100vw-2rem))] h-[min(720px,calc(100vh-2rem))] flex flex-col overflow-hidden",children:[n.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/10",children:[n.jsxs("div",{children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80",children:m("P2P universe network")}),n.jsx("div",{className:"text-lg text-white font-light tracking-wide",children:m("The Multiverse")})]}),n.jsxs("div",{className:"flex items-center gap-3 text-xs",children:[n.jsxs("span",{className:"text-gray-500",children:[m("Peers")," ",n.jsx("span",{className:"text-gray-100 font-mono",children:r})]}),n.jsxs("span",{className:"text-gray-500",children:[m("Universes")," ",n.jsx("span",{className:"text-gray-100 font-mono",children:S.length})]}),N>0&&n.jsxs("span",{className:"text-gray-500",children:[m("Filtered")," ",n.jsx("span",{className:"text-red-300 font-mono",children:N})]}),h&&n.jsx("span",{className:"text-gray-600 hidden sm:inline",children:h.toLocaleTimeString()}),n.jsx(H,{onClick:x,disabled:u,children:u?m("Scanning…"):m("Refresh")}),n.jsx(H,{onClick:()=>{za(Ea,!g),f(!g)},className:g?"!border-emerald-400/40 !text-emerald-200":"",children:g?m("Auto on"):m("Auto off")}),n.jsx("button",{onClick:e,className:"text-gray-400 hover:text-white text-lg leading-none px-1",title:m("Close"),children:"✕"})]})]}),n.jsxs("div",{className:"flex-1 overflow-y-auto p-5 space-y-4",children:[T&&a&&n.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-950/60 to-indigo-950/60 px-4 py-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/90 mb-0.5",children:m("You are exploring a remote universe")}),n.jsx("div",{className:"text-sm text-white font-mono truncate",children:Ht.sanitizeForDisplay(a.seed_str)||m("Unknown seed")}),n.jsx("div",{className:"text-[11px] text-gray-400 font-mono truncate",children:a.node_id})]}),n.jsx(H,{tone:"primary",onClick:()=>t({url:"/multiverse/exit",name:m("your universe"),home:!0}),children:m("Return to your universe")})]}),v&&n.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-950/30 px-4 py-3",children:[n.jsxs("div",{className:"flex-1 text-xs leading-relaxed text-gray-300",children:[n.jsxs("span",{className:"text-sky-200 font-medium",children:[m("Private network?")," "]}),m("If you're behind a private connection or firewall, open the Atlas ports so other instances can reach yours. That is what lets universes travel across the network.")]}),n.jsx("button",{onClick:()=>{za(La,!0),b(!1)},className:"text-gray-500 hover:text-white leading-none",title:m("Dismiss"),children:"✕"})]}),l&&n.jsx("div",{className:"rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200",children:l}),s===null&&!l&&n.jsxs("div",{className:"flex flex-col items-center justify-center py-20 text-sm text-fuchsia-200/80",children:[n.jsx("div",{className:"w-10 h-10 mb-3 rounded-full border-2 border-fuchsia-400/20 border-t-fuchsia-300 animate-spin"}),m("Scanning the multiverse…")]}),s!==null&&S.length===0&&!l&&n.jsx("div",{className:"py-16 text-center text-sm text-gray-400",children:m("No other universes found yet. Leave The Atlas running with P2P on: other explorers will appear here as they are discovered.")}),n.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",children:S.map(k=>{const C=k.peers.reduce((A,L)=>L.last_seen>A.last_seen?L:A),E=_a[C.status]??_a.UNKNOWN,j=T&&a?.seed_str===k.seed,_=k.seed===Gl?k.peers.find(A=>new Date(A.cosmic_origin_time*1e3).getFullYear()===1986)?.cosmic_origin_time??k.cosmic_origin_time:k.cosmic_origin_time,z=[...k.peers].sort((A,L)=>L.last_seen-A.last_seen);return n.jsxs("div",{className:`relative flex flex-col rounded-xl border p-4 transition-colors ${j?"border-fuchsia-400/60 bg-fuchsia-500/10":"border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"} ${E.dim}`,children:[n.jsxs("div",{className:"flex items-start justify-between gap-2 mb-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 truncate",children:ot.getDisplayText(k.seed_name)}),n.jsx("div",{className:"text-base text-white font-mono truncate",title:k.seed,children:Ht.sanitizeForDisplay(ot.getDisplayText(k.seed))})]}),n.jsxs("div",{className:`flex items-center gap-1.5 shrink-0 text-[10px] font-mono uppercase ${E.text}`,children:[n.jsx("span",{className:`w-1.5 h-1.5 rounded-full ${E.dot}`}),j?m("exploring"):m(C.status.toLowerCase()),k.count>1&&n.jsx("span",{className:"ml-1 px-1.5 rounded bg-white/10 text-gray-200",children:k.count})]})]}),n.jsxs("div",{className:"text-xs space-y-1 mb-3",children:[n.jsxs("div",{className:"flex justify-between gap-3",children:[n.jsx("span",{className:"text-gray-500",children:"Bit Bang"}),n.jsx("span",{className:"text-gray-200",children:Vl(_)})]}),n.jsxs("div",{className:"flex justify-between gap-3",children:[n.jsx("span",{className:"text-gray-500",children:m("Last seen")}),n.jsx("span",{className:"text-gray-200",children:Ia(C.last_seen)})]})]}),n.jsxs("details",{className:"mb-3 text-[11px]",children:[n.jsx("summary",{className:"cursor-pointer text-gray-500 hover:text-gray-300 select-none",children:m("%lld Atlas instances",k.count)}),n.jsx("div",{className:"mt-1.5 space-y-1",children:z.map(A=>n.jsxs("div",{className:"flex justify-between gap-2 rounded bg-black/30 px-2 py-1 font-mono",children:[n.jsx("span",{className:"truncate text-gray-400",children:A.peer_id}),n.jsx("span",{className:"shrink-0 text-gray-500",children:Ia(A.last_seen)})]},A.peer_id))})]}),n.jsx("div",{className:"mt-auto",children:n.jsx(H,{tone:j?"ghost":"primary",className:"w-full",disabled:j,onClick:()=>R(k),children:j?m("You are here"):m("Explore this universe")})})]},k.seed)})})]})]})})}function Bl({crossing:a}){const[e,t]=y.useState(0),[s]=y.useState(()=>Ye());return y.useEffect(()=>{const i=[setTimeout(()=>t(1),50),setTimeout(()=>t(2),1700)];return()=>i.forEach(clearTimeout)},[]),n.jsxs("div",{className:"absolute inset-0 pointer-events-auto flex items-center justify-center",children:[n.jsx("div",{className:`absolute inset-0 transition-opacity ${s?"duration-1000":"duration-500"} ${e===2?"opacity-100":"opacity-0"}`,style:{background:s?"radial-gradient(circle at 50% 50%, #0b2530 0%, #000 70%)":"radial-gradient(circle at 50% 50%, #ffffff 0%, #a5f3fc 35%, rgba(0,0,0,0) 75%)"}}),n.jsxs("div",{className:`relative text-center transition-all duration-700 ${e>=1?"opacity-100 translate-y-0":"opacity-0 translate-y-2"}`,children:[n.jsx("div",{className:"text-[11px] uppercase tracking-[0.5em] text-cyan-200/90 mb-2",children:a.home?m("Returning to"):m("Crossing into")}),n.jsx("div",{className:"text-3xl sm:text-4xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]",children:a.name})]})]})}const $l=200,hs="atlas-places-changed";function Ul(a){const e=a.match(/\/stargate\/([A-Za-z0-9\-_=]+)/);if(!e)return null;try{const t=new URLSearchParams(atob(e[1].replace(/-/g,"+").replace(/_/g,"/"))),s=(t.get("coordinates")??"").split(",").map(r=>parseInt(r,10));if(s.length!==3||s.some(r=>!Number.isFinite(r)))return null;const i=t.get("system");return{coordinates:s,system:i!==null?parseInt(i,10):null,planet:null,planetName:t.get("planet")}}catch{return null}}function Gt(a){return a.coordinates?{coordinates:a.coordinates,system:a.system??null,planet:a.planet??null,planetName:a.planetName??null}:Ul(a.stargateUrl)}const Pi=(a,e)=>!!a&&!!e&&a.coordinates.join(",")===e.coordinates.join(",")&&a.system===e.system&&(a.planet!==null&&e.planet!==null?a.planet===e.planet:(a.planetName??"").toLowerCase()===(e.planetName??"").toLowerCase());function Xe(){try{const a=JSON.parse(Nn(ii.LOCATIONS)??"[]");return Array.isArray(a)?a.filter(e=>e&&typeof e.name=="string"&&typeof e.stargateUrl=="string").sort((e,t)=>t.timestamp-e.timestamp):[]}catch{return[]}}function Ts(a){try{Cn(ii.LOCATIONS,JSON.stringify(a.slice(0,$l)))}catch{}window.dispatchEvent(new CustomEvent(hs))}function Yl(a){return Xe().find(e=>Pi(Gt(e),a))??null}function Zl(a,e){const t={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,timestamp:Date.now(),stargateUrl:Ns(a.coordinates,a.system,a.planetName),...a,...e},s=Xe().filter(i=>!Pi(Gt(i),a));return Ts([t,...s]),t}function Xl(a,e){const t=e.trim();t&&Ts(Xe().map(s=>s.id===a?{...s,name:t}:s))}function _i(a){Ts(Xe().filter(e=>e.id!==a))}const Da=a=>a.replace(/_/g," "),Wa="Stargate Aligned",Jl=[{chars:"01",ms:20,steps:18},{chars:"0123456789",ms:15,steps:22},{chars:"0123456789ABCDEF",ms:10,steps:30},{chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~",ms:6,steps:50}],Qt="stargateAnimationShown";function Kl(a){const[e,t]=y.useState(()=>sessionStorage.getItem(Qt)?m(Wa):m("Aligning Stargate…")),[s,i]=y.useState(()=>!!sessionStorage.getItem(Qt));return y.useEffect(()=>{if(!a||s)return;let r=!1;return(async()=>{const o=c=>new Promise(u=>setTimeout(u,c));for(const c of Jl)for(let u=0;u<c.steps;u++){if(r)return;t(Array.from({length:22},()=>c.chars[Math.floor(Math.random()*c.chars.length)]).join("")),await o(c.ms)}const l=m(Wa);for(let c=1;c<=l.length;c++){if(r)return;t(l.slice(0,c)),await o(25)}sessionStorage.setItem(Qt,"true"),i(!0)})(),()=>{r=!0}},[a,s]),{text:e,aligned:s}}function Ql(){const[a,e]=y.useState(()=>Xe());return y.useEffect(()=>{const t=()=>e(Xe());return window.addEventListener(hs,t),window.addEventListener("storage",t),()=>{window.removeEventListener(hs,t),window.removeEventListener("storage",t)}},[]),a}const us={galaxy:{label:"Galaxy",plural:"Galaxies",color:"text-purple-300",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:[n.jsx("path",{d:"M12 12c3-4 8-3 8 1s-6 7-10 5"}),n.jsx("path",{d:"M12 12c-3 4-8 3-8-1s6-7 10-5"}),n.jsx("circle",{cx:12,cy:12,r:1.2,fill:"currentColor"})]})},system:{label:"System",plural:"Systems",color:"text-cyan-300",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[n.jsx("circle",{cx:12,cy:12,r:2.5,fill:"currentColor"}),n.jsx("ellipse",{cx:12,cy:12,rx:9,ry:4,opacity:.6})]})},planet:{label:"Planet",plural:"Planets",color:"text-pink-300",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[n.jsx("circle",{cx:12,cy:12,r:5.5}),n.jsx("path",{d:"M3 14c4 2 14 0 18-4",opacity:.6})]})}},ec=a=>{const e=Math.max(0,(Date.now()-a)/6e4);return e<1?m("Saved just now"):e<60?m("Saved %lld min ago",Math.floor(e)):e<1440?m("Saved %lld h ago",Math.floor(e/60)):e<1440*30?m("Saved %lld d ago",Math.floor(e/60/24)):m("Saved %@",new Date(a).toLocaleDateString())},es=({title:a,onClick:e,danger:t,children:s})=>n.jsx("button",{title:a,"aria-label":a,onClick:e,className:`w-7 h-7 shrink-0 flex items-center justify-center rounded-md border border-white/10 bg-white/5 transition-colors ${t?"hover:bg-red-500/20 hover:text-red-200 text-gray-400":"hover:bg-white/15 text-gray-300"}`,children:n.jsx("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round",children:s})});function tc({place:a,disabled:e,onGo:t}){const[s,i]=y.useState("idle"),[r,o]=y.useState(a.name),[l,c]=y.useState(!1),u=Gt(a),d=us[a.type]??us.galaxy,h=[a.type==="planet"?a.systemName:null,a.type!=="galaxy"?a.galaxyName:null].filter(Boolean).join(" · "),p=async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}${a.stargateUrl.slice(a.stargateUrl.indexOf("/stargate/"))}`),c(!0),setTimeout(()=>c(!1),1500)}catch{}},g=()=>{Xl(a.id,r),i("idle")};return n.jsxs("div",{className:"group rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-2.5 py-2",children:[n.jsxs("div",{className:"flex items-center gap-2.5",children:[n.jsx("svg",{width:22,height:22,viewBox:"0 0 24 24",className:`shrink-0 ${d.color}`,children:d.icon}),n.jsxs("div",{className:"min-w-0 flex-1",children:[s==="rename"?n.jsx("input",{autoFocus:!0,value:r,maxLength:60,onChange:f=>o(f.target.value),onKeyDown:f=>{f.key==="Enter"&&g(),f.key==="Escape"&&(o(a.name),i("idle")),f.stopPropagation()},onBlur:g,className:"w-full bg-black/40 border border-cyan-400/40 rounded px-1.5 py-0.5 text-sm text-white outline-none"}):n.jsx("div",{className:"text-sm text-gray-100 truncate",children:a.name}),n.jsxs("div",{className:"text-[10px] text-gray-500 truncate",children:[n.jsx("span",{className:d.color,children:m(d.label)}),h&&n.jsxs(n.Fragment,{children:[" · ",h]}),u&&n.jsxs("span",{className:"font-mono",children:[" · ",u.coordinates.join(", ")]})]})]}),s!=="confirm"&&n.jsx(H,{tone:"primary",className:"shrink-0 px-2.5",disabled:e||!u,onClick:()=>t(a),children:m("Go")})]}),n.jsxs("div",{className:"flex items-center justify-between gap-2 mt-1.5 pl-[32px]",children:[n.jsx("span",{className:"text-[10px] text-gray-600",children:l?n.jsx("span",{className:"text-cyan-300",children:m("Link copied")}):ec(a.timestamp)}),s==="confirm"?n.jsxs("div",{className:"flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]",children:[n.jsx("span",{className:"text-[11px] text-red-200/90",children:m("Remove this place?")}),n.jsx("button",{onClick:()=>i("idle"),className:"px-2 py-0.5 rounded text-[11px] text-gray-300 bg-white/5 hover:bg-white/15 border border-white/10",children:m("Keep")}),n.jsx("button",{onClick:()=>_i(a.id),className:"px-2 py-0.5 rounded text-[11px] text-red-100 bg-red-500/30 hover:bg-red-500/50 border border-red-400/40",children:m("Remove")})]}):n.jsxs("div",{className:"flex items-center gap-1",children:[n.jsxs(es,{title:m("Rename"),onClick:()=>i("rename"),children:[n.jsx("path",{d:"M4 20h4L19 9l-4-4L4 16v4z"}),n.jsx("path",{d:"M13.5 6.5l4 4"})]}),n.jsxs(es,{title:m("Copy Stargate link"),onClick:p,children:[n.jsx("rect",{x:9,y:9,width:11,height:11,rx:2}),n.jsx("path",{d:"M5 15V5a1 1 0 0 1 1-1h10"})]}),n.jsx(es,{title:m("Remove"),danger:!0,onClick:()=>i("confirm"),children:n.jsx("path",{d:"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"})})]})]})]})}function sc({places:a,remote:e,onGo:t}){const[s,i]=y.useState("all"),r=y.useMemo(()=>({all:a.length,galaxy:a.filter(l=>l.type==="galaxy").length,system:a.filter(l=>l.type==="system").length,planet:a.filter(l=>l.type==="planet").length}),[a]),o=s==="all"?a:a.filter(l=>l.type===s);return a.length===0?n.jsxs("div",{className:"py-6 text-center",children:[n.jsx("svg",{width:34,height:34,viewBox:"0 0 24 24",className:"mx-auto text-cyan-300/50 mb-2",fill:"none",stroke:"currentColor",strokeWidth:1.3,children:n.jsx("path",{d:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"})}),n.jsx("div",{className:"text-sm text-gray-200",children:m("No saved places yet")}),n.jsx("p",{className:"text-xs text-gray-500 mt-1 max-w-[16rem] mx-auto",children:m("Save where your ship is from the Link tab, and come back to it from here at any time.")})]}):n.jsxs("div",{children:[e&&n.jsx("p",{className:"text-[11px] text-fuchsia-200/80 mb-2",children:m("These places belong to your own universe: return home to travel to them.")}),n.jsx("div",{className:"flex gap-1 mb-2 overflow-x-auto",children:["all","galaxy","system","planet"].map(l=>n.jsxs("button",{disabled:l!=="all"&&r[l]===0,onClick:()=>i(l),className:`shrink-0 px-2 py-1 rounded-md text-[11px] border transition-colors disabled:opacity-30 ${s===l?"border-cyan-400/60 bg-cyan-400/10 text-cyan-100":"border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`,children:[l==="all"?m("All"):m(us[l].plural)," ",n.jsx("span",{className:"text-gray-500",children:r[l]})]},l))}),n.jsx("div",{className:"space-y-1.5 max-h-[min(22rem,50dvh)] overflow-y-auto overscroll-contain pr-0.5",children:o.map(l=>n.jsx(tc,{place:l,disabled:e,onGo:t},l.id))})]})}function ac({explorer:a,state:e,universe:t,onClose:s}){const i=!!t?.remote,{text:r,aligned:o}=Kl(!i),l=e.ship,c=l?.coordinates??e.coordinates,u=Ql(),[d,h]=y.useState("link"),p=!l||l.planet===null?null:e.orbiting&&e.orbiting.index===l.planet?e.orbiting.name:e.system&&e.system.index===l.system?e.system.planets.find(F=>F.index===l.planet)?.name??null:null,g=p?"planet":l?"system":"galaxy",[f,v]=y.useState(g);y.useEffect(()=>v(g),[g]);const[b,x]=y.useState(!1);if(!c)return null;const S=f!=="galaxy"&&l?l.system:null,N=Ns(c,S,f==="planet"?p:null),T=`${window.location.origin}${N}`,R={coordinates:c,system:S,planet:f==="planet"&&l?l.planet:null,planetName:f==="planet"?p:null},k=Yl(R),C=e.galaxy?Da(e.galaxy.name):null,E=l?e.owners.system(l.system)?.name??e.shipSystemName:null,j=l?E??m("System #%@",X(l.system)):null,_=p&&l&&l.planet!==null?e.owners.planetName({index:l.planet,name:p},l.system):null,z=()=>{if(k){_i(k.id);return}const F=f==="planet"&&_?_:f==="system"?j??m("Star system"):C??c.join(", ");Zl(R,{name:F,type:f,galaxyName:C,systemName:f==="planet"?j:null})},A=F=>{const q=Gt(F);q&&(s(),a.goToPlace(q.coordinates,q.system,q.planet,q.planetName))},L=[{depth:"galaxy",label:m("Galaxy"),name:e.galaxy?Da(e.galaxy.name):c.join(", ")},{depth:"system",label:m("System"),name:l?E??`#${X(l.system)}`:null},{depth:"planet",label:m("Planet"),name:_}],V=async()=>{try{await navigator.clipboard.writeText(T),x(!0),setTimeout(()=>x(!1),1800)}catch{}};return n.jsxs(me,{className:"w-[min(420px,calc(100vw-1.5rem))] p-4 pointer-events-auto",children:[n.jsxs("div",{className:"flex items-center justify-between mb-3",children:[n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("svg",{width:22,height:22,viewBox:"0 0 24 24",className:i?"text-red-300":o?"text-cyan-300":"text-cyan-300 animate-spin",children:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeWidth:1.5,children:[n.jsx("path",{d:"M14 12a6 6 0 1 1-6-6"}),n.jsx("path",{d:"M10 12a6 6 0 1 1 6 6",opacity:.5})]})}),n.jsxs("div",{children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-gray-500",children:"Stargate"}),n.jsx("div",{className:`font-mono text-sm ${i?"text-red-300":o?"text-cyan-200":"text-cyan-400/80"}`,children:i?m("Remote Universe"):r})]})]}),n.jsx("button",{onClick:s,className:"text-gray-400 hover:text-white leading-none px-1",title:m("Close"),children:"✕"})]}),n.jsx("div",{className:"grid grid-cols-2 gap-1 p-1 mb-3 rounded-lg bg-black/30 border border-white/10",children:["link","saved"].map(F=>n.jsx("button",{onClick:()=>h(F),className:`py-1.5 rounded-md text-xs transition-colors ${d===F?"bg-white/10 text-white":"text-gray-400 hover:text-gray-200"}`,children:F==="link"?m("Link"):n.jsxs(n.Fragment,{children:[m("Saved places")," ",n.jsx("span",{className:"text-gray-500",children:u.length})]})},F))}),d==="saved"?n.jsx(sc,{places:u,remote:i,onGo:A}):i?n.jsx("p",{className:"text-xs text-gray-400 leading-relaxed",children:m("Stargate links are disabled in remote universes: a gate points into one seed, and this one is not yours. Return to your own universe to open one.")}):n.jsxs("div",{className:`transition-opacity duration-300 ${o?"opacity-100":"opacity-30 pointer-events-none"}`,children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5",children:m("Destination")}),n.jsx("div",{className:"grid grid-cols-3 gap-1.5 mb-3",children:L.map(F=>n.jsxs("button",{disabled:!F.name,onClick:()=>v(F.depth),className:`text-left px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-30 ${f===F.depth?"border-cyan-400/60 bg-cyan-400/10":"border-white/10 bg-white/5 hover:bg-white/10"}`,children:[n.jsx("div",{className:"text-[10px] uppercase tracking-wider text-gray-500",children:F.label}),n.jsx("div",{className:"text-xs text-gray-100 truncate",children:F.name??"—"})]},F.depth))}),n.jsx("input",{readOnly:!0,value:T,onFocus:F=>F.currentTarget.select(),className:"w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-cyan-100/90 outline-none select-text"}),n.jsxs("div",{className:"flex gap-2 mt-2.5",children:[n.jsx(H,{tone:"primary",className:"flex-1",onClick:V,children:b?m("Copied"):m("Copy link")}),typeof navigator.share=="function"&&n.jsx(H,{className:"flex-1",onClick:()=>navigator.share({title:"The Atlas",text:m("Check out this Stargate destination on The Atlas!"),url:T}).catch(()=>{}),children:m("Share")}),n.jsxs(H,{className:`flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap ${k?"!border-amber-300/50 !bg-amber-300/10 text-amber-100":""}`,onClick:z,title:k?m("Remove from your saved places"):m("Keep this destination in your saved places"),children:[n.jsx("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:k?"currentColor":"none",stroke:"currentColor",strokeWidth:1.8,strokeLinejoin:"round",children:n.jsx("path",{d:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"})}),k?m("Saved"):m("Save")]})]})]})]})}const ic=a=>a.replace(/_/g," "),nc={coords:{label:"Coords",chip:"bg-blue-900/50 text-blue-300 border-blue-500/30",text:"text-blue-100",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[n.jsx("path",{d:"M12 3v18M3 12h18",opacity:.5}),n.jsx("circle",{cx:12,cy:12,r:4})]})},galaxy:{label:"Galaxy",chip:"bg-purple-900/50 text-purple-300 border-purple-500/30",text:"text-purple-100",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:[n.jsx("path",{d:"M12 12c3-4 8-3 8 1s-6 7-10 5"}),n.jsx("path",{d:"M12 12c-3 4-8 3-8-1s6-7 10-5"}),n.jsx("circle",{cx:12,cy:12,r:1.2,fill:"currentColor"})]})},system:{label:"System",chip:"bg-cyan-900/50 text-cyan-300 border-cyan-500/30",text:"text-cyan-100",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[n.jsx("circle",{cx:12,cy:12,r:2.5,fill:"currentColor"}),n.jsx("ellipse",{cx:12,cy:12,rx:9,ry:4,opacity:.6})]})},planet:{label:"Planet",chip:"bg-pink-900/50 text-pink-300 border-pink-500/30",text:"text-pink-100",icon:n.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[n.jsx("circle",{cx:12,cy:12,r:5.5}),n.jsx("path",{d:"M3 14c4 2 14 0 18-4",opacity:.6})]})}};function oc({kind:a,value:e,locked:t}){const s=nc[a],i=Pt(e);return n.jsxs("div",{className:"flex items-center gap-3 animate-[fadeIn_0.35s_ease-out]",children:[n.jsx("svg",{width:24,height:24,viewBox:"0 0 24 24",className:`shrink-0 ${t?"text-emerald-300":s.text}`,children:s.icon}),n.jsx("span",{className:`px-2 py-1 text-[10px] font-mono uppercase rounded border shrink-0 ${s.chip}`,children:m(s.label)}),n.jsx("span",{className:`text-sm font-mono truncate ${t?"text-emerald-100":s.text}`,children:i})]},a)}function rc({plan:a,state:e,onDone:t}){const s=e.galaxy&&e.galaxy.coordinates.join(",")===a.coordinates.join(",")?e.galaxy:null,i=[{kind:"coords",value:`[${a.coordinates.map(v=>v.toLocaleString("en")).join(", ")}]`}];s&&i.push({kind:"galaxy",value:ic(s.name)}),s&&a.system!==null&&e.system&&e.system.index===a.system&&i.push({kind:"system",value:e.owners.systemName(e.system.index,e.system.name)}),s&&a.planet!==null&&e.orbiting&&e.orbiting.index===a.planet&&i.push({kind:"planet",value:e.owners.planetName(e.orbiting,a.system)});const r=2+(a.system!==null?1:0)+(a.planet!==null?1:0),[o,l]=y.useState(i);y.useEffect(()=>{i.length>o.length&&l(i)},[i.length]);const[c,u]=y.useState(1);y.useEffect(()=>{if(c>=o.length)return;const v=setTimeout(()=>u(b=>b+1),c===1?700:1300);return()=>clearTimeout(v)},[c,o.length]);const d=Math.min(c,o.length),h=d>=r,p=o[d-1],[g,f]=y.useState(!1);return y.useEffect(()=>{if(!h)return;const v=setTimeout(()=>f(!0),2600),b=setTimeout(t,3200);return()=>{clearTimeout(v),clearTimeout(b)}},[h]),y.useEffect(()=>{const v=setTimeout(t,45e3);return()=>clearTimeout(v)},[]),n.jsx("div",{className:`w-[min(32rem,calc(100vw-2rem))] transition-all duration-500 ${g?"opacity-0 -translate-y-2":"opacity-100 translate-y-0"}`,children:n.jsxs("div",{className:`relative rounded-xl border px-4 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors duration-700 ${h?"bg-gradient-to-r from-emerald-950/85 to-blue-950/85 border-emerald-400/40":"bg-gradient-to-r from-slate-950/85 to-blue-950/85 border-cyan-500/40"}`,children:[n.jsxs("div",{className:"flex items-center justify-between mb-2",children:[n.jsxs("span",{className:`text-[10px] font-mono uppercase tracking-[0.3em] ${h?"text-emerald-300/90":"text-cyan-300/80"}`,children:[a.kind==="stargate"?"Stargate":m("Jump protocol")," · ",h?m("location locked"):m("in transit")]}),n.jsx("span",{className:"flex gap-1",children:Array.from({length:r},(v,b)=>n.jsx("span",{className:`w-1.5 h-1.5 rounded-full transition-colors ${b<d?h?"bg-emerald-300":"bg-cyan-300":"bg-white/15"}`},b))})]}),n.jsx(oc,{kind:p.kind,value:p.value,locked:h},p.kind)]})})}function Ei({className:a=""}){return n.jsxs("label",{className:`flex items-center justify-between gap-3 ${a}`,children:[n.jsxs("span",{className:"flex items-center gap-2 text-sm text-gray-200",children:[n.jsxs("svg",{width:15,height:15,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round",className:"text-cyan-300 shrink-0",children:[n.jsx("circle",{cx:12,cy:12,r:9.5}),n.jsx("path",{d:"M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5s1.3-6.9 3.9-9.5z"})]}),m("Language")]}),n.jsx("select",{value:Ss(),onChange:e=>Mn(e.target.value),className:"min-w-0 bg-black/40 border border-white/15 rounded-lg px-2 py-1 text-xs text-gray-100 outline-none focus:border-cyan-400/60 cursor-pointer",children:Sn.map(e=>n.jsx("option",{value:e.code,lang:e.code,children:e.name},e.code))})]})}const ds=[5e6,5e6,5e6],lc=["atlas-origin","atlas-air-born","atlas-deep-dive","atlas-the-family"].map(a=>`/static/audio/${a}.mp3`),Je=a=>a.replace(/_/g," "),cc=typeof window<"u"&&!!window.matchMedia?.("(pointer: coarse)").matches,hc=[{kinds:["core","quasar","torus"],title:"Galactic center",accent:"text-amber-300"},{kinds:["globular"],title:"Globular clusters",accent:"text-orange-200"},{kinds:["open"],title:"Open clusters",accent:"text-sky-300"},{kinds:["blackhole"],title:"Black holes",accent:"text-fuchsia-300"},{kinds:["pulsar"],title:"Pulsars",accent:"text-cyan-300"}],uc=[{label:"1×",value:1},{label:"1 h/s",value:3600},{label:"1 d/s",value:86400},{label:"1 mo/s",value:26e5},{label:"1 yr/s",value:315e5}];function dc(){const a=new URLSearchParams(window.location.hash.replace(/^#/,"")),e=a.get("g");if(!e)return null;const t=e.split(",").map(r=>parseInt(r,10));if(t.length!==3||t.some(r=>!Number.isFinite(r)))return null;const s=a.get("s"),i=a.get("p");return{coordinates:t,system:s!==null?parseInt(s,10):null,planet:i!==null?parseInt(i,10):null,via:a.get("via")}}function mc(a){const e=a.ship;if(!e)return;const t=new URLSearchParams;t.set("g",e.coordinates.join(",")),t.set("s",String(e.system)),e.planet!==null&&t.set("p",String(e.planet));const s=`#${t.toString()}`;window.location.hash!==s&&window.history.replaceState(null,"",s)}const As=a=>a.system?.index??a.ship?.system??null,Ve=(a,e)=>a.owners.planetName(e,As(a)),Li=a=>(a.ship&&a.owners.system(a.ship.system)?.name)??a.shipSystemName,Ii=a=>a==="Singularity Void"?a:m("%@ galaxy",O(a)),ee=({label:a,value:e})=>n.jsxs("div",{className:"flex justify-between gap-3 text-xs py-0.5",children:[n.jsx("span",{className:"text-gray-500",children:a}),n.jsx("span",{className:"text-gray-100 text-right",children:e})]}),Ct=({onClick:a,title:e,sub:t,accent:s="text-gray-200"})=>n.jsxs("button",{onClick:a,className:"shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors",children:[n.jsx("div",{className:`text-xs leading-tight ${s}`,children:e}),t&&n.jsx("div",{className:"text-[10px] text-gray-500 leading-tight",children:t})]}),ms=({id:a,size:e=13})=>{const t=oi(a);return t?n.jsx("svg",{width:e,height:e,viewBox:"0 0 24 24",className:"shrink-0 text-emerald-200","aria-hidden":"true",children:n.jsx("path",{d:t,fill:"currentColor"})}):null};function Oa({own:a}){return n.jsxs("div",{className:"mt-1.5 min-w-0",children:[n.jsxs("div",{className:"flex items-center gap-1.5 text-xs text-emerald-200 min-w-0",children:[n.jsx(ms,{id:a.seal}),n.jsx("span",{className:"truncate",children:cs(a)})]}),a.note&&n.jsx("div",{className:"text-xs italic text-gray-400 mt-0.5 break-words",children:m("“%@”",a.note)})]})}function ts({label:a,onClick:e}){return n.jsxs(H,{onClick:e,title:a,"aria-label":a,className:"shrink-0 whitespace-nowrap",children:[n.jsxs("span",{className:"hidden sm:inline",children:[a,n.jsx(we,{children:"Esc"})]}),n.jsx("span",{className:"sm:hidden text-sm leading-none px-0.5","aria-hidden":"true",children:"‹"})]})}function pc({state:a,shipTitle:e}){const t=[];return a.galaxy&&t.push({label:Je(a.galaxy.name),sub:`${Ii(a.galaxy.galaxy_type)} · ${a.galaxy.coordinates.join(", ")}`}),e&&t.push({label:e,sub:a.ship?m("system #%@",X(a.ship.system)):""}),a.orbiting&&t.push({label:Ve(a,a.orbiting),sub:m("in orbit · %@",O(a.orbiting.planet_type))}),a.visitingMoon&&t.push({label:Je(a.visitingMoon.name),sub:m("%@ moon",O(a.visitingMoon.type))}),n.jsxs("div",{className:"flex items-center gap-3 pointer-events-auto min-w-0",children:[n.jsxs("a",{href:"/",className:"shrink-0 text-sm font-bold tracking-[0.35em] text-white/90 hover:text-white",title:m("The Atlas, third version"),children:["ATLAS",n.jsx("span",{className:"text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",children:"3"})]}),n.jsxs("div",{className:"flex items-center gap-2 pl-3 border-l border-white/15 min-w-0",children:[n.jsx("span",{className:"shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",title:m("Your ship")}),t.map((s,i)=>n.jsxs("div",{className:`items-center gap-2 min-w-0 ${i===t.length-1?"flex":"hidden lg:flex"}`,children:[i>0&&n.jsx("span",{className:"text-gray-600 hidden lg:inline",children:"/"}),n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-sm text-white leading-tight truncate",children:s.label}),n.jsx("div",{className:"text-[10px] text-gray-500 leading-tight truncate",children:s.sub})]})]},i))]})]})}function fc(a){return a.mode==="system"?m("Leave system"):a.mode==="galaxy"?a.universeView?null:a.mapView?m("To the universe"):m("Galaxy view"):null}function gc({explorer:a,state:e}){const t=e.target,s=t?.kind==="planet"&&e.orbiting&&t.planet.index!==e.orbiting.index,i=As(e);if(t?.kind==="star"){const c=t.star,u=t.temperature>=1e5?`${X(t.temperature/1e3,3)}k K`:`${X(t.temperature)} K`;return n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-amber-200/90 truncate",children:m("Star · %@",O(c.Type))}),n.jsx("div",{className:"text-base font-semibold text-white truncate",children:t.name})]}),n.jsxs("div",{className:"flex gap-2 shrink-0",children:[n.jsxs(H,{tone:"primary",onClick:()=>a.engage(),children:[m("Approach"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{onClick:()=>a.clearTarget(),children:"✕"})]})]}),n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[n.jsx(ee,{label:m("Type"),value:O(c.Type)}),n.jsx(ee,{label:m("Colour"),value:O(c.Color.charAt(0).toUpperCase()+c.Color.slice(1))}),n.jsx(ee,{label:m("Radius"),value:`${X(c.Size,3)} R☉`}),n.jsx(ee,{label:m("Surface"),value:`≈ ${u}`})]})]})}if(t?.kind==="moon"){const c=t.moon,u=e.visitingMoon?.name===c.name,d=c.periodDays>=1?m("%@ days",ae(c.periodDays,2)):m("%@ h",ae(c.periodDays*24,1)),h=e.orbiting?Ve(e,e.orbiting):null;return n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-violet-300/90 truncate",children:[u?m("Visiting"):m("Moon")," · ",O(c.type)," · ",h?m("around %@",h):""]}),n.jsx("div",{className:"text-base font-semibold text-white truncate",children:Je(c.name)})]}),n.jsx("div",{className:"flex gap-2 shrink-0",children:u?n.jsx(ts,{label:h?m("Back to %@",h):m("Back to the planet"),onClick:()=>a.goUp()}):n.jsxs(n.Fragment,{children:[n.jsxs(H,{tone:"primary",onClick:()=>a.engage(),children:[m("Visit"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{onClick:()=>a.clearTarget(),children:"✕"})]})})]}),n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[n.jsx(ee,{label:m("Diameter"),value:`${X(Math.round(c.radiusKm*2))} km`}),n.jsx(ee,{label:m("Orbit"),value:`${X(Math.round(c.semiMajorAxisKm))} km`}),n.jsx(ee,{label:m("Period"),value:d}),n.jsx(ee,{label:m("Rotation"),value:c.tidallyLocked?m("Tidally locked"):m("Free")}),n.jsx(ee,{label:m("Eccentricity"),value:ae(c.eccentricity,3)}),n.jsx(ee,{label:m("Inclination"),value:`${ae(c.inclinationDeg,1)}°`}),n.jsx(ee,{label:m("Density"),value:`${X(Math.round(c.densityKgM3))} kg/m³`}),n.jsx(ee,{label:m("Origin"),value:O(c.origin.replace(/-/g," "))})]}),n.jsx("div",{className:"text-[10px] text-gray-500 mt-1 truncate",children:m("Mass %@ kg",c.massKg.toExponential(2))})]})}if(e.orbiting&&!s){const c=e.orbiting,u=i!==null?e.owners.planet(c.index,i):null;return n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-emerald-300/80",children:m("In orbit · %@",O(c.planet_type))}),n.jsx("div",{className:"text-base font-semibold text-white truncate",children:Ve(e,c)})]}),n.jsx(ts,{label:m("Leave orbit"),onClick:()=>a.goUp()})]}),u&&n.jsx(Oa,{own:u}),n.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[n.jsx(ee,{label:m("Diameter"),value:`${X(Math.round(c.diameter))} km`}),n.jsx(ee,{label:m("Gravity"),value:`${ae(c.gravity,1)} m/s²`}),n.jsx(ee,{label:m("Temperature"),value:`${ae(e.cosmicOrigin?Qr(c,e.cosmicTime-e.cosmicOrigin):c.surface_temperature,0)} °C`}),n.jsx(ee,{label:m("Atmosphere"),value:O(c.atmosphere)}),n.jsx(ee,{label:m("Day"),value:m("%@ h",ae(Math.abs(c.rotation_period_seconds)/3600,1))}),n.jsx(ee,{label:m("Year"),value:m("%@ yr",ae(c.orbital_period_seconds/31557600,2))}),n.jsx(ee,{label:m("Life"),value:O(c.life_forms)}),n.jsx(ee,{label:m("Moons"),value:e.planetDetail?.loading?"…":e.planetDetail?.moons??0})]}),n.jsx("div",{className:"text-[10px] text-gray-500 mt-1 truncate",children:c.elements.map(O).join(" · ")})]})}if(t?.kind==="system"){const c=t.summary,u=e.ship?.system===t.index,d=e.owners.system(t.index)?.owner;return n.jsxs("div",{className:"flex items-center justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-cyan-300/80",children:[u?m("Your ship is here"):m("Target locked")," · ",m("system #%@",X(t.index))]}),n.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[n.jsx(ms,{id:e.owners.system(t.index)?.seal??null,size:14}),n.jsx("div",{className:"text-base font-semibold text-white truncate",children:c?e.owners.systemName(t.index,c.name):m("Scanning…")})]}),c&&n.jsxs("div",{className:"text-xs text-gray-400 truncate",children:[d?`${m("Property of %@",d)} · `:"",c.stars.map(h=>O(h.Type)).join(" + ")," · ",m("%lld planets",c.num_planets)]})]}),n.jsxs("div",{className:"flex gap-2 shrink-0",children:[n.jsxs(H,{tone:"primary",onClick:()=>a.engage(),children:[u?m("Return"):m("Engage"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{onClick:()=>a.clearTarget(),children:"✕"})]})]})}if(t?.kind==="poi")return n.jsxs("div",{className:"flex items-center justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-amber-300/80",children:O(t.poi.kind)}),n.jsx("div",{className:"text-base font-semibold text-white",children:O(t.poi.name)}),n.jsx("div",{className:"text-xs text-gray-400 truncate",children:O(t.poi.description)})]}),n.jsxs("div",{className:"flex gap-2 shrink-0",children:[n.jsxs(H,{tone:"primary",onClick:()=>a.engage(),children:[m("Fly there"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{onClick:()=>a.clearTarget(),children:"✕"})]})]});if(t?.kind==="planet"){const c=t.planet,u=i!==null?e.owners.planet(c.index,i):null;return n.jsxs("div",{className:"flex items-center justify-between gap-3",children:[n.jsxs("div",{className:"min-w-0",children:[n.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-emerald-300/80",children:[e.orbiting?m("Next stop · leaving %@",Ve(e,e.orbiting)):m("Planet")," · ",O(c.planet_type)]}),n.jsxs("div",{className:"flex items-center gap-1.5 min-w-0",children:[n.jsx(ms,{id:u?.seal??null,size:14}),n.jsx("div",{className:"text-base font-semibold text-white truncate",children:Ve(e,c)})]}),n.jsxs("div",{className:"text-xs text-gray-400 truncate",children:[u?.owner?`${m("Property of %@",u.owner)} · `:"",m("%@ AU from the star",ae(c.orbital_radius,2))," · ",X(Math.round(c.diameter))," km · ",O(c.life_forms)]})]}),n.jsxs("div",{className:"flex gap-2 shrink-0",children:[n.jsxs(H,{tone:"primary",onClick:()=>a.engage(),children:[m("Go into orbit"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{onClick:()=>a.clearTarget(),children:"✕"})]})]})}const r=cc?e.mapView?m("Galaxy map. Tap any star to target it, pick a landmark, or follow the green marker back to your ship."):e.mode==="system"?m("Tap a planet to target it · double-tap to go straight into orbit."):m("Tap a star to target it · double-tap to jump straight there."):e.mapView?m("Galaxy map. Click any star to target it, pick a landmark, or follow the green marker back to your ship."):e.mode==="system"?m("Click a planet to target it · double-click to go straight into orbit."):m("Click a star to target it · double-click to jump straight there."),o=fc(e),l=e.mode==="system"&&!e.orbiting&&e.system?e.owners.system(e.system.index):null;return n.jsxs("div",{children:[n.jsxs("div",{className:"flex items-center justify-between gap-3",children:[n.jsx("div",{className:"text-xs text-gray-400",children:r}),o&&n.jsx(ts,{label:o,onClick:()=>a.goUp()})]}),l&&n.jsx(Oa,{own:l})]})}function vc({drift:a,onReset:e}){const t=Math.abs(a)>30;return n.jsx("button",{onClick:e,disabled:!t,title:t?m("Back to the present"):m("Running in real time"),"aria-label":m("Back to the present"),className:`shrink-0 ml-1.5 w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${t?"border-cyan-400/50 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/25":"border-white/10 text-gray-600 cursor-default"}`,children:n.jsxs("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round",strokeLinejoin:"round",children:[n.jsx("path",{d:"M3.5 12a8.5 8.5 0 1 0 2.5-6"}),n.jsx("path",{d:"M3 3.5v4.5h4.5"}),n.jsx("path",{d:"M12 7.5V12l3 2"})]})})}function xc({explorer:a,state:e}){const t=[],s=As(e);if(e.mode==="system"&&e.system){if(e.visitingMoon&&e.orbiting){const u=Ve(e,e.orbiting);t.push(n.jsxs("button",{onClick:()=>a.goUp(),className:"shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors",children:[n.jsxs("div",{className:"text-xs leading-tight text-emerald-300",children:[n.jsx("span",{className:"hidden sm:inline",children:m("Back to %@",u)}),n.jsxs("span",{className:"sm:hidden",children:["‹ ",u]})]}),n.jsxs("div",{className:"text-[10px] text-gray-500 leading-tight",children:[n.jsx("span",{className:"hidden sm:inline",children:m("planet · Esc")}),n.jsx("span",{className:"sm:hidden",children:m("back to the planet")})]})]},"back"))}e.moons.filter(u=>u.name!==e.visitingMoon?.name).forEach(u=>t.push(n.jsx(Ct,{onClick:()=>a.focusMoon(u.name),title:Je(u.name),sub:m("%@ moon · %@ km",O(u.type),X(Math.round(u.radiusKm*2))),accent:"text-violet-200"},`m${u.name}`))),e.system.planets.filter(u=>u.index!==e.orbiting?.index).forEach(u=>t.push(n.jsx(Ct,{onClick:()=>a.focusPlanet(u.index),title:e.owners.planetName(u,s),sub:`${O(u.planet_type)} · ${ae(u.orbital_radius,1)} AU`,accent:"text-emerald-200"},`p${u.index}`)))}else e.mode==="galaxy"&&!e.mapView&&e.nearby.forEach(u=>t.push(n.jsx(Ct,{onClick:()=>a.selectSystem(u.index),title:u.name,sub:`${u.distance} · ${u.starType}`,accent:"text-sky-200"},`n${u.index}`)));e.mode==="galaxy"&&e.ship&&(e.mapView||e.target?.kind!=="system"||e.target.index!==e.ship.system)&&t.unshift(n.jsx(Ct,{onClick:()=>a.returnToShip(),title:m("Return to ship"),sub:`${Li(e)??m("your system")} · H`,accent:"text-emerald-300"},"home"));const[i,r]=y.useState(()=>yc(Ga)),o=u=>{r(u),wc(Ga,u)},l=e.target,c=l?l.kind==="system"?l.summary?e.owners.systemName(l.index,l.summary.name):m("System #%@",X(l.index)):l.kind==="planet"?e.owners.planetName(l.planet,s):l.kind==="moon"?Je(l.moon.name):l.kind==="star"?l.name:O(l.poi.name):null;return n.jsxs(me,{className:"relative w-[min(720px,calc(100vw-1.5rem))] px-3 pt-3 pb-2.5 pointer-events-auto",children:[n.jsx("button",{onClick:()=>o(!i),className:"absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-6 rounded-full bg-slate-900/90 border border-white/15 text-gray-300 hover:text-white hover:border-cyan-300/50 backdrop-blur-md transition-colors",title:i?m("Show the console"):m("Hide the console"),"aria-expanded":!i,children:n.jsx("svg",{width:14,height:14,viewBox:"0 0 24 24",className:`transition-transform duration-300 ${i?"rotate-180":""}`,children:n.jsx("path",{fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",d:"M6 9l6 6 6-6"})})}),n.jsxs("div",{className:"flex items-center justify-between gap-3 cursor-pointer sm:cursor-default",onClick:()=>i&&o(!1),children:[e.travel?n.jsxs("div",{className:"flex-1 min-w-0",children:[n.jsxs("div",{className:"text-[11px] text-cyan-200 tracking-wide truncate",children:[e.travel.label,"…"]}),n.jsx("div",{className:"h-0.5 mt-1 bg-white/10 rounded overflow-hidden",children:n.jsx("div",{className:"h-full bg-cyan-300 transition-[width] duration-200",style:{width:`${Math.round(e.travel.progress*100)}%`}})})]}):i&&c?n.jsxs("div",{className:"text-[11px] font-mono truncate",children:[n.jsx("span",{className:"text-cyan-300",children:m("Target ").trim()})," ",n.jsx("span",{className:"text-gray-200",children:c})," ",n.jsx("span",{className:"text-gray-500",children:m(" · tap to open")})]}):n.jsx("div",{className:"text-[11px] font-mono text-gray-300 truncate",children:e.readout.primary}),n.jsx("div",{className:"text-[11px] font-mono text-gray-500 shrink-0 hidden sm:block",children:e.readout.secondary})]}),n.jsx("div",{className:`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${i?"grid-rows-[0fr] opacity-0":"grid-rows-[1fr] opacity-100"}`,children:n.jsxs("div",{className:"overflow-hidden min-h-0",children:[n.jsx("div",{className:"border-t border-white/10 pt-2 mt-2",children:n.jsx(gc,{explorer:a,state:e})}),t.length>0&&n.jsx("div",{className:"flex gap-1.5 mt-2 overflow-x-auto pb-0.5",children:t}),e.mode==="system"&&n.jsxs("div",{className:"flex items-center gap-1 mt-2 pt-2 border-t border-white/10 overflow-x-auto",children:[n.jsx("span",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mr-1",children:m("Time")}),uc.map(u=>n.jsx("button",{onClick:()=>a.setTimeScale(u.value),className:`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] ${e.timeScale===u.value?"bg-cyan-400/90 text-slate-950":"text-gray-300 hover:bg-white/10"}`,children:u.label},u.value)),n.jsx("span",{className:"ml-auto pl-2 shrink-0 text-[11px] font-mono text-gray-500 hidden sm:inline",children:new Date(e.cosmicTime*1e3).toISOString().slice(0,16).replace("T"," ")}),n.jsx(vc,{drift:e.timeDrift,onReset:()=>a.resetTime()})]})]})})]})}const Ga="atlas-console-collapsed";function yc(a){try{return localStorage.getItem(a)==="1"}catch{return!1}}function wc(a,e){try{localStorage.setItem(a,e?"1":"0")}catch{}}const bc=31557600,Ft=63241.077,Fi=94607e8,ss=["","k","M","B","T","Q"];function Ie(a){if(!Number.isFinite(a)||a<=0)return ae(0,2);let e=0;for(;a>=999.5&&e<ss.length-1;)a/=1e3,e++;return a>=999.5?a.toExponential(1).replace("e+","e")+ss[e]:(a>=99.95?ae(a,0):a>=9.995?ae(a,1):ae(a,2))+ss[e]}function Sc(a){const e=a*3600;return e>=1?{value:Ie(e),unit:"ly/h"}:e*Ft>=1?{value:Ie(e*Ft),unit:"AU/h"}:{value:Ie(a*Fi),unit:"km/s"}}function Mc(a){return a>=.01?{value:Ie(a),unit:"ly"}:a*Ft>=.01?{value:Ie(a*Ft),unit:"AU"}:{value:Ie(a*Fi),unit:"km"}}function as({label:a,primary:e=!1,valueRef:t,unitRef:s,trendRef:i}){return n.jsxs("div",{className:"w-[6.4rem] sm:w-36 text-center whitespace-nowrap",children:[n.jsx("div",{className:"text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-cyan-300/70 truncate",children:a}),n.jsxs("div",{className:`relative tabular-nums leading-tight ${e?"text-lg sm:text-2xl text-white":"text-base sm:text-lg text-cyan-100"}`,children:[i&&n.jsx("span",{ref:i,className:"absolute -left-1 sm:left-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs transition-[opacity,color] duration-300 opacity-0"}),n.jsx("span",{ref:t}),n.jsx("span",{ref:s,className:"text-[10px] sm:text-xs text-cyan-200/80 ml-1"})]})]})}function kc({travel:a}){const e=y.useRef({speed:a.speed??0,remaining:a.remaining});e.current={speed:a.speed??0,remaining:a.remaining};const t={speed:y.useRef(null),speedUnit:y.useRef(null),trend:y.useRef(null),c:y.useRef(null),cUnit:y.useRef(null),remaining:y.useRef(null),remainingUnit:y.useRef(null)};return y.useEffect(()=>{let i=Math.log(Math.max(e.current.speed,1e-15)),r=Math.log(Math.max(e.current.remaining??1e-15,1e-15)),o=0,l=performance.now();const c=l+500;let u=0;const d=(p,g)=>{p.current&&p.current.textContent!==g&&(p.current.textContent=g)},h=p=>{u=requestAnimationFrame(h);const g=Math.min(.1,(p-l)/1e3);l=p;const f=1-Math.exp(-g*6),b=(Math.log(Math.max(e.current.speed,1e-15))-i)*f;i+=b,e.current.remaining!==void 0&&(r+=(Math.log(Math.max(e.current.remaining,1e-15))-r)*f),o+=((g>0?b/g:0)-o)*Math.min(1,g*4);const x=Math.exp(i),S=Sc(x);d(t.speed,S.value),d(t.speedUnit,S.unit);const N=x*bc;if(d(t.c,N>=1?`${Ie(N)}×`:ae(N,2)),d(t.cUnit,"c"),e.current.remaining!==void 0){const R=Mc(Math.exp(r));d(t.remaining,R.value),d(t.remainingUnit,R.unit)}else d(t.remaining,"—"),d(t.remainingUnit,"");const T=t.trend.current;if(T){const R=p<c?0:Math.min(1,Math.abs(o)/1.5);T.textContent=o>=0?"▲":"▼",T.style.color=o>=0?"rgb(103,232,249)":"rgb(252,211,77)",T.style.opacity=String(R<.08?0:.35+.65*R)}};return u=requestAnimationFrame(h),()=>cancelAnimationFrame(u)},[]),n.jsxs("div",{className:"relative px-3 sm:px-6 py-2.5 sm:py-3.5 animate-[fadeIn_0.4s_ease-out] font-mono select-none",children:[n.jsx("span",{className:"absolute left-0 top-0 w-3 h-3 border-l border-t border-cyan-300/60"}),n.jsx("span",{className:"absolute right-0 top-0 w-3 h-3 border-r border-t border-cyan-300/60"}),n.jsx("span",{className:"absolute left-0 bottom-0 w-3 h-3 border-l border-b border-cyan-300/60"}),n.jsx("span",{className:"absolute right-0 bottom-0 w-3 h-3 border-r border-b border-cyan-300/60"}),n.jsxs("div",{className:"flex items-end justify-center drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]",children:[n.jsx(as,{label:m("Velocity"),primary:!0,valueRef:t.speed,unitRef:t.speedUnit,trendRef:t.trend}),n.jsx(as,{label:m("Light speed"),valueRef:t.c,unitRef:t.cUnit}),n.jsx(as,{label:m("Remaining"),valueRef:t.remaining,unitRef:t.remainingUnit})]})]})}function qa({explorer:a,state:e,onPick:t}){const[s,i]=y.useState(null),[r,o]=y.useState(""),l=()=>{const c=parseInt(r.replace(/[^0-9]/g,""),10);Number.isFinite(c)&&e.galaxy&&c<e.galaxy.num_systems&&(a.selectSystem(c),t?.())};return n.jsxs(me,{className:"w-64 max-w-full max-h-[calc(100dvh-15rem)] overflow-y-auto overscroll-contain p-3 pointer-events-auto",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5",children:m("Find a system")}),n.jsxs("div",{className:"flex gap-1.5 mb-3",children:[n.jsx("input",{value:r,onChange:c=>o(c.target.value),onKeyDown:c=>c.key==="Enter"&&l(),placeholder:e.galaxy?`# 0 – ${X(e.galaxy.num_systems-1)}`:"#",className:"flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400/60"}),n.jsx(H,{onClick:l,children:m("Find")})]}),n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:m("Landmarks")}),hc.map(c=>{const u=e.pois.filter(h=>c.kinds.includes(h.kind));if(u.length===0)return null;const d=s===c.title;return n.jsxs("div",{children:[n.jsxs("button",{onClick:()=>i(d?null:c.title),className:"w-full flex justify-between items-center py-1 text-xs hover:text-white",children:[n.jsx("span",{className:c.accent,children:m(c.title)}),n.jsxs("span",{className:"text-gray-500",children:[u.length," ",d?"▾":"▸"]})]}),d&&n.jsx("div",{className:"pl-2 pb-1 space-y-0.5",children:u.slice(0,80).map(h=>n.jsx("button",{onClick:()=>(a.flyToPoi(h),t?.()),className:"block w-full text-left text-[11px] font-mono px-1.5 py-1 sm:py-0.5 rounded hover:bg-white/10 text-gray-400",children:O(h.name)},h.id))})]},c.title)}),n.jsxs("div",{className:"mt-3 pt-2 border-t border-white/10 space-y-1 text-[11px] text-gray-400",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:m("Legend")}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-400"})," ",m("Your ship")]}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"w-2 h-2 rotate-45 border border-amber-300/80"})," ",m("Galactic core")]}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"w-3 h-3 rounded-full border border-dashed border-violet-300/70"})," ",m("Star cluster")]}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"w-3 h-3 rounded-full border-2 border-fuchsia-300/80"})," ",m("Black hole · pulsar")]}),n.jsxs("div",{className:"flex items-center gap-2",children:[n.jsx("span",{className:"w-3 h-3 rounded-full border border-dashed border-sky-200/60"})," ",m("Neighbour galaxy (zoom out)")]})]})]})}function jc({explorer:a,state:e,onClose:t}){const[s,i]=y.useState(()=>(e.coordinates??ds).map(String)),r=y.useMemo(()=>Ni(),[]),o=s.every(c=>/^\d+$/.test(c)&&parseInt(c,10)<=1e7),l=(c,u=null)=>{t(),a.hyperjump(c,u)};return n.jsx(Wt,{onClose:t,children:n.jsx(me,{className:"p-5 w-[min(420px,calc(100vw-2rem))]",children:n.jsxs("div",{children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.25em] text-cyan-300/80",children:m("Hyperjump computer")}),n.jsx("div",{className:"text-lg font-semibold text-white mb-3",children:m("Where to?")}),n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:m("Galaxy coordinates (0 – %@)",X(1e7))}),n.jsx("div",{className:"flex gap-1.5",children:["x","y","z"].map((c,u)=>n.jsx("input",{value:s[u],autoFocus:u===0,onChange:d=>i(h=>h.map((p,g)=>g===u?d.target.value.replace(/[^0-9]/g,""):p)),onKeyDown:d=>d.key==="Enter"&&o&&l(s.map(h=>parseInt(h,10))),className:"w-full min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400/60",placeholder:c},c))}),n.jsxs("div",{className:"flex gap-2 mt-3",children:[n.jsxs(H,{tone:"primary",className:"flex-1",disabled:!o,onClick:()=>l(s.map(c=>parseInt(c,10))),children:[m("Jump"),n.jsx(we,{children:"⏎"})]}),n.jsx(H,{className:"flex-1",onClick:async()=>{const c=await Si();l(c.coordinates,c.system)},children:m("Somewhere random")})]}),r.length>0&&n.jsxs("div",{className:"mt-4",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:m("Recently visited")}),n.jsx("div",{className:"space-y-0.5",children:r.map(c=>n.jsxs("button",{onClick:()=>l(c.coordinates),className:"w-full flex justify-between gap-3 text-xs px-2 py-1 rounded hover:bg-white/10",children:[n.jsx("span",{className:"text-gray-200 truncate",children:Je(c.name)}),n.jsxs("span",{className:"text-gray-500 font-mono shrink-0",children:[O(c.type)," · ",c.coordinates.join(",")]})]},c.coordinates.join(",")))})]})]})})})}const Nc=[{key:"shipView",label:"Ship view",description:"Chase camera behind your saucer"},{key:"universeGrid",label:"Universe grid",description:"The cube cells around this galaxy and its 26 neighbours"},{key:"flightHud",label:"Flight HUD",description:"Speed, light speed and distance left while travelling"},{key:"soundEffects",label:"Sound effects",description:"Quiet ship sounds for flights, jumps and selections"}],Va=({label:a,description:e,checked:t,onChange:s})=>n.jsxs("button",{role:"switch","aria-checked":t,onClick:()=>s(!t),className:"w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-colors",children:[n.jsxs("span",{className:"min-w-0",children:[n.jsx("span",{className:`block text-sm ${t?"text-cyan-200":"text-gray-200"}`,children:a}),n.jsx("span",{className:"block text-[10px] text-gray-500",children:e})]}),n.jsx("span",{className:`shrink-0 w-8 h-4 rounded-full relative transition-colors ${t?"bg-cyan-400/80":"bg-white/15"}`,children:n.jsx("span",{className:`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${t?"left-[18px]":"left-0.5"}`})})]}),is={maxHeight:"calc(100dvh - 4.75rem)",maxWidth:"calc(100vw - 1.5rem)"},zi=Object.keys(Qe);function Ha({level:a,active:e,onClick:t}){const s=a?O(Qe[a].label):m("Auto"),i=a?zi.indexOf(a)+1:0;return n.jsxs("button",{onClick:t,"aria-pressed":e,"aria-label":a?m("%@ quality",s):m("Automatic quality"),title:a?m("%@ quality",s):m("Automatic quality"),className:`flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 min-h-[56px] rounded-[10px] border transition-colors ${e?"border-cyan-400/70 bg-cyan-400/[0.12] text-cyan-200":"border-white/10 bg-white/5 hover:bg-white/10 text-gray-300"}`,children:[n.jsx("span",{className:"h-4 flex items-end",children:a?n.jsx("span",{className:"flex items-end gap-[2px]",children:[0,1,2,3].map(r=>n.jsx("span",{className:"w-[3px] rounded-[1px] bg-current",style:{height:5+r*3,opacity:r<i?1:.2}},r))}):n.jsx("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"currentColor","aria-hidden":"true",children:n.jsx("path",{d:"M10 2.5l1.6 4.9 4.9 1.6-4.9 1.6L10 15.5l-1.6-4.9L3.5 9l4.9-1.6zM18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9z"})})}),n.jsx("span",{className:`text-[10px] truncate max-w-full px-0.5 ${e?"text-cyan-200":"text-gray-400"}`,children:s})]})}function Cc({explorer:a,state:e,onClose:t}){const[s,i]=y.useState(()=>Ye()),r=u=>{a.setQuality(u)&&window.location.reload()},o=Qe[e.quality],l=o.fps?m("%lld fps",o.fps):m("uncapped"),c=m("%lldk stars",Math.round(o.maxStars/1e3));return n.jsxs(me,{className:"w-[19rem] max-w-full p-4 pointer-events-auto",children:[n.jsxs("div",{className:"flex justify-between items-center mb-3",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400",children:m("Graphics quality")}),n.jsx("button",{onClick:t,className:"text-gray-500 hover:text-white text-xs","aria-label":m("Close"),children:"✕"})]}),n.jsxs("div",{className:"flex gap-1.5",children:[n.jsx(Ha,{level:null,active:e.qualityAuto,onClick:()=>r(null)}),zi.map(u=>n.jsx(Ha,{level:u,active:!e.qualityAuto&&e.quality===u,onClick:()=>r(u)},u))]}),n.jsx("p",{className:"mt-2.5 text-[11px] text-gray-400 leading-snug",children:e.qualityAuto?`${m("%@, chosen for this device",O(o.label))} · ${l} · ${c}`:`${O(o.description)} · ${l} · ${c}`}),n.jsxs("div",{className:"mt-3 text-[11px] text-gray-500 flex justify-between",children:[n.jsx("span",{children:m("Rendering at")}),n.jsx("span",{className:"font-mono text-gray-300",children:m("%lld fps",e.fps)})]}),n.jsx("p",{className:"mt-1 text-[10px] text-gray-600",children:m("When nothing moves the frame rate drops on its own to save battery.")}),n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2",children:m("View")}),n.jsx("div",{className:"space-y-1",children:Nc.map(({key:u,label:d,description:h})=>n.jsx(Va,{label:m(d),description:m(h),checked:e.view[u],onChange:p=>a.setViewOption(u,p)},u))}),n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2",children:m("Accessibility")}),n.jsx(Va,{label:m("Reduced flashing"),description:m("No white flashes in jumps and crossings, gentler hyperspace. For photosensitive pilots"),checked:s,onChange:u=>{wn(u),i(u)}}),n.jsx(Ei,{className:"mt-4 pt-3 border-t border-white/10"})]})}function Tc({onClose:a}){const e=[[m("Drag"),m("Look around")],[m("Scroll / pinch"),m("Zoom across scales")],[m("Right drag / Shift"),m("Pan")],["W S · ↑ ↓",m("Thrust forward / back")],["A D · ← →",m("Turn")],["Q E · R F",m("Slide sideways · up / down")],[m("Click"),m("Target a star or planet")],[m("Double-click · ⏎"),m("Engage: travel / go into orbit")],["Esc",m("Back out one level")],["M",m("Galaxy map")],["H",m("Return to your ship")],["J",m("Hyperjump to another galaxy")],["P",m("Take a photo, with a QR code to this place")]];return n.jsx(Wt,{onClose:a,children:n.jsxs(me,{className:"p-6 max-w-md",children:[n.jsx("div",{className:"text-lg font-semibold text-white mb-1",children:m("Welcome aboard")}),n.jsx("p",{className:"text-sm text-gray-400 mb-4",children:m("Your ship is docked at a star. Every point of light out there is a real star system you can travel to: pick a target, engage, and go into orbit around its planets.")}),n.jsx("div",{className:"grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs",children:e.map(([t,s])=>n.jsxs(Ya.Fragment,{children:[n.jsx("span",{className:"text-gray-500",children:t}),n.jsx("span",{children:s})]},t))}),n.jsx("div",{className:"mt-5 text-right",children:n.jsx(H,{tone:"primary",onClick:a,children:m("Let's go")})})]})})}function Ac({universe:a,onOpen:e,onCross:t}){return a?.remote?n.jsxs("div",{className:"flex items-center rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 text-xs overflow-hidden",title:m("Exploring a remote universe from node %@",a.node_id),children:[n.jsxs("button",{onClick:e,className:"flex items-center gap-1.5 px-3 py-1.5 text-fuchsia-100 hover:bg-fuchsia-500/20",children:[n.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse"}),m("Remote")," · ",n.jsx("span",{className:"max-w-[9rem] truncate",children:a.seed_str||a.seed_name||m("unknown seed")})]}),n.jsx("button",{onClick:()=>t({url:"/multiverse/exit",name:m("your universe"),home:!0}),className:"px-2.5 py-1.5 border-l border-fuchsia-400/30 text-fuchsia-200/80 hover:bg-fuchsia-500/20 hover:text-white",title:m("Back to your own universe"),children:m("Exit")})]}):n.jsxs("button",{onClick:e,className:"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10 transition-colors",title:m("Universes discovered through the P2P network"),children:[n.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse"}),m("Multiverse")]})}const We=({size:a=16,width:e=1.6,className:t="",children:s})=>n.jsx("svg",{width:a,height:a,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:e,strokeLinecap:"round",strokeLinejoin:"round",className:t,"aria-hidden":"true",children:s}),Di=({size:a=14,className:e="text-cyan-300"})=>n.jsxs(We,{size:a,className:e,children:[n.jsx("path",{d:"M14 12a6 6 0 1 1-6-6"}),n.jsx("path",{d:"M10 12a6 6 0 1 1 6 6",opacity:.55})]}),ps=({size:a=16})=>n.jsxs(We,{size:a,children:[n.jsx("path",{d:"M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"}),n.jsx("circle",{cx:12,cy:13,r:3.4})]}),Wi=({size:a=15})=>n.jsxs(We,{size:a,width:1.7,children:[n.jsx("path",{d:"M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"}),n.jsx("path",{d:"M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"})]}),Oi=({size:a=16})=>n.jsxs(We,{size:a,children:[n.jsx("rect",{x:2.5,y:6,width:19,height:12,rx:2}),n.jsx("path",{d:"M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M18 9.5h.01M6 12.2h.01M9 12.2h.01M12 12.2h.01M15 12.2h.01M18 12.2h.01M8 15h8"})]}),Gi=({size:a=15,className:e=""})=>n.jsxs(We,{size:a,width:1.7,className:e,children:[n.jsx("circle",{cx:12,cy:12,r:9.5}),n.jsx("path",{d:"M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 4"}),n.jsx("path",{d:"M12 17.3v.2"})]}),qi=({size:a=14})=>n.jsxs(We,{size:a,width:1.7,children:[n.jsx("path",{d:"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"}),n.jsx("circle",{cx:12,cy:10,r:2.3})]}),Rc=({size:a=15})=>n.jsx(We,{size:a,children:n.jsx("path",{d:"M2.5 13.5h7.5l-2 5.5 13.5-8.5h-7.5l2-5.5z"})}),Vi=({on:a,size:e=15,tone:t=!0,children:s})=>n.jsxs("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",className:t?a?"text-cyan-300":"text-gray-500":"","aria-hidden":"true",children:[s,!a&&n.jsx("path",{d:"M4 4l16 16"})]}),Hi=({on:a,size:e,tone:t})=>n.jsxs(Vi,{on:a,size:e,tone:t,children:[n.jsx("path",{d:"M9 18V5l11-2v13"}),n.jsx("circle",{cx:6,cy:18,r:3}),n.jsx("circle",{cx:17,cy:16,r:3})]}),Bi=({on:a,size:e,tone:t})=>n.jsxs(Vi,{on:a,size:e,tone:t,children:[n.jsx("path",{d:"M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"}),a&&n.jsx("path",{d:"M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"})]}),Ba=({children:a})=>n.jsx("div",{className:"px-4 pt-2.5 pb-1 text-[10px] uppercase tracking-[0.2em] text-gray-500",children:a}),Ne=({onClick:a,label:e,hint:t,icon:s,accent:i="text-gray-100"})=>n.jsxs("button",{onClick:a,className:"w-full flex items-center gap-3 px-4 min-h-[42px] text-left text-sm hover:bg-white/10 active:bg-white/15 transition-colors",children:[n.jsx("span",{className:"w-5 shrink-0 flex justify-center text-gray-400",children:s}),n.jsx("span",{className:`flex-1 min-w-0 truncate ${i}`,children:e}),t&&n.jsx("span",{className:"text-[11px] text-gray-500 truncate max-w-[45%]",children:t})]}),st=({onClick:a,label:e,icon:t,accent:s="text-gray-200"})=>n.jsxs("button",{onClick:a,"aria-label":e,className:"flex-1 min-w-0 flex flex-col items-center justify-center gap-1.5 min-h-[58px] rounded-[10px] bg-white/5 border border-white/[0.08] hover:bg-white/10 active:bg-white/15 transition-colors",children:[n.jsx("span",{className:`h-[18px] flex items-center ${s}`,children:t}),n.jsx("span",{className:"text-[10px] text-gray-400 truncate max-w-full px-0.5",children:e})]});function Pc({universe:a,musicMuted:e,soundEffects:t,ship:s,appPublished:i,onOpen:r,actions:o}){const[l,c]=y.useState(!1),u=y.useRef(null);y.useEffect(()=>{if(!l)return;const h=p=>{u.current?.contains(p.target)||c(!1)};return document.addEventListener("pointerdown",h,!0),()=>document.removeEventListener("pointerdown",h,!0)},[l]);const d=(h,p=!0)=>()=>{p&&c(!1),h()};return n.jsxs("div",{ref:u,className:"lg:hidden relative pointer-events-auto shrink-0",children:[n.jsxs("button",{onClick:()=>{l||r(),c(!l)},className:"relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-950/70 border border-white/15 backdrop-blur-md","aria-label":m("Menu"),"aria-expanded":l,children:[[-6,0,6].map((h,p)=>n.jsx("span",{className:"absolute left-1/2 top-1/2 w-5 h-0.5 -ml-2.5 -mt-px rounded bg-gray-100 transition-all duration-300",style:{transform:l?p===1?"scaleX(0)":`rotate(${p===0?45:-45}deg)`:`translateY(${h}px)`,opacity:l&&p===1?0:1}},p)),a?.remote&&!l&&n.jsx("span",{className:"absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 border border-black"})]}),n.jsx("div",{className:`absolute right-0 top-12 w-[min(19rem,calc(100vw-1.5rem))] origin-top-right transition-all duration-200 ${l?"opacity-100 scale-100":"opacity-0 scale-95 pointer-events-none"}`,children:n.jsxs(me,{className:"py-1.5 max-h-[calc(100dvh-4.5rem)] overflow-y-auto overscroll-contain",children:[a?.remote?n.jsxs(n.Fragment,{children:[n.jsx(Ne,{onClick:d(o.multiverse),label:m("Multiverse"),hint:`${m("Remote")} · ${a.seed_str||a.seed_name}`,accent:"text-fuchsia-200",icon:n.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse"})}),n.jsx(Ne,{onClick:d(o.exitRemote),label:m("Return to your universe"),accent:"text-fuchsia-200",icon:n.jsx("span",{className:"text-fuchsia-300 text-sm leading-none",children:"‹"})})]}):n.jsx(Ne,{onClick:d(o.multiverse),label:m("Multiverse"),hint:m("P2P universes"),icon:n.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]"})}),n.jsx(Ba,{children:m("Explore")}),n.jsx(Ne,{onClick:d(o.stargate),label:"Stargate",hint:m("Links & saved places"),icon:n.jsx(Di,{size:16})}),n.jsx(Ne,{onClick:d(o.map),label:m("Galaxy map"),hint:m("Navigate"),icon:n.jsx(qi,{size:16})}),n.jsx(Ne,{onClick:d(o.hyperjump),label:m("Hyperjump"),hint:m("Another galaxy"),icon:n.jsx(Rc,{size:16})}),n.jsx(Ba,{children:m("Ship & settings")}),n.jsxs("div",{className:"flex gap-1.5 px-2 py-1",children:[n.jsx(st,{onClick:d(o.photo),label:m("Photo"),icon:n.jsx(ps,{size:18})}),n.jsx(st,{onClick:d(o.ship),label:m("Hangar"),icon:n.jsx(Rs,{kind:s,size:18}),accent:"text-cyan-200"}),n.jsx(st,{onClick:d(o.music,!1),label:e?m("Music off"):m("Music"),icon:n.jsx(Hi,{on:!e,size:18,tone:!1}),accent:e?"text-gray-500":"text-cyan-200"}),n.jsx(st,{onClick:d(o.sounds,!1),label:t?m("Sounds"):m("Sounds off"),icon:n.jsx(Bi,{on:t,size:18,tone:!1}),accent:t?"text-cyan-200":"text-gray-500"}),n.jsx(st,{onClick:d(o.settings),label:m("Graphics"),icon:n.jsx(Wi,{size:18})})]}),n.jsx(Ne,{onClick:d(o.help),label:m("Controls"),icon:n.jsx(Oi,{size:16})}),n.jsx(Ne,{onClick:d(o.faq),label:m("F.A.Q."),icon:n.jsx(Gi,{size:16})}),n.jsx(Ei,{className:"px-4 min-h-[42px]"}),n.jsx("div",{className:"my-1.5 border-t border-white/10"}),n.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[n.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"opacity-70 hover:opacity-100",children:n.jsx("img",{src:"https://www.banshee.pro/images/banshee-logo.png",alt:"Banshee",className:"h-3.5 w-auto max-w-[100px] object-contain"})}),n.jsx("a",{href:"https://x.com/surcebeats",target:"_blank",rel:"noopener noreferrer",className:"text-xs text-gray-400 hover:text-white",children:"@SurceBeats"})]}),i&&n.jsx("div",{className:"px-3 pt-0.5 pb-2",children:n.jsx(Ic,{})})]})})]})}const _c=[{kind:"saucer",name:"Saucer",description:"A disc with a ventral drive ring. Steady and smooth"},{kind:"interceptor",name:"Interceptor",description:"A delta wing with twin engines. Banks hard into every turn"}],Rs=({kind:a,size:e=18,className:t=""})=>n.jsx("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinejoin:"round",strokeLinecap:"round",className:t,"aria-hidden":"true",children:a==="saucer"?n.jsxs(n.Fragment,{children:[n.jsx("ellipse",{cx:12,cy:13,rx:10,ry:2.6}),n.jsx("path",{d:"M8 11.2c.6-2.4 2.1-3.6 4-3.6s3.4 1.2 4 3.6"}),n.jsx("path",{d:"M10 15.6l-.8 1.8M14 15.6l.8 1.8"})]}):n.jsxs(n.Fragment,{children:[n.jsx("path",{d:"M12 2.5l1.6 6.3 8 8.2v1.6l-6.6-1.4-.6 2.6h-4.8l-.6-2.6L2.4 18.6V17l8-8.2z"}),n.jsx("path",{d:"M11 9.5h2v4.5h-2z"})]})});function Ec({current:a,onChoose:e,onClose:t}){return n.jsxs(me,{className:"w-72 max-w-full p-4 pointer-events-auto",children:[n.jsxs("div",{className:"flex justify-between items-center mb-3",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400",children:m("Hangar")}),n.jsx("button",{onClick:t,className:"text-gray-500 hover:text-white text-xs","aria-label":m("Close"),children:"✕"})]}),n.jsx("div",{className:"space-y-1.5",children:_c.map(s=>{const i=s.kind===a;return n.jsxs("button",{onClick:()=>e(s.kind),className:`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition-colors ${i?"border-cyan-400/70 bg-cyan-400/10":"border-white/10 bg-white/5 hover:bg-white/10"}`,children:[n.jsx("span",{className:`shrink-0 w-11 h-11 rounded-md flex items-center justify-center bg-black/40 border border-white/10 ${i?"text-cyan-200":"text-gray-300"}`,children:n.jsx(Rs,{kind:s.kind,size:30})}),n.jsxs("span",{className:"min-w-0",children:[n.jsx("span",{className:`block text-sm ${i?"text-cyan-200":"text-gray-200"}`,children:m(s.name)}),n.jsx("span",{className:"block text-[10px] text-gray-500 leading-snug",children:m(s.description)})]})]},s.kind)})}),n.jsx("p",{className:"mt-3 text-[10px] text-gray-600",children:m("Seen from the chase camera when Ship view is on.")})]})}const $i="6823729371",Ui=`https://apps.apple.com/app/id${$i}`,ns="atlas-app-published";function Lc(){const[a,e]=y.useState(()=>{try{return sessionStorage.getItem(ns)==="1"}catch{return!1}});return y.useEffect(()=>{try{if(sessionStorage.getItem(ns)!==null)return}catch{}let t=!0;return fetch(`https://itunes.apple.com/lookup?id=${$i}`,{credentials:"omit"}).then(s=>s.json()).then(s=>{const i=(s?.resultCount??0)>0;try{sessionStorage.setItem(ns,i?"1":"0")}catch{}t&&e(i)}).catch(()=>{}),()=>{t=!1}},[]),a}const Yi=({size:a})=>n.jsx("svg",{width:a,height:a,viewBox:"0 0 24 24",className:"text-black -mt-px shrink-0","aria-hidden":"true",children:n.jsx("path",{fill:"currentColor",d:"M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"})});function Ic(){return n.jsxs("a",{href:Ui,target:"_blank",rel:"noopener noreferrer",className:"w-full flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white hover:bg-gray-200 active:bg-gray-300 transition-colors",children:[n.jsx(Yi,{size:22}),n.jsxs("span",{className:"min-w-0 text-left leading-tight",children:[n.jsx("span",{className:"block text-[9px] uppercase tracking-[0.15em] text-gray-600 truncate",children:m("Download on the App Store")}),n.jsx("span",{className:"block text-sm font-medium text-black whitespace-nowrap",children:"iPhone · iPad · Mac"})]}),n.jsx("span",{className:"ml-auto text-gray-500 text-sm",children:"›"})]})}const Tt="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/60 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-colors";function Fc({onFaq:a,musicMuted:e,onToggleMusic:t,sfxOn:s,onToggleSfx:i,appPublished:r}){return n.jsxs(n.Fragment,{children:[n.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"hidden lg:flex absolute bottom-3 left-3 items-center gap-2 px-2 py-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/5 transition-opacity pointer-events-auto",title:"Banshee Technologies",children:n.jsx("img",{src:"https://www.banshee.pro/images/banshee-logo.png",alt:"Banshee",className:"h-3.5 w-auto max-w-[110px] object-contain",draggable:!1})}),n.jsxs("div",{className:"hidden lg:flex absolute bottom-3 right-3 items-center gap-1.5 pointer-events-auto",children:[n.jsx("button",{onClick:t,className:Tt,title:e?m("Play the soundtrack"):m("Mute the soundtrack"),"aria-label":e?m("Play the soundtrack"):m("Mute the soundtrack"),"aria-pressed":!e,children:n.jsx(Hi,{on:!e})}),n.jsx("button",{onClick:i,className:Tt,title:s?m("Mute the sound effects"):m("Turn the sound effects on"),"aria-label":s?m("Mute the sound effects"):m("Turn the sound effects on"),"aria-pressed":s,children:n.jsx(Bi,{on:s})}),n.jsx("button",{onClick:a,className:Tt,title:m("The Atlas F.A.Q."),"aria-label":m("The Atlas F.A.Q."),children:n.jsx(Gi,{className:"text-gray-300"})}),n.jsx("a",{href:"https://x.com/surcebeats",target:"_blank",rel:"noopener noreferrer",className:Tt,title:m("%@ on X","@SurceBeats"),"aria-label":m("%@ on X","@SurceBeats"),children:n.jsx("svg",{width:13,height:13,viewBox:"0 0 24 24",className:"text-gray-300",children:n.jsx("path",{fill:"currentColor",d:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"})})}),r&&n.jsx("a",{href:Ui,target:"_blank",rel:"noopener noreferrer",className:"w-8 h-8 flex items-center justify-center rounded-lg bg-white hover:bg-gray-200 transition-colors",title:`${m("Download on the App Store")} · iPhone · iPad · Mac`,"aria-label":`${m("Download on the App Store")} · iPhone · iPad · Mac`,children:n.jsx(Yi,{size:15})})]})]})}function $a(a,e,t){const s=y.useRef(t);s.current=t,y.useEffect(()=>{if(!a)return;const i=r=>{e.some(o=>o.current?.contains(r.target))||s.current()};return document.addEventListener("pointerdown",i,!0),()=>document.removeEventListener("pointerdown",i,!0)},[a])}const zc=()=>{const a=y.useRef(null),[e,t]=y.useState(null),s=y.useRef(null),[i,r]=y.useState(null),o=y.useRef(()=>{});o.current=()=>{if(!e)return;const B=()=>s.current?.animate(Ye()?[{opacity:.12},{opacity:0}]:[{opacity:.55},{opacity:0}],{duration:Ye()?700:420,easing:"ease-out"});e.takePhoto(B).then(ne=>ne&&r(m("Photo saved"))).catch(()=>r(m("The photo could not be saved")))},y.useEffect(()=>{if(!i)return;const B=setTimeout(()=>r(null),2200);return()=>clearTimeout(B)},[i]);const l=y.useRef("");i&&(l.current=i);const[c,u]=y.useState(!1),[d,h]=y.useState(!1),[p,g]=y.useState(()=>window.location.hash==="#faq"),[f,v]=y.useState(!1),[b,x]=y.useState(!1),[S,N]=y.useState(!1),[T,R]=y.useState(null),[k,C]=y.useState(()=>window.location.hash==="#multiverse"),[E,j]=y.useState(null),_=y.useMemo(()=>ct(),[]),z=Lc(),A=y.useMemo(()=>new Wl(lc),[]),[L,V]=y.useState(A.muted),[F,q]=y.useState(!0),Q=y.useRef(null),[ie,ce]=y.useState(()=>{try{return localStorage.getItem("atlas-explore-help")!=="seen"}catch{return!0}}),Re=y.useRef(null),Oe=y.useRef(null),U=y.useRef(null),G=B=>{v(B==="stargate"),x(B==="hangar"),h(B==="settings")},he=(B,ne)=>G(ne?null:B);$a(f||b||d,[Oe,Re],()=>G(null)),$a(S,[U],()=>N(!1)),y.useEffect(()=>{if(!a.current)return;const B=new rl(a.current,jr());t(B),window.atlasExplorer=B;const ne=(async()=>{const oe=dc();if(oe)return{...oe,plan:oe.via==="stargate"?{kind:"stargate",coordinates:oe.coordinates,system:oe.system,planet:oe.planet}:null};const ft=ol();if(ft)return{...ft,plan:null};const Vt=await tl();if(Vt)return{coordinates:Vt.coordinates,system:Vt.system,planet:null,plan:null};try{const gt=await Si();return{...gt,plan:{kind:"random",coordinates:gt.coordinates,system:gt.system,planet:gt.planet}}}catch{return{coordinates:ds,system:null,planet:null,plan:null}}})();return Q.current=()=>ne.then(oe=>{oe.plan&&R(oe.plan),B.loadGalaxy(oe.coordinates,{system:oe.system,planet:oe.planet})}),()=>B.dispose()},[]),y.useEffect(()=>(window.atlasMusic=A,()=>A.dispose()),[A]);const ke=()=>{A.start(),Y.attach(A.context),Y.dive(Rt)},je=()=>{e?.jumpIn(),Q.current?.(),Q.current=null,q(!1),ie&&(ce(!1),setTimeout(()=>ce(!0),7e3))};y.useEffect(()=>{const B=ne=>{const oe=ne.target?.tagName;oe==="INPUT"||oe==="TEXTAREA"||oe==="SELECT"||((ne.key==="j"||ne.key==="J")&&u(!0),ne.key==="?"&&ce(ft=>!ft),(ne.key==="p"||ne.key==="P")&&!ne.metaKey&&!ne.ctrlKey&&!ne.altKey&&!ne.repeat&&o.current())};return window.addEventListener("keydown",B),()=>window.removeEventListener("keydown",B)},[]);const et=y.useMemo(()=>()=>null,[]),P=y.useSyncExternalStore(e?.subscribe??(()=>()=>{}),e?.getState??et);y.useEffect(()=>{const B=window.atlasPreloader;if(B){if(F)return B.done();P&&(P.mode!=="loading"||P.error?B.done():P.status&&B.step(P.status,P.galaxy?.75:.45))}},[F,P?.mode,P?.status,P?.error,!!P?.galaxy]),y.useEffect(()=>{P&&mc(P)},[P?.ship?.coordinates.join(","),P?.ship?.system,P?.ship?.planet]);const qt=B=>{E||(C(!1),ce(!1),G(null),R(null),j(B),e?.engageDrive(),setTimeout(()=>window.location.assign(B.url),2300))},Zi=()=>{ce(!1);try{localStorage.setItem("atlas-explore-help","seen")}catch{}},Ps=()=>{A.setMuted(!L),V(!L)};return n.jsxs("div",{className:"fixed inset-0 bg-black text-gray-200 overflow-hidden font-sans select-none",children:[n.jsx("div",{ref:a,className:"absolute inset-0"}),n.jsx("div",{ref:s,className:"absolute inset-0 z-[60] bg-white opacity-0 pointer-events-none"}),n.jsx(xe,{show:!!i,children:n.jsx("div",{className:"absolute top-20 inset-x-0 z-[60] flex justify-center pointer-events-none",children:n.jsxs("div",{className:"flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950/85 border border-cyan-300/30 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-100",children:[n.jsx("span",{className:"text-cyan-300",children:n.jsx(ps,{size:14})}),l.current]})})}),e&&P&&n.jsxs(n.Fragment,{children:[n.jsxs("div",{ref:Re,className:"absolute top-0 inset-x-0 z-[45] p-3 flex justify-between items-start gap-3 pointer-events-none bg-gradient-to-b from-black/70 to-transparent",children:[n.jsx(pc,{state:P,shipTitle:Li(P)}),n.jsx(Pc,{universe:_,musicMuted:L,soundEffects:P.view.soundEffects,ship:P.view.ship,appPublished:z,onOpen:()=>(G(null),N(!1)),actions:{multiverse:()=>C(!0),exitRemote:()=>qt({url:"/multiverse/exit",name:m("your universe"),home:!0}),stargate:()=>G("stargate"),ship:()=>G("hangar"),map:()=>e.openMap(),hyperjump:()=>u(!0),photo:()=>setTimeout(()=>o.current(),250),settings:()=>G("settings"),help:()=>ce(!0),faq:()=>g(!0),music:Ps,sounds:()=>e.setViewOption("soundEffects",!P.view.soundEffects)}}),n.jsxs("div",{className:"hidden lg:flex gap-2 pointer-events-auto shrink-0",children:[n.jsx(Ac,{universe:_,onOpen:()=>C(!0),onCross:qt}),n.jsxs(H,{onClick:()=>he("stargate",f),title:m("Stargate links and saved places"),className:"flex items-center gap-1.5",children:[n.jsx(Di,{}),"Stargate"]}),n.jsxs(H,{onClick:()=>e.openMap(),children:[m("Galaxy map"),n.jsx(we,{children:"M"})]}),n.jsxs(H,{onClick:()=>u(!0),children:[m("Hyperjump"),n.jsx(we,{children:"J"})]}),n.jsx(H,{onClick:()=>o.current(),title:m("Take a photo (P): PNG with a QR code to this place"),"aria-label":m("Take a photo"),className:"flex items-center !px-2.5",children:n.jsx(ps,{})}),n.jsx(H,{onClick:()=>he("hangar",b),title:m("Hangar: choose your ship"),"aria-label":m("Hangar: choose your ship"),className:"flex items-center !px-2",children:n.jsx(Rs,{kind:P.view.ship,size:17,className:"text-cyan-200"})}),n.jsx(H,{onClick:()=>he("settings",d),title:m("Graphics & view"),"aria-label":m("Graphics & view"),className:"flex items-center !px-2.5",children:n.jsx(Wi,{})}),n.jsx(H,{onClick:()=>ce(!0),title:m("Controls"),"aria-label":m("Controls"),className:"flex items-center !px-2.5",children:n.jsx(Oi,{})})]})]}),T&&n.jsx("div",{className:"absolute top-16 inset-x-0 flex justify-center pointer-events-none",children:n.jsx(rc,{plan:T,state:P,onDone:()=>R(null)})}),n.jsxs("div",{ref:Oe,children:[n.jsx(xe,{show:d,children:n.jsx(xt,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:is,children:n.jsx(Cc,{explorer:e,state:P,onClose:()=>h(!1)})})}),n.jsx(xe,{show:b,children:n.jsx(xt,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:is,children:n.jsx(Ec,{current:P.view.ship,onChoose:B=>e.setViewOption("ship",B),onClose:()=>x(!1)})})}),n.jsx(xe,{show:f,children:n.jsx(xt,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:is,children:n.jsx(ac,{explorer:e,state:P,universe:_,onClose:()=>v(!1)})})})]}),n.jsx(Fc,{onFaq:()=>g(!0),musicMuted:L,onToggleMusic:Ps,sfxOn:P.view.soundEffects,onToggleSfx:()=>e.setViewOption("soundEffects",!P.view.soundEffects),appPublished:z}),P.mapView&&!P.arrival&&P.pois.length>0&&n.jsx("div",{className:"absolute top-20 left-3 pointer-events-none hidden md:block",children:n.jsx(qa,{explorer:e,state:P})}),n.jsxs("div",{ref:U,children:[P.mapView&&!P.arrival&&P.pois.length>0&&n.jsx("div",{className:"md:hidden absolute top-16 left-3 z-30 pointer-events-auto animate-[fadeIn_0.3s_ease-out]",children:n.jsxs("button",{onClick:()=>N(B=>!B),"aria-expanded":S,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md transition-colors ${S?"bg-cyan-400/15 border-cyan-400/50 text-cyan-100":"bg-slate-950/70 border-white/15 text-gray-200"}`,children:[n.jsx(qi,{}),m("Landmarks"),n.jsx("span",{className:"text-gray-500",children:P.pois.length})]})}),n.jsx(xe,{show:S&&P.mapView&&!P.arrival,children:n.jsx(xt,{className:"md:hidden absolute top-[6.25rem] left-3 z-30",origin:"top left",style:{width:"min(18rem, calc(100vw - 1.5rem))"},children:n.jsx(qa,{explorer:e,state:P,onPick:()=>N(!1)})})})]}),P.mode!=="loading"&&n.jsx("div",{"data-ship-floor":!0,className:"absolute bottom-3 inset-x-0 flex justify-center pointer-events-none",children:n.jsx(xc,{explorer:e,state:P})}),P.view.flightHud&&P.travel&&P.travel.speed!==void 0&&!P.arrival&&!E&&n.jsx("div",{className:`absolute inset-x-0 flex justify-center pointer-events-none transition-[top] duration-500 ${T?"top-[150px]":"top-[14%]"}`,children:n.jsx(kc,{travel:P.travel})}),P.arrival&&n.jsx("div",{className:"absolute inset-x-0 top-[22%] flex justify-center pointer-events-none px-4",children:n.jsxs("div",{className:"text-center animate-[fadeIn_1.2s_ease-out]",children:[n.jsx("div",{className:"text-[11px] uppercase tracking-[0.5em] text-cyan-300/80 mb-2",children:m("ARRIVING AT")}),n.jsx("div",{className:"text-4xl sm:text-5xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]",children:P.arrival.name}),n.jsxs("div",{className:"text-sm text-gray-300 mt-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]",children:[Ii(P.arrival.type)," · ",m("%lld star systems",P.arrival.systems)]})]})}),P.status&&!P.error&&n.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none",children:n.jsxs("div",{className:"text-center",children:[n.jsx("div",{className:"w-10 h-10 mx-auto mb-3 rounded-full border-2 border-cyan-400/20 border-t-cyan-300 animate-spin"}),n.jsx("div",{className:"text-sm text-cyan-100/80 tracking-wide",children:P.status})]})}),P.error&&n.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:n.jsxs(me,{className:"p-5 max-w-sm text-center",children:[n.jsx("div",{className:"text-red-300 text-sm mb-3",children:P.error}),n.jsx(H,{onClick:()=>e.loadGalaxy(ds),children:m("Return to the center of the universe")})]})}),P.mode==="galaxy"&&P.galaxy?.num_systems===0&&!P.arrival&&n.jsx("div",{className:"absolute top-20 inset-x-0 px-3 flex justify-center pointer-events-none animate-[fadeIn_0.6s_ease-out]",children:n.jsxs(me,{className:"px-4 py-3 max-w-sm text-center pointer-events-auto",children:[n.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80 mb-1",children:O(P.galaxy.galaxy_type)}),n.jsx("div",{className:"text-xs text-gray-300 mb-2.5",children:m("Before time: no star system has formed yet. Only the primordial torus, everywhere at once.")}),n.jsx(H,{onClick:()=>u(!0),children:m("Hyperjump somewhere else")})]})}),n.jsx(xe,{show:c,children:n.jsx(jc,{explorer:e,state:P,onClose:()=>u(!1)})}),n.jsx(xe,{show:ie,children:n.jsx(Tc,{onClose:Zi})}),n.jsx(xe,{show:p,children:n.jsx(bl,{onClose:()=>g(!1)})}),n.jsx(xe,{show:k,children:n.jsx(Hl,{universe:_,onClose:()=>C(!1),onCross:qt})}),E&&n.jsx(Bl,{crossing:E})]}),n.jsx(Fl,{onIgnite:ke,onDive:je})]})},Dc=()=>{const a=document.getElementById("atlas-react-root");a&&Xi.createRoot(a).render(Ya.createElement(zc))},Wc=kn(),Ua=()=>Wc.then(Dc);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Ua):Ua();
