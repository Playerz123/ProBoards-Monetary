monetary.user_data = class {

	constructor(user_id = 0, data = {}){
		this._id = user_id;
		this._DATA = Object.assign(Object.create(null), {

			[monetary.enums.DATA_KEYS.MONEY]: parseFloat(data[monetary.enums.DATA_KEYS.MONEY]) || 0,
			[monetary.enums.DATA_KEYS.RANK]: parseInt(data[monetary.enums.DATA_KEYS.RANK], 10) || 1,
			[monetary.enums.DATA_KEYS.NEW_MEMBER_PAID]: parseInt(data[monetary.enums.DATA_KEYS.NEW_MEMBER_PAID], 10) || 0

		});
	}

	save(){
		$(monetary.api.events).trigger("monetary.user_data.before_key_saved", this._DATA);
		
		return yootil.key.set(monetary.enums.PLUGIN_KEY, this._DATA, this._id);
	}

	get(key = ""){
		if(key in this._DATA){
			return this._DATA[key];
		} else if(key == "data"){
			return this._DATA;
		}

		return null;
	}

	set(key = "", value){
		if(key in this._DATA){
			this._DATA[key] = value;

			return true;
		} else if(key == "data"){
			this._DATA = value;

			return true;
		}

		return false;
	}

	clear(key = ""){
		if(key in this._DATA){
			return delete this._DATA[key];
		} else if(key == "data"){
			this._DATA = {};

			return true;
		}

		return false;
	}

};