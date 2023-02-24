---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - Folder structure"
date: 2023-02-23T22:00:00+01:00
---
You may have already heard that it's possible to write certain parts of your web application using languages like C++ or Rust and compile them into WebAssembly. WebAssembly is a binary format that allows code to be executed on the web and is designed to be efficient, secure, and portable. There are use cases where WebAssembly can be particularly beneficial, such as performing complex and resource-intensive computations for real-time applications or mathematical operations.

However, as of the writing of this article in 2023, there are no final specifications or mature bindings available for the C++ and JavaScript stack. This means that if you choose to use WebAssembly, you will largely be on your own.

## Using WebAssembly as a Regular JavaScript Module
This is a crucial aspect that I wish to explore. I want to write parts of my application in C++ and use them as regular modules in JavaScript. As previously mentioned, there is no NPM infrastructure available for compiling or generating bindings that can produce JavaScript files that export modules with exposed C++ functions. In this series, we will construct a minimalist infrastructure that emulates familiar module structures.

## Building an Example Library for Computing Bezier Curves
For this article, we will create a very minimalistic library for computing bezier curves. We will set up this project in a way that the library can be used in a regular C++ application, as well as in a web application.

## Prerequisites
Please ensure that you have installed both ``Node.js`` and ``Docker`` on your computer. We will utilize the WASI-SDK Docker image for constructing the WebAssembly library.

## Project structure
First, let's create a folder named ``libComputation`` and run ``npm init`` inside the folder, following the input instructions. After initializing an npm project, replicate this folder structure and create the following files:

```
libComputation
    glue
        CMakeLists.txt
        glue.cc
    src
        CMakeLists.txt
        spline.cc
        spline.h
    CMakeLists.txt
    build-wasm.js
    index.js
```

As you can see, this resembles a regular CMake project with WebAssembly compilation additions. 
We will use ``build-wasm.js`` for compilation purposes, and for that, we need to install some npm 
modules for creating directories and parsing arguments:

```
npm install shelljs args-parser --save-dev
```
Now, add the following build scripts in the ``package.json`` file, which we will use for different use cases:

```json
{
  "scripts": {
    "build": "node build-wasm.js",
    "compile": "node build-wasm.js --compileOnly"
  }
}
```

As you can see, there is a folder named ``glue``. In this subdirectory, 
we will define all exports and bindings to the WebAssembly Module, 
so that all files inside the ``src`` folder will be free from WASI artifacts. 
We have intentionally split both directories because our goal is to use the libraries in regular
desktop applications as well, where ``WASI SDK`` is not used to build the library. 
This approach ensures high flexibility when using the library in both the browser and desktop 
environments.

[In the next part, we will create the build script and set up the CMake files.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-2.md" >}})