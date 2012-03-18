window.onload = function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var shaders = [context.loadShader("vshader"), context.loadShader("fshader")];
    var camera = new jsglet.context.Camera(context, "u_MVPMatrix");
    context.program.attachShader(shaders[0]);
    context.program.attachShader(shaders[1]);
    context.program.link();

    var triangleVertices = new Float32Array([
        10, 10, 0,
        10, 110, 0,
        110, 10, 0
    ]);

    var triangleColors = new Float32Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
    ]);

    var triangleVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);

    var triangleColorsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleColorsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleColors, gl.STATIC_DRAW);

    function reshape(context, gl) {
	    gl.viewport(0, 0, context.width, context.height);
    }

    function draw(context, gl) {
        reshape(context, gl);
        var mvpMatrix = camera.makeModelViewProjectionMatrix();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        var vertexHandle = context.program.attribIndex("vertex");
        gl.enableVertexAttribArray(vertexHandle);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
        gl.vertexAttribPointer(vertexHandle, 3, gl.FLOAT, false, 0, 0);

        var colorHandle = context.program.attribIndex("color");
        gl.enableVertexAttribArray(colorHandle);
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVerticesBuffer);
        gl.vertexAttribPointer(colorHandle, 3, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(mvpMatrixHandle, false, mvpMatrix);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    document.getElementById("start").onclick = function() {
        setInterval(function(){draw(context, context.gl)}, 500);
    };
};
