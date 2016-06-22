// @TODO: Test importer

monetary.importer = class {

	static init(){
		if(!yootil.user.logged_in()){
			return;
		}

		if(this.has_old_keys()){
			$(this.warn_user.bind(this));
		}
	}

	// Check for any old key.
	// We don't do any updating here.

	static has_old_keys(){
		let old_data = monetary.api.get(yootil.user.id()).old_data();

		if(typeof old_data.b != "undefined" && parseFloat(old_data.b) > 0){
			return true;
		} else if(typeof old_data.or != "undefined" && parseInt(old_data.or, 10) > 0){
			return true;
		} else if(typeof old_data.s != "undefined" && typeof old_data.s == "object"){
			let stock = old_data.s;

			for(let k in stock){
				if(typeof stock[k].b != "undefined" && parseFloat(stock[k].b) > 0 && parseInt(stock[k].a, 10) > 0){
					return true;
				}
			}
		}

		return false;
	}

	static warn_user(){
		monetary.api.queue.add(queue => {
			this.create_dialog(queue);
		});
	}

	static create_dialog(queue){
		let dialog_msg = "Hello " + yootil.html_encode(yootil.user.name(), true) + ",<br /><br />";
		let old_data = monetary.api.get(yootil.user.id()).old_data();

		dialog_msg += "The Monetary plugin has been updated, but we need to move some important information over.  ";
		dialog_msg += "Below is what we will be doing, all you need to do is click \"Import\".<br /><br />";

		dialog_msg += " &nbsp; <strong>- Bank account emptied and put into your pocket.</strong><br />";
		dialog_msg += " &nbsp; <strong>- Old rank moved to a new home.</strong><br />"
		dialog_msg += " &nbsp; <strong>- Investments returned at the price you paid.</strong>";

		dialog_msg += "<br /><br />If you choose to ignore this dialog, then you may lose out on money you previously earned.";

		let user_id = yootil.user.id();

		let $dialog = pb.window.dialog("monetary-import-dialog", {

			title: "Monetary Importer",
			modal: true,
			height: 340,
			width: 550,
			resizable: false,
			draggable: false,
			html: dialog_msg,

			buttons: {

				"Import": function(){
					let old_data = monetary.api.get(user_id).old_data();

					if(typeof old_data.b != "undefined" && parseFloat(old_data.b) > 0){
						monetary.api.increase(user_id).money(parseFloat(old_data.b));
						delete old_data.b;
					}

					if(typeof old_data.or != "undefined" && parseInt(old_data.or, 10) > 0){
						monetary.api.set(user_id).rank(parseInt(old_data.or, 10) || 0);
						delete old_data.or;
					}

					if(typeof old_data.s != "undefined" && typeof old_data.s == "object"){
						let stock = old_data.s;
						let amount = 0;

						for(let k in stock){
							if(typeof stock[k].b != "undefined" && parseFloat(stock[k].b) > 0 && parseInt(stock[k].a, 10) > 0){
								amount += parseFloat(stock[k].b) * (parseInt(stock[k].a, 10) || 0);
							}
						}

						if(amount){
							monetary.api.increase(user_id).money(amount);
						}

						delete old_data.s;
					}

					monetary.api.set(user_id).old_data(old_data);

					monetary.api.save(user_id).then(status => {
						monetary.api.sync(user_id);
						monetary.sync_handler.update_all();
					}).catch(status => {
						console.warn("Monetary Error [Importer]", "Could not save data (ID#" + user_id + ").<br /><br />" + yootil.html_encode(status.message));
					});

					$(this).dialog("close");

					if(queue){
						queue.next();
					}
				}

			}

		});
	}

};