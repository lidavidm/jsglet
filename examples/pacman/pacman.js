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
    var pacmanVelocity = [0, 0];
    var speed = 6;

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
            _.each(wallData[0], function(w) {
                var wall = new jsglet.graphics.sprite.Sprite(texture, {
                    batch: batch
                });
                if (w[2] == "h")
                    wall.size(32, 2);
                else if (w[2] == "v")
                    wall.size(2, 32);
                else
                    throw new jsglet.common.error("Invalid wall data", w)
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

    context.onKeyDown(function(e) {
        if (e.keyCode == jsglet.event.keyboard.KeyCode.LEFT) {
            e.preventDefault();
            pacmanGroup.angle = Math.PI;
            pacmanVelocity[0] = -speed;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.RIGHT) {
            e.preventDefault();
            pacmanGroup.angle = 0;
            pacmanVelocity[0] = speed;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.UP) {
            e.preventDefault();
            pacmanGroup.angle = Math.PI / 2;
            pacmanVelocity[1] = speed;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.DOWN) {
            e.preventDefault();
            pacmanGroup.angle = -Math.PI / 2;
            pacmanVelocity[1] = -speed;
        }
    });

    context.onKeyUp(function(e) {
        if (e.keyCode == jsglet.event.keyboard.KeyCode.LEFT) {
            e.preventDefault();
            pacmanVelocity[0] = 0;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.RIGHT) {
            e.preventDefault();
            pacmanVelocity[0] = 0;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.UP) {
            e.preventDefault();
            pacmanVelocity[1] = 0;
        }
        else if (e.keyCode == jsglet.event.keyboard.KeyCode.DOWN) {
            e.preventDefault();
            pacmanVelocity[1] = 0;
        }
    });

    $("#start").click(function() {
        jsglet.app.run();

        jsglet.clock.scheduleInterval(function() {
            fpsCounter.html(Math.round(jsglet.clock.getDefaultClock().getFps()));
        }, 500);

        jsglet.clock.scheduleInterval(function() {
            pacmanGroup.x = pacman.x() + 16;
            pacmanGroup.y = pacman.y() + 16;
            pacman.positionDelta.apply(pacman, pacmanVelocity);
        }, 1000 / 30)
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
