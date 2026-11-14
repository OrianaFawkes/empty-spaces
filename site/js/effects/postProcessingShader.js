export const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = `
  uniform sampler2D uScene;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uFisheye;
  uniform float uVignette;
  uniform float uBlur;
  uniform float uChromatic;
  uniform float uGrain;
  uniform float uExposure;

  varying vec2 vUv;

  float randomNoise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  vec3 acesToneMap(vec3 x) {
    x *= uExposure;
    return clamp(
      (x * (2.51 * x + 0.03)) /
      (x * (2.43 * x + 0.59) + 0.14),
      0.0,
      1.0
    );
  }

  vec3 sampleScene(vec2 uv) {
    vec2 texel = 1.0 / uResolution;
    vec2 radial = uv - 0.5;
    vec2 direction = radial / max(length(radial), 0.0001);
    vec2 ca = direction * uChromatic * texel;
    vec2 bx = vec2(uBlur * texel.x, 0.0);
    vec2 by = vec2(0.0, uBlur * texel.y);

    vec3 center = texture2D(uScene, clamp(uv, 0.001, 0.999)).rgb;
    vec3 left = texture2D(uScene, clamp(uv - bx, 0.001, 0.999)).rgb;
    vec3 right = texture2D(uScene, clamp(uv + bx, 0.001, 0.999)).rgb;
    vec3 up = texture2D(uScene, clamp(uv + by, 0.001, 0.999)).rgb;
    vec3 down = texture2D(uScene, clamp(uv - by, 0.001, 0.999)).rgb;

    vec3 soft = center * 0.4 + (left + right + up + down) * 0.15;

    float red = texture2D(uScene, clamp(uv + ca, 0.001, 0.999)).r;
    float blue = texture2D(uScene, clamp(uv - ca, 0.001, 0.999)).b;

    return vec3(red, soft.g, blue);
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    vec2 p = (vUv - 0.5) * 2.0;
    p.x *= aspect;

    float radiusSquared = dot(p, p);

    // Static lens strength: scrolling never changes the background.
    p *= 1.0 + uFisheye * radiusSquared;

    vec2 warped = p;
    warped.x /= aspect;

    vec2 sampleUv = warped * 0.5 + 0.5;

    float outside = max(
      max(-sampleUv.x, sampleUv.x - 1.0),
      max(-sampleUv.y, sampleUv.y - 1.0)
    );

    float validFrame = 1.0 - smoothstep(0.0, 0.10, outside);

    vec3 color = sampleScene(clamp(sampleUv, 0.001, 0.999));
    vec3 edgeColor = vec3(0.035, 0.055, 0.060);
    color = mix(edgeColor, color, validFrame);

    float edge = length(vUv - 0.5);
    float vignette = smoothstep(0.24, 0.76, edge);
    color *= 1.0 - vignette * uVignette;

    float grain = randomNoise(gl_FragCoord.xy + uTime) - 0.5;
    color += grain * uGrain;
    color = acesToneMap(color);

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;
