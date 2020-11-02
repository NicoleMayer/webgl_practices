"use strict";

var gl;                 // The webgl context.

var a_coords_loc;       // Location of the a_coords attribute variable in the shader program.
var a_coords_buffer;    // Buffer to hold the values for a_coords.
var a_normal_loc;       // Location of a_normal attribute.
var a_normal_buffer;    // Buffer for a_normal.
var index_buffer;       // Buffer to hold vetex indices from model.

var u_diffuseColor;     // Locations of uniform variables in the shader program
var u_specularColor;
var u_specularExponent;
var u_lightPosition;
var u_modelview;
var u_projection;
var u_normalMatrix;

var projection = mat4.create();          // projection matrix
var modelview;                           // modelview matrix; value comes from rotator
var normalMatrix = mat3.create();        // matrix, derived from model and view matrix, for transforming normal vectors
var rotator;                             // A TrackballRotator to implement rotation by mouse.

var lastTime = 0;
var colors = [  // RGB color arrays for diffuse and specular color values
    [1, 1, 1],
];

var lightPositions = [  // values for light position
    [0, 0, 0, 1],
];

var objects = [         // Objects for display
    chair(), table(), cube(),
];

var currentModelNumber;  // contains data for the current object


function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

//Generates a perspective projection matrix with the given bounds. 
//Passing null/undefined/no value for far will generate infinite projection matrix.
function perspective(out, fovy, aspect, near, far) {

    if (document.getElementById("my_gl").checked) {
        /*
       TODO: Your code goes here.
       Write the code to perform perspective transformation. 
       Think about what would be the input and output to the function would be
       */
        var f = 1.0 / Math.tan(fovy / 2);
        var nf;
        out[0] = f / aspect;
        out[1] = 0;
        out[2] = 0;
        out[3] = 0;
        out[4] = 0;
        out[5] = f;
        out[6] = 0;
        out[7] = 0;
        out[8] = 0;
        out[9] = 0;
        out[11] = -1;
        out[12] = 0;
        out[13] = 0;
        out[15] = 0;
        //refer the official code
        if (far != null && far !== Infinity) {
            nf = 1 / (near - far);
            out[10] = (far + near) * nf;
            out[14] = (2 * far * near) * nf;
        } else {
            out[10] = -1;
            out[14] = -2 * near;
        }
        return out;
    }
    else {
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform perspective projection
        */
        mat4.perspective(out, fovy, aspect, near, far);


    }
}

function translate(out, a, v) {

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform translation transformation. 
        Think about what would be the input and output to the function would be
        */
        var offset_x = v[0], offset_y = v[1], offset_z = v[2];
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        out[3] = a[3];
        out[4] = a[4];
        out[5] = a[5];
        out[6] = a[6];
        out[7] = a[7];
        out[8] = a[8];
        out[9] = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[0] * offset_x + a[4] * offset_y + a[8] * offset_z + a[12];
        out[13] = a[1] * offset_x + a[5] * offset_y + a[9] * offset_z + a[13];
        out[14] = a[2] * offset_x + a[6] * offset_y + a[10] * offset_z + a[14];
        out[15] = a[3] * offset_x + a[7] * offset_y + a[11] * offset_z + a[15];

        return out;
    }
    else {
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform translation
        */
        mat4.translate(out, a, v);
    }
}

