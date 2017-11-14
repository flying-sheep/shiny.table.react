function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

(function () {
  const dev = true;
  const N_GROUPS = [1, 2, 3, 4];
  const PAGE_SIZES = [10, 100, 500];

  const get_empty_state = () => ({
    select_group: [],
    columns: {},
    page: 0,
    page_size: 100,
    n_groups: 2,
    callback: null,
    error: null
  });

  const SimpleSelect = ({
    onSelect,
    values,
    selected_value,
    ...props
  }) => React.createElement("select", _extends({}, props, {
    onChange: e => onSelect(+e.target.value),
    value: selected_value
  }), values.map(v => React.createElement("option", {
    key: v,
    value: v
  }, v)));

  const Paginator = ({
    onSelectPage,
    onSelectSize,
    onSelectNGroups,
    n_pages,
    page,
    page_size,
    n_groups
  }) => React.createElement("div", {
    className: "paginator",
    style: {
      display: n_pages === 0 ? 'none' : null
    }
  }, React.createElement(SimpleSelect, {
    key: "n-groups",
    className: "n-groups",
    title: "Number of selection groups (colors)",
    onSelect: groups => onSelectNGroups(groups),
    values: N_GROUPS,
    selected_value: n_groups
  }), React.createElement(SimpleSelect, {
    key: "page-size",
    className: "page-size",
    title: "Table page size",
    onSelect: size => onSelectSize(size),
    values: PAGE_SIZES,
    selected_value: page_size
  }), React.createElement("div", {
    key: "pages",
    className: "pages"
  }, Array(n_pages).fill(null).map((_, p) => React.createElement("button", {
    key: p,
    disabled: p === page,
    onClick: () => onSelectPage(p)
  }, p + 1))));

  const Table = ({
    onSelectRow,
    columns,
    page,
    page_size,
    select_group,
    n_groups
  }) => {
    const cols = Object.values(columns);
    const {
      ncol,
      nrow
    } = dims(columns);
    if (nrow === 0 || ncol === 0) return React.createElement("div", {
      className: "react-table"
    }, "Empty table: ", nrow, "\xD7", ncol);
    const this_page_size = Math.min(page_size, nrow - page * page_size);
    return React.createElement("table", {
      className: "react-table"
    }, React.createElement("thead", null, React.createElement("tr", null, Object.keys(columns).map(header => React.createElement("th", {
      key: header
    }, header)))), React.createElement("tbody", null, Array(this_page_size).fill(null).map((_, r) => {
      const row = page * page_size + r;
      const group = select_group[row];
      const next_group = group === null ? 0 : group + 1 < n_groups ? group + 1 : null;
      return React.createElement("tr", {
        key: r,
        className: group === null ? null : `selected select-${group}`,
        onClick: () => onSelectRow(row, next_group)
      }, Array(ncol).fill(null).map((_, c) => React.createElement("td", {
        key: c
      }, cols[c][row])));
    })));
  };

  function dims(columns) {
    const cols = Object.values(columns || {});
    const ncol = cols.length;
    const nrow = (cols[0] || []).length; // raggedness checked in R

    return {
      ncol,
      nrow
    };
  }

  class TableReact extends React.Component {
    constructor() {
      super();
      this.state = get_empty_state();
    }

    componentDidCatch(error, info) {
      this.setState({
        error: `${error.toString()}\n${info.componentStack}`
      });
    }

    render() {
      const {
        columns,
        page,
        page_size,
        error,
        callback,
        select_group,
        n_groups
      } = this.state;
      if (error) return React.createElement("pre", {
        className: "error"
      }, error);
      const {
        nrow
      } = dims(columns);
      const n_pages = Math.ceil(nrow / page_size);

      const paginator = key => React.createElement(Paginator, {
        key: key,
        onSelectPage: page => this.setState({
          page
        }),
        onSelectSize: size => this.setState({
          page_size: size
        }),
        onSelectNGroups: n_groups => this.setState({
          n_groups
        }),
        n_pages: n_pages,
        page: page,
        page_size: page_size,
        n_groups: n_groups
      });

      return [paginator('pages-top'), React.createElement(Table, {
        key: "table",
        onSelectRow: (row, group) => this.set_select_group(row, group),
        columns: columns,
        page: page,
        page_size: page_size,
        select_group: select_group,
        n_groups: n_groups
      }), paginator('pages-bottom')];
    }

    setState(new_state, finished_cb) {
      if (new_state.page !== undefined || new_state.page_size !== undefined || new_state.columns !== undefined) {
        new_state.page = this.get_valid_page(new_state.page, new_state.page_size, new_state.columns);
      }

      let registered_cb = () => {};

      if (new_state.select_group !== undefined || new_state.columns !== undefined) {
        new_state.select_group = this.get_valid_select_group(new_state.select_group, new_state.columns);

        registered_cb = new_state.callback || this.state.callback || (() => {});
      }

      super.setState(new_state, () => {
        registered_cb(new_state.select_group);
        if (finished_cb) finished_cb();
      });
    }

    get_valid_page(page = this.state.page, page_size = this.state.page_size, columns = this.state.columns) {
      const {
        nrow
      } = dims(columns);
      const n_pages = Math.ceil(nrow / page_size);
      return page * page_size >= nrow ? n_pages - 1 : page;
    }

    get_valid_select_group(select_group = this.state.select_group, columns = this.state.columns) {
      const {
        nrow
      } = dims(columns);
      return nrow < select_group.length ? select_group.slice(nrow) : select_group.concat(new Array(nrow - select_group.length).fill(null));
    }

    set_select_group(row, group) {
      const {
        select_group,
        callback
      } = this.state;
      const select_group_new = select_group.slice();
      select_group_new[row] = group;
      this.setState({
        select_group: select_group_new
      });
    }

  }

  Shiny.addCustomMessageHandler('update-table-react', ({
    id,
    ...state
  }) => {
    document.getElementById(id).component.setState(state);
  });
  const binding = Object.assign(new Shiny.InputBinding(), {
    find(scope) {
      return document.querySelectorAll('.react-table-container');
    },

    initialize(el) {
      el.component = ReactDOM.render(React.createElement(TableReact, null), el);
    },

    subscribe(el, callback) {
      el.component.setState({
        callback
      });
    },

    unsubscribe(el) {
      el.component.setState({
        callback: null
      });
    },

    getValue(el) {
      return el.component.state.select_group;
    },

    setValue(el, value) {
      el.component.setState({
        select_group: value
      });
    },

    getType() {
      return 'shiny.table.react';
    }

  });
  Shiny.inputBindings.register(binding, 'shiny.table.react');
})();
//# sourceMappingURL=table-bindings.map.js
