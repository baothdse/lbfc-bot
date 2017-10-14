var LM = require('./LM');
var list = require('./utils/list');

var value;
var vertexes;
var nextVertex;
var p;
var ps;

//nodes = List()
function Vertex(value, vertexes, nextVertex, p, ps) {
    this.value = value;
    this.vertexes = vertexes;
    this.nextVertex = nextVertex;
    this.p = p;
    this.ps = ps;
}

//Hello
Vertex.prototype.add = function(vertex, p){
    var vertex2 = this.vertexes.findTranslatedVertex(vertex);
    if (vertex2 == null || (vertex2.value.original != vertex.value.original)) {
        this.vertexes.add(vertex);
        this.ps.push(p);
    }
}

Vertex.prototype.clone = function () {
    var vertex = new Vertex(this.value, this.vertexes, null, this.p, this.ps);
    return vertex;
}

module.exports = {
    Vertex : Vertex,

}