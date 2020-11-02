function drawLamp(mat, trans, scale, isPointLight, pointLightPosition) {
  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }
  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }
  // part 1
  gl.uniform4f(u_diffuseColor, 0.33, 0.33, 0.35, 1); // grey pole

  var object_cylinder = uvCylinder(0.08, 1.6, 32, 0, 0);

  installModel(object_cylinder);
  mat4.rotateX(mat, mat, degToRad(250));

  update(object_cylinder);

  mat4.rotateX(mat, mat, -degToRad(250));

  // part 2
  gl.uniform4f(u_diffuseColor, 0, 0, 0, 1); // black sphere

  if (isSundown == 1.0) {
    gl.uniform1i(u_sunlight, 1);
    gl.uniform1i(u_pointlight, 0);
  }
  else {
    gl.uniform1i(u_sunlight, 0);
    gl.uniform1i(u_pointlight, 1);
  }

  var object_sphere = uvSphere(0.3, 32, 16);
  installModel(object_sphere);
  mat4.rotateX(mat, mat, degToRad(250));
  mat4.scale(mat, mat, [0.5, 0.5, 0.5]);
  mat4.translate(mat, mat, [0, 0, 1.7]);

  if (isSundown == 1.0) {
    gl.uniform4f(u_lightPosition, mat[12], mat[13], mat[14], 1);
  }
  update(object_sphere);

  mat4.translate(mat, mat, [0, 0, -1.7]);
  mat4.scale(mat, mat, [2, 2, 2]);
  mat4.rotateX(mat, mat, -degToRad(250));

  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }
}