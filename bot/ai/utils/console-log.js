class ConsoleLog{
    constructor() {}
    static log(text, filename, line) {
        console.log('/*------------------- ' + filename + ': ' + line + ' --------------------*/');
        console.log(new Date());
        console.log(text);
    }
}

module.exports = ConsoleLog