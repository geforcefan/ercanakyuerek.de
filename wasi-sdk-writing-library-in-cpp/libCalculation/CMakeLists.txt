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

include_directories(glm)
include_directories(src)
add_subdirectory(src)
add_subdirectory(glue)