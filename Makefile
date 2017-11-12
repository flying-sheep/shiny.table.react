all: inst/www/*.js

%.js: %.jsx
	node exec/jsx-transform.js $< $@

watch:
	ls inst/www/*.jsx inst/www/*.css | entr -r make serve

serve: inst/www/table-bindings.js
	R --slave -e 'devtools::install(); library(shiny.table.react); run_table_example(port = 3390)'
