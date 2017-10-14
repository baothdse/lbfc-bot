var vertex = require('./vertex');

function List() {
    this.arrayList = [];
}

List.prototype.add = function(value) {
    var v = new vertex.Vertex(value, new List(), null);
    this.arrayList.push(v);
}

List.prototype.find = function (value) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.value == value) {
            result = element;
            break;
        }
    });
    return result;
}

List.prototype.findVertex = function (vertex) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.value == vertex.value) {
            result = element;
            break;
        }
    });
    return result;
}

module.exports = {
    List : List,
}