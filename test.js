module._finishLoadingModules(['jsglet.core', 'jsglet.context', 'jsglet.graphics'], function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var shaders = [context.loadShader("vshader"), context.loadShader("fshader")];
    context.program.attachShader(shaders[0]);
    context.program.attachShader(shaders[1]);
    context.program.link();
    context.program.mvpUniform("u_MVPMatrix");
    var camera = new jsglet.context.Camera(context);

    var s = new jsglet.graphics.sprite.Sprite(context.program, {});

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