function rotate(out, a, rad, axis) {

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform rotation about ARBITARY axis.
        Note: One of the input to this function would be axis vector around which you would rotate. 
        Think about what would be the input and output to the function would be
        */
        var axis_x = axis[0], axis_y = axis[1], axis_z = axis[2];
        var len = Math.hypot(axis_x, axis_y, axis_z);
        if (len < glMatrix.EPSILON) { return null; } // refer the official code 
        axis_x /= len;
        axis_y /= len;
        axis_z /= len;

        var sin_value = Math.sin(rad);
        var cos_value = Math.cos(rad);
        var one_minux_cos = 1 - cos_value
        var r1, r2, r3, r4, r5, r6, r7, r8, r9;
        var a00, a01, a02, a03, a10, a11, a12, a13, a20, a21, a22, a23; //since we may modify the origin modelview
        r1 = axis_x * axis_x * one_minux_cos + cos_value;
        r2 = axis_y * axis_x * one_minux_cos + axis_z * sin_value;
        r3 = axis_z * axis_x * one_minux_cos - axis_y * sin_value;
        r4 = axis_x * axis_y * one_minux_cos - axis_z * sin_value;
        r5 = axis_y * axis_y * one_minux_cos + cos_value;
        r6 = axis_z * axis_y * one_minux_cos + axis_x * sin_value;
        r7 = axis_x * axis_z * one_minux_cos + axis_y * sin_value;
        r8 = axis_y * axis_z * one_minux_cos - axis_x * sin_value;
        r9 = axis_z * axis_z * one_minux_cos + cos_value;

        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];

        out[0] = a00 * r1 + a10 * r2 + a20 * r3;
        out[1] = a01 * r1 + a11 * r2 + a21 * r3;
        out[2] = a02 * r1 + a12 * r2 + a22 * r3;
        out[3] = a03 * r1 + a13 * r2 + a23 * r3;
        out[4] = a00 * r4 + a10 * r5 + a20 * r6;
        out[5] = a01 * r4 + a11 * r5 + a21 * r6;
        out[6] = a02 * r4 + a12 * r5 + a22 * r6;
        out[7] = a03 * r4 + a13 * r5 + a23 * r6;
        out[8] = a00 * r7 + a10 * r8 + a20 * r9;
        out[9] = a01 * r7 + a11 * r8 + a21 * r9;
        out[10] = a02 * r7 + a12 * r8 + a22 * r9;
        out[11] = a03 * r7 + a13 * r8 + a23 * r9;
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }
    else {
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform rotation
        */
        mat4.rotate(out, a, rad, axis);
    }

}

function scale(out, a, v) {

    if (document.getElementById("my_gl").checked) {
        /*
        TODO: Your code goes here.
        Write the code to perform scale transformation. 
        Think about what would be the input and output to the function would be
        */
        let scale_x = v[0], scale_y = v[1], scale_z = v[2];
        out[0] = a[0] * scale_x;
        out[1] = a[1] * scale_x;
        out[2] = a[2] * scale_x;
        out[3] = a[3] * scale_x;
        out[4] = a[4] * scale_y;
        out[5] = a[5] * scale_y;
        out[6] = a[6] * scale_y;
        out[7] = a[7] * scale_y;
        out[8] = a[8] * scale_z;
        out[9] = a[9] * scale_z;
        out[10] = a[10] * scale_z;
        out[11] = a[11] * scale_z;
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
        return out;
    }
    else {
        /*
        TODO: Your code goes here.
        use inbuilt_gl functions to perform scaling
        */
        mat4.scale(out, a, v);
    }
}



