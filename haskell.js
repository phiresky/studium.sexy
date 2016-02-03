// wandelt einen akzeptor in einen regulären ausdruck um
var prio = {
    "?": 1,
    "*": 1,
    "+": 1,
    "∘": 2,
    "∪": 3,
    "|": 3
};
function isRedundant(expr, begin, end) {
    var l = expr[begin - 1], r = expr[end + 1];
    if (l === undefined && r === undefined)
        return true;
    var depth = 0;
    return expr.substring(begin + 1, end).split("").every(function (c, i) {
        if (c == '(')
            depth++;
        else if (c == ')')
            depth--;
        else if (depth == 0) {
            if (prio[c] > prio[l] || prio[c] > prio[r])
                return false;
        }
        return true;
    });
}
function findCorresponding(expr, lbr) {
    var depth = 0;
    for (var i = lbr; i < expr.length; i++) {
        if (expr[i] == "(")
            depth++;
        if (expr[i] == ")") {
            depth--;
            if (depth == 0)
                return i;
        }
    }
}
function reduce(expr) {
    if (expr.length == 0)
        return "";
    var lbr = expr.indexOf("(");
    if (lbr >= 0) {
        var rbr = findCorresponding(expr, lbr);
        var br = !isRedundant(expr, lbr, rbr);
        var ret = expr.substring(0, lbr) + (br ? "(" : "") + reduce(expr.substring(lbr + 1, rbr)) + (br ? ")" : "") + reduce(expr.substring(rbr + 1));
        console.log("returning: " + ret);
        return ret;
    }
    return expr;
}
function unbullshit(expr) {
    expr = reduce(expr);
    do {
        var old = expr;
        expr = reduce(expr).replace(/\s/g, "").replace(/∪/g, "|").replace(/(.)\|ε/g, "$1?").replace(/ε\|(.)/g, "$1?").replace(/\?\*/g, "*").replace(/(.)\?∘\1\*/g, "$1*").replace(/(.)∘\1\*/g, "$1+");
    } while(old != expr);
    return expr;
}
var Union = function (a, b) {
    return "(" + a + ")∪(" + b + ")";
};
var Symbol = function (a) {
    return [a];
};
var Star = function (a) {
    return "((" + a + ")*)";
};
var Concat = function (a, b) {
    return "(" + a + ")∘(" + b + ")";
};
var foldr1 = function (f, a) {
    return a.reduceRight(f);
};
var map = function (f, a) {
    return a.map(f);
};
function automatToRegex(f, over, start, end) {
    if (over == 0) {
        var res = f(start, end);
        if (res === [])
            return "empty";
        return foldr1(Union, res.map(Symbol));
    } else {
        return Union(automatToRegex(f, over - 1, start, end), Concat(automatToRegex(f, over - 1, start, over), Concat(Star(automatToRegex(f, over - 1, over, over)), automatToRegex(f, over - 1, over, end))));
    }
}

function delta(a, b) {
    return {
        "1,1": ['0', 'ε'],
        "1,2": ['1'],
        "2,2": ['ε', '1'],
        "2,1": ['0'] }[a + "," + b];
}

var regex = automatToRegex(delta, 2, 1, 2);
window['o'].textContent = "orig:" + regex + "\nsimplified:" + unbullshit(regex);
