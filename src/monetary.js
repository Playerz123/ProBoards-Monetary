/**
 * @class monetary
 * @static
 *
 * Main class.
 */

class monetary {

	static init(){
		this._PLUGIN_ID = "pixeldepth_monetary";
		this._KEY = "pixeldepth_money";
		this._VERSION = "{VER}";
		this._CALLED = yootil.ts();
		this._PLUGIN = {};

		this.settings.setup();

		if(this.settings.profile_show_money && yootil.location.profile_home() && yootil.page.member.exists()){
			this.profile.init();
		}

		return this;
	}

	/**
	 * Plugin ID.
	 * @return {String}
	 */

	static get PLUGIN_ID(){
		return this._PLUGIN_ID;
	}

	/**
	 * Gets the plugin key name
	 * @return {String}
	 */

	static get KEY(){
		return this._KEY;
	}

	/**
	 * Gets version of this plugin.
	 * @return {String}
	 */

	static get version(){
		return this._VERSION;
	}

	static get CALLED(){
		return this._CALLED;
	}

	static set PLUGIN(plug){
		this._PLUGIN = plug;
	}

	static get PLUGIN(){
		return this._PLUGIN;
	}

}