require.config({
    baseUrl: "/"
});
require(["jsglet/core"], function(jsglet) {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var program = new jsglet.graphics.Program(gl, {
        "a_Texture": jsglet.graphics.AttribRole.TEXTURE,
        "a_Position": jsglet.graphics.AttribRole.VERTEX
    });
    program.mvpUniform("u_MVPMatrix");
    program.textureUniform("u_Texture");
    context.program.addProgram("basic", program);

    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.DEPTH_TEST);

    var camera = null,
    bricks = [],
    ball = [],
    paddle = [];

    var ballVelocity = [0, 10];

    $.when(
        context.loadShaderAjax("shaders/vertex.vs", jsglet.graphics.VERTEX_SHADER),
        context.loadShaderAjax("shaders/fragment.fs", jsglet.graphics.FRAGMENT_SHADER)
    ).then(function() {
        program.attachShader(arguments[0]);
        program.attachShader(arguments[1]);
        program.link();
        context.program.useProgram("basic");


        camera = new jsglet.context.Camera(context);

        var loadImage = function(src) {
            return jsglet.image.load(context.gl, program.textureUniform(), src);
        }

        $.when(loadImage("sprites/brick.png")).then(function(texture) {
            var brickWidth = 64;
            var brickHeight = 32;
            for (var row = 0; row < 6; row ++) {
                var offsetCenter = (500 - (brickWidth * (row + 3))) / 2;
                for(var b = 0; b < row + 3; b++) {
                    var brick = new jsglet.graphics.sprite.Sprite(context.gl, texture, {});
                    brick.y(500 - (row * brickHeight));
                    brick.x(offsetCenter + (brickWidth * b));
                    brick.size(brickWidth, brickHeight);
                    bricks.push(brick);
                }
            }
        });

        $.when(loadImage("sprites/ball.png")).then(function(texture) {
            ball = new jsglet.graphics.sprite.Sprite(context.gl, texture, {});

            ball.size(64, 64);
            ball.y(64);
            ball.x(218);
        });

        $.when(loadImage("sprites/paddle.png")).then(function(texture) {
            paddle = new jsglet.graphics.sprite.Sprite(context.gl, texture, {});

            paddle.size(128, 64);
            paddle.x(188);
        });
    });

    function draw() {
	    gl.viewport(0, 0, context.width, context.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();
        paddle.draw();
        ball.draw();

        _.each(bricks, function(b) { b.draw(); });
    }

    var fpsCounter = document.getElementById("fps");

    context.onDraw(draw);

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.keyboard.KeyCode.UP) {
            e.preventDefault();
        }
    });

    document.getElementById("start").onclick = function() {
        jsglet.app.run();

        jsglet.clock.scheduleInterval(function() {
            fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
        }, 1000 / 30);

        jsglet.clock.scheduleInterval(function() {
            ball.positionDelta.apply(ball, ballVelocity);
        }, 1000 / 20);
    };
});
