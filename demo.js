(function(canvas){
var gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl'),
    program;

function createShader(shaderType, source){
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(shader), shaderType, source);
        throw 'Compiler exception: "' + gl.getShaderInfoLog(shader) + '"';
    }
    return shader;
}
function setup(frag, vert){
    var fs = createShader(gl.FRAGMENT_SHADER, frag[0]),
        vs = createShader(gl.VERTEX_SHADER, vert[0]);
    program = gl.createProgram();

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)){
        throw 'Linker exception: ' + gl.getProgramInfoLog(program);
    }
    var buffer = gl.createBuffer(),
        vertices = new Float32Array([
            -1, 1, 0,
            -1, -1, 0,
            1, -1, 0,
            -1, 1, 0,
            1, -1, 0,
            1, 1, 0
        ]);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    var positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
    
    var tLocation = gl.getUniformLocation(program, 'iGlobalTime'),
        rLocation = gl.getUniformLocation(program, 'iResolution'),
        rValue = new Float32Array(3);
    console.log('tLocation', tLocation);
    function draw(){
        var bounds = canvas.getBoundingClientRect();
        rValue[0] = canvas.width;
        rValue[1] = canvas.height;
        rValue[2] = bounds.width/bounds.height;
        gl.uniform1f(tLocation, (performance.now()/2000));
        gl.uniform3fv(rLocation, rValue);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(draw);
    }
    draw();
}

$.when($.get('shader.frag'), $.get('shader.vertex')).done(setup);

})(c);
