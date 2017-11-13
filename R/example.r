#' @importFrom shiny runApp fluidPage selectInput verbatimTextOutput renderPrint
#' @export
run_table_example <- function(...) {
	ui <- fluidPage(
		selectInput('dataselect', 'Dataset', c('USArrests', 'iris')),
		table_react('mytable'),
		verbatimTextOutput('selection'),
		table_react('broken-table'),
		table_react('empty-table')
	)

	server <- function(input, output, session) {
		observe({
			table_react_update(session, 'mytable', get(input$dataselect))
		})
		table_react_update(session, 'broken-table', list(a = 1:3, b = 1:5, c = 2:4))
		output$selection <- renderPrint(input$mytable)
	}

	runApp(list(ui = ui, server = server), ...)
}
