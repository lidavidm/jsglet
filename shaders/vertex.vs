uniform mat4 u_MVPMatrix;

attribute vec4 a_Position;
attribute vec4 a_Texture;

varying vec4 v_Texture;

void main()
{
	v_Texture = a_Texture;
	gl_Position = u_MVPMatrix * a_Position;
}
