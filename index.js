#!/usr/bin/env node

var fs = require('fs')
  , path = require('path')
  , markdown = require('markdown')
  , ps = require('child_process')
  , build_path = path.join(__dirname, 'tmp')
  , html_tmp_filename = path.join(build_path, 'tmp.html')
  , html_header_tmp_filename = path.join(build_path, 'tmp_header.html')
  , html_cover_tmp_filename = path.join(build_path, 'tmp_cover.html')
  , html_toc_filename = path.join(build_path, 'tmp_toc.html')
  , output_filename = process.argv.pop()
  , src_path = process.argv.pop();

var file
  , out = ''
  , sources = {}
  , layout = fs.readFileSync(path.join(src_path, 'layout.html')).toString()
  , conf = JSON.parse(fs.readFileSync(path.join(src_path, "settings.json")))
  , opts = {customFds: [process.stdin, process.stdout, process.stderr]}
  , args = [html_tmp_filename, output_filename]
  , files = fs.readdirSync(src_path)
  , now = new Date
  , month = (now.getMonth()+1) <= 9 ? '0' + (now.getMonth()+1) : (now.getMonth()+1)
  , day = now.getDate() <= 9 ? '0' + now.getDate() : now.getDate();

function proceed(file) {
  if (!(file in sources)) {
    console.error('file [' + file + '] not found');
    return '';
  }
  return fs.readFileSync(path.join(src_path, sources[file]))
         .toString()
         .replace(/^@include ([^\n]+)$/mgi, function () {
    return "\n" + proceed(arguments[1]) + "\n";
  });
}

if (!fs.existsSync(build_path)) {
  fs.mkdirSync(build_path, 0755);
  console.log(build_path + ' created\n');
}

while (file = files.shift()) {
  if (!file.match(/\.(md|markdown)$/)) {
    continue;
  }
  sources[file.replace(/\.(md|markdown)$/, '')] = file;
}

out = markdown.parse(proceed(conf.index));

conf.date = day + '/' + month + '/' + now.getFullYear();
conf.cwd = 'file:///' + process.cwd().replace(/\\/g, '/').replace(/\s/g, '%20'); // '

for (var key in conf) {
  out = out.replace(new RegExp('\{\{' + key + '\}\}', 'g'), conf[key]);
  layout = layout.replace(new RegExp('\{\{' + key + '\}\}', 'g'), conf[key]);
}

fs.writeFileSync(html_tmp_filename, layout.replace(/\{\{content\}\}/, out));

if (~conf['output-args'].indexOf('--header-html')) {
    var header = fs
    .readFileSync(conf['output-args'][conf['output-args'].indexOf('--header-html')+1])
    .toString();
  for (var key in conf) {
    header = header.replace(new RegExp('\{\{' + key + '\}\}', 'g'), conf[key]);
  }
  fs.writeFileSync(html_header_tmp_filename, header);
  conf['output-args'][conf['output-args'].indexOf('--header-html')+1] = html_header_tmp_filename;
}
if (~conf['output-args'].indexOf('cover')) {
    var header = fs
    .readFileSync(conf['output-args'][conf['output-args'].indexOf('cover')+1])
    .toString();
  for (var key in conf) {
    header = header.replace(new RegExp('\{\{' + key + '\}\}', 'g'), conf[key]);
  }
  fs.writeFileSync(html_cover_tmp_filename, header);
  conf['output-args'][conf['output-args'].indexOf('cover')+1] = html_cover_tmp_filename;
}

if ('output-args' in conf) {
  var arg;
  while (arg = conf['output-args'].pop()) {
    args.unshift(arg);
  }
}

ps.spawn('wkhtmltopdf', args, opts);

