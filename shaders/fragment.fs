precision mediump float;

varying vec4 v_Texture;
uniform sampler2D u_Texture;

void main()
{
	gl_FragColor = texture2D(u_Texture, v_Texture);
}
