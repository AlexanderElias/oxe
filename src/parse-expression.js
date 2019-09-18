// http://es5.github.io/#A.1
// '$','_',
// const Booleans = ['true','false'];
// const Punctuators = ['\'','\"','\`','(',')','{','}','<','>',',','|','=','?',':',';','*','-','+','/','!','^','%','&','~'];

const Spaces = [' ','\b','\t','\v','\f','\n','\r'];
const Primitives = ['true','false','undefined','null'];
const Keywords = ['async','await','break','case','catch','class','const','continue','debugger','default','delete','do','else','export','extends','finally','for','function','if','import','in','instanceof','let','new','return','super','switch','this','throw','try','typeof','var','void','while','with','yield'];

const Quotes = ['\'','\"','\`'];
const Brackets = ['(',')','{','}'];
const Numbers = ['0','1','2','3','4','5','6','7','8','9'];
const Symbols = ['<','>',',','|','=','?',':',';','*','-','+','/','!','^','%','&','~'];
const Letters = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

const Operators = [].concat(Quotes, Symbols);
const Delimiters = [].concat(Quotes, Brackets, Spaces, Symbols);

// const Types = [].concat(Quotes, Brackets, Spaces, Numbers, Symbols);
const Types = [Quotes, Brackets, Spaces, Numbers, Symbols, Letters];
const TypeLength = Types.length;

const Type = function (data) {
    for (let i = 0; i < TypeLength; i++) {
        for (const char of Types[i]) {
            if (data === char) {
                switch (i) {
                    case 0: return 'quote';
                    case 1: return 'bracket';
                    case 2: return 'space';
                    case 3: return 'number';
                    case 4: return 'symbol';
                    case 5: return 'letter';
                }
            }
        } 
    }
};

// export default 
function parse (data) {
    let node = null;
    const nodes = [];

    for (let i = 0, l = data.length; i < l; i++) {
        const c = data[i];
        // const nextChar = data[i+1]
        const previousChar = data[i-1];

        // const isFirstIndex = i === 0;
        const isLastIndex = i === l-1;

        const type = Type(c);
        const isQuote = type === 'quote';
        // const isSpace = type === 'space';
        const isNumber = type === 'number';
        // const isSymbol = type === 'symbol';
        // const isBracket = type === 'bracket';
        // const isOperator = type === 'quote' || type === 'bracket' || type === 'symbol';
        const isDelimiter = type === 'quote' || type === 'bracket' || type === 'space' || type === 'symbol';

        if (node) {
            
            if (node.type === 'string') {
                const isSameChar = data[node.start] === c;

                if (!isSameChar || (isSameChar && previousChar === '\\')) {
                    node.value += c;
                    continue;
                } else {
                    node.end = i-1;
                    nodes.push(node);
                    nodes.push({ start: i, end: i, value: c, type });
                    node = null;
                }

            } else if (node.type === 'unknown') {

                if (!isDelimiter) {
                    node.value += c;
                    if (!isLastIndex) continue;
                }
                
                if (node.value.length === 0 || node.value.length === 1 && Operators.includes(node.value)) {
                    node = null;
                    // continue;
                } else if (Primitives.includes(node.value)) {
                    node.type = 'primitive';
                } else if (Keywords.includes(node.value)) {
                    node.type = 'keyword';
                } else {
                    node.type = 'identifier';
                }

                if (node) {
                    node.end = i-1;
                    nodes.push(node);
                    node = null;
                }

                if (isDelimiter) {
                    nodes.push({ start: i, end: i, value: c, type });
                }

            }
 
        } else {

            node = {
                start: i,
                end: null,
                type: 'unknown',
                value: isDelimiter ? '' : c,
            };

            if (isQuote) {
                node.type = 'string';
            } else if (isNumber) {
                node.type = 'number';
            }

            if (isDelimiter) {
                nodes.push({ start: i, end: i, value: c, type });
            }
            
        }

    }

    return nodes;
}

// const v = 'foo.toUpperCase(pop, scoop, flat.data.asd) || bar.baz';
// const v = 'one ===true ? forlore : 1';
// const v = 'foo.bar.baz+moo.cow';
const v = 'foo.bar.baz+`test\` hmm`+weird';
const r = parse(v);
console.log(r);
