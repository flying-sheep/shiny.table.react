#' @importFrom htmltools singleton tagList tags HTML div attachDependencies htmlDependency
#' @importFrom shiny icon registerInputHandler
#' @export
table_react <- function(id) {
	register_handler()

	attachDependencies(div(id = id, class = 'react-table-container'), deps())
}

#' @importFrom purrr compact
#' @export
table_react_select <- function(session, id, select_group = NULL) {
	session$sendInputMessage(id, compact(list(
		value = select_group)))
}

#' @importFrom shiny validate need
table_react_update <- function(session, id, data = NULL, select_group = NULL, page = NULL, page_size = NULL) {
	if (!can_convert_to_df(data)) {
		table_send_error(session, id, paste('Error: Ragged array:\n', paste0(capture.output(str(data)), collapse = '\n')))
		return()
	}
	
	session$sendCustomMessage(type = 'update-table-react', compact(list(
		id = id,
		columns = data %&&% as.data.frame(data),
		select_group = select_group,
		page = page %&&% page - 1L,
		page_size = page_size)))
}

table_send_error <- function(session, id, msg) {
	session$sendCustomMessage(
		type = 'update-table-react',
		list(id = id, error = msg))
}

can_convert_to_df <- function(thing) {
	if (!is.list(thing)) return(TRUE)  # TODO
	first_length <- length(thing[[1L]])
	all(sapply(thing, function(t) length(t) == first_length))
}

page_to_js <- function(page) {
	if (is.null(page)) return(NULL)
	page - 1L
}

register_handler <- function() {
	registerInputHandler('shiny.table.react', function(data, ...) {
		vapply(data, function(s) if (is.null(s)) NA_integer_ else s, integer(1L)) + 1L
	}, force = TRUE)
}

deps <- function(dev = TRUE) list(
	htmlDependency(
		'react', '16.0.0', file.path(lazy$wwwdir, 'react-16.0.0'),
		script = sprintf('react%s.%s.js', c('', '-dom'), if (dev) 'development' else 'production.min')),
	htmlDependency(
		'shiny.table.react', '1.0', lazy$wwwdir,
		script = 'table-bindings.js', stylesheet = 'table-style.css')
)
