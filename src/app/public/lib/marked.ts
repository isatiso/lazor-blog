/**
 * marked - a markdown parser
 * Copyright (c) 2011-2014, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/chjj/marked
 */

import 'prismjs/prism';

import * as loadLanguages from 'prismjs/components';

import * as platform from 'platform';

declare var Prism: any;
loadLanguages(['python', 'c', 'cpp', 'csharp', 'css', 'javascript', 'perl', 'php', 'sass', 'scss', 'typescript']);

Prism.languages.python = {
    'triple-quoted-string': {
        pattern: /"""[\s\S]+?"""|'''[\s\S]+?'''/,
        alias: 'string'
    },
    'comment': {
        pattern: /(^|[^\\])#.*/,
        lookbehind: true
    },
    'string': {
        pattern: /[rfbu]?("|')(?:\\\\|\\?[^\\\r\n])*?\1/,
        greedy: true
    },

    'function': {
        pattern: /((?:^|\s)def[ \t]+)[a-zA-Z_][a-zA-Z0-9_]*(?=\()/g,
        lookbehind: true
    },
    'variable': {
        pattern: /(?:(^|\s)def[ \t]+[a-zA-Z_][a-zA-Z0-9_]*\(.*[ ,(])[a-zA-Z_][a-zA-Z0-9_]*(?=[ ,)])(?:.*)(?=\))/,
        // lookbehind: true
    },
    'builtin': /\b(?:class|def|from|import|lambda|dict|list|tuple|set|print|range)\b/,
    'method': {
        pattern: /(\.[a-zA-Z_][a-zA-Z0-9_]*(?=\())/,
    },
    'method2': {
        pattern: /(?:[a-zA-Z_][a-zA-Z0-9_]*(?=\())/,
    },
    'class-name': {
        pattern: /(\bclass\s+)[a-z0-9_]+/i,
        lookbehind: true
    },
    'keyword': /\b(?:as|assert|async|await|break|continue|del|elif|else)\b/,
    'keyword2': /\b(?:except|exec|finally|for|global|if|in|is|pass|raise|return|try|while|with|yield)\b/,
    'boolean': /\b(?:True|False)\b/,
    'number': /\b-?(?:0[bo])?(?:(?:\d|0x[\da-f])[\da-f]*\.?\d*|\.\d+)(?:e[+-]?\d+)?j?\b/i,
    'operator': /[-+%=]=?|!=|\*\*?=?|\/\/?=?|<[<=>]?|>[=>]?|[&|^~]|\b(?:or|and|not)\b/,
    'punctuation': /[{}[\];(),.:]/
};


function replace(regex, opt?): any {
    regex = regex.source;
    opt = opt || '';
    return function self(name, val) {
        if (!name) {
            return new RegExp(regex, opt);
        }
        val = val.source || val;
        val = val.replace(/(^|[^\[])\^/g, '$1');
        regex = regex.replace(name, val);
        return self;
    };
}

function merge(obj, ...insertObj) {
    const out: any = Object.assign({}, obj);
    for (let i = 0; i < insertObj.length; i++) {
        const target = insertObj[i];
        for (const key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
                out[key] = target[key];
            }
        }
    }
    return out;
}

/**
 * Helpers
 */

function escape(html, encode?) {
    return html
        .replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function unescape(html) {
    // explicitly match decimal, hex, and named HTML entities
    return html.replace(/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/g, function (_, n) {
        n = n.toLowerCase();
        if (n === 'colon') {
            return ':';
        }
        if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ?
                String.fromCharCode(parseInt(n.substring(2), 16)) :
                String.fromCharCode(+n.substring(1));
        }
        return '';
    });
}

function count_str(regex, str) {
    let code_edge;
    for (let count = 0; ; count++) {
        code_edge = /\n *```/gm.exec(str);
        if (code_edge) {
            str = str.substring(code_edge.index + code_edge[0].length);
            continue;
        }
        return count;
    }
}

class Noop {
    constructor() {

    }

    exec() {

    }
}

const noop = new Noop();

const block: any = {
    newline: /^\n+/,
    paragraph: /^((?:[^\n]+\n?(?!hr|heading|lheading|blockquote|tag|def))+)\n*/,
    list: /^( *)(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?!\1bull )\n*|\s*$)/,
    html: /^ *(?:comment *(?:\n|\s*$)|closed *(?:\n{2,}|\s*$)|closing *(?:\n{2,}|\s*$))/,
    def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +["(]([^\n]+)[")])? *(?:\n+|$)/,
    item: /^( *)(bull) [^\n]*(?:\n(?!\1bull )[^\n]*)*/,
    blockquote: /^( *>[^\n]+(\n(?!def)[^\n]+)*\n*)+/,
    heading: /^ *(#{1,6}) *([^\n]+?) *#* *(?:\n+|$)/,
    bullet: /(?:[*+-]|\d+\.)/,
    code: /^( {4}[^\n]+\n*)+/,
    lheading: /^([^\n]+)\n *(=|-){2,} *(?:\n+|$)/,
    hr: /^( *[-*_]){3,} *(?:\n+|$)/,
    text: /^[^\n]+/,
    table: noop,
    nptable: noop,
    fences: noop,
};

block.item = replace(block.item, 'gm')(/bull/g, block.bullet)();

block.list = replace(block.list)
    (/bull/g, block.bullet)
    ('hr', /\n+(?=\1?(?:[-*_] *){3,}(?:\n+|$))/)
    ('def', '\\n+(?=' + block.def.source + ')')
    ();

block.blockquote = replace(block.blockquote)
    ('def', block.def)
    ();

block._tag = '(?!(?:' +
    'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code' +
    '|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo' +
    '|span|br|wbr|ins|del|img)\\b)\\w+(?!:/|[^\\w\\s@]*@)\\b';

block.html = replace(block.html)
    ('comment', /<!--[\s\S]*?-->/)
    ('closed', /<(tag)[\s\S]+?<\/\1>/)
    ('closing', /<tag(?:"[^"]*"|'[^']*'|[^'">])*?>/)
    (/tag/g, block._tag)
    ();

block.paragraph = replace(block.paragraph)
    ('hr', block.hr)
    ('heading', block.heading)
    ('lheading', block.lheading)
    ('blockquote', block.blockquote)
    ('tag', '<' + block._tag)
    ('def', block.def)
    ();

/**
 * Normal Block Grammar
 */

block.normal = merge({}, block);

/**
 * GFM Block Grammar
 */

block.gfm = merge({}, block.normal, {
    fences: /^ *(`{3,}|~{3,})[ \.]*(\S+)? *\n([\s\S]*?)\s*\1 *(?:\n+|$)/,
    paragraph: /^/,
    heading: /^ *(#{1,6}) +([^\n]+?) *#* *(?:\n+|$)/
});

block.gfm.paragraph = replace(block.paragraph)
    ('(?!', '(?!' +
    block.gfm.fences.source.replace('\\1', '\\2') + '|' +
    block.list.source.replace('\\1', '\\3') + '|')
    ();

/**
 * GFM + Tables Block Grammar
 */

block.tables = merge({}, block.gfm, {
    nptable: /^ *(\S.*\|.*)\n *([-:]+ *\|[-| :]*)\n((?:.*\|.*(?:\n|$))*)\n*/,
    table: /^ *\|(.+)\n *\|( *[-:]+[-| :]*)\n((?: *\|.*(?:\n|$))*)\n*/
});

/**
 * Block Lexer
 */
class Lexer {

    tokens: any;
    options: any;
    rules: any;
    list_level: any;

    constructor(options) {
        this.tokens = [];
        this.tokens.links = {};
        this.options = options || defaults;
        this.rules = block.normal;
        this.list_level = 0;

        if (this.options.gfm) {
            if (this.options.tables) {
                this.rules = block.tables;
            } else {
                this.rules = block.gfm;
            }
        }
        // this.rules = block;
    }

    /**
     * Static Lex Method
     */

    static lex(src, options) {
        const lexer = new Lexer(options);
        return lexer.lex(src);
    }

    /**
     * Preprocessing
     */

    lex(src) {
        src = src
            .replace(/\r\n|\r/g, '\n')
            .replace(/\t/g, '    ')
            .replace(/\u00a0/g, ' ')
            .replace(/\u2424/g, '\n');

        return this.token(src, true);
    }

    /**
     * Lexing
     */

    token(src, top, bq?) {
        src = src.replace(/^ +$/gm, '');
        let cap: any = '';
        let item: any = '';
        let bull: any = '';
        let next: any = '';

        while (src) {
            // newline
            if (cap = this.rules.newline.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[0].length > 1) {
                    this.tokens.push({
                        type: 'space'
                    });
                }
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                cap = cap[0].replace(/^ {4}/gm, '');
                this.tokens.push({
                    type: 'code',
                    text: !this.options.pedantic ?
                        cap.replace(/\n+$/, '') : cap
                });
                continue;
            }

            // fences (gfm)
            if (cap = this.rules.fences.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'code',
                    lang: cap[2],
                    text: cap[3] || ''
                });
                continue;
            }

            // heading
            if (cap = this.rules.heading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[1].length,
                    text: cap[2]
                });
                continue;
            }

            // table no leading pipe (gfm)
            if (top && (cap = this.rules.nptable.exec(src))) {
                src = src.substring(cap[0].length);

                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/\n$/, '').split('\n')
                };

                for (let i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }

                for (let i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i].split(/ *\| */);
                }

                this.tokens.push(item);

                continue;
            }

            // lheading
            if (cap = this.rules.lheading.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'heading',
                    depth: cap[2] === '=' ? 1 : 2,
                    text: cap[1]
                });
                continue;
            }

            // hr
            if (cap = this.rules.hr.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'hr'
                });
                continue;
            }

            // blockquote
            if (cap = this.rules.blockquote.exec(src)) {
                src = src.substring(cap[0].length);

                this.tokens.push({
                    type: 'blockquote_start'
                });

                cap = cap[0].replace(/^ *> ?/gm, '');

                while (1) {
                    const count = count_str(/\n *```/gm, cap);

                    if (count % 2 !== 0) {
                        let code_edge = /\n *``` *\n/gm.exec(src);
                        if (code_edge) {
                            const cut_length = code_edge.index + code_edge[0].length;
                            cap += src.substring(0, cut_length);
                            src = src.substring(cut_length);
                        } else {
                            break;
                        }
                        code_edge = this.rules.blockquote.exec(src);
                        if (code_edge) {
                            src = src.substring(code_edge[0].length);
                            cap += code_edge[0].replace(/^ *> ?/gm, '');
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }

                // Pass `top` to keep the current
                // "toplevel" state. This is exactly
                // how markdown.pl works.
                this.token(cap, top, true);

                this.tokens.push({
                    type: 'blockquote_end'
                });

                continue;
            }

            // list
            if (cap = this.rules.list.exec(src)) {
                src = src.substring(cap[0].length);
                bull = cap[2];

                this.list_level += 1;

                this.tokens.push({
                    type: 'list_start',
                    ordered: bull.length > 1,
                    list_level: this.list_level
                });



                // Get each top-level item.
                cap = cap[0].match(this.rules.item);

                next = false;
                const l = cap.length;

                for (let i = 0; i < l; i++) {
                    item = cap[i];

                    // Remove the list item's bullet
                    // so it is seen as the next token.
                    let space = item.length;
                    item = item.replace(/^ *([*+-]|\d+\.) +/, '');

                    // Outdent whatever the
                    // list item contains. Hacky.
                    if (~item.indexOf('\n ')) {
                        space -= item.length;
                        item = !this.options.pedantic ?
                            item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') :
                            item.replace(/^ {1,4}/gm, '');
                    }

                    // Determine whether the next list item belongs here.
                    // Backpedal if it does not belong in this list.
                    if (this.options.smartLists && i !== l - 1) {
                        const b = block.bullet.exec(cap[i + 1])[0];
                        if (bull !== b && !(bull.length > 1 && b.length > 1)) {
                            src = cap.slice(i + 1).join('\n') + src;
                            i = l - 1;
                        }
                    }

                    // Determine whether item is loose or not.
                    // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
                    // for discount behavior.
                    let loose = next || /\n\n(?!\s*$)/.test(item);
                    if (i !== l - 1) {
                        next = item.charAt(item.length - 1) === '\n';
                        if (!loose) {
                            loose = next;
                        }
                    }

                    this.tokens.push({
                        type: loose ?
                            'loose_item_start' : 'list_item_start',
                        list_level: this.list_level
                    });

                    // Recurse.
                    this.token(item, false, bq);

                    this.tokens.push({
                        type: 'list_item_end'
                    });
                }

                this.tokens.push({
                    type: 'list_end'
                });

                this.list_level -= 1;

                continue;
            }

            // html
            if (cap = this.rules.html.exec(src)) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: this.options.sanitize ?
                        'paragraph' : 'html',
                    pre: !this.options.sanitizer &&
                        (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
                    text: cap[0]
                });
                continue;
            }

            // def
            if ((!bq && top) && (cap = this.rules.def.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.links[cap[1].toLowerCase()] = {
                    href: cap[2],
                    title: cap[3]
                };
                continue;
            }

            // table (gfm)
            if (top && (cap = this.rules.table.exec(src))) {
                src = src.substring(cap[0].length);

                item = {
                    type: 'table',
                    header: cap[1].replace(/^ *| *\| *$/g, '').split(/ *\| */),
                    align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
                    cells: cap[3].replace(/(?: *)?\n$/, '').split('\n')
                };

                for (let i = 0; i < item.align.length; i++) {
                    if (/^ *-+: *$/.test(item.align[i])) {
                        item.align[i] = 'right';
                    } else if (/^ *:-+: *$/.test(item.align[i])) {
                        item.align[i] = 'center';
                    } else if (/^ *:-+ *$/.test(item.align[i])) {
                        item.align[i] = 'left';
                    } else {
                        item.align[i] = null;
                    }
                }

                for (let i = 0; i < item.cells.length; i++) {
                    item.cells[i] = item.cells[i]
                        .replace(/^ *\| *| *\| *$/g, '')
                        .split(/ *\| */);
                }

                this.tokens.push(item);

                continue;
            }

            // top-level paragraph
            if (top && (cap = this.rules.paragraph.exec(src))) {
                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'paragraph',
                    text: cap[1].charAt(cap[1].length - 1) === '\n' ?
                        cap[1].slice(0, -1) : cap[1]
                });
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                // Top-level should never reach here.

                src = src.substring(cap[0].length);
                this.tokens.push({
                    type: 'text',
                    text: `<span class="text">${cap[0]}</span>`,
                });
                continue;
            }

            if (src) {
                throw new
                    Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        return this.tokens;
    }
}

