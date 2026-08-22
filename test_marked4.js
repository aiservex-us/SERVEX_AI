const { marked } = require('marked');
const renderer = new marked.Renderer();

const methods = ['table', 'tablerow', 'tablecell', 'list', 'listitem', 'paragraph', 'heading', 'codespan', 'code', 'blockquote'];
methods.forEach(m => {
  renderer[m] = function(token) {
    console.log(`\n--- ${m} token ---`);
    console.log(JSON.stringify(token, (k,v) => k==='tokens'?'[tokens]':v, 2));
    return '';
  }
});

marked.use({ renderer });

const md = `
# Heading
Paragraph with \`code\`
> blockquote
- list item

| a | b |
|---|---|
| 1 | 2 |

\`\`\`js
code block
\`\`\`
`;
marked.parse(md);
