monetary.rank_up = class {

	static init(){
		this._enabled = true;
		this._amount = 250;
		
		this.setup();

		if(this._enabled && (yootil.location.posting() || yootil.location.thread())){
			this.check_rank();
		}
	}
	
	static setup(){
		if(monetary.SETTINGS){
			let settings = monetary.SETTINGS;

			this._enabled = !! ~~ settings.rank_up_enabled;
			this._amount = parseFloat(settings.rank_up_amount);
		}
	}

	static check_rank(){
		if(this.ranked_up()){
			$(monetary.api.events).on("monetary.post.before", (evt, data) => {
				data.add = this._amount;
			 });

			monetary.api.set(yootil.user.id()).rank(yootil.user.rank().id);
		}
		
	}
	
	static get enabled(){
		return this._enabled;
	}

	static get amount(){
		return this._amount;
	}

	static ranked_up(){
		let current_rank = yootil.user.rank().id;
		let old_rank = monetary.api.get(yootil.user.id()).rank();

		return (current_rank > old_rank && old_rank);
	}

};