require.config({
    baseUrl: "/"
});
require(["jsglet/core"], function(jsglet) {
    var RotationGroup = jsglet.graphics.Group.$extend({
        __init__: function(p_camera, p_parent) {
            this.$super(p_parent);
            this.camera = p_camera;
            this.angle = 0;
            this.x = 0;
            this.y = 0;
        },

        set: function() {
            this.camera.pushModel();
            this.camera.identityModel();
            this.camera.rotateZAbout(this.angle, this.x, this.y);
            this.camera.apply();
        },

        unset: function() {
            this.camera.popModel();
            this.camera.apply();
        }
    });

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
    var blinker = null, blinker2 = null;
    var blinkerGroup, blinker2Group = null;

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
            blinkerGroup = new RotationGroup(camera);
            blinker = new jsglet.graphics.sprite.Sprite(
                animation, { batch: batch, group: blinkerGroup }
            );
            blinker.size(32, 32);
            blinker.x(150);
            blinker.y(150);

            blinker2Group = new RotationGroup(camera);

            blinker2 = new jsglet.graphics.sprite.Sprite(
                animation, { batch: batch, group: blinker2Group }
            );
            blinker2.size(32, 32);
            blinker2.x(50);
            blinker2.y(50);
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
        }, 500);

        jsglet.clock.scheduleInterval(function() {
            animation.next();
        }, 250);

        jsglet.clock.scheduleInterval(function() {
            blinkerGroup.angle += Math.PI / 8;
            blinkerGroup.x = blinker.x();
            blinkerGroup.y = blinker.y();

            blinker2Group.angle += Math.PI / 4;
            blinker2Group.x = blinker2.x()// - (blinker2.width() / 2);
            blinker2Group.y = blinker2.y()// - (blinker2.height() / 2);
        }, 50);
    };
});
