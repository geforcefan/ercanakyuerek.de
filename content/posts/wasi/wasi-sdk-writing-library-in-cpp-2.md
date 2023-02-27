---
title: "Writing a Library in C++ and Using it in the Browser with the WASI SDK - CMake and build scripts"
date: 2023-02-23T23:15:00+01:00
---
[If you haven't read the first article of this series, I highly recommend that you do so.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-1.md" >}})

To simplify the building process, we can create a build script. We have already defined some scripts in our ``package.json`` file. At this point, the ``build-wasm.js`` file is still empty, so we can create a basic script that first deletes an existing ``build`` folder, creates a new one, and runs ``cmake ..`` inside it. We will be using a WASI-SDK docker image from ``ghcr.io/webassembly/wasi-sdk`` to run cmake and eventually compile the project via ``make``.

```javascript
const { rm, mkdir, exec, cp } = require("shelljs");
const { join } = require("path");
const { compileOnly, run } = require("args-parser")(process.argv);

const paths = {
  build: join(__dirname, "build"),
  glueSource: join(__dirname, "build", "glue", "glue"),
  glueDestination: join(__dirname, "glue.wasm"),
};

if (!compileOnly) {
  rm("-rf", paths.glueDestination);
  rm("-rf", paths.build);
  mkdir(paths.build);
  exec(
    "docker run -v `pwd`:/wasi -w /wasi/build ghcr.io/webassembly/wasi-sdk cmake -DCMAKE_BUILD_TYPE=Release .."
  );
}

exec(
  "docker run -v `pwd`:/wasi -w /wasi/build ghcr.io/webassembly/wasi-sdk make -j 10"
);

cp(paths.glueSource, paths.glueDestination);
```

We will provide CMake directives for automatically adding all ``*.cc`` files in the ``glue`` and ``src`` directories. If you prefer using the ``.cpp`` extension instead, feel free to modify the files accordingly. We will also ensure that we build a static library by using the ``STATIC`` keyword in the add_library function. Therefore, the content of the ``src/CMakeLists.txt`` file is as follows:

```cmake
project(calculation)

file(GLOB_RECURSE SRC_SOURCES *.cc)
file(GLOB_RECURSE SRC_HEADERS *.h)

add_library(${PROJECT_NAME} STATIC ${SRC_SOURCES} ${SRC_HEADERS})
add_library(calculation::calculation ALIAS ${PROJECT_NAME})
```

The ``glue/CMakeLists.txt`` file will slightly differ from the one in ``src``. As mentioned earlier, ``glue`` will serve as the final WebAssembly "application" that statically links our ``calculation`` library and exposes manually exported functions. We'll need to handle complex data types such as ``vectors`` and ``structs``, but we'll cover that in the next chapters. For now, it's important to understand that ``glue`` is essentially our end product that links to our ``calculation`` library:

```cmake
project(glue)

file(GLOB_RECURSE SRC_SOURCES *.cc)
file(GLOB_RECURSE SRC_HEADERS *.h)

add_executable(${PROJECT_NAME} ${SRC_SOURCES} ${SRC_HEADERS})
target_link_libraries(glue calculation::calculation)
```

Now we need to bring everything together in the ``CMakeList.txt`` file in our root directory, which basically means adding the directories ``glue`` and ``src``, setting some optimization flags for release mode, and disabling exceptions for WASI since exceptions are currently not supported by WASI-SDK. Here's what the file should look like:

```cmake
cmake_minimum_required (VERSION 3.9 FATAL_ERROR)
project (CALCULATION LANGUAGES CXX VERSION 0.1.0)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_FLAGS_RELEASE "-O3")

# Disable exceptions
if (CMAKE_SYSTEM_NAME STREQUAL "WASI")
    string(REGEX REPLACE "-fexceptions" "" CMAKE_CXX_FLAGS ${CMAKE_CXX_FLAGS})
    set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -fno-exceptions")
endif()

include_directories(src)
add_subdirectory(src)
add_subdirectory(glue)
```

To test our setup, we need to add a main function to the file ``glue/glue.cc``. The files ``spline.cc`` and ``spline.h`` can remain empty for now as they are not necessary to test our setup:

```cpp
int main() {}
```

![final structure](/wasi-sdk-writing-library-in-cpp/final_structure.png)

Finally, we can run our build script and see what happens :smile:. To run the build script, simply execute ``npm run build``. After it finishes executing, there should be a newly created file in the root directory named ``glue.wasm``, which confirms that our setup is correct. However, this file does not have any functionality at the moment, [but that will change in the next chapter.]({{< ref "/posts/wasi/wasi-sdk-writing-library-in-cpp-3.md" >}})
