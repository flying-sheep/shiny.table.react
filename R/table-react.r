#' @importFrom htmltools singleton tagList tags HTML div attachDependencies htmlDependency
#' @importFrom shiny icon registerInputHandler
#' @export
table_react <- function(id) {
	register_handler()

	attachDependencies(div(id = id, class = 'react-table-container'), deps())
}

#' @importFrom purrr compact
#' @export
table_react_select <- function(session, id, selected = NULL) {
	session$sendInputMessage(id, compact(list(value = selected)))
}

table_react_update <- function(session, id, columns = NULL, selected = NULL) {
	session$sendCustomMessage(type = 'update-table-react', compact(list(
		id = id, columns = columns, selected = selected)))
}

register_handler <- function() {
	registerInputHandler('shiny.table.react', function(data, ...) as.integer(data), force = TRUE)
}

deps <- function(dev = TRUE) list(
	htmlDependency(
		'react', '16.0.0', file.path(lazy$wwwdir, 'react-16.0.0'),
		script = sprintf('react%s.%s.js', c('', '-dom'), if (dev) 'development' else 'production.min')),
	htmlDependency(
		'shiny.table.react', '1.0', lazy$wwwdir,
		script = 'table-bindings.js', stylesheet = 'table-style.css')
)
