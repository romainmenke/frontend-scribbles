function main() {
	Array.from(document.querySelectorAll("canvas")).forEach((canvas) => {
		setupCanvas(canvas);
	});
}

async function setupCanvas(canvas) {
	let gl = canvas.getContext("webgl");
	if (!gl) {
		return;
	}

	resize(gl);

	let program = initShaderProgram(gl, vsSource, fsSource);
	gl.useProgram(program);

	// look up where the vertex data needs to go.
	var positionAttributeLocation = gl.getAttribLocation(program, "a_position");

	// Create a buffer and put three 2d clip space points in it
	var positionBuffer = gl.createBuffer();

	// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	var positions = [
		-1, -1, -1, 1, 0, -1,
		0, -1, -1, 1, 0, 1,

		0, -1, 0, 1, 1, -1,
		1, -1, 0, 1, 1, 1,
	];
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// Tell WebGL how to convert from clip space to pixels
	gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

	// Clear the canvas
	gl.clearColor(0, 0, 0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);

	// Tell it to use our program (pair of shaders)
	gl.useProgram(program);

	// Turn on the attribute
	gl.enableVertexAttribArray(positionAttributeLocation);

	// Bind the position buffer.
	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

	// Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
	var size = 2;          // 2 components per iteration
	var type = gl.FLOAT;   // the data is 32bit floats
	var normalize = false; // don't normalize the data
	var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
	var offset = 0;        // start at the beginning of the buffer
	gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

	let inputTimeUniform = gl.getUniformLocation(program, "input_time");

	window.requestAnimationFrame((now) => {
		renderLoop(gl, inputTimeUniform, now);
	});
}

function renderLoop(gl, inputTimeUniform, now) {
	renderOnce(gl, inputTimeUniform, now);

	window.requestAnimationFrame((now) => {
		renderLoop(gl, inputTimeUniform, now);
	});
}

function renderOnce(gl, inputTimeUniform, now) {
	gl.uniform1f(inputTimeUniform, now);
	gl.drawArrays(gl.TRIANGLES, 0, 12);
}

function initShaderProgram(gl, vsSource, fsSource) {
	const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
	const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

	// Create the shader program

	const shaderProgram = gl.createProgram();
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	// If creating the shader program failed, alert

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
		return null;
	}

	return shaderProgram;
}

function loadShader(gl, type, source) {
	const shader = gl.createShader(type);

	// Send the source to the shader object

	gl.shaderSource(shader, source);

	// Compile the shader program

	gl.compileShader(shader);

	// See if it compiled successfully

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
		gl.deleteShader(shader);
		return null;
	}

	return shader;
}

function resize(gl) {
	const realToCSSPixels = window.devicePixelRatio;

	// Lookup the size the browser is displaying the canvas in CSS pixels
	// and compute a size needed to make our drawingbuffer match it in
	// device pixels.
	const displayWidth  = Math.floor(gl.canvas.clientWidth  * realToCSSPixels);
	const displayHeight = Math.floor(gl.canvas.clientHeight * realToCSSPixels);

	// Check if the canvas is not the same size.
	if (gl.canvas.width  !== displayWidth ||
		gl.canvas.height !== displayHeight) {

		// Make the canvas the same size
		gl.canvas.width  = displayWidth;
		gl.canvas.height = displayHeight;
	}
}

const vsSource = `
attribute vec4 a_position;

void main() {
	gl_Position = a_position;
}
`;

const fsSource = `
precision mediump float;

uniform float input_time;

float PHI = 1.61803398874989484820459 * 00000.1;
float PI  = 3.14159265358979323846264 * 00000.1;
float SQ2 = 1.41421356237309504880169 * 10000.0;

float gold_noise(vec2 coordinate, float seed) {
	return fract(tan(distance(coordinate*(seed+PHI), vec2(PHI, PI)))*SQ2);
}

void main() {
	vec4 fragColor = vec4(
		0.0,
		0.0,
		0.0,
		gold_noise(ceil(gl_FragCoord.xy), input_time)
	);

	gl_FragColor = fragColor;
}
`;

(function() {
	let init = () => {
		if (document.readyState !== 'complete') {
			return;
		}

		init = () => {}; // noop

		main();
	};

	document.addEventListener('readystatechange', () => {
		init();
	}, false);

	init();
}());
