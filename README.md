m2pdb - Markdown To Pdf Documentation Builder
====

This project provide a simple way to create a pdf from your projects documentation wrote with markdown syntax. It's
combining the strictness of markdown syntax, the flexibility of html/css and the portability of a pdf presentation. Your
markdown documentation is convert to html and magically transform to pdf by `wkhtmltopdf` package.

Installation
----

    > npm install m2pdb

Requirements
----

- [wkhtmltopdf](http://code.google.com/p/wkhtmltopdf/)
- markdown : `npm install markdown`

Usage
----

    > m2pdb src_path output.pdf

In `src_path` the script must find some files :

- `settings.json`: file containing your settings (describe below)
- `layout.html`: main layout use for all your document. Content will replace the `{{content}}` variable.
- + all of your markdown files (with this extensions : .md or .markdown).

You can try with the embed example of Node.JS documentaton by running this line :

    > node index.js node_doc/ node.pdf

Note that all links are wrong : original documentation was written for a different context. But take look at the
markdown documentation, you should find how to make your own anchors.

Example of settings.json
----

    {"title": "Title of my project",
     "version": "v0.0.1",
     "index": "all",
     "output-args": ["--default-header", "toc"]}

Every `{{keys}}` in this object will be replace by its associated value during markdown to html conversion. There's two
specials keys :

- `index`: used as main file (in your src path) witch includes all your markdown files (use `@include filename` to include it).
- `output-args` : used as parameters for `wkhtmltopdf` (more infos : [wkhtmltopdf 0.10.0_rc2 doc](http://madalgo.au.dk/~jakobt/wkhtmltoxdoc/wkhtmltopdf_0.10.0_rc2-doc.html))
