#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif
uniform float iGlobalTime;
uniform vec3 iResolution;

vec3 rayDirection(vec3 origin, vec3 lookAt, vec3 position) {
    vec3 direction = normalize(lookAt-origin);
    vec3 right = normalize(cross(direction, vec3(0.0, 1.0, 0.0)));
    vec3 up = normalize(cross(right, direction));
    return normalize(position.x*right + position.y*up + 4.0*direction);
    return normalize(direction + position);
}

const int iters = 8;
const float fixedRadius = 1.0;
const float fR2 = fixedRadius * fixedRadius;
/*float minRadius = abs(sin(iGlobalTime*0.01))*0.9+0.01;*/
float minRadius = 0.5;//abs(sin(iGlobalTime*0.01))*0.9+0.01;
float MR2 = minRadius * minRadius;
float SCALE = 1.01;
float DE(vec3 position)
{
    vec4 scalevec = vec4(SCALE, SCALE, SCALE, abs(SCALE)) / MR2;
  float C1 = abs(SCALE-1.0), C2 = pow(abs(SCALE), float(1-iters));

  // distance estimate
  vec4 p = vec4(position.xyz, 1.0), p0 = vec4(position.xyz, 1.0);  // p.w is knighty's DEfactor
  for (int i=0; i<iters; i++) {
    p.xyz = clamp(p.xyz, -1.0, 1.0) * 2.0 - p.xyz;  // box fold: min3, max3, mad3
    float r2 = dot(p.xyz, p.xyz);  // dp3
    p.xyzw *= clamp(max(MR2/r2, MR2), 0.0, 1.0);  // sphere fold: div1, max1.sat, mul4
    p.xyzw = p*scalevec + p0;  // mad4
  }
  return (length(p.xyz) - C1) / p.w - C2;
}

float dist(vec3 p){
    return DE(p);
    return length(p)+1.0;
    vec3 repeat = vec3(25.0*sin(iGlobalTime*0.1), 35.0*cos(iGlobalTime*0.1), 30.0*(sin(iGlobalTime*0.25+0.5)));
    vec3 q = mod(p, repeat) - 0.5*repeat;
    return length(q)-1.0;
    return min(length(p)-1.0, length(p+vec3(cos(iGlobalTime), 0.0, sin(iGlobalTime))*2.0)-0.1);
}

void main(){
    vec3 p = vec3(gl_FragCoord.xy / iResolution.xy, 0.0)*2.0-1.0;
    // aspect
    p.x *= iResolution.z;
    vec3 offset = vec3(1.0, 0.2, -0.3)*iGlobalTime*10.0*0.05;
    /*vec3 offset = vec3(0.0);*/
    float a = 0.3;
    vec3 origin = vec3(sin(iGlobalTime*a), 0.01, cos(iGlobalTime*a))*(500.0+iGlobalTime*0.0)+offset;
    /*vec3 origin = vec3(0., 0., -150.0+log(iGlobalTime*1.0)*60.0);*/
    vec3 lookAt = vec3(0.0, 0.0, 0.0)+offset;
    vec3 rd = rayDirection(origin, lookAt, p);
    vec3 t = origin;
    float d = 1.0;
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        const vec3 epsilon = vec3(0.01, 0.0, 0.0);
        const int samples = 128;
    #else
        vec3 epsilon = vec3(0.01, 0.0, 0.0);
        const int samples = 9;
    #endif

    float glow = 0.0;
    for(int i = 0; i < samples; i++){
        if(abs(d) > 0.01){
            d = dist(t)*1.0;
            glow += clamp(1.0-d, 0.0, 1.0);
            t += rd*d;
        }
    }
    vec3 n = normalize(vec3(
        dist(t+epsilon)-dist(t-epsilon),
        dist(t+epsilon.yxz)-dist(t-epsilon.yxz),
        dist(t+epsilon.zyx)-dist(t-epsilon.zyx)
    ));
    vec3 c = vec3(0.3, 0.4, 1.1)*(dot(n, normalize(vec3(0.5, 1.0, 0.5)))+0.3);
    c += vec3(0.9, 0.5, 0.0)*dot(n, normalize(vec3(-1.0, 0.1, 0.3)));
    c += vec3(0.0, 0.1, 0.3);
    /*c /= length(t-origin)*0.02;*/
    /*c = c.bgr+c.r*n.grb;*/
    float fog = exp(0.004*-length(t-origin));
    c += 0.03*glow*vec3(0.2, 0.5, 1.0);
    c = mix(c, vec3(0.4, 0.2, 0.1), 1.0-fog);
    /*c = pow(c, vec3(1.0/2.2));*/
    // looks better in linear
    gl_FragColor = vec4(c*2.0, 1.0);
    /*gl_FragColor = vec4(iResolution.xy,0.0, 1.0);*/
    /*gl_FragColor = vec4(abs(rd), 1.0);*/
}
