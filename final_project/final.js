var gl;
var canvas;

var shaderProgram;

var a_coords_buffer;
var a_normal_buffer;
var index_buffer;

var a_coords_loc;
var a_normal_loc;

var projection = mat4.create();    // projection matrix
var modelview = mat4.create();     // modelview matrix; value comes from rotator
var normalMatrix = mat3.create();  // matrix, derived from modelview matrix, for transforming normal vectors
var rotator;                       // A TrackballRotator to implement rotation by mouse.
var viewDistance = 20;

var u_modelview;
var u_projection;
var u_normalMatrix;

var u_diffuseColor;
var u_specularColor;
var u_specularExponent;
var u_lightPosition;
var u_leftLightPosition;
var u_rightLightPosition;
var u_carLightDirection;

var u_sunlight;
var u_pointlight;
var u_headlight;

var sun_deg = 0;
var car_deg = 0;
var wheel_deg = 0;

var isSundown = 0;

/* Initialize the WebGL context. */
function initGL() {
	shaderProgram = createProgram(gl, "vshader-source", "fshader-source");
	gl.useProgram(shaderProgram);

	a_coords_loc = gl.getAttribLocation(shaderProgram, "a_coords");
	a_normal_loc = gl.getAttribLocation(shaderProgram, "a_normal");
	u_modelview = gl.getUniformLocation(shaderProgram, "modelview");
	u_projection = gl.getUniformLocation(shaderProgram, "projection");
	u_normalMatrix = gl.getUniformLocation(shaderProgram, "normalMatrix");

	u_diffuseColor = gl.getUniformLocation(shaderProgram, "diffuseColor");
	u_specularColor = gl.getUniformLocation(shaderProgram, "specularColor");
	u_specularExponent = gl.getUniformLocation(shaderProgram, "specularExponent");

	u_lightPosition = gl.getUniformLocation(shaderProgram, "lightPosition");
	u_leftLightPosition = gl.getUniformLocation(shaderProgram, "leftLightPosition");
	u_rightLightPosition = gl.getUniformLocation(shaderProgram, "rightLightPosition");
	u_carLightDirection = gl.getUniformLocation(shaderProgram, "carLightDirection");

	u_sunlight = gl.getUniformLocation(shaderProgram, "pointlight");
	u_pointlight = gl.getUniformLocation(shaderProgram, "sunlight");
	u_headlight = gl.getUniformLocation(shaderProgram, "headlight");

	isSunDown = gl.getUniformLocation(shaderProgram, "isSunDown");

	a_coords_buffer = gl.createBuffer();
	a_normal_buffer = gl.createBuffer();
	index_buffer = gl.createBuffer();
	gl.enable(gl.DEPTH_TEST);

	gl.uniform4f(u_diffuseColor, 0, 1, 1, 1);
	gl.uniform3f(u_specularColor, 0.5, 0.5, 0.5);
	gl.uniform1f(u_specularExponent, 5);

	gl.uniform4f(u_lightPosition, 0, 0, 0, 1);
	gl.uniform4f(u_leftLightPosition, 0, 0, 0, 1);
	gl.uniform4f(u_rightLightPosition, 0, 0, 0, 1);
	gl.uniform4f(u_carLightDirection, 0, 0, 0, 1);

	gl.uniform1i(u_sunlight, 0);
	gl.uniform1i(u_pointlight, 1);
	gl.uniform1i(u_headlight, 0);
}

/* Creates a program for use in the WebGL context gl, and returns the
 * identifier for that program.  If an error occurs while compiling or
 * linking the program, an exception of type String is thrown.  The error
 * string contains the compilation or linking error.  If no error occurs,
 * the program identifier is the return value of the function.
 *    The second and third parameters are the id attributes for <script>
 * elementst that contain the source code for the vertex and fragment
 * shaders.
 */
function createProgram(gl, vertexShaderID, fragmentShaderID) {
	function getTextContent(elementID) {
		// This nested function retrieves the text content of an
		// element on the web page.  It is used here to get the shader
		// source code from the script elements that contain it.
		var element = document.getElementById(elementID);
		var node = element.firstChild;
		var str = "";
		while (node) {
			if (node.nodeType == 3) // this is a text node
				str += node.textContent;
			node = node.nextSibling;
		}
		return str;
	}
	try {
		var vertexShaderSource = getTextContent(vertexShaderID);
		var fragmentShaderSource = getTextContent(fragmentShaderID);
	}
	catch (e) {
		throw "Error: Could not get shader source code from script elements.";
	}
	var vsh = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vsh, vertexShaderSource);
	gl.compileShader(vsh);
	if (!gl.getShaderParameter(vsh, gl.COMPILE_STATUS)) {
		throw "Error in vertex shader:  " + gl.getShaderInfoLog(vsh);
	}
	var fsh = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fsh, fragmentShaderSource);
	gl.compileShader(fsh);
	if (!gl.getShaderParameter(fsh, gl.COMPILE_STATUS)) {
		throw "Error in fragment shader:  " + gl.getShaderInfoLog(fsh);
	}
	var prog = gl.createProgram();
	gl.attachShader(prog, vsh);
	gl.attachShader(prog, fsh);
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		throw "Link error in program:  " + gl.getProgramInfoLog(prog);
	}
	return prog;
}


