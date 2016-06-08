// TODO: Add in events so plugins can modify the amounts (i.e Word Count).
// TODO: Category + Board amount overrides (i.e earn different amounts in different areas).

monetary.post = class {

	static init(){
		if(!monetary.settings.post_amount && !monetary.settings.thread_amount && !monetary.settings.poll_amount){
			return;
		}

		if((yootil.location.posting() || yootil.location.thread()) && monetary.permissions.can_earn()){
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
		let evt_obj = Object.create(null);

		evt_obj.user_id = yootil.user.id();
		evt_obj.amounts = monetary.settings.amounts;
		evt_obj.money = monetary.api.get(evt_obj.user_id).money();

		let money_to_add = 0;

		if(!this._editing){
			if(this._new_thread){
				money_to_add += parseFloat(evt_obj.amounts.thread);

				if(this._poll){
					money_to_add += parseFloat(evt_obj.amounts.poll);
				}
			} else if(this._new_post){
				money_to_add += parseFloat(evt_obj.amounts.post);
			}

			if(money_to_add){

				// Need to remove any money that may have been added to the key.  ProBoards needs to support
				// passing a handler to handle updating the key instead of set_on running straight away.

				// We do bind to the submit event above, however, if the form doesn't validate, then money gets
				// added to the data object.  The user could keep submitting, and the money will keep going up.

				// Also need to think about plugins such as Chris' word count plugin that awards money based on
				// length of post (I think?).  If the user submits the post, but it fails, the calculations are
				// already done and added.  What if the post length changes?  No way for the updated amounts to
				// get added correctly (big flaw with the old monetary plugin).

				// Possible fix: Check if form has been submitted, if so, remove previous money added.

				if(this._submitted){
					if(this._money_added){
						monetary.api.decrease(evt_obj.user_id).money(this._money_added);
					}

					// Update the new value of money being added in case we need to remove it again.

					this._money_added = money_to_add;

					monetary.api.increase(evt_obj.user_id).money(money_to_add);
					yootil.key.set_on(monetary.enums.PLUGIN_KEY, monetary.api.get(evt_obj.user_id).data(), evt_obj.user_id, this._hook);
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