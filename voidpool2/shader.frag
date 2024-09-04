uniform float time;
uniform vec2 viewportSize;
uniform float high;
uniform float low;
uniform float segments;

float valueAt(float x, float y, float lowv, float highv) {
    float A = lowv + highv;
    float B = lowv * highv;

    float a = (y-A);
    float b = B - x*x - y*(y-A);
    float c = -B*y;

    float t = 2.0*c/(sqrt(b*b - 4.0*a*c) - b);
    return (t - highv) / (lowv - highv);
}

float shadeAt(float x, float y, float lowv, float highv) {
    float t = valueAt(x, y, lowv, highv);
    return t * segments - time/2.0;
}

float typeof(float n) {
    return mod(floor(n), 2.0);
}

void main() {
    float x = gl_PointCoord.x * viewportSize.x;
    float y = -gl_PointCoord.y * viewportSize.y;

    float absLow = low*viewportSize.y;
    float absHigh = high*viewportSize.y;

    float t = valueAt(x, y, absLow, absHigh);

    float v1 = shadeAt(x, y, absLow, absHigh);
    float v2 = shadeAt(x, y+0.5, absLow, absHigh);
    float v3 = shadeAt(x, y-0.5, absLow, absHigh);
    float v4 = shadeAt(x+0.5, y, absLow, absHigh);
    float v5 = shadeAt(x-0.5, y, absLow, absHigh);
    float v6 = shadeAt(x+0.5, y+0.5, absLow, absHigh);
    float v7 = shadeAt(x-0.5, y+0.5, absLow, absHigh);
    float v8 = shadeAt(x+0.5, y-0.5, absLow, absHigh);
    float v9 = shadeAt(x-0.5, y-0.5, absLow, absHigh);

    float maxv = max(max(max(max(v1, v2), v3), v4), v5);
    float minv = min(min(min(min(v1, v2), v3), v4), v5);
    float maxtype = typeof(maxv);
    float mintype = typeof(minv);
    //float shade = (maxtype*(maxv - floor(maxv)) + mintype*(ceil(minv) - minv) + 0.5*(floor(maxv)-ceil(minv)))/(maxv-minv);
    float shade = (typeof(v1) + typeof(v2) + typeof(v3) + typeof(v4) + typeof(v5) + typeof(v6) + typeof(v7) + typeof(v8) + typeof(v9))/9.0;

    gl_FragColor = vec4(vec3(shade), 1.0);
}