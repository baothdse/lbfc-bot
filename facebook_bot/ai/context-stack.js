
function ContextStack(){
    this.stack = [];
}

ContextStack.prototype.push = function (context) {
    this.stack.push(context);
}

ContextStack.prototype.pop = function () {
    return this.stack.pop();
}

module.exports = {
    ContextStack : ContextStack
}