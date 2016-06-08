monetary.permissions = class {

	static can_edit_money(){
		if(!monetary.settings.members_who_can_edit.length){
			return false;
		}

		let user_id = yootil.user.id();

		// Array.prototype.includes is strict, and ProBoards array elements are strings :(
		// Using .find for the moment until we discuss plugin side of things for v6.

		if(monetary.settings.members_who_can_edit.find(id => parseInt(id, 10) == user_id)){
			if(monetary.profile.initialised && (yootil.page.member.id() == user_id && !yootil.user.staff())){
				return false;
			}

			return true;
		}

		return false;
	}

	static can_earn_in_category(){
		if(!monetary.settings.categories_can_not_earn.length){
			return true;
		}

		let category_id = yootil.page.category.id();

		if(monetary.settings.categories_can_not_earn.find(id => parseInt(id, 10) == category_id)){
			return false;
		}

		return true;
	}

	static can_earn_in_board(){
		if(!monetary.settings.boards_can_not_earn.length){
			return true;
		}

		let board_id = yootil.page.board.id();

		if(monetary.settings.boards_can_not_earn.find(id => parseInt(id, 10) == board_id)){
			return false;
		}

		return true;
	}

	static can_earn(){
		return this.can_earn_in_category() && this.can_earn_in_board();
	}

};