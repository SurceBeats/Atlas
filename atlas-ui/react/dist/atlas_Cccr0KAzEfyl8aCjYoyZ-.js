import"./atlas_D0CDU_zgRQ1L3XbOi9taH.js";import{C as x,i as A,av as w,cg as M,bL as T,ch as y,B as E,ci as G,m as p,cj as B,ck as U,cl as R}from"./atlas_BUnHktt_WsVovWPX8BirI.js";const H={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`},D={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new x(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};function z(l,o=!1){const s=l[0].index!==null,h=new Set(Object.keys(l[0].attributes)),d=new Set(Object.keys(l[0].morphAttributes)),f={},a={},t=l[0].morphTargetsRelative,u=new A;let m=0;for(let e=0;e<l.length;++e){const i=l[e];let n=0;if(s!==(i.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const r in i.attributes){if(!h.has(r))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+'. All geometries must have compatible attributes; make sure "'+r+'" attribute exists among all geometries, or in none of them.'),null;f[r]===void 0&&(f[r]=[]),f[r].push(i.attributes[r]),n++}if(n!==h.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+". Make sure all geometries have the same number of attributes."),null;if(t!==i.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const r in i.morphAttributes){if(!d.has(r))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+".  .morphAttributes must be consistent throughout all geometries."),null;a[r]===void 0&&(a[r]=[]),a[r].push(i.morphAttributes[r])}if(o){let r;if(s)r=i.index.count;else if(i.attributes.position!==void 0)r=i.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+e+". The geometry must have either an index or a position attribute"),null;u.addGroup(m,r,e),m+=r}}if(s){let e=0;const i=[];for(let n=0;n<l.length;++n){const r=l[n].index;for(let c=0;c<r.count;++c)i.push(r.getX(c)+e);e+=l[n].attributes.position.count}u.setIndex(i)}for(const e in f){const i=b(f[e]);if(!i)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+e+" attribute."),null;u.setAttribute(e,i)}for(const e in a){const i=a[e][0].length;if(i===0)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[e]=[];for(let n=0;n<i;++n){const r=[];for(let v=0;v<a[e].length;++v)r.push(a[e][v][n]);const c=b(r);if(!c)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+e+" morphAttribute."),null;u.morphAttributes[e].push(c)}}return u}function b(l){let o,s,h,d=-1,f=0;for(let m=0;m<l.length;++m){const e=l[m];if(o===void 0&&(o=e.array.constructor),o!==e.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(s===void 0&&(s=e.itemSize),s!==e.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(h===void 0&&(h=e.normalized),h!==e.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(d===-1&&(d=e.gpuType),d!==e.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;f+=e.count*s}const a=new o(f),t=new w(a,s,h);let u=0;for(let m=0;m<l.length;++m){const e=l[m];if(e.isInterleavedBufferAttribute){const i=u/s;for(let n=0,r=e.count;n<r;n++)for(let c=0;c<s;c++){const v=e.getComponent(n,c);t.setComponent(n+i,c,v)}}else a.set(e.array,u);u+=e.count*s}return d!==void 0&&(t.gpuType=d),t}class k extends M{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const o=new T;o.deleteAttribute("uv");const s=new y({side:E}),h=new y,d=new G(16777215,900,28,2);d.position.set(.418,16.199,.3),this.add(d);const f=new p(o,s);f.position.set(-.757,13.219,.717),f.scale.set(31.713,28.305,28.591),this.add(f);const a=new B(o,h,6),t=new U;t.position.set(-10.906,2.009,1.846),t.rotation.set(0,-.195,0),t.scale.set(2.328,7.905,4.651),t.updateMatrix(),a.setMatrixAt(0,t.matrix),t.position.set(-5.607,-.754,-.758),t.rotation.set(0,.994,0),t.scale.set(1.97,1.534,3.955),t.updateMatrix(),a.setMatrixAt(1,t.matrix),t.position.set(6.167,.857,7.803),t.rotation.set(0,.561,0),t.scale.set(3.927,6.285,3.687),t.updateMatrix(),a.setMatrixAt(2,t.matrix),t.position.set(-2.017,.018,6.124),t.rotation.set(0,.333,0),t.scale.set(2.002,4.566,2.064),t.updateMatrix(),a.setMatrixAt(3,t.matrix),t.position.set(2.291,-.756,-2.621),t.rotation.set(0,-.286,0),t.scale.set(1.546,1.552,1.496),t.updateMatrix(),a.setMatrixAt(4,t.matrix),t.position.set(-2.193,-.369,-5.547),t.rotation.set(0,.516,0),t.scale.set(3.875,3.487,2.986),t.updateMatrix(),a.setMatrixAt(5,t.matrix),this.add(a);const u=new p(o,g(50));u.position.set(-16.116,14.37,8.208),u.scale.set(.1,2.428,2.739),this.add(u);const m=new p(o,g(50));m.position.set(-16.109,18.021,-8.207),m.scale.set(.1,2.425,2.751),this.add(m);const e=new p(o,g(17));e.position.set(14.904,12.198,-1.832),e.scale.set(.15,4.265,6.331),this.add(e);const i=new p(o,g(43));i.position.set(-.462,8.89,14.52),i.scale.set(4.38,5.441,.088),this.add(i);const n=new p(o,g(20));n.position.set(3.235,11.486,-12.541),n.scale.set(2.5,2,.1),this.add(n);const r=new p(o,g(100));r.position.set(0,20,0),r.scale.set(1,.1,1),this.add(r)}dispose(){const o=new Set;this.traverse(s=>{s.isMesh&&(o.add(s.geometry),o.add(s.material))});for(const s of o)s.dispose()}}function g(l){return new R({color:0,emissive:16777215,emissiveIntensity:l})}export{H as C,D as L,k as R,z as m};
