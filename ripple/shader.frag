#define TAU 6.28318530718

uniform float time;
uniform vec2 viewportSize;
uniform float high;
uniform float low;
uniform float segments;

float root(float b, float c, float d, float n) {
    // t^3 + b*t^2 + c*t + d = 0.
    // Always three real roots. Take the n-th one.
    float p = c - b*b/3.0;
    float q = b*(2.0*b*b - 9.0*c)/27.0 + d;
    
    float t = 2.0*sqrt(-p/3.0);
    float phi = (acos(3.0*q/(p*t)) - n*TAU)/3.0;

    return t*cos(phi) - b/3.0;
}

float stripe(float t) {
    return mod(floor(t*segments - time/2.0), 2.0);
}

vec3 color(float t, float top, float bottom) {
    // Normalize to [0, 1].
    float s = (t - top) / (bottom - top);

    float rad = abs(bottom+top-bottom*top/t)/viewportSize.y;
    // Larger radius is darker. More segments is darker.
    float dist = pow(tanh(min(rad,10.0)),2.0)*clamp(sqrt((segments-10.0)/200.0), 0.0, 1.0);

    float stripe = stripe(s);
    vec3 shade = mix(vec3(1.0), vec3(0.7), dist);

    // Higher values are more gold, lower values are more purple.
    // We saturate the colors when the source/sink is far from the middle.
    vec3 purple = mix(vec3(0.7, 0.7, 0.9), vec3(0.8, 0.8, 0.9), -low);
    vec3 gold = mix(vec3(0.8, 0.8, 0.7), vec3(0.9, 0.9, 0.8), high);
    vec3 color = mix(vec3(1.0), mix(purple, gold, s), dist);

    return vec3(stripe*shade*color);
}

void main() {
    float x = gl_PointCoord.x * viewportSize.x;
    float y = -gl_PointCoord.y * viewportSize.y;
    float bottom = low*viewportSize.y;
    float top = high*viewportSize.y;

    // t^3 + b*t^2 + c*t + d = 0.
    float b = -2.0*(top + bottom);
    float c = 2.0*(top + y)*(bottom + y) - x*x - 3.0*y*y;
    float d = -2.0*top*bottom*y;

    float t = root(b, c, d, time/16.0);
    vec3 col = color(t, top, bottom);

    gl_FragColor = vec4(col, 1.0);
}