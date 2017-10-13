var arrayList;

function List() {
    this.arrayList = [];
}

List.prototype.add = function(value) {
    this.arrayList.push(value);
}

List.prototype.findTranslated = function (value) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.translated == value.translated) {
            result = element;
        }
    });
    return result;
}

List.prototype.findOriginal = function (value) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.original == value.original) {
            result = element;
        }
    });
    return result;
}

List.prototype.findOriTrans = function (value) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.original == value.original || element.translated == value.translated) {
            result = element;
        }
    });
    return result;
}

List.prototype.findTranslatedVertex = function (vertex) {
    var result = null;
    this.arrayList.some(function(element){
        if (element.value.translated == vertex.value.translated) {
            result = element;
            return true;
        }
    });
    return result;
}

List.prototype.findOriginalVertex = function (vertex) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.value.original == vertex.value.original) {
            result = element;
        }
    });
    return result;
}

List.prototype.findOriTransVertex = function (vertex) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.value.original == vertex.value.original || element.value.translated == vertex.value.translated) {
            result = element;
        }
    });
    return result;
}

List.prototype.findTranslatedVertex2 = function (value) {
    var result = null;
    this.arrayList.some(function(element){
        if (element.value.translated == value) {
            result = element;
            return true;
        }
    });
    return result;
}

List.prototype.findOriginalVertex2 = function (value) {
    var result = null;
    this.arrayList.some(function(element){
        if (element.value.original == value) {
            result = element;
            return true;
        }
    });
    return result;
}

List.prototype.findOriTransVertex2 = function (value) {
    var result = null;
    this.arrayList.forEach(function(element){
        if (element.value.original == value || element.value.translated == value) {
            result = element;
        }
    });
    return result;
}

List.prototype.findOriTransVertexArray = function (value) {
    var result = [];
    this.arrayList.forEach(function(element){
        if (element.value.original == value || element.value.translated == value) {
            result.push(element);
        }
    });
    return result;
}

List.prototype.findTranslatedVertexArray = function (value) {
    var result = [];
    this.arrayList.forEach(function(element){
        if (element.value.translated == value) {
            result.push(element);
        }
    });
    return result;
}

List.prototype.get = function (pos) {
    return this.arrayList[pos];
}

List.prototype.getLength = function () {
    return this.arrayList.length;
}

List.prototype.set = function (pos, vertex) {
    this.arrayList[pos] = vertex;
}

module.exports = {
    List : List,
}