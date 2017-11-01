var Vertex = require('./vertex');
var lm = require('./LM');
var list = require('./utils/list');
var int = require('./utils/int');
var vertexes;

class Graph {
    constructor() {
        this.vertexes = new list.List(); 
    }

    add(first, second, p, i) {
        var v = this.vertexes.findTranslatedVertex2(first.translated);
        if (v == null || (v.value.original != first.original)) {
            v = new Vertex(first, new list.List(), null, null, []);
            this.vertexes.add(v);
        } 
        var v2 = this.vertexes.findTranslatedVertex2(second.translated);
        if (v2 == null || (v2.value.original != second.original)) {
            v2 = new Vertex(second, new list.List(), null, null, []);
            this.vertexes.add(v2);
        }
        v.add(v2);
    }

    traverse(vertex, matchWords, currentWord, maxWord) {
        var isFound = false;
        if (currentWord.value < maxWord)
        {
            for (var i = 0; i < vertex.vertexes.getLength(); i++)
            {
                var verTmp = vertex.vertexes.get(i);
                if (verTmp.value.original == matchWords[currentWord.value] || verTmp.value.translated == matchWords[currentWord.value])
                {
                    vertex.nextVertex = verTmp.clone();
                    vertex.nextVertex.P = (vertex.Ps == null ? 0.001 : vertex.Ps[i]);
                    isFound = true;
                    currentWord.value += 1;
                    this.traverse(vertex.nextVertex, matchWords, currentWord, maxWord);
                    if (currentWord < maxWord) break;
                }
            }
        }
        if (!isFound)
        {
            if (currentWord.value < maxWord)
            {
                vertex.nextVertex = new Vertex(new lm.LM(matchWords[currentWord.value], matchWords[currentWord.value]), this.vertexes, null, 0.001, null);
                ++currentWord.value;
                this.traverse(vertex.nextVertex, matchWords, currentWord, maxWord);
            }
        }
    }

    refine(vertexes) {
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

    find(input) {
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
}



module.exports = Graph