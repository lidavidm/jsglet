window.onload = function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var shaders = [context.loadShader("vshader"), context.loadShader("fshader")];
    context.program.attachShader(shaders[0]);
    context.program.attachShader(shaders[1]);
    context.program.link();
    var camera = new jsglet.context.Camera(context, "u_MVPMatrix");

    var triangleVertices = new Float32Array([
        10, 10, 0,
        10, 110, 0,
        110, 10, 0
    ]);

    var triangleColors = new Float32Array([
        0, 1, 1,
        1, 0, 1,
        1, 1, 0
    ]);

    var b = new jsglet.graphics.MultiBufferObject(
        context.gl,
        context.program.attribIndices,
        context.gl.TRIANGLES
    ).
        buffer('v3f/static', triangleVertices).
        buffer('c3f/static', triangleColors);
    console.log(b);

    function reshape() {
	    gl.viewport(0, 0, context.width, context.height);
    }

    function draw() {
        reshape();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();
        b.draw();
    }
    context.draw = draw;
    context.onDraw(draw);
    document.getElementById("start").onclick = function() {
        //setInterval(function(){draw(context, context.gl)}, 500);
        jsglet.app.run();
    };
};
