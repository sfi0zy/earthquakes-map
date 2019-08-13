// -----------------------------------------------------------------------------
//  Updatable texture
// -----------------------------------------------------------------------------

// This module is based on another Updatable texture:
// https://github.com/spite/THREE.UpdatableTexture


const $ = window.Muilessium;

const THREE = $.DEPENDENCIES.THREE;


export default class UpdatableTexture extends THREE.Texture {
    static isUpdatableTexture = true;


    constructor(format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding) {
        super(null,
            mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

        const canvas = document.createElement('canvas');
        canvas.width  = 1;
        canvas.height = 1;

        const context = canvas.getContext('2d');
        const imageData = context.createImageData(1, 1);

        this.image           = imageData;
        this.magFilter       = magFilter !== undefined ? magFilter : THREE.LinearFilter;
        this.minFilter       = minFilter !== undefined ? minFilter : THREE.LinearMipMapLinearFilter;
        this.generateMipmaps = true;
        this.flipY           = true;
        this.unpackAlignment = 1;
        this.needsUpdate     = true;

        this.width    = null;
        this.height   = null;
        this.renderer = null;
        this.gl       = null;
        this.utils    = null;
    }


    setRenderer(renderer) {
        this.renderer = renderer;
        this.gl       = this.renderer.getContext();
        this.utils    = THREE.WebGLUtils(this.gl, this.renderer.extensions);
    }


    setSize(width, height) {
        if (width === this.width && height === this.height) {
            return;
        }

        const textureProperties = this.renderer.properties.get(this);

        if (!textureProperties.__webglTexture) {
            return;
        }

        this.width  = width;
        this.height = height;

        const activeTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);

        this.gl.bindTexture(this.gl.TEXTURE_2D, textureProperties.__webglTexture);

        if (!textureProperties.__webglTexture) {
            this.width = null;
        }

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            0,
            this.utils.convert(this.format),
            width,
            height,
            0,
            this.utils.convert(this.format),
            this.utils.convert(this.type),
            null
        );

        this.gl.bindTexture(this.gl.TEXTURE_2D, activeTexture);
    }


    update(src, x, y) {
        const textureProperties = this.renderer.properties.get(this);

        if (!textureProperties.__webglTexture) {
            return;
        }

        const activeTexture = this.gl.getParameter(this.gl.TEXTURE_BINDING_2D);

        this.gl.bindTexture(this.gl.TEXTURE_2D, textureProperties.__webglTexture);

        this.gl.texSubImage2D(
            this.gl.TEXTURE_2D,
            0,
            x,
            this.height - y - src.height,
            this.utils.convert(this.format),
            this.utils.convert(this.type),
            src
        );

        this.gl.generateMipmap(this.gl.TEXTURE_2D);
        this.gl.bindTexture(this.gl.TEXTURE_2D, activeTexture);
    }
}
