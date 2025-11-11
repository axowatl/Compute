import { gpu } from "./constants";

class Renderer {
    constructor() {
        
    }

    beginFrame() {
        
    }

    endFrame() {
        
    }
}

// will have different types {mesh, particle system, image3D, screen overlay}
class DrawCall {
    constructor(type, data, vertexShaderCode, fragmentShaderCode, uniforms, attributes, renderState) {
        this.type = type;
        this.data = data;
        this.vsCode = vertexShaderCode;
        this.fsCode = fragmentShaderCode;
        this.uniforms = uniforms;
        this.attributes = attributes;
        this.renderState = renderState;
    }
}