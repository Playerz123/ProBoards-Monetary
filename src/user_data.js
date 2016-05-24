monetary.user_data = class {

	constructor(user_id = 0, data = {}){
		this._DATA = {

			[monetary.ENUMS.DATA_KEYS.MONEY]: data[monetary.ENUMS.DATA_KEYS.MONEY] || 0

		};
	}

	get(key = ""){
		if(this._DATA.hasOwnProperty(key)){
			return this._DATA[key];
		}

		return null;
	}

	set(key = "", value){
		if(this._DATA.hasOwnProperty(key)){
			this._DATA[key] = value;

			return true;
		}

		return false;
	}

};