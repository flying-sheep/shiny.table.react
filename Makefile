jsx_files := $(wildcard inst/www/*.jsx)
js_files  := $(patsubst %.jsx,%.js,$(jsx_files))

all: $(js_files)

%.js: %.jsx
	node exec/jsx-transform.js $< $@

watch:
	ls $(jsx_files) inst/www/*.css R/*.r | entr -r make serve

serve: inst/www/table-bindings.js
	R --slave -e 'devtools::install(); library(shiny.table.react); run_table_example(port = 3390)'
