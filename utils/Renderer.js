import { gpu, device } from "./constants";

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

    compile(device, colorFormat) {
        // 1. Create shader modules
        const vsm = device.createShaderModule({ code: this.vsCode });
        const fsm = device.createShaderModule({ code: this.fsCode });

        // 2. Create pipeline layout
        // This is a simple placeholder; you might have bind group layouts based on your uniforms
        const pipelineLayout = device.createPipelineLayout({
            bindGroupLayouts: [] // adjust if you use bind groups/uniforms
        });

        // 3. Define attribute buffers layout if needed (empty array if not used)
        const vertexBuffers = this.attributes || [];

        // 4. Create render pipeline
        const pipeline = device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: vsm,
                entryPoint: "main",
                buffers: vertexBuffers,
            },
            fragment: {
                module: fsm,
                entryPoint: "main",
                targets: [
                    { format: colorFormat } // example: 'bgra8unorm' or as passed
                ]
            },
            primitive: {
                topology: "triangle-list",
            },
            ...this.renderState
        });

        // 5. Store pipeline and modules
        this.pipeline = pipeline;
        this.vsm = vsm;
        this.fsm = fsm;
    }
}