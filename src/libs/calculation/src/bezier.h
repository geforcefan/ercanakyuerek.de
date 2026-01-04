#ifndef LIBCALCULATION_BEZIER_H
#define LIBCALCULATION_BEZIER_H

#include <glm/vec3.hpp>
#include <vector>

struct node {
    glm::vec3 position;
    float arcLength;
};

class bezier {
public:
    bezier(const glm::vec3 &cp1, const glm::vec3 &cp2, const glm::vec3 &cp3, const glm::vec3 &cp4) : cp1(cp1),
                                                                                                     cp2(cp2),
                                                                                                     cp3(cp3),
                                                                                                     cp4(cp4) {
        evaluate();
    }

    glm::vec3 position_at_arc_length(float distance);
    float total_arc_length();

private:
    glm::vec3 cp1, cp2, cp3, cp4;
    std::vector<node> nodes;

    static glm::vec3 bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t);
    float estimate_total_arc_length();
    void evaluate();
};

#endif //LIBCALCULATION_BEZIER_H
