monetary.utils = class {

	static full_money_string(money = 0, tpl = "{CURRENCY_NAME}{CURRENCY_SEPARATOR}{CURRENCY_SEPARATOR_SPACE}{CURRENCY_SYMBOL}{MONEY}"){
		tpl = tpl.replace("{CURRENCY_NAME}", monetary.settings.currency_name);
		tpl = tpl.replace("{CURRENCY_SEPARATOR}", monetary.settings.currency_separator);
		tpl = tpl.replace("{CURRENCY_SEPARATOR_SPACE}", ((monetary.settings.currency_separator_space)? " " : ""));
		
		let currency_symbol = (monetary.settings.currency_symbol_image)? "<img src='" + monetary.settings.currency_symbol_image + "' />" : monetary.settings.currency_symbol;

		tpl = tpl.replace("{CURRENCY_SYMBOL}", currency_symbol);
		tpl = tpl.replace("{MONEY}", this.money_string(money));

		return tpl;
	}

	static money_string(money = 0, format = true){
		let str = money.toString();

		if(format){
			str = yootil.number_format(money, monetary.settings.currency_delimiter);
		}

		return str;
	}

};