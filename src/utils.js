monetary.utils = class {

	static full_money_str(money = 0, tpl = "{CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}"){
		let pattern = /(\{CURRENCY_NAME(\.(LOW|HIGH)ER)?\})/g;

		if(tpl.match(pattern)){
			tpl = tpl.replace(pattern, (... args) => {
				let str = monetary.settings.currency_name;

				if(args[3]){
					str = str["to" + ((args[3] == "LOW")? "Lower" : "Upper") + "Case"]();
				}

				return str;
			});
		}

		tpl = tpl.replace("{CURRENCY_SEPARATOR}", monetary.settings.currency_separator);
		tpl = tpl.replace("{CURRENCY_SEPARATOR_SPACE}", ((monetary.settings.currency_separator_space)? " " : ""));
		
		let currency_symbol = (monetary.settings.currency_symbol_image)? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

		tpl = tpl.replace("{CURRENCY_SYMBOL}", currency_symbol);
		tpl = tpl.replace("{MONEY}", this.money_str(money, true, false));

		return tpl;
	}

	static money_str(money = 0, format = true, include_symbol = true){
		let money_amount = this.money_format(money);
		let str = money_amount.toString();

		if(format){
			str = yootil.number_format(money_amount, monetary.settings.currency_delimiter);
		}

		if(include_symbol){
			let currency_symbol = (monetary.settings.currency_symbol_image)? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

			str = currency_symbol + yootil.html_encode(str);
		}

		return str;
	}

	static money_format(money = 0, force_decimal = false){
		let money_num = parseFloat(money).toFixed(2);

		if(monetary.settings.object_currency && !force_decimal){
			money_num = Math.trunc(money_num);
		}

		return money_num;
	}

};