/**
 * Inline-Level Grammar
 */

const inline = {
    escape: /^\\([\\`*{}\[\]()#+\-.!_>])/,
    autolink: /^<([^ >]+(@|:\/)[^ >]+)>/,
    url: noop,
    tag: /^<!--[\s\S]*?-->|^<\/?\w+(?:"[^"]*"|'[^']*'|[^'">])*?>/,
    link: /^!?\[(inside)\]\(href\)/,
    reflink: /^!?\[(inside)\]\s*\[([^\]]*)\]/,
    nolink: /^!?\[((?:\[[^\]]*\]|[^\[\]])*)\]/,
    strong: /^\*\*([\s\S]+?)\*\*(?!\*)/,
    em: /^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    code: /^(`+)\s*([\s\S]*?[^`])\s*\1(?!`)/,
    br: /^ {2,}\n(?!\s*$)/,
    del: noop,
    text: /^[\s\S]+?(?=[\\<!\[_*`]| {2,}\n|$)/
};

inline['_inside'] = /(?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*/;
inline['_href'] = /\s*<?([\s\S]*?)>?(?:\s+['"]([\s\S]*?)['"])?\s*/;

inline.link = replace(inline.link)
    ('inside', inline['_inside'])
    ('href', inline['_href'])
    ();

inline.reflink = replace(inline.reflink)
    ('inside', inline['_inside'])
    ();

/**
 * Normal Inline Grammar
 */

inline['normal'] = merge({}, inline);

/**
 * Pedantic Inline Grammar
 */

inline['pedantic'] = merge({}, inline['normal'], {
    strong: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
    em: /^_(?=\S)([\s\S]*?\S)_(?!_)|^\*(?=\S)([\s\S]*?\S)\*(?!\*)/
});

/**
 * GFM Inline Grammar
 */

inline['gfm'] = merge({}, inline['normal'], {
    escape: replace(inline.escape)('])', '~|])')(),
    url: /^(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/,
    del: /^~~(?=\S)([\s\S]*?\S)~~/,
    text: replace(inline.text)
        (']|', '~]|')
        ('|', '|https?://|')
        ()
});

/**
 * GFM + Line Breaks Inline Grammar
 */

inline['breaks'] = merge({}, inline['gfm'], {
    br: replace(inline.br)('{2,}', '*')(),
    text: replace(inline['gfm'].text)('{2,}', '*')()
});

/**
 * Inline Lexer & Compiler
 */

class InlineLexer {

    options: any;
    links: any;
    rules: any;
    renderer: any;
    inLink: any;
    img_checker = /^(.*)\/lazor\.cn\/(.*)\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\.(jpg|gif|png)$/;

    constructor(links, options?, renderer?) {
        this.options = options || defaults;
        this.links = links;
        this.rules = inline['normal'];
        this.renderer = this.options.renderer || new Renderer();
        this.renderer.options = this.options;

        if (!this.links) {
            throw new
                Error('Tokens array requires a `links` property.');
        }

        if (this.options.gfm) {
            if (this.options.breaks) {
                this.rules = inline['breaks'];
            } else {
                this.rules = inline['gfm'];
            }
        } else if (this.options.pedantic) {
            this.rules = inline['pedantic'];
        }
        this.rules = inline;
    }



    /**
     * Static Lexing/Compiling Method
     */

    static output(src, links, options) {
        const inline_lexer = new InlineLexer(links, options);
        return inline_lexer.output(src);
    }

    /**
     * Lexing/Compiling
     */

    output(src) {
        let out = '';
        let link: any = '';
        let text: any = '';
        let href: any = '';

        while (src) {
            // escape
            let cap: any = '';
            if (cap = this.rules.escape.exec(src)) {
                src = src.substring(cap[0].length);
                out += cap[1];
                continue;
            }

            // autolink
            if (cap = this.rules.autolink.exec(src)) {
                src = src.substring(cap[0].length);
                if (cap[2] === '@') {
                    text = cap[1].charAt(6) === ':' ?
                        this.mangle(cap[1].substring(7)) :
                        this.mangle(cap[1]);
                    href = this.mangle('mailto:') + text;
                } else {
                    text = escape(cap[1]);
                    href = text;
                }
                out += this.renderer.link(href, null, text);
                continue;
            }

            // url (gfm)
            if (!this.inLink && (cap = this.rules.url.exec(src))) {
                src = src.substring(cap[0].length);
                text = escape(cap[1]);
                href = text;
                out += this.renderer.link(href, null, text);
                continue;
            }

            // tag
            if (cap = this.rules.tag.exec(src)) {
                if (!this.inLink && /^<a /i.test(cap[0])) {
                    this.inLink = true;
                } else if (this.inLink && /^<\/a>/i.test(cap[0])) {
                    this.inLink = false;
                }
                src = src.substring(cap[0].length);
                let tmp: any;
                if (this.options.sanitize) {
                    if (this.options.santizer) {
                        tmp = this.options.santizer(cap[0]);
                    } else {
                        tmp = escape(cap[0]);
                    }
                } else {
                    tmp = cap[0];
                }
                out += tmp;
                continue;
            }

            // link
            if (cap = this.rules.link.exec(src)) {
                src = src.substring(cap[0].length);
                this.inLink = true;
                out += this.outputLink(cap, {
                    href: cap[2],
                    title: cap[3]
                });
                this.inLink = false;
                continue;
            }

            // reflink, nolink
            if ((cap = this.rules.reflink.exec(src)) ||
                (cap = this.rules.nolink.exec(src))) {
                src = src.substring(cap[0].length);
                link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
                link = this.links[link.toLowerCase()];
                if (!link || !link.href) {
                    out += cap[0].charAt(0);
                    src = cap[0].substring(1) + src;
                    continue;
                }
                this.inLink = true;
                out += this.outputLink(cap, link);
                this.inLink = false;
                continue;
            }

            // strong
            if (cap = this.rules.strong.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.strong(this.output(cap[2] || cap[1]));
                continue;
            }

            // em
            if (cap = this.rules.em.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.em(this.output(cap[2] || cap[1]));
                continue;
            }

            // code
            if (cap = this.rules.code.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.codespan(escape(cap[2], true));
                continue;
            }

            // br
            if (cap = this.rules.br.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.br();
                continue;
            }

            // del (gfm)
            if (cap = this.rules.del.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.del(this.output(cap[1]));
                continue;
            }

            // text
            if (cap = this.rules.text.exec(src)) {
                src = src.substring(cap[0].length);
                out += this.renderer.text(escape(this.smartypants(cap[0])));
                continue;
            }

            if (src) {
                throw new
                    Error('Infinite loop on byte: ' + src.charCodeAt(0));
            }
        }

        for (let i = 0; i < defaults.img_list.length; i++) {
            const checkout = this.img_checker.exec(defaults.img_list[i].toLowerCase());
            if (checkout) {
                defaults.img_list[i] = checkout[3];
            } else {
                defaults.img_list[i] = '';
            }
        }

        return out;
    }

    /**
     * Compile Link
     */

    outputLink(cap, link) {
        const href = escape(link.href);
        const title = link.title ? escape(link.title) : null;

        if (cap[0].charAt(0) !== '!') {
            return this.renderer.link(href, title, this.output(cap[1]));
        } else {
            defaults.img_list.push(href);
            return this.renderer.image(href, title, escape(cap[1]));
        }
    }

    /**
     * Smartypants Transformations
     */

    smartypants(text) {
        if (!this.options.smartypants) {
            return text;
        }
        return text
            // em-dashes
            .replace(/---/g, '\u2014')
            // en-dashes
            .replace(/--/g, '\u2013')
            // opening singles
            .replace(/(^|[-\u2014/(\[{"\s])'/g, '$1\u2018')
            // closing singles & apostrophes
            .replace(/'/g, '\u2019')
            // opening doubles
            .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, '$1\u201c')
            // closing doubles
            .replace(/"/g, '\u201d')
            // ellipses
            .replace(/\.{3}/g, '\u2026');
    }

    /**
     * Mangle Links
     */

    mangle(text) {
        if (!this.options.mangle) { return text; }
        let out = '';
        let ch: any = '';
        const l = text.length;

        for (let i = 0; i < l; i++) {
            ch = text.charCodeAt(i);
            if (Math.random() > 0.5) {
                ch = 'x' + ch.toString(16);
            }
            out += '&#' + ch + ';';
        }

        return out;
    }

}

/**
 * Renderer
 */

class Renderer {
    options: any;

    constructor(options?) {
        this.options = options || {};
    }

    translate_lang(lang: string) {
        switch (lang.toLowerCase()) {
            case 'javascript':
                return 'JavaScript';
            case 'python':
                return 'Python';
            case 'html':
                return 'HTML';
            case 'sql':
                return 'SQL';
            case 'mongodb':
                return 'MongoDB';
            case 'css':
                return 'CSS';
            case 'plaintext':
                return 'Plain Text';
            default:
                return lang;
        }
    }

    code(code, lang, escaped) {
        lang = lang && lang.toLowerCase() || 'plaintext';
        if (lang in Prism.languages) {
            const out = Prism.highlight(code, Prism.languages[lang], lang);
            if (out != null && out !== code) {
                escaped = true;
                code = out;
            }
        }

        lang = this.translate_lang(lang);

        return `<div class="code-block"><pre><div class="outline">${escape(lang, true)}</div>` +
            `<code>${(escaped ? code : escape(code, true))}\n</code></pre></div>\n`;
        // class="${this.options.langPrefix}${escape(lang, true)}"
    }

    blockquote(quote) {
        return '<blockquote>\n' + quote + '</blockquote>\n';
    }

    html(html) {
        return html;
    }

    heading(text, level, raw) {
        return '<div class="head-' + level + '"><h' +
            level +
            ' id="' +
            this.options.headerPrefix +
            raw.toLowerCase().replace(/[^\w]+/g, '-') +
            '">' +
            text +
            '</h' +
            level +
            '></div>\n';
    }

    hr() {
        return '<hr/>\n';
    }

    list(body, ordered) {
        const type = ordered ? 'ol' : 'ul';
        const class_name = ordered ? 'circle-list' : 'rect-list';
        return `<div class="${class_name}"><${type}>\n${body}</${type}></div>\n`;
    }

    listitem(text, list_level) {
        return `<li class="list-level-${list_level}">${text}</li>\n`;
    }

    paragraph(text) {
        return `<p>${text}</p>\n`;
    }

    table(header, body) {
        return '<table>\n' +
            '<thead>\n' +
            header +
            '</thead>\n' +
            '<tbody>\n' +
            body +
            '</tbody>\n' +
            '</table>\n';
    }

    tablerow(content) {
        return '<tr>\n' + content + '</tr>\n';
    }

    tablecell(content, flags) {
        const type = flags.header ? 'th' : 'td';
        const tag = flags.align ?
            '<' + type + ' style="text-align:' + flags.align + '">' :
            '<' + type + '>';
        return tag + content + '</' + type + '>\n';
    }

    // span level renderer
    strong(text) {
        return '<span class="md-strong">' + text + '</span>';
    }

    em(text) {
        return '<span class="md-italic">' + text + '</span>';
    }

    codespan(text) {
        return '<code class="inline-code">' + text + '</code>';
    }

    br() {
        return '<br/>';
    }

    del(text) {
        return '<del>' + text + '</del>';
    }

    link(href, title, text) {
        let prot: any;
        if (this.options.sanitize) {
            try {
                prot = decodeURIComponent(unescape(href))
                    .replace(/[^\w:]/g, '')
                    .toLowerCase();
            } catch (e) {
                return '';
            }
            if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0) {
                return '';
            }
        }
        return `<a target="_blank" href="${href}" ${title && `title="${title}"` || ''}>${text}</a>`;
    }

    image(href, title, text) {
        return `<div class="md-image">` +
            `<img src="${href}" onclick="window.current_image='${href}'" alt="${text}" ${title && `title="${title}"` || ''}/>` +
            `</div>`;
    }

    text(text) {
        return text;
    }
}


/**
 * Parsing & Compiling
 */

class Parser {
    tokens: any;
    token: any;
    options: any;
    renderer: any;
    inline: any;
    img_list: string[];

    constructor(options, renderer?) {
        this.tokens = [];
        this.token = null;
        this.options = options || defaults;
        this.options.renderer = this.options.renderer || Renderer;
        this.renderer = this.options.renderer;
        this.renderer.options = this.options;
    }

    /**
     * Static Parse Method
     */
    static parse(src, options?, renderer?) {
        const parser = new Parser(options, renderer);
        return parser.parse(src);
    }

    /**
     * Parse Loop
     */
    parse(src) {
        this.inline = new InlineLexer(src.links, this.options, this.renderer);
        this.tokens = src.reverse();
        let out = '';
        while (this.next()) {
            out += this.tok();
        }
        return out;
    }
    /**
     * Next Token
     */

    next() {
        return this.token = this.tokens.pop();
    }

    /**
     * Preview Next Token
     */

    peek() {
        return this.tokens[this.tokens.length - 1] || 0;
    }

    /**
     * Parse Text Tokens
     */

    parseText() {
        let body = this.token.text;

        while (this.peek().type === 'text') {
            body += '\n' + this.next().text;
        }

        return this.inline.output(body);
    }

    /**
     * Parse Current Token
     */

    tok() {
        switch (this.token.type) {
            case 'space':
                {
                    return '';
                }
            case 'hr':
                {
                    return this.renderer.hr();
                }
            case 'heading':
                {
                    return this.renderer.heading(
                        this.inline.output(this.token.text),
                        this.token.depth,
                        this.token.text);
                }
            case 'code':
                {
                    return this.renderer.code(this.token.text,
                        this.token.lang,
                        this.token.escaped);
                }
            case 'table':
                {
                    let header = '';
                    let body = '';
                    let cell: any;

                    // header
                    cell = '';
                    for (let i = 0; i < this.token.header.length; i++) {
                        const flags = { header: true, align: this.token.align[i] };
                        cell += this.renderer.tablecell(
                            this.inline.output(this.token.header[i]), { header: true, align: this.token.align[i] }
                        );
                    }
                    header += this.renderer.tablerow(cell);

                    for (let i = 0; i < this.token.cells.length; i++) {
                        const row = this.token.cells[i];

                        cell = '';
                        for (let j = 0; j < row.length; j++) {
                            cell += this.renderer.tablecell(
                                this.inline.output(row[j]), { header: false, align: this.token.align[j] }
                            );
                        }

                        body += this.renderer.tablerow(cell);
                    }
                    return this.renderer.table(header, body);
                }
            case 'blockquote_start':
                {
                    let body = '';

                    while (this.next().type !== 'blockquote_end') {
                        body += this.tok();
                    }

                    return this.renderer.blockquote(body);
                }
            case 'list_start':
                {
                    let body = '';
                    const ordered = this.token.ordered;

                    while (this.next().type !== 'list_end') {
                        body += this.tok();
                    }

                    return this.renderer.list(body, ordered);
                }
            case 'list_item_start':
                {
                    let body = '';
                    const list_level = this.token.list_level;

                    while (this.next().type !== 'list_item_end') {
                        body += this.token.type === 'text' ? this.parseText() : this.tok();
                    }

                    return this.renderer.listitem(body, list_level);
                }
            case 'loose_item_start':
                {
                    let body = '';
                    const list_level = this.token.list_level;
                    while (this.next().type !== 'list_item_end') {
                        body += this.tok();
                    }

                    return this.renderer.listitem(body, list_level);
                }
            case 'html':
                {
                    const html = !this.token.pre && !this.options.pedantic ?
                        this.inline.output(this.token.text) : this.token.text;
                    return this.renderer.html(html);
                }
            case 'paragraph':
                {
                    return this.renderer.paragraph(this.inline.output(this.token.text));
                }
            case 'text':
                {
                    return this.renderer.paragraph(this.parseText());
                }
        }
    }
}

const defaults: any = {
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: false,
    sanitizer: null,
    mangle: true,
    smartLists: true,
    silent: false,
    highlight: null,
    langPrefix: 'lang-',
    smartypants: false,
    headerPrefix: '',
    renderer: new Renderer(),
    xhtml: false,
    img_list: []
};

/**
 * Marked
 */
export class Marked {

    options: any;
    Parser: any;
    parser: any;
    Renderer: any;
    Lexer: any;
    lexer: any;
    InlineLexer: any;
    inlineLexer: any;
    parse: any;
    defaults: any = defaults;
    img_list = defaults.img_list;


    constructor() {
        this.options = this.setOptions();
        this.Parser = Parser;
        this.parser = Parser.parse;
        this.Renderer = Renderer;
        this.Lexer = Lexer;
        this.lexer = Lexer.lex;
        this.InlineLexer = InlineLexer;
        this.inlineLexer = InlineLexer.output;
        this.parse = this.render;

    }

    setOptions(opt?) {
        opt = merge(this.defaults, opt);
        return opt;
    }

    render(src, opt, callback) {
        defaults.img_list = [];
        this.img_list = defaults.img_list;
        if (callback || typeof opt === 'function') {
            if (!callback) {
                callback = opt;
                opt = null;
            }

            opt = merge({}, this.defaults, opt || {});

            const highlight = opt.highlight;
            let tokens: any;
            let i = 0;

            try {
                tokens = Lexer.lex(src, opt);
            } catch (e) {
                return callback(e);
            }

            let pending = tokens.length;

            const done = function (err?) {
                if (err) {
                    opt.highlight = highlight;
                    return callback(err);
                }

                let out: any;

                try {
                    out = Parser.parse(tokens, opt);
                } catch (e) {
                    err = e;
                }

                opt.highlight = highlight;

                return err ?
                    callback(err) :
                    callback(null, out);
            };

            if (!highlight || highlight.length < 3) {
                return done();
            }

            delete opt.highlight;

            if (!pending) {
                return done();
            }

            for (; i < tokens.length; i++) {
                (function (token) {
                    if (token.type !== 'code') {
                        return --pending || done();
                    }
                    return highlight(token.text, token.lang, function (err, code) {
                        if (err) {
                            return done(err);
                        }
                        if (code == null || code === token.text) {
                            return --pending || done();
                        }
                        token.text = code;
                        token.escaped = true;
                        --pending;
                        if (!pending) {
                            done();
                        }
                    });
                })(tokens[i]);
            }

            return;
        }
        try {
            if (opt) {
                opt = merge({}, this.defaults, opt);
            }
            const res = Parser.parse(Lexer.lex(src, opt), opt);
            return res;

        } catch (e) {
            e.message += '\nPlease report this to https://github.com/isatiso/lazor-blog.';
            if ((opt || this.defaults).silent) {
                return '<p>An error occured:</p><pre>' +
                    escape(e.message + '', true) +
                    '</pre>';
            }
            throw e;
        }
    }
}