function draw() {
    gl.clearColor(0.15, 0.15, 0.3, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    mat4.perspective(projection, Math.PI / 5, 1, 10, 20);
    modelview = rotator.getViewMatrix();

    // draw the 1st chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    /*
    TODO: Your code goes here. 
    Compute all the necessary transformation to align object[0] (chair)
    Use your own functions with the proper inputs i.e
        1. translate()
        2. scale()
        3. rotate()
    Apply those transformation to the modelview matrix.
    Not all the transformations are relative and they keep on adding as you modify modelview. 
    Hence, you might want to reverse the previous transformation. Keep in mind the order
    in which you apply transformation.
    */

    translate(modelview, modelview, [-1, 0, 0]);
    rotate(modelview, modelview, degToRad(180), [0, 1, 0]);
    update_uniform(modelview, projection, 0);


    // draw the 2nd chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    //TODO: Your code goes here.
    translate(modelview, modelview, [-0.15, 0, -1.5]);
    rotate(modelview, modelview, degToRad(90), [0, 1, 0]);
    update_uniform(modelview, projection, 0);


    // draw the 3rd chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    //TODO: Your code goes here. 
    translate(modelview, modelview, [-0.15, 0, -1.5]);
    rotate(modelview, modelview, degToRad(90), [0, 1, 0]);
    update_uniform(modelview, projection, 0);


    // draw the 4th chair , object[0]
    installModel(objects[0]);
    currentModelNumber = 0;

    //TODO: Your code goes here. 
    translate(modelview, modelview, [-0.15, 0, -1.5]);
    rotate(modelview, modelview, degToRad(90), [0, 1, 0]);
    update_uniform(modelview, projection, 0);


    // draw the Table , object[1]
    installModel(objects[1]);
    currentModelNumber = 1;

    //TODO: Your code goes here. 
    translate(modelview, modelview, [-0.9, 0.55, -0.58]);
    rotate(modelview, modelview, degToRad(90), [0, 1, 0]);
    update_uniform(modelview, projection, 1);


    // draw the Cube , object[2]
    installModel(objects[2]);
    currentModelNumber = 2;

    //TODO: Your code goes here. 
    translate(modelview, modelview, [0.1, 0.45, 0]);
    scale(modelview, modelview, [0.3, 0.3, 0.3]);
    update_uniform(modelview, projection, 2);

}

/*
  this function assigns the computed values to the uniforms for the model, view and projection 
  transform
*/
function update_uniform(modelview, projection, currentModelNumber) {

    /* Get the matrix for transforming normal vectors from the modelview matrix,
       and send matrices to the shader program*/
    mat3.normalFromMat4(normalMatrix, modelview);

    gl.uniformMatrix3fv(u_normalMatrix, false, normalMatrix);
    gl.uniformMatrix4fv(u_modelview, false, modelview);
    gl.uniformMatrix4fv(u_projection, false, projection);
    gl.drawElements(gl.TRIANGLES, objects[currentModelNumber].indices.length, gl.UNSIGNED_SHORT, 0);
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


/* Initialize the WebGL context.  Called from init() */
function initGL() {
    var prog = createProgram(gl, "vshader-source", "fshader-source");
    gl.useProgram(prog);
    a_coords_loc = gl.getAttribLocation(prog, "a_coords");
    a_normal_loc = gl.getAttribLocation(prog, "a_normal");
    u_modelview = gl.getUniformLocation(prog, "modelview");
    u_projection = gl.getUniformLocation(prog, "projection");
    u_normalMatrix = gl.getUniformLocation(prog, "normalMatrix");
    u_lightPosition = gl.getUniformLocation(prog, "lightPosition");
    u_diffuseColor = gl.getUniformLocation(prog, "diffuseColor");
    u_specularColor = gl.getUniformLocation(prog, "specularColor");
    u_specularExponent = gl.getUniformLocation(prog, "specularExponent");
    a_coords_buffer = gl.createBuffer();
    a_normal_buffer = gl.createBuffer();
    index_buffer = gl.createBuffer();
    gl.enable(gl.DEPTH_TEST);
    gl.uniform3f(u_specularColor, 0.5, 0.5, 0.5);
    gl.uniform4f(u_diffuseColor, 1, 1, 1, 1);
    gl.uniform1f(u_specularExponent, 10);
    gl.uniform4f(u_lightPosition, 0, 0, 0, 1);
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
 * initialization function that will be called when the page has loaded
 */
function init() {
    try {
        var canvas = document.getElementById("myGLCanvas");
        gl = canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
        if (!gl) {
            throw "Browser does not support WebGL";
        }
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not get a WebGL graphics context.</p>";
        return;
    }

    try {
        initGL();  // initialize the WebGL graphics context
    }
    catch (e) {
        document.getElementById("canvas-holder").innerHTML =
            "<p>Sorry, could not initialize the WebGL graphics context:" + e + "</p>";
        return;
    }

    document.getElementById("my_gl").checked = false;
    document.getElementById("my_gl").onchange = draw;
    rotator = new TrackballRotator(canvas, draw, 15);
    draw();
}







