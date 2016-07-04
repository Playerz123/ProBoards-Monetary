monetary.post = class {

	static init(){
		this.settings = Object.create(null);

		this.settings.group_amounts = new Map();
		this.settings.board_amounts = new Map();
		this.settings.category_amounts = new Map();

		this.setup();
		
		if((yootil.location.posting() || yootil.location.thread())){
			this._initialised = true;
			this._submitted = false;
			this._hook = "";
			
			$(this.ready.bind(this));
		}
	}

	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;
			
			// Earning amounts

			this.settings.default_amounts = Object.create(null);

			this.settings.default_amounts.new_post = parseFloat(settings.new_post) || 0;
			this.settings.default_amounts.new_thread = parseFloat(settings.new_thread) || 0;
			this.settings.default_amounts.new_poll = parseFloat(settings.new_poll) || 0;

			// Group earning amounts

			for(let grp_af of settings.group_amounts){
				let grp_amounts = Object.create(null);

				grp_amounts.new_post = parseFloat(grp_af.new_post) || 0;
				grp_amounts.new_thread = parseFloat(grp_af.new_thread) || 0;
				grp_amounts.new_poll = parseFloat(grp_af.new_poll) || 0;

				for(let grp of grp_af.groups){
					this.settings.group_amounts.set(parseInt(grp, 10), grp_amounts);
				}
			}

			// Board earning amounts

			for(let brd_af of settings.board_amounts){
				let brd_amounts = Object.create(null);

				brd_amounts.new_post = parseFloat(brd_af.new_post) || 0;
				brd_amounts.new_thread = parseFloat(brd_af.new_thread) || 0;
				brd_amounts.new_poll = parseFloat(brd_af.new_poll) || 0;

				for(let brd of brd_af.boards){
					this.settings.board_amounts.set(parseInt(brd, 10), brd_amounts);
				}
			}

			// Category earning amounts

			for(let cat_af of settings.category_amounts){
				let cat_amounts = Object.create(null);

				cat_amounts.new_post = parseFloat(cat_af.new_post) || 0;
				cat_amounts.new_thread = parseFloat(cat_af.new_thread) || 0;
				cat_amounts.new_poll = parseFloat(cat_af.new_poll) || 0;

				for(let cat of cat_af.categories){
					this.settings.category_amounts.set(parseInt(cat, 10), cat_amounts);
				}
			}
		}	
	}
	
	static ready(){
		this._new_thread = (yootil.location.posting_thread())? true : false;
		this._new_post = (!this._new_thread)? true : false;
		this._editing = (yootil.location.editing())? true : false;
		this._poll = false;
		this._hook = (this._new_thread)? "thread_new" : ((yootil.location.thread())? "post_quick_reply" : "post_new");
		this._money_added = 0;

		let $the_form = yootil.form.posting();

		if($the_form.length){
			$the_form.on("submit", () => {
				let poll_input = $the_form.find("input[name=has_poll]");

				this._poll = (poll_input.length && poll_input.val() == 1)? true : false;
				this._submitted = true;
				this.set_on();
			});
		} else {
			console.warn("Monetary Post: Could not find form.");
		}
	}
	
	static set_on(){
		let evt_data = Object.create(null);

		evt_data.user_id = yootil.user.id();
		evt_data.amounts = this.earning_amounts();
		evt_data.add = 0;
		evt_data.remove = 0;
		evt_data.category_can_earn = monetary.permissions.can_earn_in_category();
		evt_data.board_can_earn = monetary.permissions.can_earn_in_board();

		$(monetary.api.events).trigger("monetary.post.before", evt_data);

		let money_to_add = 0;

		if(!this._editing){
			if(evt_data.category_can_earn && evt_data.board_can_earn){
				if(this._new_thread){
					money_to_add += parseFloat(evt_data.amounts.new_thread);

					if(this._poll){
						money_to_add += parseFloat(evt_data.amounts.new_poll);
					}
				} else if(this._new_post){
					money_to_add += parseFloat(evt_data.amounts.new_post);
				}
			}

			if(evt_data.add){
				money_to_add += parseFloat(evt_data.add);
			}

			if(evt_data.remove){
				money_to_add -= parseFloat(evt_data.remove);
			}

			if(money_to_add){
				if(this._submitted){
					let evt_data_2 = Object.create(null);

					evt_data_2.user_id = evt_data.user_id;
					evt_data_2.money_added = evt_data.money_to_add;
					evt_data_2.money_before = monetary.api.get(evt_data.user_id).money();

					if(this._money_added){
						monetary.api.decrease(evt_data.user_id).money(this._money_added);
						evt_data_2.money_added -= this._money_added;
					}

					// Update the new value of money being added in case we need to remove it again.

					this._money_added = money_to_add;

					monetary.api.increase(evt_data.user_id).money(money_to_add);
					yootil.key(monetary.enums.PLUGIN_KEY).on(this._hook, monetary.api.get(evt_data.user_id).data(), evt_data.user_id);

					evt_data_2.money_after = monetary.api.get(evt_data.user_id).money();

					$(monetary.api.events).trigger("monetary.post.after", evt_data_2);
				}
			}
		}
	}

	static get initialised(){
		return this._initialised;
	}

	static get is_new_thread(){
		return this._new_thread;
	}

	static get is_new_post(){
		return this._new_post;
	}

	static get is_editing(){
		return this._editing;
	}

	static get has_poll(){
		return this._poll;
	}

	static get group_amounts(){
		return this.settings.group_amounts;
	}

	static get board_amounts(){
		return this.settings.board_amounts;
	}

	static get category_amounts(){
		return this.settings.category_amounts;
	}

	static earning_amounts(){
		let group_ids = yootil.user.group_ids();
		let board_id = yootil.page.board.id();
		let category_id = yootil.page.category.id();

		if(group_ids.length && this.settings.group_amounts.size){
			for(let grp_id of group_ids){
				if(this.settings.group_amounts.has(parseInt(grp_id, 10))){
					return this.settings.group_amounts.get(parseInt(grp_id, 10));
				}
			}
		}

		if(board_id && this.settings.board_amounts.size){
			if(this.settings.board_amounts.has(parseInt(board_id, 10))){
				return this.settings.board_amounts.get(parseInt(board_id, 10));
			}
		}

		if(category_id && this.settings.category_amounts.size){
			if(this.settings.category_amounts.has(parseInt(category_id, 10))){
				return this.settings.category_amounts.get(parseInt(category_id, 10));
			}
		}

		return this.settings.default_amounts;
	}

};