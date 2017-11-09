#' @importFrom shiny runApp fluidPage verbatimTextOutput renderPrint
#' @export
run_table_example <- function(...) {
	ui <- fluidPage(
		table_react('mytable'),
		verbatimTextOutput('selection'),
		table_react('broken-table')
	)

	server <- function(input, output, session) {
		table_react_update(session, 'mytable', USArrests)
		table_react_update(session, 'broken-table', list(a = 1:3, b = 1:5, c = 2:4))
		output$selection <- renderPrint(input$mychooser)
	}

	runApp(list(ui = ui, server = server), ...)
}
