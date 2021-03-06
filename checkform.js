var $rule = {}
$rule.number = {'regexp': /\d*/, 'name': 'число'}
$rule.date = {'regexp': /(0[1-9]|[12][0-9]|3[01])[- /.](0[1-9]|1[012])[- /.](19|20)\d\d/, 'name': 'дата'}
$rule.float = {'regexp': /\-?\d+(\.\d{0,})?/, 'name': 'дробное число'}
$rule.name = {'regexp': /^[а-яА-ЯёЁa-zA-Z\s]+$/i, 'name': 'имя'}
$rule.email = {'regexp': /^([a-z0-9_\.-]+)@([a-z0-9_\.-]+)\.([a-z\.]{2,6})$/i, 'name': 'Почту'}
$rule.phone = {'regexp': /[0-9()\+\-\_\=]+/i, 'name': 'телефон'}
var $style = {
	'width': 'fit - content',
	'z-index': 9999,
	'background': '#b5b5b5',
	'color': '#20272F',
	'padding': '2px 8px',
	'position': 'absolute',
	'border-radius': '10px'
}

function checkform() {
	$('form button[data-submit],form input[type=button][data-submit],input[type=submit],input[form],button[form]').on('click',
		function(t) {
			var attention = new Attention
			var test = []
			var selector
			if($(this).attr('form')) {
				selector = $('form[name=' + $(this).attr('form') + ']')
			} else if($(this)[0].form) {
				selector = $(this)[0].form
			} else {
				console.warn('где форма?')
				return true
			}
			$(selector).find('input,textarea').each(function(index, element) {
				var x = $(element).val()
				type = $(element).attr('data-type') ? $(element).attr('data-type') : $(element).attr('type')
				pattern = $(element).attr('data-pattern') ? $(element).attr('data-pattern') : $(element).attr('pattern')
				if(x !== false && x != '' && x != 'undefind') {
					if((type && $rule[type]) || pattern) {
						var str = $(element).val()
						var er = false
						if(type) {
							var sr = $rule[type].regexp.exec(str)
							if(sr !== null) {
								er = true
							} else {
								test.push(1)
							}
							if(!$rule[type].name) {
								$rule[type].name = type
							}
						} else {
							pattern = new RegExp(pattern, 'i')
							var sr = pattern.exec(str)
							if(sr !== null) {
								er = true
							} else {
								test.push(1)
							}
						}
						if(!er) {
							var name = $rule[type].name ? $rule[type].name : 'то что нужно'
							attention.add(element, '🛑 это не похоже на ' + name)
						}
					}
				}
				if($(element).attr('required')) {
					switch(type) {
						case 'checkbox':
							if(!$(element).prop('checked')) {
								attention.add(element, '🛑 вы должны отметить это')
								test.push(1)
							}
							break
						default:
							if(x === false || x == '' || x == 'undefind') {
								// console.log('X')
								attention.add(element, '🛑 Поле не заполнено')
								test.push(1)
							}
							break
					}
				}
				if($(element).attr('data-equal')) {
					var s = $(element).attr('data-equal')
					if($(s).val() != $(element).val()) {
						test.push(1)
						attention.add(element, '🛑 эти поля должны быть однаковыми')
						attention.add(s, '🛑 эти поля должны быть однаковыми')
					}
				}
				if($(element).attr('data-min-len')) {
					var c = parseInt($(element).attr('data-min-len'))
					if($(element).val().length < c) {
						test.push(1)
						attention.add(element, `🛑 слишком мало должно быть > ${c}`)
					}
				}
				if($(element).attr('data-max-len')) {
					var c = parseInt($(element).attr('data-max-len'))
					if($(element).val().length > c) {
						test.push(1)
						attention.add(element, `🛑 слишком много должно быть < ${c}`)
					}
				}
			})
			if($(selector).attr('data-required')) {
				var Vlist = false
				var reqlist = $(selector).attr('data-required').split(',')
				reqlist.forEach(elemselec => {
					var x = $(elemselec).val()
					if(x !== false && x != '' && x != 'undefind') {
						Vlist = true
					}
				})
				if(!Vlist) {
					reqlist.forEach(elemselec => {
						var x = $(elemselec).val()
						var type = $(elemselec).attr('data-type') ? $(elemselec).attr('data-type') : $(elemselec).attr('type')
						switch(type) {
							case 'checkbox':
								if(!$(elemselec).prop('checked')) {
									attention.add(elemselec, '🛑 Что-то из этого должно быть отмеченно')
									test.push(1)
								}
								break
							default:
								if(x === false || x == '' || x == 'undefind') {
									// console.log('X')
									attention.add(elemselec, '🛑 Что-то из этого должно быть заполнено')
									test.push(1)
								}
								break
						}
					})

				}
			}
			attention.run()
			if(test.indexOf(1) == -1) {
				if($(t.currentTarget).attr('data-click')) {
					eval($(t.currentTarget).attr('data-click'))
					t.preventDefault()
					return false
				} else {
					return true
				}
			} else {
				t.preventDefault()
				return false
			}
		}
	)
}

class Attention {
	constructor() {
		this.elems = []
	}


	add(element, text) {
		var isset = 0
		var i = 0
		for(const elem of this.elems) {
			if(elem[0] == element) {
				elem[1] = elem[1] + ', ' + text
				this.elems[i] = elem
				isset = 1
			}
			i++
		}
		if(!isset) {
			this.elems.push([element, text])
		}
	}


	run() {
		for(const elem of this.elems) {
			this.attention(elem[0], elem[1])
		}
	}


	attention(element, text) {
		var tooltip = $('<span>', {
			css: $style,
			html: text
		}).appendTo('body')
		$(tooltip).offset({
			top: $(element).offset().top - $(tooltip).height() - 5,
			left: $(element).offset().left
		})
		$(tooltip).fadeOut(0).fadeIn(500)
		setTimeout(() => {
			$(tooltip).fadeOut(500)
			setTimeout(() => {
				$(tooltip).remove()
			}, 500)
		}, 2500)
	}
}

jQuery(document).ready(checkform())