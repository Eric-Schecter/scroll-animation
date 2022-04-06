uniform vec3 uLightPos;

varying vec3 vNormal;
varying vec3 vSurfaceToLight;

void main(){
  vNormal=normalize(normalMatrix*normal);
  vec3 worldPosition=(modelMatrix*vec4(position,1.)).xyz;
  vec3 worldLightPos=(viewMatrix*vec4(uLightPos,1.)).xyz;
  vSurfaceToLight=normalize(worldLightPos-worldPosition);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}