function drawStreet(mat, trans, scale) {
  if (trans != null) {
    mat4.translate(mat, mat, trans);
  }

  if (scale != null) {
    mat4.scale(mat, mat, scale);
  }
  // part 1
  gl.uniform4f(u_diffuseColor, 0.6, 0.6, 0.45, 1); // grey road
  var object_ring = ring(1.2, 0.7, 32);
  installModel(object_ring);
  mat4.rotateX(mat, mat, degToRad(250));
  mat4.scale(mat, mat, [2, 2, 2]);
  mat4.translate(mat, mat, [0, 0, 0.1]);

  update(object_ring);

  mat4.translate(mat, mat, [0, 0, -0.1]);
  mat4.scale(mat, mat, [1 / 2, 1 / 2, 1 / 2]);
  mat4.rotateX(mat, mat, -degToRad(250));


  // part 2
  gl.uniform4f(u_diffuseColor, 0.6, 0.8, 0.55, 1); // green street
  var object_cylinder = uvCylinder(3, 0.3, 32, 0, 0);
  installModel(object_cylinder);
  mat4.rotateX(mat, mat, degToRad(250));

  update(object_cylinder);

  mat4.rotateX(mat, mat, -degToRad(250));

  if (scale != null) {
    mat4.scale(mat, mat, scale.map(a => 1 / a));
  }

  if (trans != null) {
    mat4.translate(mat, mat, trans.map(a => -a));
  }
}