import {gl} from './index.js';
export function texture(tex) {
	
	if(tex instanceof WebGLTexture) {
		
	}
	let t = {
		bind:true,
		level:0,
		internalFormat:gl.RGBA,
		border:0,
		format:gl.RGBA,
		type:gl.UNSIGNED_BYTE,
		data:null,
		height,
		width,
		texP
	};
	Object.assign(t, tex);
	t = Object.assign(gl.createTexture(), t);
	let e = (s) => {throw new Error(`Texture: ${s}`)};
	var {
		height = e('height not defined.'),
		width = e('width not defined'),
		texP
	} = t;
	gl.bindTexture(gl.TEXTURE_2D, t);
	
	gl.texImage2D(gl.TEXTURE_2D, t.level, t.internalFormat,
		width, height, t.border,
		t.format, t.type, t.data);
		console.log(height, width);
		if(texP) {
			if(texP.length) {
				for(let tp of texP) {
					gl.texParameteri(gl.TEXTURE_2D, tp[0], tp[1]);
				}
			} else {
				gl.texParameteri(gl.TEXTURE_2D, texP[0], texP[1]);
			}
		}
		return t;
	}
	
	WebGLTexture.prototype.resize = function({width = this.width, height = this.height}) {
								console.log(height, width);

								gl.bindTexture(gl.TEXTURE_2D, this);
								
								gl.texImage2D(gl.TEXTURE_2D, this.level, this.internalFormat,
									width, height, this.border,
									this.format, this.type, this.data);
							}
		
		