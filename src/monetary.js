/**
 * @class monetary
 * @static
 *
 * Main class.
 */

class monetary {

	static init(){
		this.ENUMS = {

			PLUGIN_ID: "pixeldepth_monetary",
			PLUGIN_KEY: "pixeldepth_money",
			PLUGIN_VERSION: "{VER}",
			PLUGIN_CALLED: yootil.ts(),

			YOOTIL_MIN_REQUIRED_VERSION: "2.0.0",

			DATA_KEYS: {

				MONEY: "m"

			}

		};

		Object.freeze(this.ENUMS);

		if(!this.correct_yootil_version()){
			return;
		}

		this._DATA = new Map();
		this.events = {};

		this.settings.setup();
		this.setup_data();

		if(this.settings.profile_show_money && yootil.location.profile_home() && yootil.page.member.exists()){
			this.profile.init();
		}

		return this;
	}

	static correct_yootil_version(){
		if(typeof yootil == "undefined"){
			console.error("Yootil is required for the Monetary plugin, but was not found.");

			return false;
		} else if(yootil.compare_version(yootil.version, this.ENUMS.YOOTIL_MIN_REQUIRED_VERSION) == -1){
			console.error("Monetary plugin requires a mininum Yootil version of " + this.ENUMS.YOOTIL_MIN_REQUIRED_VERSION + ".");

			return false;
		}

		return true;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this.ENUMS.PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this.ENUMS.PLUGIN_KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this.ENUMS.PLUGIN_VERSION;
	}

	static get CALLED(){
		return this.ENUMS.PLUGIN_CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

	static setup_data(){
		let user_data = proboards.plugin.keys.data[this.ENUMS.PLUGIN_KEY];

		for(let [key, value] of Object.entries(user_data)){
			if(!this._DATA.has(key)){
				this._DATA.set(key, new monetary.user_data(key, value));
			}
		}
	}

	static data(user_id = 0){
		return monetary.api.data(user_id);
	}

}