var list = require('./list');

// var value;
// var vertexes;
// var nextVertex;
// var p;
// var ps;

//nodes = List()
function Vertex(value, vertexes, nextVertex) {
    this.value = value;
    this.vertexes = vertexes;
    this.nextVertex = nextVertex;
}

//Hello
Vertex.prototype.add = function(vertex){
    var vertex2 = this.vertexes.findVertex(vertex);
    if (vertex2 == null) {
        this.vertexes.add(vertex);
    }
}

Vertex.prototype.clone = function () {
    var vertex = new Vertex(this.value, this.vertexes, null);
    return vertex;
}

module.exports = {
    Vertex : Vertex,

}