require(["jsglet/core", "jsglet/context"], function(jsglet) {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var program = new jsglet.graphics.Program(gl, {
        //"a_Color": jsglet.graphics.AttribRole.COLOR,
        "a_Texture": jsglet.graphics.AttribRole.TEXTURE,
        "a_Position": jsglet.graphics.AttribRole.VERTEX
    });
    program.mvpUniform("u_MVPMatrix");
    program.textureUniform("u_Texture");
    context.program.addProgram("basic", program);
    var camera = null;
    $.when(context.loadShaderAjax("shaders/vertex.vs", jsglet.graphics.VERTEX_SHADER),
           context.loadShaderAjax("shaders/fragment.fs", jsglet.graphics.FRAGMENT_SHADER)).
        then(function() {
            console.log(arguments);
            program.attachShader(arguments[0]);
            program.attachShader(arguments[1]);
            program.link();
            context.program.useProgram("basic");
            camera = new jsglet.context.Camera(context);
        }).then(function() {
            var textureD = jsglet.image.load(context.gl,
                                             document.getElementById("texture").src,
                                             program.textureUniform());
            $.when(textureD).then(function(texture) {
                s = new jsglet.graphics.sprite.Sprite(context.gl, texture, {});
            });
        });

    var s = null;

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
