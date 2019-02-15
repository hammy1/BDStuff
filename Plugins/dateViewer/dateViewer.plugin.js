//META{"name":"dateViewer","displayName":"Date Viewer","website":"https://github.com/hammy1/BDStuff/tree/master/Plugins/dateViewer","source":"https://raw.githubusercontent.com/hammy1/BDStuff/master/Plugins/dateViewer/dateViewer.plugin.js"}*//

var dateViewer = (() => {
    const config = {"info":{"name":"Date Viewer","authors":[{"name":"hammy","discord_id":"256531049222242304","github_username":"hammy1"}],"version":"0.2.3","description":"Displays current time, date and day of the week on your right side. The way it's displayed depends on your locale conventions.","github":"https://github.com/hammy1/BDStuff/tree/master/Plugins/dateViewer","github_raw":"https://raw.githubusercontent.com/hammy1/BDStuff/master/Plugins/dateViewer/dateViewer.plugin.js"},"changelog":[{"title":"Evolving?","type":"improved","items":["Now renders using React!"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {window.BdApi.alert("Library Missing",`The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);}
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
	const {PluginUtilities, DiscordSelectors, WebpackModules, DiscordModules, Patcher, ReactTools} = Api;
	
	const Viewer = class Viewer extends DiscordModules.React.Component {
		constructor(props) {
			super(props);
			this.interval;
			this.state = { time: 0, date: "", weekday: "" };
			this.update = this.update.bind(this);
		}

		componentDidMount() {
			this.update();
			this.interval = setInterval(() => this.update(), 1000);
		}

		componentWillUnmount() {
			clearInterval(this.interval);
		}

		update() {
			const date = new Date();
			const lang = document.documentElement.lang;
			this.setState({
				time: date.toLocaleTimeString(lang),
				date: date.toLocaleDateString(lang, { day: "2-digit", month: "2-digit", year: "numeric" }),
				weekday: date.toLocaleDateString(lang, { weekday: "long" })
			});
		}

		render() {
			return DiscordModules.React.createElement("div", {
				id: "dv-mount"
			},
				DiscordModules.React.createElement("div", {
					id: "dv-main"
				},
					DiscordModules.React.createElement("span", {
						className: "dv-time"
					}, this.state.time),
					DiscordModules.React.createElement("span", {
						className: "dv-date"
					}, this.state.date),
					DiscordModules.React.createElement("span", {
						className: "dv-weekday"
					}, this.state.weekday)
				)
			);
		}
	}

    return class dateViewer extends Plugin {
        constructor() {
            super();
			this.initialized = false;
			this.style = `
				#dv-mount {
					background-color: #2f3136;
					bottom: 0;
					box-sizing: border-box;
					display: flex;
					height: 95px;
					justify-content: center;
					position: absolute;
					width: 240px;
					z-index: 256;
				}
				#dv-main {
					--gap: 20px;
					background-color: transparent;
					border-top: 1px solid hsla(0, 0%, 100%, .04);
					box-sizing: border-box;
					color: #fff;
					display: flex;
					flex-direction: column;
					height: 100%;
					line-height: 20px;
					justify-content: center;
					text-align: center;
					text-transform: uppercase;
					width: calc(100% - var(--gap) * 2);
				}
				#dv-main .dv-date {
					font-size: small;
					opacity: .6;
				}
				.theme-light #dv-mount {
					background-color: #f3f3f3;
				}
				.theme-light #dv-main {
					border-top: 1px solid #e6e6e6;
					color: #737f8d;
				}
				${DiscordSelectors.MemberList.membersWrap} ${DiscordSelectors.MemberList.members} {
					height: calc(100% - 95px);
				}
			`;
        }
		
        onStart() {
            PluginUtilities.addStyle(this.getName()  + "-style", this.style);
			this.patchMemberList();
			this.initialized = true;
		}
		
        onStop() {
            PluginUtilities.removeStyle(this.getName()  + "-style");
			Patcher.unpatchAll();
			this.updateMemberList();
		}

		patchMemberList() {
			const Scroller = WebpackModules.getByDisplayName("VerticalScroller");
			
			Patcher.after(Scroller.prototype, "render", (that, args, value) => {
				const key = this.getProps(that, "props.children.2.0.key");
				if (typeof key === "string" && key.includes("section-container")) return value;

				const children = this.getProps(value, "props.children.0.props.children.1");
				if (!children || !Array.isArray(children)) return value;

				const memberlist = this.getProps(children, "2") || this.getProps(children, "1");
				const viewer = DiscordModules.React.createElement(Viewer, {});

				memberlist && memberlist.push && memberlist.push([viewer, null]);

				return value;
			});
			
			this.updateMemberList();
		}

		updateMemberList() {
			const memberList = document.querySelector(DiscordSelectors.MemberList.members.value.trim());
			if (memberList) ReactTools.getOwnerInstance(memberList).forceUpdate();
		}

		getProps(obj, path) {
			return path.split(/\s?\.\s?/).reduce((object, prop) => object && object[prop], obj);
		}
	}
}
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
