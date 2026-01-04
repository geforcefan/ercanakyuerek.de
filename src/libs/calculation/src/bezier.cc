#include "bezier.h"
#include <glm/geometric.hpp>

void bezier::evaluate() {
    nodes.clear();
    int numberOfNodes = (int)(estimate_total_arc_length() * 20.0f);
    if(!numberOfNodes) return;

    float arcLength = 0.0f;
    glm::vec3 lastPos = cp1;

    for(int i=0; i < numberOfNodes; i++) {
        float t = (float) i / (float) (numberOfNodes - 1);

        glm::vec3 position = bezier_fast(cp1, cp2, cp3, cp4, t);
        arcLength += glm::distance(position, lastPos);

        nodes.push_back({
            .position = position,
            .arcLength = arcLength
        });

        lastPos = position;
    }
}

glm::vec3 bezier::bezier_fast(glm::vec3 p0, glm::vec3 p1, glm::vec3 p2, glm::vec3 p3, float t) {
    float t1 = 1.0f-t;
    float b0 = t1 * t1 * t1;
    float b1 = 3 * t1 * t1 * t;
    float b2 = 3 * t1 * t * t;
    float b3 = t * t * t;

    return b0 * p0  + b1 * p1 + b2 * p2 + b3 * p3;
}

float bezier::estimate_total_arc_length() {
    glm::vec3 lastPos = cp1;
    float arcLength = 0.0f;

    for(int i=0; i < 15; i+= 2) {
        float t = (float) (i) / 14.0f;
        glm::vec3 pos = bezier_fast(cp1, cp2, cp3, cp4, t);
        arcLength += glm::distance(pos, lastPos);
        lastPos = pos;
    };

    return arcLength;
}

glm::vec3 bezier::position_at_arc_length(float at) {
    if (nodes.size() < 2) return glm::vec3(0.0f);

    auto nextNode = std::lower_bound(nodes.begin(), nodes.end(), at, [](auto a, double value) -> bool { return a.arcLength < value; });
    auto currentNode = nextNode - 1;

    auto isFirst = nextNode == nodes.begin();
    auto isLast = currentNode == nodes.end();

    if (isFirst) return nodes[0].position;
    if (isLast) return nodes[nodes.size() - 1].position;

    double t = 0.0;

    if (nextNode->arcLength - currentNode->arcLength > std::numeric_limits<double>::epsilon()) {
        t = std::max(std::min((at - currentNode->arcLength) / (nextNode->arcLength - currentNode->arcLength), 1.0f), 0.0f);
    }

    return glm::mix(currentNode->position, nextNode->position, t);
}

float bezier::total_arc_length() {
    if(!nodes.empty()) return nodes[nodes.size() - 1].arcLength;

    return 0;
}