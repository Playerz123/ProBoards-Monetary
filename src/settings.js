monetary.settings = class {

	static init(){
		this._amounts = Object.assign(Object.create(null), {

			new_thread: 50,
			new_poll: 10,
			new_post: 25

		});

		this._group_amounts = new Map();
		this._board_amounts = new Map();
		this._category_amounts = new Map();
	}

	static setup(){
		this.init();

		let plugin = pb.plugin.get(monetary.enums.PLUGIN_ID);

		if(plugin){
			monetary.PLUGIN = plugin;

			if(plugin.settings){
				let settings = plugin.settings;

				monetary.SETTINGS = settings;

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

				this._amounts.new_post = parseFloat(settings.new_post) || 0;
				this._amounts.new_thread = parseFloat(settings.new_thread) || 0;
				this._amounts.new_poll = parseFloat(settings.new_poll) || 0;

				// Group earning amounts

				for(let grp_af of settings.group_amounts){
					let grp_amounts = Object.create(null);

					grp_amounts.new_post = parseFloat(grp_af.new_post) || 0;
					grp_amounts.new_thread = parseFloat(grp_af.new_thread) || 0;
					grp_amounts.new_poll = parseFloat(grp_af.new_poll) || 0;

					for(let grp of grp_af.groups){
						this._group_amounts.set(parseInt(grp, 10), grp_amounts);
					}
				}

				// Board earning amounts

				for(let brd_af of settings.board_amounts){
					let brd_amounts = Object.create(null);

					brd_amounts.new_post = parseFloat(brd_af.new_post) || 0;
					brd_amounts.new_thread = parseFloat(brd_af.new_thread) || 0;
					brd_amounts.new_poll = parseFloat(brd_af.new_poll) || 0;

					for(let brd of brd_af.boards){
						this._board_amounts.set(parseInt(brd, 10), brd_amounts);
					}
				}

				// Category earning amounts

				for(let cat_af of settings.category_amounts){
					let cat_amounts = Object.create(null);

					cat_amounts.new_post = parseFloat(cat_af.new_post) || 0;
					cat_amounts.new_thread = parseFloat(cat_af.new_thread) || 0;
					cat_amounts.new_poll = parseFloat(cat_af.new_poll) || 0;

					for(let cat of cat_af.categories){
						this._category_amounts.set(parseInt(cat, 10), cat_amounts);
					}
				}
			}

			if(plugin.images){
				this._images = plugin.images;
			}
		}

		//Object.freeze(this._amounts);
	}

	static get images(){
		return this._images;
	}

	static get default_amounts(){
		return this._amounts;
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

	static get group_amounts(){
		return this._group_amounts;
	}

	static get board_amounts(){
		return this._board_amounts;
	}

	static get category_amounts(){
		return this._category_amounts;
	}

	static earning_amounts(){
		let group_ids = yootil.user.group_ids();
		let board_id = yootil.page.board.id();
		let category_id = yootil.page.category.id();

		if(group_ids.length && this._group_amounts.size){
			for(let grp_id of group_ids){
				if(this._group_amounts.has(parseInt(grp_id, 10))){
					return this._group_amounts.get(parseInt(grp_id, 10));
				}
			}
		}

		if(board_id && this._board_amounts.size){
			if(this._board_amounts.has(parseInt(board_id, 10))){
				return this._board_amounts.get(parseInt(board_id, 10));
			}
		}

		if(category_id && this._category_amounts.size){
			if(this._category_amounts.has(parseInt(category_id, 10))){
				return this._category_amounts.get(parseInt(category_id, 10));
			}
		}

		return this._amounts;	
	}

};