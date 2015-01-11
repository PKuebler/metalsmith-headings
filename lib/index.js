
var cheerio = require('cheerio');
var extname = require('path').extname;

/**
 * Expose `plugin`.
 */

module.exports = plugin;

/**
 * Get the headings from any html files.
 *
 * @param {String or Object} options (optional)
 *   @property {Array} selectors
 */

function plugin(options){
  if ('string' == typeof options) options = { selectors: [options] };
  options = options || {};
  var selectors = options.selectors || ['h2'];

  return function(files, metalsmith, done){
    setImmediate(done);
    Object.keys(files).forEach(function(file){
      if ('.html' != extname(file)) return;
      var data = files[file];
      var contents = data.contents.toString();
      var $ = cheerio.load(contents);
      data.headings = [];

      $(getQuery(selectors)).each(function(){
        s = null;
        for (var i = 0; i < selectors.length; i++) {
          if ($(this).is(selectors[i]))
            s = selectors[i];
        }

        data.headings.push({
          id: $(this).attr('id'),
          text: $(this).text(),
          selector: s,
          // Refs:
          //    https://github.com/cheeriojs/cheerio/issues/187
          level: $(this)[0].name
        });
      });

      if (typeof options.tree !== 'undefined' && options.tree == true)
        data.tree = getTree(selectors, data.headings);
    });
  };
}

function getQuery(selectors) {
  var select = '';
  selectors.forEach(function(s) {
    if (select != '')
      select+=',';
    select+= s;
  });
  return select;
}

function getTree(selectors, headings) {
  var tree = {
    id: 'Tree-Root',
    parent: null,
    children: [],
    order: -1
  };

  var pointer = tree;

  var keys = Object.keys(headings);

  for (var i = 0; i < keys.length; i++) {
    var h = headings[keys[i]]

    h.parent = null;
    h.children = [];
    h.order = selectors.indexOf(h.selector);

    if (h === pointer) {
      continue;
    }

    if (h.order == -1) {
      tree.children.push(h);
      continue;
    }

    checkLevel(h, pointer);

    pointer = h;
  }

//  printTree(tree);

  return tree;
}

function checkLevel(check, level) {
  if (check.order > level.order) {
    // Bigger Level
    check.parent = level;
    level.children.push(check);
  } else if (check.order == level.order) { 
    // Same Level
    check.parent = level.parent;
    level.parent.children.push(check);
  } else { 
    // Small Level
    // Find Parent
    checkLevel(check, level.parent);
  }
}

function printTree(tree, level) {
  if (typeof level === 'undefined')
    var level = tree.order;

  var prefix = '';
  for (var i = -1; i < level; i++) {
    prefix+= '-';
  }

  tree.children.forEach(function(h) {
    console.log(prefix+' '+h.id);
    if (h.children.length > 0) {
      printTree(h, level+1);
    }
  });
}
