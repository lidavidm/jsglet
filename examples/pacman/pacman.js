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
        },

        __repr__: function() {
            return "RotationGroup " + this.parent + " " + this.$objectId;
        }
    });

    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var gl = context.gl;
    var batch = new jsglet.graphics.Batch();
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

    var camera = null,
    dots = [],
    ghosts = [],
    walls = [],
    pacman = null;

    var pacmanGroup = null;
    var speed = 2;
    var pacmanVelocity = [0, 0];
    var pacmanPosition = [0, 0];
    var collision = []; // [[[top, right, bottom, left]]] where first
                        // array is x, second is y

    var points = 0;

    $.when(
        jsglet.graphics.loadShader("shaders/vertex.vs", jsglet.graphics.VERTEX_SHADER),
        jsglet.graphics.loadShader("shaders/fragment.fs", jsglet.graphics.FRAGMENT_SHADER)
    ).then(function() {
        program.attachShader(arguments[0]);
        program.attachShader(arguments[1]);
        program.link();
        context.program.useProgram("basic");

        camera = new jsglet.context.Camera(context);
        pacmanGroup = new RotationGroup(camera);

        var loadImage = function(src) {
            return jsglet.image.load(program.textureUniform(), src);
        }

        $.when(loadImage("sprites/ghost.png")).then(function(texture) {
            for (var i = 0; i < 4; i++) {
                var ghost = new jsglet.graphics.sprite.Sprite(texture, {
                    batch: batch
                });

                ghost.size(31, 31);
                ghost.x(96 + 32 * i + 3);
                ghost.y(160 + 1);

                ghosts.push(ghost);
            }
            batch.build();
        });

        $.when(loadImage("sprites/dot.png")).then(function(texture) {
            for (var row = 0; row < 10; row ++) {
                for (var col = 0; col < 10; col++) {
                    if ((row == 4 || row == 5) && col > 2 && col < 7) continue;
                    var dot = new jsglet.graphics.sprite.Sprite(texture, {
                        batch: batch
                    });
                    dot.size(16, 16);
                    dot.x(col * 32 + 9);
                    dot.y(row * 32 + 41);

                    dots.push(dot);
                }
            }

            batch.build();
        });

        $.when(
            loadImage("sprites/wall.png"),
            $.get("wall.json")
        ).then(function(texture, wallData) {

            _.times(11, function() {
                var collisionRow = [];
                _.times(11, function() {
                    collisionRow.push([false, false, false, false]);
                });
                collision.push(collisionRow);
            });

            // block off the bottom row
            for (var i = 0; i < 10; i++) {
                collision[i][0][2] = true;
            }

            _.each(wallData[0], function(w) {
                var wall = new jsglet.graphics.sprite.Sprite(texture, {
                    batch: batch
                });
                if (w[2] == "h") {
                    wall.size(32, 2);
                    collision[w[0]][w[1] + 1][2] = true;
                    collision[w[0]][w[1]][0] = true;
                }
                else if (w[2] == "v") {
                    wall.size(2, 32);
                    collision[w[0]][w[1] + 1][3] = true;
                    collision[w[0] - 1][w[1] + 1][1] = true;
                }
                else {
                    throw new jsglet.common.error("Invalid wall data", w)
                }
                wall.x(w[0] * 32 + 1);
                wall.y(w[1] * 32 + 33);
                walls.push(wall);
            });

            batch.build();
        });

        $.when(
            jsglet.image.loadGrid(program.textureUniform(), "sprites/pacman.png", 1, 4)
        ).then(function(texture) {
            pacmanAnimation = new jsglet.image.Animation(texture);
            pacman = new jsglet.graphics.sprite.Sprite(pacmanAnimation, {
                batch: batch, group: pacmanGroup
            });

            pacman.size(31, 31);
            pacman.x(1);
            pacman.y(1);

            batch.build();
        });
    });

    context.onDraw(function() {
	    gl.viewport(0, 0, context.width, context.height);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        camera.apply();

        batch.draw();
    });

    var fpsCounter = $("#fps");

    var targetPosition = [0, 0];

    var keyState = new jsglet.event.keyboard.KeyStateManager();
    // XXX should list these explicitly but for now
    keyState.intercept(_.values(jsglet.event.keyboard.KeyCode));
    context.pushListeners(keyState);

    var sign = function(x) {
        if (x == 0) return 0;
        if (x > 0) return 1;
        return -1;
    }

    var collides = function(direction) {
        return collision[pacmanPosition[0]][pacmanPosition[1]][direction];
    }
    var TOP = 0, RIGHT = 1, BOTTOM = 2, LEFT = 3;

    jsglet.clock.scheduleInterval(function() {
        if (keyState.isDown(jsglet.event.keyboard.KeyCode.LEFT)) {
            if (!collides(LEFT)) {
                targetPosition[0] = pacmanPosition[0] - 1;
            }
        }
        if (keyState.isDown(jsglet.event.keyboard.KeyCode.RIGHT)) {
            if (!collides(RIGHT)) {
                targetPosition[0] = pacmanPosition[0] + 1;
            }
        }

        if (keyState.isDown(jsglet.event.keyboard.KeyCode.UP)) {
            if (!collides(TOP)) {
                targetPosition[1] = pacmanPosition[1] + 1;
            }
        }
        if (keyState.isDown(jsglet.event.keyboard.KeyCode.DOWN)) {
            if (!collides(BOTTOM)) {
                targetPosition[1] = pacmanPosition[1] - 1;
            }
        }

        pacmanPosition = [Math.floor((pacman.x() + 16) / 32),
                          Math.floor((pacman.y() + 16) / 32)];

        var targetX = (targetPosition[0] * 32) - pacman.x() + 1;
        var targetY = (targetPosition[1] * 32) - pacman.y() + 1;
        var speedX = (Math.abs(targetX) > speed) ? speed : Math.abs(targetX);
        var speedY = (Math.abs(targetY) > speed) ? speed : Math.abs(targetY);

        pacman.positionDelta.apply(pacman, [
            sign(targetX) * speedX,
            sign(targetY) * speedY
        ]);
    }, 30);

    jsglet.clock.scheduleInterval(function() {
        fpsCounter.html(Math.round(jsglet.clock.getDefaultClock().getFps()));
    }, 500);

    jsglet.clock.scheduleInterval(function() {
        // Last term helps to smooth out rotations (else when key is
        // released pacman "jumps" to the correct spot)
        pacmanGroup.x = pacman.x() + 16 + pacmanVelocity[0];
        pacmanGroup.y = pacman.y() + 16 + pacmanVelocity[1];
    }, 1000 / 30);

    $("#start").click(function() {
        jsglet.app.run();
    });
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
