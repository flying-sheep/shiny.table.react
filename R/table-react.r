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
	session$sendInputMessage(id, compact(list(
		value = selected_to_js(selected))))
}

PAGE_LENGTH = 10L

#' @importFrom shiny validate need
table_react_update <- function(session, id, data = NULL, selected = NULL, page = NULL) {
	if (!can_convert_to_df(data)) {
		session$sendCustomMessage(type = 'update-table-react', list(
			id = id, error = paste('Ragged array:\n', paste0(capture.output(str(data)), collapse = '\n'))))
		return()
	}
	
	page_idx <- if (is.null(page)) NULL else page - 1L
	
	page_start <- if (is.null(page_idx)) 0L else page_idx * PAGE_LENGTH  # before!
	rows <- seq.int(
		from = page_start + 1L,
		to = min(page_start + PAGE_LENGTH, nrow(data)))
	
	columns <-
		if (!is.null(nrow(data))) as.data.frame(data[rows, , drop = FALSE])
		else as.data.frame(data)[rows, , drop = FALSE]
	
	session$sendCustomMessage(type = 'update-table-react', compact(list(
		id = id,
		columns = columns,
		selected = selected_to_js(selected),
		page = page_idx,
		n_pages = ceiling(nrow(data) / PAGE_LENGTH))))
}

can_convert_to_df <- function(thing) {
	if (!is.list(thing)) return(TRUE)  # TODO
	first_length <- length(thing[[1L]])
	all(sapply(thing, function(t) length(t) == first_length))
}

selected_to_js <- function(selected) {
	if (is.null(selected)) return(NULL)
	if (!is.integer(selected)) stop('Can only select row indices by now')
	selected - 1L
}

page_to_js <- function(page) {
	if (is.null(page)) return(NULL)
	page - 1L
}

register_handler <- function() {
	registerInputHandler('shiny.table.react', function(data, ...) {
		as.integer(data) + 1L
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
