window.onload = function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    context.program.attachShader(context.loadShader("vshader"));
    context.program.attachShader(context.loadShader("fshader"));
    context.program.link();
    var camera = new jsglet.context.Camera(context, "u_MVPMatrix");

    var triangleVertices = new Float32Array([
        10, 10, 0,
        20, 10, 0,
        15, 30, 0,
        10, 10, 0
    ]);

    var triangleColors = new Float32Array([
        1, 1, 1,
        1, 1, 1,
        1, 1, 1,
        1, 1, 1
    ]);

    var b = new jsglet.graphics.MultiBufferObject(
        context.gl,
        context.program.attribIndices,
        context.gl.LINE_STRIP
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

    var fpsCounter = document.getElementById("fps");

    jsglet.clock.scheduleInterval(function() {
        fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
    }, 1000 / 30);

    context.onDraw(draw);

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.KeyCode.UP) {
            e.preventDefault();
            triangleVertices[1] += 1;
            triangleVertices[4] += 1;
            triangleVertices[7] += 1;
            triangleVertices[10]+= 1;
            b.updateVertex(triangleVertices);
            triangleColors[0] = 0.5;
            b.updateColor(triangleColors);
        }
    });
    document.getElementById("start").onclick = function() {
        jsglet.app.run();
    };
};
