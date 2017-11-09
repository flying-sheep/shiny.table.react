(() => {

function updateChooser(chooser) {
	chooser = $(chooser);
	const left = chooser.find('select.left');
	const right = chooser.find('select.right');
	const leftArrow = chooser.find('.left-arrow');
	const rightArrow = chooser.find('.right-arrow');

	const canMoveTo = (left.val() || []).length > 0;
	const canMoveFrom = (right.val() || []).length > 0;

	leftArrow.toggleClass('muted', !canMoveFrom);
	rightArrow.toggleClass('muted', !canMoveTo);
}

function move(chooser, source, dest_sel) {
	chooser = $(chooser)
	const selected = chooser.find(source).children('option:selected')
	const dest = chooser.find(dest_sel)
	dest.children('option:selected').each((i, e) => e.selected = false)
	dest.append(selected)
	updateChooser(chooser)
	chooser.trigger('change')
}

const binding = new Shiny.InputBinding
$.extend(binding, {
	find(scope) { return $(scope).find('.chooser') },

	initialize(el) { updateChooser(el) },

	getValue(el) {
	  return {
	    left:  $.makeArray($(el).find('select.left option') .map((i, e) => e.value)),
	    right: $.makeArray($(el).find('select.right option').map((i, e) => e.value)),
	  }
	},

	setValue(el, value) {
	  // TODO: implement
	},

	subscribe(el, callback) {
		$(el).on('change.chooserBinding', e => callback())

		$(el).find('select').on('change', () => {
		  updateChooser($(el))
		})

		$(el).find('.right-arrow').on('click', () => {
		  move($(el), '.left', '.right')
		})

		$(el).find('.left-arrow').on('click', () => {
		  move($(el), '.right', '.left')
		})

		$(el).find('select.left').on('dblclick', () => {
		  move($(el), '.left', '.right')
		})

		$(el).find('select.right').on('dblclick', () => {
		  move($(el), '.right', '.left')
		})
	},

	unsubscribe(el) {
	  $(el).off('.chooserBinding')
	},

	getType() { return 'shiny.table.react' },
})

Shiny.inputBindings.register(binding, 'shiny.table.react')

})()
