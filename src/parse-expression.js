
// '$','_',

const Quotes = ['\'','\"','\`'];
const Brackets = ['(',')','{','}'];
const Spaces = [' ','\n','\r','\v','\t','\b'];
const Symbols = ['<','>',',','|','=','?',':',';','*','-','+','/','!','^','%','&'];

const Numbers = ['0','1','2','3','4','5','6','7','8','9'];

const Operators = [].concat(Quotes, Symbols);
const Delimiters = [].concat(Quotes, Symbols, Brackets, Spaces);

// export default 
function parse (data) {
    let item = null;
    const items = [];

    for (let i = 0, l = data.length; i < l; i++) {
        const c = data[i];
        const nextChar = data[i+1]
        const previousChar = data[i-1];

        const isFirstIndex = i === 0;
        const isLastIndex = i === l-1;

        // if (Quotes.includes(c)) {

        //     if (string) {

        //         if (c === string.c && previousChar !== '\\') {
        //             string.endChar = c;
        //             string.endIndex = i;
        //             result.push(string);
        //             string = null;
        //         } else {
        //             string.d += c;
        //         }

        //     } else {
        //         string = {
        //             result: '',
        //             startChar: c,
        //             startIndex: i,
        //             endChar: null,
        //             endIndex: null,
        //             type: 'string',
        //         };
        //     }
            
        //     continue;
        // } else if (string) {
        //     string.result += c;
        //     continue;
        // }

        const isDelimiter = Delimiters.includes(c);

        if (
            isFirstIndex || isLastIndex || isDelimiter
            // || (item && item.type !== 'string' && Spaces.includes(c))
        ) {

            if (item) {
                const isSameChar = item.startChar === c;

                if (item.type === 'string') {
                    if (isSameChar && previousChar === '\\') { item.result += c; continue; } 
                    if (Quotes.includes(c)) { item.result += c; continue; }
                    if (Spaces.includes(c)) { item.result += c; continue; }
                }

                item.endIndex = i;
                item.endChar = isLastIndex ? '' : c;

                if ( item.result === 'true' || item.result === 'false') item.type = 'boolean';
                if ( item.result === 'in' || item.result === 'typeof' || item.result === 'instanceof') item.type = 'operator';

                items.push(item);
                item = null;
            } else {

                item = {
                    startIndex: i,
                    endChar: null,
                    endIndex: null,
                    type: 'unknown',
                    startChar: isFirstIndex ? '' : c,
                    result: isFirstIndex && isDelimiter ? '' : c,
                };

                // if (c !== '' && !isNaN(c)) {
                if (Quotes.includes(c)) {
                    item.type = 'string';
                } else {
                    if (Operators.includes(c)) {
                        item.type = 'operator';
                    } else if (Numbers.includes(c)) {
                        item.type = 'number';
                    } else {
                        item.type = 'variable';
                    }
                }

            }

        } else if (item) {
            item.result += c;
            continue;
        }

    }

    return items;
}

// const v = 'foo.toUpperCase(pop, scoop, flat.data.asd) || bar.baz';
const v = 'one ===true ? forlore : 1';
const r = parse(v);
console.log(r);
