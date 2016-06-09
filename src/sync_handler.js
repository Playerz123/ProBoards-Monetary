monetary.sync_handler = class {

	change(new_data, old_data){
		this._new_data = new_data;
		this._old_data = old_data;

		monetary.api.set(yootil.user.id()).data(this._new_data);

		$(this.ready.bind(this));
	}

	ready(){
		this.update_profile();
		this.update_mini_profile();
	}

	get old_data(){
		return this._old_data;
	}

	get new_data(){
		return this._new_data;
	}

	update_profile(){
		if(monetary.profile.initialised && yootil.page.member.id() == yootil.user.id()){
			monetary.profile.update(yootil.user.id());
		}
	}
	
	update_mini_profile(){
		if(monetary.mini_profile.initialised){
			monetary.mini_profile.update(yootil.user.id());
		}
	}

}