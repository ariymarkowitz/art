uniform float time;
uniform vec2 viewportSize;
uniform float high;
uniform float low;
uniform float segments;

float halley(float b, float c, float d, float x) {
    float f = x*x*x + b*x*x + c*x + d;
    float df = 3.0*x*x + 2.0*b*x + c;
    float ddf = 6.0*x + 2.0*b;

    return x - (2.0*f*df)/(2.0*df*df - f*ddf);
}

float halleyIrrational(float b, float c, float d, float x) {
    // For some reason, x needs to be negative for the discriminant to be positive.
    float s = x < 0.0 ? 1.0 : -1.0;
    b *= s;
    d *= s;
    x *= s;
    
    float f = x*x*x + b*x*x + c*x + d;
    float df = 3.0*x*x + 2.0*b*x + c;
    float ddf = 6.0*x + 2.0*b;

    float disc = df*df - 2.0*f*ddf;

    if (disc < 0.0 || ddf < 0.001) {
        // Use rational Halley
        return (x - (2.0*f*df)/(2.0*df*df - f*ddf))*s;
    } else {
        return (x - (df + sqrt(disc))/ddf)*s;
    }
}

float gradient(float t, float x, float y, float a, float b) {
    // dt/dx = (2 t x)/(2 a b-4 a t-4 b t+3 t^2-x^2+2 a y+2 b y-y^2)
    float dt_dx = 2.0*t*x / (2.0*a*b - 4.0*a*t - 4.0*b*t + 3.0*t*t - x*x + 2.0*a*y + 2.0*b*y - y*y);

    // dt/dy = (2 (a b-a t-b t+t y))/(2 a b-4 a t-4 b t+3 t^2-x^2+2 a y+2 b y-y^2)
    float dt_dy = 2.0*(a*b - a*t - b*t + t*y) / (2.0*a*b - 4.0*a*t - 4.0*b*t + 3.0*t*t - x*x + 2.0*a*y + 2.0*b*y - y*y);

    return sqrt(dt_dx*dt_dx + dt_dy*dt_dy);
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

    // The root is always between the local minimum and maximum.
    float inflection = -b/(3.0);

    // When y and either a or b is small, the root is close to a local extremum.
    // Halley's irrational method gets the root quickly.
    float v1 = halleyIrrational(b, c, d, inflection);
    float v2 = halleyIrrational(b, c, d, v1);
    float v3 = halleyIrrational(b, c, d, v2);
    float v4 = halleyIrrational(b, c, d, v3);

    // Using irrational halley introduces some small inconsistencies
    // (because we sometimes change the function) so we do one step of rational Halley.
    float t = halley(b, c, d, v4);

    // Anti-aliasing
    float grad = gradient(t, x, y, top, bottom);
    vec3 c1 = color(t, top, bottom);
    vec3 c2 = color(t + grad*0.5, top, bottom);
    vec3 c3 = color(t - grad*0.5, top, bottom);

    gl_FragColor = vec4((c1 + c2 + c3)/3.0, 1.0);
}