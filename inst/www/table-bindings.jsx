(function() {

const dev = true

const get_empty_state = () => ({
	selected:  [],
	columns:   {},
	page:      0,
	page_size: 10,
	callback:  null,
	error:     null,
})

const Paginator = ({onSelectPage, onSelectSize, n_pages, page}) => [
	...Array(n_pages).fill(null).map((_, p) =>
		<button key={p}
			disabled={p === page}
			onClick={() => onSelectPage(p)}
		>{p + 1}</button>
	),
	<select key="select"
		onChange={e => onSelectSize(+e.target.value)}
		style={{display: n_pages === 0 ? 'none' : null}}
	>
	{[10, 100, 500].map(size =>
		<option key={size} value={size}>{size}</option>
	)}
	</select>,
]

const Table = ({onSelectRow, columns, page, page_size, selected}) => {
	const cols = Object.values(columns)
	const {ncol, nrow} = dims(columns)
	if (nrow === 0 || ncol === 0)
		return <div className="react-table">Empty table: {nrow}&times;{ncol}</div>

	const this_page_size = Math.min(page_size, nrow - page * page_size)
	return (
		<table className="react-table">
			<thead>
				<tr>
				{Object.keys(columns).map(header =>
					<th key={header}>{header}</th>
				)}
				</tr>
			</thead>
			<tbody>
			{Array(this_page_size).fill(null).map((_, r) => {
				const row = page * page_size + r
				return (
					<tr key={r}
						className={selected.includes(row) ? 'selected' : null}
						onClick={() => onSelectRow(row)}
					>{Array(ncol).fill(null).map((_, c) =>
						<td key={c}>{cols[c][row]}</td>
					)}</tr>
				)
			})}
			</tbody>
		</table>
	)
}

function dims(columns) {
	const cols = Object.values(columns || {})
	const ncol = cols.length
	const nrow = (cols[0] || []).length  // raggedness checked in R
	return {ncol, nrow}
}

class TableReact extends React.Component {
	constructor() {
		super()
		this.state = get_empty_state()
	}
	
	componentDidCatch(error, info) {
		this.setState({error: `${error.toString()}\n${info.componentStack}`})
	}
	
	render() {
		const {columns, page, page_size, error, callback, selected} = this.state
		if (error) return <pre className="error">{error}</pre>
		
		const {nrow} = dims(columns)
		const n_pages = Math.ceil(nrow / page_size)
		
		return [
			<Table key="table"
				onSelectRow={row => this.select_toggle(row)}
				columns={columns}
				page={page}
				page_size={page_size}
				selected={selected}
			/>,
			<Paginator key="pages"
				onSelectPage={page => this.setState({page})}
				onSelectSize={size => this.setState({page_size: size})}
				n_pages={n_pages}
				page={page}
			/>,
		]
	}
	
	setState(new_state, callback) {
		if (new_state.page !== undefined || new_state.page_size !== undefined || new_state.columns !== undefined) {
			new_state.page = this.get_valid_page(new_state.page, new_state.page_size, new_state.columns)
		}
		if (new_state.selected !== undefined || new_state.columns !== undefined) {
			new_state.selected = this.get_valid_selected(new_state.selected, new_state.columns)
		}
		super.setState(new_state, callback)
	}
	
	get_valid_page(page = this.state.page, page_size = this.state.page_size, columns = this.state.columns) {
		const {nrow} = dims(columns)
		const n_pages = Math.ceil(nrow / page_size)
		return (page * page_size >= nrow) ? n_pages - 1 : page
	}
	
	get_valid_selected(selected = this.state.selected, columns = this.state.columns) {
		const {nrow} = dims(columns)
		return selected.filter(s => s < nrow)
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
		el.component = ReactDOM.render(<TableReact/>, el)
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
		el.component.setState({selected: value})
	},
	getType() {
		return 'shiny.table.react'
	},
})

Shiny.inputBindings.register(binding, 'shiny.table.react')

})()
