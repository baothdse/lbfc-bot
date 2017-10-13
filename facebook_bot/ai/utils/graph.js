var vertex = require('./vertex');
var lm = require('./LM');
var list = require('../tools/list');
var int = require('../tools/int');
var vertexes;

function Graph() {
    this.vertexes = new list.List(); //List<Vertex>
}

Graph.prototype.add = function (value) {
    var v = this.vertexes.find(value);
    if (v == null) {
        this.vertexes.add(value);
    } 
    var v2 = this.vertexes.findTranslatedVertex2(second.translated);
    if (v2 == null || (v2.value.original != second.original)) {
        v2 = new vertex.Vertex(second, new list.List(), null, null, []);
        this.vertexes.add(v2);
    }
    v.add(v2);
}

Graph.prototype.traverse = function (vertex, matchWords, currentWord, maxWord) {
    var isFound = false;
    if (currentWord.value < maxWord)
    {
        for (var i = 0; i < vertex.vertexes.getLength(); i++)
        {
            var verTmp = vertex.vertexes.get(i);
            if (verTmp.value.original == matchWords[currentWord.value] || verTmp.value.translated == matchWords[currentWord.value])
            {
                vertex.nextVertex = verTmp.clone();
                vertex.vertexes.P = vertex.ps[i];
                isFound = true;
                currentWord.value += 1;
                this.traverse(vertex.nextVertex, matchWords, currentWord, maxWord);
                break;
            }
        }
    }
    if (!isFound && currentWord.value < maxWord)
    {
        currentWord.value -= 1;
    }
}

Graph.prototype.refine = function (vertexes) {
    var length = vertexes.getLength();
    if (length > 0) {
        var s = "";
        var p = 1;
        var max = 0;
        var bestRoute = 0;

        for (var i = 0; i < length; i++) {
            p = 1;
            var tmp = vertexes.get(i).clone();
            tmp.nextVertex = vertexes.get(i).nextVertex;
            while (tmp.nextVertex != null) {
                p *= tmp.nextVertex.p;
                tmp = tmp.nextVertex;
            }
            if (p > max) {
                max = p;
                bestRoute = i;
            }
        }

        s += vertexes.get(bestRoute).value.translated + " ";
        while (vertexes.get(bestRoute).nextVertex != null) {
            vertexes.set(bestRoute, vertexes.get(bestRoute).nextVertex);
            s += vertexes.get(bestRoute).value.translated + " ";
        }

        return s;
    }
    return "";
}

Graph.prototype.find = function (input) {
    var strArray = input.split(" ");
    var vertexes = this.vertexes.findOriTransVertexArray(strArray[0]);
    var resultVertexes = new list.List();
    var that = this;
    vertexes.forEach(function(ver) {
        var resultVertex = null;
        var currentWord = new int.Int(1);
        that.traverse(ver, strArray, currentWord, strArray.length);
        if (ver.nextVertex != null) {
            resultVertex = ver;
            resultVertexes.add(resultVertex);
        }
        
    });
    return this.refine(resultVertexes);
}





module.exports = {
    Graph : Graph,
}