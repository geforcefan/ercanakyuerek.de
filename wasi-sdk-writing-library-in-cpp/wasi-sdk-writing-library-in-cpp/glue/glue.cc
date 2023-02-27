//
// Created by Ercan Akyürek on 24.02.23.
//
#include <spline.h>

__attribute__((export_name("malloc")))
void *allocateMemory(size_t size) {
    return malloc(size);
}

__attribute__((export_name("createSpline")))
spline *createSpline(glm::vec3 *cp1, glm::vec3 *cp2, glm::vec3 *cp3, glm::vec3 *cp4) {
    return new spline(*cp1, *cp2, *cp3, *cp4);
}

__attribute__((export_name("getSplinePositionAtDistance")))
glm::vec3 *getSplinePositionAtDistance(spline *s, float distance) {
    return new glm::vec3(s->get_position_at_distance(distance));
}

__attribute__((export_name("getSplineLength")))
float getSplineLength(spline *s) {
    return s->get_length();
}

int main() {}