function drawTree(mat, trans, scale) {
  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }

  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }

  // part 1
  gl.uniform1i(u_sunlight, 0);
  gl.uniform1i(u_pointlight, 0);

  gl.uniform4f(u_diffuseColor, 0.35, 0.16, 0.14, 1); // brown trunk

  var object_cylinder = uvCylinder(1, 2, 32, 0, 0);
  installModel(object_cylinder);
  mat4.rotateX(mat, mat, degToRad(250));
  mat4.scale(mat, mat, [0.2, 0.2, 0.5]);

  update(object_cylinder);

  mat4.scale(mat, mat, [5, 5, 2]);
  mat4.rotateX(mat, mat, -degToRad(250));

  // part 2
  gl.uniform4f(u_diffuseColor, 0.137255, 0.556863, 0.137255, 1); // green tree

  var object_cone = uvCone(1.2, 2, 32, 0);
  installModel(object_cone);
  mat4.rotateX(mat, mat, degToRad(250));
  mat4.scale(mat, mat, [0.5, 0.5, 0.8]);
  mat4.translate(mat, mat, [0, 0, 1.2]);

  update(object_cone);

  mat4.translate(mat, mat, [0, 0, -1.2]);
  mat4.scale(mat, mat, [2, 2, 1.0 / 0.8]);
  mat4.rotateX(mat, mat, -degToRad(250));

  // be care about the order !!!
  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }
}