
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
        data.headings.push({
          id: $(this).attr('id'),
          text: $(this).text(),
          // Refs:
          //    https://github.com/cheeriojs/cheerio/issues/187
          level: $(this)[0].name
        });
      });
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
