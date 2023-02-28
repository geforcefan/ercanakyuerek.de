project(glue)

file(GLOB_RECURSE SRC_SOURCES *.cc)
file(GLOB_RECURSE SRC_HEADERS *.h)

add_executable(${PROJECT_NAME} ${SRC_SOURCES} ${SRC_HEADERS})
target_link_libraries(glue calculation::calculation)