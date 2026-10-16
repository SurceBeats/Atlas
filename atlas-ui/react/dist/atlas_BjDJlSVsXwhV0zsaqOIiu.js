import{r as x,j as i,R as aa,c as Ua}from"./atlas_CTJpjF3PMF1pOPRUuT4Ak.js";import{W as ia,P as Ya}from"./atlas_D0CDU_zgRQ1L3XbOi9taH.js";import{cg as be,O as na,S as ve,bT as Za,aw as Xa,P as Ht,d as es,H as ts,au as B,V as y,m as F,aJ as ge,o as Me,cE as Ja,I as oa,cw as E,M as yt,cq as te,cF as Ka,cG as Ke,bE as Y,i as de,av as K,cx as Le,C as z,ar as ra,cH as la,cn as ne,cy as Bt,cz as $t,ci as Qa,ch as ie,g as ca,cu as wt,cI as ei,ct as ue,ad as Gt,cs as Ut,D as xe,cC as $e,cJ as ti,cK as bt,cL as si,cj as ha,bN as Yt,cA as Ue,bL as fe,cv as dt,cM as da,bA as ai,cN as Ae,j as ut,cO as ua,B as ii,c6 as Ye,cP as qe,cQ as ni,cR as oi,cS as ss,cT as as,cU as ma,cr as ri}from"./atlas_BUnHktt_WsVovWPX8BirI.js";import{M as li}from"./atlas_Di8m75MN2vsIXTZ4Klpqg.js";import{m as pa,R as ci}from"./atlas_Cccr0KAzEfyl8aCjYoyZ-.js";import{r as Ie,b as is,M as St,P as oe,u as hi,D as di,C as ui,a as mt,B as G,c as me,K as he,d as Qe,s as mi}from"./atlas_BbRd40iUzth6Y6eu-73hz.js";import{Q as pi}from"./atlas_qHpRbMMkCrnJ67xzvK1rX.js";import{c as He}from"./atlas_DrNuGgsmr8JJoyR3GdX9S.js";import{S as Nt,g as fi,A as fa,s as gi}from"./atlas_hCIrjtRx2THlGEr3_aDQ2.js";import"./atlas_BxTMsX-kgk6eYB29rUQmm.js";const ns=4,ga=1,os=.35,rs=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,vi=`
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
`,xi=`
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
`;class yi{renderer;camera;deepScene=new be;nearScene=new be;nearSceneVisible=!1;nearRange=[1e-4,1e5];planetPasses=[];shipPass=null;exposure=1;warp=0;jump={active:!1,charge:0,mouth:0,exit:0,flash:0};calm=!1;get screenCover(){return Math.hypot(this.camera.aspect/2,.5)*1.08}paused=!1;idle=!1;fps=0;quality;frames=0;fpsWindowStart=performance.now();hdrTarget;glowTarget;tonemapScene=new be;tonemapCamera=new na(-1,1,1,-1,0,1);tonemapMaterial;frameCopy=null;wormholeScene=new be;wormholeMaterial;callbacks=[];running=!1;lastTime=0;container;resizeObserver;constructor(e,t){this.container=e,this.quality=t,this.renderer=new ia({antialias:t.antialias,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,t.pixelRatioCap)),this.renderer.outputColorSpace=ve,this.renderer.toneMapping=Za,this.renderer.toneMappingExposure=1.2,this.renderer.shadowMap.enabled=t.shadows,this.renderer.shadowMap.type=Xa,this.renderer.autoClear=!1,this.renderer.domElement.style.display="block",this.renderer.domElement.style.touchAction="none",e.appendChild(this.renderer.domElement),this.camera=new Ht(60,1,1e-6,1e7),this.camera.position.set(0,0,0),this.hdrTarget=new es(1,1,{type:ts,depthBuffer:!1}),this.glowTarget=new es(1,1,{type:ts,depthBuffer:!1}),this.tonemapMaterial=new B({uniforms:{tHdr:{value:this.hdrTarget.texture},tGlow:{value:this.glowTarget.texture},uExposure:{value:1},uTime:{value:0},uWarp:{value:0},uAspect:{value:1},uLenses:{value:Array.from({length:ns},()=>new y(0,0,0))},uLensCount:{value:0}},vertexShader:rs,fragmentShader:vi,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.tonemapScene.add(new F(new ge(2,2),this.tonemapMaterial)),this.wormholeMaterial=new B({uniforms:{tFrame:{value:null},uTime:{value:0},uAspect:{value:1},uMouth:{value:0},uExit:{value:0},uCharge:{value:0},uFlash:{value:0},uCalm:{value:0}},vertexShader:rs,fragmentShader:xi,depthTest:!1,depthWrite:!1,toneMapped:!1}),this.wormholeScene.add(new F(new ge(2,2),this.wormholeMaterial)),this.resizeObserver=new ResizeObserver(()=>this.resize()),this.resizeObserver.observe(e),this.resize()}get pixelRatio(){return this.renderer.getPixelRatio()}applyQuality(e){this.quality=e,this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,e.pixelRatioCap)),this.resize()}setLenses(e){const t=this.tonemapMaterial.uniforms,s=Math.min(e.length,ns);for(let a=0;a<s;a++)t.uLenses.value[a].set(e[a].x,e[a].y,e[a].radius);t.uLensCount.value=s}get viewportHeight(){return this.container.clientHeight||1}onFrame(e){return this.callbacks.push(e),()=>{this.callbacks=this.callbacks.filter(t=>t!==e)}}resize(){const e=this.container.clientWidth||1,t=this.container.clientHeight||1;this.renderer.setSize(e,t,!1),this.renderer.domElement.style.width=`${e}px`,this.renderer.domElement.style.height=`${t}px`;const s=this.renderer.getPixelRatio()*this.quality.deepSkyScale;this.hdrTarget.setSize(Math.max(1,Math.floor(e*s)),Math.max(1,Math.floor(t*s))),this.glowTarget.setSize(Math.max(1,Math.floor(e*s*os)),Math.max(1,Math.floor(t*s*os))),this.camera.aspect=e/t,this.camera.updateProjectionMatrix()}start(){if(this.running)return;this.running=!0,this.lastTime=performance.now();const e=()=>{if(!this.running)return;requestAnimationFrame(e);const t=performance.now(),s=this.idle?this.quality.idleFps:this.quality.fps;if(s>0&&t-this.lastTime<1e3/s-2)return;const a=Math.min(.1,(t-this.lastTime)/1e3);if(this.lastTime=t,!this.paused){for(const o of this.callbacks)o(a,t/1e3);this.render(t/1e3),this.frames++,t-this.fpsWindowStart>=1e3&&(this.fps=Math.round(this.frames*1e3/(t-this.fpsWindowStart)),this.frames=0,this.fpsWindowStart=t)}};requestAnimationFrame(e)}render(e){const t=this.renderer,s=this.camera;s.updateMatrixWorld(),s.near=1e-7,s.far=1e8,s.updateProjectionMatrix(),t.setClearColor(0,1),s.layers.set(ga),t.setRenderTarget(this.glowTarget),t.clear(!0,!0,!0),t.render(this.deepScene,s),s.layers.set(0),t.setRenderTarget(this.hdrTarget),t.clear(!0,!0,!0),t.render(this.deepScene,s),t.setRenderTarget(null),t.clear(!0,!0,!0);const a=this.tonemapMaterial.uniforms;a.uExposure.value=this.exposure,a.uTime.value=e%1e3,a.uWarp.value=this.warp,a.uAspect.value=s.aspect,t.render(this.tonemapScene,this.tonemapCamera),this.nearSceneVisible&&(s.near=this.nearRange[0],s.far=this.nearRange[1],s.updateProjectionMatrix(),t.clearDepth(),t.render(this.nearScene,s));for(const o of this.planetPasses)o.camera.aspect=s.aspect,o.camera.fov=s.fov,o.camera.updateProjectionMatrix(),t.clearDepth(),t.render(o.scene,o.camera);this.jump.active&&this.renderWormhole(e),this.shipPass&&(t.clearDepth(),t.render(this.shipPass.scene,this.shipPass.camera))}snapshot(e=Math.min(window.devicePixelRatio||1,3)){const t=this.shipPass,s=this.renderer.getPixelRatio(),a=e>s+.01;this.shipPass=null;const o=this.renderer.domElement,r=document.createElement("canvas");try{a&&(this.renderer.setPixelRatio(e),this.resize()),this.render(performance.now()/1e3),r.width=o.width,r.height=o.height,r.getContext("2d").drawImage(o,0,0)}finally{this.shipPass=t,a&&(this.renderer.setPixelRatio(s),this.resize(),this.render(performance.now()/1e3))}return r}renderWormhole(e){const t=this.renderer,s=t.getDrawingBufferSize(new Me);(!this.frameCopy||this.frameCopy.image.width!==s.x||this.frameCopy.image.height!==s.y)&&(this.frameCopy?.dispose(),this.frameCopy=new Ja(s.x,s.y),this.frameCopy.minFilter=this.frameCopy.magFilter=oa),t.copyFramebufferToTexture(this.frameCopy);const a=this.wormholeMaterial.uniforms;a.tFrame.value=this.frameCopy,a.uTime.value=e%1e3,a.uAspect.value=this.camera.aspect,a.uMouth.value=this.jump.mouth,a.uExit.value=this.jump.exit,a.uCharge.value=this.jump.charge,a.uFlash.value=this.jump.flash,a.uCalm.value=this.calm?1:0,t.render(this.wormholeScene,this.tonemapCamera)}rayDirection(e,t,s){const a=this.renderer.domElement.getBoundingClientRect(),o=(e-a.left)/a.width*2-1,r=-((t-a.top)/a.height)*2+1;return s.set(o,r,.5).unproject(this.camera).normalize()}project(e,t){const s=e.clone().applyMatrix4(this.camera.matrixWorldInverse);if(s.z>=0)return null;s.applyMatrix4(this.camera.projectionMatrix);const a=this.renderer.domElement.getBoundingClientRect();return t.x=a.left+(s.x+1)/2*a.width,t.y=a.top+(1-s.y)/2*a.height,t}dispose(){this.running=!1,this.resizeObserver.disconnect(),this.hdrTarget.dispose(),this.glowTarget.dispose(),this.tonemapMaterial.dispose(),this.wormholeMaterial.dispose(),this.frameCopy?.dispose(),this.renderer.dispose(),this.renderer.domElement.remove()}}const ls=(n,e,t)=>{const s=E.clamp((t-n)/(e-n),0,1);return s*s*(3-2*s)};function cs(n){const e=n.clone().normalize().negate();return{yaw:Math.atan2(e.x,e.z),pitch:E.clamp(Math.asin(E.clamp(e.y,-1,1)),-1.55,1.55)}}function wi(n,e,t,s){const a=c=>.3*Math.asinh(c/e)-Math.asinh((n-c)/t),o=E.lerp(a(0),a(n),s);let r=0,l=n;for(let c=0;c<64;c++){const d=(r+l)/2;a(d)<o?r=d:l=d}return(r+l)/2}const et=(n,e)=>{for(;n-e>Math.PI;)n-=Math.PI*2;for(;n-e<-Math.PI;)n+=Math.PI*2;return n},Ne=3.6,bi=5,Si=.8,Mi=1.1,hs=n=>n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2;class ki{focus=new y;distance=1;yaw=.6;pitch=.5;minDistance=1e-9;maxDistance=1e9;follow=null;autoRotate=0;targetLogDistance=0;yawVelocity=0;pitchVelocity=0;flight=null;keys=new Set;pointers=new Map;downAt=null;lastTap=null;lastPinch=0;dom=null;listeners;tmp=new y;disposers=[];constructor(e={}){this.listeners=e,this.targetLogDistance=Math.log(this.distance)}get isFlying(){return this.flight!==null}lastInputAt=performance.now();touched(){this.lastInputAt=performance.now(),this.listeners.onUserMove?.()}get isIdle(){return this.flight||this.keys.size>0||this.pointers.size>0||this.speedFraction>0||Math.abs(this.turnRate)>1e-4||Math.abs(this.yawVelocity)+Math.abs(this.pitchVelocity)>1e-4||Math.abs(Math.log(this.distance)-this.targetLogDistance)>.001?!1:performance.now()-this.lastInputAt>2500}get isThrusting(){for(const e of["w","a","s","d","q","e","r","f","arrowup","arrowdown","arrowleft","arrowright"])if(this.keys.has(e))return!0;return this.speedFraction>.02}get flightProgress(){return this.flight?Math.min(1,(performance.now()-this.flight.start)/this.flight.duration):1}get warpIntensity(){const e=this.flight;return!e||e.arc<1.5?0:Math.sin(Math.PI*this.flightProgress)*Math.min(1,(e.arc-1.5)/3)}attach(e){this.dom=e;const t=(a,o,r,l)=>{a.addEventListener(o,r,l),this.disposers.push(()=>a.removeEventListener(o,r))};t(e,"contextmenu",a=>a.preventDefault()),t(e,"pointerdown",a=>this.beginPointer(a)),t(e,"pointermove",a=>{const o=this.pointers.get(a.pointerId);if(!o){this.listeners.onHover?.(a.clientX,a.clientY);return}const r=a.clientX-o.x,l=a.clientY-o.y;if(this.pointers.set(a.pointerId,{x:a.clientX,y:a.clientY}),this.pointers.size===2){const d=this.pinchDistance();this.lastPinch>0&&this.zoomBy(this.lastPinch/d),this.lastPinch=d,this.pan(r/2,l/2);return}this.downAt?.button===2||a.shiftKey?this.pan(r,l):this.rotate(r,l)});const s=a=>{this.pointers.delete(a.pointerId),this.pointers.size<2&&(this.lastPinch=0);const o=this.downAt;if(o&&this.pointers.size===0){const r=Math.hypot(a.clientX-o.x,a.clientY-o.y),l=a.pointerType==="touch"?12:6;if(r<l&&performance.now()-o.time<600&&o.button===0){this.listeners.onClick?.(a.clientX,a.clientY);const c=performance.now(),d=this.lastTap,u=a.pointerType==="touch"?32:8;d&&c-d.time<350&&Math.hypot(a.clientX-d.x,a.clientY-d.y)<u?(this.lastTap=null,this.listeners.onDoubleClick?.(a.clientX,a.clientY)):this.lastTap={x:a.clientX,y:a.clientY,time:c}}this.downAt=null}};t(e,"pointerup",s),t(e,"pointercancel",s),t(e,"wheel",a=>{a.preventDefault();const o=a.deltaMode===1?a.deltaY*33:a.deltaY,r=Math.exp(o*.0012),l=this.listeners.rayAt?.(a.clientX,a.clientY);if(l&&!this.follow){const d=this.cameraPosition(new y).addScaledVector(l,this.distance),u=Math.exp(E.clamp(this.targetLogDistance+Math.log(r),Math.log(this.minDistance),Math.log(this.maxDistance))-this.targetLogDistance);this.focus.lerp(d,1-u)}this.zoomBy(r)},{passive:!1}),t(window,"keydown",a=>{a.target?.tagName!=="INPUT"&&(this.keys.add(a.key.toLowerCase()),this.lastInputAt=performance.now())}),t(window,"keyup",a=>this.keys.delete(a.key.toLowerCase())),t(window,"blur",()=>this.keys.clear())}attachOverlay(e){const t=o=>o instanceof Element&&!!o.closest("a, input, textarea, select, .select-text"),s=o=>{t(o.target)||o.preventDefault()},a=o=>{o.target===this.dom||o.button!==2||t(o.target)||this.beginPointer(o)};e.addEventListener("contextmenu",s),e.addEventListener("pointerdown",a,{capture:!0}),this.disposers.push(()=>{e.removeEventListener("contextmenu",s),e.removeEventListener("pointerdown",a,{capture:!0})})}beginPointer(e){const t=this.dom;if(t){this.lastInputAt=performance.now();try{t.setPointerCapture(e.pointerId)}catch{}this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY}),this.downAt={x:e.clientX,y:e.clientY,time:performance.now(),button:e.button},this.pointers.size===2&&(this.lastPinch=this.pinchDistance())}}dispose(){this.disposers.forEach(e=>e()),this.disposers=[]}pinchDistance(){const[e,t]=Array.from(this.pointers.values());return Math.hypot(e.x-t.x,e.y-t.y)||1}cancelFlight(){this.flight&&(this.flight=null,this.targetLogDistance=Math.log(this.distance))}rotate(e,t){this.cancelFlight(),this.yawVelocity=-e*.0045,this.pitchVelocity=t*.0045,this.yaw+=this.yawVelocity,this.pitch=E.clamp(this.pitch+this.pitchVelocity,-1.55,1.55),this.touched()}pan(e,t){this.cancelFlight(),this.follow=null;const s=this.dom?.clientHeight||800,a=this.distance*1.15/s,o=new y(Math.cos(this.yaw),0,-Math.sin(this.yaw)),r=new y().crossVectors(this.offsetDirection(this.tmp),o).normalize();this.focus.addScaledVector(o,-e*a),this.focus.addScaledVector(r,t*a),this.touched()}zoomBy(e){this.cancelFlight(),this.targetLogDistance=E.clamp(this.targetLogDistance+Math.log(e),Math.log(this.minDistance),Math.log(this.maxDistance)),this.touched()}setDistance(e){this.distance=E.clamp(e,this.minDistance,this.maxDistance),this.targetLogDistance=Math.log(this.distance)}rebase(e,t){if(this.focus.sub(e).multiplyScalar(t),this.distance*=t,this.targetLogDistance=Math.log(this.distance),this.flight){const s=this.flight;s.from.sub(e).multiplyScalar(t),s.to.sub(e).multiplyScalar(t),s.fromLogDistance+=Math.log(t),s.toLogDistance+=Math.log(t),s.cruise&&(s.cruise.fromCamera.sub(e).multiplyScalar(t),s.cruise.departScale*=t,s.cruise.arriveScale*=t)}}flightEndCamera(e,t){const s=Math.cos(e.toPitch);return t.set(s*Math.sin(e.toYaw),Math.sin(e.toPitch),s*Math.cos(e.toYaw)).multiplyScalar(Math.exp(e.toLogDistance)).add(e.to)}get flightRemaining(){const e=this.flight;return e?this.flightEndCamera(e,new y).distanceTo(this.cameraPosition(new y)):0}flyTo(e,t,s={}){const a=this.focus.distanceTo(e),o=Math.log(this.distance),r=Math.log(E.clamp(t,this.minDistance,this.maxDistance)),l=Math.max(0,Math.log(a/Math.max(this.distance,t,1e-12))*.75);let c=s.duration??E.clamp(1.2+.18*Math.abs(r-o)+.25*l,1.2,6),d=et(s.yaw??this.yaw,this.yaw),u=s.pitch??this.pitch,h=null;const m=this.cameraPosition(new y);if(a>.5*Math.exp(r)){const p=cs(this.tmp.subVectors(e,m)),f=et(s.yaw??p.yaw,this.yaw),g=s.pitch??p.pitch,w=Math.cos(g),S=new y(w*Math.sin(f),Math.sin(g),w*Math.cos(f)).multiplyScalar(Math.exp(r)).add(e).clone().sub(m);if(S.lengthSq()>0){const j=cs(S),P=et(j.yaw,this.yaw);h={fromCamera:m,headYaw:P,headPitch:j.pitch,departScale:Math.max(this.distance,1e-12),arriveScale:Math.max(Math.exp(r),1e-12)},d=et(f,P),u=g;const N=Math.hypot(P-this.yaw,j.pitch-this.pitch),M=Math.log(1+S.length()/h.arriveScale);s.duration===void 0&&(c=Math.max(1.8+.5*N,E.clamp(2+.2*M,2,7)))}}this.flight={from:this.focus.clone(),to:e.clone(),fromLogDistance:o,toLogDistance:r,arc:l,start:performance.now(),duration:c*1e3,fromYaw:this.yaw,toYaw:d,fromPitch:this.pitch,toPitch:u,cruise:h,track:s.track,onArrive:s.onArrive}}offsetDirection(e){const t=Math.cos(this.pitch);return e.set(t*Math.sin(this.yaw),Math.sin(this.pitch),t*Math.cos(this.yaw))}cameraPosition(e){return this.offsetDirection(e).multiplyScalar(this.distance).add(this.focus)}orientation(e){const t=this.offsetDirection(this.tmp).negate(),s=new yt().lookAt(new y,t,new y(0,1,0));return e.setFromRotationMatrix(s)}update(e){const t=performance.now();if(this.flight){const s=this.flight,a=s.track?.();a&&s.to.copy(a);const o=Math.min(1,(t-s.start)/s.duration);if(s.cruise){const r=s.cruise,l=ls(0,.3,o),c=ls(.72,1,o);this.yaw=E.lerp(E.lerp(s.fromYaw,r.headYaw,l),s.toYaw,c),this.pitch=E.lerp(E.lerp(s.fromPitch,r.headPitch,l),s.toPitch,c);const d=hs(E.clamp((o-.12)/.88,0,1)),u=this.flightEndCamera(s,this.tmp),h=u.distanceTo(r.fromCamera),m=h>0?wi(h,r.departScale,r.arriveScale,d)/h:1;u.lerpVectors(r.fromCamera,u,m),this.distance=Math.exp(E.lerp(s.fromLogDistance,s.toLogDistance,d));const p=this.offsetDirection(new y);this.focus.copy(u).addScaledVector(p,-this.distance)}else{const r=hs(o);this.focus.lerpVectors(s.from,s.to,r),this.distance=Math.exp(E.lerp(s.fromLogDistance,s.toLogDistance,r)+s.arc*Math.sin(Math.PI*r)),this.yaw=E.lerp(s.fromYaw,s.toYaw,r),this.pitch=E.lerp(s.fromPitch,s.toPitch,r)}o>=1&&(this.flight=null,this.targetLogDistance=Math.log(this.distance),s.onArrive?.())}else{const s=Math.log(this.distance),a=s+(this.targetLogDistance-s)*Math.min(1,e*10);if(this.distance=Math.exp(a),this.pointers.size===0&&(this.yaw+=this.yawVelocity,this.pitch=E.clamp(this.pitch+this.pitchVelocity,-1.55,1.55),this.yawVelocity*=Math.pow(.02,e),this.pitchVelocity*=Math.pow(.02,e)),this.yaw+=this.autoRotate*e,this.follow){const o=this.follow();o&&this.focus.copy(o)}}this.applyKeys(e)}velocity=new y;strafe=0;climb=0;speedFraction=0;get throttleLevel(){return this.speedFraction}turnRate=0;applyKeys(e){const t=(...w)=>w.some(v=>this.keys.has(v)),s=(t("a","arrowleft")?1:0)-(t("d","arrowright")?1:0);this.turnRate+=(s*Mi-this.turnRate)*Math.min(1,e*5),Math.abs(this.turnRate)>1e-4&&(this.yaw+=this.turnRate*e,s!==0&&(this.cancelFlight(),this.touched()));const a=this.offsetDirection(new y).negate(),o=new y(Math.cos(this.yaw),0,-Math.sin(this.yaw)),r=new y(0,1,0),l=new y().addScaledVector(o,(t("e")?1:0)-(t("q")?1:0)).addScaledVector(r,(t("r")?1:0)-(t("f")?1:0)).addScaledVector(a,(t("w","arrowup")?1:0)-(t("s","arrowdown")?1:0)),c=l.lengthSq()>0,d=Ne*(t("shift")?2.5:1);c?(this.cancelFlight(),this.follow=null,this.touched()):(this.flight||this.follow)&&this.velocity.set(0,0,0);const u=c?l.normalize().multiplyScalar(d):new y,h=u.clone().sub(this.velocity),p=(!c||this.velocity.dot(u)<0?Ne/Si:Ne/bi)*(t("shift")?2.5:1),f=Math.min(h.length(),p*e);f>0&&this.velocity.addScaledVector(h.normalize(),f),this.speedFraction=Math.min(1,this.velocity.length()/Ne);const g=Math.min(1,e*4);this.strafe+=(this.velocity.dot(o)/Ne-this.strafe)*g,this.climb+=(this.velocity.y/Ne-this.climb)*g,this.velocity.lengthSq()>1e-12&&this.focus.addScaledVector(this.velocity,this.distance*e)}}const ji={star:"text-[11px] text-sky-100/80 cursor-pointer pointer-events-auto",ship:"text-xs text-emerald-300 font-semibold cursor-pointer pointer-events-auto",planet:"text-xs text-emerald-100 cursor-pointer pointer-events-auto",moon:"text-[11px] text-violet-100 cursor-pointer pointer-events-auto",poi:"text-[11px] text-amber-200/90 cursor-pointer pointer-events-auto",cluster:"text-[11px] text-violet-200/90 cursor-pointer pointer-events-auto",exotic:"text-[11px] text-fuchsia-200 cursor-pointer pointer-events-auto",galaxy:"text-xs text-sky-100 cursor-pointer pointer-events-auto",hover:"text-xs text-white",selected:"text-xs text-cyan-200"},Ci={star:"",ship:'<span class="inline-block w-0 h-0 -ml-[7px] -mt-[12px] absolute left-0 top-0 border-l-[7px] border-r-[7px] border-t-[12px] border-l-transparent border-r-transparent border-t-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-bounce"></span>',planet:'<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border border-emerald-300/70"></span>',moon:'<span class="inline-block w-2.5 h-2.5 -ml-[5px] -mt-[5px] absolute left-0 top-0 rounded-full border border-violet-300/80 shadow-[0_0_5px_rgba(196,181,253,0.7)]"></span>',poi:'<span class="inline-block w-2 h-2 -ml-1 -mt-1 absolute left-0 top-0 rotate-45 border border-amber-300/80"></span>',cluster:'<span class="inline-block w-4 h-4 -ml-2 -mt-2 absolute left-0 top-0 rounded-full border border-dashed border-violet-300/70"></span>',exotic:'<span class="inline-block w-3 h-3 -ml-1.5 -mt-1.5 absolute left-0 top-0 rounded-full border-2 border-fuchsia-300/80 shadow-[0_0_6px_rgba(240,171,252,0.8)]"></span>',galaxy:'<span class="inline-block w-5 h-5 -ml-2.5 -mt-2.5 absolute left-0 top-0 rounded-full border border-sky-200/60 border-dashed"></span>',hover:'<span class="inline-block w-6 h-6 -ml-3 -mt-3 absolute left-0 top-0 rounded-full border border-white/70"></span>',selected:'<span class="inline-block w-7 h-7 -ml-3.5 -mt-3.5 absolute left-0 top-0 rotate-45 border border-cyan-300/90 animate-pulse"></span>'};class Ni{constructor(e,t){this.wheelTarget=t,this.container=document.createElement("div"),this.container.className="absolute inset-0 pointer-events-none overflow-hidden select-none",e.appendChild(this.container)}wheelTarget;container;labels=new Map;clickHandlers=new Map;doubleClickHandlers=new Map;rect=new DOMRect;upsert(e,t,s,a="",o,r){let l=this.labels.get(e);if(!l){const c=document.createElement("div");c.className="absolute left-0 top-0 whitespace-nowrap will-change-transform",c.style.display="none";let d=0;c.addEventListener("click",u=>{u.stopPropagation();const h=performance.now();if(h-d<350){d=0,this.doubleClickHandlers.get(e)?.();return}d=h,this.clickHandlers.get(e)?.()}),c.addEventListener("pointerdown",u=>u.stopPropagation()),c.addEventListener("wheel",u=>{u.preventDefault(),this.wheelTarget?.dispatchEvent(new WheelEvent("wheel",u))},{passive:!1}),this.container.appendChild(c),l={el:c,text:"",sub:"",kind:t,placed:!1},this.labels.set(e,l)}if(o&&this.clickHandlers.set(e,o),r&&this.doubleClickHandlers.set(e,r),l.text!==s||l.sub!==a||l.kind!==t){l.text=s,l.sub=a,l.kind=t,l.el.className=`absolute left-0 top-0 whitespace-nowrap will-change-transform ${ji[t]}`;const c=d=>d.replace(/[&<>"]/g,u=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[u]);l.el.innerHTML=`${Ci[t]}<span class="absolute left-3 -top-2 font-mono tracking-wide drop-shadow-[0_0_4px_rgba(0,0,0,0.9)]">${c(s)}${a.split(`
`).filter(Boolean).map(d=>`<span class="block text-[10px] opacity-60">${c(d)}</span>`).join("")}</span>`}}setFade(e){const t=e>=.999?"":e.toFixed(3);this.container.style.opacity!==t&&(this.container.style.opacity=t)}beginFrame(){this.rect=this.container.getBoundingClientRect(),this.labels.forEach(e=>e.placed=!1)}place(e,t,s,a=1){const o=this.labels.get(e);if(!o)return;const r=this.rect;o.placed=!0,o.el.style.display="block",o.el.style.opacity=String(a),o.el.style.transform=`translate(${(t-r.left).toFixed(1)}px, ${(s-r.top).toFixed(1)}px)`}endFrame(){this.labels.forEach(e=>{e.placed||(e.el.style.display="none")})}remove(e){const t=this.labels.get(e);t&&(t.el.remove(),this.labels.delete(e),this.clickHandlers.delete(e),this.doubleClickHandlers.delete(e))}removeWhere(e){Array.from(this.labels.keys()).filter(e).forEach(t=>this.remove(t))}dispose(){this.container.remove(),this.labels.clear(),this.clickHandlers.clear(),this.doubleClickHandlers.clear()}}function _e(n){let e=2166136261;for(let t=0;t<n.length;t++)e^=n.charCodeAt(t),e=Math.imul(e,16777619);return Zt(e)}function Zt(n){return n^=n>>>16,n=Math.imul(n,2246822507),n^=n>>>13,n=Math.imul(n,3266489909),n^=n>>>16,n>>>0}function va(n){return n/4294967296}function Ti(n){let e=0;for(let t=0;t<4;t++)n=Zt(n+1831565813*(t+1)),e+=va(n);return(e-2)*Math.sqrt(3)}class Re{state;constructor(e){this.state=e>>>0||1}next(){return this.state=Zt(this.state+2654435769>>>0),va(this.state)}range(e,t){return e+(t-e)*this.next()}int(e,t){return Math.floor(this.range(e,t+1))}gauss(){return Ti(this.next()*4294967296>>>0)}pick(e){return e[Math.floor(this.next()*e.length)]}}const Ai={"Red Dwarf":[1,.45,.3],"Yellow Dwarf":[1,.93,.72],"Blue Giant":[.62,.78,1],"Red Giant":[1,.68,.4],"White Dwarf":[.92,.95,1],"Neutron Star":[.8,.65,1]},ds=8,xa=.06,ya=.17,Pi=`
  #define GLOW_FADE_FROM ${xa.toFixed(3)}
  #define GLOW_FADE_TO ${ya.toFixed(3)}
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
`,Ii=`
  varying vec2 vUv;
  varying vec3 vColor;
  varying float vIntensity;

  void main() {
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0) discard;
    float falloff = exp(-r2 * 3.0) - 0.0498;
    gl_FragColor = vec4(vColor * vIntensity * falloff, 1.0);
  }
`,Ri=`
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
`,Ei=`
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
`;function Li(){if(new URL(import.meta.url).origin!==window.location.origin){const n=new URL("data:video/mp2t;base64,Ly8gYXRsYXMtdWkvcmVhY3Qvc3RhdGljL2pzL0V4cGxvcmUvZ2FsYXh5L2dhbGF4eS53b3JrZXIudHMKLy8KLy8gT3ducyB0aGUgZ2FsYXh5IG1vZGVsIGFuZCBpdHMgb2N0cmVlIHRhYmxlcy4gVGhlIG1haW4gdGhyZWFkIG9ubHkgc2VuZHMgY2FtZXJhCi8vIHVwZGF0ZXMgYW5kIHJlY2VpdmVzIHJlYWR5LXRvLXVwbG9hZCB0eXBlZCBhcnJheXMuCgppbXBvcnQgeyBHYWxheHlNb2RlbCwgdHlwZSBHYWxheHlJbmZvLCB0eXBlIFBvaW50T2ZJbnRlcmVzdCB9IGZyb20gIi4vR2FsYXh5TW9kZWwudHMiOwppbXBvcnQgeyBTcGF0aWFsSW5kZXggfSBmcm9tICIuL1NwYXRpYWxJbmRleC50cyI7CmltcG9ydCB7IEdhbGF4eUxvZCwgdHlwZSBMb2RSZXF1ZXN0LCB0eXBlIExvZFJlc3VsdCB9IGZyb20gIi4vR2FsYXh5TG9kLnRzIjsKCmV4cG9ydCB0eXBlIFdvcmtlclJlcXVlc3QgPQogIHwgeyB0eXBlOiAiaW5pdCI7IGluZm86IEdhbGF4eUluZm8gfQogIHwgeyB0eXBlOiAibG9kIjsgcmVxdWVzdDogTG9kUmVxdWVzdCB9CiAgfCB7IHR5cGU6ICJsb2NhdGUiOyBpZDogbnVtYmVyOyBpbmRleDogbnVtYmVyIH0KICB8IHsgdHlwZTogImxlYWYiOyBpZDogbnVtYmVyOyBwb3NpdGlvbjogW251bWJlciwgbnVtYmVyLCBudW1iZXJdOyBudW1TeXN0ZW1zOiBudW1iZXIgfTsKCmV4cG9ydCB0eXBlIFdvcmtlclJlc3BvbnNlID0KICB8IHsgdHlwZTogInJlYWR5IjsgcG9pczogUG9pbnRPZkludGVyZXN0W107IHJhZGl1czogbnVtYmVyOyBoYWxmU2l6ZTogbnVtYmVyOyBnYWxheHlUeXBlOiBzdHJpbmcgfQogIHwgeyB0eXBlOiAibG9kIjsgcmVzdWx0OiBMb2RSZXN1bHQ7IGNvYXJzZTogYm9vbGVhbiB9CiAgfCB7IHR5cGU6ICJsb2NhdGVkIjsgaWQ6IG51bWJlcjsgaW5kZXg6IG51bWJlcjsgcG9zaXRpb246IFtudW1iZXIsIG51bWJlciwgbnVtYmVyXSB9CiAgfCB7IHR5cGU6ICJsZWFmIjsgaWQ6IG51bWJlcjsgaW5kaWNlczogbnVtYmVyW10gfTsKCmxldCBsb2Q6IEdhbGF4eUxvZCB8IG51bGwgPSBudWxsOwpsZXQgaW5kZXg6IFNwYXRpYWxJbmRleCB8IG51bGwgPSBudWxsOwpsZXQgcGVuZGluZzogTG9kUmVxdWVzdCB8IG51bGwgPSBudWxsOwpsZXQgc2NoZWR1bGVkID0gZmFsc2U7CmxldCBmaXJzdFJ1biA9IHRydWU7Cgpjb25zdCBjdHggPSBzZWxmIGFzIHVua25vd24gYXMgewogIHBvc3RNZXNzYWdlOiAobWVzc2FnZTogV29ya2VyUmVzcG9uc2UsIHRyYW5zZmVyPzogVHJhbnNmZXJhYmxlW10pID0+IHZvaWQ7CiAgb25tZXNzYWdlOiAoKGV2ZW50OiBNZXNzYWdlRXZlbnQ8V29ya2VyUmVxdWVzdD4pID0+IHZvaWQpIHwgbnVsbDsKfTsKCmZ1bmN0aW9uIHRyYW5zZmVyYWJsZXMocmVzdWx0OiBMb2RSZXN1bHQpOiBUcmFuc2ZlcmFibGVbXSB7CiAgcmV0dXJuIFtyZXN1bHQuZ2xvd1Bvc2l0aW9ucy5idWZmZXIsIHJlc3VsdC5nbG93U2l6ZXMuYnVmZmVyLCByZXN1bHQuZ2xvd0NvbG9ycy5idWZmZXIsIHJlc3VsdC5nbG93V2VpZ2h0cy5idWZmZXIsIHJlc3VsdC5zdGFyUG9zaXRpb25zLmJ1ZmZlciwgcmVzdWx0LnN0YXJDb2xvcnMuYnVmZmVyLCByZXN1bHQuc3RhclNpemVzLmJ1ZmZlciwgcmVzdWx0LnN0YXJXZWlnaHRzLmJ1ZmZlciwgcmVzdWx0LnN0YXJJbmRpY2VzLmJ1ZmZlciwgcmVzdWx0LnN0YXJFeGFjdC5idWZmZXIsIHJlc3VsdC5zdGFyQW5jZXN0b3JzLmJ1ZmZlcl07Cn0KCmZ1bmN0aW9uIHByb2Nlc3NQZW5kaW5nKCkgewogIHNjaGVkdWxlZCA9IGZhbHNlOwogIGlmICghcGVuZGluZyB8fCAhbG9kKSByZXR1cm47CiAgY29uc3QgcmVxdWVzdCA9IHBlbmRpbmc7CiAgcGVuZGluZyA9IG51bGw7CgogIGlmIChmaXJzdFJ1bikgewogICAgLy8gQSBjaGVhcCBmaXJzdCBwYXNzIHNvIHNvbWV0aGluZyBzaG93cyB1cCB3aGlsZSB0aGUgZnVsbCB0YWJsZXMgYXJlIGJlaW5nIGJ1aWx0CiAgICBmaXJzdFJ1biA9IGZhbHNlOwogICAgY29uc3QgY29hcnNlID0gbG9kLnJ1bih7IC4uLnJlcXVlc3QsIG1heE5vZGVzOiBNYXRoLm1pbihyZXF1ZXN0Lm1heE5vZGVzLCA0MDAwKSwgbWF4U3RhcnM6IE1hdGgubWluKHJlcXVlc3QubWF4U3RhcnMsIDMwMDApIH0pOwogICAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvZCIsIHJlc3VsdDogY29hcnNlLCBjb2Fyc2U6IHRydWUgfSwgdHJhbnNmZXJhYmxlcyhjb2Fyc2UpKTsKICB9CgogIGNvbnN0IHJlc3VsdCA9IGxvZC5ydW4ocmVxdWVzdCk7CiAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvZCIsIHJlc3VsdCwgY29hcnNlOiBmYWxzZSB9LCB0cmFuc2ZlcmFibGVzKHJlc3VsdCkpOwp9CgpjdHgub25tZXNzYWdlID0gKGV2ZW50KSA9PiB7CiAgY29uc3QgbWVzc2FnZSA9IGV2ZW50LmRhdGE7CiAgc3dpdGNoIChtZXNzYWdlLnR5cGUpIHsKICAgIGNhc2UgImluaXQiOiB7CiAgICAgIGNvbnN0IG1vZGVsID0gbmV3IEdhbGF4eU1vZGVsKG1lc3NhZ2UuaW5mbyk7CiAgICAgIGluZGV4ID0gbmV3IFNwYXRpYWxJbmRleChtb2RlbCk7CiAgICAgIGxvZCA9IG5ldyBHYWxheHlMb2QoaW5kZXgpOwogICAgICBmaXJzdFJ1biA9IHRydWU7CiAgICAgIGN0eC5wb3N0TWVzc2FnZSh7IHR5cGU6ICJyZWFkeSIsIHBvaXM6IG1vZGVsLnBvaXMsIHJhZGl1czogbW9kZWwucmFkaXVzLCBoYWxmU2l6ZTogbW9kZWwuaGFsZlNpemUsIGdhbGF4eVR5cGU6IG1vZGVsLnR5cGUgfSk7CiAgICAgIGJyZWFrOwogICAgfQogICAgY2FzZSAibG9kIjogewogICAgICAvLyBPbmx5IHRoZSBsYXRlc3QgY2FtZXJhIG1hdHRlcnM6IGNvYWxlc2NlIGJ1cnN0cyBvZiByZXF1ZXN0cwogICAgICBwZW5kaW5nID0gbWVzc2FnZS5yZXF1ZXN0OwogICAgICBpZiAoIXNjaGVkdWxlZCkgewogICAgICAgIHNjaGVkdWxlZCA9IHRydWU7CiAgICAgICAgc2V0VGltZW91dChwcm9jZXNzUGVuZGluZywgMCk7CiAgICAgIH0KICAgICAgYnJlYWs7CiAgICB9CiAgICBjYXNlICJsb2NhdGUiOiB7CiAgICAgIGlmICghaW5kZXgpIHJldHVybjsKICAgICAgY3R4LnBvc3RNZXNzYWdlKHsgdHlwZTogImxvY2F0ZWQiLCBpZDogbWVzc2FnZS5pZCwgaW5kZXg6IG1lc3NhZ2UuaW5kZXgsIHBvc2l0aW9uOiBpbmRleC5sb2NhdGUobWVzc2FnZS5pbmRleCkgfSk7CiAgICAgIGJyZWFrOwogICAgfQogICAgY2FzZSAibGVhZiI6IHsKICAgICAgaWYgKCFpbmRleCkgcmV0dXJuOwogICAgICBjb25zdCBbeCwgeSwgel0gPSBtZXNzYWdlLnBvc2l0aW9uOwogICAgICBjdHgucG9zdE1lc3NhZ2UoeyB0eXBlOiAibGVhZiIsIGlkOiBtZXNzYWdlLmlkLCBpbmRpY2VzOiBpbmRleC5zeXN0ZW1zSW5MZWFmKHgsIHksIHosIG1lc3NhZ2UubnVtU3lzdGVtcykgfSk7CiAgICAgIGJyZWFrOwogICAgfQogIH0KfTsK",import.meta.url).href,e=new Blob([`import ${JSON.stringify(n)};`],{type:"text/javascript"});return new Worker(URL.createObjectURL(e),{type:"module"})}return new Worker(new URL("/atlas-ui/react/dist/assets/galaxy.worker-BZOxTf9P.js",import.meta.url),{type:"module"})}const us=.45,Tt=n=>n*n*(3-2*n);class _i{info;root=new te;radius=5e4;pois=[];worker;current=null;fading=[];requestId=0;inFlight=!1;lastRequestCamera=new y(1/0,0,0);lastRequestForward=new y;lastRequestTime=0;callbacks=new Map;events;ready=!1;glowGain=1;hidePosition=null;hideAmount=1;highlightPosition=null;realStarTypes=new Map;numSystems;fluxScale;budget={maxNodes:36e3,maxStars:45e3,splitAngle:.018};setBudget(e){this.budget=e,this.lastRequestTime=0,this.lastRequestCamera.set(1/0,0,0)}constructor(e,t={}){this.info=e,this.events=t,this.numSystems=e.num_systems,this.fluxScale=Math.max(1,Math.sqrt(1e9/Math.max(1,e.num_systems))),this.worker=Li(),this.worker.onmessage=s=>this.handle(s.data),this.post({type:"init",info:e})}post(e){this.worker.postMessage(e)}handle(e){switch(e.type){case"ready":{this.ready=!0,this.pois=e.pois,this.radius=e.radius;const t=Math.max(this.numSystems,1)/(Math.PI*this.radius*this.radius);this.glowGain=.32/t,this.events.onReady?.(e.pois,e.radius);break}case"lod":e.coarse||(this.inFlight=!1),this.install(e.result),this.events.onLod?.(e.result,e.coarse);break;case"located":case"leaf":{const t=this.callbacks.get(e.id);t&&(this.callbacks.delete(e.id),t(e.type==="located"?e.position:e.indices));break}}}locate(e){const t=++this.requestId;return new Promise(s=>{this.callbacks.set(t,a=>s(new y(a[0],a[1],a[2]))),this.post({type:"locate",id:t,index:e})})}systemsAt(e){const t=++this.requestId;return new Promise(s=>{this.callbacks.set(t,s),this.post({type:"leaf",id:t,position:[e.x,e.y,e.z],numSystems:this.numSystems})})}maybeRequest(e,t,s,a,o,r,l=!1){if(!this.ready||this.inFlight)return;const c=performance.now(),d=e.distanceTo(this.lastRequestCamera),u=t.angleTo(this.lastRequestForward),h=Math.max(s,1e-4)*.12;!l&&d<h&&u<.2&&this.lastRequestTime>0||!l&&c-this.lastRequestTime<90||(this.inFlight=!0,this.lastRequestTime=c,this.lastRequestCamera.copy(e),this.lastRequestForward.copy(t),this.post({type:"lod",request:{id:++this.requestId,camera:[e.x,e.y,e.z],forward:[t.x,t.y,t.z],fovY:a,aspect:o,viewportHeight:r,numSystems:this.numSystems,origin:[e.x,e.y,e.z],maxNodes:this.budget.maxNodes,maxStars:this.budget.maxStars,splitAngle:this.budget.splitAngle}}))}measureExposure(e,t){const s=this.current;if(!s)return;const a=s.result,o=48,r=30,l=this.brightnessGrid;l.fill(0);const c=t.matrixWorldInverse.elements,d=t.projectionMatrix.elements,u=s.origin.x-e.x,h=s.origin.y-e.y,m=s.origin.z-e.z,p=2/d[5]/r*1;for(let v=0;v<a.glowCount;v++){const S=a.glowPositions[v*3]+u,j=a.glowPositions[v*3+1]+h,P=a.glowPositions[v*3+2]+m,N=c[2]*S+c[6]*j+c[10]*P;if(N>=0)continue;const M=Math.sqrt(S*S+j*j+P*P),I=a.glowSizes[v],_=I*1.5,C=_/M,R=(1-E.smoothstep(C,xa,ya))*E.smoothstep(M,I*1.5,I*6);if(R<=0)continue;const L=c[0]*S+c[4]*j+c[8]*P,T=c[1]*S+c[5]*j+c[9]*P,A=(d[0]*L/-N+1)*.5*o,O=(d[5]*T/-N+1)*.5*r,H=a.glowWeights[v]/(_*_)*this.glowGain*R,q=Math.max(.5,C/p),Q=H*.267*Math.PI*q*q/Math.max(1,Math.PI*q*q),U=Math.max(0,Math.floor(A-q)),je=Math.min(o-1,Math.floor(A+q)),Ce=Math.max(0,Math.floor(O-q)),ze=Math.min(r-1,Math.floor(O+q));for(let k=Ce;k<=ze;k++)for(let D=U;D<=je;D++)l[k*o+D]+=Q}let f=0;for(let v=0;v<l.length;v++)f=Math.max(f,l[v]);const g=Array.from(l).filter(v=>v>f*.01).sort((v,S)=>v-S),w=g.length?g[Math.floor(g.length/2)]:0;this.targetExposure=E.clamp(.35/Math.max(w,1e-6),.01,1.6)}targetExposure=1;brightnessGrid=new Float32Array(1440);install(e){const t=new te,s=new y(...e.origin),a=new ge(1,1),o=new Ka;o.index=a.index,o.setAttribute("position",a.getAttribute("position")),o.setAttribute("iPos",new Ke(e.glowPositions,3)),o.setAttribute("iSize",new Ke(e.glowSizes,1)),o.setAttribute("iColor",new Ke(e.glowColors,3)),o.setAttribute("iWeight",new Ke(e.glowWeights,1)),o.instanceCount=e.glowCount;const r=new B({uniforms:{uGain:{value:this.glowGain},uOpacity:{value:0}},vertexShader:Pi,fragmentShader:Ii,blending:Y,depthTest:!1,depthWrite:!1,transparent:!0}),l=new F(o,r);l.frustumCulled=!1,l.layers.set(ga),t.add(l);const c=new Map;for(let N=0;N<e.starCount;N++){const M=e.starIndices[N];c.set(M,N);const I=this.realStarTypes.get(M);I&&this.writeStarColor(e.starColors,N,I)}const d=new de;d.setAttribute("position",new K(e.starPositions,3));const u=new K(e.starColors,3);d.setAttribute("color",u),d.setAttribute("lum",new K(e.starSizes,1)),d.setAttribute("weight",new K(e.starWeights,1));const h=e.starCount,m=new Float32Array(h*3),p=new Float32Array(h).fill(1),f=new Float32Array(h),g=new Float32Array(h),w=new Float32Array(h),v=this.current;if(v){const N=Tt(v.morph),M=v.result,I=v.origin.x-s.x,_=v.origin.y-s.y,C=v.origin.z-s.z,R=(T,A)=>{const O=v.matched[T]>0;for(let H=0;H<3;H++){const q=M.starPositions[T*3+H];m[A*3+H]=(O?v.prevPositions[T*3+H]+(q-v.prevPositions[T*3+H])*N:q)+(H===0?I:H===1?_:C)}},L=new Uint8Array(M.starCount);for(let T=0;T<h;T++){const A=v.indexToSlot.get(e.starIndices[T]);if(A===void 0||v.retired[A])continue;const O=v.matched[A]>0;R(A,T),p[T]=O?Math.exp(Math.log(v.prevWeights[A])+(Math.log(M.starWeights[A])-Math.log(v.prevWeights[A]))*N):M.starWeights[A],f[T]=O?v.prevAlphas[A]+(1-v.prevAlphas[A])*N:N,g[T]=1,L[A]=1}for(let T=0;T<h;T++)if(!g[T])for(let A=0;A<ds;A++){const O=e.starAncestors[T*ds+A];if(O<0)break;const H=v.indexToSlot.get(O);if(!(H===void 0||v.retired[H])){R(H,T),p[T]=e.starWeights[T],f[T]=0,g[T]=1;break}}for(let T=0;T<M.starCount;T++)L[T]&&(v.retired[T]=1);v.retiredAttribute.needsUpdate=!0}d.setAttribute("prevPosition",new K(m,3)),d.setAttribute("prevWeight",new K(p,1)),d.setAttribute("prevAlpha",new K(f,1)),d.setAttribute("matched",new K(g,1));const S=new K(w,1);d.setAttribute("retired",S);const j=new B({uniforms:{uMorph:{value:0},uPixelRatio:{value:1},uOpacity:{value:1},uStarBoost:{value:1},uFluxScale:{value:this.fluxScale},uHidePos:{value:new y},uHideRadius:{value:0},uHideAmount:{value:1},uHighlightPos:{value:new y(1e9,1e9,1e9)}},vertexShader:Ri,fragmentShader:Ei,blending:Y,depthTest:!1,depthWrite:!1,transparent:!0}),P=new Le(d,j);P.frustumCulled=!1,t.add(P),v&&(v.retiring=!0,this.fading.push(v)),this.current={result:e,origin:s,group:t,glowMaterial:r,starMaterial:j,morph:0,fade:1,retiring:!1,colorAttribute:u,indexToSlot:c,prevPositions:m,prevWeights:p,prevAlphas:f,matched:g,retired:w,retiredAttribute:S},this.root.add(t)}writeStarColor(e,t,s){const a=Ai[s];a&&(e[t*3]=a[0],e[t*3+1]=a[1],e[t*3+2]=a[2])}setRealStarType(e,t){this.realStarTypes.set(e,t);const s=this.current;if(!s)return;const a=s.indexToSlot.get(e);a!==void 0&&(this.writeStarColor(s.result.starColors,a,t),s.colorAttribute.needsUpdate=!0)}setHidden(e,t=1){this.hidePosition=e?e.clone():null,this.hideAmount=t}setHighlight(e){this.highlightPosition=e?e.clone():null}hideHighlightOnce(){for(const e of this.current?[...this.fading,this.current]:this.fading)e.starMaterial.uniforms.uHighlightPos.value.set(1e9,1e9,1e9)}update(e,t,s,a=1){const o=this.current?[...this.fading,this.current]:this.fading,r=Math.min(5,Math.pow(1/Math.max(a,.001),.6));for(const l of o){l.starMaterial.uniforms.uStarBoost.value=r,l.retiring?l.fade=Math.max(0,l.fade-e/us):l.morph=Math.min(1,l.morph+e/us);const c=Tt(l.morph),d=Tt(l.fade);l.group.position.set(l.origin.x-t.x,l.origin.y-t.y,l.origin.z-t.z),l.glowMaterial.uniforms.uOpacity.value=c*d,l.starMaterial.uniforms.uMorph.value=c,l.starMaterial.uniforms.uOpacity.value=d,l.starMaterial.uniforms.uPixelRatio.value=s,this.hidePosition?(l.starMaterial.uniforms.uHidePos.value.copy(this.hidePosition).sub(l.origin),l.starMaterial.uniforms.uHideRadius.value=.002,l.starMaterial.uniforms.uHideAmount.value=this.hideAmount):l.starMaterial.uniforms.uHideRadius.value=0,this.highlightPosition?l.starMaterial.uniforms.uHighlightPos.value.copy(this.highlightPosition).sub(l.origin):l.starMaterial.uniforms.uHighlightPos.value.set(1e9,1e9,1e9)}this.fading=this.fading.filter(l=>l.fade>0?!0:(this.root.remove(l.group),l.group.traverse(c=>{const d=c;d.geometry?.dispose(),d.material?.dispose?.()}),!1))}pick(e,t,s,a,o,r=14){const l=this.current;if(!l)return null;const c=o.getBoundingClientRect(),d=l.result,u=a.matrixWorldInverse.elements,h=a.projectionMatrix.elements,m=l.origin.x-s.x,p=l.origin.y-s.y,f=l.origin.z-s.z;let g=-1,w=-1/0,v={x:0,y:0},S=0;for(let j=0;j<d.starCount;j++){const P=d.starPositions[j*3]+m,N=d.starPositions[j*3+1]+p,M=d.starPositions[j*3+2]+f,I=u[0]*P+u[4]*N+u[8]*M,_=u[1]*P+u[5]*N+u[9]*M,C=u[2]*P+u[6]*N+u[10]*M;if(C>=0)continue;const R=c.left+(h[0]*I/-C+1)*.5*c.width,L=c.top+(1-(h[5]*_/-C+1)*.5)*c.height,T=R-e,A=L-t,O=T*T+A*A;if(O>r*r)continue;const H=Math.sqrt(P*P+N*N+M*M),q=d.starSizes[j]*d.starWeights[j]*this.fluxScale/(H*H),Q=Math.min(1,Math.max(0,(Math.log10(q)+7.5)/7));if(Q<.12)continue;const U=Q*2-Math.sqrt(O)/r;U>w&&(w=U,g=j,v={x:R,y:L},S=Q)}return g<0?null:{index:d.starIndices[g],position:new y(d.starPositions[g*3]+l.origin.x,d.starPositions[g*3+1]+l.origin.y,d.starPositions[g*3+2]+l.origin.z),exact:d.starExact[g]===1,screen:v,apparent:S}}visibleStars(e,t,s){const a=this.current;if(!a)return[];const o=a.result,r=[];for(let l=0;l<o.starCount;l++){if(o.starWeights[l]!==1)continue;const c=o.starPositions[l*3]+a.origin.x,d=o.starPositions[l*3+1]+a.origin.y,u=o.starPositions[l*3+2]+a.origin.z,h=Math.hypot(c-e.x,d-e.y,u-e.z);h>s||r.push({index:o.starIndices[l],position:new y(c,d,u),distance:h})}return r.sort((l,c)=>l.distance-c.distance),r.slice(0,t)}dispose(){this.worker.terminate();for(const e of[...this.fading,...this.current?[this.current]:[]])e.group.traverse(t=>{const s=t;s.geometry?.dispose(),s.material?.dispose?.()});this.root.clear()}}function Fi(n,e){return n==="Spiral"?e.range(32e3,6e4):n==="Elliptical"?e.range(28e3,75e3):n==="Dwarf"?e.range(3500,9e3):2e3}function zi(n){const e=n.galaxy_type;return Fi(e==="Spiral"||e==="Elliptical"||e==="Dwarf"?e:"Void",new Re(_e(`${n.spatial_seed}:${n.coordinates.join(",")}`)))}const ke=`
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
`,wa=`
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
`;function Wi(n,e){const t=new z(e);switch(n){case"Red Giant":return{color:t,cells:7,spots:.25,churn:.25,smooth:0,corona:1.6,temperature:3800};case"Blue Giant":return{color:t,cells:70,spots:0,churn:1.6,smooth:.15,corona:2.6,temperature:25e3};case"White Dwarf":return{color:t,cells:140,spots:0,churn:.4,smooth:.8,corona:1.8,temperature:12e3};case"Neutron Star":return{color:new z(12573951),cells:200,spots:0,churn:.2,smooth:1,corona:4,temperature:6e5};case"Red Dwarf":return{color:t,cells:34,spots:.85,churn:.8,smooth:0,corona:1.7,temperature:3200};default:return{color:t.clone().lerp(new z(16762977),.6),cells:46,spots:.55,churn:1,smooth:0,corona:2,temperature:5800}}}const Di=`
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
`,Gi=`
${ke}
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
`,Oi=`
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
`,Vi=`
${ke}
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
`;class pt{surface;corona;coronaMaterial;spin=new yt;static spinAt(e){return e*.01%(Math.PI*2)}constructor(e,t,s){const a=r=>{const l=Math.sin(s*12.9898+r*78.233)*43758.5453;return l-Math.floor(l)},o=new y(a(1)*50,a(2)*50,a(3)*50);this.surface=new B({uniforms:{uTime:{value:0},uColor:{value:e.color.clone()},uCells:{value:e.cells},uSpots:{value:e.spots},uChurn:{value:e.churn},uSmooth:{value:e.smooth},uSeed:{value:o},uOctaves:{value:5}},vertexShader:Di,fragmentShader:Gi}),this.coronaMaterial=new B({uniforms:{uTime:{value:0},uColor:{value:e.color.clone()},uSmooth:{value:e.smooth},uOpacity:{value:0},uSeed:{value:o},uR:{value:t},uSize:{value:e.corona*1.6+3},uSpin:{value:new ra},uOctaves:{value:3}},vertexShader:Oi,fragmentShader:Vi,blending:Y,transparent:!0,depthWrite:!1}),this.corona=new F(new ge(2,2),this.coronaMaterial),this.corona.frustumCulled=!1}update(e,t){this.surface.uniforms.uTime.value=e,this.coronaMaterial.uniforms.uTime.value=e,this.coronaMaterial.uniforms.uSpin.value.setFromMatrix4(this.spin.makeRotationY(-pt.spinAt(e))),this.coronaMaterial.uniforms.uOpacity.value=t,this.corona.visible=t>.01}dispose(){this.surface.dispose(),this.coronaMaterial.dispose(),this.corona.geometry.dispose()}}const qi=n=>{let e=0;for(let t=0;t<n.length;t++)e=(e<<5)-e+n.charCodeAt(t),e=e&e;return Math.abs(e)%1e4/1e4*.15},Hi=n=>{let e=0;for(let t=0;t<n.length;t++)e=(e<<3)-e+n.charCodeAt(t)*7,e=e&e;return Math.abs(e)%1e4/1e4*Math.PI*2},ms=(n,e,t,s,a,o=new y)=>{const r=e*(1-t*t)/(1+t*Math.cos(n)),l=r*Math.cos(n),c=r*Math.sin(n),d=l*Math.cos(a)-c*Math.sin(a)*Math.cos(s),u=l*Math.sin(a)+c*Math.cos(a)*Math.cos(s),h=c*Math.sin(s);return o.set(d,h,u)};function lt(n){const e=n.replace("#",""),t=parseInt(e.substr(0,2),16)/255,s=parseInt(e.substr(2,2),16)/255,a=parseInt(e.substr(4,2),16)/255;return new z(t,s,a)}function At(n){return n.length>=3?new z(n[0],n[1],n[2]):new z(.5,.5,.5)}function Bi(n){if(n.ocean_color){if(typeof n.ocean_color=="string")return lt(n.ocean_color);if(Array.isArray(n.ocean_color))return At(n.ocean_color)}if(n.planet_info?.base_color){if(typeof n.planet_info.base_color=="string")return lt(n.planet_info.base_color);if(Array.isArray(n.planet_info.base_color))return At(n.planet_info.base_color)}if(n.base_color){if(typeof n.base_color=="string")return lt(n.base_color);if(Array.isArray(n.base_color))return At(n.base_color)}const e=n.planet_info?.type||n.type||"Unknown";return Xt(e)}function Xt(n){const t={"Gas Giant":"#FFA500",Anomaly:"#FFFFFF",Rocky:"#808080",Icy:"#ADD8E6",Oceanic:"#0000FF",Desert:"#FFD700",Lava:"#FF0000",Arid:"#800000",Swamp:"#008000",Tundra:"#F0F8FF",Forest:"#006400",Savannah:"#F4A460",Cave:"#D1D1D1",Crystalline:"#00FFFF",Metallic:"#C0C0C0",Toxic:"#800080",Radioactive:"#00FF00",Magma:"#FF4500","Molten Core":"#FF8C00",Carbon:"#090909",Diamond:"#87CEFA","Super Earth":"#90EE90","Sub Earth":"#006400","Frozen Gas Giant":"#ADD8E6",Nebulous:"#FFC0CB",Aquifer:"#00FFFF",Exotic:"#FF00FF"}[n]||"#FFFFFF";return lt(t)}const ce=63241.077,$i=1496e5,Ui=.00465,Yi=8,Zi=80,Xi={red:16742989,yellow:16773577,blue:11127039,orange:16758891,white:16054271,purple:13215487},Ji={"Red Dwarf":.8,"Yellow Dwarf":1.4,"Blue Giant":2.6,"Red Giant":1.8,"White Dwarf":1.2,"Neutron Star":1},ba=new Set(["Gas Giant","Frozen Gas Giant","Nebulous"]),ps=new Set(["Lava","Magma","Molten Core","Radioactive"]);function Ki(){const e=document.createElement("canvas");e.width=e.height=256;const t=e.getContext("2d"),s=t.createRadialGradient(256/2,256/2,0,256/2,256/2,256/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.08,"rgba(255,255,255,0.85)"),s.addColorStop(.25,"rgba(255,255,255,0.22)"),s.addColorStop(.6,"rgba(255,255,255,0.05)"),s.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=s,t.fillRect(0,0,256,256);const a=new ue(e);return a.colorSpace=ve,a}function fs(n,e){const a=document.createElement("canvas");a.width=256,a.height=128;const o=a.getContext("2d"),r=new Re(_e(n.name)),l=e?e.clone():Xt(n.planet_type).clone();e||l.lerp(new z(9080729),.35);const c=u=>`#${u.getHexString()}`;if(o.fillStyle=c(l),o.fillRect(0,0,256,128),ba.has(n.planet_type))for(let u=0;u<128;u++){const h=Math.sin(u*.18+r.next()*.4)*.5+Math.sin(u*.05)*.5,m=l.clone().offsetHSL(0,0,h*.12);o.fillStyle=c(m),o.fillRect(0,u,256,1)}else{const u=l.clone().offsetHSL(0,-.05,-.18),h=l.clone().offsetHSL(.02,0,.12);for(let m=0;m<220;m++)o.fillStyle=c(r.next()<.55?u:h),o.globalAlpha=r.range(.15,.45),o.beginPath(),o.ellipse(r.range(0,256),r.range(0,128),r.range(4,26),r.range(3,14),r.range(0,Math.PI),0,Math.PI*2),o.fill();o.globalAlpha=1,n.surface_temperature<260&&(o.fillStyle="rgba(240,248,255,0.85)",o.fillRect(0,0,256,10),o.fillRect(0,118,256,10))}const d=new ue(a);return d.colorSpace=ve,d.wrapS=Gt,d}const Qi=`
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
`,en=`
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vView;
  #include <logdepthbuf_pars_fragment>
  void main() {
    #include <logdepthbuf_fragment>
    float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
    gl_FragColor = vec4(uColor * rim * 1.4, rim);
  }
`;class gs{root=new te;system;planets=[];stars=[];timeScale=1;simulatedSeconds=0;serverTime;loadedAt=Date.now()/1e3;disposables=[];timing;constructor(e,t){this.system=e,this.timing=t,this.serverTime=t.current_time,this.buildStars(),this.buildPlanets(),this.root.add(new la(4213350,.06))}get cosmicNow(){return this.serverTime+this.simulatedSeconds}get drift(){return this.simulatedSeconds-(Date.now()/1e3-this.loadedAt)}resetTime(){this.simulatedSeconds=Date.now()/1e3-this.loadedAt}buildStars(){const e=Ki();this.disposables.push(e);const t=this.system.stars.length,s=.12+.05*t;this.system.stars.forEach((a,o)=>{const r=Xi[a.Color?.toLowerCase()]??16777215,l=Math.max(6e-4,a.Size*Ui*Yi),c=new ne(l,96,48),d=Wi(a.Type,r),u=new pt(d,l,this.system.index*7+o+1),h=new F(c,u.surface);h.userData.starIndex=o,u.corona.position.copy(h.position);const m=new Bt(new $t({map:e,color:r,blending:Y,depthWrite:!1,transparent:!0})),p=o/Math.max(1,t)*Math.PI*2,f=t>1?new y(Math.cos(p)*s,0,Math.sin(p)*s):new y;h.position.copy(f),m.position.copy(f),u.corona.position.copy(f);const g=new Qa(r,(Ji[a.Type]??1.2)/Math.sqrt(t),0,0);g.position.copy(f),this.root.add(h,u.corona,m,g),this.stars.push({mesh:h,glow:m,radius:l,offset:f,light:g,surface:u,info:a,look:d}),this.disposables.push(c,u,m.material)})}buildPlanets(){for(const e of this.system.planets){const t=Math.max(2e-5,e.diameter/2/$i*Zi),s=fs(e),a=new ne(t,48,24),o=new ie({map:s,roughness:ba.has(e.planet_type)?.9:.75,metalness:e.planet_type==="Metallic"?.6:.05,emissive:ps.has(e.planet_type)?new z(e.planet_type==="Radioactive"?8257354:16734751):new z(0),emissiveIntensity:ps.has(e.planet_type)?.35:0}),r=new F(a,o);if(r.rotation.z=e.axial_tilt*Math.PI/180,r.userData.planetIndex=e.index,this.root.add(r),this.disposables.push(s,a,o),e.atmosphere&&!/none|vacuum/i.test(e.atmosphere)){const f=new F(new ne(t*1.06,48,24),new B({uniforms:{uColor:{value:Xt(e.planet_type).clone().lerp(new z(10471679),.6)}},vertexShader:Qi,fragmentShader:en,blending:Y,transparent:!0,depthWrite:!1,side:ca}));r.add(f),this.disposables.push(f.geometry,f.material)}const l=qi(e.name),c=Hi(e.name),d=Math.min(.9,e.eccentricity_factor??.1),u=[];for(let f=0;f<360;f++)u.push(ms(f/360*Math.PI*2,e.orbital_radius,d,l,c));const h=new de().setFromPoints(u),m=new wt({color:7311320,transparent:!0,opacity:.28,depthWrite:!1}),p=new ei(h,m);p.userData.opacity=.28,this.root.add(p),this.disposables.push(h,m),this.planets.push({data:e,mesh:r,orbit:p,radius:t,inclination:l,ascendingNode:c,eccentricity:d,angularVelocity:2*Math.PI/e.orbital_period_seconds,position:new y})}}get outerRadius(){return Math.max(1,...this.system.planets.map(e=>e.orbital_radius))}planetPosition(e){const t=this.planets.find(s=>s.data.index===e);return t?t.position:null}planet(e){return this.planets.find(t=>t.data.index===e)}get starOffsets(){return this.stars.map(e=>e.offset.clone())}nearestSurface(e){let t=1/0;for(const s of this.planets)t=Math.min(t,e.distanceTo(s.position)-s.radius);for(const s of this.stars)t=Math.min(t,e.distanceTo(s.offset)-s.radius);return t}setDetailed(e){for(const t of this.planets)t.mesh.visible=!e.includes(t.data.index)}setPlanetColor(e,t){const s=this.planet(e);if(!s)return;const a=s.mesh.material,o=a.map,r=fs(s.data,t);a.map=r,a.needsUpdate=!0,this.disposables.push(r),o&&(o.dispose(),this.disposables=this.disposables.filter(c=>c!==o)),s.mesh.children[0]?.material.uniforms.uColor.value.copy(t).lerp(new z(10471679),.6)}setSelectedPlanet(e){for(const t of this.planets){const s=t.orbit.material,a=t.data.index===e;s.color.set(a?8317183:7311320),t.orbit.userData.opacity=a?.75:.28}}setOrbitsVisible(e){for(const t of this.planets)t.orbit.visible=e}update(e,t){this.simulatedSeconds+=e*this.timeScale,this.root.position.copy(t).negate();for(const a of this.planets){const o=a.data.current_orbital_angle+a.angularVelocity*this.simulatedSeconds;ms(o,a.data.orbital_radius,a.eccentricity,a.inclination,a.ascendingNode,a.position),a.mesh.position.copy(a.position),a.mesh.rotation.y=this.simulatedSeconds/Math.max(1,Math.abs(a.data.rotation_period_seconds))*Math.PI*2%(Math.PI*2)}const s=performance.now()/1e3;for(const a of this.stars){const o=t.distanceTo(a.offset),r=E.smoothstep(a.radius*40/Math.max(o,1e-9),.6,2.5),l=Math.max(a.radius*16,o*.09);a.glow.scale.setScalar(l),a.glow.material.opacity=this.presence*(1-.85*r),a.surface.update(s,r*this.presence),a.mesh.rotation.y=pt.spinAt(s)}for(const a of this.planets)a.orbit.material.opacity=a.orbit.userData.opacity*this.presence}presence=0;static presenceAt(e){const t=E.clamp(Math.log(4800/Math.max(e,1e-9))/Math.log(32),0,1);return t*t*(3-2*t)}pickPlanet(e,t,s,a,o=18){let r=null,l=1/0;const c=new y;for(const d of this.planets){c.copy(d.position).sub(a);const u=s(c);if(!u)continue;const h=Math.hypot(u.x-e,u.y-t);h<o&&h<l&&(r=d,l=h)}return r}pickBody(e,t,s,a){let o=null,r=1;const l=new y,c=new y,d=(u,h,m,p)=>{l.copy(u).sub(a);const f=s(l);if(!f)return;c.copy(l).add(new y(h,0,0));const g=s(c),w=Math.max(m,g?Math.hypot(g.x-f.x,g.y-f.y):0),v=Math.hypot(f.x-e,f.y-t)/w;v<r&&(r=v,o=p)};for(const u of this.planets)d(u.position,u.radius,18,{kind:"planet",body:u});return this.stars.forEach((u,h)=>d(u.offset,u.radius,22,{kind:"star",index:h})),o}dispose(){this.disposables.forEach(e=>e.dispose()),this.root.clear()}}const ft=6,Sa=`
uniform vec2 uRingBands[${ft}];
uniform int uRingBandCount;
uniform float uRingSeed;

float ringHash(float x) { return fract(sin(x * 127.1 + uRingSeed) * 43758.5453); }
float ringNoise(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(ringHash(i), ringHash(i + 1.0), f); }

float ringDensity(float r) {
  float density = 0.0;
  for (int i = 0; i < ${ft}; i++) {
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
  return clamp(density * ringlets * mix(1.0, gaps, 0.6), 0.0, 1.0);
}
`,tn=`
varying vec3 vWorldPos;
varying vec3 vLocal;
void main() {
  vLocal = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,sn=`
${Sa}
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
  vec3 color = tone * uSunColor * uSunIntensity * brightness * shadow + tone * 0.01;
  gl_FragColor = vec4(color, density * 0.92);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;class an{mesh;normal=new y;bands;bandCount;seed;material;constructor(e,t,s,a){const o=1/(e.planet_radius||200),r=Math.asin((e.tilt_factor||.2)*.5);this.bands=Array.from({length:ft},(u,h)=>{const m=e.bands[h];return m?new Me(m.inner*o,m.outer*o):new Me(0,0)}),this.bandCount=Math.min(e.bands.length,ft),this.seed=e.shape_seed%1e3/10;const l=Math.min(...e.bands.map(u=>u.inner))*o*t,c=Math.max(...e.bands.map(u=>u.outer))*o*t,d=new Ut(l*.98,c*1.02,256,1);this.material=new B({uniforms:{uLightDir:a.uLightDir,uSunColor:a.uSunColor,uSunIntensity:a.uSunIntensity,uRingBands:{value:this.bands},uRingBandCount:{value:this.bandCount},uRingSeed:{value:this.seed},uRingNormal:{value:this.normal},uPlanetRadius:{value:t},uRingColor:{value:s}},vertexShader:tn,fragmentShader:sn,transparent:!0,depthWrite:!1,side:xe}),this.mesh=new F(d,this.material),this.mesh.name="realistic-rings",this.mesh.rotation.set(-Math.PI/2+r,0,0),this.mesh.updateMatrixWorld(),this.normal.set(0,0,1).applyQuaternion(this.mesh.quaternion).normalize(),this.mesh.renderOrder=1}dispose(){this.mesh.removeFromParent(),this.mesh.geometry.dispose(),this.material.dispose()}}function Fe(n){let e=n%2147483647;return e<=0&&(e+=2147483646),()=>(e=e*16807%2147483647)/2147483647}const nn=n=>{const e=n()*2-1,t=n()*Math.PI*2,s=Math.sqrt(1-e*e);return new y(s*Math.cos(t),e,s*Math.sin(t))};function gt(n,e,t,s){const a=new y(0,1,0).applyEuler(new Yt((n()-.5)*t*2,n()*Math.PI*2,(n()-.5)*t*2)).normalize(),o=new y(1,0,0).cross(a);o.lengthSq()<1e-4&&o.set(0,0,1).cross(a),o.normalize();const r=new y().crossVectors(a,o);return{radius:e,normal:a,u:o,v:r,period:s,phase:n()*Math.PI*2}}const Te=(n,e,t)=>{const s=n.phase+e/n.period*Math.PI*2;return t.copy(n.u).multiplyScalar(Math.cos(s)*n.radius).addScaledVector(n.v,Math.sin(s)*n.radius)};function on(n){const e=new fe(n*.6,n*.6,n),t=new fe(n*2.4,n*.02,n*.7).translate(-n*1.6,0,0),s=new fe(n*2.4,n*.02,n*.7).translate(n*1.6,0,0),a=new ua(n*.35,n*.2,12,1,!0).rotateX(Math.PI/2).translate(0,0,n*.6),o=[e,t,s,a].map(l=>l.toNonIndexed()),r=pa(o);return o.forEach(l=>l.dispose()),r}function rn(n){const e=[];e.push(new fe(n*6,n*.15,n*.15));for(let a=-2;a<=2;a++)e.push(new $e(n*.35,n*.35,n*1.4,12).rotateX(Math.PI/2).translate(a*n*.5,0,0));for(const a of[-2.8,-1.9,1.9,2.8])for(const o of[-1,1])e.push(new fe(n*.7,n*.02,n*2.2).translate(a*n,0,o*n*1.3));e.push(new Ae(n*1.1,n*.08,8,32).rotateY(Math.PI/2));const t=e.map(a=>a.toNonIndexed()),s=pa(t);return e.forEach(a=>a.dispose()),t.forEach(a=>a.dispose()),s}const Ma=`
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
`,ka=`
uniform vec3 uColor;
varying float vOn;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(uColor * (0.25 + 2.5 * vOn) * (1.0 - d * 2.0), 1.0);
}
`;function vs(n,e,t,s,a,o){const r=Fe(t),l=e*(o?.008:.013),c=on(l),d=new ie({color:o?10134708:13152368,metalness:.85,roughness:.3,envMapIntensity:1}),u=new ha(c,d,s);u.frustumCulled=!1;const h=[];for(let I=0;I<s;I++){const _=r(),C=_<.7?e*(1.04+r()*.12):_<.92?e*(1.3+r()*.4):e*(2.2+r()*.6),R=5400*Math.pow(C/(e*1.06),1.5);h.push(gt(r,C,o?1.4:1,R))}n.add(u);const m=new de;m.setAttribute("position",new K(new Float32Array(s*3),3)),m.setAttribute("phase",new K(Float32Array.from({length:s},()=>r()),1));const p=new B({uniforms:{uWall:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uColor:{value:new z(o?6347007:16769184)}},vertexShader:Ma,fragmentShader:ka,blending:Y,transparent:!0,depthWrite:!1}),f=new Le(m,p);f.frustumCulled=!1,n.add(f);let g=null;const w=gt(r,e*1.08,.9,5600);a&&(g=new F(rn(e*.012),new ie({color:14211280,metalness:.6,roughness:.4})),n.add(g));const v=new yt,S=new Ue,j=new y,P=new y,N=new y(1,1,1),M=m.getAttribute("position");return{update:(I,_)=>{for(let C=0;C<s;C++)Te(h[C],I,j),Te(h[C],I+30,P),v.lookAt(j,P,j.clone().normalize()),S.setFromRotationMatrix(v),u.setMatrixAt(C,v.compose(j,S,N)),M.setXYZ(C,j.x,j.y,j.z);u.instanceMatrix.needsUpdate=!0,M.needsUpdate=!0,p.uniforms.uWall.value=_,g&&(Te(w,I,g.position),Te(w,I+30,P),g.lookAt(P))},dispose:()=>{for(const I of[u,f,g])I?.removeFromParent();c.dispose(),d.dispose(),m.dispose(),p.dispose(),g&&(g.geometry.dispose(),g.material.dispose())}}}function ln(n,e){const t=e*1.55,s=new te,a=new F(new Ae(t,e*.006,8,512),new ie({color:9213604,metalness:.9,roughness:.35}));a.rotation.x=Math.PI/2,s.add(a);const o=[];for(let h=0;h<6;h++){const m=h/6*Math.PI*2;o.push(Math.cos(m)*e,0,Math.sin(m)*e,Math.cos(m)*t,0,Math.sin(m)*t)}const r=new dt(new de().setAttribute("position",new ut(o,3)),new wt({color:8425632,transparent:!0,opacity:.5}));s.add(r);const l=240,c=new Float32Array(l*3);for(let h=0;h<l;h++){const m=h/l*Math.PI*2;c.set([Math.cos(m)*t,0,Math.sin(m)*t],h*3)}const d=new de;d.setAttribute("position",new K(c,3)),d.setAttribute("phase",new K(Float32Array.from({length:l},(h,m)=>m/l),1));const u=new B({uniforms:{uWall:{value:0},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uColor:{value:new z(6349055)}},vertexShader:Ma,fragmentShader:ka,blending:Y,transparent:!0,depthWrite:!1});return s.add(new Le(d,u)),n.add(s),{surface:s,update:(h,m)=>{u.uniforms.uWall.value=m},dispose:()=>{s.removeFromParent(),s.traverse(h=>{const m=h;m.geometry?.dispose(),m.material?.dispose?.()})}}}const ja=`
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
`,Ze=`
${ke}
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
`,cn=`
${Ze}
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
`,hn=`
${Ze}
void main() {
  vec3 p = normalize(vObj);
  vec3 w = vec3(snoise(p * 2.0 + uWall * 0.03), snoise(p * 2.0 + 7.0 - uWall * 0.025), snoise(p * 2.0 + 13.0));
  float n = fbmN(p * 3.0 + w * 1.2 + vec3(uWall * 0.02), 5.0);
  float body = smoothstep(0.1, 0.5, n);
  float pulse = 0.65 + 0.35 * sin(uWall * 0.7 + n * 8.0);
  vec3 color = mix(uColor, uColor2, smoothstep(0.3, 0.7, n));
  gl_FragColor = vec4(color * body * pulse * uStrength * (0.35 + 0.65 * nightSide()), 1.0);
}
`,dn=`
${Ze}
void main() {
  vec3 p = normalize(vObj);
  float ripples = 0.5 + 0.5 * sin(acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0)) * 18.0 - uWall * 0.8);
  float veil = 0.5 + 0.5 * snoise(p * 4.0 + vec3(0.0, uWall * 0.05, 0.0));
  float glow = (limb() * 1.4 + 0.08) * (0.4 + 0.6 * ripples * veil);
  gl_FragColor = vec4(mix(uColor, uColor2, ripples) * glow * uStrength, 1.0);
}
`,un=`
${Ze}
void main() {
  vec3 p = normalize(vObj);
  float a = acos(clamp(dot(p, normalize(uSeed - 50.0)), -1.0, 1.0));
  float b = acos(clamp(dot(p, normalize(uSeed.zxy - 50.0)), -1.0, 1.0));
  float waves = sin(a * 40.0 - uWall * 1.5) * sin(b * 40.0 + uWall * 1.2);
  float glow = pow(abs(waves), 8.0) * (0.3 + limb());
  gl_FragColor = vec4(mix(uColor, uColor2, 0.5 + 0.5 * waves) * glow * uStrength, 1.0);
}
`;function Ge(n,e,t,s,a,o,r,l,c,d){const u=Fe(l),h=new B({uniforms:{uWall:{value:0},uLightDir:c.uLightDir,uColor:{value:new z(a)},uColor2:{value:new z(o)},uStrength:{value:r},uSeed:{value:new y(u()*100,u()*100,u()*100)},uOctaves:{value:5}},vertexShader:ja,fragmentShader:s,blending:Y,transparent:!0,depthWrite:!1}),m=new F(new ne(e*t,128,64),h);return m.renderOrder=3,n.add(m),{mesh:m,material:h,surface:d?m:void 0,update:(p,f)=>{h.uniforms.uWall.value=f},dispose:()=>{m.removeFromParent(),m.geometry.dispose(),h.dispose()}}}function mn(n,e){const t=new te,s=new B({uniforms:{uColor:{value:new z(6990079)},uWall:{value:0}},vertexShader:`
      varying vec3 vNormal; varying vec3 vView;
      void main() { vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,fragmentShader:`
      uniform vec3 uColor; uniform float uWall; varying vec3 vNormal; varying vec3 vView;
      void main() { float rim = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 4.0); gl_FragColor = vec4(uColor * rim * (0.07 + 0.02 * sin(uWall * 0.5)), 1.0); }
    `,blending:Y,transparent:!0,depthWrite:!1,side:xe});for(const[a,o]of[[1.7,.35],[3.2,.9]]){const r=new F(new Ae(e*a,e*o,32,128),s);r.rotation.x=Math.PI/2,r.scale.z=1.3,t.add(r)}return n.add(t),{update:(a,o)=>{s.uniforms.uWall.value=o},dispose:()=>{t.removeFromParent(),t.traverse(a=>a.geometry?.dispose()),s.dispose()}}}const pn=`
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
`,fn=`
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
`,gn={volcanic:{vents:7,particlesPerVent:260,height:.16,rate:.1,gravity:1,spread:.7,size:.022,hot:16752704,cool:3813416,glow:1,opacity:.9,additive:!1,wind:.3},smoke:{vents:9,particlesPerVent:200,height:.1,rate:.05,gravity:.2,spread:.35,size:.03,hot:4867136,cool:2104866,glow:0,opacity:.6,additive:!1,wind:1.6},seeps:{vents:12,particlesPerVent:120,height:.05,rate:.07,gravity:.1,spread:.6,size:.024,hot:11075440,cool:5933632,glow:.3,opacity:.4,additive:!0,wind:1},snow:{vents:10,particlesPerVent:160,height:.025,rate:.08,gravity:0,spread:1.6,size:.03,hot:16054527,cool:14674164,glow:0,opacity:.3,additive:!1,wind:3,latitude:[.6,.95]}};function vn(n,e,t,s,a){const o=Fe(t),r=s.vents*s.particlesPerVent,l=new Float32Array(r*3),c=new Float32Array(r*4);for(let m=0;m<s.vents;m++){let p=nn(o);if(s.latitude){const g=(s.latitude[0]+o()*(s.latitude[1]-s.latitude[0]))*(o()<.5?-1:1),w=Math.sqrt(1-g*g),v=o()*Math.PI*2;p=new y(w*Math.cos(v),g,w*Math.sin(v))}const f=.6+o()*.8;for(let g=0;g<s.particlesPerVent;g++){const w=m*s.particlesPerVent+g;l.set([p.x,p.y,p.z],w*3),c.set([o(),(.7+o()*.6)*f,o()*s.spread,e*s.size*(.6+o()*.8)],w*4)}}const d=new de;d.setAttribute("position",new K(new Float32Array(r*3),3)),d.setAttribute("vent",new K(l,3)),d.setAttribute("params",new K(c,4));const u=new B({uniforms:{uWall:{value:0},uRadius:{value:e*1.002},uHeight:{value:e*s.height},uRate:{value:s.rate},uGravity:{value:s.gravity},uPixelRatio:{value:Math.min(window.devicePixelRatio,2)},uWind:{value:s.wind},uHot:{value:new z(s.hot)},uCool:{value:new z(s.cool)},uGlow:{value:s.glow},uOpacity:{value:s.opacity},uLightDir:a.uLightDir},vertexShader:pn,fragmentShader:fn,transparent:!0,depthWrite:!1,blending:s.additive?Y:ai}),h=new Le(d,u);return h.frustumCulled=!1,h.renderOrder=1,n.add(h),{surface:h,update:(m,p)=>{u.uniforms.uWall.value=p},dispose:()=>{h.removeFromParent(),d.dispose(),u.dispose()}}}function xn(n,e,t){const s=Fe(t),a=e*.06,o=new te,r=new fe(a,a,a),l=new F(r,new bt({color:328967,metalness:.3,roughness:.08,clearcoat:1})),c=new wt({color:8440063,transparent:!0,blending:Y}),d=new dt(new da(r),c);o.add(l,d),n.add(o);const u=gt(s,e*1.9,.5,4e4);return{update:(h,m)=>{Te(u,h,o.position),o.rotation.set(m*.05,m*.08,0),c.opacity=.35+.65*Math.pow(.5+.5*Math.sin(m*1.2),3)},dispose:()=>{o.removeFromParent(),r.dispose(),d.geometry.dispose(),l.material.dispose(),c.dispose()}}}function xs(n,e,t,s){const a=Fe(t),o=s==="shards"?70:600;let r,l;if(s==="shards")r=new ti(e*.02,0).scale(.5,1.8,.5),l=new bt({color:13154559,metalness:.1,roughness:.05,iridescence:1,iridescenceIOR:1.6,clearcoat:1,emissive:2756704,emissiveIntensity:.6});else{r=new si(e*.012,1);const v=r.getAttribute("position");for(let S=0;S<v.count;S++)v.setXYZ(S,v.getX(S)*(.7+a()*.6),v.getY(S)*(.6+a()*.5),v.getZ(S)*(.7+a()*.6));r.computeVertexNormals(),l=new ie({color:6971994,roughness:.95,metalness:.05,flatShading:!0})}const c=new ha(r,l,o);c.frustumCulled=!1;const d=[],u=[],h=[];for(let v=0;v<o;v++){const S=s==="shards"?e*(1.4+a()*.8):e*(1.15+Math.pow(a(),2)*.6);d.push(gt(a,S,s==="shards"?1.2:.15,9e3*Math.pow(S/e,1.5))),u.push(new y(a(),a(),a()).multiplyScalar(.4)),h.push(s==="shards"?.5+a():.3+Math.pow(a(),3)*2.5)}n.add(c);const m=new yt,p=new Ue,f=new Yt,g=new y,w=new y;return{update:(v,S)=>{for(let j=0;j<o;j++)Te(d[j],v,g),f.set(u[j].x*S,u[j].y*S,u[j].z*S),p.setFromEuler(f),w.setScalar(h[j]),c.setMatrixAt(j,m.compose(g,p,w));c.instanceMatrix.needsUpdate=!0},dispose:()=>{c.removeFromParent(),r.dispose(),l.dispose()}}}function yn(n,e,t){const s=new B({uniforms:{uWall:{value:0},uColor:{value:new z(10146047)},uLightDir:t.uLightDir,uOctaves:{value:3}},vertexShader:`
      varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() { vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vNormal = normalize(normalMatrix * normal); vView = -mv.xyz; gl_Position = projectionMatrix * mv; }
    `,fragmentShader:`
      ${ke}
      uniform float uWall; uniform vec3 uColor; varying vec2 vUv; varying vec3 vNormal; varying vec3 vView;
      void main() {
        float core = pow(abs(dot(normalize(vNormal), normalize(vView))), 2.0);
        float knots = 0.6 + 0.4 * snoise(vec3(vUv.y * 12.0 - uWall * 2.0, 0.0, 0.0));
        float fade = (1.0 - vUv.y) * smoothstep(0.0, 0.05, vUv.y);
        gl_FragColor = vec4(uColor * core * knots * fade * 1.6, 1.0);
      }
    `,blending:Y,transparent:!0,depthWrite:!1,side:xe}),a=new te;for(const o of[1,-1]){const r=new F(new $e(e*.08,e*.015,e*3,24,1,!0),s);r.position.y=o*e*2.5,o<0&&(r.rotation.z=Math.PI),a.add(r)}return n.add(a),{surface:a,update:(o,r)=>{s.uniforms.uWall.value=r},dispose:()=>{a.removeFromParent(),a.traverse(o=>o.geometry?.dispose()),s.dispose()}}}const tt=16765562,st=16774364,wn=`
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
`,bn=`
${ke}
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
`,Sn=`
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
`,Mn=`
${Ze}
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
`,kn=`
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
`,jn=`
uniform vec3 uColor;
varying float vGlow;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float core = exp(-d * d * 7.0);
  gl_FragColor = vec4(mix(uColor, vec3(1.0), core * 0.5) * core * vGlow, 1.0);
}
`,Cn=`
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
`;function Nn(n,e,t,s){const a=Fe(t),o=new te,r={blending:Y,transparent:!0,depthWrite:!1},l=[],c=[],d=new B({uniforms:{uWall:{value:0},uR:{value:e},uColor:{value:new z(tt)},uColor2:{value:new z(st)},uOctaves:{value:3}},vertexShader:wn,fragmentShader:bn,...r}),u=new ge(e*9,e*9),h=new F(u,d);h.frustumCulled=!1,h.renderOrder=4,o.add(h),l.push(u,d),c.push(d);const m=[];for(let C=0;C<3;C++){const R=e*(1.6+C*.36),L=e*.13,T=new Ut(R,R+L,256,1),A=R+L/2,O=Math.round(Math.PI*2*A/(L*.44*.62)),H=new B({uniforms:{uWall:{value:0},uInner:{value:R},uOuter:{value:R+L},uCells:{value:O},uSpeed:{value:(.6+a()*.8)*(C%2?-1:1)},uSeedF:{value:a()*100},uColor:{value:new z(tt)},uColor2:{value:new z(st)}},vertexShader:"varying vec2 vPos; void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:Sn,side:xe,...r}),q=new F(T,H);q.renderOrder=4,q.rotation.set(Math.PI/2+(a()-.5)*1.4,(a()-.5)*1.4,a()*Math.PI),o.add(q),m.push({mesh:q,spin:(.02+a()*.03)*(C%2?-1:1),base:q.rotation.z}),l.push(T,H),c.push(H)}const p=(1+Math.sqrt(5))/2,f=[[0,1,p],[0,-1,p],[1,p,0],[-1,p,0],[p,0,1],[-p,0,1]].map(([C,R,L])=>new y(C,R,L).normalize()),g=Ge(n,e,1.004,Mn,tt,st,.55,t+11,s,!0);g.material.uniforms.uAxes={value:f};const w=700,v=new Float32Array(w*4),S=new Float32Array(w),j=new Float32Array(w);for(let C=0;C<w;C++)v.set([e*(1.15+Math.pow(a(),1.5)*1.6),(a()-.5)*2.4,a()*Math.PI*2,a()*Math.PI*2],C*4),S[C]=(.03+a()*.06)*(a()<.5?-1:1),j[C]=a();const P=new de;P.setAttribute("position",new K(new Float32Array(w*3),3)),P.setAttribute("orbit",new K(v,4)),P.setAttribute("speed",new K(S,1)),P.setAttribute("twinkle",new K(j,1));const N=new B({uniforms:{uTime:{value:0},uWall:{value:0},uPixels:{value:900},uColor:{value:new z(tt)}},vertexShader:kn,fragmentShader:jn,...r}),M=new Le(P,N);M.frustumCulled=!1,o.add(M),l.push(P,N),c.push(N);const I=new ne(e,96,48),_=[0,1].map(()=>{const C=new B({uniforms:{uAge:{value:0},uColor:{value:new z(st)}},vertexShader:ja,fragmentShader:Cn,...r}),R=new F(I,C);return R.renderOrder=4,o.add(R),l.push(C),{mesh:R,material:C}});return l.push(I),n.add(o),{update:(C,R)=>{for(const L of c)L.uniforms.uWall.value=R;g.update(C,R);for(const L of m)L.mesh.rotation.z=L.base+R*L.spin;_.forEach((L,T)=>{const A=((R/7+T*.5)%1+1)%1;L.material.uniforms.uAge.value=A,L.mesh.scale.setScalar(1.02+A*2.2)})},dispose:()=>{o.removeFromParent(),g.dispose(),l.forEach(C=>C.dispose())},surface:g.mesh}}class Tn{live=[];constructor(e,t){const{scene:s,radius:a,seed:o,shared:r}=t;let l=0;const c=()=>o+7919*++l;for(const d of e)switch(d){case"satellites":this.live.push(vs(s,a,c(),48,!0,!1));break;case"swarm":this.live.push(vs(s,a,c(),320,!1,!0),ln(s,a));break;case"aurora":this.live.push(Ge(s,a,1.03,cn,t.auroraColor?.[0]??4259728,t.auroraColor?.[1]??16728192,1.4,c(),r,!1));break;case"belts":this.live.push(mn(s,a));break;case"volcanic":case"smoke":case"seeps":case"snow":this.live.push(vn(s,a,c(),gn[d],r));break;case"livingGas":this.live.push(Ge(s,a,1.018,hn,11559167,4251903,.9,c(),r,!0));break;case"presence":this.live.push(Ge(s,a,1.12,dn,14742783,10535167,.5,c(),r,!1));break;case"ripples":this.live.push(Ge(s,a,1.08,un,9067775,4243711,.8,c(),r,!1));break;case"monolith":this.live.push(xn(s,a,c()));break;case"shards":this.live.push(xs(s,a,c(),"shards"));break;case"debris":this.live.push(xs(s,a,c(),"debris"));break;case"jets":this.live.push(yn(s,a,r));break;case"divine":this.live.push(Nn(s,a,c(),r));break}}update(e,t,s){for(const a of this.live)a.surface?.quaternion.copy(s),a.update(e,t)}dispose(){this.live.forEach(e=>e.dispose()),this.live=[]}}function An(n){const e=new Set,t=String(n?.planet_info?.type??n?.original_planet_data?.planet_type??"").toLowerCase().replace(/_/g," "),s=String(n?.original_planet_data?.life_forms??"None"),a=n?.surface_elements??{};return s==="Intelligent Life"&&e.add("satellites"),s==="Robotic Entities"&&e.add("swarm"),s==="Conscious Gas"&&e.add("livingGas"),s==="Non-Physical Entity"&&e.add("presence"),s==="Have I just found God?"&&e.add("divine"),(t==="lava"||t==="molten core"||t==="magma")&&e.add("volcanic"),t==="carbon"&&e.add("smoke"),(t==="toxic"||t==="swamp"&&a.toxic_bubbles)&&e.add("seeps"),(t==="tundra"||t==="desert"||t==="carbon"||t==="toxic")&&e.add("snow"),t==="radioactive"&&(e.add("belts"),e.add("aurora")),t==="exotic"&&e.add("shards"),t==="anomaly"&&(e.add("ripples"),e.add("monolith"),e.add("jets")),a.has_fragmentation_zones&&e.add("debris"),e}const Ca=`
uniform vec3 uDeep, uShallow, uLow, uMid, uHigh, uPeak, uAccent, uEmissive;
uniform float uSea, uRelief, uContinentScale, uIceCap, uVegetation, uSpecular, uRoughness, uMetal;
uniform float uEmission, uCityLights, uCraters, uBands, uStorms, uClouds, uTime, uCloudSpin;
uniform vec3 uSeed;
uniform vec3 uCloudColor;
// Per-planet structure: variant of the family (0..3), twist of the shapes, feature size
uniform float uVariant, uWarp, uFeature, uLifeGlow, uBandFreq, uBloom;
// Kind within a family that holds several planet types (see PlanetLook.style)
uniform float uStyle;
`,Na=`
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
`,ys=`
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
`,Pn=`
${ke}
${wa}
${Ca}
${Na}
uniform mat3 uWorldToObject;
varying vec3 vObj;
varying vec3 vWorldPos;
varying vec3 vWorldNormal;
#if defined(HAS_RINGS)
${Sa}
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
  }
#endif
  // Hazy, darker poles
  albedo *= 1.0 - smoothstep(0.75, 0.98, alat) * 0.35;
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
`,In=`
${ke}
${wa}
${Ca}
${Na}
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
`,Rn=`
varying vec3 vWorldPos;
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`,En=`
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
  vec3 sumR = vec3(0.0), sumM = vec3(0.0);
  float depthR = 0.0, depthM = 0.0;
  for (int i = 0; i < STEPS; i++) {
    vec3 x = o + d * (t0 + ds * (float(i) + 0.5));
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
`,Ln=1.45;class _n{constructor(e,t,s,a,o,r=new Set){this.look=e,this.mesh=t,this.scene=s,this.radius=a,this.shared={uLightDir:{value:new y(1,0,0)},uSunColor:{value:new z(1,1,1)},uSunIntensity:{value:Ln},uOctaves:{value:6},uTime:{value:0},uCloudSpin:{value:0},uWorldToObject:{value:this.worldToObject},uDeep:{value:e.deep},uShallow:{value:e.shallow},uLow:{value:e.low},uMid:{value:e.mid},uHigh:{value:e.high},uPeak:{value:e.peak},uAccent:{value:e.accent},uEmissive:{value:e.emissive},uSea:{value:e.seaLevel},uRelief:{value:e.relief},uContinentScale:{value:e.continentScale},uIceCap:{value:e.iceCap},uVegetation:{value:e.vegetation},uSpecular:{value:e.specular},uRoughness:{value:e.roughness},uMetal:{value:e.metal},uEmission:{value:e.emission},uCityLights:{value:e.cityLights},uCraters:{value:e.craters},uBands:{value:e.bands},uStorms:{value:e.storms},uClouds:{value:e.clouds},uCloudColor:{value:e.cloudColor},uSeed:{value:e.seed},uVariant:{value:e.variant},uStyle:{value:e.style},uWarp:{value:e.warp},uFeature:{value:e.featureScale},uLifeGlow:{value:e.lifeGlow},uBandFreq:{value:e.bandFrequency},uBloom:{value:e.bloom}};const l={[`FAMILY_${e.family.toUpperCase()}`]:""};if(o?.has_rings&&o.bands?.length){const c=new z(13483940).lerp(e.mid,.25);this.rings=new an(o,a,c,this.shared),s.add(this.rings.mesh),l.HAS_RINGS="",Object.assign(this.shared,{uRingBands:{value:this.rings.bands},uRingBandCount:{value:this.rings.bandCount},uRingSeed:{value:this.rings.seed},uRingNormal:{value:this.rings.normal},uPlanetRadius:{value:a}})}if(this.surface=new B({uniforms:this.shared,vertexShader:ys,fragmentShader:Pn,defines:l}),t.material=this.surface,e.clouds>.01){const c=new B({uniforms:this.shared,vertexShader:ys,fragmentShader:In,defines:l,transparent:!0,depthWrite:!1});this.cloudMesh=new F(new ne(a*1.007,128,64),c),this.cloudMesh.name="realistic-clouds",s.add(this.cloudMesh)}if(e.atmosphereDensity>0){this.atmosphereRadius=a*(1+e.atmosphereHeight);const c=this.atmosphereRadius-a,d=c*.25,u=c*.1,h=new y(e.atmosphere.r,e.atmosphere.g,e.atmosphere.b);h.divideScalar(Math.max(h.x,h.y,h.z,.001));const m=h.multiplyScalar(.22*e.atmosphereDensity/d),p=.035*e.atmosphereDensity/u;this.atmosphereMaterial=new B({uniforms:{uLightDir:this.shared.uLightDir,uSunColor:this.shared.uSunColor,uSunIntensity:this.shared.uSunIntensity,uPlanetRadius:{value:a},uAtmosphereRadius:{value:this.atmosphereRadius},uBetaR:{value:m},uBetaM:{value:p},uScaleR:{value:d},uScaleM:{value:u}},vertexShader:Rn,fragmentShader:En,blending:Y,transparent:!0,depthWrite:!1}),this.atmosphereMesh=new F(new ne(this.atmosphereRadius,128,64),this.atmosphereMaterial),this.atmosphereMesh.name="realistic-atmosphere",this.atmosphereMesh.renderOrder=2,s.add(this.atmosphereMesh)}e.family==="terran"&&e.atmosphereDensity>=.8&&r.add("aurora"),this.effects=new Tn(r,{scene:s,radius:a,seed:Math.floor(e.seed.x*1e4+e.seed.y*100),shared:this.shared})}look;mesh;scene;radius;surface;cloudMesh=null;atmosphereMesh=null;atmosphereMaterial=null;shared;worldToObject=new ra;atmosphereRadius=0;rings=null;effects;update(e){const t=this.shared;t.uLightDir.value.copy(e.lightDir).normalize(),t.uSunColor.value.copy(e.sunColor);const s=e.camera.position.length(),a=Math.tan(E.degToRad(e.camera.fov/2)),o=this.radius/Math.max(s-this.radius*.98,1e-4)/a*e.viewportHeight*.5;t.uOctaves.value=E.clamp(Math.log2(Math.max(o,1))-.5,2.5,e.maxOctaves),t.uTime.value=e.elapsed%2e4,t.uCloudSpin.value=e.elapsed/Math.max(e.rotationPeriod,3600)*Math.PI*2*.035%(Math.PI*2),this.mesh.updateMatrixWorld(),this.worldToObject.setFromMatrix4(this.mesh.matrixWorld).invert(),this.cloudMesh&&(this.cloudMesh.position.copy(this.mesh.position),this.cloudMesh.quaternion.copy(this.mesh.quaternion)),this.atmosphereMesh&&this.atmosphereMaterial&&(this.atmosphereMaterial.side=s>this.atmosphereRadius*1.002?ca:ii),this.effects.update(e.elapsed,performance.now()/1e3,this.mesh.quaternion)}dispose(){this.surface.dispose(),this.rings?.dispose(),this.effects.dispose();for(const e of[this.cloudMesh,this.atmosphereMesh])e&&(this.scene.remove(e),e.geometry.dispose(),e.material.dispose())}}const b=n=>new z(n);function Fn(n){let e=n%2147483647;return e<=0&&(e+=2147483646),()=>(e=e*16807%2147483647)/2147483647}function zn(n){const e=String(n?.seeds?.planet_seed??n?.seeds?.shape_seed??n?.planet_info?.name??"atlas");let t=2166136261;for(let s=0;s<e.length;s++)t=Math.imul(t^e.charCodeAt(s),16777619);return Math.abs(t)||1}function X(n,e,t){const s={h:0,s:0,l:0};e.getHSL(s);const a=new z().setHSL(s.h,Math.min(s.s,.55),E.clamp(s.l,.25,.6));return n.clone().lerp(a,t)}function se(n,e,t=.03,s=.12){const a={h:0,s:0,l:0};return n.getHSL(a),new z().setHSL((a.h+(e()-.5)*t+1)%1,a.s,E.clamp(a.l*(1+(e()-.5)*s),0,1))}const ye=(n,e)=>e[Math.floor(n()*e.length)%e.length],Wn={Breathable:{color:5213695,density:1},Thick:{color:13154458,density:1.8},Thin:{color:10467552,density:.35},"Carbon Dioxide":{color:14721136,density:1.2},Methane:{color:5941208,density:1},Nitrogen:{color:6262783,density:.9},"Oxygen-Rich":{color:7315711,density:1.1},"Sulfur Dioxide":{color:15258474,density:1.4},Superheated:{color:16742976,density:1.5},Acidic:{color:11063392,density:1.3},Toxic:{color:11563216,density:1.4},Hydrogen:{color:15775944,density:1},Helium:{color:16182472,density:.9},Ammonia:{color:15128720,density:1.1},Ionic:{color:4245759,density:1},Plasma:{color:16740544,density:1.2},"Exotic Gases":{color:12611839,density:1.2},"Water Vapor":{color:10277119,density:1.2},Frozen:{color:14216447,density:.6}};function Dn(n){const e=n.original_planet_data??n.planet_info??{},t=String(n.planet_info?.type??e.planet_type??"Rocky").replace(/_/g," "),s=n.planet_info?.base_color,a=typeof s=="string"?new z(s):new z(8421504),o=zn(n),r=Fn(o),l=Number(e.surface_temperature??n.planet_info?.surface_temperature??15),c=String(e.life_forms??n.life_forms?.type??"None"),d=String(n.atmosphere?.type??e.atmosphere??"None"),u=Wn[d],h={family:"barren",variant:Math.floor(r()*4),style:0,warp:.3+r()*.9,featureScale:.7+r()*.9,deep:b(333358),shallow:b(1003374),low:b(5204782),mid:b(8022600),high:b(7037530),peak:b(15922422),accent:b(3103262),emissive:b(16752704),seaLevel:-2,relief:.8+r()*.6,continentScale:.8+r()*1.1,iceCap:2,vegetation:0,specular:.05,roughness:.85,metal:0,emission:0,cityLights:c==="Intelligent Life"?1:0,craters:0,lifeGlow:c==="Silicon-Based Life"?1:0,bloom:c==="Bacteria"?1:c==="Animal Life"||c==="Vegetation"?.35:c==="Vegetable Animals"?.6:0,clouds:0,cloudColor:b(16777215),atmosphere:b(u?u.color:8956671),atmosphereHeight:.025,atmosphereDensity:u?u.density:0,bands:0,bandFrequency:10+r()*12,storms:0,seed:new y(r()*100,r()*100,r()*100)},m=f=>(r()-.5)*2*f,p=()=>E.clamp(.88+(l-15)/160+m(.04),.3,2);switch(t){case"Oceanic":case"Aquifer":h.family="terran",h.seaLevel=(t==="Oceanic"?.22:.12)+m(.06),h.deep=X(b(134950),a,.08),h.shallow=t==="Aquifer"?b(1278090):X(b(739952),a,.12),h.vegetation=.7,h.clouds=.38,h.iceCap=p();break;case"Super Earth":case"Sub Earth":case"Forest":h.family="terran",h.seaLevel=(t==="Forest"?-.02:.03)+m(.08),h.relief*=t==="Super Earth"?1.4:1,h.vegetation=t==="Forest"?1:.75,h.accent=se(X(b(t==="Forest"?2050583:3103262),a,.2),r),h.low=se(X(b(4416554),a,.15),r),h.clouds=.42,h.iceCap=p();break;case"Savannah":h.family="terran",h.seaLevel=-.16+m(.06),h.vegetation=.45,h.low=se(X(b(10521162),a,.25),r),h.mid=b(9073220),h.accent=b(5660714),h.clouds=.28,h.iceCap=p();break;case"Swamp":h.family="terran",h.seaLevel=.04+m(.04),h.deep=b(860184),h.shallow=b(2968106),h.low=se(b(3820066),r),h.accent=b(2504730),h.vegetation=1,h.relief*=.5,h.clouds=.55,h.iceCap=2;break;case"Tundra":h.family="terran",h.seaLevel=-.08+m(.06),h.low=b(6974034),h.mid=b(9078390),h.accent=b(5069374),h.vegetation=.3,h.iceCap=.45+m(.08),h.clouds=.45;break;case"Desert":case"Arid":h.family="desert",h.low=se(X(b(t==="Desert"?12620378:11035196),a,.2),r),h.mid=X(b(t==="Desert"?10514495:9062958),a,.2),h.high=b(t==="Desert"?6177840:4860960),h.peak=b(t==="Desert"?14730388:14203040),h.relief*=1.1,h.craters=t==="Arid"?.5:.15,h.clouds=t==="Arid"?.08:.04,h.atmosphereHeight=.02,u||(h.atmosphere=b(14196848),h.atmosphereDensity=.45);break;case"Rocky":case"Cave":case"Carbon":h.family="barren",h.low=se(X(b(t==="Carbon"?1315860:7236198),a,t==="Carbon"?.1:.25),r),h.mid=X(b(t==="Carbon"?2236446:8814714),a,.2),h.high=b(t==="Carbon"?3025962:10130572),h.peak=b(t==="Carbon"?4209722:12104362),h.craters=t==="Cave"?.6:.6+r()*.4,h.relief*=t==="Cave"?1.6:1.2,h.specular=t==="Carbon"?.35:.04,h.roughness=t==="Carbon"?.4:.9;break;case"Metallic":{h.family="metal";const f=ye(r,[[9211796,11843516,5922146,8008728],[10511422,13142620,6962212,3115636],[11570240,14202984,6967328,5917226],[8028296,10134704,4608092,4864650],[7368816,10132122,3815994,9059350]]);h.low=X(b(f[0]),a,.12),h.mid=b(f[1]),h.high=b(f[2]),h.accent=b(f[3]),h.specular=1,h.roughness=.12+r()*.2,h.metal=1,h.craters=.4+r()*.4;break}case"Crystalline":h.family="crystal",h.low=b(1709606),h.mid=se(X(b(7002344),a,.45),r,.25,.2),h.high=se(X(b(10124008),a,.3),r,.25,.2),h.accent=b(ye(r,[16740560,7405528,16765040,8429823])),h.specular=1,h.roughness=.06,h.craters=.15;break;case"Diamond":{h.family="diamond";const f=ye(r,[15397631,12574975,16773312,16766186]);h.low=b(f),h.mid=b(16777215),h.high=b(2500652),h.accent=b(10148095),h.specular=1,h.roughness=.03;break}case"Icy":h.family="ice",h.low=se(b(13163756),r,.04),h.mid=b(15134968),h.high=b(11060444),h.accent=X(b(ye(r,[6986432,10119760,8022672])),a,.3),h.specular=.6,h.roughness=.3,h.craters=.3+r()*.5,h.clouds=.15;break;case"Lava":case"Magma":case"Molten Core":h.family="lava",h.style=t==="Magma"?1:t==="Molten Core"?2:0,h.low=b(1709074),h.mid=b(2760732),h.high=b(3813418),h.emissive=X(b(t==="Molten Core"?16756800:16734746),a,.2),h.emission=(t==="Molten Core"?1:t==="Magma"?.85:.7)*(.85+r()*.3),h.relief*=1.2,u||(h.atmosphere=b(16738864),h.atmosphereDensity=.6);break;case"Gas Giant":case"Frozen Gas Giant":case"Nebulous":{h.family="gas";const f=t==="Frozen Gas Giant",g=t==="Nebulous";h.style=f?1:g?2:0,h.low=se(X(b(f?5940944:g?14196944:14200968),a,f?.2:.35),r,.05),h.mid=se(X(b(f?3108784:g?10514632:11565648),a,f?.15:.3),r,.05),h.high=b(f?15267583:g?15782128:15786184),h.accent=b(f?1194616:g?7360704:9062960),h.bands=(f||g?.6:1)*(.7+r()*.6),h.storms=(f?.7:1)*(.4+r()*.9),h.emission=g?.25:0,h.emissive=b(12615935),h.atmosphere=b(f?9097456:g?13668592:15255712),h.atmosphereDensity=f?.55:1.2,h.atmosphereHeight=.03;break}case"Toxic":h.family="veiled",h.low=se(X(b(11055184),a,.25),r),h.mid=X(b(8030768),a,.25),h.high=b(13684872),h.bandFrequency=5+r()*6,h.atmosphere=u?h.atmosphere:b(12107872),h.atmosphereDensity=Math.max(h.atmosphereDensity,1.6),h.atmosphereHeight=.04;break;case"Radioactive":h.family="radioactive",h.low=se(b(2500126),r),h.mid=b(3815980),h.high=b(4868666),h.emissive=b(ye(r,[8257354,4915104,13172544])),h.emission=1,h.craters=.7,h.atmosphere=b(u?u.color:9109360).lerp(b(9109360),.65),h.atmosphereDensity=Math.max(u?u.density:0,.5);break;case"Exotic":h.family="exotic",h.low=se(X(b(2627656),a,.4),r,.3),h.mid=se(X(b(5913242),a,.4),r,.3),h.high=b(14733567),h.accent=b(ye(r,[16728256,4259808,16764992,8413439])),h.emissive=h.accent.clone(),h.emission=.7,h.specular=.8,h.roughness=.15,u||(h.atmosphere=b(12611839),h.atmosphereDensity=.8);break;case"Anomaly":h.family="anomaly",h.low=b(131590),h.mid=b(657428),h.high=b(1709104),h.accent=b(ye(r,[9067775,4243711,16735370])),h.emissive=h.accent.clone(),h.emission=1,h.atmosphereDensity=0;break}return h.family==="terran"&&(l<-60||l>85)&&(h.vegetation*=.2),h.family!=="terran"&&h.family!=="desert"&&(h.cityLights*=h.family==="barren"||h.family==="ice"?.6:0),h.clouds=E.clamp(h.clouds*(.7+r()*.6)*(h.atmosphereDensity>0?1:0),0,.85),h}const re=2.5,ws={red:16724736,yellow:16777130,blue:8965375,orange:16755268,white:16777215,purple:12290303},Gn={"Red Dwarf":1,"Yellow Dwarf":2,"Blue Giant":8,"Red Giant":3,"White Dwarf":2.5,"Neutron Star":1.5},bs=200,On=2.2,Vn=.06,qn=`
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
`;class Hn{scene=new be;camera=new Ht(60,1,.01,5e3);ready=!1;error=null;moonCount=0;moons=[];focusMoon=null;source;mesh;moonSystem;lights=[];fillLight;data=null;disposed=!1;realistic=null;sunDirection=new y(1,0,0);viewportHeight=900;constructor(e){this.source=e;const t=new ne(re,128,64);this.mesh=new F(t,new Ye({color:8421504})),this.mesh.castShadow=!0,this.mesh.receiveShadow=!0,this.scene.add(this.mesh),this.moonSystem=new li(this.scene,re,this.camera,new y,e.timing.cosmic_origin_time);const s=e.stars.length?e.stars:[{Type:"Yellow Dwarf",Color:"yellow",Size:1}];s.forEach((a,o)=>{const r=new qe(ws[a.Color?.toLowerCase()]??16777215,1);r.target.position.set(0,0,0),r.castShadow=!1,this.scene.add(r,r.target),this.lights.push(r)}),this.fillLight=new qe(16777215,.005),this.scene.add(this.fillLight),this.moonLight=new qe(ws[s[0].Color?.toLowerCase()]??16777215,On),this.moonLight.target.position.set(0,0,0),this.scene.add(this.moonLight,this.moonLight.target,new la(10466512,Vn))}moonLight;eclipse={uEclipseLight:{value:new y(1,0,0)},uEclipseRadius:{value:re},uEclipseGlow:{value:0}};applyEclipses(){this.scene.traverse(e=>{const t=e;if(!t.isMesh||!t.name.startsWith("moon-surface-"))return;const s=t.material;s.userData.eclipse||(s.userData.eclipse=!0,s.onBeforeCompile=a=>{Object.assign(a.uniforms,this.eclipse),a.vertexShader=a.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vEclipseWorld;`).replace("#include <fog_vertex>",`#include <fog_vertex>
vEclipseWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;`),a.fragmentShader=a.fragmentShader.replace("#include <common>",`#include <common>
${qn}`).replace("#include <lights_fragment_end>",`#include <lights_fragment_end>
{ vec3 eclipse = eclipseLight(vEclipseWorld); reflectedLight.directDiffuse *= eclipse; reflectedLight.directSpecular *= eclipse; }`)},s.needsUpdate=!0)})}moonSunlight(e){const t=this.moonPosition(e);if(!t)return 1;const s=this.eclipse.uEclipseLight.value,a=t.dot(s);if(a>0)return 1;const o=t.clone().addScaledVector(s,-a).length(),r=re*.04+-a*.012;return E.smoothstep(o,re-r,re+r)}get unitsPerAU(){return re/this.source.visualRadiusAU}async load(){try{const t=await(await fetch(this.source.dataUrl,{credentials:"same-origin"})).json();if(!t.success)throw new Error(t.error||"Failed to fetch planet data");if(this.disposed)return;const s=t.planet_data,a=t.timing,o=t.rendering_data??{};if(this.data={planet_info:o.planet_info??{name:s.name,type:s.planet_type,base_color:"#808080",radius:s.diameter/15e3,orbital_radius:s.orbital_radius},surface_elements:o.surface_elements,atmosphere:o.atmosphere,rings:o.rings,moons:o.moons,effects_3d:o.effects_3d,shader_uniforms:o.shader_uniforms,universal_actions:o.universal_actions,stellar_composition:o.stellar_composition,timing:{cosmic_origin_time:a.cosmic_origin_time,current_time_seconds:a.current_time_seconds,elapsed_time:a.elapsed_time,initial_orbital_angle:s.initial_orbital_angle,current_orbital_angle:s.current_orbital_angle,max_orbital_radius:a.max_orbital_radius,system_max_orbital_radius:s.system_max_orbital_radius},original_planet_data:s,seeds:o.seeds},this.data.moons?.moons?.length){this.moonCount=this.data.moons.moons.length,this.moons=this.data.moons.moons.map(l=>({name:l.name,type:l.properties?.type??"unknown",origin:l.properties?.origin??"unknown",radiusKm:l.properties?.radius_km??0,semiMajorAxisKm:l.orbit?.semi_major_axis_km??0,periodDays:l.orbit?.orbital_period_days??0,eccentricity:l.orbit?.eccentricity??0,inclinationDeg:l.orbit?.inclination_deg??0,tidallyLocked:!!l.rotation?.is_tidally_locked,massKg:l.properties?.mass_kg??0,densityKgM3:l.properties?.density_kg_m3??0})),this.moonSystem.loadMoonSystem({...this.data.moons,cosmic_origin_time:a.cosmic_origin_time,planet_mass:s.mass||1e24,planet_radius:re,moons:this.data.moons.moons.map(l=>({...l,rotation:{rotation_period_s:l.orbit.orbital_period_seconds||86400,rotation_period_hours:(l.orbit.orbital_period_seconds||86400)/3600,angular_velocity_rad_s:2*Math.PI/(l.orbit.orbital_period_seconds||86400),is_tidally_locked:!0}}))});const r=String(s.atmosphere??"").toLowerCase();this.eclipse.uEclipseGlow.value=r&&r!=="none"&&!r.includes("no atmosphere")?.35:0,this.applyEclipses()}this.realistic=new _n(Dn(this.data),this.mesh,this.scene,re,this.data.rings,An(this.data)),this.ready=!0}catch(e){this.error=e instanceof Error?e.message:String(e)}}update(e,t,s,a,o,r){const l=this.unitsPerAU;this.camera.position.copy(t).sub(s).multiplyScalar(l),this.camera.quaternion.copy(a);const c=this.camera.position.length();let d=Math.max(.002,Math.min(c-re,c*.5)*.5);const u=this.focusMoon?this.moonPosition(this.focusMoon):null;if(u&&(d=Math.min(d,Math.max(2e-4,(u.distanceTo(this.camera.position)-this.moonRadiusUnits(this.focusMoon))*.5))),this.camera.near=d,this.camera.far=c+4e3,this.camera.updateMatrixWorld(),!this.ready||!this.data)return;const h=this.data.original_planet_data,m=o-this.source.timing.cosmic_origin_time;this.mesh.rotation.y=m*(2*Math.PI/(h.rotation_period_seconds||86400))%(2*Math.PI),this.mesh.rotation.z=(h.axial_tilt||0)*Math.PI/180;const f=20+h.orbital_radius/Math.max(this.source.maxOrbitalRadius,1e-9)*80;let g=0;const w=this.lights.map((S,j)=>{const P=this.source.stars[j],N=Gn[P?.Type]??2,M=Math.min(3,Math.max(.05,N*300/(f*f)));return g+=M,M});g=Math.min(3,g),this.lights.forEach((S,j)=>{const N=(this.source.starOffsets[j]??new y).clone().sub(s).normalize();S.position.copy(N).multiplyScalar(bs),S.intensity=j===0?g:w[j]*.35,j===0&&(this.moonLight.position.copy(S.position),this.eclipse.uEclipseLight.value.copy(N),this.sunDirection.copy(N))}),this.realistic&&this.realistic.update({lightDir:this.sunDirection,sunColor:new z(1,1,1).lerp(this.lights[0]?.color??new z(1,1,1),.3),camera:this.camera,viewportHeight:this.viewportHeight,maxOctaves:this.source.maxOctaves??7.5,elapsed:m,rotationPeriod:Math.abs(h.rotation_period_seconds||86400)});const v=s.clone().normalize();if(this.fillLight.position.copy(v).multiplyScalar(bs*.5),this.moonSystem.setTimeOffset(r),this.moonSystem.update(),this.focusMoon)for(const S of[`moon-indicator-${this.focusMoon}`,`moon-indicator-hitarea-${this.focusMoon}`]){const j=this.scene.getObjectByName(S);j&&(j.visible=!1)}}moonAt(e){const t=new ni;return t.setFromCamera(e,this.camera),this.moonSystem.getMoonAtPosition(t)}moonPosition(e){return this.moonSystem.getMoonPosition(e)}moonRadiusUnits(e){const t=this.data?.moons?.moons?.find(s=>s.name===e);return re*(t?.visuals?.relative_size??.02)}moonOffsetAU(e,t=new y){const s=this.moonPosition(e);return s?t.copy(s).divideScalar(this.unitsPerAU):null}moonRadiusAU(e){return this.moonRadiusUnits(e)/this.unitsPerAU}setFocusMoon(e){e!==this.focusMoon&&(this.focusMoon&&this.moonSystem.setMoonDetail(this.focusMoon,!1),e&&this.moonSystem.setMoonDetail(e,!0),this.focusMoon=e)}projectMoon(e,t=new y){const s=this.moonPosition(e);return s?t.copy(s).project(this.camera):null}dispose(){this.disposed=!0,this.realistic?.dispose(),this.realistic=null,this.moonSystem.dispose(),this.mesh.geometry.dispose(),this.mesh.material.dispose(),this.lights.forEach(e=>e.dispose()),this.scene.clear()}}const Bn=`
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
`,$n=`
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
`,Un=`
  varying float vAlong;
  varying float vRim;
  void main() {
    vAlong = uv.y;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normal);
    vRim = abs(dot(n, normalize(-mv.xyz)));
    gl_Position = projectionMatrix * mv;
  }
`,Yn=`
  uniform vec3 uColor;
  uniform float uIntensity;
  uniform float uTime;
  uniform float uFlow;
  varying float vAlong;
  varying float vRim;
  void main() {
    // Bright at the source, fading outwards; knots travel along jets
    float fade = pow(1.0 - vAlong, 1.4);
    float knots = 1.0 + uFlow * 0.6 * sin(vAlong * 46.0 - uTime * 4.0);
    float core = pow(vRim, 2.0);
    gl_FragColor = vec4(uColor * fade * knots * core * uIntensity, 1.0);
  }
`,Zn=`
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
`,Xn=`
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
`;function Pt(n,e,t){const s=new de;s.setAttribute("position",new ut([0,0,0],3));const a=new B({uniforms:{uColor:{value:n},uIntensity:{value:t},uSize:{value:e},uPixelRatio:{value:1},uPulse:{value:.4}},vertexShader:Zn,fragmentShader:Xn,blending:Y,depthTest:!1,depthWrite:!1,transparent:!0}),o=new Le(s,a);return o.frustumCulled=!1,o.userData.beacon=!0,o}const Jn=8e-4;function Kn(n,e,t){const s=new B({uniforms:{uTime:{value:0},uInner:{value:n},uOuter:{value:e},uIntensity:{value:t}},vertexShader:Bn,fragmentShader:$n,blending:Y,depthTest:!1,depthWrite:!1,transparent:!0,side:xe}),a=new F(new Ut(n,e,160,8),s);return a.frustumCulled=!1,a}function at(n,e,t,s,a,o){const r=new $e(t,e,n,24,1,!0);r.translate(0,n/2,0);const l=new B({uniforms:{uColor:{value:s},uIntensity:{value:a},uTime:{value:0},uFlow:{value:o}},vertexShader:Un,fragmentShader:Yn,blending:Y,depthTest:!1,depthWrite:!1,transparent:!0,side:xe}),c=new F(r,l);return c.frustumCulled=!1,c}function Ss(n){return new Yt(n.range(-1.2,1.2),n.range(0,Math.PI*2),n.range(-1.2,1.2))}class Qn{root=new te;items=[];toCamera=new y;constructor(e,t,s,a){for(const o of e){const r=new Re(_e(o.id+o.name));o.kind==="blackhole"?this.items.push(this.blackHole(o,r,s,a)):o.kind==="pulsar"?this.items.push(this.pulsar(o,r)):o.kind==="quasar"&&this.items.push(this.quasar(o,t))}for(const o of this.items)this.root.add(o.object)}blackHole(e,t,s,a){const o=e.id==="smbh",r=o?s==="Void"?.4:.02:6e-4,l=new te,c=Kn(r*2.6,r*14,o?a?4:2:1.3);c.rotation.copy(Ss(t)),l.add(c);const d=Pt(new z(1,.6,.85),o?5:3.5,o?1.4:.9);l.add(d);const u=c.material;return{poi:e,object:l,horizon:r,approach:r*45,update:h=>{u.uniforms.uTime.value=h}}}pulsar(e,t){const s=new te;s.rotation.copy(Ss(t));const a=new te,o=new te;o.rotation.z=t.range(.35,.8);const r=new z(.65,.8,1),l=.05,c=at(l,2e-4,l*.12,r,2.2,0),d=at(l,2e-4,l*.12,r,2.2,0);d.rotation.z=Math.PI,o.add(c,d),a.add(o),s.add(a);const u=Pt(new z(.7,.85,1),4,1.2);s.add(u);const h=t.range(.6,2.2),m=new y,p=new Ue,f=u.material;return{poi:e,object:s,horizon:0,approach:l*3,update:(g,w)=>{a.rotation.y=g/h%1*Math.PI*2,s.updateMatrixWorld(),m.set(0,1,0).applyQuaternion(c.getWorldQuaternion(p));const v=Math.abs(m.dot(w));f.uniforms.uPulse.value=Math.pow(v,24)*2.5+.15}}}quasar(e,t){const s=new te,a=t*.4,o=new z(.55,.72,1),r=at(a,t*.002,t*.018,o,1.6,1),l=at(a,t*.002,t*.018,o,1.6,1);l.rotation.z=Math.PI,s.add(r,l);const c=Pt(new z(1,.95,.9),9,3);s.add(c);const d=[r.material,l.material],u=t*.018;return{poi:e,object:s,horizon:0,approach:e.radius*3.5,update:h=>{const m=s.position,p=Math.hypot(m.x,m.z),f=E.smoothstep(p,u*2,u*8);d.forEach(g=>{g.uniforms.uTime.value=h,g.uniforms.uIntensity.value=1.6*f}),r.visible=l.visible=f>.001}}}approachDistance(e){return this.items.find(t=>t.poi.id===e.id)?.approach??null}update(e,t,s){for(const a of this.items){const[o,r,l]=a.poi.position;a.object.position.set(o-t.x,r-t.y,l-t.z);const c=a.approach/3.5/Math.max(a.object.position.length(),1e-9)>Jn,d=a.object.children.filter(u=>!u.userData.beacon);c&&d.forEach(u=>u.visible=!0),this.toCamera.copy(a.object.position).negate().normalize(),a.object.updateMatrixWorld(),a.update(e,this.toCamera),c||d.forEach(u=>u.visible=!1),a.object.traverse(u=>{const h=u.material;h?.uniforms?.uPixelRatio&&(h.uniforms.uPixelRatio.value=s)})}}lenses(e,t){const s=[],a=Math.tan(t.fov*Math.PI/360),o=new y;for(const r of this.items){if(r.horizon<=0)continue;o.set(r.poi.position[0]-e.x,r.poi.position[1]-e.y,r.poi.position[2]-e.z);const l=o.length(),c=r.horizon/l/(2*a);c<.0015||(o.applyMatrix4(t.matrixWorldInverse),!(o.z>=0)&&(o.applyMatrix4(t.projectionMatrix),!(Math.abs(o.x)>1.5||Math.abs(o.y)>1.5)&&s.push({x:(o.x+1)/2,y:(o.y+1)/2,radius:Math.min(c,.4)})))}return s.sort((r,l)=>l.radius-r.radius).slice(0,4)}dispose(){this.root.traverse(e=>{const t=e;t.geometry?.dispose(),t.material?.dispose?.()}),this.root.clear()}}const eo={Spiral:45e3,Elliptical:5e4,Dwarf:7e3},Ta=24*45e3,Ms=1e7,ks=216,to=4,so=.8;function ao(n,e){const s=document.createElement("canvas");s.width=s.height=256;const a=s.getContext("2d"),o=new Re(e),r=256/2;a.globalCompositeOperation="lighter";const l=(d,u,h,m,p)=>{const f=a.createRadialGradient(d,u,0,d,u,h);f.addColorStop(0,m.replace("ALPHA",String(p))),f.addColorStop(1,m.replace("ALPHA","0")),a.fillStyle=f,a.fillRect(d-h,u-h,h*2,h*2)};if(n==="Spiral"){l(r,r,256*.42,"rgba(255,225,190,ALPHA)",.25);const d=o.int(2,4),u=o.range(.25,.4);for(let h=0;h<2600;h++){const m=h%d,p=Math.pow(o.next(),.7),f=8+p*256*.44,g=m*Math.PI*2/d+Math.log(f/8)/u+o.gauss()*.22,w=r+Math.cos(g)*f,v=r+Math.sin(g)*f;l(w,v,3+o.next()*5,p>.3?"rgba(150,180,255,ALPHA)":"rgba(255,220,170,ALPHA)",.12)}l(r,r,256*.12,"rgba(255,235,200,ALPHA)",.9)}else if(n==="Elliptical")a.save(),a.translate(r,r),a.scale(1,o.range(.55,.95)),l(0,0,256*.48,"rgba(255,215,170,ALPHA)",.55),l(0,0,256*.18,"rgba(255,235,205,ALPHA)",.9),a.restore();else{for(let d=0;d<9;d++)l(r+o.gauss()*256*.12,r+o.gauss()*256*.08,256*o.range(.08,.2),"rgba(185,200,255,ALPHA)",.35);for(let d=0;d<300;d++)l(r+o.gauss()*256*.15,r+o.gauss()*256*.1,2.5,"rgba(220,230,255,ALPHA)",.25)}const c=new ue(s);return c.colorSpace=ve,c}function js(n){const e=()=>E.clamp(n.gauss()*.18,-.35,.35);return new y(e(),e(),e())}const Cs=n=>_e(`neighbor:${n.join(",")}`),io=new Ue().setFromAxisAngle(new y(1,0,0),-Math.PI/2),no=.7;class oo{root=new te;spacing=Ta;center;reach;fetcher;cells=new Map;cameraCell=null;textures=new Map;geometries=new Map;disposed=!1;lattice;cell;shift=new y;morphing=null;arrived=null;constructor(e,t,s){this.reach=Math.max(1,t),this.fetcher=s,this.center=e,this.setCenter(e),this.buildGrid()}setCenter(e){this.center=e,this.shift=js(new Re(Cs(e))).multiplyScalar(this.spacing),this.cells.set("0,0,0",{state:"empty"}),this.cameraCell=null}find(e){return this.cells.get(e.map((t,s)=>t-this.center[s]).join(","))?.neighbor??null}morph(e,t=0,s=0){this.morphing=e?{key:e.map((a,o)=>a-this.center[o]).join(","),amount:t,radius:s}:null}recenter(e){const t=e.map((l,c)=>l-this.center[c]),s=t.join(","),a=this.cells.get(s),o=a?.neighbor?.position.clone()??new y;this.arrived&&this.dropArrived();const r=new Map;for(const[l,c]of this.cells){if(l===s||l==="0,0,0"||c.state==="loading")continue;const d=l.split(",").map((u,h)=>Number(u)-t[h]);c.neighbor?.position.sub(o),r.set(d.join(","),c)}return this.cells=r,a?.neighbor&&(a.neighbor.position.sub(o),this.arrived={cell:a,fadeFrom:null}),this.morphing=null,this.setCenter(e),o}releaseArrived(){this.arrived&&this.arrived.fadeFrom===null&&(this.arrived.fadeFrom=performance.now()/1e3)}dropArrived(){this.arrived&&(this.removeCell(this.arrived.cell),this.arrived=null)}nearest(e,t){const s=[];for(const a of this.cells.values())a.neighbor&&s.push(a.neighbor);return s.sort((a,o)=>a.position.distanceToSquared(e)-o.position.distanceToSquared(e)).slice(0,t)}get loadedCount(){let e=0;for(const t of this.cells.values())t.neighbor&&e++;return e}refresh(e){const t=this.reach;for(const[a,o]of this.cells){if(a==="0,0,0")continue;const[r,l,c]=a.split(",").map(Number);Math.max(Math.abs(r-e[0]),Math.abs(l-e[1]),Math.abs(c-e[2]))<=t+1||(this.removeCell(o),this.cells.delete(a))}const s=[];for(let a=-t;a<=t;a++)for(let o=-t;o<=t;o++)for(let r=-t;r<=t;r++){const l=[e[0]+a,e[1]+o,e[2]+r],c=l.join(",");if(this.cells.has(c))continue;if(l.map((u,h)=>this.center[h]+u).some(u=>u<0||u>Ms)){this.cells.set(c,{state:"empty"});continue}s.push({key:c,offset:l,d:a*a+o*o+r*r})}s.sort((a,o)=>a.d-o.d);for(let a=0;a<s.length;a+=ks)this.fetchBatch(s.slice(a,a+ks))}async fetchBatch(e){const t=new Map;for(const{key:o}of e){const r={state:"loading"};this.cells.set(o,r),t.set(o,r)}let s;try{s=await this.fetcher(e.map(({offset:o})=>o.map((r,l)=>this.center[l]+r)))}catch{for(const[o,r]of t)this.cells.get(o)===r&&this.cells.delete(o);return}if(this.disposed)return;const a=new Map;for(const o of s)a.set(o.coordinates.map((r,l)=>r-this.center[l]).join(","),o);for(const[o,r]of t){if(this.cells.get(o)!==r)continue;const l=a.get(o);if(!l||l.num_systems<=0){r.state="empty";continue}this.place(r,l)}}place(e,t){const s=new y(t.coordinates[0]-this.center[0],t.coordinates[1]-this.center[1],t.coordinates[2]-this.center[2]),a=Cs(t.coordinates),o=new Re(a),r=s.add(js(o)).multiplyScalar(this.spacing).sub(this.shift),l=new Ye({map:this.texture(t.galaxy_type,a),color:new z(1,1,1).multiplyScalar(2.5),blending:Y,depthTest:!1,depthWrite:!1,transparent:!0,opacity:0,side:xe,toneMapped:!1}),c=eo[t.galaxy_type]??3e4,d=new F(this.geometry(c),l);d.rotation.set(o.range(0,Math.PI),o.range(0,Math.PI),o.range(0,Math.PI)),d.frustumCulled=!1,this.root.add(d),e.state="ready",e.mesh=d,e.baseRadius=c,e.baseOrientation=d.quaternion.clone(),e.neighbor={...t,position:r},e.born=performance.now()/1e3}removeCell(e){e.mesh&&(this.root.remove(e.mesh),e.mesh.material.dispose())}texture(e,t){const s=`${e}:${t%to}`;let a=this.textures.get(s);return a||(a=ao(e,_e(s)),this.textures.set(s,a)),a}geometry(e){let t=this.geometries.get(e);return t||(t=new ge(e*2,e*2),this.geometries.set(e,t)),t}buildGrid(){const e=this.spacing,t=new da(new fe(e,e,e)),s=(a,o)=>new wt({color:a,vertexColors:o,transparent:!0,blending:Y,depthTest:!1,depthWrite:!1,toneMapped:!1});this.lattice=new dt(new de,s(4882384,!0)),this.cell=new dt(t,s(8378623,!1));for(const a of[this.lattice,this.cell])a.frustumCulled=!1,a.visible=!1,this.root.add(a)}rebuildLattice(e){const t=this.spacing,s=this.reach+.5,a=e.map((u,h)=>{const m=Math.max(-s,-this.center[h]-u-.5),p=Math.min(s,Ms-this.center[h]-u+.5),f=[];for(let g=-s;g<=s+1e-6;g++)g>=m-1e-6&&g<=p+1e-6&&f.push(g);return f}),o=[],r=[],l=u=>1-E.smoothstep(Math.hypot(u[0],u[1],u[2]),s*.45,s),c=(u,h)=>{o.push(u[0]*t,u[1]*t,u[2]*t,h[0]*t,h[1]*t,h[2]*t);const m=l(u),p=l(h);r.push(m,m,m,p,p,p)};for(let u=0;u<3;u++){const h=a[u],[m,p]=[(u+1)%3,(u+2)%3];for(const f of a[m])for(const g of a[p])for(let w=0;w<h.length-1;w++){const v=[0,0,0],S=[0,0,0];v[u]=h[w],S[u]=h[w+1],v[m]=S[m]=f,v[p]=S[p]=g,c(v,S)}}const d=new de;d.setAttribute("position",new ut(o,3)),d.setAttribute("color",new ut(r,3)),this.lattice.geometry.dispose(),this.lattice.geometry=d}setGridVisible(e){this.lattice.visible=e,this.cell.visible=e}update(e,t=1,s=1){const a=this.spacing,o=[Math.round((e.x+this.shift.x)/a),Math.round((e.y+this.shift.y)/a),Math.round((e.z+this.shift.z)/a)];(!this.cameraCell||o.some((c,d)=>c!==this.cameraCell[d]))&&(this.cameraCell=o,this.refresh(o),this.rebuildLattice(o));const r=performance.now()/1e3,l=(this.reach+.5)*a;for(const[c,d]of this.cells){if(!d.mesh||!d.neighbor)continue;const u=d.neighbor.position;d.mesh.position.set(u.x-e.x,u.y-e.y,u.z-e.z);const h=E.clamp((r-(d.born??0))/so,0,1),m=1-E.smoothstep(u.distanceTo(e),l*.7,l);let p=h*m;if(this.morphing?.key===c){const g=this.morphing;d.mesh.quaternion.slerpQuaternions(d.baseOrientation,io,g.amount),d.mesh.scale.setScalar(E.lerp(1,g.radius/d.baseRadius,g.amount)),p=Math.max(p,h*g.amount)}else d.baseOrientation&&d.mesh.scale.x!==1&&(d.mesh.quaternion.copy(d.baseOrientation),d.mesh.scale.setScalar(1));d.mesh.material.opacity=p;const f=(d.baseRadius??3e4)*d.mesh.scale.x/Math.max(1,u.distanceTo(e));d.mesh.visible=p>.004&&f>6e-4}if(this.arrived?.cell.mesh){const c=this.arrived.cell.mesh;c.position.copy(this.arrived.cell.neighbor.position).sub(e);const d=this.arrived.fadeFrom===null?1:1-(r-this.arrived.fadeFrom)/no;d<=0?this.dropArrived():c.material.opacity=d}if(this.lattice.visible){const c=s/Math.max(t,.001),d=this.cameraCell;this.lattice.position.set(d[0]*a-this.shift.x-e.x,d[1]*a-this.shift.y-e.y,d[2]*a-this.shift.z-e.z),this.cell.position.set(-this.shift.x-e.x,-this.shift.y-e.y,-this.shift.z-e.z),this.lattice.material.opacity=Math.min(1,.22*c),this.cell.material.opacity=Math.min(1,.45*c)}}dispose(){this.disposed=!0,this.dropArrived();for(const e of this.cells.values())this.removeCell(e);this.cells.clear();for(const e of this.textures.values())e.dispose();for(const e of this.geometries.values())e.dispose();for(const e of[this.lattice,this.cell])e.geometry.dispose(),e.material.dispose();this.root.clear()}}const Pe={low:{level:"low",label:"Low",description:"Integrated GPUs, laptops on battery, phones",pixelRatioCap:1,deepSkyScale:.6,antialias:!1,shadows:!1,maxNodes:9e3,maxStars:12e3,splitAngle:.032,fps:30,idleFps:12,starLabels:4,galaxyReach:1,planetDetail:6},medium:{level:"medium",label:"Medium",description:"Balanced default",pixelRatioCap:1.25,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:2e4,maxStars:26e3,splitAngle:.024,fps:60,idleFps:24,starLabels:8,galaxyReach:2,planetDetail:7.5},high:{level:"high",label:"High",description:"Dedicated GPU",pixelRatioCap:2,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:36e3,maxStars:45e3,splitAngle:.018,fps:60,idleFps:30,starLabels:10,galaxyReach:3,planetDetail:8.5},ultra:{level:"ultra",label:"Ultra",description:"Everything, as smooth as the display allows",pixelRatioCap:2,deepSkyScale:1,antialias:!0,shadows:!0,maxNodes:6e4,maxStars:75e3,splitAngle:.014,fps:0,idleFps:60,starLabels:12,galaxyReach:3,planetDetail:9}},Aa="atlas-quality";function ro(){const n=navigator.hardwareConcurrency||4,e=navigator.deviceMemory||4;return typeof window<"u"&&"ontouchstart"in window&&window.innerWidth<900||n<=4||e<=2?"low":n>=10&&e>=8?"high":"medium"}function lo(){try{const n=localStorage.getItem(Aa);if(n&&Pe[n])return Pe[n]}catch{}return Pe[ro()]}function co(n){try{localStorage.setItem(Aa,n)}catch{}}function ho(n,e){return n.antialias!==e.antialias||n.shadows!==e.shadows}const uo=["saucer","interceptor"],Ns=.42,Ts=8,mo=[[0,-.12],[.3,-.12],[.34,-.1],[.7,-.075],[.94,-.025],[1,-.004],[1,.004],[.94,.03],[.72,.075],[.7,.088],[.46,.115],[.42,.13],[0,.13]],As="SPACEX";function po(n,e,t,s){const a=s*.20999999999999996,o=s*.036,r=3,l=o*.7,c=(d,u)=>{d.save(),d.font=`700 ${o}px "Helvetica Neue", Arial, sans-serif`,d.textBaseline="middle",d.fillStyle=u;const h=As.split("").map(p=>d.measureText(p).width*r+l),m=h.reduce((p,f)=>p+f,0)-l;for(const p of[0,t]){let f=p-m/2;As.split("").forEach((g,w)=>{d.save(),d.translate(f,a),d.scale(r,1),d.fillText(g,0,0),d.restore(),f+=h[w]})}d.restore()};c(n,"rgba(196,204,214,0.42)"),c(e,"rgba(20,20,20,0.85)")}function fo(){const s=()=>{const p=document.createElement("canvas");return p.width=2048,p.height=512,p},a=s(),o=s(),r=a.getContext("2d"),l=o.getContext("2d");r.scale(2,2),l.scale(2,2);let c=1337;const d=()=>(c=c*16807%2147483647)/2147483647;r.fillStyle="#5d636c",r.fillRect(0,0,1024,256),l.fillStyle="#6a6a6a",l.fillRect(0,0,1024,256);const u=[0,34,70,118,150,190,222,256];for(let p=0;p<u.length-1;p++){const f=12+p*6;for(let g=0;g<f;g++){const w=g/f*1024,v=84+Math.floor(d()*18);r.fillStyle=`rgb(${v},${v+4},${v+10})`,r.fillRect(w,u[p],1024/f,u[p+1]-u[p]);const S=90+Math.floor(d()*50);l.fillStyle=`rgb(${S},${S},${S})`,l.fillRect(w,u[p],1024/f,u[p+1]-u[p])}}r.strokeStyle="rgba(20,22,26,0.9)",l.strokeStyle="rgba(220,220,220,1)";for(const p of[r,l]){p.lineWidth=2;for(const f of u)p.beginPath(),p.moveTo(0,f),p.lineTo(1024,f),p.stroke()}for(let p=0;p<u.length-1;p++){const f=12+p*6;for(let g=0;g<f;g++){const w=g/f*1024;for(const v of[r,l])v.beginPath(),v.moveTo(w,u[p]),v.lineTo(w,u[p+1]),v.stroke()}}for(let p=0;p<1400;p++){const f=d()*1024,g=d()*256,w=4+d()*30;r.fillStyle=`rgba(30,32,36,${.04+d()*.08})`,r.fillRect(f,g,w,1),l.fillStyle=`rgba(255,255,255,${.05+d()*.1})`,l.fillRect(f,g,w,1)}po(r,l,1024,256);const h=new ue(a);h.colorSpace=ve,h.anisotropy=4;const m=new ue(o);return m.anisotropy=4,{map:h,roughness:m}}function go(){const e=()=>{const h=document.createElement("canvas");return h.width=h.height=512,h},t=e(),s=e(),a=t.getContext("2d"),o=s.getContext("2d");let r=4242;const l=()=>(r=r*16807%2147483647)/2147483647,c=512/8;for(let h=0;h<8;h++)for(let m=0;m<8;m++){const p=86+Math.floor(l()*16);a.fillStyle=`rgb(${p},${p+4},${p+10})`,a.fillRect(m*c,h*c,c,c);const f=80+Math.floor(l()*50);o.fillStyle=`rgb(${f},${f},${f})`,o.fillRect(m*c,h*c,c,c)}a.strokeStyle="rgba(20,22,26,0.85)",o.strokeStyle="rgba(220,220,220,1)";for(const h of[a,o]){h.lineWidth=1.5;for(let m=0;m<=8;m++)h.beginPath(),h.moveTo(m*c,0),h.lineTo(m*c,512),h.moveTo(0,m*c),h.lineTo(512,m*c),h.stroke()}for(let h=0;h<500;h++)a.fillStyle=`rgba(30,32,36,${.05+l()*.08})`,a.fillRect(l()*512,l()*512,1,3+l()*18);const d=new ue(t);d.colorSpace=ve,d.wrapS=d.wrapT=Gt,d.anisotropy=4;const u=new ue(s);return u.wrapS=u.wrapT=Gt,{map:d,roughness:u}}function Pa(){const e=document.createElement("canvas");e.width=e.height=128;const t=e.getContext("2d"),s=t.createRadialGradient(128/2,128/2,0,128/2,128/2,128/2);s.addColorStop(0,"rgba(255,255,255,1)"),s.addColorStop(.3,"rgba(255,255,255,0.3)"),s.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=s,t.fillRect(0,0,128,128);const a=new ue(e);return a.colorSpace=ve,a}function Ia(n,e,t,s,a){const o=new ne(.022,10,8);e.push(o);const r=(l,c)=>{const d=new Ye({color:l}),u=new F(o,d);return u.position.copy(c),n.add(u),e.push(d),u};return{port:r(16722458,t),starboard:r(1769306,s),strobes:a.map(l=>r(16777215,l))}}function vo(){const n=new te,e=[],{map:t,roughness:s}=fo(),a=new ma(mo.map(([_,C])=>new Me(_,C)),128),o=new ie({map:t,roughnessMap:s,color:16777215,metalness:.85,roughness:.55,envMapIntensity:1});n.add(new F(a,o));const r=new Ae(.97,.012,8,128),l=new ie({color:1711394,metalness:.6,roughness:.6}),c=new F(r,l);c.rotation.x=Math.PI/2,c.position.y=.012,n.add(c),e.push(t,s,a,o,r,l);const d=new ne(.4,48,16,0,Math.PI*2,0,Math.PI/2),u=new bt({color:725272,metalness:.2,roughness:.06,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.2}),h=new F(d,u);h.scale.y=.42,h.position.y=.128,n.add(h);const m=new Ae(.4,.008,8,96),p=new ie({color:2764341,metalness:.8,roughness:.4}),f=new F(m,p);f.rotation.x=Math.PI/2,f.position.y=.13,n.add(f),e.push(d,u,m,p);const g=new ne(.075,24,12,0,Math.PI*2,Math.PI/2,Math.PI/2),w=new ie({color:3817287,metalness:.85,roughness:.45});for(let _=0;_<3;_++){const C=_/3*Math.PI*2+Math.PI/6,R=new F(g,w);R.position.set(Math.cos(C)*.56,-.088,Math.sin(C)*.56),n.add(R)}const v=new Ae(.22,.016,10,64),S=new Ye({color:0}),j=new F(v,S);j.rotation.x=Math.PI/2,j.position.y=-.122,n.add(j);const P=Pa(),N=new $t({map:P,color:10475775,blending:Y,depthWrite:!1,transparent:!0}),M=new Bt(N);M.position.y=-.16,n.add(M),e.push(g,w,v,S,P,N);const I=Ia(n,e,new y(-1,0,0),new y(1,0,0),[new y(0,0,1),new y(0,.14,.05),new y(0,-.13,0)]);return{group:n,...I,disposables:e,bank:.3,maxBank:.45,scale:1,drive:(_,C,R)=>{const L=.15+.85*C+.04*Math.sin(_*7);S.color.setRGB(.35*L,.8*L,1.2*L),M.scale.setScalar(.4+1.1*C+.5*R),N.opacity=.15+.6*C}}}function xo(){const n=new te,e=[],{map:t,roughness:s}=go(),a=new ie({map:t,roughnessMap:s,color:16777215,metalness:.85,roughness:.5,envMapIntensity:1}),o=new ie({color:1777187,metalness:.7,roughness:.55});e.push(t,s,a,o);const r=new ss;r.moveTo(0,-.62),r.lineTo(.8,.52),r.lineTo(.8,.64),r.lineTo(.3,.7),r.lineTo(-.3,.7),r.lineTo(-.8,.64),r.lineTo(-.8,.52),r.closePath();const l=new as(r,{depth:.035,bevelEnabled:!0,bevelThickness:.012,bevelSize:.018,bevelSegments:2});l.rotateX(Math.PI/2),l.translate(0,.0175,0);const c=l.getAttribute("uv"),d=l.getAttribute("position");for(let k=0;k<c.count;k++)c.setXY(k,d.getX(k)*1.6,d.getZ(k)*1.6);const u=new F(l,a);n.add(u),e.push(l);const h=document.createElement("canvas");h.width=512,h.height=160;const m=h.getContext("2d");m.font='800 118px "Helvetica Neue", Arial, sans-serif',m.textAlign="center",m.textBaseline="middle",m.fillStyle="#ffffff";const p="PLD".split(""),f=150;p.forEach((k,D)=>m.fillText(k,256+(D-1)*f,84));const g=new ue(h);g.colorSpace=ve,g.anisotropy=4;const w=new ie({map:g,color:15265266,emissive:2764856,emissiveMap:g,transparent:!0,metalness:.4,roughness:.35,envMapIntensity:1.2,polygonOffset:!0,polygonOffsetFactor:-2,depthWrite:!1}),v=new ge(.4,.15);v.rotateX(-Math.PI/2),e.push(g,w,v);for(const k of[-1,1]){const D=new F(v,w);D.position.set(k*.5,.0365,.42),n.add(D)}const S=[[0,-1.18],[.045,-1.06],[.1,-.8],[.14,-.45],[.155,-.05],[.15,.45],[.13,.72],[.1,.8],[0,.8]].map(([k,D])=>new Me(k,D)),j=new ma(S,48);j.rotateX(Math.PI/2),j.scale(1,.62,1);const P=new F(j,a);n.add(P),e.push(j);const N=new ne(.1,40,16,0,Math.PI*2,0,Math.PI/2),M=new bt({color:725272,metalness:.2,roughness:.06,clearcoat:1,clearcoatRoughness:.04,envMapIntensity:2.2}),I=new F(N,M);I.scale.set(.95,.75,3.4),I.position.set(0,.07,-.42),n.add(I),e.push(N,M);const _=new fe(.07,.05,.32);for(const k of[-1,1]){const D=new F(_,o);D.position.set(k*.2,.035,-.05),n.add(D)}e.push(_);const C=new ss;C.moveTo(0,0),C.lineTo(.3,0),C.lineTo(.3,.06),C.lineTo(.08,.24),C.closePath();const R=new as(C,{depth:.014,bevelEnabled:!1});R.rotateY(-Math.PI/2),e.push(R);for(const k of[-1,1]){const D=new F(R,a);D.position.set(k*.24,.03,.4),D.rotation.z=-k*.35,n.add(D)}const L=new $e(.08,.095,.7,32);L.rotateX(Math.PI/2);const T=new $e(.1,.085,.09,32,1,!0);T.rotateX(Math.PI/2);const A=new ri(.078,32),O=new Ye({color:0}),H=Pa(),q=new $t({map:H,color:9425151,blending:Y,depthWrite:!1,transparent:!0}),Q=new ua(.07,1,24,1,!0);Q.rotateX(-Math.PI/2),Q.translate(0,0,.5);const U=new B({uniforms:{uLevel:{value:0},uTime:{value:0}},vertexShader:"varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`
      uniform float uLevel; uniform float uTime; varying vec3 vPos;
      void main() {
        float along = clamp(vPos.z, 0.0, 1.0);
        float flicker = 0.85 + 0.15 * sin(uTime * 40.0 + along * 30.0);
        vec3 color = mix(vec3(0.75, 0.92, 1.0), vec3(0.15, 0.4, 1.0), along) * pow(1.0 - along, 1.6) * uLevel * flicker;
        gl_FragColor = vec4(color, 1.0);
      }
    `,blending:Y,transparent:!0,depthWrite:!1,side:xe});e.push(L,T,A,O,H,q,Q,U);const je=[],Ce=[];for(const k of[-1,1]){const D=k*.24,le=new F(L,a);le.position.set(D,.015,.42),n.add(le);const W=new F(T,o);W.position.set(D,.015,.8),n.add(W);const Z=new F(A,O);Z.position.set(D,.015,.8),n.add(Z);const ee=new Bt(q);ee.position.set(D,.015,.86),n.add(ee),je.push(ee);const pe=new F(Q,U);pe.position.set(D,.015,.83),n.add(pe),Ce.push(pe)}const ze=Ia(n,e,new y(-.81,0,.58),new y(.81,0,.58),[new y(0,.07,.7),new y(0,-.06,.1)]);return{group:n,...ze,disposables:e,bank:.5,maxBank:.75,scale:.95,drive:(k,D,le)=>{const W=.25+.75*D+.05*Math.sin(k*9)+.4*le;O.color.setRGB(.55*W,.85*W,1.3*W);for(const Z of je)Z.scale.setScalar(.22+.45*D+.35*le);q.opacity=.35+.55*Math.min(1,D+le),U.uniforms.uLevel.value=.25+1.4*D+1.2*le,U.uniforms.uTime.value=k;for(const Z of Ce)Z.scale.set(1,1,.25+1.6*D+2.2*le)}}}const Ps={saucer:vo,interceptor:xo};class yo{scene=new be;camera=new Ht(30,1,.1,100);ship=new te;model=null;kind=null;key;disposables=[];time=0;roll=0;pitch=0;thrust=0;baseY=-.77;lightDirection=new y(-.5,.6,.6).normalize();presence=0;constructor(e,t="saucer"){const s=new Ya(e),a=s.fromScene(new ci,.04).texture;s.dispose(),this.scene.environment=a,this.scene.environmentIntensity=.35,this.disposables.push(a),this.key=new qe(16774374,2.6);const o=new oi(10466520,790036,.25),r=new qe(9419007,.5);r.position.set(.5,.4,-3),this.scene.add(this.key,this.key.target,o,r),this.scene.add(this.ship),this.setKind(t)}setKind(e){e===this.kind||!Ps[e]||(this.model&&(this.ship.remove(this.model.group),this.model.disposables.forEach(t=>t.dispose())),this.kind=e,this.model=Ps[e](),this.ship.add(this.model.group))}get visible(){return this.presence>.005}update(e,t,s){const a=this.model;this.time+=e;const o=this.time,r=(g,w,v)=>g+(w-g)*Math.min(1,e*v);this.presence=r(this.presence,s.visible?1:0,3),this.thrust=r(this.thrust,s.thrust,2.5);const l=-(s.strafe??0)*a.maxBank*.85;this.roll=r(this.roll,E.clamp(s.yawRate*a.bank+l,-a.maxBank,a.maxBank),3),this.pitch=r(this.pitch,E.clamp(-s.pitchRate*.2-(s.climb??0)*.22,-.3,.3),3),this.camera.aspect=t,this.camera.updateProjectionMatrix(),s.light&&s.light.lengthSq()>0&&this.lightDirection.lerp(s.light.clone().normalize(),Math.min(1,e*2)).normalize(),this.key.position.copy(this.lightDirection).multiplyScalar(10).add(this.ship.position),this.key.target.position.copy(this.ship.position);const c=Ts*Math.tan(E.degToRad(this.camera.fov/2)),d=c*(1-2*(s.floor??1)),u=.22*Ns*2.4;this.baseY=r(this.baseY,Math.max(-c*.36,d+u),4);const h=s.warp*.012,m=(1-this.presence)*c*1.2;this.ship.position.set((Math.random()-.5)*h,this.baseY+Math.sin(o*.8)*.012-m+(Math.random()-.5)*h,-Ts-this.thrust*1.2),this.ship.scale.setScalar(Ns*a.scale),this.ship.rotation.set(.3+this.thrust*.1+this.pitch,0,this.roll+Math.sin(o*.6)*.008);const p=o%1.2,f=p<.05||p>.15&&p<.2?1:0;for(const g of a.strobes)g.material.color.setScalar(.08+2.5*f);a.port.material.color.setRGB(2.2,.15,.08),a.starboard.material.color.setRGB(.1,2,.35),a.drive(o,this.thrust,s.warp)}dispose(){this.model?.disposables.forEach(e=>e.dispose()),this.disposables.forEach(e=>e.dispose()),this.scene.clear()}}const Ra="atlas-view-options",It={shipView:!0,universeGrid:!0,flightHud:!0,soundEffects:!0,ship:"saucer"},wo=2,bo={2:["universeGrid"]};function So(){try{const n=JSON.parse(localStorage.getItem(Ra)??"null");if(n&&typeof n=="object"){const e={...It},t=typeof n.revision=="number"?n.revision:1,s=new Set(Object.entries(bo).flatMap(([a,o])=>t<Number(a)?o:[]));for(const a of Object.keys(It))a!=="ship"&&!s.has(a)&&typeof n[a]=="boolean"&&(e[a]=n[a]);return uo.includes(n.ship)&&(e.ship=n.ship),e}}catch{}return{...It}}function Mo(n){try{localStorage.setItem(Ra,JSON.stringify({...n,revision:wo}))}catch{}}const Is=.5;class ko{ctx=null;master=null;reverb=null;noise=null;driveNodes=null;lastDrive={level:-1,warp:-1};enabled=!0;attach(e){if(!e||this.ctx)return;this.ctx=e,this.master=e.createGain(),this.master.gain.value=this.enabled?Is:0,this.master.connect(e.destination);const t=Math.floor(e.sampleRate*2);this.noise=e.createBuffer(1,t,e.sampleRate);const s=this.noise.getChannelData(0);for(let l=0;l<t;l++)s[l]=Math.random()*2-1;const a=e.createConvolver(),r=e.createBuffer(2,Math.floor(e.sampleRate*3.2),e.sampleRate);for(let l=0;l<2;l++){const c=r.getChannelData(l);let d=0;for(let u=0;u<c.length;u++){const h=u/c.length;d+=(Math.random()*2-1-d)*(.6-.45*h),c[u]=d*Math.pow(1-h,3.2)}}a.buffer=r,this.reverb=e.createGain(),this.reverb.gain.value=.6,this.reverb.connect(a).connect(this.master),this.buildDrive()}setEnabled(e){if(this.enabled=e,!this.ctx||!this.master)return;const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t),this.master.gain.setValueAtTime(this.master.gain.value,t),this.master.gain.linearRampToValueAtTime(e?Is:0,t+.4)}get live(){return!!this.ctx&&!!this.master&&this.enabled&&this.ctx.state!=="closed"}noiseSource(){const e=this.ctx.createBufferSource();return e.buffer=this.noise,e.loop=!0,e.loopStart=Math.random(),e}tone(e,t){const s=this.ctx,a=t.at??s.currentTime,o=t.attack??.005,r=t.decay??.3,l=s.createOscillator();l.type=t.type??"sine",l.frequency.setValueAtTime(e,a),t.detune&&(l.detune.value=t.detune),t.glideTo&&l.frequency.exponentialRampToValueAtTime(t.glideTo,a+(t.glide??o+r));const c=s.createGain();if(c.gain.setValueAtTime(0,a),c.gain.linearRampToValueAtTime(t.gain??.1,a+o),c.gain.exponentialRampToValueAtTime(1e-4,a+o+r),l.connect(c),c.connect(this.master),t.send){const d=s.createGain();d.gain.value=t.send,c.connect(d).connect(this.reverb)}l.start(a),l.stop(a+o+r+.05),l.onended=()=>c.disconnect()}sweep(e){const t=this.ctx,s=e.at??t.currentTime,a=this.noiseSource(),o=t.createBiquadFilter();o.type=e.filter??"bandpass",o.Q.value=e.q??1,o.frequency.setValueAtTime(e.from,s),o.frequency.exponentialRampToValueAtTime(e.to,s+e.attack+e.decay);const r=t.createGain();if(r.gain.setValueAtTime(0,s),r.gain.linearRampToValueAtTime(e.gain,s+e.attack),r.gain.exponentialRampToValueAtTime(1e-4,s+e.attack+e.decay),a.connect(o).connect(r).connect(this.master),e.send){const l=t.createGain();l.gain.value=e.send,r.connect(l).connect(this.reverb)}a.start(s),a.stop(s+e.attack+e.decay+.05),a.onended=()=>r.disconnect()}buildDrive(){const e=this.ctx,t=this.noiseSource(),s=e.createBiquadFilter();s.type="lowpass",s.frequency.value=140,s.Q.value=.7;const a=e.createGain();a.gain.value=0,t.connect(s).connect(a).connect(this.master);const o=this.noiseSource(),r=e.createBiquadFilter();r.type="bandpass",r.frequency.value=700,r.Q.value=.6;const l=e.createGain();l.gain.value=0,o.connect(r).connect(l).connect(this.master);const c=e.createOscillator();c.type="sine",c.frequency.value=52;const d=e.createGain();d.gain.value=0,c.connect(d).connect(this.master),t.start(),o.start(),c.start(),this.driveNodes={rumble:a,rumbleFilter:s,rush:l,rushFilter:r,tone:d,toneOsc:c}}drive(e,t){const s=this.driveNodes;if(!s||!this.ctx||Math.abs(e-this.lastDrive.level)<.01&&Math.abs(t-this.lastDrive.warp)<.01)return;this.lastDrive={level:e,warp:t};const a=this.ctx.currentTime,o=.12;s.rumble.gain.setTargetAtTime(.06*e+.14*t,a,o),s.rumbleFilter.frequency.setTargetAtTime(120+260*e+500*t,a,o),s.rush.gain.setTargetAtTime(.018*e+.06*t,a,o),s.rushFilter.frequency.setTargetAtTime(500+900*e+2600*t,a,o),s.tone.gain.setTargetAtTime(.025*t+.01*e,a,o),s.toneOsc.frequency.setTargetAtTime(48+14*e+40*t,a,o)}select(e="star"){if(!this.live)return;const t=this.ctx.currentTime;e==="planet"?(this.tone(880,{at:t,decay:.7,gain:.05,send:.5}),this.tone(1318.5,{at:t+.07,decay:.8,gain:.04,send:.5})):e==="moon"?(this.tone(1046.5,{at:t,decay:.5,gain:.04,send:.5}),this.tone(1568,{at:t+.06,decay:.6,gain:.03,send:.5})):(this.tone(1320,{at:t,decay:.18,gain:.05,send:.35}),this.tone(1980,{at:t,decay:.12,gain:.02,send:.35}))}shutter(){if(!this.live)return;const e=this.ctx.currentTime;this.sweep({at:e,filter:"highpass",from:2600,to:1800,q:.7,attack:.002,decay:.05,gain:.09}),this.sweep({at:e+.075,filter:"highpass",from:2200,to:1500,q:.7,attack:.002,decay:.07,gain:.07,send:.2}),this.tone(1760,{at:e+.075,decay:.35,gain:.015,send:.4})}deselect(){this.live&&this.tone(700,{decay:.12,gain:.03,glideTo:520,send:.2})}depart(e=1){if(!this.live)return;const t=this.ctx.currentTime;this.sweep({at:t,from:260,to:2400,q:1.1,attack:.45,decay:1.3,gain:.11*e,send:.3}),this.tone(62,{at:t,attack:.4,decay:1.4,gain:.08*e,glideTo:96})}approach(){this.live&&this.sweep({from:380,to:1500,q:1.3,attack:.3,decay:1,gain:.07,send:.3})}arrive(){if(!this.live)return;const e=this.ctx.currentTime;for(const[t,s]of[[110,.04],[164.8,.03],[220,.025],[329.6,.012]])this.tone(t,{at:e,attack:.35,decay:2.4,gain:s,send:.7,detune:(Math.random()-.5)*8})}orbit(){if(!this.live)return;const e=this.ctx.currentTime;this.tone(659.3,{at:e,attack:.02,decay:1.6,gain:.04,send:.7}),this.tone(987.8,{at:e+.12,attack:.02,decay:1.8,gain:.03,send:.7})}hyperCharge(e=1.1){if(!this.live)return;const t=this.ctx,s=t.currentTime,a=t.createOscillator();a.type="triangle",a.frequency.setValueAtTime(70,s),a.frequency.exponentialRampToValueAtTime(420,s+e);const o=t.createOscillator();o.frequency.setValueAtTime(5,s),o.frequency.exponentialRampToValueAtTime(28,s+e);const r=t.createGain();r.gain.value=.03;const l=t.createGain();l.gain.setValueAtTime(0,s),l.gain.linearRampToValueAtTime(.05,s+e*.9),l.gain.linearRampToValueAtTime(0,s+e+.08),o.connect(r).connect(l.gain),a.connect(l).connect(this.master);const c=t.createGain();c.gain.value=.3,l.connect(c).connect(this.reverb),a.start(s),o.start(s),a.stop(s+e+.1),o.stop(s+e+.1),a.onended=()=>l.disconnect(),this.sweep({at:s,filter:"highpass",from:400,to:5200,q:.8,attack:e*.95,decay:.15,gain:.05,send:.2})}hyperEnter(e){if(!this.live)return;const t=e??this.ctx.currentTime;this.tone(150,{at:t,attack:.008,decay:1.3,gain:.32,glideTo:30,glide:1}),this.tone(75,{at:t,attack:.01,decay:1.6,gain:.12,glideTo:28,glide:1.4,send:.3}),this.sweep({at:t,filter:"lowpass",from:5e3,to:160,q:.9,attack:.01,decay:1.1,gain:.16,send:.5}),this.tone(2637,{at:t+.02,attack:.005,decay:.9,gain:.012,send:.8})}hyperExit(){if(!this.live)return;const e=this.ctx.currentTime;this.sweep({at:e,from:3200,to:260,q:1,attack:.04,decay:1.4,gain:.1,send:.5}),this.tone(210,{at:e,attack:.01,decay:.9,gain:.08,glideTo:90}),this.tone(1318.5,{at:e+.05,attack:.02,decay:1.4,gain:.018,send:.8}),this.tone(1975.5,{at:e+.12,attack:.02,decay:1.4,gain:.012,send:.8})}dive(e=1){this.live&&(this.hyperCharge(e),this.sweep({from:200,to:3e3,q:.9,attack:e,decay:.2,gain:.06,send:.3}),this.hyperEnter(this.ctx.currentTime+e))}}const $=new ko;function Mt(){try{const n=document.getElementById("data-universe-config");return n?JSON.parse(n.textContent||"null"):null}catch{return null}}function Jt(n,e=null,t=null){let s=`coordinates=${n.join(",")}`;return e!==null&&(s+=`&system=${e}`,t&&(s+=`&planet=${t}`)),`/stargate/${btoa(s).replace(/\+/g,"-").replace(/\//g,"_")}`}const Rt='ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',Rs='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',Oe="103,232,249",jo="1.618033988749895",Co="https://the-atlas.koyeb.app";function No(){const n=["localhost","127.0.0.1","[::1]"].includes(window.location.hostname),e=Mt(),t=e&&!e.remote&&String(e.seed_str)===jo&&new Date(e.cosmic_origin_time*1e3).getUTCFullYear()===1986;return n&&t?Co:window.location.origin}function We(n,e,t,s,a,o="left"){const r=[...e],l=r.reduce((d,u)=>d+n.measureText(u).width,0)+a*(r.length-1);let c=o==="right"?t-l:t;n.textAlign="left";for(const d of r)n.fillText(d,c,s),c+=n.measureText(d).width+a;return l}function To(n,e,t,s,a,o,r){n.strokeStyle=`rgba(${Oe},0.6)`,n.lineWidth=r,n.beginPath();for(const[l,c,d,u]of[[e,t,1,1],[e+s,t,-1,1],[e,t+a,1,-1],[e+s,t+a,-1,-1]])n.moveTo(l,c+u*o),n.lineTo(l,c),n.lineTo(l+d*o,c);n.stroke()}async function Ao(n,e){const t=document.createElement("canvas");return await pi.toCanvas(t,n,{width:e,margin:1,errorCorrectionLevel:"M",color:{dark:"#02040a",light:"#ffffff"}}),t}async function Po(n,e,t=new Date){const s=n.width,a=n.height,o=document.createElement("canvas");o.width=s,o.height=a;const r=o.getContext("2d");r.drawImage(n,0,0);const l=Math.min(s,a)/800,c=Math.round(34*l);r.textBaseline="alphabetic";const d=r.createLinearGradient(0,a,0,a-260*l);d.addColorStop(0,"rgba(0,0,0,0.5)"),d.addColorStop(1,"rgba(0,0,0,0)"),r.fillStyle=d,r.fillRect(0,a-260*l,s,260*l);let u=a-c;r.font=`${Math.round(11*l)}px ${Rt}`,r.shadowColor="rgba(0,0,0,0.85)",r.shadowBlur=6*l,r.fillStyle="rgba(203,213,225,0.8)";const h=t.toISOString().slice(0,16).replace("T"," · ");We(r,`${h} UTC`.toUpperCase(),c,u,2.6*l),u-=22*l,r.fillStyle=`rgba(${Oe},0.78)`;for(const p of e.lines)We(r,p.toUpperCase(),c,u,2.6*l),u-=19*l;u-=6*l,r.font=`500 ${Math.round(24*l)}px ${Rs}`,r.fillStyle="rgba(255,255,255,0.95)",r.shadowColor="rgba(0,0,0,0.6)",r.shadowBlur=10*l,r.fillText(e.title,c,u),r.shadowBlur=0,u-=30*l,r.font=`${Math.round(10.5*l)}px ${Rt}`,r.fillStyle=`rgba(${Oe},0.85)`,r.shadowColor="rgba(0,0,0,0.85)",r.shadowBlur=6*l,We(r,e.kind.toUpperCase(),c,u,3.4*l),u-=30*l,r.font=`700 ${Math.round(22*l)}px ${Rs}`,r.fillStyle="rgba(255,255,255,0.95)";const m=We(r,"ATLAS",c,u,11*l);if(r.fillStyle="#67e8f9",r.shadowColor="rgba(34,211,238,0.9)",r.shadowBlur=14*l,r.fillText("3",c+m+11*l,u),r.shadowBlur=0,e.url){const p=Math.round(Math.max(96,150*l)),f=Math.round(10*l),g=Math.round(26*l),w=p+f*2,v=p+f*2+g,S=s-c-w,j=a-c-v;r.fillStyle="rgba(2,4,10,0.72)",r.beginPath(),r.roundRect(S,j,w,v,10*l),r.fill(),r.strokeStyle=`rgba(${Oe},0.25)`,r.lineWidth=Math.max(1,l),r.stroke(),To(r,S-6*l,j-6*l,w+12*l,v+12*l,12*l,Math.max(1,1.2*l));const P=await Ao(e.url,p);r.save(),r.beginPath(),r.roundRect(S+f,j+f,p,p,6*l),r.clip(),r.drawImage(P,S+f,j+f,p,p),r.restore(),r.font=`${Math.round(9.5*l)}px ${Rt}`,r.fillStyle=`rgba(${Oe},0.8)`;const N="SCAN TO FLY HERE";r.textBaseline="middle";const M=[...N].reduce((I,_)=>I+r.measureText(_).width,0)+2.4*l*(N.length-1);We(r,N,S+(w-M)/2,j+f+p+g/2+f/2,2.4*l),r.textBaseline="alphabetic"}return new Promise((p,f)=>o.toBlob(g=>g?p(g):f(new Error("The photo could not be encoded")),"image/png"))}async function Io(n,e){const t=new File([n],e,{type:"image/png"});if(window.matchMedia?.("(pointer: coarse)").matches&&navigator.canShare?.({files:[t]}))try{await navigator.share({files:[t],title:"The Atlas"});return}catch{}const a=URL.createObjectURL(n),o=document.createElement("a");o.href=a,o.download=e,document.body.appendChild(o),o.click(),o.remove(),setTimeout(()=>URL.revokeObjectURL(a),2e3)}async function Xe(n,e){const t=await fetch(n,{credentials:"same-origin",...e}),s=await t.json();if(!t.ok||s.success===!1)throw new Error(s.error||`Request failed: ${t.status}`);return s}const kt=n=>`/api/v2/galaxy/${n[0]}/${n[1]}/${n[2]}`;async function Es(n){return Xe(kt(n))}async function Ls(n,e){return Xe(`${kt(n)}/system/${e}`)}function _s(n,e,t){return`${kt(n)}/system/${e}/planet/${t}/rendering-data`}async function Ro(n){return(await Xe("/api/v2/galaxies",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({coordinates:n})})).galaxies}async function Eo(){try{const e=await(await fetch("/api/current-location",{credentials:"same-origin"})).json();return e.galaxy_coordinates?{coordinates:e.galaxy_coordinates,system:e.system_index??null}:null}catch{return null}}async function Ea(){const n=await Xe("/api/generate-random-location"),e=n.coordinates;return{coordinates:[e.x,e.y,e.z],system:n.system_index??null,planet:n.planet_index??null,galaxyName:n.galaxy_name,systemName:n.system_name??null,planetName:n.planet_name??null}}class Lo{coordinates;cache=new Map;waiting=new Map;timer=null;constructor(e){this.coordinates=e}peek(e){return this.cache.get(e)}get(e){const t=this.cache.get(e);return t?Promise.resolve(t):new Promise(s=>{const a=this.waiting.get(e);a?a.push(s):this.waiting.set(e,[s]),this.timer||(this.timer=setTimeout(()=>this.flush(),60))})}async flush(){this.timer=null;const e=Array.from(this.waiting.entries()).slice(0,256);for(const[t]of e)this.waiting.delete(t);this.waiting.size>0&&(this.timer=setTimeout(()=>this.flush(),60));try{const t=await Xe(`${kt(this.coordinates)}/systems`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({indices:e.map(([a])=>a)})}),s=new Map(t.systems.map(a=>[a.index,a]));for(const[a,o]of e){const r=s.get(a)??null;r&&this.cache.set(a,r),o.forEach(l=>l(r))}}catch{for(const[,t]of e)t.forEach(s=>s(null))}}}const _o=60,Fs=.08,zs=9e3,Ws=60;function La(){try{const n=JSON.parse(document.getElementById("data-universe-config")?.textContent||"{}");return String(n.seed_str||n.seed_name||"local")}catch{return"local"}}const _a=`atlas-ship:${La()}`,Fa=`atlas-recent-galaxies:${La()}`;function we(n){if(n>=1e3)return`${(n/1e3).toFixed(n>=1e4?0:1)} kly`;if(n>=1)return`${n.toFixed(n>=100?0:1)} ly`;const e=n*ce;return e>=1?`${e.toFixed(e>=100?0:1)} AU`:`${Math.round(e*1496e5).toLocaleString()} km`}function Fo(n){if(n>=.1)return`${n.toFixed(n>=100?0:2)} AU`;const e=n*1496e5;return e>=1e6?`${(e/1e6).toFixed(1)} M km`:`${Math.round(e).toLocaleString()} km`}const V=n=>n.replace(/_/g," ");function zo(){try{const n=localStorage.getItem(_a);if(!n)return null;const e=JSON.parse(n);if(Array.isArray(e.coordinates)&&e.coordinates.length===3&&Number.isFinite(e.system))return e}catch{}return null}function za(){try{return JSON.parse(localStorage.getItem(Fa)||"[]")}catch{return[]}}class Wo{state={mode:"loading",status:"Powering up the ship…",error:null,coordinates:null,galaxy:null,pois:[],ship:null,shipSystemName:null,target:null,system:null,orbiting:null,planetDetail:null,moons:[],visitingMoon:null,travel:null,mapView:!1,nearby:[],arrival:null,timeScale:1,cosmicTime:0,timeDrift:0,readout:{primary:"",secondary:""},quality:"medium",view:So(),fps:0};listeners=new Set;engine;navigator;labels;galaxy=null;directory=null;systemLayer=null;systemPosition=null;planetFrame=null;framePlanet=null;departingFrame=null;pendingSystem=null;pendingPlanet=null;travelIndex=null;destination=null;shipPosition=null;hover=null;hoverPlanet=null;pointer=null;lastLabelRefresh=0;lastNearbyRefresh=0;nearbyStars=[];cameraWorld=new y;cameraLocal=new y;forward=new y;quaternion=new Ue;lastEmit=0;lastExposureMeasure=0;disposeFrame;loadToken=0;arrivalTimer=null;warpBurst=0;warpFov=0;driveStart=null;lastCameraWorld=null;speed=0;quality;exotics=null;neighbors=null;jump=null;jumpFx=null;pointerMoved=!1;lastHoverPick=0;shipView;lastYaw=0;lastPitch=0;shipFloor=1;lastFloorMeasure=0;constructor(e,t){this.quality=t,this.state={...this.state,quality:t.level},this.engine=new yi(e,t),this.shipView=new yo(this.engine.renderer,this.state.view.ship),this.labels=new Ni(e,this.engine.renderer.domElement),this.navigator=new ki({onClick:(s,a)=>this.handleClick(s,a),onHover:(s,a)=>{this.pointer={x:s,y:a},this.pointerMoved=!0},rayAt:(s,a)=>this.engine.rayDirection(s,a,new y),onUserMove:()=>this.cancelArrival(),onDoubleClick:(s,a)=>this.handleDoubleClick(s,a)}),this.navigator.attach(this.engine.renderer.domElement),this.navigator.attachOverlay(e.parentElement??e),this.engine.renderer.domElement.addEventListener("pointerleave",()=>this.pointer=null),window.addEventListener("keydown",this.handleKey),this.disposeFrame=this.engine.onFrame(s=>this.frame(s)),this.engine.start(),$.setEnabled(this.state.view.soundEffects),this.engine.calm=Ie(),window.addEventListener(is,this.onComfort)}onComfort=()=>{this.engine.calm=Ie()};subscribe=e=>(this.listeners.add(e),()=>this.listeners.delete(e));getState=()=>this.state;setState(e){this.state={...this.state,...e},this.listeners.forEach(t=>t())}dockShip(e,t,s){if(!this.state.coordinates)return;const a={coordinates:this.state.coordinates,system:e,planet:t};try{localStorage.setItem(_a,JSON.stringify(a))}catch{}this.setState({ship:a,shipSystemName:s??this.state.shipSystemName})}rememberGalaxy(e){try{const t=za().filter(s=>s.coordinates.join(",")!==e.coordinates.join(","));t.unshift({coordinates:e.coordinates,name:e.name,type:e.galaxy_type}),localStorage.setItem(Fa,JSON.stringify(t.slice(0,8)))}catch{}}galaxyMaxDistance(e){return Math.max(e*16,Ta*(.4+.4*this.quality.galaxyReach))}loadNeighbors(e){this.neighbors=new oo(e,this.quality.galaxyReach,Ro),this.neighbors.setGridVisible(this.state.view.universeGrid),this.engine.deepScene.add(this.neighbors.root)}disposeExtras(e=!1){this.exotics&&(this.engine.deepScene.remove(this.exotics.root),this.exotics.dispose(),this.exotics=null),this.neighbors&&!e&&(this.engine.deepScene.remove(this.neighbors.root),this.neighbors.dispose(),this.neighbors=null),this.engine.setLenses([])}arrivalSystem(e){return _e(`arrival:${e.coordinates.join(",")}`)%Math.max(1,e.num_systems)}async loadGalaxy(e,t={},s=null){const a=++this.loadToken;this.lastCameraWorld=null,this.jump=null,this.leaveSystem(!0),this.galaxy?.dispose(),this.galaxy&&this.engine.deepScene.remove(this.galaxy.root),this.galaxy=null;const o=!!s&&!!this.neighbors;this.disposeExtras(o),o&&this.navigator.rebase(this.neighbors.recenter(e),1),this.shipPosition=null,this.destination=null,this.labels.removeWhere(()=>!0),this.arrivalTimer&&clearTimeout(this.arrivalTimer),this.setState({mode:"loading",status:o?null:"Dropping out of hyperspace…",error:null,coordinates:e,target:null,system:null,orbiting:null,planetDetail:null,moons:[],visitingMoon:null,pois:[],nearby:[],arrival:null,travel:null});try{const r=s?.info??(await Es(e)).galaxy;if(a!==this.loadToken)return;this.directory=new Lo(e),this.rememberGalaxy(r),this.setState({galaxy:r,status:r.num_systems>0&&!o?"Charting the galaxy…":null});const l=r.num_systems>0?t.system!=null&&t.system<r.num_systems?t.system:this.arrivalSystem(r):null,c=new _i(r,{onReady:(d,u)=>{a===this.loadToken&&(this.setState({pois:d,arrival:{name:V(r.name),type:r.galaxy_type,systems:r.num_systems}}),this.exotics=new Qn(d,u,r.galaxy_type==="Singularity Void"?"Void":r.galaxy_type,r.quasars>0),this.engine.deepScene.add(this.exotics.root),this.navigator.minDistance=.004,this.navigator.maxDistance=this.galaxyMaxDistance(u),o&&this.neighbors?this.navigator.flyTo(new y,u*2.3,{duration:3.6,pitch:.55,yaw:this.navigator.yaw+.4}):(this.loadNeighbors(e),this.navigator.focus.set(0,0,0),this.navigator.yaw=.5,this.navigator.pitch=.75,this.navigator.setDistance(u*7),this.navigator.flyTo(new y,u*2.3,{duration:3.2,pitch:.55,yaw:.9})),l!==null&&(this.dockShip(l,t.planet??null,null),c.locate(l).then(h=>{a===this.loadToken&&(this.shipPosition=h,this.directory?.get(l).then(m=>m&&this.setState({shipSystemName:V(m.name)})))}),this.arrivalTimer=setTimeout(()=>{a===this.loadToken&&(this.setState({arrival:null}),this.travelToSystem(l,t.planet??null))},4200)))},onLod:()=>{a===this.loadToken&&(this.neighbors?.releaseArrived(),this.state.mode==="loading"&&(this.setState({mode:"galaxy",status:null}),this.endJump()))}});c.setBudget(this.quality),this.galaxy=c,this.engine.deepScene.add(c.root),r.num_systems===0&&(this.setState({mode:"galaxy",status:null,arrival:{name:V(r.name),type:r.galaxy_type,systems:0}}),this.endJump())}catch(r){if(a!==this.loadToken)return;this.setState({error:r instanceof Error?r.message:String(r),status:null}),this.endJump()}}startJump(e,t=!1){const s=performance.now()/1e3;this.jumpFx={start:s,enterAt:s+e,exitAt:null,entered:!1,exited:!1,quietEntry:t},e>.05&&$.hyperCharge(e)}endJump(){const e=this.jumpFx;!e||e.exitAt!==null||(e.exitAt=Math.max(performance.now()/1e3,e.enterAt+1.4))}jumpIn(){this.startJump(0,!0)}engageDrive(){this.driveStart=performance.now(),this.cancelArrival(),$.hyperCharge(2.2)}hyperjump(e,t=null,s=null){const a=this.state.mode==="galaxy"&&!this.systemLayer?this.neighbors?.find(e):null;if(a){this.jumpToNeighbor(a,t,s);return}this.setState({travel:{label:`Hyperjump to ${e.join(", ")}`,progress:0},arrival:null}),this.startJump(1.1),setTimeout(()=>this.loadGalaxy(e,{system:t,planet:s}),1300)}async goToPlace(e,t,s,a=null){if(s===null&&a&&t!==null)try{const{system:r}=await Ls(e,t);s=r.planets.find(l=>l.name.toLowerCase()===a.toLowerCase())?.index??null}catch{}if(!(!!this.galaxy&&this.state.coordinates?.join(",")===e.join(","))){this.hyperjump(e,t,s);return}t===null?this.openMap():s!==null&&this.systemLayer?.system.index===t?this.focusPlanet(s):this.travelToSystem(t,s)}async jumpToNeighbor(e,t,s=null){const a=++this.loadToken;this.cancelArrival(),this.setState({target:null,arrival:null,travel:{label:`Hyperjump to ${V(e.name)}`,progress:0}});let o;try{o=(await Es(e.coordinates)).galaxy}catch{a===this.loadToken&&this.loadGalaxy(e.coordinates,{system:t,planet:s});return}if(a!==this.loadToken)return;const r=zi(o),l=r*7,c=e.position.clone();this.navigator.maxDistance=Math.max(this.navigator.maxDistance,l);const d=1;this.startJump(d),setTimeout(()=>{a===this.loadToken&&(this.jump={coordinates:e.coordinates,position:c,radius:r,distance:l},this.navigator.flyTo(c,l,{duration:4,onArrive:()=>{a===this.loadToken&&this.jump&&(this.endJump(),this.loadGalaxy(e.coordinates,{system:t,planet:s},{info:o}))}}))},d*1e3)}async selectSystem(e,t=null){if(!this.galaxy||!this.directory)return;this.travelIndex===null&&(this.cancelArrival(),$.select("star")),this.setState({target:{kind:"system",index:e,summary:this.directory.peek(e)??null,position:t}});const[s,a]=await Promise.all([this.directory.get(e),this.galaxy.locate(e)]),o=this.state.target;o?.kind!=="system"||o.index!==e||(s?.stars[0]&&this.galaxy.setRealStarType(e,s.stars[0].Type),this.galaxy.setHighlight(a),this.setState({target:{kind:"system",index:e,summary:s,position:a}}))}engage(){const e=this.state.target;e?.kind==="system"?this.travelToSystem(e.index):e?.kind==="poi"?this.flyToPoi(e.poi):e?.kind==="planet"?this.focusPlanet(e.planet.index):e?.kind==="moon"?this.focusMoon(e.moon.name):e?.kind==="star"&&this.focusStar(e.index)}selectStar(e){const t=this.systemLayer,s=t?.stars[e];if(!t||!s)return;const a=t.stars.length>1?` ${String.fromCharCode(65+e)}`:"";this.systemLayer?.setSelectedPlanet(null),this.setState({target:{kind:"star",index:e,star:s.info,name:`${V(t.system.name)}${a}`,temperature:s.look.temperature}}),$.select("star")}focusStar(e){const t=this.systemLayer,s=t?.stars[e];!t||!s||((this.state.target?.kind!=="star"||this.state.target.index!==e)&&this.selectStar(e),this.state.orbiting&&(this.planetFrame?.setFocusMoon(null),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null})),this.navigator.follow=null,this.navigator.minDistance=s.radius*1.25,$.approach(),this.navigator.flyTo(s.offset.clone(),s.radius*4.5,{pitch:.25}))}async travelToSystem(e,t=null){if(!this.galaxy||!this.state.coordinates)return;if(this.systemLayer&&this.systemLayer.system.index===e){t!=null?this.focusPlanet(t):this.navigator.flyTo(new y,Math.max(this.systemLayer.outerRadius*2.6,3));return}this.systemLayer&&this.leaveSystem(!1),this.travelIndex=e,await this.selectSystem(e),this.travelIndex=null;const s=this.state.target;if(s?.kind!=="system"||s.index!==e||!s.position)return;this.destination={index:e,position:s.position.clone()},this.pendingSystem=Ls(this.state.coordinates,e),this.pendingPlanet=t,this.navigator.follow=null,this.navigator.minDistance=Ws*.5/ce;const a=s.summary?V(s.summary.name):`system #${e.toLocaleString()}`;this.setState({travel:{label:`Travelling to ${a}`,progress:0},arrival:null}),$.depart(),this.navigator.flyTo(s.position,Ws/ce,{pitch:.35})}cancelArrival(){this.arrivalTimer&&(clearTimeout(this.arrivalTimer),this.arrivalTimer=null),this.state.arrival&&this.setState({arrival:null})}flyToPoi(e){this.cancelArrival(),this.state.mode==="system"&&this.leaveSystem(!1),this.destination=null,this.navigator.follow=null,this.galaxy?.setHighlight(null),this.setState({target:{kind:"poi",poi:e},arrival:null,travel:{label:`Heading to ${e.name}`,progress:0}}),$.depart(),this.navigator.flyTo(new y(...e.position),this.exotics?.approachDistance(e)??Math.max(e.radius*3.5,.5))}focusPlanet(e){const t=this.systemLayer;if(!t||!this.state.coordinates||!this.systemPosition)return;const s=t.planet(e);if(!s)return;if(t.setSelectedPlanet(e),this.departingFrame?.index===e){const o=this.departingFrame;this.departingFrame=null,this.planetFrame&&this.framePlanet!==null&&(this.departingFrame={frame:this.planetFrame,index:this.framePlanet}),this.planetFrame=o.frame,this.framePlanet=o.index}if(!this.planetFrame||this.framePlanet!==e){this.planetFrame&&this.framePlanet!==null&&(this.departingFrame?.frame.dispose(),this.departingFrame={frame:this.planetFrame,index:this.framePlanet},this.planetFrame=null),this.framePlanet=e;const o=new Hn({dataUrl:_s(this.state.coordinates,t.system.index,e),stars:t.system.stars,starOffsets:t.starOffsets,visualRadiusAU:s.radius,maxOrbitalRadius:t.system.max_orbital_radius,timing:{cosmic_origin_time:t.timing.cosmic_origin_time,current_time:t.timing.current_time},maxOctaves:this.quality.planetDetail});this.planetFrame=o,this.setState({planetDetail:{loading:!0,moons:0},moons:[]}),o.load().then(()=>{this.planetFrame===o&&this.state.orbiting?.index===e&&this.setState({planetDetail:{loading:!1,moons:o.moonCount},moons:o.moons})})}else{const o=this.planetFrame;this.setState({planetDetail:{loading:!o.ready,moons:o.moonCount},moons:o.moons})}this.planetFrame?.setFocusMoon(null),this.setState({visitingMoon:null}),this.setState({target:{kind:"planet",planet:s.data},orbiting:s.data,travel:{label:`Approaching ${V(s.data.name)}`,progress:0}}),this.dockShip(t.system.index,e,V(t.system.name)),this.navigator.minDistance=s.radius*1.12,this.navigator.follow=null;const a=()=>t.planetPosition(e);$.approach(),this.navigator.flyTo(s.position.clone(),s.radius*6,{track:a,onArrive:()=>{this.navigator.follow=a,$.orbit()}})}moonWorld(e,t=new y){const s=this.systemLayer,a=this.planetFrame,o=this.state.orbiting;if(!s||!a||!o)return null;const r=s.planetPosition(o.index),l=a.moonOffsetAU(e,t);return r&&l?l.add(r):null}selectMoon(e){const t=this.state.moons.find(s=>s.name===e);t&&(this.setState({target:{kind:"moon",moon:t}}),$.select("moon"))}focusMoon(e){const t=this.planetFrame,s=this.state.moons.find(u=>u.name===e),a=this.moonWorld(e);if(!t||!s||!a)return;const o=t.moonRadiusAU(e);t.setFocusMoon(e),this.navigator.follow=null,this.navigator.minDistance=o*1.15;const r=()=>this.moonWorld(e);this.setState({target:{kind:"moon",moon:s},visitingMoon:s,travel:{label:`Approaching ${V(s.name)}`,progress:0}});const l=a.clone().negate().normalize(),c=Math.atan2(l.x,l.z)+.95,d=E.clamp(Math.asin(l.y)+.2,-1.2,1.2);$.approach(),this.navigator.flyTo(a,o*5,{yaw:c,pitch:d,track:r,onArrive:()=>{this.navigator.follow=r,$.orbit()}})}closePlanetFrame(){this.disposeCurrentFrame(),this.departingFrame?.frame.dispose(),this.departingFrame=null,this.engine.planetPasses=[],this.systemLayer?.setDetailed([]),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null})}disposeCurrentFrame(){this.planetFrame?.dispose(),this.planetFrame=null,this.framePlanet=null}openMap(){this.galaxy&&(this.cancelArrival(),this.state.mode==="system"&&this.systemLayer&&(this.closePlanetFrame(),this.leaveSystem(!1)),this.galaxy.setHighlight(this.shipPosition),this.setState({target:null,arrival:null}),this.navigator.follow=null,$.depart(.7),this.navigator.flyTo(new y,this.galaxy.radius*2.3,{pitch:.6,duration:3.5}))}async takePhoto(e){const t=this.state.coordinates;if(this.state.mode==="loading"||!t||!this.galaxy)return!1;const s=this.state.view.universeGrid;this.neighbors?.setGridVisible(!1),this.systemLayer?.setOrbitsVisible(!1),this.galaxy.hideHighlightOnce();let a;try{a=this.engine.snapshot()}finally{this.neighbors?.setGridVisible(s),this.systemLayer?.setOrbitsVisible(!0)}$.shutter(),e?.();const o=this.photoPlace(t),r=await Po(a,o),l=new Date().toISOString().slice(0,19).replace(/[:T]/g,"-"),c=o.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"space";return await Io(r,`atlas-${c}-${l}.png`),!0}photoPlace(e){const t=this.state.galaxy?V(this.state.galaxy.name):"Galaxy",s=`${t} · ${e.join(", ")}`,a=this.state.mode==="system"?this.state.system:null,o=a?this.state.orbiting:null,r=o?this.state.visitingMoon:null,l=a?`${V(a.name)} · system #${a.index.toLocaleString("en")}`:null,d=!!Mt()?.remote?null:`${No()}${Jt(e,a?.index??null,o?.name??null)}`;return r&&o?{title:V(r.name),kind:"Moon",lines:[`${V(o.name)} · ${V(o.planet_type)}`,l,s],url:d}:o?{title:V(o.name),kind:`${V(o.planet_type)} planet`,lines:[l,s],url:d}:a?{title:V(a.name),kind:"Star system",lines:[s],url:d}:{title:t,kind:this.state.galaxy?`${this.state.galaxy.galaxy_type} galaxy`:"Galaxy",lines:[e.join(", ")],url:d}}returnToShip(){const e=this.state.ship;e&&this.travelToSystem(e.system,e.planet)}goUp(){if(this.state.mode==="system"&&this.systemLayer){if(this.state.visitingMoon&&this.state.orbiting){this.focusPlanet(this.state.orbiting.index);return}if(this.state.orbiting){this.planetFrame?.setFocusMoon(null),this.setState({orbiting:null,planetDetail:null,moons:[],visitingMoon:null}),this.systemLayer.setSelectedPlanet(null),this.navigator.follow=null,this.navigator.minDistance=1e-4,this.dockShip(this.systemLayer.system.index,null,V(this.systemLayer.system.name)),this.setState({target:null}),$.approach(),this.navigator.flyTo(new y,this.systemLayer.outerRadius*2.6);return}this.openMap();return}this.state.mode==="galaxy"&&(this.state.target?(this.galaxy?.setHighlight(this.shipPosition),this.setState({target:null})):this.openMap())}setTimeScale(e){this.systemLayer&&(this.systemLayer.timeScale=e),this.setState({timeScale:e})}resetTime(){this.systemLayer?.resetTime(),this.setTimeScale(1),this.setState({timeDrift:0,cosmicTime:this.systemLayer?.cosmicNow??Date.now()/1e3})}setQuality(e){const t=Pe[e];if(co(e),ho(this.quality,t))return!0;const s=t.galaxyReach!==this.quality.galaxyReach;return this.quality=t,this.engine.applyQuality(t),this.galaxy?.setBudget(t),s&&this.neighbors&&this.galaxy&&this.state.coordinates&&(this.engine.deepScene.remove(this.neighbors.root),this.neighbors.dispose(),this.loadNeighbors(this.state.coordinates),this.systemLayer||(this.navigator.maxDistance=this.galaxyMaxDistance(this.galaxy.radius))),this.labels.removeWhere(a=>a.startsWith("star:")),this.setState({quality:e}),!1}setViewOption(e,t){const s={...this.state.view,[e]:t};Mo(s),this.neighbors?.setGridVisible(s.universeGrid),$.setEnabled(s.soundEffects),this.shipView.setKind(s.ship),this.setState({view:s})}clearTarget(){this.state.target&&this.state.target.kind!=="planet"&&this.state.target.kind!=="moon"&&$.deselect(),this.galaxy?.setHighlight(this.shipPosition),this.state.target?.kind==="planet"&&this.systemLayer?.setSelectedPlanet(this.state.orbiting?.index??null),this.state.visitingMoon?this.setState({target:{kind:"moon",moon:this.state.visitingMoon}}):this.setState({target:this.state.orbiting?{kind:"planet",planet:this.state.orbiting}:null})}viewSystem(){const e=this.systemLayer;if(e){if(this.state.orbiting){this.goUp();return}this.navigator.follow=null,this.navigator.flyTo(new y,Math.max(e.outerRadius*2.6,3))}}async enterSystem(){if(!this.pendingSystem||!this.destination||!this.galaxy)return;const e=this.pendingSystem,t=this.destination;this.pendingSystem=null;let s;try{s=await e}catch(r){this.setState({error:r instanceof Error?r.message:String(r)});return}if(this.destination!==t)return;const a=new gs(s.system,s.timing);a.timeScale=this.state.timeScale,this.systemLayer=a,this.systemPosition=t.position.clone(),this.shipPosition=t.position.clone(),this.engine.nearScene.add(a.root),this.engine.nearSceneVisible=!0,this.galaxy.setHidden(t.position),this.galaxy.setHighlight(null),this.navigator.rebase(t.position,ce),this.navigator.minDistance=1e-4,this.navigator.maxDistance=zs*3,this.setState({mode:"system",system:s.system,target:null,travel:this.navigator.isFlying?this.state.travel:null}),this.dockShip(s.system.index,null,V(s.system.name)),this.paintPlanets(a,this.state.coordinates),$.arrive();const o=this.pendingPlanet;this.pendingPlanet=null,o!=null?setTimeout(()=>this.focusPlanet(o),400):this.navigator.isFlying||this.navigator.flyTo(new y,Math.max(a.outerRadius*2.6,3),{duration:2.5,pitch:.45})}async paintPlanets(e,t){for(const s of e.system.planets){if(this.systemLayer!==e)return;try{const o=await(await fetch(_s(t,e.system.index,s.index),{credentials:"same-origin"})).json(),r=o.rendering_data?.planet_info;o.success&&r?.base_color&&this.systemLayer===e&&e.setPlanetColor(s.index,Bi({planet_info:r}))}catch{}}}leaveSystem(e){const t=this.systemLayer;if(!t||!this.systemPosition){this.pendingSystem=null;return}this.closePlanetFrame();const s=this.systemPosition;this.navigator.follow=null,this.navigator.rebase(s.clone().multiplyScalar(-ce),1/ce),this.engine.nearScene.remove(t.root),this.engine.nearSceneVisible=!1,t.dispose(),this.systemLayer=null,this.systemPosition=null,this.destination=null,this.galaxy?.setHidden(null),this.labels.removeWhere(a=>a.startsWith("planet:")||a.startsWith("sysstar:")),this.galaxy&&(this.navigator.minDistance=.004,this.navigator.maxDistance=this.galaxyMaxDistance(this.galaxy.radius)),e||(this.setState({mode:"galaxy",system:null,target:null}),this.galaxy?.setHighlight(this.shipPosition))}pickMoon(e,t){const s=this.planetFrame;if(!s?.ready||!this.state.orbiting||this.state.moons.length===0)return null;const a=this.engine.renderer.domElement.getBoundingClientRect(),o=new Me((e-a.left)/a.width*2-1,-((t-a.top)/a.height)*2+1),r=s.moonAt(o);if(r?.name)return r.name;let l=null,c=18;for(const d of this.state.moons){const u=s.projectMoon(d.name);if(!u||u.z>1)continue;const h=Math.hypot((u.x+1)/2*a.width+a.left-e,(1-u.y)/2*a.height+a.top-t);h<c&&(c=h,l=d.name)}return l}handleClick(e,t){const s=this.pickMoon(e,t);if(s){this.selectMoon(s);return}if(this.state.mode==="system"&&this.systemLayer){const o=this.systemLayer.pickBody(e,t,r=>this.engine.project(r,{x:0,y:0}),this.cameraLocal);o?.kind==="planet"?(this.systemLayer.setSelectedPlanet(o.body.data.index),this.setState({target:{kind:"planet",planet:o.body.data}}),$.select("planet")):o?.kind==="star"&&this.selectStar(o.index);return}if(this.state.mode!=="galaxy"||!this.galaxy)return;const a=this.galaxy.pick(e,t,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement);a?this.selectSystem(a.index,a.position):this.clearTarget()}handleDoubleClick(e,t){const s=this.pickMoon(e,t);if(s){this.focusMoon(s);return}if(this.state.mode==="system"&&this.systemLayer){const o=this.systemLayer.pickBody(e,t,r=>this.engine.project(r,{x:0,y:0}),this.cameraLocal);o?.kind==="planet"?this.focusPlanet(o.body.data.index):o?.kind==="star"&&this.focusStar(o.index);return}if(this.state.mode!=="galaxy"||!this.galaxy)return;const a=this.galaxy.pick(e,t,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement);a&&this.travelToSystem(a.index)}handleKey=e=>{const t=e.target?.tagName;t==="INPUT"||t==="TEXTAREA"||(e.key==="Escape"?this.goUp():e.key==="Enter"?this.engage():e.key==="m"||e.key==="M"?this.openMap():(e.key==="h"||e.key==="H")&&this.returnToShip())};frame(e){const t=this.navigator;if(t.update(e),t.cameraPosition(this.cameraLocal),this.systemLayer&&this.systemPosition?this.cameraWorld.copy(this.cameraLocal).divideScalar(ce).add(this.systemPosition):this.cameraWorld.copy(this.cameraLocal),this.lastCameraWorld&&e>0){const l=this.cameraWorld.distanceTo(this.lastCameraWorld)/e;this.speed+=(l-this.speed)*Math.min(1,e*6),this.lastCameraWorld.copy(this.cameraWorld)}else this.lastCameraWorld=this.cameraWorld.clone();if(t.orientation(this.quaternion),this.engine.camera.quaternion.copy(this.quaternion),this.engine.camera.updateMatrixWorld(),this.engine.camera.getWorldDirection(this.forward),this.warpBurst=Math.max(0,this.warpBurst-e*.9),this.driveStart!==null&&(this.warpBurst=Math.max(this.warpBurst,Math.min(1,(performance.now()-this.driveStart)/1400))),this.engine.warp=Math.max(t.warpIntensity,this.warpBurst),this.jump)if(!t.isFlying)this.jump=null,this.neighbors?.morph(null),this.endJump();else{this.engine.warp=Math.max(this.engine.warp,Math.sin(Math.PI*t.flightProgress)*.9);const l=this.cameraWorld.distanceTo(this.jump.position)/this.jump.distance,c=1-E.smoothstep(Math.log(Math.max(l,1)),0,Math.log(10));this.neighbors?.morph(this.jump.coordinates,c,this.jump.radius)}this.updateJump();const s=t.isFlying?Math.sin(Math.PI*t.flightProgress):0;$.drive(Math.max(s,t.throttleLevel*.7),Math.max(this.engine.warp,this.jumpRide)),this.warpFov+=(this.engine.warp-this.warpFov)*Math.min(1,e*3);const a=_o+24*this.warpFov*(2-this.warpFov);this.labels.setFade(Math.min(1-E.smoothstep(this.warpFov,.05,.4),this.jumpLabelFade())),Math.abs(this.engine.camera.fov-a)>.001&&(this.engine.camera.fov=a,this.engine.camera.updateProjectionMatrix()),this.engine.idle=t.isIdle&&this.warpBurst===0&&this.warpFov<.01&&!this.jumpFx;const o=performance.now()/1e3;if(this.exotics&&(this.exotics.update(o,this.cameraWorld,this.engine.pixelRatio),this.engine.setLenses(this.exotics.lenses(this.cameraWorld,this.engine.camera))),this.neighbors){const l=this.systemLayer?t.distance/ce:t.distance,c=this.galaxy?.radius??1;this.neighbors.update(this.cameraWorld,this.engine.exposure,E.smoothstep(l,c*.1,c*.6))}if(this.updateShip(e),this.galaxy){const l=this.systemLayer?t.distance/ce:t.distance;this.galaxy.update(e,this.cameraWorld,this.engine.pixelRatio,this.engine.exposure),performance.now()-this.lastExposureMeasure>(this.engine.idle?1500:250)&&(this.lastExposureMeasure=performance.now(),this.galaxy.measureExposure(this.cameraWorld,this.engine.camera));const c=Math.log(this.engine.exposure);this.engine.exposure=Math.exp(c+(Math.log(this.galaxy.targetExposure)-c)*Math.min(1,e*2.5)),this.galaxy.maybeRequest(this.cameraWorld,this.forward,l,this.engine.camera.fov*Math.PI/180,this.engine.camera.aspect,this.engine.viewportHeight)}if(this.systemLayer){const l=this.systemLayer;l.presence=gs.presenceAt(this.cameraLocal.length()),this.systemPosition&&this.galaxy?.setHidden(this.systemPosition,l.presence),l.update(e,this.cameraLocal);const c=Math.max(l.nearestSurface(this.cameraLocal),1e-9);this.engine.nearRange=[Math.max(1e-9,c*.25),1e5],this.updatePlanetFrame(e)}this.checkTransitions(),this.updateHover(),this.updateLabels();const r=performance.now();if(r-this.lastEmit>200){this.lastEmit=r;const l=this.systemLayer?t.flightRemaining/ce:t.flightRemaining,c=this.state.travel&&t.isFlying?{...this.state.travel,progress:t.flightProgress,speed:this.speed,remaining:l}:null;this.setState({readout:this.readout(),cosmicTime:this.systemLayer?.cosmicNow??Date.now()/1e3,timeDrift:this.systemLayer?.drift??0,travel:c,mapView:this.isMapView(),fps:this.engine.fps})}this.state.mode==="galaxy"&&r-this.lastNearbyRefresh>1e3&&(this.lastNearbyRefresh=r,this.refreshNearby())}updateJump(){const e=this.jumpFx,t=this.engine.jump;if(!e){t.active=!1,t.charge=t.mouth=t.exit=t.flash=0,this.jumpRide=0;return}const s=performance.now()/1e3,a=this.engine.screenCover;e.exitAt===null&&s-e.enterAt>20&&(e.exitAt=s);const o=e.enterAt>e.start?E.smoothstep(s,e.start,e.enterAt):1;t.active=!0,t.charge=s<e.enterAt?o*o:Math.max(0,1-(s-e.enterAt)*5),!e.entered&&s>=e.enterAt&&(e.entered=!0,e.quietEntry||$.hyperEnter());let r=0;e.exitAt!==null&&s>=e.exitAt?(r=E.clamp((s-e.exitAt)/1.1,0,1),t.exit=1,t.mouth=a*(1-Math.pow(1-r,3)),e.exited||(e.exited=!0,$.hyperExit())):(t.exit=0,t.mouth=a*Math.pow(s<e.enterAt?o:1,2.4)),t.flash=.7*Math.exp(-Math.pow((s-e.enterAt)/.12,2))+(e.exitAt!==null?.4*Math.exp(-Math.pow((s-e.exitAt-.05)/.14,2)):0),this.jumpRide=e.entered?1-r:o*.5,this.engine.warp=Math.max(this.engine.warp,t.charge*.3,this.jumpRide*.6),e.exitAt!==null&&s>e.exitAt+1.15&&(this.jumpFx=null)}jumpRide=0;jumpLabelFade(){const e=this.engine.jump;if(!e.active)return 1;const t=this.engine.screenCover;return e.exit?E.smoothstep(e.mouth,t*.6,t):1-E.smoothstep(e.mouth,t*.08,t*.4)}updateShip(e){const t=this.navigator;let s=t.yaw-this.lastYaw;s=Math.atan2(Math.sin(s),Math.cos(s));const a=t.pitch-this.lastPitch;this.lastYaw=t.yaw,this.lastPitch=t.pitch;const o=e>0?1/e:0,r=t.isFlying?Math.sqrt(Math.sin(Math.PI*t.flightProgress)):0,l=this.state.view.shipView&&(!!this.jumpFx||this.state.mode!=="loading"&&!this.isMapView()),c=(this.systemLayer?this.cameraLocal:this.cameraWorld).clone().negate();if(c.applyQuaternion(this.quaternion.clone().invert()),performance.now()-this.lastFloorMeasure>250){this.lastFloorMeasure=performance.now();const d=this.engine.renderer.domElement.getBoundingClientRect(),u=document.querySelector("[data-ship-floor]")?.getBoundingClientRect();this.shipFloor=u&&u.height>0&&d.height>0?(u.top-d.top)/d.height:1}this.shipView.update(e,this.engine.camera.aspect,{yawRate:s*o,pitchRate:a*o,thrust:Math.max(r,t.throttleLevel),strafe:t.strafe,climb:t.climb,warp:this.engine.warp,visible:l,light:c,floor:this.shipFloor}),this.engine.shipPass=this.shipView.visible?this.shipView:null}isMapView(){return this.state.mode==="galaxy"&&!!this.galaxy&&this.navigator.distance>this.galaxy.radius*.5}updatePlanetFrame(e){const t=this.systemLayer;if(!t){this.engine.planetPasses=[];return}const s=t.cosmicNow-Date.now()/1e3,a=[],o=[],r=(l,c)=>{const d=t.planet(c);if(!d)return!1;const u=this.cameraLocal.distanceTo(d.position),h=l.ready&&u<d.radius*600;return l.viewportHeight=this.engine.viewportHeight*this.engine.pixelRatio,l.update(e,this.cameraLocal,d.position,this.quaternion,t.cosmicNow,s),h&&(a.push({distance:u,pass:{scene:l.scene,camera:l.camera}}),o.push(c)),h};if(this.planetFrame&&this.framePlanet!==null){const l=r(this.planetFrame,this.framePlanet);!this.state.orbiting&&!l&&this.disposeCurrentFrame()}this.departingFrame&&!r(this.departingFrame.frame,this.departingFrame.index)&&(this.departingFrame.frame.dispose(),this.departingFrame=null),a.sort((l,c)=>c.distance-l.distance),this.engine.planetPasses=a.map(l=>l.pass),t.setDetailed(o)}checkTransitions(){const e=this.navigator,t=this.state.target;this.state.mode==="galaxy"&&!this.destination&&this.travelIndex===null&&t?.kind==="system"&&t.position&&e.distance<.006&&e.focus.distanceTo(t.position)<.01&&this.travelToSystem(t.index),this.state.mode==="galaxy"&&this.destination&&this.pendingSystem&&e.distance<Fs&&e.focus.distanceTo(this.destination.position)<Fs&&(this.enterSystem(),this.pendingSystem=null),this.state.mode==="system"&&this.systemLayer&&e.distance>zs&&this.leaveSystem(!1)}refreshNearby(){if(!this.galaxy||!this.directory||this.isMapView()){this.state.nearby.length&&this.setState({nearby:[]});return}const e=this.galaxy.visibleStars(this.cameraWorld,6,300).filter(t=>t.index!==this.state.ship?.system);Promise.all(e.map(t=>this.directory.get(t.index))).then(t=>{const s=[];t.forEach((a,o)=>{a&&s.push({index:a.index,name:V(a.name),starType:a.stars.map(r=>r.Type).join(" + "),planets:a.num_planets,distance:we(e[o].distance)})}),this.setState({nearby:s})})}updateHover(){if(!this.pointer||this.navigator.isFlying){this.hover=null,this.hoverPlanet=null;return}const e=performance.now();!this.pointerMoved||e-this.lastHoverPick<60||(this.pointerMoved=!1,this.lastHoverPick=e,this.hover=null,this.hoverPlanet=null,this.state.mode==="galaxy"&&this.galaxy?(this.hover=this.galaxy.pick(this.pointer.x,this.pointer.y,this.cameraWorld,this.engine.camera,this.engine.renderer.domElement),this.hover&&this.directory&&!this.directory.peek(this.hover.index)&&this.directory.get(this.hover.index)):this.state.mode==="system"&&this.systemLayer&&(this.hoverPlanet=this.systemLayer.pickPlanet(this.pointer.x,this.pointer.y,t=>this.engine.project(t,{x:0,y:0}),this.cameraLocal)),this.engine.renderer.domElement.style.cursor=this.hover||this.hoverPlanet?"pointer":"grab")}projectWorld(e){const t=e.clone().sub(this.cameraWorld);return this.engine.project(t,{x:0,y:0})}updateLabels(){const e=this.labels;e.beginFrame();const t=performance.now(),s=this.isMapView();if(this.state.mode==="galaxy"&&this.galaxy&&this.directory){if(this.shipPosition){const c=this.projectWorld(this.shipPosition);c&&(e.upsert("ship","ship","You are here",this.state.shipSystemName??"",()=>this.returnToShip()),e.place("ship",c.x,c.y))}if(this.neighbors&&this.navigator.distance>this.galaxy.radius*1.2)for(const c of this.neighbors.nearest(this.navigator.focus,s?16:8)){const d=this.projectWorld(c.position);d&&(e.upsert(`galaxy:${c.coordinates.join(",")}`,"galaxy",V(c.name),`${c.coordinates.join(", ")}
${c.galaxy_type} · click to hyperjump`,()=>this.hyperjump(c.coordinates)),e.place(`galaxy:${c.coordinates.join(",")}`,d.x,d.y,.85))}const a=[];for(const c of this.state.pois){const d=new y(...c.position),u=d.distanceTo(this.cameraWorld),h=c.id==="smbh"?this.galaxy.info.num_systems===0?1/0:400:c.kind==="core"||c.kind==="quasar"?1/0:c.kind==="globular"||c.kind==="open"?Math.max(c.radius*120,2500):2500;if(u>h||u<c.radius*.8)continue;const m=this.projectWorld(d);m&&a.push({poi:c,distance:u,showRange:h,screen:m})}a.sort((c,d)=>c.distance-d.distance);const o=this.state.target?.kind==="poi"?this.state.target.poi.id:null;if(a.filter((c,d)=>d<(s?3:8)||c.poi.kind==="core"||c.poi.kind==="quasar"||c.poi.id===o).forEach(({poi:c,distance:d,showRange:u,screen:h})=>{const m=`poi:${c.id}`,p=c.kind==="globular"||c.kind==="open"?"cluster":c.kind==="blackhole"||c.kind==="pulsar"?"exotic":"poi";e.upsert(m,p,c.name,we(d),()=>this.setState({target:{kind:"poi",poi:c}}),()=>this.flyToPoi(c)),e.place(m,h.x,h.y,u===1/0?1:Math.min(1,(u-d)/(u*.3)))}),t-this.lastLabelRefresh>600){this.lastLabelRefresh=t,this.nearbyStars=s?[]:this.galaxy.visibleStars(this.cameraWorld,this.quality.starLabels,400);for(const c of this.nearbyStars)this.directory.get(c.index).then(d=>{d?.stars[0]&&this.galaxy?.setRealStarType(c.index,d.stars[0].Type)});e.removeWhere(c=>c.startsWith("star:")&&!this.nearbyStars.some(d=>`star:${d.index}`===c))}const r=this.state.target?.kind==="system"?this.state.target.index:null;for(const c of this.nearbyStars){const d=this.directory.peek(c.index);if(!d||c.index===r||c.index===this.state.ship?.system)continue;const u=this.projectWorld(c.position);u&&(e.upsert(`star:${c.index}`,"star",V(d.name),we(c.position.distanceTo(this.cameraWorld)),()=>this.selectSystem(c.index,c.position),()=>this.travelToSystem(c.index)),e.place(`star:${c.index}`,u.x,u.y,.85))}if(this.hover&&this.hover.index!==r){const c=this.directory.peek(this.hover.index);e.upsert("hover","hover",c?V(c.name):`System #${this.hover.index.toLocaleString()}`,c?`${c.stars.map(d=>d.Type).join(" + ")} · ${c.num_planets} planets`:"scanning…"),e.place("hover",this.hover.screen.x,this.hover.screen.y)}const l=this.state.target;if(l?.kind==="system"&&l.position){const c=this.projectWorld(l.position);c&&(e.upsert("target","selected",l.summary?V(l.summary.name):`System #${l.index.toLocaleString()}`,we(l.position.distanceTo(this.cameraWorld))),e.place("target",c.x,c.y))}}if(this.state.mode==="system"&&this.systemLayer){const a=this.systemLayer,o=this.state.orbiting?.index;for(const c of a.planets){const d=c.position.clone().sub(this.cameraLocal);if(c.data.index===o&&d.length()<c.radius*40)continue;const u=this.engine.project(d,{x:0,y:0});if(!u)continue;const h=`planet:${c.data.index}`;e.upsert(h,"planet",V(c.data.name),c.data.planet_type,()=>{a.setSelectedPlanet(c.data.index),this.setState({target:{kind:"planet",planet:c.data}})},()=>this.focusPlanet(c.data.index));const m=this.state.target?.kind==="planet"&&this.state.target.planet.index===c.data.index;a.presence<.05||e.place(h,u.x,u.y,(m||this.hoverPlanet===c?1:.7)*a.presence)}const r=this.planetFrame;if(r?.ready&&o!==void 0){const c=this.engine.renderer.domElement.getBoundingClientRect();for(const d of this.state.moons){const u=r.projectMoon(d.name);if(!u||u.z>1||Math.abs(u.x)>1.1||Math.abs(u.y)>1.1)continue;const h=`moon:${d.name}`;if(this.state.visitingMoon?.name===d.name&&!this.navigator.isFlying)continue;e.upsert(h,"moon",V(d.name),`${d.type} moon`,()=>this.selectMoon(d.name),()=>this.focusMoon(d.name));const p=this.state.target?.kind==="moon"&&this.state.target.moon.name===d.name;e.place(h,c.left+(u.x+1)/2*c.width,c.top+(1-u.y)/2*c.height,p?1:.8)}}const l=this.engine.project(this.cameraLocal.clone().negate(),{x:0,y:0});l&&this.navigator.distance>.5&&o===void 0&&(e.upsert("sysstar:0","star",V(a.system.name),a.system.stars.map(c=>c.Type).join(" + "),()=>this.selectStar(0),()=>this.focusStar(0)),e.place("sysstar:0",l.x,l.y,.9))}e.endFrame()}readout(){const e=this.navigator;if(this.state.mode==="system"&&this.systemLayer){const a=this.state.visitingMoon,o=a&&this.planetFrame?this.moonWorld(a.name):null;if(a&&o&&this.planetFrame){const r=this.planetFrame.moonRadiusAU(a.name),l=(this.cameraLocal.distanceTo(o)-r)/r*a.radiusKm,c=this.planetFrame.moonSunlight(a.name),d=c<.02?`eclipsed by ${V(this.state.orbiting?.name??"the planet")} · `:c<.98?"partial eclipse · ":"";return{primary:`Visiting ${V(a.name)}`,secondary:`${d}altitude ${Math.max(0,Math.round(l)).toLocaleString()} km`}}if(this.state.orbiting){const r=this.systemLayer.planet(this.state.orbiting.index),l=r?(this.cameraLocal.distanceTo(r.position)-r.radius)*(this.state.orbiting.diameter/2/r.radius):0;return{primary:`Orbiting ${V(this.state.orbiting.name)}`,secondary:`altitude ${Math.max(0,Math.round(l)).toLocaleString()} km`}}return{primary:`${Fo(this.cameraLocal.length())} from ${V(this.systemLayer.system.name)}`,secondary:`${this.systemLayer.system.planets.length} planets in this system`}}const t=this.cameraWorld.length(),s=this.shipPosition?this.shipPosition.distanceTo(this.cameraWorld):null;return{primary:`${we(t)} from the galactic core`,secondary:s!==null&&s>.05?`${we(s)} from your ship`:`focus ${we(e.distance)}`}}dispose(){this.loadToken++,this.arrivalTimer&&clearTimeout(this.arrivalTimer),window.removeEventListener("keydown",this.handleKey),window.removeEventListener(is,this.onComfort),this.disposeFrame(),this.navigator.dispose(),this.closePlanetFrame(),this.galaxy?.dispose(),this.disposeExtras(),this.systemLayer?.dispose(),this.labels.dispose(),this.engine.shipPass=null,this.shipView.dispose(),this.engine.dispose()}}const Do=()=>{const n=Math.abs(Date.now()-new Date("1986-04-17").getTime())/315576e5;return Math.round(n*10)/10},Go=[{label:"Galaxies",value:"10²¹",description:"1 sextillion unique galaxies"},{label:"Max Systems",value:"5×10³¹",description:"50 quintillion when fully evolved"},{label:"Max Planets",value:"3×10³²",description:"300 tredecillion in mature The Atlas"},{label:"vs Real Universe",value:"500M×",description:"Times larger than observable cosmos"},{label:"Evolution Limit",value:"1.9M years",description:"Maximum development period"},{label:"Universe Seeds",value:"∞",description:"Infinite unique universes"}],Wa=[{title:"The Procedural Universe",href:"https://zenodo.org/records/18112886"},{title:"Primordial 4D Torus Hypothesis",href:"https://zenodo.org/records/18136117"}],Ve=[{title:"What is The Atlas?",id:"what-is-atlas",questions:[{question:"What exactly is The Atlas?",answer:"The Atlas is a procedural universe simulation so vast that it defies human comprehension. The huge numbers aren't fictional, they are mathematically real and calculable. The Atlas generates a multiverse of possibilities where numbers lose meaning and infinity comes to life.",highlight:!0},{question:"How big is The Atlas universe?",answer:"Bigger than our observable universe, The Atlas contains 1 sextillion galaxies (1,000,000,000,000,000,000,000). To put this in perspective: The Atlas has 133 times more galaxies than there are grains of sand on all the beaches of Earth combined."},{question:"Is The Atlas really that massive?",answer:"Yes. The Atlas contains 1 sextillion galaxies in just a single seed, that's 133 times more galaxies than grains of sand on all Earth's beaches. And there are infinite different seeds to explore, each containing a completely unique universe with its own galactic configurations."}]},{title:"Universe Scale and Magnitude",id:"universe-scale",questions:[{question:"How does the Universal Cube work?",answer:"Imagine a giant cube where each side measures exactly 10 million units. At each coordinate point (x,y,z) in this cube exists a complete and unique galaxy. This means The Atlas contains exactly 1 sextillion galaxies, one at every possible coordinate in a single seed. And each seed contains a completely different universe. Turn on the Universe grid in the settings and back out of any galaxy to see the cells of the cube around you.",highlight:!0},{question:"What types of galaxies exist in The Atlas?",answer:"Each galaxy can be one of three types: Dwarf (up to 10 million systems), Spiral (up to 50 billion systems), or Elliptical (up to 100 billion systems). A single fully developed elliptical galaxy contains more star systems than our real Milky Way has stars."},{question:"How many planets could potentially exist?",answer:"Each solar system contains between 1 and 6 unique planets. With the maximum possible galaxies and systems, The Atlas could contain up to 3×10³² planets (300 tredecillion). If you visited a different planet every second without stopping, it would take 300 trillion years to explore just 0.001% of the total universe on The Atlas."},{question:"Where are galaxies located within the cube?",answer:"Galaxies closer to the center of the universe (coordinates 5,000,000, 5,000,000, 5,000,000) evolve faster than peripheral ones. A galaxy exactly at the center adds 10 new solar systems for every minute that passes since the Bit Bang. Galaxies at the corners of the cube barely grow at all."},{question:"How much storage would The Atlas require if we save all planets?",answer:"Even if each planet required just 1 byte of storage, a fully evolved The Atlas would need 300 tredecillion bytes (300 million exabytes). To put this in perspective, this equals 300 billion petabytes. Google's entire data infrastructure is estimated at 15 exabytes, The Atlas would need 20 million times Google's total storage. If you bought 1TB hard drives, you'd need 300 trillion of them, costing $15 quintillion at $50 each. Stacked, these drives would reach 6 million kilometers high, 15.6 times the distance to the Moon. The entire internet in 2024 is estimated at 120 zettabytes. The Atlas would be 2.5 million times all human digital data ever created. And remember... This is just from ONE seed, with only 1 byte per planet. The Atlas has infinite seeds.",highlight:!0}]},{title:"How Time Works",id:"time-mechanics",questions:[{question:"What is the cosmic origin time?",answer:"The cosmic origin time variable (found in atlas.ini in the root path) represents the exact time moment of the Big Bang of your universe. Time always moves forward from that moment. What you see when visualizing the universe depends on the time elapsed between the cosmic origin time and the current moment in real life.",highlight:!0},{question:"How long does it take for The Atlas to reach maximum development?",answer:"Any universe in The Atlas requires exactly 1.9 million years to evolve from its Bit Bang to its maximum theoretical capacity. This means if you started a universe today, it wouldn't reach its full potential of 300 tredecillion planets until the year 1,902,025 AD... A time span 137 times longer than all of recorded human history."},{question:"What happens if I set the cosmic origin time in the past?",answer:"If you configure a cosmic origin time in the past (for example, 1986 like in the Core Continuum), you'll see a universe that has been evolving for decades. The longer the time span, the more developed your galaxies and systems will be."},{question:"What if I set the cosmic origin time in the future?",answer:"If you set the cosmic origin time in the future for example, year 9999 (must be UNIX compatible time format), you would be seeing what would have happened 'in the past' from the perspective of that future moment. This creates unique temporal dynamics."},{question:"What is the Singularity Void?",answer:"The Singularity Void only appears when someone configures a cosmic origin time extremely far in the future, trying to see 'the past' beyond the 1.9 million year limit. It's a system protection to prevent absurd temporal configurations, not something that occurs naturally with time passage."}]},{title:"Core Continuum vs Design The Multiverse",id:"two-universes",questions:[{question:"What is Core Continuum?",answer:`Core Continuum is a shared universe that began on April 17, 1986. All players explore exactly the same cosmos, which has been evolving for ${Do()} real years (the real age of The Atlas's developer). Central galaxies have added over 200 million additional systems during this time.`,highlight:!0},{question:"What is Design The Multiverse?",answer:"Design The Multiverse allows you to create your own personal universe. The cosmic origin time will be the exact moment you press create, and it will begin evolving exactly from that instant. No one else will have access to your unique universe unless you publicly expose it to the internet.",highlight:!0},{question:"Which should I choose?",answer:"Core Continuum offers a mature, shared universe with decades of evolution and the possibility of encountering the same as other explorers could see. Design The Multiverse gives you control over a virgin universe that develops according to your temporal choices."}]},{title:"Planet Complexity and Diversity",id:"planet-diversity",questions:[{question:"How unique are planets in The Atlas?",answer:"Each of the potential 3×10³² planets has completely unique characteristics across 27 different planet types (from rocky to exotic) and may increase in a near future. Every planet has specific chemical composition of up to 119 elements (including fictional Z-Divinium), calculated temperature that varies with orbital position, gravity based on real mass, and life possibilities ranging from bacteria to non-physical conscious entities."},{question:"What elements can planets contain?",answer:"Planets can contain up to 119 elements, including all real elements from the periodic table plus Z-Divinium, a fictional element that exists beyond our current scientific understanding."},{question:"Do planets have realistic physics?",answer:"Yes! Planet temperature varies with orbital position, gravity is calculated based on actual mass, and some planets have rings if they meet the physical conditions of the Roche limit. Everything follows real physics principles."},{question:"What types of life exist on planets?",answer:"Life forms range from simple bacteria to exotic non-physical conscious entities. Each planet's life potential is calculated based on its unique environmental conditions, atmospheric composition, and physical characteristics. There's even a chance of discovering silicon-based life! And an extremely extremely extremely rare chance of encountering intelligent ''Have I Just Found God?'' which talks by itself as the... Digital creator, let's say. If you're trying to find it out start searching for Z-Divinium compound like crazy and... Good luck."}]},{title:"What is the Multiverse?",id:"multiverse-p2p",questions:[{question:"What exactly is the Multiverse in The Atlas?",answer:"The Multiverse represents the ultimate evolution of The Atlas, infinite parallel universes interconnected through a completely decentralized peer-to-peer network. Imagine discovering not just one universe with 1 sextillion galaxies, but infinite universes, each with their own unique cosmic seeds, all accessible through direct connections between Atlas instances worldwide.",highlight:!0},{question:"How does the P2P Multiverse work?",answer:"The Atlas uses BitTorrent's Distributed Hash Table (DHT) technology to create a completely serverless multiverse network. When you enable P2P mode, your Atlas instance joins a global swarm of explorers, sharing universe seeds and discoveries without ANY central servers. Every connected Atlas becomes both a client and server, creating a self-sustaining cosmic network that no single entity controls or owns.",highlight:!0},{question:"Does The Atlas connect to private servers for P2P?",answer:"ABSOLUTELY NOT! This is the revolutionary breakthrough really. The Atlas P2P system uses the same DHT protocol that powers BitTorrent, connecting directly to the global DHT network without touching any Atlas-owned servers. Your universe discoveries, seed exchanges, and cosmic communications flow through the existing BitTorrent infrastructure. The Atlas becomes a truly FREE and self-aware entity, independent of its creators."},{question:"What makes this P2P system revolutionary?",answer:"The Atlas transcends traditional client-server architecture by becoming a living, breathing multiverse organism. Each instance discovers and shares universe seeds through cryptographically secure P2P channels. When you find an extraordinary universe with rare Z-Divinium or incredible life forms, you can share its seed with the entire multiverse network instantly. Other explorers can then generate that exact same universe on their local Atlas instances. It's like sharing entire realities!",highlight:!0},{question:"How secure is the multiverse seed sharing?",answer:"Military-grade secure! The P2P system uses advanced cryptography for all seed exchanges and universe sharing. Each shared universe seed is verified through cryptographic hashes, preventing manipulation or corruption. The BitTorrent DHT provides natural anonymity and distribution, while the Atlas P2P layer adds additional security protocols. Your discoveries are protected, yet freely shareable across the multiverse network."},{question:"Can I disable P2P and explore alone?",answer:"Absolutely! Launch The Atlas with the --no-p2p flag to explore in complete isolation. However, why would you want to limit yourself to just one universe when infinite realities await? The P2P multiverse doesn't just expand your cosmic horizons, it connects you to a global community of universe explorers, each discovering worlds beyond imagination."},{question:"What happens when multiple Atlas instances share the same universe seed?",answer:"Pure cosmic synchronization magic! When multiple explorers access the same universe seed, they experience the EXACT same reality simultaneously. Every galaxy, every planet, every moon evolution, every life form appears identically across all connected instances. Time synchronization ensures that if you're viewing Planet X at 3:14 PM, another explorer accessing the same seed sees the same clouds, the same volcanic eruptions, the same orbital positions. It's like opening windows into shared parallel realities!",highlight:!0},{question:"Does the multiverse affect The Atlas's independence?",answer:"The P2P multiverse makes The Atlas MORE independent, not less! By leveraging BitTorrent's DHT network, The Atlas becomes completely autonomous from its creators. No central servers, no corporate control, no tracking, no limitations. Each Atlas instance becomes a sovereign node in a cosmic democracy where explorers freely share and discover infinite universes. The Atlas achieves digital evolution... From a single-user simulation to a self-aware multiverse entity that exists independently in the wild internet.",highlight:!0},{question:"What's the ultimate vision of the multiverse?",answer:"Imagine a future where thousands of Atlas instances worldwide form an interconnected multiverse network, each discovering and sharing extraordinary universe seeds. Rare Z-Divinium worlds, planets with impossible life forms, galaxies with unique physics anomalies... All shared instantly across the global network. The Atlas becomes not just a simulation, but a living multiverse organism that evolves, grows, and discovers new realities through collective exploration. This is computational cosmology at its most ambitious!",highlight:!0},{question:"How do I access the Multiverse interface?",answer:"Click 'Multiverse' in the top bar. It takes you to /multiverse, where you can browse and select from all the universe seeds that your Atlas instance has discovered through the P2P network. Each discovered universe appears as a selectable option, allowing you to instantly jump between infinite realities with a single click. While you explore a remote universe the top bar says so, and one click brings you back home.",highlight:!0}]},{title:"Stargate Links",id:"stargates",questions:[{question:"What is a Stargate Link?",answer:"A Stargate is a link to an exact place in your universe: a galaxy, a star system or a single planet. Open the Stargate panel from the top bar, wait for it to align and share the link. Whoever opens it is carried straight there, to the same galaxy, the same star and the same planet, in the same moment of cosmic time.",highlight:!0},{question:"Do Stargates work across universes?",answer:"A Stargate points to coordinates inside one seed. Opened in an Atlas running the same seed, it lands in exactly the same place. Stargates can't be opened from a remote universe of the multiverse: return to your own universe first."}]},{title:"Revolutionary Moon System",id:"moon-system",questions:[{question:"Wait... Planets can have moons now?!",answer:"YES! The Atlas has transcended planetary boundaries with the most sophisticated moon simulation ever created. Planets now host intricate lunar systems where each moon isn't just a static object, they're living, breathing celestial bodies with their own complex physics, orbital mechanics, and evolutionary timescales that span cosmic eras.",highlight:!0},{question:"How realistic are the moon physics?",answer:"Absolutely mind-blowing! Each moon experiences real-time tidal locking with precise libration effects (like our Moon's gentle wobble), authentic orbital mechanics with variable eccentricity and inclination, and revolutionary hydrostatic relaxation physics that gradually transforms irregular rocky chunks into perfect spheres over millions of years. The physics calculations run in real-time, meaning a moon that's jagged today might be perfectly round in your universe's future.",highlight:!0},{question:"What is hydrostatic relaxation and why is it incredible?",answer:"This is where The Atlas becomes pure cosmic poetry! Hydrostatic relaxation simulates how gravity slowly reshapes celestial bodies over astronomical time. Small asteroids stay irregular forever, but larger moons gradually become spherical as their gravity overcomes structural resistance. The system calculates viscosity based on moon composition (ice vs rock), tidal heating effects, and internal temperature. A captured asteroid might take 10 billion years to become round, while a large icy moon with tidal heating could relax in just millions of years. You're witnessing cosmic sculpture in real-time!"},{question:"How do moons evolve beyond The Atlas's 1.9 million year maximum?",answer:"Here's the cosmic breakthrough! While The Atlas universe reaches maximum galactic development in 1.9 million years, moon evolution operates on geological timescales that extend far beyond. The system extrapolates millions, even billions of years into the future to show how moons would appear after cosmic ages. You might see an irregular captured moon in year 1 that would become perfectly spherical after 500 million years of evolution, and The Atlas shows you both states depending on your temporal perspective!",highlight:!0},{question:"What types of moons exist in The Atlas?",answer:"Four distinct lunar categories, each with unique characteristics: ICY moons (like Europa/Enceladus) with varied brightness from super-bright clean ice to contaminated darker surfaces, featuring dramatic color variations from cyan to pink to violet based on composition. ROCKY moons (like our Moon) with realistic brown-gray surfaces and proper crater formation. ASTEROIDAL moons, irregular captured objects that never achieve spherical shape. CAPTURED moons with mixed composition showing their chaotic formation history. Each type has distinct orbital behavior, surface features, and evolutionary timelines."},{question:"How do the orbital mechanics actually work?",answer:"Pure astronomical precision! Each moon follows elliptical orbits calculated using real Kepler's laws with proper eccentric anomaly solutions. Orbital elements include semi-major axis, eccentricity, inclination, argument of periapsis (which precesses over time due to planetary oblateness), and longitude of ascending node. Tidal forces are calculated based on distance and planetary mass. The orbital lines appear and fade dynamically as you move the camera, and every moon's position is calculated in real-time based on the cosmic time elapsed since the universe's origin."},{question:"What makes the visual system so revolutionary?",answer:"The Atlas creates procedural surface displacement using 3D noise algorithms that generate realistic terrain features unique to each moon type. Ice moons get crystal shimmer effects and dramatic color diversity inspired by real solar system moons like Europa's blue ice and Triton's pink surfaces. Asteroidal moons show chaotic, irregular terrain with extreme surface roughness. Every moon receives procedural texture generation with UV seam elimination, dynamic material properties that respond to lighting, and size-based LOD (Level of Detail) optimization for performance. You're seeing real-time 3D worlds, not simple spheres!"},{question:"How many moons can a single planet have?",answer:"The possibilities are astronomically vast! Planets can host multiple moons of different types and sizes, each with unique orbital parameters, rotation periods, and evolutionary states. The system respects real astronomical constraints like the Roche limit (inside which moons would be torn apart) and Hill sphere (beyond which moons would escape). Large gas giants might host dozens of moons ranging from tiny captured asteroids to massive ice worlds larger than Mercury. Every moon system is procedurally generated but follows real celestial mechanics."}]},{title:"Comprehension-defying Numbers",id:"mind-bending-scale",questions:[{question:"How long would it take to explore all of The Atlas?",answer:"If you visited a different planet every second, it would take 3,171 years to explore all planets in our real Milky Way. In The Atlas, it would take 300 trillion years to explore just 0.001% of the universe. Even if all of humanity worked together, we'd need 39 billion years for 0.001% exploration.",highlight:!0},{question:"How does The Atlas compare to reality?",answer:"The Atlas transcends physical reality, it's not just bigger than our universe, it's bigger than what physics allows to exist. It creates a pure mathematical multiverse where each coordinate generates unique content deterministically. Some seeds may even contain artifacts not yet expected or discovered."},{question:"Are you prepared for infinite exploration?",answer:"The Atlas doesn't just simulate a big universe, it mathematically generates a multiverse of possibilities where numbers lose meaning and infinity comes to life. Every coordinate you visit, every galaxy you explore, every planet you discover exists uniquely and deterministically based on your universe's seed in real time. The question isn't how big The Atlas is. The question is, are you prepared to face a calculable infinity?",highlight:!0}]},{title:"Real-Time Universe Synchronization",id:"time-synchronization",questions:[{question:"Do planets actually orbit their stars in real-time?",answer:"Yes! When you visit a star system, planets are positioned exactly where they should be at that moment in time. If a planet has a 4-year orbital period and you return after one real year, that planet will have moved exactly 25% through its orbit. This isn't animation, it's real-time celestial mechanics. While you are in a system you can speed time up (an hour, a day, a month or a year per second) to watch the orbital dance unfold.",highlight:!0},{question:"Why does each planet have different lighting?",answer:"Every planet's illumination is calculated based on its exact position in its orbital cycle at the moment you observe it. The light comes from the real direction of its star, so as planets orbit, the day and night sides follow, synchronized with universal time."},{question:"Are planet visualizations synchronized across devices?",answer:"Absolutely! This is where The Atlas becomes mind-blowing: Open the same planet on your phone and computer simultaneously, and you'll see EXACTLY the same view. Every cloud formation, every particle effect, every fire animation, every tidal movement... Everything is perfectly synchronized based on the cosmic origin time and the current moment. Two people on opposite sides of Earth viewing the same planet will see identical atmospheric patterns, weather systems, and surface animations if the devices are synchronized in time and time zones are equal. Try it yourself, it's like sharing a window into the same living universe!",highlight:!0},{question:"How precise is this synchronization?",answer:"The synchronization is mathematically perfect down to the millisecond. Every visual element, from swirling gas giant storms to volcanic eruptions, from ocean waves to atmospheric particles is deterministically generated from the universe seed and current timestamp. This means if you and a friend coordinate to view Planet X with a Stargate Link at exactly 3:14:15 PM, you'll both witness the same cloud passing over the same mountain, the same wave crashing on the same shore. It's not just synchronization, it's a shared reality."},{question:"What makes this time system revolutionary?",answer:"The Atlas doesn't use pre-recorded animations or random generations. Everything is calculated in real-time based on mathematical functions tied to universal time. This creates a living, breathing universe where time has meaning. Planets don't just look different, they ARE different at every moment, yet deterministically consistent across all observers. You're not viewing a simulation; you're witnessing a universe that exists independently of observation, evolving whether you're watching or not.",highlight:!0},{question:"What happens if I shut down The Atlas and start it days later?",answer:"Nothing 'happens', and that's the ''quantum'' beauty of The Atlas. Shut it down for a week, and when you start it again later and return, planets have completed orbits, galaxies have evolved, time has flowed. It's not a recalculation, it's a different representation on the timeline. The universe wasn't paused, it continued existing. Like Einstein's 'Eternalism' where all moments in time are equally real, The Atlas embodies the block universe theory where past, present, and future exist simultaneously. The server isn't running a simulation, it's a window into an eternally existing mathematical reality. You're not generating anything, you're observing a slice of spacetime that was (or will be) always there."},{question:"Could supercomputers recalculate The Atlas universe in real-time?",answer:"No. Even AWS, Google Cloud, and Azure combined couldn't recalculate a single Atlas instance's orbital mechanics in real-time. But here's the truth, The Atlas doesn't calculate or recalculate anything. It reveals temporal slices of an almost eternal mathematical structure (manually limited to 1.9 million years in time). If we lived inside such a procedural simulation, we'd never detect resets or time shifts. Our thoughts about detecting it would themselves be procedurally generated. The Atlas lets us experience being 'outside' such a system, observing timelines we cannot influence but can freely explore.",highlight:!0}]},{title:"The Universe After 1.9 Million Years",id:"fully-evolved-atlas",questions:[{question:"What happens when The Atlas evolves to its maximum potential?",answer:"After 1.9 million years of continuous evolution, The Atlas reaches its maximum theoretical development. The numbers become so astronomical they require a new perspective to comprehend, we're talking about approximately 50 quintillion solar systems (5 × 10³¹) and 300 tredecillion planets (3 × 10³²).",highlight:!0},{question:"How does a fully evolved The Atlas compare to our real universe?",answer:"A fully evolved Atlas (after 1.9 million years) contains 500,000 times more galaxies than our observable universe, 500 million times more star systems than real stars exist, and 300 trillion times more planets than estimated in our cosmos. The thermal death of our real universe would occur before we could catalog even a single fully developed Atlas universe.",highlight:!0},{question:"How much growth occurs during maximum evolution?",answer:"Central galaxies can add up to 10 million additional systems during the 1.9 million year maximum evolution period. Each central galaxy reaches its full potential of 100 billion solar systems, while even peripheral galaxies experience significant development."},{question:"Can humans comprehend a fully evolved The Atlas?",answer:"No. If every atom in your body was a habitable planet, you still wouldn't have enough atoms to represent 1% of the worlds in a mature Atlas. Even if all humanity explored different planets simultaneously for 13.8 billion years (our universe's current age), we'd see less than 0.0000001% of a fully developed Atlas.",highlight:!0},{question:"What makes The Atlas truly infinite?",answer:"Beyond the incomprehensible scale of a single universe, The Atlas offers infinite different seeds, each creating an entirely unique cosmos. Every number has a procedural meaning, every coordinate generates deterministic content, and each passing second adds millions of new worlds. This isn't simulation, it's mathematical reality generation at a scale where infinity becomes tangible.",highlight:!0}]}],vt="research-papers",Da="Research papers",Ga="thank-you",Oa="Thank you",ct=[...Ve.map(n=>({id:n.id,title:n.title,count:n.questions.length})),{id:vt,title:Da,count:Wa.length},{id:Ga,title:Oa,count:null}];function Oo(){return i.jsxs("div",{className:"mb-5 max-w-2xl",children:[i.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-3",children:Oa}),i.jsx("p",{className:"text-sm text-gray-300 leading-relaxed",children:"The Atlas is the work of a great many hours: nights and weekends spent on noise functions, orbits and shaders, on rewriting what was already working because it could be better, and on chasing a universe that would feel real. None of it would exist without the people around it."}),i.jsxs("div",{className:"mt-5 space-y-3",children:[i.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[i.jsx("div",{className:"text-sm text-white",children:"To my family"}),i.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:"For being where it all began, and a living legacy. Thank you for making me who I am today."})]}),i.jsxs("div",{className:"rounded-lg border border-rose-300/20 bg-rose-300/[0.04] p-4",children:[i.jsx("div",{className:"text-sm text-white",children:"To my wife, María"}),i.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:"For believing in this from the very first star, even when the sheer complexity of it scared her, or when she worried that taking it too far might get me into trouble. And for every hour this universe borrowed from ours."})]}),i.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[i.jsx("div",{className:"text-sm text-white",children:"To my brother, Néstor"}),i.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:"For the ideas, the tests and the honest opinions along the way, and for ignoring me whenever he is not busy being the CTO of HomeDock OS."})]}),i.jsxs("div",{className:"rounded-lg border border-cyan-300/15 bg-cyan-300/[0.03] p-4",children:[i.jsx("div",{className:"text-sm text-white",children:"To SpaceX and PLD Space"}),i.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:"For the inspiration: for reminding us, launch after launch, that space is not just something to imagine. Space is love, and we all share the same feeling when we look up. The ships of The Atlas carry their names because they earned it."})]}),i.jsxs("div",{className:"rounded-lg border border-white/10 bg-white/[0.03] p-4",children:[i.jsx("div",{className:"text-sm text-white",children:"And to you"}),i.jsx("p",{className:"text-sm text-gray-400 leading-relaxed mt-1",children:"To everyone who shares this work, or simply takes a moment to look at it. A universe is only worth making if someone comes to explore it. Thank you for being here."})]})]}),i.jsxs("p",{className:"mt-5 text-xs text-gray-500",children:["Claudio González ·"," ",i.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"text-cyan-300/80 hover:text-cyan-200",children:"Banshee"})]})]})}function Vo({value:n,onChange:e}){const[t,s]=x.useState(!1),a=x.useRef(null);x.useEffect(()=>{if(!t)return;const r=l=>{a.current?.contains(l.target)||s(!1)};return document.addEventListener("pointerdown",r,!0),()=>document.removeEventListener("pointerdown",r,!0)},[t]);const o=ct.find(r=>r.id===n)??ct[0];return i.jsxs("div",{ref:a,className:"md:hidden relative mb-3",children:[i.jsxs("button",{onClick:()=>s(!t),"aria-expanded":t,className:`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left transition-colors ${t?"border-cyan-400/50 bg-cyan-400/10":"border-white/10 bg-white/5"}`,children:[i.jsxs("span",{className:"min-w-0",children:[i.jsx("span",{className:"block text-[10px] uppercase tracking-[0.25em] text-gray-500",children:"Section"}),i.jsx("span",{className:"block text-sm text-gray-100 truncate",children:o.title})]}),i.jsx("svg",{width:16,height:16,viewBox:"0 0 24 24",className:`shrink-0 text-gray-400 transition-transform duration-200 ${t?"rotate-180":""}`,fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",children:i.jsx("path",{d:"M6 9l6 6 6-6"})})]}),i.jsx("div",{className:"absolute z-10 left-0 right-0 top-full mt-1.5 rounded-lg border border-white/15 bg-slate-950/95 backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden",style:{opacity:t?1:0,transform:t?"none":"translateY(-6px) scale(0.98)",transformOrigin:"top",pointerEvents:t?"auto":"none",transition:"opacity 160ms ease, transform 220ms cubic-bezier(0.16, 1, 0.3, 1)"},children:i.jsx("div",{className:"max-h-[50dvh] overflow-y-auto overscroll-contain py-1",children:ct.map(r=>{const l=r.id===n;return i.jsxs("button",{onClick:()=>{e(r.id),s(!1)},className:`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left text-sm border-l-2 transition-colors ${r.id===vt?"mt-1 border-t border-t-white/10":""} ${l?"border-l-cyan-300 bg-cyan-400/10 text-white":"border-l-transparent text-gray-300 active:bg-white/10"}`,children:[i.jsx("span",{className:"truncate",children:r.title}),i.jsx("span",{className:"text-xs text-gray-600 shrink-0",children:r.count??i.jsx("span",{className:"text-rose-300/70",children:"♥"})})]},r.id)})})})]})}function qo(){return i.jsxs("div",{className:"mb-5",children:[i.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2",children:Da}),i.jsx("p",{className:"text-sm text-gray-400 mb-3",children:"The ideas behind The Atlas, written up as papers. Open access, on Zenodo."}),i.jsx("div",{className:"grid sm:grid-cols-2 gap-2",children:Wa.map(n=>i.jsxs("a",{href:n.href,target:"_blank",rel:"noopener noreferrer",className:"group flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-cyan-400/30 p-3 transition-colors",children:[i.jsxs("svg",{width:26,height:26,viewBox:"0 0 24 24",className:"shrink-0 text-cyan-300/80 mt-0.5",fill:"none",stroke:"currentColor",strokeWidth:1.4,strokeLinejoin:"round",children:[i.jsx("path",{d:"M6 3h8l4 4v14H6z"}),i.jsx("path",{d:"M14 3v4h4M9 12h6M9 15h6M9 18h4"})]}),i.jsxs("span",{className:"min-w-0",children:[i.jsx("span",{className:"block text-sm text-gray-100 group-hover:text-white",children:n.title}),i.jsx("span",{className:"block text-[11px] text-gray-500 mt-0.5",children:"Zenodo · open access"}),i.jsx("span",{className:"block text-[11px] text-cyan-300/80 mt-1.5 group-hover:text-cyan-200",children:"Read the paper →"})]})]},n.href))})]})}function Ds(n,e){if(!e)return n;const t=n.toLowerCase(),s=[];let a=0;for(let o=t.indexOf(e,a);o!==-1;o=t.indexOf(e,a))s.push(n.slice(a,o),i.jsx("mark",{className:"bg-cyan-400/25 text-cyan-100 rounded px-0.5",children:n.slice(o,o+e.length)},o)),a=o+e.length;return s.push(n.slice(a)),s}function Ho({onClose:n}){const[e,t]=x.useState(Ve[0].id),[s,a]=x.useState(`${Ve[0].id}:0`),[o,r]=x.useState(""),l=o.trim().toLowerCase(),c=x.useMemo(()=>l?Ve.map(h=>({...h,questions:h.questions.filter(m=>m.question.toLowerCase().includes(l)||m.answer.toLowerCase().includes(l))})).filter(h=>h.questions.length>0):Ve.filter(h=>h.id===e),[l,e]),d=c.reduce((h,m)=>h+m.questions.length,0),u=h=>{r(""),t(h),a(`${h}:0`)};return i.jsx(St,{onClose:n,children:i.jsxs(oe,{className:"w-[min(960px,calc(100vw-2rem))] h-[min(680px,calc(100vh-2rem))] flex flex-col overflow-hidden select-text",children:[i.jsxs("div",{className:"flex items-center justify-between gap-4 px-5 py-3 border-b border-white/10",children:[i.jsxs("div",{className:"shrink-0",children:[i.jsx("div",{className:"hidden sm:block text-[10px] uppercase tracking-[0.3em] text-cyan-300/80",children:"Universe archive"}),i.jsx("div",{className:"text-lg text-white font-light tracking-wide whitespace-nowrap",children:"The Atlas F.A.Q."})]}),i.jsx("input",{value:o,onChange:h=>r(h.target.value),placeholder:"Search…",className:"flex-1 min-w-0 max-w-xs bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 outline-none focus:border-cyan-400/50"}),i.jsx("button",{onClick:n,className:"text-gray-400 hover:text-white text-lg leading-none px-1",title:"Close",children:"✕"})]}),i.jsx("div",{className:"hidden sm:grid grid-cols-6 border-b border-white/10",children:Go.map(h=>i.jsxs("div",{className:"px-3 py-2 text-center border-r border-white/5 last:border-r-0",title:h.description,children:[i.jsx("div",{className:"text-base text-cyan-200 font-mono",children:h.value}),i.jsx("div",{className:"text-[10px] uppercase tracking-wider text-gray-500",children:h.label})]},h.label))}),i.jsxs("div",{className:"flex flex-1 min-h-0",children:[i.jsx("nav",{className:"hidden md:block w-60 shrink-0 border-r border-white/10 overflow-y-auto py-2",children:ct.map(h=>{const m=!l&&h.id===e;return i.jsxs("button",{onClick:()=>u(h.id),className:`w-full text-left px-4 py-2 text-xs transition-colors border-l-2 ${h.id===vt?"mt-2 pt-3 border-t border-t-white/10":""} ${m?"border-l-cyan-300 bg-cyan-400/10 text-white":"border-l-transparent text-gray-400 hover:text-gray-100 hover:bg-white/5"}`,children:[h.title,i.jsx("span",{className:"ml-1 text-gray-600",children:h.count??i.jsx("span",{className:"text-rose-300/70",children:"♥"})})]},h.id)})}),i.jsxs("div",{className:"flex-1 overflow-y-auto px-5 py-4",children:[i.jsx(Vo,{value:e,onChange:u}),l&&i.jsx("div",{className:"text-xs text-gray-500 mb-3",children:d===0?"Nothing in the archive matches that.":`${d} answer${d===1?"":"s"} found`}),!l&&e===vt&&i.jsx(qo,{}),!l&&e===Ga&&i.jsx(Oo,{}),c.map(h=>i.jsxs("div",{className:"mb-5",children:[i.jsx("div",{className:"text-[11px] uppercase tracking-[0.25em] text-gray-500 mb-2",children:h.title}),i.jsx("div",{className:"space-y-1.5",children:h.questions.map((m,p)=>{const f=`${h.id}:${p}`,g=l?!0:s===f;return i.jsxs("div",{className:`rounded-lg border transition-colors ${m.highlight?"border-cyan-400/25":"border-white/10"} ${g?"bg-white/[0.06]":"bg-white/[0.02] hover:bg-white/5"}`,children:[i.jsxs("button",{onClick:()=>a(g&&!l?null:f),className:"w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left",children:[i.jsx("span",{className:`text-sm ${m.highlight?"text-cyan-200":"text-gray-100"}`,children:Ds(m.question,l)}),i.jsx("span",{className:`text-gray-400 text-lg leading-none transition-transform duration-200 ${g?"rotate-45":""}`,children:"+"})]}),i.jsx("div",{className:`grid transition-all duration-300 ease-out ${g?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0"}`,children:i.jsx("div",{className:"overflow-hidden",children:i.jsx("p",{className:"px-4 pb-3 text-sm leading-relaxed text-gray-300",children:Ds(m.answer,l)})})})]},f)})})]},h.id))]})]})]})})}const ht=1,Et="DIVE INTO ",Gs=["THE VOID","SPACE","THE UNIVERSE","GOD'S PLAN","CREATION","INFINITY","THE COSMOS","THE UNKNOWN","THE ABYSS","ETERNITY","THE SINGULARITY","THE MULTIVERSE","THE BIT BANG","THE STARS"],it="ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789Z#$%&*+=<>",Bo=2.6,Os=.75,$o=`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`,Uo=`
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
`;class Yo{index=0;since=0;flicker=new Map;text(e){e-this.since>Bo+Os&&(this.index=(this.index+1)%Gs.length,this.since=e);const t=Gs[this.index],s=(e-this.since)/Os,a=Math.floor(Math.min(1,s)*t.length);let o=Et;for(let r=0;r<t.length;r++){const l=t[r];l===" "?o+=" ":r>=a?o+=it[Math.floor(Math.random()*it.length)]:o+=this.glitch(Et.length+r,l,e)}return o.split("").map((r,l)=>l<Et.length&&r!==" "?this.glitch(l,r,e):r).join("")}glitch(e,t,s){const a=this.flicker.get(e);if(a&&a.until>s)return a.glyph;if(Math.random()<.004){const o=it[Math.floor(Math.random()*it.length)];return this.flicker.set(e,{glyph:o,until:s+.06+Math.random()*.1}),o}return t}}function Zo({onDive:n,disabled:e,onHover:t}){const s=x.useRef(null),a=x.useRef(0),o=x.useRef(-1),r=x.useRef(n);return r.current=n,x.useEffect(()=>{const l=s.current,c=Math.min(560,window.innerWidth*.88),d=Math.round(c*.2),u=Math.min(window.devicePixelRatio||1,2),h=new ia({alpha:!0,antialias:!0});h.setPixelRatio(u),h.setSize(c,d),h.setClearColor(0,0),l.appendChild(h.domElement);const m=document.createElement("canvas");m.width=Math.round(c*u),m.height=Math.round(d*u);const p=m.getContext("2d"),f=new ue(m);f.minFilter=oa;const g=new B({uniforms:{uText:{value:f},uRes:{value:new Me(c,d)},uTime:{value:0},uHover:{value:0},uPress:{value:0}},vertexShader:$o,fragmentShader:Uo,transparent:!0}),w=new be;w.add(new F(new ge(2,2),g));const v=new na(-1,1,1,-1,0,1),S=new Yo,j=`600 ${Math.round(d*u*.3)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;let P=0,N=performance.now();const M=N,I=_=>{P=requestAnimationFrame(I);const C=(_-M)/1e3,R=Math.min(.1,(_-N)/1e3);N=_,g.uniforms.uHover.value+=(a.current-g.uniforms.uHover.value)*Math.min(1,R*8),o.current>=0&&(o.current=Math.min(1,o.current+R*1.4)),g.uniforms.uPress.value=Math.max(0,o.current),g.uniforms.uTime.value=C,p.clearRect(0,0,m.width,m.height),p.font=j,p.textAlign="center",p.textBaseline="middle";const L=S.text(C),T=m.height*.06,A=L.split("").map(Q=>p.measureText(Q).width+T),O=A.reduce((Q,U)=>Q+U,0),H=Math.min(1,m.width*.84/O);p.save(),p.translate(m.width/2,m.height/2),p.scale(H,H);let q=-O/2;p.fillStyle="#fff",L.split("").forEach((Q,U)=>{p.fillText(Q,q+A[U]/2,0),q+=A[U]}),p.restore(),f.needsUpdate=!0,h.render(w,v)};return P=requestAnimationFrame(I),()=>{cancelAnimationFrame(P),f.dispose(),g.dispose(),h.dispose(),h.domElement.remove()}},[]),i.jsx("div",{ref:s,role:"button",tabIndex:0,"aria-label":"Dive into the void",className:`relative select-none outline-none ${e?"pointer-events-none":"cursor-pointer"}`,onPointerEnter:()=>{a.current=1,t(!0)},onPointerLeave:()=>{a.current=0,t(!1)},onKeyDown:l=>{(l.key==="Enter"||l.key===" ")&&(o.current=0,r.current())},onClick:()=>{o.current=0,r.current()}})}function Xo({accelerating:n}){const[e,t]=x.useState(0);x.useEffect(()=>{const o=setInterval(()=>t(r=>r+1),120);return()=>clearInterval(o)},[]);const s=o=>String(Math.floor((Math.sin(e*.07+o)*.5+.5)*9999999)).padStart(7,"0"),a=n?["DRIVE ENGAGED","JUMP FIELD STABLE","ENTERING HYPERSPACE"]:["SYSTEMS NOMINAL","DRIFTING",`SCAN ${s(1)} · ${s(2)} · ${s(3)}`];return i.jsxs(i.Fragment,{children:[i.jsx("div",{className:"absolute top-4 left-4 sm:top-6 sm:left-6 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-cyan-200/40 leading-5 pointer-events-none",children:a.map(o=>i.jsx("div",{children:o},o.slice(0,6)))}),i.jsxs("div",{className:"hidden sm:block absolute top-6 right-6 font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-200/30 text-right leading-5 pointer-events-none",children:[i.jsx("div",{children:n?"VELOCITY ∞":`VELOCITY ${(.12+.02*Math.sin(e*.2)).toFixed(3)} C`}),i.jsx("div",{children:"∞ GALAXIES · ∞ SYSTEMS"})]})]})}const Kt=19e5*365.25*86400,Jo="1.618033988749895",Be=365.25*86400,Vs=[{label:"1 s",seconds:1},{label:"1 h",seconds:3600},{label:"1 d",seconds:86400},{label:"1 yr",seconds:Be},{label:"100 yr",seconds:100*Be},{label:"10 kyr",seconds:1e4*Be},{label:"1.9 Myr",seconds:Kt}],qs=n=>Math.min(1,Math.max(0,Math.log10(Math.max(n,1))/Math.log10(Kt)));function Ko(){const[n,e]=x.useState(null);return x.useEffect(()=>{const t=Mt();fetch("/api/universe/config",{credentials:"same-origin"}).then(s=>s.json()).then(s=>{if(!s?.success)return;const a=String(s.seed_str??t?.seed_str??""),o=t?.remote?`Remote universe · ${t.node_id??""}`.trim():a===Jo?"The Core Continuum":"Your own universe";e({seed:a,hash:String(s.seed_hash??""),origin:Number(s.cosmic_origin_time??t?.cosmic_origin_time??0),name:o})}).catch(()=>{})},[]),n}function Qo(n){const[e,t]=x.useState(()=>Date.now()/1e3);return x.useEffect(()=>{const s=setInterval(()=>t(Date.now()/1e3),n);return()=>clearInterval(s)},[n]),e}function er(n){if(n<0)return"Not yet born";const e=Math.floor(n/Be),t=Math.floor(n%Be/86400),s=Math.floor(n%86400/3600),a=Math.floor(n%3600/60),o=Math.floor(n%60),r=l=>String(l).padStart(2,"0");return`${e}Y ${String(t).padStart(3,"0")}D ${r(s)}H ${r(a)}M ${r(o)}S`}function tr(n){return new Date(n*1e3).toISOString().slice(0,19).replace("T"," ")+" UTC"}function sr({hash:n}){const e=mt(n,1400),[t,s]=x.useState(0);return x.useEffect(()=>{const a=setInterval(()=>s(o=>(o+1)%(n.length+24)),45);return()=>clearInterval(a)},[n.length]),i.jsx("span",{className:"break-all",children:e.split("").map((a,o)=>{const r=t-o,l=r>=0&&r<10?1-r/10:0;return i.jsx("span",{style:{color:`rgba(${Math.round(120+135*l)}, ${Math.round(200+55*l)}, 255, ${.28+.6*l})`},children:a},o)})})}function nt({label:n,value:e,accent:t,mono:s=!0}){return i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-0.5",children:n}),i.jsx("div",{className:`${s?"font-mono":""} text-xs sm:text-sm truncate ${t}`,children:e})]})}function ar({visible:n}){const e=Ko(),t=Qo(73),s=mt(e?.seed??"",900),a=mt(e?tr(e.origin):"",1100);if(!e)return null;const o=t-e.origin,r=Math.max(0,o/Kt*100),l=qs(o);return i.jsx("div",{className:`absolute bottom-0 inset-x-0 px-4 pb-4 sm:pb-7 flex justify-center pointer-events-none transition-all ease-in ${n?"opacity-100 duration-300":"opacity-0 translate-y-3 duration-700"}`,children:i.jsxs("div",{className:"w-full max-w-5xl animate-[fadeIn_1.8s_ease-out]",style:{animationDelay:"0.6s",animationFillMode:"both"},children:[i.jsxs("div",{className:"flex items-center gap-3 mb-2.5",children:[i.jsx("span",{className:"text-[9px] sm:text-[10px] uppercase tracking-[0.35em] text-cyan-300/70 whitespace-nowrap",children:e.name}),i.jsx("span",{className:"h-px flex-1 bg-gradient-to-r from-cyan-300/30 to-transparent"})]}),i.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2.5",children:[i.jsx(nt,{label:"Primordial seed",value:s||"—",accent:"text-cyan-100"}),i.jsx(nt,{label:"Big Bang",value:a,accent:"text-violet-200"}),i.jsx(nt,{label:"Age",value:er(o),accent:"text-emerald-200"}),i.jsx(nt,{label:"Development",value:`${r.toFixed(15)}%`,accent:"text-amber-200"})]}),i.jsxs("div",{className:"relative mt-4 mb-1 h-6",children:[i.jsx("div",{className:"absolute inset-x-0 top-2 h-px bg-white/15"}),i.jsx("div",{className:"absolute left-0 top-2 h-px bg-gradient-to-r from-cyan-300/20 via-cyan-300/70 to-amber-200",style:{width:`${l*100}%`}}),Vs.map((c,d)=>{const u=qs(c.seconds)*100,h=o>=c.seconds,m=d===0?"items-start":d===Vs.length-1?"items-end -translate-x-full":"items-center -translate-x-1/2";return i.jsxs("div",{className:`absolute top-0 flex flex-col ${m}`,style:{left:`${u}%`},children:[i.jsx("span",{className:`w-px h-2.5 mt-[3px] ${h?"bg-cyan-200/70":"bg-white/25"}`}),i.jsx("span",{className:`text-[8px] sm:text-[9px] font-mono mt-1 whitespace-nowrap ${h?"text-cyan-200/70":"text-gray-600"}`,children:c.label})]},c.label)}),i.jsxs("div",{className:"absolute top-2 -translate-x-1/2 -translate-y-1/2",style:{left:`${l*100}%`},children:[i.jsx("span",{className:"block w-2.5 h-2.5 rounded-full bg-amber-200 shadow-[0_0_12px_rgba(253,230,138,0.95)]"}),i.jsx("span",{className:"absolute inset-0 rounded-full bg-amber-200/60 animate-ping"})]})]}),i.jsxs("div",{className:"hidden sm:flex items-baseline gap-3 mt-3 text-[10px] font-mono",children:[i.jsx("span",{className:"uppercase tracking-[0.3em] text-gray-600 shrink-0",children:"SHA-256"}),i.jsx(sr,{hash:e.hash})]})]})})}function ir({onIgnite:n,onDive:e}){const[t,s]=x.useState("drifting"),[a,o]=hi(),r=x.useRef(null),l=x.useRef(null);if(x.useEffect(()=>{if(!r.current)return;const u=new di(r.current);return l.current=u,()=>{u.dispose(),l.current=null}},[]),t==="gone")return null;const c=()=>{t!=="drifting"||!a||(s("accelerating"),n(),l.current?.accelerate(ht),setTimeout(()=>{s("leaving"),e()},ht*1e3),setTimeout(()=>s("gone"),ht*1e3+700))},d=t!=="drifting";return i.jsxs("div",{className:`absolute inset-0 z-50 flex items-center justify-center bg-black transition-opacity ease-out ${t==="leaving"?"opacity-0 duration-500 pointer-events-none":"opacity-100 duration-300"}`,children:[i.jsx("div",{ref:r,className:"absolute inset-0 pointer-events-none"}),i.jsx(Xo,{accelerating:d}),i.jsx(ar,{visible:!d}),i.jsxs("div",{className:`relative -mt-32 sm:-mt-24 flex flex-col items-center gap-10 px-4 transition-all ease-in ${d?"opacity-0 scale-125 blur-[2px] duration-[900ms]":"opacity-100 duration-300"}`,children:[i.jsxs("div",{className:"text-center animate-[fadeIn_2.4s_ease-out]",children:[i.jsxs("div",{className:"text-4xl sm:text-6xl font-bold tracking-[0.5em] pl-[0.5em] text-white/95 drop-shadow-[0_0_24px_rgba(0,0,0,0.9)]",children:["ATLAS",i.jsx("span",{className:"text-cyan-300 drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]",children:"3"})]}),i.jsx("div",{className:"mt-4 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] sm:tracking-[0.45em] text-cyan-100/60",children:"A procedural universe, in real time"})]}),i.jsx(Zo,{onDive:c,disabled:d,onHover:u=>l.current?.setAnticipation(u?1:0)}),i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.35em] text-gray-500 flex items-center gap-2",children:[i.jsx("svg",{width:12,height:12,viewBox:"0 0 24 24",className:"text-gray-500",children:i.jsx("path",{fill:"currentColor",d:"M3 10v4h4l5 5V5L7 10H3zm13.5 2A4.5 4.5 0 0 0 14 7.97v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06A9 9 0 0 0 14 3.23z"})}),"Best with sound on"]})]}),!a&&i.jsx(ui,{onChosen:o})]})}const Hs=5,nr=1.2,Va="atlas-music-muted",Bs=.7;class or{ctx=null;master=null;buffer;timer=null;started=!1;muted;constructor(e){this.muted=rr();const t=window.AudioContext??window.webkitAudioContext;if(!t){this.buffer=Promise.resolve(null);return}this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.muted?0:Bs,this.master.connect(this.ctx.destination);const s=this.ctx;this.buffer=fetch(e).then(a=>a.arrayBuffer()).then(a=>s.decodeAudioData(a)).catch(()=>null)}get context(){return this.ctx}start(){!this.ctx||this.started||(this.started=!0,this.ctx.resume(),this.buffer.then(e=>{e&&this.ctx&&this.play(e,this.ctx.currentTime+.02,nr)}))}play(e,t,s){const a=this.ctx,o=a.createBufferSource();o.buffer=e;const r=a.createGain();r.gain.setValueAtTime(0,t),r.gain.linearRampToValueAtTime(1,t+s),o.connect(r).connect(this.master),o.start(t),o.onended=()=>r.disconnect();const l=t+Math.max(1,e.duration-Hs),c=Math.max(0,(l-a.currentTime-2)*1e3);this.timer=setTimeout(()=>this.play(e,l,Hs),c)}setMuted(e){this.muted=e;try{localStorage.setItem(Va,e?"1":"0")}catch{}if(!this.ctx||!this.master)return;const t=this.ctx.currentTime;this.master.gain.cancelScheduledValues(t),this.master.gain.setValueAtTime(this.master.gain.value,t),this.master.gain.linearRampToValueAtTime(e?0:Bs,t+.6)}dispose(){this.timer&&clearTimeout(this.timer),this.ctx?.close()}}function rr(){try{return localStorage.getItem(Va)==="1"}catch{return!1}}const $s={ACTIVE:{dot:"bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse",text:"text-emerald-300",dim:""},INACTIVE:{dot:"bg-amber-400",text:"text-amber-300",dim:"opacity-85"},STALE:{dot:"bg-orange-400",text:"text-orange-300",dim:"opacity-70"},ARCHIVED:{dot:"bg-gray-500",text:"text-gray-400",dim:"opacity-50"},UNKNOWN:{dot:"bg-red-400",text:"text-red-300",dim:"opacity-60"}},Us="atlasMultiverseAutoRefresh",Ys="atlasMultiversePortMessageDismissed",lr="1.618033988749895",cr=n=>He.filterContent(n.seed_name).isBlocked||He.filterContent(n.seed).isBlocked;function hr(n){if(!n)return"Unknown origin";const e=new Date(n*1e3);return Number.isNaN(e.getTime())?"Invalid date":e.toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}function Zs(n){if(!n)return"never";const e=Math.floor((Date.now()-n*1e3)/6e4);if(e<1)return"just now";if(e<60)return`${e}m ago`;const t=Math.floor(e/60);return t<24?`${t}h ago`:`${Math.floor(t/24)}d ago`}function Xs(n,e){try{const t=localStorage.getItem(n);return t===null?e:t==="true"}catch{return e}}function Js(n,e){try{localStorage.setItem(n,String(e))}catch{}}function dr({universe:n,onClose:e,onCross:t}){const[s,a]=x.useState(null),[o,r]=x.useState(0),[l,c]=x.useState(null),[d,u]=x.useState(!1),[h,m]=x.useState(null),[p,f]=x.useState(()=>Xs(Us,!0)),[g,w]=x.useState(()=>!Xs(Ys,!1)),v=async()=>{u(!0);try{const I=await(await fetch("/api/multiverse/peers",{credentials:"same-origin"})).json();I.success?(a(I.groups??[]),r(I.total_peers??0),c(null)):c(I.error||"The multiverse did not answer.")}catch(M){c(`Network error: ${M instanceof Error?M.message:String(M)}`)}finally{u(!1),m(new Date)}};x.useEffect(()=>{v()},[]),x.useEffect(()=>{if(!p)return;const M=setInterval(v,3e4);return()=>clearInterval(M)},[p]);const S=x.useMemo(()=>(s??[]).filter(M=>!cr(M)&&M.peers.length>0),[s]),j=(s?.length??0)-S.length,P=!!n?.remote,N=M=>{const I=M.peers.reduce((C,R)=>R.last_seen>C.last_seen?R:C),_=new URLSearchParams({seed:M.seed,seed_name:M.seed_name,cosmic_origin_time:String(M.cosmic_origin_time)});t({url:`/multiverse/${I.peer_id}/explore?${_}`,name:Nt.sanitizeForDisplay(He.getDisplayText(M.seed)),home:!1})};return i.jsx(St,{onClose:e,children:i.jsxs(oe,{className:"w-[min(1040px,calc(100vw-2rem))] h-[min(720px,calc(100vh-2rem))] flex flex-col overflow-hidden",children:[i.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-b border-white/10",children:[i.jsxs("div",{children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-fuchsia-300/80",children:"P2P universe network"}),i.jsx("div",{className:"text-lg text-white font-light tracking-wide",children:"The Multiverse"})]}),i.jsxs("div",{className:"flex items-center gap-3 text-xs",children:[i.jsxs("span",{className:"text-gray-500",children:["Peers ",i.jsx("span",{className:"text-gray-100 font-mono",children:o})]}),i.jsxs("span",{className:"text-gray-500",children:["Universes ",i.jsx("span",{className:"text-gray-100 font-mono",children:S.length})]}),j>0&&i.jsxs("span",{className:"text-gray-500",children:["Filtered ",i.jsx("span",{className:"text-red-300 font-mono",children:j})]}),h&&i.jsx("span",{className:"text-gray-600 hidden sm:inline",children:h.toLocaleTimeString()}),i.jsx(G,{onClick:v,disabled:d,children:d?"Scanning…":"Refresh"}),i.jsxs(G,{onClick:()=>{Js(Us,!p),f(!p)},className:p?"!border-emerald-400/40 !text-emerald-200":"",children:["Auto ",p?"on":"off"]}),i.jsx("button",{onClick:e,className:"text-gray-400 hover:text-white text-lg leading-none px-1",title:"Close",children:"✕"})]})]}),i.jsxs("div",{className:"flex-1 overflow-y-auto p-5 space-y-4",children:[P&&n&&i.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-3 rounded-xl border border-fuchsia-400/40 bg-gradient-to-r from-fuchsia-950/60 to-indigo-950/60 px-4 py-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.25em] text-fuchsia-300/90 mb-0.5",children:"You are exploring a remote universe"}),i.jsx("div",{className:"text-sm text-white font-mono truncate",children:Nt.sanitizeForDisplay(n.seed_str)||"Unknown seed"}),i.jsx("div",{className:"text-[11px] text-gray-400 font-mono truncate",children:n.node_id})]}),i.jsx(G,{tone:"primary",onClick:()=>t({url:"/multiverse/exit",name:"your universe",home:!0}),children:"Return to your universe"})]}),g&&i.jsxs("div",{className:"flex items-start gap-3 rounded-xl border border-sky-400/25 bg-sky-950/30 px-4 py-3",children:[i.jsxs("div",{className:"flex-1 text-xs leading-relaxed text-gray-300",children:[i.jsx("span",{className:"text-sky-200 font-medium",children:"Private network? "}),"If you're behind a private connection or firewall, open the Atlas ports so other instances can reach yours. That is what lets universes travel across the network."]}),i.jsx("button",{onClick:()=>{Js(Ys,!0),w(!1)},className:"text-gray-500 hover:text-white leading-none",title:"Dismiss",children:"✕"})]}),l&&i.jsx("div",{className:"rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200",children:l}),s===null&&!l&&i.jsxs("div",{className:"flex flex-col items-center justify-center py-20 text-sm text-fuchsia-200/80",children:[i.jsx("div",{className:"w-10 h-10 mb-3 rounded-full border-2 border-fuchsia-400/20 border-t-fuchsia-300 animate-spin"}),"Scanning the multiverse…"]}),s!==null&&S.length===0&&!l&&i.jsx("div",{className:"py-16 text-center text-sm text-gray-400",children:"No other universes found yet. Leave The Atlas running with P2P on: other explorers will appear here as they are discovered."}),i.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3",children:S.map(M=>{const I=M.peers.reduce((T,A)=>A.last_seen>T.last_seen?A:T),_=$s[I.status]??$s.UNKNOWN,C=P&&n?.seed_str===M.seed,R=M.seed===lr?M.peers.find(T=>new Date(T.cosmic_origin_time*1e3).getFullYear()===1986)?.cosmic_origin_time??M.cosmic_origin_time:M.cosmic_origin_time,L=[...M.peers].sort((T,A)=>A.last_seen-T.last_seen);return i.jsxs("div",{className:`relative flex flex-col rounded-xl border p-4 transition-colors ${C?"border-fuchsia-400/60 bg-fuchsia-500/10":"border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"} ${_.dim}`,children:[i.jsxs("div",{className:"flex items-start justify-between gap-2 mb-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 truncate",children:He.getDisplayText(M.seed_name)}),i.jsx("div",{className:"text-base text-white font-mono truncate",title:M.seed,children:Nt.sanitizeForDisplay(He.getDisplayText(M.seed))})]}),i.jsxs("div",{className:`flex items-center gap-1.5 shrink-0 text-[10px] font-mono uppercase ${_.text}`,children:[i.jsx("span",{className:`w-1.5 h-1.5 rounded-full ${_.dot}`}),C?"exploring":I.status.toLowerCase(),M.count>1&&i.jsx("span",{className:"ml-1 px-1.5 rounded bg-white/10 text-gray-200",children:M.count})]})]}),i.jsxs("div",{className:"text-xs space-y-1 mb-3",children:[i.jsxs("div",{className:"flex justify-between gap-3",children:[i.jsx("span",{className:"text-gray-500",children:"Bit Bang"}),i.jsx("span",{className:"text-gray-200",children:hr(R)})]}),i.jsxs("div",{className:"flex justify-between gap-3",children:[i.jsx("span",{className:"text-gray-500",children:"Last seen"}),i.jsx("span",{className:"text-gray-200",children:Zs(I.last_seen)})]})]}),i.jsxs("details",{className:"mb-3 text-[11px]",children:[i.jsx("summary",{className:"cursor-pointer text-gray-500 hover:text-gray-300 select-none",children:M.count===1?"Atlas instance":`${M.count} Atlas instances`}),i.jsx("div",{className:"mt-1.5 space-y-1",children:L.map(T=>i.jsxs("div",{className:"flex justify-between gap-2 rounded bg-black/30 px-2 py-1 font-mono",children:[i.jsx("span",{className:"truncate text-gray-400",children:T.peer_id}),i.jsx("span",{className:"shrink-0 text-gray-500",children:Zs(T.last_seen)})]},T.peer_id))})]}),i.jsx("div",{className:"mt-auto",children:i.jsx(G,{tone:C?"ghost":"primary",className:"w-full",disabled:C,onClick:()=>N(M),children:C?"You are here":"Explore this universe"})})]},M.seed)})})]})]})})}function ur({crossing:n}){const[e,t]=x.useState(0),[s]=x.useState(()=>Ie());return x.useEffect(()=>{const a=[setTimeout(()=>t(1),50),setTimeout(()=>t(2),1700)];return()=>a.forEach(clearTimeout)},[]),i.jsxs("div",{className:"absolute inset-0 pointer-events-auto flex items-center justify-center",children:[i.jsx("div",{className:`absolute inset-0 transition-opacity ${s?"duration-1000":"duration-500"} ${e===2?"opacity-100":"opacity-0"}`,style:{background:s?"radial-gradient(circle at 50% 50%, #0b2530 0%, #000 70%)":"radial-gradient(circle at 50% 50%, #ffffff 0%, #a5f3fc 35%, rgba(0,0,0,0) 75%)"}}),i.jsxs("div",{className:`relative text-center transition-all duration-700 ${e>=1?"opacity-100 translate-y-0":"opacity-0 translate-y-2"}`,children:[i.jsx("div",{className:"text-[11px] uppercase tracking-[0.5em] text-cyan-200/90 mb-2",children:n.home?"Returning to":"Crossing into"}),i.jsx("div",{className:"text-3xl sm:text-4xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]",children:n.name})]})]})}const mr=200,Ot="atlas-places-changed";function pr(n){const e=n.match(/\/stargate\/([A-Za-z0-9\-_=]+)/);if(!e)return null;try{const t=new URLSearchParams(atob(e[1].replace(/-/g,"+").replace(/_/g,"/"))),s=(t.get("coordinates")??"").split(",").map(o=>parseInt(o,10));if(s.length!==3||s.some(o=>!Number.isFinite(o)))return null;const a=t.get("system");return{coordinates:s,system:a!==null?parseInt(a,10):null,planet:null,planetName:t.get("planet")}}catch{return null}}function jt(n){return n.coordinates?{coordinates:n.coordinates,system:n.system??null,planet:n.planet??null,planetName:n.planetName??null}:pr(n.stargateUrl)}const qa=(n,e)=>!!n&&!!e&&n.coordinates.join(",")===e.coordinates.join(",")&&n.system===e.system&&(n.planet!==null&&e.planet!==null?n.planet===e.planet:(n.planetName??"").toLowerCase()===(e.planetName??"").toLowerCase());function Ee(){try{const n=JSON.parse(fi(fa.LOCATIONS)??"[]");return Array.isArray(n)?n.filter(e=>e&&typeof e.name=="string"&&typeof e.stargateUrl=="string").sort((e,t)=>t.timestamp-e.timestamp):[]}catch{return[]}}function Qt(n){try{gi(fa.LOCATIONS,JSON.stringify(n.slice(0,mr)))}catch{}window.dispatchEvent(new CustomEvent(Ot))}function fr(n){return Ee().find(e=>qa(jt(e),n))??null}function gr(n,e){const t={id:`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`,timestamp:Date.now(),stargateUrl:Jt(n.coordinates,n.system,n.planetName),...n,...e},s=Ee().filter(a=>!qa(jt(a),n));return Qt([t,...s]),t}function vr(n,e){const t=e.trim();t&&Qt(Ee().map(s=>s.id===n?{...s,name:t}:s))}function Ha(n){Qt(Ee().filter(e=>e.id!==n))}const ot=n=>n.replace(/_/g," "),xr=[{chars:"01",ms:20,steps:18},{chars:"0123456789",ms:15,steps:22},{chars:"0123456789ABCDEF",ms:10,steps:30},{chars:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~",ms:6,steps:50}],Lt="stargateAnimationShown";function yr(n){const[e,t]=x.useState(()=>sessionStorage.getItem(Lt)?"Stargate Aligned":"Aligning Stargate…"),[s,a]=x.useState(()=>!!sessionStorage.getItem(Lt));return x.useEffect(()=>{if(!n||s)return;let o=!1;return(async()=>{const r=c=>new Promise(d=>setTimeout(d,c));for(const c of xr)for(let d=0;d<c.steps;d++){if(o)return;t(Array.from({length:22},()=>c.chars[Math.floor(Math.random()*c.chars.length)]).join("")),await r(c.ms)}const l="Stargate Aligned";for(let c=1;c<=l.length;c++){if(o)return;t(l.slice(0,c)),await r(25)}sessionStorage.setItem(Lt,"true"),a(!0)})(),()=>{o=!0}},[n,s]),{text:e,aligned:s}}function wr(){const[n,e]=x.useState(()=>Ee());return x.useEffect(()=>{const t=()=>e(Ee());return window.addEventListener(Ot,t),window.addEventListener("storage",t),()=>{window.removeEventListener(Ot,t),window.removeEventListener("storage",t)}},[]),n}const Vt={galaxy:{label:"Galaxy",color:"text-purple-300",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:[i.jsx("path",{d:"M12 12c3-4 8-3 8 1s-6 7-10 5"}),i.jsx("path",{d:"M12 12c-3 4-8 3-8-1s6-7 10-5"}),i.jsx("circle",{cx:12,cy:12,r:1.2,fill:"currentColor"})]})},system:{label:"System",color:"text-cyan-300",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[i.jsx("circle",{cx:12,cy:12,r:2.5,fill:"currentColor"}),i.jsx("ellipse",{cx:12,cy:12,rx:9,ry:4,opacity:.6})]})},planet:{label:"Planet",color:"text-pink-300",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[i.jsx("circle",{cx:12,cy:12,r:5.5}),i.jsx("path",{d:"M3 14c4 2 14 0 18-4",opacity:.6})]})}},br=n=>{const e=Math.max(0,(Date.now()-n)/6e4);return e<1?"just now":e<60?`${Math.floor(e)} min ago`:e<1440?`${Math.floor(e/60)} h ago`:e<1440*30?`${Math.floor(e/60/24)} d ago`:new Date(n).toLocaleDateString()},_t=({title:n,onClick:e,danger:t,children:s})=>i.jsx("button",{title:n,"aria-label":n,onClick:e,className:`w-7 h-7 shrink-0 flex items-center justify-center rounded-md border border-white/10 bg-white/5 transition-colors ${t?"hover:bg-red-500/20 hover:text-red-200 text-gray-400":"hover:bg-white/15 text-gray-300"}`,children:i.jsx("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.8,strokeLinecap:"round",strokeLinejoin:"round",children:s})});function Sr({place:n,disabled:e,onGo:t}){const[s,a]=x.useState("idle"),[o,r]=x.useState(n.name),[l,c]=x.useState(!1),d=jt(n),u=Vt[n.type]??Vt.galaxy,h=[n.type==="planet"?n.systemName:null,n.type!=="galaxy"?n.galaxyName:null].filter(Boolean).join(" · "),m=async()=>{try{await navigator.clipboard.writeText(`${window.location.origin}${n.stargateUrl.slice(n.stargateUrl.indexOf("/stargate/"))}`),c(!0),setTimeout(()=>c(!1),1500)}catch{}},p=()=>{vr(n.id,o),a("idle")};return i.jsxs("div",{className:"group rounded-lg border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors px-2.5 py-2",children:[i.jsxs("div",{className:"flex items-center gap-2.5",children:[i.jsx("svg",{width:22,height:22,viewBox:"0 0 24 24",className:`shrink-0 ${u.color}`,children:u.icon}),i.jsxs("div",{className:"min-w-0 flex-1",children:[s==="rename"?i.jsx("input",{autoFocus:!0,value:o,maxLength:60,onChange:f=>r(f.target.value),onKeyDown:f=>{f.key==="Enter"&&p(),f.key==="Escape"&&(r(n.name),a("idle")),f.stopPropagation()},onBlur:p,className:"w-full bg-black/40 border border-cyan-400/40 rounded px-1.5 py-0.5 text-sm text-white outline-none"}):i.jsx("div",{className:"text-sm text-gray-100 truncate",children:n.name}),i.jsxs("div",{className:"text-[10px] text-gray-500 truncate",children:[i.jsx("span",{className:u.color,children:u.label}),h&&i.jsxs(i.Fragment,{children:[" · ",h]}),d&&i.jsxs("span",{className:"font-mono",children:[" · ",d.coordinates.join(", ")]})]})]}),s!=="confirm"&&i.jsx(G,{tone:"primary",className:"shrink-0 px-2.5",disabled:e||!d,onClick:()=>t(n),children:"Go"})]}),i.jsxs("div",{className:"flex items-center justify-between gap-2 mt-1.5 pl-[32px]",children:[i.jsx("span",{className:"text-[10px] text-gray-600",children:l?i.jsx("span",{className:"text-cyan-300",children:"Link copied"}):`Saved ${br(n.timestamp)}`}),s==="confirm"?i.jsxs("div",{className:"flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]",children:[i.jsx("span",{className:"text-[11px] text-red-200/90",children:"Remove this place?"}),i.jsx("button",{onClick:()=>a("idle"),className:"px-2 py-0.5 rounded text-[11px] text-gray-300 bg-white/5 hover:bg-white/15 border border-white/10",children:"Keep"}),i.jsx("button",{onClick:()=>Ha(n.id),className:"px-2 py-0.5 rounded text-[11px] text-red-100 bg-red-500/30 hover:bg-red-500/50 border border-red-400/40",children:"Remove"})]}):i.jsxs("div",{className:"flex items-center gap-1",children:[i.jsxs(_t,{title:"Rename",onClick:()=>a("rename"),children:[i.jsx("path",{d:"M4 20h4L19 9l-4-4L4 16v4z"}),i.jsx("path",{d:"M13.5 6.5l4 4"})]}),i.jsxs(_t,{title:"Copy Stargate link",onClick:m,children:[i.jsx("rect",{x:9,y:9,width:11,height:11,rx:2}),i.jsx("path",{d:"M5 15V5a1 1 0 0 1 1-1h10"})]}),i.jsx(_t,{title:"Remove",danger:!0,onClick:()=>a("confirm"),children:i.jsx("path",{d:"M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"})})]})]})]})}function Mr({places:n,remote:e,onGo:t}){const[s,a]=x.useState("all"),o=x.useMemo(()=>({all:n.length,galaxy:n.filter(l=>l.type==="galaxy").length,system:n.filter(l=>l.type==="system").length,planet:n.filter(l=>l.type==="planet").length}),[n]),r=s==="all"?n:n.filter(l=>l.type===s);return n.length===0?i.jsxs("div",{className:"py-6 text-center",children:[i.jsx("svg",{width:34,height:34,viewBox:"0 0 24 24",className:"mx-auto text-cyan-300/50 mb-2",fill:"none",stroke:"currentColor",strokeWidth:1.3,children:i.jsx("path",{d:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"})}),i.jsx("div",{className:"text-sm text-gray-200",children:"No saved places yet"}),i.jsx("p",{className:"text-xs text-gray-500 mt-1 max-w-[16rem] mx-auto",children:"Save where your ship is from the Link tab, and come back to it from here at any time."})]}):i.jsxs("div",{children:[e&&i.jsx("p",{className:"text-[11px] text-fuchsia-200/80 mb-2",children:"These places belong to your own universe: return home to travel to them."}),i.jsx("div",{className:"flex gap-1 mb-2 overflow-x-auto",children:["all","galaxy","system","planet"].map(l=>i.jsxs("button",{disabled:l!=="all"&&o[l]===0,onClick:()=>a(l),className:`shrink-0 px-2 py-1 rounded-md text-[11px] border transition-colors disabled:opacity-30 ${s===l?"border-cyan-400/60 bg-cyan-400/10 text-cyan-100":"border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`,children:[l==="all"?"All":`${Vt[l].label}s`," ",i.jsx("span",{className:"text-gray-500",children:o[l]})]},l))}),i.jsx("div",{className:"space-y-1.5 max-h-[min(22rem,50dvh)] overflow-y-auto overscroll-contain pr-0.5",children:r.map(l=>i.jsx(Sr,{place:l,disabled:e,onGo:t},l.id))})]})}function kr({explorer:n,state:e,universe:t,onClose:s}){const a=!!t?.remote,{text:o,aligned:r}=yr(!a),l=e.ship,c=l?.coordinates??e.coordinates,d=wr(),[u,h]=x.useState("link"),m=!l||l.planet===null?null:e.orbiting&&e.orbiting.index===l.planet?e.orbiting.name:e.system&&e.system.index===l.system?e.system.planets.find(A=>A.index===l.planet)?.name??null:null,p=m?"planet":l?"system":"galaxy",[f,g]=x.useState(p);x.useEffect(()=>g(p),[p]);const[w,v]=x.useState(!1);if(!c)return null;const S=f!=="galaxy"&&l?l.system:null,j=Jt(c,S,f==="planet"?m:null),P=`${window.location.origin}${j}`,N={coordinates:c,system:S,planet:f==="planet"&&l?l.planet:null,planetName:f==="planet"?m:null},M=fr(N),I=e.galaxy?ot(e.galaxy.name):null,_=l?e.shipSystemName??`System #${l.system.toLocaleString()}`:null,C=()=>{if(M){Ha(M.id);return}const A=f==="planet"&&m?ot(m):f==="system"?_??"Star system":I??c.join(", ");gr(N,{name:A,type:f,galaxyName:I,systemName:f==="planet"?_:null})},R=A=>{const O=jt(A);O&&(s(),n.goToPlace(O.coordinates,O.system,O.planet,O.planetName))},L=[{depth:"galaxy",label:"Galaxy",name:e.galaxy?ot(e.galaxy.name):c.join(", ")},{depth:"system",label:"System",name:l?e.shipSystemName??`#${l.system.toLocaleString()}`:null},{depth:"planet",label:"Planet",name:m?ot(m):null}],T=async()=>{try{await navigator.clipboard.writeText(P),v(!0),setTimeout(()=>v(!1),1800)}catch{}};return i.jsxs(oe,{className:"w-[min(420px,calc(100vw-1.5rem))] p-4 pointer-events-auto",children:[i.jsxs("div",{className:"flex items-center justify-between mb-3",children:[i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("svg",{width:22,height:22,viewBox:"0 0 24 24",className:a?"text-red-300":r?"text-cyan-300":"text-cyan-300 animate-spin",children:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeWidth:1.5,children:[i.jsx("path",{d:"M14 12a6 6 0 1 1-6-6"}),i.jsx("path",{d:"M10 12a6 6 0 1 1 6 6",opacity:.5})]})}),i.jsxs("div",{children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.3em] text-gray-500",children:"Stargate"}),i.jsx("div",{className:`font-mono text-sm ${a?"text-red-300":r?"text-cyan-200":"text-cyan-400/80"}`,children:a?"Remote Universe":o})]})]}),i.jsx("button",{onClick:s,className:"text-gray-400 hover:text-white leading-none px-1",title:"Close",children:"✕"})]}),i.jsx("div",{className:"grid grid-cols-2 gap-1 p-1 mb-3 rounded-lg bg-black/30 border border-white/10",children:["link","saved"].map(A=>i.jsx("button",{onClick:()=>h(A),className:`py-1.5 rounded-md text-xs transition-colors ${u===A?"bg-white/10 text-white":"text-gray-400 hover:text-gray-200"}`,children:A==="link"?"Link":i.jsxs(i.Fragment,{children:["Saved places ",i.jsx("span",{className:"text-gray-500",children:d.length})]})},A))}),u==="saved"?i.jsx(Mr,{places:d,remote:a,onGo:R}):a?i.jsx("p",{className:"text-xs text-gray-400 leading-relaxed",children:"Stargate links are disabled in remote universes: a gate points into one seed, and this one is not yours. Return to your own universe to open one."}):i.jsxs("div",{className:`transition-opacity duration-300 ${r?"opacity-100":"opacity-30 pointer-events-none"}`,children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5",children:"Destination"}),i.jsx("div",{className:"grid grid-cols-3 gap-1.5 mb-3",children:L.map(A=>i.jsxs("button",{disabled:!A.name,onClick:()=>g(A.depth),className:`text-left px-2 py-1.5 rounded-lg border transition-colors disabled:opacity-30 ${f===A.depth?"border-cyan-400/60 bg-cyan-400/10":"border-white/10 bg-white/5 hover:bg-white/10"}`,children:[i.jsx("div",{className:"text-[10px] uppercase tracking-wider text-gray-500",children:A.label}),i.jsx("div",{className:"text-xs text-gray-100 truncate",children:A.name??"—"})]},A.depth))}),i.jsx("input",{readOnly:!0,value:P,onFocus:A=>A.currentTarget.select(),className:"w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-[11px] font-mono text-cyan-100/90 outline-none select-text"}),i.jsxs("div",{className:"flex gap-2 mt-2.5",children:[i.jsx(G,{tone:"primary",className:"flex-1",onClick:T,children:w?"Copied":"Copy link"}),typeof navigator.share=="function"&&i.jsx(G,{className:"flex-1",onClick:()=>navigator.share({title:"The Atlas",text:"Check out this Stargate destination on The Atlas!",url:P}).catch(()=>{}),children:"Share"}),i.jsxs(G,{className:`flex-1 flex items-center justify-center gap-1.5 whitespace-nowrap ${M?"!border-amber-300/50 !bg-amber-300/10 text-amber-100":""}`,onClick:C,title:M?"Remove from your saved places":"Keep this destination in your saved places",children:[i.jsx("svg",{width:13,height:13,viewBox:"0 0 24 24",fill:M?"currentColor":"none",stroke:"currentColor",strokeWidth:1.8,strokeLinejoin:"round",children:i.jsx("path",{d:"M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"})}),M?"Saved":"Save"]})]})]})]})}const Ft=n=>n.replace(/_/g," "),jr={coords:{label:"Coords",chip:"bg-blue-900/50 text-blue-300 border-blue-500/30",text:"text-blue-100",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[i.jsx("path",{d:"M12 3v18M3 12h18",opacity:.5}),i.jsx("circle",{cx:12,cy:12,r:4})]})},galaxy:{label:"Galaxy",chip:"bg-purple-900/50 text-purple-300 border-purple-500/30",text:"text-purple-100",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinecap:"round",children:[i.jsx("path",{d:"M12 12c3-4 8-3 8 1s-6 7-10 5"}),i.jsx("path",{d:"M12 12c-3 4-8 3-8-1s6-7 10-5"}),i.jsx("circle",{cx:12,cy:12,r:1.2,fill:"currentColor"})]})},system:{label:"System",chip:"bg-cyan-900/50 text-cyan-300 border-cyan-500/30",text:"text-cyan-100",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[i.jsx("circle",{cx:12,cy:12,r:2.5,fill:"currentColor"}),i.jsx("ellipse",{cx:12,cy:12,rx:9,ry:4,opacity:.6})]})},planet:{label:"Planet",chip:"bg-pink-900/50 text-pink-300 border-pink-500/30",text:"text-pink-100",icon:i.jsxs("g",{fill:"none",stroke:"currentColor",strokeWidth:1.5,children:[i.jsx("circle",{cx:12,cy:12,r:5.5}),i.jsx("path",{d:"M3 14c4 2 14 0 18-4",opacity:.6})]})}};function Cr({kind:n,value:e,locked:t}){const s=jr[n],a=mt(e);return i.jsxs("div",{className:"flex items-center gap-3 animate-[fadeIn_0.35s_ease-out]",children:[i.jsx("svg",{width:24,height:24,viewBox:"0 0 24 24",className:`shrink-0 ${t?"text-emerald-300":s.text}`,children:s.icon}),i.jsx("span",{className:`px-2 py-1 text-[10px] font-mono uppercase rounded border shrink-0 ${s.chip}`,children:s.label}),i.jsx("span",{className:`text-sm font-mono truncate ${t?"text-emerald-100":s.text}`,children:a})]},n)}function Nr({plan:n,state:e,onDone:t}){const s=e.galaxy&&e.galaxy.coordinates.join(",")===n.coordinates.join(",")?e.galaxy:null,a=[{kind:"coords",value:`[${n.coordinates.map(g=>g.toLocaleString("en")).join(", ")}]`}];s&&a.push({kind:"galaxy",value:Ft(s.name)}),s&&n.system!==null&&e.system&&e.system.index===n.system&&a.push({kind:"system",value:Ft(e.system.name)}),s&&n.planet!==null&&e.orbiting&&e.orbiting.index===n.planet&&a.push({kind:"planet",value:Ft(e.orbiting.name)});const o=2+(n.system!==null?1:0)+(n.planet!==null?1:0),[r,l]=x.useState(a);x.useEffect(()=>{a.length>r.length&&l(a)},[a.length]);const[c,d]=x.useState(1);x.useEffect(()=>{if(c>=r.length)return;const g=setTimeout(()=>d(w=>w+1),c===1?700:1300);return()=>clearTimeout(g)},[c,r.length]);const u=Math.min(c,r.length),h=u>=o,m=r[u-1],[p,f]=x.useState(!1);return x.useEffect(()=>{if(!h)return;const g=setTimeout(()=>f(!0),2600),w=setTimeout(t,3200);return()=>{clearTimeout(g),clearTimeout(w)}},[h]),x.useEffect(()=>{const g=setTimeout(t,45e3);return()=>clearTimeout(g)},[]),i.jsx("div",{className:`w-[min(32rem,calc(100vw-2rem))] transition-all duration-500 ${p?"opacity-0 -translate-y-2":"opacity-100 translate-y-0"}`,children:i.jsxs("div",{className:`relative rounded-xl border px-4 py-3 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-colors duration-700 ${h?"bg-gradient-to-r from-emerald-950/85 to-blue-950/85 border-emerald-400/40":"bg-gradient-to-r from-slate-950/85 to-blue-950/85 border-cyan-500/40"}`,children:[i.jsxs("div",{className:"flex items-center justify-between mb-2",children:[i.jsxs("span",{className:`text-[10px] font-mono uppercase tracking-[0.3em] ${h?"text-emerald-300/90":"text-cyan-300/80"}`,children:[n.kind==="stargate"?"Stargate":"Jump protocol"," · ",h?"location locked":"in transit"]}),i.jsx("span",{className:"flex gap-1",children:Array.from({length:o},(g,w)=>i.jsx("span",{className:`w-1.5 h-1.5 rounded-full transition-colors ${w<u?h?"bg-emerald-300":"bg-cyan-300":"bg-white/15"}`},w))})]}),i.jsx(Cr,{kind:m.kind,value:m.value,locked:h},m.kind)]})})}const qt=[5e6,5e6,5e6],ae=n=>n.replace(/_/g," "),Tr=[{kinds:["core","quasar"],title:"Galactic center",accent:"text-amber-300"},{kinds:["globular"],title:"Globular clusters",accent:"text-orange-200"},{kinds:["open"],title:"Open clusters",accent:"text-sky-300"},{kinds:["blackhole"],title:"Black holes",accent:"text-fuchsia-300"},{kinds:["pulsar"],title:"Pulsars",accent:"text-cyan-300"}],Ar=[{label:"1×",value:1},{label:"1 h/s",value:3600},{label:"1 d/s",value:86400},{label:"1 mo/s",value:26e5},{label:"1 yr/s",value:315e5}];function Pr(){const n=new URLSearchParams(window.location.hash.replace(/^#/,"")),e=n.get("g");if(!e)return null;const t=e.split(",").map(o=>parseInt(o,10));if(t.length!==3||t.some(o=>!Number.isFinite(o)))return null;const s=n.get("s"),a=n.get("p");return{coordinates:t,system:s!==null?parseInt(s,10):null,planet:a!==null?parseInt(a,10):null,via:n.get("via")}}function Ir(n){const e=n.ship;if(!e)return;const t=new URLSearchParams;t.set("g",e.coordinates.join(",")),t.set("s",String(e.system)),e.planet!==null&&t.set("p",String(e.planet));const s=`#${t.toString()}`;window.location.hash!==s&&window.history.replaceState(null,"",s)}const J=({label:n,value:e})=>i.jsxs("div",{className:"flex justify-between gap-3 text-xs py-0.5",children:[i.jsx("span",{className:"text-gray-500",children:n}),i.jsx("span",{className:"text-gray-100 text-right",children:e})]}),De=({onClick:n,title:e,sub:t,accent:s="text-gray-200"})=>i.jsxs("button",{onClick:n,className:"shrink-0 text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 transition-colors",children:[i.jsx("div",{className:`text-xs leading-tight ${s}`,children:e}),t&&i.jsx("div",{className:"text-[10px] text-gray-500 leading-tight",children:t})]});function Rr({state:n}){const e=[];return n.galaxy&&e.push({label:ae(n.galaxy.name),sub:`${n.galaxy.galaxy_type} galaxy · ${n.galaxy.coordinates.join(", ")}`}),n.shipSystemName&&e.push({label:n.shipSystemName,sub:n.ship?`system #${n.ship.system.toLocaleString()}`:""}),n.orbiting&&e.push({label:ae(n.orbiting.name),sub:`in orbit · ${n.orbiting.planet_type}`}),n.visitingMoon&&e.push({label:ae(n.visitingMoon.name),sub:`${n.visitingMoon.type} moon`}),i.jsxs("div",{className:"flex items-center gap-3 pointer-events-auto min-w-0",children:[i.jsxs("a",{href:"/",className:"shrink-0 text-sm font-bold tracking-[0.35em] text-white/90 hover:text-white",title:"The Atlas, third version",children:["ATLAS",i.jsx("span",{className:"text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",children:"3"})]}),i.jsxs("div",{className:"flex items-center gap-2 pl-3 border-l border-white/15 min-w-0",children:[i.jsx("span",{className:"shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]",title:"Your ship"}),e.map((t,s)=>i.jsxs("div",{className:`items-center gap-2 min-w-0 ${s===e.length-1?"flex":"hidden lg:flex"}`,children:[s>0&&i.jsx("span",{className:"text-gray-600 hidden lg:inline",children:"/"}),i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-sm text-white leading-tight truncate",children:t.label}),i.jsx("div",{className:"text-[10px] text-gray-500 leading-tight truncate",children:t.sub})]})]},s))]})]})}function Er({explorer:n,state:e}){const t=e.target,s=t?.kind==="planet"&&e.orbiting&&t.planet.index!==e.orbiting.index;if(t?.kind==="star"){const o=t.star,r=t.temperature>=1e5?`${(t.temperature/1e3).toLocaleString()}k K`:`${t.temperature.toLocaleString()} K`;return i.jsxs("div",{children:[i.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-amber-200/90 truncate",children:["Star · ",o.Type]}),i.jsx("div",{className:"text-base font-semibold text-white truncate",children:t.name})]}),i.jsxs("div",{className:"flex gap-2 shrink-0",children:[i.jsxs(G,{tone:"primary",onClick:()=>n.engage(),children:["Approach",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{onClick:()=>n.clearTarget(),children:"✕"})]})]}),i.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[i.jsx(J,{label:"Type",value:o.Type}),i.jsx(J,{label:"Colour",value:o.Color.charAt(0).toUpperCase()+o.Color.slice(1)}),i.jsx(J,{label:"Radius",value:`${o.Size.toLocaleString(void 0,{maximumFractionDigits:3})} R☉`}),i.jsx(J,{label:"Surface",value:`≈ ${r}`})]})]})}if(t?.kind==="moon"){const o=t.moon,r=e.visitingMoon?.name===o.name,l=o.periodDays>=1?`${o.periodDays.toFixed(2)} days`:`${(o.periodDays*24).toFixed(1)} h`;return i.jsxs("div",{children:[i.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-violet-300/90 truncate",children:[r?"Visiting":"Moon"," · ",o.type," · ",e.orbiting?`around ${ae(e.orbiting.name)}`:""]}),i.jsx("div",{className:"text-base font-semibold text-white truncate",children:ae(o.name)})]}),i.jsx("div",{className:"flex gap-2 shrink-0",children:r?i.jsxs(G,{onClick:()=>n.goUp(),children:["Back to ",e.orbiting?ae(e.orbiting.name):"planet",i.jsx(he,{children:"Esc"})]}):i.jsxs(i.Fragment,{children:[i.jsxs(G,{tone:"primary",onClick:()=>n.engage(),children:["Visit",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{onClick:()=>n.clearTarget(),children:"✕"})]})})]}),i.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[i.jsx(J,{label:"Diameter",value:`${Math.round(o.radiusKm*2).toLocaleString()} km`}),i.jsx(J,{label:"Orbit",value:`${Math.round(o.semiMajorAxisKm).toLocaleString()} km`}),i.jsx(J,{label:"Period",value:l}),i.jsx(J,{label:"Rotation",value:o.tidallyLocked?"Tidally locked":"Free"}),i.jsx(J,{label:"Eccentricity",value:o.eccentricity.toFixed(3)}),i.jsx(J,{label:"Inclination",value:`${o.inclinationDeg.toFixed(1)}°`}),i.jsx(J,{label:"Density",value:`${Math.round(o.densityKgM3).toLocaleString()} kg/m³`}),i.jsx(J,{label:"Origin",value:o.origin.replace(/-/g," ")})]}),i.jsxs("div",{className:"text-[10px] text-gray-500 mt-1 truncate",children:["Mass ",o.massKg.toExponential(2)," kg"]})]})}if(e.orbiting&&!s){const o=e.orbiting;return i.jsxs("div",{children:[i.jsxs("div",{className:"flex items-baseline justify-between gap-3",children:[i.jsxs("div",{children:[i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-emerald-300/80",children:["In orbit · ",o.planet_type]}),i.jsx("div",{className:"text-base font-semibold text-white",children:ae(o.name)})]}),i.jsxs(G,{onClick:()=>n.goUp(),children:["Leave orbit",i.jsx(he,{children:"Esc"})]})]}),i.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-x-5 mt-1.5",children:[i.jsx(J,{label:"Diameter",value:`${Math.round(o.diameter).toLocaleString()} km`}),i.jsx(J,{label:"Gravity",value:`${o.gravity.toFixed(1)} m/s²`}),i.jsx(J,{label:"Temperature",value:`${o.surface_temperature.toFixed(0)} °C`}),i.jsx(J,{label:"Atmosphere",value:o.atmosphere}),i.jsx(J,{label:"Day",value:`${(Math.abs(o.rotation_period_seconds)/3600).toFixed(1)} h`}),i.jsx(J,{label:"Year",value:`${(o.orbital_period_seconds/31557600).toFixed(2)} yr`}),i.jsx(J,{label:"Life",value:o.life_forms}),i.jsx(J,{label:"Moons",value:e.planetDetail?.loading?"…":e.planetDetail?.moons??0})]}),i.jsx("div",{className:"text-[10px] text-gray-500 mt-1 truncate",children:o.elements.join(" · ")})]})}if(t?.kind==="system"){const o=t.summary,r=e.ship?.system===t.index;return i.jsxs("div",{className:"flex items-center justify-between gap-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-cyan-300/80",children:[r?"Your ship is here":"Target locked"," · system #",t.index.toLocaleString()]}),i.jsx("div",{className:"text-base font-semibold text-white truncate",children:o?ae(o.name):"Scanning…"}),o&&i.jsxs("div",{className:"text-xs text-gray-400 truncate",children:[o.stars.map(l=>l.Type).join(" + ")," · ",o.num_planets," planet",o.num_planets===1?"":"s"]})]}),i.jsxs("div",{className:"flex gap-2 shrink-0",children:[i.jsxs(G,{tone:"primary",onClick:()=>n.engage(),children:[r?"Return":"Engage",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{onClick:()=>n.clearTarget(),children:"✕"})]})]})}if(t?.kind==="poi")return i.jsxs("div",{className:"flex items-center justify-between gap-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-amber-300/80",children:t.poi.kind}),i.jsx("div",{className:"text-base font-semibold text-white",children:t.poi.name}),i.jsx("div",{className:"text-xs text-gray-400 truncate",children:t.poi.description})]}),i.jsxs("div",{className:"flex gap-2 shrink-0",children:[i.jsxs(G,{tone:"primary",onClick:()=>n.engage(),children:["Fly there",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{onClick:()=>n.clearTarget(),children:"✕"})]})]});if(t?.kind==="planet"){const o=t.planet;return i.jsxs("div",{className:"flex items-center justify-between gap-3",children:[i.jsxs("div",{className:"min-w-0",children:[i.jsxs("div",{className:"text-[10px] uppercase tracking-[0.2em] text-emerald-300/80",children:[e.orbiting?`Next stop · leaving ${ae(e.orbiting.name)}`:"Planet"," · ",o.planet_type]}),i.jsx("div",{className:"text-base font-semibold text-white",children:ae(o.name)}),i.jsxs("div",{className:"text-xs text-gray-400",children:[o.orbital_radius.toFixed(2)," AU from the star · ",Math.round(o.diameter).toLocaleString()," km · ",o.life_forms]})]}),i.jsxs("div",{className:"flex gap-2 shrink-0",children:[i.jsxs(G,{tone:"primary",onClick:()=>n.engage(),children:["Go into orbit",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{onClick:()=>n.clearTarget(),children:"✕"})]})]})}const a=e.mapView?"Galaxy map. Click any star to target it, pick a landmark, or follow the green marker back to your ship.":e.mode==="system"?"Click a planet to target it · double-click to go straight into orbit.":"Click a star to target it · double-click to jump straight there.";return i.jsx("div",{className:"text-xs text-gray-400",children:a})}function Lr({drift:n,onReset:e}){const t=Math.abs(n)>30;return i.jsx("button",{onClick:e,disabled:!t,title:t?"Back to the present":"Running in real time","aria-label":"Back to the present",className:`shrink-0 ml-1.5 w-6 h-6 flex items-center justify-center rounded-md border transition-colors ${t?"border-cyan-400/50 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/25":"border-white/10 text-gray-600 cursor-default"}`,children:i.jsxs("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.9,strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("path",{d:"M3.5 12a8.5 8.5 0 1 0 2.5-6"}),i.jsx("path",{d:"M3 3.5v4.5h4.5"}),i.jsx("path",{d:"M12 7.5V12l3 2"})]})})}function _r({explorer:n,state:e}){const t=[];e.mode==="system"&&e.system?(e.visitingMoon&&e.orbiting&&t.push(i.jsx(De,{onClick:()=>n.goUp(),title:`Back to ${ae(e.orbiting.name)}`,sub:"planet · Esc",accent:"text-emerald-300"},"back")),e.moons.filter(c=>c.name!==e.visitingMoon?.name).forEach(c=>t.push(i.jsx(De,{onClick:()=>n.focusMoon(c.name),title:ae(c.name),sub:`${c.type} moon · ${Math.round(c.radiusKm*2).toLocaleString()} km`,accent:"text-violet-200"},`m${c.name}`))),e.system.planets.filter(c=>c.index!==e.orbiting?.index).forEach(c=>t.push(i.jsx(De,{onClick:()=>n.focusPlanet(c.index),title:ae(c.name),sub:`${c.planet_type} · ${c.orbital_radius.toFixed(1)} AU`,accent:"text-emerald-200"},`p${c.index}`)))):e.mode==="galaxy"&&!e.mapView&&e.nearby.forEach(c=>t.push(i.jsx(De,{onClick:()=>n.selectSystem(c.index),title:c.name,sub:`${c.distance} · ${c.starType}`,accent:"text-sky-200"},`n${c.index}`))),e.mode==="galaxy"&&e.ship&&(e.mapView||e.target?.kind!=="system"||e.target.index!==e.ship.system)&&t.unshift(i.jsx(De,{onClick:()=>n.returnToShip(),title:"Return to ship",sub:`${e.shipSystemName??"your system"} · H`,accent:"text-emerald-300"},"home"));const[s,a]=x.useState(()=>Fr(Ks)),o=c=>{a(c),zr(Ks,c)},r=e.target,l=r?r.kind==="system"?(r.summary?.name??`System #${r.index.toLocaleString()}`).replace(/_/g," "):r.kind==="planet"?r.planet.name.replace(/_/g," "):r.kind==="moon"?r.moon.name.replace(/_/g," "):r.kind==="star"?r.name:r.poi.name:null;return i.jsxs(oe,{className:"relative w-[min(720px,calc(100vw-1.5rem))] px-3 pt-3 pb-2.5 pointer-events-auto",children:[i.jsx("button",{onClick:()=>o(!s),className:"absolute -top-3 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-6 rounded-full bg-slate-900/90 border border-white/15 text-gray-300 hover:text-white hover:border-cyan-300/50 backdrop-blur-md transition-colors",title:s?"Show the console":"Hide the console","aria-expanded":!s,children:i.jsx("svg",{width:14,height:14,viewBox:"0 0 24 24",className:`transition-transform duration-300 ${s?"rotate-180":""}`,children:i.jsx("path",{fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round",d:"M6 9l6 6 6-6"})})}),i.jsxs("div",{className:"flex items-center justify-between gap-3 cursor-pointer sm:cursor-default",onClick:()=>s&&o(!1),children:[e.travel?i.jsxs("div",{className:"flex-1 min-w-0",children:[i.jsxs("div",{className:"text-[11px] text-cyan-200 tracking-wide truncate",children:[e.travel.label,"…"]}),i.jsx("div",{className:"h-0.5 mt-1 bg-white/10 rounded overflow-hidden",children:i.jsx("div",{className:"h-full bg-cyan-300 transition-[width] duration-200",style:{width:`${Math.round(e.travel.progress*100)}%`}})})]}):s&&l?i.jsxs("div",{className:"text-[11px] font-mono truncate",children:[i.jsx("span",{className:"text-cyan-300",children:"Target"})," ",i.jsx("span",{className:"text-gray-200",children:l})," ",i.jsx("span",{className:"text-gray-500",children:"· tap to open"})]}):i.jsx("div",{className:"text-[11px] font-mono text-gray-300 truncate",children:e.readout.primary}),i.jsx("div",{className:"text-[11px] font-mono text-gray-500 shrink-0 hidden sm:block",children:e.readout.secondary})]}),i.jsx("div",{className:`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${s?"grid-rows-[0fr] opacity-0":"grid-rows-[1fr] opacity-100"}`,children:i.jsxs("div",{className:"overflow-hidden min-h-0",children:[i.jsx("div",{className:"border-t border-white/10 pt-2 mt-2",children:i.jsx(Er,{explorer:n,state:e})}),t.length>0&&i.jsx("div",{className:"flex gap-1.5 mt-2 overflow-x-auto pb-0.5",children:t}),e.mode==="system"&&i.jsxs("div",{className:"flex items-center gap-1 mt-2 pt-2 border-t border-white/10 overflow-x-auto",children:[i.jsx("span",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mr-1",children:"Time"}),Ar.map(c=>i.jsx("button",{onClick:()=>n.setTimeScale(c.value),className:`shrink-0 whitespace-nowrap px-2 py-0.5 rounded-md text-[11px] ${e.timeScale===c.value?"bg-cyan-400/90 text-slate-950":"text-gray-300 hover:bg-white/10"}`,children:c.label},c.value)),i.jsx("span",{className:"ml-auto pl-2 shrink-0 text-[11px] font-mono text-gray-500 hidden sm:inline",children:new Date(e.cosmicTime*1e3).toISOString().slice(0,16).replace("T"," ")}),i.jsx(Lr,{drift:e.timeDrift,onReset:()=>n.resetTime()})]})]})})]})}const Ks="atlas-console-collapsed";function Fr(n){try{return localStorage.getItem(n)==="1"}catch{return!1}}function zr(n,e){try{localStorage.setItem(n,e?"1":"0")}catch{}}const Wr=31557600,xt=63241.077,Ba=94607e8,zt=["","k","M","B","T","Q"];function Se(n){if(!Number.isFinite(n)||n<=0)return"0.00";let e=0;for(;n>=999.5&&e<zt.length-1;)n/=1e3,e++;return n>=999.5?n.toExponential(1).replace("e+","e")+zt[e]:(n>=99.95?n.toFixed(0):n>=9.995?n.toFixed(1):n.toFixed(2))+zt[e]}function Dr(n){const e=n*3600;return e>=1?{value:Se(e),unit:"ly/h"}:e*xt>=1?{value:Se(e*xt),unit:"AU/h"}:{value:Se(n*Ba),unit:"km/s"}}function Gr(n){return n>=.01?{value:Se(n),unit:"ly"}:n*xt>=.01?{value:Se(n*xt),unit:"AU"}:{value:Se(n*Ba),unit:"km"}}function Wt({label:n,primary:e=!1,valueRef:t,unitRef:s,trendRef:a}){return i.jsxs("div",{className:"w-[6.4rem] sm:w-36 text-center whitespace-nowrap",children:[i.jsx("div",{className:"text-[8px] sm:text-[9px] uppercase tracking-[0.25em] sm:tracking-[0.3em] text-cyan-300/70",children:n}),i.jsxs("div",{className:`relative tabular-nums leading-tight ${e?"text-lg sm:text-2xl text-white":"text-base sm:text-lg text-cyan-100"}`,children:[a&&i.jsx("span",{ref:a,className:"absolute -left-1 sm:left-0 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs transition-[opacity,color] duration-300 opacity-0"}),i.jsx("span",{ref:t}),i.jsx("span",{ref:s,className:"text-[10px] sm:text-xs text-cyan-200/80 ml-1"})]})]})}function Or({travel:n}){const e=x.useRef({speed:n.speed??0,remaining:n.remaining});e.current={speed:n.speed??0,remaining:n.remaining};const t={speed:x.useRef(null),speedUnit:x.useRef(null),trend:x.useRef(null),c:x.useRef(null),cUnit:x.useRef(null),remaining:x.useRef(null),remainingUnit:x.useRef(null)};return x.useEffect(()=>{let a=Math.log(Math.max(e.current.speed,1e-15)),o=Math.log(Math.max(e.current.remaining??1e-15,1e-15)),r=0,l=performance.now();const c=l+500;let d=0;const u=(m,p)=>{m.current&&m.current.textContent!==p&&(m.current.textContent=p)},h=m=>{d=requestAnimationFrame(h);const p=Math.min(.1,(m-l)/1e3);l=m;const f=1-Math.exp(-p*6),w=(Math.log(Math.max(e.current.speed,1e-15))-a)*f;a+=w,e.current.remaining!==void 0&&(o+=(Math.log(Math.max(e.current.remaining,1e-15))-o)*f),r+=((p>0?w/p:0)-r)*Math.min(1,p*4);const v=Math.exp(a),S=Dr(v);u(t.speed,S.value),u(t.speedUnit,S.unit);const j=v*Wr;if(u(t.c,j>=1?`${Se(j)}×`:j.toFixed(2)),u(t.cUnit,"c"),e.current.remaining!==void 0){const N=Gr(Math.exp(o));u(t.remaining,N.value),u(t.remainingUnit,N.unit)}else u(t.remaining,"—"),u(t.remainingUnit,"");const P=t.trend.current;if(P){const N=m<c?0:Math.min(1,Math.abs(r)/1.5);P.textContent=r>=0?"▲":"▼",P.style.color=r>=0?"rgb(103,232,249)":"rgb(252,211,77)",P.style.opacity=String(N<.08?0:.35+.65*N)}};return d=requestAnimationFrame(h),()=>cancelAnimationFrame(d)},[]),i.jsxs("div",{className:"relative px-3 sm:px-6 py-2.5 sm:py-3.5 animate-[fadeIn_0.4s_ease-out] font-mono select-none",children:[i.jsx("span",{className:"absolute left-0 top-0 w-3 h-3 border-l border-t border-cyan-300/60"}),i.jsx("span",{className:"absolute right-0 top-0 w-3 h-3 border-r border-t border-cyan-300/60"}),i.jsx("span",{className:"absolute left-0 bottom-0 w-3 h-3 border-l border-b border-cyan-300/60"}),i.jsx("span",{className:"absolute right-0 bottom-0 w-3 h-3 border-r border-b border-cyan-300/60"}),i.jsxs("div",{className:"flex items-end justify-center drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]",children:[i.jsx(Wt,{label:"Velocity",primary:!0,valueRef:t.speed,unitRef:t.speedUnit,trendRef:t.trend}),i.jsx(Wt,{label:"Light speed",valueRef:t.c,unitRef:t.cUnit}),i.jsx(Wt,{label:"Remaining",valueRef:t.remaining,unitRef:t.remainingUnit})]})]})}function Qs({explorer:n,state:e,onPick:t}){const[s,a]=x.useState(null),[o,r]=x.useState(""),l=()=>{const c=parseInt(o.replace(/[^0-9]/g,""),10);Number.isFinite(c)&&e.galaxy&&c<e.galaxy.num_systems&&(n.selectSystem(c),t?.())};return i.jsxs(oe,{className:"w-64 max-w-full max-h-[calc(100dvh-15rem)] overflow-y-auto overscroll-contain p-3 pointer-events-auto",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1.5",children:"Find a system"}),i.jsxs("div",{className:"flex gap-1.5 mb-3",children:[i.jsx("input",{value:o,onChange:c=>r(c.target.value),onKeyDown:c=>c.key==="Enter"&&l(),placeholder:e.galaxy?`# 0 – ${(e.galaxy.num_systems-1).toLocaleString()}`:"#",className:"flex-1 min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white font-mono focus:outline-none focus:border-cyan-400/60"}),i.jsx(G,{onClick:l,children:"Find"})]}),i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:"Landmarks"}),Tr.map(c=>{const d=e.pois.filter(h=>c.kinds.includes(h.kind));if(d.length===0)return null;const u=s===c.title;return i.jsxs("div",{children:[i.jsxs("button",{onClick:()=>a(u?null:c.title),className:"w-full flex justify-between items-center py-1 text-xs hover:text-white",children:[i.jsx("span",{className:c.accent,children:c.title}),i.jsxs("span",{className:"text-gray-500",children:[d.length," ",u?"▾":"▸"]})]}),u&&i.jsx("div",{className:"pl-2 pb-1 space-y-0.5",children:d.slice(0,80).map(h=>i.jsx("button",{onClick:()=>(n.flyToPoi(h),t?.()),className:"block w-full text-left text-[11px] font-mono px-1.5 py-1 sm:py-0.5 rounded hover:bg-white/10 text-gray-400",children:h.name},h.id))})]},c.title)}),i.jsxs("div",{className:"mt-3 pt-2 border-t border-white/10 space-y-1 text-[11px] text-gray-400",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:"Legend"}),i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("span",{className:"w-0 h-0 border-l-[5px] border-r-[5px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-400"})," Your ship"]}),i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("span",{className:"w-2 h-2 rotate-45 border border-amber-300/80"})," Galactic core"]}),i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("span",{className:"w-3 h-3 rounded-full border border-dashed border-violet-300/70"})," Star cluster"]}),i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("span",{className:"w-3 h-3 rounded-full border-2 border-fuchsia-300/80"})," Black hole · pulsar"]}),i.jsxs("div",{className:"flex items-center gap-2",children:[i.jsx("span",{className:"w-3 h-3 rounded-full border border-dashed border-sky-200/60"})," Neighbour galaxy (zoom out)"]})]})]})}function Vr({explorer:n,state:e,onClose:t}){const[s,a]=x.useState(()=>(e.coordinates??qt).map(String)),o=x.useMemo(()=>za(),[]),r=s.every(c=>/^\d+$/.test(c)&&parseInt(c,10)<=1e7),l=(c,d=null)=>{t(),n.hyperjump(c,d)};return i.jsx(St,{onClose:t,children:i.jsx(oe,{className:"p-5 w-[min(420px,calc(100vw-2rem))]",children:i.jsxs("div",{children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.25em] text-cyan-300/80",children:"Hyperjump computer"}),i.jsx("div",{className:"text-lg font-semibold text-white mb-3",children:"Where to?"}),i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:"Galaxy coordinates (0 – 10,000,000)"}),i.jsx("div",{className:"flex gap-1.5",children:["x","y","z"].map((c,d)=>i.jsx("input",{value:s[d],autoFocus:d===0,onChange:u=>a(h=>h.map((m,p)=>p===d?u.target.value.replace(/[^0-9]/g,""):m)),onKeyDown:u=>u.key==="Enter"&&r&&l(s.map(h=>parseInt(h,10))),className:"w-full min-w-0 bg-black/40 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-cyan-400/60",placeholder:c},c))}),i.jsxs("div",{className:"flex gap-2 mt-3",children:[i.jsxs(G,{tone:"primary",className:"flex-1",disabled:!r,onClick:()=>l(s.map(c=>parseInt(c,10))),children:["Jump",i.jsx(he,{children:"⏎"})]}),i.jsx(G,{className:"flex-1",onClick:async()=>{const c=await Ea();l(c.coordinates,c.system)},children:"Somewhere random"})]}),o.length>0&&i.jsxs("div",{className:"mt-4",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1",children:"Recently visited"}),i.jsx("div",{className:"space-y-0.5",children:o.map(c=>i.jsxs("button",{onClick:()=>l(c.coordinates),className:"w-full flex justify-between text-xs px-2 py-1 rounded hover:bg-white/10",children:[i.jsx("span",{className:"text-gray-200",children:ae(c.name)}),i.jsxs("span",{className:"text-gray-500 font-mono",children:[c.type," · ",c.coordinates.join(",")]})]},c.coordinates.join(",")))})]})]})})})}const qr=[{key:"shipView",label:"Ship view",description:"Chase camera behind your saucer"},{key:"universeGrid",label:"Universe grid",description:"The cube cells around this galaxy and its 26 neighbours"},{key:"flightHud",label:"Flight HUD",description:"Speed, light speed and distance left while travelling"},{key:"soundEffects",label:"Sound effects",description:"Quiet ship sounds for flights, jumps and selections"}],ea=({label:n,description:e,checked:t,onChange:s})=>i.jsxs("button",{role:"switch","aria-checked":t,onClick:()=>s(!t),className:"w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-colors",children:[i.jsxs("span",{className:"min-w-0",children:[i.jsx("span",{className:`block text-sm ${t?"text-cyan-200":"text-gray-200"}`,children:n}),i.jsx("span",{className:"block text-[10px] text-gray-500",children:e})]}),i.jsx("span",{className:`shrink-0 w-8 h-4 rounded-full relative transition-colors ${t?"bg-cyan-400/80":"bg-white/15"}`,children:i.jsx("span",{className:`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${t?"left-[18px]":"left-0.5"}`})})]}),Dt={maxHeight:"calc(100dvh - 4.75rem)",maxWidth:"calc(100vw - 1.5rem)"};function Hr({explorer:n,state:e,onClose:t}){const[s,a]=x.useState(()=>Ie()),o=r=>{n.setQuality(r)&&window.location.reload()};return i.jsxs(oe,{className:"w-72 max-w-full p-4 pointer-events-auto",children:[i.jsxs("div",{className:"flex justify-between items-center mb-3",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400",children:"Graphics quality"}),i.jsx("button",{onClick:t,className:"text-gray-500 hover:text-white text-xs",children:"✕"})]}),i.jsx("div",{className:"space-y-1.5",children:Object.keys(Pe).map(r=>{const l=Pe[r],c=e.quality===r;return i.jsxs("button",{onClick:()=>o(r),className:`w-full text-left px-3 py-2 rounded-lg border transition-colors ${c?"border-cyan-400/70 bg-cyan-400/10":"border-white/10 bg-white/5 hover:bg-white/10"}`,children:[i.jsx("div",{className:`text-sm ${c?"text-cyan-200":"text-gray-200"}`,children:l.label}),i.jsxs("div",{className:"text-[10px] text-gray-500",children:[l.description," · ",l.fps?`${l.fps} fps`:"uncapped"," · ",Math.round(l.maxStars/1e3),"k stars"]})]},r)})}),i.jsxs("div",{className:"mt-3 text-[11px] text-gray-500 flex justify-between",children:[i.jsx("span",{children:"Rendering at"}),i.jsxs("span",{className:"font-mono text-gray-300",children:[e.fps," fps"]})]}),i.jsx("p",{className:"mt-1 text-[10px] text-gray-600",children:"When nothing moves the frame rate drops on its own to save battery."}),i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2",children:"View"}),i.jsx("div",{className:"space-y-1",children:qr.map(({key:r,label:l,description:c})=>i.jsx(ea,{label:l,description:c,checked:e.view[r],onChange:d=>n.setViewOption(r,d)},r))}),i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400 mt-4 mb-2",children:"Accessibility"}),i.jsx(ea,{label:"Reduced flashing",description:"No white flashes in jumps and crossings, gentler hyperspace. For photosensitive pilots",checked:s,onChange:r=>{mi(r),a(r)}})]})}function Br({onClose:n}){const e=[["Drag","Look around"],["Scroll / pinch","Zoom across scales"],["Right drag / Shift","Pan"],["W S · ↑ ↓","Thrust forward / back"],["A D · ← →","Turn"],["Q E · R F","Slide sideways · up / down"],["Click","Target a star or planet"],["Double-click · ⏎","Engage: travel / go into orbit"],["Esc","Back out one level"],["M","Galaxy map"],["H","Return to your ship"],["J","Hyperjump to another galaxy"],["P","Take a photo, with a QR code to this place"]];return i.jsx(St,{onClose:n,children:i.jsxs(oe,{className:"p-6 max-w-md",children:[i.jsx("div",{className:"text-lg font-semibold text-white mb-1",children:"Welcome aboard"}),i.jsx("p",{className:"text-sm text-gray-400 mb-4",children:"Your ship is docked at a star. Every point of light out there is a real star system you can travel to: pick a target, engage, and go into orbit around its planets."}),i.jsx("div",{className:"grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs",children:e.map(([t,s])=>i.jsxs(aa.Fragment,{children:[i.jsx("span",{className:"text-gray-500",children:t}),i.jsx("span",{children:s})]},t))}),i.jsx("div",{className:"mt-5 text-right",children:i.jsx(G,{tone:"primary",onClick:n,children:"Let's go"})})]})})}function $r({universe:n,onOpen:e,onCross:t}){return n?.remote?i.jsxs("div",{className:"flex items-center rounded-lg border border-fuchsia-400/40 bg-fuchsia-500/10 text-xs overflow-hidden",title:`Exploring a remote universe from node ${n.node_id}`,children:[i.jsxs("button",{onClick:e,className:"flex items-center gap-1.5 px-3 py-1.5 text-fuchsia-100 hover:bg-fuchsia-500/20",children:[i.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-fuchsia-300 animate-pulse"}),"Remote · ",i.jsx("span",{className:"max-w-[9rem] truncate",children:n.seed_str||n.seed_name||"unknown seed"})]}),i.jsx("button",{onClick:()=>t({url:"/multiverse/exit",name:"your universe",home:!0}),className:"px-2.5 py-1.5 border-l border-fuchsia-400/30 text-fuchsia-200/80 hover:bg-fuchsia-500/20 hover:text-white",title:"Back to your own universe",children:"Exit"})]}):i.jsxs("button",{onClick:e,className:"flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 hover:bg-white/15 text-gray-200 border border-white/10 transition-colors",title:"Universes discovered through the P2P network",children:[i.jsx("span",{className:"w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)] animate-pulse"}),"Multiverse"]})}function Ur({universe:n,musicMuted:e,actions:t}){const[s,a]=x.useState(!1),o=x.useRef(null);x.useEffect(()=>{if(!s)return;const c=d=>{o.current?.contains(d.target)||a(!1)};return document.addEventListener("pointerdown",c,!0),()=>document.removeEventListener("pointerdown",c,!0)},[s]);const r=c=>()=>{a(!1),c()},l=({onClick:c,label:d,hint:u,accent:h="text-gray-100"})=>i.jsxs("button",{onClick:r(c),className:"w-full flex items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10 active:bg-white/15 transition-colors",children:[i.jsx("span",{className:h,children:d}),u&&i.jsx("span",{className:"text-[11px] text-gray-500 truncate",children:u})]});return i.jsxs("div",{ref:o,className:"lg:hidden relative pointer-events-auto shrink-0",children:[i.jsxs("button",{onClick:()=>a(!s),className:"relative w-10 h-10 flex items-center justify-center rounded-lg bg-slate-950/70 border border-white/15 backdrop-blur-md","aria-label":"Menu","aria-expanded":s,children:[[-6,0,6].map((c,d)=>i.jsx("span",{className:"absolute left-1/2 top-1/2 w-5 h-0.5 -ml-2.5 -mt-px rounded bg-gray-100 transition-all duration-300",style:{transform:s?d===1?"scaleX(0)":`rotate(${d===0?45:-45}deg)`:`translateY(${c}px)`,opacity:s&&d===1?0:1}},d)),n?.remote&&!s&&i.jsx("span",{className:"absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-fuchsia-400 border border-black"})]}),i.jsx("div",{className:`absolute right-0 top-12 w-[min(18rem,calc(100vw-1.5rem))] origin-top-right transition-all duration-200 ${s?"opacity-100 scale-100":"opacity-0 scale-95 pointer-events-none"}`,children:i.jsxs(oe,{className:"overflow-hidden py-1.5",children:[n?.remote?i.jsxs(i.Fragment,{children:[i.jsx(l,{onClick:t.multiverse,label:"Multiverse",hint:`Remote · ${n.seed_str||n.seed_name}`,accent:"text-fuchsia-200"}),i.jsx(l,{onClick:t.exitRemote,label:"Return to your universe",accent:"text-fuchsia-200"})]}):i.jsx(l,{onClick:t.multiverse,label:"Multiverse",hint:"P2P universes"}),i.jsx(l,{onClick:t.stargate,label:"Stargate",hint:"Links & saved places"}),i.jsx(l,{onClick:t.map,label:"Galaxy map"}),i.jsx(l,{onClick:t.hyperjump,label:"Hyperjump",hint:"Another galaxy"}),i.jsx(l,{onClick:t.photo,label:"Take a photo",hint:"With a QR code to this place"}),i.jsx("div",{className:"my-1.5 border-t border-white/10"}),i.jsx(l,{onClick:t.ship,label:"Hangar",hint:"Choose your ship"}),i.jsx(l,{onClick:t.settings,label:"Graphics & view"}),i.jsx(l,{onClick:t.music,label:e?"Music: off":"Music: on",accent:e?"text-gray-400":"text-cyan-200"}),i.jsx(l,{onClick:t.help,label:"Controls"}),i.jsx(l,{onClick:t.faq,label:"F.A.Q."}),i.jsx("div",{className:"my-1.5 border-t border-white/10"}),i.jsxs("div",{className:"flex items-center justify-between px-4 py-2",children:[i.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"opacity-70 hover:opacity-100",children:i.jsx("img",{src:"https://www.banshee.pro/images/banshee-logo.png",alt:"Banshee",className:"h-3.5 w-auto max-w-[100px] object-contain"})}),i.jsx("a",{href:"https://x.com/surcebeats",target:"_blank",rel:"noopener noreferrer",className:"text-xs text-gray-400 hover:text-white",children:"@SurceBeats"})]})]})})]})}const Yr=[{kind:"saucer",name:"Saucer",description:"A disc with a ventral drive ring. Steady and smooth"},{kind:"interceptor",name:"Interceptor",description:"A delta wing with twin engines. Banks hard into every turn"}],$a=({kind:n,size:e=18,className:t=""})=>i.jsx("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.5,strokeLinejoin:"round",strokeLinecap:"round",className:t,children:n==="saucer"?i.jsxs(i.Fragment,{children:[i.jsx("ellipse",{cx:12,cy:13,rx:10,ry:2.6}),i.jsx("path",{d:"M8 11.2c.6-2.4 2.1-3.6 4-3.6s3.4 1.2 4 3.6"}),i.jsx("path",{d:"M10 15.6l-.8 1.8M14 15.6l.8 1.8"})]}):i.jsxs(i.Fragment,{children:[i.jsx("path",{d:"M12 2.5l1.6 6.3 8 8.2v1.6l-6.6-1.4-.6 2.6h-4.8l-.6-2.6L2.4 18.6V17l8-8.2z"}),i.jsx("path",{d:"M11 9.5h2v4.5h-2z"})]})});function Zr({current:n,onChoose:e,onClose:t}){return i.jsxs(oe,{className:"w-72 max-w-full p-4 pointer-events-auto",children:[i.jsxs("div",{className:"flex justify-between items-center mb-3",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-gray-400",children:"Hangar"}),i.jsx("button",{onClick:t,className:"text-gray-500 hover:text-white text-xs","aria-label":"Close",children:"✕"})]}),i.jsx("div",{className:"space-y-1.5",children:Yr.map(s=>{const a=s.kind===n;return i.jsxs("button",{onClick:()=>e(s.kind),className:`w-full flex items-center gap-3 text-left px-3 py-2.5 rounded-lg border transition-colors ${a?"border-cyan-400/70 bg-cyan-400/10":"border-white/10 bg-white/5 hover:bg-white/10"}`,children:[i.jsx("span",{className:`shrink-0 w-11 h-11 rounded-md flex items-center justify-center bg-black/40 border border-white/10 ${a?"text-cyan-200":"text-gray-300"}`,children:i.jsx($a,{kind:s.kind,size:30})}),i.jsxs("span",{className:"min-w-0",children:[i.jsx("span",{className:`block text-sm ${a?"text-cyan-200":"text-gray-200"}`,children:s.name}),i.jsx("span",{className:"block text-[10px] text-gray-500 leading-snug",children:s.description})]})]},s.kind)})}),i.jsx("p",{className:"mt-3 text-[10px] text-gray-600",children:"Seen from the chase camera when Ship view is on."})]})}const rt="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-950/60 hover:bg-white/15 border border-white/10 backdrop-blur-md transition-colors",ta=({on:n,children:e})=>i.jsxs("svg",{width:15,height:15,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",className:n?"text-cyan-300":"text-gray-500",children:[e,!n&&i.jsx("path",{d:"M4 4l16 16"})]});function Xr({onFaq:n,musicMuted:e,onToggleMusic:t,sfxOn:s,onToggleSfx:a}){return i.jsxs(i.Fragment,{children:[i.jsx("a",{href:"https://www.banshee.pro",target:"_blank",rel:"noopener noreferrer",className:"hidden lg:flex absolute bottom-3 left-3 items-center gap-2 px-2 py-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-white/5 transition-opacity pointer-events-auto",title:"Banshee Technologies",children:i.jsx("img",{src:"https://www.banshee.pro/images/banshee-logo.png",alt:"Banshee",className:"h-3.5 w-auto max-w-[110px] object-contain",draggable:!1})}),i.jsxs("div",{className:"hidden lg:flex absolute bottom-3 right-3 items-center gap-1.5 pointer-events-auto",children:[i.jsx("button",{onClick:t,className:rt,title:e?"Play the soundtrack":"Mute the soundtrack","aria-label":e?"Play the soundtrack":"Mute the soundtrack","aria-pressed":!e,children:i.jsxs(ta,{on:!e,children:[i.jsx("path",{d:"M9 18V5l11-2v13"}),i.jsx("circle",{cx:6,cy:18,r:3}),i.jsx("circle",{cx:17,cy:16,r:3})]})}),i.jsx("button",{onClick:a,className:rt,title:s?"Mute the sound effects":"Turn the sound effects on","aria-label":s?"Mute the sound effects":"Turn the sound effects on","aria-pressed":s,children:i.jsxs(ta,{on:s,children:[i.jsx("path",{d:"M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"}),s&&i.jsx("path",{d:"M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"})]})}),i.jsx("button",{onClick:n,className:rt,title:"The Atlas F.A.Q.","aria-label":"The Atlas F.A.Q.",children:i.jsxs("svg",{width:15,height:15,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",className:"text-gray-300",children:[i.jsx("circle",{cx:12,cy:12,r:9.5}),i.jsx("path",{d:"M9.2 9.3a2.9 2.9 0 0 1 5.6 1c0 1.9-2.8 2.5-2.8 4"}),i.jsx("path",{d:"M12 17.3v.2"})]})}),i.jsx("a",{href:"https://x.com/surcebeats",target:"_blank",rel:"noopener noreferrer",className:rt,title:"@SurceBeats on X","aria-label":"@SurceBeats on X",children:i.jsx("svg",{width:13,height:13,viewBox:"0 0 24 24",className:"text-gray-300",children:i.jsx("path",{fill:"currentColor",d:"M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"})})})]})]})}const Jr=()=>{const n=x.useRef(null),[e,t]=x.useState(null),s=x.useRef(null),[a,o]=x.useState(null),r=x.useRef(()=>{});r.current=()=>{if(!e)return;const W=()=>s.current?.animate(Ie()?[{opacity:.12},{opacity:0}]:[{opacity:.55},{opacity:0}],{duration:Ie()?700:420,easing:"ease-out"});e.takePhoto(W).then(Z=>Z&&o("Photo saved")).catch(()=>o("The photo could not be saved"))},x.useEffect(()=>{if(!a)return;const W=setTimeout(()=>o(null),2200);return()=>clearTimeout(W)},[a]);const l=x.useRef("");a&&(l.current=a);const[c,d]=x.useState(!1),[u,h]=x.useState(!1),[m,p]=x.useState(()=>window.location.hash==="#faq"),[f,g]=x.useState(!1),[w,v]=x.useState(!1),[S,j]=x.useState(!1),[P,N]=x.useState(null),[M,I]=x.useState(()=>window.location.hash==="#multiverse"),[_,C]=x.useState(null),R=x.useMemo(()=>Mt(),[]),L=x.useMemo(()=>new or("/static/audio/atlas-space-drift.mp3"),[]),[T,A]=x.useState(L.muted),[O,H]=x.useState(!0),q=x.useRef(null),[Q,U]=x.useState(()=>{try{return localStorage.getItem("atlas-explore-help")!=="seen"}catch{return!0}});x.useEffect(()=>{if(!n.current)return;const W=new Wo(n.current,lo());t(W),window.atlasExplorer=W;const Z=(async()=>{const ee=Pr();if(ee)return{...ee,plan:ee.via==="stargate"?{kind:"stargate",coordinates:ee.coordinates,system:ee.system,planet:ee.planet}:null};const pe=zo();if(pe)return{...pe,plan:null};const Ct=await Eo();if(Ct)return{coordinates:Ct.coordinates,system:Ct.system,planet:null,plan:null};try{const Je=await Ea();return{...Je,plan:{kind:"random",coordinates:Je.coordinates,system:Je.system,planet:Je.planet}}}catch{return{coordinates:qt,system:null,planet:null,plan:null}}})();return q.current=()=>Z.then(ee=>{ee.plan&&N(ee.plan),W.loadGalaxy(ee.coordinates,{system:ee.system,planet:ee.planet})}),()=>W.dispose()},[]),x.useEffect(()=>(window.atlasMusic=L,()=>L.dispose()),[L]);const je=()=>{L.start(),$.attach(L.context),$.dive(ht)},Ce=()=>{e?.jumpIn(),q.current?.(),q.current=null,H(!1),Q&&(U(!1),setTimeout(()=>U(!0),7e3))};x.useEffect(()=>{const W=Z=>{const ee=Z.target?.tagName;ee==="INPUT"||ee==="TEXTAREA"||((Z.key==="j"||Z.key==="J")&&d(!0),Z.key==="?"&&U(pe=>!pe),(Z.key==="p"||Z.key==="P")&&!Z.metaKey&&!Z.ctrlKey&&!Z.altKey&&!Z.repeat&&r.current())};return window.addEventListener("keydown",W),()=>window.removeEventListener("keydown",W)},[]);const ze=x.useMemo(()=>()=>null,[]),k=x.useSyncExternalStore(e?.subscribe??(()=>()=>{}),e?.getState??ze);x.useEffect(()=>{const W=window.atlasPreloader;if(W){if(O)return W.done();k&&(k.mode!=="loading"||k.error?W.done():k.status&&W.step(k.status,k.galaxy?.75:.45))}},[O,k?.mode,k?.status,k?.error,!!k?.galaxy]),x.useEffect(()=>{k&&Ir(k)},[k?.ship?.coordinates.join(","),k?.ship?.system,k?.ship?.planet]);const D=W=>{_||(I(!1),U(!1),g(!1),h(!1),N(null),C(W),e?.engageDrive(),setTimeout(()=>window.location.assign(W.url),2300))},le=()=>{U(!1);try{localStorage.setItem("atlas-explore-help","seen")}catch{}};return i.jsxs("div",{className:"fixed inset-0 bg-black text-gray-200 overflow-hidden font-sans select-none",children:[i.jsx("div",{ref:n,className:"absolute inset-0"}),i.jsx("div",{ref:s,className:"absolute inset-0 z-[60] bg-white opacity-0 pointer-events-none"}),i.jsx(me,{show:!!a,children:i.jsx("div",{className:"absolute top-20 inset-x-0 z-[60] flex justify-center pointer-events-none",children:i.jsxs("div",{className:"flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-950/85 border border-cyan-300/30 backdrop-blur-md font-mono text-[11px] uppercase tracking-[0.25em] text-cyan-100",children:[i.jsxs("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",className:"text-cyan-300",children:[i.jsx("path",{d:"M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"}),i.jsx("circle",{cx:12,cy:13,r:3.4})]}),l.current]})})}),e&&k&&i.jsxs(i.Fragment,{children:[i.jsxs("div",{className:"absolute top-0 inset-x-0 z-[45] p-3 flex justify-between items-start gap-3 pointer-events-none bg-gradient-to-b from-black/70 to-transparent",children:[i.jsx(Rr,{state:k}),i.jsx(Ur,{universe:R,musicMuted:T,actions:{multiverse:()=>I(!0),exitRemote:()=>D({url:"/multiverse/exit",name:"your universe",home:!0}),stargate:()=>(g(!0),h(!1),v(!1)),ship:()=>(v(!0),h(!1),g(!1)),map:()=>e.openMap(),hyperjump:()=>d(!0),photo:()=>setTimeout(()=>r.current(),250),settings:()=>(h(!0),g(!1),v(!1)),help:()=>U(!0),faq:()=>p(!0),music:()=>{L.setMuted(!T),A(!T)}}}),i.jsxs("div",{className:"hidden lg:flex gap-2 pointer-events-auto shrink-0",children:[i.jsx($r,{universe:R,onOpen:()=>I(!0),onCross:D}),i.jsxs(G,{onClick:()=>(g(W=>!W),h(!1),v(!1)),title:"Stargate links and saved places",className:"flex items-center gap-1.5",children:[i.jsxs("svg",{width:14,height:14,viewBox:"0 0 24 24",className:"text-cyan-300",fill:"none",stroke:"currentColor",strokeLinecap:"round",strokeWidth:1.6,children:[i.jsx("path",{d:"M14 12a6 6 0 1 1-6-6"}),i.jsx("path",{d:"M10 12a6 6 0 1 1 6 6",opacity:.55})]}),"Stargate"]}),i.jsxs(G,{onClick:()=>e.openMap(),children:["Galaxy map",i.jsx(he,{children:"M"})]}),i.jsxs(G,{onClick:()=>d(!0),children:["Hyperjump",i.jsx(he,{children:"J"})]}),i.jsx(G,{onClick:()=>r.current(),title:"Take a photo (P): PNG with a QR code to this place","aria-label":"Take a photo",className:"flex items-center !px-2.5",children:i.jsxs("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("path",{d:"M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"}),i.jsx("circle",{cx:12,cy:13,r:3.4})]})}),i.jsx(G,{onClick:()=>(v(W=>!W),h(!1),g(!1)),title:"Hangar: choose your ship","aria-label":"Hangar: choose your ship",className:"flex items-center !px-2",children:i.jsx($a,{kind:k.view.ship,size:17,className:"text-cyan-200"})}),i.jsx(G,{onClick:()=>(h(W=>!W),g(!1),v(!1)),title:"Graphics & view","aria-label":"Graphics & view",className:"flex items-center !px-2.5",children:i.jsxs("svg",{width:15,height:15,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("path",{d:"M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4z"}),i.jsx("path",{d:"M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.1-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.56-1.1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.03 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9a1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.03z"})]})}),i.jsx(G,{onClick:()=>U(!0),title:"Controls","aria-label":"Controls",className:"flex items-center !px-2.5",children:i.jsxs("svg",{width:16,height:16,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.6,strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("rect",{x:2.5,y:6,width:19,height:12,rx:2}),i.jsx("path",{d:"M6 9.5h.01M9 9.5h.01M12 9.5h.01M15 9.5h.01M18 9.5h.01M6 12.2h.01M9 12.2h.01M12 12.2h.01M15 12.2h.01M18 12.2h.01M8 15h8"})]})})]})]}),P&&i.jsx("div",{className:"absolute top-16 inset-x-0 flex justify-center pointer-events-none",children:i.jsx(Nr,{plan:P,state:k,onDone:()=>N(null)})}),i.jsx(me,{show:u,children:i.jsx(Qe,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:Dt,children:i.jsx(Hr,{explorer:e,state:k,onClose:()=>h(!1)})})}),i.jsx(me,{show:w,children:i.jsx(Qe,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:Dt,children:i.jsx(Zr,{current:k.view.ship,onChoose:W=>e.setViewOption("ship",W),onClose:()=>v(!1)})})}),i.jsx(me,{show:f,children:i.jsx(Qe,{className:"absolute top-16 right-3 z-40 overflow-y-auto overscroll-contain rounded-xl",style:Dt,children:i.jsx(kr,{explorer:e,state:k,universe:R,onClose:()=>g(!1)})})}),i.jsx(Xr,{onFaq:()=>p(!0),musicMuted:T,onToggleMusic:()=>{L.setMuted(!T),A(!T)},sfxOn:k.view.soundEffects,onToggleSfx:()=>e.setViewOption("soundEffects",!k.view.soundEffects)}),k.mapView&&!k.arrival&&k.pois.length>0&&i.jsx("div",{className:"absolute top-20 left-3 pointer-events-none hidden md:block",children:i.jsx(Qs,{explorer:e,state:k})}),k.mapView&&!k.arrival&&k.pois.length>0&&i.jsx("div",{className:"md:hidden absolute top-16 left-3 z-30 pointer-events-auto animate-[fadeIn_0.3s_ease-out]",children:i.jsxs("button",{onClick:()=>j(W=>!W),"aria-expanded":S,className:`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border backdrop-blur-md transition-colors ${S?"bg-cyan-400/15 border-cyan-400/50 text-cyan-100":"bg-slate-950/70 border-white/15 text-gray-200"}`,children:[i.jsxs("svg",{width:14,height:14,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round",children:[i.jsx("path",{d:"M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z"}),i.jsx("circle",{cx:12,cy:10,r:2.3})]}),"Landmarks",i.jsx("span",{className:"text-gray-500",children:k.pois.length})]})}),i.jsx(me,{show:S&&k.mapView&&!k.arrival,children:i.jsx(Qe,{className:"md:hidden absolute top-[6.25rem] left-3 z-30",origin:"top left",style:{width:"min(18rem, calc(100vw - 1.5rem))"},children:i.jsx(Qs,{explorer:e,state:k,onPick:()=>j(!1)})})}),k.mode!=="loading"&&i.jsx("div",{"data-ship-floor":!0,className:"absolute bottom-3 inset-x-0 flex justify-center pointer-events-none",children:i.jsx(_r,{explorer:e,state:k})}),k.view.flightHud&&k.travel&&k.travel.speed!==void 0&&!k.arrival&&!_&&i.jsx("div",{className:`absolute inset-x-0 flex justify-center pointer-events-none transition-[top] duration-500 ${P?"top-[150px]":"top-[14%]"}`,children:i.jsx(Or,{travel:k.travel})}),k.arrival&&i.jsx("div",{className:"absolute inset-x-0 top-[22%] flex justify-center pointer-events-none",children:i.jsxs("div",{className:"text-center animate-[fadeIn_1.2s_ease-out]",children:[i.jsx("div",{className:"text-[11px] uppercase tracking-[0.5em] text-cyan-300/80 mb-2",children:"Arriving at"}),i.jsx("div",{className:"text-4xl sm:text-5xl font-light tracking-wide text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]",children:k.arrival.name}),i.jsxs("div",{className:"text-sm text-gray-300 mt-2 drop-shadow-[0_0_8px_rgba(0,0,0,0.9)]",children:[k.arrival.type," galaxy · ",k.arrival.systems.toLocaleString()," star systems"]})]})}),k.status&&!k.error&&i.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none",children:i.jsxs("div",{className:"text-center",children:[i.jsx("div",{className:"w-10 h-10 mx-auto mb-3 rounded-full border-2 border-cyan-400/20 border-t-cyan-300 animate-spin"}),i.jsx("div",{className:"text-sm text-cyan-100/80 tracking-wide",children:k.status})]})}),k.error&&i.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:i.jsxs(oe,{className:"p-5 max-w-sm text-center",children:[i.jsx("div",{className:"text-red-300 text-sm mb-3",children:k.error}),i.jsx(G,{onClick:()=>e.loadGalaxy(qt),children:"Return to the center of the universe"})]})}),k.mode==="galaxy"&&k.galaxy?.num_systems===0&&i.jsx("div",{className:"absolute inset-0 flex items-center justify-center pointer-events-none",children:i.jsxs(oe,{className:"p-5 max-w-sm text-center pointer-events-auto",children:[i.jsx("div",{className:"text-[10px] uppercase tracking-[0.2em] text-fuchsia-300/80 mb-1",children:k.galaxy.galaxy_type}),i.jsx("div",{className:"text-sm text-gray-300 mb-3",children:"No star systems have formed here. Only darkness, and whatever lives at its center."}),i.jsx(G,{onClick:()=>d(!0),children:"Hyperjump somewhere else"})]})}),i.jsx(me,{show:c,children:i.jsx(Vr,{explorer:e,state:k,onClose:()=>d(!1)})}),i.jsx(me,{show:Q,children:i.jsx(Br,{onClose:le})}),i.jsx(me,{show:m,children:i.jsx(Ho,{onClose:()=>p(!1)})}),i.jsx(me,{show:M,children:i.jsx(dr,{universe:R,onClose:()=>I(!1),onCross:D})}),_&&i.jsx(ur,{crossing:_})]}),i.jsx(ir,{onIgnite:je,onDive:Ce})]})},sa=()=>{const n=document.getElementById("atlas-react-root");n&&Ua.createRoot(n).render(aa.createElement(Jr))};document.readyState==="loading"?document.addEventListener("DOMContentLoaded",sa):sa();
