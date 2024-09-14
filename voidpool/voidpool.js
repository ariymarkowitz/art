import * as THREE from 'three'

function ease(a, b, delta) {
    if (a == null) {
        return b;
    }
    const decay = 0.99;
    const totalDecay = Math.pow(decay, delta);
    return a*totalDecay + b*(1-totalDecay);
}

function clerp(a, b, t) {
    const lerp = t*b + (1-t)*a
    const min = Math.min(a, b)
    const max = Math.max(a, b)
    return Math.min(max, Math.max(min, lerp))
}

const vertexShader = await fetch('shader.vert').then(res => res.text())
const fragmentShader = await fetch('shader.frag').then(res => res.text())

const scene = new THREE.Scene()

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
const geometry = new THREE.PlaneGeometry(2, 2)

let width, height

let high = 0.8;
let low = -0.1;
let segments = 10;

const material = new THREE.ShaderMaterial( {
    uniforms: {
        time: { value: 0 },
        viewportSize: { value: new THREE.Vector2() },
        high: { value: high },
        low: { value: low },
        segments: { value: segments }
    },
    vertexShader, fragmentShader
} )

const plane = new THREE.Mesh(geometry, material)
scene.add(plane)

let prevTime = null;

function animate(time) {
    material.uniforms.time.value = time / 1000 * (126/60)
    material.uniforms.viewportSize.value.set(width, height)

    const deltaTime = prevTime != null ? time - prevTime : 0

    material.uniforms.high.value = ease(material.uniforms.high.value, high, deltaTime)
    material.uniforms.low.value = ease(material.uniforms.low.value, low, deltaTime)
    material.uniforms.segments.value = ease(material.uniforms.segments.value, segments, deltaTime)

    renderer.render(scene, camera)
    prevTime = time
    requestAnimationFrame(animate)
}

const renderer = new THREE.WebGLRenderer()
function setBounds() {
    width = window.innerWidth * window.devicePixelRatio
    height = window.innerHeight * window.devicePixelRatio
    renderer.setSize(window.innerWidth, window.innerHeight)
}
renderer.setPixelRatio(window.devicePixelRatio)
setBounds()
window.addEventListener('resize', setBounds)
window.addEventListener('pointermove', (e) => {
    if (!e.isPrimary) return
    segments = clerp(10, window.innerWidth/4, e.x / window.innerWidth)
    high = clerp(0.9, 0.02, e.y / window.innerHeight)
    low = clerp(-0.02, -0.9, e.y / window.innerHeight)
})

document.body.appendChild(renderer.domElement)

requestAnimationFrame(animate)