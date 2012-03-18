window.onload = function() {
    var context = new jsglet.context.Context(document.getElementById("canvas"));
    var shaders = [context.loadShader("vshader"), context.loadShader("fshader")];
    context.renderer.program.attachShader(shaders[0]);
    context.renderer.program.attachShader(shaders[1]);
    context.renderer.program.link();

    function reshape(context, gl) {
        gl.viewport(0, 0, context.width, context.height);
        var perspectiveMatrix = mat4.create();
        mat4.perspective(30, context.width / context.height, 1, 10000,
                         perspectiveMatrix);
        return perspectiveMatrix;
    }

    function draw(context, gl) {
        var perspectiveMatrix = reshape(context, gl);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }
    document.getElementById("start").onclick = function() {
        setInterval(function(){draw(context, context.gl)}, 500);
    };
};
