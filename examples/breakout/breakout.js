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

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.disable(gl.DEPTH_TEST);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.BLEND);

    var camera = null,
    bricks = [],
    ball = [],
    paddle = [];
    var speed = 6;

    var points = 0;

    var ballVelocity = [speed, -speed];

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
                    brick.y(500 - ((row + 1) * brickHeight));
                    brick.x(offsetCenter + (brickWidth * b));
                    brick.size(brickWidth, brickHeight);
                    bricks.push(brick);
                }
            }
        });

        $.when(loadImage("sprites/ball.png")).then(function(texture) {
            ball = new jsglet.graphics.sprite.Sprite(context.gl, texture, {});

            ball.size(16, 16);
            ball.y(64);
            ball.x(242);
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

        _.each(bricks, function(b) { b.draw(); });
        paddle.draw();
        ball.draw();
    }

    var fpsCounter = document.getElementById("fps");

    context.onDraw(draw);

    var paddleVelocity = 0;

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.keyboard.KeyCode.LEFT) {
            e.preventDefault();
            paddleVelocity = -speed;
        }
        if (e.keyCode == jsglet.event.keyboard.KeyCode.RIGHT) {
            e.preventDefault();
            paddleVelocity = speed;
        }
    });

    context.onKeyUp(function(e) {
        paddleVelocity = 0;
    });

    document.getElementById("start").onclick = function() {
        jsglet.app.run();

        jsglet.clock.scheduleInterval(function() {
            fpsCounter.innerText = Math.round(jsglet.clock.getDefaultClock().getFps());
        }, 1000 / 30);

        jsglet.clock.scheduleInterval(function() {
            var ballColData = {
                x: ball.x(),
                y: ball.y(),
                r: ball.width() / 2
            };

            if (intersects.circleAABB(ballColData, {
                x: paddle.x(),
                y: paddle.y(),
                width: paddle.width(),
                height: paddle.height()
            })) {
                if (ballVelocity[0] > 0 &&
                    (ball.x() + ball.width() < paddle.x())) {
                    ballVelocity[0] *= -1;
                }
                else if (ballVelocity[0] < 0 &&
                    (ball.x() > (paddle.x() + paddle.width()))) {
                    ballVelocity[0] *= -1;
                }
                if (ballVelocity[1] < 0) {
                    ballVelocity[1] *= -1;
                }
            }

            else {
                bricks = _.reject(bricks, function(brick) {
                    if (intersects.circleAABB(ballColData, {
                        x: brick.x(),
                        y: brick.y(),
                        width: brick.width(),
                        height: brick.height()
                    })) {
                        console.log(ball.position(), brick.position(), ballVelocity)
                        if (ballVelocity[1] > 0 && (ball.y() < brick.y())) {
                            ballVelocity[1] *= -1;
                        }
                        else if (ballVelocity[1] < 0 && (ball.y() > brick.y())) {
                            ballVelocity[1] *= -1;
                        }

                        console.log(ballVelocity)
                        points += 10;
                        $("#points").html(points);
                        return true;
                    }
                    return false;
                });

                if (bricks.length == 0) {
                    document.write("You win!");
                    jsglet.app.exit();
                }
            }

            if (ballVelocity[0] > 0 && ball.x() + ball.width() > 500) {
                ballVelocity[0] *= -1;
            }
            else if (ballVelocity[0] < 0 && ball.x() < 0) {
                ballVelocity[0] *= -1;
            }

            if (ballVelocity[1] > 0 && ball.y() > 500) {
                ballVelocity[1] *= -1;
            }
            else if (ball.y() <= 0) {
                document.write("Game over");
                jsglet.app.exit();
            }

            ball.positionDelta.apply(ball, ballVelocity);
            paddle.positionDelta.apply(paddle, [paddleVelocity, 0]);
        }, 1000 / 30);
    };
});

var intersects = {
    circleAABB: function(p_circle, p_aabb) {
        // http://stackoverflow.com/a/402010/262727
        var cdx = Math.abs(p_circle.x - p_aabb.x - p_aabb.width / 2);
        var cdy = Math.abs(p_circle.y - p_aabb.y - p_aabb.height / 2);

        if (cdx > (p_aabb.width / 2 + p_circle.r)) { return false; }
        if (cdy > (p_aabb.height / 2 + p_circle.r)) { return false; }

        if (cdx <= (p_aabb.width / 2)) { return true; }
        if (cdy <= (p_aabb.height / 2)) { return true; }

        var cd2 = Math.pow(cdx - p_aabb.width / 2, 2) +
            Math.pow(cdy - p_aabb.height / 2, 2);

        return (cd2 <= Math.pow(p_circle.r, 2));
    },

    aabbAABB: function(p_aabb1, p_aabb2) {
    }
}
