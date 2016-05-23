monetary.user_data = class {

	constructor(user_id = 0){

		this._data = {

			m: 0

		};
	}

	money(format = false, include_symbol = true){
		let amount = this._data.m;

		if(format){
			amount = monetary.utils.money_str(amount, true, include_symbol)
		}

		return amount;
	}

};