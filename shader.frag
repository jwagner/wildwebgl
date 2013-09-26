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

float dist(vec3 p){
    vec3 repeat = vec3(25.0*sin(iGlobalTime*0.1), 35.0*cos(iGlobalTime*0.1), 30.0*(sin(iGlobalTime*0.25+0.5)));
    vec3 q = mod(p, repeat) - 0.5*repeat;
    return length(q)-1.0;
    return min(length(p)-1.0, length(p+vec3(cos(iGlobalTime), 0.0, sin(iGlobalTime))*2.0)-0.1);
}

void main(){
    vec3 p = vec3(gl_FragCoord.xy / iResolution.xy, 0.0)*2.0-1.0;
    // aspect
    p.x *= iResolution.z;
    vec3 offset = vec3(1.0, 0.2, -0.3)*iGlobalTime*50.0*0.05;
    vec3 origin = vec3(sin(iGlobalTime*0.01), 1.0, cos(iGlobalTime*0.01))*10.0+offset;
    vec3 lookAt = vec3(0.0, 0.0, 0.0)+offset;
    vec3 rd = rayDirection(origin, lookAt, p);
    vec3 t = origin;
    float d = 1.0;
    #ifdef GL_FRAGMENT_PRECISION_HIGH
        const vec3 epsilon = vec3(0.001, 0.0, 0.0);
        const int samples = 15;
    #else
        vec3 epsilon = vec3(0.01, 0.0, 0.0);
        const int samples = 9;
    #endif

    for(int i = 0; i < samples; i++){
        if(abs(d) > 0.01){
            d = dist(t);
            t += rd*d;
        }
    }
    vec3 n = normalize(vec3(
        dist(t+epsilon)-dist(t-epsilon),
        dist(t+epsilon.yxz)-dist(t-epsilon.yxz),
        dist(t+epsilon.zyx)-dist(t-epsilon.zyx)
    ));
    vec3 c = vec3(1.0, 0.4, 0.6)*(dot(n, normalize(vec3(0.5, 1.0, 0.5)))+0.3);
    /*c /= length(t-origin)*0.02;*/
    c = c.bgr+c.r*n.grb;
    float fog = exp(0.005*-length(t-origin));
    c = mix(c, vec3(0.1, 0.1, 0.1), 1.0-fog);
    /*c = pow(c, vec3(1.0/2.2));*/
    // looks better in linear
    gl_FragColor = vec4(c, 1.0);
    /*gl_FragColor = vec4(iResolution.xy,0.0, 1.0);*/
    /*gl_FragColor = vec4(abs(rd), 1.0);*/
}
