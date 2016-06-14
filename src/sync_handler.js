monetary.sync_handler = class {

	static change(new_data, old_data){
		this._new_data = new_data;
		this._old_data = old_data;

		monetary.api.set(yootil.user.id()).data(this._new_data);

		$(this.ready.bind(this));
	}

	static ready(){
		this.update_profile();
		this.update_mini_profile();
	}

	static get old_data(){
		return this._old_data;
	}

	static get new_data(){
		return this._new_data;
	}

	static update_profile(){
		if(monetary.profile.initialised && yootil.page.member.id() == yootil.user.id()){
			monetary.profile.update(yootil.user.id());
		}
	}

	static update_mini_profile(){
		if(monetary.mini_profile.initialised){
			monetary.mini_profile.update(yootil.user.id());
		}
	}

	static update_all(){
		this.update_profile();
		this.update_mini_profile();
	}

}