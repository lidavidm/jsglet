window.onload = function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    context.program.attachShader(context.loadShader("vshader"));
    context.program.attachShader(context.loadShader("fshader"));
    context.program.link();
    var camera = new jsglet.context.Camera(context, "u_MVPMatrix");
    
    var pacman = new jsglet.graphics.sprite.Sprite(context.program);

    function reshape() {
        gl.viewport(0, 0, context.width, context.height);
    }

    function draw() {
        reshape();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();
        pacman.draw();
    }

    var fpsCounter = document.getElementById("fps");

    jsglet.clock.scheduleInterval(function() {
        fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
    }, 1000 / 30);

    context.onDraw(draw);

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.KeyCode.UP) {
            pacman.positionDelta(10, 0);
        }
    });
    document.getElementById("start").onclick = function() {
        jsglet.app.run();
    };
};
