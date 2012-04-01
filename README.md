# jsglet: WebGL wrapper for JavaScript

This project aims to implement a WebGL toolkit for JavaScript in the style
of Pyglet for Python. However, there are some important differences:

* WebGL is based on OpenGL ES/similar to OpenGL 3+ and has no fixed-function
  pipeline and fewer built-in features. This means that:

  * Rendering is highly dependent on the shaders used. Therefore, wrappers
    around the buffer object functionality are highly coupled to the
    wrappers around the shader functionality.

        # OpenGL < 3:
        glVertexPointer(...)

        // WebGL:
        vertexLocation = gl.getAttribLocation(program, "a_Position");
        gl.enableVertexAttribArray(vertexLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, bufferObject);
        gl.vertexAttribPointer(vertexLocation, ...)

  The problem with porting the Pyglet API/semantics to JavaScript is that
  now the required data is scattered around, and Pyglet never dealt with
  shaders anyways.

  Solution: use some sort of "Renderer" object that manages all this
  data/state and can create VBOs, etc. when needed.

## Dependencies

* Classy (http://classy.pocoo.org) Use my fork at
  https://github.com/lidavidm/classy instead since it contains some
  additional patches needed
* Underscore.js
* gl-matrix (https://github.com/toji/gl-matrix)
