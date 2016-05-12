monetary.settings = class {

	static init(){
		this._amounts = {

			thread: 50,
			poll: 10,
			post: 25,
			birthday: 200,
			new_user: 200

		};
	}

	static setup(){
		this.init();

		let plugin = pb.plugin.get(monetary.PLUGIN_ID);

		if(plugin){
			monetary.PLUGIN = plugin;

			if(plugin.settings){
				let settings = plugin.settings;

				this._currency_name = settings.currency_name;
				this._currency_symbol = settings.currency_symbol;
				this._currency_symbol_image = settings.currency_symbol_image;
				this._currency_separator = settings.currency_separator;
				this._object_currency = !! settings.object_based_currency;
				this._currency_separator_space = !! settings.currency_separator_space;
				this._currency_delimiter = settings.currency_delimiter;
			}

			if(plugin.images){
				this._images = images;
			}
		}
	}

	static get images(){
		return this._images;
	}

	static get amounts(){
		return this._amounts;
	}

	static get thread_amount(){
		return this._amounts.thread;
	}

	static get poll_amount(){
		return this._amounts.poll;
	}

	static get post_amount(){
		return this._amounts.post;
	}

	static get currency_name(){
		return this._currency_name;
	}

	static get currency_symbol(){
		return this._currency_symbol;
	}

	static get currency_separator(){
		return this._currency_separator;
	}

	static get object_currency(){
		return this._object_currency;
	}

	static get currency_separator_space(){
		return this._currency_separator_space;
	}

	static get currency_symbol_image(){
		return this._currency_symbol_image;
	}

	static get currency_delimiter(){
		return this._currency_delimiter;
	}

};