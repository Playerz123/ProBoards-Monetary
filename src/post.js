monetary.post = class {

	static init(){
		if((yootil.location.posting() || yootil.location.thread())){
			this._initialised = true;
			this._submitted = false;
			this._hook = "";
			
			$(this.ready.bind(this));
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
		evt_data.amounts = monetary.settings.earning_amounts();
		evt_data.add = 0;
		evt_data.remove = 0;
		evt_data.category_can_earn = monetary.permissions.can_earn_in_category();
		evt_data.board_can_earn = monetary.permissions.can_earn_in_board();

		$(monetary.api.events).trigger("monetary.before_post_money", evt_data);

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
					yootil.key.set_on(monetary.enums.PLUGIN_KEY, monetary.api.get(evt_data.user_id).data(), evt_data.user_id, this._hook);

					evt_data_2.money_after = monetary.api.get(evt_data.user_id).money();

					$(monetary.api.events).trigger("monetary.after_post_money", evt_data_2);
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

};