/**
 * Subroutine which converts from degrees to radians
 * @param {float} degrees Angle in degrees
 * @return Value of angle in radians
 */
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}

/**
 * Function to verify if a value is a power of 2 or not
 * @param {int} value Value to determine whether or not it is a power of 2
 * @return {boolean} Boolean indicating whether a value is a power of 2 (true) or not (false)
 */
function isPowerOf2(value) {
	return (value & (value - 1)) == 0;
}

/* 
 * Called and data for the model are copied into the appropriate buffers, and the 
 * scene is drawn.
 */
function installModel(modelData) {
	gl.bindBuffer(gl.ARRAY_BUFFER, a_coords_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexPositions, gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_coords_loc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_coords_loc);
	gl.bindBuffer(gl.ARRAY_BUFFER, a_normal_buffer);
	gl.bufferData(gl.ARRAY_BUFFER, modelData.vertexNormals, gl.STATIC_DRAW);
	gl.vertexAttribPointer(a_normal_loc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_normal_loc);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index_buffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, modelData.indices, gl.STATIC_DRAW);
}

function update(modelData) {
	/* Get the matrix for transforming normal vectors from the modelview matrix,
		 and send matrices to the shader program*/

	mat3.normalFromMat4(normalMatrix, modelview);

	gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
	gl.uniformMatrix4fv(u_modelview, false, modelview);
	gl.uniformMatrix4fv(u_projection, false, projection);
	gl.drawElements(gl.TRIANGLES, modelData.indices.length, gl.UNSIGNED_SHORT, 0);
}

function draw() {

	if (sun_deg > 65 && sun_deg < 65 + 180) {
		isSundown = 1.0;
	} else {
		isSundown = 0.0;
	}

	gl.clearColor(0, 0, 0, 1); // background color

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	mat4.perspective(projection, Math.PI / 5, 1, 10, viewDistance + 10);
	modelview = rotator.getViewMatrix();

	mat4.rotateX(modelview, modelview, 340);

	drawStreet(modelview, null, [1.6, 1.6, 1.6]);
	drawLamp(modelview, [0, 0.8, 0], null);

	drawTree(modelview, [0.9, 0.4, -0.6], [0.7, 0.7, 0.7]);
	drawTree(modelview, [-0.9, 0.9, 0.9], [0.8, 0.8, 0.8]);
	drawTree(modelview, [-0.5, 0.1, -1.2], [0.5, 0.5, 0.5]);

	drawTree(modelview, [4.1, 0.15, -1], [0.5, 0.5, 0.5]);
	drawTree(modelview, [3.8, 0.1, -1.2], [0.35, 0.35, 0.35]);
	drawTree(modelview, [4, 0.15, -0.6], [0.3, 0.3, 0.3]);

	drawTree(modelview, [0, 1.9, 4.2], [0.25, 0.25, 0.25]);

	drawTree(modelview, [1.6, -1, -3.8], [0.25, 0.25, 0.25]);
	drawTree(modelview, [1, -1.1, -4.1], [0.35, 0.35, 0.35]);
	drawTree(modelview, [-2, -0.8, -3.7], [0.5, 0.5, 0.5]);

	drawSun(modelview, [-3.5, 5, 0], null);
	drawCar(modelview, null, null, car_deg);

	mat4.rotateX(modelview, modelview, -340);

	if (document.getElementById("animate").checked == true) {
		sun_deg += 1;
		car_deg += 2;
		wheel_deg += 8;
		sun_deg = sun_deg % 360;
		car_deg = car_deg % 360;
		wheel_deg = wheel_deg % 360;
	}
}

/**
* Function to create a WebGL context upon startup
* @param {canvas} canvas Canvas object for the program
* @return WebGL context
*/
function createGLContext(canvas) {
	var names = ["webgl", "experimental-webgl"];
	var context = null;
	for (var i = 0; i < names.length; i++) {
		try {
			context = canvas.getContext(names[i]);
		} catch (e) { }
		if (context) {
			break;
		}
	}
	if (context) {
		context.viewportWidth = canvas.width;
		context.viewportHeight = canvas.height;
	} else {
		alert("Failed to create WebGL context!");
	}
	return context;
}

/**
 * Function for doing the initialization work of the program and kicking off
 *   the animation callback
 * @return None
 */
function startup() {
	canvas = document.getElementById("myGLCanvas");
	gl = createGLContext(canvas);
	gl.clearColor(0, 0, 0, 1); //background color
	gl.enable(gl.DEPTH_TEST);

	try {
		initGL();  // initialize the WebGL graphics context
	}
	catch (e) {
		document.getElementById("canvas-holder").innerHTML =
			"<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
		return;
	}
	rotator = new TrackballRotator(canvas, draw, viewDistance);
	document.getElementById("animate").checked = false;
	document.getElementById("animate").onchange = function () {
		tick();
	};
	draw();
}

/**
 * Callback function to perform draw each frame
 * @return None
 */
function tick() {
	if (document.getElementById("animate").checked) {
		requestAnimFrame(tick);
		draw();
	}
}