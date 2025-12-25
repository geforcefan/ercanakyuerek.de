#include <bezier.h>

__attribute__((export_name("malloc")))
void *allocateMemory(size_t size) {
    return malloc(size);
}

__attribute__((export_name("bezierFromPoints")))
bezier *bezierFromPoints(glm::vec3 *cp1, glm::vec3 *cp2, glm::vec3 *cp3, glm::vec3 *cp4) {
    return new bezier(*cp1, *cp2, *cp3, *cp4);
}

__attribute__((export_name("bezierPositionAtDistance")))
glm::vec3 *bezierPositionAtDistance(bezier *s, float distance) {
    return new glm::vec3(s->position_at_distance(distance));
}

__attribute__((export_name("bezierLength")))
float bezierLength(bezier *s) {
    return s->length();
}

int main() {}