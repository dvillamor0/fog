let program;
let img;

const slider1 = document.getElementById('slider1');
const slider2 = document.getElementById('slider2');
const colorPicker = document.getElementById('colorPicker');

function preload() {
    img = loadImage('assets/f-texture.png');
}

function setup() {
    canvas = createCanvas(window.innerWidth, window.innerHeight * 0.8, WEBGL);
    canvas.parent('canvas');
    setAttributes('depth', true);

    const vertexShader = `
        #ifdef GL_ES
        precision mediump float;
        #endif
        
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        
        attribute vec3 aPosition;
        attribute vec2 aTexCoord;
        attribute vec3 aNormal;
        
        varying vec2 vTexCoord;
        varying vec3 vNormal;
        
        void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aPosition, 1.0);
        vTexCoord = aTexCoord;
        vNormal = aNormal;
        }
    `;

    const fragmentShader = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    varying vec2 vTexCoord;
    
    uniform sampler2D u_texture;
    uniform vec4 u_fogColor;
    uniform float u_fogNear;
    uniform float u_fogFar;
    
    void main() {
        vec4 color = texture2D(u_texture, vTexCoord);

        float depth = gl_FragCoord.z / gl_FragCoord.w;
        float fogFactor = (depth - u_fogNear) / (u_fogFar - u_fogNear);
        fogFactor = clamp(fogFactor, 0.0, 1.0);
        
        vec4 foggedColor = mix(color, u_fogColor, fogFactor);
        
        gl_FragColor = foggedColor;
    }

`;  

    program = createShader(vertexShader, fragmentShader);
    windowResized();
}

let rotacion = 0;

let nearFog = 700.0;
let farFog = 900.0;
let color = {
    r: 255,
    g: 255,
    b: 255
};

function draw() {

    program.setUniform('u_texture', img);
    program.setUniform('u_fogColor', [color.r/255, color.g/255, color.b/255, 1.0]);
    program.setUniform('u_fogNear', nearFog);
    program.setUniform('u_fogFar', farFog);

    shader(program);

    background(100);
    ambientLight(128);
    directionalLight(255, 255, 255, 10, 10, 0);
    orbitControl();

    push();
    translate(-70, 0, 0);
    rotate(1, [0, 1, -0.5]);
    for (let i = 0; i < 10; i++) {
        push();
        translate(i * 100, 0, 0);
        rotate(-rotacion, [0.7, 0, 0.4]);
        rotacion += 0.001;

        texture(img);
        box(50);

        pop();
    }
    pop();

    resetShader();
}

slider1.addEventListener('input', handleSliderChange);
slider2.addEventListener('input', handleSliderChange);
colorPicker.addEventListener('input', handleColorChange);

function handleSliderChange(event) {
    nearFog = slider1.value/10;
    farFog = slider2.value/10;

    console.log('near:', nearFog);
    console.log('far:', farFog);
}
function handleColorChange(event) {
    const selectedColor = colorPicker.value;
    color = hexToRgb(selectedColor);
    console.log('Selected color:', color);
    
}

function hexToRgb(hex) {
    hex = hex.replace('#', '');

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return {
        r: r,
        g: g,
        b: b
    };
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight * 0.8);
  }