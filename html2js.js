﻿function html2js(html) {
	return expression(html);
	function expression(html) {
		if (html[0] == undefined) return undefined;
		switch (html[0].tagName) {
			case 'LITERAL':
				return {
					type: 'Literal',
					value: eval(html.html())
				}
				break;
			case 'IDENTIFIER':
				return {
					type: 'Identifier',
					name: html.html()
				};
				break;
			case 'FUNCTION':
				return {
					type: 'FunctionExpression',
					params: [],
					body: statement(html.children())
				};
				break;
			case 'UNARY':
				var _js = js(syntax.unary)(html);
				if (_js.operator == '++' || _js.operator == '--')
					_js.type = 'UpdateExpression';
				return _js;
				break;
			case 'BINARY':
				return js(syntax.binary)(html);
				break;
		}
	}
	function statement(html) {
		if (html[0] == undefined) return undefined;
		switch (html[0].tagName) {
			case 'EXPRESSION':
				return {
					type: 'ExpressionStatement',
					expression: expression(html.children())
				};
				break;
			case 'RETURN':
				return {
					type: 'ReturnStatement',
					argument: expression(html.children())
				};
				break;
			case 'VAR':
				return {
					type: 'VariableDeclaration',
					kind: 'var',
					declarations: html.children().map(function () { return decl($(this)); })
				};
				break;
			case 'BLOCK':
				return {
					type: 'BlockStatement',
					body: html.children().map(function () { return statement($(this)); })
				};
				break;
			case 'IF':
				return js(syntax.if)(html);
			case 'WHILE':
				return js(syntax.while)(html);
				break;
			case 'FOR':
				var init = html.children('init').children();
				return {
					type: 'ForStatement',
					init: init[0] && (init[0].tagName == 'VAR' ? statement : expression)(init),
					test: expression(html.children('test').children()),
					update: expression(html.children('update').children()),
					body: statement(html.children('body').children())
				};
				break;
		}
	}
	function decl(html) {
		return {
			type: 'VariableDeclarator',
			id: { type: 'Identifier', name: html.children('name').html() },
			init: expression(html.children('value').children())
		};
	}
	function js(syntax) {
		return function (html) {
			var js = {};
			js.type = syntax.type;
			for (var name in syntax.property) {
				var type = syntax.property[name];
				js[name] = {
					expression: expression,
					statement: statement,
					string: function (x) { return x.text(); },
					bool: function (x) { return x.text() != 'false'; }
				}[type](html.children(name).contents())
			};
			return js;
		};
	}
}
