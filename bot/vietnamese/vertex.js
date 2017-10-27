var LM = require('./LM');
var list = require('./utils/list');

class Vertex {
    constructor(value, vertexes, nextVertex, p, ps) {
        this.value = value;

        /**
         * @type {list}
         */
        this.vertexes = vertexes;
        this.nextVertex = nextVertex;
        this.p = p;
        this.ps = ps;
    }

    add(vertex, p){
        var vertex2 = this.vertexes.findTranslatedVertex(vertex);
        if (vertex2 == null || (vertex2.value.original != vertex.value.original)) {
            this.vertexes.add(vertex);
            this.ps.push(p);
        }
    }

    clone() {
        var vertex = new Vertex(this.value, this.vertexes, null, this.p, this.ps);
        return vertex;
    }
}

module.exports = Vertex