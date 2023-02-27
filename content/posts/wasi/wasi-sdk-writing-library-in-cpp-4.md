---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - JavaScript module"
date: 2023-02-27T17:45:00+01:00
---
[If you haven't read the third article of this series, I highly recommend that you do so.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-3.md" >}})

This is the point where we will develop our ``JavaScript`` library that utilizes the functions exposed in the ``WebAssembly`` module. I have created a simple template for this purpose. You may notice that we are defining some imports for ``WASI``, but they are all empty. Allow me to explain what ``WASI`` is and what it aims to achieve. ``WASI`` is an attempt to create specifications similar to the ``POSIX`` standard, which can be implemented across different runtimes, such as browsers or regular machines, and provides access to system-specific functions, such as file systems. However, for our library, which only needs to perform calculations, we do not require a complex runtime environment. This is why our functions are empty. Some may argue that we should use the Emscripten SDK instead of the ``WASI SDK``, but I believe that the ``WASI SDK`` is the future. It produces smaller binaries and has fewer complications compared to ``Emscripten``. There are official efforts to import standard ``WASI`` functions for the ``browser``, but unfortunately, they do not seem to work unless a ``WebAssembly module`` is instantiated within a ``worker``. If there are any changes in the future regarding this matter, I will update my articles accordingly. [Here](https://github.com/wasmerio/wasmer-js) is the mentioned attempt to bring a ``WASI runtime`` to ``browsers``. If you can load a ``WASM file`` outside the ``worker``, just email me your solution and I will include it here! :smile:

## Instantiate a module

Let's create a small boilerplate code for this purpose in the ``index.js`` file:

```javascript
import glue from "./glue.wasm";

const libCalculation = async (wasmFileResponsePromise) => {
    const memory = new WebAssembly.Memory({
        initial: 10000,
        maximum: 10000,
    });

    const module = await WebAssembly.compileStreaming(wasmFileResponsePromise);
    const instance = await WebAssembly.instantiate(module, {
        wasi_snapshot_preview1: {
            environ_get: () => {},
            environ_sizes_get: () => {},
            fd_close: () => {},
            fd_fdstat_get: () => {},
            fd_read: () => {},
            fd_write: () => {},
            proc_exit: () => {},
            fd_seek: () => {},
            fd_fdstat_set_flags: () => {},
            fd_prestat_get: () => {},
            fd_prestat_dir_name: () => {},
            path_open: () => {},
        },
        memory,
    });

    // ... here comes our wrapped functions
    
    return {
        // ... going to export them here
    };
};

export default libCalculation;
```

We will need to discuss memory later, particularly linear memory. For now, let's wrap some WebAssembly functions. We will start with an easy one, ``getSplineLength``. We can get the function from the ``instance.exports`` and call it with the spline pointer. This function returns a float, so there is no need for any special handling here:

```javascript
const getSplineLength = (splinePointer) => {
    const { getSplineLength : func } = instance.exports;
    return func(splinePointer);
}
```

Let's move on to a more complicated function, ``getSplinePositionAtDistance``. We also need to get the function from the exports and call it with the ``spline pointer`` and a ``distance``. However, we need to handle the ``3D vector`` pointer from the function's return in order to extract the float ``x, y, and z`` values from the ``3D vector``.The ``3D vector`` includes three ``float`` values. That's why we use ``Float32Array`` instead of ``Float64Array``, which would be used for doubles. The first argument is the memory itself, the second one is the ``position`` in the ``memory`` (a pointer is simply a number), and we want to extract ``3x 32bit values``, which perfectly match ``3x float for x, y, and z``.

```javascript
const getSplinePositionAtDistance = (splinePointer, distance) => {
    const { getSplinePositionAtDistance : func, memory } = instance.exports;
    const positionPointer = func(splinePointer, distance);
    return new Float32Array(memory, positionPointer, 3);
}
```

Now we reached an interesting function, createSpline, which takes four parameters of type ``3d vector``. In this case we can just allocate ``4x3x32bit``, four control points, ``x, y, z`` for each point, each point is a float which are ``32bit``, which makes ``48 bytes`` in total. So we first need to allocate ``48 bytes``. For this, we can easily use our malloc function, which we exposed in the webassembly module. I know, this is NOT a perfect solution, and there are some limitations, when I come up with better solutions, there will be some changes. So, at javascript side, we need to allocate ``48 bytes``, put all ``p0 - p1`` coordinates in to the memory and pass the memory pointer to the arguments. We also can allocate for each parameter, so we can all ``4 times malloc`` with ``12 bytes`` each malloc. I decided to do the latter.

```javascript
const createSpline = (p0, p1, p2, p3) => {
    const { createSpline : func, malloc, memory } = instance.exports;

    const pointers = [p0, p1, p2, p3].map(point => {
        const pointer = malloc(3 * 4); // (x, y, z) * 4 bytes
        new Float32Array(memory.buffer, pointer, 3).set(point);
        return pointer;
    })

    return func(pointers[0], pointers[1], pointers[2], pointers[3]);
}
```
export all function :smile:

```javascript
    return {
        createSpline,
        getSplinePositionAtDistance,
        getSplineLength
    };
```

## Testing our library

For testing purposes, you can create an ``index.html`` file and install the ``http-serve`` package by running the command ``npm install http-serve --save-dev``. To start the server, run the command ``node_modules/.bin/http-server .`` and include the following content in the ``index.html`` file:

```html
<script type="module">
    import libCalculation from './index.js';
    const init = async () => {
        const { createSpline, getSplineLength, getSplinePositionAtDistance } = await libCalculation(fetch("glue.wasm"));
        const spline = createSpline([-3, -3, 0], [3, -3, 0], [-3, 3, 0], [3, 3, 0]);
        const splineLength = getSplineLength(spline);
        const position = getSplinePositionAtDistance(spline, 0);

        console.log({ splineLength, position });
    }
    init();
</script>
```

{{< iframe "wasi-sdk-writing-library-in-cpp/wasi-sdk-writing-library-in-cpp/example.html" >}}

Please check the console for a spline with a length of ``10.06``. The position we fetched should return a 3D vector with coordinates of ``[-3, -3, 0]``.
Next to this text, you can view an advanced test that displays a spline. I have created a [repository](https://github.com/geforcefan/wasi-sdk-writing-library-in-cpp) that contains all the necessary files, including this advanced example that uses Three.js for rendering.

## Conclusion
That's all! It wasn't that difficult, was it? We haven't yet covered other complex types, such as passing strings to and from WebAssembly modules, or how to log. However, you should have a rough idea of how things work now. In future articles, I will explore data types, memory management, and binding in greater depth. To be honest, gluing code together is not enjoyable. It requires creating glue code on the C++ side and a wrapper JavaScript module that ``serializes`` and ``unserializes`` arguments and return values. Some solutions eliminate the need for writing both code pieces, but for now, this should help you get started, especially if you aim to build a small yet performance-critical library.