#' @importFrom htmltools singleton tagList tags HTML div attachDependencies htmlDependency
#' @importFrom shiny icon registerInputHandler
#' @export
table_react <- function(inputId, leftLabel, rightLabel, leftChoices, rightChoices, size = 5, multiple = FALSE) {
	register_handler()

  multiple <- if (multiple) 'multiple' else NULL

  table <- tagList(
    div(id = inputId, class = 'chooser',
      div(class = 'chooser-container chooser-left-container',
        tags$select(class = 'left', size = size, multiple = multiple, lapply(leftChoices,  tags$option))
      ),
      div(class = 'chooser-container chooser-center-container',
        icon('arrow-circle-o-right', 'right-arrow fa-3x'),
        tags$br(),
        icon('arrow-circle-o-left', 'left-arrow fa-3x')
      ),
      div(class = 'chooser-container chooser-right-container',
        tags$select(class = 'right', size = size, multiple = multiple, lapply(rightChoices, tags$option))
      )
    )
  )

  attachDependencies(table, deps())
}

register_handler <- function() {
	registerInputHandler('shiny.table.react', function(data, ...) {
		if (is.null(data))
			NULL
		else
			list(left = as.character(data$left), right = as.character(data$right))
	}, force = TRUE)
}

deps <- function(dev = TRUE) list(
	htmlDependency(
		'shiny.table.react', '1.0', lazy$wwwdir,
		script = 'table-bindings.js', stylesheet = 'table-style.css'),
	htmlDependency(
		'react', '16.0.0', file.path(lazy$wwwdir, 'react-16.0.0'),
		script = sprintf('react%s.%s.js', c('', '-dom'), if (dev) 'development' else 'production.min'))
)
