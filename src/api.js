monetary.api = class {

	static data(user_id = 0){
		let id = ~~ user_id;

		if(id > 0){
			if(!monetary._DATA.has(id)){
				monetary._DATA.set(id, new monetary.user_data(id));
			}

			return monetary._DATA.get(id);
		}

		console.error("monetary.api: User ID not valid");

		return null;
	}

};