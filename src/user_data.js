monetary.user_data = class {

	constructor(user_id = 0, data = {}){
		this._id = user_id;
		this._DATA = {

			[monetary.enums.DATA_KEYS.MONEY]: parseFloat(data[monetary.enums.DATA_KEYS.MONEY]) || 0

		};
	}

	save(){
		return yootil.key.set(monetary.enums.PLUGIN_KEY, this._DATA, this._id);
	}

	get(key = ""){
		if(this._DATA.hasOwnProperty(key)){
			return this._DATA[key];
		} else if(key == "data"){
			return this._DATA;
		}

		return null;
	}

	set(key = "", value){
		if(this._DATA.hasOwnProperty(key)){
			this._DATA[key] = value;

			return true;
		} else if(key == "data"){
			this._DATA = value;

			return true;
		}

		return false;
	}

};