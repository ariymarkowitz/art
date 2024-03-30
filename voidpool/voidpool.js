function setup() {
	createCanvas(windowWidth, windowHeight);
	background(100);
}

function circ(y, low, high) {
	const y2 = y+2*(low-y) + (low-y)*2*high/y;
	if (!Number.isFinite(y2)) {
		line(-width, 0, width, 0);
	}
	circle(0, (y + y2)/2, (y2-y)/2);
}

function clerp(a, b, t) {
    t = Math.max(0, Math.min(1, t));
    return lerp(a, b, t);
}

function ease(a, b, delta) {
    if (a == null) {
        return b;
    }
    const decay = 0.99;
    const totalDecay = Math.pow(decay, delta);
    return a*totalDecay + b*(1-totalDecay);
}

let n = 0;

let low = null;
let high = null;
let spacing = null;

function draw() {
	ellipseMode(RADIUS);
	
    spacing = ease(spacing, Math.max(1, (width-mouseX)/100), deltaTime);
    low = ease(low, clerp(0.9*height/2, 10, mouseY/height), deltaTime);
    high = ease(high, clerp(10, 0.9*height/2, mouseY/height), deltaTime);
	const s = -1/(60*1000/126)/2;
	
	n += s*deltaTime;
    let n2 = n*spacing + low;

    n2 = n2 % (2*spacing);
    const startId = Math.ceil((-high - n2)/spacing);
    const endId = Math.floor((low - n2)/spacing);
	
    const zeroId = Math.floor((-n2)/spacing);
    background(zeroId % 2 ? 0 : 255);

    noStroke();

	translate(width/2, height/2);
	for (let i=zeroId; i >= startId; i--) {
        fill(i % 2 ? 255 : 0);
		circ(i*spacing+n2, low, high);
	}
    for (let i=zeroId+1; i <= endId; i++) {
        fill(i % 2 ? 0 : 255);
		circ(i*spacing+n2, low, high);
	}
}