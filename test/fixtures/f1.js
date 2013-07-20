define(function () {
    var f = function () {
        return "f1()";
    };

    f.staticFunc = function () {
        return "f1.staticFunc()";
    };

    return  f;
});