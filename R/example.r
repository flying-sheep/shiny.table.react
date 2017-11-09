#' @importFrom shiny runApp fluidPage verbatimTextOutput renderPrint
#' @export
run_table_example <- function(...) {
	ui <- fluidPage(
		table_react(
			'mychooser', 'Available frobs', 'Selected frobs',
			row.names(USArrests), c(), size = 10, multiple = TRUE
		),
		verbatimTextOutput('selection')
	)

	server <- function(input, output, session) {
		output$selection <- renderPrint(
			input$mychooser
		)
	}

	runApp(list(ui = ui, server = server), ...)
}
