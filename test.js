require(["jsglet/core", "jsglet/context"], function(jsglet) {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var shaders = [context.loadShader("vshader"), context.loadShader("fshader")];
    var program = new jsglet.graphics.Program(gl, {
        "a_Color": jsglet.graphics.AttribRole.COLOR,
        "a_Position": jsglet.graphics.AttribRole.VERTEX
    });
    program.attachShader(shaders[0]);
    program.attachShader(shaders[1]);
    program.link();
    program.mvpUniform("u_MVPMatrix");
    context.program.addProgram("basic", program);
    context.program.useProgram("basic");
    var camera = new jsglet.context.Camera(context);

    var s = new jsglet.graphics.sprite.Sprite(context.gl, {});

    function reshape() {
	    gl.viewport(0, 0, context.width, context.height);
    }

    function draw() {
        reshape();

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();
        s.draw();
    }

    var fpsCounter = document.getElementById("fps");

    jsglet.clock.scheduleInterval(function() {
        //camera.rotateZAbout(Math.PI / 30, 15, 15);
        fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
    }, 1000 / 30);

    context.onDraw(draw);

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.keyboard.KeyCode.UP) {
            e.preventDefault();
            s.sizeDelta(10, 10);
        }
    });
    document.getElementById("start").onclick = function() {
        jsglet.app.run();
    };
});
