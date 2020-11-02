function drawCar(mat, trans, scale) {
  mat4.rotate(mat, mat, degToRad(250), [1, 0, 0]);
  mat4.rotate(mat, mat, -degToRad(car_deg), [0, 0, 1]);
  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }
  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }

  gl.uniform4f(u_diffuseColor, 1, 0, 0, 1); // red car
  gl.uniform1i(u_sunlight, 0);

  // part 1
  gl.uniform1i(u_pointlight, 1);
  var object_cube1 = cube(1);

  installModel(object_cube1);
  mat4.scale(mat, mat, [1.6, 1, 0.35]);
  mat4.translate(mat, mat, [0, -3, 2]);

  update(object_cube1);

  mat4.translate(mat, mat, [0, 3, -2]);
  mat4.scale(mat, mat, [1 / 1.6, 1, 1 / 0.35]);

  // part 2
  var object_cube2 = cube(1);

  installModel(object_cube2);
  mat4.scale(mat, mat, [0.8, 1, 0.25]);
  mat4.translate(mat, mat, [0.1, -3, 4]);

  update(object_cube2);

  mat4.translate(mat, mat, [-0.1, 3, -4]);
  mat4.scale(mat, mat, [1 / 0.8, 1, 1 / 0.25]);

  // part 3
  gl.uniform4f(u_diffuseColor, 0.9, 0.9, 0.9, 1); // grey headlights

  if (isSundown == 1.0) {
    gl.uniform1i(u_pointlight, 0);
    gl.uniform1i(u_sunlight, 1);
    gl.uniform1i(u_headlight, 1);
  }
  else {
    gl.uniform1i(u_pointlight, 1);
    gl.uniform1i(u_sunlight, 0);
    gl.uniform1i(u_headlight, 0);
  }

  var object_cylinder1 = uvCylinder(1, 1, 32, 0, 1);
  installModel(object_cylinder1);

  mat4.rotateY(mat, mat, -degToRad(90));
  mat4.scale(mat, mat, [0.08, 0.08, 0.05]);
  mat4.translate(mat, mat, [8.8, -34, 16]);
  gl.uniform4f(u_leftLightPosition, mat[12], mat[13], mat[14], 1); // get the location of left light

  mat4.rotateX(mat, mat, degToRad(30));
  mat4.translate(mat, mat, [-10, 50, 100]);
  gl.uniform4f(u_carLightDirection, mat[12], mat[13], mat[14], 1); // get the direction of headlight
  mat4.translate(mat, mat, [10, -50, -100]);
  mat4.rotateX(mat, mat, -degToRad(30));

  update(object_cylinder1);

  mat4.translate(mat, mat, [-8.8, 34, -16]);
  mat4.scale(mat, mat, [1 / 0.08, 1 / 0.08, 1 / 0.05]);
  mat4.rotateY(mat, mat, degToRad(90));


  // part 4
  var object_cylinder2 = uvCylinder(1, 1, 32, 0, 0);
  installModel(object_cylinder2);

  mat4.rotateY(mat, mat, -degToRad(90));
  mat4.scale(mat, mat, [0.08, 0.08, 0.05]);
  mat4.translate(mat, mat, [8.6, -41, 16]);
  gl.uniform4f(u_rightLightPosition, mat[12], mat[13], mat[14], 1); // get the location of right light

  update(object_cylinder2);

  mat4.translate(mat, mat, [-8.6, 41, -16]);
  mat4.scale(mat, mat, [1 / 0.08, 1 / 0.08, 1 / 0.05]);
  mat4.rotateY(mat, mat, degToRad(90));

  // part 5
  gl.uniform1i(u_sunlight, 0);
  gl.uniform1i(u_pointlight, 1);

  gl.uniform4f(u_diffuseColor, 0, 0, 0, 1); // black wheels

  drawWheel(mat, [-0.6, -3.5, 0.58], [0.25, 0.25, 0.25]);

  drawWheel(mat, [-0.6, -2.5, 0.58], [0.25, 0.25, 0.25]);

  drawWheel(mat, [0.6, -2.5, 0.58], [0.25, 0.25, 0.25]);

  drawWheel(mat, [0.6, -3.5, 0.58], [0.25, 0.25, 0.25]);

  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }

  mat4.rotate(mat, mat, degToRad(car_deg), [0, 0, 1]);
  mat4.rotate(mat, mat, -degToRad(250), [1, 0, 0]);
}

function drawWheel(mat, trans, scale) {

  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }
  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }

  mat4.rotate(mat, mat, wheel_deg, [0, 1, 0]); // rotate the wheels

  // part 1
  var object_cylinder1 = uvCylinder(1, 1, 32, 0, 0);
  installModel(object_cylinder1);

  mat4.rotateY(mat, mat, degToRad(20));
  mat4.scale(mat, mat, [0.07, 0.1, 1]);


  update(object_cylinder1);

  mat4.scale(mat, mat, [1 / 0.07, 10, 1]);
  mat4.rotateY(mat, mat, -degToRad(20));

  // part 2
  var object_cylinder2 = uvCylinder(1, 1, 32, 0, 0);
  installModel(object_cylinder2);

  mat4.rotateY(mat, mat, degToRad(80));
  mat4.scale(mat, mat, [0.07, 0.1, 1]);


  update(object_cylinder2);

  mat4.scale(mat, mat, [1 / 0.07, 10, 1]);
  mat4.rotateY(mat, mat, -degToRad(80));

  // part 3
  var object_cylinder3 = uvCylinder(1, 1, 32, 0, 0);
  installModel(object_cylinder3);

  mat4.rotateY(mat, mat, degToRad(140));
  mat4.scale(mat, mat, [0.07, 0.1, 1]);


  update(object_cylinder3);

  mat4.scale(mat, mat, [1 / 0.07, 10, 1]);
  mat4.rotateY(mat, mat, -degToRad(140));


  mat4.rotate(mat, mat, -wheel_deg, [0, 1, 0]);

  // part 4
  var object_cylinder4 = uvCylinder(2, 0.2, 32, 0, 0);
  installModel(object_cylinder4);

  mat4.scale(mat, mat, [0.07, 0.1, 1]);
  update(object_cylinder4);
  mat4.scale(mat, mat, [1 / 0.07, 10, 1]);

  // part 5
  var object_torus = uvTorus(2, 1, 32, 16);
  installModel(object_torus);

  mat4.rotateX(mat, mat, degToRad(90));
  mat4.scale(mat, mat, [0.5, 0.5, 0.5]);


  update(object_torus);

  mat4.scale(mat, mat, [2, 2, 2]);
  mat4.rotateX(mat, mat, -degToRad(90));

  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }

}