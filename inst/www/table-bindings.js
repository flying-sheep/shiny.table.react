(function() {

const dev = true

const get_empty_state = () => ({
	selected: [],
	columns:  {},
	callback: null,
	error:    null,
})

class Table extends React.Component {
	constructor() {
		super()
		this.state = get_empty_state()
	}

	componentDidCatch(error, info) {
		this.setState({error: `${error.toString()}\n${info.componentStack}`})
	}
	
	shouldComponentUpdate(nextProps, nextState) {
		const {columns, error} = nextState

		if (dev && !error) {
			const lengths = Object.entries(columns)
				.map(([header, column]) => ({header, l: column.length}))
				.reduce((lengths, {header, l}) => {
					lengths[l] = l in lengths ? [...lengths[l], header] : [header]
					return lengths
				}, {})
			if (Object.keys(lengths).length > 1) {
				const err = new Error(`Ragged data passed! Encountered column lengths:\n${
					Object.entries(lengths).map(([l, headers]) => `${l}: ${headers.join(', ')}`).join('\n')
				}`)
				this.setState({error: `${err.toString()}\n${err.stack}`})
			}
		}

		return true
	}

	render() {
		const {columns, error} = this.state

		if (error) return React.createElement('pre', {className: 'error'}, error)

		const cols = Object.values(columns)
		const ncol = cols.length
		const nrow = (cols[0] || []).length  // raggedness checked in shouldComponentUpdate
		return React.createElement('table', { className: 'react-table' },
			React.createElement('thead', null,
				React.createElement('tr', null, Object.keys(columns).map(
					header => React.createElement('th', {key: header}, header)
				)),
			),
			React.createElement('tbody', null, Array(nrow).fill(null).map(
				(_, r) => React.createElement('tr', null, Array(ncol).fill(null).map(
					(_, c) => React.createElement('td', null, cols[c][r]),
				)),
			)),
		)
	}
}

Shiny.addCustomMessageHandler('update-table-react', ({id, ...state}) => {
	document.getElementById(id).component.setState(state)
})

const binding = Object.assign(new Shiny.InputBinding, {
	find(scope) {
		return document.querySelectorAll('.react-table-container')
	},

	initialize(el) {
		el.component = ReactDOM.render(React.createElement(Table), el)
	},

	subscribe(el, callback) {
		el.component.setState({callback})
	},

	unsubscribe(el) {
		el.component.setState({callback: null})
	},

	getValue(el) {
		return el.component.state.selected
	},

	setValue(el, value) {
		el.component.setState({ selected: value })
	},

	getType() { return 'shiny.table.react' },
})

Shiny.inputBindings.register(binding, 'shiny.table.react')

})()
