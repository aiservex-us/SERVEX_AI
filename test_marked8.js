const { marked } = require('marked');

const origRenderer = new marked.Renderer();

marked.use({
  renderer: {
    list(token) {
      // original list renderer returns <ul><li>...</li></ul>
      const origHtml = origRenderer.list.call(this, token);
      const classes = token.ordered ? 'ol-class' : 'ul-class';
      // replace <ul> with <ul class="...">
      if (token.ordered) {
        return origHtml.replace(/^<ol>/, `<ol class="${classes}">`);
      } else {
        return origHtml.replace(/^<ul>/, `<ul class="${classes}">`);
      }
    },
    listitem(token) {
      const origHtml = origRenderer.listitem.call(this, token);
      return origHtml.replace(/^<li>/, '<li class="li-class">');
    },
    table(token) {
      const origHtml = origRenderer.table.call(this, token);
      return `<div class="wrapper">${origHtml}</div>`;
    }
  }
});

console.log(marked.parse('- list item'));
console.log(marked.parse('| a |\n|---| \n| 1 |'));
