/**
 * @class monetary
 * @static
 *
 * Main class.
 */

class monetary {

	static init(){
		this.enums = Object.create(null);

		this.enums.PLUGIN_ID = "pixeldepth_monetary";
		this.enums.PLUGIN_KEY = "pixeldepth_money";
		this.enums.PLUGIN_VERSION = "{VER}";
		this.enums.PLUGIN_CALLED = yootil.ts();

		this.enums.SYNC_KEY = "monetary";

		this.enums.YOOTIL_MIN_REQUIRED_VERSION = "2.0.0";

		this.enums.DATA_KEYS = Object.create(null);

		this.enums.DATA_KEYS.MONEY = "m";

		Object.freeze(this.enums);

		if(!this.correct_yootil_version()){
			return;
		}

		this._DATA = new Map();

		this.settings.setup();
		this.setup_data();

		// Extension pre inits
		
		yootil.extension.run("monetary").pre_inits();
		
		// Inits

		this.api.init();

		// Extension inits run after API init

		yootil.extension.run("monetary").inits();

		this.profile.init();
		this.mini_profile.init();

		// Extension post inits

		yootil.extension.run("monetary").post_inits();

		// Ready inits

		$(yootil.extension.run("monetary").ready);
		
		return this;
	}

	static correct_yootil_version(){
		if(typeof yootil == "undefined"){
			console.error("Yootil is required for the Monetary plugin, but was not found.");

			return false;
		} else if(yootil.compare_version(yootil.version, this.enums.YOOTIL_MIN_REQUIRED_VERSION) == -1){
			console.error("Monetary plugin requires a mininum Yootil version of " + this.enums.YOOTIL_MIN_REQUIRED_VERSION + ".");

			return false;
		}

		return true;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this.enums.PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this.enums.PLUGIN_KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this.enums.PLUGIN_VERSION;
	}

	static get CALLED(){
		return this.enums.PLUGIN_CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.enums.PLUGIN_KEY];

		for(let [key, value] of Object.entries(user_data)){
			let id = parseInt(key, 10);

			if(!this._DATA.has(id)){
				this._DATA.set(id, new monetary.user_data(id, value));
			}
		}
	}

	static data(user_id = 0){
		return monetary.api.data(user_id);
	}

}