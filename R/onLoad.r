lazy <- new.env()

.onLoad <- function(...) {
	lazy$wwwdir <- system.file('www', package = 'shiny.table.react')
}
