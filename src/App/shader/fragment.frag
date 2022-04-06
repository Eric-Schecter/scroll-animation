#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

uniform vec3 uLightColor;
uniform float uIntensity;
uniform vec3 uColor;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;

vec3 reflectedLight(vec3 light){
  vec3 ambient=light;
  vec3 diffuse=uLightColor*dot(vNormal,vSurfaceToLight);
  return ambient+diffuse;
}

void main(){
  vec2 uv=gl_FragCoord.xy;
  
  vec3 light=reflectedLight(uLightColor);
  light*=uIntensity;
  vec3 noiseColors=vec3(snoise2(uv)*.5+.5);
  noiseColors.r*=pow(light.r,5.);
  noiseColors.g*=pow(light.g,5.);
  noiseColors.b*=pow(light.b,5.);
  gl_FragColor=vec4(noiseColors+uColor,1.);
}