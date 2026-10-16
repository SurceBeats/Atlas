import{U as xt,c as Qa,N as Mt,S as Ja,C as Qe,F as ma,V as Be,R as ja,e as Ze,w as Ye,a as ut,l as ai,b as _a,M as $t,W as ri,d as Tt,f as it,L as qt,H as yt,D as bt,B as _t,g as rn,h as xn,p as er,i as Mn,j as oi,k as tr,m as Lt,O as ga,n as $e,E as nr,o as pt,P as hn,A as ir,q as Pn,r as Ct,s as Kt,t as Zt,u as on,v as Wt,x as Sn,y as ar,z as rr,G as sn,I as mt,J as Wn,K as Yt,Q as si,T as or,X as sr,Y as jt,Z as lr,_ as cr,$ as fr,a0 as dr,a1 as ur,a2 as pr,a3 as hr,a4 as mr,a5 as _r,a6 as gr,a7 as vr,a8 as Sr,a9 as Er,aa as xr,ab as Mr,ac as Tr,ad as Ar,ae as Ln,af as dn,ag as Rr,ah as Vt,ai as br,aj as Cr,ak as Yn,al as Pr,am as qn,an as Lr,ao as Dr,ap as Ur,aq as wr,ar as Oe,as as Ir,at as Nr,au as Dt,av as mn,aw as _n,ax as yr,ay as Pt,az as nn,aA as It,aB as Fr,aC as va,aD as Sa,aE as Ea,aF as En,aG as xa,aH as Ma,aI as Ta,aJ as Aa,aK as Or,aL as Br,aM as Gr,aN as Hr,aO as Ra,aP as Vr,aQ as Wr,aR as kr,aS as Dn,aT as Un,aU as wn,aV as In,aW as li,aX as ci,aY as fi,aZ as di,a_ as ui,a$ as pi,b0 as hi,b1 as mi,b2 as _i,b3 as gi,b4 as vi,b5 as Si,b6 as Ei,b7 as xi,b8 as Mi,b9 as Ti,ba as Ai,bb as Ri,bc as bi,bd as Ci,be as Pi,bf as Li,bg as Di,bh as Ui,bi as wi,bj as Ii,bk as Ni,bl as yi,bm as Fi,bn as Oi,bo as Bi,bp as Gi,bq as zr,br as Xr,bs as Yr,bt as qr,bu as Kr,bv as $r,bw as Zr,bx as Qr,by as Hi,bz as Jr,bA as gn,bB as jr,bC as Vi,bD as Wi,bE as ki,bF as ba,bG as eo,bH as Tn,bI as to,bJ as no,bK as Ca,bL as Kn,bM as kn,bN as Pa,bO as La,bP as io,bQ as Da,bR as Ua,bS as wa,bT as Ia,bU as Na,bV as ya,bW as Fa,bX as zi,bY as Oa,bZ as Nn,b_ as yn,b$ as ao,c0 as ro,c1 as Xi,c2 as dt,c3 as oo,c4 as ln,c5 as Qt,c6 as so,c7 as lo,c8 as co,c9 as fo,ca as uo,cb as po,cc as ho,cd as mo,ce as _o,cf as go}from"./atlas_BUnHktt_WsVovWPX8BirI.js";function Ba(){let e=null,n=!1,t=null,i=null;function c(r,d){t(r,d),i=e.requestAnimationFrame(c)}return{start:function(){n!==!0&&t!==null&&(i=e.requestAnimationFrame(c),n=!0)},stop:function(){e.cancelAnimationFrame(i),n=!1},setAnimationLoop:function(r){t=r},setContext:function(r){e=r}}}function vo(e){const n=new WeakMap;function t(_,L){const b=_.array,B=_.usage,D=b.byteLength,p=e.createBuffer();e.bindBuffer(L,p),e.bufferData(L,b,B),_.onUploadCallback();let S;if(b instanceof Float32Array)S=e.FLOAT;else if(typeof Float16Array<"u"&&b instanceof Float16Array)S=e.HALF_FLOAT;else if(b instanceof Uint16Array)_.isFloat16BufferAttribute?S=e.HALF_FLOAT:S=e.UNSIGNED_SHORT;else if(b instanceof Int16Array)S=e.SHORT;else if(b instanceof Uint32Array)S=e.UNSIGNED_INT;else if(b instanceof Int32Array)S=e.INT;else if(b instanceof Int8Array)S=e.BYTE;else if(b instanceof Uint8Array)S=e.UNSIGNED_BYTE;else if(b instanceof Uint8ClampedArray)S=e.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+b);return{buffer:p,type:S,bytesPerElement:b.BYTES_PER_ELEMENT,version:_.version,size:D}}function i(_,L,b){const B=L.array,D=L.updateRanges;if(e.bindBuffer(b,_),D.length===0)e.bufferSubData(b,0,B);else{D.sort((S,M)=>S.start-M.start);let p=0;for(let S=1;S<D.length;S++){const M=D[p],y=D[S];y.start<=M.start+M.count+1?M.count=Math.max(M.count,y.start+y.count-M.start):(++p,D[p]=y)}D.length=p+1;for(let S=0,M=D.length;S<M;S++){const y=D[S];e.bufferSubData(b,y.start*B.BYTES_PER_ELEMENT,B,y.start,y.count)}L.clearUpdateRanges()}L.onUploadCallback()}function c(_){return _.isInterleavedBufferAttribute&&(_=_.data),n.get(_)}function r(_){_.isInterleavedBufferAttribute&&(_=_.data);const L=n.get(_);L&&(e.deleteBuffer(L.buffer),n.delete(_))}function d(_,L){if(_.isInterleavedBufferAttribute&&(_=_.data),_.isGLBufferAttribute){const B=n.get(_);(!B||B.version<_.version)&&n.set(_,{buffer:_.buffer,type:_.type,bytesPerElement:_.elementSize,version:_.version});return}const b=n.get(_);if(b===void 0)n.set(_,t(_,L));else if(b.version<_.version){if(b.size!==_.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(b.buffer,_,L),b.version=_.version}}return{get:c,remove:r,update:d}}var So=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Eo=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,xo=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Mo=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,To=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Ao=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ro=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,bo=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Co=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Po=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lo=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Do=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Uo=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,wo=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Io=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,No=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,yo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Fo=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Oo=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Bo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Go=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Ho=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Vo=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Wo=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ko=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,zo=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Xo=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Yo=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,qo=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ko=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,$o="gl_FragColor = linearToOutputTexel( gl_FragColor );",Zo=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Qo=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Jo=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,jo=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,es=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ts=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,ns=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,is=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,as=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,rs=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,os=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,ss=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ls=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,cs=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fs=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,ds=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,us=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ps=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,hs=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ms=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_s=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,gs=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
		vec3 iridescenceFresnelDielectric;
		vec3 iridescenceFresnelMetallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return v;
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = texture2D( dfgLUT, vec2( material.roughness, dotNV ) ).rg;
	vec2 dfgL = texture2D( dfgLUT, vec2( material.roughness, dotNL ) ).rg;
	vec3 FssEss_V = material.specularColorBlended * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColorBlended * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColorBlended + ( 1.0 - material.specularColorBlended ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnelDielectric, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceFresnelMetallic, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( geometryNormal, geometryViewDir, material.diffuseColor, material.specularF90, material.roughness, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,vs=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( material.iridescenceFresnelDielectric, material.iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Ss=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Es=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,xs=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ms=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ts=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,As=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Rs=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,bs=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Cs=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Ps=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ls=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Ds=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Us=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,ws=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Is=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ns=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,ys=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fs=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Os=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Bs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gs=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hs=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Vs=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ws=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ks=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zs=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Xs=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ys=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,qs=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Ks=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,$s=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Zs=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Qs=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Js=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,js=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,el=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,tl=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,nl=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,il=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,al=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,rl=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,ol=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,sl=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,ll=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,cl=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,fl=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,dl=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,ul=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,pl=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,hl=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ml=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,_l=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,gl=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const vl=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Sl=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,El=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,xl=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ml=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Tl=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Al=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Rl=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,bl=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Cl=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Pl=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ll=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dl=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ul=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,wl=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Il=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Nl=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,yl=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Fl=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Ol=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Bl=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Gl=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Hl=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Vl=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Wl=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,kl=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,zl=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Xl=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Yl=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,ql=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Kl=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$l=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Zl=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ql=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,De={alphahash_fragment:So,alphahash_pars_fragment:Eo,alphamap_fragment:xo,alphamap_pars_fragment:Mo,alphatest_fragment:To,alphatest_pars_fragment:Ao,aomap_fragment:Ro,aomap_pars_fragment:bo,batching_pars_vertex:Co,batching_vertex:Po,begin_vertex:Lo,beginnormal_vertex:Do,bsdfs:Uo,iridescence_fragment:wo,bumpmap_pars_fragment:Io,clipping_planes_fragment:No,clipping_planes_pars_fragment:yo,clipping_planes_pars_vertex:Fo,clipping_planes_vertex:Oo,color_fragment:Bo,color_pars_fragment:Go,color_pars_vertex:Ho,color_vertex:Vo,common:Wo,cube_uv_reflection_fragment:ko,defaultnormal_vertex:zo,displacementmap_pars_vertex:Xo,displacementmap_vertex:Yo,emissivemap_fragment:qo,emissivemap_pars_fragment:Ko,colorspace_fragment:$o,colorspace_pars_fragment:Zo,envmap_fragment:Qo,envmap_common_pars_fragment:Jo,envmap_pars_fragment:jo,envmap_pars_vertex:es,envmap_physical_pars_fragment:ds,envmap_vertex:ts,fog_vertex:ns,fog_pars_vertex:is,fog_fragment:as,fog_pars_fragment:rs,gradientmap_pars_fragment:os,lightmap_pars_fragment:ss,lights_lambert_fragment:ls,lights_lambert_pars_fragment:cs,lights_pars_begin:fs,lights_toon_fragment:us,lights_toon_pars_fragment:ps,lights_phong_fragment:hs,lights_phong_pars_fragment:ms,lights_physical_fragment:_s,lights_physical_pars_fragment:gs,lights_fragment_begin:vs,lights_fragment_maps:Ss,lights_fragment_end:Es,logdepthbuf_fragment:xs,logdepthbuf_pars_fragment:Ms,logdepthbuf_pars_vertex:Ts,logdepthbuf_vertex:As,map_fragment:Rs,map_pars_fragment:bs,map_particle_fragment:Cs,map_particle_pars_fragment:Ps,metalnessmap_fragment:Ls,metalnessmap_pars_fragment:Ds,morphinstance_vertex:Us,morphcolor_vertex:ws,morphnormal_vertex:Is,morphtarget_pars_vertex:Ns,morphtarget_vertex:ys,normal_fragment_begin:Fs,normal_fragment_maps:Os,normal_pars_fragment:Bs,normal_pars_vertex:Gs,normal_vertex:Hs,normalmap_pars_fragment:Vs,clearcoat_normal_fragment_begin:Ws,clearcoat_normal_fragment_maps:ks,clearcoat_pars_fragment:zs,iridescence_pars_fragment:Xs,opaque_fragment:Ys,packing:qs,premultiplied_alpha_fragment:Ks,project_vertex:$s,dithering_fragment:Zs,dithering_pars_fragment:Qs,roughnessmap_fragment:Js,roughnessmap_pars_fragment:js,shadowmap_pars_fragment:el,shadowmap_pars_vertex:tl,shadowmap_vertex:nl,shadowmask_pars_fragment:il,skinbase_vertex:al,skinning_pars_vertex:rl,skinning_vertex:ol,skinnormal_vertex:sl,specularmap_fragment:ll,specularmap_pars_fragment:cl,tonemapping_fragment:fl,tonemapping_pars_fragment:dl,transmission_fragment:ul,transmission_pars_fragment:pl,uv_pars_fragment:hl,uv_pars_vertex:ml,uv_vertex:_l,worldpos_vertex:gl,background_vert:vl,background_frag:Sl,backgroundCube_vert:El,backgroundCube_frag:xl,cube_vert:Ml,cube_frag:Tl,depth_vert:Al,depth_frag:Rl,distance_vert:bl,distance_frag:Cl,equirect_vert:Pl,equirect_frag:Ll,linedashed_vert:Dl,linedashed_frag:Ul,meshbasic_vert:wl,meshbasic_frag:Il,meshlambert_vert:Nl,meshlambert_frag:yl,meshmatcap_vert:Fl,meshmatcap_frag:Ol,meshnormal_vert:Bl,meshnormal_frag:Gl,meshphong_vert:Hl,meshphong_frag:Vl,meshphysical_vert:Wl,meshphysical_frag:kl,meshtoon_vert:zl,meshtoon_frag:Xl,points_vert:Yl,points_frag:ql,shadow_vert:Kl,shadow_frag:$l,sprite_vert:Zl,sprite_frag:Ql},re={common:{diffuse:{value:new Qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Oe}},envmap:{envMap:{value:null},envMapRotation:{value:new Oe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Oe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Oe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Oe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Oe},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Oe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Oe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Oe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Oe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0},uvTransform:{value:new Oe}},sprite:{diffuse:{value:new Qe(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Oe},alphaMap:{value:null},alphaMapTransform:{value:new Oe},alphaTest:{value:0}}},Et={basic:{uniforms:dt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.fog]),vertexShader:De.meshbasic_vert,fragmentShader:De.meshbasic_frag},lambert:{uniforms:dt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Qe(0)},envMapIntensity:{value:1}}]),vertexShader:De.meshlambert_vert,fragmentShader:De.meshlambert_frag},phong:{uniforms:dt([re.common,re.specularmap,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.fog,re.lights,{emissive:{value:new Qe(0)},specular:{value:new Qe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:De.meshphong_vert,fragmentShader:De.meshphong_frag},standard:{uniforms:dt([re.common,re.envmap,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.roughnessmap,re.metalnessmap,re.fog,re.lights,{emissive:{value:new Qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:De.meshphysical_vert,fragmentShader:De.meshphysical_frag},toon:{uniforms:dt([re.common,re.aomap,re.lightmap,re.emissivemap,re.bumpmap,re.normalmap,re.displacementmap,re.gradientmap,re.fog,re.lights,{emissive:{value:new Qe(0)}}]),vertexShader:De.meshtoon_vert,fragmentShader:De.meshtoon_frag},matcap:{uniforms:dt([re.common,re.bumpmap,re.normalmap,re.displacementmap,re.fog,{matcap:{value:null}}]),vertexShader:De.meshmatcap_vert,fragmentShader:De.meshmatcap_frag},points:{uniforms:dt([re.points,re.fog]),vertexShader:De.points_vert,fragmentShader:De.points_frag},dashed:{uniforms:dt([re.common,re.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:De.linedashed_vert,fragmentShader:De.linedashed_frag},depth:{uniforms:dt([re.common,re.displacementmap]),vertexShader:De.depth_vert,fragmentShader:De.depth_frag},normal:{uniforms:dt([re.common,re.bumpmap,re.normalmap,re.displacementmap,{opacity:{value:1}}]),vertexShader:De.meshnormal_vert,fragmentShader:De.meshnormal_frag},sprite:{uniforms:dt([re.sprite,re.fog]),vertexShader:De.sprite_vert,fragmentShader:De.sprite_frag},background:{uniforms:{uvTransform:{value:new Oe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:De.background_vert,fragmentShader:De.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Oe}},vertexShader:De.backgroundCube_vert,fragmentShader:De.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:De.cube_vert,fragmentShader:De.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:De.equirect_vert,fragmentShader:De.equirect_frag},distance:{uniforms:dt([re.common,re.displacementmap,{referencePosition:{value:new Be},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:De.distance_vert,fragmentShader:De.distance_frag},shadow:{uniforms:dt([re.lights,re.fog,{color:{value:new Qe(0)},opacity:{value:1}}]),vertexShader:De.shadow_vert,fragmentShader:De.shadow_frag}};Et.physical={uniforms:dt([Et.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Oe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Oe},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Oe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Oe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Oe},sheen:{value:0},sheenColor:{value:new Qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Oe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Oe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Oe},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Oe},attenuationDistance:{value:0},attenuationColor:{value:new Qe(0)},specularColor:{value:new Qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Oe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Oe},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Oe}}]),vertexShader:De.meshphysical_vert,fragmentShader:De.meshphysical_frag};const un={r:0,b:0,g:0},Bt=new Pa,Jl=new $t;function jl(e,n,t,i,c,r){const d=new Qe(0);let _=c===!0?0:1,L,b,B=null,D=0,p=null;function S(g){let T=g.isScene===!0?g.background:null;if(T&&T.isTexture){const E=g.backgroundBlurriness>0;T=n.get(T,E)}return T}function M(g){let T=!1;const E=S(g);E===null?l(d,_):E&&E.isColor&&(l(E,1),T=!0);const N=e.xr.getEnvironmentBlendMode();N==="additive"?t.buffers.color.setClear(0,0,0,1,r):N==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(e.autoClear||T)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function y(g,T){const E=S(T);E&&(E.isCubeTexture||E.mapping===Tn)?(b===void 0&&(b=new Lt(new Kn(1,1,1),new Dt({name:"BackgroundCubeMaterial",uniforms:kn(Et.backgroundCube.uniforms),vertexShader:Et.backgroundCube.vertexShader,fragmentShader:Et.backgroundCube.fragmentShader,side:_t,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),b.geometry.deleteAttribute("normal"),b.geometry.deleteAttribute("uv"),b.onBeforeRender=function(N,C,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(b.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(b)),Bt.copy(T.backgroundRotation),Bt.x*=-1,Bt.y*=-1,Bt.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Bt.y*=-1,Bt.z*=-1),b.material.uniforms.envMap.value=E,b.material.uniforms.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,b.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,b.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,b.material.uniforms.backgroundRotation.value.setFromMatrix4(Jl.makeRotationFromEuler(Bt)),b.material.toneMapped=it.getTransfer(E.colorSpace)!==$e,(B!==E||D!==E.version||p!==e.toneMapping)&&(b.material.needsUpdate=!0,B=E,D=E.version,p=e.toneMapping),b.layers.enableAll(),g.unshift(b,b.geometry,b.material,0,0,null)):E&&E.isTexture&&(L===void 0&&(L=new Lt(new Aa(2,2),new Dt({name:"BackgroundMaterial",uniforms:kn(Et.background.uniforms),vertexShader:Et.background.vertexShader,fragmentShader:Et.background.fragmentShader,side:rn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),L.geometry.deleteAttribute("normal"),Object.defineProperty(L.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(L)),L.material.uniforms.t2D.value=E,L.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,L.material.toneMapped=it.getTransfer(E.colorSpace)!==$e,E.matrixAutoUpdate===!0&&E.updateMatrix(),L.material.uniforms.uvTransform.value.copy(E.matrix),(B!==E||D!==E.version||p!==e.toneMapping)&&(L.material.needsUpdate=!0,B=E,D=E.version,p=e.toneMapping),L.layers.enableAll(),g.unshift(L,L.geometry,L.material,0,0,null))}function l(g,T){g.getRGB(un,Ca(e)),t.buffers.color.setClear(un.r,un.g,un.b,T,r)}function s(){b!==void 0&&(b.geometry.dispose(),b.material.dispose(),b=void 0),L!==void 0&&(L.geometry.dispose(),L.material.dispose(),L=void 0)}return{getClearColor:function(){return d},setClearColor:function(g,T=1){d.set(g),_=T,l(d,_)},getClearAlpha:function(){return _},setClearAlpha:function(g){_=g,l(d,_)},render:M,addToRenderList:y,dispose:s}}function ec(e,n){const t=e.getParameter(e.MAX_VERTEX_ATTRIBS),i={},c=p(null);let r=c,d=!1;function _(R,V,z,k,Y){let O=!1;const F=D(R,k,z,V);r!==F&&(r=F,b(r.object)),O=S(R,k,z,Y),O&&M(R,k,z,Y),Y!==null&&n.update(Y,e.ELEMENT_ARRAY_BUFFER),(O||d)&&(d=!1,E(R,V,z,k),Y!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,n.get(Y).buffer))}function L(){return e.createVertexArray()}function b(R){return e.bindVertexArray(R)}function B(R){return e.deleteVertexArray(R)}function D(R,V,z,k){const Y=k.wireframe===!0;let O=i[V.id];O===void 0&&(O={},i[V.id]=O);const F=R.isInstancedMesh===!0?R.id:0;let ie=O[F];ie===void 0&&(ie={},O[F]=ie);let ae=ie[z.id];ae===void 0&&(ae={},ie[z.id]=ae);let Me=ae[Y];return Me===void 0&&(Me=p(L()),ae[Y]=Me),Me}function p(R){const V=[],z=[],k=[];for(let Y=0;Y<t;Y++)V[Y]=0,z[Y]=0,k[Y]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:V,enabledAttributes:z,attributeDivisors:k,object:R,attributes:{},index:null}}function S(R,V,z,k){const Y=r.attributes,O=V.attributes;let F=0;const ie=z.getAttributes();for(const ae in ie)if(ie[ae].location>=0){const Ae=Y[ae];let he=O[ae];if(he===void 0&&(ae==="instanceMatrix"&&R.instanceMatrix&&(he=R.instanceMatrix),ae==="instanceColor"&&R.instanceColor&&(he=R.instanceColor)),Ae===void 0||Ae.attribute!==he||he&&Ae.data!==he.data)return!0;F++}return r.attributesNum!==F||r.index!==k}function M(R,V,z,k){const Y={},O=V.attributes;let F=0;const ie=z.getAttributes();for(const ae in ie)if(ie[ae].location>=0){let Ae=O[ae];Ae===void 0&&(ae==="instanceMatrix"&&R.instanceMatrix&&(Ae=R.instanceMatrix),ae==="instanceColor"&&R.instanceColor&&(Ae=R.instanceColor));const he={};he.attribute=Ae,Ae&&Ae.data&&(he.data=Ae.data),Y[ae]=he,F++}r.attributes=Y,r.attributesNum=F,r.index=k}function y(){const R=r.newAttributes;for(let V=0,z=R.length;V<z;V++)R[V]=0}function l(R){s(R,0)}function s(R,V){const z=r.newAttributes,k=r.enabledAttributes,Y=r.attributeDivisors;z[R]=1,k[R]===0&&(e.enableVertexAttribArray(R),k[R]=1),Y[R]!==V&&(e.vertexAttribDivisor(R,V),Y[R]=V)}function g(){const R=r.newAttributes,V=r.enabledAttributes;for(let z=0,k=V.length;z<k;z++)V[z]!==R[z]&&(e.disableVertexAttribArray(z),V[z]=0)}function T(R,V,z,k,Y,O,F){F===!0?e.vertexAttribIPointer(R,V,z,Y,O):e.vertexAttribPointer(R,V,z,k,Y,O)}function E(R,V,z,k){y();const Y=k.attributes,O=z.getAttributes(),F=V.defaultAttributeValues;for(const ie in O){const ae=O[ie];if(ae.location>=0){let Me=Y[ie];if(Me===void 0&&(ie==="instanceMatrix"&&R.instanceMatrix&&(Me=R.instanceMatrix),ie==="instanceColor"&&R.instanceColor&&(Me=R.instanceColor)),Me!==void 0){const Ae=Me.normalized,he=Me.itemSize,Ne=n.get(Me);if(Ne===void 0)continue;const Je=Ne.buffer,je=Ne.type,X=Ne.bytesPerElement,j=je===e.INT||je===e.UNSIGNED_INT||Me.gpuType===Ra;if(Me.isInterleavedBufferAttribute){const ne=Me.data,Le=ne.stride,Te=Me.offset;if(ne.isInstancedInterleavedBuffer){for(let be=0;be<ae.locationSize;be++)s(ae.location+be,ne.meshPerAttribute);R.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let be=0;be<ae.locationSize;be++)l(ae.location+be);e.bindBuffer(e.ARRAY_BUFFER,Je);for(let be=0;be<ae.locationSize;be++)T(ae.location+be,he/ae.locationSize,je,Ae,Le*X,(Te+he/ae.locationSize*be)*X,j)}else{if(Me.isInstancedBufferAttribute){for(let ne=0;ne<ae.locationSize;ne++)s(ae.location+ne,Me.meshPerAttribute);R.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=Me.meshPerAttribute*Me.count)}else for(let ne=0;ne<ae.locationSize;ne++)l(ae.location+ne);e.bindBuffer(e.ARRAY_BUFFER,Je);for(let ne=0;ne<ae.locationSize;ne++)T(ae.location+ne,he/ae.locationSize,je,Ae,he*X,he/ae.locationSize*ne*X,j)}}else if(F!==void 0){const Ae=F[ie];if(Ae!==void 0)switch(Ae.length){case 2:e.vertexAttrib2fv(ae.location,Ae);break;case 3:e.vertexAttrib3fv(ae.location,Ae);break;case 4:e.vertexAttrib4fv(ae.location,Ae);break;default:e.vertexAttrib1fv(ae.location,Ae)}}}}g()}function N(){h();for(const R in i){const V=i[R];for(const z in V){const k=V[z];for(const Y in k){const O=k[Y];for(const F in O)B(O[F].object),delete O[F];delete k[Y]}}delete i[R]}}function C(R){if(i[R.id]===void 0)return;const V=i[R.id];for(const z in V){const k=V[z];for(const Y in k){const O=k[Y];for(const F in O)B(O[F].object),delete O[F];delete k[Y]}}delete i[R.id]}function w(R){for(const V in i){const z=i[V];for(const k in z){const Y=z[k];if(Y[R.id]===void 0)continue;const O=Y[R.id];for(const F in O)B(O[F].object),delete O[F];delete Y[R.id]}}}function f(R){for(const V in i){const z=i[V],k=R.isInstancedMesh===!0?R.id:0,Y=z[k];if(Y!==void 0){for(const O in Y){const F=Y[O];for(const ie in F)B(F[ie].object),delete F[ie];delete Y[O]}delete z[k],Object.keys(z).length===0&&delete i[V]}}}function h(){$(),d=!0,r!==c&&(r=c,b(r.object))}function $(){c.geometry=null,c.program=null,c.wireframe=!1}return{setup:_,reset:h,resetDefaultState:$,dispose:N,releaseStatesOfGeometry:C,releaseStatesOfObject:f,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:l,disableUnusedAttributes:g}}function tc(e,n,t){let i;function c(b){i=b}function r(b,B){e.drawArrays(i,b,B),t.update(B,i,1)}function d(b,B,D){D!==0&&(e.drawArraysInstanced(i,b,B,D),t.update(B,i,D))}function _(b,B,D){if(D===0)return;n.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,b,0,B,0,D);let S=0;for(let M=0;M<D;M++)S+=B[M];t.update(S,i,1)}function L(b,B,D,p){if(D===0)return;const S=n.get("WEBGL_multi_draw");if(S===null)for(let M=0;M<b.length;M++)d(b[M],B[M],p[M]);else{S.multiDrawArraysInstancedWEBGL(i,b,0,B,0,p,0,D);let M=0;for(let y=0;y<D;y++)M+=B[y]*p[y];t.update(M,i,1)}}this.setMode=c,this.render=r,this.renderInstances=d,this.renderMultiDraw=_,this.renderMultiDrawInstances=L}function nc(e,n,t,i){let c;function r(){if(c!==void 0)return c;if(n.has("EXT_texture_filter_anisotropic")===!0){const w=n.get("EXT_texture_filter_anisotropic");c=e.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else c=0;return c}function d(w){return!(w!==Ct&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT))}function _(w){const f=w===yt&&(n.has("EXT_color_buffer_half_float")||n.has("EXT_color_buffer_float"));return!(w!==xt&&i.convert(w)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==It&&!f)}function L(w){if(w==="highp"){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let b=t.precision!==void 0?t.precision:"highp";const B=L(b);B!==b&&(Ye("WebGLRenderer:",b,"not supported, using",B,"instead."),b=B);const D=t.logarithmicDepthBuffer===!0,p=t.reversedDepthBuffer===!0&&n.has("EXT_clip_control"),S=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),M=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=e.getParameter(e.MAX_TEXTURE_SIZE),l=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),s=e.getParameter(e.MAX_VERTEX_ATTRIBS),g=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),T=e.getParameter(e.MAX_VARYING_VECTORS),E=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),N=e.getParameter(e.MAX_SAMPLES),C=e.getParameter(e.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:L,textureFormatReadable:d,textureTypeReadable:_,precision:b,logarithmicDepthBuffer:D,reversedDepthBuffer:p,maxTextures:S,maxVertexTextures:M,maxTextureSize:y,maxCubemapSize:l,maxAttributes:s,maxVertexUniforms:g,maxVaryings:T,maxFragmentUniforms:E,maxSamples:N,samples:C}}function ic(e){const n=this;let t=null,i=0,c=!1,r=!1;const d=new wr,_=new Oe,L={value:null,needsUpdate:!1};this.uniform=L,this.numPlanes=0,this.numIntersection=0,this.init=function(D,p){const S=D.length!==0||p||i!==0||c;return c=p,i=D.length,S},this.beginShadows=function(){r=!0,B(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(D,p){t=B(D,p,0)},this.setState=function(D,p,S){const M=D.clippingPlanes,y=D.clipIntersection,l=D.clipShadows,s=e.get(D);if(!c||M===null||M.length===0||r&&!l)r?B(null):b();else{const g=r?0:i,T=g*4;let E=s.clippingState||null;L.value=E,E=B(M,p,T,S);for(let N=0;N!==T;++N)E[N]=t[N];s.clippingState=E,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=g}};function b(){L.value!==t&&(L.value=t,L.needsUpdate=i>0),n.numPlanes=i,n.numIntersection=0}function B(D,p,S,M){const y=D!==null?D.length:0;let l=null;if(y!==0){if(l=L.value,M!==!0||l===null){const s=S+y*4,g=p.matrixWorldInverse;_.getNormalMatrix(g),(l===null||l.length<s)&&(l=new Float32Array(s));for(let T=0,E=S;T!==y;++T,E+=4)d.copy(D[T]).applyMatrix4(g,_),d.normal.toArray(l,E),l[E+3]=d.constant}L.value=l,L.needsUpdate=!0}return n.numPlanes=y,n.numIntersection=0,l}}const Nt=4,Yi=[.125,.215,.35,.446,.526,.582],Ht=20,ac=256,en=new ga,qi=new Qe;let Fn=null,On=0,Bn=0,Gn=!1;const rc=new Be;class Ki{constructor(n){this._renderer=n,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(n,t=0,i=.1,c=100,r={}){const{size:d=256,position:_=rc}=r;Fn=this._renderer.getRenderTarget(),On=this._renderer.getActiveCubeFace(),Bn=this._renderer.getActiveMipmapLevel(),Gn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(d);const L=this._allocateTargets();return L.depthBuffer=!0,this._sceneToCubeUV(n,i,c,L,_),t>0&&this._blur(L,0,0,t),this._applyPMREM(L),this._cleanup(L),L}fromEquirectangular(n,t=null){return this._fromTexture(n,t)}fromCubemap(n,t=null){return this._fromTexture(n,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Qi(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zi(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(n){this._lodMax=Math.floor(Math.log2(n)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let n=0;n<this._lodMeshes.length;n++)this._lodMeshes[n].geometry.dispose()}_cleanup(n){this._renderer.setRenderTarget(Fn,On,Bn),this._renderer.xr.enabled=Gn,n.scissorTest=!1,Xt(n,0,0,n.width,n.height)}_fromTexture(n,t){n.mapping===ln||n.mapping===Qt?this._setSize(n.image.length===0?16:n.image[0].width||n.image[0].image.width):this._setSize(n.image.width/4),Fn=this._renderer.getRenderTarget(),On=this._renderer.getActiveCubeFace(),Bn=this._renderer.getActiveMipmapLevel(),Gn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(n,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const n=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:mt,minFilter:mt,generateMipmaps:!1,type:yt,format:Ct,colorSpace:xn,depthBuffer:!1},c=$i(n,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==n||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=$i(n,t,i);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=oc(r)),this._blurMaterial=lc(r,n,t),this._ggxMaterial=sc(r,n,t)}return c}_compileMaterial(n){const t=new Lt(new Mn,n);this._renderer.compile(t,en)}_sceneToCubeUV(n,t,i,c,r){const L=new hn(90,1,t,i),b=[1,-1,1,1,1,1],B=[1,1,1,-1,-1,-1],D=this._renderer,p=D.autoClear,S=D.toneMapping;D.getClearColor(qi),D.toneMapping=Mt,D.autoClear=!1,D.state.buffers.depth.getReversed()&&(D.setRenderTarget(c),D.clearDepth(),D.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Lt(new Kn,new so({name:"PMREM.Background",side:_t,depthWrite:!1,depthTest:!1})));const y=this._backgroundBox,l=y.material;let s=!1;const g=n.background;g?g.isColor&&(l.color.copy(g),n.background=null,s=!0):(l.color.copy(qi),s=!0);for(let T=0;T<6;T++){const E=T%3;E===0?(L.up.set(0,b[T],0),L.position.set(r.x,r.y,r.z),L.lookAt(r.x+B[T],r.y,r.z)):E===1?(L.up.set(0,0,b[T]),L.position.set(r.x,r.y,r.z),L.lookAt(r.x,r.y+B[T],r.z)):(L.up.set(0,b[T],0),L.position.set(r.x,r.y,r.z),L.lookAt(r.x,r.y,r.z+B[T]));const N=this._cubeSize;Xt(c,E*N,T>2?N:0,N,N),D.setRenderTarget(c),s&&D.render(y,L),D.render(n,L)}D.toneMapping=S,D.autoClear=p,n.background=g}_textureToCubeUV(n,t){const i=this._renderer,c=n.mapping===ln||n.mapping===Qt;c?(this._cubemapMaterial===null&&(this._cubemapMaterial=Qi()),this._cubemapMaterial.uniforms.flipEnvMap.value=n.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zi());const r=c?this._cubemapMaterial:this._equirectMaterial,d=this._lodMeshes[0];d.material=r;const _=r.uniforms;_.envMap.value=n;const L=this._cubeSize;Xt(t,0,0,3*L,2*L),i.setRenderTarget(t),i.render(d,en)}_applyPMREM(n){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const c=this._lodMeshes.length;for(let r=1;r<c;r++)this._applyGGXFilter(n,r-1,r);t.autoClear=i}_applyGGXFilter(n,t,i){const c=this._renderer,r=this._pingPongRenderTarget,d=this._ggxMaterial,_=this._lodMeshes[i];_.material=d;const L=d.uniforms,b=i/(this._lodMeshes.length-1),B=t/(this._lodMeshes.length-1),D=Math.sqrt(b*b-B*B),p=0+b*1.25,S=D*p,{_lodMax:M}=this,y=this._sizeLods[i],l=3*y*(i>M-Nt?i-M+Nt:0),s=4*(this._cubeSize-y);L.envMap.value=n.texture,L.roughness.value=S,L.mipInt.value=M-t,Xt(r,l,s,3*y,2*y),c.setRenderTarget(r),c.render(_,en),L.envMap.value=r.texture,L.roughness.value=0,L.mipInt.value=M-i,Xt(n,l,s,3*y,2*y),c.setRenderTarget(n),c.render(_,en)}_blur(n,t,i,c,r){const d=this._pingPongRenderTarget;this._halfBlur(n,d,t,i,c,"latitudinal",r),this._halfBlur(d,n,i,i,c,"longitudinal",r)}_halfBlur(n,t,i,c,r,d,_){const L=this._renderer,b=this._blurMaterial;d!=="latitudinal"&&d!=="longitudinal"&&Ze("blur direction must be either latitudinal or longitudinal!");const B=3,D=this._lodMeshes[c];D.material=b;const p=b.uniforms,S=this._sizeLods[i]-1,M=isFinite(r)?Math.PI/(2*S):2*Math.PI/(2*Ht-1),y=r/M,l=isFinite(r)?1+Math.floor(B*y):Ht;l>Ht&&Ye(`sigmaRadians, ${r}, is too large and will clip, as it requested ${l} samples when the maximum is set to ${Ht}`);const s=[];let g=0;for(let w=0;w<Ht;++w){const f=w/y,h=Math.exp(-f*f/2);s.push(h),w===0?g+=h:w<l&&(g+=2*h)}for(let w=0;w<s.length;w++)s[w]=s[w]/g;p.envMap.value=n.texture,p.samples.value=l,p.weights.value=s,p.latitudinal.value=d==="latitudinal",_&&(p.poleAxis.value=_);const{_lodMax:T}=this;p.dTheta.value=M,p.mipInt.value=T-i;const E=this._sizeLods[c],N=3*E*(c>T-Nt?c-T+Nt:0),C=4*(this._cubeSize-E);Xt(t,N,C,3*E,2*E),L.setRenderTarget(t),L.render(D,en)}}function oc(e){const n=[],t=[],i=[];let c=e;const r=e-Nt+1+Yi.length;for(let d=0;d<r;d++){const _=Math.pow(2,c);n.push(_);let L=1/_;d>e-Nt?L=Yi[d-e+Nt-1]:d===0&&(L=0),t.push(L);const b=1/(_-2),B=-b,D=1+b,p=[B,B,D,B,D,D,B,B,D,D,B,D],S=6,M=6,y=3,l=2,s=1,g=new Float32Array(y*M*S),T=new Float32Array(l*M*S),E=new Float32Array(s*M*S);for(let C=0;C<S;C++){const w=C%3*2/3-1,f=C>2?0:-1,h=[w,f,0,w+2/3,f,0,w+2/3,f+1,0,w,f,0,w+2/3,f+1,0,w,f+1,0];g.set(h,y*M*C),T.set(p,l*M*C);const $=[C,C,C,C,C,C];E.set($,s*M*C)}const N=new Mn;N.setAttribute("position",new mn(g,y)),N.setAttribute("uv",new mn(T,l)),N.setAttribute("faceIndex",new mn(E,s)),i.push(new Lt(N,null)),c>Nt&&c--}return{lodMeshes:i,sizeLods:n,sigmas:t}}function $i(e,n,t){const i=new Tt(e,n,t);return i.texture.mapping=Tn,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Xt(e,n,t,i,c){e.viewport.set(n,t,i,c),e.scissor.set(n,t,i,c)}function sc(e,n,t){return new Dt({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:ac,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:An(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Pt,depthTest:!1,depthWrite:!1})}function lc(e,n,t){const i=new Float32Array(Ht),c=new Be(0,1,0);return new Dt({name:"SphericalGaussianBlur",defines:{n:Ht,CUBEUV_TEXEL_WIDTH:1/n,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:c}},vertexShader:An(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pt,depthTest:!1,depthWrite:!1})}function Zi(){return new Dt({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:An(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pt,depthTest:!1,depthWrite:!1})}function Qi(){return new Dt({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:An(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pt,depthTest:!1,depthWrite:!1})}function An(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}class Ga extends Tt{constructor(n=1,t={}){super(n,n,t),this.isWebGLCubeRenderTarget=!0;const i={width:n,height:n,depth:1},c=[i,i,i,i,i,i];this.texture=new La(c),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(n,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},c=new Kn(5,5,5),r=new Dt({name:"CubemapFromEquirect",uniforms:kn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:_t,blending:Pt});r.uniforms.tEquirect.value=t;const d=new Lt(c,r),_=t.minFilter;return t.minFilter===qt&&(t.minFilter=mt),new io(1,10,this).update(n,d),t.minFilter=_,d.geometry.dispose(),d.material.dispose(),this}clear(n,t=!0,i=!0,c=!0){const r=n.getRenderTarget();for(let d=0;d<6;d++)n.setRenderTarget(this,d),n.clear(t,i,c);n.setRenderTarget(r)}}function cc(e){let n=new WeakMap,t=new WeakMap,i=null;function c(p,S=!1){return p==null?null:S?d(p):r(p)}function r(p){if(p&&p.isTexture){const S=p.mapping;if(S===Nn||S===yn)if(n.has(p)){const M=n.get(p).texture;return _(M,p.mapping)}else{const M=p.image;if(M&&M.height>0){const y=new Ga(M.height);return y.fromEquirectangularTexture(e,p),n.set(p,y),p.addEventListener("dispose",b),_(y.texture,p.mapping)}else return null}}return p}function d(p){if(p&&p.isTexture){const S=p.mapping,M=S===Nn||S===yn,y=S===ln||S===Qt;if(M||y){let l=t.get(p);const s=l!==void 0?l.texture.pmremVersion:0;if(p.isRenderTargetTexture&&p.pmremVersion!==s)return i===null&&(i=new Ki(e)),l=M?i.fromEquirectangular(p,l):i.fromCubemap(p,l),l.texture.pmremVersion=p.pmremVersion,t.set(p,l),l.texture;if(l!==void 0)return l.texture;{const g=p.image;return M&&g&&g.height>0||y&&g&&L(g)?(i===null&&(i=new Ki(e)),l=M?i.fromEquirectangular(p):i.fromCubemap(p),l.texture.pmremVersion=p.pmremVersion,t.set(p,l),p.addEventListener("dispose",B),l.texture):null}}}return p}function _(p,S){return S===Nn?p.mapping=ln:S===yn&&(p.mapping=Qt),p}function L(p){let S=0;const M=6;for(let y=0;y<M;y++)p[y]!==void 0&&S++;return S===M}function b(p){const S=p.target;S.removeEventListener("dispose",b);const M=n.get(S);M!==void 0&&(n.delete(S),M.dispose())}function B(p){const S=p.target;S.removeEventListener("dispose",B);const M=t.get(S);M!==void 0&&(t.delete(S),M.dispose())}function D(){n=new WeakMap,t=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:c,dispose:D}}function fc(e){const n={};function t(i){if(n[i]!==void 0)return n[i];const c=e.getExtension(i);return n[i]=c,c}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const c=t(i);return c===null&&_a("WebGLRenderer: "+i+" extension not supported."),c}}}function dc(e,n,t,i){const c={},r=new WeakMap;function d(D){const p=D.target;p.index!==null&&n.remove(p.index);for(const M in p.attributes)n.remove(p.attributes[M]);p.removeEventListener("dispose",d),delete c[p.id];const S=r.get(p);S&&(n.remove(S),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function _(D,p){return c[p.id]===!0||(p.addEventListener("dispose",d),c[p.id]=!0,t.memory.geometries++),p}function L(D){const p=D.attributes;for(const S in p)n.update(p[S],e.ARRAY_BUFFER)}function b(D){const p=[],S=D.index,M=D.attributes.position;let y=0;if(M===void 0)return;if(S!==null){const g=S.array;y=S.version;for(let T=0,E=g.length;T<E;T+=3){const N=g[T+0],C=g[T+1],w=g[T+2];p.push(N,C,C,w,w,N)}}else{const g=M.array;y=M.version;for(let T=0,E=g.length/3-1;T<E;T+=3){const N=T+0,C=T+1,w=T+2;p.push(N,C,C,w,w,N)}}const l=new(M.count>=65535?ao:ro)(p,1);l.version=y;const s=r.get(D);s&&n.remove(s),r.set(D,l)}function B(D){const p=r.get(D);if(p){const S=D.index;S!==null&&p.version<S.version&&b(D)}else b(D);return r.get(D)}return{get:_,update:L,getWireframeAttribute:B}}function uc(e,n,t){let i;function c(p){i=p}let r,d;function _(p){r=p.type,d=p.bytesPerElement}function L(p,S){e.drawElements(i,S,r,p*d),t.update(S,i,1)}function b(p,S,M){M!==0&&(e.drawElementsInstanced(i,S,r,p*d,M),t.update(S,i,M))}function B(p,S,M){if(M===0)return;n.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,S,0,r,p,0,M);let l=0;for(let s=0;s<M;s++)l+=S[s];t.update(l,i,1)}function D(p,S,M,y){if(M===0)return;const l=n.get("WEBGL_multi_draw");if(l===null)for(let s=0;s<p.length;s++)b(p[s]/d,S[s],y[s]);else{l.multiDrawElementsInstancedWEBGL(i,S,0,r,p,0,y,0,M);let s=0;for(let g=0;g<M;g++)s+=S[g]*y[g];t.update(s,i,1)}}this.setMode=c,this.setIndex=_,this.render=L,this.renderInstances=b,this.renderMultiDraw=B,this.renderMultiDrawInstances=D}function pc(e){const n={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,d,_){switch(t.calls++,d){case e.TRIANGLES:t.triangles+=_*(r/3);break;case e.LINES:t.lines+=_*(r/2);break;case e.LINE_STRIP:t.lines+=_*(r-1);break;case e.LINE_LOOP:t.lines+=_*r;break;case e.POINTS:t.points+=_*r;break;default:Ze("WebGLInfo: Unknown draw mode:",d);break}}function c(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:n,render:t,programs:null,autoReset:!0,reset:c,update:i}}function hc(e,n,t){const i=new WeakMap,c=new ut;function r(d,_,L){const b=d.morphTargetInfluences,B=_.morphAttributes.position||_.morphAttributes.normal||_.morphAttributes.color,D=B!==void 0?B.length:0;let p=i.get(_);if(p===void 0||p.count!==D){let h=function(){w.dispose(),i.delete(_),_.removeEventListener("dispose",h)};p!==void 0&&p.texture.dispose();const S=_.morphAttributes.position!==void 0,M=_.morphAttributes.normal!==void 0,y=_.morphAttributes.color!==void 0,l=_.morphAttributes.position||[],s=_.morphAttributes.normal||[],g=_.morphAttributes.color||[];let T=0;S===!0&&(T=1),M===!0&&(T=2),y===!0&&(T=3);let E=_.attributes.position.count*T,N=1;E>n.maxTextureSize&&(N=Math.ceil(E/n.maxTextureSize),E=n.maxTextureSize);const C=new Float32Array(E*N*4*D),w=new ba(C,E,N,D);w.type=It,w.needsUpdate=!0;const f=T*4;for(let $=0;$<D;$++){const R=l[$],V=s[$],z=g[$],k=E*N*4*$;for(let Y=0;Y<R.count;Y++){const O=Y*f;S===!0&&(c.fromBufferAttribute(R,Y),C[k+O+0]=c.x,C[k+O+1]=c.y,C[k+O+2]=c.z,C[k+O+3]=0),M===!0&&(c.fromBufferAttribute(V,Y),C[k+O+4]=c.x,C[k+O+5]=c.y,C[k+O+6]=c.z,C[k+O+7]=0),y===!0&&(c.fromBufferAttribute(z,Y),C[k+O+8]=c.x,C[k+O+9]=c.y,C[k+O+10]=c.z,C[k+O+11]=z.itemSize===4?c.w:1)}}p={count:D,texture:w,size:new pt(E,N)},i.set(_,p),_.addEventListener("dispose",h)}if(d.isInstancedMesh===!0&&d.morphTexture!==null)L.getUniforms().setValue(e,"morphTexture",d.morphTexture,t);else{let S=0;for(let y=0;y<b.length;y++)S+=b[y];const M=_.morphTargetsRelative?1:1-S;L.getUniforms().setValue(e,"morphTargetBaseInfluence",M),L.getUniforms().setValue(e,"morphTargetInfluences",b)}L.getUniforms().setValue(e,"morphTargetsTexture",p.texture,t),L.getUniforms().setValue(e,"morphTargetsTextureSize",p.size)}return{update:r}}function mc(e,n,t,i,c){let r=new WeakMap;function d(b){const B=c.render.frame,D=b.geometry,p=n.get(b,D);if(r.get(p)!==B&&(n.update(p),r.set(p,B)),b.isInstancedMesh&&(b.hasEventListener("dispose",L)===!1&&b.addEventListener("dispose",L),r.get(b)!==B&&(t.update(b.instanceMatrix,e.ARRAY_BUFFER),b.instanceColor!==null&&t.update(b.instanceColor,e.ARRAY_BUFFER),r.set(b,B))),b.isSkinnedMesh){const S=b.skeleton;r.get(S)!==B&&(S.update(),r.set(S,B))}return p}function _(){r=new WeakMap}function L(b){const B=b.target;B.removeEventListener("dispose",L),i.releaseStatesOfObject(B),t.remove(B.instanceMatrix),B.instanceColor!==null&&t.remove(B.instanceColor)}return{update:d,dispose:_}}const _c={[Fa]:"LINEAR_TONE_MAPPING",[ya]:"REINHARD_TONE_MAPPING",[Na]:"CINEON_TONE_MAPPING",[Ia]:"ACES_FILMIC_TONE_MAPPING",[wa]:"AGX_TONE_MAPPING",[Ua]:"NEUTRAL_TONE_MAPPING",[Da]:"CUSTOM_TONE_MAPPING"};function gc(e,n,t,i,c){const r=new Tt(n,t,{type:e,depthBuffer:i,stencilBuffer:c}),d=new Tt(n,t,{type:yt,depthBuffer:!1,stencilBuffer:!1}),_=new Mn;_.setAttribute("position",new oi([-1,3,0,-1,-1,0,3,-1,0],3)),_.setAttribute("uv",new oi([0,2,0,0,2,0],2));const L=new tr({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),b=new Lt(_,L),B=new ga(-1,1,1,-1,0,1);let D=null,p=null,S=!1,M,y=null,l=[],s=!1;this.setSize=function(g,T){r.setSize(g,T),d.setSize(g,T);for(let E=0;E<l.length;E++){const N=l[E];N.setSize&&N.setSize(g,T)}},this.setEffects=function(g){l=g,s=l.length>0&&l[0].isRenderPass===!0;const T=r.width,E=r.height;for(let N=0;N<l.length;N++){const C=l[N];C.setSize&&C.setSize(T,E)}},this.begin=function(g,T){if(S||g.toneMapping===Mt&&l.length===0)return!1;if(y=T,T!==null){const E=T.width,N=T.height;(r.width!==E||r.height!==N)&&this.setSize(E,N)}return s===!1&&g.setRenderTarget(r),M=g.toneMapping,g.toneMapping=Mt,!0},this.hasRenderPass=function(){return s},this.end=function(g,T){g.toneMapping=M,S=!0;let E=r,N=d;for(let C=0;C<l.length;C++){const w=l[C];if(w.enabled!==!1&&(w.render(g,N,E,T),w.needsSwap!==!1)){const f=E;E=N,N=f}}if(D!==g.outputColorSpace||p!==g.toneMapping){D=g.outputColorSpace,p=g.toneMapping,L.defines={},it.getTransfer(D)===$e&&(L.defines.SRGB_TRANSFER="");const C=_c[p];C&&(L.defines[C]=""),L.needsUpdate=!0}L.uniforms.tDiffuse.value=E.texture,g.setRenderTarget(y),g.render(b,B),y=null,S=!1},this.isCompositing=function(){return S},this.dispose=function(){r.dispose(),d.dispose(),_.dispose(),L.dispose()}}const Ha=new ho,zn=new Sn(1,1),Va=new ba,Wa=new lo,ka=new La,Ji=[],ji=[],ea=new Float32Array(16),ta=new Float32Array(9),na=new Float32Array(4);function Jt(e,n,t){const i=e[0];if(i<=0||i>0)return e;const c=n*t;let r=Ji[c];if(r===void 0&&(r=new Float32Array(c),Ji[c]=r),n!==0){i.toArray(r,0);for(let d=1,_=0;d!==n;++d)_+=t,e[d].toArray(r,_)}return r}function rt(e,n){if(e.length!==n.length)return!1;for(let t=0,i=e.length;t<i;t++)if(e[t]!==n[t])return!1;return!0}function ot(e,n){for(let t=0,i=n.length;t<i;t++)e[t]=n[t]}function Rn(e,n){let t=ji[n];t===void 0&&(t=new Int32Array(n),ji[n]=t);for(let i=0;i!==n;++i)t[i]=e.allocateTextureUnit();return t}function vc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1f(this.addr,n),t[0]=n)}function Sc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2f(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(rt(t,n))return;e.uniform2fv(this.addr,n),ot(t,n)}}function Ec(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3f(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else if(n.r!==void 0)(t[0]!==n.r||t[1]!==n.g||t[2]!==n.b)&&(e.uniform3f(this.addr,n.r,n.g,n.b),t[0]=n.r,t[1]=n.g,t[2]=n.b);else{if(rt(t,n))return;e.uniform3fv(this.addr,n),ot(t,n)}}function xc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4f(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(rt(t,n))return;e.uniform4fv(this.addr,n),ot(t,n)}}function Mc(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(rt(t,n))return;e.uniformMatrix2fv(this.addr,!1,n),ot(t,n)}else{if(rt(t,i))return;na.set(i),e.uniformMatrix2fv(this.addr,!1,na),ot(t,i)}}function Tc(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(rt(t,n))return;e.uniformMatrix3fv(this.addr,!1,n),ot(t,n)}else{if(rt(t,i))return;ta.set(i),e.uniformMatrix3fv(this.addr,!1,ta),ot(t,i)}}function Ac(e,n){const t=this.cache,i=n.elements;if(i===void 0){if(rt(t,n))return;e.uniformMatrix4fv(this.addr,!1,n),ot(t,n)}else{if(rt(t,i))return;ea.set(i),e.uniformMatrix4fv(this.addr,!1,ea),ot(t,i)}}function Rc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1i(this.addr,n),t[0]=n)}function bc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2i(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(rt(t,n))return;e.uniform2iv(this.addr,n),ot(t,n)}}function Cc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3i(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(rt(t,n))return;e.uniform3iv(this.addr,n),ot(t,n)}}function Pc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4i(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(rt(t,n))return;e.uniform4iv(this.addr,n),ot(t,n)}}function Lc(e,n){const t=this.cache;t[0]!==n&&(e.uniform1ui(this.addr,n),t[0]=n)}function Dc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y)&&(e.uniform2ui(this.addr,n.x,n.y),t[0]=n.x,t[1]=n.y);else{if(rt(t,n))return;e.uniform2uiv(this.addr,n),ot(t,n)}}function Uc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z)&&(e.uniform3ui(this.addr,n.x,n.y,n.z),t[0]=n.x,t[1]=n.y,t[2]=n.z);else{if(rt(t,n))return;e.uniform3uiv(this.addr,n),ot(t,n)}}function wc(e,n){const t=this.cache;if(n.x!==void 0)(t[0]!==n.x||t[1]!==n.y||t[2]!==n.z||t[3]!==n.w)&&(e.uniform4ui(this.addr,n.x,n.y,n.z,n.w),t[0]=n.x,t[1]=n.y,t[2]=n.z,t[3]=n.w);else{if(rt(t,n))return;e.uniform4uiv(this.addr,n),ot(t,n)}}function Ic(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c);let r;this.type===e.SAMPLER_2D_SHADOW?(zn.compareFunction=t.isReversedDepthBuffer()?Yn:qn,r=zn):r=Ha,t.setTexture2D(n||r,c)}function Nc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c),t.setTexture3D(n||Wa,c)}function yc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c),t.setTextureCube(n||ka,c)}function Fc(e,n,t){const i=this.cache,c=t.allocateTextureUnit();i[0]!==c&&(e.uniform1i(this.addr,c),i[0]=c),t.setTexture2DArray(n||Va,c)}function Oc(e){switch(e){case 5126:return vc;case 35664:return Sc;case 35665:return Ec;case 35666:return xc;case 35674:return Mc;case 35675:return Tc;case 35676:return Ac;case 5124:case 35670:return Rc;case 35667:case 35671:return bc;case 35668:case 35672:return Cc;case 35669:case 35673:return Pc;case 5125:return Lc;case 36294:return Dc;case 36295:return Uc;case 36296:return wc;case 35678:case 36198:case 36298:case 36306:case 35682:return Ic;case 35679:case 36299:case 36307:return Nc;case 35680:case 36300:case 36308:case 36293:return yc;case 36289:case 36303:case 36311:case 36292:return Fc}}function Bc(e,n){e.uniform1fv(this.addr,n)}function Gc(e,n){const t=Jt(n,this.size,2);e.uniform2fv(this.addr,t)}function Hc(e,n){const t=Jt(n,this.size,3);e.uniform3fv(this.addr,t)}function Vc(e,n){const t=Jt(n,this.size,4);e.uniform4fv(this.addr,t)}function Wc(e,n){const t=Jt(n,this.size,4);e.uniformMatrix2fv(this.addr,!1,t)}function kc(e,n){const t=Jt(n,this.size,9);e.uniformMatrix3fv(this.addr,!1,t)}function zc(e,n){const t=Jt(n,this.size,16);e.uniformMatrix4fv(this.addr,!1,t)}function Xc(e,n){e.uniform1iv(this.addr,n)}function Yc(e,n){e.uniform2iv(this.addr,n)}function qc(e,n){e.uniform3iv(this.addr,n)}function Kc(e,n){e.uniform4iv(this.addr,n)}function $c(e,n){e.uniform1uiv(this.addr,n)}function Zc(e,n){e.uniform2uiv(this.addr,n)}function Qc(e,n){e.uniform3uiv(this.addr,n)}function Jc(e,n){e.uniform4uiv(this.addr,n)}function jc(e,n,t){const i=this.cache,c=n.length,r=Rn(t,c);rt(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));let d;this.type===e.SAMPLER_2D_SHADOW?d=zn:d=Ha;for(let _=0;_!==c;++_)t.setTexture2D(n[_]||d,r[_])}function ef(e,n,t){const i=this.cache,c=n.length,r=Rn(t,c);rt(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let d=0;d!==c;++d)t.setTexture3D(n[d]||Wa,r[d])}function tf(e,n,t){const i=this.cache,c=n.length,r=Rn(t,c);rt(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let d=0;d!==c;++d)t.setTextureCube(n[d]||ka,r[d])}function nf(e,n,t){const i=this.cache,c=n.length,r=Rn(t,c);rt(i,r)||(e.uniform1iv(this.addr,r),ot(i,r));for(let d=0;d!==c;++d)t.setTexture2DArray(n[d]||Va,r[d])}function af(e){switch(e){case 5126:return Bc;case 35664:return Gc;case 35665:return Hc;case 35666:return Vc;case 35674:return Wc;case 35675:return kc;case 35676:return zc;case 5124:case 35670:return Xc;case 35667:case 35671:return Yc;case 35668:case 35672:return qc;case 35669:case 35673:return Kc;case 5125:return $c;case 36294:return Zc;case 36295:return Qc;case 36296:return Jc;case 35678:case 36198:case 36298:case 36306:case 35682:return jc;case 35679:case 36299:case 36307:return ef;case 35680:case 36300:case 36308:case 36293:return tf;case 36289:case 36303:case 36311:case 36292:return nf}}class rf{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Oc(t.type)}}class of{constructor(n,t,i){this.id=n,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=af(t.type)}}class sf{constructor(n){this.id=n,this.seq=[],this.map={}}setValue(n,t,i){const c=this.seq;for(let r=0,d=c.length;r!==d;++r){const _=c[r];_.setValue(n,t[_.id],i)}}}const Hn=/(\w+)(\])?(\[|\.)?/g;function ia(e,n){e.seq.push(n),e.map[n.id]=n}function lf(e,n,t){const i=e.name,c=i.length;for(Hn.lastIndex=0;;){const r=Hn.exec(i),d=Hn.lastIndex;let _=r[1];const L=r[2]==="]",b=r[3];if(L&&(_=_|0),b===void 0||b==="["&&d+2===c){ia(t,b===void 0?new rf(_,e,n):new of(_,e,n));break}else{let D=t.map[_];D===void 0&&(D=new sf(_),ia(t,D)),t=D}}}class vn{constructor(n,t){this.seq=[],this.map={};const i=n.getProgramParameter(t,n.ACTIVE_UNIFORMS);for(let d=0;d<i;++d){const _=n.getActiveUniform(t,d),L=n.getUniformLocation(t,_.name);lf(_,L,this)}const c=[],r=[];for(const d of this.seq)d.type===n.SAMPLER_2D_SHADOW||d.type===n.SAMPLER_CUBE_SHADOW||d.type===n.SAMPLER_2D_ARRAY_SHADOW?c.push(d):r.push(d);c.length>0&&(this.seq=c.concat(r))}setValue(n,t,i,c){const r=this.map[t];r!==void 0&&r.setValue(n,i,c)}setOptional(n,t,i){const c=t[i];c!==void 0&&this.setValue(n,i,c)}static upload(n,t,i,c){for(let r=0,d=t.length;r!==d;++r){const _=t[r],L=i[_.id];L.needsUpdate!==!1&&_.setValue(n,L.value,c)}}static seqWithValue(n,t){const i=[];for(let c=0,r=n.length;c!==r;++c){const d=n[c];d.id in t&&i.push(d)}return i}}function aa(e,n,t){const i=e.createShader(n);return e.shaderSource(i,t),e.compileShader(i),i}const cf=37297;let ff=0;function df(e,n){const t=e.split(`
`),i=[],c=Math.max(n-6,0),r=Math.min(n+6,t.length);for(let d=c;d<r;d++){const _=d+1;i.push(`${_===n?">":" "} ${_}: ${t[d]}`)}return i.join(`
`)}const ra=new Oe;function uf(e){it._getMatrix(ra,it.workingColorSpace,e);const n=`mat3( ${ra.elements.map(t=>t.toFixed(4))} )`;switch(it.getTransfer(e)){case Oa:return[n,"LinearTransferOETF"];case $e:return[n,"sRGBTransferOETF"];default:return Ye("WebGLProgram: Unsupported color space: ",e),[n,"LinearTransferOETF"]}}function oa(e,n,t){const i=e.getShaderParameter(n,e.COMPILE_STATUS),r=(e.getShaderInfoLog(n)||"").trim();if(i&&r==="")return"";const d=/ERROR: 0:(\d+)/.exec(r);if(d){const _=parseInt(d[1]);return t.toUpperCase()+`

`+r+`

`+df(e.getShaderSource(n),_)}else return r}function pf(e,n){const t=uf(n);return[`vec4 ${e}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}const hf={[Fa]:"Linear",[ya]:"Reinhard",[Na]:"Cineon",[Ia]:"ACESFilmic",[wa]:"AgX",[Ua]:"Neutral",[Da]:"Custom"};function mf(e,n){const t=hf[n];return t===void 0?(Ye("WebGLProgram: Unsupported toneMapping:",n),"vec3 "+e+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+e+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const pn=new Be;function _f(){it.getLuminanceCoefficients(pn);const e=pn.x.toFixed(4),n=pn.y.toFixed(4),t=pn.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${e}, ${n}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function gf(e){return[e.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",e.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(an).join(`
`)}function vf(e){const n=[];for(const t in e){const i=e[t];i!==!1&&n.push("#define "+t+" "+i)}return n.join(`
`)}function Sf(e,n){const t={},i=e.getProgramParameter(n,e.ACTIVE_ATTRIBUTES);for(let c=0;c<i;c++){const r=e.getActiveAttrib(n,c),d=r.name;let _=1;r.type===e.FLOAT_MAT2&&(_=2),r.type===e.FLOAT_MAT3&&(_=3),r.type===e.FLOAT_MAT4&&(_=4),t[d]={type:r.type,location:e.getAttribLocation(n,d),locationSize:_}}return t}function an(e){return e!==""}function sa(e,n){const t=n.numSpotLightShadows+n.numSpotLightMaps-n.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,n.numDirLights).replace(/NUM_SPOT_LIGHTS/g,n.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,n.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,n.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,n.numPointLights).replace(/NUM_HEMI_LIGHTS/g,n.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,n.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,n.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,n.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,n.numPointLightShadows)}function la(e,n){return e.replace(/NUM_CLIPPING_PLANES/g,n.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,n.numClippingPlanes-n.numClipIntersection)}const Ef=/^[ \t]*#include +<([\w\d./]+)>/gm;function Xn(e){return e.replace(Ef,Mf)}const xf=new Map;function Mf(e,n){let t=De[n];if(t===void 0){const i=xf.get(n);if(i!==void 0)t=De[i],Ye('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',n,i);else throw new Error("Can not resolve #include <"+n+">")}return Xn(t)}const Tf=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ca(e){return e.replace(Tf,Af)}function Af(e,n,t,i){let c="";for(let r=parseInt(n);r<parseInt(t);r++)c+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return c}function fa(e){let n=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision==="highp"?n+=`
#define HIGH_PRECISION`:e.precision==="mediump"?n+=`
#define MEDIUM_PRECISION`:e.precision==="lowp"&&(n+=`
#define LOW_PRECISION`),n}const Rf={[_n]:"SHADOWMAP_TYPE_PCF",[nn]:"SHADOWMAP_TYPE_VSM"};function bf(e){return Rf[e.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const Cf={[ln]:"ENVMAP_TYPE_CUBE",[Qt]:"ENVMAP_TYPE_CUBE",[Tn]:"ENVMAP_TYPE_CUBE_UV"};function Pf(e){return e.envMap===!1?"ENVMAP_TYPE_CUBE":Cf[e.envMapMode]||"ENVMAP_TYPE_CUBE"}const Lf={[Qt]:"ENVMAP_MODE_REFRACTION"};function Df(e){return e.envMap===!1?"ENVMAP_MODE_REFLECTION":Lf[e.envMapMode]||"ENVMAP_MODE_REFLECTION"}const Uf={[po]:"ENVMAP_BLENDING_MULTIPLY",[uo]:"ENVMAP_BLENDING_MIX",[fo]:"ENVMAP_BLENDING_ADD"};function wf(e){return e.envMap===!1?"ENVMAP_BLENDING_NONE":Uf[e.combine]||"ENVMAP_BLENDING_NONE"}function If(e){const n=e.envMapCubeUVHeight;if(n===null)return null;const t=Math.log2(n)-2,i=1/n;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Nf(e,n,t,i){const c=e.getContext(),r=t.defines;let d=t.vertexShader,_=t.fragmentShader;const L=bf(t),b=Pf(t),B=Df(t),D=wf(t),p=If(t),S=gf(t),M=vf(r),y=c.createProgram();let l,s,g=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(l=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(an).join(`
`),l.length>0&&(l+=`
`),s=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M].filter(an).join(`
`),s.length>0&&(s+=`
`)):(l=[fa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+B:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+L:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(an).join(`
`),s=[fa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,M,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+b:"",t.envMap?"#define "+B:"",t.envMap?"#define "+D:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+L:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Mt?"#define TONE_MAPPING":"",t.toneMapping!==Mt?De.tonemapping_pars_fragment:"",t.toneMapping!==Mt?mf("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",De.colorspace_pars_fragment,pf("linearToOutputTexel",t.outputColorSpace),_f(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(an).join(`
`)),d=Xn(d),d=sa(d,t),d=la(d,t),_=Xn(_),_=sa(_,t),_=la(_,t),d=ca(d),_=ca(_),t.isRawShaderMaterial!==!0&&(g=`#version 300 es
`,l=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+l,s=["#define varying in",t.glslVersion===Xi?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Xi?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+s);const T=g+l+d,E=g+s+_,N=aa(c,c.VERTEX_SHADER,T),C=aa(c,c.FRAGMENT_SHADER,E);c.attachShader(y,N),c.attachShader(y,C),t.index0AttributeName!==void 0?c.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&c.bindAttribLocation(y,0,"position"),c.linkProgram(y);function w(R){if(e.debug.checkShaderErrors){const V=c.getProgramInfoLog(y)||"",z=c.getShaderInfoLog(N)||"",k=c.getShaderInfoLog(C)||"",Y=V.trim(),O=z.trim(),F=k.trim();let ie=!0,ae=!0;if(c.getProgramParameter(y,c.LINK_STATUS)===!1)if(ie=!1,typeof e.debug.onShaderError=="function")e.debug.onShaderError(c,y,N,C);else{const Me=oa(c,N,"vertex"),Ae=oa(c,C,"fragment");Ze("THREE.WebGLProgram: Shader Error "+c.getError()+" - VALIDATE_STATUS "+c.getProgramParameter(y,c.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+Y+`
`+Me+`
`+Ae)}else Y!==""?Ye("WebGLProgram: Program Info Log:",Y):(O===""||F==="")&&(ae=!1);ae&&(R.diagnostics={runnable:ie,programLog:Y,vertexShader:{log:O,prefix:l},fragmentShader:{log:F,prefix:s}})}c.deleteShader(N),c.deleteShader(C),f=new vn(c,y),h=Sf(c,y)}let f;this.getUniforms=function(){return f===void 0&&w(this),f};let h;this.getAttributes=function(){return h===void 0&&w(this),h};let $=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return $===!1&&($=c.getProgramParameter(y,cf)),$},this.destroy=function(){i.releaseStatesOfProgram(this),c.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=ff++,this.cacheKey=n,this.usedTimes=1,this.program=y,this.vertexShader=N,this.fragmentShader=C,this}let yf=0;class Ff{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(n){const t=n.vertexShader,i=n.fragmentShader,c=this._getShaderStage(t),r=this._getShaderStage(i),d=this._getShaderCacheForMaterial(n);return d.has(c)===!1&&(d.add(c),c.usedTimes++),d.has(r)===!1&&(d.add(r),r.usedTimes++),this}remove(n){const t=this.materialCache.get(n);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(n),this}getVertexShaderID(n){return this._getShaderStage(n.vertexShader).id}getFragmentShaderID(n){return this._getShaderStage(n.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(n){const t=this.materialCache;let i=t.get(n);return i===void 0&&(i=new Set,t.set(n,i)),i}_getShaderStage(n){const t=this.shaderCache;let i=t.get(n);return i===void 0&&(i=new Of(n),t.set(n,i)),i}}class Of{constructor(n){this.id=yf++,this.code=n,this.usedTimes=0}}function Bf(e,n,t,i,c,r){const d=new oo,_=new Ff,L=new Set,b=[],B=new Map,D=i.logarithmicDepthBuffer;let p=i.precision;const S={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(f){return L.add(f),f===0?"uv":`uv${f}`}function y(f,h,$,R,V){const z=R.fog,k=V.geometry,Y=f.isMeshStandardMaterial||f.isMeshLambertMaterial||f.isMeshPhongMaterial?R.environment:null,O=f.isMeshStandardMaterial||f.isMeshLambertMaterial&&!f.envMap||f.isMeshPhongMaterial&&!f.envMap,F=n.get(f.envMap||Y,O),ie=F&&F.mapping===Tn?F.image.height:null,ae=S[f.type];f.precision!==null&&(p=i.getMaxPrecision(f.precision),p!==f.precision&&Ye("WebGLProgram.getParameters:",f.precision,"not supported, using",p,"instead."));const Me=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Ae=Me!==void 0?Me.length:0;let he=0;k.morphAttributes.position!==void 0&&(he=1),k.morphAttributes.normal!==void 0&&(he=2),k.morphAttributes.color!==void 0&&(he=3);let Ne,Je,je,X;if(ae){const Ve=Et[ae];Ne=Ve.vertexShader,Je=Ve.fragmentShader}else Ne=f.vertexShader,Je=f.fragmentShader,_.update(f),je=_.getVertexShaderID(f),X=_.getFragmentShaderID(f);const j=e.getRenderTarget(),ne=e.state.buffers.depth.getReversed(),Le=V.isInstancedMesh===!0,Te=V.isBatchedMesh===!0,be=!!f.map,st=!!f.matcap,ye=!!F,He=!!f.aoMap,ze=!!f.lightMap,Ue=!!f.bumpMap,tt=!!f.normalMap,m=!!f.displacementMap,at=!!f.emissiveMap,Ge=!!f.metalnessMap,qe=!!f.roughnessMap,ge=f.anisotropy>0,u=f.clearcoat>0,a=f.dispersion>0,x=f.iridescence>0,W=f.sheen>0,q=f.transmission>0,H=ge&&!!f.anisotropyMap,de=u&&!!f.clearcoatMap,ee=u&&!!f.clearcoatNormalMap,xe=u&&!!f.clearcoatRoughnessMap,Re=x&&!!f.iridescenceMap,K=x&&!!f.iridescenceThicknessMap,Q=W&&!!f.sheenColorMap,ue=W&&!!f.sheenRoughnessMap,me=!!f.specularMap,le=!!f.specularColorMap,we=!!f.specularIntensityMap,v=q&&!!f.transmissionMap,te=q&&!!f.thicknessMap,J=!!f.gradientMap,fe=!!f.alphaMap,Z=f.alphaTest>0,G=!!f.alphaHash,pe=!!f.extensions;let Ce=Mt;f.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ce=e.toneMapping);const Ke={shaderID:ae,shaderType:f.type,shaderName:f.name,vertexShader:Ne,fragmentShader:Je,defines:f.defines,customVertexShaderID:je,customFragmentShaderID:X,isRawShaderMaterial:f.isRawShaderMaterial===!0,glslVersion:f.glslVersion,precision:p,batching:Te,batchingColor:Te&&V._colorsTexture!==null,instancing:Le,instancingColor:Le&&V.instanceColor!==null,instancingMorph:Le&&V.morphTexture!==null,outputColorSpace:j===null?e.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:xn,alphaToCoverage:!!f.alphaToCoverage,map:be,matcap:st,envMap:ye,envMapMode:ye&&F.mapping,envMapCubeUVHeight:ie,aoMap:He,lightMap:ze,bumpMap:Ue,normalMap:tt,displacementMap:m,emissiveMap:at,normalMapObjectSpace:tt&&f.normalMapType===no,normalMapTangentSpace:tt&&f.normalMapType===to,metalnessMap:Ge,roughnessMap:qe,anisotropy:ge,anisotropyMap:H,clearcoat:u,clearcoatMap:de,clearcoatNormalMap:ee,clearcoatRoughnessMap:xe,dispersion:a,iridescence:x,iridescenceMap:Re,iridescenceThicknessMap:K,sheen:W,sheenColorMap:Q,sheenRoughnessMap:ue,specularMap:me,specularColorMap:le,specularIntensityMap:we,transmission:q,transmissionMap:v,thicknessMap:te,gradientMap:J,opaque:f.transparent===!1&&f.blending===gn&&f.alphaToCoverage===!1,alphaMap:fe,alphaTest:Z,alphaHash:G,combine:f.combine,mapUv:be&&M(f.map.channel),aoMapUv:He&&M(f.aoMap.channel),lightMapUv:ze&&M(f.lightMap.channel),bumpMapUv:Ue&&M(f.bumpMap.channel),normalMapUv:tt&&M(f.normalMap.channel),displacementMapUv:m&&M(f.displacementMap.channel),emissiveMapUv:at&&M(f.emissiveMap.channel),metalnessMapUv:Ge&&M(f.metalnessMap.channel),roughnessMapUv:qe&&M(f.roughnessMap.channel),anisotropyMapUv:H&&M(f.anisotropyMap.channel),clearcoatMapUv:de&&M(f.clearcoatMap.channel),clearcoatNormalMapUv:ee&&M(f.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&M(f.clearcoatRoughnessMap.channel),iridescenceMapUv:Re&&M(f.iridescenceMap.channel),iridescenceThicknessMapUv:K&&M(f.iridescenceThicknessMap.channel),sheenColorMapUv:Q&&M(f.sheenColorMap.channel),sheenRoughnessMapUv:ue&&M(f.sheenRoughnessMap.channel),specularMapUv:me&&M(f.specularMap.channel),specularColorMapUv:le&&M(f.specularColorMap.channel),specularIntensityMapUv:we&&M(f.specularIntensityMap.channel),transmissionMapUv:v&&M(f.transmissionMap.channel),thicknessMapUv:te&&M(f.thicknessMap.channel),alphaMapUv:fe&&M(f.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(tt||ge),vertexColors:f.vertexColors,vertexAlphas:f.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!k.attributes.uv&&(be||fe),fog:!!z,useFog:f.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:f.wireframe===!1&&(f.flatShading===!0||k.attributes.normal===void 0&&tt===!1&&(f.isMeshLambertMaterial||f.isMeshPhongMaterial||f.isMeshStandardMaterial||f.isMeshPhysicalMaterial)),sizeAttenuation:f.sizeAttenuation===!0,logarithmicDepthBuffer:D,reversedDepthBuffer:ne,skinning:V.isSkinnedMesh===!0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:Ae,morphTextureStride:he,numDirLights:h.directional.length,numPointLights:h.point.length,numSpotLights:h.spot.length,numSpotLightMaps:h.spotLightMap.length,numRectAreaLights:h.rectArea.length,numHemiLights:h.hemi.length,numDirLightShadows:h.directionalShadowMap.length,numPointLightShadows:h.pointShadowMap.length,numSpotLightShadows:h.spotShadowMap.length,numSpotLightShadowsWithMaps:h.numSpotLightShadowsWithMaps,numLightProbes:h.numLightProbes,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:f.dithering,shadowMapEnabled:e.shadowMap.enabled&&$.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ce,decodeVideoTexture:be&&f.map.isVideoTexture===!0&&it.getTransfer(f.map.colorSpace)===$e,decodeVideoTextureEmissive:at&&f.emissiveMap.isVideoTexture===!0&&it.getTransfer(f.emissiveMap.colorSpace)===$e,premultipliedAlpha:f.premultipliedAlpha,doubleSided:f.side===bt,flipSided:f.side===_t,useDepthPacking:f.depthPacking>=0,depthPacking:f.depthPacking||0,index0AttributeName:f.index0AttributeName,extensionClipCullDistance:pe&&f.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(pe&&f.extensions.multiDraw===!0||Te)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:f.customProgramCacheKey()};return Ke.vertexUv1s=L.has(1),Ke.vertexUv2s=L.has(2),Ke.vertexUv3s=L.has(3),L.clear(),Ke}function l(f){const h=[];if(f.shaderID?h.push(f.shaderID):(h.push(f.customVertexShaderID),h.push(f.customFragmentShaderID)),f.defines!==void 0)for(const $ in f.defines)h.push($),h.push(f.defines[$]);return f.isRawShaderMaterial===!1&&(s(h,f),g(h,f),h.push(e.outputColorSpace)),h.push(f.customProgramCacheKey),h.join()}function s(f,h){f.push(h.precision),f.push(h.outputColorSpace),f.push(h.envMapMode),f.push(h.envMapCubeUVHeight),f.push(h.mapUv),f.push(h.alphaMapUv),f.push(h.lightMapUv),f.push(h.aoMapUv),f.push(h.bumpMapUv),f.push(h.normalMapUv),f.push(h.displacementMapUv),f.push(h.emissiveMapUv),f.push(h.metalnessMapUv),f.push(h.roughnessMapUv),f.push(h.anisotropyMapUv),f.push(h.clearcoatMapUv),f.push(h.clearcoatNormalMapUv),f.push(h.clearcoatRoughnessMapUv),f.push(h.iridescenceMapUv),f.push(h.iridescenceThicknessMapUv),f.push(h.sheenColorMapUv),f.push(h.sheenRoughnessMapUv),f.push(h.specularMapUv),f.push(h.specularColorMapUv),f.push(h.specularIntensityMapUv),f.push(h.transmissionMapUv),f.push(h.thicknessMapUv),f.push(h.combine),f.push(h.fogExp2),f.push(h.sizeAttenuation),f.push(h.morphTargetsCount),f.push(h.morphAttributeCount),f.push(h.numDirLights),f.push(h.numPointLights),f.push(h.numSpotLights),f.push(h.numSpotLightMaps),f.push(h.numHemiLights),f.push(h.numRectAreaLights),f.push(h.numDirLightShadows),f.push(h.numPointLightShadows),f.push(h.numSpotLightShadows),f.push(h.numSpotLightShadowsWithMaps),f.push(h.numLightProbes),f.push(h.shadowMapType),f.push(h.toneMapping),f.push(h.numClippingPlanes),f.push(h.numClipIntersection),f.push(h.depthPacking)}function g(f,h){d.disableAll(),h.instancing&&d.enable(0),h.instancingColor&&d.enable(1),h.instancingMorph&&d.enable(2),h.matcap&&d.enable(3),h.envMap&&d.enable(4),h.normalMapObjectSpace&&d.enable(5),h.normalMapTangentSpace&&d.enable(6),h.clearcoat&&d.enable(7),h.iridescence&&d.enable(8),h.alphaTest&&d.enable(9),h.vertexColors&&d.enable(10),h.vertexAlphas&&d.enable(11),h.vertexUv1s&&d.enable(12),h.vertexUv2s&&d.enable(13),h.vertexUv3s&&d.enable(14),h.vertexTangents&&d.enable(15),h.anisotropy&&d.enable(16),h.alphaHash&&d.enable(17),h.batching&&d.enable(18),h.dispersion&&d.enable(19),h.batchingColor&&d.enable(20),h.gradientMap&&d.enable(21),f.push(d.mask),d.disableAll(),h.fog&&d.enable(0),h.useFog&&d.enable(1),h.flatShading&&d.enable(2),h.logarithmicDepthBuffer&&d.enable(3),h.reversedDepthBuffer&&d.enable(4),h.skinning&&d.enable(5),h.morphTargets&&d.enable(6),h.morphNormals&&d.enable(7),h.morphColors&&d.enable(8),h.premultipliedAlpha&&d.enable(9),h.shadowMapEnabled&&d.enable(10),h.doubleSided&&d.enable(11),h.flipSided&&d.enable(12),h.useDepthPacking&&d.enable(13),h.dithering&&d.enable(14),h.transmission&&d.enable(15),h.sheen&&d.enable(16),h.opaque&&d.enable(17),h.pointsUvs&&d.enable(18),h.decodeVideoTexture&&d.enable(19),h.decodeVideoTextureEmissive&&d.enable(20),h.alphaToCoverage&&d.enable(21),f.push(d.mask)}function T(f){const h=S[f.type];let $;if(h){const R=Et[h];$=eo.clone(R.uniforms)}else $=f.uniforms;return $}function E(f,h){let $=B.get(h);return $!==void 0?++$.usedTimes:($=new Nf(e,h,f,c),b.push($),B.set(h,$)),$}function N(f){if(--f.usedTimes===0){const h=b.indexOf(f);b[h]=b[b.length-1],b.pop(),B.delete(f.cacheKey),f.destroy()}}function C(f){_.remove(f)}function w(){_.dispose()}return{getParameters:y,getProgramCacheKey:l,getUniforms:T,acquireProgram:E,releaseProgram:N,releaseShaderCache:C,programs:b,dispose:w}}function Gf(){let e=new WeakMap;function n(d){return e.has(d)}function t(d){let _=e.get(d);return _===void 0&&(_={},e.set(d,_)),_}function i(d){e.delete(d)}function c(d,_,L){e.get(d)[_]=L}function r(){e=new WeakMap}return{has:n,get:t,remove:i,update:c,dispose:r}}function Hf(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.material.id!==n.material.id?e.material.id-n.material.id:e.materialVariant!==n.materialVariant?e.materialVariant-n.materialVariant:e.z!==n.z?e.z-n.z:e.id-n.id}function da(e,n){return e.groupOrder!==n.groupOrder?e.groupOrder-n.groupOrder:e.renderOrder!==n.renderOrder?e.renderOrder-n.renderOrder:e.z!==n.z?n.z-e.z:e.id-n.id}function ua(){const e=[];let n=0;const t=[],i=[],c=[];function r(){n=0,t.length=0,i.length=0,c.length=0}function d(p){let S=0;return p.isInstancedMesh&&(S+=2),p.isSkinnedMesh&&(S+=1),S}function _(p,S,M,y,l,s){let g=e[n];return g===void 0?(g={id:p.id,object:p,geometry:S,material:M,materialVariant:d(p),groupOrder:y,renderOrder:p.renderOrder,z:l,group:s},e[n]=g):(g.id=p.id,g.object=p,g.geometry=S,g.material=M,g.materialVariant=d(p),g.groupOrder=y,g.renderOrder=p.renderOrder,g.z=l,g.group=s),n++,g}function L(p,S,M,y,l,s){const g=_(p,S,M,y,l,s);M.transmission>0?i.push(g):M.transparent===!0?c.push(g):t.push(g)}function b(p,S,M,y,l,s){const g=_(p,S,M,y,l,s);M.transmission>0?i.unshift(g):M.transparent===!0?c.unshift(g):t.unshift(g)}function B(p,S){t.length>1&&t.sort(p||Hf),i.length>1&&i.sort(S||da),c.length>1&&c.sort(S||da)}function D(){for(let p=n,S=e.length;p<S;p++){const M=e[p];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:t,transmissive:i,transparent:c,init:r,push:L,unshift:b,finish:D,sort:B}}function Vf(){let e=new WeakMap;function n(i,c){const r=e.get(i);let d;return r===void 0?(d=new ua,e.set(i,[d])):c>=r.length?(d=new ua,r.push(d)):d=r[c],d}function t(){e=new WeakMap}return{get:n,dispose:t}}function Wf(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={direction:new Be,color:new Qe};break;case"SpotLight":t={position:new Be,direction:new Be,color:new Qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new Be,color:new Qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new Be,skyColor:new Qe,groundColor:new Qe};break;case"RectAreaLight":t={color:new Qe,position:new Be,halfWidth:new Be,halfHeight:new Be};break}return e[n.id]=t,t}}}function kf(){const e={};return{get:function(n){if(e[n.id]!==void 0)return e[n.id];let t;switch(n.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return e[n.id]=t,t}}}let zf=0;function Xf(e,n){return(n.castShadow?2:0)-(e.castShadow?2:0)+(n.map?1:0)-(e.map?1:0)}function Yf(e){const n=new Wf,t=kf(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let b=0;b<9;b++)i.probe.push(new Be);const c=new Be,r=new $t,d=new $t;function _(b){let B=0,D=0,p=0;for(let h=0;h<9;h++)i.probe[h].set(0,0,0);let S=0,M=0,y=0,l=0,s=0,g=0,T=0,E=0,N=0,C=0,w=0;b.sort(Xf);for(let h=0,$=b.length;h<$;h++){const R=b[h],V=R.color,z=R.intensity,k=R.distance;let Y=null;if(R.shadow&&R.shadow.map&&(R.shadow.map.texture.format===sn?Y=R.shadow.map.texture:Y=R.shadow.map.depthTexture||R.shadow.map.texture),R.isAmbientLight)B+=V.r*z,D+=V.g*z,p+=V.b*z;else if(R.isLightProbe){for(let O=0;O<9;O++)i.probe[O].addScaledVector(R.sh.coefficients[O],z);w++}else if(R.isDirectionalLight){const O=n.get(R);if(O.color.copy(R.color).multiplyScalar(R.intensity),R.castShadow){const F=R.shadow,ie=t.get(R);ie.shadowIntensity=F.intensity,ie.shadowBias=F.bias,ie.shadowNormalBias=F.normalBias,ie.shadowRadius=F.radius,ie.shadowMapSize=F.mapSize,i.directionalShadow[S]=ie,i.directionalShadowMap[S]=Y,i.directionalShadowMatrix[S]=R.shadow.matrix,g++}i.directional[S]=O,S++}else if(R.isSpotLight){const O=n.get(R);O.position.setFromMatrixPosition(R.matrixWorld),O.color.copy(V).multiplyScalar(z),O.distance=k,O.coneCos=Math.cos(R.angle),O.penumbraCos=Math.cos(R.angle*(1-R.penumbra)),O.decay=R.decay,i.spot[y]=O;const F=R.shadow;if(R.map&&(i.spotLightMap[N]=R.map,N++,F.updateMatrices(R),R.castShadow&&C++),i.spotLightMatrix[y]=F.matrix,R.castShadow){const ie=t.get(R);ie.shadowIntensity=F.intensity,ie.shadowBias=F.bias,ie.shadowNormalBias=F.normalBias,ie.shadowRadius=F.radius,ie.shadowMapSize=F.mapSize,i.spotShadow[y]=ie,i.spotShadowMap[y]=Y,E++}y++}else if(R.isRectAreaLight){const O=n.get(R);O.color.copy(V).multiplyScalar(z),O.halfWidth.set(R.width*.5,0,0),O.halfHeight.set(0,R.height*.5,0),i.rectArea[l]=O,l++}else if(R.isPointLight){const O=n.get(R);if(O.color.copy(R.color).multiplyScalar(R.intensity),O.distance=R.distance,O.decay=R.decay,R.castShadow){const F=R.shadow,ie=t.get(R);ie.shadowIntensity=F.intensity,ie.shadowBias=F.bias,ie.shadowNormalBias=F.normalBias,ie.shadowRadius=F.radius,ie.shadowMapSize=F.mapSize,ie.shadowCameraNear=F.camera.near,ie.shadowCameraFar=F.camera.far,i.pointShadow[M]=ie,i.pointShadowMap[M]=Y,i.pointShadowMatrix[M]=R.shadow.matrix,T++}i.point[M]=O,M++}else if(R.isHemisphereLight){const O=n.get(R);O.skyColor.copy(R.color).multiplyScalar(z),O.groundColor.copy(R.groundColor).multiplyScalar(z),i.hemi[s]=O,s++}}l>0&&(e.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=re.LTC_FLOAT_1,i.rectAreaLTC2=re.LTC_FLOAT_2):(i.rectAreaLTC1=re.LTC_HALF_1,i.rectAreaLTC2=re.LTC_HALF_2)),i.ambient[0]=B,i.ambient[1]=D,i.ambient[2]=p;const f=i.hash;(f.directionalLength!==S||f.pointLength!==M||f.spotLength!==y||f.rectAreaLength!==l||f.hemiLength!==s||f.numDirectionalShadows!==g||f.numPointShadows!==T||f.numSpotShadows!==E||f.numSpotMaps!==N||f.numLightProbes!==w)&&(i.directional.length=S,i.spot.length=y,i.rectArea.length=l,i.point.length=M,i.hemi.length=s,i.directionalShadow.length=g,i.directionalShadowMap.length=g,i.pointShadow.length=T,i.pointShadowMap.length=T,i.spotShadow.length=E,i.spotShadowMap.length=E,i.directionalShadowMatrix.length=g,i.pointShadowMatrix.length=T,i.spotLightMatrix.length=E+N-C,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=w,f.directionalLength=S,f.pointLength=M,f.spotLength=y,f.rectAreaLength=l,f.hemiLength=s,f.numDirectionalShadows=g,f.numPointShadows=T,f.numSpotShadows=E,f.numSpotMaps=N,f.numLightProbes=w,i.version=zf++)}function L(b,B){let D=0,p=0,S=0,M=0,y=0;const l=B.matrixWorldInverse;for(let s=0,g=b.length;s<g;s++){const T=b[s];if(T.isDirectionalLight){const E=i.directional[D];E.direction.setFromMatrixPosition(T.matrixWorld),c.setFromMatrixPosition(T.target.matrixWorld),E.direction.sub(c),E.direction.transformDirection(l),D++}else if(T.isSpotLight){const E=i.spot[S];E.position.setFromMatrixPosition(T.matrixWorld),E.position.applyMatrix4(l),E.direction.setFromMatrixPosition(T.matrixWorld),c.setFromMatrixPosition(T.target.matrixWorld),E.direction.sub(c),E.direction.transformDirection(l),S++}else if(T.isRectAreaLight){const E=i.rectArea[M];E.position.setFromMatrixPosition(T.matrixWorld),E.position.applyMatrix4(l),d.identity(),r.copy(T.matrixWorld),r.premultiply(l),d.extractRotation(r),E.halfWidth.set(T.width*.5,0,0),E.halfHeight.set(0,T.height*.5,0),E.halfWidth.applyMatrix4(d),E.halfHeight.applyMatrix4(d),M++}else if(T.isPointLight){const E=i.point[p];E.position.setFromMatrixPosition(T.matrixWorld),E.position.applyMatrix4(l),p++}else if(T.isHemisphereLight){const E=i.hemi[y];E.direction.setFromMatrixPosition(T.matrixWorld),E.direction.transformDirection(l),y++}}}return{setup:_,setupView:L,state:i}}function pa(e){const n=new Yf(e),t=[],i=[];function c(B){b.camera=B,t.length=0,i.length=0}function r(B){t.push(B)}function d(B){i.push(B)}function _(){n.setup(t)}function L(B){n.setupView(t,B)}const b={lightsArray:t,shadowsArray:i,camera:null,lights:n,transmissionRenderTarget:{}};return{init:c,state:b,setupLights:_,setupLightsView:L,pushLight:r,pushShadow:d}}function qf(e){let n=new WeakMap;function t(c,r=0){const d=n.get(c);let _;return d===void 0?(_=new pa(e),n.set(c,[_])):r>=d.length?(_=new pa(e),d.push(_)):_=d[r],_}function i(){n=new WeakMap}return{get:t,dispose:i}}const Kf=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,$f=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,Zf=[new Be(1,0,0),new Be(-1,0,0),new Be(0,1,0),new Be(0,-1,0),new Be(0,0,1),new Be(0,0,-1)],Qf=[new Be(0,-1,0),new Be(0,-1,0),new Be(0,0,1),new Be(0,0,-1),new Be(0,-1,0),new Be(0,-1,0)],ha=new $t,tn=new Be,Vn=new Be;function Jf(e,n,t){let i=new ma;const c=new pt,r=new pt,d=new ut,_=new Ir,L=new Nr,b={},B=t.maxTextureSize,D={[rn]:_t,[_t]:rn,[bt]:bt},p=new Dt({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:Kf,fragmentShader:$f}),S=p.clone();S.defines.HORIZONTAL_PASS=1;const M=new Mn;M.setAttribute("position",new mn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new Lt(M,p),l=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=_n;let s=this.type;this.render=function(C,w,f){if(l.enabled===!1||l.autoUpdate===!1&&l.needsUpdate===!1||C.length===0)return;this.type===yr&&(Ye("WebGLShadowMap: PCFSoftShadowMap has been deprecated. Using PCFShadowMap instead."),this.type=_n);const h=e.getRenderTarget(),$=e.getActiveCubeFace(),R=e.getActiveMipmapLevel(),V=e.state;V.setBlending(Pt),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);const z=s!==this.type;z&&w.traverse(function(k){k.material&&(Array.isArray(k.material)?k.material.forEach(Y=>Y.needsUpdate=!0):k.material.needsUpdate=!0)});for(let k=0,Y=C.length;k<Y;k++){const O=C[k],F=O.shadow;if(F===void 0){Ye("WebGLShadowMap:",O,"has no shadow.");continue}if(F.autoUpdate===!1&&F.needsUpdate===!1)continue;c.copy(F.mapSize);const ie=F.getFrameExtents();c.multiply(ie),r.copy(F.mapSize),(c.x>B||c.y>B)&&(c.x>B&&(r.x=Math.floor(B/ie.x),c.x=r.x*ie.x,F.mapSize.x=r.x),c.y>B&&(r.y=Math.floor(B/ie.y),c.y=r.y*ie.y,F.mapSize.y=r.y));const ae=e.state.buffers.depth.getReversed();if(F.camera._reversedDepth=ae,F.map===null||z===!0){if(F.map!==null&&(F.map.depthTexture!==null&&(F.map.depthTexture.dispose(),F.map.depthTexture=null),F.map.dispose()),this.type===nn){if(O.isPointLight){Ye("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}F.map=new Tt(c.x,c.y,{format:sn,type:yt,minFilter:mt,magFilter:mt,generateMipmaps:!1}),F.map.texture.name=O.name+".shadowMap",F.map.depthTexture=new Sn(c.x,c.y,It),F.map.depthTexture.name=O.name+".shadowMapDepth",F.map.depthTexture.format=Zt,F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Vt,F.map.depthTexture.magFilter=Vt}else O.isPointLight?(F.map=new Ga(c.x),F.map.depthTexture=new Fr(c.x,Wt)):(F.map=new Tt(c.x,c.y),F.map.depthTexture=new Sn(c.x,c.y,Wt)),F.map.depthTexture.name=O.name+".shadowMap",F.map.depthTexture.format=Zt,this.type===_n?(F.map.depthTexture.compareFunction=ae?Yn:qn,F.map.depthTexture.minFilter=mt,F.map.depthTexture.magFilter=mt):(F.map.depthTexture.compareFunction=null,F.map.depthTexture.minFilter=Vt,F.map.depthTexture.magFilter=Vt);F.camera.updateProjectionMatrix()}const Me=F.map.isWebGLCubeRenderTarget?6:1;for(let Ae=0;Ae<Me;Ae++){if(F.map.isWebGLCubeRenderTarget)e.setRenderTarget(F.map,Ae),e.clear();else{Ae===0&&(e.setRenderTarget(F.map),e.clear());const he=F.getViewport(Ae);d.set(r.x*he.x,r.y*he.y,r.x*he.z,r.y*he.w),V.viewport(d)}if(O.isPointLight){const he=F.camera,Ne=F.matrix,Je=O.distance||he.far;Je!==he.far&&(he.far=Je,he.updateProjectionMatrix()),tn.setFromMatrixPosition(O.matrixWorld),he.position.copy(tn),Vn.copy(he.position),Vn.add(Zf[Ae]),he.up.copy(Qf[Ae]),he.lookAt(Vn),he.updateMatrixWorld(),Ne.makeTranslation(-tn.x,-tn.y,-tn.z),ha.multiplyMatrices(he.projectionMatrix,he.matrixWorldInverse),F._frustum.setFromProjectionMatrix(ha,he.coordinateSystem,he.reversedDepth)}else F.updateMatrices(O);i=F.getFrustum(),E(w,f,F.camera,O,this.type)}F.isPointLightShadow!==!0&&this.type===nn&&g(F,f),F.needsUpdate=!1}s=this.type,l.needsUpdate=!1,e.setRenderTarget(h,$,R)};function g(C,w){const f=n.update(y);p.defines.VSM_SAMPLES!==C.blurSamples&&(p.defines.VSM_SAMPLES=C.blurSamples,S.defines.VSM_SAMPLES=C.blurSamples,p.needsUpdate=!0,S.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new Tt(c.x,c.y,{format:sn,type:yt})),p.uniforms.shadow_pass.value=C.map.depthTexture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,e.setRenderTarget(C.mapPass),e.clear(),e.renderBufferDirect(w,null,f,p,y,null),S.uniforms.shadow_pass.value=C.mapPass.texture,S.uniforms.resolution.value=C.mapSize,S.uniforms.radius.value=C.radius,e.setRenderTarget(C.map),e.clear(),e.renderBufferDirect(w,null,f,S,y,null)}function T(C,w,f,h){let $=null;const R=f.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(R!==void 0)$=R;else if($=f.isPointLight===!0?L:_,e.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const V=$.uuid,z=w.uuid;let k=b[V];k===void 0&&(k={},b[V]=k);let Y=k[z];Y===void 0&&(Y=$.clone(),k[z]=Y,w.addEventListener("dispose",N)),$=Y}if($.visible=w.visible,$.wireframe=w.wireframe,h===nn?$.side=w.shadowSide!==null?w.shadowSide:w.side:$.side=w.shadowSide!==null?w.shadowSide:D[w.side],$.alphaMap=w.alphaMap,$.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,$.map=w.map,$.clipShadows=w.clipShadows,$.clippingPlanes=w.clippingPlanes,$.clipIntersection=w.clipIntersection,$.displacementMap=w.displacementMap,$.displacementScale=w.displacementScale,$.displacementBias=w.displacementBias,$.wireframeLinewidth=w.wireframeLinewidth,$.linewidth=w.linewidth,f.isPointLight===!0&&$.isMeshDistanceMaterial===!0){const V=e.properties.get($);V.light=f}return $}function E(C,w,f,h,$){if(C.visible===!1)return;if(C.layers.test(w.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&$===nn)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(f.matrixWorldInverse,C.matrixWorld);const z=n.update(C),k=C.material;if(Array.isArray(k)){const Y=z.groups;for(let O=0,F=Y.length;O<F;O++){const ie=Y[O],ae=k[ie.materialIndex];if(ae&&ae.visible){const Me=T(C,ae,h,$);C.onBeforeShadow(e,C,w,f,z,Me,ie),e.renderBufferDirect(f,null,z,Me,C,ie),C.onAfterShadow(e,C,w,f,z,Me,ie)}}}else if(k.visible){const Y=T(C,k,h,$);C.onBeforeShadow(e,C,w,f,z,Y,null),e.renderBufferDirect(f,null,z,Y,C,null),C.onAfterShadow(e,C,w,f,z,Y,null)}}const V=C.children;for(let z=0,k=V.length;z<k;z++)E(V[z],w,f,h,$)}function N(C){C.target.removeEventListener("dispose",N);for(const f in b){const h=b[f],$=C.target.uuid;$ in h&&(h[$].dispose(),delete h[$])}}}function jf(e,n){function t(){let v=!1;const te=new ut;let J=null;const fe=new ut(0,0,0,0);return{setMask:function(Z){J!==Z&&!v&&(e.colorMask(Z,Z,Z,Z),J=Z)},setLocked:function(Z){v=Z},setClear:function(Z,G,pe,Ce,Ke){Ke===!0&&(Z*=Ce,G*=Ce,pe*=Ce),te.set(Z,G,pe,Ce),fe.equals(te)===!1&&(e.clearColor(Z,G,pe,Ce),fe.copy(te))},reset:function(){v=!1,J=null,fe.set(-1,0,0,0)}}}function i(){let v=!1,te=!1,J=null,fe=null,Z=null;return{setReversed:function(G){if(te!==G){const pe=n.get("EXT_clip_control");G?pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.ZERO_TO_ONE_EXT):pe.clipControlEXT(pe.LOWER_LEFT_EXT,pe.NEGATIVE_ONE_TO_ONE_EXT),te=G;const Ce=Z;Z=null,this.setClear(Ce)}},getReversed:function(){return te},setTest:function(G){G?j(e.DEPTH_TEST):ne(e.DEPTH_TEST)},setMask:function(G){J!==G&&!v&&(e.depthMask(G),J=G)},setFunc:function(G){if(te&&(G=mo[G]),fe!==G){switch(G){case Zr:e.depthFunc(e.NEVER);break;case $r:e.depthFunc(e.ALWAYS);break;case Kr:e.depthFunc(e.LESS);break;case si:e.depthFunc(e.LEQUAL);break;case qr:e.depthFunc(e.EQUAL);break;case Yr:e.depthFunc(e.GEQUAL);break;case Xr:e.depthFunc(e.GREATER);break;case zr:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}fe=G}},setLocked:function(G){v=G},setClear:function(G){Z!==G&&(Z=G,te&&(G=1-G),e.clearDepth(G))},reset:function(){v=!1,J=null,fe=null,Z=null,te=!1}}}function c(){let v=!1,te=null,J=null,fe=null,Z=null,G=null,pe=null,Ce=null,Ke=null;return{setTest:function(Ve){v||(Ve?j(e.STENCIL_TEST):ne(e.STENCIL_TEST))},setMask:function(Ve){te!==Ve&&!v&&(e.stencilMask(Ve),te=Ve)},setFunc:function(Ve,At,Rt){(J!==Ve||fe!==At||Z!==Rt)&&(e.stencilFunc(Ve,At,Rt),J=Ve,fe=At,Z=Rt)},setOp:function(Ve,At,Rt){(G!==Ve||pe!==At||Ce!==Rt)&&(e.stencilOp(Ve,At,Rt),G=Ve,pe=At,Ce=Rt)},setLocked:function(Ve){v=Ve},setClear:function(Ve){Ke!==Ve&&(e.clearStencil(Ve),Ke=Ve)},reset:function(){v=!1,te=null,J=null,fe=null,Z=null,G=null,pe=null,Ce=null,Ke=null}}}const r=new t,d=new i,_=new c,L=new WeakMap,b=new WeakMap;let B={},D={},p=new WeakMap,S=[],M=null,y=!1,l=null,s=null,g=null,T=null,E=null,N=null,C=null,w=new Qe(0,0,0),f=0,h=!1,$=null,R=null,V=null,z=null,k=null;const Y=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let O=!1,F=0;const ie=e.getParameter(e.VERSION);ie.indexOf("WebGL")!==-1?(F=parseFloat(/^WebGL (\d)/.exec(ie)[1]),O=F>=1):ie.indexOf("OpenGL ES")!==-1&&(F=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),O=F>=2);let ae=null,Me={};const Ae=e.getParameter(e.SCISSOR_BOX),he=e.getParameter(e.VIEWPORT),Ne=new ut().fromArray(Ae),Je=new ut().fromArray(he);function je(v,te,J,fe){const Z=new Uint8Array(4),G=e.createTexture();e.bindTexture(v,G),e.texParameteri(v,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(v,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let pe=0;pe<J;pe++)v===e.TEXTURE_3D||v===e.TEXTURE_2D_ARRAY?e.texImage3D(te,0,e.RGBA,1,1,fe,0,e.RGBA,e.UNSIGNED_BYTE,Z):e.texImage2D(te+pe,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,Z);return G}const X={};X[e.TEXTURE_2D]=je(e.TEXTURE_2D,e.TEXTURE_2D,1),X[e.TEXTURE_CUBE_MAP]=je(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[e.TEXTURE_2D_ARRAY]=je(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),X[e.TEXTURE_3D]=je(e.TEXTURE_3D,e.TEXTURE_3D,1,1),r.setClear(0,0,0,1),d.setClear(1),_.setClear(0),j(e.DEPTH_TEST),d.setFunc(si),Ue(!1),tt(Hi),j(e.CULL_FACE),He(Pt);function j(v){B[v]!==!0&&(e.enable(v),B[v]=!0)}function ne(v){B[v]!==!1&&(e.disable(v),B[v]=!1)}function Le(v,te){return D[v]!==te?(e.bindFramebuffer(v,te),D[v]=te,v===e.DRAW_FRAMEBUFFER&&(D[e.FRAMEBUFFER]=te),v===e.FRAMEBUFFER&&(D[e.DRAW_FRAMEBUFFER]=te),!0):!1}function Te(v,te){let J=S,fe=!1;if(v){J=p.get(te),J===void 0&&(J=[],p.set(te,J));const Z=v.textures;if(J.length!==Z.length||J[0]!==e.COLOR_ATTACHMENT0){for(let G=0,pe=Z.length;G<pe;G++)J[G]=e.COLOR_ATTACHMENT0+G;J.length=Z.length,fe=!0}}else J[0]!==e.BACK&&(J[0]=e.BACK,fe=!0);fe&&e.drawBuffers(J)}function be(v){return M!==v?(e.useProgram(v),M=v,!0):!1}const st={[jt]:e.FUNC_ADD,[sr]:e.FUNC_SUBTRACT,[or]:e.FUNC_REVERSE_SUBTRACT};st[_o]=e.MIN,st[go]=e.MAX;const ye={[Mr]:e.ZERO,[xr]:e.ONE,[Er]:e.SRC_COLOR,[Sr]:e.SRC_ALPHA,[vr]:e.SRC_ALPHA_SATURATE,[gr]:e.DST_COLOR,[_r]:e.DST_ALPHA,[mr]:e.ONE_MINUS_SRC_COLOR,[hr]:e.ONE_MINUS_SRC_ALPHA,[pr]:e.ONE_MINUS_DST_COLOR,[ur]:e.ONE_MINUS_DST_ALPHA,[dr]:e.CONSTANT_COLOR,[fr]:e.ONE_MINUS_CONSTANT_COLOR,[cr]:e.CONSTANT_ALPHA,[lr]:e.ONE_MINUS_CONSTANT_ALPHA};function He(v,te,J,fe,Z,G,pe,Ce,Ke,Ve){if(v===Pt){y===!0&&(ne(e.BLEND),y=!1);return}if(y===!1&&(j(e.BLEND),y=!0),v!==jr){if(v!==l||Ve!==h){if((s!==jt||E!==jt)&&(e.blendEquation(e.FUNC_ADD),s=jt,E=jt),Ve)switch(v){case gn:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ki:e.blendFunc(e.ONE,e.ONE);break;case Wi:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case Vi:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:Ze("WebGLState: Invalid blending: ",v);break}else switch(v){case gn:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case ki:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case Wi:Ze("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Vi:Ze("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ze("WebGLState: Invalid blending: ",v);break}g=null,T=null,N=null,C=null,w.set(0,0,0),f=0,l=v,h=Ve}return}Z=Z||te,G=G||J,pe=pe||fe,(te!==s||Z!==E)&&(e.blendEquationSeparate(st[te],st[Z]),s=te,E=Z),(J!==g||fe!==T||G!==N||pe!==C)&&(e.blendFuncSeparate(ye[J],ye[fe],ye[G],ye[pe]),g=J,T=fe,N=G,C=pe),(Ce.equals(w)===!1||Ke!==f)&&(e.blendColor(Ce.r,Ce.g,Ce.b,Ke),w.copy(Ce),f=Ke),l=v,h=!1}function ze(v,te){v.side===bt?ne(e.CULL_FACE):j(e.CULL_FACE);let J=v.side===_t;te&&(J=!J),Ue(J),v.blending===gn&&v.transparent===!1?He(Pt):He(v.blending,v.blendEquation,v.blendSrc,v.blendDst,v.blendEquationAlpha,v.blendSrcAlpha,v.blendDstAlpha,v.blendColor,v.blendAlpha,v.premultipliedAlpha),d.setFunc(v.depthFunc),d.setTest(v.depthTest),d.setMask(v.depthWrite),r.setMask(v.colorWrite);const fe=v.stencilWrite;_.setTest(fe),fe&&(_.setMask(v.stencilWriteMask),_.setFunc(v.stencilFunc,v.stencilRef,v.stencilFuncMask),_.setOp(v.stencilFail,v.stencilZFail,v.stencilZPass)),at(v.polygonOffset,v.polygonOffsetFactor,v.polygonOffsetUnits),v.alphaToCoverage===!0?j(e.SAMPLE_ALPHA_TO_COVERAGE):ne(e.SAMPLE_ALPHA_TO_COVERAGE)}function Ue(v){$!==v&&(v?e.frontFace(e.CW):e.frontFace(e.CCW),$=v)}function tt(v){v!==Qr?(j(e.CULL_FACE),v!==R&&(v===Hi?e.cullFace(e.BACK):v===Jr?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))):ne(e.CULL_FACE),R=v}function m(v){v!==V&&(O&&e.lineWidth(v),V=v)}function at(v,te,J){v?(j(e.POLYGON_OFFSET_FILL),(z!==te||k!==J)&&(z=te,k=J,d.getReversed()&&(te=-te),e.polygonOffset(te,J))):ne(e.POLYGON_OFFSET_FILL)}function Ge(v){v?j(e.SCISSOR_TEST):ne(e.SCISSOR_TEST)}function qe(v){v===void 0&&(v=e.TEXTURE0+Y-1),ae!==v&&(e.activeTexture(v),ae=v)}function ge(v,te,J){J===void 0&&(ae===null?J=e.TEXTURE0+Y-1:J=ae);let fe=Me[J];fe===void 0&&(fe={type:void 0,texture:void 0},Me[J]=fe),(fe.type!==v||fe.texture!==te)&&(ae!==J&&(e.activeTexture(J),ae=J),e.bindTexture(v,te||X[v]),fe.type=v,fe.texture=te)}function u(){const v=Me[ae];v!==void 0&&v.type!==void 0&&(e.bindTexture(v.type,null),v.type=void 0,v.texture=void 0)}function a(){try{e.compressedTexImage2D(...arguments)}catch(v){Ze("WebGLState:",v)}}function x(){try{e.compressedTexImage3D(...arguments)}catch(v){Ze("WebGLState:",v)}}function W(){try{e.texSubImage2D(...arguments)}catch(v){Ze("WebGLState:",v)}}function q(){try{e.texSubImage3D(...arguments)}catch(v){Ze("WebGLState:",v)}}function H(){try{e.compressedTexSubImage2D(...arguments)}catch(v){Ze("WebGLState:",v)}}function de(){try{e.compressedTexSubImage3D(...arguments)}catch(v){Ze("WebGLState:",v)}}function ee(){try{e.texStorage2D(...arguments)}catch(v){Ze("WebGLState:",v)}}function xe(){try{e.texStorage3D(...arguments)}catch(v){Ze("WebGLState:",v)}}function Re(){try{e.texImage2D(...arguments)}catch(v){Ze("WebGLState:",v)}}function K(){try{e.texImage3D(...arguments)}catch(v){Ze("WebGLState:",v)}}function Q(v){Ne.equals(v)===!1&&(e.scissor(v.x,v.y,v.z,v.w),Ne.copy(v))}function ue(v){Je.equals(v)===!1&&(e.viewport(v.x,v.y,v.z,v.w),Je.copy(v))}function me(v,te){let J=b.get(te);J===void 0&&(J=new WeakMap,b.set(te,J));let fe=J.get(v);fe===void 0&&(fe=e.getUniformBlockIndex(te,v.name),J.set(v,fe))}function le(v,te){const fe=b.get(te).get(v);L.get(te)!==fe&&(e.uniformBlockBinding(te,fe,v.__bindingPointIndex),L.set(te,fe))}function we(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),d.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),B={},ae=null,Me={},D={},p=new WeakMap,S=[],M=null,y=!1,l=null,s=null,g=null,T=null,E=null,N=null,C=null,w=new Qe(0,0,0),f=0,h=!1,$=null,R=null,V=null,z=null,k=null,Ne.set(0,0,e.canvas.width,e.canvas.height),Je.set(0,0,e.canvas.width,e.canvas.height),r.reset(),d.reset(),_.reset()}return{buffers:{color:r,depth:d,stencil:_},enable:j,disable:ne,bindFramebuffer:Le,drawBuffers:Te,useProgram:be,setBlending:He,setMaterial:ze,setFlipSided:Ue,setCullFace:tt,setLineWidth:m,setPolygonOffset:at,setScissorTest:Ge,activeTexture:qe,bindTexture:ge,unbindTexture:u,compressedTexImage2D:a,compressedTexImage3D:x,texImage2D:Re,texImage3D:K,updateUBOMapping:me,uniformBlockBinding:le,texStorage2D:ee,texStorage3D:xe,texSubImage2D:W,texSubImage3D:q,compressedTexSubImage2D:H,compressedTexSubImage3D:de,scissor:Q,viewport:ue,reset:we}}function ed(e,n,t,i,c,r,d){const _=n.has("WEBGL_multisampled_render_to_texture")?n.get("WEBGL_multisampled_render_to_texture"):null,L=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),b=new pt,B=new WeakMap;let D;const p=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function M(u,a){return S?new OffscreenCanvas(u,a):co("canvas")}function y(u,a,x){let W=1;const q=ge(u);if((q.width>x||q.height>x)&&(W=x/Math.max(q.width,q.height)),W<1)if(typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&u instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&u instanceof ImageBitmap||typeof VideoFrame<"u"&&u instanceof VideoFrame){const H=Math.floor(W*q.width),de=Math.floor(W*q.height);D===void 0&&(D=M(H,de));const ee=a?M(H,de):D;return ee.width=H,ee.height=de,ee.getContext("2d").drawImage(u,0,0,H,de),Ye("WebGLRenderer: Texture has been resized from ("+q.width+"x"+q.height+") to ("+H+"x"+de+")."),ee}else return"data"in u&&Ye("WebGLRenderer: Image in DataTexture is too big ("+q.width+"x"+q.height+")."),u;return u}function l(u){return u.generateMipmaps}function s(u){e.generateMipmap(u)}function g(u){return u.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:u.isWebGL3DRenderTarget?e.TEXTURE_3D:u.isWebGLArrayRenderTarget||u.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function T(u,a,x,W,q=!1){if(u!==null){if(e[u]!==void 0)return e[u];Ye("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+u+"'")}let H=a;if(a===e.RED&&(x===e.FLOAT&&(H=e.R32F),x===e.HALF_FLOAT&&(H=e.R16F),x===e.UNSIGNED_BYTE&&(H=e.R8)),a===e.RED_INTEGER&&(x===e.UNSIGNED_BYTE&&(H=e.R8UI),x===e.UNSIGNED_SHORT&&(H=e.R16UI),x===e.UNSIGNED_INT&&(H=e.R32UI),x===e.BYTE&&(H=e.R8I),x===e.SHORT&&(H=e.R16I),x===e.INT&&(H=e.R32I)),a===e.RG&&(x===e.FLOAT&&(H=e.RG32F),x===e.HALF_FLOAT&&(H=e.RG16F),x===e.UNSIGNED_BYTE&&(H=e.RG8)),a===e.RG_INTEGER&&(x===e.UNSIGNED_BYTE&&(H=e.RG8UI),x===e.UNSIGNED_SHORT&&(H=e.RG16UI),x===e.UNSIGNED_INT&&(H=e.RG32UI),x===e.BYTE&&(H=e.RG8I),x===e.SHORT&&(H=e.RG16I),x===e.INT&&(H=e.RG32I)),a===e.RGB_INTEGER&&(x===e.UNSIGNED_BYTE&&(H=e.RGB8UI),x===e.UNSIGNED_SHORT&&(H=e.RGB16UI),x===e.UNSIGNED_INT&&(H=e.RGB32UI),x===e.BYTE&&(H=e.RGB8I),x===e.SHORT&&(H=e.RGB16I),x===e.INT&&(H=e.RGB32I)),a===e.RGBA_INTEGER&&(x===e.UNSIGNED_BYTE&&(H=e.RGBA8UI),x===e.UNSIGNED_SHORT&&(H=e.RGBA16UI),x===e.UNSIGNED_INT&&(H=e.RGBA32UI),x===e.BYTE&&(H=e.RGBA8I),x===e.SHORT&&(H=e.RGBA16I),x===e.INT&&(H=e.RGBA32I)),a===e.RGB&&(x===e.UNSIGNED_INT_5_9_9_9_REV&&(H=e.RGB9_E5),x===e.UNSIGNED_INT_10F_11F_11F_REV&&(H=e.R11F_G11F_B10F)),a===e.RGBA){const de=q?Oa:it.getTransfer(W);x===e.FLOAT&&(H=e.RGBA32F),x===e.HALF_FLOAT&&(H=e.RGBA16F),x===e.UNSIGNED_BYTE&&(H=de===$e?e.SRGB8_ALPHA8:e.RGBA8),x===e.UNSIGNED_SHORT_4_4_4_4&&(H=e.RGBA4),x===e.UNSIGNED_SHORT_5_5_5_1&&(H=e.RGB5_A1)}return(H===e.R16F||H===e.R32F||H===e.RG16F||H===e.RG32F||H===e.RGBA16F||H===e.RGBA32F)&&n.get("EXT_color_buffer_float"),H}function E(u,a){let x;return u?a===null||a===Wt||a===on?x=e.DEPTH24_STENCIL8:a===It?x=e.DEPTH32F_STENCIL8:a===En&&(x=e.DEPTH24_STENCIL8,Ye("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):a===null||a===Wt||a===on?x=e.DEPTH_COMPONENT24:a===It?x=e.DEPTH_COMPONENT32F:a===En&&(x=e.DEPTH_COMPONENT16),x}function N(u,a){return l(u)===!0||u.isFramebufferTexture&&u.minFilter!==Vt&&u.minFilter!==mt?Math.log2(Math.max(a.width,a.height))+1:u.mipmaps!==void 0&&u.mipmaps.length>0?u.mipmaps.length:u.isCompressedTexture&&Array.isArray(u.image)?a.mipmaps.length:1}function C(u){const a=u.target;a.removeEventListener("dispose",C),f(a),a.isVideoTexture&&B.delete(a)}function w(u){const a=u.target;a.removeEventListener("dispose",w),$(a)}function f(u){const a=i.get(u);if(a.__webglInit===void 0)return;const x=u.source,W=p.get(x);if(W){const q=W[a.__cacheKey];q.usedTimes--,q.usedTimes===0&&h(u),Object.keys(W).length===0&&p.delete(x)}i.remove(u)}function h(u){const a=i.get(u);e.deleteTexture(a.__webglTexture);const x=u.source,W=p.get(x);delete W[a.__cacheKey],d.memory.textures--}function $(u){const a=i.get(u);if(u.depthTexture&&(u.depthTexture.dispose(),i.remove(u.depthTexture)),u.isWebGLCubeRenderTarget)for(let W=0;W<6;W++){if(Array.isArray(a.__webglFramebuffer[W]))for(let q=0;q<a.__webglFramebuffer[W].length;q++)e.deleteFramebuffer(a.__webglFramebuffer[W][q]);else e.deleteFramebuffer(a.__webglFramebuffer[W]);a.__webglDepthbuffer&&e.deleteRenderbuffer(a.__webglDepthbuffer[W])}else{if(Array.isArray(a.__webglFramebuffer))for(let W=0;W<a.__webglFramebuffer.length;W++)e.deleteFramebuffer(a.__webglFramebuffer[W]);else e.deleteFramebuffer(a.__webglFramebuffer);if(a.__webglDepthbuffer&&e.deleteRenderbuffer(a.__webglDepthbuffer),a.__webglMultisampledFramebuffer&&e.deleteFramebuffer(a.__webglMultisampledFramebuffer),a.__webglColorRenderbuffer)for(let W=0;W<a.__webglColorRenderbuffer.length;W++)a.__webglColorRenderbuffer[W]&&e.deleteRenderbuffer(a.__webglColorRenderbuffer[W]);a.__webglDepthRenderbuffer&&e.deleteRenderbuffer(a.__webglDepthRenderbuffer)}const x=u.textures;for(let W=0,q=x.length;W<q;W++){const H=i.get(x[W]);H.__webglTexture&&(e.deleteTexture(H.__webglTexture),d.memory.textures--),i.remove(x[W])}i.remove(u)}let R=0;function V(){R=0}function z(){const u=R;return u>=c.maxTextures&&Ye("WebGLTextures: Trying to use "+u+" texture units while this GPU supports only "+c.maxTextures),R+=1,u}function k(u){const a=[];return a.push(u.wrapS),a.push(u.wrapT),a.push(u.wrapR||0),a.push(u.magFilter),a.push(u.minFilter),a.push(u.anisotropy),a.push(u.internalFormat),a.push(u.format),a.push(u.type),a.push(u.generateMipmaps),a.push(u.premultiplyAlpha),a.push(u.flipY),a.push(u.unpackAlignment),a.push(u.colorSpace),a.join()}function Y(u,a){const x=i.get(u);if(u.isVideoTexture&&Ge(u),u.isRenderTargetTexture===!1&&u.isExternalTexture!==!0&&u.version>0&&x.__version!==u.version){const W=u.image;if(W===null)Ye("WebGLRenderer: Texture marked for update but no image data found.");else if(W.complete===!1)Ye("WebGLRenderer: Texture marked for update but image is incomplete");else{X(x,u,a);return}}else u.isExternalTexture&&(x.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D,x.__webglTexture,e.TEXTURE0+a)}function O(u,a){const x=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&x.__version!==u.version){X(x,u,a);return}else u.isExternalTexture&&(x.__webglTexture=u.sourceTexture?u.sourceTexture:null);t.bindTexture(e.TEXTURE_2D_ARRAY,x.__webglTexture,e.TEXTURE0+a)}function F(u,a){const x=i.get(u);if(u.isRenderTargetTexture===!1&&u.version>0&&x.__version!==u.version){X(x,u,a);return}t.bindTexture(e.TEXTURE_3D,x.__webglTexture,e.TEXTURE0+a)}function ie(u,a){const x=i.get(u);if(u.isCubeDepthTexture!==!0&&u.version>0&&x.__version!==u.version){j(x,u,a);return}t.bindTexture(e.TEXTURE_CUBE_MAP,x.__webglTexture,e.TEXTURE0+a)}const ae={[Ar]:e.REPEAT,[Wn]:e.CLAMP_TO_EDGE,[Tr]:e.MIRRORED_REPEAT},Me={[Vt]:e.NEAREST,[Rr]:e.NEAREST_MIPMAP_NEAREST,[dn]:e.NEAREST_MIPMAP_LINEAR,[mt]:e.LINEAR,[Ln]:e.LINEAR_MIPMAP_NEAREST,[qt]:e.LINEAR_MIPMAP_LINEAR},Ae={[Ur]:e.NEVER,[Dr]:e.ALWAYS,[Lr]:e.LESS,[qn]:e.LEQUAL,[Pr]:e.EQUAL,[Yn]:e.GEQUAL,[Cr]:e.GREATER,[br]:e.NOTEQUAL};function he(u,a){if(a.type===It&&n.has("OES_texture_float_linear")===!1&&(a.magFilter===mt||a.magFilter===Ln||a.magFilter===dn||a.magFilter===qt||a.minFilter===mt||a.minFilter===Ln||a.minFilter===dn||a.minFilter===qt)&&Ye("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),e.texParameteri(u,e.TEXTURE_WRAP_S,ae[a.wrapS]),e.texParameteri(u,e.TEXTURE_WRAP_T,ae[a.wrapT]),(u===e.TEXTURE_3D||u===e.TEXTURE_2D_ARRAY)&&e.texParameteri(u,e.TEXTURE_WRAP_R,ae[a.wrapR]),e.texParameteri(u,e.TEXTURE_MAG_FILTER,Me[a.magFilter]),e.texParameteri(u,e.TEXTURE_MIN_FILTER,Me[a.minFilter]),a.compareFunction&&(e.texParameteri(u,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(u,e.TEXTURE_COMPARE_FUNC,Ae[a.compareFunction])),n.has("EXT_texture_filter_anisotropic")===!0){if(a.magFilter===Vt||a.minFilter!==dn&&a.minFilter!==qt||a.type===It&&n.has("OES_texture_float_linear")===!1)return;if(a.anisotropy>1||i.get(a).__currentAnisotropy){const x=n.get("EXT_texture_filter_anisotropic");e.texParameterf(u,x.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,c.getMaxAnisotropy())),i.get(a).__currentAnisotropy=a.anisotropy}}}function Ne(u,a){let x=!1;u.__webglInit===void 0&&(u.__webglInit=!0,a.addEventListener("dispose",C));const W=a.source;let q=p.get(W);q===void 0&&(q={},p.set(W,q));const H=k(a);if(H!==u.__cacheKey){q[H]===void 0&&(q[H]={texture:e.createTexture(),usedTimes:0},d.memory.textures++,x=!0),q[H].usedTimes++;const de=q[u.__cacheKey];de!==void 0&&(q[u.__cacheKey].usedTimes--,de.usedTimes===0&&h(a)),u.__cacheKey=H,u.__webglTexture=q[H].texture}return x}function Je(u,a,x){return Math.floor(Math.floor(u/x)/a)}function je(u,a,x,W){const H=u.updateRanges;if(H.length===0)t.texSubImage2D(e.TEXTURE_2D,0,0,0,a.width,a.height,x,W,a.data);else{H.sort((K,Q)=>K.start-Q.start);let de=0;for(let K=1;K<H.length;K++){const Q=H[de],ue=H[K],me=Q.start+Q.count,le=Je(ue.start,a.width,4),we=Je(Q.start,a.width,4);ue.start<=me+1&&le===we&&Je(ue.start+ue.count-1,a.width,4)===le?Q.count=Math.max(Q.count,ue.start+ue.count-Q.start):(++de,H[de]=ue)}H.length=de+1;const ee=e.getParameter(e.UNPACK_ROW_LENGTH),xe=e.getParameter(e.UNPACK_SKIP_PIXELS),Re=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,a.width);for(let K=0,Q=H.length;K<Q;K++){const ue=H[K],me=Math.floor(ue.start/4),le=Math.ceil(ue.count/4),we=me%a.width,v=Math.floor(me/a.width),te=le,J=1;e.pixelStorei(e.UNPACK_SKIP_PIXELS,we),e.pixelStorei(e.UNPACK_SKIP_ROWS,v),t.texSubImage2D(e.TEXTURE_2D,0,we,v,te,J,x,W,a.data)}u.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,ee),e.pixelStorei(e.UNPACK_SKIP_PIXELS,xe),e.pixelStorei(e.UNPACK_SKIP_ROWS,Re)}}function X(u,a,x){let W=e.TEXTURE_2D;(a.isDataArrayTexture||a.isCompressedArrayTexture)&&(W=e.TEXTURE_2D_ARRAY),a.isData3DTexture&&(W=e.TEXTURE_3D);const q=Ne(u,a),H=a.source;t.bindTexture(W,u.__webglTexture,e.TEXTURE0+x);const de=i.get(H);if(H.version!==de.__version||q===!0){t.activeTexture(e.TEXTURE0+x);const ee=it.getPrimaries(it.workingColorSpace),xe=a.colorSpace===Yt?null:it.getPrimaries(a.colorSpace),Re=a.colorSpace===Yt||ee===xe?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,Re);let K=y(a.image,!1,c.maxTextureSize);K=qe(a,K);const Q=r.convert(a.format,a.colorSpace),ue=r.convert(a.type);let me=T(a.internalFormat,Q,ue,a.colorSpace,a.isVideoTexture);he(W,a);let le;const we=a.mipmaps,v=a.isVideoTexture!==!0,te=de.__version===void 0||q===!0,J=H.dataReady,fe=N(a,K);if(a.isDepthTexture)me=E(a.format===Kt,a.type),te&&(v?t.texStorage2D(e.TEXTURE_2D,1,me,K.width,K.height):t.texImage2D(e.TEXTURE_2D,0,me,K.width,K.height,0,Q,ue,null));else if(a.isDataTexture)if(we.length>0){v&&te&&t.texStorage2D(e.TEXTURE_2D,fe,me,we[0].width,we[0].height);for(let Z=0,G=we.length;Z<G;Z++)le=we[Z],v?J&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,le.width,le.height,Q,ue,le.data):t.texImage2D(e.TEXTURE_2D,Z,me,le.width,le.height,0,Q,ue,le.data);a.generateMipmaps=!1}else v?(te&&t.texStorage2D(e.TEXTURE_2D,fe,me,K.width,K.height),J&&je(a,K,Q,ue)):t.texImage2D(e.TEXTURE_2D,0,me,K.width,K.height,0,Q,ue,K.data);else if(a.isCompressedTexture)if(a.isCompressedArrayTexture){v&&te&&t.texStorage3D(e.TEXTURE_2D_ARRAY,fe,me,we[0].width,we[0].height,K.depth);for(let Z=0,G=we.length;Z<G;Z++)if(le=we[Z],a.format!==Ct)if(Q!==null)if(v){if(J)if(a.layerUpdates.size>0){const pe=zi(le.width,le.height,a.format,a.type);for(const Ce of a.layerUpdates){const Ke=le.data.subarray(Ce*pe/le.data.BYTES_PER_ELEMENT,(Ce+1)*pe/le.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,Ce,le.width,le.height,1,Q,Ke)}a.clearLayerUpdates()}else t.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,le.width,le.height,K.depth,Q,le.data)}else t.compressedTexImage3D(e.TEXTURE_2D_ARRAY,Z,me,le.width,le.height,K.depth,0,le.data,0,0);else Ye("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else v?J&&t.texSubImage3D(e.TEXTURE_2D_ARRAY,Z,0,0,0,le.width,le.height,K.depth,Q,ue,le.data):t.texImage3D(e.TEXTURE_2D_ARRAY,Z,me,le.width,le.height,K.depth,0,Q,ue,le.data)}else{v&&te&&t.texStorage2D(e.TEXTURE_2D,fe,me,we[0].width,we[0].height);for(let Z=0,G=we.length;Z<G;Z++)le=we[Z],a.format!==Ct?Q!==null?v?J&&t.compressedTexSubImage2D(e.TEXTURE_2D,Z,0,0,le.width,le.height,Q,le.data):t.compressedTexImage2D(e.TEXTURE_2D,Z,me,le.width,le.height,0,le.data):Ye("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):v?J&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,le.width,le.height,Q,ue,le.data):t.texImage2D(e.TEXTURE_2D,Z,me,le.width,le.height,0,Q,ue,le.data)}else if(a.isDataArrayTexture)if(v){if(te&&t.texStorage3D(e.TEXTURE_2D_ARRAY,fe,me,K.width,K.height,K.depth),J)if(a.layerUpdates.size>0){const Z=zi(K.width,K.height,a.format,a.type);for(const G of a.layerUpdates){const pe=K.data.subarray(G*Z/K.data.BYTES_PER_ELEMENT,(G+1)*Z/K.data.BYTES_PER_ELEMENT);t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,G,K.width,K.height,1,Q,ue,pe)}a.clearLayerUpdates()}else t.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,K.width,K.height,K.depth,Q,ue,K.data)}else t.texImage3D(e.TEXTURE_2D_ARRAY,0,me,K.width,K.height,K.depth,0,Q,ue,K.data);else if(a.isData3DTexture)v?(te&&t.texStorage3D(e.TEXTURE_3D,fe,me,K.width,K.height,K.depth),J&&t.texSubImage3D(e.TEXTURE_3D,0,0,0,0,K.width,K.height,K.depth,Q,ue,K.data)):t.texImage3D(e.TEXTURE_3D,0,me,K.width,K.height,K.depth,0,Q,ue,K.data);else if(a.isFramebufferTexture){if(te)if(v)t.texStorage2D(e.TEXTURE_2D,fe,me,K.width,K.height);else{let Z=K.width,G=K.height;for(let pe=0;pe<fe;pe++)t.texImage2D(e.TEXTURE_2D,pe,me,Z,G,0,Q,ue,null),Z>>=1,G>>=1}}else if(we.length>0){if(v&&te){const Z=ge(we[0]);t.texStorage2D(e.TEXTURE_2D,fe,me,Z.width,Z.height)}for(let Z=0,G=we.length;Z<G;Z++)le=we[Z],v?J&&t.texSubImage2D(e.TEXTURE_2D,Z,0,0,Q,ue,le):t.texImage2D(e.TEXTURE_2D,Z,me,Q,ue,le);a.generateMipmaps=!1}else if(v){if(te){const Z=ge(K);t.texStorage2D(e.TEXTURE_2D,fe,me,Z.width,Z.height)}J&&t.texSubImage2D(e.TEXTURE_2D,0,0,0,Q,ue,K)}else t.texImage2D(e.TEXTURE_2D,0,me,Q,ue,K);l(a)&&s(W),de.__version=H.version,a.onUpdate&&a.onUpdate(a)}u.__version=a.version}function j(u,a,x){if(a.image.length!==6)return;const W=Ne(u,a),q=a.source;t.bindTexture(e.TEXTURE_CUBE_MAP,u.__webglTexture,e.TEXTURE0+x);const H=i.get(q);if(q.version!==H.__version||W===!0){t.activeTexture(e.TEXTURE0+x);const de=it.getPrimaries(it.workingColorSpace),ee=a.colorSpace===Yt?null:it.getPrimaries(a.colorSpace),xe=a.colorSpace===Yt||de===ee?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);const Re=a.isCompressedTexture||a.image[0].isCompressedTexture,K=a.image[0]&&a.image[0].isDataTexture,Q=[];for(let G=0;G<6;G++)!Re&&!K?Q[G]=y(a.image[G],!0,c.maxCubemapSize):Q[G]=K?a.image[G].image:a.image[G],Q[G]=qe(a,Q[G]);const ue=Q[0],me=r.convert(a.format,a.colorSpace),le=r.convert(a.type),we=T(a.internalFormat,me,le,a.colorSpace),v=a.isVideoTexture!==!0,te=H.__version===void 0||W===!0,J=q.dataReady;let fe=N(a,ue);he(e.TEXTURE_CUBE_MAP,a);let Z;if(Re){v&&te&&t.texStorage2D(e.TEXTURE_CUBE_MAP,fe,we,ue.width,ue.height);for(let G=0;G<6;G++){Z=Q[G].mipmaps;for(let pe=0;pe<Z.length;pe++){const Ce=Z[pe];a.format!==Ct?me!==null?v?J&&t.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe,0,0,Ce.width,Ce.height,me,Ce.data):t.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe,we,Ce.width,Ce.height,0,Ce.data):Ye("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):v?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe,0,0,Ce.width,Ce.height,me,le,Ce.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe,we,Ce.width,Ce.height,0,me,le,Ce.data)}}}else{if(Z=a.mipmaps,v&&te){Z.length>0&&fe++;const G=ge(Q[0]);t.texStorage2D(e.TEXTURE_CUBE_MAP,fe,we,G.width,G.height)}for(let G=0;G<6;G++)if(K){v?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,0,0,0,Q[G].width,Q[G].height,me,le,Q[G].data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,0,we,Q[G].width,Q[G].height,0,me,le,Q[G].data);for(let pe=0;pe<Z.length;pe++){const Ke=Z[pe].image[G].image;v?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe+1,0,0,Ke.width,Ke.height,me,le,Ke.data):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe+1,we,Ke.width,Ke.height,0,me,le,Ke.data)}}else{v?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,0,0,0,me,le,Q[G]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,0,we,me,le,Q[G]);for(let pe=0;pe<Z.length;pe++){const Ce=Z[pe];v?J&&t.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe+1,0,0,me,le,Ce.image[G]):t.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+G,pe+1,we,me,le,Ce.image[G])}}}l(a)&&s(e.TEXTURE_CUBE_MAP),H.__version=q.version,a.onUpdate&&a.onUpdate(a)}u.__version=a.version}function ne(u,a,x,W,q,H){const de=r.convert(x.format,x.colorSpace),ee=r.convert(x.type),xe=T(x.internalFormat,de,ee,x.colorSpace),Re=i.get(a),K=i.get(x);if(K.__renderTarget=a,!Re.__hasExternalTextures){const Q=Math.max(1,a.width>>H),ue=Math.max(1,a.height>>H);q===e.TEXTURE_3D||q===e.TEXTURE_2D_ARRAY?t.texImage3D(q,H,xe,Q,ue,a.depth,0,de,ee,null):t.texImage2D(q,H,xe,Q,ue,0,de,ee,null)}t.bindFramebuffer(e.FRAMEBUFFER,u),at(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,W,q,K.__webglTexture,0,m(a)):(q===e.TEXTURE_2D||q>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&q<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,W,q,K.__webglTexture,H),t.bindFramebuffer(e.FRAMEBUFFER,null)}function Le(u,a,x){if(e.bindRenderbuffer(e.RENDERBUFFER,u),a.depthBuffer){const W=a.depthTexture,q=W&&W.isDepthTexture?W.type:null,H=E(a.stencilBuffer,q),de=a.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;at(a)?_.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,m(a),H,a.width,a.height):x?e.renderbufferStorageMultisample(e.RENDERBUFFER,m(a),H,a.width,a.height):e.renderbufferStorage(e.RENDERBUFFER,H,a.width,a.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,de,e.RENDERBUFFER,u)}else{const W=a.textures;for(let q=0;q<W.length;q++){const H=W[q],de=r.convert(H.format,H.colorSpace),ee=r.convert(H.type),xe=T(H.internalFormat,de,ee,H.colorSpace);at(a)?_.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,m(a),xe,a.width,a.height):x?e.renderbufferStorageMultisample(e.RENDERBUFFER,m(a),xe,a.width,a.height):e.renderbufferStorage(e.RENDERBUFFER,xe,a.width,a.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function Te(u,a,x){const W=a.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(e.FRAMEBUFFER,u),!(a.depthTexture&&a.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=i.get(a.depthTexture);if(q.__renderTarget=a,(!q.__webglTexture||a.depthTexture.image.width!==a.width||a.depthTexture.image.height!==a.height)&&(a.depthTexture.image.width=a.width,a.depthTexture.image.height=a.height,a.depthTexture.needsUpdate=!0),W){if(q.__webglInit===void 0&&(q.__webglInit=!0,a.depthTexture.addEventListener("dispose",C)),q.__webglTexture===void 0){q.__webglTexture=e.createTexture(),t.bindTexture(e.TEXTURE_CUBE_MAP,q.__webglTexture),he(e.TEXTURE_CUBE_MAP,a.depthTexture);const Re=r.convert(a.depthTexture.format),K=r.convert(a.depthTexture.type);let Q;a.depthTexture.format===Zt?Q=e.DEPTH_COMPONENT24:a.depthTexture.format===Kt&&(Q=e.DEPTH24_STENCIL8);for(let ue=0;ue<6;ue++)e.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+ue,0,Q,a.width,a.height,0,Re,K,null)}}else Y(a.depthTexture,0);const H=q.__webglTexture,de=m(a),ee=W?e.TEXTURE_CUBE_MAP_POSITIVE_X+x:e.TEXTURE_2D,xe=a.depthTexture.format===Kt?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;if(a.depthTexture.format===Zt)at(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,xe,ee,H,0,de):e.framebufferTexture2D(e.FRAMEBUFFER,xe,ee,H,0);else if(a.depthTexture.format===Kt)at(a)?_.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,xe,ee,H,0,de):e.framebufferTexture2D(e.FRAMEBUFFER,xe,ee,H,0);else throw new Error("Unknown depthTexture format")}function be(u){const a=i.get(u),x=u.isWebGLCubeRenderTarget===!0;if(a.__boundDepthTexture!==u.depthTexture){const W=u.depthTexture;if(a.__depthDisposeCallback&&a.__depthDisposeCallback(),W){const q=()=>{delete a.__boundDepthTexture,delete a.__depthDisposeCallback,W.removeEventListener("dispose",q)};W.addEventListener("dispose",q),a.__depthDisposeCallback=q}a.__boundDepthTexture=W}if(u.depthTexture&&!a.__autoAllocateDepthBuffer)if(x)for(let W=0;W<6;W++)Te(a.__webglFramebuffer[W],u,W);else{const W=u.texture.mipmaps;W&&W.length>0?Te(a.__webglFramebuffer[0],u,0):Te(a.__webglFramebuffer,u,0)}else if(x){a.__webglDepthbuffer=[];for(let W=0;W<6;W++)if(t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[W]),a.__webglDepthbuffer[W]===void 0)a.__webglDepthbuffer[W]=e.createRenderbuffer(),Le(a.__webglDepthbuffer[W],u,!1);else{const q=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,H=a.__webglDepthbuffer[W];e.bindRenderbuffer(e.RENDERBUFFER,H),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,H)}}else{const W=u.texture.mipmaps;if(W&&W.length>0?t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer[0]):t.bindFramebuffer(e.FRAMEBUFFER,a.__webglFramebuffer),a.__webglDepthbuffer===void 0)a.__webglDepthbuffer=e.createRenderbuffer(),Le(a.__webglDepthbuffer,u,!1);else{const q=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,H=a.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,H),e.framebufferRenderbuffer(e.FRAMEBUFFER,q,e.RENDERBUFFER,H)}}t.bindFramebuffer(e.FRAMEBUFFER,null)}function st(u,a,x){const W=i.get(u);a!==void 0&&ne(W.__webglFramebuffer,u,u.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),x!==void 0&&be(u)}function ye(u){const a=u.texture,x=i.get(u),W=i.get(a);u.addEventListener("dispose",w);const q=u.textures,H=u.isWebGLCubeRenderTarget===!0,de=q.length>1;if(de||(W.__webglTexture===void 0&&(W.__webglTexture=e.createTexture()),W.__version=a.version,d.memory.textures++),H){x.__webglFramebuffer=[];for(let ee=0;ee<6;ee++)if(a.mipmaps&&a.mipmaps.length>0){x.__webglFramebuffer[ee]=[];for(let xe=0;xe<a.mipmaps.length;xe++)x.__webglFramebuffer[ee][xe]=e.createFramebuffer()}else x.__webglFramebuffer[ee]=e.createFramebuffer()}else{if(a.mipmaps&&a.mipmaps.length>0){x.__webglFramebuffer=[];for(let ee=0;ee<a.mipmaps.length;ee++)x.__webglFramebuffer[ee]=e.createFramebuffer()}else x.__webglFramebuffer=e.createFramebuffer();if(de)for(let ee=0,xe=q.length;ee<xe;ee++){const Re=i.get(q[ee]);Re.__webglTexture===void 0&&(Re.__webglTexture=e.createTexture(),d.memory.textures++)}if(u.samples>0&&at(u)===!1){x.__webglMultisampledFramebuffer=e.createFramebuffer(),x.__webglColorRenderbuffer=[],t.bindFramebuffer(e.FRAMEBUFFER,x.__webglMultisampledFramebuffer);for(let ee=0;ee<q.length;ee++){const xe=q[ee];x.__webglColorRenderbuffer[ee]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,x.__webglColorRenderbuffer[ee]);const Re=r.convert(xe.format,xe.colorSpace),K=r.convert(xe.type),Q=T(xe.internalFormat,Re,K,xe.colorSpace,u.isXRRenderTarget===!0),ue=m(u);e.renderbufferStorageMultisample(e.RENDERBUFFER,ue,Q,u.width,u.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+ee,e.RENDERBUFFER,x.__webglColorRenderbuffer[ee])}e.bindRenderbuffer(e.RENDERBUFFER,null),u.depthBuffer&&(x.__webglDepthRenderbuffer=e.createRenderbuffer(),Le(x.__webglDepthRenderbuffer,u,!0)),t.bindFramebuffer(e.FRAMEBUFFER,null)}}if(H){t.bindTexture(e.TEXTURE_CUBE_MAP,W.__webglTexture),he(e.TEXTURE_CUBE_MAP,a);for(let ee=0;ee<6;ee++)if(a.mipmaps&&a.mipmaps.length>0)for(let xe=0;xe<a.mipmaps.length;xe++)ne(x.__webglFramebuffer[ee][xe],u,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,xe);else ne(x.__webglFramebuffer[ee],u,a,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+ee,0);l(a)&&s(e.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(de){for(let ee=0,xe=q.length;ee<xe;ee++){const Re=q[ee],K=i.get(Re);let Q=e.TEXTURE_2D;(u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(Q=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(Q,K.__webglTexture),he(Q,Re),ne(x.__webglFramebuffer,u,Re,e.COLOR_ATTACHMENT0+ee,Q,0),l(Re)&&s(Q)}t.unbindTexture()}else{let ee=e.TEXTURE_2D;if((u.isWebGL3DRenderTarget||u.isWebGLArrayRenderTarget)&&(ee=u.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),t.bindTexture(ee,W.__webglTexture),he(ee,a),a.mipmaps&&a.mipmaps.length>0)for(let xe=0;xe<a.mipmaps.length;xe++)ne(x.__webglFramebuffer[xe],u,a,e.COLOR_ATTACHMENT0,ee,xe);else ne(x.__webglFramebuffer,u,a,e.COLOR_ATTACHMENT0,ee,0);l(a)&&s(ee),t.unbindTexture()}u.depthBuffer&&be(u)}function He(u){const a=u.textures;for(let x=0,W=a.length;x<W;x++){const q=a[x];if(l(q)){const H=g(u),de=i.get(q).__webglTexture;t.bindTexture(H,de),s(H),t.unbindTexture()}}}const ze=[],Ue=[];function tt(u){if(u.samples>0){if(at(u)===!1){const a=u.textures,x=u.width,W=u.height;let q=e.COLOR_BUFFER_BIT;const H=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,de=i.get(u),ee=a.length>1;if(ee)for(let Re=0;Re<a.length;Re++)t.bindFramebuffer(e.FRAMEBUFFER,de.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.RENDERBUFFER,null),t.bindFramebuffer(e.FRAMEBUFFER,de.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.TEXTURE_2D,null,0);t.bindFramebuffer(e.READ_FRAMEBUFFER,de.__webglMultisampledFramebuffer);const xe=u.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(e.DRAW_FRAMEBUFFER,de.__webglFramebuffer[0]):t.bindFramebuffer(e.DRAW_FRAMEBUFFER,de.__webglFramebuffer);for(let Re=0;Re<a.length;Re++){if(u.resolveDepthBuffer&&(u.depthBuffer&&(q|=e.DEPTH_BUFFER_BIT),u.stencilBuffer&&u.resolveStencilBuffer&&(q|=e.STENCIL_BUFFER_BIT)),ee){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,de.__webglColorRenderbuffer[Re]);const K=i.get(a[Re]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,K,0)}e.blitFramebuffer(0,0,x,W,0,0,x,W,q,e.NEAREST),L===!0&&(ze.length=0,Ue.length=0,ze.push(e.COLOR_ATTACHMENT0+Re),u.depthBuffer&&u.resolveDepthBuffer===!1&&(ze.push(H),Ue.push(H),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ue)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,ze))}if(t.bindFramebuffer(e.READ_FRAMEBUFFER,null),t.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),ee)for(let Re=0;Re<a.length;Re++){t.bindFramebuffer(e.FRAMEBUFFER,de.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.RENDERBUFFER,de.__webglColorRenderbuffer[Re]);const K=i.get(a[Re]).__webglTexture;t.bindFramebuffer(e.FRAMEBUFFER,de.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+Re,e.TEXTURE_2D,K,0)}t.bindFramebuffer(e.DRAW_FRAMEBUFFER,de.__webglMultisampledFramebuffer)}else if(u.depthBuffer&&u.resolveDepthBuffer===!1&&L){const a=u.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[a])}}}function m(u){return Math.min(c.maxSamples,u.samples)}function at(u){const a=i.get(u);return u.samples>0&&n.has("WEBGL_multisampled_render_to_texture")===!0&&a.__useRenderToTexture!==!1}function Ge(u){const a=d.render.frame;B.get(u)!==a&&(B.set(u,a),u.update())}function qe(u,a){const x=u.colorSpace,W=u.format,q=u.type;return u.isCompressedTexture===!0||u.isVideoTexture===!0||x!==xn&&x!==Yt&&(it.getTransfer(x)===$e?(W!==Ct||q!==xt)&&Ye("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ze("WebGLTextures: Unsupported texture color space:",x)),a}function ge(u){return typeof HTMLImageElement<"u"&&u instanceof HTMLImageElement?(b.width=u.naturalWidth||u.width,b.height=u.naturalHeight||u.height):typeof VideoFrame<"u"&&u instanceof VideoFrame?(b.width=u.displayWidth,b.height=u.displayHeight):(b.width=u.width,b.height=u.height),b}this.allocateTextureUnit=z,this.resetTextureUnits=V,this.setTexture2D=Y,this.setTexture2DArray=O,this.setTexture3D=F,this.setTextureCube=ie,this.rebindTextures=st,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=He,this.updateMultisampleRenderTarget=tt,this.setupDepthRenderbuffer=be,this.setupFrameBufferTexture=ne,this.useMultisampledRTT=at,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function td(e,n){function t(i,c=Yt){let r;const d=it.getTransfer(c);if(i===xt)return e.UNSIGNED_BYTE;if(i===xa)return e.UNSIGNED_SHORT_4_4_4_4;if(i===Ma)return e.UNSIGNED_SHORT_5_5_5_1;if(i===Or)return e.UNSIGNED_INT_5_9_9_9_REV;if(i===Br)return e.UNSIGNED_INT_10F_11F_11F_REV;if(i===Gr)return e.BYTE;if(i===Hr)return e.SHORT;if(i===En)return e.UNSIGNED_SHORT;if(i===Ra)return e.INT;if(i===Wt)return e.UNSIGNED_INT;if(i===It)return e.FLOAT;if(i===yt)return e.HALF_FLOAT;if(i===Vr)return e.ALPHA;if(i===Wr)return e.RGB;if(i===Ct)return e.RGBA;if(i===Zt)return e.DEPTH_COMPONENT;if(i===Kt)return e.DEPTH_STENCIL;if(i===kr)return e.RED;if(i===Ea)return e.RED_INTEGER;if(i===sn)return e.RG;if(i===Sa)return e.RG_INTEGER;if(i===va)return e.RGBA_INTEGER;if(i===Dn||i===Un||i===wn||i===In)if(d===$e)if(r=n.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Dn)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Un)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===wn)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===In)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=n.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Dn)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Un)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===wn)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===In)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===li||i===ci||i===fi||i===di)if(r=n.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===li)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===ci)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===fi)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===di)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===ui||i===pi||i===hi||i===mi||i===_i||i===gi||i===vi)if(r=n.get("WEBGL_compressed_texture_etc"),r!==null){if(i===ui||i===pi)return d===$e?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===hi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===mi)return r.COMPRESSED_R11_EAC;if(i===_i)return r.COMPRESSED_SIGNED_R11_EAC;if(i===gi)return r.COMPRESSED_RG11_EAC;if(i===vi)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Si||i===Ei||i===xi||i===Mi||i===Ti||i===Ai||i===Ri||i===bi||i===Ci||i===Pi||i===Li||i===Di||i===Ui||i===wi)if(r=n.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Si)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ei)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===xi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Mi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Ti)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Ai)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Ri)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===bi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Ci)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Pi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Li)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Di)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ui)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===wi)return d===$e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Ii||i===Ni||i===yi)if(r=n.get("EXT_texture_compression_bptc"),r!==null){if(i===Ii)return d===$e?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ni)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===yi)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Fi||i===Oi||i===Bi||i===Gi)if(r=n.get("EXT_texture_compression_rgtc"),r!==null){if(i===Fi)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Oi)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Bi)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Gi)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===on?e.UNSIGNED_INT_24_8:e[i]!==void 0?e[i]:null}return{convert:t}}const nd=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,id=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ad{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(n,t){if(this.texture===null){const i=new Ta(n.texture);(n.depthNear!==t.depthNear||n.depthFar!==t.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=i}}getMesh(n){if(this.texture!==null&&this.mesh===null){const t=n.cameras[0].viewport,i=new Dt({vertexShader:nd,fragmentShader:id,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Lt(new Aa(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class rd extends nr{constructor(n,t){super();const i=this;let c=null,r=1,d=null,_="local-floor",L=1,b=null,B=null,D=null,p=null,S=null,M=null;const y=typeof XRWebGLBinding<"u",l=new ad,s={},g=t.getContextAttributes();let T=null,E=null;const N=[],C=[],w=new pt;let f=null;const h=new hn;h.viewport=new ut;const $=new hn;$.viewport=new ut;const R=[h,$],V=new ir;let z=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let j=N[X];return j===void 0&&(j=new Pn,N[X]=j),j.getTargetRaySpace()},this.getControllerGrip=function(X){let j=N[X];return j===void 0&&(j=new Pn,N[X]=j),j.getGripSpace()},this.getHand=function(X){let j=N[X];return j===void 0&&(j=new Pn,N[X]=j),j.getHandSpace()};function Y(X){const j=C.indexOf(X.inputSource);if(j===-1)return;const ne=N[j];ne!==void 0&&(ne.update(X.inputSource,X.frame,b||d),ne.dispatchEvent({type:X.type,data:X.inputSource}))}function O(){c.removeEventListener("select",Y),c.removeEventListener("selectstart",Y),c.removeEventListener("selectend",Y),c.removeEventListener("squeeze",Y),c.removeEventListener("squeezestart",Y),c.removeEventListener("squeezeend",Y),c.removeEventListener("end",O),c.removeEventListener("inputsourceschange",F);for(let X=0;X<N.length;X++){const j=C[X];j!==null&&(C[X]=null,N[X].disconnect(j))}z=null,k=null,l.reset();for(const X in s)delete s[X];n.setRenderTarget(T),S=null,p=null,D=null,c=null,E=null,je.stop(),i.isPresenting=!1,n.setPixelRatio(f),n.setSize(w.width,w.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,i.isPresenting===!0&&Ye("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){_=X,i.isPresenting===!0&&Ye("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return b||d},this.setReferenceSpace=function(X){b=X},this.getBaseLayer=function(){return p!==null?p:S},this.getBinding=function(){return D===null&&y&&(D=new XRWebGLBinding(c,t)),D},this.getFrame=function(){return M},this.getSession=function(){return c},this.setSession=async function(X){if(c=X,c!==null){if(T=n.getRenderTarget(),c.addEventListener("select",Y),c.addEventListener("selectstart",Y),c.addEventListener("selectend",Y),c.addEventListener("squeeze",Y),c.addEventListener("squeezestart",Y),c.addEventListener("squeezeend",Y),c.addEventListener("end",O),c.addEventListener("inputsourceschange",F),g.xrCompatible!==!0&&await t.makeXRCompatible(),f=n.getPixelRatio(),n.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ne=null,Le=null,Te=null;g.depth&&(Te=g.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=g.stencil?Kt:Zt,Le=g.stencil?on:Wt);const be={colorFormat:t.RGBA8,depthFormat:Te,scaleFactor:r};D=this.getBinding(),p=D.createProjectionLayer(be),c.updateRenderState({layers:[p]}),n.setPixelRatio(1),n.setSize(p.textureWidth,p.textureHeight,!1),E=new Tt(p.textureWidth,p.textureHeight,{format:Ct,type:xt,depthTexture:new Sn(p.textureWidth,p.textureHeight,Le,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:g.stencil,colorSpace:n.outputColorSpace,samples:g.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{const ne={antialias:g.antialias,alpha:!0,depth:g.depth,stencil:g.stencil,framebufferScaleFactor:r};S=new XRWebGLLayer(c,t,ne),c.updateRenderState({baseLayer:S}),n.setPixelRatio(1),n.setSize(S.framebufferWidth,S.framebufferHeight,!1),E=new Tt(S.framebufferWidth,S.framebufferHeight,{format:Ct,type:xt,colorSpace:n.outputColorSpace,stencilBuffer:g.stencil,resolveDepthBuffer:S.ignoreDepthValues===!1,resolveStencilBuffer:S.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(L),b=null,d=await c.requestReferenceSpace(_),je.setContext(c),je.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(c!==null)return c.environmentBlendMode},this.getDepthTexture=function(){return l.getDepthTexture()};function F(X){for(let j=0;j<X.removed.length;j++){const ne=X.removed[j],Le=C.indexOf(ne);Le>=0&&(C[Le]=null,N[Le].disconnect(ne))}for(let j=0;j<X.added.length;j++){const ne=X.added[j];let Le=C.indexOf(ne);if(Le===-1){for(let be=0;be<N.length;be++)if(be>=C.length){C.push(ne),Le=be;break}else if(C[be]===null){C[be]=ne,Le=be;break}if(Le===-1)break}const Te=N[Le];Te&&Te.connect(ne)}}const ie=new Be,ae=new Be;function Me(X,j,ne){ie.setFromMatrixPosition(j.matrixWorld),ae.setFromMatrixPosition(ne.matrixWorld);const Le=ie.distanceTo(ae),Te=j.projectionMatrix.elements,be=ne.projectionMatrix.elements,st=Te[14]/(Te[10]-1),ye=Te[14]/(Te[10]+1),He=(Te[9]+1)/Te[5],ze=(Te[9]-1)/Te[5],Ue=(Te[8]-1)/Te[0],tt=(be[8]+1)/be[0],m=st*Ue,at=st*tt,Ge=Le/(-Ue+tt),qe=Ge*-Ue;if(j.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(qe),X.translateZ(Ge),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),Te[10]===-1)X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{const ge=st+Ge,u=ye+Ge,a=m-qe,x=at+(Le-qe),W=He*ye/u*ge,q=ze*ye/u*ge;X.projectionMatrix.makePerspective(a,x,W,q,ge,u),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function Ae(X,j){j===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(j.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(c===null)return;let j=X.near,ne=X.far;l.texture!==null&&(l.depthNear>0&&(j=l.depthNear),l.depthFar>0&&(ne=l.depthFar)),V.near=$.near=h.near=j,V.far=$.far=h.far=ne,(z!==V.near||k!==V.far)&&(c.updateRenderState({depthNear:V.near,depthFar:V.far}),z=V.near,k=V.far),V.layers.mask=X.layers.mask|6,h.layers.mask=V.layers.mask&-5,$.layers.mask=V.layers.mask&-3;const Le=X.parent,Te=V.cameras;Ae(V,Le);for(let be=0;be<Te.length;be++)Ae(Te[be],Le);Te.length===2?Me(V,h,$):V.projectionMatrix.copy(h.projectionMatrix),he(X,V,Le)};function he(X,j,ne){ne===null?X.matrix.copy(j.matrixWorld):(X.matrix.copy(ne.matrixWorld),X.matrix.invert(),X.matrix.multiply(j.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=ar*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(p===null&&S===null))return L},this.setFoveation=function(X){L=X,p!==null&&(p.fixedFoveation=X),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=X)},this.hasDepthSensing=function(){return l.texture!==null},this.getDepthSensingMesh=function(){return l.getMesh(V)},this.getCameraTexture=function(X){return s[X]};let Ne=null;function Je(X,j){if(B=j.getViewerPose(b||d),M=j,B!==null){const ne=B.views;S!==null&&(n.setRenderTargetFramebuffer(E,S.framebuffer),n.setRenderTarget(E));let Le=!1;ne.length!==V.cameras.length&&(V.cameras.length=0,Le=!0);for(let ye=0;ye<ne.length;ye++){const He=ne[ye];let ze=null;if(S!==null)ze=S.getViewport(He);else{const tt=D.getViewSubImage(p,He);ze=tt.viewport,ye===0&&(n.setRenderTargetTextures(E,tt.colorTexture,tt.depthStencilTexture),n.setRenderTarget(E))}let Ue=R[ye];Ue===void 0&&(Ue=new hn,Ue.layers.enable(ye),Ue.viewport=new ut,R[ye]=Ue),Ue.matrix.fromArray(He.transform.matrix),Ue.matrix.decompose(Ue.position,Ue.quaternion,Ue.scale),Ue.projectionMatrix.fromArray(He.projectionMatrix),Ue.projectionMatrixInverse.copy(Ue.projectionMatrix).invert(),Ue.viewport.set(ze.x,ze.y,ze.width,ze.height),ye===0&&(V.matrix.copy(Ue.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Le===!0&&V.cameras.push(Ue)}const Te=c.enabledFeatures;if(Te&&Te.includes("depth-sensing")&&c.depthUsage=="gpu-optimized"&&y){D=i.getBinding();const ye=D.getDepthInformation(ne[0]);ye&&ye.isValid&&ye.texture&&l.init(ye,c.renderState)}if(Te&&Te.includes("camera-access")&&y){n.state.unbindTexture(),D=i.getBinding();for(let ye=0;ye<ne.length;ye++){const He=ne[ye].camera;if(He){let ze=s[He];ze||(ze=new Ta,s[He]=ze);const Ue=D.getCameraImage(He);ze.sourceTexture=Ue}}}}for(let ne=0;ne<N.length;ne++){const Le=C[ne],Te=N[ne];Le!==null&&Te!==void 0&&Te.update(Le,j,b||d)}Ne&&Ne(X,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),M=null}const je=new Ba;je.setAnimationLoop(Je),this.setAnimationLoop=function(X){Ne=X},this.dispose=function(){}}}const Gt=new Pa,od=new $t;function sd(e,n){function t(l,s){l.matrixAutoUpdate===!0&&l.updateMatrix(),s.value.copy(l.matrix)}function i(l,s){s.color.getRGB(l.fogColor.value,Ca(e)),s.isFog?(l.fogNear.value=s.near,l.fogFar.value=s.far):s.isFogExp2&&(l.fogDensity.value=s.density)}function c(l,s,g,T,E){s.isMeshBasicMaterial?r(l,s):s.isMeshLambertMaterial?(r(l,s),s.envMap&&(l.envMapIntensity.value=s.envMapIntensity)):s.isMeshToonMaterial?(r(l,s),D(l,s)):s.isMeshPhongMaterial?(r(l,s),B(l,s),s.envMap&&(l.envMapIntensity.value=s.envMapIntensity)):s.isMeshStandardMaterial?(r(l,s),p(l,s),s.isMeshPhysicalMaterial&&S(l,s,E)):s.isMeshMatcapMaterial?(r(l,s),M(l,s)):s.isMeshDepthMaterial?r(l,s):s.isMeshDistanceMaterial?(r(l,s),y(l,s)):s.isMeshNormalMaterial?r(l,s):s.isLineBasicMaterial?(d(l,s),s.isLineDashedMaterial&&_(l,s)):s.isPointsMaterial?L(l,s,g,T):s.isSpriteMaterial?b(l,s):s.isShadowMaterial?(l.color.value.copy(s.color),l.opacity.value=s.opacity):s.isShaderMaterial&&(s.uniformsNeedUpdate=!1)}function r(l,s){l.opacity.value=s.opacity,s.color&&l.diffuse.value.copy(s.color),s.emissive&&l.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity),s.map&&(l.map.value=s.map,t(s.map,l.mapTransform)),s.alphaMap&&(l.alphaMap.value=s.alphaMap,t(s.alphaMap,l.alphaMapTransform)),s.bumpMap&&(l.bumpMap.value=s.bumpMap,t(s.bumpMap,l.bumpMapTransform),l.bumpScale.value=s.bumpScale,s.side===_t&&(l.bumpScale.value*=-1)),s.normalMap&&(l.normalMap.value=s.normalMap,t(s.normalMap,l.normalMapTransform),l.normalScale.value.copy(s.normalScale),s.side===_t&&l.normalScale.value.negate()),s.displacementMap&&(l.displacementMap.value=s.displacementMap,t(s.displacementMap,l.displacementMapTransform),l.displacementScale.value=s.displacementScale,l.displacementBias.value=s.displacementBias),s.emissiveMap&&(l.emissiveMap.value=s.emissiveMap,t(s.emissiveMap,l.emissiveMapTransform)),s.specularMap&&(l.specularMap.value=s.specularMap,t(s.specularMap,l.specularMapTransform)),s.alphaTest>0&&(l.alphaTest.value=s.alphaTest);const g=n.get(s),T=g.envMap,E=g.envMapRotation;T&&(l.envMap.value=T,Gt.copy(E),Gt.x*=-1,Gt.y*=-1,Gt.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(Gt.y*=-1,Gt.z*=-1),l.envMapRotation.value.setFromMatrix4(od.makeRotationFromEuler(Gt)),l.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,l.reflectivity.value=s.reflectivity,l.ior.value=s.ior,l.refractionRatio.value=s.refractionRatio),s.lightMap&&(l.lightMap.value=s.lightMap,l.lightMapIntensity.value=s.lightMapIntensity,t(s.lightMap,l.lightMapTransform)),s.aoMap&&(l.aoMap.value=s.aoMap,l.aoMapIntensity.value=s.aoMapIntensity,t(s.aoMap,l.aoMapTransform))}function d(l,s){l.diffuse.value.copy(s.color),l.opacity.value=s.opacity,s.map&&(l.map.value=s.map,t(s.map,l.mapTransform))}function _(l,s){l.dashSize.value=s.dashSize,l.totalSize.value=s.dashSize+s.gapSize,l.scale.value=s.scale}function L(l,s,g,T){l.diffuse.value.copy(s.color),l.opacity.value=s.opacity,l.size.value=s.size*g,l.scale.value=T*.5,s.map&&(l.map.value=s.map,t(s.map,l.uvTransform)),s.alphaMap&&(l.alphaMap.value=s.alphaMap,t(s.alphaMap,l.alphaMapTransform)),s.alphaTest>0&&(l.alphaTest.value=s.alphaTest)}function b(l,s){l.diffuse.value.copy(s.color),l.opacity.value=s.opacity,l.rotation.value=s.rotation,s.map&&(l.map.value=s.map,t(s.map,l.mapTransform)),s.alphaMap&&(l.alphaMap.value=s.alphaMap,t(s.alphaMap,l.alphaMapTransform)),s.alphaTest>0&&(l.alphaTest.value=s.alphaTest)}function B(l,s){l.specular.value.copy(s.specular),l.shininess.value=Math.max(s.shininess,1e-4)}function D(l,s){s.gradientMap&&(l.gradientMap.value=s.gradientMap)}function p(l,s){l.metalness.value=s.metalness,s.metalnessMap&&(l.metalnessMap.value=s.metalnessMap,t(s.metalnessMap,l.metalnessMapTransform)),l.roughness.value=s.roughness,s.roughnessMap&&(l.roughnessMap.value=s.roughnessMap,t(s.roughnessMap,l.roughnessMapTransform)),s.envMap&&(l.envMapIntensity.value=s.envMapIntensity)}function S(l,s,g){l.ior.value=s.ior,s.sheen>0&&(l.sheenColor.value.copy(s.sheenColor).multiplyScalar(s.sheen),l.sheenRoughness.value=s.sheenRoughness,s.sheenColorMap&&(l.sheenColorMap.value=s.sheenColorMap,t(s.sheenColorMap,l.sheenColorMapTransform)),s.sheenRoughnessMap&&(l.sheenRoughnessMap.value=s.sheenRoughnessMap,t(s.sheenRoughnessMap,l.sheenRoughnessMapTransform))),s.clearcoat>0&&(l.clearcoat.value=s.clearcoat,l.clearcoatRoughness.value=s.clearcoatRoughness,s.clearcoatMap&&(l.clearcoatMap.value=s.clearcoatMap,t(s.clearcoatMap,l.clearcoatMapTransform)),s.clearcoatRoughnessMap&&(l.clearcoatRoughnessMap.value=s.clearcoatRoughnessMap,t(s.clearcoatRoughnessMap,l.clearcoatRoughnessMapTransform)),s.clearcoatNormalMap&&(l.clearcoatNormalMap.value=s.clearcoatNormalMap,t(s.clearcoatNormalMap,l.clearcoatNormalMapTransform),l.clearcoatNormalScale.value.copy(s.clearcoatNormalScale),s.side===_t&&l.clearcoatNormalScale.value.negate())),s.dispersion>0&&(l.dispersion.value=s.dispersion),s.iridescence>0&&(l.iridescence.value=s.iridescence,l.iridescenceIOR.value=s.iridescenceIOR,l.iridescenceThicknessMinimum.value=s.iridescenceThicknessRange[0],l.iridescenceThicknessMaximum.value=s.iridescenceThicknessRange[1],s.iridescenceMap&&(l.iridescenceMap.value=s.iridescenceMap,t(s.iridescenceMap,l.iridescenceMapTransform)),s.iridescenceThicknessMap&&(l.iridescenceThicknessMap.value=s.iridescenceThicknessMap,t(s.iridescenceThicknessMap,l.iridescenceThicknessMapTransform))),s.transmission>0&&(l.transmission.value=s.transmission,l.transmissionSamplerMap.value=g.texture,l.transmissionSamplerSize.value.set(g.width,g.height),s.transmissionMap&&(l.transmissionMap.value=s.transmissionMap,t(s.transmissionMap,l.transmissionMapTransform)),l.thickness.value=s.thickness,s.thicknessMap&&(l.thicknessMap.value=s.thicknessMap,t(s.thicknessMap,l.thicknessMapTransform)),l.attenuationDistance.value=s.attenuationDistance,l.attenuationColor.value.copy(s.attenuationColor)),s.anisotropy>0&&(l.anisotropyVector.value.set(s.anisotropy*Math.cos(s.anisotropyRotation),s.anisotropy*Math.sin(s.anisotropyRotation)),s.anisotropyMap&&(l.anisotropyMap.value=s.anisotropyMap,t(s.anisotropyMap,l.anisotropyMapTransform))),l.specularIntensity.value=s.specularIntensity,l.specularColor.value.copy(s.specularColor),s.specularColorMap&&(l.specularColorMap.value=s.specularColorMap,t(s.specularColorMap,l.specularColorMapTransform)),s.specularIntensityMap&&(l.specularIntensityMap.value=s.specularIntensityMap,t(s.specularIntensityMap,l.specularIntensityMapTransform))}function M(l,s){s.matcap&&(l.matcap.value=s.matcap)}function y(l,s){const g=n.get(s).light;l.referencePosition.value.setFromMatrixPosition(g.matrixWorld),l.nearDistance.value=g.shadow.camera.near,l.farDistance.value=g.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:c}}function ld(e,n,t,i){let c={},r={},d=[];const _=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function L(g,T){const E=T.program;i.uniformBlockBinding(g,E)}function b(g,T){let E=c[g.id];E===void 0&&(M(g),E=B(g),c[g.id]=E,g.addEventListener("dispose",l));const N=T.program;i.updateUBOMapping(g,N);const C=n.render.frame;r[g.id]!==C&&(p(g),r[g.id]=C)}function B(g){const T=D();g.__bindingPointIndex=T;const E=e.createBuffer(),N=g.__size,C=g.usage;return e.bindBuffer(e.UNIFORM_BUFFER,E),e.bufferData(e.UNIFORM_BUFFER,N,C),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,T,E),E}function D(){for(let g=0;g<_;g++)if(d.indexOf(g)===-1)return d.push(g),g;return Ze("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(g){const T=c[g.id],E=g.uniforms,N=g.__cache;e.bindBuffer(e.UNIFORM_BUFFER,T);for(let C=0,w=E.length;C<w;C++){const f=Array.isArray(E[C])?E[C]:[E[C]];for(let h=0,$=f.length;h<$;h++){const R=f[h];if(S(R,C,h,N)===!0){const V=R.__offset,z=Array.isArray(R.value)?R.value:[R.value];let k=0;for(let Y=0;Y<z.length;Y++){const O=z[Y],F=y(O);typeof O=="number"||typeof O=="boolean"?(R.__data[0]=O,e.bufferSubData(e.UNIFORM_BUFFER,V+k,R.__data)):O.isMatrix3?(R.__data[0]=O.elements[0],R.__data[1]=O.elements[1],R.__data[2]=O.elements[2],R.__data[3]=0,R.__data[4]=O.elements[3],R.__data[5]=O.elements[4],R.__data[6]=O.elements[5],R.__data[7]=0,R.__data[8]=O.elements[6],R.__data[9]=O.elements[7],R.__data[10]=O.elements[8],R.__data[11]=0):(O.toArray(R.__data,k),k+=F.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,V,R.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function S(g,T,E,N){const C=g.value,w=T+"_"+E;if(N[w]===void 0)return typeof C=="number"||typeof C=="boolean"?N[w]=C:N[w]=C.clone(),!0;{const f=N[w];if(typeof C=="number"||typeof C=="boolean"){if(f!==C)return N[w]=C,!0}else if(f.equals(C)===!1)return f.copy(C),!0}return!1}function M(g){const T=g.uniforms;let E=0;const N=16;for(let w=0,f=T.length;w<f;w++){const h=Array.isArray(T[w])?T[w]:[T[w]];for(let $=0,R=h.length;$<R;$++){const V=h[$],z=Array.isArray(V.value)?V.value:[V.value];for(let k=0,Y=z.length;k<Y;k++){const O=z[k],F=y(O),ie=E%N,ae=ie%F.boundary,Me=ie+ae;E+=ae,Me!==0&&N-Me<F.storage&&(E+=N-Me),V.__data=new Float32Array(F.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=E,E+=F.storage}}}const C=E%N;return C>0&&(E+=N-C),g.__size=E,g.__cache={},this}function y(g){const T={boundary:0,storage:0};return typeof g=="number"||typeof g=="boolean"?(T.boundary=4,T.storage=4):g.isVector2?(T.boundary=8,T.storage=8):g.isVector3||g.isColor?(T.boundary=16,T.storage=12):g.isVector4?(T.boundary=16,T.storage=16):g.isMatrix3?(T.boundary=48,T.storage=48):g.isMatrix4?(T.boundary=64,T.storage=64):g.isTexture?Ye("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Ye("WebGLRenderer: Unsupported uniform value type.",g),T}function l(g){const T=g.target;T.removeEventListener("dispose",l);const E=d.indexOf(T.__bindingPointIndex);d.splice(E,1),e.deleteBuffer(c[T.id]),delete c[T.id],delete r[T.id]}function s(){for(const g in c)e.deleteBuffer(c[g]);d=[],c={},r={}}return{bind:L,update:b,dispose:s}}const cd=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let St=null;function fd(){return St===null&&(St=new rr(cd,16,16,sn,yt),St.name="DFG_LUT",St.minFilter=mt,St.magFilter=mt,St.wrapS=Wn,St.wrapT=Wn,St.generateMipmaps=!1,St.needsUpdate=!0),St}class ud{constructor(n={}){const{canvas:t=Qa(),context:i=null,depth:c=!0,stencil:r=!1,alpha:d=!1,antialias:_=!1,premultipliedAlpha:L=!0,preserveDrawingBuffer:b=!1,powerPreference:B="default",failIfMajorPerformanceCaveat:D=!1,reversedDepthBuffer:p=!1,outputBufferType:S=xt}=n;this.isWebGLRenderer=!0;let M;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=i.getContextAttributes().alpha}else M=d;const y=S,l=new Set([va,Sa,Ea]),s=new Set([xt,Wt,En,on,xa,Ma]),g=new Uint32Array(4),T=new Int32Array(4);let E=null,N=null;const C=[],w=[];let f=null;this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Mt,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const h=this;let $=!1;this._outputColorSpace=Ja;let R=0,V=0,z=null,k=-1,Y=null;const O=new ut,F=new ut;let ie=null;const ae=new Qe(0);let Me=0,Ae=t.width,he=t.height,Ne=1,Je=null,je=null;const X=new ut(0,0,Ae,he),j=new ut(0,0,Ae,he);let ne=!1;const Le=new ma;let Te=!1,be=!1;const st=new $t,ye=new Be,He=new ut,ze={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Ue=!1;function tt(){return z===null?Ne:1}let m=i;function at(o,A){return t.getContext(o,A)}try{const o={alpha:!0,depth:c,stencil:r,antialias:_,premultipliedAlpha:L,preserveDrawingBuffer:b,powerPreference:B,failIfMajorPerformanceCaveat:D};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${ja}`),t.addEventListener("webglcontextlost",pe,!1),t.addEventListener("webglcontextrestored",Ce,!1),t.addEventListener("webglcontextcreationerror",Ke,!1),m===null){const A="webgl2";if(m=at(A,o),m===null)throw at(A)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(o){throw Ze("WebGLRenderer: "+o.message),o}let Ge,qe,ge,u,a,x,W,q,H,de,ee,xe,Re,K,Q,ue,me,le,we,v,te,J,fe;function Z(){Ge=new fc(m),Ge.init(),te=new td(m,Ge),qe=new nc(m,Ge,n,te),ge=new jf(m,Ge),qe.reversedDepthBuffer&&p&&ge.buffers.depth.setReversed(!0),u=new pc(m),a=new Gf,x=new ed(m,Ge,ge,a,qe,te,u),W=new cc(h),q=new vo(m),J=new ec(m,q),H=new dc(m,q,u,J),de=new mc(m,H,q,J,u),le=new hc(m,qe,x),Q=new ic(a),ee=new Bf(h,W,Ge,qe,J,Q),xe=new sd(h,a),Re=new Vf,K=new qf(Ge),me=new jl(h,W,ge,de,M,L),ue=new Jf(h,de,qe),fe=new ld(m,u,qe,ge),we=new tc(m,Ge,u),v=new uc(m,Ge,u),u.programs=ee.programs,h.capabilities=qe,h.extensions=Ge,h.properties=a,h.renderLists=Re,h.shadowMap=ue,h.state=ge,h.info=u}Z(),y!==xt&&(f=new gc(y,t.width,t.height,c,r));const G=new rd(h,m);this.xr=G,this.getContext=function(){return m},this.getContextAttributes=function(){return m.getContextAttributes()},this.forceContextLoss=function(){const o=Ge.get("WEBGL_lose_context");o&&o.loseContext()},this.forceContextRestore=function(){const o=Ge.get("WEBGL_lose_context");o&&o.restoreContext()},this.getPixelRatio=function(){return Ne},this.setPixelRatio=function(o){o!==void 0&&(Ne=o,this.setSize(Ae,he,!1))},this.getSize=function(o){return o.set(Ae,he)},this.setSize=function(o,A,I=!0){if(G.isPresenting){Ye("WebGLRenderer: Can't change size while VR device is presenting.");return}Ae=o,he=A,t.width=Math.floor(o*Ne),t.height=Math.floor(A*Ne),I===!0&&(t.style.width=o+"px",t.style.height=A+"px"),f!==null&&f.setSize(t.width,t.height),this.setViewport(0,0,o,A)},this.getDrawingBufferSize=function(o){return o.set(Ae*Ne,he*Ne).floor()},this.setDrawingBufferSize=function(o,A,I){Ae=o,he=A,Ne=I,t.width=Math.floor(o*I),t.height=Math.floor(A*I),this.setViewport(0,0,o,A)},this.setEffects=function(o){if(y===xt){console.error("THREE.WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(o){for(let A=0;A<o.length;A++)if(o[A].isOutputPass===!0){console.warn("THREE.WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}f.setEffects(o||[])},this.getCurrentViewport=function(o){return o.copy(O)},this.getViewport=function(o){return o.copy(X)},this.setViewport=function(o,A,I,U){o.isVector4?X.set(o.x,o.y,o.z,o.w):X.set(o,A,I,U),ge.viewport(O.copy(X).multiplyScalar(Ne).round())},this.getScissor=function(o){return o.copy(j)},this.setScissor=function(o,A,I,U){o.isVector4?j.set(o.x,o.y,o.z,o.w):j.set(o,A,I,U),ge.scissor(F.copy(j).multiplyScalar(Ne).round())},this.getScissorTest=function(){return ne},this.setScissorTest=function(o){ge.setScissorTest(ne=o)},this.setOpaqueSort=function(o){Je=o},this.setTransparentSort=function(o){je=o},this.getClearColor=function(o){return o.copy(me.getClearColor())},this.setClearColor=function(){me.setClearColor(...arguments)},this.getClearAlpha=function(){return me.getClearAlpha()},this.setClearAlpha=function(){me.setClearAlpha(...arguments)},this.clear=function(o=!0,A=!0,I=!0){let U=0;if(o){let P=!1;if(z!==null){const oe=z.texture.format;P=l.has(oe)}if(P){const oe=z.texture.type,ce=s.has(oe),se=me.getClearColor(),_e=me.getClearAlpha(),Se=se.r,Pe=se.g,Ie=se.b;ce?(g[0]=Se,g[1]=Pe,g[2]=Ie,g[3]=_e,m.clearBufferuiv(m.COLOR,0,g)):(T[0]=Se,T[1]=Pe,T[2]=Ie,T[3]=_e,m.clearBufferiv(m.COLOR,0,T))}else U|=m.COLOR_BUFFER_BIT}A&&(U|=m.DEPTH_BUFFER_BIT),I&&(U|=m.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),U!==0&&m.clear(U)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",pe,!1),t.removeEventListener("webglcontextrestored",Ce,!1),t.removeEventListener("webglcontextcreationerror",Ke,!1),me.dispose(),Re.dispose(),K.dispose(),a.dispose(),W.dispose(),de.dispose(),J.dispose(),fe.dispose(),ee.dispose(),G.dispose(),G.removeEventListener("sessionstart",Zn),G.removeEventListener("sessionend",Qn),Ft.stop()};function pe(o){o.preventDefault(),ai("WebGLRenderer: Context Lost."),$=!0}function Ce(){ai("WebGLRenderer: Context Restored."),$=!1;const o=u.autoReset,A=ue.enabled,I=ue.autoUpdate,U=ue.needsUpdate,P=ue.type;Z(),u.autoReset=o,ue.enabled=A,ue.autoUpdate=I,ue.needsUpdate=U,ue.type=P}function Ke(o){Ze("WebGLRenderer: A WebGL context could not be created. Reason: ",o.statusMessage)}function Ve(o){const A=o.target;A.removeEventListener("dispose",Ve),At(A)}function At(o){Rt(o),a.remove(o)}function Rt(o){const A=a.get(o).programs;A!==void 0&&(A.forEach(function(I){ee.releaseProgram(I)}),o.isShaderMaterial&&ee.releaseShaderCache(o))}this.renderBufferDirect=function(o,A,I,U,P,oe){A===null&&(A=ze);const ce=P.isMesh&&P.matrixWorld.determinant()<0,se=Xa(o,A,I,U,P);ge.setMaterial(U,ce);let _e=I.index,Se=1;if(U.wireframe===!0){if(_e=H.getWireframeAttribute(I),_e===void 0)return;Se=2}const Pe=I.drawRange,Ie=I.attributes.position;let Ee=Pe.start*Se,We=(Pe.start+Pe.count)*Se;oe!==null&&(Ee=Math.max(Ee,oe.start*Se),We=Math.min(We,(oe.start+oe.count)*Se)),_e!==null?(Ee=Math.max(Ee,0),We=Math.min(We,_e.count)):Ie!=null&&(Ee=Math.max(Ee,0),We=Math.min(We,Ie.count));const nt=We-Ee;if(nt<0||nt===1/0)return;J.setup(P,U,se,I,_e);let et,ke=we;if(_e!==null&&(et=q.get(_e),ke=v,ke.setIndex(et)),P.isMesh)U.wireframe===!0?(ge.setLineWidth(U.wireframeLinewidth*tt()),ke.setMode(m.LINES)):ke.setMode(m.TRIANGLES);else if(P.isLine){let ft=U.linewidth;ft===void 0&&(ft=1),ge.setLineWidth(ft*tt()),P.isLineSegments?ke.setMode(m.LINES):P.isLineLoop?ke.setMode(m.LINE_LOOP):ke.setMode(m.LINE_STRIP)}else P.isPoints?ke.setMode(m.POINTS):P.isSprite&&ke.setMode(m.TRIANGLES);if(P.isBatchedMesh)if(P._multiDrawInstances!==null)_a("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),ke.renderMultiDrawInstances(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount,P._multiDrawInstances);else if(Ge.get("WEBGL_multi_draw"))ke.renderMultiDraw(P._multiDrawStarts,P._multiDrawCounts,P._multiDrawCount);else{const ft=P._multiDrawStarts,ve=P._multiDrawCounts,ht=P._multiDrawCount,Fe=_e?q.get(_e).bytesPerElement:1,gt=a.get(U).currentProgram.getUniforms();for(let vt=0;vt<ht;vt++)gt.setValue(m,"_gl_DrawID",vt),ke.render(ft[vt]/Fe,ve[vt])}else if(P.isInstancedMesh)ke.renderInstances(Ee,nt,P.count);else if(I.isInstancedBufferGeometry){const ft=I._maxInstanceCount!==void 0?I._maxInstanceCount:1/0,ve=Math.min(I.instanceCount,ft);ke.renderInstances(Ee,nt,ve)}else ke.render(Ee,nt)};function $n(o,A,I){o.transparent===!0&&o.side===bt&&o.forceSinglePass===!1?(o.side=_t,o.needsUpdate=!0,fn(o,A,I),o.side=rn,o.needsUpdate=!0,fn(o,A,I),o.side=bt):fn(o,A,I)}this.compile=function(o,A,I=null){I===null&&(I=o),N=K.get(I),N.init(A),w.push(N),I.traverseVisible(function(P){P.isLight&&P.layers.test(A.layers)&&(N.pushLight(P),P.castShadow&&N.pushShadow(P))}),o!==I&&o.traverseVisible(function(P){P.isLight&&P.layers.test(A.layers)&&(N.pushLight(P),P.castShadow&&N.pushShadow(P))}),N.setupLights();const U=new Set;return o.traverse(function(P){if(!(P.isMesh||P.isPoints||P.isLine||P.isSprite))return;const oe=P.material;if(oe)if(Array.isArray(oe))for(let ce=0;ce<oe.length;ce++){const se=oe[ce];$n(se,I,P),U.add(se)}else $n(oe,I,P),U.add(oe)}),N=w.pop(),U},this.compileAsync=function(o,A,I=null){const U=this.compile(o,A,I);return new Promise(P=>{function oe(){if(U.forEach(function(ce){a.get(ce).currentProgram.isReady()&&U.delete(ce)}),U.size===0){P(o);return}setTimeout(oe,10)}Ge.get("KHR_parallel_shader_compile")!==null?oe():setTimeout(oe,10)})};let bn=null;function za(o){bn&&bn(o)}function Zn(){Ft.stop()}function Qn(){Ft.start()}const Ft=new Ba;Ft.setAnimationLoop(za),typeof self<"u"&&Ft.setContext(self),this.setAnimationLoop=function(o){bn=o,G.setAnimationLoop(o),o===null?Ft.stop():Ft.start()},G.addEventListener("sessionstart",Zn),G.addEventListener("sessionend",Qn),this.render=function(o,A){if(A!==void 0&&A.isCamera!==!0){Ze("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if($===!0)return;const I=G.enabled===!0&&G.isPresenting===!0,U=f!==null&&(z===null||I)&&f.begin(h,z);if(o.matrixWorldAutoUpdate===!0&&o.updateMatrixWorld(),A.parent===null&&A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),G.enabled===!0&&G.isPresenting===!0&&(f===null||f.isCompositing()===!1)&&(G.cameraAutoUpdate===!0&&G.updateCamera(A),A=G.getCamera()),o.isScene===!0&&o.onBeforeRender(h,o,A,z),N=K.get(o,w.length),N.init(A),w.push(N),st.multiplyMatrices(A.projectionMatrix,A.matrixWorldInverse),Le.setFromProjectionMatrix(st,ri,A.reversedDepth),be=this.localClippingEnabled,Te=Q.init(this.clippingPlanes,be),E=Re.get(o,C.length),E.init(),C.push(E),G.enabled===!0&&G.isPresenting===!0){const ce=h.xr.getDepthSensingMesh();ce!==null&&Cn(ce,A,-1/0,h.sortObjects)}Cn(o,A,0,h.sortObjects),E.finish(),h.sortObjects===!0&&E.sort(Je,je),Ue=G.enabled===!1||G.isPresenting===!1||G.hasDepthSensing()===!1,Ue&&me.addToRenderList(E,o),this.info.render.frame++,Te===!0&&Q.beginShadows();const P=N.state.shadowsArray;if(ue.render(P,o,A),Te===!0&&Q.endShadows(),this.info.autoReset===!0&&this.info.reset(),(U&&f.hasRenderPass())===!1){const ce=E.opaque,se=E.transmissive;if(N.setupLights(),A.isArrayCamera){const _e=A.cameras;if(se.length>0)for(let Se=0,Pe=_e.length;Se<Pe;Se++){const Ie=_e[Se];jn(ce,se,o,Ie)}Ue&&me.render(o);for(let Se=0,Pe=_e.length;Se<Pe;Se++){const Ie=_e[Se];Jn(E,o,Ie,Ie.viewport)}}else se.length>0&&jn(ce,se,o,A),Ue&&me.render(o),Jn(E,o,A)}z!==null&&V===0&&(x.updateMultisampleRenderTarget(z),x.updateRenderTargetMipmap(z)),U&&f.end(h),o.isScene===!0&&o.onAfterRender(h,o,A),J.resetDefaultState(),k=-1,Y=null,w.pop(),w.length>0?(N=w[w.length-1],Te===!0&&Q.setGlobalState(h.clippingPlanes,N.state.camera)):N=null,C.pop(),C.length>0?E=C[C.length-1]:E=null};function Cn(o,A,I,U){if(o.visible===!1)return;if(o.layers.test(A.layers)){if(o.isGroup)I=o.renderOrder;else if(o.isLOD)o.autoUpdate===!0&&o.update(A);else if(o.isLight)N.pushLight(o),o.castShadow&&N.pushShadow(o);else if(o.isSprite){if(!o.frustumCulled||Le.intersectsSprite(o)){U&&He.setFromMatrixPosition(o.matrixWorld).applyMatrix4(st);const ce=de.update(o),se=o.material;se.visible&&E.push(o,ce,se,I,He.z,null)}}else if((o.isMesh||o.isLine||o.isPoints)&&(!o.frustumCulled||Le.intersectsObject(o))){const ce=de.update(o),se=o.material;if(U&&(o.boundingSphere!==void 0?(o.boundingSphere===null&&o.computeBoundingSphere(),He.copy(o.boundingSphere.center)):(ce.boundingSphere===null&&ce.computeBoundingSphere(),He.copy(ce.boundingSphere.center)),He.applyMatrix4(o.matrixWorld).applyMatrix4(st)),Array.isArray(se)){const _e=ce.groups;for(let Se=0,Pe=_e.length;Se<Pe;Se++){const Ie=_e[Se],Ee=se[Ie.materialIndex];Ee&&Ee.visible&&E.push(o,ce,Ee,I,He.z,Ie)}}else se.visible&&E.push(o,ce,se,I,He.z,null)}}const oe=o.children;for(let ce=0,se=oe.length;ce<se;ce++)Cn(oe[ce],A,I,U)}function Jn(o,A,I,U){const{opaque:P,transmissive:oe,transparent:ce}=o;N.setupLightsView(I),Te===!0&&Q.setGlobalState(h.clippingPlanes,I),U&&ge.viewport(O.copy(U)),P.length>0&&cn(P,A,I),oe.length>0&&cn(oe,A,I),ce.length>0&&cn(ce,A,I),ge.buffers.depth.setTest(!0),ge.buffers.depth.setMask(!0),ge.buffers.color.setMask(!0),ge.setPolygonOffset(!1)}function jn(o,A,I,U){if((I.isScene===!0?I.overrideMaterial:null)!==null)return;if(N.state.transmissionRenderTarget[U.id]===void 0){const Ee=Ge.has("EXT_color_buffer_half_float")||Ge.has("EXT_color_buffer_float");N.state.transmissionRenderTarget[U.id]=new Tt(1,1,{generateMipmaps:!0,type:Ee?yt:xt,minFilter:qt,samples:qe.samples,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:it.workingColorSpace})}const oe=N.state.transmissionRenderTarget[U.id],ce=U.viewport||O;oe.setSize(ce.z*h.transmissionResolutionScale,ce.w*h.transmissionResolutionScale);const se=h.getRenderTarget(),_e=h.getActiveCubeFace(),Se=h.getActiveMipmapLevel();h.setRenderTarget(oe),h.getClearColor(ae),Me=h.getClearAlpha(),Me<1&&h.setClearColor(16777215,.5),h.clear(),Ue&&me.render(I);const Pe=h.toneMapping;h.toneMapping=Mt;const Ie=U.viewport;if(U.viewport!==void 0&&(U.viewport=void 0),N.setupLightsView(U),Te===!0&&Q.setGlobalState(h.clippingPlanes,U),cn(o,I,U),x.updateMultisampleRenderTarget(oe),x.updateRenderTargetMipmap(oe),Ge.has("WEBGL_multisampled_render_to_texture")===!1){let Ee=!1;for(let We=0,nt=A.length;We<nt;We++){const et=A[We],{object:ke,geometry:ft,material:ve,group:ht}=et;if(ve.side===bt&&ke.layers.test(U.layers)){const Fe=ve.side;ve.side=_t,ve.needsUpdate=!0,ei(ke,I,U,ft,ve,ht),ve.side=Fe,ve.needsUpdate=!0,Ee=!0}}Ee===!0&&(x.updateMultisampleRenderTarget(oe),x.updateRenderTargetMipmap(oe))}h.setRenderTarget(se,_e,Se),h.setClearColor(ae,Me),Ie!==void 0&&(U.viewport=Ie),h.toneMapping=Pe}function cn(o,A,I){const U=A.isScene===!0?A.overrideMaterial:null;for(let P=0,oe=o.length;P<oe;P++){const ce=o[P],{object:se,geometry:_e,group:Se}=ce;let Pe=ce.material;Pe.allowOverride===!0&&U!==null&&(Pe=U),se.layers.test(I.layers)&&ei(se,A,I,_e,Pe,Se)}}function ei(o,A,I,U,P,oe){o.onBeforeRender(h,A,I,U,P,oe),o.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,o.matrixWorld),o.normalMatrix.getNormalMatrix(o.modelViewMatrix),P.onBeforeRender(h,A,I,U,o,oe),P.transparent===!0&&P.side===bt&&P.forceSinglePass===!1?(P.side=_t,P.needsUpdate=!0,h.renderBufferDirect(I,A,U,P,o,oe),P.side=rn,P.needsUpdate=!0,h.renderBufferDirect(I,A,U,P,o,oe),P.side=bt):h.renderBufferDirect(I,A,U,P,o,oe),o.onAfterRender(h,A,I,U,P,oe)}function fn(o,A,I){A.isScene!==!0&&(A=ze);const U=a.get(o),P=N.state.lights,oe=N.state.shadowsArray,ce=P.state.version,se=ee.getParameters(o,P.state,oe,A,I),_e=ee.getProgramCacheKey(se);let Se=U.programs;U.environment=o.isMeshStandardMaterial||o.isMeshLambertMaterial||o.isMeshPhongMaterial?A.environment:null,U.fog=A.fog;const Pe=o.isMeshStandardMaterial||o.isMeshLambertMaterial&&!o.envMap||o.isMeshPhongMaterial&&!o.envMap;U.envMap=W.get(o.envMap||U.environment,Pe),U.envMapRotation=U.environment!==null&&o.envMap===null?A.environmentRotation:o.envMapRotation,Se===void 0&&(o.addEventListener("dispose",Ve),Se=new Map,U.programs=Se);let Ie=Se.get(_e);if(Ie!==void 0){if(U.currentProgram===Ie&&U.lightsStateVersion===ce)return ni(o,se),Ie}else se.uniforms=ee.getUniforms(o),o.onBeforeCompile(se,h),Ie=ee.acquireProgram(se,_e),Se.set(_e,Ie),U.uniforms=se.uniforms;const Ee=U.uniforms;return(!o.isShaderMaterial&&!o.isRawShaderMaterial||o.clipping===!0)&&(Ee.clippingPlanes=Q.uniform),ni(o,se),U.needsLights=qa(o),U.lightsStateVersion=ce,U.needsLights&&(Ee.ambientLightColor.value=P.state.ambient,Ee.lightProbe.value=P.state.probe,Ee.directionalLights.value=P.state.directional,Ee.directionalLightShadows.value=P.state.directionalShadow,Ee.spotLights.value=P.state.spot,Ee.spotLightShadows.value=P.state.spotShadow,Ee.rectAreaLights.value=P.state.rectArea,Ee.ltc_1.value=P.state.rectAreaLTC1,Ee.ltc_2.value=P.state.rectAreaLTC2,Ee.pointLights.value=P.state.point,Ee.pointLightShadows.value=P.state.pointShadow,Ee.hemisphereLights.value=P.state.hemi,Ee.directionalShadowMatrix.value=P.state.directionalShadowMatrix,Ee.spotLightMatrix.value=P.state.spotLightMatrix,Ee.spotLightMap.value=P.state.spotLightMap,Ee.pointShadowMatrix.value=P.state.pointShadowMatrix),U.currentProgram=Ie,U.uniformsList=null,Ie}function ti(o){if(o.uniformsList===null){const A=o.currentProgram.getUniforms();o.uniformsList=vn.seqWithValue(A.seq,o.uniforms)}return o.uniformsList}function ni(o,A){const I=a.get(o);I.outputColorSpace=A.outputColorSpace,I.batching=A.batching,I.batchingColor=A.batchingColor,I.instancing=A.instancing,I.instancingColor=A.instancingColor,I.instancingMorph=A.instancingMorph,I.skinning=A.skinning,I.morphTargets=A.morphTargets,I.morphNormals=A.morphNormals,I.morphColors=A.morphColors,I.morphTargetsCount=A.morphTargetsCount,I.numClippingPlanes=A.numClippingPlanes,I.numIntersection=A.numClipIntersection,I.vertexAlphas=A.vertexAlphas,I.vertexTangents=A.vertexTangents,I.toneMapping=A.toneMapping}function Xa(o,A,I,U,P){A.isScene!==!0&&(A=ze),x.resetTextureUnits();const oe=A.fog,ce=U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial?A.environment:null,se=z===null?h.outputColorSpace:z.isXRRenderTarget===!0?z.texture.colorSpace:xn,_e=U.isMeshStandardMaterial||U.isMeshLambertMaterial&&!U.envMap||U.isMeshPhongMaterial&&!U.envMap,Se=W.get(U.envMap||ce,_e),Pe=U.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,Ie=!!I.attributes.tangent&&(!!U.normalMap||U.anisotropy>0),Ee=!!I.morphAttributes.position,We=!!I.morphAttributes.normal,nt=!!I.morphAttributes.color;let et=Mt;U.toneMapped&&(z===null||z.isXRRenderTarget===!0)&&(et=h.toneMapping);const ke=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,ft=ke!==void 0?ke.length:0,ve=a.get(U),ht=N.state.lights;if(Te===!0&&(be===!0||o!==Y)){const lt=o===Y&&U.id===k;Q.setState(U,o,lt)}let Fe=!1;U.version===ve.__version?(ve.needsLights&&ve.lightsStateVersion!==ht.state.version||ve.outputColorSpace!==se||P.isBatchedMesh&&ve.batching===!1||!P.isBatchedMesh&&ve.batching===!0||P.isBatchedMesh&&ve.batchingColor===!0&&P.colorTexture===null||P.isBatchedMesh&&ve.batchingColor===!1&&P.colorTexture!==null||P.isInstancedMesh&&ve.instancing===!1||!P.isInstancedMesh&&ve.instancing===!0||P.isSkinnedMesh&&ve.skinning===!1||!P.isSkinnedMesh&&ve.skinning===!0||P.isInstancedMesh&&ve.instancingColor===!0&&P.instanceColor===null||P.isInstancedMesh&&ve.instancingColor===!1&&P.instanceColor!==null||P.isInstancedMesh&&ve.instancingMorph===!0&&P.morphTexture===null||P.isInstancedMesh&&ve.instancingMorph===!1&&P.morphTexture!==null||ve.envMap!==Se||U.fog===!0&&ve.fog!==oe||ve.numClippingPlanes!==void 0&&(ve.numClippingPlanes!==Q.numPlanes||ve.numIntersection!==Q.numIntersection)||ve.vertexAlphas!==Pe||ve.vertexTangents!==Ie||ve.morphTargets!==Ee||ve.morphNormals!==We||ve.morphColors!==nt||ve.toneMapping!==et||ve.morphTargetsCount!==ft)&&(Fe=!0):(Fe=!0,ve.__version=U.version);let gt=ve.currentProgram;Fe===!0&&(gt=fn(U,A,P));let vt=!1,Ot=!1,kt=!1;const Xe=gt.getUniforms(),ct=ve.uniforms;if(ge.useProgram(gt.program)&&(vt=!0,Ot=!0,kt=!0),U.id!==k&&(k=U.id,Ot=!0),vt||Y!==o){ge.buffers.depth.getReversed()&&o.reversedDepth!==!0&&(o._reversedDepth=!0,o.updateProjectionMatrix()),Xe.setValue(m,"projectionMatrix",o.projectionMatrix),Xe.setValue(m,"viewMatrix",o.matrixWorldInverse);const wt=Xe.map.cameraPosition;wt!==void 0&&wt.setValue(m,ye.setFromMatrixPosition(o.matrixWorld)),qe.logarithmicDepthBuffer&&Xe.setValue(m,"logDepthBufFC",2/(Math.log(o.far+1)/Math.LN2)),(U.isMeshPhongMaterial||U.isMeshToonMaterial||U.isMeshLambertMaterial||U.isMeshBasicMaterial||U.isMeshStandardMaterial||U.isShaderMaterial)&&Xe.setValue(m,"isOrthographic",o.isOrthographicCamera===!0),Y!==o&&(Y=o,Ot=!0,kt=!0)}if(ve.needsLights&&(ht.state.directionalShadowMap.length>0&&Xe.setValue(m,"directionalShadowMap",ht.state.directionalShadowMap,x),ht.state.spotShadowMap.length>0&&Xe.setValue(m,"spotShadowMap",ht.state.spotShadowMap,x),ht.state.pointShadowMap.length>0&&Xe.setValue(m,"pointShadowMap",ht.state.pointShadowMap,x)),P.isSkinnedMesh){Xe.setOptional(m,P,"bindMatrix"),Xe.setOptional(m,P,"bindMatrixInverse");const lt=P.skeleton;lt&&(lt.boneTexture===null&&lt.computeBoneTexture(),Xe.setValue(m,"boneTexture",lt.boneTexture,x))}P.isBatchedMesh&&(Xe.setOptional(m,P,"batchingTexture"),Xe.setValue(m,"batchingTexture",P._matricesTexture,x),Xe.setOptional(m,P,"batchingIdTexture"),Xe.setValue(m,"batchingIdTexture",P._indirectTexture,x),Xe.setOptional(m,P,"batchingColorTexture"),P._colorsTexture!==null&&Xe.setValue(m,"batchingColorTexture",P._colorsTexture,x));const Ut=I.morphAttributes;if((Ut.position!==void 0||Ut.normal!==void 0||Ut.color!==void 0)&&le.update(P,I,gt),(Ot||ve.receiveShadow!==P.receiveShadow)&&(ve.receiveShadow=P.receiveShadow,Xe.setValue(m,"receiveShadow",P.receiveShadow)),(U.isMeshStandardMaterial||U.isMeshLambertMaterial||U.isMeshPhongMaterial)&&U.envMap===null&&A.environment!==null&&(ct.envMapIntensity.value=A.environmentIntensity),ct.dfgLUT!==void 0&&(ct.dfgLUT.value=fd()),Ot&&(Xe.setValue(m,"toneMappingExposure",h.toneMappingExposure),ve.needsLights&&Ya(ct,kt),oe&&U.fog===!0&&xe.refreshFogUniforms(ct,oe),xe.refreshMaterialUniforms(ct,U,Ne,he,N.state.transmissionRenderTarget[o.id]),vn.upload(m,ti(ve),ct,x)),U.isShaderMaterial&&U.uniformsNeedUpdate===!0&&(vn.upload(m,ti(ve),ct,x),U.uniformsNeedUpdate=!1),U.isSpriteMaterial&&Xe.setValue(m,"center",P.center),Xe.setValue(m,"modelViewMatrix",P.modelViewMatrix),Xe.setValue(m,"normalMatrix",P.normalMatrix),Xe.setValue(m,"modelMatrix",P.matrixWorld),U.isShaderMaterial||U.isRawShaderMaterial){const lt=U.uniformsGroups;for(let wt=0,zt=lt.length;wt<zt;wt++){const ii=lt[wt];fe.update(ii,gt),fe.bind(ii,gt)}}return gt}function Ya(o,A){o.ambientLightColor.needsUpdate=A,o.lightProbe.needsUpdate=A,o.directionalLights.needsUpdate=A,o.directionalLightShadows.needsUpdate=A,o.pointLights.needsUpdate=A,o.pointLightShadows.needsUpdate=A,o.spotLights.needsUpdate=A,o.spotLightShadows.needsUpdate=A,o.rectAreaLights.needsUpdate=A,o.hemisphereLights.needsUpdate=A}function qa(o){return o.isMeshLambertMaterial||o.isMeshToonMaterial||o.isMeshPhongMaterial||o.isMeshStandardMaterial||o.isShadowMaterial||o.isShaderMaterial&&o.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return z},this.setRenderTargetTextures=function(o,A,I){const U=a.get(o);U.__autoAllocateDepthBuffer=o.resolveDepthBuffer===!1,U.__autoAllocateDepthBuffer===!1&&(U.__useRenderToTexture=!1),a.get(o.texture).__webglTexture=A,a.get(o.depthTexture).__webglTexture=U.__autoAllocateDepthBuffer?void 0:I,U.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(o,A){const I=a.get(o);I.__webglFramebuffer=A,I.__useDefaultFramebuffer=A===void 0};const Ka=m.createFramebuffer();this.setRenderTarget=function(o,A=0,I=0){z=o,R=A,V=I;let U=null,P=!1,oe=!1;if(o){const se=a.get(o);if(se.__useDefaultFramebuffer!==void 0){ge.bindFramebuffer(m.FRAMEBUFFER,se.__webglFramebuffer),O.copy(o.viewport),F.copy(o.scissor),ie=o.scissorTest,ge.viewport(O),ge.scissor(F),ge.setScissorTest(ie),k=-1;return}else if(se.__webglFramebuffer===void 0)x.setupRenderTarget(o);else if(se.__hasExternalTextures)x.rebindTextures(o,a.get(o.texture).__webglTexture,a.get(o.depthTexture).__webglTexture);else if(o.depthBuffer){const Pe=o.depthTexture;if(se.__boundDepthTexture!==Pe){if(Pe!==null&&a.has(Pe)&&(o.width!==Pe.image.width||o.height!==Pe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");x.setupDepthRenderbuffer(o)}}const _e=o.texture;(_e.isData3DTexture||_e.isDataArrayTexture||_e.isCompressedArrayTexture)&&(oe=!0);const Se=a.get(o).__webglFramebuffer;o.isWebGLCubeRenderTarget?(Array.isArray(Se[A])?U=Se[A][I]:U=Se[A],P=!0):o.samples>0&&x.useMultisampledRTT(o)===!1?U=a.get(o).__webglMultisampledFramebuffer:Array.isArray(Se)?U=Se[I]:U=Se,O.copy(o.viewport),F.copy(o.scissor),ie=o.scissorTest}else O.copy(X).multiplyScalar(Ne).floor(),F.copy(j).multiplyScalar(Ne).floor(),ie=ne;if(I!==0&&(U=Ka),ge.bindFramebuffer(m.FRAMEBUFFER,U)&&ge.drawBuffers(o,U),ge.viewport(O),ge.scissor(F),ge.setScissorTest(ie),P){const se=a.get(o.texture);m.framebufferTexture2D(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_CUBE_MAP_POSITIVE_X+A,se.__webglTexture,I)}else if(oe){const se=A;for(let _e=0;_e<o.textures.length;_e++){const Se=a.get(o.textures[_e]);m.framebufferTextureLayer(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0+_e,Se.__webglTexture,I,se)}}else if(o!==null&&I!==0){const se=a.get(o.texture);m.framebufferTexture2D(m.FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,se.__webglTexture,I)}k=-1},this.readRenderTargetPixels=function(o,A,I,U,P,oe,ce,se=0){if(!(o&&o.isWebGLRenderTarget)){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let _e=a.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&ce!==void 0&&(_e=_e[ce]),_e){ge.bindFramebuffer(m.FRAMEBUFFER,_e);try{const Se=o.textures[se],Pe=Se.format,Ie=Se.type;if(o.textures.length>1&&m.readBuffer(m.COLOR_ATTACHMENT0+se),!qe.textureFormatReadable(Pe)){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!qe.textureTypeReadable(Ie)){Ze("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}A>=0&&A<=o.width-U&&I>=0&&I<=o.height-P&&m.readPixels(A,I,U,P,te.convert(Pe),te.convert(Ie),oe)}finally{const Se=z!==null?a.get(z).__webglFramebuffer:null;ge.bindFramebuffer(m.FRAMEBUFFER,Se)}}},this.readRenderTargetPixelsAsync=async function(o,A,I,U,P,oe,ce,se=0){if(!(o&&o.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let _e=a.get(o).__webglFramebuffer;if(o.isWebGLCubeRenderTarget&&ce!==void 0&&(_e=_e[ce]),_e)if(A>=0&&A<=o.width-U&&I>=0&&I<=o.height-P){ge.bindFramebuffer(m.FRAMEBUFFER,_e);const Se=o.textures[se],Pe=Se.format,Ie=Se.type;if(o.textures.length>1&&m.readBuffer(m.COLOR_ATTACHMENT0+se),!qe.textureFormatReadable(Pe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!qe.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Ee=m.createBuffer();m.bindBuffer(m.PIXEL_PACK_BUFFER,Ee),m.bufferData(m.PIXEL_PACK_BUFFER,oe.byteLength,m.STREAM_READ),m.readPixels(A,I,U,P,te.convert(Pe),te.convert(Ie),0);const We=z!==null?a.get(z).__webglFramebuffer:null;ge.bindFramebuffer(m.FRAMEBUFFER,We);const nt=m.fenceSync(m.SYNC_GPU_COMMANDS_COMPLETE,0);return m.flush(),await er(m,nt,4),m.bindBuffer(m.PIXEL_PACK_BUFFER,Ee),m.getBufferSubData(m.PIXEL_PACK_BUFFER,0,oe),m.deleteBuffer(Ee),m.deleteSync(nt),oe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(o,A=null,I=0){const U=Math.pow(2,-I),P=Math.floor(o.image.width*U),oe=Math.floor(o.image.height*U),ce=A!==null?A.x:0,se=A!==null?A.y:0;x.setTexture2D(o,0),m.copyTexSubImage2D(m.TEXTURE_2D,I,0,0,ce,se,P,oe),ge.unbindTexture()};const $a=m.createFramebuffer(),Za=m.createFramebuffer();this.copyTextureToTexture=function(o,A,I=null,U=null,P=0,oe=0){let ce,se,_e,Se,Pe,Ie,Ee,We,nt;const et=o.isCompressedTexture?o.mipmaps[oe]:o.image;if(I!==null)ce=I.max.x-I.min.x,se=I.max.y-I.min.y,_e=I.isBox3?I.max.z-I.min.z:1,Se=I.min.x,Pe=I.min.y,Ie=I.isBox3?I.min.z:0;else{const ct=Math.pow(2,-P);ce=Math.floor(et.width*ct),se=Math.floor(et.height*ct),o.isDataArrayTexture?_e=et.depth:o.isData3DTexture?_e=Math.floor(et.depth*ct):_e=1,Se=0,Pe=0,Ie=0}U!==null?(Ee=U.x,We=U.y,nt=U.z):(Ee=0,We=0,nt=0);const ke=te.convert(A.format),ft=te.convert(A.type);let ve;A.isData3DTexture?(x.setTexture3D(A,0),ve=m.TEXTURE_3D):A.isDataArrayTexture||A.isCompressedArrayTexture?(x.setTexture2DArray(A,0),ve=m.TEXTURE_2D_ARRAY):(x.setTexture2D(A,0),ve=m.TEXTURE_2D),m.pixelStorei(m.UNPACK_FLIP_Y_WEBGL,A.flipY),m.pixelStorei(m.UNPACK_PREMULTIPLY_ALPHA_WEBGL,A.premultiplyAlpha),m.pixelStorei(m.UNPACK_ALIGNMENT,A.unpackAlignment);const ht=m.getParameter(m.UNPACK_ROW_LENGTH),Fe=m.getParameter(m.UNPACK_IMAGE_HEIGHT),gt=m.getParameter(m.UNPACK_SKIP_PIXELS),vt=m.getParameter(m.UNPACK_SKIP_ROWS),Ot=m.getParameter(m.UNPACK_SKIP_IMAGES);m.pixelStorei(m.UNPACK_ROW_LENGTH,et.width),m.pixelStorei(m.UNPACK_IMAGE_HEIGHT,et.height),m.pixelStorei(m.UNPACK_SKIP_PIXELS,Se),m.pixelStorei(m.UNPACK_SKIP_ROWS,Pe),m.pixelStorei(m.UNPACK_SKIP_IMAGES,Ie);const kt=o.isDataArrayTexture||o.isData3DTexture,Xe=A.isDataArrayTexture||A.isData3DTexture;if(o.isDepthTexture){const ct=a.get(o),Ut=a.get(A),lt=a.get(ct.__renderTarget),wt=a.get(Ut.__renderTarget);ge.bindFramebuffer(m.READ_FRAMEBUFFER,lt.__webglFramebuffer),ge.bindFramebuffer(m.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let zt=0;zt<_e;zt++)kt&&(m.framebufferTextureLayer(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,a.get(o).__webglTexture,P,Ie+zt),m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,a.get(A).__webglTexture,oe,nt+zt)),m.blitFramebuffer(Se,Pe,ce,se,Ee,We,ce,se,m.DEPTH_BUFFER_BIT,m.NEAREST);ge.bindFramebuffer(m.READ_FRAMEBUFFER,null),ge.bindFramebuffer(m.DRAW_FRAMEBUFFER,null)}else if(P!==0||o.isRenderTargetTexture||a.has(o)){const ct=a.get(o),Ut=a.get(A);ge.bindFramebuffer(m.READ_FRAMEBUFFER,$a),ge.bindFramebuffer(m.DRAW_FRAMEBUFFER,Za);for(let lt=0;lt<_e;lt++)kt?m.framebufferTextureLayer(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,ct.__webglTexture,P,Ie+lt):m.framebufferTexture2D(m.READ_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,ct.__webglTexture,P),Xe?m.framebufferTextureLayer(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,Ut.__webglTexture,oe,nt+lt):m.framebufferTexture2D(m.DRAW_FRAMEBUFFER,m.COLOR_ATTACHMENT0,m.TEXTURE_2D,Ut.__webglTexture,oe),P!==0?m.blitFramebuffer(Se,Pe,ce,se,Ee,We,ce,se,m.COLOR_BUFFER_BIT,m.NEAREST):Xe?m.copyTexSubImage3D(ve,oe,Ee,We,nt+lt,Se,Pe,ce,se):m.copyTexSubImage2D(ve,oe,Ee,We,Se,Pe,ce,se);ge.bindFramebuffer(m.READ_FRAMEBUFFER,null),ge.bindFramebuffer(m.DRAW_FRAMEBUFFER,null)}else Xe?o.isDataTexture||o.isData3DTexture?m.texSubImage3D(ve,oe,Ee,We,nt,ce,se,_e,ke,ft,et.data):A.isCompressedArrayTexture?m.compressedTexSubImage3D(ve,oe,Ee,We,nt,ce,se,_e,ke,et.data):m.texSubImage3D(ve,oe,Ee,We,nt,ce,se,_e,ke,ft,et):o.isDataTexture?m.texSubImage2D(m.TEXTURE_2D,oe,Ee,We,ce,se,ke,ft,et.data):o.isCompressedTexture?m.compressedTexSubImage2D(m.TEXTURE_2D,oe,Ee,We,et.width,et.height,ke,et.data):m.texSubImage2D(m.TEXTURE_2D,oe,Ee,We,ce,se,ke,ft,et);m.pixelStorei(m.UNPACK_ROW_LENGTH,ht),m.pixelStorei(m.UNPACK_IMAGE_HEIGHT,Fe),m.pixelStorei(m.UNPACK_SKIP_PIXELS,gt),m.pixelStorei(m.UNPACK_SKIP_ROWS,vt),m.pixelStorei(m.UNPACK_SKIP_IMAGES,Ot),oe===0&&A.generateMipmaps&&m.generateMipmap(ve),ge.unbindTexture()},this.initRenderTarget=function(o){a.get(o).__webglFramebuffer===void 0&&x.setupRenderTarget(o)},this.initTexture=function(o){o.isCubeTexture?x.setTextureCube(o,0):o.isData3DTexture?x.setTexture3D(o,0):o.isDataArrayTexture||o.isCompressedArrayTexture?x.setTexture2DArray(o,0):x.setTexture2D(o,0),ge.unbindTexture()},this.resetState=function(){R=0,V=0,z=null,ge.reset(),J.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(n){this._outputColorSpace=n;const t=this.getContext();t.drawingBufferColorSpace=it._getDrawingBufferColorSpace(n),t.unpackColorSpace=it._getUnpackColorSpace()}}export{Ki as P,ud as W};
