function drawSun(mat, trans, scale) {
  mat4.rotateZ(mat, mat, degToRad(sun_deg));
  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }
  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }

  gl.uniform4f(u_diffuseColor, 0.5, 0.5, 0.5, 1);
  if (isSundown == 0.0) {
    gl.uniform1i(u_sunlight, 1);
    gl.uniform1i(u_pointlight, 0);
  }
  else {
    gl.uniform1i(u_sunlight, 0);
    gl.uniform1i(u_pointlight, 1);
  }

  var object_sphere = uvSphere(0.8, 32, 16);
  installModel(object_sphere);
  mat4.rotateX(mat, mat, degToRad(250));
  mat4.scale(mat, mat, [0.5, 0.5, 0.5]);

  if (isSundown == 0.0) {
    gl.uniform4f(u_lightPosition, mat[12], mat[13], mat[14], 0);
  }

  update(object_sphere);

  mat4.scale(mat, mat, [2, 2, 2]);
  mat4.rotateX(mat, mat, -degToRad(250));

  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }
  mat4.rotateZ(mat, mat, -degToRad(sun_deg));
}