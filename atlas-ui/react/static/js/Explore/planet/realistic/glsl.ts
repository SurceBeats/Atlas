// atlas-ui/react/static/js/Explore/planet/realistic/glsl.ts
//
// Shared GLSL for the realistic planet renderer: noise (simplex, fbm, ridged, cellular)
// and lighting helpers. Everything works on the unit sphere in the planet's own frame,
// so features turn with the planet.

// 3D simplex noise, from "webgl-noise" by Ian McEwan / Ashima Arts (MIT licence)
export const NOISE = /* glsl */ `
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
`;

// Lighting shared by the surface and the clouds
export const LIGHTING = /* glsl */ `
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
`;
