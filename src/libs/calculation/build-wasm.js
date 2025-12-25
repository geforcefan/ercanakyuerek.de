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
          "docker run -v `pwd`:/wasi -w /wasi/build ghcr.io/webassembly/wasi-sdk:wasi-sdk-19 cmake -DCMAKE_BUILD_TYPE=Release .."
    );
}

exec(
    "docker run -v `pwd`:/wasi -w /wasi/build ghcr.io/webassembly/wasi-sdk:wasi-sdk-19 make -j 10"
);

cp(paths.glueSource, paths.glueDestination);