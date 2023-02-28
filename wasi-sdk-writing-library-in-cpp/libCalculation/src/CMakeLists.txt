project(calculation)

file(GLOB_RECURSE SRC_SOURCES *.cc)
file(GLOB_RECURSE SRC_HEADERS *.h)

add_library(${PROJECT_NAME} STATIC ${SRC_SOURCES} ${SRC_HEADERS})
add_library(calculation::calculation ALIAS ${PROJECT_NAME})
target_link_libraries(${PROJECT_NAME})