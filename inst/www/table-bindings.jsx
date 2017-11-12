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
		const {columns, error, callback, selected} = this.state

		if (error) return <pre className="error">{error}</pre>

		const cols = Object.values(columns)
		const ncol = cols.length
		const nrow = (cols[0] || []).length  // raggedness checked in shouldComponentUpdate
		return (
			<table className="react-table">
				<thead>
					<tr>{Object.keys(columns).map(header =>
						<th key={header}>{header}</th>
					)}</tr>
				</thead>
				<tbody>{Array(nrow).fill(null).map((_, r) =>
					<tr key={r}
						className={selected.includes(r) ? 'selected' : null}
						onClick={() => this.select_toggle(r)}
					>{Array(ncol).fill(null).map((_, c) =>
						<td key={c}>{cols[c][r]}</td>
					)}</tr>
				)}</tbody>
			</table>
		)
	}
	
	select_toggle(row) {
		const {selected, callback} = this.state
		const row_selected = selected.includes(row)
		const selected_new = row_selected
			? selected.filter(r => r !== row)
			: [...selected, row]
		this.setState({selected: selected_new}, () => callback(selected_new))
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
		el.component = ReactDOM.render(<Table/>, el)
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
