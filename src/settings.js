monetary.settings = class {

	static init(){
		this._amounts = Object.assign(Object.create(null), {

			thread: 50,
			poll: 10,
			post: 25,
			birthday: 200,
			new_user: 200

		});
	}

	static setup(){
		this.init();

		let plugin = pb.plugin.get(monetary.enums.PLUGIN_ID);

		if(plugin){
			monetary.PLUGIN = plugin;

			if(plugin.settings){
				let settings = plugin.settings;

				// Currency settings

				this._currency_name = settings.currency_name;
				this._currency_symbol = settings.currency_symbol;
				this._currency_symbol_image = settings.currency_symbol_image;
				this._currency_separator = settings.currency_separator;
				this._object_currency = !! ~~ settings.object_based_currency;
				this._currency_separator_space = !! ~~ settings.currency_separator_space;
				this._currency_delimiter = settings.currency_delimiter;

				// Profile settings

				this._profile_show_money = !! ~~ settings.profile_show_money;
				this._profile_new_content_box = !! ~~ settings.profile_new_cbox;

				// Mini profile settings

				this._mini_profile_show_money = !! ~~ settings.mini_profile_show_money;

				// Permissions

				this._members_who_can_edit = settings.members_who_can_edit;
				this._categories_can_not_earn = settings.categories_can_not_earn;
				this._boards_can_not_earn = settings.boards_can_not_earn;

				// Earning amounts

				this._amounts.post = parseFloat(settings.new_post);
				this._amounts.thread = parseFloat(settings.new_thread);
				this._amounts.poll = parseFloat(settings.new_poll);
			}

			if(plugin.images){
				this._images = plugin.images;
			}
		}

		Object.freeze(this._amounts);
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

	static get profile_show_money(){
		return this._profile_show_money;
	}

	static get profile_new_content_box(){
		return this._profile_new_content_box;
	}

	static get members_who_can_edit(){
		return this._members_who_can_edit;
	}

	static get categories_can_not_earn(){
		return this._categories_can_not_earn;
	}

	static get boards_can_not_earn(){
		return this._boards_can_not_earn;
	}

	static get mini_profile_show_money(){
		return this._mini_profile_show_money;
	}

};