require.config({
    baseUrl: "/"
});
require(["jsglet/core"], function(jsglet) {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var batch = new jsglet.graphics.Batch();
    batch_ = batch;
    var program = new jsglet.graphics.Program({
        "a_Texture": jsglet.graphics.AttribRole.TEXTURE,
        "a_Position": jsglet.graphics.AttribRole.VERTEX
    });
    program.mvpUniform("u_MVPMatrix");
    program.textureUniform("u_Texture");
    context.program.addProgram("basic", program);

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    var camera = null;
    var batch = new jsglet.graphics.Batch();
    var animation = null;
    var blinker = null;

    $.when(jsglet.graphics.loadShader("resources/shaders/vertex.vs",
                                      jsglet.graphics.VERTEX_SHADER),
           jsglet.graphics.loadShader("resources/shaders/fragment.fs",
                                      jsglet.graphics.FRAGMENT_SHADER)
    ).then(function() {
        program.attachShader(arguments[0]);
        program.attachShader(arguments[1]);
        program.link();
        context.program.useProgram("basic");

        camera = new jsglet.context.Camera(context);

        var loadImage = function(src) {
            return jsglet.image.loadGrid(program.textureUniform(), src, 1, 4);
        }

        $.when(loadImage("resources/textures/blinker.png")).then(function(texture) {
            animation = new jsglet.image.Animation(texture);
            blinker = new jsglet.graphics.sprite.Sprite(
                animation, { batch: batch }
            );
            blinker.size(32, 32);
            blinker.x(0);
            blinker.y(0);
            batch.build();
        });
    });

    function draw() {
	    gl.viewport(0, 0, context.width, context.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();

        batch.draw();
    }
    context.onDraw(draw);

    var fpsCounter = document.getElementById("fps");

    document.getElementById("start").onclick = function() {
        jsglet.app.run();

        jsglet.clock.scheduleInterval(function() {
            fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
        }, 1000 / 30);

        $("#nextFrame").click(function() {
            animation.next();
        });

        var callbackId = null;

        $("#toggle").click(function() {
            if (_.isNull(callbackId)) {
                callbackId = jsglet.clock.scheduleInterval(function() {
                    animation.next();
                }, 250);
            }
            else {
                jsglet.clock.unschedule(callbackId);
                callbackId = null;
            }
        });
    };
});
