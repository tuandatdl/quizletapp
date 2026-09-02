(function() {
	var $o = Object.defineProperty, xo = (e, t, r) => () => {
		if (r) throw r[0];
		try {
			return e && (t = e(e = 0)), t;
		} catch (a) {
			throw r = [a], a;
		}
	}, h0 = (e, t) => () => (t || (e((t = { exports: {} }).exports, t), e = null), t.exports), ko = (e, t) => {
		let r = {};
		for (var a in e) $o(r, a, {
			get: e[a],
			enumerable: !0
		});
		return t || $o(r, Symbol.toStringTag, { value: "Module" }), r;
	}, Aa = h0(((e, t) => {
		t.exports = {};
	})), g0 = ko({ createPiperPhonemize: () => So }), So, _0 = xo((() => {
		So = (() => {
			var e = typeof document < "u" && document.currentScript ? document.currentScript.src : void 0;
			return typeof __filename < "u" && (e = e || __filename), function(t = {}) {
				var r = t, a, n;
				r.ready = new Promise((u, m) => {
					a = u, n = m;
				}), r.expectedDataFileDownloads || (r.expectedDataFileDownloads = 0), r.expectedDataFileDownloads++, (function() {
					if (!(r.ENVIRONMENT_IS_PTHREAD || r.$ww)) {
						var u = function(m) {
							typeof window == "object" ? window.encodeURIComponent(window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/") : typeof process > "u" && typeof location < "u" && encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/");
							var y = "piper_phonemize.data", x = "piper_phonemize.data";
							typeof r.locateFilePackage == "function" && !r.locateFile && (r.locateFile = r.locateFilePackage, z("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)"));
							var R = r.locateFile ? r.locateFile(x, "") : x, D = m.remote_package_size;
							function L(ae, te, me, Re) {
								if (typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string") {
									Aa().readFile(ae, function(Te, Be) {
										Te ? Re(Te) : me(Be.buffer);
									});
									return;
								}
								var Oe = new XMLHttpRequest();
								Oe.open("GET", ae, !0), Oe.responseType = "arraybuffer", Oe.onprogress = function(Te) {
									var Be = ae, H = te;
									if (Te.total && (H = Te.total), Te.loaded) {
										Oe.addedTotal ? r.dataFileDownloads[Be].loaded = Te.loaded : (Oe.addedTotal = !0, r.dataFileDownloads || (r.dataFileDownloads = {}), r.dataFileDownloads[Be] = {
											loaded: Te.loaded,
											total: H
										});
										var ce = 0, Ve = 0, Xe = 0;
										for (var Ze in r.dataFileDownloads) {
											var Zr = r.dataFileDownloads[Ze];
											ce += Zr.total, Ve += Zr.loaded, Xe++;
										}
										ce = Math.ceil(ce * r.expectedDataFileDownloads / Xe), r.setStatus && r.setStatus(`Downloading data... (${Ve}/${ce})`);
									} else r.dataFileDownloads || r.setStatus && r.setStatus("Downloading data...");
								}, Oe.onerror = function(Te) {
									throw new Error("NetworkError for: " + ae);
								}, Oe.onload = function(Te) {
									if (Oe.status == 200 || Oe.status == 304 || Oe.status == 206 || Oe.status == 0 && Oe.response) {
										var Be = Oe.response;
										me(Be);
									} else throw new Error(Oe.statusText + " : " + Oe.responseURL);
								}, Oe.send(null);
							}
							function q(ae) {
								console.error("package error:", ae);
							}
							var J = null, _e = r.getPreloadedPackage ? r.getPreloadedPackage(R, D) : null;
							_e || L(R, D, function(ae) {
								J ? (J(ae), J = null) : _e = ae;
							}, q);
							function Se() {
								function ae(Te, Be) {
									if (!Te) throw Be + (/* @__PURE__ */ new Error()).stack;
								}
								r.FS_createPath("/", "espeak-ng-data", !0, !0), r.FS_createPath("/espeak-ng-data", "lang", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "aav", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "art", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "azc", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "bat", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "bnt", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "ccs", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "cel", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "cus", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "dra", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "esx", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "gmq", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "gmw", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "grk", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "inc", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "ine", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "ira", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "iro", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "itc", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "jpx", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "map", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "miz", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "myn", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "poz", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "roa", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "sai", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "sem", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "sit", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "tai", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "trk", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "urj", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "zle", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "zls", !0, !0), r.FS_createPath("/espeak-ng-data/lang", "zlw", !0, !0), r.FS_createPath("/espeak-ng-data", "mbrola_ph", !0, !0), r.FS_createPath("/espeak-ng-data", "voices", !0, !0), r.FS_createPath("/espeak-ng-data/voices", "!v", !0, !0), r.FS_createPath("/espeak-ng-data/voices", "mb", !0, !0);
								function te(Te, Be, H) {
									this.start = Te, this.end = Be, this.audio = H;
								}
								te.prototype = {
									requests: {},
									open: function(Te, Be) {
										this.name = Be, this.requests[Be] = this, r.addRunDependency(`fp ${this.name}`);
									},
									send: function() {},
									onload: function() {
										var Te = this.byteArray.subarray(this.start, this.end);
										this.finish(Te);
									},
									finish: function(Te) {
										var Be = this;
										r.FS_createDataFile(this.name, null, Te, !0, !0, !0), r.removeRunDependency(`fp ${Be.name}`), this.requests[this.name] = null;
									}
								};
								for (var me = m.files, Re = 0; Re < me.length; ++Re) new te(me[Re].start, me[Re].end, me[Re].audio || 0).open("GET", me[Re].filename);
								function Oe(Te) {
									ae(Te, "Loading data file failed."), ae(Te.constructor.name === ArrayBuffer.name, "bad input to processPackageData");
									var Be = new Uint8Array(Te);
									te.prototype.byteArray = Be;
									for (var H = m.files, ce = 0; ce < H.length; ++ce) te.prototype.requests[H[ce].filename].onload();
									r.removeRunDependency("datafile_piper_phonemize.data");
								}
								r.addRunDependency("datafile_piper_phonemize.data"), r.preloadResults || (r.preloadResults = {}), r.preloadResults[y] = { fromCache: !1 }, _e ? (Oe(_e), _e = null) : J = Oe;
							}
							r.calledRun ? Se() : (r.preRun || (r.preRun = []), r.preRun.push(Se));
						};
						u({
							files: [
								{
									filename: "/espeak-ng-data/af_dict",
									start: 0,
									end: 121473
								},
								{
									filename: "/espeak-ng-data/am_dict",
									start: 121473,
									end: 185351
								},
								{
									filename: "/espeak-ng-data/an_dict",
									start: 185351,
									end: 192042
								},
								{
									filename: "/espeak-ng-data/ar_dict",
									start: 192042,
									end: 670207
								},
								{
									filename: "/espeak-ng-data/as_dict",
									start: 670207,
									end: 675212
								},
								{
									filename: "/espeak-ng-data/az_dict",
									start: 675212,
									end: 718985
								},
								{
									filename: "/espeak-ng-data/ba_dict",
									start: 718985,
									end: 721083
								},
								{
									filename: "/espeak-ng-data/be_dict",
									start: 721083,
									end: 723735
								},
								{
									filename: "/espeak-ng-data/bg_dict",
									start: 723735,
									end: 810786
								},
								{
									filename: "/espeak-ng-data/bn_dict",
									start: 810786,
									end: 900765
								},
								{
									filename: "/espeak-ng-data/bpy_dict",
									start: 900765,
									end: 905991
								},
								{
									filename: "/espeak-ng-data/bs_dict",
									start: 905991,
									end: 953059
								},
								{
									filename: "/espeak-ng-data/ca_dict",
									start: 953059,
									end: 998625
								},
								{
									filename: "/espeak-ng-data/chr_dict",
									start: 998625,
									end: 1001484
								},
								{
									filename: "/espeak-ng-data/cmn_dict",
									start: 1001484,
									end: 2567819
								},
								{
									filename: "/espeak-ng-data/cs_dict",
									start: 2567819,
									end: 2617464
								},
								{
									filename: "/espeak-ng-data/cv_dict",
									start: 2617464,
									end: 2618808
								},
								{
									filename: "/espeak-ng-data/cy_dict",
									start: 2618808,
									end: 2661938
								},
								{
									filename: "/espeak-ng-data/da_dict",
									start: 2661938,
									end: 2907225
								},
								{
									filename: "/espeak-ng-data/de_dict",
									start: 2907225,
									end: 2975501
								},
								{
									filename: "/espeak-ng-data/el_dict",
									start: 2975501,
									end: 3048342
								},
								{
									filename: "/espeak-ng-data/en_dict",
									start: 3048342,
									end: 3215286
								},
								{
									filename: "/espeak-ng-data/eo_dict",
									start: 3215286,
									end: 3219952
								},
								{
									filename: "/espeak-ng-data/es_dict",
									start: 3219952,
									end: 3269204
								},
								{
									filename: "/espeak-ng-data/et_dict",
									start: 3269204,
									end: 3313467
								},
								{
									filename: "/espeak-ng-data/eu_dict",
									start: 3313467,
									end: 3362308
								},
								{
									filename: "/espeak-ng-data/fa_dict",
									start: 3362308,
									end: 3655543
								},
								{
									filename: "/espeak-ng-data/fi_dict",
									start: 3655543,
									end: 3699471
								},
								{
									filename: "/espeak-ng-data/fr_dict",
									start: 3699471,
									end: 3763198
								},
								{
									filename: "/espeak-ng-data/ga_dict",
									start: 3763198,
									end: 3815871
								},
								{
									filename: "/espeak-ng-data/gd_dict",
									start: 3815871,
									end: 3864992
								},
								{
									filename: "/espeak-ng-data/gn_dict",
									start: 3864992,
									end: 3868240
								},
								{
									filename: "/espeak-ng-data/grc_dict",
									start: 3868240,
									end: 3871673
								},
								{
									filename: "/espeak-ng-data/gu_dict",
									start: 3871673,
									end: 3954153
								},
								{
									filename: "/espeak-ng-data/hak_dict",
									start: 3954153,
									end: 3957488
								},
								{
									filename: "/espeak-ng-data/haw_dict",
									start: 3957488,
									end: 3959931
								},
								{
									filename: "/espeak-ng-data/he_dict",
									start: 3959931,
									end: 3966894
								},
								{
									filename: "/espeak-ng-data/hi_dict",
									start: 3966894,
									end: 4059037
								},
								{
									filename: "/espeak-ng-data/hr_dict",
									start: 4059037,
									end: 4108425
								},
								{
									filename: "/espeak-ng-data/ht_dict",
									start: 4108425,
									end: 4110228
								},
								{
									filename: "/espeak-ng-data/hu_dict",
									start: 4110228,
									end: 4264013
								},
								{
									filename: "/espeak-ng-data/hy_dict",
									start: 4264013,
									end: 4326276
								},
								{
									filename: "/espeak-ng-data/ia_dict",
									start: 4326276,
									end: 4657551
								},
								{
									filename: "/espeak-ng-data/id_dict",
									start: 4657551,
									end: 4701009
								},
								{
									filename: "/espeak-ng-data/intonations",
									start: 4701009,
									end: 4703049
								},
								{
									filename: "/espeak-ng-data/io_dict",
									start: 4703049,
									end: 4705214
								},
								{
									filename: "/espeak-ng-data/is_dict",
									start: 4705214,
									end: 4749568
								},
								{
									filename: "/espeak-ng-data/it_dict",
									start: 4749568,
									end: 4902457
								},
								{
									filename: "/espeak-ng-data/ja_dict",
									start: 4902457,
									end: 4950109
								},
								{
									filename: "/espeak-ng-data/jbo_dict",
									start: 4950109,
									end: 4952352
								},
								{
									filename: "/espeak-ng-data/ka_dict",
									start: 4952352,
									end: 5040127
								},
								{
									filename: "/espeak-ng-data/kk_dict",
									start: 5040127,
									end: 5041986
								},
								{
									filename: "/espeak-ng-data/kl_dict",
									start: 5041986,
									end: 5044824
								},
								{
									filename: "/espeak-ng-data/kn_dict",
									start: 5044824,
									end: 5132652
								},
								{
									filename: "/espeak-ng-data/ko_dict",
									start: 5132652,
									end: 5180175
								},
								{
									filename: "/espeak-ng-data/kok_dict",
									start: 5180175,
									end: 5186569
								},
								{
									filename: "/espeak-ng-data/ku_dict",
									start: 5186569,
									end: 5188834
								},
								{
									filename: "/espeak-ng-data/ky_dict",
									start: 5188834,
									end: 5253811
								},
								{
									filename: "/espeak-ng-data/la_dict",
									start: 5253811,
									end: 5257617
								},
								{
									filename: "/espeak-ng-data/lang/aav/vi",
									start: 5257617,
									end: 5257728
								},
								{
									filename: "/espeak-ng-data/lang/aav/vi-VN-x-central",
									start: 5257728,
									end: 5257871
								},
								{
									filename: "/espeak-ng-data/lang/aav/vi-VN-x-south",
									start: 5257871,
									end: 5258013
								},
								{
									filename: "/espeak-ng-data/lang/art/eo",
									start: 5258013,
									end: 5258054
								},
								{
									filename: "/espeak-ng-data/lang/art/ia",
									start: 5258054,
									end: 5258083
								},
								{
									filename: "/espeak-ng-data/lang/art/io",
									start: 5258083,
									end: 5258133
								},
								{
									filename: "/espeak-ng-data/lang/art/jbo",
									start: 5258133,
									end: 5258202
								},
								{
									filename: "/espeak-ng-data/lang/art/lfn",
									start: 5258202,
									end: 5258337
								},
								{
									filename: "/espeak-ng-data/lang/art/piqd",
									start: 5258337,
									end: 5258393
								},
								{
									filename: "/espeak-ng-data/lang/art/py",
									start: 5258393,
									end: 5258533
								},
								{
									filename: "/espeak-ng-data/lang/art/qdb",
									start: 5258533,
									end: 5258590
								},
								{
									filename: "/espeak-ng-data/lang/art/qya",
									start: 5258590,
									end: 5258763
								},
								{
									filename: "/espeak-ng-data/lang/art/sjn",
									start: 5258763,
									end: 5258938
								},
								{
									filename: "/espeak-ng-data/lang/azc/nci",
									start: 5258938,
									end: 5259052
								},
								{
									filename: "/espeak-ng-data/lang/bat/lt",
									start: 5259052,
									end: 5259080
								},
								{
									filename: "/espeak-ng-data/lang/bat/ltg",
									start: 5259080,
									end: 5259392
								},
								{
									filename: "/espeak-ng-data/lang/bat/lv",
									start: 5259392,
									end: 5259621
								},
								{
									filename: "/espeak-ng-data/lang/bnt/sw",
									start: 5259621,
									end: 5259662
								},
								{
									filename: "/espeak-ng-data/lang/bnt/tn",
									start: 5259662,
									end: 5259704
								},
								{
									filename: "/espeak-ng-data/lang/ccs/ka",
									start: 5259704,
									end: 5259828
								},
								{
									filename: "/espeak-ng-data/lang/cel/cy",
									start: 5259828,
									end: 5259865
								},
								{
									filename: "/espeak-ng-data/lang/cel/ga",
									start: 5259865,
									end: 5259931
								},
								{
									filename: "/espeak-ng-data/lang/cel/gd",
									start: 5259931,
									end: 5259982
								},
								{
									filename: "/espeak-ng-data/lang/cus/om",
									start: 5259982,
									end: 5260021
								},
								{
									filename: "/espeak-ng-data/lang/dra/kn",
									start: 5260021,
									end: 5260076
								},
								{
									filename: "/espeak-ng-data/lang/dra/ml",
									start: 5260076,
									end: 5260133
								},
								{
									filename: "/espeak-ng-data/lang/dra/ta",
									start: 5260133,
									end: 5260184
								},
								{
									filename: "/espeak-ng-data/lang/dra/te",
									start: 5260184,
									end: 5260254
								},
								{
									filename: "/espeak-ng-data/lang/esx/kl",
									start: 5260254,
									end: 5260284
								},
								{
									filename: "/espeak-ng-data/lang/eu",
									start: 5260284,
									end: 5260338
								},
								{
									filename: "/espeak-ng-data/lang/gmq/da",
									start: 5260338,
									end: 5260381
								},
								{
									filename: "/espeak-ng-data/lang/gmq/is",
									start: 5260381,
									end: 5260408
								},
								{
									filename: "/espeak-ng-data/lang/gmq/nb",
									start: 5260408,
									end: 5260495
								},
								{
									filename: "/espeak-ng-data/lang/gmq/sv",
									start: 5260495,
									end: 5260520
								},
								{
									filename: "/espeak-ng-data/lang/gmw/af",
									start: 5260520,
									end: 5260643
								},
								{
									filename: "/espeak-ng-data/lang/gmw/de",
									start: 5260643,
									end: 5260685
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en",
									start: 5260685,
									end: 5260825
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-029",
									start: 5260825,
									end: 5261160
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-GB-scotland",
									start: 5261160,
									end: 5261455
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbclan",
									start: 5261455,
									end: 5261693
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-GB-x-gbcwmd",
									start: 5261693,
									end: 5261881
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-GB-x-rp",
									start: 5261881,
									end: 5262130
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-US",
									start: 5262130,
									end: 5262387
								},
								{
									filename: "/espeak-ng-data/lang/gmw/en-US-nyc",
									start: 5262387,
									end: 5262658
								},
								{
									filename: "/espeak-ng-data/lang/gmw/lb",
									start: 5262658,
									end: 5262689
								},
								{
									filename: "/espeak-ng-data/lang/gmw/nl",
									start: 5262689,
									end: 5262712
								},
								{
									filename: "/espeak-ng-data/lang/grk/el",
									start: 5262712,
									end: 5262735
								},
								{
									filename: "/espeak-ng-data/lang/grk/grc",
									start: 5262735,
									end: 5262834
								},
								{
									filename: "/espeak-ng-data/lang/inc/as",
									start: 5262834,
									end: 5262876
								},
								{
									filename: "/espeak-ng-data/lang/inc/bn",
									start: 5262876,
									end: 5262901
								},
								{
									filename: "/espeak-ng-data/lang/inc/bpy",
									start: 5262901,
									end: 5262940
								},
								{
									filename: "/espeak-ng-data/lang/inc/gu",
									start: 5262940,
									end: 5262982
								},
								{
									filename: "/espeak-ng-data/lang/inc/hi",
									start: 5262982,
									end: 5263005
								},
								{
									filename: "/espeak-ng-data/lang/inc/kok",
									start: 5263005,
									end: 5263031
								},
								{
									filename: "/espeak-ng-data/lang/inc/mr",
									start: 5263031,
									end: 5263072
								},
								{
									filename: "/espeak-ng-data/lang/inc/ne",
									start: 5263072,
									end: 5263109
								},
								{
									filename: "/espeak-ng-data/lang/inc/or",
									start: 5263109,
									end: 5263148
								},
								{
									filename: "/espeak-ng-data/lang/inc/pa",
									start: 5263148,
									end: 5263173
								},
								{
									filename: "/espeak-ng-data/lang/inc/sd",
									start: 5263173,
									end: 5263239
								},
								{
									filename: "/espeak-ng-data/lang/inc/si",
									start: 5263239,
									end: 5263294
								},
								{
									filename: "/espeak-ng-data/lang/inc/ur",
									start: 5263294,
									end: 5263388
								},
								{
									filename: "/espeak-ng-data/lang/ine/hy",
									start: 5263388,
									end: 5263449
								},
								{
									filename: "/espeak-ng-data/lang/ine/hyw",
									start: 5263449,
									end: 5263814
								},
								{
									filename: "/espeak-ng-data/lang/ine/sq",
									start: 5263814,
									end: 5263917
								},
								{
									filename: "/espeak-ng-data/lang/ira/fa",
									start: 5263917,
									end: 5264007
								},
								{
									filename: "/espeak-ng-data/lang/ira/fa-Latn",
									start: 5264007,
									end: 5264276
								},
								{
									filename: "/espeak-ng-data/lang/ira/ku",
									start: 5264276,
									end: 5264316
								},
								{
									filename: "/espeak-ng-data/lang/iro/chr",
									start: 5264316,
									end: 5264885
								},
								{
									filename: "/espeak-ng-data/lang/itc/la",
									start: 5264885,
									end: 5265182
								},
								{
									filename: "/espeak-ng-data/lang/jpx/ja",
									start: 5265182,
									end: 5265234
								},
								{
									filename: "/espeak-ng-data/lang/ko",
									start: 5265234,
									end: 5265285
								},
								{
									filename: "/espeak-ng-data/lang/map/haw",
									start: 5265285,
									end: 5265327
								},
								{
									filename: "/espeak-ng-data/lang/miz/mto",
									start: 5265327,
									end: 5265510
								},
								{
									filename: "/espeak-ng-data/lang/myn/quc",
									start: 5265510,
									end: 5265720
								},
								{
									filename: "/espeak-ng-data/lang/poz/id",
									start: 5265720,
									end: 5265854
								},
								{
									filename: "/espeak-ng-data/lang/poz/mi",
									start: 5265854,
									end: 5266221
								},
								{
									filename: "/espeak-ng-data/lang/poz/ms",
									start: 5266221,
									end: 5266651
								},
								{
									filename: "/espeak-ng-data/lang/qu",
									start: 5266651,
									end: 5266739
								},
								{
									filename: "/espeak-ng-data/lang/roa/an",
									start: 5266739,
									end: 5266766
								},
								{
									filename: "/espeak-ng-data/lang/roa/ca",
									start: 5266766,
									end: 5266791
								},
								{
									filename: "/espeak-ng-data/lang/roa/es",
									start: 5266791,
									end: 5266854
								},
								{
									filename: "/espeak-ng-data/lang/roa/es-419",
									start: 5266854,
									end: 5267021
								},
								{
									filename: "/espeak-ng-data/lang/roa/fr",
									start: 5267021,
									end: 5267100
								},
								{
									filename: "/espeak-ng-data/lang/roa/fr-BE",
									start: 5267100,
									end: 5267184
								},
								{
									filename: "/espeak-ng-data/lang/roa/fr-CH",
									start: 5267184,
									end: 5267270
								},
								{
									filename: "/espeak-ng-data/lang/roa/ht",
									start: 5267270,
									end: 5267410
								},
								{
									filename: "/espeak-ng-data/lang/roa/it",
									start: 5267410,
									end: 5267519
								},
								{
									filename: "/espeak-ng-data/lang/roa/pap",
									start: 5267519,
									end: 5267581
								},
								{
									filename: "/espeak-ng-data/lang/roa/pt",
									start: 5267581,
									end: 5267676
								},
								{
									filename: "/espeak-ng-data/lang/roa/pt-BR",
									start: 5267676,
									end: 5267785
								},
								{
									filename: "/espeak-ng-data/lang/roa/ro",
									start: 5267785,
									end: 5267811
								},
								{
									filename: "/espeak-ng-data/lang/sai/gn",
									start: 5267811,
									end: 5267858
								},
								{
									filename: "/espeak-ng-data/lang/sem/am",
									start: 5267858,
									end: 5267899
								},
								{
									filename: "/espeak-ng-data/lang/sem/ar",
									start: 5267899,
									end: 5267949
								},
								{
									filename: "/espeak-ng-data/lang/sem/he",
									start: 5267949,
									end: 5267989
								},
								{
									filename: "/espeak-ng-data/lang/sem/mt",
									start: 5267989,
									end: 5268030
								},
								{
									filename: "/espeak-ng-data/lang/sit/cmn",
									start: 5268030,
									end: 5268716
								},
								{
									filename: "/espeak-ng-data/lang/sit/cmn-Latn-pinyin",
									start: 5268716,
									end: 5268877
								},
								{
									filename: "/espeak-ng-data/lang/sit/hak",
									start: 5268877,
									end: 5269005
								},
								{
									filename: "/espeak-ng-data/lang/sit/my",
									start: 5269005,
									end: 5269061
								},
								{
									filename: "/espeak-ng-data/lang/sit/yue",
									start: 5269061,
									end: 5269255
								},
								{
									filename: "/espeak-ng-data/lang/sit/yue-Latn-jyutping",
									start: 5269255,
									end: 5269468
								},
								{
									filename: "/espeak-ng-data/lang/tai/shn",
									start: 5269468,
									end: 5269560
								},
								{
									filename: "/espeak-ng-data/lang/tai/th",
									start: 5269560,
									end: 5269597
								},
								{
									filename: "/espeak-ng-data/lang/trk/az",
									start: 5269597,
									end: 5269642
								},
								{
									filename: "/espeak-ng-data/lang/trk/ba",
									start: 5269642,
									end: 5269667
								},
								{
									filename: "/espeak-ng-data/lang/trk/cv",
									start: 5269667,
									end: 5269707
								},
								{
									filename: "/espeak-ng-data/lang/trk/kk",
									start: 5269707,
									end: 5269747
								},
								{
									filename: "/espeak-ng-data/lang/trk/ky",
									start: 5269747,
									end: 5269790
								},
								{
									filename: "/espeak-ng-data/lang/trk/nog",
									start: 5269790,
									end: 5269829
								},
								{
									filename: "/espeak-ng-data/lang/trk/tk",
									start: 5269829,
									end: 5269854
								},
								{
									filename: "/espeak-ng-data/lang/trk/tr",
									start: 5269854,
									end: 5269879
								},
								{
									filename: "/espeak-ng-data/lang/trk/tt",
									start: 5269879,
									end: 5269902
								},
								{
									filename: "/espeak-ng-data/lang/trk/ug",
									start: 5269902,
									end: 5269926
								},
								{
									filename: "/espeak-ng-data/lang/trk/uz",
									start: 5269926,
									end: 5269965
								},
								{
									filename: "/espeak-ng-data/lang/urj/et",
									start: 5269965,
									end: 5270202
								},
								{
									filename: "/espeak-ng-data/lang/urj/fi",
									start: 5270202,
									end: 5270439
								},
								{
									filename: "/espeak-ng-data/lang/urj/hu",
									start: 5270439,
									end: 5270512
								},
								{
									filename: "/espeak-ng-data/lang/urj/smj",
									start: 5270512,
									end: 5270557
								},
								{
									filename: "/espeak-ng-data/lang/zle/be",
									start: 5270557,
									end: 5270609
								},
								{
									filename: "/espeak-ng-data/lang/zle/ru",
									start: 5270609,
									end: 5270666
								},
								{
									filename: "/espeak-ng-data/lang/zle/ru-LV",
									start: 5270666,
									end: 5270946
								},
								{
									filename: "/espeak-ng-data/lang/zle/ru-cl",
									start: 5270946,
									end: 5271037
								},
								{
									filename: "/espeak-ng-data/lang/zle/uk",
									start: 5271037,
									end: 5271134
								},
								{
									filename: "/espeak-ng-data/lang/zls/bg",
									start: 5271134,
									end: 5271245
								},
								{
									filename: "/espeak-ng-data/lang/zls/bs",
									start: 5271245,
									end: 5271475
								},
								{
									filename: "/espeak-ng-data/lang/zls/hr",
									start: 5271475,
									end: 5271737
								},
								{
									filename: "/espeak-ng-data/lang/zls/mk",
									start: 5271737,
									end: 5271765
								},
								{
									filename: "/espeak-ng-data/lang/zls/sl",
									start: 5271765,
									end: 5271808
								},
								{
									filename: "/espeak-ng-data/lang/zls/sr",
									start: 5271808,
									end: 5272058
								},
								{
									filename: "/espeak-ng-data/lang/zlw/cs",
									start: 5272058,
									end: 5272081
								},
								{
									filename: "/espeak-ng-data/lang/zlw/pl",
									start: 5272081,
									end: 5272119
								},
								{
									filename: "/espeak-ng-data/lang/zlw/sk",
									start: 5272119,
									end: 5272143
								},
								{
									filename: "/espeak-ng-data/lb_dict",
									start: 5272143,
									end: 5960074
								},
								{
									filename: "/espeak-ng-data/lfn_dict",
									start: 5960074,
									end: 5962867
								},
								{
									filename: "/espeak-ng-data/lt_dict",
									start: 5962867,
									end: 6012757
								},
								{
									filename: "/espeak-ng-data/lv_dict",
									start: 6012757,
									end: 6079094
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/af1_phtrans",
									start: 6079094,
									end: 6080730
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ar1_phtrans",
									start: 6080730,
									end: 6082342
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ar2_phtrans",
									start: 6082342,
									end: 6083954
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ca_phtrans",
									start: 6083954,
									end: 6085950
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/cmn_phtrans",
									start: 6085950,
									end: 6087442
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/cr1_phtrans",
									start: 6087442,
									end: 6089606
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/cs_phtrans",
									start: 6089606,
									end: 6090186
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/de2_phtrans",
									start: 6090186,
									end: 6091918
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/de4_phtrans",
									start: 6091918,
									end: 6093722
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/de6_phtrans",
									start: 6093722,
									end: 6095118
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/de8_phtrans",
									start: 6095118,
									end: 6096274
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ee1_phtrans",
									start: 6096274,
									end: 6097718
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/en1_phtrans",
									start: 6097718,
									end: 6098514
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/es3_phtrans",
									start: 6098514,
									end: 6099574
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/es4_phtrans",
									start: 6099574,
									end: 6100682
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/es_phtrans",
									start: 6100682,
									end: 6102414
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/fr_phtrans",
									start: 6102414,
									end: 6104386
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/gr1_phtrans",
									start: 6104386,
									end: 6106598
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/gr2_phtrans",
									start: 6106598,
									end: 6108810
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/grc-de6_phtrans",
									start: 6108810,
									end: 6109294
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/he_phtrans",
									start: 6109294,
									end: 6110042
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/hn1_phtrans",
									start: 6110042,
									end: 6110574
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/hu1_phtrans",
									start: 6110574,
									end: 6112018
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ic1_phtrans",
									start: 6112018,
									end: 6113150
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/id1_phtrans",
									start: 6113150,
									end: 6114858
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/in_phtrans",
									start: 6114858,
									end: 6116302
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ir1_phtrans",
									start: 6116302,
									end: 6122114
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/it1_phtrans",
									start: 6122114,
									end: 6123438
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/it3_phtrans",
									start: 6123438,
									end: 6124330
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/jp_phtrans",
									start: 6124330,
									end: 6125366
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/la1_phtrans",
									start: 6125366,
									end: 6126114
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/lt_phtrans",
									start: 6126114,
									end: 6127174
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ma1_phtrans",
									start: 6127174,
									end: 6128114
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/mx1_phtrans",
									start: 6128114,
									end: 6129918
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/mx2_phtrans",
									start: 6129918,
									end: 6131746
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/nl_phtrans",
									start: 6131746,
									end: 6133430
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/nz1_phtrans",
									start: 6133430,
									end: 6134154
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/pl1_phtrans",
									start: 6134154,
									end: 6135742
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/pt1_phtrans",
									start: 6135742,
									end: 6137834
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ptbr4_phtrans",
									start: 6137834,
									end: 6140190
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ptbr_phtrans",
									start: 6140190,
									end: 6142714
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/ro1_phtrans",
									start: 6142714,
									end: 6144878
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/sv2_phtrans",
									start: 6144878,
									end: 6146466
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/sv_phtrans",
									start: 6146466,
									end: 6148054
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/tl1_phtrans",
									start: 6148054,
									end: 6148826
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/tr1_phtrans",
									start: 6148826,
									end: 6149190
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/us3_phtrans",
									start: 6149190,
									end: 6150346
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/us_phtrans",
									start: 6150346,
									end: 6151574
								},
								{
									filename: "/espeak-ng-data/mbrola_ph/vz_phtrans",
									start: 6151574,
									end: 6153858
								},
								{
									filename: "/espeak-ng-data/mi_dict",
									start: 6153858,
									end: 6155204
								},
								{
									filename: "/espeak-ng-data/mk_dict",
									start: 6155204,
									end: 6219063
								},
								{
									filename: "/espeak-ng-data/ml_dict",
									start: 6219063,
									end: 6311408
								},
								{
									filename: "/espeak-ng-data/mr_dict",
									start: 6311408,
									end: 6398799
								},
								{
									filename: "/espeak-ng-data/ms_dict",
									start: 6398799,
									end: 6452340
								},
								{
									filename: "/espeak-ng-data/mt_dict",
									start: 6452340,
									end: 6456724
								},
								{
									filename: "/espeak-ng-data/mto_dict",
									start: 6456724,
									end: 6460684
								},
								{
									filename: "/espeak-ng-data/my_dict",
									start: 6460684,
									end: 6556632
								},
								{
									filename: "/espeak-ng-data/nci_dict",
									start: 6556632,
									end: 6558166
								},
								{
									filename: "/espeak-ng-data/ne_dict",
									start: 6558166,
									end: 6653543
								},
								{
									filename: "/espeak-ng-data/nl_dict",
									start: 6653543,
									end: 6719522
								},
								{
									filename: "/espeak-ng-data/no_dict",
									start: 6719522,
									end: 6723700
								},
								{
									filename: "/espeak-ng-data/nog_dict",
									start: 6723700,
									end: 6726994
								},
								{
									filename: "/espeak-ng-data/om_dict",
									start: 6726994,
									end: 6729296
								},
								{
									filename: "/espeak-ng-data/or_dict",
									start: 6729296,
									end: 6818542
								},
								{
									filename: "/espeak-ng-data/pa_dict",
									start: 6818542,
									end: 6898495
								},
								{
									filename: "/espeak-ng-data/pap_dict",
									start: 6898495,
									end: 6900623
								},
								{
									filename: "/espeak-ng-data/phondata",
									start: 6900623,
									end: 7451047
								},
								{
									filename: "/espeak-ng-data/phondata-manifest",
									start: 7451047,
									end: 7472868
								},
								{
									filename: "/espeak-ng-data/phonindex",
									start: 7472868,
									end: 7511942
								},
								{
									filename: "/espeak-ng-data/phontab",
									start: 7511942,
									end: 7567738
								},
								{
									filename: "/espeak-ng-data/piqd_dict",
									start: 7567738,
									end: 7569448
								},
								{
									filename: "/espeak-ng-data/pl_dict",
									start: 7569448,
									end: 7646178
								},
								{
									filename: "/espeak-ng-data/pt_dict",
									start: 7646178,
									end: 7713995
								},
								{
									filename: "/espeak-ng-data/py_dict",
									start: 7713995,
									end: 7716404
								},
								{
									filename: "/espeak-ng-data/qdb_dict",
									start: 7716404,
									end: 7719432
								},
								{
									filename: "/espeak-ng-data/qu_dict",
									start: 7719432,
									end: 7721351
								},
								{
									filename: "/espeak-ng-data/quc_dict",
									start: 7721351,
									end: 7722801
								},
								{
									filename: "/espeak-ng-data/qya_dict",
									start: 7722801,
									end: 7724740
								},
								{
									filename: "/espeak-ng-data/ro_dict",
									start: 7724740,
									end: 7793278
								},
								{
									filename: "/espeak-ng-data/ru_dict",
									start: 7793278,
									end: 16325670
								},
								{
									filename: "/espeak-ng-data/sd_dict",
									start: 16325670,
									end: 16385598
								},
								{
									filename: "/espeak-ng-data/shn_dict",
									start: 16385598,
									end: 16473770
								},
								{
									filename: "/espeak-ng-data/si_dict",
									start: 16473770,
									end: 16559154
								},
								{
									filename: "/espeak-ng-data/sjn_dict",
									start: 16559154,
									end: 16560937
								},
								{
									filename: "/espeak-ng-data/sk_dict",
									start: 16560937,
									end: 16610939
								},
								{
									filename: "/espeak-ng-data/sl_dict",
									start: 16610939,
									end: 16655986
								},
								{
									filename: "/espeak-ng-data/smj_dict",
									start: 16655986,
									end: 16691081
								},
								{
									filename: "/espeak-ng-data/sq_dict",
									start: 16691081,
									end: 16736084
								},
								{
									filename: "/espeak-ng-data/sr_dict",
									start: 16736084,
									end: 16782916
								},
								{
									filename: "/espeak-ng-data/sv_dict",
									start: 16782916,
									end: 16830752
								},
								{
									filename: "/espeak-ng-data/sw_dict",
									start: 16830752,
									end: 16878556
								},
								{
									filename: "/espeak-ng-data/ta_dict",
									start: 16878556,
									end: 17088109
								},
								{
									filename: "/espeak-ng-data/te_dict",
									start: 17088109,
									end: 17182946
								},
								{
									filename: "/espeak-ng-data/th_dict",
									start: 17182946,
									end: 17185247
								},
								{
									filename: "/espeak-ng-data/tk_dict",
									start: 17185247,
									end: 17206115
								},
								{
									filename: "/espeak-ng-data/tn_dict",
									start: 17206115,
									end: 17209187
								},
								{
									filename: "/espeak-ng-data/tr_dict",
									start: 17209187,
									end: 17255980
								},
								{
									filename: "/espeak-ng-data/tt_dict",
									start: 17255980,
									end: 17258101
								},
								{
									filename: "/espeak-ng-data/ug_dict",
									start: 17258101,
									end: 17260171
								},
								{
									filename: "/espeak-ng-data/uk_dict",
									start: 17260171,
									end: 17263663
								},
								{
									filename: "/espeak-ng-data/ur_dict",
									start: 17263663,
									end: 17397219
								},
								{
									filename: "/espeak-ng-data/uz_dict",
									start: 17397219,
									end: 17399759
								},
								{
									filename: "/espeak-ng-data/vi_dict",
									start: 17399759,
									end: 17452367
								},
								{
									filename: "/espeak-ng-data/voices/!v/Alex",
									start: 17452367,
									end: 17452495
								},
								{
									filename: "/espeak-ng-data/voices/!v/Alicia",
									start: 17452495,
									end: 17452969
								},
								{
									filename: "/espeak-ng-data/voices/!v/Andrea",
									start: 17452969,
									end: 17453326
								},
								{
									filename: "/espeak-ng-data/voices/!v/Andy",
									start: 17453326,
									end: 17453646
								},
								{
									filename: "/espeak-ng-data/voices/!v/Annie",
									start: 17453646,
									end: 17453961
								},
								{
									filename: "/espeak-ng-data/voices/!v/AnxiousAndy",
									start: 17453961,
									end: 17454322
								},
								{
									filename: "/espeak-ng-data/voices/!v/Demonic",
									start: 17454322,
									end: 17458180
								},
								{
									filename: "/espeak-ng-data/voices/!v/Denis",
									start: 17458180,
									end: 17458485
								},
								{
									filename: "/espeak-ng-data/voices/!v/Diogo",
									start: 17458485,
									end: 17458864
								},
								{
									filename: "/espeak-ng-data/voices/!v/Gene",
									start: 17458864,
									end: 17459145
								},
								{
									filename: "/espeak-ng-data/voices/!v/Gene2",
									start: 17459145,
									end: 17459428
								},
								{
									filename: "/espeak-ng-data/voices/!v/Henrique",
									start: 17459428,
									end: 17459809
								},
								{
									filename: "/espeak-ng-data/voices/!v/Hugo",
									start: 17459809,
									end: 17460187
								},
								{
									filename: "/espeak-ng-data/voices/!v/Jacky",
									start: 17460187,
									end: 17460454
								},
								{
									filename: "/espeak-ng-data/voices/!v/Lee",
									start: 17460454,
									end: 17460792
								},
								{
									filename: "/espeak-ng-data/voices/!v/Marco",
									start: 17460792,
									end: 17461259
								},
								{
									filename: "/espeak-ng-data/voices/!v/Mario",
									start: 17461259,
									end: 17461529
								},
								{
									filename: "/espeak-ng-data/voices/!v/Michael",
									start: 17461529,
									end: 17461799
								},
								{
									filename: "/espeak-ng-data/voices/!v/Mike",
									start: 17461799,
									end: 17461911
								},
								{
									filename: "/espeak-ng-data/voices/!v/Mr serious",
									start: 17461911,
									end: 17465104
								},
								{
									filename: "/espeak-ng-data/voices/!v/Nguyen",
									start: 17465104,
									end: 17465384
								},
								{
									filename: "/espeak-ng-data/voices/!v/Reed",
									start: 17465384,
									end: 17465586
								},
								{
									filename: "/espeak-ng-data/voices/!v/RicishayMax",
									start: 17465586,
									end: 17465819
								},
								{
									filename: "/espeak-ng-data/voices/!v/RicishayMax2",
									start: 17465819,
									end: 17466254
								},
								{
									filename: "/espeak-ng-data/voices/!v/RicishayMax3",
									start: 17466254,
									end: 17466689
								},
								{
									filename: "/espeak-ng-data/voices/!v/Storm",
									start: 17466689,
									end: 17467109
								},
								{
									filename: "/espeak-ng-data/voices/!v/Tweaky",
									start: 17467109,
									end: 17470298
								},
								{
									filename: "/espeak-ng-data/voices/!v/UniRobot",
									start: 17470298,
									end: 17470715
								},
								{
									filename: "/espeak-ng-data/voices/!v/adam",
									start: 17470715,
									end: 17470790
								},
								{
									filename: "/espeak-ng-data/voices/!v/anika",
									start: 17470790,
									end: 17471283
								},
								{
									filename: "/espeak-ng-data/voices/!v/anikaRobot",
									start: 17471283,
									end: 17471795
								},
								{
									filename: "/espeak-ng-data/voices/!v/announcer",
									start: 17471795,
									end: 17472095
								},
								{
									filename: "/espeak-ng-data/voices/!v/antonio",
									start: 17472095,
									end: 17472476
								},
								{
									filename: "/espeak-ng-data/voices/!v/aunty",
									start: 17472476,
									end: 17472834
								},
								{
									filename: "/espeak-ng-data/voices/!v/belinda",
									start: 17472834,
									end: 17473174
								},
								{
									filename: "/espeak-ng-data/voices/!v/benjamin",
									start: 17473174,
									end: 17473375
								},
								{
									filename: "/espeak-ng-data/voices/!v/boris",
									start: 17473375,
									end: 17473599
								},
								{
									filename: "/espeak-ng-data/voices/!v/caleb",
									start: 17473599,
									end: 17473656
								},
								{
									filename: "/espeak-ng-data/voices/!v/croak",
									start: 17473656,
									end: 17473749
								},
								{
									filename: "/espeak-ng-data/voices/!v/david",
									start: 17473749,
									end: 17473861
								},
								{
									filename: "/espeak-ng-data/voices/!v/ed",
									start: 17473861,
									end: 17474148
								},
								{
									filename: "/espeak-ng-data/voices/!v/edward",
									start: 17474148,
									end: 17474299
								},
								{
									filename: "/espeak-ng-data/voices/!v/edward2",
									start: 17474299,
									end: 17474451
								},
								{
									filename: "/espeak-ng-data/voices/!v/f1",
									start: 17474451,
									end: 17474775
								},
								{
									filename: "/espeak-ng-data/voices/!v/f2",
									start: 17474775,
									end: 17475132
								},
								{
									filename: "/espeak-ng-data/voices/!v/f3",
									start: 17475132,
									end: 17475507
								},
								{
									filename: "/espeak-ng-data/voices/!v/f4",
									start: 17475507,
									end: 17475857
								},
								{
									filename: "/espeak-ng-data/voices/!v/f5",
									start: 17475857,
									end: 17476289
								},
								{
									filename: "/espeak-ng-data/voices/!v/fast",
									start: 17476289,
									end: 17476438
								},
								{
									filename: "/espeak-ng-data/voices/!v/grandma",
									start: 17476438,
									end: 17476701
								},
								{
									filename: "/espeak-ng-data/voices/!v/grandpa",
									start: 17476701,
									end: 17476957
								},
								{
									filename: "/espeak-ng-data/voices/!v/gustave",
									start: 17476957,
									end: 17477210
								},
								{
									filename: "/espeak-ng-data/voices/!v/ian",
									start: 17477210,
									end: 17480378
								},
								{
									filename: "/espeak-ng-data/voices/!v/iven",
									start: 17480378,
									end: 17480639
								},
								{
									filename: "/espeak-ng-data/voices/!v/iven2",
									start: 17480639,
									end: 17480918
								},
								{
									filename: "/espeak-ng-data/voices/!v/iven3",
									start: 17480918,
									end: 17481180
								},
								{
									filename: "/espeak-ng-data/voices/!v/iven4",
									start: 17481180,
									end: 17481441
								},
								{
									filename: "/espeak-ng-data/voices/!v/john",
									start: 17481441,
									end: 17484627
								},
								{
									filename: "/espeak-ng-data/voices/!v/kaukovalta",
									start: 17484627,
									end: 17484988
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt",
									start: 17484988,
									end: 17485026
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt2",
									start: 17485026,
									end: 17485064
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt3",
									start: 17485064,
									end: 17485103
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt4",
									start: 17485103,
									end: 17485142
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt5",
									start: 17485142,
									end: 17485181
								},
								{
									filename: "/espeak-ng-data/voices/!v/klatt6",
									start: 17485181,
									end: 17485220
								},
								{
									filename: "/espeak-ng-data/voices/!v/linda",
									start: 17485220,
									end: 17485570
								},
								{
									filename: "/espeak-ng-data/voices/!v/m1",
									start: 17485570,
									end: 17485905
								},
								{
									filename: "/espeak-ng-data/voices/!v/m2",
									start: 17485905,
									end: 17486169
								},
								{
									filename: "/espeak-ng-data/voices/!v/m3",
									start: 17486169,
									end: 17486469
								},
								{
									filename: "/espeak-ng-data/voices/!v/m4",
									start: 17486469,
									end: 17486759
								},
								{
									filename: "/espeak-ng-data/voices/!v/m5",
									start: 17486759,
									end: 17487021
								},
								{
									filename: "/espeak-ng-data/voices/!v/m6",
									start: 17487021,
									end: 17487209
								},
								{
									filename: "/espeak-ng-data/voices/!v/m7",
									start: 17487209,
									end: 17487463
								},
								{
									filename: "/espeak-ng-data/voices/!v/m8",
									start: 17487463,
									end: 17487747
								},
								{
									filename: "/espeak-ng-data/voices/!v/marcelo",
									start: 17487747,
									end: 17487998
								},
								{
									filename: "/espeak-ng-data/voices/!v/max",
									start: 17487998,
									end: 17488223
								},
								{
									filename: "/espeak-ng-data/voices/!v/michel",
									start: 17488223,
									end: 17488627
								},
								{
									filename: "/espeak-ng-data/voices/!v/miguel",
									start: 17488627,
									end: 17489009
								},
								{
									filename: "/espeak-ng-data/voices/!v/mike2",
									start: 17489009,
									end: 17489197
								},
								{
									filename: "/espeak-ng-data/voices/!v/norbert",
									start: 17489197,
									end: 17492386
								},
								{
									filename: "/espeak-ng-data/voices/!v/pablo",
									start: 17492386,
									end: 17495528
								},
								{
									filename: "/espeak-ng-data/voices/!v/paul",
									start: 17495528,
									end: 17495812
								},
								{
									filename: "/espeak-ng-data/voices/!v/pedro",
									start: 17495812,
									end: 17496164
								},
								{
									filename: "/espeak-ng-data/voices/!v/quincy",
									start: 17496164,
									end: 17496518
								},
								{
									filename: "/espeak-ng-data/voices/!v/rob",
									start: 17496518,
									end: 17496783
								},
								{
									filename: "/espeak-ng-data/voices/!v/robert",
									start: 17496783,
									end: 17497057
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft",
									start: 17497057,
									end: 17497508
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft2",
									start: 17497508,
									end: 17497962
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft3",
									start: 17497962,
									end: 17498417
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft4",
									start: 17498417,
									end: 17498864
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft5",
									start: 17498864,
									end: 17499309
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft6",
									start: 17499309,
									end: 17499596
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft7",
									start: 17499596,
									end: 17500006
								},
								{
									filename: "/espeak-ng-data/voices/!v/robosoft8",
									start: 17500006,
									end: 17500249
								},
								{
									filename: "/espeak-ng-data/voices/!v/sandro",
									start: 17500249,
									end: 17500779
								},
								{
									filename: "/espeak-ng-data/voices/!v/shelby",
									start: 17500779,
									end: 17501059
								},
								{
									filename: "/espeak-ng-data/voices/!v/steph",
									start: 17501059,
									end: 17501423
								},
								{
									filename: "/espeak-ng-data/voices/!v/steph2",
									start: 17501423,
									end: 17501790
								},
								{
									filename: "/espeak-ng-data/voices/!v/steph3",
									start: 17501790,
									end: 17502167
								},
								{
									filename: "/espeak-ng-data/voices/!v/travis",
									start: 17502167,
									end: 17502550
								},
								{
									filename: "/espeak-ng-data/voices/!v/victor",
									start: 17502550,
									end: 17502803
								},
								{
									filename: "/espeak-ng-data/voices/!v/whisper",
									start: 17502803,
									end: 17502989
								},
								{
									filename: "/espeak-ng-data/voices/!v/whisperf",
									start: 17502989,
									end: 17503381
								},
								{
									filename: "/espeak-ng-data/voices/!v/zac",
									start: 17503381,
									end: 17503656
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-af1",
									start: 17503656,
									end: 17503744
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-af1-en",
									start: 17503744,
									end: 17503827
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ar1",
									start: 17503827,
									end: 17503911
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ar2",
									start: 17503911,
									end: 17503995
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-br1",
									start: 17503995,
									end: 17504127
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-br2",
									start: 17504127,
									end: 17504263
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-br3",
									start: 17504263,
									end: 17504395
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-br4",
									start: 17504395,
									end: 17504531
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ca1",
									start: 17504531,
									end: 17504636
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ca2",
									start: 17504636,
									end: 17504741
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-cn1",
									start: 17504741,
									end: 17504833
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-cr1",
									start: 17504833,
									end: 17504944
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-cz1",
									start: 17504944,
									end: 17505014
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-cz2",
									start: 17505014,
									end: 17505096
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de1",
									start: 17505096,
									end: 17505240
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de1-en",
									start: 17505240,
									end: 17505336
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de2",
									start: 17505336,
									end: 17505464
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de2-en",
									start: 17505464,
									end: 17505544
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de3",
									start: 17505544,
									end: 17505643
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de3-en",
									start: 17505643,
									end: 17505739
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de4",
									start: 17505739,
									end: 17505868
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de4-en",
									start: 17505868,
									end: 17505949
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de5",
									start: 17505949,
									end: 17506185
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de5-en",
									start: 17506185,
									end: 17506275
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de6",
									start: 17506275,
									end: 17506397
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de6-en",
									start: 17506397,
									end: 17506471
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de6-grc",
									start: 17506471,
									end: 17506554
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de7",
									start: 17506554,
									end: 17506704
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-de8",
									start: 17506704,
									end: 17506775
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ee1",
									start: 17506775,
									end: 17506872
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-en1",
									start: 17506872,
									end: 17507003
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-es1",
									start: 17507003,
									end: 17507117
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-es2",
									start: 17507117,
									end: 17507225
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-es3",
									start: 17507225,
									end: 17507329
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-es4",
									start: 17507329,
									end: 17507417
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr1",
									start: 17507417,
									end: 17507583
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr1-en",
									start: 17507583,
									end: 17507687
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr2",
									start: 17507687,
									end: 17507790
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr3",
									start: 17507790,
									end: 17507890
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr4",
									start: 17507890,
									end: 17508017
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr4-en",
									start: 17508017,
									end: 17508124
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr5",
									start: 17508124,
									end: 17508224
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr6",
									start: 17508224,
									end: 17508324
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-fr7",
									start: 17508324,
									end: 17508407
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-gr1",
									start: 17508407,
									end: 17508501
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-gr2",
									start: 17508501,
									end: 17508595
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-gr2-en",
									start: 17508595,
									end: 17508683
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-hb1",
									start: 17508683,
									end: 17508751
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-hb2",
									start: 17508751,
									end: 17508834
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-hu1",
									start: 17508834,
									end: 17508936
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-hu1-en",
									start: 17508936,
									end: 17509033
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ic1",
									start: 17509033,
									end: 17509121
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-id1",
									start: 17509121,
									end: 17509222
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-in1",
									start: 17509222,
									end: 17509291
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-in2",
									start: 17509291,
									end: 17509376
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ir1",
									start: 17509376,
									end: 17510129
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-it1",
									start: 17510129,
									end: 17510213
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-it2",
									start: 17510213,
									end: 17510300
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-it3",
									start: 17510300,
									end: 17510442
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-it4",
									start: 17510442,
									end: 17510587
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-jp1",
									start: 17510587,
									end: 17510658
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-jp2",
									start: 17510658,
									end: 17510759
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-jp3",
									start: 17510759,
									end: 17510846
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-la1",
									start: 17510846,
									end: 17510929
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-lt1",
									start: 17510929,
									end: 17511016
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-lt2",
									start: 17511016,
									end: 17511103
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ma1",
									start: 17511103,
									end: 17511201
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-mx1",
									start: 17511201,
									end: 17511321
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-mx2",
									start: 17511321,
									end: 17511441
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-nl1",
									start: 17511441,
									end: 17511510
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-nl2",
									start: 17511510,
									end: 17511606
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-nl2-en",
									start: 17511606,
									end: 17511697
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-nl3",
									start: 17511697,
									end: 17511782
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-nz1",
									start: 17511782,
									end: 17511850
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-pl1",
									start: 17511850,
									end: 17511949
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-pl1-en",
									start: 17511949,
									end: 17512031
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-pt1",
									start: 17512031,
									end: 17512162
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ro1",
									start: 17512162,
									end: 17512249
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-ro1-en",
									start: 17512249,
									end: 17512330
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-sw1",
									start: 17512330,
									end: 17512428
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-sw1-en",
									start: 17512428,
									end: 17512521
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-sw2",
									start: 17512521,
									end: 17512623
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-sw2-en",
									start: 17512623,
									end: 17512722
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-tl1",
									start: 17512722,
									end: 17512807
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-tr1",
									start: 17512807,
									end: 17512892
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-tr2",
									start: 17512892,
									end: 17513006
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-us1",
									start: 17513006,
									end: 17513176
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-us2",
									start: 17513176,
									end: 17513354
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-us3",
									start: 17513354,
									end: 17513534
								},
								{
									filename: "/espeak-ng-data/voices/mb/mb-vz1",
									start: 17513534,
									end: 17513678
								},
								{
									filename: "/espeak-ng-data/yue_dict",
									start: 17513678,
									end: 18077249
								}
							],
							remote_package_size: 18077249
						});
					}
				})();
				var i = Object.assign({}, r), s = [], l = "./this.program", d = (u, m) => {
					throw m;
				}, c = typeof window == "object", h = typeof importScripts == "function", f = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string", w = "";
				function v(u) {
					return r.locateFile ? r.locateFile(u, w) : w + u;
				}
				var $, k, C;
				if (f) {
					var I = Aa(), E = Aa();
					h ? w = E.dirname(w) + "/" : w = __dirname + "/", $ = (u, m) => (u = lr(u) ? new URL(u) : E.normalize(u), I.readFileSync(u, m ? void 0 : "utf8")), C = (u) => {
						var m = $(u, !0);
						return m.buffer || (m = new Uint8Array(m)), m;
					}, k = (u, m, y, x = !0) => {
						u = lr(u) ? new URL(u) : E.normalize(u), I.readFile(u, x ? void 0 : "utf8", (R, D) => {
							R ? y(R) : m(x ? D.buffer : D);
						});
					}, !r.thisProgram && process.argv.length > 1 && (l = process.argv[1].replace(/\\/g, "/")), s = process.argv.slice(2), d = (u, m) => {
						throw process.exitCode = u, m;
					}, r.inspect = () => "[Emscripten Module object]";
				} else (c || h) && (h ? w = self.location.href : typeof document < "u" && document.currentScript && (w = document.currentScript.src), e && (w = e), w.indexOf("blob:") !== 0 ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", $ = (u) => {
					var m = new XMLHttpRequest();
					return m.open("GET", u, !1), m.send(null), m.responseText;
				}, h && (C = (u) => {
					var m = new XMLHttpRequest();
					return m.open("GET", u, !1), m.responseType = "arraybuffer", m.send(null), new Uint8Array(m.response);
				}), k = (u, m, y) => {
					var x = new XMLHttpRequest();
					x.open("GET", u, !0), x.responseType = "arraybuffer", x.onload = () => {
						if (x.status == 200 || x.status == 0 && x.response) {
							m(x.response);
							return;
						}
						y();
					}, x.onerror = y, x.send(null);
				});
				var A = r.print || console.log.bind(console), z = r.printErr || console.error.bind(console);
				Object.assign(r, i), i = null, r.arguments && (s = r.arguments), r.thisProgram && (l = r.thisProgram), r.quit && (d = r.quit);
				var B;
				r.wasmBinary && (B = r.wasmBinary), typeof WebAssembly != "object" && pt("no native wasm support detected");
				var N, P = !1, T;
				function Y(u, m) {
					u || pt(m);
				}
				var X, ue, ie, K, U;
				function j() {
					var u = N.buffer;
					r.HEAP8 = X = new Int8Array(u), r.HEAP16 = ie = new Int16Array(u), r.HEAPU8 = ue = new Uint8Array(u), r.HEAPU16 = new Uint16Array(u), r.HEAP32 = K = new Int32Array(u), r.HEAPU32 = U = new Uint32Array(u), r.HEAPF32 = new Float32Array(u), r.HEAPF64 = new Float64Array(u);
				}
				var ne = [], pe = [], he = [], ge = [];
				function V() {
					if (r.preRun) for (typeof r.preRun == "function" && (r.preRun = [r.preRun]); r.preRun.length;) ee(r.preRun.shift());
					Cr(ne);
				}
				function se() {
					!r.noFSInit && !b.init.initialized && b.init(), b.ignorePermissions = !1, Cr(pe);
				}
				function ke() {
					Cr(he);
				}
				function ve() {
					if (r.postRun) for (typeof r.postRun == "function" && (r.postRun = [r.postRun]); r.postRun.length;) ot(r.postRun.shift());
					Cr(ge);
				}
				function ee(u) {
					ne.unshift(u);
				}
				function lt(u) {
					pe.unshift(u);
				}
				function ot(u) {
					ge.unshift(u);
				}
				var Pe = 0, tt = null;
				function Ye(u) {
					Pe++, r.monitorRunDependencies && r.monitorRunDependencies(Pe);
				}
				function at(u) {
					if (Pe--, r.monitorRunDependencies && r.monitorRunDependencies(Pe), Pe == 0 && tt) {
						var m = tt;
						tt = null, m();
					}
				}
				function pt(u) {
					r.onAbort && r.onAbort(u), u = "Aborted(" + u + ")", z(u), P = !0, T = 1, u += ". Build with -sASSERTIONS for more info.";
					var m = new WebAssembly.RuntimeError(u);
					throw n(m), m;
				}
				var bt = "data:application/octet-stream;base64,", Ge = (u) => u.startsWith(bt), lr = (u) => u.startsWith("file://"), dr = "piper_phonemize.wasm";
				Ge(dr) || (dr = v(dr));
				function qr(u) {
					if (u == dr && B) return new Uint8Array(B);
					if (C) return C(u);
					throw "both async and sync fetching of the wasm failed";
				}
				function Pt(u) {
					if (!B && (c || h)) {
						if (typeof fetch == "function" && !lr(u)) return fetch(u, { credentials: "same-origin" }).then((m) => {
							if (!m.ok) throw "failed to load wasm binary file at '" + u + "'";
							return m.arrayBuffer();
						}).catch(() => qr(u));
						if (k) return new Promise((m, y) => {
							k(u, (x) => m(new Uint8Array(x)), y);
						});
					}
					return Promise.resolve().then(() => qr(u));
				}
				function pr(u, m, y) {
					return Pt(u).then((x) => WebAssembly.instantiate(x, m)).then((x) => x).then(y, (x) => {
						z(`failed to asynchronously prepare wasm: ${x}`), pt(x);
					});
				}
				function bn(u, m, y, x) {
					return !u && typeof WebAssembly.instantiateStreaming == "function" && !Ge(m) && !lr(m) && !f && typeof fetch == "function" ? fetch(m, { credentials: "same-origin" }).then((R) => WebAssembly.instantiateStreaming(R, y).then(x, function(D) {
						return z(`wasm streaming compile failed: ${D}`), z("falling back to ArrayBuffer instantiation"), pr(m, y, x);
					})) : pr(m, y, x);
				}
				function Ht() {
					var u = { a: lo };
					function m(x, R) {
						return $t = x.exports, N = $t.w, j(), lt($t.x), at(), $t;
					}
					Ye();
					function y(x) {
						m(x.instance);
					}
					if (r.instantiateWasm) try {
						return r.instantiateWasm(u, m);
					} catch (x) {
						z(`Module.instantiateWasm callback failed with error: ${x}`), n(x);
					}
					return bn(B, dr, u, y).catch(n), {};
				}
				var ye, je;
				function ha(u) {
					this.name = "ExitStatus", this.message = `Program terminated with exit(${u})`, this.status = u;
				}
				var Cr = (u) => {
					for (; u.length > 0;) u.shift()(r);
				};
				r.noExitRuntime;
				var Rt = typeof TextDecoder < "u" ? new TextDecoder("utf8") : void 0, cr = (u, m, y) => {
					for (var x = m + y, R = m; u[R] && !(R >= x);) ++R;
					if (R - m > 16 && u.buffer && Rt) return Rt.decode(u.subarray(m, R));
					for (var D = ""; m < R;) {
						var L = u[m++];
						if (!(L & 128)) {
							D += String.fromCharCode(L);
							continue;
						}
						var q = u[m++] & 63;
						if ((L & 224) == 192) {
							D += String.fromCharCode((L & 31) << 6 | q);
							continue;
						}
						var J = u[m++] & 63;
						if ((L & 240) == 224 ? L = (L & 15) << 12 | q << 6 | J : L = (L & 7) << 18 | q << 12 | J << 6 | u[m++] & 63, L < 65536) D += String.fromCharCode(L);
						else {
							var _e = L - 65536;
							D += String.fromCharCode(55296 | _e >> 10, 56320 | _e & 1023);
						}
					}
					return D;
				}, Ot = (u, m) => u ? cr(ue, u, m) : "", Wr = (u, m, y, x) => {
					pt(`Assertion failed: ${Ot(u)}, at: ` + [
						m ? Ot(m) : "unknown filename",
						y,
						x ? Ot(x) : "unknown function"
					]);
				};
				function Gs(u) {
					this.excPtr = u, this.ptr = u - 24, this.set_type = function(m) {
						U[this.ptr + 4 >> 2] = m;
					}, this.get_type = function() {
						return U[this.ptr + 4 >> 2];
					}, this.set_destructor = function(m) {
						U[this.ptr + 8 >> 2] = m;
					}, this.get_destructor = function() {
						return U[this.ptr + 8 >> 2];
					}, this.set_caught = function(m) {
						m = m ? 1 : 0, X[this.ptr + 12 >> 0] = m;
					}, this.get_caught = function() {
						return X[this.ptr + 12 >> 0] != 0;
					}, this.set_rethrown = function(m) {
						m = m ? 1 : 0, X[this.ptr + 13 >> 0] = m;
					}, this.get_rethrown = function() {
						return X[this.ptr + 13 >> 0] != 0;
					}, this.init = function(m, y) {
						this.set_adjusted_ptr(0), this.set_type(m), this.set_destructor(y);
					}, this.set_adjusted_ptr = function(m) {
						U[this.ptr + 16 >> 2] = m;
					}, this.get_adjusted_ptr = function() {
						return U[this.ptr + 16 >> 2];
					}, this.get_exception_ptr = function() {
						if (Pn(this.get_type())) return U[this.excPtr >> 2];
						var m = this.get_adjusted_ptr();
						return m !== 0 ? m : this.excPtr;
					};
				}
				var jt = 0, Vs = (u, m, y) => {
					throw new Gs(u).init(m, y), jt = u, jt;
				}, vn = (u) => (K[Nn() >> 2] = u, u), Fe = {
					isAbs: (u) => u.charAt(0) === "/",
					splitPath: (u) => /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(u).slice(1),
					normalizeArray: (u, m) => {
						for (var y = 0, x = u.length - 1; x >= 0; x--) {
							var R = u[x];
							R === "." ? u.splice(x, 1) : R === ".." ? (u.splice(x, 1), y++) : y && (u.splice(x, 1), y--);
						}
						if (m) for (; y; y--) u.unshift("..");
						return u;
					},
					normalize: (u) => {
						var m = Fe.isAbs(u), y = u.substr(-1) === "/";
						return u = Fe.normalizeArray(u.split("/").filter((x) => !!x), !m).join("/"), !u && !m && (u = "."), u && y && (u += "/"), (m ? "/" : "") + u;
					},
					dirname: (u) => {
						var m = Fe.splitPath(u), y = m[0], x = m[1];
						return !y && !x ? "." : (x && (x = x.substr(0, x.length - 1)), y + x);
					},
					basename: (u) => {
						if (u === "/") return "/";
						u = Fe.normalize(u), u = u.replace(/\/$/, "");
						var m = u.lastIndexOf("/");
						return m === -1 ? u : u.substr(m + 1);
					},
					join: function() {
						var u = Array.prototype.slice.call(arguments);
						return Fe.normalize(u.join("/"));
					},
					join2: (u, m) => Fe.normalize(u + "/" + m)
				}, ga = () => {
					if (typeof crypto == "object" && typeof crypto.getRandomValues == "function") return (y) => crypto.getRandomValues(y);
					if (f) try {
						var u = Aa();
						if (u.randomFillSync) return (y) => u.randomFillSync(y);
						var m = u.randomBytes;
						return (y) => (y.set(m(y.byteLength)), y);
					} catch {}
					pt("initRandomDevice");
				}, Gr = (u) => (Gr = ga())(u), Bt = {
					resolve: function() {
						for (var u = "", m = !1, y = arguments.length - 1; y >= -1 && !m; y--) {
							var x = y >= 0 ? arguments[y] : b.cwd();
							if (typeof x != "string") throw new TypeError("Arguments to path.resolve must be strings");
							if (!x) return "";
							u = x + "/" + u, m = Fe.isAbs(x);
						}
						return u = Fe.normalizeArray(u.split("/").filter((R) => !!R), !m).join("/"), (m ? "/" : "") + u || ".";
					},
					relative: (u, m) => {
						u = Bt.resolve(u).substr(1), m = Bt.resolve(m).substr(1);
						function y(_e) {
							for (var Se = 0; Se < _e.length && _e[Se] === ""; Se++);
							for (var ae = _e.length - 1; ae >= 0 && _e[ae] === ""; ae--);
							return Se > ae ? [] : _e.slice(Se, ae - Se + 1);
						}
						for (var x = y(u.split("/")), R = y(m.split("/")), D = Math.min(x.length, R.length), L = D, q = 0; q < D; q++) if (x[q] !== R[q]) {
							L = q;
							break;
						}
						for (var J = [], q = L; q < x.length; q++) J.push("..");
						return J = J.concat(R.slice(L)), J.join("/");
					}
				}, _a = [], ya = (u) => {
					for (var m = 0, y = 0; y < u.length; ++y) {
						var x = u.charCodeAt(y);
						x <= 127 ? m++ : x <= 2047 ? m += 2 : x >= 55296 && x <= 57343 ? (m += 4, ++y) : m += 3;
					}
					return m;
				}, wa = (u, m, y, x) => {
					if (!(x > 0)) return 0;
					for (var R = y, D = y + x - 1, L = 0; L < u.length; ++L) {
						var q = u.charCodeAt(L);
						if (q >= 55296 && q <= 57343) {
							var J = u.charCodeAt(++L);
							q = 65536 + ((q & 1023) << 10) | J & 1023;
						}
						if (q <= 127) {
							if (y >= D) break;
							m[y++] = q;
						} else if (q <= 2047) {
							if (y + 1 >= D) break;
							m[y++] = 192 | q >> 6, m[y++] = 128 | q & 63;
						} else if (q <= 65535) {
							if (y + 2 >= D) break;
							m[y++] = 224 | q >> 12, m[y++] = 128 | q >> 6 & 63, m[y++] = 128 | q & 63;
						} else {
							if (y + 3 >= D) break;
							m[y++] = 240 | q >> 18, m[y++] = 128 | q >> 12 & 63, m[y++] = 128 | q >> 6 & 63, m[y++] = 128 | q & 63;
						}
					}
					return m[y] = 0, y - R;
				};
				function Vr(u, m, y) {
					var x = ya(u) + 1, R = new Array(x), D = wa(u, R, 0, R.length);
					return m && (R.length = D), R;
				}
				var Hs = () => {
					if (!_a.length) {
						var u = null;
						if (f) {
							var m = Buffer.alloc(256), y = 0, x = process.stdin.fd;
							try {
								y = I.readSync(x, m);
							} catch (R) {
								if (R.toString().includes("EOF")) y = 0;
								else throw R;
							}
							y > 0 ? u = m.slice(0, y).toString("utf-8") : u = null;
						} else typeof window < "u" && typeof window.prompt == "function" ? (u = window.prompt("Input: "), u !== null && (u += `
`)) : typeof readline == "function" && (u = readline(), u !== null && (u += `
`));
						if (!u) return null;
						_a = Vr(u, !0);
					}
					return _a.shift();
				}, Ut = {
					ttys: [],
					init() {},
					shutdown() {},
					register(u, m) {
						Ut.ttys[u] = {
							input: [],
							output: [],
							ops: m
						}, b.registerDevice(u, Ut.stream_ops);
					},
					stream_ops: {
						open(u) {
							var m = Ut.ttys[u.node.rdev];
							if (!m) throw new b.ErrnoError(43);
							u.tty = m, u.seekable = !1;
						},
						close(u) {
							u.tty.ops.fsync(u.tty);
						},
						fsync(u) {
							u.tty.ops.fsync(u.tty);
						},
						read(u, m, y, x, R) {
							if (!u.tty || !u.tty.ops.get_char) throw new b.ErrnoError(60);
							for (var D = 0, L = 0; L < x; L++) {
								var q;
								try {
									q = u.tty.ops.get_char(u.tty);
								} catch {
									throw new b.ErrnoError(29);
								}
								if (q === void 0 && D === 0) throw new b.ErrnoError(6);
								if (q == null) break;
								D++, m[y + L] = q;
							}
							return D && (u.node.timestamp = Date.now()), D;
						},
						write(u, m, y, x, R) {
							if (!u.tty || !u.tty.ops.put_char) throw new b.ErrnoError(60);
							try {
								for (var D = 0; D < x; D++) u.tty.ops.put_char(u.tty, m[y + D]);
							} catch {
								throw new b.ErrnoError(29);
							}
							return x && (u.node.timestamp = Date.now()), D;
						}
					},
					default_tty_ops: {
						get_char(u) {
							return Hs();
						},
						put_char(u, m) {
							m === null || m === 10 ? (A(cr(u.output, 0)), u.output = []) : m != 0 && u.output.push(m);
						},
						fsync(u) {
							u.output && u.output.length > 0 && (A(cr(u.output, 0)), u.output = []);
						},
						ioctl_tcgets(u) {
							return {
								c_iflag: 25856,
								c_oflag: 5,
								c_cflag: 191,
								c_lflag: 35387,
								c_cc: [
									3,
									28,
									127,
									21,
									4,
									0,
									1,
									0,
									17,
									19,
									26,
									0,
									18,
									15,
									23,
									22,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0,
									0
								]
							};
						},
						ioctl_tcsets(u, m, y) {
							return 0;
						},
						ioctl_tiocgwinsz(u) {
							return [24, 80];
						}
					},
					default_tty1_ops: {
						put_char(u, m) {
							m === null || m === 10 ? (z(cr(u.output, 0)), u.output = []) : m != 0 && u.output.push(m);
						},
						fsync(u) {
							u.output && u.output.length > 0 && (z(cr(u.output, 0)), u.output = []);
						}
					}
				}, ba = (u) => {
					pt();
				}, $e = {
					ops_table: null,
					mount(u) {
						return $e.createNode(null, "/", 16895, 0);
					},
					createNode(u, m, y, x) {
						if (b.isBlkdev(y) || b.isFIFO(y)) throw new b.ErrnoError(63);
						$e.ops_table || ($e.ops_table = {
							dir: {
								node: {
									getattr: $e.node_ops.getattr,
									setattr: $e.node_ops.setattr,
									lookup: $e.node_ops.lookup,
									mknod: $e.node_ops.mknod,
									rename: $e.node_ops.rename,
									unlink: $e.node_ops.unlink,
									rmdir: $e.node_ops.rmdir,
									readdir: $e.node_ops.readdir,
									symlink: $e.node_ops.symlink
								},
								stream: { llseek: $e.stream_ops.llseek }
							},
							file: {
								node: {
									getattr: $e.node_ops.getattr,
									setattr: $e.node_ops.setattr
								},
								stream: {
									llseek: $e.stream_ops.llseek,
									read: $e.stream_ops.read,
									write: $e.stream_ops.write,
									allocate: $e.stream_ops.allocate,
									mmap: $e.stream_ops.mmap,
									msync: $e.stream_ops.msync
								}
							},
							link: {
								node: {
									getattr: $e.node_ops.getattr,
									setattr: $e.node_ops.setattr,
									readlink: $e.node_ops.readlink
								},
								stream: {}
							},
							chrdev: {
								node: {
									getattr: $e.node_ops.getattr,
									setattr: $e.node_ops.setattr
								},
								stream: b.chrdev_stream_ops
							}
						});
						var R = b.createNode(u, m, y, x);
						return b.isDir(R.mode) ? (R.node_ops = $e.ops_table.dir.node, R.stream_ops = $e.ops_table.dir.stream, R.contents = {}) : b.isFile(R.mode) ? (R.node_ops = $e.ops_table.file.node, R.stream_ops = $e.ops_table.file.stream, R.usedBytes = 0, R.contents = null) : b.isLink(R.mode) ? (R.node_ops = $e.ops_table.link.node, R.stream_ops = $e.ops_table.link.stream) : b.isChrdev(R.mode) && (R.node_ops = $e.ops_table.chrdev.node, R.stream_ops = $e.ops_table.chrdev.stream), R.timestamp = Date.now(), u && (u.contents[m] = R, u.timestamp = R.timestamp), R;
					},
					getFileDataAsTypedArray(u) {
						return u.contents ? u.contents.subarray ? u.contents.subarray(0, u.usedBytes) : new Uint8Array(u.contents) : /* @__PURE__ */ new Uint8Array(0);
					},
					expandFileStorage(u, m) {
						var y = u.contents ? u.contents.length : 0;
						if (!(y >= m)) {
							m = Math.max(m, y * (y < 1048576 ? 2 : 1.125) >>> 0), y != 0 && (m = Math.max(m, 256));
							var x = u.contents;
							u.contents = new Uint8Array(m), u.usedBytes > 0 && u.contents.set(x.subarray(0, u.usedBytes), 0);
						}
					},
					resizeFileStorage(u, m) {
						if (u.usedBytes != m) if (m == 0) u.contents = null, u.usedBytes = 0;
						else {
							var y = u.contents;
							u.contents = new Uint8Array(m), y && u.contents.set(y.subarray(0, Math.min(m, u.usedBytes))), u.usedBytes = m;
						}
					},
					node_ops: {
						getattr(u) {
							var m = {};
							return m.dev = b.isChrdev(u.mode) ? u.id : 1, m.ino = u.id, m.mode = u.mode, m.nlink = 1, m.uid = 0, m.gid = 0, m.rdev = u.rdev, b.isDir(u.mode) ? m.size = 4096 : b.isFile(u.mode) ? m.size = u.usedBytes : b.isLink(u.mode) ? m.size = u.link.length : m.size = 0, m.atime = new Date(u.timestamp), m.mtime = new Date(u.timestamp), m.ctime = new Date(u.timestamp), m.blksize = 4096, m.blocks = Math.ceil(m.size / m.blksize), m;
						},
						setattr(u, m) {
							m.mode !== void 0 && (u.mode = m.mode), m.timestamp !== void 0 && (u.timestamp = m.timestamp), m.size !== void 0 && $e.resizeFileStorage(u, m.size);
						},
						lookup(u, m) {
							throw b.genericErrors[44];
						},
						mknod(u, m, y, x) {
							return $e.createNode(u, m, y, x);
						},
						rename(u, m, y) {
							if (b.isDir(u.mode)) {
								var x;
								try {
									x = b.lookupNode(m, y);
								} catch {}
								if (x) for (var R in x.contents) throw new b.ErrnoError(55);
							}
							delete u.parent.contents[u.name], u.parent.timestamp = Date.now(), u.name = y, m.contents[y] = u, m.timestamp = u.parent.timestamp, u.parent = m;
						},
						unlink(u, m) {
							delete u.contents[m], u.timestamp = Date.now();
						},
						rmdir(u, m) {
							for (var y in b.lookupNode(u, m).contents) throw new b.ErrnoError(55);
							delete u.contents[m], u.timestamp = Date.now();
						},
						readdir(u) {
							var m = [".", ".."];
							for (var y in u.contents) u.contents.hasOwnProperty(y) && m.push(y);
							return m;
						},
						symlink(u, m, y) {
							var x = $e.createNode(u, m, 41471, 0);
							return x.link = y, x;
						},
						readlink(u) {
							if (!b.isLink(u.mode)) throw new b.ErrnoError(28);
							return u.link;
						}
					},
					stream_ops: {
						read(u, m, y, x, R) {
							var D = u.node.contents;
							if (R >= u.node.usedBytes) return 0;
							var L = Math.min(u.node.usedBytes - R, x);
							if (L > 8 && D.subarray) m.set(D.subarray(R, R + L), y);
							else for (var q = 0; q < L; q++) m[y + q] = D[R + q];
							return L;
						},
						write(u, m, y, x, R, D) {
							if (!x) return 0;
							var L = u.node;
							if (L.timestamp = Date.now(), m.subarray && (!L.contents || L.contents.subarray)) {
								if (D) return L.contents = m.subarray(y, y + x), L.usedBytes = x, x;
								if (L.usedBytes === 0 && R === 0) return L.contents = m.slice(y, y + x), L.usedBytes = x, x;
								if (R + x <= L.usedBytes) return L.contents.set(m.subarray(y, y + x), R), x;
							}
							if ($e.expandFileStorage(L, R + x), L.contents.subarray && m.subarray) L.contents.set(m.subarray(y, y + x), R);
							else for (var q = 0; q < x; q++) L.contents[R + q] = m[y + q];
							return L.usedBytes = Math.max(L.usedBytes, R + x), x;
						},
						llseek(u, m, y) {
							var x = m;
							if (y === 1 ? x += u.position : y === 2 && b.isFile(u.node.mode) && (x += u.node.usedBytes), x < 0) throw new b.ErrnoError(28);
							return x;
						},
						allocate(u, m, y) {
							$e.expandFileStorage(u.node, m + y), u.node.usedBytes = Math.max(u.node.usedBytes, m + y);
						},
						mmap(u, m, y, x, R) {
							if (!b.isFile(u.node.mode)) throw new b.ErrnoError(43);
							var D, L, q = u.node.contents;
							if (!(R & 2) && q.buffer === X.buffer) L = !1, D = q.byteOffset;
							else {
								if ((y > 0 || y + m < q.length) && (q.subarray ? q = q.subarray(y, y + m) : q = Array.prototype.slice.call(q, y, y + m)), L = !0, D = ba(), !D) throw new b.ErrnoError(48);
								X.set(q, D);
							}
							return {
								ptr: D,
								allocated: L
							};
						},
						msync(u, m, y, x, R) {
							return $e.stream_ops.write(u, m, 0, x, y, !1), 0;
						}
					}
				}, $n = (u, m, y, x) => {
					var R = `al ${u}`;
					k(u, (D) => {
						Y(D, `Loading data file "${u}" failed (no arrayBuffer).`), m(new Uint8Array(D)), R && at();
					}, (D) => {
						if (y) y();
						else throw `Loading data file "${u}" failed.`;
					}), R && Ye();
				}, xn = (u, m, y, x, R, D) => b.createDataFile(u, m, y, x, R, D), kn = r.preloadPlugins || [], rt = (u, m, y, x) => {
					typeof Browser < "u" && Browser.init();
					var R = !1;
					return kn.forEach((D) => {
						R || D.canHandle(m) && (D.handle(u, m, y, x), R = !0);
					}), R;
				}, Sn = (u, m, y, x, R, D, L, q, J, _e) => {
					var Se = m ? Bt.resolve(Fe.join2(u, m)) : u;
					function ae(te) {
						function me(Re) {
							_e && _e(), q || xn(u, m, Re, x, R, J), D && D(), at();
						}
						rt(te, Se, me, () => {
							L && L(), at();
						}) || me(te);
					}
					Ye(), typeof y == "string" ? $n(y, (te) => ae(te), L) : ae(y);
				}, En = (u) => {
					var m = {
						r: 0,
						"r+": 2,
						w: 577,
						"w+": 578,
						a: 1089,
						"a+": 1090
					}[u];
					if (typeof m > "u") throw new Error(`Unknown file open mode: ${u}`);
					return m;
				}, Hr = (u, m) => {
					var y = 0;
					return u && (y |= 365), m && (y |= 146), y;
				}, b = {
					root: null,
					mounts: [],
					devices: {},
					streams: [],
					nextInode: 1,
					nameTable: null,
					currentPath: "/",
					initialized: !1,
					ignorePermissions: !0,
					ErrnoError: null,
					genericErrors: {},
					filesystems: null,
					syncFSRequests: 0,
					lookupPath(u, m = {}) {
						if (u = Bt.resolve(u), !u) return {
							path: "",
							node: null
						};
						if (m = Object.assign({
							follow_mount: !0,
							recurse_count: 0
						}, m), m.recurse_count > 8) throw new b.ErrnoError(32);
						for (var y = u.split("/").filter((_e) => !!_e), x = b.root, R = "/", D = 0; D < y.length; D++) {
							var L = D === y.length - 1;
							if (L && m.parent) break;
							if (x = b.lookupNode(x, y[D]), R = Fe.join2(R, y[D]), b.isMountpoint(x) && (!L || L && m.follow_mount) && (x = x.mounted.root), !L || m.follow) for (var q = 0; b.isLink(x.mode);) {
								var J = b.readlink(R);
								if (R = Bt.resolve(Fe.dirname(R), J), x = b.lookupPath(R, { recurse_count: m.recurse_count + 1 }).node, q++ > 40) throw new b.ErrnoError(32);
							}
						}
						return {
							path: R,
							node: x
						};
					},
					getPath(u) {
						for (var m;;) {
							if (b.isRoot(u)) {
								var y = u.mount.mountpoint;
								return m ? y[y.length - 1] !== "/" ? `${y}/${m}` : y + m : y;
							}
							m = m ? `${u.name}/${m}` : u.name, u = u.parent;
						}
					},
					hashName(u, m) {
						for (var y = 0, x = 0; x < m.length; x++) y = (y << 5) - y + m.charCodeAt(x) | 0;
						return (u + y >>> 0) % b.nameTable.length;
					},
					hashAddNode(u) {
						var m = b.hashName(u.parent.id, u.name);
						u.name_next = b.nameTable[m], b.nameTable[m] = u;
					},
					hashRemoveNode(u) {
						var m = b.hashName(u.parent.id, u.name);
						if (b.nameTable[m] === u) b.nameTable[m] = u.name_next;
						else for (var y = b.nameTable[m]; y;) {
							if (y.name_next === u) {
								y.name_next = u.name_next;
								break;
							}
							y = y.name_next;
						}
					},
					lookupNode(u, m) {
						var y = b.mayLookup(u);
						if (y) throw new b.ErrnoError(y, u);
						for (var x = b.hashName(u.id, m), R = b.nameTable[x]; R; R = R.name_next) {
							var D = R.name;
							if (R.parent.id === u.id && D === m) return R;
						}
						return b.lookup(u, m);
					},
					createNode(u, m, y, x) {
						var R = new b.FSNode(u, m, y, x);
						return b.hashAddNode(R), R;
					},
					destroyNode(u) {
						b.hashRemoveNode(u);
					},
					isRoot(u) {
						return u === u.parent;
					},
					isMountpoint(u) {
						return !!u.mounted;
					},
					isFile(u) {
						return (u & 61440) === 32768;
					},
					isDir(u) {
						return (u & 61440) === 16384;
					},
					isLink(u) {
						return (u & 61440) === 40960;
					},
					isChrdev(u) {
						return (u & 61440) === 8192;
					},
					isBlkdev(u) {
						return (u & 61440) === 24576;
					},
					isFIFO(u) {
						return (u & 61440) === 4096;
					},
					isSocket(u) {
						return (u & 49152) === 49152;
					},
					flagsToPermissionString(u) {
						var m = [
							"r",
							"w",
							"rw"
						][u & 3];
						return u & 512 && (m += "w"), m;
					},
					nodePermissions(u, m) {
						return b.ignorePermissions ? 0 : m.includes("r") && !(u.mode & 292) || m.includes("w") && !(u.mode & 146) || m.includes("x") && !(u.mode & 73) ? 2 : 0;
					},
					mayLookup(u) {
						return b.nodePermissions(u, "x") || (u.node_ops.lookup ? 0 : 2);
					},
					mayCreate(u, m) {
						try {
							return b.lookupNode(u, m), 20;
						} catch {}
						return b.nodePermissions(u, "wx");
					},
					mayDelete(u, m, y) {
						var x;
						try {
							x = b.lookupNode(u, m);
						} catch (D) {
							return D.errno;
						}
						var R = b.nodePermissions(u, "wx");
						if (R) return R;
						if (y) {
							if (!b.isDir(x.mode)) return 54;
							if (b.isRoot(x) || b.getPath(x) === b.cwd()) return 10;
						} else if (b.isDir(x.mode)) return 31;
						return 0;
					},
					mayOpen(u, m) {
						return u ? b.isLink(u.mode) ? 32 : b.isDir(u.mode) && (b.flagsToPermissionString(m) !== "r" || m & 512) ? 31 : b.nodePermissions(u, b.flagsToPermissionString(m)) : 44;
					},
					MAX_OPEN_FDS: 4096,
					nextfd() {
						for (var u = 0; u <= b.MAX_OPEN_FDS; u++) if (!b.streams[u]) return u;
						throw new b.ErrnoError(33);
					},
					getStreamChecked(u) {
						var m = b.getStream(u);
						if (!m) throw new b.ErrnoError(8);
						return m;
					},
					getStream: (u) => b.streams[u],
					createStream(u, m = -1) {
						return b.FSStream || (b.FSStream = function() {
							this.shared = {};
						}, b.FSStream.prototype = {}, Object.defineProperties(b.FSStream.prototype, {
							object: {
								get() {
									return this.node;
								},
								set(y) {
									this.node = y;
								}
							},
							isRead: { get() {
								return (this.flags & 2097155) !== 1;
							} },
							isWrite: { get() {
								return (this.flags & 2097155) !== 0;
							} },
							isAppend: { get() {
								return this.flags & 1024;
							} },
							flags: {
								get() {
									return this.shared.flags;
								},
								set(y) {
									this.shared.flags = y;
								}
							},
							position: {
								get() {
									return this.shared.position;
								},
								set(y) {
									this.shared.position = y;
								}
							}
						})), u = Object.assign(new b.FSStream(), u), m == -1 && (m = b.nextfd()), u.fd = m, b.streams[m] = u, u;
					},
					closeStream(u) {
						b.streams[u] = null;
					},
					chrdev_stream_ops: {
						open(u) {
							u.stream_ops = b.getDevice(u.node.rdev).stream_ops, u.stream_ops.open && u.stream_ops.open(u);
						},
						llseek() {
							throw new b.ErrnoError(70);
						}
					},
					major: (u) => u >> 8,
					minor: (u) => u & 255,
					makedev: (u, m) => u << 8 | m,
					registerDevice(u, m) {
						b.devices[u] = { stream_ops: m };
					},
					getDevice: (u) => b.devices[u],
					getMounts(u) {
						for (var m = [], y = [u]; y.length;) {
							var x = y.pop();
							m.push(x), y.push.apply(y, x.mounts);
						}
						return m;
					},
					syncfs(u, m) {
						typeof u == "function" && (m = u, u = !1), b.syncFSRequests++, b.syncFSRequests > 1 && z(`warning: ${b.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
						var y = b.getMounts(b.root.mount), x = 0;
						function R(L) {
							return b.syncFSRequests--, m(L);
						}
						function D(L) {
							if (L) return D.errored ? void 0 : (D.errored = !0, R(L));
							++x >= y.length && R(null);
						}
						y.forEach((L) => {
							if (!L.type.syncfs) return D(null);
							L.type.syncfs(L, u, D);
						});
					},
					mount(u, m, y) {
						var x = y === "/", R = !y, D;
						if (x && b.root) throw new b.ErrnoError(10);
						if (!x && !R) {
							var L = b.lookupPath(y, { follow_mount: !1 });
							if (y = L.path, D = L.node, b.isMountpoint(D)) throw new b.ErrnoError(10);
							if (!b.isDir(D.mode)) throw new b.ErrnoError(54);
						}
						var q = {
							type: u,
							opts: m,
							mountpoint: y,
							mounts: []
						}, J = u.mount(q);
						return J.mount = q, q.root = J, x ? b.root = J : D && (D.mounted = q, D.mount && D.mount.mounts.push(q)), J;
					},
					unmount(u) {
						var m = b.lookupPath(u, { follow_mount: !1 });
						if (!b.isMountpoint(m.node)) throw new b.ErrnoError(28);
						var y = m.node, x = y.mounted, R = b.getMounts(x);
						Object.keys(b.nameTable).forEach((L) => {
							for (var q = b.nameTable[L]; q;) {
								var J = q.name_next;
								R.includes(q.mount) && b.destroyNode(q), q = J;
							}
						}), y.mounted = null;
						var D = y.mount.mounts.indexOf(x);
						y.mount.mounts.splice(D, 1);
					},
					lookup(u, m) {
						return u.node_ops.lookup(u, m);
					},
					mknod(u, m, y) {
						var x = b.lookupPath(u, { parent: !0 }).node, R = Fe.basename(u);
						if (!R || R === "." || R === "..") throw new b.ErrnoError(28);
						var D = b.mayCreate(x, R);
						if (D) throw new b.ErrnoError(D);
						if (!x.node_ops.mknod) throw new b.ErrnoError(63);
						return x.node_ops.mknod(x, R, m, y);
					},
					create(u, m) {
						return m = m !== void 0 ? m : 438, m &= 4095, m |= 32768, b.mknod(u, m, 0);
					},
					mkdir(u, m) {
						return m = m !== void 0 ? m : 511, m &= 1023, m |= 16384, b.mknod(u, m, 0);
					},
					mkdirTree(u, m) {
						for (var y = u.split("/"), x = "", R = 0; R < y.length; ++R) if (y[R]) {
							x += "/" + y[R];
							try {
								b.mkdir(x, m);
							} catch (D) {
								if (D.errno != 20) throw D;
							}
						}
					},
					mkdev(u, m, y) {
						return typeof y > "u" && (y = m, m = 438), m |= 8192, b.mknod(u, m, y);
					},
					symlink(u, m) {
						if (!Bt.resolve(u)) throw new b.ErrnoError(44);
						var y = b.lookupPath(m, { parent: !0 }).node;
						if (!y) throw new b.ErrnoError(44);
						var x = Fe.basename(m), R = b.mayCreate(y, x);
						if (R) throw new b.ErrnoError(R);
						if (!y.node_ops.symlink) throw new b.ErrnoError(63);
						return y.node_ops.symlink(y, x, u);
					},
					rename(u, m) {
						var y = Fe.dirname(u), x = Fe.dirname(m), R = Fe.basename(u), D = Fe.basename(m), L = b.lookupPath(u, { parent: !0 }), q = L.node, J;
						if (L = b.lookupPath(m, { parent: !0 }), J = L.node, !q || !J) throw new b.ErrnoError(44);
						if (q.mount !== J.mount) throw new b.ErrnoError(75);
						var _e = b.lookupNode(q, R), Se = Bt.relative(u, x);
						if (Se.charAt(0) !== ".") throw new b.ErrnoError(28);
						if (Se = Bt.relative(m, y), Se.charAt(0) !== ".") throw new b.ErrnoError(55);
						var ae;
						try {
							ae = b.lookupNode(J, D);
						} catch {}
						if (_e !== ae) {
							var te = b.isDir(_e.mode), me = b.mayDelete(q, R, te);
							if (me) throw new b.ErrnoError(me);
							if (me = ae ? b.mayDelete(J, D, te) : b.mayCreate(J, D), me) throw new b.ErrnoError(me);
							if (!q.node_ops.rename) throw new b.ErrnoError(63);
							if (b.isMountpoint(_e) || ae && b.isMountpoint(ae)) throw new b.ErrnoError(10);
							if (J !== q && (me = b.nodePermissions(q, "w"), me)) throw new b.ErrnoError(me);
							b.hashRemoveNode(_e);
							try {
								q.node_ops.rename(_e, J, D);
							} catch (Re) {
								throw Re;
							} finally {
								b.hashAddNode(_e);
							}
						}
					},
					rmdir(u) {
						var m = b.lookupPath(u, { parent: !0 }).node, y = Fe.basename(u), x = b.lookupNode(m, y), R = b.mayDelete(m, y, !0);
						if (R) throw new b.ErrnoError(R);
						if (!m.node_ops.rmdir) throw new b.ErrnoError(63);
						if (b.isMountpoint(x)) throw new b.ErrnoError(10);
						m.node_ops.rmdir(m, y), b.destroyNode(x);
					},
					readdir(u) {
						var m = b.lookupPath(u, { follow: !0 }).node;
						if (!m.node_ops.readdir) throw new b.ErrnoError(54);
						return m.node_ops.readdir(m);
					},
					unlink(u) {
						var m = b.lookupPath(u, { parent: !0 }).node;
						if (!m) throw new b.ErrnoError(44);
						var y = Fe.basename(u), x = b.lookupNode(m, y), R = b.mayDelete(m, y, !1);
						if (R) throw new b.ErrnoError(R);
						if (!m.node_ops.unlink) throw new b.ErrnoError(63);
						if (b.isMountpoint(x)) throw new b.ErrnoError(10);
						m.node_ops.unlink(m, y), b.destroyNode(x);
					},
					readlink(u) {
						var m = b.lookupPath(u).node;
						if (!m) throw new b.ErrnoError(44);
						if (!m.node_ops.readlink) throw new b.ErrnoError(28);
						return Bt.resolve(b.getPath(m.parent), m.node_ops.readlink(m));
					},
					stat(u, m) {
						var y = b.lookupPath(u, { follow: !m }).node;
						if (!y) throw new b.ErrnoError(44);
						if (!y.node_ops.getattr) throw new b.ErrnoError(63);
						return y.node_ops.getattr(y);
					},
					lstat(u) {
						return b.stat(u, !0);
					},
					chmod(u, m, y) {
						var x;
						if (typeof u == "string" ? x = b.lookupPath(u, { follow: !y }).node : x = u, !x.node_ops.setattr) throw new b.ErrnoError(63);
						x.node_ops.setattr(x, {
							mode: m & 4095 | x.mode & -4096,
							timestamp: Date.now()
						});
					},
					lchmod(u, m) {
						b.chmod(u, m, !0);
					},
					fchmod(u, m) {
						var y = b.getStreamChecked(u);
						b.chmod(y.node, m);
					},
					chown(u, m, y, x) {
						var R;
						if (typeof u == "string" ? R = b.lookupPath(u, { follow: !x }).node : R = u, !R.node_ops.setattr) throw new b.ErrnoError(63);
						R.node_ops.setattr(R, { timestamp: Date.now() });
					},
					lchown(u, m, y) {
						b.chown(u, m, y, !0);
					},
					fchown(u, m, y) {
						var x = b.getStreamChecked(u);
						b.chown(x.node, m, y);
					},
					truncate(u, m) {
						if (m < 0) throw new b.ErrnoError(28);
						var y;
						if (typeof u == "string" ? y = b.lookupPath(u, { follow: !0 }).node : y = u, !y.node_ops.setattr) throw new b.ErrnoError(63);
						if (b.isDir(y.mode)) throw new b.ErrnoError(31);
						if (!b.isFile(y.mode)) throw new b.ErrnoError(28);
						var x = b.nodePermissions(y, "w");
						if (x) throw new b.ErrnoError(x);
						y.node_ops.setattr(y, {
							size: m,
							timestamp: Date.now()
						});
					},
					ftruncate(u, m) {
						var y = b.getStreamChecked(u);
						if ((y.flags & 2097155) === 0) throw new b.ErrnoError(28);
						b.truncate(y.node, m);
					},
					utime(u, m, y) {
						var x = b.lookupPath(u, { follow: !0 }).node;
						x.node_ops.setattr(x, { timestamp: Math.max(m, y) });
					},
					open(u, m, y) {
						if (u === "") throw new b.ErrnoError(44);
						m = typeof m == "string" ? En(m) : m, y = typeof y > "u" ? 438 : y, m & 64 ? y = y & 4095 | 32768 : y = 0;
						var x;
						if (typeof u == "object") x = u;
						else {
							u = Fe.normalize(u);
							try {
								x = b.lookupPath(u, { follow: !(m & 131072) }).node;
							} catch {}
						}
						var R = !1;
						if (m & 64) if (x) {
							if (m & 128) throw new b.ErrnoError(20);
						} else x = b.mknod(u, y, 0), R = !0;
						if (!x) throw new b.ErrnoError(44);
						if (b.isChrdev(x.mode) && (m &= -513), m & 65536 && !b.isDir(x.mode)) throw new b.ErrnoError(54);
						if (!R) {
							var D = b.mayOpen(x, m);
							if (D) throw new b.ErrnoError(D);
						}
						m & 512 && !R && b.truncate(x, 0), m &= -131713;
						var L = b.createStream({
							node: x,
							path: b.getPath(x),
							flags: m,
							seekable: !0,
							position: 0,
							stream_ops: x.stream_ops,
							ungotten: [],
							error: !1
						});
						return L.stream_ops.open && L.stream_ops.open(L), r.logReadFiles && !(m & 1) && (b.readFiles || (b.readFiles = {}), u in b.readFiles || (b.readFiles[u] = 1)), L;
					},
					close(u) {
						if (b.isClosed(u)) throw new b.ErrnoError(8);
						u.getdents && (u.getdents = null);
						try {
							u.stream_ops.close && u.stream_ops.close(u);
						} catch (m) {
							throw m;
						} finally {
							b.closeStream(u.fd);
						}
						u.fd = null;
					},
					isClosed(u) {
						return u.fd === null;
					},
					llseek(u, m, y) {
						if (b.isClosed(u)) throw new b.ErrnoError(8);
						if (!u.seekable || !u.stream_ops.llseek) throw new b.ErrnoError(70);
						if (y != 0 && y != 1 && y != 2) throw new b.ErrnoError(28);
						return u.position = u.stream_ops.llseek(u, m, y), u.ungotten = [], u.position;
					},
					read(u, m, y, x, R) {
						if (x < 0 || R < 0) throw new b.ErrnoError(28);
						if (b.isClosed(u)) throw new b.ErrnoError(8);
						if ((u.flags & 2097155) === 1) throw new b.ErrnoError(8);
						if (b.isDir(u.node.mode)) throw new b.ErrnoError(31);
						if (!u.stream_ops.read) throw new b.ErrnoError(28);
						var D = typeof R < "u";
						if (!D) R = u.position;
						else if (!u.seekable) throw new b.ErrnoError(70);
						var L = u.stream_ops.read(u, m, y, x, R);
						return D || (u.position += L), L;
					},
					write(u, m, y, x, R, D) {
						if (x < 0 || R < 0) throw new b.ErrnoError(28);
						if (b.isClosed(u)) throw new b.ErrnoError(8);
						if ((u.flags & 2097155) === 0) throw new b.ErrnoError(8);
						if (b.isDir(u.node.mode)) throw new b.ErrnoError(31);
						if (!u.stream_ops.write) throw new b.ErrnoError(28);
						u.seekable && u.flags & 1024 && b.llseek(u, 0, 2);
						var L = typeof R < "u";
						if (!L) R = u.position;
						else if (!u.seekable) throw new b.ErrnoError(70);
						var q = u.stream_ops.write(u, m, y, x, R, D);
						return L || (u.position += q), q;
					},
					allocate(u, m, y) {
						if (b.isClosed(u)) throw new b.ErrnoError(8);
						if (m < 0 || y <= 0) throw new b.ErrnoError(28);
						if ((u.flags & 2097155) === 0) throw new b.ErrnoError(8);
						if (!b.isFile(u.node.mode) && !b.isDir(u.node.mode)) throw new b.ErrnoError(43);
						if (!u.stream_ops.allocate) throw new b.ErrnoError(138);
						u.stream_ops.allocate(u, m, y);
					},
					mmap(u, m, y, x, R) {
						if ((x & 2) !== 0 && (R & 2) === 0 && (u.flags & 2097155) !== 2) throw new b.ErrnoError(2);
						if ((u.flags & 2097155) === 1) throw new b.ErrnoError(2);
						if (!u.stream_ops.mmap) throw new b.ErrnoError(43);
						return u.stream_ops.mmap(u, m, y, x, R);
					},
					msync(u, m, y, x, R) {
						return u.stream_ops.msync ? u.stream_ops.msync(u, m, y, x, R) : 0;
					},
					munmap: (u) => 0,
					ioctl(u, m, y) {
						if (!u.stream_ops.ioctl) throw new b.ErrnoError(59);
						return u.stream_ops.ioctl(u, m, y);
					},
					readFile(u, m = {}) {
						if (m.flags = m.flags || 0, m.encoding = m.encoding || "binary", m.encoding !== "utf8" && m.encoding !== "binary") throw new Error(`Invalid encoding type "${m.encoding}"`);
						var y, x = b.open(u, m.flags), R = b.stat(u).size, D = new Uint8Array(R);
						return b.read(x, D, 0, R, 0), m.encoding === "utf8" ? y = cr(D, 0) : m.encoding === "binary" && (y = D), b.close(x), y;
					},
					writeFile(u, m, y = {}) {
						y.flags = y.flags || 577;
						var x = b.open(u, y.flags, y.mode);
						if (typeof m == "string") {
							var R = new Uint8Array(ya(m) + 1), D = wa(m, R, 0, R.length);
							b.write(x, R, 0, D, void 0, y.canOwn);
						} else if (ArrayBuffer.isView(m)) b.write(x, m, 0, m.byteLength, void 0, y.canOwn);
						else throw new Error("Unsupported data type");
						b.close(x);
					},
					cwd: () => b.currentPath,
					chdir(u) {
						var m = b.lookupPath(u, { follow: !0 });
						if (m.node === null) throw new b.ErrnoError(44);
						if (!b.isDir(m.node.mode)) throw new b.ErrnoError(54);
						var y = b.nodePermissions(m.node, "x");
						if (y) throw new b.ErrnoError(y);
						b.currentPath = m.path;
					},
					createDefaultDirectories() {
						b.mkdir("/tmp"), b.mkdir("/home"), b.mkdir("/home/web_user");
					},
					createDefaultDevices() {
						b.mkdir("/dev"), b.registerDevice(b.makedev(1, 3), {
							read: () => 0,
							write: (x, R, D, L, q) => L
						}), b.mkdev("/dev/null", b.makedev(1, 3)), Ut.register(b.makedev(5, 0), Ut.default_tty_ops), Ut.register(b.makedev(6, 0), Ut.default_tty1_ops), b.mkdev("/dev/tty", b.makedev(5, 0)), b.mkdev("/dev/tty1", b.makedev(6, 0));
						var u = /* @__PURE__ */ new Uint8Array(1024), m = 0, y = () => (m === 0 && (m = Gr(u).byteLength), u[--m]);
						b.createDevice("/dev", "random", y), b.createDevice("/dev", "urandom", y), b.mkdir("/dev/shm"), b.mkdir("/dev/shm/tmp");
					},
					createSpecialDirectories() {
						b.mkdir("/proc");
						var u = b.mkdir("/proc/self");
						b.mkdir("/proc/self/fd"), b.mount({ mount() {
							var m = b.createNode(u, "fd", 16895, 73);
							return m.node_ops = { lookup(y, x) {
								var R = +x, D = b.getStreamChecked(R), L = {
									parent: null,
									mount: { mountpoint: "fake" },
									node_ops: { readlink: () => D.path }
								};
								return L.parent = L, L;
							} }, m;
						} }, {}, "/proc/self/fd");
					},
					createStandardStreams() {
						r.stdin ? b.createDevice("/dev", "stdin", r.stdin) : b.symlink("/dev/tty", "/dev/stdin"), r.stdout ? b.createDevice("/dev", "stdout", null, r.stdout) : b.symlink("/dev/tty", "/dev/stdout"), r.stderr ? b.createDevice("/dev", "stderr", null, r.stderr) : b.symlink("/dev/tty1", "/dev/stderr"), b.open("/dev/stdin", 0), b.open("/dev/stdout", 1), b.open("/dev/stderr", 1);
					},
					ensureErrnoError() {
						b.ErrnoError || (b.ErrnoError = function(m, y) {
							this.name = "ErrnoError", this.node = y, this.setErrno = function(x) {
								this.errno = x;
							}, this.setErrno(m), this.message = "FS error";
						}, b.ErrnoError.prototype = /* @__PURE__ */ new Error(), b.ErrnoError.prototype.constructor = b.ErrnoError, [44].forEach((u) => {
							b.genericErrors[u] = new b.ErrnoError(u), b.genericErrors[u].stack = "<generic error, no stack>";
						}));
					},
					staticInit() {
						b.ensureErrnoError(), b.nameTable = new Array(4096), b.mount($e, {}, "/"), b.createDefaultDirectories(), b.createDefaultDevices(), b.createSpecialDirectories(), b.filesystems = { MEMFS: $e };
					},
					init(u, m, y) {
						b.init.initialized = !0, b.ensureErrnoError(), r.stdin = u || r.stdin, r.stdout = m || r.stdout, r.stderr = y || r.stderr, b.createStandardStreams();
					},
					quit() {
						b.init.initialized = !1;
						for (var u = 0; u < b.streams.length; u++) {
							var m = b.streams[u];
							m && b.close(m);
						}
					},
					findObject(u, m) {
						var y = b.analyzePath(u, m);
						return y.exists ? y.object : null;
					},
					analyzePath(u, m) {
						try {
							var y = b.lookupPath(u, { follow: !m });
							u = y.path;
						} catch {}
						var x = {
							isRoot: !1,
							exists: !1,
							error: 0,
							name: null,
							path: null,
							object: null,
							parentExists: !1,
							parentPath: null,
							parentObject: null
						};
						try {
							var y = b.lookupPath(u, { parent: !0 });
							x.parentExists = !0, x.parentPath = y.path, x.parentObject = y.node, x.name = Fe.basename(u), y = b.lookupPath(u, { follow: !m }), x.exists = !0, x.path = y.path, x.object = y.node, x.name = y.node.name, x.isRoot = y.path === "/";
						} catch (R) {
							x.error = R.errno;
						}
						return x;
					},
					createPath(u, m, y, x) {
						u = typeof u == "string" ? u : b.getPath(u);
						for (var R = m.split("/").reverse(); R.length;) {
							var D = R.pop();
							if (D) {
								var L = Fe.join2(u, D);
								try {
									b.mkdir(L);
								} catch {}
								u = L;
							}
						}
						return L;
					},
					createFile(u, m, y, x, R) {
						var D = Fe.join2(typeof u == "string" ? u : b.getPath(u), m), L = Hr(x, R);
						return b.create(D, L);
					},
					createDataFile(u, m, y, x, R, D) {
						var L = m;
						u && (u = typeof u == "string" ? u : b.getPath(u), L = m ? Fe.join2(u, m) : u);
						var q = Hr(x, R), J = b.create(L, q);
						if (y) {
							if (typeof y == "string") {
								for (var _e = new Array(y.length), Se = 0, ae = y.length; Se < ae; ++Se) _e[Se] = y.charCodeAt(Se);
								y = _e;
							}
							b.chmod(J, q | 146);
							var te = b.open(J, 577);
							b.write(te, y, 0, y.length, 0, D), b.close(te), b.chmod(J, q);
						}
						return J;
					},
					createDevice(u, m, y, x) {
						var R = Fe.join2(typeof u == "string" ? u : b.getPath(u), m), D = Hr(!!y, !!x);
						b.createDevice.major || (b.createDevice.major = 64);
						var L = b.makedev(b.createDevice.major++, 0);
						return b.registerDevice(L, {
							open(q) {
								q.seekable = !1;
							},
							close(q) {
								x && x.buffer && x.buffer.length && x(10);
							},
							read(q, J, _e, Se, ae) {
								for (var te = 0, me = 0; me < Se; me++) {
									var Re;
									try {
										Re = y();
									} catch {
										throw new b.ErrnoError(29);
									}
									if (Re === void 0 && te === 0) throw new b.ErrnoError(6);
									if (Re == null) break;
									te++, J[_e + me] = Re;
								}
								return te && (q.node.timestamp = Date.now()), te;
							},
							write(q, J, _e, Se, ae) {
								for (var te = 0; te < Se; te++) try {
									x(J[_e + te]);
								} catch {
									throw new b.ErrnoError(29);
								}
								return Se && (q.node.timestamp = Date.now()), te;
							}
						}), b.mkdev(R, D, L);
					},
					forceLoadFile(u) {
						if (u.isDevice || u.isFolder || u.link || u.contents) return !0;
						if (typeof XMLHttpRequest < "u") throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
						if ($) try {
							u.contents = Vr($(u.url), !0), u.usedBytes = u.contents.length;
						} catch {
							throw new b.ErrnoError(29);
						}
						else throw new Error("Cannot load without read() or XMLHttpRequest.");
					},
					createLazyFile(u, m, y, x, R) {
						function D() {
							this.lengthKnown = !1, this.chunks = [];
						}
						if (D.prototype.get = function(te) {
							if (!(te > this.length - 1 || te < 0)) {
								var me = te % this.chunkSize, Re = te / this.chunkSize | 0;
								return this.getter(Re)[me];
							}
						}, D.prototype.setDataGetter = function(te) {
							this.getter = te;
						}, D.prototype.cacheLength = function() {
							var te = new XMLHttpRequest();
							if (te.open("HEAD", y, !1), te.send(null), !(te.status >= 200 && te.status < 300 || te.status === 304)) throw new Error("Couldn't load " + y + ". Status: " + te.status);
							var me = Number(te.getResponseHeader("Content-length")), Re, Oe = (Re = te.getResponseHeader("Accept-Ranges")) && Re === "bytes", Te = (Re = te.getResponseHeader("Content-Encoding")) && Re === "gzip", Be = 1048576;
							Oe || (Be = me);
							var H = (Ve, Xe) => {
								if (Ve > Xe) throw new Error("invalid range (" + Ve + ", " + Xe + ") or no bytes requested!");
								if (Xe > me - 1) throw new Error("only " + me + " bytes available! programmer error!");
								var Ze = new XMLHttpRequest();
								if (Ze.open("GET", y, !1), me !== Be && Ze.setRequestHeader("Range", "bytes=" + Ve + "-" + Xe), Ze.responseType = "arraybuffer", Ze.overrideMimeType && Ze.overrideMimeType("text/plain; charset=x-user-defined"), Ze.send(null), !(Ze.status >= 200 && Ze.status < 300 || Ze.status === 304)) throw new Error("Couldn't load " + y + ". Status: " + Ze.status);
								return Ze.response !== void 0 ? new Uint8Array(Ze.response || []) : Vr(Ze.responseText || "", !0);
							}, ce = this;
							ce.setDataGetter((Ve) => {
								var Xe = Ve * Be, Ze = (Ve + 1) * Be - 1;
								if (Ze = Math.min(Ze, me - 1), typeof ce.chunks[Ve] > "u" && (ce.chunks[Ve] = H(Xe, Ze)), typeof ce.chunks[Ve] > "u") throw new Error("doXHR failed!");
								return ce.chunks[Ve];
							}), (Te || !me) && (Be = me = 1, me = this.getter(0).length, Be = me, A("LazyFiles on gzip forces download of the whole file when length is accessed")), this._length = me, this._chunkSize = Be, this.lengthKnown = !0;
						}, typeof XMLHttpRequest < "u") {
							if (!h) throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
							var L = new D();
							Object.defineProperties(L, {
								length: { get: function() {
									return this.lengthKnown || this.cacheLength(), this._length;
								} },
								chunkSize: { get: function() {
									return this.lengthKnown || this.cacheLength(), this._chunkSize;
								} }
							});
							var q = {
								isDevice: !1,
								contents: L
							};
						} else var q = {
							isDevice: !1,
							url: y
						};
						var J = b.createFile(u, m, q, x, R);
						q.contents ? J.contents = q.contents : q.url && (J.contents = null, J.url = q.url), Object.defineProperties(J, { usedBytes: { get: function() {
							return this.contents.length;
						} } });
						var _e = {};
						Object.keys(J.stream_ops).forEach((ae) => {
							var te = J.stream_ops[ae];
							_e[ae] = function() {
								return b.forceLoadFile(J), te.apply(null, arguments);
							};
						});
						function Se(ae, te, me, Re, Oe) {
							var Te = ae.node.contents;
							if (Oe >= Te.length) return 0;
							var Be = Math.min(Te.length - Oe, Re);
							if (Te.slice) for (var H = 0; H < Be; H++) te[me + H] = Te[Oe + H];
							else for (var H = 0; H < Be; H++) te[me + H] = Te.get(Oe + H);
							return Be;
						}
						return _e.read = (ae, te, me, Re, Oe) => (b.forceLoadFile(J), Se(ae, te, me, Re, Oe)), _e.mmap = (ae, te, me, Re, Oe) => {
							b.forceLoadFile(J);
							var Te = ba();
							if (!Te) throw new b.ErrnoError(48);
							return Se(ae, X, Te, te, me), {
								ptr: Te,
								allocated: !0
							};
						}, J.stream_ops = _e, J;
					}
				}, Ue = {
					DEFAULT_POLLMASK: 5,
					calculateAt(u, m, y) {
						if (Fe.isAbs(m)) return m;
						var x;
						if (u === -100 ? x = b.cwd() : x = Ue.getStreamFromFD(u).path, m.length == 0) {
							if (!y) throw new b.ErrnoError(44);
							return x;
						}
						return Fe.join2(x, m);
					},
					doStat(u, m, y) {
						try {
							var x = u(m);
						} catch (q) {
							if (q && q.node && Fe.normalize(m) !== Fe.normalize(b.getPath(q.node))) return -54;
							throw q;
						}
						K[y >> 2] = x.dev, K[y + 4 >> 2] = x.mode, U[y + 8 >> 2] = x.nlink, K[y + 12 >> 2] = x.uid, K[y + 16 >> 2] = x.gid, K[y + 20 >> 2] = x.rdev, je = [x.size >>> 0, (ye = x.size, +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[y + 24 >> 2] = je[0], K[y + 28 >> 2] = je[1], K[y + 32 >> 2] = 4096, K[y + 36 >> 2] = x.blocks;
						var R = x.atime.getTime(), D = x.mtime.getTime(), L = x.ctime.getTime();
						return je = [Math.floor(R / 1e3) >>> 0, (ye = Math.floor(R / 1e3), +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[y + 40 >> 2] = je[0], K[y + 44 >> 2] = je[1], U[y + 48 >> 2] = R % 1e3 * 1e3, je = [Math.floor(D / 1e3) >>> 0, (ye = Math.floor(D / 1e3), +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[y + 56 >> 2] = je[0], K[y + 60 >> 2] = je[1], U[y + 64 >> 2] = D % 1e3 * 1e3, je = [Math.floor(L / 1e3) >>> 0, (ye = Math.floor(L / 1e3), +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[y + 72 >> 2] = je[0], K[y + 76 >> 2] = je[1], U[y + 80 >> 2] = L % 1e3 * 1e3, je = [x.ino >>> 0, (ye = x.ino, +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[y + 88 >> 2] = je[0], K[y + 92 >> 2] = je[1], 0;
					},
					doMsync(u, m, y, x, R) {
						if (!b.isFile(m.node.mode)) throw new b.ErrnoError(43);
						if (x & 2) return 0;
						var D = ue.slice(u, u + y);
						b.msync(m, D, R, y, x);
					},
					varargs: void 0,
					get() {
						var u = K[+Ue.varargs >> 2];
						return Ue.varargs += 4, u;
					},
					getp() {
						return Ue.get();
					},
					getStr(u) {
						return Ot(u);
					},
					getStreamFromFD(u) {
						return b.getStreamChecked(u);
					}
				};
				function Tn(u, m, y) {
					Ue.varargs = y;
					try {
						var x = Ue.getStreamFromFD(u);
						switch (m) {
							case 0:
								var R = Ue.get();
								if (R < 0) return -28;
								for (; b.streams[R];) R++;
								return b.createStream(x, R).fd;
							case 1:
							case 2: return 0;
							case 3: return x.flags;
							case 4:
								var R = Ue.get();
								return x.flags |= R, 0;
							case 5:
								var R = Ue.getp(), D = 0;
								return ie[R + D >> 1] = 2, 0;
							case 6:
							case 7: return 0;
							case 16:
							case 8: return -28;
							case 9: return vn(28), -1;
							default: return -28;
						}
					} catch (L) {
						if (typeof b > "u" || L.name !== "ErrnoError") throw L;
						return -L.errno;
					}
				}
				var va = (u, m, y) => wa(u, ue, m, y);
				function In(u, m, y) {
					try {
						var x = Ue.getStreamFromFD(u);
						x.getdents || (x.getdents = b.readdir(x.path));
						for (var R = 280, D = 0, L = b.llseek(x, 0, 1), q = Math.floor(L / R); q < x.getdents.length && D + R <= y;) {
							var J, _e, Se = x.getdents[q];
							if (Se === ".") J = x.node.id, _e = 4;
							else if (Se === "..") J = b.lookupPath(x.path, { parent: !0 }).node.id, _e = 4;
							else {
								var ae = b.lookupNode(x.node, Se);
								J = ae.id, _e = b.isChrdev(ae.mode) ? 2 : b.isDir(ae.mode) ? 4 : b.isLink(ae.mode) ? 10 : 8;
							}
							je = [J >>> 0, (ye = J, +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[m + D >> 2] = je[0], K[m + D + 4 >> 2] = je[1], je = [(q + 1) * R >>> 0, (ye = (q + 1) * R, +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[m + D + 8 >> 2] = je[0], K[m + D + 12 >> 2] = je[1], ie[m + D + 16 >> 1] = 280, X[m + D + 18 >> 0] = _e, va(Se, m + D + 19, 256), D += R, q += 1;
						}
						return b.llseek(x, q * R, 0), D;
					} catch (te) {
						if (typeof b > "u" || te.name !== "ErrnoError") throw te;
						return -te.errno;
					}
				}
				function zn(u, m, y) {
					Ue.varargs = y;
					try {
						var x = Ue.getStreamFromFD(u);
						switch (m) {
							case 21509: return x.tty ? 0 : -59;
							case 21505:
								if (!x.tty) return -59;
								if (x.tty.ops.ioctl_tcgets) {
									var R = x.tty.ops.ioctl_tcgets(x), ae = Ue.getp();
									K[ae >> 2] = R.c_iflag || 0, K[ae + 4 >> 2] = R.c_oflag || 0, K[ae + 8 >> 2] = R.c_cflag || 0, K[ae + 12 >> 2] = R.c_lflag || 0;
									for (var D = 0; D < 32; D++) X[ae + D + 17 >> 0] = R.c_cc[D] || 0;
									return 0;
								}
								return 0;
							case 21510:
							case 21511:
							case 21512: return x.tty ? 0 : -59;
							case 21506:
							case 21507:
							case 21508:
								if (!x.tty) return -59;
								if (x.tty.ops.ioctl_tcsets) {
									for (var ae = Ue.getp(), L = K[ae >> 2], q = K[ae + 4 >> 2], J = K[ae + 8 >> 2], _e = K[ae + 12 >> 2], Se = [], D = 0; D < 32; D++) Se.push(X[ae + D + 17 >> 0]);
									return x.tty.ops.ioctl_tcsets(x.tty, m, {
										c_iflag: L,
										c_oflag: q,
										c_cflag: J,
										c_lflag: _e,
										c_cc: Se
									});
								}
								return 0;
							case 21519:
								if (!x.tty) return -59;
								var ae = Ue.getp();
								return K[ae >> 2] = 0, 0;
							case 21520: return x.tty ? -28 : -59;
							case 21531:
								var ae = Ue.getp();
								return b.ioctl(x, m, ae);
							case 21523:
								if (!x.tty) return -59;
								if (x.tty.ops.ioctl_tiocgwinsz) {
									var te = x.tty.ops.ioctl_tiocgwinsz(x.tty), ae = Ue.getp();
									ie[ae >> 1] = te[0], ie[ae + 2 >> 1] = te[1];
								}
								return 0;
							case 21524: return x.tty ? 0 : -59;
							case 21515: return x.tty ? 0 : -59;
							default: return -28;
						}
					} catch (me) {
						if (typeof b > "u" || me.name !== "ErrnoError") throw me;
						return -me.errno;
					}
				}
				function Cn(u, m, y, x) {
					Ue.varargs = x;
					try {
						m = Ue.getStr(m), m = Ue.calculateAt(u, m);
						var R = x ? Ue.get() : 0;
						return b.open(m, y, R).fd;
					} catch (D) {
						if (typeof b > "u" || D.name !== "ErrnoError") throw D;
						return -D.errno;
					}
				}
				function An(u) {
					try {
						return u = Ue.getStr(u), b.rmdir(u), 0;
					} catch (m) {
						if (typeof b > "u" || m.name !== "ErrnoError") throw m;
						return -m.errno;
					}
				}
				function Rn(u, m) {
					try {
						return u = Ue.getStr(u), Ue.doStat(b.stat, u, m);
					} catch (y) {
						if (typeof b > "u" || y.name !== "ErrnoError") throw y;
						return -y.errno;
					}
				}
				function On(u, m, y) {
					try {
						return m = Ue.getStr(m), m = Ue.calculateAt(u, m), y === 0 ? b.unlink(m) : y === 512 ? b.rmdir(m) : pt("Invalid flags passed to unlinkat"), 0;
					} catch (x) {
						if (typeof b > "u" || x.name !== "ErrnoError") throw x;
						return -x.errno;
					}
				}
				var js = !0, vt = () => js, $a = () => {
					pt("");
				}, xa = () => Date.now(), Ks = (u, m, y) => ue.copyWithin(u, m, m + y), mr = (u) => {
					pt("OOM");
				}, Dt = (u) => {
					ue.length, mr();
				}, jr = {}, Xs = () => l || "./this.program", Ar = () => {
					if (!Ar.strings) {
						var u = {
							USER: "web_user",
							LOGNAME: "web_user",
							PATH: "/",
							PWD: "/",
							HOME: "/home/web_user",
							LANG: (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8",
							_: Xs()
						};
						for (var m in jr) jr[m] === void 0 ? delete u[m] : u[m] = jr[m];
						var y = [];
						for (var m in u) y.push(`${m}=${u[m]}`);
						Ar.strings = y;
					}
					return Ar.strings;
				}, Bn = (u, m) => {
					for (var y = 0; y < u.length; ++y) X[m++ >> 0] = u.charCodeAt(y);
					X[m >> 0] = 0;
				}, Kt = (u, m) => {
					var y = 0;
					return Ar().forEach((x, R) => {
						var D = m + y;
						U[u + R * 4 >> 2] = D, Bn(x, D), y += x.length + 1;
					}), 0;
				}, ka = (u, m) => {
					var y = Ar();
					U[u >> 2] = y.length;
					var x = 0;
					return y.forEach((R) => x += R.length + 1), U[m >> 2] = x, 0;
				}, ct = (u) => {
					T = u, d(u, new ha(u));
				}, mt = (u, m) => {
					T = u, ct(u);
				}, Sa = mt;
				function Zs(u) {
					try {
						var m = Ue.getStreamFromFD(u);
						return b.close(m), 0;
					} catch (y) {
						if (typeof b > "u" || y.name !== "ErrnoError") throw y;
						return y.errno;
					}
				}
				var Ys = (u, m, y, x) => {
					for (var R = 0, D = 0; D < y; D++) {
						var L = U[m >> 2], q = U[m + 4 >> 2];
						m += 8;
						var J = b.read(u, X, L, q, x);
						if (J < 0) return -1;
						if (R += J, J < q) break;
					}
					return R;
				};
				function Qs(u, m, y, x) {
					try {
						var R = Ys(Ue.getStreamFromFD(u), m, y);
						return U[x >> 2] = R, 0;
					} catch (D) {
						if (typeof b > "u" || D.name !== "ErrnoError") throw D;
						return D.errno;
					}
				}
				var Js = (u, m) => m + 2097152 >>> 0 < 4194305 - !!u ? (u >>> 0) + m * 4294967296 : NaN;
				function eo(u, m, y, x, R) {
					var D = Js(m, y);
					try {
						if (isNaN(D)) return 61;
						var L = Ue.getStreamFromFD(u);
						return b.llseek(L, D, x), je = [L.position >>> 0, (ye = L.position, +Math.abs(ye) >= 1 ? ye > 0 ? +Math.floor(ye / 4294967296) >>> 0 : ~~+Math.ceil((ye - +(~~ye >>> 0)) / 4294967296) >>> 0 : 0)], K[R >> 2] = je[0], K[R + 4 >> 2] = je[1], L.getdents && D === 0 && x === 0 && (L.getdents = null), 0;
					} catch (q) {
						if (typeof b > "u" || q.name !== "ErrnoError") throw q;
						return q.errno;
					}
				}
				var to = (u, m, y, x) => {
					for (var R = 0, D = 0; D < y; D++) {
						var L = U[m >> 2], q = U[m + 4 >> 2];
						m += 8;
						var J = b.write(u, X, L, q, x);
						if (J < 0) return -1;
						R += J;
					}
					return R;
				};
				function Lt(u, m, y, x) {
					try {
						var R = to(Ue.getStreamFromFD(u), m, y);
						return U[x >> 2] = R, 0;
					} catch (D) {
						if (typeof b > "u" || D.name !== "ErrnoError") throw D;
						return D.errno;
					}
				}
				var Xt = (u) => u % 4 === 0 && (u % 100 !== 0 || u % 400 === 0), ro = (u, m) => {
					for (var y = 0, x = 0; x <= m; y += u[x++]);
					return y;
				}, Ea = [
					31,
					29,
					31,
					30,
					31,
					30,
					31,
					31,
					30,
					31,
					30,
					31
				], Dn = [
					31,
					28,
					31,
					30,
					31,
					30,
					31,
					31,
					30,
					31,
					30,
					31
				], ao = (u, m) => {
					for (var y = new Date(u.getTime()); m > 0;) {
						var x = Xt(y.getFullYear()), R = y.getMonth(), D = (x ? Ea : Dn)[R];
						if (m > D - y.getDate()) m -= D - y.getDate() + 1, y.setDate(1), R < 11 ? y.setMonth(R + 1) : (y.setMonth(0), y.setFullYear(y.getFullYear() + 1));
						else return y.setDate(y.getDate() + m), y;
					}
					return y;
				}, no = (u, m) => {
					X.set(u, m);
				}, io = (u, m, y, x) => {
					var R = U[x + 40 >> 2], D = {
						tm_sec: K[x >> 2],
						tm_min: K[x + 4 >> 2],
						tm_hour: K[x + 8 >> 2],
						tm_mday: K[x + 12 >> 2],
						tm_mon: K[x + 16 >> 2],
						tm_year: K[x + 20 >> 2],
						tm_wday: K[x + 24 >> 2],
						tm_yday: K[x + 28 >> 2],
						tm_isdst: K[x + 32 >> 2],
						tm_gmtoff: K[x + 36 >> 2],
						tm_zone: R ? Ot(R) : ""
					}, L = Ot(y), q = {
						"%c": "%a %b %d %H:%M:%S %Y",
						"%D": "%m/%d/%y",
						"%F": "%Y-%m-%d",
						"%h": "%b",
						"%r": "%I:%M:%S %p",
						"%R": "%H:%M",
						"%T": "%H:%M:%S",
						"%x": "%m/%d/%y",
						"%X": "%H:%M:%S",
						"%Ec": "%c",
						"%EC": "%C",
						"%Ex": "%m/%d/%y",
						"%EX": "%H:%M:%S",
						"%Ey": "%y",
						"%EY": "%Y",
						"%Od": "%d",
						"%Oe": "%e",
						"%OH": "%H",
						"%OI": "%I",
						"%Om": "%m",
						"%OM": "%M",
						"%OS": "%S",
						"%Ou": "%u",
						"%OU": "%U",
						"%OV": "%V",
						"%Ow": "%w",
						"%OW": "%W",
						"%Oy": "%y"
					};
					for (var J in q) L = L.replace(new RegExp(J, "g"), q[J]);
					var _e = [
						"Sunday",
						"Monday",
						"Tuesday",
						"Wednesday",
						"Thursday",
						"Friday",
						"Saturday"
					], Se = [
						"January",
						"February",
						"March",
						"April",
						"May",
						"June",
						"July",
						"August",
						"September",
						"October",
						"November",
						"December"
					];
					function ae(H, ce, Ve) {
						for (var Xe = typeof H == "number" ? H.toString() : H || ""; Xe.length < ce;) Xe = Ve[0] + Xe;
						return Xe;
					}
					function te(H, ce) {
						return ae(H, ce, "0");
					}
					function me(H, ce) {
						function Ve(Ze) {
							return Ze < 0 ? -1 : Ze > 0 ? 1 : 0;
						}
						var Xe;
						return (Xe = Ve(H.getFullYear() - ce.getFullYear())) === 0 && (Xe = Ve(H.getMonth() - ce.getMonth())) === 0 && (Xe = Ve(H.getDate() - ce.getDate())), Xe;
					}
					function Re(H) {
						switch (H.getDay()) {
							case 0: return new Date(H.getFullYear() - 1, 11, 29);
							case 1: return H;
							case 2: return new Date(H.getFullYear(), 0, 3);
							case 3: return new Date(H.getFullYear(), 0, 2);
							case 4: return new Date(H.getFullYear(), 0, 1);
							case 5: return new Date(H.getFullYear() - 1, 11, 31);
							case 6: return new Date(H.getFullYear() - 1, 11, 30);
						}
					}
					function Oe(H) {
						var ce = ao(new Date(H.tm_year + 1900, 0, 1), H.tm_yday), Ve = new Date(ce.getFullYear(), 0, 4), Xe = new Date(ce.getFullYear() + 1, 0, 4), Ze = Re(Ve), Zr = Re(Xe);
						return me(Ze, ce) <= 0 ? me(Zr, ce) <= 0 ? ce.getFullYear() + 1 : ce.getFullYear() : ce.getFullYear() - 1;
					}
					var Te = {
						"%a": (H) => _e[H.tm_wday].substring(0, 3),
						"%A": (H) => _e[H.tm_wday],
						"%b": (H) => Se[H.tm_mon].substring(0, 3),
						"%B": (H) => Se[H.tm_mon],
						"%C": (H) => te((H.tm_year + 1900) / 100 | 0, 2),
						"%d": (H) => te(H.tm_mday, 2),
						"%e": (H) => ae(H.tm_mday, 2, " "),
						"%g": (H) => Oe(H).toString().substring(2),
						"%G": (H) => Oe(H),
						"%H": (H) => te(H.tm_hour, 2),
						"%I": (H) => {
							var ce = H.tm_hour;
							return ce == 0 ? ce = 12 : ce > 12 && (ce -= 12), te(ce, 2);
						},
						"%j": (H) => te(H.tm_mday + ro(Xt(H.tm_year + 1900) ? Ea : Dn, H.tm_mon - 1), 3),
						"%m": (H) => te(H.tm_mon + 1, 2),
						"%M": (H) => te(H.tm_min, 2),
						"%n": () => `
`,
						"%p": (H) => H.tm_hour >= 0 && H.tm_hour < 12 ? "AM" : "PM",
						"%S": (H) => te(H.tm_sec, 2),
						"%t": () => "	",
						"%u": (H) => H.tm_wday || 7,
						"%U": (H) => {
							var ce = H.tm_yday + 7 - H.tm_wday;
							return te(Math.floor(ce / 7), 2);
						},
						"%V": (H) => {
							var ce = Math.floor((H.tm_yday + 7 - (H.tm_wday + 6) % 7) / 7);
							if ((H.tm_wday + 371 - H.tm_yday - 2) % 7 <= 2 && ce++, ce) {
								if (ce == 53) {
									var Xe = (H.tm_wday + 371 - H.tm_yday) % 7;
									Xe != 4 && (Xe != 3 || !Xt(H.tm_year)) && (ce = 1);
								}
							} else {
								ce = 52;
								var Ve = (H.tm_wday + 7 - H.tm_yday - 1) % 7;
								(Ve == 4 || Ve == 5 && Xt(H.tm_year % 400 - 1)) && ce++;
							}
							return te(ce, 2);
						},
						"%w": (H) => H.tm_wday,
						"%W": (H) => {
							var ce = H.tm_yday + 7 - (H.tm_wday + 6) % 7;
							return te(Math.floor(ce / 7), 2);
						},
						"%y": (H) => (H.tm_year + 1900).toString().substring(2),
						"%Y": (H) => H.tm_year + 1900,
						"%z": (H) => {
							var ce = H.tm_gmtoff, Ve = ce >= 0;
							return ce = Math.abs(ce) / 60, ce = ce / 60 * 100 + ce % 60, (Ve ? "+" : "-") + ("0000" + ce).slice(-4);
						},
						"%Z": (H) => H.tm_zone,
						"%%": () => "%"
					};
					L = L.replace(/%%/g, "\0\0");
					for (var J in Te) L.includes(J) && (L = L.replace(new RegExp(J, "g"), Te[J](D)));
					L = L.replace(/\0\0/g, "%");
					var Be = Vr(L, !1);
					return Be.length > m ? 0 : (no(Be, u), Be.length - 1);
				}, so = (u, m, y, x, R) => io(u, m, y, x), oo = (u) => {
					if (u instanceof ha || u == "unwind") return T;
					d(1, u);
				}, uo = (u) => {
					var m = ya(u) + 1, y = Or(m);
					return va(u, y, m), y;
				}, Mn = function(u, m, y, x) {
					u || (u = this), this.parent = u, this.mount = u.mount, this.mounted = null, this.id = b.nextInode++, this.name = m, this.mode = y, this.node_ops = {}, this.stream_ops = {}, this.rdev = x;
				}, Kr = 365, Zt = 146;
				Object.defineProperties(Mn.prototype, {
					read: {
						get: function() {
							return (this.mode & Kr) === Kr;
						},
						set: function(u) {
							u ? this.mode |= Kr : this.mode &= ~Kr;
						}
					},
					write: {
						get: function() {
							return (this.mode & Zt) === Zt;
						},
						set: function(u) {
							u ? this.mode |= Zt : this.mode &= ~Zt;
						}
					},
					isFolder: { get: function() {
						return b.isDir(this.mode);
					} },
					isDevice: { get: function() {
						return b.isChrdev(this.mode);
					} }
				}), b.FSNode = Mn, b.createPreloadedFile = Sn, b.staticInit(), r.FS_createPath = b.createPath, r.FS_createDataFile = b.createDataFile, r.FS_createPreloadedFile = b.createPreloadedFile, r.FS_unlink = b.unlink, r.FS_createLazyFile = b.createLazyFile, r.FS_createDevice = b.createDevice;
				var lo = {
					a: Wr,
					b: Vs,
					e: Tn,
					r: In,
					v: zn,
					f: Cn,
					p: An,
					o: Rn,
					q: On,
					j: vt,
					h: $a,
					g: xa,
					k: Ks,
					n: Dt,
					s: Kt,
					t: ka,
					d: Sa,
					c: Zs,
					u: Qs,
					l: eo,
					i: Lt,
					m: so
				}, $t = Ht(), Rr = r._main = (u, m) => (Rr = r._main = $t.y)(u, m), Nn = () => (Nn = $t.z)(), Or = (u) => (Or = $t.B)(u), Pn = (u) => (Pn = $t.C)(u);
				r.addRunDependency = Ye, r.removeRunDependency = at, r.FS_createPath = b.createPath, r.FS_createLazyFile = b.createLazyFile, r.FS_createDevice = b.createDevice, r.callMain = Un, r.FS_createPreloadedFile = b.createPreloadedFile, r.FS = b, r.FS_createDataFile = b.createDataFile, r.FS_unlink = b.unlink;
				var Xr;
				tt = function u() {
					Xr || Ln(), Xr || (tt = u);
				};
				function Un(u = []) {
					var m = Rr;
					u.unshift(l);
					var y = u.length, x = Or((y + 1) * 4), R = x;
					u.forEach((L) => {
						U[R >> 2] = uo(L), R += 4;
					}), U[R >> 2] = 0;
					try {
						var D = m(y, x);
						return mt(D, !0), D;
					} catch (L) {
						return oo(L);
					}
				}
				function Ln(u = s) {
					if (Pe > 0 || (V(), Pe > 0)) return;
					function m() {
						Xr || (Xr = !0, r.calledRun = !0, !P && (se(), ke(), a(r), r.onRuntimeInitialized && r.onRuntimeInitialized(), Br && Un(u), ve()));
					}
					r.setStatus ? (r.setStatus("Running..."), setTimeout(function() {
						setTimeout(function() {
							r.setStatus("");
						}, 1), m();
					}, 1)) : m();
				}
				if (r.preInit) for (typeof r.preInit == "function" && (r.preInit = [r.preInit]); r.preInit.length > 0;) r.preInit.pop()();
				var Br = !1;
				return r.noInitialRun && (Br = !1), Ln(), t.ready;
			};
		})();
	})), y0 = ko({
		InferenceSession: () => Jn,
		TRACE: () => Jr,
		TRACE_EVENT_BEGIN: () => er,
		TRACE_EVENT_END: () => tr,
		TRACE_FUNC_BEGIN: () => kt,
		TRACE_FUNC_END: () => yt,
		Tensor: () => xt,
		default: () => Wh,
		env: () => He,
		registerBackend: () => gr
	});
	async function Eo(e = {}) {
		var t = e, r = !!globalThis.window, a = !!globalThis.WorkerGlobalScope, n = a && self.name?.startsWith("em-pthread");
		t.mountExternalData = (o, p) => {
			o.startsWith("./") && (o = o.substring(2)), (t.Xc || (t.Xc = /* @__PURE__ */ new Map())).set(o, p);
		}, t.unmountExternalData = () => {
			delete t.Xc;
		}, globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({
			initial: 0,
			maximum: 0,
			shared: !0
		}).buffer.constructor;
		let i = (o) => async (...p) => {
			try {
				if (t.Yc) throw Error("Session already started");
				let _ = t.Yc = {
					Kd: p[0],
					errors: []
				}, g = await o(...p);
				if (t.Yc !== _) throw Error("Session mismatch");
				t.dd?.flush();
				let S = _.errors;
				if (0 < S.length) {
					let O = await Promise.all(S);
					if (O = O.filter((M) => M), 0 < O.length) throw Error(O.join(`
`));
				}
				return g;
			} finally {
				t.Yc = null;
			}
		};
		t.jsepInit = (o, p) => {
			if (o === "webgpu") {
				[t.dd, t.Ad, t.Ed, t.ed, t.Dd, t.$b, t.Fd, t.Hd, t.Bd, t.Cd, t.Gd] = p;
				let _ = t.dd;
				t.jsepRegisterBuffer = (g, S, O, M) => _.registerBuffer(g, S, O, M), t.jsepGetBuffer = (g) => _.getBuffer(g), t.jsepCreateDownloader = (g, S, O) => _.createDownloader(g, S, O), t.jsepOnCreateSession = (g) => {
					_.onCreateSession(g);
				}, t.jsepOnReleaseSession = (g) => {
					_.onReleaseSession(g);
				}, t.jsepOnRunStart = (g) => _.onRunStart(g), t.Id = (g, S) => {
					_.upload(g, S);
				};
			} else if (o === "webnn") {
				let _ = p[0];
				[t.Sd, t.sd, t.webnnEnsureTensor, t.td, t.webnnDownloadTensor, t.Rd, t.webnnEnableTraceEvent] = p.slice(1), t.webnnReleaseTensorId = t.sd, t.webnnUploadTensor = t.td, t.webnnRegisterMLContext = t.Rd, t.webnnOnRunStart = (g) => _.onRunStart(g), t.webnnOnRunEnd = _.onRunEnd.bind(_), t.webnnOnReleaseSession = (g) => {
					_.onReleaseSession(g);
				}, t.webnnCreateMLTensorDownloader = (g, S) => _.createMLTensorDownloader(g, S), t.webnnRegisterMLTensor = (g, S, O, M) => _.registerMLTensor(g, S, O, M), t.webnnCreateMLContext = (g) => _.createMLContext(g), t.webnnRegisterMLConstant = (g, S, O, M, W, Q) => _.registerMLConstant(g, S, O, M, W, t.Xc, Q), t.webnnRegisterGraphInput = _.registerGraphInput.bind(_), t.webnnIsGraphInput = _.isGraphInput.bind(_), t.webnnRegisterGraphOutput = _.registerGraphOutput.bind(_), t.webnnIsGraphOutput = _.isGraphOutput.bind(_), t.webnnCreateTemporaryTensor = _.createTemporaryTensor.bind(_), t.webnnIsGraphInputOutputTypeSupported = _.isGraphInputOutputTypeSupported.bind(_);
			}
		};
		let s = () => {
			let o = (p) => (..._) => {
				let g = y;
				return _ = p(..._), y != g ? new Promise((S, O) => {
					_e = {
						resolve: S,
						reject: O
					};
				}) : _;
			};
			(() => {
				for (let p of [
					"_OrtAppendExecutionProvider",
					"_OrtCreateSession",
					"_OrtRun",
					"_OrtRunWithBinding",
					"_OrtBindInput"
				]) t[p] = o(t[p]);
			})(), i !== void 0 && (t._OrtRun = i(t._OrtRun), t._OrtRunWithBinding = i(t._OrtRunWithBinding)), s = void 0;
		};
		t.asyncInit = () => {
			s?.();
		};
		var l, d, c = (o, p) => {
			throw p;
		}, h = self.location.href, f = "";
		if (r || a) {
			try {
				f = new URL(".", h).href;
			} catch {}
			a && (d = (o) => {
				var p = new XMLHttpRequest();
				return p.open("GET", o, !1), p.responseType = "arraybuffer", p.send(null), new Uint8Array(p.response);
			}), l = async (o) => {
				if (P(o)) return new Promise((_, g) => {
					var S = new XMLHttpRequest();
					S.open("GET", o, !0), S.responseType = "arraybuffer", S.onload = () => {
						S.status == 200 || S.status == 0 && S.response ? _(S.response) : g(S.status);
					}, S.onerror = g, S.send(null);
				});
				var p = await fetch(o, { credentials: "same-origin" });
				if (p.ok) return p.arrayBuffer();
				throw Error(p.status + " : " + p.url);
			};
		}
		var w, v, $, k, C, I, E = console.log.bind(console), A = console.error.bind(console), z = E, B = A, N = !1, P = (o) => o.startsWith("file://");
		function T() {
			Rt.buffer != X.buffer && ke();
		}
		if (n) {
			let o = function(p) {
				try {
					var _ = p.data, g = _.Sc;
					if (g === "load") {
						let S = [];
						self.onmessage = (O) => S.push(O), I = () => {
							postMessage({ Sc: "loaded" });
							for (let O of S) o(O);
							self.onmessage = o;
						};
						for (let O of _.xd) t[O] && !t[O].proxy || (t[O] = (...M) => {
							postMessage({
								Sc: "callHandler",
								wd: O,
								args: M
							});
						}, O == "print" && (z = t[O]), O == "printErr" && (B = t[O]));
						Rt = _.Od, ke(), v = _.Pd, ot(), Gn();
					} else if (g === "run") {
						(function(S) {
							var O = (T(), j)[S + 52 >>> 2 >>> 0];
							S = (T(), j)[S + 56 >>> 2 >>> 0], xg(O, O - S), Ee(O);
						})(_.Rc), fo(_.Rc, 0, 0, 1, 0, 0), je(), $t(_.Rc), Y || (_g(), Y = !0);
						try {
							cr(_.Md, _.bd);
						} catch (S) {
							if (S != "unwind") throw S;
						}
					} else _.target !== "setimmediate" && (g === "checkMailbox" ? Y && Rr() : g && (B(`worker: received unknown command ${g}`), B(_)));
				} catch (S) {
					throw yg(), S;
				}
			};
			var Y = !1;
			self.onunhandledrejection = (p) => {
				throw p.reason || p;
			}, self.onmessage = o;
		}
		var X, ue, ie, K, U, j, ne, pe, he, ge, V, se = !1;
		function ke() {
			var o = Rt.buffer;
			t.HEAP8 = X = new Int8Array(o), ie = new Int16Array(o), t.HEAPU8 = ue = new Uint8Array(o), K = new Uint16Array(o), t.HEAP32 = U = new Int32Array(o), t.HEAPU32 = j = new Uint32Array(o), ne = new Float32Array(o), pe = new Float64Array(o), he = new BigInt64Array(o), ge = new BigUint64Array(o);
		}
		function ve() {
			se = !0, n ? I() : Yt.sb();
		}
		function ee(o) {
			throw B(o = "Aborted(" + o + ")"), N = !0, o = new WebAssembly.RuntimeError(o + ". Build with -sASSERTIONS for more info."), C?.(o), o;
		}
		function lt() {
			return { a: {
				ma: h_,
				gb: f_,
				g: Gs,
				J: Vs,
				f: Bt,
				o: _a,
				h: ya,
				ha: wa,
				b: Vr,
				T: Hs,
				Ha: ba,
				n: $e,
				$: Sn,
				Xa: En,
				Da: Hr,
				Fa: b,
				Ya: Ue,
				Va: Tn,
				Oa: va,
				Ua: In,
				ka: zn,
				Ea: Cn,
				Ba: An,
				Wa: Rn,
				Ca: On,
				bb: js,
				ea: Xs,
				wa: Ar,
				ua: Ys,
				da: Js,
				O: eo,
				H: to,
				va: ro,
				_: uo,
				xa: Mn,
				Ra: Kr,
				za: Nn,
				Ia: Pn,
				sa: Xr,
				fa: Un,
				Qa: $t,
				_a: Ln,
				R: te,
				r: ce,
				c: ka,
				hb: Ve,
				y: Xe,
				M: Ze,
				D: Zr,
				l: U0,
				s: eg,
				ib: L0,
				I: F0,
				S: q0,
				j: W0,
				u: G0,
				q: V0,
				k: H0,
				La: j0,
				Ma: K0,
				Na: X0,
				Ja: ng,
				Ka: ig,
				ta: sg,
				db: Y0,
				ab: e_,
				v: t_,
				aa: r_,
				ga: a_,
				$a: Q0,
				W: n_,
				Za: i_,
				Aa: s_,
				F: Z0,
				U: o_,
				la: qn,
				ya: l_,
				fb: u_,
				eb: d_,
				Sa: dg,
				Ta: pg,
				Ga: qr,
				V: cg,
				ja: mg,
				Pa: fg,
				ia: hg,
				kb: Y_,
				na: H_,
				lb: Z_,
				oa: V_,
				G: M_,
				e: w_,
				t: __,
				w: g_,
				B: z_,
				mb: q_,
				K: O_,
				x: $_,
				pa: W_,
				Y: j_,
				ba: F_,
				nb: L_,
				ob: U_,
				P: C_,
				qa: P_,
				pb: N_,
				N: B_,
				Z: G_,
				d: y_,
				A: v_,
				m: b_,
				jb: Q_,
				p: k_,
				z: S_,
				C: x_,
				E: E_,
				L: A_,
				qb: D_,
				Q: K_,
				ca: R_,
				X: X_,
				rb: I_,
				ra: T_,
				i: c_,
				a: Rt,
				cb: lr
			} };
		}
		async function ot() {
			function o(g, S) {
				var O = Yt = g.exports;
				g = {};
				for (let [M, W] of Object.entries(O)) typeof W == "function" ? (O = u(W), g[M] = O) : g[M] = W;
				return Yt = g, Yt = (function() {
					var M = Yt, W = (re) => (xe) => re(xe) >>> 0, Q = (re) => () => re() >>> 0;
					return (M = Object.assign({}, M)).tb = W(M.tb), M.Xb = Q(M.Xb), M.Zb = W(M.Zb), M.lc = W(M.lc), M.mc = Q(M.mc), M.qc = W(M.qc), M;
				})(), bn.push(Yt._b), gg = (g = Yt).tb, _g = g.ub, t._OrtInit = g.vb, t._OrtGetLastError = g.wb, t._OrtCreateSessionOptions = g.xb, t._OrtAppendExecutionProvider = g.yb, t._OrtAddFreeDimensionOverride = g.zb, t._OrtAddSessionConfigEntry = g.Ab, t._OrtReleaseSessionOptions = g.Bb, t._OrtCreateSession = g.Cb, t._OrtReleaseSession = g.Db, t._OrtGetInputOutputCount = g.Eb, t._OrtGetInputOutputMetadata = g.Fb, t._OrtFree = g.Gb, t._OrtCreateTensor = g.Hb, t._OrtGetTensorData = g.Ib, t._OrtReleaseTensor = g.Jb, t._OrtCreateRunOptions = g.Kb, t._OrtAddRunConfigEntry = g.Lb, t._OrtReleaseRunOptions = g.Mb, t._OrtCreateBinding = g.Nb, t._OrtBindInput = g.Ob, t._OrtBindOutput = g.Pb, t._OrtClearBoundOutputs = g.Qb, t._OrtReleaseBinding = g.Rb, t._OrtRunWithBinding = g.Sb, t._OrtRun = g.Tb, t._OrtEndProfiling = g.Ub, t._JsepOutput = g.Vb, t._JsepGetNodeName = g.Wb, Wn = g.Xb, Ft = t._free = g.Yb, Ia = t._malloc = g.Zb, fo = g.ac, yg = g.bc, wg = g.cc, bg = g.dc, ho = g.ec, vg = g.fc, $g = g.gc, ze = g.hc, za = g.ic, xg = g.jc, Ee = g.kc, go = g.lc, Ie = g.mc, kg = g.nc, _o = g.oc, Sg = g.pc, Eg = g.qc, Tg = g.rc, yo = g.sc, Ig = g.tc, zg = g.uc, Cg = g.vc, Ag = g.wc, Rg = g.xc, Og = g.yc, Bg = g.zc, Dg = g.Ac, Mg = g.Bc, Ng = g.Cc, Pg = g.Dc, Ug = g.Ec, Lg = g.Fc, Fg = g.Gc, qg = g.Hc, Wg = g.Ic, Gg = g.Jc, Vg = g.Kc, Hg = g.Lc, jg = g.Mc, Kg = g.Nc, Xg = g.Pc, Zg = g.Qc, Yg = g.$c, Qg = g.ad, Jg = g.fd, e0 = g.jd, t0 = g.kd, r0 = g.ld, a0 = g.md, n0 = g.nd, i0 = g.od, s0 = g.pd, o0 = g.qd, u0 = g.vd, l0 = g.Td, d0 = g.Ud, p0 = g.Vd, c0 = g.Wd, v = S, Yt;
			}
			var p, _ = lt();
			return t.instantiateWasm ? new Promise((g) => {
				t.instantiateWasm(_, (S, O) => {
					g(o(S, O));
				});
			}) : n ? o(new WebAssembly.Instance(v, lt()), v) : (V ??= t.locateFile ? t.locateFile ? t.locateFile("ort-wasm-simd-threaded.jsep.wasm", f) : f + "ort-wasm-simd-threaded.jsep.wasm" : new URL("/quizletapp/assets/ort-wasm-simd-threaded.jsep-DC5y_g6C.wasm", "" + self.location.href).href, p = await (async function(g) {
				var S = V;
				if (!w && !P(S)) try {
					var O = fetch(S, { credentials: "same-origin" });
					return await WebAssembly.instantiateStreaming(O, g);
				} catch (M) {
					B(`wasm streaming compile failed: ${M}`), B("falling back to ArrayBuffer instantiation");
				}
				return (async function(M, W) {
					try {
						var Q = await (async function(re) {
							if (!w) try {
								var xe = await l(re);
								return new Uint8Array(xe);
							} catch {}
							if (re == V && w) re = new Uint8Array(w);
							else {
								if (!d) throw "both async and sync fetching of the wasm failed";
								re = d(re);
							}
							return re;
						})(M);
						return await WebAssembly.instantiate(Q, W);
					} catch (re) {
						B(`failed to asynchronously prepare wasm: ${re}`), ee(re);
					}
				})(S, g);
			})(_), o(p.instance, p.module));
		}
		class Pe {
			name = "ExitStatus";
			constructor(p) {
				this.message = `Program terminated with exit(${p})`, this.status = p;
			}
		}
		var tt = (o) => {
			o.terminate(), o.onmessage = () => {};
		}, Ae = [], Ye = 0, at = null, pt = (o) => {
			Pt.length == 0 && (Cr(), ha(Pt[0]));
			var p = Pt.pop();
			if (!p) return 6;
			pr.push(p), Ht[o.Rc] = p, p.Rc = o.Rc;
			var _ = {
				Sc: "run",
				Md: o.Ld,
				bd: o.bd,
				Rc: o.Rc
			};
			return p.postMessage(_, o.rd), 0;
		}, bt = 0, Ge = (o, p, ..._) => {
			var g, S = 16 * _.length, O = Ie(), M = go(S), W = M >>> 3;
			for (g of _) typeof g == "bigint" ? ((T(), he)[W++ >>> 0] = 1n, (T(), he)[W++ >>> 0] = g) : ((T(), he)[W++ >>> 0] = 0n, (T(), pe)[W++ >>> 0] = g);
			return o = wg(o, 0, S, M, p), Ee(O), o;
		};
		function lr(o) {
			if (n) return Ge(0, 1, o);
			if ($ = o, !(0 < bt)) {
				for (var p of pr) tt(p);
				for (p of Pt) tt(p);
				Pt = [], pr = [], Ht = {}, N = !0;
			}
			c(0, new Pe(o));
		}
		function dr(o) {
			if (n) return Ge(1, 0, o);
			qr(o);
		}
		var qr = (o) => {
			if ($ = o, n) throw dr(o), "unwind";
			lr(o);
		}, Pt = [], pr = [], bn = [], Ht = {}, ye = (o) => {
			var p = o.Rc;
			delete Ht[p], Pt.push(o), pr.splice(pr.indexOf(o), 1), o.Rc = 0, bg(p);
		};
		function je() {
			bn.forEach((o) => o());
		}
		var ha = (o) => new Promise((p) => {
			o.onmessage = (S) => {
				var O = S.data;
				if (S = O.Sc, O.Zc && O.Zc != Wn()) {
					var M = Ht[O.Zc];
					M ? M.postMessage(O, O.rd) : B(`Internal error! Worker sent a message "${S}" to target pthread ${O.Zc}, but that thread no longer exists!`);
				} else S === "checkMailbox" ? Rr() : S === "spawnThread" ? pt(O) : S === "cleanupThread" ? Zt(() => {
					ye(Ht[O.Nd]);
				}) : S === "loaded" ? (o.loaded = !0, p(o)) : O.target === "setimmediate" ? o.postMessage(O) : S === "uncaughtException" ? o.onerror(O.error) : S === "callHandler" ? t[O.wd](...O.args) : S && B(`worker sent an unknown command ${S}`);
			}, o.onerror = (S) => {
				throw B(`worker sent an error! ${S.filename}:${S.lineno}: ${S.message}`), S;
			};
			var _, g = [];
			for (_ of []) t.propertyIsEnumerable(_) && g.push(_);
			o.postMessage({
				Sc: "load",
				xd: g,
				Od: Rt,
				Pd: v
			});
		});
		function Cr() {
			var o = new Worker((() => {
				let p = URL;
				return self.location.href > "file:" && self.location.href < "file;" ? new p("ort.bundle.min.mjs", self.location.href) : new URL(self.location.href);
			})(), {
				type: "module",
				workerData: "em-pthread",
				name: "em-pthread"
			});
			Pt.push(o);
		}
		var Rt, cr = (o, p) => {
			bt = 0, o = yo(o, p), 0 < bt ? $ = o : ho(o);
		}, Ot = [], Wr = 0;
		function Gs(o) {
			var p = new ga(o >>>= 0);
			return (T(), X)[p.Tc + 12 >>> 0] == 0 && (vn(p, !0), Wr--), Fe(p, !1), Ot.push(p), Eg(o);
		}
		var jt = 0, Vs = () => {
			ze(0, 0);
			var o = Ot.pop();
			kg(o.cd), jt = 0;
		};
		function vn(o, p) {
			p = p ? 1 : 0, (T(), X)[o.Tc + 12 >>> 0] = p;
		}
		function Fe(o, p) {
			p = p ? 1 : 0, (T(), X)[o.Tc + 13 >>> 0] = p;
		}
		class ga {
			constructor(p) {
				this.cd = p, this.Tc = p - 24;
			}
		}
		var Gr = (o) => {
			var p = jt;
			if (!p) return za(0), 0;
			var _ = new ga(p);
			(T(), j)[_.Tc + 16 >>> 2 >>> 0] = p;
			var g = (T(), j)[_.Tc + 4 >>> 2 >>> 0];
			if (!g) return za(0), p;
			for (var S of o) {
				if (S === 0 || S === g) break;
				if (Sg(S, g, _.Tc + 16)) return za(S), p;
			}
			return za(g), p;
		};
		function Bt() {
			return Gr([]);
		}
		function _a(o) {
			return Gr([o >>> 0]);
		}
		function ya(o, p, _, g) {
			return Gr([
				o >>> 0,
				p >>> 0,
				_ >>> 0,
				g >>> 0
			]);
		}
		var wa = () => {
			var o = Ot.pop();
			o || ee("no exception to throw");
			var p = o.cd;
			throw (T(), X)[o.Tc + 13 >>> 0] == 0 && (Ot.push(o), Fe(o, !0), vn(o, !1), Wr++), _o(p), jt = p;
		};
		function Vr(o, p, _) {
			var g = new ga(o >>>= 0);
			throw p >>>= 0, _ >>>= 0, (T(), j)[g.Tc + 16 >>> 2 >>> 0] = 0, (T(), j)[g.Tc + 4 >>> 2 >>> 0] = p, (T(), j)[g.Tc + 8 >>> 2 >>> 0] = _, _o(o), Wr++, jt = o;
		}
		var Hs = () => Wr;
		function Ut(o, p, _, g) {
			return n ? Ge(2, 1, o, p, _, g) : ba(o, p, _, g);
		}
		function ba(o, p, _, g) {
			if (o >>>= 0, p >>>= 0, _ >>>= 0, g >>>= 0, !globalThis.SharedArrayBuffer) return 6;
			var S = [];
			return n && S.length === 0 ? Ut(o, p, _, g) : (o = {
				Ld: _,
				Rc: o,
				bd: g,
				rd: S
			}, n ? (o.Sc = "spawnThread", postMessage(o, S), 0) : pt(o));
		}
		function $e(o) {
			throw jt ||= o >>> 0, jt;
		}
		var $n = globalThis.TextDecoder && new TextDecoder(), xn = (o, p, _, g) => {
			if (_ = p + _, g) return _;
			for (; o[p] && !(p >= _);) ++p;
			return p;
		}, kn = (o, p = 0, _, g) => {
			if (16 < (_ = xn(o, p >>>= 0, _, g)) - p && o.buffer && $n) return $n.decode(o.buffer instanceof ArrayBuffer ? o.subarray(p, _) : o.slice(p, _));
			for (g = ""; p < _;) {
				var S = o[p++];
				if (128 & S) {
					var O = 63 & o[p++];
					if ((224 & S) == 192) g += String.fromCharCode((31 & S) << 6 | O);
					else {
						var M = 63 & o[p++];
						65536 > (S = (240 & S) == 224 ? (15 & S) << 12 | O << 6 | M : (7 & S) << 18 | O << 12 | M << 6 | 63 & o[p++]) ? g += String.fromCharCode(S) : (S -= 65536, g += String.fromCharCode(55296 | S >> 10, 56320 | 1023 & S));
					}
				} else g += String.fromCharCode(S);
			}
			return g;
		}, rt = (o, p, _) => (o >>>= 0) ? kn((T(), ue), o, p, _) : "";
		function Sn(o, p, _) {
			return n ? Ge(3, 1, o, p, _) : 0;
		}
		function En(o, p) {
			if (n) return Ge(4, 1, o, p);
		}
		function Hr(o, p) {
			if (n) return Ge(5, 1, o, p);
		}
		function b(o, p, _) {
			if (n) return Ge(6, 1, o, p, _);
		}
		function Ue(o, p, _) {
			return n ? Ge(7, 1, o, p, _) : 0;
		}
		function Tn(o, p) {
			if (n) return Ge(8, 1, o, p);
		}
		function va(o, p, _) {
			if (n) return Ge(9, 1, o, p, _);
		}
		function In(o, p, _, g) {
			if (n) return Ge(10, 1, o, p, _, g);
		}
		function zn(o, p, _, g) {
			if (n) return Ge(11, 1, o, p, _, g);
		}
		function Cn(o, p, _, g) {
			if (n) return Ge(12, 1, o, p, _, g);
		}
		function An(o) {
			if (n) return Ge(13, 1, o);
		}
		function Rn(o, p) {
			if (n) return Ge(14, 1, o, p);
		}
		function On(o, p, _) {
			if (n) return Ge(15, 1, o, p, _);
		}
		var js = () => ee(""), vt = (o) => {
			o >>>= 0;
			for (var p = "";;) {
				var _ = (T(), ue)[o++ >>> 0];
				if (!_) return p;
				p += String.fromCharCode(_);
			}
		}, $a = {}, xa = {}, Ks = {}, mr = class extends Error {
			constructor(o) {
				super(o), this.name = "BindingError";
			}
		};
		function Dt(o, p, _ = {}) {
			return (function(g, S, O = {}) {
				var M = S.name;
				if (!g) throw new mr(`type "${M}" must have a positive integer typeid pointer`);
				if (xa.hasOwnProperty(g)) {
					if (O.yd) return;
					throw new mr(`Cannot register type '${M}' twice`);
				}
				xa[g] = S, delete Ks[g], $a.hasOwnProperty(g) && (S = $a[g], delete $a[g], S.forEach((W) => W()));
			})(o, p, _);
		}
		var jr = (o, p, _) => {
			switch (p) {
				case 1: return _ ? (g) => (T(), X)[g >>> 0] : (g) => (T(), ue)[g >>> 0];
				case 2: return _ ? (g) => (T(), ie)[g >>> 1 >>> 0] : (g) => (T(), K)[g >>> 1 >>> 0];
				case 4: return _ ? (g) => (T(), U)[g >>> 2 >>> 0] : (g) => (T(), j)[g >>> 2 >>> 0];
				case 8: return _ ? (g) => (T(), he)[g >>> 3 >>> 0] : (g) => (T(), ge)[g >>> 3 >>> 0];
				default: throw new TypeError(`invalid integer width (${p}): ${o}`);
			}
		};
		function Xs(o, p, _, g, S) {
			o >>>= 0, _ >>>= 0, p = vt(p >>> 0);
			let O = (M) => M;
			if (g = g === 0n) {
				let M = 8 * _;
				O = (W) => BigInt.asUintN(M, W), S = O(S);
			}
			Dt(o, {
				name: p,
				Oc: O,
				Vc: (M, W) => (typeof W == "number" && (W = BigInt(W)), W),
				Uc: jr(p, _, !g),
				Wc: null
			});
		}
		function Ar(o, p, _, g) {
			Dt(o >>>= 0, {
				name: p = vt(p >>> 0),
				Oc: function(S) {
					return !!S;
				},
				Vc: function(S, O) {
					return O ? _ : g;
				},
				Uc: function(S) {
					return this.Oc((T(), ue)[S >>> 0]);
				},
				Wc: null
			});
		}
		var Bn = [], Kt = [
			0,
			1,
			,
			1,
			null,
			1,
			!0,
			1,
			!1,
			1
		];
		function ka(o) {
			9 < (o >>>= 0) && --Kt[o + 1] === 0 && (Kt[o] = void 0, Bn.push(o));
		}
		var ct = (o) => {
			if (!o) throw new mr(`Cannot use deleted val. handle = ${o}`);
			return Kt[o];
		}, mt = (o) => {
			switch (o) {
				case void 0: return 2;
				case null: return 4;
				case !0: return 6;
				case !1: return 8;
				default:
					let p = Bn.pop() || Kt.length;
					return Kt[p] = o, Kt[p + 1] = 1, p;
			}
		};
		function Sa(o) {
			return this.Oc((T(), j)[o >>> 2 >>> 0]);
		}
		var Zs = {
			name: "emscripten::val",
			Oc: (o) => {
				var p = ct(o);
				return ka(o), p;
			},
			Vc: (o, p) => mt(p),
			Uc: Sa,
			Wc: null
		};
		function Ys(o) {
			return Dt(o >>> 0, Zs);
		}
		var Qs = (o, p) => {
			switch (p) {
				case 4: return function(_) {
					return this.Oc((T(), ne)[_ >>> 2 >>> 0]);
				};
				case 8: return function(_) {
					return this.Oc((T(), pe)[_ >>> 3 >>> 0]);
				};
				default: throw new TypeError(`invalid float width (${p}): ${o}`);
			}
		};
		function Js(o, p, _) {
			_ >>>= 0, Dt(o >>>= 0, {
				name: p = vt(p >>> 0),
				Oc: (g) => g,
				Vc: (g, S) => S,
				Uc: Qs(p, _),
				Wc: null
			});
		}
		function eo(o, p, _, g, S) {
			o >>>= 0, _ >>>= 0, p = vt(p >>> 0);
			let O = (W) => W;
			if (g === 0) {
				var M = 32 - 8 * _;
				O = (W) => W << M >>> M, S = O(S);
			}
			Dt(o, {
				name: p,
				Oc: O,
				Vc: (W, Q) => Q,
				Uc: jr(p, _, g !== 0),
				Wc: null
			});
		}
		function to(o, p, _) {
			function g(O) {
				var M = (T(), j)[O >>> 2 >>> 0];
				return O = (T(), j)[O + 4 >>> 2 >>> 0], new S((T(), X).buffer, O, M);
			}
			var S = [
				Int8Array,
				Uint8Array,
				Int16Array,
				Uint16Array,
				Int32Array,
				Uint32Array,
				Float32Array,
				Float64Array,
				BigInt64Array,
				BigUint64Array
			][p];
			Dt(o >>>= 0, {
				name: _ = vt(_ >>> 0),
				Oc: g,
				Uc: g
			}, { yd: !0 });
		}
		var Lt = (o, p, _) => {
			var g = (T(), ue);
			if (p >>>= 0, 0 < _) {
				var S = p;
				_ = p + _ - 1;
				for (var O = 0; O < o.length; ++O) {
					var M = o.codePointAt(O);
					if (127 >= M) {
						if (p >= _) break;
						g[p++ >>> 0] = M;
					} else if (2047 >= M) {
						if (p + 1 >= _) break;
						g[p++ >>> 0] = 192 | M >> 6, g[p++ >>> 0] = 128 | 63 & M;
					} else if (65535 >= M) {
						if (p + 2 >= _) break;
						g[p++ >>> 0] = 224 | M >> 12, g[p++ >>> 0] = 128 | M >> 6 & 63, g[p++ >>> 0] = 128 | 63 & M;
					} else {
						if (p + 3 >= _) break;
						g[p++ >>> 0] = 240 | M >> 18, g[p++ >>> 0] = 128 | M >> 12 & 63, g[p++ >>> 0] = 128 | M >> 6 & 63, g[p++ >>> 0] = 128 | 63 & M, O++;
					}
				}
				g[p >>> 0] = 0, o = p - S;
			} else o = 0;
			return o;
		}, Xt = (o) => {
			for (var p = 0, _ = 0; _ < o.length; ++_) {
				var g = o.charCodeAt(_);
				127 >= g ? p++ : 2047 >= g ? p += 2 : 55296 <= g && 57343 >= g ? (p += 4, ++_) : p += 3;
			}
			return p;
		};
		function ro(o, p) {
			Dt(o >>>= 0, {
				name: p = vt(p >>> 0),
				Oc(_) {
					var g = (T(), j)[_ >>> 2 >>> 0];
					return g = rt(_ + 4, g, !0), Ft(_), g;
				},
				Vc(_, g) {
					g instanceof ArrayBuffer && (g = new Uint8Array(g));
					var S = typeof g == "string";
					if (!(S || ArrayBuffer.isView(g) && g.BYTES_PER_ELEMENT == 1)) throw new mr("Cannot pass non-string to std::string");
					var O = S ? Xt(g) : g.length, M = Ia(4 + O + 1), W = M + 4;
					return (T(), j)[M >>> 2 >>> 0] = O, S ? Lt(g, W, O + 1) : (T(), ue).set(g, W >>> 0), _ !== null && _.push(Ft, M), M;
				},
				Uc: Sa,
				Wc(_) {
					Ft(_);
				}
			});
		}
		var Ea = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, Dn = (o, p, _) => {
			if (o >>>= 1, 16 < (p = xn((T(), K), o, p / 2, _)) - o && Ea) return Ea.decode((T(), K).slice(o, p));
			for (_ = ""; o < p; ++o) {
				var g = (T(), K)[o >>> 0];
				_ += String.fromCharCode(g);
			}
			return _;
		}, ao = (o, p, _) => {
			if (_ ??= 2147483647, 2 > _) return 0;
			var g = p;
			_ = (_ -= 2) < 2 * o.length ? _ / 2 : o.length;
			for (var S = 0; S < _; ++S) {
				var O = o.charCodeAt(S);
				(T(), ie)[p >>> 1 >>> 0] = O, p += 2;
			}
			return (T(), ie)[p >>> 1 >>> 0] = 0, p - g;
		}, no = (o) => 2 * o.length, io = (o, p, _) => {
			var g = "";
			o >>>= 2;
			for (var S = 0; !(S >= p / 4); S++) {
				var O = (T(), j)[o + S >>> 0];
				if (!O && !_) break;
				g += String.fromCodePoint(O);
			}
			return g;
		}, so = (o, p, _) => {
			if (p >>>= 0, _ ??= 2147483647, 4 > _) return 0;
			var g = p;
			_ = g + _ - 4;
			for (var S = 0; S < o.length; ++S) {
				var O = o.codePointAt(S);
				if (65535 < O && S++, (T(), U)[p >>> 2 >>> 0] = O, (p += 4) + 4 > _) break;
			}
			return (T(), U)[p >>> 2 >>> 0] = 0, p - g;
		}, oo = (o) => {
			for (var p = 0, _ = 0; _ < o.length; ++_) 65535 < o.codePointAt(_) && _++, p += 4;
			return p;
		};
		function uo(o, p, _) {
			if (o >>>= 0, p >>>= 0, _ = vt(_ >>>= 0), p === 2) var g = Dn, S = ao, O = no;
			else g = io, S = so, O = oo;
			Dt(o, {
				name: _,
				Oc: (M) => {
					var W = (T(), j)[M >>> 2 >>> 0];
					return W = g(M + 4, W * p, !0), Ft(M), W;
				},
				Vc: (M, W) => {
					if (typeof W != "string") throw new mr(`Cannot pass non-string to C++ string type ${_}`);
					var Q = O(W), re = Ia(4 + Q + p);
					return (T(), j)[re >>> 2 >>> 0] = Q / p, S(W, re + 4, Q + p), M !== null && M.push(Ft, re), re;
				},
				Uc: Sa,
				Wc(M) {
					Ft(M);
				}
			});
		}
		function Mn(o, p) {
			Dt(o >>>= 0, {
				zd: !0,
				name: p = vt(p >>> 0),
				Oc: () => {},
				Vc: () => {}
			});
		}
		function Kr(o) {
			fo(o >>> 0, !a, 1, !r, 131072, !1), je();
		}
		var Zt = (o) => {
			if (!N) try {
				if (o(), !(0 < bt)) try {
					n ? Wn() && ho($) : qr($);
				} catch (p) {
					p instanceof Pe || p == "unwind" || c(0, p);
				}
			} catch (p) {
				p instanceof Pe || p == "unwind" || c(0, p);
			}
		}, lo = !Atomics.waitAsync || globalThis.navigator?.userAgent && 91 > Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]);
		function $t(o) {
			o >>>= 0, lo || (Atomics.waitAsync((T(), U), o >>> 2, o).value.then(Rr), o += 128, Atomics.store((T(), U), o >>> 2, 1));
		}
		var Rr = () => Zt(() => {
			var o = Wn();
			o && ($t(o), $g());
		});
		function Nn(o, p) {
			(o >>>= 0) == p >>> 0 ? setTimeout(Rr) : n ? postMessage({
				Zc: o,
				Sc: "checkMailbox"
			}) : (o = Ht[o]) && o.postMessage({ Sc: "checkMailbox" });
		}
		var Or = [];
		function Pn(o, p, _, g, S) {
			for (p >>>= 0, S >>>= 0, Or.length = 0, _ = S >>> 3, g = S + g >>> 3; _ < g;) {
				var O = (T(), he)[_++ >>> 0] ? (T(), he)[_++ >>> 0] : (T(), pe)[_++ >>> 0];
				Or.push(O);
			}
			return (p ? wo[p] : m_[o])(...Or);
		}
		var Xr = () => {
			bt = 0;
		};
		function Un(o) {
			o >>>= 0, n ? postMessage({
				Sc: "cleanupThread",
				Nd: o
			}) : ye(Ht[o]);
		}
		function Ln(o) {}
		var Br = (o) => {
			try {
				o();
			} catch (p) {
				ee(p);
			}
		};
		function u(o) {
			var p = (..._) => {
				R.push(o);
				try {
					return o(..._);
				} finally {
					N || (R.pop(), y && m === 1 && R.length === 0 && (m = 0, bt += 1, Br(d0), typeof Fibers < "u" && Fibers.Zd()));
				}
			};
			return q.set(o, p), p;
		}
		var m = 0, y = null, x = 0, R = [], D = /* @__PURE__ */ new Map(), L = /* @__PURE__ */ new Map(), q = /* @__PURE__ */ new Map(), J = 0, _e = null, Se = [], ae = (o) => (function(p) {
			if (!N) {
				if (m === 0) {
					var _ = !1, g = !1;
					p((S = 0) => {
						if (!N && (x = S, _ = !0, g)) {
							m = 2, Br(() => p0(y)), typeof MainLoop < "u" && MainLoop.ud && MainLoop.resume(), S = !1;
							try {
								var O = (function() {
									var Q = (T(), U)[y + 8 >>> 2 >>> 0];
									return Q = L.get(Q), Q = q.get(Q), --bt, Q();
								})();
							} catch (Q) {
								O = Q, S = !0;
							}
							var M = !1;
							if (!y) {
								var W = _e;
								W && (_e = null, (S ? W.reject : W.resolve)(O), M = !0);
							}
							if (S && !M) throw O;
						}
					}), g = !0, _ || (m = 1, y = (function() {
						var S = Ia(65548), O = S + 12;
						if ((T(), j)[S >>> 2 >>> 0] = O, (T(), j)[S + 4 >>> 2 >>> 0] = O + 65536, O = R[0], !D.has(O)) {
							var M = J++;
							D.set(O, M), L.set(M, O);
						}
						return O = D.get(O), (T(), U)[S + 8 >>> 2 >>> 0] = O, S;
					})(), typeof MainLoop < "u" && MainLoop.ud && MainLoop.pause(), Br(() => l0(y)));
				} else m === 2 ? (m = 0, Br(c0), Ft(y), y = null, Se.forEach(Zt)) : ee(`invalid state: ${m}`);
				return x;
			}
		})((p) => {
			o().then(p);
		});
		function te(o) {
			return o >>>= 0, ae(async () => mt(await ct(o)));
		}
		var me = [], Re = (o) => {
			var p = me.length;
			return me.push(o), p;
		}, Oe = (o, p) => {
			for (var _ = Array(o), g = 0; g < o; ++g) {
				var S = g, O = (T(), j)[p + 4 * g >>> 2 >>> 0], M = xa[O];
				if (M === void 0) throw o = `parameter ${g}`, O = gg(O), p = vt(O), Ft(O), new mr(`${o} has unknown type ${p}`);
				_[S] = M;
			}
			return _;
		}, Te = (o, p, _) => {
			var g = [];
			return o = o(g, _), g.length && ((T(), j)[p >>> 2 >>> 0] = mt(g)), o;
		}, Be = {}, H = (o) => {
			var p = Be[o];
			return p === void 0 ? vt(o) : p;
		};
		function ce(o, p, _) {
			var [g, ...S] = Oe(o, p >>> 0);
			p = g.Vc.bind(g);
			var O = S.map((Q) => Q.Uc.bind(Q));
			o--;
			var M = { toValue: ct };
			switch (o = O.map((Q, re) => {
				var xe = `argFromPtr${re}`;
				return M[xe] = Q, `${xe}(args${re ? "+" + 8 * re : ""})`;
			}), _) {
				case 0:
					var W = "toValue(handle)";
					break;
				case 2:
					W = "new (toValue(handle))";
					break;
				case 3:
					W = "";
					break;
				case 1: M.getStringOrSymbol = H, W = "toValue(handle)[getStringOrSymbol(methodName)]";
			}
			return W += `(${o})`, g.zd || (M.toReturnWire = p, M.emval_returnValue = Te, W = `return emval_returnValue(toReturnWire, destructorsRef, ${W})`), W = `return function (handle, methodName, destructorsRef, args) {
  ${W}
  }`, _ = new Function(Object.keys(M), W)(...Object.values(M)), W = `methodCaller<(${S.map((Q) => Q.name)}) => ${g.name}>`, Re(Object.defineProperty(_, "name", { value: W }));
		}
		function Ve(o, p) {
			return p >>>= 0, (o = ct(o >>> 0)) == ct(p);
		}
		function Xe(o) {
			return (o >>>= 0) ? (o = H(o), mt(globalThis[o])) : mt(globalThis);
		}
		function Ze(o) {
			return o = H(o >>> 0), mt(t[o]);
		}
		function Zr(o, p) {
			return p >>>= 0, o = ct(o >>> 0), p = ct(p), mt(o[p]);
		}
		function U0(o) {
			9 < (o >>>= 0) && (Kt[o + 1] += 1);
		}
		function eg(o, p, _, g, S) {
			return me[o >>> 0](p >>> 0, _ >>> 0, g >>> 0, S >>> 0);
		}
		function L0(o, p, _, g, S) {
			return eg(o >>> 0, p >>> 0, _ >>> 0, g >>> 0, S >>> 0);
		}
		function F0() {
			return mt([]);
		}
		function q0(o) {
			o = ct(o >>> 0);
			for (var p = Array(o.length), _ = 0; _ < o.length; _++) p[_] = o[_];
			return mt(p);
		}
		function W0(o) {
			return mt(H(o >>> 0));
		}
		function G0() {
			return mt({});
		}
		function V0(o) {
			for (var p = ct(o >>>= 0); p.length;) {
				var _ = p.pop();
				p.pop()(_);
			}
			ka(o);
		}
		function H0(o, p, _) {
			p >>>= 0, _ >>>= 0, o = ct(o >>> 0), p = ct(p), _ = ct(_), o[p] = _;
		}
		function j0(o, p) {
			o = -9007199254740992 > o || 9007199254740992 < o ? NaN : Number(o), p >>>= 0, o = /* @__PURE__ */ new Date(1e3 * o), (T(), U)[p >>> 2 >>> 0] = o.getUTCSeconds(), (T(), U)[p + 4 >>> 2 >>> 0] = o.getUTCMinutes(), (T(), U)[p + 8 >>> 2 >>> 0] = o.getUTCHours(), (T(), U)[p + 12 >>> 2 >>> 0] = o.getUTCDate(), (T(), U)[p + 16 >>> 2 >>> 0] = o.getUTCMonth(), (T(), U)[p + 20 >>> 2 >>> 0] = o.getUTCFullYear() - 1900, (T(), U)[p + 24 >>> 2 >>> 0] = o.getUTCDay(), o = (o.getTime() - Date.UTC(o.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, (T(), U)[p + 28 >>> 2 >>> 0] = o;
		}
		var tg = (o) => o % 4 == 0 && (o % 100 != 0 || o % 400 == 0), rg = [
			0,
			31,
			60,
			91,
			121,
			152,
			182,
			213,
			244,
			274,
			305,
			335
		], ag = [
			0,
			31,
			59,
			90,
			120,
			151,
			181,
			212,
			243,
			273,
			304,
			334
		];
		function K0(o, p) {
			o = -9007199254740992 > o || 9007199254740992 < o ? NaN : Number(o), p >>>= 0, o = /* @__PURE__ */ new Date(1e3 * o), (T(), U)[p >>> 2 >>> 0] = o.getSeconds(), (T(), U)[p + 4 >>> 2 >>> 0] = o.getMinutes(), (T(), U)[p + 8 >>> 2 >>> 0] = o.getHours(), (T(), U)[p + 12 >>> 2 >>> 0] = o.getDate(), (T(), U)[p + 16 >>> 2 >>> 0] = o.getMonth(), (T(), U)[p + 20 >>> 2 >>> 0] = o.getFullYear() - 1900, (T(), U)[p + 24 >>> 2 >>> 0] = o.getDay();
			var _ = (tg(o.getFullYear()) ? rg : ag)[o.getMonth()] + o.getDate() - 1 | 0;
			(T(), U)[p + 28 >>> 2 >>> 0] = _, (T(), U)[p + 36 >>> 2 >>> 0] = -60 * o.getTimezoneOffset(), _ = new Date(o.getFullYear(), 6, 1).getTimezoneOffset();
			var g = new Date(o.getFullYear(), 0, 1).getTimezoneOffset();
			o = 0 | (_ != g && o.getTimezoneOffset() == Math.min(g, _)), (T(), U)[p + 32 >>> 2 >>> 0] = o;
		}
		function X0(o) {
			o >>>= 0;
			var p = new Date((T(), U)[o + 20 >>> 2 >>> 0] + 1900, (T(), U)[o + 16 >>> 2 >>> 0], (T(), U)[o + 12 >>> 2 >>> 0], (T(), U)[o + 8 >>> 2 >>> 0], (T(), U)[o + 4 >>> 2 >>> 0], (T(), U)[o >>> 2 >>> 0], 0), _ = (T(), U)[o + 32 >>> 2 >>> 0], g = p.getTimezoneOffset(), S = new Date(p.getFullYear(), 6, 1).getTimezoneOffset(), O = new Date(p.getFullYear(), 0, 1).getTimezoneOffset(), M = Math.min(O, S);
			return 0 > _ ? (T(), U)[o + 32 >>> 2 >>> 0] = +(S != O && M == g) : 0 < _ != (M == g) && (S = Math.max(O, S), p.setTime(p.getTime() + 6e4 * ((0 < _ ? M : S) - g))), (T(), U)[o + 24 >>> 2 >>> 0] = p.getDay(), _ = (tg(p.getFullYear()) ? rg : ag)[p.getMonth()] + p.getDate() - 1 | 0, (T(), U)[o + 28 >>> 2 >>> 0] = _, (T(), U)[o >>> 2 >>> 0] = p.getSeconds(), (T(), U)[o + 4 >>> 2 >>> 0] = p.getMinutes(), (T(), U)[o + 8 >>> 2 >>> 0] = p.getHours(), (T(), U)[o + 12 >>> 2 >>> 0] = p.getDate(), (T(), U)[o + 16 >>> 2 >>> 0] = p.getMonth(), (T(), U)[o + 20 >>> 2 >>> 0] = p.getYear(), o = p.getTime(), BigInt(isNaN(o) ? -1 : o / 1e3);
		}
		function ng(o, p, _, g, S, O, M) {
			return n ? Ge(16, 1, o, p, _, g, S, O, M) : -52;
		}
		function ig(o, p, _, g, S, O) {
			if (n) return Ge(17, 1, o, p, _, g, S, O);
		}
		var Ta = {}, Z0 = () => performance.timeOrigin + performance.now();
		function sg(o, p) {
			return n ? Ge(18, 1, o, p) : (Ta[o] && (clearTimeout(Ta[o].id), delete Ta[o]), p && (Ta[o] = {
				id: setTimeout(() => {
					delete Ta[o], Zt(() => vg(o, performance.timeOrigin + performance.now()));
				}, p),
				Yd: p
			}), 0);
		}
		function Y0(o, p, _, g) {
			o >>>= 0, p >>>= 0, _ >>>= 0, g >>>= 0;
			var S = (/* @__PURE__ */ new Date()).getFullYear(), O = new Date(S, 0, 1).getTimezoneOffset();
			S = new Date(S, 6, 1).getTimezoneOffset();
			var M = Math.max(O, S);
			(T(), j)[o >>> 2 >>> 0] = 60 * M, (T(), U)[p >>> 2 >>> 0] = +(O != S), o = (p = (W) => {
				var Q = Math.abs(W);
				return `UTC${0 <= W ? "-" : "+"}${String(Math.floor(Q / 60)).padStart(2, "0")}${String(Q % 60).padStart(2, "0")}`;
			})(O), p = p(S), S < O ? (Lt(o, _, 17), Lt(p, g, 17)) : (Lt(o, g, 17), Lt(p, _, 17));
		}
		var Q0 = () => Date.now(), J0 = 1;
		function e_(o, p, _) {
			if (_ >>>= 0, !(0 <= o && 3 >= o)) return 28;
			if (o === 0) o = Date.now();
			else {
				if (!J0) return 52;
				o = performance.timeOrigin + performance.now();
			}
			return o = Math.round(1e6 * o), (T(), he)[_ >>> 3 >>> 0] = BigInt(o), 0;
		}
		var po = [], og = (o, p) => {
			po.length = 0;
			for (var _; _ = (T(), ue)[o++ >>> 0];) {
				var g = _ != 105;
				p += (g &= _ != 112) && p % 8 ? 4 : 0, po.push(_ == 112 ? (T(), j)[p >>> 2 >>> 0] : _ == 106 ? (T(), he)[p >>> 3 >>> 0] : _ == 105 ? (T(), U)[p >>> 2 >>> 0] : (T(), pe)[p >>> 3 >>> 0]), p += g ? 8 : 4;
			}
			return po;
		};
		function t_(o, p, _) {
			return o >>>= 0, p = og(p >>> 0, _ >>> 0), wo[o](...p);
		}
		function r_(o, p, _) {
			return o >>>= 0, p = og(p >>> 0, _ >>> 0), wo[o](...p);
		}
		var a_ = () => {};
		function n_(o, p) {
			return B(rt(o >>> 0, p >>> 0));
		}
		var i_ = () => {
			throw bt += 1, "unwind";
		};
		function s_() {
			return 4294901760;
		}
		var o_ = () => navigator.hardwareConcurrency, Dr = {}, Fn = (o) => {
			var p;
			return (p = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o)) ? +p[1] : (p = /:(\d+):\d+(?:\)|$)/.exec(o)) ? 2147483648 | +p[1] : 0;
		}, ug = (o) => {
			for (var p of o) (o = Fn(p)) && (Dr[o] = p);
		};
		function u_() {
			var o = Error().stack.toString().split(`
`);
			return o[0] == "Error" && o.shift(), ug(o), Dr.gd = Fn(o[3]), Dr.Jd = o, Dr.gd;
		}
		function qn(o) {
			if (!(o = Dr[o >>> 0])) return 0;
			var p;
			if (p = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o)) o = p[1];
			else if (p = /^\s+at (.*) \(.*\)$/.exec(o)) o = p[1];
			else {
				if (!(p = /^(.+?)@/.exec(o))) return 0;
				o = p[1];
			}
			Ft(qn.hd ?? 0), p = Xt(o) + 1;
			var _ = Ia(p);
			return _ && Lt(o, _, p), qn.hd = _, qn.hd;
		}
		function l_(o) {
			o >>>= 0;
			var p = (T(), ue).length;
			if (o <= p || 4294901760 < o) return !1;
			for (var _ = 1; 4 >= _; _ *= 2) {
				var g = p * (1 + .2 / _);
				g = Math.min(g, o + 100663296);
				e: {
					g = (Math.min(4294901760, 65536 * Math.ceil(Math.max(o, g) / 65536)) - Rt.buffer.byteLength + 65535) / 65536 | 0;
					try {
						Rt.grow(g), ke();
						var S = 1;
						break e;
					} catch {}
					S = void 0;
				}
				if (S) return !0;
			}
			return !1;
		}
		function d_(o, p, _) {
			if (o >>>= 0, p >>>= 0, Dr.gd == o) var g = Dr.Jd;
			else (g = Error().stack.toString().split(`
`))[0] == "Error" && g.shift(), ug(g);
			for (var S = 3; g[S] && Fn(g[S]) != o;) ++S;
			for (o = 0; o < _ && g[o + S]; ++o) (T(), U)[p + 4 * o >>> 2 >>> 0] = Fn(g[o + S]);
			return o;
		}
		var co, mo = {}, lg = () => {
			if (!co) {
				var o, p = {
					USER: "web_user",
					LOGNAME: "web_user",
					PATH: "/",
					PWD: "/",
					HOME: "/home/web_user",
					LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8",
					_: "./this.program"
				};
				for (o in mo) mo[o] === void 0 ? delete p[o] : p[o] = mo[o];
				var _ = [];
				for (o in p) _.push(`${o}=${p[o]}`);
				co = _;
			}
			return co;
		};
		function dg(o, p) {
			if (n) return Ge(19, 1, o, p);
			o >>>= 0, p >>>= 0;
			var _, g = 0, S = 0;
			for (_ of lg()) {
				var O = p + g;
				(T(), j)[o + S >>> 2 >>> 0] = O, g += Lt(_, O, 1 / 0) + 1, S += 4;
			}
			return 0;
		}
		function pg(o, p) {
			if (n) return Ge(20, 1, o, p);
			o >>>= 0, p >>>= 0;
			var _ = lg();
			for (var g of ((T(), j)[o >>> 2 >>> 0] = _.length, o = 0, _)) o += Xt(g) + 1;
			return (T(), j)[p >>> 2 >>> 0] = o, 0;
		}
		function cg(o) {
			return n ? Ge(21, 1, o) : 52;
		}
		function mg(o, p, _, g) {
			return n ? Ge(22, 1, o, p, _, g) : 52;
		}
		function fg(o, p, _, g) {
			return n ? Ge(23, 1, o, p, _, g) : 70;
		}
		var p_ = [
			null,
			[],
			[]
		];
		function hg(o, p, _, g) {
			if (n) return Ge(24, 1, o, p, _, g);
			p >>>= 0, _ >>>= 0, g >>>= 0;
			for (var S = 0, O = 0; O < _; O++) {
				var M = (T(), j)[p >>> 2 >>> 0], W = (T(), j)[p + 4 >>> 2 >>> 0];
				p += 8;
				for (var Q = 0; Q < W; Q++) {
					var re = o, xe = (T(), ue)[M + Q >>> 0], De = p_[re];
					xe === 0 || xe === 10 ? ((re === 1 ? z : B)(kn(De)), De.length = 0) : De.push(xe);
				}
				S += W;
			}
			return (T(), j)[g >>> 2 >>> 0] = S, 0;
		}
		function c_(o) {
			return o >>> 0;
		}
		n || (function() {
			for (var o = t.numThreads - 1; o--;) Cr();
			Ae.push(async () => {
				var p = (async function() {
					if (!n) return Promise.all(Pt.map(ha));
				})();
				Ye++, await p, --Ye == 0 && at && (p = at, at = null, p());
			});
		})(), n || (Rt = new WebAssembly.Memory({
			initial: 256,
			maximum: 65536,
			shared: !0
		}), ke()), t.wasmBinary && (w = t.wasmBinary), t.stackSave = () => Ie(), t.stackRestore = (o) => Ee(o), t.stackAlloc = (o) => go(o), t.setValue = function(o, p, _ = "i8") {
			switch (_.endsWith("*") && (_ = "*"), _) {
				case "i1":
				case "i8":
					(T(), X)[o >>> 0] = p;
					break;
				case "i16":
					(T(), ie)[o >>> 1 >>> 0] = p;
					break;
				case "i32":
					(T(), U)[o >>> 2 >>> 0] = p;
					break;
				case "i64":
					(T(), he)[o >>> 3 >>> 0] = BigInt(p);
					break;
				case "float":
					(T(), ne)[o >>> 2 >>> 0] = p;
					break;
				case "double":
					(T(), pe)[o >>> 3 >>> 0] = p;
					break;
				case "*":
					(T(), j)[o >>> 2 >>> 0] = p;
					break;
				default: ee(`invalid type for setValue: ${_}`);
			}
		}, t.getValue = function(o, p = "i8") {
			switch (p.endsWith("*") && (p = "*"), p) {
				case "i1":
				case "i8": return (T(), X)[o >>> 0];
				case "i16": return (T(), ie)[o >>> 1 >>> 0];
				case "i32": return (T(), U)[o >>> 2 >>> 0];
				case "i64": return (T(), he)[o >>> 3 >>> 0];
				case "float": return (T(), ne)[o >>> 2 >>> 0];
				case "double": return (T(), pe)[o >>> 3 >>> 0];
				case "*": return (T(), j)[o >>> 2 >>> 0];
				default: ee(`invalid type for getValue: ${p}`);
			}
		}, t.UTF8ToString = rt, t.stringToUTF8 = Lt, t.lengthBytesUTF8 = Xt;
		var gg, _g, Wn, Ft, Ia, fo, yg, wg, bg, ho, vg, $g, ze, za, xg, Ee, go, Ie, kg, _o, Sg, Eg, Tg, yo, Ig, zg, Cg, Ag, Rg, Og, Bg, Dg, Mg, Ng, Pg, Ug, Lg, Fg, qg, Wg, Gg, Vg, Hg, jg, Kg, Xg, Zg, Yg, Qg, Jg, e0, t0, r0, a0, n0, i0, s0, o0, u0, l0, d0, p0, c0, Yt, m_ = [
			lr,
			dr,
			Ut,
			Sn,
			En,
			Hr,
			b,
			Ue,
			Tn,
			va,
			In,
			zn,
			Cn,
			An,
			Rn,
			On,
			ng,
			ig,
			sg,
			dg,
			pg,
			cg,
			mg,
			fg,
			hg
		], wo = {
			1003524: (o, p, _, g, S) => {
				if (t === void 0 || !t.Xc) return 1;
				if ((o = rt(Number(o >>> 0))).startsWith("./") && (o = o.substring(2)), !(o = t.Xc.get(o))) return 2;
				if (p = Number(p >>> 0), _ = Number(_ >>> 0), g = Number(g >>> 0), p + _ > o.byteLength) return 3;
				try {
					let O = o.subarray(p, p + _);
					switch (S) {
						case 0:
							(T(), ue).set(O, g >>> 0);
							break;
						case 1:
							t.Qd ? t.Qd(g, O) : t.Id(g, O);
							break;
						default: return 4;
					}
					return 0;
				} catch {
					return 4;
				}
			},
			1004348: (o, p, _) => {
				t.td(o, (T(), ue).subarray(p >>> 0, p + _ >>> 0));
			},
			1004412: () => t.Sd(),
			1004454: (o) => {
				t.sd(o);
			},
			1004491: () => {
				t.Bd();
			},
			1004522: () => {
				t.Cd();
			},
			1004551: () => {
				t.Gd();
			},
			1004576: (o) => t.Ad(o),
			1004609: (o) => t.Ed(o),
			1004641: (o, p, _) => {
				t.ed(Number(o), Number(p), Number(_), !0);
			},
			1004704: (o, p, _) => {
				t.ed(Number(o), Number(p), Number(_));
			},
			1004761: () => typeof wasmOffsetConverter < "u",
			1004818: (o) => {
				t.$b("Abs", o, void 0);
			},
			1004869: (o) => {
				t.$b("Neg", o, void 0);
			},
			1004920: (o) => {
				t.$b("Floor", o, void 0);
			},
			1004973: (o) => {
				t.$b("Ceil", o, void 0);
			},
			1005025: (o) => {
				t.$b("Reciprocal", o, void 0);
			},
			1005083: (o) => {
				t.$b("Sqrt", o, void 0);
			},
			1005135: (o) => {
				t.$b("Exp", o, void 0);
			},
			1005186: (o) => {
				t.$b("Erf", o, void 0);
			},
			1005237: (o) => {
				t.$b("Sigmoid", o, void 0);
			},
			1005292: (o, p, _) => {
				t.$b("HardSigmoid", o, {
					alpha: p,
					beta: _
				});
			},
			1005371: (o) => {
				t.$b("Log", o, void 0);
			},
			1005422: (o) => {
				t.$b("Sin", o, void 0);
			},
			1005473: (o) => {
				t.$b("Cos", o, void 0);
			},
			1005524: (o) => {
				t.$b("Tan", o, void 0);
			},
			1005575: (o) => {
				t.$b("Asin", o, void 0);
			},
			1005627: (o) => {
				t.$b("Acos", o, void 0);
			},
			1005679: (o) => {
				t.$b("Atan", o, void 0);
			},
			1005731: (o) => {
				t.$b("Sinh", o, void 0);
			},
			1005783: (o) => {
				t.$b("Cosh", o, void 0);
			},
			1005835: (o) => {
				t.$b("Asinh", o, void 0);
			},
			1005888: (o) => {
				t.$b("Acosh", o, void 0);
			},
			1005941: (o) => {
				t.$b("Atanh", o, void 0);
			},
			1005994: (o) => {
				t.$b("Tanh", o, void 0);
			},
			1006046: (o) => {
				t.$b("Not", o, void 0);
			},
			1006097: (o, p, _) => {
				t.$b("Clip", o, {
					min: p,
					max: _
				});
			},
			1006166: (o) => {
				t.$b("Clip", o, void 0);
			},
			1006218: (o, p) => {
				t.$b("Elu", o, { alpha: p });
			},
			1006276: (o) => {
				t.$b("Gelu", o, void 0);
			},
			1006328: (o) => {
				t.$b("Relu", o, void 0);
			},
			1006380: (o, p) => {
				t.$b("LeakyRelu", o, { alpha: p });
			},
			1006444: (o, p) => {
				t.$b("ThresholdedRelu", o, { alpha: p });
			},
			1006514: (o, p) => {
				t.$b("Cast", o, { to: p });
			},
			1006572: (o) => {
				t.$b("Add", o, void 0);
			},
			1006623: (o) => {
				t.$b("Sub", o, void 0);
			},
			1006674: (o) => {
				t.$b("Mul", o, void 0);
			},
			1006725: (o) => {
				t.$b("Div", o, void 0);
			},
			1006776: (o) => {
				t.$b("Pow", o, void 0);
			},
			1006827: (o) => {
				t.$b("Equal", o, void 0);
			},
			1006880: (o) => {
				t.$b("Greater", o, void 0);
			},
			1006935: (o) => {
				t.$b("GreaterOrEqual", o, void 0);
			},
			1006997: (o) => {
				t.$b("Less", o, void 0);
			},
			1007049: (o) => {
				t.$b("LessOrEqual", o, void 0);
			},
			1007108: (o, p, _, g, S) => {
				t.$b("ReduceMean", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1007283: (o, p, _, g, S) => {
				t.$b("ReduceMax", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1007457: (o, p, _, g, S) => {
				t.$b("ReduceMin", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1007631: (o, p, _, g, S) => {
				t.$b("ReduceProd", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1007806: (o, p, _, g, S) => {
				t.$b("ReduceSum", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1007980: (o, p, _, g, S) => {
				t.$b("ReduceL1", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1008153: (o, p, _, g, S) => {
				t.$b("ReduceL2", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1008326: (o, p, _, g, S) => {
				t.$b("ReduceLogSum", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1008503: (o, p, _, g, S) => {
				t.$b("ReduceSumSquare", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1008683: (o, p, _, g, S) => {
				t.$b("ReduceLogSumExp", o, {
					keepDims: !!p,
					noopWithEmptyAxes: !!_,
					axes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1008863: (o) => {
				t.$b("Where", o, void 0);
			},
			1008916: (o, p, _) => {
				t.$b("Transpose", o, { perm: p ? Array.from((T(), U).subarray(Number(p) >>> 0, Number(_) >>> 0)) : [] });
			},
			1009040: (o, p, _, g) => {
				t.$b("DepthToSpace", o, {
					blocksize: p,
					mode: rt(_),
					format: g ? "NHWC" : "NCHW"
				});
			},
			1009173: (o, p, _, g) => {
				t.$b("DepthToSpace", o, {
					blocksize: p,
					mode: rt(_),
					format: g ? "NHWC" : "NCHW"
				});
			},
			1009306: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke, fr) => {
				t.$b("ConvTranspose", o, {
					format: Q ? "NHWC" : "NCHW",
					autoPad: p,
					dilations: [_],
					group: g,
					kernelShape: [S],
					pads: [O, M],
					strides: [W],
					wIsConst: () => !!(T(), X)[re >>> 0],
					outputPadding: xe ? Array.from((T(), U).subarray(Number(xe) >>> 0, Number(De) >>> 0)) : [],
					outputShape: qe ? Array.from((T(), U).subarray(Number(qe) >>> 0, Number(Ke) >>> 0)) : [],
					activation: rt(fr)
				});
			},
			1009739: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("ConvTranspose", o, {
					format: W ? "NHWC" : "NCHW",
					autoPad: p,
					dilations: Array.from((T(), U).subarray(Number(_) >>> 0, (Number(_) >>> 0) + 2 >>> 0)),
					group: g,
					kernelShape: Array.from((T(), U).subarray(Number(S) >>> 0, (Number(S) >>> 0) + 2 >>> 0)),
					pads: Array.from((T(), U).subarray(Number(O) >>> 0, (Number(O) >>> 0) + 4 >>> 0)),
					strides: Array.from((T(), U).subarray(Number(M) >>> 0, (Number(M) >>> 0) + 2 >>> 0)),
					wIsConst: () => !!(T(), X)[Q >>> 0],
					outputPadding: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					outputShape: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : [],
					activation: rt(Ke)
				});
			},
			1010400: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke, fr) => {
				t.$b("ConvTranspose", o, {
					format: Q ? "NHWC" : "NCHW",
					autoPad: p,
					dilations: [_],
					group: g,
					kernelShape: [S],
					pads: [O, M],
					strides: [W],
					wIsConst: () => !!(T(), X)[re >>> 0],
					outputPadding: xe ? Array.from((T(), U).subarray(Number(xe) >>> 0, Number(De) >>> 0)) : [],
					outputShape: qe ? Array.from((T(), U).subarray(Number(qe) >>> 0, Number(Ke) >>> 0)) : [],
					activation: rt(fr)
				});
			},
			1010833: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("ConvTranspose", o, {
					format: W ? "NHWC" : "NCHW",
					autoPad: p,
					dilations: Array.from((T(), U).subarray(Number(_) >>> 0, (Number(_) >>> 0) + 2 >>> 0)),
					group: g,
					kernelShape: Array.from((T(), U).subarray(Number(S) >>> 0, (Number(S) >>> 0) + 2 >>> 0)),
					pads: Array.from((T(), U).subarray(Number(O) >>> 0, (Number(O) >>> 0) + 4 >>> 0)),
					strides: Array.from((T(), U).subarray(Number(M) >>> 0, (Number(M) >>> 0) + 2 >>> 0)),
					wIsConst: () => !!(T(), X)[Q >>> 0],
					outputPadding: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					outputShape: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : [],
					activation: rt(Ke)
				});
			},
			1011494: (o, p) => {
				t.$b("GlobalAveragePool", o, { format: p ? "NHWC" : "NCHW" });
			},
			1011585: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("AveragePool", o, {
					format: Ke ? "NHWC" : "NCHW",
					auto_pad: p,
					ceil_mode: _,
					count_include_pad: g,
					storage_order: S,
					dilations: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : [],
					kernel_shape: W ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(Q) >>> 0)) : [],
					pads: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					strides: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : []
				});
			},
			1012064: (o, p) => {
				t.$b("GlobalAveragePool", o, { format: p ? "NHWC" : "NCHW" });
			},
			1012155: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("AveragePool", o, {
					format: Ke ? "NHWC" : "NCHW",
					auto_pad: p,
					ceil_mode: _,
					count_include_pad: g,
					storage_order: S,
					dilations: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : [],
					kernel_shape: W ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(Q) >>> 0)) : [],
					pads: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					strides: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : []
				});
			},
			1012634: (o, p) => {
				t.$b("GlobalMaxPool", o, { format: p ? "NHWC" : "NCHW" });
			},
			1012721: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("MaxPool", o, {
					format: Ke ? "NHWC" : "NCHW",
					auto_pad: p,
					ceil_mode: _,
					count_include_pad: g,
					storage_order: S,
					dilations: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : [],
					kernel_shape: W ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(Q) >>> 0)) : [],
					pads: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					strides: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : []
				});
			},
			1013196: (o, p) => {
				t.$b("GlobalMaxPool", o, { format: p ? "NHWC" : "NCHW" });
			},
			1013283: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke) => {
				t.$b("MaxPool", o, {
					format: Ke ? "NHWC" : "NCHW",
					auto_pad: p,
					ceil_mode: _,
					count_include_pad: g,
					storage_order: S,
					dilations: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : [],
					kernel_shape: W ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(Q) >>> 0)) : [],
					pads: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					strides: De ? Array.from((T(), U).subarray(Number(De) >>> 0, Number(qe) >>> 0)) : []
				});
			},
			1013758: (o, p, _, g, S) => {
				t.$b("Gemm", o, {
					alpha: p,
					beta: _,
					transA: g,
					transB: S
				});
			},
			1013862: (o) => {
				t.$b("MatMul", o, void 0);
			},
			1013916: (o, p, _, g) => {
				t.$b("ArgMax", o, {
					keepDims: !!p,
					selectLastIndex: !!_,
					axis: g
				});
			},
			1014024: (o, p, _, g) => {
				t.$b("ArgMin", o, {
					keepDims: !!p,
					selectLastIndex: !!_,
					axis: g
				});
			},
			1014132: (o, p) => {
				t.$b("Softmax", o, { axis: p });
			},
			1014195: (o, p) => {
				t.$b("Concat", o, { axis: p });
			},
			1014255: (o, p, _, g, S) => {
				t.$b("Split", o, {
					axis: p,
					numOutputs: _,
					splitSizes: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1014411: (o) => {
				t.$b("Expand", o, void 0);
			},
			1014465: (o, p) => {
				t.$b("Gather", o, { axis: Number(p) });
			},
			1014536: (o, p) => {
				t.$b("GatherElements", o, { axis: Number(p) });
			},
			1014615: (o, p) => {
				t.$b("GatherND", o, { batch_dims: Number(p) });
			},
			1014694: (o, p, _, g, S, O, M, W, Q, re, xe) => {
				t.$b("Resize", o, {
					antialias: p,
					axes: _ ? Array.from((T(), U).subarray(Number(_) >>> 0, Number(g) >>> 0)) : [],
					coordinateTransformMode: rt(S),
					cubicCoeffA: O,
					excludeOutside: M,
					extrapolationValue: W,
					keepAspectRatioPolicy: rt(Q),
					mode: rt(re),
					nearestMode: rt(xe)
				});
			},
			1015056: (o, p, _, g, S, O, M) => {
				t.$b("Slice", o, {
					starts: p ? Array.from((T(), U).subarray(Number(p) >>> 0, Number(_) >>> 0)) : [],
					ends: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : [],
					axes: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : []
				});
			},
			1015320: (o) => {
				t.$b("Tile", o, void 0);
			},
			1015372: (o, p, _) => {
				t.$b("InstanceNormalization", o, {
					epsilon: p,
					format: _ ? "NHWC" : "NCHW"
				});
			},
			1015486: (o, p, _) => {
				t.$b("InstanceNormalization", o, {
					epsilon: p,
					format: _ ? "NHWC" : "NCHW"
				});
			},
			1015600: (o) => {
				t.$b("Range", o, void 0);
			},
			1015653: (o, p) => {
				t.$b("Einsum", o, { equation: rt(p) });
			},
			1015734: (o, p, _, g, S) => {
				t.$b("Pad", o, {
					mode: p,
					value: _,
					pads: g ? Array.from((T(), U).subarray(Number(g) >>> 0, Number(S) >>> 0)) : []
				});
			},
			1015877: (o, p, _, g, S, O) => {
				t.$b("BatchNormalization", o, {
					epsilon: p,
					momentum: _,
					spatial: !!S,
					trainingMode: !!g,
					format: O ? "NHWC" : "NCHW"
				});
			},
			1016046: (o, p, _, g, S, O) => {
				t.$b("BatchNormalization", o, {
					epsilon: p,
					momentum: _,
					spatial: !!S,
					trainingMode: !!g,
					format: O ? "NHWC" : "NCHW"
				});
			},
			1016215: (o, p, _) => {
				t.$b("CumSum", o, {
					exclusive: Number(p),
					reverse: Number(_)
				});
			},
			1016312: (o, p, _) => {
				t.$b("DequantizeLinear", o, {
					axis: p,
					blockSize: _
				});
			},
			1016402: (o, p, _, g, S) => {
				t.$b("GridSample", o, {
					align_corners: p,
					mode: rt(_),
					padding_mode: rt(g),
					format: S ? "NHWC" : "NCHW"
				});
			},
			1016572: (o, p, _, g, S) => {
				t.$b("GridSample", o, {
					align_corners: p,
					mode: rt(_),
					padding_mode: rt(g),
					format: S ? "NHWC" : "NCHW"
				});
			},
			1016742: (o, p) => {
				t.$b("ScatterND", o, { reduction: rt(p) });
			},
			1016827: (o, p, _, g, S, O, M, W, Q) => {
				t.$b("Attention", o, {
					numHeads: p,
					isUnidirectional: _,
					maskFilterValue: g,
					scale: S,
					doRotary: O,
					qkvHiddenSizes: M ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(W) + M >>> 0)) : [],
					pastPresentShareBuffer: !!Q
				});
			},
			1017099: (o) => {
				t.$b("BiasAdd", o, void 0);
			},
			1017154: (o) => {
				t.$b("BiasSplitGelu", o, void 0);
			},
			1017215: (o) => {
				t.$b("FastGelu", o, void 0);
			},
			1017271: (o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke, fr, bo) => {
				t.$b("Conv", o, {
					format: De ? "NHWC" : "NCHW",
					auto_pad: p,
					dilations: _ ? Array.from((T(), U).subarray(Number(_) >>> 0, Number(g) >>> 0)) : [],
					group: S,
					kernel_shape: O ? Array.from((T(), U).subarray(Number(O) >>> 0, Number(M) >>> 0)) : [],
					pads: W ? Array.from((T(), U).subarray(Number(W) >>> 0, Number(Q) >>> 0)) : [],
					strides: re ? Array.from((T(), U).subarray(Number(re) >>> 0, Number(xe) >>> 0)) : [],
					w_is_const: () => !!(T(), X)[Number(qe) >>> 0],
					activation: rt(Ke),
					activation_params: fr ? Array.from((T(), ne).subarray(Number(fr) >>> 0, Number(bo) >>> 0)) : []
				});
			},
			1017855: (o) => {
				t.$b("Gelu", o, void 0);
			},
			1017907: (o, p, _, g, S, O, M, W, Q) => {
				t.$b("GroupQueryAttention", o, {
					numHeads: p,
					kvNumHeads: _,
					scale: g,
					softcap: S,
					doRotary: O,
					rotaryInterleaved: M,
					smoothSoftmax: W,
					localWindowSize: Q
				});
			},
			1018124: (o, p, _, g) => {
				t.$b("LayerNormalization", o, {
					axis: p,
					epsilon: _,
					simplified: !!g
				});
			},
			1018235: (o, p, _, g) => {
				t.$b("LayerNormalization", o, {
					axis: p,
					epsilon: _,
					simplified: !!g
				});
			},
			1018346: (o, p, _, g, S, O) => {
				t.$b("MatMulNBits", o, {
					k: p,
					n: _,
					accuracyLevel: g,
					bits: S,
					blockSize: O
				});
			},
			1018473: (o, p, _, g, S, O) => {
				t.$b("MultiHeadAttention", o, {
					numHeads: p,
					isUnidirectional: _,
					maskFilterValue: g,
					scale: S,
					doRotary: O
				});
			},
			1018632: (o, p) => {
				t.$b("QuickGelu", o, { alpha: p });
			},
			1018696: (o, p, _, g, S) => {
				t.$b("RotaryEmbedding", o, {
					interleaved: !!p,
					numHeads: _,
					rotaryEmbeddingDim: g,
					scale: S
				});
			},
			1018835: (o, p, _) => {
				t.$b("SkipLayerNormalization", o, {
					epsilon: p,
					simplified: !!_
				});
			},
			1018937: (o, p, _) => {
				t.$b("SkipLayerNormalization", o, {
					epsilon: p,
					simplified: !!_
				});
			},
			1019039: (o, p, _, g) => {
				t.$b("GatherBlockQuantized", o, {
					gatherAxis: p,
					quantizeAxis: _,
					blockSize: g
				});
			},
			1019160: (o) => {
				t.Fd(o);
			},
			1019194: (o, p) => t.Hd(Number(o), Number(p), t.Yc.Kd, t.Yc.errors)
		};
		function f_(o, p, _) {
			return ae(async () => {
				await t.Dd(Number(o), Number(p), Number(_));
			});
		}
		function h_() {
			return typeof wasmOffsetConverter < "u";
		}
		function g_(o, p, _, g) {
			var S = Ie();
			try {
				return Dg(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function __(o, p, _) {
			var g = Ie();
			try {
				return Ag(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				ze(1, 0);
			}
		}
		function y_(o) {
			var p = Ie();
			try {
				Ig(o);
			} catch (_) {
				if (Ee(p), _ !== _ + 0) throw _;
				ze(1, 0);
			}
		}
		function w_(o, p) {
			var _ = Ie();
			try {
				return yo(o, p);
			} catch (g) {
				if (Ee(_), g !== g + 0) throw g;
				ze(1, 0);
			}
		}
		function b_(o, p, _) {
			var g = Ie();
			try {
				Tg(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				ze(1, 0);
			}
		}
		function v_(o, p) {
			var _ = Ie();
			try {
				Mg(o, p);
			} catch (g) {
				if (Ee(_), g !== g + 0) throw g;
				ze(1, 0);
			}
		}
		function $_(o, p, _, g, S, O, M) {
			var W = Ie();
			try {
				return Og(o, p, _, g, S, O, M);
			} catch (Q) {
				if (Ee(W), Q !== Q + 0) throw Q;
				ze(1, 0);
			}
		}
		function x_(o, p, _, g, S, O) {
			var M = Ie();
			try {
				zg(o, p, _, g, S, O);
			} catch (W) {
				if (Ee(M), W !== W + 0) throw W;
				ze(1, 0);
			}
		}
		function k_(o, p, _, g) {
			var S = Ie();
			try {
				Bg(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function S_(o, p, _, g, S) {
			var O = Ie();
			try {
				Cg(o, p, _, g, S);
			} catch (M) {
				if (Ee(O), M !== M + 0) throw M;
				ze(1, 0);
			}
		}
		function E_(o, p, _, g, S, O, M) {
			var W = Ie();
			try {
				Pg(o, p, _, g, S, O, M);
			} catch (Q) {
				if (Ee(W), Q !== Q + 0) throw Q;
				ze(1, 0);
			}
		}
		function T_(o, p, _, g, S, O, M) {
			var W = Ie();
			try {
				Ug(o, p, _, g, S, O, M);
			} catch (Q) {
				if (Ee(W), Q !== Q + 0) throw Q;
				ze(1, 0);
			}
		}
		function I_(o, p, _, g, S, O, M, W) {
			var Q = Ie();
			try {
				Wg(o, p, _, g, S, O, M, W);
			} catch (re) {
				if (Ee(Q), re !== re + 0) throw re;
				ze(1, 0);
			}
		}
		function z_(o, p, _, g, S) {
			var O = Ie();
			try {
				return Ng(o, p, _, g, S);
			} catch (M) {
				if (Ee(O), M !== M + 0) throw M;
				ze(1, 0);
			}
		}
		function C_(o, p, _) {
			var g = Ie();
			try {
				return Gg(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				ze(1, 0);
			}
		}
		function A_(o, p, _, g, S, O, M, W) {
			var Q = Ie();
			try {
				Vg(o, p, _, g, S, O, M, W);
			} catch (re) {
				if (Ee(Q), re !== re + 0) throw re;
				ze(1, 0);
			}
		}
		function R_(o, p, _, g, S, O, M, W, Q, re, xe, De) {
			var qe = Ie();
			try {
				Lg(o, p, _, g, S, O, M, W, Q, re, xe, De);
			} catch (Ke) {
				if (Ee(qe), Ke !== Ke + 0) throw Ke;
				ze(1, 0);
			}
		}
		function O_(o, p, _, g, S, O) {
			var M = Ie();
			try {
				return Fg(o, p, _, g, S, O);
			} catch (W) {
				if (Ee(M), W !== W + 0) throw W;
				ze(1, 0);
			}
		}
		function B_(o, p, _) {
			var g = Ie();
			try {
				return Hg(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				return ze(1, 0), 0n;
			}
		}
		function D_(o, p, _, g, S, O, M, W, Q) {
			var re = Ie();
			try {
				Rg(o, p, _, g, S, O, M, W, Q);
			} catch (xe) {
				if (Ee(re), xe !== xe + 0) throw xe;
				ze(1, 0);
			}
		}
		function M_(o) {
			var p = Ie();
			try {
				return jg(o);
			} catch (_) {
				if (Ee(p), _ !== _ + 0) throw _;
				ze(1, 0);
			}
		}
		function N_(o, p) {
			var _ = Ie();
			try {
				return u0(o, p);
			} catch (g) {
				if (Ee(_), g !== g + 0) throw g;
				return ze(1, 0), 0n;
			}
		}
		function P_(o) {
			var p = Ie();
			try {
				return Kg(o);
			} catch (_) {
				if (Ee(p), _ !== _ + 0) throw _;
				return ze(1, 0), 0n;
			}
		}
		function U_(o, p, _, g) {
			var S = Ie();
			try {
				return e0(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function L_(o, p, _, g, S) {
			var O = Ie();
			try {
				return t0(o, p, _, g, S);
			} catch (M) {
				if (Ee(O), M !== M + 0) throw M;
				ze(1, 0);
			}
		}
		function F_(o, p, _, g, S, O) {
			var M = Ie();
			try {
				return r0(o, p, _, g, S, O);
			} catch (W) {
				if (Ee(M), W !== W + 0) throw W;
				ze(1, 0);
			}
		}
		function q_(o, p, _, g, S, O) {
			var M = Ie();
			try {
				return a0(o, p, _, g, S, O);
			} catch (W) {
				if (Ee(M), W !== W + 0) throw W;
				ze(1, 0);
			}
		}
		function W_(o, p, _, g, S, O, M, W) {
			var Q = Ie();
			try {
				return qg(o, p, _, g, S, O, M, W);
			} catch (re) {
				if (Ee(Q), re !== re + 0) throw re;
				ze(1, 0);
			}
		}
		function G_(o, p, _, g, S) {
			var O = Ie();
			try {
				return n0(o, p, _, g, S);
			} catch (M) {
				if (Ee(O), M !== M + 0) throw M;
				return ze(1, 0), 0n;
			}
		}
		function V_(o, p, _, g) {
			var S = Ie();
			try {
				return i0(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function H_(o, p, _, g) {
			var S = Ie();
			try {
				return s0(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function j_(o, p, _, g, S, O, M, W, Q, re, xe, De) {
			var qe = Ie();
			try {
				return o0(o, p, _, g, S, O, M, W, Q, re, xe, De);
			} catch (Ke) {
				if (Ee(qe), Ke !== Ke + 0) throw Ke;
				ze(1, 0);
			}
		}
		function K_(o, p, _, g, S, O, M, W, Q, re, xe) {
			var De = Ie();
			try {
				Qg(o, p, _, g, S, O, M, W, Q, re, xe);
			} catch (qe) {
				if (Ee(De), qe !== qe + 0) throw qe;
				ze(1, 0);
			}
		}
		function X_(o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke, fr, bo) {
			var J_ = Ie();
			try {
				Jg(o, p, _, g, S, O, M, W, Q, re, xe, De, qe, Ke, fr, bo);
			} catch (vo) {
				if (Ee(J_), vo !== vo + 0) throw vo;
				ze(1, 0);
			}
		}
		function Z_(o, p, _) {
			var g = Ie();
			try {
				return Xg(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				ze(1, 0);
			}
		}
		function Y_(o, p, _) {
			var g = Ie();
			try {
				return Zg(o, p, _);
			} catch (S) {
				if (Ee(g), S !== S + 0) throw S;
				ze(1, 0);
			}
		}
		function Q_(o, p, _, g) {
			var S = Ie();
			try {
				Yg(o, p, _, g);
			} catch (O) {
				if (Ee(S), O !== O + 0) throw O;
				ze(1, 0);
			}
		}
		function Gn() {
			if (0 < Ye) at = Gn;
			else if (n) k?.(t), ve();
			else {
				for (var o = Ae; 0 < o.length;) o.shift()(t);
				0 < Ye ? at = Gn : (t.calledRun = !0, N || (ve(), k?.(t)));
			}
		}
		return n || (Yt = await ot(), Gn()), t.PTR_SIZE = 4, se ? t : new Promise((o, p) => {
			k = o, C = p;
		});
	}
	var Ra, To, Io, zo, Co, Z, hr, Ao, Mr, Yr, Jt, gr, Ro, Oo, Hn, Bo, Do, Mo, jn, it, Kn, He, No, Po, Uo, Lo, Oa, Fo, qo, Wo, Go, Vo, Ho, _r, Qr, Xn, jo, Ko, Xo, Zo, Yo, ft, Ba, xt, Zn, Jr, Yn, kt, yt, er, tr, Qn, Qo, Jo, Jn, eu, tu, ru, au, nu, ei, ht, Da, ti, ri, ai, iu, su, ni, ou, uu, lu, ii, si, du, gt, pu, Ma, cu, mu, oi, fu, ui, hu, li, gu, Na, di, Pa, ea, pi, _u, yu, wu, ci, We, rr, St, Ua, Le, La, bu, vu, $u, xu, ku, yr, Su, Eu, Tu, wr, qt, br, Fa, qa, mi, fi, hi, fe, gi, _i, Iu, zu, Cu, Au, yi, Ru, Ce, Mt, Ou, Nr, F, Wa, Bu, Du, Mu, we, wi, bi, vi, $i, xi, Nu, ki, Pu, Si, Ei, Ti, Uu, Lu, Fu, ta, qu, Wu, Gu, Ga, Ii, Va, Ha, Vu, Hu, zi, Ci, ju, Ku, Xu, Zu, Ne, Qe, Pr, ja, nt, ut, de, Je, Ai, Ur, ar, le, ra, G, oe, Yu, Ri, Qu, Ju, be, el, Oi, tl, rl, al, nl, _t, il, sl, Wt, ol, ul, ll, dl, pl, cl, ml, fl, hl, gl, Et, _l, yl, wl, bl, vl, $l, xl, kl, Sl, El, Tl, Tt, Il, Ka, Bi, It, zl, Cl, Al, Rl, Ol, Bl, Dl, Ml, Nl, Pl, zt, Ul, Ll, Fl, ql, Wl, Gl, Vl, Hl, jl, Kl, Xa, Di, Xl, Zl, Mi, Yl, Ql, Za, Jl, ed, td, aa, rd, ad, Ya, nd, id, sd, od, ud, ld, dd, pd, cd, md, Me, fd, hd, gd, _d, yd, wd, bd, vd, $d, xd, kd, Sd, Ed, Td, na, Id, Qa, zd, Cd, Ad, Rd, Od, Bd, Dd, Md, Nd, Pd, Ud, Ld, Fd, qd, Wd, Gd, Ni, Vd, Pi, Ui, Hd, jd, Kd, Xd, Zd, Yd, Ja, Qd, Jd, ep, tp, rp, ap, Ct, np, ip, sp, op, up, lp, dp, pp, cp, mp, fp, hp, gp, _p, yp, wp, bp, vp, vr, $r, xr, Li, nr, st, $p, en, xp, kp, ia, Fi, tn, Sp, Ep, qi, Wi, Tp, Gi, Ip, rn, an, zp, Cp, Ap, Rp, Vi, sa, Op, Hi, Bp, Dp, Mp, Np, Pp, Up, Lp, Fp, nn, qp, sn, ji, Ki, Wp, Gp, Xi, Vp, Hp, jp, Kp, Xp, Zp, Zi, Yp, Qp, Yi, Jp, ec, tc, rc, ac, nc, ic, sc, oc, uc, lc, dc, pc, on, oa, Qi, cc, mc, fc, hc, Ji, gc, _c, yc, wc, bc, es, vc, $c, xc, kc, Sc, Ec, Tc, Ic, zc, Cc, Ac, Rc, Oc, Bc, Dc, Mc, Nc, Pc, Uc, Lc, Fc, qc, Wc, Gc, Vc, Hc, jc, Kc, Xc, Zc, Yc, Nt, Gt, kr, Sr, Qc, Jc, em, tm, rm, am, nm, im, sm, om, um, dt, lm, dm, ts, pm, ua, cm, rs, mm, fm, hm, gm, as, _m, ym, ns, wm, un, bm, is, vm, $m, ss, xm, km, Sm, os, Em, Tm, Im, zm, Cm, Am, Rm, Om, Bm, Dm, Mm, Nm, Pm, Um, Lm, Fm, qm, Wm, Gm, Vm, Hm, jm, Km, Xm, Zm, Ym, Qm, la, us, ls, ds, ps, Jm, ef, cs, ms, tf, rf, fs, af, nf, hs, sf, of, uf, lf, df, pf, cf, mf, ff, hf, gf, _f, yf, wf, bf, vf, $f, xf, kf, Sf, Ef, Tf, gs, If, zf, Cf, Af, Rf, Of, Bf, Df, _s, Mf, Nf, Pf, Uf, Lf, Ff, qf, Wf, Gf, Vf, Hf, jf, Kf, da, Xf, ys, Zf, Yf, Qf, Jf, eh, th, rh, ah, nh, ih, ws, sh, oh, uh, lh, dh, ph, ch, mh, fh, hh, gh, _h, yh, bs, wh, bh, vh, $h, xh, vs, ln, kh, Sh, Eh, Th, $s, xs, ir, Ih, ks, dn, Ss, Es, Ts, Is, zs, Cs, As, sr, wt, Lr, pa, ca, pn, Rs, cn, Er, Tr, zh, Ch, Ah, Rh, Oh, Bh, Dh, Mh, Os, Bs, Nh, Ph, Uh, Ds, Ms, Ns, Lh, Fh, qh, Wh, w0 = xo((() => {
		Ra = Object.defineProperty, To = Object.getOwnPropertyDescriptor, Io = Object.getOwnPropertyNames, zo = Object.prototype.hasOwnProperty, Co = ((e) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(e, { get: (t, r) => (typeof require < "u" ? require : t)[r] }) : e)(function(e) {
			if (typeof require < "u") return require.apply(this, arguments);
			throw Error("Dynamic require of \"" + e + "\" is not supported");
		}), Z = (e, t) => () => (e && (t = e(e = 0)), t), hr = (e, t) => {
			for (var r in t) Ra(e, r, {
				get: t[r],
				enumerable: !0
			});
		}, Ao = (e, t, r, a) => {
			if (t && typeof t == "object" || typeof t == "function") for (let n of Io(t)) !zo.call(e, n) && n !== r && Ra(e, n, {
				get: () => t[n],
				enumerable: !(a = To(t, n)) || a.enumerable
			});
			return e;
		}, Mr = (e) => Ao(Ra({}, "__esModule", { value: !0 }), e), Hn = Z(() => {
			"use strict";
			Yr = /* @__PURE__ */ new Map(), Jt = [], gr = (e, t, r) => {
				if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
					let a = Yr.get(e);
					if (a === void 0) Yr.set(e, {
						backend: t,
						priority: r
					});
					else {
						if (a.priority > r) return;
						if (a.priority === r && a.backend !== t) throw new Error(`cannot register backend "${e}" using priority ${r}`);
					}
					if (r >= 0) {
						let n = Jt.indexOf(e);
						n !== -1 && Jt.splice(n, 1);
						for (let i = 0; i < Jt.length; i++) if (Yr.get(Jt[i]).priority <= r) {
							Jt.splice(i, 0, e);
							return;
						}
						Jt.push(e);
					}
					return;
				}
				throw new TypeError("not a valid backend");
			}, Ro = async (e) => {
				let t = Yr.get(e);
				if (!t) return "backend not found.";
				if (t.initialized) return t.backend;
				if (t.aborted) return t.error;
				{
					let r = !!t.initPromise;
					try {
						return r || (t.initPromise = t.backend.init(e)), await t.initPromise, t.initialized = !0, t.backend;
					} catch (a) {
						return r || (t.error = `${a}`, t.aborted = !0), t.error;
					} finally {
						delete t.initPromise;
					}
				}
			}, Oo = async (e) => {
				let t = e.executionProviders || [], r = t.map((d) => typeof d == "string" ? d : d.name), a = r.length === 0 ? Jt : r, n, i = [], s = /* @__PURE__ */ new Set();
				for (let d of a) {
					let c = await Ro(d);
					typeof c == "string" ? i.push({
						name: d,
						err: c
					}) : (n || (n = c), n === c && s.add(d));
				}
				if (!n) throw new Error(`no available backend found. ERR: ${i.map((d) => `[${d.name}] ${d.err}`).join(", ")}`);
				for (let { name: d, err: c } of i) r.includes(d) && console.warn(`removing requested execution provider "${d}" from session options because it is not available: ${c}`);
				let l = t.filter((d) => s.has(typeof d == "string" ? d : d.name));
				return [n, new Proxy(e, { get: (d, c) => c === "executionProviders" ? l : Reflect.get(d, c) })];
			};
		}), Bo = Z(() => {
			"use strict";
			Hn();
		}), Mo = Z(() => {
			"use strict";
			Do = "1.27.0";
		}), Kn = Z(() => {
			"use strict";
			Mo(), jn = "warning", it = {
				wasm: {},
				webgl: {},
				webgpu: {},
				versions: { common: Do },
				set logLevel(e) {
					if (e !== void 0) {
						if (typeof e != "string" || [
							"verbose",
							"info",
							"warning",
							"error",
							"fatal"
						].indexOf(e) === -1) throw new Error(`Unsupported logging level: ${e}`);
						jn = e;
					}
				},
				get logLevel() {
					return jn;
				}
			}, Object.defineProperty(it, "logLevel", { enumerable: !0 });
		}), No = Z(() => {
			"use strict";
			Kn(), He = it;
		}), Lo = Z(() => {
			"use strict";
			Po = (e, t) => {
				let r = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
				r.width = e.dims[3], r.height = e.dims[2];
				let a = r.getContext("2d");
				if (a != null) {
					let n, i;
					t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (n = e.dims[2], i = e.dims[3]) : (n = e.dims[3], i = e.dims[2]);
					let s = t?.format !== void 0 ? t.format : "RGB", l = t?.norm, d, c;
					l === void 0 || l.mean === void 0 ? d = [
						255,
						255,
						255,
						255
					] : typeof l.mean == "number" ? d = [
						l.mean,
						l.mean,
						l.mean,
						l.mean
					] : (d = [
						l.mean[0],
						l.mean[1],
						l.mean[2],
						0
					], l.mean[3] !== void 0 && (d[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? c = [
						0,
						0,
						0,
						0
					] : typeof l.bias == "number" ? c = [
						l.bias,
						l.bias,
						l.bias,
						l.bias
					] : (c = [
						l.bias[0],
						l.bias[1],
						l.bias[2],
						0
					], l.bias[3] !== void 0 && (c[3] = l.bias[3]));
					let h = i * n, f = 0, w = h, v = h * 2, $ = -1;
					s === "RGBA" ? (f = 0, w = h, v = h * 2, $ = h * 3) : s === "RGB" ? (f = 0, w = h, v = h * 2) : s === "RBG" && (f = 0, v = h, w = h * 2);
					for (let k = 0; k < i; k++) for (let C = 0; C < n; C++) {
						let I = (e.data[f++] - c[0]) * d[0], E = (e.data[w++] - c[1]) * d[1], A = (e.data[v++] - c[2]) * d[2], z = $ === -1 ? 255 : (e.data[$++] - c[3]) * d[3];
						a.fillStyle = "rgba(" + I + "," + E + "," + A + "," + z + ")", a.fillRect(C, k, 1, 1);
					}
					if ("toDataURL" in r) return r.toDataURL();
					throw new Error("toDataURL is not supported");
				} else throw new Error("Can not access image data");
			}, Uo = (e, t) => {
				let r = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), a;
				if (r != null) {
					let n, i, s;
					t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (n = e.dims[2], i = e.dims[1], s = e.dims[3]) : (n = e.dims[3], i = e.dims[2], s = e.dims[1]);
					let l = t !== void 0 && t.format !== void 0 ? t.format : "RGB", d = t?.norm, c, h;
					d === void 0 || d.mean === void 0 ? c = [
						255,
						255,
						255,
						255
					] : typeof d.mean == "number" ? c = [
						d.mean,
						d.mean,
						d.mean,
						d.mean
					] : (c = [
						d.mean[0],
						d.mean[1],
						d.mean[2],
						255
					], d.mean[3] !== void 0 && (c[3] = d.mean[3])), d === void 0 || d.bias === void 0 ? h = [
						0,
						0,
						0,
						0
					] : typeof d.bias == "number" ? h = [
						d.bias,
						d.bias,
						d.bias,
						d.bias
					] : (h = [
						d.bias[0],
						d.bias[1],
						d.bias[2],
						0
					], d.bias[3] !== void 0 && (h[3] = d.bias[3]));
					let f = i * n;
					if (t !== void 0 && (t.format !== void 0 && s === 4 && t.format !== "RGBA" || s === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
					let w = 4, v = 0, $ = 1, k = 2, C = 3, I = 0, E = f, A = f * 2, z = -1;
					l === "RGBA" ? (I = 0, E = f, A = f * 2, z = f * 3) : l === "RGB" ? (I = 0, E = f, A = f * 2) : l === "RBG" && (I = 0, A = f, E = f * 2), a = r.createImageData(n, i);
					for (let B = 0; B < i * n; v += w, $ += w, k += w, C += w, B++) a.data[v] = (e.data[I++] - h[0]) * c[0], a.data[$] = (e.data[E++] - h[1]) * c[1], a.data[k] = (e.data[A++] - h[2]) * c[2], a.data[C] = z === -1 ? 255 : (e.data[z++] - h[3]) * c[3];
				} else throw new Error("Can not access image data");
				return a;
			};
		}), Ho = Z(() => {
			"use strict";
			Ba(), Oa = (e, t) => {
				if (e === void 0) throw new Error("Image buffer must be defined");
				if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
				if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
				let { height: r, width: a } = t, n = t.norm ?? {
					mean: 255,
					bias: 0
				}, i, s;
				typeof n.mean == "number" ? i = [
					n.mean,
					n.mean,
					n.mean,
					n.mean
				] : i = [
					n.mean[0],
					n.mean[1],
					n.mean[2],
					n.mean[3] ?? 255
				], typeof n.bias == "number" ? s = [
					n.bias,
					n.bias,
					n.bias,
					n.bias
				] : s = [
					n.bias[0],
					n.bias[1],
					n.bias[2],
					n.bias[3] ?? 0
				];
				let l = t.format !== void 0 ? t.format : "RGBA", d = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", c = r * a, h = d === "RGBA" ? new Float32Array(c * 4) : new Float32Array(c * 3), f = 4, w = 0, v = 1, $ = 2, k = 3, C = 0, I = c, E = c * 2, A = -1;
				l === "RGB" && (f = 3, w = 0, v = 1, $ = 2, k = -1), d === "RGBA" ? A = c * 3 : d === "RBG" ? (C = 0, E = c, I = c * 2) : d === "BGR" && (E = 0, I = c, C = c * 2);
				for (let z = 0; z < c; z++, w += f, $ += f, v += f, k += f) h[C++] = (e[w] + s[0]) / i[0], h[I++] = (e[v] + s[1]) / i[1], h[E++] = (e[$] + s[2]) / i[2], A !== -1 && k !== -1 && (h[A++] = (e[k] + s[3]) / i[3]);
				return d === "RGBA" ? new ft("float32", h, [
					1,
					4,
					r,
					a
				]) : new ft("float32", h, [
					1,
					3,
					r,
					a
				]);
			}, Fo = async (e, t) => {
				let r = typeof HTMLImageElement < "u" && e instanceof HTMLImageElement, a = typeof ImageData < "u" && e instanceof ImageData, n = typeof ImageBitmap < "u" && e instanceof ImageBitmap, i = typeof e == "string", s, l = t ?? {}, d = () => {
					if (typeof document < "u") return document.createElement("canvas");
					if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
					throw new Error("Canvas is not supported");
				}, c = (h) => typeof HTMLCanvasElement < "u" && h instanceof HTMLCanvasElement || h instanceof OffscreenCanvas ? h.getContext("2d") : null;
				if (r) {
					let h = d();
					h.width = e.width, h.height = e.height;
					let f = c(h);
					if (f != null) {
						let w = e.height, v = e.width;
						if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (w = t.resizedHeight, v = t.resizedWidth), t !== void 0) {
							if (l = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
							l.tensorFormat = "RGBA", l.height = w, l.width = v;
						} else l.tensorFormat = "RGBA", l.height = w, l.width = v;
						f.drawImage(e, 0, 0), s = f.getImageData(0, 0, v, w).data;
					} else throw new Error("Can not access image data");
				} else if (a) {
					let h, f;
					if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (h = t.resizedHeight, f = t.resizedWidth) : (h = e.height, f = e.width), t !== void 0 && (l = t), l.format = "RGBA", l.height = h, l.width = f, t !== void 0) {
						let w = d();
						w.width = f, w.height = h;
						let v = c(w);
						if (v != null) v.putImageData(e, 0, 0), s = v.getImageData(0, 0, f, h).data;
						else throw new Error("Can not access image data");
					} else s = e.data;
				} else if (n) {
					if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
					let h = d();
					h.width = e.width, h.height = e.height;
					let f = c(h);
					if (f != null) {
						let w = e.height, v = e.width;
						return f.drawImage(e, 0, 0, v, w), s = f.getImageData(0, 0, v, w).data, l.height = w, l.width = v, Oa(s, l);
					} else throw new Error("Can not access image data");
				} else {
					if (i) return new Promise((h, f) => {
						let w = d(), v = c(w);
						if (!e || !v) return f();
						let $ = new Image();
						$.crossOrigin = "Anonymous", $.src = e, $.onload = () => {
							w.width = $.width, w.height = $.height, v.drawImage($, 0, 0, w.width, w.height);
							let k = v.getImageData(0, 0, w.width, w.height);
							l.height = w.height, l.width = w.width, h(Oa(k.data, l));
						};
					});
					throw new Error("Input data provided is not supported - aborted tensor creation");
				}
				if (s !== void 0) return Oa(s, l);
				throw new Error("Input data provided is not supported - aborted tensor creation");
			}, qo = (e, t) => {
				let { width: r, height: a, download: n, dispose: i } = t;
				return new ft({
					location: "texture",
					type: "float32",
					texture: e,
					dims: [
						1,
						a,
						r,
						4
					],
					download: n,
					dispose: i
				});
			}, Wo = (e, t) => {
				let { dataType: r, dims: a, download: n, dispose: i } = t;
				return new ft({
					location: "gpu-buffer",
					type: r ?? "float32",
					gpuBuffer: e,
					dims: a,
					download: n,
					dispose: i
				});
			}, Go = (e, t) => {
				let { dataType: r, dims: a, download: n, dispose: i } = t;
				return new ft({
					location: "ml-tensor",
					type: r ?? "float32",
					mlTensor: e,
					dims: a,
					download: n,
					dispose: i
				});
			}, Vo = (e, t, r) => new ft({
				location: "cpu-pinned",
				type: e,
				data: t,
				dims: r ?? [t.length]
			});
		}), Ko = Z(() => {
			"use strict";
			_r = /* @__PURE__ */ new Map([
				["float32", Float32Array],
				["uint8", Uint8Array],
				["int8", Int8Array],
				["uint16", Uint16Array],
				["int16", Int16Array],
				["int32", Int32Array],
				["bool", Uint8Array],
				["float64", Float64Array],
				["uint32", Uint32Array],
				["int4", Uint8Array],
				["uint4", Uint8Array]
			]), Qr = /* @__PURE__ */ new Map([
				[Float32Array, "float32"],
				[Uint8Array, "uint8"],
				[Int8Array, "int8"],
				[Uint16Array, "uint16"],
				[Int16Array, "int16"],
				[Int32Array, "int32"],
				[Float64Array, "float64"],
				[Uint32Array, "uint32"]
			]), Xn = !1, jo = () => {
				if (!Xn) {
					Xn = !0;
					let e = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, r = globalThis.Float16Array, a = typeof r < "u" && r.from;
					e && (_r.set("int64", BigInt64Array), Qr.set(BigInt64Array, "int64")), t && (_r.set("uint64", BigUint64Array), Qr.set(BigUint64Array, "uint64")), a ? (_r.set("float16", r), Qr.set(r, "float16")) : _r.set("float16", Uint16Array);
				}
			};
		}), Yo = Z(() => {
			"use strict";
			Ba(), Xo = (e) => {
				let t = 1;
				for (let r = 0; r < e.length; r++) {
					let a = e[r];
					if (typeof a != "number" || !Number.isSafeInteger(a)) throw new TypeError(`dims[${r}] must be an integer, got: ${a}`);
					if (a < 0) throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${a}`);
					t *= a;
				}
				return t;
			}, Zo = (e, t) => {
				switch (e.location) {
					case "cpu": return new ft(e.type, e.data, t);
					case "cpu-pinned": return new ft({
						location: "cpu-pinned",
						data: e.data,
						type: e.type,
						dims: t
					});
					case "texture": return new ft({
						location: "texture",
						texture: e.texture,
						type: e.type,
						dims: t
					});
					case "gpu-buffer": return new ft({
						location: "gpu-buffer",
						gpuBuffer: e.gpuBuffer,
						type: e.type,
						dims: t
					});
					case "ml-tensor": return new ft({
						location: "ml-tensor",
						mlTensor: e.mlTensor,
						type: e.type,
						dims: t
					});
					default: throw new Error(`tensorReshape: tensor location ${e.location} is not supported`);
				}
			};
		}), Ba = Z(() => {
			"use strict";
			Lo(), Ho(), Ko(), Yo(), ft = class {
				constructor(e, t, r) {
					jo();
					let a, n;
					if (typeof e == "object" && "location" in e) switch (this.dataLocation = e.location, a = e.type, n = e.dims, e.location) {
						case "cpu-pinned": {
							let s = _r.get(a);
							if (!s) throw new TypeError(`unsupported type "${a}" to create tensor from pinned buffer`);
							if (!(e.data instanceof s)) throw new TypeError(`buffer should be of type ${s.name}`);
							this.cpuData = e.data;
							break;
						}
						case "texture":
							if (a !== "float32") throw new TypeError(`unsupported type "${a}" to create tensor from texture`);
							this.gpuTextureData = e.texture, this.downloader = e.download, this.disposer = e.dispose;
							break;
						case "gpu-buffer":
							if (a !== "float32" && a !== "float16" && a !== "int32" && a !== "int64" && a !== "uint32" && a !== "uint8" && a !== "bool" && a !== "uint4" && a !== "int4") throw new TypeError(`unsupported type "${a}" to create tensor from gpu buffer`);
							this.gpuBufferData = e.gpuBuffer, this.downloader = e.download, this.disposer = e.dispose;
							break;
						case "ml-tensor":
							if (a !== "float32" && a !== "float16" && a !== "int32" && a !== "int64" && a !== "uint32" && a !== "uint64" && a !== "int8" && a !== "uint8" && a !== "bool" && a !== "uint4" && a !== "int4") throw new TypeError(`unsupported type "${a}" to create tensor from MLTensor`);
							this.mlTensorData = e.mlTensor, this.downloader = e.download, this.disposer = e.dispose;
							break;
						default: throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
					}
					else {
						let s, l;
						if (typeof e == "string") if (a = e, l = r, e === "string") {
							if (!Array.isArray(t)) throw new TypeError("A string tensor's data must be a string array.");
							s = t;
						} else {
							let d = _r.get(e);
							if (d === void 0) throw new TypeError(`Unsupported tensor type: ${e}.`);
							if (Array.isArray(t)) {
								if (e === "float16" && d === Uint16Array || e === "uint4" || e === "int4") throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${d.name} as data.`);
								e === "uint64" || e === "int64" ? s = d.from(t, BigInt) : s = d.from(t);
							} else if (t instanceof d) s = t;
							else if (t instanceof Uint8ClampedArray) if (e === "uint8") s = Uint8Array.from(t);
							else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
							else if (e === "float16" && t instanceof Uint16Array && d !== Uint16Array) s = new globalThis.Float16Array(t.buffer, t.byteOffset, t.length);
							else throw new TypeError(`A ${a} tensor's data must be type of ${d}`);
						}
						else if (l = t, Array.isArray(e)) {
							if (e.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
							let d = typeof e[0];
							if (d === "string") a = "string", s = e;
							else if (d === "boolean") a = "bool", s = Uint8Array.from(e);
							else throw new TypeError(`Invalid element type of data array: ${d}.`);
						} else if (e instanceof Uint8ClampedArray) a = "uint8", s = Uint8Array.from(e);
						else {
							let d = Qr.get(e.constructor);
							if (d === void 0) throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);
							a = d, s = e;
						}
						if (l === void 0) l = [s.length];
						else if (!Array.isArray(l)) throw new TypeError("A tensor's dims must be a number array");
						n = l, this.cpuData = s, this.dataLocation = "cpu";
					}
					let i = Xo(n);
					if (this.cpuData && i !== this.cpuData.length && !((a === "uint4" || a === "int4") && Math.ceil(i / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${i}) does not match data length(${this.cpuData.length}).`);
					this.type = a, this.dims = n, this.size = i;
				}
				static async fromImage(e, t) {
					return Fo(e, t);
				}
				static fromTexture(e, t) {
					return qo(e, t);
				}
				static fromGpuBuffer(e, t) {
					return Wo(e, t);
				}
				static fromMLTensor(e, t) {
					return Go(e, t);
				}
				static fromPinnedBuffer(e, t, r) {
					return Vo(e, t, r);
				}
				toDataURL(e) {
					return Po(this, e);
				}
				toImageData(e) {
					return Uo(this, e);
				}
				get data() {
					if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
					return this.cpuData;
				}
				get location() {
					return this.dataLocation;
				}
				get texture() {
					if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
					return this.gpuTextureData;
				}
				get gpuBuffer() {
					if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
					return this.gpuBufferData;
				}
				get mlTensor() {
					if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
					return this.mlTensorData;
				}
				async getData(e) {
					switch (this.ensureValid(), this.dataLocation) {
						case "cpu":
						case "cpu-pinned": return this.data;
						case "texture":
						case "gpu-buffer":
						case "ml-tensor":
							if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
							if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
							try {
								this.isDownloading = !0;
								let t = await this.downloader();
								return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = t, e && this.disposer && (this.disposer(), this.disposer = void 0), t;
							} finally {
								this.isDownloading = !1;
							}
						default: throw new Error(`cannot get data from location: ${this.dataLocation}`);
					}
				}
				dispose() {
					if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
					this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
				}
				ensureValid() {
					if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
				}
				reshape(e) {
					if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
					return Zo(this, e);
				}
			};
		}), Zn = Z(() => {
			"use strict";
			Ba(), xt = ft;
		}), Qn = Z(() => {
			"use strict";
			Kn(), Jr = (e, t) => {
				(typeof it.trace > "u" ? !it.wasm.trace : !it.trace) || console.timeStamp(`${e}::ORT::${t}`);
			}, Yn = (e, t) => {
				let r = (/* @__PURE__ */ new Error()).stack?.split(/\r\n|\r|\n/g) || [], a = !1;
				for (let n = 0; n < r.length; n++) {
					if (a && !r[n].includes("TRACE_FUNC")) {
						let i = `FUNC_${e}::${r[n].trim().split(" ")[1]}`;
						t && (i += `::${t}`), Jr("CPU", i);
						return;
					}
					r[n].includes("TRACE_FUNC") && (a = !0);
				}
			}, kt = (e) => {
				(typeof it.trace > "u" ? !it.wasm.trace : !it.trace) || Yn("BEGIN", e);
			}, yt = (e) => {
				(typeof it.trace > "u" ? !it.wasm.trace : !it.trace) || Yn("END", e);
			}, er = (e) => {
				(typeof it.trace > "u" ? !it.wasm.trace : !it.trace) || console.time(`ORT::${e}`);
			}, tr = (e) => {
				(typeof it.trace > "u" ? !it.wasm.trace : !it.trace) || console.timeEnd(`ORT::${e}`);
			};
		}), Jo = Z(() => {
			"use strict";
			Hn(), Zn(), Qn(), Qo = class m0 {
				constructor(t) {
					this.handler = t;
				}
				async run(t, r, a) {
					kt(), er("InferenceSession.run");
					let n = {}, i = {};
					if (typeof t != "object" || t === null || t instanceof xt || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
					let s = !0;
					if (typeof r == "object") {
						if (r === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
						if (r instanceof xt) throw new TypeError("'fetches' cannot be a Tensor");
						if (Array.isArray(r)) {
							if (r.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
							s = !1;
							for (let c of r) {
								if (typeof c != "string") throw new TypeError("'fetches' must be a string array or an object.");
								if (this.outputNames.indexOf(c) === -1) throw new RangeError(`'fetches' contains invalid output name: ${c}.`);
								n[c] = null;
							}
							if (typeof a == "object" && a !== null) i = a;
							else if (typeof a < "u") throw new TypeError("'options' must be an object.");
						} else {
							let c = !1, h = Object.getOwnPropertyNames(r);
							for (let f of this.outputNames) if (h.indexOf(f) !== -1) {
								let w = r[f];
								(w === null || w instanceof xt) && (c = !0, s = !1, n[f] = w);
							}
							if (c) {
								if (typeof a == "object" && a !== null) i = a;
								else if (typeof a < "u") throw new TypeError("'options' must be an object.");
							} else i = r;
						}
					} else if (typeof r < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
					for (let c of this.inputNames) if (typeof t[c] > "u") throw new Error(`input '${c}' is missing in 'feeds'.`);
					if (s) for (let c of this.outputNames) n[c] = null;
					let l = await this.handler.run(t, n, i), d = {};
					for (let c in l) if (Object.hasOwnProperty.call(l, c)) {
						let h = l[c];
						h instanceof xt ? d[c] = h : d[c] = new xt(h.type, h.data, h.dims);
					}
					return tr("InferenceSession.run"), yt(), d;
				}
				async release() {
					return this.handler.dispose();
				}
				static async create(t, r, a, n) {
					kt(), er("InferenceSession.create");
					let i, s = {};
					if (typeof t == "string") {
						if (i = t, typeof r == "object" && r !== null) s = r;
						else if (typeof r < "u") throw new TypeError("'options' must be an object.");
					} else if (t instanceof Uint8Array) {
						if (i = t, typeof r == "object" && r !== null) s = r;
						else if (typeof r < "u") throw new TypeError("'options' must be an object.");
					} else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
						let h = t, f = 0, w = t.byteLength;
						if (typeof r == "object" && r !== null) s = r;
						else if (typeof r == "number") {
							if (f = r, !Number.isSafeInteger(f)) throw new RangeError("'byteOffset' must be an integer.");
							if (f < 0 || f >= h.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);
							if (w = t.byteLength - f, typeof a == "number") {
								if (w = a, !Number.isSafeInteger(w)) throw new RangeError("'byteLength' must be an integer.");
								if (w <= 0 || f + w > h.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength - f}].`);
								if (typeof n == "object" && n !== null) s = n;
								else if (typeof n < "u") throw new TypeError("'options' must be an object.");
							} else if (typeof a < "u") throw new TypeError("'byteLength' must be a number.");
						} else if (typeof r < "u") throw new TypeError("'options' must be an object.");
						i = new Uint8Array(h, f, w);
					} else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
					let [l, d] = await Oo(s), c = await l.createInferenceSessionHandler(i, d);
					return tr("InferenceSession.create"), yt(), new m0(c);
				}
				startProfiling() {
					this.handler.startProfiling();
				}
				endProfiling() {
					this.handler.endProfiling();
				}
				get inputNames() {
					return this.handler.inputNames;
				}
				get outputNames() {
					return this.handler.outputNames;
				}
				get inputMetadata() {
					return this.handler.inputMetadata;
				}
				get outputMetadata() {
					return this.handler.outputMetadata;
				}
			};
		}), eu = Z(() => {
			"use strict";
			Jo(), Jn = Qo;
		}), tu = Z(() => {
			"use strict";
		}), ru = Z(() => {
			"use strict";
		}), au = Z(() => {
			"use strict";
		}), nu = Z(() => {
			"use strict";
		}), ei = {}, hr(ei, {
			InferenceSession: () => Jn,
			TRACE: () => Jr,
			TRACE_EVENT_BEGIN: () => er,
			TRACE_EVENT_END: () => tr,
			TRACE_FUNC_BEGIN: () => kt,
			TRACE_FUNC_END: () => yt,
			Tensor: () => xt,
			env: () => He,
			registerBackend: () => gr
		}), ht = Z(() => {
			"use strict";
			Bo(), No(), eu(), Zn(), tu(), ru(), Qn(), au(), nu();
		}), Da = Z(() => {
			"use strict";
		}), ti = {}, hr(ti, { default: () => iu }), su = Z(() => {
			"use strict";
			As(), rr(), Na(), ri = "ort-wasm-proxy-worker", ai = globalThis.self?.name === ri, ai && (self.onmessage = (e) => {
				let { type: t, in: r } = e.data;
				try {
					switch (t) {
						case "init-wasm":
							ci(r.wasm).then(() => {
								$s(r).then(() => {
									postMessage({ type: t });
								}, (a) => {
									postMessage({
										type: t,
										err: a
									});
								});
							}, (a) => {
								postMessage({
									type: t,
									err: a
								});
							});
							break;
						case "init-ep": {
							let { epName: a, env: n } = r;
							xs(n, a).then(() => {
								postMessage({ type: t });
							}, (i) => {
								postMessage({
									type: t,
									err: i
								});
							});
							break;
						}
						case "copy-from": {
							let { buffer: a } = r, n = dn(a);
							postMessage({
								type: t,
								out: n
							});
							break;
						}
						case "create": {
							let { model: a, options: n } = r;
							Ss(a, n).then((i) => {
								postMessage({
									type: t,
									out: i
								});
							}, (i) => {
								postMessage({
									type: t,
									err: i
								});
							});
							break;
						}
						case "release":
							Es(r), postMessage({ type: t });
							break;
						case "run": {
							let { sessionId: a, inputIndices: n, inputs: i, outputIndices: s, options: l } = r;
							Is(a, n, i, s, new Array(s.length).fill(null), l).then((d) => {
								d.some((c) => c[3] !== "cpu") ? postMessage({
									type: t,
									err: "Proxy does not support non-cpu tensor location."
								}) : postMessage({
									type: t,
									out: d
								}, Cs([...i, ...d]));
							}, (d) => {
								postMessage({
									type: t,
									err: d
								});
							});
							break;
						}
						case "end-profiling": zs(r), postMessage({ type: t });
					}
				} catch (a) {
					postMessage({
						type: t,
						err: a
					});
				}
			}), iu = ai ? null : (e) => new Worker(e ?? gt, {
				type: "module",
				name: ri
			});
		}), ni = {}, hr(ni, { default: () => ou }), lu = Z(() => {
			"use strict";
			ou = Eo, uu = globalThis.self?.name?.startsWith("em-pthread"), uu && Eo();
		}), Na = Z(() => {
			"use strict";
			Da(), ii = typeof location > "u" ? void 0 : location.origin, si = self.location.href > "file:" && self.location.href < "file;", du = () => si ? new URL(new URL("ort.bundle.min.mjs", self.location.href).href, ii).href : self.location.href, gt = du(), pu = () => {
				if (gt && !gt.startsWith("blob:")) return gt.substring(0, gt.lastIndexOf("/") + 1);
			}, Ma = (e, t) => {
				try {
					let r = t ?? gt;
					return (r ? new URL(e, r) : new URL(e)).origin === ii;
				} catch {
					return !1;
				}
			}, cu = (e, t) => {
				let r = t ?? gt;
				try {
					return (r ? new URL(e, r) : new URL(e)).href;
				} catch {
					return;
				}
			}, mu = (e, t) => `${t ?? "./"}${e}`, oi = async (e) => {
				let t = await (await fetch(e, { credentials: "same-origin" })).blob();
				return URL.createObjectURL(t);
			}, fu = async (e) => (await import(e)).default, ui = (su(), Mr(ti)).default, hu = async () => {
				if (!gt) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
				if (Ma(gt)) return [void 0, ui()];
				let e = await oi(gt);
				return [e, ui(e)];
			}, li = (lu(), Mr(ni)).default, gu = async (e, t, r, a) => {
				let n = li && !(e || t);
				if (n) if (gt) n = Ma(gt) || a && !r;
				else if (a && !r) n = !0;
				else throw new Error("cannot determine the script source URL.");
				if (n) return [void 0, li];
				{
					let i = "ort-wasm-simd-threaded.jsep.mjs", s = e ?? cu(i, t), l = r && s && !Ma(s, t), d = l ? await oi(s) : s ?? mu(i, t);
					return [l ? d : void 0, await fu(d)];
				}
			};
		}), rr = Z(() => {
			"use strict";
			Na(), Pa = !1, ea = !1, pi = !1, _u = () => {
				if (typeof SharedArrayBuffer > "u") return !1;
				try {
					return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([
						0,
						97,
						115,
						109,
						1,
						0,
						0,
						0,
						1,
						4,
						1,
						96,
						0,
						0,
						3,
						2,
						1,
						0,
						5,
						4,
						1,
						3,
						1,
						1,
						10,
						11,
						1,
						9,
						0,
						65,
						0,
						254,
						16,
						2,
						0,
						26,
						11
					]));
				} catch {
					return !1;
				}
			}, yu = () => {
				try {
					return WebAssembly.validate(new Uint8Array([
						0,
						97,
						115,
						109,
						1,
						0,
						0,
						0,
						1,
						4,
						1,
						96,
						0,
						0,
						3,
						2,
						1,
						0,
						10,
						30,
						1,
						28,
						0,
						65,
						0,
						253,
						15,
						253,
						12,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						0,
						253,
						186,
						1,
						26,
						11
					]));
				} catch {
					return !1;
				}
			}, wu = () => {
				try {
					return WebAssembly.validate(new Uint8Array([
						0,
						97,
						115,
						109,
						1,
						0,
						0,
						0,
						1,
						5,
						1,
						96,
						0,
						1,
						123,
						3,
						2,
						1,
						0,
						10,
						19,
						1,
						17,
						0,
						65,
						1,
						253,
						15,
						65,
						2,
						253,
						15,
						65,
						3,
						253,
						15,
						253,
						147,
						2,
						11
					]));
				} catch {
					return !1;
				}
			}, ci = async (e) => {
				if (Pa) return Promise.resolve();
				if (ea) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
				if (pi) throw new Error("previous call to 'initializeWebAssembly()' failed.");
				ea = !0;
				let t = e.initTimeout, r = e.numThreads;
				if (e.simd !== !1) {
					if (e.simd === "relaxed") {
						if (!wu()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
					} else if (!yu()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
				}
				let a = _u();
				r > 1 && !a && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + r + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), e.numThreads = r = 1);
				let n = e.wasmPaths, i = typeof n == "string" ? n : void 0, s = n?.mjs, l = s?.href ?? s, d = n?.wasm, c = d?.href ?? d, h = e.wasmBinary, [f, w] = await gu(l, i, r > 1, !!h || !!c), v = !1, $ = [];
				if (t > 0 && $.push(new Promise((k) => {
					setTimeout(() => {
						v = !0, k();
					}, t);
				})), $.push(new Promise((k, C) => {
					let I = { numThreads: r };
					if (h) I.wasmBinary = h, I.locateFile = (E) => E;
					else if (c || i) I.locateFile = (E) => c ?? i + E;
					else if (l && l.indexOf("blob:") !== 0) I.locateFile = (E) => new URL(E, l).href;
					else if (f) {
						let E = pu();
						E && (I.locateFile = (A) => E + A);
					}
					w(I).then((E) => {
						ea = !1, Pa = !0, di = E, k(), f && URL.revokeObjectURL(f);
					}, (E) => {
						ea = !1, pi = !0, C(E);
					});
				})), await Promise.race($), v) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
			}, We = () => {
				if (Pa && di) return di;
				throw new Error("WebAssembly is not initialized yet.");
			};
		}), La = Z(() => {
			"use strict";
			rr(), St = (e, t) => {
				let r = We(), a = r.lengthBytesUTF8(e) + 1, n = r._malloc(a);
				return r.stringToUTF8(e, n, a), t.push(n), n;
			}, Ua = (e, t, r, a) => {
				if (typeof e == "object" && e !== null) {
					if (r.has(e)) throw new Error("Circular reference in options");
					r.add(e);
				}
				Object.entries(e).forEach(([n, i]) => {
					let s = t ? t + n : n;
					if (typeof i == "object") Ua(i, s + ".", r, a);
					else if (typeof i == "string" || typeof i == "number") a(s, i.toString());
					else if (typeof i == "boolean") a(s, i ? "1" : "0");
					else throw new Error(`Can't handle extra config type: ${typeof i}`);
				});
			}, Le = (e) => {
				let t = We(), r = t.stackSave();
				try {
					let a = t.PTR_SIZE, n = t.stackAlloc(2 * a);
					t._OrtGetLastError(n, n + a);
					let i = Number(t.getValue(n, a === 4 ? "i32" : "i64")), s = t.getValue(n + a, "*"), l = s ? t.UTF8ToString(s) : "";
					throw new Error(`${e} ERROR_CODE: ${i}, ERROR_MESSAGE: ${l}`);
				} finally {
					t.stackRestore(r);
				}
			};
		}), vu = Z(() => {
			"use strict";
			rr(), La(), bu = (e) => {
				let t = We(), r = 0, a = [], n = e || {};
				try {
					if (e?.logSeverityLevel === void 0) n.logSeverityLevel = 2;
					else if (typeof e.logSeverityLevel != "number" || !Number.isInteger(e.logSeverityLevel) || e.logSeverityLevel < 0 || e.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);
					if (e?.logVerbosityLevel === void 0) n.logVerbosityLevel = 0;
					else if (typeof e.logVerbosityLevel != "number" || !Number.isInteger(e.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);
					e?.terminate === void 0 && (n.terminate = !1);
					let i = 0;
					return e?.tag !== void 0 && (i = St(e.tag, a)), r = t._OrtCreateRunOptions(n.logSeverityLevel, n.logVerbosityLevel, !!n.terminate, i), r === 0 && Le("Can't create run options."), e?.extra !== void 0 && Ua(e.extra, "", /* @__PURE__ */ new WeakSet(), (s, l) => {
						let d = St(s, a), c = St(l, a);
						t._OrtAddRunConfigEntry(r, d, c) !== 0 && Le(`Can't set a run config entry: ${s} - ${l}.`);
					}), [r, a];
				} catch (i) {
					throw r !== 0 && t._OrtReleaseRunOptions(r), a.forEach((s) => t._free(s)), i;
				}
			};
		}), Tu = Z(() => {
			"use strict";
			rr(), La(), $u = (e) => {
				switch (e) {
					case "disabled": return 0;
					case "basic": return 1;
					case "extended": return 2;
					case "layout": return 3;
					case "all": return 99;
					default: throw new Error(`unsupported graph optimization level: ${e}`);
				}
			}, xu = (e) => {
				switch (e) {
					case "sequential": return 0;
					case "parallel": return 1;
					default: throw new Error(`unsupported execution mode: ${e}`);
				}
			}, ku = (e) => {
				e.extra || (e.extra = {}), e.extra.session || (e.extra.session = {});
				let t = e.extra.session;
				t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), e.executionProviders && e.executionProviders.some((r) => (typeof r == "string" ? r : r.name) === "webgpu") && (e.enableMemPattern = !1);
			}, yr = (e, t, r, a) => {
				let n = St(t, a), i = St(r, a);
				We()._OrtAddSessionConfigEntry(e, n, i) !== 0 && Le(`Can't set a session config entry: ${t} - ${r}.`);
			}, Su = async (e, t, r) => {
				let a = t.executionProviders;
				for (let n of a) {
					let i = typeof n == "string" ? n : n.name, s = [];
					switch (i) {
						case "webnn":
							if (i = "WEBNN", yr(e, "session.disable_quant_qdq", "1", r), yr(e, "session.disable_qdq_constant_folding", "1", r), typeof n != "string") {
								let f = n?.deviceType;
								f && yr(e, "deviceType", f, r);
							}
							break;
						case "webgpu":
							if (i = "JS", typeof n != "string") {
								let f = n;
								if (f?.preferredLayout) {
									if (f.preferredLayout !== "NCHW" && f.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);
									yr(e, "preferredLayout", f.preferredLayout, r);
								}
							}
							break;
						case "wasm":
						case "cpu": continue;
						default: throw new Error(`not supported execution provider: ${i}`);
					}
					let l = St(i, r), d = s.length, c = 0, h = 0;
					if (d > 0) {
						c = We()._malloc(d * We().PTR_SIZE), r.push(c), h = We()._malloc(d * We().PTR_SIZE), r.push(h);
						for (let f = 0; f < d; f++) We().setValue(c + f * We().PTR_SIZE, s[f][0], "*"), We().setValue(h + f * We().PTR_SIZE, s[f][1], "*");
					}
					await We()._OrtAppendExecutionProvider(e, l, c, h, d) !== 0 && Le(`Can't append execution provider: ${i}.`);
				}
			}, Eu = async (e) => {
				let t = We(), r = 0, a = [], n = e || {};
				ku(n);
				try {
					let i = $u(n.graphOptimizationLevel ?? "all"), s = xu(n.executionMode ?? "sequential"), l = typeof n.logId == "string" ? St(n.logId, a) : 0, d = n.logSeverityLevel ?? 2;
					if (!Number.isInteger(d) || d < 0 || d > 4) throw new Error(`log severity level is not valid: ${d}`);
					let c = n.logVerbosityLevel ?? 0;
					if (!Number.isInteger(c) || c < 0 || c > 4) throw new Error(`log verbosity level is not valid: ${c}`);
					let h = typeof n.optimizedModelFilePath == "string" ? St(n.optimizedModelFilePath, a) : 0;
					if (r = t._OrtCreateSessionOptions(i, !!n.enableCpuMemArena, !!n.enableMemPattern, s, !!n.enableProfiling, 0, l, d, c, h), r === 0 && Le("Can't create session options."), n.executionProviders && await Su(r, n, a), n.enableGraphCapture !== void 0) {
						if (typeof n.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${n.enableGraphCapture}`);
						yr(r, "enableGraphCapture", n.enableGraphCapture.toString(), a);
					}
					if (n.freeDimensionOverrides) for (let [f, w] of Object.entries(n.freeDimensionOverrides)) {
						if (typeof f != "string") throw new Error(`free dimension override name must be a string: ${f}`);
						if (typeof w != "number" || !Number.isInteger(w) || w < 0) throw new Error(`free dimension override value must be a non-negative integer: ${w}`);
						let v = St(f, a);
						t._OrtAddFreeDimensionOverride(r, v, w) !== 0 && Le(`Can't set a free dimension override: ${f} - ${w}.`);
					}
					return n.extra !== void 0 && Ua(n.extra, "", /* @__PURE__ */ new WeakSet(), (f, w) => {
						yr(r, f, w, a);
					}), [r, a];
				} catch (i) {
					throw r !== 0 && t._OrtReleaseSessionOptions(r) !== 0 && Le("Can't release session options."), a.forEach((s) => t._free(s)), i;
				}
			};
		}), fe = Z(() => {
			"use strict";
			wr = (e) => {
				switch (e) {
					case "int8": return 3;
					case "uint8": return 2;
					case "bool": return 9;
					case "int16": return 5;
					case "uint16": return 4;
					case "int32": return 6;
					case "uint32": return 12;
					case "float16": return 10;
					case "float32": return 1;
					case "float64": return 11;
					case "string": return 8;
					case "int64": return 7;
					case "uint64": return 13;
					case "int4": return 22;
					case "uint4": return 21;
					default: throw new Error(`unsupported data type: ${e}`);
				}
			}, qt = (e) => {
				switch (e) {
					case 3: return "int8";
					case 2: return "uint8";
					case 9: return "bool";
					case 5: return "int16";
					case 4: return "uint16";
					case 6: return "int32";
					case 12: return "uint32";
					case 10: return "float16";
					case 1: return "float32";
					case 11: return "float64";
					case 8: return "string";
					case 7: return "int64";
					case 13: return "uint64";
					case 22: return "int4";
					case 21: return "uint4";
					default: throw new Error(`unsupported data type: ${e}`);
				}
			}, br = (e, t) => {
				let r = [
					-1,
					4,
					1,
					1,
					2,
					2,
					4,
					8,
					-1,
					1,
					2,
					8,
					4,
					8,
					-1,
					-1,
					-1,
					-1,
					-1,
					-1,
					-1,
					.5,
					.5
				][e], a = typeof t == "number" ? t : t.reduce((n, i) => n * i, 1);
				return r > 0 ? Math.ceil(a * r) : void 0;
			}, Fa = (e) => {
				switch (e) {
					case "float16": return typeof Float16Array < "u" ? Float16Array : Uint16Array;
					case "float32": return Float32Array;
					case "uint8": return Uint8Array;
					case "int8": return Int8Array;
					case "uint16": return Uint16Array;
					case "int16": return Int16Array;
					case "int32": return Int32Array;
					case "bool": return Uint8Array;
					case "float64": return Float64Array;
					case "uint32": return Uint32Array;
					case "int64": return BigInt64Array;
					case "uint64": return BigUint64Array;
					default: throw new Error(`unsupported type: ${e}`);
				}
			}, qa = (e) => {
				switch (e) {
					case "verbose": return 0;
					case "info": return 1;
					case "warning": return 2;
					case "error": return 3;
					case "fatal": return 4;
					default: throw new Error(`unsupported logging level: ${e}`);
				}
			}, mi = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", fi = (e) => e === "float32" || e === "float16" || e === "int32" || e === "int64" || e === "uint32" || e === "uint64" || e === "int8" || e === "uint8" || e === "bool" || e === "uint4" || e === "int4", hi = (e) => {
				switch (e) {
					case "none": return 0;
					case "cpu": return 1;
					case "cpu-pinned": return 2;
					case "texture": return 3;
					case "gpu-buffer": return 4;
					case "ml-tensor": return 5;
					default: throw new Error(`unsupported data location: ${e}`);
				}
			};
		}), _i = Z(() => {
			"use strict";
			Da(), gi = async (e) => {
				if (typeof e == "string") {
					let t = await fetch(e);
					if (!t.ok) throw new Error(`failed to load external data file: ${e}`);
					let r = t.headers.get("Content-Length"), a = r ? parseInt(r, 10) : 0;
					if (a < 1073741824) return new Uint8Array(await t.arrayBuffer());
					{
						if (!t.body) throw new Error(`failed to load external data file: ${e}, no response body.`);
						let n = t.body.getReader(), i;
						try {
							i = new ArrayBuffer(a);
						} catch (l) {
							if (l instanceof RangeError) {
								let d = Math.ceil(a / 65536);
								i = new WebAssembly.Memory({
									initial: d,
									maximum: d
								}).buffer;
							} else throw l;
						}
						let s = 0;
						for (;;) {
							let { done: l, value: d } = await n.read();
							if (l) break;
							let c = d.byteLength;
							new Uint8Array(i, s, c).set(d), s += c;
						}
						return new Uint8Array(i, 0, a);
					}
				} else return e instanceof Blob ? new Uint8Array(await e.arrayBuffer()) : e instanceof Uint8Array ? e : new Uint8Array(e);
			};
		}), Mt = Z(() => {
			"use strict";
			fe(), Iu = [
				"V",
				"I",
				"W",
				"E",
				"F"
			], zu = (e, t) => {
				console.log(`[${Iu[e]},${(/* @__PURE__ */ new Date()).toISOString()}]${t}`);
			}, yi = (e, t) => {
				Cu = e, Au = t;
			}, Ru = (e, t) => {
				let r = qa(e);
				r >= qa(Cu) && zu(r, typeof t == "function" ? t() : t);
			}, Ce = (...e) => {
				Au && Ru(...e);
			};
		}), we = Z(() => {
			"use strict";
			Ou = class {
				static calcMatMulShape(e, t) {
					return e[1] !== t[0] ? void 0 : [e[0], t[1]];
				}
			}, Nr = class {
				static calcShape(e, t, r = !1) {
					let a = e.length, n = t.length;
					if (a === 0) return t;
					if (n === 0) return e;
					let i = Math.max(e.length, t.length), s = new Array(i);
					if (r) {
						if (a < 2 || n < 2) return;
						let l = Ou.calcMatMulShape([e[a - 2], e[a - 1]], [t[n - 2], t[n - 1]]);
						if (l === void 0) return;
						[s[i - 2], s[i - 1]] = l;
					}
					for (let l = r ? 3 : 1; l <= i; l++) {
						let d = a - l < 0 ? 1 : e[a - l], c = n - l < 0 ? 1 : t[n - l];
						if (d !== c && d > 1 && c > 1) return;
						let h = Math.max(d, c);
						if (d && c) s[i - l] = Math.max(d, c);
						else {
							if (h > 1) return;
							s[i - l] = 0;
						}
					}
					return s;
				}
				static isValidBroadcast(e, t) {
					let r = e.length, a = t.length;
					if (r > a) return !1;
					for (let n = 1; n <= r; n++) if (e[r - n] !== 1 && e[r - n] !== t[a - n]) return !1;
					return !0;
				}
			}, F = class Vn {
				static size(t) {
					return Vn.getSizeFromDimensionRange(t, 0, t.length);
				}
				static convertShape(t, r = 4) {
					let a = t.length;
					if (a === 0) return [];
					let n = new Array(a), i = a - 1;
					for (; i >= 0;) {
						if (t[i] % r === 0) {
							n[i] = t[i] / r;
							break;
						}
						if (r % t[i] !== 0) throw new Error("cannot convert shape");
						n[i] = 1, r /= t[i], i--;
					}
					for (i--; i >= 0; i--) n[i] = t[i];
					return n;
				}
				static sizeFromDimension(t, r) {
					if (r < 0 || r > t.length) throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);
					return Vn.getSizeFromDimensionRange(t, r, t.length);
				}
				static sizeToDimension(t, r) {
					if (r < 0 || r > t.length) throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);
					return Vn.getSizeFromDimensionRange(t, 0, r);
				}
				static getSizeFromDimensionRange(t, r, a) {
					let n = 1;
					for (let i = r; i < a; i++) {
						if (t[i] < 0) throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");
						n *= Number(t[i]);
					}
					return n;
				}
				static computeStrides(t) {
					let r = t.length;
					if (r === 0) return [];
					if (r === 1) return [1];
					let a = new Array(r);
					a[r - 1] = 1, a[r - 2] = t[r - 1];
					for (let n = r - 3; n >= 0; --n) a[n] = a[n + 1] * t[n + 1];
					return a;
				}
				static normalizeAxis(t, r) {
					if (t < -r && t >= r) throw new Error("unsupported axis for this operation.");
					return t < 0 ? t + r : t;
				}
				static normalizeAxes(t, r) {
					return t.map((a) => this.normalizeAxis(a, r ?? t.length));
				}
				static sortBasedOnPerm(t, r) {
					return r ? r.map((a) => t[a]) : t.slice().reverse();
				}
				static padShape(t, r) {
					let a = t.length;
					return t.map((n, i) => n + r[i] + r[i + a]);
				}
				static areEqual(t, r) {
					return t.length !== r.length ? !1 : t.every((a, n) => a === r[n]);
				}
			}, Wa = class Ca {
				static adjustPoolAttributes(t, r, a, n, i, s) {
					if (!t && a.length !== r.length - 2) throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");
					if (t) for (let l = 0; l < r.length - 2; l++) l >= a.length ? a.push(r[l + 2]) : a[l] = r[l + 2];
					for (let l = 0; l < a.length; l++) if (l < n.length) {
						if (n[l] < 0) throw new Error("strides should be greater than or equal to 1");
					} else n.push(1);
					for (let l = 0; l < a.length; l++) if (l < i.length) {
						if (i[l] < 0) throw new Error("dilations should be greater than or equal to 1");
					} else i.push(1);
					for (let l = 0; l < a.length * 2; l++) if (l < s.length) {
						if (s[l] < 0) throw new Error("pad should be greater than or equal to 1");
					} else s.push(0);
					for (let l = 0; l < a.length; l++) {
						if (a[l] <= 0) throw new Error("kernel shapes need to be greater than 0");
						if (s[l] >= a[l] || s[l + a.length] >= a[l]) throw new Error("pads should be smaller than kernel");
					}
				}
				static adjustPadsBasedOnAutoPad(t, r, a, n, i, s, l) {
					if (l) {
						if (i.length !== 2 * (t.length - 2)) throw new Error("length of pads should be twice the length of data dimensions");
						if (r.length !== t.length - 2) throw new Error("length of strides should be the length of data dimensions");
						if (n.length !== t.length - 2) throw new Error("length of kernel shapes should be the length of data dimensions");
						for (let d = 0; d < t.length - 2; d++) Ca.adjustPadAndReturnShape(t[d + (s ? 1 : 2)], r[d], a[d], n[d], i, d, d + t.length - 2, l);
					}
				}
				static computePoolOutputShape(t, r, a, n, i, s, l) {
					if (r.length <= 0) throw new Error("input shape must be of size greater than 0");
					let d = [r[0], r[1]];
					return Ca.computeShapeHelper(t, r, d, a, n, i, s, l), d;
				}
				static computeConvOutputShape(t, r, a, n, i, s, l) {
					if (t.length <= 0 || r.length <= 0) throw new Error("invalid input tensor dims or invalid filter tensor dims");
					let d = [t[0], r[0]];
					return Ca.computeShapeHelper(!1, t, d, a, n, i, s, l), d;
				}
				static computeShapeHelper(t, r, a, n, i, s, l, d) {
					if (t) for (let c = 0; c < r.length - 2; c++) a.push(1);
					else for (let c = 0; c < r.length - 2; c++) a.push(Ca.adjustPadAndReturnShape(r[c + 2], n[c], i[c], s[c], l, c, c + r.length - 2, d));
				}
				static adjustPadAndReturnShape(t, r, a, n, i, s, l, d) {
					let c = a * (n - 1) + 1;
					if (d && d !== "NOTSET") switch (d) {
						case "VALID": return i[s] = 0, i[l] = 0, Math.floor((t - c) / r + 1);
						case "SAME_LOWER":
						case "SAME_UPPER":
							if (a !== 1) throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");
							{
								let h = ((t + r - 1) / r - 1) * r + n - t;
								return i[s] = Math.floor(d === "SAME_LOWER" ? (h + 1) / 2 : h / 2), i[l] = h - i[s], Math.floor((t + h - n) / r + 1);
							}
						default: throw new Error("Unsupported AutoPad type");
					}
					else return Math.floor((t + i[s] + i[l] - c) / r + 1);
				}
			}, Bu = class {
				static getShapeOfGemmResult(e, t, r, a, n) {
					if (e.length !== 2 || r.length !== 2) throw new Error("shape need to be of size 2");
					let i, s, l;
					t ? (i = e[1], s = e[0]) : (i = e[0], s = e[1]);
					let d = -1;
					if (a ? (l = r[0], d = 1) : (l = r[1], d = 0), r[d] !== s) throw new Error("dimension mismatch");
					if (i <= 0 || l <= 0 || s <= 0) throw new Error("invalid shape specified");
					if (n && !Nr.isValidBroadcast(n, [i, l])) throw new Error("gemm: invalid bias shape for broadcast");
					return [
						i,
						l,
						s
					];
				}
			}, Du = -34028234663852886e22, Mu = 34028234663852886e22;
		}), bi = Z(() => {
			"use strict";
			fe(), wi = (e, t) => new (Fa(t))(e);
		}), Fu = Z(() => {
			"use strict";
			fe(), Mt(), vi = /* @__PURE__ */ new Map([
				["float32", 32],
				["float16", 16],
				["int32", 32],
				["uint32", 32],
				["int64", 64],
				["uint64", 64],
				["int8", 8],
				["uint8", 8],
				["int4", 4],
				["uint4", 4]
			]), $i = (e, t) => {
				if (t === "int32") return e;
				let r = vi.get(t);
				if (!r) throw new Error(`WebNN backend does not support data type: ${t}`);
				let a = r / 8;
				if (e.byteLength % a !== 0) throw new Error(`Invalid Uint8Array length - must be a multiple of ${a}.`);
				let n = e.byteLength / a, i = new (Fa(t))(e.buffer, e.byteOffset, n);
				switch (t) {
					case "int64":
					case "uint64": {
						let s = new Int32Array(n);
						for (let l = 0; l < n; l++) {
							let d = i[l];
							if (d > 2147483647n || d < -2147483648n) throw new Error("Can not convert int64 data to int32 - value out of range.");
							s[l] = Number(d);
						}
						return new Uint8Array(s.buffer);
					}
					case "int8":
					case "uint8":
					case "uint32": {
						if (t === "uint32" && i.some((l) => l > 2147483647)) throw new Error("Can not convert uint32 data to int32 - value out of range.");
						let s = Int32Array.from(i, Number);
						return new Uint8Array(s.buffer);
					}
					default: throw new Error(`Unsupported data conversion from ${t} to 'int32'`);
				}
			}, xi = (e, t) => {
				if (t === "int32") return e;
				if (e.byteLength % 4 !== 0) throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");
				let r = e.byteLength / 4, a = new Int32Array(e.buffer, e.byteOffset, r);
				switch (t) {
					case "int64": {
						let n = BigInt64Array.from(a, BigInt);
						return new Uint8Array(n.buffer);
					}
					case "uint64": {
						if (a.some((i) => i < 0)) throw new Error("Can not convert int32 data to uin64 - negative value found.");
						let n = BigUint64Array.from(a, BigInt);
						return new Uint8Array(n.buffer);
					}
					case "int8": {
						if (a.some((i) => i < -128 || i > 127)) throw new Error("Can not convert int32 data to int8 - value out of range.");
						let n = Int8Array.from(a, Number);
						return new Uint8Array(n.buffer);
					}
					case "uint8":
						if (a.some((n) => n < 0 || n > 255)) throw new Error("Can not convert int32 data to uint8 - value out of range.");
						return Uint8Array.from(a, Number);
					case "uint32": {
						if (a.some((i) => i < 0)) throw new Error("Can not convert int32 data to uint32 - negative value found.");
						let n = Uint32Array.from(a, Number);
						return new Uint8Array(n.buffer);
					}
					default: throw new Error(`Unsupported data conversion from 'int32' to ${t}`);
				}
			}, Nu = 1, ki = () => Nu++, Pu = /* @__PURE__ */ new Map([
				["int8", "int32"],
				["uint8", "int32"],
				["uint32", "int32"],
				["int64", "int32"]
			]), Si = (e, t) => {
				let r = vi.get(e);
				if (!r) throw new Error(`WebNN backend does not support data type: ${e}`);
				return t.length > 0 ? Math.ceil(t.reduce((a, n) => a * n) * r / 8) : 0;
			}, Ei = class {
				constructor(e) {
					this.isDataConverted = !1;
					let { sessionId: t, context: r, tensor: a, dataType: n, shape: i, fallbackDataType: s } = e;
					this.sessionId = t, this.mlContext = r, this.mlTensor = a, this.dataType = n, this.tensorShape = i, this.fallbackDataType = s;
				}
				get tensor() {
					return this.mlTensor;
				}
				get type() {
					return this.dataType;
				}
				get fallbackType() {
					return this.fallbackDataType;
				}
				get shape() {
					return this.tensorShape;
				}
				get byteLength() {
					return Si(this.dataType, this.tensorShape);
				}
				destroy() {
					Ce("verbose", () => "[WebNN] TensorWrapper.destroy"), this.mlTensor.destroy();
				}
				write(e) {
					this.mlContext.writeTensor(this.mlTensor, e);
				}
				async read(e) {
					if (this.fallbackDataType) {
						let t = await this.mlContext.readTensor(this.mlTensor), r = xi(new Uint8Array(t), this.dataType);
						if (e) {
							(e instanceof ArrayBuffer ? new Uint8Array(e) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength)).set(r);
							return;
						} else return new Uint8Array(r).buffer;
					} else return e ? this.mlContext.readTensor(this.mlTensor, e) : this.mlContext.readTensor(this.mlTensor);
				}
				canReuseTensor(e, t, r) {
					return this.mlContext === e && this.dataType === t && this.tensorShape.length === r.length && this.tensorShape.every((a, n) => a === r[n]);
				}
				setIsDataConverted(e) {
					this.isDataConverted = e;
				}
			}, Ti = class {
				constructor(e, t) {
					this.tensorManager = e, this.wrapper = t;
				}
				get tensorWrapper() {
					return this.wrapper;
				}
				releaseTensor() {
					this.tensorWrapper && (this.tensorManager.releaseTensor(this.tensorWrapper), this.wrapper = void 0);
				}
				async ensureTensor(e, t, r, a) {
					let n = this.tensorManager.getMLContext(e), i = this.tensorManager.getMLOpSupportLimits(e), s;
					if (!i?.input.dataTypes.includes(t)) {
						if (s = Pu.get(t), !s || i?.input.dataTypes.includes(s)) throw new Error(`WebNN backend does not support data type: ${t}`);
						Ce("verbose", () => `[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`);
					}
					if (this.wrapper) {
						if (this.wrapper.canReuseTensor(n, t, r)) return this.wrapper.tensor;
						if (a) {
							if (this.wrapper.byteLength !== Si(t, r)) throw new Error("Unable to copy data to tensor with different size.");
							this.activeUpload = new Uint8Array(await this.wrapper.read());
						}
						this.tensorManager.releaseTensor(this.wrapper);
					}
					let l = typeof MLTensorUsage > "u" ? void 0 : MLTensorUsage.READ | MLTensorUsage.WRITE;
					return this.wrapper = await this.tensorManager.getCachedTensor(e, t, r, l, !0, !0, s), a && this.activeUpload && (this.wrapper.write(this.activeUpload), this.activeUpload = void 0), this.wrapper.tensor;
				}
				upload(e) {
					let t = e;
					if (this.wrapper) {
						if (this.wrapper.fallbackType) if (this.wrapper.fallbackType === "int32") t = $i(e, this.wrapper.type), this.wrapper.setIsDataConverted(!0);
						else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);
						if (e.byteLength === this.wrapper.byteLength) {
							this.wrapper.write(t);
							return;
						} else Ce("verbose", () => "Data size does not match tensor size. Releasing tensor."), this.releaseTensor();
					}
					this.activeUpload ? this.activeUpload.set(t) : this.activeUpload = new Uint8Array(t);
				}
				async download(e) {
					if (this.activeUpload) {
						let t = this.wrapper?.isDataConverted ? xi(this.activeUpload, this.wrapper?.type) : this.activeUpload;
						if (e) {
							e instanceof ArrayBuffer ? new Uint8Array(e).set(t) : new Uint8Array(e.buffer, e.byteOffset, e.byteLength).set(t);
							return;
						} else return t.buffer;
					}
					if (!this.wrapper) throw new Error("Tensor has not been created.");
					return e ? this.wrapper.read(e) : this.wrapper.read();
				}
			}, Uu = class {
				constructor(e) {
					this.backend = e, this.tensorTrackersById = /* @__PURE__ */ new Map(), this.freeTensors = [], this.externalTensors = /* @__PURE__ */ new Set();
				}
				getMLContext(e) {
					let t = this.backend.getMLContext(e);
					if (!t) throw new Error("MLContext not found for session.");
					return t;
				}
				getMLOpSupportLimits(e) {
					return this.backend.getMLOpSupportLimits(e);
				}
				reserveTensorId() {
					let e = ki();
					return this.tensorTrackersById.set(e, new Ti(this)), e;
				}
				releaseTensorId(e) {
					let t = this.tensorTrackersById.get(e);
					t && (this.tensorTrackersById.delete(e), t.tensorWrapper && this.releaseTensor(t.tensorWrapper));
				}
				async ensureTensor(e, t, r, a, n) {
					Ce("verbose", () => `[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${a}, copyOld: ${n}}`);
					let i = this.tensorTrackersById.get(t);
					if (!i) throw new Error("Tensor not found.");
					return i.ensureTensor(e, r, a, n);
				}
				upload(e, t) {
					let r = this.tensorTrackersById.get(e);
					if (!r) throw new Error("Tensor not found.");
					r.upload(t);
				}
				async download(e, t) {
					Ce("verbose", () => `[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t?.byteLength}}`);
					let r = this.tensorTrackersById.get(e);
					if (!r) throw new Error("Tensor not found.");
					return r.download(t);
				}
				releaseTensorsForSession(e) {
					for (let t of this.freeTensors) t.sessionId === e && t.destroy();
					this.freeTensors = this.freeTensors.filter((t) => t.sessionId !== e);
				}
				registerTensor(e, t, r, a) {
					let n = this.getMLContext(e), i = ki(), s = new Ei({
						sessionId: e,
						context: n,
						tensor: t,
						dataType: r,
						shape: a
					});
					return this.tensorTrackersById.set(i, new Ti(this, s)), this.externalTensors.add(s), i;
				}
				async getCachedTensor(e, t, r, a, n, i, s) {
					let l = this.getMLContext(e);
					for (let [c, h] of this.freeTensors.entries()) if (h.canReuseTensor(l, t, r)) {
						Ce("verbose", () => `[WebNN] Reusing tensor {dataType: ${t}, ${s ? `fallbackDataType: ${s},` : ""} shape: ${r}`);
						let f = this.freeTensors.splice(c, 1)[0];
						return f.sessionId = e, f;
					}
					Ce("verbose", () => `[WebNN] MLContext.createTensor {dataType: ${t}, ${s ? `fallbackDataType: ${s},` : ""} shape: ${r}}`);
					let d = await l.createTensor({
						dataType: s ?? t,
						shape: r,
						dimensions: r,
						usage: a,
						writable: n,
						readable: i
					});
					return new Ei({
						sessionId: e,
						context: l,
						tensor: d,
						dataType: t,
						shape: r,
						fallbackDataType: s
					});
				}
				releaseTensor(e) {
					this.externalTensors.has(e) && this.externalTensors.delete(e), this.freeTensors.push(e);
				}
			}, Lu = (...e) => new Uu(...e);
		}), Gu = Z(() => {
			"use strict";
			fe(), rr(), bi(), Fu(), Mt(), ta = /* @__PURE__ */ new Map([
				[1, "float32"],
				[10, "float16"],
				[6, "int32"],
				[12, "uint32"],
				[7, "int64"],
				[13, "uint64"],
				[22, "int4"],
				[21, "uint4"],
				[3, "int8"],
				[2, "uint8"],
				[9, "uint8"]
			]), qu = (e, t) => {
				if (e === t) return !0;
				if (e === void 0 || t === void 0) return !1;
				let r = Object.keys(e).sort(), a = Object.keys(t).sort();
				return r.length === a.length && r.every((n, i) => n === a[i] && e[n] === t[n]);
			}, Wu = class {
				constructor(e) {
					this.tensorManager = Lu(this), this.mlContextBySessionId = /* @__PURE__ */ new Map(), this.sessionIdsByMLContext = /* @__PURE__ */ new Map(), this.mlContextCache = [], this.sessionGraphInputs = /* @__PURE__ */ new Map(), this.sessionGraphOutputs = /* @__PURE__ */ new Map(), this.temporaryGraphInputs = [], this.temporaryGraphOutputs = [], this.temporarySessionTensorIds = /* @__PURE__ */ new Map(), this.mlOpSupportLimitsBySessionId = /* @__PURE__ */ new Map(), yi(e.logLevel, !!e.debug);
				}
				get currentSessionId() {
					if (this.activeSessionId === void 0) throw new Error("No active session");
					return this.activeSessionId;
				}
				onRunStart(e) {
					Ce("verbose", () => `[WebNN] onRunStart {sessionId: ${e}}`), this.activeSessionId = e;
				}
				onRunEnd(e) {
					Ce("verbose", () => `[WebNN] onRunEnd {sessionId: ${e}}`);
					let t = this.temporarySessionTensorIds.get(e);
					if (t) {
						for (let r of t) Ce("verbose", () => `[WebNN] releasing temporary tensor {tensorId: ${r}}`), this.tensorManager.releaseTensorId(r);
						this.temporarySessionTensorIds.delete(e), this.activeSessionId = void 0;
					}
				}
				async createMLContext(e) {
					if (e instanceof GPUDevice) {
						let r = this.mlContextCache.findIndex((a) => a.gpuDevice === e);
						if (r !== -1) return this.mlContextCache[r].mlContext;
						{
							let a = await navigator.ml.createContext(e);
							return this.mlContextCache.push({
								gpuDevice: e,
								mlContext: a
							}), a;
						}
					} else if (e === void 0) {
						let r = this.mlContextCache.findIndex((a) => a.options === void 0 && a.gpuDevice === void 0);
						if (r !== -1) return this.mlContextCache[r].mlContext;
						{
							let a = await navigator.ml.createContext();
							return this.mlContextCache.push({ mlContext: a }), a;
						}
					}
					let t = this.mlContextCache.findIndex((r) => qu(r.options, e));
					if (t !== -1) return this.mlContextCache[t].mlContext;
					{
						let r = await navigator.ml.createContext(e);
						return this.mlContextCache.push({
							options: e,
							mlContext: r
						}), r;
					}
				}
				registerMLContext(e, t) {
					this.mlContextBySessionId.set(e, t);
					let r = this.sessionIdsByMLContext.get(t);
					r || (r = /* @__PURE__ */ new Set(), this.sessionIdsByMLContext.set(t, r)), r.add(e), this.mlOpSupportLimitsBySessionId.has(e) || this.mlOpSupportLimitsBySessionId.set(e, t.opSupportLimits()), this.temporaryGraphInputs.length > 0 && (this.sessionGraphInputs.set(e, this.temporaryGraphInputs), this.temporaryGraphInputs = []), this.temporaryGraphOutputs.length > 0 && (this.sessionGraphOutputs.set(e, this.temporaryGraphOutputs), this.temporaryGraphOutputs = []);
				}
				onReleaseSession(e) {
					this.sessionGraphInputs.delete(e), this.sessionGraphOutputs.delete(e);
					let t = this.mlContextBySessionId.get(e);
					if (!t) return;
					this.tensorManager.releaseTensorsForSession(e), this.mlContextBySessionId.delete(e), this.mlOpSupportLimitsBySessionId.delete(e);
					let r = this.sessionIdsByMLContext.get(t);
					if (r.delete(e), r.size === 0) {
						this.sessionIdsByMLContext.delete(t);
						let a = this.mlContextCache.findIndex((n) => n.mlContext === t);
						a !== -1 && this.mlContextCache.splice(a, 1);
					}
				}
				getMLContext(e) {
					return this.mlContextBySessionId.get(e);
				}
				getMLOpSupportLimits(e) {
					return this.mlOpSupportLimitsBySessionId.get(e);
				}
				reserveTensorId() {
					return this.tensorManager.reserveTensorId();
				}
				releaseTensorId(e) {
					Ce("verbose", () => `[WebNN] releaseTensorId {tensorId: ${e}}`), this.tensorManager.releaseTensorId(e);
				}
				async ensureTensor(e, t, r, a, n) {
					let i = ta.get(r);
					if (!i) throw new Error(`Unsupported ONNX data type: ${r}`);
					return this.tensorManager.ensureTensor(e ?? this.currentSessionId, t, i, a, n);
				}
				async createTemporaryTensor(e, t, r) {
					Ce("verbose", () => `[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);
					let a = ta.get(t);
					if (!a) throw new Error(`Unsupported ONNX data type: ${t}`);
					let n = this.tensorManager.reserveTensorId();
					await this.tensorManager.ensureTensor(e, n, a, r, !1);
					let i = this.temporarySessionTensorIds.get(e);
					return i ? i.push(n) : this.temporarySessionTensorIds.set(e, [n]), n;
				}
				uploadTensor(e, t) {
					if (!We().shouldTransferToMLTensor) throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");
					Ce("verbose", () => `[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`), this.tensorManager.upload(e, t);
				}
				async downloadTensor(e, t) {
					return this.tensorManager.download(e, t);
				}
				createMLTensorDownloader(e, t) {
					return async () => {
						let r = await this.tensorManager.download(e);
						return wi(r, t);
					};
				}
				registerMLTensor(e, t, r, a) {
					let n = ta.get(r);
					if (!n) throw new Error(`Unsupported ONNX data type: ${r}`);
					let i = this.tensorManager.registerTensor(e, t, n, a);
					return Ce("verbose", () => `[WebNN] registerMLTensor {tensor: ${t}, dataType: ${n}, dimensions: ${a}} -> {tensorId: ${i}}`), i;
				}
				registerMLConstant(e, t, r, a, n, i, s = !1) {
					if (!i) throw new Error("External mounted files are not available.");
					let l = e;
					e.startsWith("./") && (l = e.substring(2));
					let d = i.get(l);
					if (!d) throw new Error(`File with name ${l} not found in preloaded files.`);
					if (t + r > d.byteLength) throw new Error("Out of bounds: data offset and length exceed the external file data size.");
					let c = d.slice(t, t + r).buffer, h;
					switch (n.dataType) {
						case "float32":
							h = new Float32Array(c);
							break;
						case "float16":
							h = typeof Float16Array < "u" ? new Float16Array(c) : new Uint16Array(c);
							break;
						case "int32":
							h = new Int32Array(c);
							break;
						case "uint32":
							h = new Uint32Array(c);
							break;
						case "int64":
							if (s) {
								let f = $i(new Uint8Array(c), "int64");
								h = new Int32Array(f.buffer), n.dataType = "int32";
							} else h = new BigInt64Array(c);
							break;
						case "uint64":
							h = new BigUint64Array(c);
							break;
						case "int8":
							h = new Int8Array(c);
							break;
						case "int4":
						case "uint4":
						case "uint8":
							h = new Uint8Array(c);
							break;
						default: throw new Error(`Unsupported data type: ${n.dataType} in creating WebNN Constant from external data.`);
					}
					return Ce("verbose", () => `[WebNN] registerMLConstant {dataType: ${n.dataType}, shape: ${n.shape}}} ${s ? "(Note: it was int64 data type and registered to int32 as workaround)" : ""}`), a.constant(n, h);
				}
				registerGraphInput(e) {
					this.temporaryGraphInputs.push(e);
				}
				registerGraphOutput(e) {
					this.temporaryGraphOutputs.push(e);
				}
				isGraphInput(e, t) {
					let r = this.sessionGraphInputs.get(e);
					return r ? r.includes(t) : !1;
				}
				isGraphOutput(e, t) {
					let r = this.sessionGraphOutputs.get(e);
					return r ? r.includes(t) : !1;
				}
				isGraphInputOutputTypeSupported(e, t, r = !0) {
					let a = ta.get(wr(t)), n = this.mlOpSupportLimitsBySessionId.get(e);
					return typeof a > "u" ? !1 : r ? !!n?.input.dataTypes.includes(a) : !!n?.output.dataTypes.includes(a);
				}
				flush() {}
			};
		}), Ga = Z(() => {
			"use strict";
		}), Xu = Z(() => {
			"use strict";
			Mt(), Ga(), Ii = /* @__PURE__ */ new Map([
				[64, 250],
				[128, 200],
				[256, 200],
				[512, 200],
				[2048, 230],
				[4096, 200],
				[8192, 50],
				[16384, 50],
				[32768, 50],
				[65536, 50],
				[131072, 50],
				[262144, 50],
				[524288, 50],
				[1048576, 50],
				[2097152, 30],
				[4194304, 20],
				[8388608, 10],
				[12582912, 10],
				[16777216, 10],
				[26214400, 15],
				[33554432, 22],
				[44236800, 2],
				[58982400, 6],
				[67108864, 6],
				[134217728, 6],
				[167772160, 6]
			]), Va = [], Ha = (e) => Math.ceil(Number(e) / 16) * 16, Vu = (e) => {
				for (let t = 0; t < Va.length; t++) {
					let r = Va[t];
					if (e <= r) return r;
				}
				return Math.ceil(e / 16) * 16;
			}, Hu = 1, zi = () => Hu++, Ci = async (e, t, r, a) => {
				let n = Ha(r), i = e.device.createBuffer({
					size: n,
					usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
				});
				try {
					let s = e.getCommandEncoder();
					e.endComputePass(), s.copyBufferToBuffer(t, 0, i, 0, n), e.flush(), await i.mapAsync(GPUMapMode.READ);
					let l = i.getMappedRange();
					if (a) {
						let d = a();
						return d.set(new Uint8Array(l, 0, r)), d;
					} else return new Uint8Array(l.slice(0, r));
				} finally {
					i.destroy();
				}
			}, ju = class {
				constructor(e) {
					this.backend = e, this.storageCache = /* @__PURE__ */ new Map(), this.freeBuffers = /* @__PURE__ */ new Map(), this.freeUniformBuffers = /* @__PURE__ */ new Map(), this.buffersPending = [], this.capturedPendingBuffers = /* @__PURE__ */ new Map();
					for (let [t] of Ii) Va.push(t), this.freeBuffers.set(t, []), this.freeUniformBuffers.set(t, []);
					this.sessionCount = 0;
				}
				upload(e, t) {
					let r = t.buffer, a = t.byteOffset, n = t.byteLength, i = Ha(n), s = this.storageCache.get(e);
					if (!s) throw new Error("gpu data for uploading does not exist");
					if (Number(s.originalSize) !== n) throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${n}`);
					let l = this.backend.device.createBuffer({
						mappedAtCreation: !0,
						size: i,
						usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC
					}), d = l.getMappedRange();
					new Uint8Array(d).set(new Uint8Array(r, a, n)), l.unmap();
					let c = this.backend.device.createCommandEncoder();
					c.copyBufferToBuffer(l, 0, s.gpuData.buffer, 0, i), this.backend.device.queue.submit([c.finish()]), l.destroy(), Ce("verbose", () => `[WebGPU] GpuDataManager.upload(id=${e})`);
				}
				memcpy(e, t) {
					let r = this.storageCache.get(e);
					if (!r) throw new Error("source gpu data for memcpy does not exist");
					let a = this.storageCache.get(t);
					if (!a) throw new Error("destination gpu data for memcpy does not exist");
					if (r.originalSize !== a.originalSize) throw new Error("inconsistent source and destination gpu data size");
					let n = Ha(r.originalSize), i = this.backend.getCommandEncoder();
					this.backend.endComputePass(), i.copyBufferToBuffer(r.gpuData.buffer, 0, a.gpuData.buffer, 0, n);
				}
				registerExternalBuffer(e, t, r) {
					let a;
					if (r) {
						if (a = r[0], e === r[1]) return Ce("verbose", () => `[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${a}, buffer is the same, skip.`), a;
						if (this.backend.capturedCommandList.has(this.backend.currentSessionId)) throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`);
					} else a = zi();
					return this.storageCache.set(a, {
						gpuData: {
							id: a,
							type: 0,
							buffer: e
						},
						originalSize: t
					}), Ce("verbose", () => `[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${a}, registered.`), a;
				}
				unregisterExternalBuffer(e) {
					e !== void 0 && (this.storageCache.delete(e), Ce("verbose", () => `[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`));
				}
				create(e, t = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST) {
					let r = Vu(e), a, n = (t & GPUBufferUsage.STORAGE) === GPUBufferUsage.STORAGE, i = (t & GPUBufferUsage.UNIFORM) === GPUBufferUsage.UNIFORM;
					if (n || i) {
						let l = (n ? this.freeBuffers : this.freeUniformBuffers).get(r);
						l ? l.length > 0 ? a = l.pop() : a = this.backend.device.createBuffer({
							size: r,
							usage: t
						}) : a = this.backend.device.createBuffer({
							size: r,
							usage: t
						});
					} else a = this.backend.device.createBuffer({
						size: r,
						usage: t
					});
					let s = {
						id: zi(),
						type: 0,
						buffer: a
					};
					return this.storageCache.set(s.id, {
						gpuData: s,
						originalSize: Number(e)
					}), Ce("verbose", () => `[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`), s;
				}
				get(e) {
					return this.storageCache.get(e)?.gpuData;
				}
				release(e) {
					let t = typeof e == "bigint" ? Number(e) : e, r = this.storageCache.get(t);
					if (!r) {
						if (this.storageCache.size === 0) return 0;
						throw new Error("releasing data does not exist");
					}
					return Ce("verbose", () => `[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`), this.storageCache.delete(t), this.buffersPending.push(r.gpuData.buffer), r.originalSize;
				}
				async download(e, t) {
					let r = this.storageCache.get(Number(e));
					if (!r) throw new Error("data does not exist");
					await Ci(this.backend, r.gpuData.buffer, r.originalSize, t);
				}
				refreshPendingBuffers() {
					if (this.buffersPending.length !== 0) if (this.backend.sessionStatus === "default") {
						for (let e of this.buffersPending) {
							let t = Ii.get(e.size);
							if ((e.usage & GPUBufferUsage.STORAGE) === GPUBufferUsage.STORAGE) {
								let r = this.freeBuffers.get(e.size) || [];
								t === void 0 || r.length >= t ? e.destroy() : r.push(e);
							} else if ((e.usage & GPUBufferUsage.UNIFORM) === GPUBufferUsage.UNIFORM) {
								let r = this.freeUniformBuffers.get(e.size) || [];
								t === void 0 || r.length >= t ? e.destroy() : r.push(e);
							} else e.destroy();
						}
						this.buffersPending = [];
					} else {
						let e = this.capturedPendingBuffers.get(this.backend.currentSessionId);
						e || (e = [], this.capturedPendingBuffers.set(this.backend.currentSessionId, e));
						for (let t of this.buffersPending) e.push(t);
						this.buffersPending = [];
					}
				}
				dispose() {
					this.freeBuffers.forEach((e) => {
						e.forEach((t) => {
							t.destroy();
						});
					}), this.freeUniformBuffers.forEach((e) => {
						e.forEach((t) => {
							t.destroy();
						});
					}), this.storageCache.forEach((e) => {
						e.gpuData.buffer.destroy();
					}), this.capturedPendingBuffers.forEach((e) => {
						e.forEach((t) => {
							t.destroy();
						});
					}), this.storageCache = /* @__PURE__ */ new Map(), this.freeBuffers = /* @__PURE__ */ new Map(), this.freeUniformBuffers = /* @__PURE__ */ new Map(), this.capturedPendingBuffers = /* @__PURE__ */ new Map();
				}
				onCreateSession() {
					this.sessionCount += 1;
				}
				onReleaseSession(e) {
					let t = this.capturedPendingBuffers.get(e);
					t && (t.forEach((r) => {
						r.destroy();
					}), this.capturedPendingBuffers.delete(e)), this.sessionCount -= 1, this.sessionCount === 0 && (Ce("warning", () => "[WebGPU] Clearing webgpu buffer cache"), this.storageCache.forEach((r) => {
						r.gpuData.buffer.destroy();
					}), this.storageCache = /* @__PURE__ */ new Map());
				}
			}, Ku = (...e) => new ju(...e);
		}), Qe = Z(() => {
			"use strict";
			Zu = class {
				constructor(e) {
					Object.assign(this, e);
				}
				get cacheKey() {
					return this.key || (this.key = Object.getOwnPropertyNames(this).sort().map((e) => `${this[e]}`).join(";")), this.key;
				}
			}, Ne = (e) => new Zu(e);
		}), be = Z(() => {
			"use strict";
			fe(), we(), Pr = 64, ja = (e, t) => {
				if (t === 3) throw new Error("vec3 has same alignment as vec4, use vec4 instead");
				switch (Number(e)) {
					case 10: return t > 1 ? `vec${t}<f16>` : "f16";
					case 1: return t > 1 ? `vec${t}<f32>` : "f32";
					case 6: return t > 1 ? `vec${t}<i32>` : "i32";
					case 12: return t > 1 ? `vec${t}<u32>` : "u32";
					case 7:
						if (t > 1) throw new Error("currently not supported vecX of uint64 yet");
						return ["vec2<u32>", "i32"];
					case 13:
						if (t > 1) throw new Error("currently not supported vecX of uint64 yet");
						return ["vec2<u32>", "u32"];
					case 9:
						if (t !== 4) throw new Error("bool must be vec4");
						return ["u32", "vec4<bool>"];
					case 22: return "i32";
					case 21: return "u32";
					default: throw new Error(`Unknown data type: ${e}`);
				}
			}, nt = (e, t = 1) => {
				let r = ja(e, t);
				return typeof r == "string" ? r : r[0];
			}, ut = (e, t = 1) => {
				let r = ja(e, t);
				return typeof r == "string" ? r : r[1];
			}, de = (...e) => {
				let t = [];
				return e.forEach((r) => {
					r.length !== 0 && t.push({
						type: 12,
						data: r
					}, {
						type: 12,
						data: F.computeStrides(r)
					});
				}), t;
			}, Je = (e) => e % 4 === 0 ? 4 : e % 2 === 0 ? 2 : 1, Ai = (e = "f32", t, r = "0") => !t || t === 1 ? `${e}(${r})` : `vec${t}<${e}>(${r})`, Ur = (e, t, r) => e === "f32" ? r : t === 1 ? `f32(${r})` : `vec${t}<f32>(${r})`, ar = (e, t) => t === 4 ? `(${e}.x + ${e}.y + ${e}.z + ${e}.w)` : t === 2 ? `(${e}.x + ${e}.y)` : t === 3 ? `(${e}.x + ${e}.y + ${e}.z)` : e, le = (e, t, r, a) => e.startsWith("uniforms.") && r > 4 ? typeof t == "string" ? a === "f16" ? `${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]` : `${e}[(${t}) / 4][(${t}) % 4]` : a === "f16" ? `${e}[${Math.floor(t / 8)}][${Math.floor(t % 8 / 4)}][${t % 8 % 4}]` : `${e}[${Math.floor(t / 4)}][${t % 4}]` : r > 1 ? `${e}[${t}]` : e, ra = (e, t, r, a, n) => {
				let i = typeof r == "number", s = i ? r : r.length, l = [...new Array(s).keys()], d = s < 2 ? "u32" : s <= 4 ? `vec${s}<u32>` : `array<u32, ${s}>`, c = ja(t, n), h = typeof c == "string" ? c : c[1], f = {
					indices: d,
					value: h,
					storage: typeof c == "string" ? c : c[0],
					tensor: t
				}, w = (V) => typeof V == "string" ? V : `${V}u`, v = {
					offsetToIndices: !1,
					indicesToOffset: !1,
					broadcastedIndicesToOffset: !1,
					set: !1,
					setByIndices: !1,
					get: !1,
					getByIndices: !1
				}, $ = i ? "uniforms." : "", k = `${$}${e}_shape`, C = `${$}${e}_strides`, I = "";
				for (let V = 0; V < s - 1; V++) I += `
    let dim${V} = current / ${le(C, V, s)};
    let rest${V} = current % ${le(C, V, s)};
    indices[${V}] = dim${V};
    current = rest${V};
    `;
				I += `indices[${s - 1}] = current;`;
				let E = s < 2 ? "" : `
  fn o2i_${e}(offset: u32) -> ${f.indices} {
    var indices: ${f.indices};
    var current = offset;
    ${I}
    return indices;
  }`, A = (V) => (v.offsetToIndices = !0, s < 2 ? V : `o2i_${e}(${V})`), z = [];
				if (s >= 2) for (let V = s - 1; V >= 0; V--) z.push(`${le(C, V, s)} * (indices[${V}])`);
				let B = s < 2 ? "" : `
  fn i2o_${e}(indices: ${f.indices}) -> u32 {
    return ${z.join("+")};
  }`, N = (V) => (v.indicesToOffset = !0, s < 2 ? V : `i2o_${e}(${V})`), P = (...V) => s === 0 ? "0u" : `${f.indices}(${V.map(w).join(",")})`, T = (V, se) => s < 2 ? `${V}` : `${le(V, se, s)}`, Y = (V, se, ke) => s < 2 ? `${V}=${ke};` : `${le(V, se, s)}=${ke};`, X = {}, ue = (V, se) => {
					v.broadcastedIndicesToOffset = !0;
					let ke = `${se.name}broadcastedIndicesTo${e}Offset`;
					if (ke in X) return `${ke}(${V})`;
					let ve = [];
					for (let ee = s - 1; ee >= 0; ee--) {
						let lt = se.indicesGet("outputIndices", ee + se.rank - s);
						ve.push(`${T(C, ee)} * (${lt} % ${T(k, ee)})`);
					}
					return X[ke] = `fn ${ke}(outputIndices: ${se.type.indices}) -> u32 {
             return ${ve.length > 0 ? ve.join("+") : "0u"};
           }`, `${ke}(${V})`;
				}, ie = (V, se) => (() => {
					if (f.storage === f.value) return `${e}[${V}]=${se};`;
					if (f.storage === "vec2<u32>" && f.value === "i32") return `${e}[${V}]=vec2<u32>(u32(${se}), select(0u, 0xFFFFFFFFu, ${se} < 0));`;
					if (f.storage === "vec2<u32>" && f.value === "u32") return `${e}[${V}]=vec2<u32>(u32(${se}), 0u);`;
					if (f.storage === "u32" && f.value === "vec4<bool>") return `${e}[${V}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${se}));`;
					throw new Error(`not supported combination of storage type ${f.storage} and value type ${f.value} yet`);
				})(), K = (V) => (() => {
					if (f.storage === f.value) return `${e}[${V}]`;
					if (f.storage === "vec2<u32>" && f.value === "i32") return `i32(${e}[${V}].x)`;
					if (f.storage === "vec2<u32>" && f.value === "u32") return `u32(${e}[${V}].x)`;
					if (f.storage === "u32" && f.value === "vec4<bool>") return `vec4<bool>(bool(${e}[${V}] & 0xFFu), bool(${e}[${V}] & 0xFF00u), bool(${e}[${V}] & 0xFF0000u), bool(${e}[${V}] & 0xFF000000u))`;
					throw new Error(`not supported combination of storage type ${f.storage} and value type ${f.value} yet`);
				})(), U = s < 2 ? "" : `
  fn get_${e}ByIndices(indices: ${f.indices}) -> ${h} {
    return ${K(`i2o_${e}(indices)`)};
  }`, j = s < 2 ? "" : (() => {
					let V = l.map((ke) => `d${ke}: u32`).join(", "), se = l.map((ke) => `d${ke}`).join(", ");
					return `
  fn get_${e}(${V}) -> ${h} {
    return get_${e}ByIndices(${P(se)});
  }`;
				})(), ne = (...V) => {
					if (V.length !== s) throw new Error(`indices length must be ${s}`);
					let se = V.map(w).join(",");
					return s === 0 ? K("0u") : s === 1 ? K(se[0]) : (v.get = !0, v.getByIndices = !0, v.indicesToOffset = !0, `get_${e}(${se})`);
				}, pe = (V) => s < 2 ? K(V) : (v.getByIndices = !0, v.indicesToOffset = !0, `get_${e}ByIndices(${V})`), he = s < 2 ? "" : `
  fn set_${e}ByIndices(indices: ${f.indices}, value: ${h}) {
    ${ie(`i2o_${e}(indices)`, "value")}
  }`, ge = s < 2 ? "" : (() => {
					let V = l.map((ke) => `d${ke}: u32`).join(", "), se = l.map((ke) => `d${ke}`).join(", ");
					return `
  fn set_${e}(${V}, value: ${h}) {
    set_${e}ByIndices(${P(se)}, value);
  }`;
				})();
				return {
					impl: () => {
						let V = [], se = !1;
						return v.offsetToIndices && (V.push(E), se = !0), v.indicesToOffset && (V.push(B), se = !0), v.broadcastedIndicesToOffset && (Object.values(X).forEach((ke) => V.push(ke)), se = !0), v.set && (V.push(ge), se = !0), v.setByIndices && (V.push(he), se = !0), v.get && (V.push(j), se = !0), v.getByIndices && (V.push(U), se = !0), !i && se && V.unshift(`const ${k} = ${f.indices}(${r.join(",")});`, `const ${C} = ${f.indices}(${F.computeStrides(r).join(",")});`), V.join(`
`);
					},
					type: f,
					offsetToIndices: A,
					indicesToOffset: N,
					broadcastedIndicesToOffset: ue,
					indices: P,
					indicesGet: T,
					indicesSet: Y,
					set: (...V) => {
						if (V.length !== s + 1) throw new Error(`indices length must be ${s}`);
						let se = V[s];
						if (typeof se != "string") throw new Error("value must be string");
						let ke = V.slice(0, s).map(w).join(",");
						return s === 0 ? ie("0u", se) : s === 1 ? ie(ke[0], se) : (v.set = !0, v.setByIndices = !0, v.indicesToOffset = !0, `set_${e}(${ke}, ${se})`);
					},
					setByOffset: ie,
					setByIndices: (V, se) => s < 2 ? ie(V, se) : (v.setByIndices = !0, v.indicesToOffset = !0, `set_${e}ByIndices(${V}, ${se});`),
					get: ne,
					getByOffset: K,
					getByIndices: pe,
					usage: a,
					name: e,
					strides: C,
					shape: k,
					rank: s
				};
			}, G = (e, t, r, a = 1) => ra(e, t, r, "input", a), oe = (e, t, r, a = 1) => ra(e, t, r, "output", a), Yu = (e, t, r) => ra(e, t, r, "atomicOutput", 1), Ri = (e, t, r, a = 1) => ra(e, t, r, "internal", a), Qu = class {
				constructor(e, t) {
					this.normalizedDispatchGroup = e, this.limits = t, this.internalVariables = [], this.variables = [], this.uniforms = [], this.variableIndex = 0;
				}
				guardAgainstOutOfBoundsWorkgroupSizes(e) {
					return `if (global_idx >= ${typeof e == "number" ? `${e}u` : e}) { return; }`;
				}
				mainStart(e = Pr) {
					let t = typeof e == "number" ? e : e[0], r = typeof e == "number" ? 1 : e[1], a = typeof e == "number" ? 1 : e[2];
					if (t > this.limits.maxComputeWorkgroupSizeX || r > this.limits.maxComputeWorkgroupSizeY || a > this.limits.maxComputeWorkgroupSizeZ) throw new Error(`workgroup size [${t}, ${r}, ${a}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);
					if (t * r * a > this.limits.maxComputeInvocationsPerWorkgroup) throw new Error(`workgroup size [${t}, ${r}, ${a}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);
					let n = this.normalizedDispatchGroup[1] === 1 && this.normalizedDispatchGroup[2] === 1;
					return `@compute @workgroup_size(${t}, ${r}, ${a})
  fn main(${n ? `@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>` : `@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`}) {
    ${n ? `let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;` : `let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t * r * a}u + local_idx;`}
  `;
				}
				appendVariableUniforms(e) {
					e.rank !== 0 && (e.shape.startsWith("uniforms.") && this.uniforms.push({
						name: e.shape.replace("uniforms.", ""),
						type: "u32",
						length: e.rank
					}), e.strides.startsWith("uniforms.") && this.uniforms.push({
						name: e.strides.replace("uniforms.", ""),
						type: "u32",
						length: e.rank
					}));
				}
				declareVariable(e, t) {
					if (e.usage === "internal") throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");
					this.variables.push(e), this.appendVariableUniforms(e);
					let r = e.usage === "input" ? "read" : "read_write", a = e.usage === "atomicOutput" ? "atomic<i32>" : e.type.storage;
					return `@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${a}>;`;
				}
				declareVariables(...e) {
					return e.map((t) => this.declareVariable(t, this.variableIndex++)).join(`
`);
				}
				registerInternalVariable(e) {
					if (e.usage !== "internal") throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");
					this.internalVariables.push(e), this.appendVariableUniforms(e);
				}
				registerInternalVariables(...e) {
					return e.forEach((t) => this.registerInternalVariable(t)), this;
				}
				registerUniform(e, t, r = 1) {
					return this.uniforms.push({
						name: e,
						type: t,
						length: r
					}), this;
				}
				registerUniforms(e) {
					return this.uniforms = this.uniforms.concat(e), this;
				}
				uniformDeclaration() {
					if (this.uniforms.length === 0) return "";
					let e = [];
					for (let { name: t, type: r, length: a } of this.uniforms) if (a && a > 4) r === "f16" ? e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(a / 8)}>`) : e.push(`${t}:array<vec4<${r}>, ${Math.ceil(a / 4)}>`);
					else {
						let n = a == null || a === 1 ? r : `vec${a}<${r}>`;
						e.push(`${t}:${n}`);
					}
					return `
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`;
				}
				get additionalImplementations() {
					return this.uniformDeclaration() + this.variables.map((e) => e.impl()).join(`
`) + this.internalVariables.map((e) => e.impl()).join(`
`);
				}
				get variablesInfo() {
					if (this.uniforms.length === 0) return;
					let e = (t) => [
						12,
						10,
						1,
						6
					][[
						"u32",
						"f16",
						"f32",
						"i32"
					].indexOf(t)];
					return this.uniforms.map((t) => [e(t.type), t.length ?? 1]);
				}
			}, Ju = (e, t) => new Qu(e, t);
		}), Wt = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), el = (e, t) => {
				if (!e || e.length !== 1) throw new Error("Transpose requires 1 input.");
				if (t.length !== 0 && t.length !== e[0].dims.length) throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`);
			}, Oi = (e, t) => t.length !== 0 ? t : [...new Array(e).keys()].reverse(), tl = (e, t) => F.sortBasedOnPerm(e, Oi(e.length, t)), rl = (e, t, r, a) => {
				let n = `fn perm(i: ${a.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;
				for (let i = 0; i < t; ++i) n += `a[${e[i]}]=i[${i}];`;
				return n += "return a;}";
			}, al = (e, t) => {
				let r = [], a = [];
				for (let n = 0; n < e.length; ++n) e[n] !== 1 && r.push(e[n]), e[t[n]] !== 1 && a.push(t[n]);
				return {
					newShape: r,
					newPerm: a
				};
			}, nl = (e, t) => {
				let r = 0;
				for (let a = 0; a < e.length; ++a) if (t[e[a]] !== 1) {
					if (e[a] < r) return !1;
					r = e[a];
				}
				return !0;
			}, _t = (e, t) => {
				let r = e.dataType, a = e.dims.length, n = Oi(a, t), i = tl(e.dims, n), s = e.dims, l = i, d = a < 2 || nl(n, e.dims), c;
				if (d) return c = ($) => {
					let k = G("input", r, s, 4), C = oe("output", r, l, 4);
					return `
  ${$.registerUniform("output_size", "u32").declareVariables(k, C)}
  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`;
				}, {
					name: "TransposeCopy",
					shaderCache: { inputDependencies: ["type"] },
					getRunData: () => {
						let $ = F.size(i);
						return {
							outputs: [{
								dims: i,
								dataType: e.dataType
							}],
							dispatchGroup: { x: Math.ceil($ / 64 / 4) },
							programUniforms: [{
								type: 12,
								data: Math.ceil($ / 4)
							}]
						};
					},
					getShaderSource: c
				};
				let { newShape: h, newPerm: f } = al(e.dims, n), w = F.areEqual(f, [
					2,
					3,
					1
				]), v = F.areEqual(f, [
					3,
					1,
					2
				]);
				if (h.length === 2 || w || v) {
					s = w ? [h[0], h[1] * h[2]] : v ? [h[0] * h[1], h[2]] : h, l = [s[1], s[0]];
					let $ = 16;
					return c = (k) => {
						let C = G("a", r, s.length), I = oe("output", r, l.length);
						return `
  ${k.registerUniform("output_size", "u32").declareVariables(C, I)}
  var<workgroup> tile : array<array<${I.type.value}, 17>, ${$}>;
  ${k.mainStart([
							$,
							$,
							1
						])}
    let stride = (uniforms.output_shape[1] - 1) / ${$} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${$}u + local_id.x;
    let input_row = workgroup_id_x * ${$}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${C.getByIndices(`${C.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${$}u + local_id.x;
    let output_row = workgroup_id_y * ${$}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${I.setByIndices(`${I.type.indices}(output_row, output_col)`, "tile[local_id.x][local_id.y]")}
    }
  }`;
					}, {
						name: "TransposeShared",
						shaderCache: { inputDependencies: ["type"] },
						getRunData: () => {
							let k = F.size(i);
							return {
								outputs: [{
									dims: i,
									dataType: e.dataType
								}],
								dispatchGroup: {
									x: Math.ceil(l[1] / $),
									y: Math.ceil(l[0] / $)
								},
								programUniforms: [{
									type: 12,
									data: k
								}, ...de(s, l)]
							};
						},
						getShaderSource: c
					};
				}
				return c = ($) => {
					let k = G("a", r, s.length), C = oe("output", r, l.length);
					return `
  ${$.registerUniform("output_size", "u32").declareVariables(k, C)}

  ${rl(n, a, k, C)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${C.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${C.setByOffset("global_idx", k.getByIndices("aIndices"))}
  }`;
				}, {
					name: "Transpose",
					shaderCache: {
						hint: `${t}`,
						inputDependencies: ["rank"]
					},
					getRunData: () => {
						let $ = F.size(i);
						return {
							outputs: [{
								dims: i,
								dataType: e.dataType
							}],
							dispatchGroup: { x: Math.ceil($ / 64) },
							programUniforms: [{
								type: 12,
								data: $
							}, ...de(s, l)]
						};
					},
					getShaderSource: c
				};
			}, il = (e, t) => {
				el(e.inputs, t.perm), e.compute(_t(e.inputs[0], t.perm));
			}, sl = (e) => Ne({ perm: e.perm });
		}), Tl = Z(() => {
			"use strict";
			fe(), we(), be(), Xa(), Wt(), ol = {
				max: "select(bestValue, candidate, candidate > bestValue)",
				min: "select(bestValue, candidate, candidate < bestValue)",
				mean: "bestValue + candidate",
				sum: "bestValue + candidate",
				prod: "bestValue * candidate",
				sumSquare: "bestValue + candidate * candidate",
				logSumExp: "bestValue + exp(candidate)",
				l1: "bestValue + abs(candidate)",
				l2: "bestValue + candidate * candidate",
				logSum: "bestValue + candidate"
			}, ul = {
				max: "select(bestValue, candidate, candidate > bestValue)",
				min: "select(bestValue, candidate, candidate < bestValue)",
				mean: "bestValue + candidate",
				sum: "bestValue + candidate",
				prod: "bestValue * candidate",
				sumSquare: "bestValue + candidate",
				logSumExp: "bestValue + candidate",
				l1: "bestValue + candidate",
				l2: "bestValue + candidate",
				logSum: "bestValue + candidate"
			}, ll = {
				max: "_A[offset]",
				min: "_A[offset]",
				mean: "0",
				sum: "0",
				prod: "1",
				sumSquare: "0",
				logSumExp: "0",
				l1: "0",
				l2: "0",
				logSum: "0"
			}, dl = {
				max: "bestValue",
				min: "bestValue",
				sum: "bestValue",
				prod: "bestValue",
				sumSquare: "bestValue",
				logSumExp: "log(bestValue)",
				l1: "bestValue",
				l2: "sqrt(bestValue)",
				logSum: "log(bestValue)"
			}, pl = (e, t) => {
				let r = [];
				for (let a = t - e; a < t; ++a) r.push(a);
				return r;
			}, cl = (e, t) => {
				let r = [], a = e.length;
				for (let n = 0; n < a; n++) t.indexOf(n) === -1 && r.push(e[n]);
				return [r, t.map((n) => e[n])];
			}, ml = (e, t) => {
				let r = e.length + t.length, a = [], n = 0;
				for (let i = 0; i < r; i++) t.indexOf(i) === -1 ? a.push(e[n++]) : a.push(1);
				return a;
			}, fl = (e, t) => {
				for (let r = 0; r < e.length; ++r) if (e[e.length - r - 1] !== t - 1 - r) return !1;
				return !0;
			}, hl = (e, t) => {
				let r = [];
				if (!fl(e, t)) {
					for (let a = 0; a < t; ++a) e.indexOf(a) === -1 && r.push(a);
					e.forEach((a) => r.push(a));
				}
				return r;
			}, gl = (e, t, r, a, n, i, s) => {
				let l = r[0].dims, d = F.size(i), c = F.size(s), h = G("_A", r[0].dataType, l), f = oe("output", n, i), w = 64;
				d === 1 && (w = 256);
				let v = `
          var<workgroup> aBestValues : array<f32, ${w}>;
       `, $ = (k) => `
        ${k.registerUniform("reduceSize", "u32").declareVariables(h, f)}
        ${v}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${k.mainStart(w)}

          let outputIndex = global_idx / ${w};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${ll[a]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${w}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${ol[a]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${w}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${ul[a]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${f.setByOffset("outputIndex", `${a === "mean" ? `${f.type.storage}(bestValue / f32(uniforms.reduceSize))` : `${f.type.storage}(${dl[a]})`}`)};
         }
        }`;
				return {
					name: e,
					shaderCache: {
						hint: `${t};${w}`,
						inputDependencies: ["type"]
					},
					getShaderSource: $,
					getRunData: () => ({
						outputs: [{
							dims: i,
							dataType: n
						}],
						dispatchGroup: { x: d },
						programUniforms: [{
							type: 12,
							data: c
						}]
					})
				};
			}, Et = (e, t, r, a) => {
				let n = e.inputs.length === 1 ? r : Bi(e.inputs, r), i = n.axes;
				i.length === 0 && !n.noopWithEmptyAxes && (i = e.inputs[0].dims.map((v, $) => $));
				let s = F.normalizeAxes(i, e.inputs[0].dims.length), l = s, d = e.inputs[0], c = hl(l, e.inputs[0].dims.length);
				c.length > 0 && (d = e.compute(_t(e.inputs[0], c), {
					inputs: [0],
					outputs: [-1]
				})[0], l = pl(l.length, d.dims.length));
				let [h, f] = cl(d.dims, l), w = h;
				n.keepDims && (w = ml(h, s)), e.compute(gl(t, n.cacheKey, [d], a, e.inputs[0].dataType, w, f), { inputs: [d] });
			}, _l = (e, t) => {
				Et(e, "ReduceMeanShared", t, "mean");
			}, yl = (e, t) => {
				Et(e, "ReduceL1Shared", t, "l1");
			}, wl = (e, t) => {
				Et(e, "ReduceL2Shared", t, "l2");
			}, bl = (e, t) => {
				Et(e, "ReduceLogSumExpShared", t, "logSumExp");
			}, vl = (e, t) => {
				Et(e, "ReduceMaxShared", t, "max");
			}, $l = (e, t) => {
				Et(e, "ReduceMinShared", t, "min");
			}, xl = (e, t) => {
				Et(e, "ReduceProdShared", t, "prod");
			}, kl = (e, t) => {
				Et(e, "ReduceSumShared", t, "sum");
			}, Sl = (e, t) => {
				Et(e, "ReduceSumSquareShared", t, "sumSquare");
			}, El = (e, t) => {
				Et(e, "ReduceLogSumShared", t, "logSum");
			};
		}), Xa = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Tl(), Tt = (e) => {
				if (!e || e.length === 0 || e.length > 2) throw new Error("Reduce op requires 1 or 2 inputs.");
				if (e.length === 2 && e[1].dims.length !== 1) throw new Error("Invalid axes input dims.");
			}, Il = (e) => [
				"",
				"",
				`var value = ${e.getByIndices("input_indices")};`,
				""
			], Ka = (e, t, r, a, n, i, s = !1, l = !1) => {
				let d = [], c = r[0].dims, h = c.length, f = F.normalizeAxes(n, h), w = !l && f.length === 0;
				c.forEach((k, C) => {
					w || f.indexOf(C) >= 0 ? s && d.push(1) : d.push(k);
				});
				let v = d.length, $ = F.size(d);
				return {
					name: e,
					shaderCache: t,
					getShaderSource: (k) => {
						let C = [], I = G("_A", r[0].dataType, h), E = oe("output", i, v), A = a(I, E, f), z = A[2];
						for (let B = 0, N = 0; B < h; B++) w || f.indexOf(B) >= 0 ? (s && N++, z = `for(var j${B}: u32 = 0; j${B} < ${c[B]}; j${B}++) {
                  ${A[2].includes("last_index") ? `let last_index = j${B};` : ""}
                  ${I.indicesSet("input_indices", B, `j${B}`)}
                  ${z}
                }`) : (C.push(`${I.indicesSet("input_indices", B, E.indicesGet("output_indices", N))};`), N++);
						return `

        ${k.registerUniform("output_size", "u32").declareVariables(I, E)}

        ${k.mainStart()}
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${I.type.indices};
          let output_indices = ${E.offsetToIndices("global_idx")};

          ${C.join(`
`)}
          ${A[0]}       // init ops for reduce max/min
          ${A[1]}
          ${z}
          ${A[3]}
          ${A.length === 4 ? E.setByOffset("global_idx", "value") : A.slice(4).join(`
`)}
        }`;
					},
					getRunData: () => ({
						outputs: [{
							dims: d,
							dataType: i
						}],
						dispatchGroup: { x: Math.ceil($ / 64) },
						programUniforms: [{
							type: 12,
							data: $
						}, ...de(c, d)]
					})
				};
			}, Bi = (e, t) => {
				let r = [];
				return e[1].dims[0] > 0 && e[1].getBigInt64Array().forEach((a) => r.push(Number(a))), Ne({
					axes: r,
					keepDims: t.keepDims,
					noopWithEmptyAxes: t.noopWithEmptyAxes
				});
			}, It = (e, t, r, a) => {
				let n = e.inputs, i = n.length === 1 ? r : Bi(n, r);
				e.compute(Ka(t, {
					hint: i.cacheKey,
					inputDependencies: ["rank"]
				}, [n[0]], i.noopWithEmptyAxes && i.axes.length === 0 ? Il : a, i.axes, n[0].dataType, i.keepDims, i.noopWithEmptyAxes), { inputs: [0] });
			}, zl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceLogSum", t, (r, a) => [
					`var value = ${a.type.storage}(0);`,
					"",
					`value += ${r.getByIndices("input_indices")};`,
					"value = log(value);"
				]);
			}, Cl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceL1", t, (r, a) => [
					`var value = ${a.type.storage}(0);`,
					"",
					`value += abs(${r.getByIndices("input_indices")});`,
					""
				]);
			}, Al = (e, t) => {
				Tt(e.inputs), It(e, "ReduceL2", t, (r, a) => [
					`var t = ${a.type.value}(0); var value = ${a.type.value}(0);`,
					"",
					`t = ${r.getByIndices("input_indices")}; value += (t * t);`,
					"value = sqrt(value);"
				]);
			}, Rl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceLogSumExp", t, (r, a) => [
					`var value = ${a.type.storage}(0);`,
					"",
					`value += exp(${r.getByIndices("input_indices")});`,
					"value = log(value);"
				]);
			}, Ol = (e, t) => {
				Tt(e.inputs), It(e, "ReduceMax", t, (r, a, n) => {
					let i = [];
					for (let s = 0; s < r.rank; s++) (n.indexOf(s) >= 0 || n.length === 0) && i.push(r.indicesSet("input_indices", s, 0));
					return [
						`${i.join(`
`)}`,
						`var value = ${r.getByIndices("input_indices")};`,
						`value = max(value, ${r.getByIndices("input_indices")});`,
						""
					];
				});
			}, Bl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceMean", t, (r, a, n) => {
					let i = 1;
					for (let s = 0; s < r.rank; s++) (n.indexOf(s) >= 0 || n.length === 0) && (i *= e.inputs[0].dims[s]);
					return [
						"var sum = f32(0);",
						"",
						`sum += f32(${r.getByIndices("input_indices")});`,
						`let value = ${a.type.value}(sum / ${i});`
					];
				});
			}, Dl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceMin", t, (r, a, n) => {
					let i = [];
					for (let s = 0; s < r.rank; s++) (n.indexOf(s) >= 0 || n.length === 0) && i.push(`input_indices[${s}] = 0;`);
					return [
						`${i.join(`
`)}`,
						`var value = ${r.getByIndices("input_indices")};`,
						`value = min(value, ${r.getByIndices("input_indices")});`,
						""
					];
				});
			}, Ml = (e, t) => {
				Tt(e.inputs), It(e, "ReduceProd", t, (r, a) => [
					`var value = ${a.type.storage}(1);`,
					"",
					`value *= ${r.getByIndices("input_indices")};`,
					""
				]);
			}, Nl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceSum", t, (r, a) => [
					`var value = ${a.type.storage}(0);`,
					"",
					`value += ${r.getByIndices("input_indices")};`,
					""
				]);
			}, Pl = (e, t) => {
				Tt(e.inputs), It(e, "ReduceSumSquare", t, (r, a) => [
					`var t = ${a.type.value}(0); var value = ${a.type.value}(0);`,
					"",
					`t = ${r.getByIndices("input_indices")}; value += t * t;`,
					""
				]);
			}, zt = (e, t, r) => {
				if (t.length === 0) return r;
				let a = 1, n = 1;
				for (let i = 0; i < t.length; i++) t.indexOf(i) === -1 ? a *= e[i] : n *= e[i];
				return n < 32 && a > 1024;
			}, Ul = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Bl(e, t) : _l(e, t);
			}, Ll = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Cl(e, t) : yl(e, t);
			}, Fl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Al(e, t) : wl(e, t);
			}, ql = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Rl(e, t) : bl(e, t);
			}, Wl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Ol(e, t) : vl(e, t);
			}, Gl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Dl(e, t) : $l(e, t);
			}, Vl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Ml(e, t) : xl(e, t);
			}, Hl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Nl(e, t) : kl(e, t);
			}, jl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? Pl(e, t) : Sl(e, t);
			}, Kl = (e, t) => {
				zt(e.inputs[0].dims, t.axes, t.noopWithEmptyAxes) ? zl(e, t) : El(e, t);
			};
		}), Yl = Z(() => {
			"use strict";
			fe(), Qe(), Xa(), Di = (e) => {
				if (!e || e.length === 0 || e.length > 2) throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");
				if (e[0].dataType !== 1) throw new Error("Invalid input type.");
			}, Xl = (e, t) => {
				Di(e.inputs);
				let r = (a, n, i) => {
					let s = [];
					for (let l = 0; l < a.rank; l++) (i.indexOf(l) >= 0 || i.length === 0) && s.push(`input_indices[${l}] = 0;`);
					return [
						`${s.join(`
`)}`,
						`var value = ${a.getByIndices("input_indices")};
var best_index : i32 = 0;`,
						`if (${a.getByIndices("input_indices")} ${t.selectLastIndex > 0 ? "<=" : "<"} value) {
         value = ${a.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,
						"",
						n.setByOffset("global_idx", "best_index")
					];
				};
				e.compute(Ka("ArgMin", {
					hint: t.cacheKey,
					inputDependencies: ["rank"]
				}, [e.inputs[0]], r, [t.axis], 7, t.keepDims), { inputs: [0] });
			}, Zl = (e, t) => {
				Di(e.inputs);
				let r = (a, n, i) => {
					let s = [];
					for (let l = 0; l < a.rank; l++) (i.indexOf(l) >= 0 || i.length === 0) && s.push(`input_indices[${l}] = 0;`);
					return [
						`${s.join(`
`)}`,
						`var value = ${a.getByIndices("input_indices")};
var best_index : i32 = 0;`,
						`if (${a.getByIndices("input_indices")} ${t.selectLastIndex > 0 ? ">=" : ">"} value) {
         value = ${a.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,
						"",
						n.setByOffset("global_idx", "best_index")
					];
				};
				e.compute(Ka("argMax", {
					hint: t.cacheKey,
					inputDependencies: ["rank"]
				}, [e.inputs[0]], r, [t.axis], 7, t.keepDims), { inputs: [0] });
			}, Mi = (e) => Ne(e);
		}), Ya = Z(() => {
			"use strict";
			fe(), we(), Ga(), be(), Ql = (e, t) => {
				let r = e[0], a = e[1], n = e[2], i = e[3], s = e[4], l = e[5];
				if (s && l) throw new Error("Attention cannot have both past and attention_bias");
				if (r.dims.length !== 3) throw new Error("Input \"input\" must have 3 dimensions");
				let d = r.dims[0], c = r.dims[1], h = r.dims[2];
				if (n.dims.length !== 1) throw new Error("Input \"bias\" is expected to have 1 dimensions");
				if (a.dims.length !== 2) throw new Error("Input \"weights\" is expected to have 2 dimensions");
				if (a.dims[0] !== h) throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");
				if (n.dims[0] !== a.dims[1]) throw new Error("Input \"bias\" dimension 0 should have same length as dimension 1 of input \"weights\"");
				let f = n.dims[0] / 3, w = f, v = w;
				if (t.qkvHiddenSizes.length > 0) {
					if (t.qkvHiddenSizes.length !== 3) throw new Error("qkv_hidden_sizes attribute should have 3 elements");
					for (let A of t.qkvHiddenSizes) if (A % t.numHeads !== 0) throw new Error("qkv_hidden_sizes should be divisible by num_heads");
					f = t.qkvHiddenSizes[0], w = t.qkvHiddenSizes[1], v = t.qkvHiddenSizes[2];
				}
				let $ = c;
				if (f !== w) throw new Error("qkv_hidden_sizes first element should be same as the second");
				if (n.dims[0] !== f + w + v) throw new Error("Input \"bias\" dimension 0 should have same length as sum of Q/K/V hidden sizes");
				let k = 0;
				if (s) {
					if (w !== v) throw new Error("Input \"past\" expect k_hidden_size == v_hidden_size");
					if (s.dims.length !== 5) throw new Error("Input \"past\" must have 5 dimensions");
					if (s.dims[0] !== 2) throw new Error("Input \"past\" first dimension must be 2");
					if (s.dims[1] !== d) throw new Error("Input \"past\" second dimension must be batch_size");
					if (s.dims[2] !== t.numHeads) throw new Error("Input \"past\" third dimension must be num_heads");
					if (s.dims[4] !== w / t.numHeads) throw new Error("Input \"past\" fifth dimension must be k_hidden_size / num_heads");
					t.pastPresentShareBuffer || (k = s.dims[3]);
				}
				let C = $ + k, I = -1, E = 0;
				if (i) throw new Error("Mask not supported");
				if (s) throw new Error("past is not supported");
				if (l) {
					if (l.dims.length !== 4) throw new Error("Input \"attention_bias\" must have 4 dimensions");
					if (l.dims[0] !== d || l.dims[1] !== t.numHeads || l.dims[2] !== c || l.dims[3] !== C) throw new Error("Expect \"attention_bias\" shape (batch_size, num_heads, sequence_length, total_sequence_length)");
				}
				return {
					batchSize: d,
					sequenceLength: c,
					pastSequenceLength: k,
					kvSequenceLength: $,
					totalSequenceLength: C,
					maxSequenceLength: I,
					inputHiddenSize: h,
					hiddenSize: f,
					vHiddenSize: v,
					headSize: Math.floor(f / t.numHeads),
					vHeadSize: Math.floor(v / t.numHeads),
					numHeads: t.numHeads,
					isUnidirectional: !1,
					pastPresentShareBuffer: !1,
					maskFilterValue: t.maskFilterValue,
					maskType: E,
					scale: t.scale,
					broadcastResPosBias: !1,
					passPastInKv: !1,
					qkvFormat: 1
				};
			}, Za = (e, t, r) => t && e ? `
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e?.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       ` : `
    ${r ? "let past_sequence_length = uniforms.past_sequence_length" : ""};
    let present_sequence_length = total_sequence_length;
    `, Jl = (e, t, r, a, n, i, s, l) => {
				let d = Je(s ? 1 : i), c = 64, h = i / d;
				h < c && (c = 32);
				let f = Math.ceil(i / d / c), w = [
					{
						type: 12,
						data: t
					},
					{
						type: 12,
						data: r
					},
					{
						type: 12,
						data: a
					},
					{
						type: 12,
						data: n
					},
					{
						type: 12,
						data: h
					},
					{
						type: 12,
						data: f
					}
				], v = nt(e.dataType, d), $ = ut(1, d), k = ["type"];
				s && k.push("type"), l && k.push("type");
				let C = (I) => {
					let E = oe("x", e.dataType, e.dims, d), A = [E], z = s ? G("seq_lens", s.dataType, s.dims) : void 0;
					z && A.push(z);
					let B = l ? G("total_sequence_length_input", l.dataType, l.dims) : void 0;
					B && A.push(B);
					let N = ut(e.dataType);
					return `
  var<workgroup> thread_max: array<f32, ${c}>;
  var<workgroup> thread_sum: array<f32, ${c}>;
  ${I.registerUniforms([
						{
							name: "batch_size",
							type: "u32"
						},
						{
							name: "num_heads",
							type: "u32"
						},
						{
							name: "past_sequence_length",
							type: "u32"
						},
						{
							name: "sequence_length",
							type: "u32"
						},
						{
							name: "total_sequence_length",
							type: "u32"
						},
						{
							name: "elements_per_thread",
							type: "u32"
						}
					]).declareVariables(...A)}
  ${I.mainStart([
						c,
						1,
						1
					])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Za(z, B, !1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${c}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s ? "u32(past_sequence_length + workgroup_id.y + 1)" : "total_sequence_length"};
    var thread_max_vector = ${$}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${$}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(() => {
						switch (d) {
							case 1: return "thread_max_vector";
							case 2: return "max(thread_max_vector.x, thread_max_vector.y)";
							case 4: return "max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";
							default: throw new Error(`Unsupported components: ${d}`);
						}
					})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${c}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${$}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${$}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(() => {
						switch (d) {
							case 1: return "sum_vector";
							case 2: return "sum_vector.x + sum_vector.y";
							case 4: return "sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";
							default: throw new Error(`Unsupported components: ${d}`);
						}
					})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${c}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${E.type.value}(${N}(1.0) / ${N}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${$}(x[offset + i]);
        x[offset + i] = ${E.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s ? `
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${E.type.value}(${N}(0));
        }` : ""};
  }`;
				};
				return {
					name: "AttentionProbsSoftmax",
					shaderCache: {
						hint: `${c};${v};${d}`,
						inputDependencies: k
					},
					getShaderSource: C,
					getRunData: () => ({
						outputs: [],
						dispatchGroup: {
							x: 1,
							y: n,
							z: t * r
						},
						programUniforms: w
					})
				};
			}, ed = (e, t, r, a, n, i, s, l, d) => {
				let c = s + i.kvSequenceLength, h = [
					i.batchSize,
					i.numHeads,
					i.sequenceLength,
					c
				], f = e > 1 && a, w = i.kvNumHeads ? i.kvNumHeads : i.numHeads, v = f ? [
					i.batchSize,
					w,
					c,
					i.headSize
				] : void 0, $ = i.nReps ? i.nReps : 1, k = i.scale === 0 ? 1 / Math.sqrt(i.headSize) : i.scale, C = Je(i.headSize), I = i.headSize / C, E = 12, A = {
					x: Math.ceil(c / E),
					y: Math.ceil(i.sequenceLength / E),
					z: i.batchSize * i.numHeads
				}, z = [
					{
						type: 12,
						data: i.sequenceLength
					},
					{
						type: 12,
						data: I
					},
					{
						type: 12,
						data: c
					},
					{
						type: 12,
						data: i.numHeads
					},
					{
						type: 12,
						data: i.headSize
					},
					{
						type: 1,
						data: k
					},
					{
						type: 12,
						data: s
					},
					{
						type: 12,
						data: i.kvSequenceLength
					},
					{
						type: 12,
						data: $
					}
				], B = f && a && F.size(a.dims) > 0, N = ["type", "type"];
				B && N.push("type"), n && N.push("type"), l && N.push("type"), d && N.push("type");
				let P = [{
					dims: h,
					dataType: t.dataType,
					gpuDataType: 0
				}];
				f && P.push({
					dims: v,
					dataType: t.dataType,
					gpuDataType: 0
				});
				let T = (Y) => {
					let X = G("q", t.dataType, t.dims, C), ue = [X, G("key", r.dataType, r.dims, C)];
					if (B) {
						let pe = G("past_key", a.dataType, a.dims, C);
						ue.push(pe);
					}
					n && ue.push(G("attention_bias", n.dataType, n.dims));
					let ie = l ? G("seq_lens", l.dataType, l.dims) : void 0;
					ie && ue.push(ie);
					let K = d ? G("total_sequence_length_input", d.dataType, d.dims) : void 0;
					K && ue.push(K);
					let U = oe("output", t.dataType, h), j = [U];
					f && j.push(oe("present_key", t.dataType, v, C));
					let ne = ut(1, C);
					return `
  const TILE_SIZE = ${E}u;

  var<workgroup> tileQ: array<${X.type.storage}, 144>;
  var<workgroup> tileK: array<${X.type.storage}, 144>;
  ${Y.registerUniforms([
						{
							name: "M",
							type: "u32"
						},
						{
							name: "K",
							type: "u32"
						},
						{
							name: "N",
							type: "u32"
						},
						{
							name: "num_heads",
							type: "u32"
						},
						{
							name: "head_size",
							type: "u32"
						},
						{
							name: "alpha",
							type: "f32"
						},
						{
							name: "past_sequence_length",
							type: "u32"
						},
						{
							name: "kv_sequence_length",
							type: "u32"
						},
						{
							name: "n_reps",
							type: "u32"
						}
					]).declareVariables(...ue, ...j)}
  ${Y.mainStart([
						E,
						E,
						1
					])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${$ === 1 ? "headIdx" : "headIdx / uniforms.n_reps"};
    let kv_num_heads = ${$ === 1 ? "uniforms.num_heads" : "uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Za(ie, K, !0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${B && f ? "let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;" : ""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${f ? "let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;" : ""}
    var value = ${ne}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${B && f ? `
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }` : `
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${f ? `if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }` : ""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${ne}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(() => {
						switch (C) {
							case 1: return "value";
							case 2: return "value.x + value.y";
							case 4: return "value.x + value.y + value.z + value.w";
							default: throw new Error(`Unsupported components: ${C}`);
						}
					})()};
        output[outputIdx] = ${U.type.value} (sum * uniforms.alpha) + ${n ? "attention_bias[outputIdx]" : "0.0"};
    }
  }`;
				};
				return {
					name: "AttentionProbs",
					shaderCache: {
						hint: `${C};${n !== void 0};${a !== void 0};${e}`,
						inputDependencies: N
					},
					getRunData: () => ({
						outputs: P,
						dispatchGroup: A,
						programUniforms: z
					}),
					getShaderSource: T
				};
			}, td = (e, t, r, a, n, i, s = void 0, l = void 0) => {
				let d = i + n.kvSequenceLength, c = n.nReps ? n.nReps : 1, h = n.vHiddenSize * c, f = e > 1 && a, w = n.kvNumHeads ? n.kvNumHeads : n.numHeads, v = f ? [
					n.batchSize,
					w,
					d,
					n.headSize
				] : void 0, $ = [
					n.batchSize,
					n.sequenceLength,
					h
				], k = 12, C = {
					x: Math.ceil(n.vHeadSize / k),
					y: Math.ceil(n.sequenceLength / k),
					z: n.batchSize * n.numHeads
				}, I = [
					{
						type: 12,
						data: n.sequenceLength
					},
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: n.vHeadSize
					},
					{
						type: 12,
						data: n.numHeads
					},
					{
						type: 12,
						data: n.headSize
					},
					{
						type: 12,
						data: h
					},
					{
						type: 12,
						data: i
					},
					{
						type: 12,
						data: n.kvSequenceLength
					},
					{
						type: 12,
						data: c
					}
				], E = f && a && F.size(a.dims) > 0, A = ["type", "type"];
				E && A.push("type"), s && A.push("type"), l && A.push("type");
				let z = [{
					dims: $,
					dataType: t.dataType,
					gpuDataType: 0
				}];
				f && z.push({
					dims: v,
					dataType: t.dataType,
					gpuDataType: 0
				});
				let B = (N) => {
					let P = G("probs", t.dataType, t.dims), T = [P, G("v", r.dataType, r.dims)];
					E && T.push(G("past_value", a.dataType, a.dims));
					let Y = s ? G("seq_lens", s.dataType, s.dims) : void 0;
					s && T.push(Y);
					let X = l ? G("total_sequence_length_input", l.dataType, l.dims) : void 0;
					l && T.push(X);
					let ue = [oe("output", t.dataType, $)];
					return f && ue.push(oe("present_value", t.dataType, v)), `
  const TILE_SIZE = ${k}u;
  var<workgroup> tileQ: array<${P.type.value}, 144>;
  var<workgroup> tileV: array<${P.type.value}, 144>;
  ${N.registerUniforms([
						{
							name: "M",
							type: "u32"
						},
						{
							name: "K",
							type: "u32"
						},
						{
							name: "N",
							type: "u32"
						},
						{
							name: "num_heads",
							type: "u32"
						},
						{
							name: "head_size",
							type: "u32"
						},
						{
							name: "v_hidden_size",
							type: "u32"
						},
						{
							name: "past_sequence_length",
							type: "u32"
						},
						{
							name: "kv_sequence_length",
							type: "u32"
						},
						{
							name: "n_reps",
							type: "u32"
						}
					]).declareVariables(...T, ...ue)}
  ${N.mainStart([
						k,
						k,
						1
					])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${c === 1 ? "headIdx" : "headIdx / uniforms.n_reps"};
   let kv_num_heads = ${c === 1 ? "uniforms.num_heads" : "uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Za(Y, X, !0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${E && f ? "let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;" : ""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${f ? "let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;" : ""}
   var value = ${P.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${E && f ? `
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      ` : `
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${f ? `
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }` : ""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`;
				};
				return {
					name: "AttentionScore",
					shaderCache: {
						hint: `${a !== void 0};${e}`,
						inputDependencies: A
					},
					getRunData: () => ({
						outputs: z,
						dispatchGroup: C,
						programUniforms: I
					}),
					getShaderSource: B
				};
			}, aa = (e, t, r, a, n, i, s, l, d, c, h = void 0, f = void 0) => {
				let w = Math.min(e.outputCount, 1 + (s ? 1 : 0) + (l ? 1 : 0)), v = w > 1 ? s : void 0, $ = w > 1 ? l : void 0, k = w > 1 ? c.pastSequenceLength : 0, C = k + c.kvSequenceLength, I = d && F.size(d.dims) > 0 ? d : void 0, E = [t, r];
				v && F.size(v.dims) > 0 && E.push(v), I && E.push(I), h && E.push(h), f && E.push(f);
				let A = e.compute(ed(w, t, r, v, I, c, k, h, f), {
					inputs: E,
					outputs: w > 1 ? [-1, 1] : [-1]
				})[0];
				e.compute(Jl(A, c.batchSize, c.numHeads, k, c.sequenceLength, C, h, f), {
					inputs: h && f ? [
						A,
						h,
						f
					] : [A],
					outputs: []
				});
				let z = [A, a];
				$ && F.size($.dims) > 0 && z.push($), h && z.push(h), f && z.push(f), e.compute(td(w, A, a, $, c, k, h, f), {
					inputs: z,
					outputs: w > 1 ? [0, 2] : [0]
				});
			}, rd = (e, t) => {
				let r = [
					t.batchSize,
					t.numHeads,
					t.sequenceLength,
					t.headSize
				], a = t.sequenceLength, n = t.inputHiddenSize, i = t.headSize, s = 12, l = {
					x: Math.ceil(t.headSize / s),
					y: Math.ceil(t.sequenceLength / s),
					z: t.batchSize * t.numHeads
				}, d = [
					e.inputs[0],
					e.inputs[1],
					e.inputs[2]
				], c = [
					{
						type: 12,
						data: a
					},
					{
						type: 12,
						data: n
					},
					{
						type: 12,
						data: i
					},
					{
						type: 12,
						data: t.numHeads
					},
					{
						type: 12,
						data: t.headSize
					},
					{
						type: 12,
						data: t.hiddenSize
					},
					{
						type: 12,
						data: t.hiddenSize + t.hiddenSize + t.vHiddenSize
					}
				], h = (f) => {
					let w = oe("output_q", d[0].dataType, r), v = oe("output_k", d[0].dataType, r), $ = oe("output_v", d[0].dataType, r), k = G("input", d[0].dataType, d[0].dims), C = G("weight", d[1].dataType, d[1].dims), I = G("bias", d[2].dataType, d[2].dims), E = k.type.storage;
					return `
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${E}, 144>;
  var<workgroup> tileWeightQ: array<${E}, 144>;
  var<workgroup> tileWeightK: array<${E}, 144>;
  var<workgroup> tileWeightV: array<${E}, 144>;
  ${f.registerUniforms([
						{
							name: "M",
							type: "u32"
						},
						{
							name: "K",
							type: "u32"
						},
						{
							name: "N",
							type: "u32"
						},
						{
							name: "num_heads",
							type: "u32"
						},
						{
							name: "head_size",
							type: "u32"
						},
						{
							name: "hidden_size",
							type: "u32"
						},
						{
							name: "ldb",
							type: "u32"
						}
					]).declareVariables(k, C, I, w, v, $)}
  ${f.mainStart([
						s,
						s,
						1
					])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${E}(0);
    var valueK = ${E}(0);
    var valueV = ${E}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`;
				};
				return e.compute({
					name: "AttentionPrepare",
					shaderCache: { inputDependencies: [
						"type",
						"type",
						"type"
					] },
					getRunData: () => ({
						outputs: [
							{
								dims: r,
								dataType: e.inputs[0].dataType,
								gpuDataType: 0
							},
							{
								dims: r,
								dataType: e.inputs[0].dataType,
								gpuDataType: 0
							},
							{
								dims: r,
								dataType: e.inputs[0].dataType,
								gpuDataType: 0
							}
						],
						dispatchGroup: l,
						programUniforms: c
					}),
					getShaderSource: h
				}, {
					inputs: d,
					outputs: [
						-1,
						-1,
						-1
					]
				});
			}, ad = (e, t) => {
				let r = Ql(e.inputs, t), [a, n, i] = rd(e, r);
				return aa(e, a, n, i, e.inputs[4], void 0, void 0, void 0, e.inputs[5], r);
			};
		}), ud = Z(() => {
			"use strict";
			ht(), fe(), we(), Qe(), be(), nd = (e, t) => {
				if (!e || e.length !== 5) throw new Error("BatchNormalization requires 5 inputs");
				let r = (a, n, i) => {
					let s = n.length;
					if (s !== a.length) throw new Error(`${i}: num dimensions != ${s}`);
					n.forEach((l, d) => {
						if (l !== a[d]) throw new Error(`${i}: dim[${d}] do not match`);
					});
				};
				if (e[0].dims.length > 1) {
					let a = t.format === "NHWC" ? t.spatial ? e[0].dims.slice(-1) : e[0].dims.slice(-1).concat(e[0].dims.slice(1, e[0].dims.length - 1)) : e[0].dims.slice(1, t.spatial ? 2 : void 0);
					r(e[1].dims, a, "Invalid input scale"), r(e[2].dims, a, "Invalid input B"), r(e[3].dims, a, "Invalid input mean"), r(e[4].dims, a, "Invalid input var");
				} else r(e[1].dims, [1], "Invalid input scale"), r(e[2].dims, [1], "Invalid input B"), r(e[3].dims, [1], "Invalid input mean"), r(e[4].dims, [1], "Invalid input var");
			}, id = (e, t) => {
				let { epsilon: r, spatial: a, format: n } = t, i = e[0].dims, s = a ? Je(i[i.length - 1]) : 1, l = n === "NHWC" && i.length > 1 ? s : 1, d = F.size(i) / s, c = a, h = c ? i.length : i, f = G("x", e[0].dataType, e[0].dims, s), w = G("scale", e[1].dataType, e[1].dims, l), v = G("bias", e[2].dataType, e[2].dims, l), $ = G("inputMean", e[3].dataType, e[3].dims, l), k = G("inputVar", e[4].dataType, e[4].dims, l), C = oe("y", e[0].dataType, h, s), I = () => {
					let A = "";
					if (a) A = `let cOffset = ${i.length === 1 ? "0u" : n === "NHWC" ? `outputIndices[${i.length - 1}] / ${s}` : "outputIndices[1]"};`;
					else if (n === "NCHW") A = `
            ${C.indicesSet("outputIndices", "0", "0")}
            let cOffset = ${C.indicesToOffset("outputIndices")};`;
					else {
						A = `var cIndices = ${w.type.indices}(0);
                       cIndices[0] = outputIndices[${i.length - 1}];`;
						for (let z = 1; z < w.rank; z++) A += `cIndices[${z}] = outputIndices[${z}];`;
						A += `let cOffset = ${w.indicesToOffset("cIndices")};`;
					}
					return A;
				}, E = (A) => `
  const epsilon = ${r};
  ${A.registerUniform("outputSize", "u32").declareVariables(f, w, v, $, k, C)}
  ${A.mainStart()}
  ${A.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${C.offsetToIndices(`global_idx * ${s}`)};
    ${I()}
    let scale = ${w.getByOffset("cOffset")};
    let bias = ${v.getByOffset("cOffset")};
    let inputMean = ${$.getByOffset("cOffset")};
    let inputVar = ${k.getByOffset("cOffset")};
    let x = ${f.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${C.setByOffset("global_idx", "value")}
  }`;
				return {
					name: "BatchNormalization",
					shaderCache: {
						hint: `${t.epsilon}_${t.format}_${a}_${s}`,
						inputDependencies: c ? [
							"rank",
							"type",
							"type",
							"type",
							"type"
						] : void 0
					},
					getShaderSource: E,
					getRunData: () => ({
						outputs: [{
							dims: e[0].dims,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(d / 64) },
						programUniforms: c ? [{
							type: 12,
							data: d
						}, ...de(i)] : [{
							type: 12,
							data: d
						}]
					})
				};
			}, sd = (e) => Ne(e), od = (e, t) => {
				let { inputs: r, outputCount: a } = e, n = sd({
					...t,
					outputCount: a
				});
				if (He.webgpu.validateInputContent && nd(r, n), t.trainingMode) throw new Error("BatchNormalization trainingMode is not supported yet.");
				e.compute(id(r, n));
			};
		}), cd = Z(() => {
			"use strict";
			we(), be(), ld = (e) => {
				if (e[0].dims.length !== 3) throw new Error("input should have 3 dimensions");
				if (![
					320,
					640,
					1280
				].includes(e[0].dims[2])) throw new Error("number of channels should be 320, 640 or 1280");
				if (e[1].dims.length !== 1) throw new Error("bias is expected to have 1 dimensions");
				if (e[0].dims[2] !== e[1].dims[0]) throw new Error("last dimension of input and bias are not the same");
			}, dd = (e) => {
				let t = e[0].dims, r = e[0].dims[2], a = F.size(t) / 4, n = e[0].dataType, i = G("input", n, t, 4), s = G("bias", n, [r], 4), l = G("residual", n, t, 4), d = oe("output", n, t, 4);
				return {
					name: "BiasAdd",
					getRunData: () => ({
						outputs: [{
							dims: t,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(a / 64) }
					}),
					getShaderSource: (c) => `
  const channels = ${r}u / 4;
  ${c.declareVariables(i, s, l, d)}

  ${c.mainStart()}
    ${c.guardAgainstOutOfBoundsWorkgroupSizes(a)}
    let value = ${i.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${l.getByOffset("global_idx")};
    ${d.setByOffset("global_idx", "value")}
  }`
				};
			}, pd = (e) => {
				ld(e.inputs), e.compute(dd(e.inputs));
			};
		}), Ja = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), md = (e, t, r, a, n, i, s) => {
				let l = Math.ceil(t / 4), d = "";
				typeof n == "string" ? d = `${n}(a)` : d = n("a");
				let c = G("inputData", r, [l], 4), h = oe("outputData", a, [l], 4), f = [{
					name: "vec_size",
					type: "u32"
				}];
				return s && f.push(...s), `
      ${e.registerUniforms(f).declareVariables(c, h)}

  ${i ?? ""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${c.getByOffset("global_idx")};
    ${h.setByOffset("global_idx", d)}
  }`;
			}, Me = (e, t, r, a, n, i = e.dataType, s, l) => {
				let d = [{
					type: 12,
					data: Math.ceil(F.size(e.dims) / 4)
				}];
				return s && d.push(...s), {
					name: t,
					shaderCache: {
						hint: n,
						inputDependencies: ["type"]
					},
					getShaderSource: (c) => md(c, F.size(e.dims), e.dataType, i, r, a, l),
					getRunData: (c) => ({
						outputs: [{
							dims: e.dims,
							dataType: i
						}],
						dispatchGroup: { x: Math.ceil(F.size(c[0].dims) / 64 / 4) },
						programUniforms: d
					})
				};
			}, fd = (e) => {
				e.compute(Me(e.inputs[0], "Abs", "abs"));
			}, hd = (e) => {
				e.compute(Me(e.inputs[0], "Acos", "acos"));
			}, gd = (e) => {
				e.compute(Me(e.inputs[0], "Acosh", "acosh"));
			}, _d = (e) => {
				e.compute(Me(e.inputs[0], "Asin", "asin"));
			}, yd = (e) => {
				e.compute(Me(e.inputs[0], "Asinh", "asinh"));
			}, wd = (e) => {
				e.compute(Me(e.inputs[0], "Atan", "atan"));
			}, bd = (e) => {
				e.compute(Me(e.inputs[0], "Atanh", "atanh"));
			}, vd = (e) => Ne(e), $d = (e, t) => {
				let r;
				switch (t.to) {
					case 10:
						r = "vec4<f16>";
						break;
					case 1:
						r = "vec4<f32>";
						break;
					case 12:
						r = "vec4<u32>";
						break;
					case 6:
						r = "vec4<i32>";
						break;
					case 9:
						r = "vec4<bool>";
						break;
					default: throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`);
				}
				e.compute(Me(e.inputs[0], "Cast", r, void 0, t.cacheKey, t.to));
			}, xd = (e) => {
				let t, r, a = e.length >= 2 && e[1].data !== 0, n = e.length >= 3 && e[2].data !== 0;
				switch (e[0].dataType) {
					case 1:
						t = a ? e[1].getFloat32Array()[0] : -34028234663852886e22, r = n ? e[2].getFloat32Array()[0] : 34028234663852886e22;
						break;
					case 10:
						t = a ? e[1].getUint16Array()[0] : 64511, r = n ? e[2].getUint16Array()[0] : 31743;
						break;
					default: throw new Error("Unsupport data type");
				}
				return Ne({
					min: t,
					max: r
				});
			}, kd = (e, t) => {
				let r = t || xd(e.inputs), a = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "Clip", (n) => `clamp(${n}, vec4<${a}>(uniforms.min), vec4<${a}>(uniforms.max))`, void 0, r.cacheKey, void 0, [{
					type: e.inputs[0].dataType,
					data: r.min
				}, {
					type: e.inputs[0].dataType,
					data: r.max
				}], [{
					name: "min",
					type: a
				}, {
					name: "max",
					type: a
				}]), { inputs: [0] });
			}, Sd = (e) => {
				e.compute(Me(e.inputs[0], "Ceil", "ceil"));
			}, Ed = (e) => {
				e.compute(Me(e.inputs[0], "Cos", "cos"));
			}, Td = (e) => {
				e.compute(Me(e.inputs[0], "Cosh", "cosh"));
			}, na = (e) => Ne(e), Id = (e, t) => {
				let r = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "Elu", (a) => `elu_vf32(${a})`, `
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`, t.cacheKey));
			}, Qa = (e = "f32") => `
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`, zd = (e) => {
				let t = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "Erf", (r) => `erf_vf32(${r})`, Qa(t)));
			}, Cd = (e) => {
				e.compute(Me(e.inputs[0], "Exp", "exp"));
			}, Ad = (e) => {
				e.compute(Me(e.inputs[0], "Floor", "floor"));
			}, Rd = (e) => {
				let t = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "Gelu", (r) => `0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`, Qa(t)));
			}, Od = (e, t) => {
				let r = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "LeakyRelu", (a) => `select(leaky_relu_alpha_ * ${a}, ${a}, ${a} >= vec4<${r}>(0.0))`, `const leaky_relu_alpha_ = ${r}(${t.alpha});`, t.cacheKey));
			}, Bd = (e) => {
				e.compute(Me(e.inputs[0], "Not", (t) => `!${t}`));
			}, Dd = (e) => {
				e.compute(Me(e.inputs[0], "Neg", (t) => `-${t}`));
			}, Md = (e) => {
				e.compute(Me(e.inputs[0], "Reciprocal", (t) => `1.0/${t}`));
			}, Nd = (e) => {
				let t = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "Relu", (r) => `select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`));
			}, Pd = (e) => {
				e.compute(Me(e.inputs[0], "Sigmoid", (t) => `(1.0 / (1.0 + exp(-${t})))`));
			}, Ud = (e) => Ne(e), Ld = (e, t) => {
				let r = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "HardSigmoid", (a) => `max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${a} + vec4<${r}>(${t.beta})))`, void 0, t.cacheKey));
			}, Fd = (e) => {
				e.compute(Me(e.inputs[0], "Sin", "sin"));
			}, qd = (e) => {
				e.compute(Me(e.inputs[0], "Sinh", "sinh"));
			}, Wd = (e) => {
				e.compute(Me(e.inputs[0], "Sqrt", "sqrt"));
			}, Gd = (e) => {
				e.compute(Me(e.inputs[0], "Tan", "tan"));
			}, Ni = (e) => `sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`, Vd = (e) => {
				e.compute(Me(e.inputs[0], "Tanh", Ni));
			}, Pi = (e = "f32") => `
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Ni("v")};
}
`, Ui = (e) => `(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`, Hd = (e) => {
				let t = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "FastGelu", Ui, Pi(t), void 0, e.inputs[0].dataType));
			}, jd = (e, t) => {
				let r = ut(e.inputs[0].dataType);
				return e.compute(Me(e.inputs[0], "ThresholdedRelu", (a) => `select(vec4<${r}>(0.0), ${a}, ${a} > thresholded_relu_alpha_)`, `const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`, t.cacheKey)), 0;
			}, Kd = (e) => {
				e.compute(Me(e.inputs[0], "Log", "log"));
			}, Xd = (e, t) => `
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`, Zd = (e) => `quick_gelu_impl(${e})`, Yd = (e, t) => {
				let r = ut(e.inputs[0].dataType);
				e.compute(Me(e.inputs[0], "QuickGelu", Zd, Xd(r, t.alpha), t.cacheKey, e.inputs[0].dataType));
			};
		}), tp = Z(() => {
			"use strict";
			we(), be(), Ja(), Qd = (e) => {
				if (e[0].dims.length !== 3) throw new Error("input should have 3 dimensions");
				if (![
					2560,
					5120,
					10240
				].includes(e[0].dims[2])) throw new Error("hidden state should be 2560, 5120 or 10240");
				if (e[1].dims.length !== 1) throw new Error("bias is expected to have 1 dimensions");
				if (e[0].dims[2] !== e[1].dims[0]) throw new Error("last dimension of input and bias are not the same");
			}, Jd = (e) => {
				let t = e[0].dims.slice();
				t[2] = t[2] / 2;
				let r = G("input", e[0].dataType, e[0].dims, 4), a = G("bias", e[0].dataType, [e[0].dims[2]], 4), n = oe("output", e[0].dataType, t, 4), i = F.size(t) / 4, s = nt(e[0].dataType);
				return {
					name: "BiasSplitGelu",
					getRunData: () => ({
						outputs: [{
							dims: t,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(i / 64) }
					}),
					getShaderSource: (l) => `
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2] / 4 / 2}u;

  ${l.declareVariables(r, a, n)}

  ${Qa(s)}

  ${l.mainStart()}
    ${l.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${n.setByOffset("global_idx", "valueLeft * geluRight")}
  }`
				};
			}, ep = (e) => {
				Qd(e.inputs), e.compute(Jd(e.inputs));
			};
		}), fp = Z(() => {
			"use strict";
			fe(), we(), be(), rp = (e, t, r, a, n, i, s, l, d, c, h, f) => {
				let w, v;
				typeof l == "string" ? w = v = (E, A) => `${l}((${E}),(${A}))` : typeof l == "function" ? w = v = l : (w = l.scalar, v = l.vector);
				let $ = oe("outputData", h, a.length, 4), k = G("aData", d, t.length, 4), C = G("bData", c, r.length, 4), I;
				if (n) if (i) {
					let E = F.size(t) === 1, A = F.size(r) === 1, z = t.length > 0 && t[t.length - 1] % 4 === 0, B = r.length > 0 && r[r.length - 1] % 4 === 0;
					E || A ? I = $.setByOffset("global_idx", v(E ? `${k.type.value}(${k.getByOffset("0")}.x)` : k.getByOffset("global_idx"), A ? `${C.type.value}(${C.getByOffset("0")}.x)` : C.getByOffset("global_idx"))) : I = `
            let outputIndices = ${$.offsetToIndices("global_idx * 4u")};
            let offsetA = ${k.broadcastedIndicesToOffset("outputIndices", $)};
            let offsetB = ${C.broadcastedIndicesToOffset("outputIndices", $)};
            ${$.setByOffset("global_idx", v(s || z ? k.getByOffset("offsetA / 4u") : `${k.type.value}(${k.getByOffset("offsetA / 4u")}[offsetA % 4u])`, s || B ? C.getByOffset("offsetB / 4u") : `${C.type.value}(${C.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `;
				} else I = $.setByOffset("global_idx", v(k.getByOffset("global_idx"), C.getByOffset("global_idx")));
				else {
					if (!i) throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");
					let E = (A, z, B = "") => {
						let N = `aData[indexA${z}][componentA${z}]`, P = `bData[indexB${z}][componentB${z}]`;
						return `
            let outputIndices${z} = ${$.offsetToIndices(`global_idx * 4u + ${z}u`)};
            let offsetA${z} = ${k.broadcastedIndicesToOffset(`outputIndices${z}`, $)};
            let offsetB${z} = ${C.broadcastedIndicesToOffset(`outputIndices${z}`, $)};
            let indexA${z} = offsetA${z} / 4u;
            let indexB${z} = offsetB${z} / 4u;
            let componentA${z} = offsetA${z} % 4u;
            let componentB${z} = offsetB${z} % 4u;
            ${A}[${z}] = ${B}(${w(N, P)});
          `;
					};
					h === 9 ? I = `
            var data = vec4<u32>(0);
            ${E("data", 0, "u32")}
            ${E("data", 1, "u32")}
            ${E("data", 2, "u32")}
            ${E("data", 3, "u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));` : I = `
            ${E("outputData[global_idx]", 0)}
            ${E("outputData[global_idx]", 1)}
            ${E("outputData[global_idx]", 2)}
            ${E("outputData[global_idx]", 3)}
          `;
				}
				return `
        ${e.registerUniform("vec_size", "u32").declareVariables(k, C, $)}

        ${f ?? ""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${I}
      }`;
			}, ap = (e, t, r, a, n, i, s = r.dataType) => {
				let l = r.dims.map(Number), d = a.dims.map(Number), c = !F.areEqual(l, d), h = l, f = F.size(l), w = !1, v = !1, $ = [c];
				if (c) {
					let k = Nr.calcShape(l, d, !1);
					if (!k) throw new Error("Can't perform binary op on the given tensors");
					h = k.slice(), f = F.size(h);
					let C = F.size(l) === 1, I = F.size(d) === 1, E = l.length > 0 && l[l.length - 1] % 4 === 0, A = d.length > 0 && d[d.length - 1] % 4 === 0;
					$.push(C), $.push(I), $.push(E), $.push(A);
					let z = 1;
					for (let B = 1; B < h.length; B++) {
						let N = l[l.length - B];
						if (N === d[d.length - B]) z *= N;
						else break;
					}
					z % 4 === 0 ? (v = !0, w = !0) : (C || I || E || A) && (w = !0);
				} else w = !0;
				return $.push(w), {
					name: e,
					shaderCache: {
						hint: t + $.map((k) => k.toString()).join("_"),
						inputDependencies: ["rank", "rank"]
					},
					getShaderSource: (k) => rp(k, l, d, h, w, c, v, n, r.dataType, a.dataType, s, i),
					getRunData: () => ({
						outputs: [{
							dims: h,
							dataType: s
						}],
						dispatchGroup: { x: Math.ceil(f / 64 / 4) },
						programUniforms: [{
							type: 12,
							data: Math.ceil(F.size(h) / 4)
						}, ...de(l, d, h)]
					})
				};
			}, Ct = (e, t, r, a, n, i) => {
				e.compute(ap(t, n ?? "", e.inputs[0], e.inputs[1], r, a, i));
			}, np = (e) => {
				Ct(e, "Add", (t, r) => `${t}+${r}`);
			}, ip = (e) => {
				Ct(e, "Div", (t, r) => `${t}/${r}`);
			}, sp = (e) => {
				Ct(e, "Equal", {
					scalar: (t, r) => `u32(${t}==${r})`,
					vector: (t, r) => `vec4<u32>(${t}==${r})`
				}, void 0, void 0, 9);
			}, op = (e) => {
				Ct(e, "Mul", (t, r) => `${t}*${r}`);
			}, up = (e) => {
				let t = G("input", e.inputs[0].dataType, e.inputs[0].dims).type.value;
				Ct(e, "Pow", {
					scalar: (r, a) => `pow_custom(${r},${a})`,
					vector: (r, a) => `pow_vector_custom(${r},${a})`
				}, `
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t === "i32" ? "round" : ""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `);
			}, lp = (e) => {
				Ct(e, "Sub", (t, r) => `${t}-${r}`);
			}, dp = (e) => {
				Ct(e, "Greater", {
					scalar: (t, r) => `u32(${t}>${r})`,
					vector: (t, r) => `vec4<u32>(${t}>${r})`
				}, void 0, void 0, 9);
			}, pp = (e) => {
				Ct(e, "Less", {
					scalar: (t, r) => `u32(${t}<${r})`,
					vector: (t, r) => `vec4<u32>(${t}<${r})`
				}, void 0, void 0, 9);
			}, cp = (e) => {
				Ct(e, "GreaterOrEqual", {
					scalar: (t, r) => `u32(${t}>=${r})`,
					vector: (t, r) => `vec4<u32>(${t}>=${r})`
				}, void 0, void 0, 9);
			}, mp = (e) => {
				Ct(e, "LessOrEqual", {
					scalar: (t, r) => `u32(${t}<=${r})`,
					vector: (t, r) => `vec4<u32>(${t}<=${r})`
				}, void 0, void 0, 9);
			};
		}), vp = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), hp = (e, t) => {
				if (!e || e.length < 1) throw new Error("too few inputs");
				let r = 0, a = e[r], n = a.dataType, i = a.dims.length;
				e.forEach((s, l) => {
					if (l !== r) {
						if (s.dataType !== n) throw new Error("input tensors should be one type");
						if (s.dims.length !== i) throw new Error("input tensors should have the same shape");
						s.dims.forEach((d, c) => {
							if (c !== t && d !== a.dims[c]) throw new Error("non concat dimensions must match");
						});
					}
				});
			}, gp = (e, t) => `
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`, _p = (e, t) => {
				let r = e.length, a = [];
				for (let n = 0; n < r; ++n) {
					let i = t.setByOffset("global_idx", e[n].getByIndices("indices"));
					r === 1 ? a.push(i) : n === 0 ? a.push(`if (inputIndex == ${n}u) { ${i} }`) : n === r - 1 ? a.push(`else { ${i} }`) : a.push(`else if (inputIndex == ${n}) { ${i} }`);
				}
				return a.join(`
`);
			}, yp = (e, t, r, a) => {
				let n = F.size(r), i = new Array(e.length), s = new Array(e.length), l = 0, d = [], c = [], h = [{
					type: 12,
					data: n
				}];
				for (let k = 0; k < e.length; ++k) l += e[k].dims[t], i[k] = l, c.push(e[k].dims.length), s[k] = G(`input${k}`, a, c[k]), d.push("rank"), h.push({
					type: 12,
					data: i[k]
				});
				for (let k = 0; k < e.length; ++k) h.push(...de(e[k].dims));
				h.push(...de(r));
				let f = oe("output", a, r.length), w = f.indicesGet("indices", t), v = Array.from(Array(i.length).keys()).map((k) => `uniforms.sizeInConcatAxis${k}`).join(","), $ = (k) => `

  ${(() => {
					k.registerUniform("outputSize", "u32");
					for (let C = 0; C < e.length; C++) k.registerUniform(`sizeInConcatAxis${C}`, "u32");
					return k.declareVariables(...s, f);
				})()}

  ${gp(i.length, v)}

  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${f.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${w});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${i.length}u>(${v});
      ${w} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${_p(s, f)}
  }`;
				return {
					name: "Concat",
					shaderCache: {
						hint: `${t}`,
						inputDependencies: d
					},
					getRunData: () => ({
						outputs: [{
							dims: r,
							dataType: a
						}],
						dispatchGroup: { x: Math.ceil(n / 64) },
						programUniforms: h
					}),
					getShaderSource: $
				};
			}, wp = (e, t) => {
				let r = e.inputs, a = r[0].dims, n = F.normalizeAxis(t.axis, a.length);
				hp(r, n);
				let i = a.slice();
				i[n] = r.reduce((l, d) => l + (d.dims.length > n ? d.dims[n] : 0), 0);
				let s = r.filter((l) => F.size(l.dims) > 0);
				e.compute(yp(s, n, i, r[0].dataType), { inputs: s });
			}, bp = (e) => Ne({ axis: e.axis });
		}), nr = Z(() => {
			"use strict";
			fe(), we(), vr = (e, t, r = "f32") => {
				switch (e.activation) {
					case "Relu": return `value = max(value, ${t}(0.0));`;
					case "Sigmoid": return `value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;
					case "Clip": return `value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;
					case "HardSigmoid": return `value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;
					case "LeakyRelu": return `value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;
					case "Tanh": return `let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;
					case "": return "";
					default: throw new Error(`Unsupported activation ${e.activation}`);
				}
			}, $r = (e, t) => {
				e.activation === "Clip" ? t.push({
					type: 1,
					data: e.clipMax
				}, {
					type: 1,
					data: e.clipMin
				}) : e.activation === "HardSigmoid" ? t.push({
					type: 1,
					data: e.alpha
				}, {
					type: 1,
					data: e.beta
				}) : e.activation === "LeakyRelu" && t.push({
					type: 1,
					data: e.alpha
				});
			}, xr = (e, t) => {
				e.activation === "Clip" ? t.push({
					name: "clip_max",
					type: "f32"
				}, {
					name: "clip_min",
					type: "f32"
				}) : e.activation === "HardSigmoid" ? t.push({
					name: "alpha",
					type: "f32"
				}, {
					name: "beta",
					type: "f32"
				}) : e.activation === "LeakyRelu" && t.push({
					name: "alpha",
					type: "f32"
				});
			}, Li = (e) => {
				let t = e?.activation || "";
				if (t === "HardSigmoid") {
					let [r, a] = e?.activation_params || [.2, .5];
					return {
						activation: t,
						alpha: r,
						beta: a
					};
				} else if (t === "Clip") {
					let [r, a] = e?.activation_params || [Du, Mu];
					return {
						activation: t,
						clipMax: a,
						clipMin: r
					};
				} else if (t === "LeakyRelu") {
					let [r] = e?.activation_params || [.01];
					return {
						activation: t,
						alpha: r
					};
				}
				return { activation: t };
			};
		}), en = Z(() => {
			"use strict";
			st = (e, t) => {
				switch (e) {
					case 1: return t;
					case 2: return `vec2<${t}>`;
					case 3: return `vec3<${t}>`;
					case 4: return `vec4<${t}>`;
					default: throw new Error(`${e}-component is not supported.`);
				}
			}, $p = (e) => `
      ${e ? "value = value + getBiasByOutputCoords(coords);" : ""}
      `;
		}), kp = Z(() => {
			"use strict";
			xp = (e) => `
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`;
		}), tn = Z(() => {
			"use strict";
			fe(), we(), be(), nr(), ia = (e, t, r, a, n) => {
				let i = a - r;
				return `
      ${Array.from({ length: r }).map((s, l) => `
      if (${le(t.shape, l, t.rank)} != 1) {
        ${t.indicesSet(e, l, le(n, l + i, a))}
      } else {
        ${t.indicesSet(e, l, 0)}
      }`).join("")}
`;
			}, Fi = (e, t, r, a, n = !1, i) => {
				let s = e[0].dims, l = e[1].dims, d = s[s.length - 2], c = l[l.length - 1], h = s[s.length - 1], f = Je(c), w = Je(h), v = Je(d), $ = F.size(r) / f / v, k = e.length > 2, C = a ? a.slice(0, -2) : r.slice(0, -2), I = [
					F.size(C),
					d,
					c
				], E = [
					{
						type: 12,
						data: $
					},
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: c
					},
					{
						type: 12,
						data: h
					}
				];
				$r(t, E), E.push(...de(C, s, l)), k && E.push(...de(e[2].dims)), E.push(...de(I));
				let A = (z) => {
					let B = Ri("batch_dims", e[0].dataType, C.length), N = G("a", e[0].dataType, s.length, w), P = G("b", e[1].dataType, l.length, f), T = oe("output", e[0].dataType, I.length, f), Y = nt(T.type.tensor), X = vr(t, T.type.value, Y), ue = [N, P], ie = "";
					if (k) {
						let j = n ? f : 1;
						ue.push(G("bias", e[2].dataType, e[2].dims.length, j)), ie = `${n ? `value += bias[col / ${j}];` : `value += ${T.type.value}(bias[row + i]);`}`;
					}
					let K = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "M",
							type: "u32"
						},
						{
							name: "N",
							type: "u32"
						},
						{
							name: "K",
							type: "u32"
						}
					];
					xr(t, K);
					let U = () => {
						let j = `var a_data: ${N.type.value};`;
						for (let ne = 0; ne < w; ne++) j += `
              let b_data${ne} = b[(b_offset + (k + ${ne}) * uniforms.N + col) / ${f}];`;
						for (let ne = 0; ne < v; ne++) {
							j += `a_data = a[(a_offset + (row + ${ne}) * uniforms.K + k) / ${w}];`;
							for (let pe = 0; pe < w; pe++) j += `
            values[${ne}] = fma(${P.type.value}(a_data${w === 1 ? "" : `[${pe}]`}), b_data${pe}, values[${ne}]);
`;
						}
						return j;
					};
					return `
  ${z.registerUniforms(K).registerInternalVariables(B).declareVariables(...ue, T)}
  ${z.mainStart()}
    ${z.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${f})) * ${f};
    var index1 = global_idx / (uniforms.N / ${f});
    let stride1 = uniforms.M / ${v};
    let row = (index1 % stride1) * ${v};
    let batch = index1 / stride1;

    ${r.length === 2 ? "" : `let batch_indices = ${B.offsetToIndices("batch")};`}

    var a_indices: ${N.type.indices};
    ${ia("a_indices", N, N.rank - 2, B.rank, "batch_indices")}
    ${N.indicesSet("a_indices", N.rank - 2, 0)}
    ${N.indicesSet("a_indices", N.rank - 1, 0)}
    let a_offset = ${N.indicesToOffset("a_indices")};

    var b_indices: ${P.type.indices};
    ${ia("b_indices", P, P.rank - 2, B.rank, "batch_indices")}
    ${P.indicesSet("b_indices", P.rank - 2, 0)}
    ${P.indicesSet("b_indices", P.rank - 1, 0)}
    let b_offset = ${P.indicesToOffset("b_indices")};
    var values: array<${T.type.value}, ${v}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${w}) {
      ${U()}
    }
    for (var i = 0u; i < ${v}u; i++) {
      var value = values[i];
      ${ie}
      ${X}
      let cur_indices = ${T.type.indices}(batch, row + i, col);
      let offset = ${T.indicesToOffset("cur_indices")};
      ${T.setByOffset(`offset / ${f}`, "value")};
    }
  }
  `;
				};
				return {
					name: "MatMulNaive",
					shaderCache: {
						hint: `${t.activation};${f};${w};${v};${n}`,
						inputDependencies: k ? [
							"rank",
							"rank",
							"rank"
						] : ["rank", "rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: i ? i(r) : r,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil($ / 64) },
						programUniforms: E
					}),
					getShaderSource: A
				};
			};
		}), an = Z(() => {
			"use strict";
			fe(), we(), be(), nr(), tn(), en(), Sp = (e, t) => e ? `
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t ? ", batchIndices" : ""});
        ` : `
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t ? ", batchIndices" : ""});
        `, Ep = (e, t) => e ? `
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t === 3 ? "" : "let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t === 3 ? "" : "acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }` : `
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t === 3 ? "" : "acc[i] = BCached3 * ACached.w + acc[i];"}
        }`, qi = (e, t, r = "f32", a, n = !1, i = 32, s = !1, l = 32) => {
				let d = t[1] * e[1], c = t[0] * e[0], h = n ? d : i, f = n ? i : d, w = h / t[0], v = i / t[1];
				if (!((n && w === 4 && e[1] === 4 || !n && (w === 3 || w === 4)) && h % t[0] === 0 && i % t[1] === 0 && e[0] === 4)) throw new Error(`If transposeA ${n} is true, innerElementSize ${w} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${w} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${i} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);
				return `
var<workgroup> mm_Asub: array<array<vec${w}<${r}>, ${h / w}>, ${f}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${c / e[0]}>, ${i}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${w};
const tileInner = ${i};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s ? "0" : "i32(globalId.z)"};
  ${a ? `let batchIndices = ${a.offsetToIndices("u32(batch)")};` : ""}
  let globalRowStart = i32(workgroupId.y) * ${d};

  let num_tiles = ${s ? `${Math.ceil(l / i)}` : "(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s ? `i32(globalId.z) * ${l}` : "0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${v};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Sp(n, a)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${v}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${a ? ", batchIndices" : ""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${w === 3 ? "" : "let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Ep(n, w)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`;
			}, Wi = (e, t) => e ? `
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t ? ", batchIndices" : ""});
            ` : `
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t ? ", batchIndices" : ""});
            `, Tp = (e) => e ? "let ACached = mm_Asub[k][tileRow + innerRow];" : "let ACached = mm_Asub[tileRow + innerRow][k];", Gi = (e, t, r = "f32", a, n = !1, i = 32, s = !1, l = 32, d = !1) => {
				let c = e[1] * t[1], h = e[0] * t[0], f = n ? c : i, w = n ? i : c;
				if (!(w % t[1] === 0 && f % t[0] === 0 && i % t[1] === 0)) throw new Error(`tileAHight ${w} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}, tileInner ${i} must be divisible by workgroupSize[1]${t[1]}`);
				let v = w / t[1], $ = f / t[0], k = i / t[1], C = d ? `
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${c};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${w}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          ${Wi(n, a)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${i}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${a ? ", batchIndices" : ""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${n ? `mm_Asub[k][localRow + innerRow * ${t[1]}];` : `mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    ` : `
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${c};

let tileRowA = i32(localId.y) * ${v};
let tileColA = i32(localId.x) * ${$};
let tileRowB = i32(localId.y) * ${k};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${v}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${$}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${Wi(n, a)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${k}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${a ? ", batchIndices" : ""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${Tp(n)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;
				return `
  var<workgroup> mm_Asub : array<array<${r}, ${f}>, ${w}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${i}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${i};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s ? "0" : "i32(globalId.z)"};
    ${a ? `let batchIndices = ${a.offsetToIndices("u32(batch)")};` : ""}
    let num_tiles = ${s ? `${Math.ceil(l / i)}` : "(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s ? `i32(globalId.z) * ${l}` : "0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${C}
  }
`;
			}, Ip = (e, t, r, a, n = !1) => {
				let [i, s, l, d] = a, c = nt(a[0].type.tensor);
				return `
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${i.type.indices}) -> ${st(e, c)} {
      var value = ${st(e, c)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${ia("aIndices", s, s.rank - 2, i.rank, "batchIndices")}
        ${s.indicesSet("aIndices", s.rank - 2, "u32(row)")}
        ${s.indicesSet("aIndices", s.rank - 1, "u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${i.type.indices}) -> ${st(e, c)} {
      var value = ${st(e, c)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${l.type.indices};
        ${ia("bIndices", l, l.rank - 2, i.rank, "batchIndices")}
        ${l.indicesSet("bIndices", l.rank - 2, "u32(row)")}
        ${l.indicesSet("bIndices", l.rank - 1, "u32(colIn)")}
        value = ${l.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${st(e, c)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t ? `value = value + ${n ? "bias[colIn]" : `${st(e, c)}(bias[row])`};` : ""}
        ${r}
        ${d.setByIndices("vec3<u32>(coords)", "value")}
      }
    }
    `;
			}, rn = (e, t, r, a, n = !1, i) => {
				let s = e[0].dims, l = e[1].dims, d = s.slice(0, -2), c = l.slice(0, -2), h = a ? a.slice(0, -2) : r.slice(0, -2), f = F.size(h), w = s[s.length - 2], v = s[s.length - 1], $ = l[l.length - 1], k = v % 4 === 0 && $ % 4 === 0, C = w <= 8 ? [
					4,
					1,
					1
				] : [
					4,
					4,
					1
				], I = [
					8,
					8,
					1
				], E = [
					Math.ceil($ / I[0] / C[0]),
					Math.ceil(w / I[1] / C[1]),
					Math.ceil(f / I[2] / C[2])
				], A = k ? 4 : 1, z = [
					...d,
					w,
					v / A
				], B = z.length, N = [
					...c,
					v,
					$ / A
				], P = N.length, T = [
					f,
					w,
					$ / A
				], Y = [
					{
						type: 6,
						data: w
					},
					{
						type: 6,
						data: $
					},
					{
						type: 6,
						data: v
					}
				];
				$r(t, Y), Y.push(...de(h, z, N));
				let X = ["rank", "rank"], ue = e.length > 2;
				ue && (Y.push(...de(e[2].dims)), X.push("rank")), Y.push(...de(T));
				let ie = (K) => {
					let U = h.length, j = Ri("batchDims", e[0].dataType, U, 1), ne = nt(e[0].dataType), pe = G("a", e[0].dataType, B, A), he = G("b", e[1].dataType, P, A), ge = oe("result", e[0].dataType, T.length, A), V = [pe, he];
					if (ue) {
						let lt = n ? A : 1;
						V.push(G("bias", e[2].dataType, e[2].dims.length, lt));
					}
					let se = [
						{
							name: "dim_a_outer",
							type: "i32"
						},
						{
							name: "dim_b_outer",
							type: "i32"
						},
						{
							name: "dim_inner",
							type: "i32"
						}
					];
					xr(t, se);
					let ke = nt(ge.type.tensor), ve = vr(t, ge.type.value, ke), ee = Ip(A, ue, ve, [
						j,
						pe,
						he,
						ge
					], n);
					return `
  ${K.registerUniforms(se).registerInternalVariables(j).declareVariables(...V, ge)}
  ${ee}
  ${k ? qi(C, I, ne, j) : Gi(C, I, ne, j)}
                   `;
				};
				return {
					name: "MatMul",
					shaderCache: {
						hint: `${C};${t.activation};${k};${n}`,
						inputDependencies: X
					},
					getRunData: () => ({
						outputs: [{
							dims: i ? i(r) : r,
							dataType: e[0].dataType
						}],
						dispatchGroup: {
							x: E[0],
							y: E[1],
							z: E[2]
						},
						programUniforms: Y
					}),
					getShaderSource: ie
				};
			};
		}), Ap = Z(() => {
			"use strict";
			fe(), Mt(), be(), nr(), en(), kp(), an(), zp = (e, t, r, a, n = !1, i, s = 4, l = 4, d = 4, c = "f32") => {
				let h = (Y) => {
					switch (Y) {
						case 1: return "resData = x[xIndex];";
						case 3: return `resData = vec3<${c}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;
						case 4: return "resData = x[xIndex / 4];";
						default: throw new Error(`innerElementSize ${Y} is not supported.`);
					}
				}, f = (Y) => {
					switch (Y) {
						case 1: return "return w[row * i32(uniforms.w_shape[3]) + colIn];";
						case 4: return "return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";
						default: throw new Error(`innerElementSize ${Y} is not supported.`);
					}
				}, w = e ? `
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    ` : `
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `, v = e ? `
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    ` : `
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `, $ = e ? "i32(uniforms.x_shape[1])" : "i32(uniforms.x_shape[2])", k = e ? "i32(uniforms.x_shape[2])" : "i32(uniforms.x_shape[3])", C = e ? "row" : "col", I = e ? "col" : "row", E = `
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e ? "i32(uniforms.result_shape[2])" : "i32(uniforms.result_shape[3])"};
    let outRow = ${C} / outWidth;
    let outCol = ${C} % outWidth;

    let WRow = ${I} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${I} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${I} % inChannels;
    var resData = ${st(s, c)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${$} && xCol >= 0 && xCol < ${k}) {
      ${w}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`, A = e ? t && a ? `
    let col = colIn * ${s};
    ${E}` : `
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${E}
    }
    return ${st(s, c)}(0.0);` : a && r ? `
    let col = colIn * ${s};
    ${E}` : `
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${E}
    }
    return ${st(s, c)}(0.0);`, z = e ? a && r ? f(l) : `
    let col = colIn * ${l};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${f(l)}
    }
    return ${st(l, c)}(0.0);` : `
    let col = colIn * ${l};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${f(l)}
    }
    return ${st(l, c)}(0.0);`, B = st(d, c), N = st(e ? s : l, c), P = st(e ? l : s, c), T = vr(i, B, c);
				return `
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${N} {
      ${e ? A : z}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${P} {
      ${e ? z : A}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${B}) {
      let col = colIn * ${d};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e ? "i32(uniforms.result_shape[2])" : "i32(uniforms.result_shape[3])"};
      ${v}
      ${$p(n)}
      ${T}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`;
			}, Cp = (e, t, r, a, n, i, s, l, d) => {
				let c = t.format === "NHWC", h = c ? e[0].dims[3] : e[0].dims[1], f = r[0], w = c ? r[2] : r[3], v = c ? r[1] : r[2], $ = c ? r[3] : r[1], k = c && (h % 4 === 0 || h % 3 === 0) && $ % 4 === 0, C = c ? $ : w * v, I = c ? w * v : $, E = [
					8,
					8,
					1
				], A = a <= 8 ? [
					4,
					1,
					1
				] : [
					4,
					4,
					1
				], z = [
					Math.ceil(C / E[0] / A[0]),
					Math.ceil(I / E[1] / A[1]),
					Math.ceil(f / E[2] / A[2])
				];
				Ce("verbose", () => `[conv2d_mm_webgpu] dispatch = ${z}`);
				let B = k ? c && h % 4 !== 0 ? 3 : 4 : 1, N = E[1] * A[1], P = E[0] * A[0], T = Math.max(E[0] * B, E[1]), Y = a % N === 0, X = n % P === 0, ue = i % T === 0, ie = k ? [
					B,
					4,
					4
				] : [
					1,
					1,
					1
				], K = [
					{
						type: 6,
						data: a
					},
					{
						type: 6,
						data: n
					},
					{
						type: 6,
						data: i
					},
					{
						type: 6,
						data: [t.pads[0], t.pads[1]]
					},
					{
						type: 6,
						data: t.strides
					},
					{
						type: 6,
						data: t.dilations
					}
				];
				$r(t, K), K.push(...de(e[0].dims, e[1].dims));
				let U = ["rank", "rank"];
				s && (K.push(...de(e[2].dims)), U.push("rank")), K.push(...de(r));
				let j = (ne) => {
					let pe = [
						{
							name: "dim_a_outer",
							type: "i32"
						},
						{
							name: "dim_b_outer",
							type: "i32"
						},
						{
							name: "dim_inner",
							type: "i32"
						},
						{
							name: "pad",
							type: "i32",
							length: 2
						},
						{
							name: "stride",
							type: "i32",
							length: 2
						},
						{
							name: "dilation",
							type: "i32",
							length: 2
						}
					];
					xr(t, pe);
					let he = k ? 4 : 1, ge = nt(e[0].dataType), V = `
      fn setOutputAtIndex(flatIndex : i32, value : ${k ? `vec4<${ge}>` : ge}) {
        result[flatIndex] = ${k ? `vec4<${ge}>` : ge}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${k ? `vec4<${ge}>` : ge}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${k ? "/ 4" : ""}, value);
      }`, se = [G("x", e[0].dataType, e[0].dims.length, B === 3 ? 1 : B), G("w", e[1].dataType, e[1].dims.length, he)], ke = oe("result", e[0].dataType, r.length, he);
					if (s) {
						let ve = G("bias", e[2].dataType, e[2].dims.length, he);
						se.push(ve), V += `
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${k ? `vec4<${ge}>` : ge} {
          return bias[coords.${c ? "w" : "y"}${k ? "/ 4" : ""}];
        }`;
					}
					return `
        ${xp("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${ne.registerUniforms(pe).declareVariables(...se, ke)}
        ${V}
        ${zp(c, Y, X, ue, s, t, ie[0], ie[1], ie[2], ge)}
        ${k ? qi(A, E, ge, void 0, !c, T) : Gi(A, E, ge, void 0, !c, T, !1, void 0, l)}`;
				};
				return {
					name: "Conv2DMatMul",
					shaderCache: {
						hint: `${t.cacheKey};${B};${k};${Y};${X};${ue};${N};${P};${T}`,
						inputDependencies: U
					},
					getRunData: () => ({
						outputs: [{
							dims: d ? d(r) : r,
							dataType: e[0].dataType
						}],
						dispatchGroup: {
							x: z[0],
							y: z[1],
							z: z[2]
						},
						programUniforms: K
					}),
					getShaderSource: j
				};
			};
		}), Np = Z(() => {
			"use strict";
			fe(), Mt(), we(), be(), nr(), en(), Rp = (e) => {
				let t = 1;
				for (let r = 0; r < e.length; r++) t *= e[r];
				return t;
			}, Vi = (e) => typeof e == "number" ? [
				e,
				e,
				e
			] : e, sa = (e, t) => t <= 1 ? e : e + (e - 1) * (t - 1), Op = (e, t, r, a = 1) => {
				let n = sa(t, a);
				return Math.floor((e[0] * (r - 1) - r + n) / 2);
			}, Hi = (e, t, r, a, n) => {
				n ??= Op(e, t[0], a[0]);
				let i = [
					0,
					0,
					0,
					r
				];
				for (let s = 0; s < 3; s++) e[s] + 2 * n >= t[s] && (i[s] = Math.trunc((e[s] - t[s] + 2 * n) / a[s] + 1));
				return i;
			}, Bp = (e, t, r, a, n, i, s, l, d, c) => {
				let h, f, w, v;
				if (e === "VALID" && (e = 0), typeof e == "number") {
					h = {
						top: e,
						bottom: e,
						left: e,
						right: e,
						front: e,
						back: e
					};
					let $ = Hi([
						t,
						r,
						a,
						1
					], [
						l,
						d,
						c
					], 1, [
						n,
						i,
						s
					], e);
					f = $[0], w = $[1], v = $[2];
				} else if (Array.isArray(e)) {
					if (!e.every((k, C, I) => k === I[0])) throw Error(`Unsupported padding parameter: ${e}`);
					h = {
						top: e[0],
						bottom: e[1],
						left: e[2],
						right: e[3],
						front: e[4],
						back: e[5]
					};
					let $ = Hi([
						t,
						r,
						a,
						1
					], [
						l,
						d,
						c
					], 1, [
						n,
						i,
						s
					], e[0]);
					f = $[0], w = $[1], v = $[2];
				} else if (e === "SAME_UPPER") {
					f = Math.ceil(t / n), w = Math.ceil(r / i), v = Math.ceil(a / s);
					let $ = (f - 1) * n + l - t, k = (w - 1) * i + d - r, C = (v - 1) * s + c - a, I = Math.floor($ / 2), E = $ - I, A = Math.floor(k / 2), z = k - A, B = Math.floor(C / 2);
					h = {
						top: A,
						bottom: z,
						left: B,
						right: C - B,
						front: I,
						back: E
					};
				} else throw Error(`Unknown padding parameter: ${e}`);
				return {
					padInfo: h,
					outDepth: f,
					outHeight: w,
					outWidth: v
				};
			}, Dp = (e, t, r, a, n, i = !1, s = "channelsLast") => {
				let l, d, c, h, f;
				if (s === "channelsLast") [l, d, c, h, f] = e;
				else if (s === "channelsFirst") [l, f, d, c, h] = e;
				else throw new Error(`Unknown dataFormat ${s}`);
				let [w, , v, $, k] = t, [C, I, E] = Vi(r), [A, z, B] = Vi(a), N = sa(v, A), P = sa($, z), T = sa(k, B), { padInfo: Y, outDepth: X, outHeight: ue, outWidth: ie } = Bp(n, d, c, h, C, I, E, N, P, T), K = i ? w * f : w, U = [
					0,
					0,
					0,
					0,
					0
				];
				return s === "channelsFirst" ? U = [
					l,
					K,
					X,
					ue,
					ie
				] : s === "channelsLast" && (U = [
					l,
					X,
					ue,
					ie,
					K
				]), {
					batchSize: l,
					dataFormat: s,
					inDepth: d,
					inHeight: c,
					inWidth: h,
					inChannels: f,
					outDepth: X,
					outHeight: ue,
					outWidth: ie,
					outChannels: K,
					padInfo: Y,
					strideDepth: C,
					strideHeight: I,
					strideWidth: E,
					filterDepth: v,
					filterHeight: $,
					filterWidth: k,
					effectiveFilterDepth: N,
					effectiveFilterHeight: P,
					effectiveFilterWidth: T,
					dilationDepth: A,
					dilationHeight: z,
					dilationWidth: B,
					inShape: e,
					outShape: U,
					filterShape: t
				};
			}, Mp = (e, t, r, a, n, i) => {
				let s = i === "channelsLast";
				s ? e[0].dims[3] : e[0].dims[1];
				let l = [
					64,
					1,
					1
				], d = { x: r.map((k, C) => C) }, c = [
					Math.ceil(Rp(d.x.map((k) => r[k])) / l[0]),
					1,
					1
				];
				Ce("verbose", () => `[conv3d_naive_webgpu] dispatch = ${c}`);
				let h = 1, f = [
					{
						type: 12,
						data: F.size(r)
					},
					{
						type: 12,
						data: a
					},
					{
						type: 12,
						data: n
					},
					{
						type: 12,
						data: t.strides
					},
					{
						type: 12,
						data: t.dilations
					}
				];
				$r(t, f), f.push(...de(e[0].dims, e[1].dims));
				let w = ["rank", "rank"], v = e.length === 3;
				v && (f.push(...de(e[2].dims)), w.push("rank")), f.push(...de(r));
				let $ = (k) => {
					let C = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "filter_dims",
							type: "u32",
							length: a.length
						},
						{
							name: "pads",
							type: "u32",
							length: n.length
						},
						{
							name: "strides",
							type: "u32",
							length: t.strides.length
						},
						{
							name: "dilations",
							type: "u32",
							length: t.dilations.length
						}
					];
					xr(t, C);
					let I = 1, E = nt(e[0].dataType), A = G("x", e[0].dataType, e[0].dims.length, h), z = G("W", e[1].dataType, e[1].dims.length, I), B = [A, z], N = oe("result", e[0].dataType, r.length, I), P = "";
					if (v) {
						let X = G("bias", e[2].dataType, e[2].dims.length, I);
						B.push(X), P += `
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${E} {
          return bias[${s ? le("coords", 4, 5) : le("coords", 1, 5)}];
        }`;
					}
					let T = st(h, E), Y = vr(t, T, E);
					return `
            ${P}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${A.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${z.getByIndices("aIndices")};
            }
          ${k.registerUniforms(C).declareVariables(...B, N)}
          ${k.mainStart()}
          ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${N.offsetToIndices("global_idx")};
              let batch = ${le("coords", 0, A.rank)};
              let d2 = ${s ? le("coords", A.rank - 1, A.rank) : le("coords", 1, A.rank)};
              let xFRCCorner = vec3<u32>(${s ? le("coords", 1, A.rank) : le("coords", 2, A.rank)},
              ${s ? le("coords", 2, A.rank) : le("coords", 3, A.rank)},
              ${s ? le("coords", 3, A.rank) : le("coords", 4, A.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s ? le("uniforms.x_shape", 1, A.rank) : le("uniforms.x_shape", 2, A.rank)};
              let xShapeZ = ${s ? le("uniforms.x_shape", 2, A.rank) : le("uniforms.x_shape", 3, A.rank)};
              let xShapeW = ${s ? le("uniforms.x_shape", 3, A.rank) : le("uniforms.x_shape", 4, A.rank)};
              let xShapeU = ${s ? le("uniforms.x_shape", 4, A.rank) : le("uniforms.x_shape", 1, A.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s ? `let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            ` : `let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s ? `value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);` : `value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s ? `let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      ` : `let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s ? `let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      ` : `let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${v ? "value = value + getBiasByOutputCoords(coords)" : ""};
              ${Y}
              result[global_idx] = f32(value);
          }`;
				};
				return {
					name: "Conv3DNaive",
					shaderCache: {
						hint: `${t.cacheKey};${s};${h};${v}`,
						inputDependencies: w
					},
					getRunData: () => ({
						outputs: [{
							dims: r,
							dataType: e[0].dataType
						}],
						dispatchGroup: {
							x: c[0],
							y: c[1],
							z: c[2]
						},
						programUniforms: f
					}),
					getShaderSource: $
				};
			};
		}), Lp = Z(() => {
			"use strict";
			fe(), we(), be(), nr(), Pp = (e, t, r, a) => {
				let n = e.length > 2, i = n ? "value += b[output_channel];" : "", s = e[0].dims, l = e[1].dims, d = t.format === "NHWC", c = d ? r[3] : r[1], h = c / t.group, f = d && h >= 4 ? Je(c) : 1, w = F.size(r) / f, v = [
					{
						type: 12,
						data: w
					},
					{
						type: 12,
						data: t.dilations
					},
					{
						type: 12,
						data: [t.strides[0], t.strides[1]]
					},
					{
						type: 12,
						data: [t.pads[0], t.pads[1]]
					},
					{
						type: 12,
						data: h
					}
				];
				$r(t, v), v.push(...de(s, [
					l[0],
					l[1],
					l[2],
					l[3] / f
				]));
				let $ = n ? [
					"rank",
					"rank",
					"rank"
				] : ["rank", "rank"];
				v.push(...de([
					r[0],
					r[1],
					r[2],
					r[3] / f
				]));
				let k = (C) => {
					let I = oe("output", e[0].dataType, r.length, f), E = nt(I.type.tensor), A = vr(t, I.type.value, E), z = G("x", e[0].dataType, s.length), B = G("w", e[1].dataType, l.length, f), N = [z, B];
					n && N.push(G("b", e[2].dataType, e[2].dims, f));
					let P = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "dilations",
							type: "u32",
							length: t.dilations.length
						},
						{
							name: "strides",
							type: "u32",
							length: 2
						},
						{
							name: "pads",
							type: "u32",
							length: 2
						},
						{
							name: "output_channels_per_group",
							type: "u32"
						}
					];
					xr(t, P);
					let T = d ? `
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${z.get("batch", "xHeight", "xWidth", "input_channel")};
            let wVal = ${B.get("wHeight", "wWidth", "wInChannel", "output_channel")};
            value += xVal * wVal;
          }
        }
      }
      ` : `
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${z.get("batch", "input_channel", "xHeight", "xWidth")};
            let wVal = ${B.get("output_channel", "wInChannel", "wHeight", "wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;
					return `
  ${C.registerUniforms(P).declareVariables(...N, I)}

  ${C.mainStart()}
    ${C.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${I.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d ? 3 : 1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d ? 1 : 2}], outputIndices[${d ? 2 : 3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${f} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d ? 2 : 1}];

    var value: ${I.type.value} = ${I.type.value}(0);
    ${T}
    ${i}
    ${A}
    ${I.setByOffset("global_idx", "value")}
  }`;
				};
				return {
					name: "GroupedConv",
					shaderCache: {
						hint: `${t.cacheKey}_${f}`,
						inputDependencies: $
					},
					getRunData: () => ({
						outputs: [{
							dims: a ? a(r) : r,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(w / 64) },
						programUniforms: v
					}),
					getShaderSource: k
				};
			}, Up = (e, t, r, a) => {
				let n = e.length > 2, i = Je(r[3]), s = Je(r[2]), l = F.size(r) / i / s, d = [
					e[0].dims[0],
					e[0].dims[1],
					e[0].dims[2],
					e[0].dims[3] / i
				], c = [
					e[1].dims[0],
					e[1].dims[1],
					e[1].dims[2],
					e[1].dims[3] / i
				], h = [
					r[0],
					r[1],
					r[2],
					r[3] / i
				], f = [
					{
						type: 12,
						data: l
					},
					{
						type: 6,
						data: [t.strides[0], t.strides[1]]
					},
					{
						type: 6,
						data: [t.pads[0], t.pads[1]]
					}
				];
				$r(t, f), f.push(...de(d, c, h));
				let w = (s - 1) * t.strides[1] + c[1], v = ($) => {
					let k = oe("output", e[0].dataType, h.length, i), C = nt(k.type.tensor), I = vr(t, k.type.value, C), E = G("x", e[0].dataType, d.length, i), A = G("w", e[1].dataType, c.length, i), z = [E, A];
					n && z.push(G("b", e[2].dataType, e[2].dims, i));
					let B = n ? "value += b[output_channel];" : "", N = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "strides",
							type: "i32",
							length: 2
						},
						{
							name: "pads",
							type: "i32",
							length: 2
						}
					];
					return xr(t, N), `
  ${$.registerUniforms(N).declareVariables(...z, k)}
  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${E.type.value}, ${w}>;
    var values: array<${k.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${c[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${w}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${E.get("batch", "u32(x_height)", "u32(x_width)", "input_channel")};
          } else {
            x_vals[i] = ${E.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${c[1]}; w_width++) {
          let w_val = ${A.get("w_height", "w_width", "0", "output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${B}
      ${I}
      ${k.set("batch", "row", "col + i", "output_channel", "value")};
    }
  }`;
				};
				return {
					name: "GroupedConv-Vectorize",
					shaderCache: {
						hint: `${t.cacheKey};${i};${s};${w};${c[0]};${c[1]}`,
						inputDependencies: n ? [
							"rank",
							"rank",
							"type"
						] : ["rank", "rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: a ? a(r) : r,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(l / 64) },
						programUniforms: f
					}),
					getShaderSource: v
				};
			};
		}), Vp = Z(() => {
			"use strict";
			we(), Ap(), Np(), an(), Lp(), nr(), tn(), Wt(), Fp = (e, t, r, a, n, i) => {
				let s = e[0], l = e.slice(i ? 1 : 2, i ? 3 : 4), d = l.length, c = t[0], h = t.slice(2).map((w, v) => w + (w - 1) * (r[v] - 1)), f = l.map((w, v) => w + a[v] + a[v + d]).map((w, v) => Math.floor((w - h[v] + n[v]) / n[v]));
				return f.splice(0, 0, s), f.splice(i ? 3 : 1, 0, c), f;
			}, nn = [
				2,
				3,
				1,
				0
			], qp = (e, t) => {
				if (!e || e.length !== 2 && e.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
				if (e[0].dims.length > 5) throw new Error("greater than 5D is not supported");
				if (e[0].dims.length !== e[1].dims.length) throw new Error("filter does not have same dimension as input");
				if (e[0].dims[t.format === "NHWC" ? e[0].dims.length - 1 : 1] !== e[1].dims[1] * t.group) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
				if (e.length === 3 && (e[2].dims.length !== 1 || e[1].dims[0] !== e[2].dims[0])) throw new Error("invalid bias");
				let r = e[0].dims.length - 2;
				if (t.dilations.length !== r) throw new Error(`dilations should be ${r}D`);
				if (t.strides.length !== r) throw new Error(`strides should be ${r}D`);
				if (t.pads.length !== r * 2) throw new Error(`pads should be ${r * 2}D`);
				if (t.kernelShape.length !== 0 && t.kernelShape.length !== e[1].dims.length - 2) throw new Error("invalid kernel shape");
			}, sn = (e, t) => {
				let r = e.kernelShape.slice();
				r.length < t[1].dims.length - 2 && r.push(...Array(t[1].dims.length - 2 - r.length).fill(0));
				for (let i = 2; i < t[1].dims.length; ++i) r[i - 2] === 0 && (r[i - 2] = t[1].dims[i]);
				let a = e.pads.slice();
				Wa.adjustPadsBasedOnAutoPad(t[0].dims, e.strides, e.dilations, r, a, e.format === "NHWC", e.autoPad);
				let n = Object.assign({}, e);
				return Object.assign(n, {
					kernelShape: r,
					pads: a
				}), n;
			}, ji = (e) => {
				let t = Li(e), r = e.format;
				return {
					autoPad: [
						"NOTSET",
						"VALID",
						"SAME_UPPER",
						"SAME_LOWER"
					][e.auto_pad],
					format: r,
					dilations: e.dilations,
					group: e.group,
					kernelShape: e.kernel_shape,
					pads: e.pads,
					strides: e.strides,
					wIsConst: e.w_is_const(),
					...t,
					cacheKey: `${e.format};${t.activation};`
				};
			}, Ki = (e, t, r, a) => {
				let n = r.format === "NHWC", i = Fp(t[0].dims, t[1].dims, r.dilations, r.pads, r.strides, n);
				if (r.group !== 1) {
					let N = [t[0]];
					if (n) {
						let P = e.kernelCustomData.wT ?? e.compute(_t(t[1], nn), {
							inputs: [1],
							outputs: [r.wIsConst ? -2 : -1]
						})[0];
						r.wIsConst && !e.kernelCustomData.wT && (e.kernelCustomData.wT = P), N.push(P);
					} else N.push(t[1]);
					t.length === 3 && N.push(t[2]), !e.adapterInfo.isArchitecture("ampere") && n && t[1].dims[0] === r.group && t[1].dims[1] === 1 && r.dilations[0] === 1 && r.dilations[1] === 1 ? e.compute(Up(N, r, i, a), { inputs: N }) : e.compute(Pp(N, r, i, a), { inputs: N });
					return;
				}
				let s = t.length === 3, l = t[0].dims[n ? 1 : 2], d = t[0].dims[n ? 2 : 3], c = t[0].dims[n ? 3 : 1], h = t[1].dims[2], f = t[1].dims[3], w = i[n ? 1 : 2], v = i[n ? 2 : 3], $ = i[n ? 3 : 1], k = n && h === l && f === d && r.pads[0] === 0 && r.pads[1] === 0;
				if (k || h === 1 && f === 1 && r.dilations[0] === 1 && r.dilations[1] === 1 && r.strides[0] === 1 && r.strides[1] === 1 && r.pads[0] === 0 && r.pads[1] === 0) {
					let N = i[0], P, T, Y, X = [];
					if (n) {
						let K = e.kernelCustomData.wT ?? e.compute(_t(t[1], nn), {
							inputs: [1],
							outputs: [r.wIsConst ? -2 : -1]
						})[0];
						if (r.wIsConst && !e.kernelCustomData.wT && (e.kernelCustomData.wT = K), k) {
							let U = l * d * c;
							P = t[0].reshape([
								1,
								N,
								U
							]), T = K.reshape([
								1,
								U,
								$
							]), Y = [
								1,
								N,
								$
							];
						} else P = t[0].reshape([
							N,
							l * d,
							c
						]), T = K.reshape([
							1,
							c,
							$
						]), Y = [
							N,
							w * v,
							$
						];
						X.push(P), X.push(T);
					} else P = t[0].reshape([
						N,
						c,
						l * d
					]), T = t[1].reshape([
						1,
						$,
						c
					]), Y = [
						N,
						$,
						w * v
					], X.push(T), X.push(P);
					s && X.push(t[2]);
					let ue = Y[2], ie = X[0].dims[X[0].dims.length - 1];
					ue < 8 && ie < 8 ? e.compute(Fi(X, r, i, Y, n, a), { inputs: X }) : e.compute(rn(X, r, i, Y, n, a), { inputs: X });
					return;
				}
				let C = !0, I = e.kernelCustomData.wT ?? e.compute(_t(t[1], nn), {
					inputs: [1],
					outputs: [r.wIsConst ? -2 : -1]
				})[0];
				r.wIsConst && !e.kernelCustomData.wT && (e.kernelCustomData.wT = I);
				let E = [t[0], I];
				s && E.push(t[2]);
				let A = n ? w * v : $, z = n ? $ : w * v, B = h * f * c;
				e.compute(Cp(E, r, i, A, z, B, s, C, a), { inputs: E });
			}, Wp = (e, t) => {
				let r = t.format === "NHWC", a = [e.inputs[0].reshape(r ? [
					e.inputs[0].dims[0],
					1,
					e.inputs[0].dims[1],
					e.inputs[0].dims[2]
				] : [
					e.inputs[0].dims[0],
					e.inputs[0].dims[1],
					1,
					e.inputs[0].dims[2]
				]), e.inputs[1].reshape([
					e.inputs[1].dims[0],
					e.inputs[1].dims[1],
					1,
					e.inputs[1].dims[2]
				])];
				e.inputs.length === 3 && a.push(e.inputs[2]);
				let n = [
					0,
					t.pads[0],
					0,
					t.pads[1]
				], i = [1].concat(t.strides), s = [1].concat(t.dilations), l = [1].concat(t.kernelShape), d = sn({
					...t,
					pads: n,
					strides: i,
					dilations: s,
					kernelShape: l
				}, a);
				Ki(e, a, d, (c) => r ? [
					c[0],
					c[2],
					c[3]
				] : [
					c[0],
					c[1],
					c[3]
				]);
			}, Gp = (e, t, r) => {
				let a = r.format === "NHWC" ? "channelsLast" : "channelsFirst", n = sn(r, t), i = r.autoPad === "NOTSET" ? r.pads : r.autoPad, s = Dp(t[0].dims, t[1].dims, r.strides, r.dilations, i, !1, a);
				e.compute(Mp(t, n, s.outShape, [
					s.filterDepth,
					s.filterHeight,
					s.filterWidth
				], [
					s.padInfo.front,
					s.padInfo.top,
					s.padInfo.left
				], a));
			}, Xi = (e, t) => {
				if (qp(e.inputs, t), e.inputs[0].dims.length === 3) Wp(e, t);
				else if (e.inputs[0].dims.length === 5) Gp(e, e.inputs, t);
				else {
					let r = sn(t, e.inputs);
					Ki(e, e.inputs, r);
				}
			};
		}), jp = Z(() => {
			"use strict";
			fe(), Mt(), we(), be(), Hp = (e, t, r) => {
				let a = e.length > 2, n = t.outputShape, i = t.format === "NHWC", s = t.group, l = e[1].dims, d = l[2] / s, c = l[3], h = i ? Je(d) : 1, f = i && c === 1 && d >= 4, w = f ? Math.floor(d / 4) * 4 : Math.floor(d / h) * h, v = d - w, $ = i ? Je(c) : 1, k = i ? c === 1 ? h : $ : 1, C = F.size(n) / $, I = [
					Math.ceil(C / 64),
					1,
					1
				];
				Ce("verbose", () => `[conv2d_backprop_webgpu] dispatch = ${I}`);
				let E = ["rank", "rank"], A = [t.strides[0], t.strides[1]], z = [t.kernelShape[i ? 1 : 2], t.kernelShape[i ? 2 : 3]], B = [t.dilations[0], t.dilations[1]], N = [z[0] + (t.dilations[0] <= 1 ? 0 : (t.kernelShape[i ? 1 : 2] - 1) * (t.dilations[0] - 1)), z[1] + (t.dilations[1] <= 1 ? 0 : (t.kernelShape[i ? 2 : 3] - 1) * (t.dilations[1] - 1))], P = [N[0] - 1 - Math.floor((t.pads[0] + t.pads[2]) / 2), N[1] - 1 - Math.floor((t.pads[1] + t.pads[3]) / 2)], T = [
					{
						type: 12,
						data: C
					},
					{
						type: 12,
						data: A
					},
					{
						type: 12,
						data: z
					},
					{
						type: 12,
						data: B
					},
					{
						type: 12,
						data: N
					},
					{
						type: 6,
						data: P
					},
					{
						type: 12,
						data: w
					},
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: c
					},
					...de(e[0].dims, e[1].dims)
				];
				a && (T.push(...de(e[2].dims)), E.push("rank")), T.push(...de(n));
				let Y = (X) => {
					let ue = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "strides",
							type: "u32",
							length: A.length
						},
						{
							name: "filter_dims",
							type: "u32",
							length: z.length
						},
						{
							name: "dilations",
							type: "u32",
							length: z.length
						},
						{
							name: "effective_filter_dims",
							type: "u32",
							length: N.length
						},
						{
							name: "pads",
							type: "i32",
							length: P.length
						},
						{
							name: "input_channels_per_group_int",
							type: "u32"
						},
						{
							name: "input_channels_per_group",
							type: "u32"
						},
						{
							name: "output_channels_per_group",
							type: "u32"
						}
					], ie = nt(e[0].dataType), K = i ? 1 : 2, U = i ? 2 : 3, j = i ? 3 : 1, ne = G("W", e[1].dataType, e[1].dims.length, k), pe = G("Dy", e[0].dataType, e[0].dims.length, h), he = [pe, ne];
					a && he.push(G("bias", e[2].dataType, [n[j]].length, $));
					let ge = oe("result", e[0].dataType, n.length, $), V = () => {
						let ve = "";
						if (f) h === 4 ? ve += `
        let xValue = ${pe.getByOffset("x_offset")};
        let wValue = ${ne.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;` : h === 2 ? ve += `
          dotProd = dotProd + dot(vec4<${ie}>(${pe.getByOffset("x_offset")}, ${pe.getByOffset("x_offset + 1u")}), vec4<${ie}>(${ne.getByOffset("w_offset")}, ${ne.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;` : h === 1 && (ve += `
          dotProd = dotProd + dot(vec4<${ie}>(${pe.getByOffset("x_offset")}, ${pe.getByOffset("x_offset + 1u")}, ${pe.getByOffset("x_offset + 2u")}, ${pe.getByOffset("x_offset + 3u")}), vec4<${ie}>(${ne.getByOffset("w_offset")}, ${ne.getByOffset("w_offset + 1u")}, ${ne.getByOffset("w_offset + 2u")}, ${ne.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);
						else if (ve += `
                  let xValue = ${i ? pe.getByOffset(`${pe.indicesToOffset(`${pe.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`) : pe.get("batch", "inputChannel", "idyR", "idyC")};
        `, h === 1) ve += `
          let w_offset = ${ne.indicesToOffset(`${ne.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${ne.getByOffset(`w_offset / ${k}`)};
          dotProd = dotProd + xValue * wValue;`;
						else for (let ee = 0; ee < h; ee++) ve += `
            let wValue${ee} = ${ne.getByOffset(`${ne.indicesToOffset(`${ne.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${ee}, wOutChannel)`)} / ${k}`)};
            dotProd = dotProd + xValue[${ee}] * wValue${ee};`;
						return ve;
					}, se = () => {
						if (v === 0) return "";
						if (!f) throw new Error(`packInputAs4 ${f} is not true.`);
						let ve = "";
						if (h === 1) {
							ve += "dotProd = dotProd";
							for (let ee = 0; ee < v; ee++) ve += `
            + ${pe.getByOffset(`x_offset + ${ee}`)} * ${ne.getByOffset(`w_offset + ${ee}`)}`;
							ve += ";";
						} else if (h === 2) {
							if (v !== 2) throw new Error(`Invalid inputChannelsRemainder ${v}.`);
							ve += `
          let xValue = ${pe.getByOffset("x_offset")};
          let wValue = ${ne.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`;
						}
						return ve;
					}, ke = `
            let outputIndices = ${ge.offsetToIndices(`global_idx * ${$}`)};
            let batch = ${ge.indicesGet("outputIndices", 0)};
            let d1 = ${ge.indicesGet("outputIndices", j)};
            let r = ${ge.indicesGet("outputIndices", K)};
            let c = ${ge.indicesGet("outputIndices", U)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${ge.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${ie}(dyRCorner) + ${ie}(wR)) / ${ie}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${ie}(uniforms.Dy_shape[${K}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${ie}(dyCCorner) + ${ie}(wC)) / ${ie}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${ie}(uniforms.Dy_shape[${U}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${f ? `
                var x_offset = ${pe.indicesToOffset(`${pe.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${ne.indicesToOffset(`${ne.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${k};
                  ` : ""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${f ? 4 : h}) {
                  ${V()}
                  inputChannel = inputChannel + ${f ? 4 : h};
                }
                ${se()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${a ? ` + bias[d1 / ${$}]` : ""};
            ${ge.setByOffset("global_idx", "value")};
          `;
					return `
    ${X.registerUniforms(ue).declareVariables(...he, ge)}
      ${X.mainStart()}
      ${X.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${ke}}`;
				};
				return {
					name: "ConvTranspose2D",
					shaderCache: {
						hint: `${t.cacheKey};${h}${k}${$}${f}${v}`,
						inputDependencies: E
					},
					getRunData: () => ({
						dispatchGroup: {
							x: I[0],
							y: I[1],
							z: I[2]
						},
						outputs: [{
							dims: r ? r(n) : n,
							dataType: e[0].dataType
						}],
						programUniforms: T
					}),
					getShaderSource: Y
				};
			};
		}), tc = Z(() => {
			"use strict";
			jp(), nr(), Wt(), Kp = (e, t, r, a, n, i) => (e - 1) * t + r + (a - 1) * n + 1 - i, Xp = (e, t, r, a, n) => {
				let i = Math.floor(e / 2);
				t === "SAME_UPPER" ? (r[a] = i, r[n] = e - i) : t === "SAME_LOWER" && (r[a] = e - i, r[n] = i);
			}, Zp = (e, t, r, a, n, i, s, l, d, c) => {
				let h = e.length - 2, f = c.length === 0;
				d.length < h && d.push(...Array(h - d.length).fill(0));
				let w = e[0], v = t[l ? 3 : 1] * n;
				for (let $ = 0, k = e.length - h - (l ? 1 : 0); $ < h; ++$, ++k) {
					let C = e[k], I = f ? C * s[$] : c[$], E = Kp(C, s[$], i[$], t[k], r[$], I);
					Xp(E, a, i, $, $ + h), f && c.push(s[$] * (C - 1) + d[$] + (t[k] - 1) * r[$] + 1 - i[$] - i[$ + h]);
				}
				c.splice(0, 0, w), c.splice(l ? 3 : 1, 0, v);
			}, Zi = (e, t) => {
				let r = e.kernelShape.slice();
				if (e.kernelShape.length === 0 || e.kernelShape.reduce((f, w) => f * w, 1) === 0) {
					r.length = 0;
					for (let f = 2; f < t[1].dims.length; ++f) r.push(t[1].dims[f]);
				}
				let a = e.format === "NHWC";
				r.splice(0, 0, t[1].dims[0]), r.splice(a ? 3 : 1, 0, t[1].dims[1]);
				let n = e.pads.slice(), i = e.outputShape.slice(), s = e.outputPadding.slice(), l = t[0].dims, d = e.dilations.slice();
				if (d.reduce((f, w) => f + w, 0) === 0) {
					let f = t[0].dims.length - 2;
					d = new Array(f).fill(1);
				}
				let c = e.strides.slice();
				if (c.reduce((f, w) => f + w, 0) === 0) {
					let f = t[0].dims.length - 2;
					c = new Array(f).fill(1);
				}
				Zp(l, r, d, e.autoPad, e.group, n, c, a, s, i);
				let h = Object.assign({}, e);
				return Object.assign(h, {
					kernelShape: r,
					pads: n,
					outputPadding: s,
					outputShape: i,
					dilations: d,
					strides: c
				}), h;
			}, Yp = (e) => {
				let t = Li(e), r = e.format, a = [
					"NOTSET",
					"VALID",
					"SAME_UPPER",
					"SAME_LOWER"
				][typeof e.autoPad > "u" ? 0 : e.autoPad], n = e.dilations, i = e.group ?? 1, s = e.kernelShape, l = e.pads, d = e.strides, c = e.wIsConst();
				return {
					autoPad: a,
					format: r,
					dilations: n,
					group: i,
					kernelShape: s,
					outputPadding: e.outputPadding,
					outputShape: e.outputShape,
					pads: l,
					strides: d,
					wIsConst: c,
					...t,
					cacheKey: `${e.format};${t.activation};`
				};
			}, Qp = (e, t) => {
				if (!e || e.length !== 2 && e.length !== 3) throw new Error("Conv requires 2 or 3 inputs");
				if (e[0].dims.length !== 4 && e[0].dims.length !== 3) throw new Error("currently only support 2-dimensional conv");
				if (e[0].dims.length !== e[1].dims.length) throw new Error("filter does not have same dimension as input");
				if (e[0].dims[t.format === "NHWC" ? e[0].dims.length - 1 : 1] !== e[1].dims[0]) throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");
				let r = e[1].dims[1] * t.group;
				if (e.length === 3 && (e[2].dims.length !== 1 || e[2].dims[0] !== r)) throw new Error("invalid bias");
				let a = e[0].dims.length - 2;
				if (t.dilations.reduce((n, i) => n + i, 0) > 0 && t.dilations.length !== a) throw new Error(`dilations should be ${a}D`);
				if (t.strides.reduce((n, i) => n + i, 0) > 0 && t.strides.length !== a) throw new Error(`strides should be ${a}D`);
				if (t.pads.reduce((n, i) => n + i, 0) > 0 && t.pads.length !== a * 2) throw new Error(`pads should be ${a * 2}D`);
				if (t.outputPadding.length !== a && t.outputPadding.length !== 0) throw new Error(`output_padding should be ${a}D`);
				if (t.kernelShape.reduce((n, i) => n + i, 0) > 0 && t.kernelShape.length !== 0 && t.kernelShape.length !== e[1].dims.length - 2) throw new Error("invalid kernel shape");
				if (t.outputShape.length !== 0 && t.outputShape.length !== e[0].dims.length - 2) throw new Error("invalid output shape");
			}, Yi = (e, t, r, a) => {
				let n = e.kernelCustomData.wT ?? e.compute(_t(t[1], [
					2,
					3,
					0,
					1
				]), {
					inputs: [1],
					outputs: [r.wIsConst ? -2 : -1]
				})[0];
				r.wIsConst && !e.kernelCustomData.wT && (e.kernelCustomData.wT = n);
				let i = [t[0], n];
				t.length === 3 && i.push(t[2]), e.compute(Hp(i, r, a), { inputs: i });
			}, Jp = (e, t) => {
				let r = t.format === "NHWC", a = [e.inputs[0].reshape(r ? [
					e.inputs[0].dims[0],
					1,
					e.inputs[0].dims[1],
					e.inputs[0].dims[2]
				] : [
					e.inputs[0].dims[0],
					e.inputs[0].dims[1],
					1,
					e.inputs[0].dims[2]
				]), e.inputs[1].reshape([
					e.inputs[1].dims[0],
					e.inputs[1].dims[1],
					1,
					e.inputs[1].dims[2]
				])];
				e.inputs.length === 3 && a.push(e.inputs[2]);
				let n = t.kernelShape;
				(n.length === 0 || n[0] === 0) && (n = [e.inputs[1].dims[2]]);
				let i = t.dilations;
				(i.length === 0 || i[0] === 0) && (i = [1]);
				let s = t.strides;
				(s.length === 0 || s[0] === 0) && (s = [1]);
				let l = t.pads;
				l.length === 0 && (l = [0, 0]), l = [
					0,
					l[0],
					0,
					l[1]
				], s = [1].concat(s), i = [1].concat(i), n = [1].concat(n);
				let d = t.outputPadding;
				d = [0].concat(d);
				let c = Zi({
					...t,
					pads: l,
					strides: s,
					dilations: i,
					kernelShape: n,
					outputPadding: d
				}, a);
				Yi(e, a, c, (h) => r ? [
					h[0],
					h[2],
					h[3]
				] : [
					h[0],
					h[1],
					h[3]
				]);
			}, ec = (e, t) => {
				if (Qp(e.inputs, t), e.inputs[0].dims.length === 3) Jp(e, t);
				else {
					let r = Zi(t, e.inputs);
					Yi(e, e.inputs, r);
				}
			};
		}), ic = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), rc = (e, t, r, a) => {
				let n = F.size(t), i = t.length, s = G("input", e, i), l = oe("output", e, i), d = r.dataType === 6 ? r.getInt32Array()[0] : Number(r.getBigInt64Array()[0]), c = F.normalizeAxis(d, i), h = (f) => {
					let w = ` i32(${s.indicesGet("inputIndices", "uniforms.axis")}) `, v = le("uniforms.input_shape", "uniforms.axis", i), $ = a.reverse ? w + (a.exclusive ? " + 1" : "") : "0", k = a.reverse ? v : w + (a.exclusive ? "" : " + 1");
					return `
                ${f.registerUniform("outputSize", "u32").registerUniform("axis", "u32").declareVariables(s, l)}
                ${f.mainStart()}
                  ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${l.offsetToIndices("global_idx")};
                  var sum = ${l.type.value}(0);
                  let first : i32 = ${$};
                  let last : i32 = ${k};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices", "uniforms.axis", "u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${l.setByOffset("global_idx", "sum")};
                }`;
				};
				return {
					name: "CumSum",
					shaderCache: {
						hint: a.cacheKey,
						inputDependencies: ["rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: t,
							dataType: e
						}],
						dispatchGroup: { x: Math.ceil(n / 64) },
						programUniforms: [
							{
								type: 12,
								data: n
							},
							{
								type: 12,
								data: c
							},
							...de(t, t)
						]
					}),
					getShaderSource: h
				};
			}, ac = (e, t) => {
				let r = e.inputs[0].dims, a = e.inputs[0].dataType, n = e.inputs[1];
				e.compute(rc(a, r, n, t), { inputs: [0] });
			}, nc = (e) => {
				let t = e.exclusive === 1, r = e.reverse === 1;
				return Ne({
					exclusive: t,
					reverse: r
				});
			};
		}), pc = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), sc = (e) => {
				if (!e || e.length !== 1) throw new Error("DepthToSpace requires 1 input.");
				if (e[0].dims.length !== 4) throw new Error("DepthToSpace requires 4D input.");
			}, oc = (e, t, r, a) => {
				let n = [];
				n.push(`fn perm(i: ${a.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);
				for (let i = 0; i < t; ++i) n.push(r.indicesSet("a", e[i], `i[${i}]`));
				return n.push("return a;}"), n.join(`
`);
			}, uc = (e, t) => {
				let r, a, n, i, s, l, d = t.format === "NHWC", c = t.blocksize, h = t.mode === "DCR";
				d ? ([r, a, n, i] = e.dims, s = h ? [
					r,
					a,
					n,
					c,
					c,
					i / c ** 2
				] : [
					r,
					a,
					n,
					i / c ** 2,
					c,
					c
				], l = h ? [
					0,
					1,
					3,
					2,
					4,
					5
				] : [
					0,
					1,
					4,
					2,
					5,
					3
				]) : ([r, a, n, i] = [
					e.dims[0],
					e.dims[2],
					e.dims[3],
					e.dims[1]
				], s = h ? [
					r,
					c,
					c,
					i / c ** 2,
					a,
					n
				] : [
					r,
					i / c ** 2,
					c,
					c,
					a,
					n
				], l = h ? [
					0,
					3,
					4,
					1,
					5,
					2
				] : [
					0,
					1,
					4,
					2,
					5,
					3
				]);
				let f = e.reshape(s), w = f.dims.length, v = e.dataType, $ = G("a", v, w), k = oe("output", v, w), C = (I) => `
  ${I.registerUniform("output_size", "u32").declareVariables($, k)}

  ${oc(l, w, $, k)}

  ${I.mainStart()}
    ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${k.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${k.setByOffset("global_idx", $.getByIndices("aIndices"))}
  }`;
				return {
					name: "DepthToSpace",
					shaderCache: {
						hint: `${e.dims};${t.blocksize};${t.mode}`,
						inputDependencies: ["rank"]
					},
					getRunData: (I) => {
						let E = d ? [
							r,
							a * c,
							n * c,
							i / c ** 2
						] : [
							r,
							i / c ** 2,
							a * c,
							n * c
						], A = F.size(E), z = f.dims, B = F.sortBasedOnPerm(z, l);
						return {
							outputs: [{
								dims: E,
								dataType: I[0].dataType
							}],
							dispatchGroup: { x: Math.ceil(A / 64) },
							programUniforms: [{
								type: 12,
								data: A
							}, ...de(z, B)]
						};
					},
					getShaderSource: C
				};
			}, lc = (e, t) => {
				sc(e.inputs), e.compute(uc(e.inputs[0], t));
			}, dc = (e) => Ne({
				blocksize: e.blocksize,
				mode: e.mode,
				format: e.format
			});
		}), wc = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), on = "[a-zA-Z]|\\.\\.\\.", oa = "(" + on + ")+", Qi = "^" + oa + "$", cc = "(" + oa + ",)*" + oa, mc = "^" + cc + "$", fc = class {
				constructor(e = -1) {
					this.symbolToIndices = /* @__PURE__ */ new Map(), this.inputIndex = e;
				}
				addSymbol(e, t) {
					let r = this.symbolToIndices.get(e);
					r === void 0 ? r = [t] : r.push(t), this.symbolToIndices.set(e, r);
				}
			}, hc = class {
				constructor(e, t) {
					this.equation = t, this.hasEllipsis = !1, this.symbolToInfo = /* @__PURE__ */ new Map(), this.lhs = new Array(), this.outputDims = [];
					let [r, a] = t.includes("->") ? t.split("->", 2) : [t, ""];
					if (!r.match(RegExp(mc))) throw new Error("Invalid LHS term");
					if (r.split(",").forEach((n, i) => {
						let s = e[i].dims.slice();
						if (!n.match(RegExp(Qi))) throw new Error("Invalid LHS term");
						let l = this.processTerm(n, !0, s, i);
						this.lhs.push(l);
					}), a === "") a += [...this.symbolToInfo.entries()].filter(([n, i]) => i.count === 1 || n === "...").map(([n]) => n).join("");
					else if (!a.match(RegExp(oa))) throw new Error("Invalid RHS");
					a.match(RegExp(on, "g"))?.forEach((n) => {
						if (n === "...") this.outputDims = this.outputDims.concat(this.ellipsisDims);
						else {
							let i = this.symbolToInfo.get(n);
							if (i === void 0) throw new Error("Invalid RHS symbol");
							this.outputDims.push(i.dimValue);
						}
					}), this.rhs = this.processTerm(a, !1, this.outputDims);
				}
				addSymbol(e, t, r) {
					let a = this.symbolToInfo.get(e);
					if (a !== void 0) {
						if (a.dimValue !== t && a.count !== 1) throw new Error("Dimension mismatch");
						a.count++, a.inputIndices.push(r);
					} else a = {
						count: 1,
						dimValue: t,
						inputIndices: [r]
					};
					this.symbolToInfo.set(e, a);
				}
				processTerm(e, t, r, a = -1) {
					let n = r.length, i = !1, s = [], l = 0;
					if (!e.match(RegExp(Qi)) && !t && e !== "") throw new Error("Invalid LHS term");
					let d = e.match(RegExp(on, "g")), c = new fc(a);
					return d?.forEach((h, f) => {
						if (h === "...") {
							if (i) throw new Error("Only one ellipsis is allowed per input term");
							i = !0;
							let w = n - d.length + 1;
							if (w < 0) throw new Error("Ellipsis out of bounds");
							if (s = r.slice(l, l + w), this.hasEllipsis) {
								if (this.ellipsisDims.length !== s.length || this.ellipsisDims.toString() !== s.toString()) throw new Error("Ellipsis dimensions mismatch");
							} else if (t) this.hasEllipsis = !0, this.ellipsisDims = s;
							else throw new Error("Ellipsis must be specified in the LHS");
							for (let v = 0; v < s.length; v++) {
								let $ = String.fromCharCode(48 + v);
								c.addSymbol($, f + v), this.addSymbol($, r[l++], a);
							}
						} else c.addSymbol(h, f + (this.hasEllipsis ? this.ellipsisDims.length - 1 : 0)), this.addSymbol(h, r[l++], a);
					}), c;
				}
			}, Ji = (e) => e + "_max", gc = (e, t, r, a) => {
				let n = e.map((c) => c.length).map((c, h) => G(`input${h}`, t, c)), i = F.size(a), s = oe("output", t, a.length), l = [...r.symbolToInfo.keys()].filter((c) => !r.rhs.symbolToIndices.has(c)), d = (c) => {
					let h = [], f = "var prod = 1.0;", w = "var sum = 0.0;", v = "sum += prod;", $ = [], k = [], C = [], I = [], E = r.symbolToInfo.size === r.rhs.symbolToIndices.size;
					r.symbolToInfo.forEach((z, B) => {
						if (r.rhs.symbolToIndices.has(B)) {
							let N = r.rhs.symbolToIndices.get(B)?.[0];
							N !== void 0 && r.lhs.forEach((P, T) => {
								if (z.inputIndices.includes(T)) {
									let Y = P.symbolToIndices.get(B);
									if (Y === void 0) throw new Error("Invalid symbol error");
									Y.forEach((X) => {
										h.push(`${n[T].indicesSet(`input${T}Indices`, X, s.indicesGet("outputIndices", N))}`);
									});
								}
							});
						} else r.lhs.forEach((N, P) => {
							if (z.inputIndices.includes(P)) {
								let T = N.symbolToIndices.get(B);
								if (T === void 0) throw new Error("Invalid symbol error");
								T.forEach((Y) => {
									$.push(`${n[P].indicesSet(`input${P}Indices`, Y, `${B}`)}`);
								}), I.push(`prod *= ${n[P].getByIndices(`input${P}Indices`)};`);
							}
						}), k.push(`for(var ${B}: u32 = 0; ${B} < uniforms.${Ji(B)}; ${B}++) {`), C.push("}");
					});
					let A = E ? [...h, `let sum = ${n.map((z, B) => z.getByIndices(`input${B}Indices`)).join(" * ")};`] : [
						...h,
						w,
						...k,
						...$,
						f,
						...I,
						v,
						...C
					];
					return `
            ${c.registerUniforms(l.map((z) => ({
						name: `${Ji(z)}`,
						type: "u32"
					}))).registerUniform("outputSize", "u32").declareVariables(...n, s)}

            ${c.mainStart()}
            ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${n.map((z, B) => `var input${B}Indices: ${n[B].type.indices};`).join(`
`)}
            ${A.join(`
`)};
            ${s.setByOffset("global_idx", "sum")};
          }`;
				};
				return {
					name: "Einsum",
					shaderCache: {
						hint: r.equation,
						inputDependencies: e.map(() => "rank")
					},
					getRunData: () => {
						let c = l.filter((f) => r.symbolToInfo.has(f)).map((f) => ({
							type: 12,
							data: r.symbolToInfo.get(f)?.dimValue || 0
						}));
						c.push({
							type: 12,
							data: i
						});
						let h = e.map((f, w) => [...de(f)]).reduce((f, w) => f.concat(w), c);
						return h.push(...de(a)), {
							outputs: [{
								dims: a,
								dataType: t
							}],
							dispatchGroup: { x: Math.ceil(i / 64) },
							programUniforms: h
						};
					},
					getShaderSource: d
				};
			}, _c = (e, t) => {
				let r = new hc(e.inputs, t.equation), a = r.outputDims, n = e.inputs.map((i, s) => i.dims);
				e.compute(gc(n, e.inputs[0].dataType, r, a));
			}, yc = (e) => {
				let t = e.equation.replace(/\s+/g, "");
				return Ne({ equation: t });
			};
		}), kc = Z(() => {
			"use strict";
			fe(), we(), be(), bc = (e) => {
				if (!e || e.length !== 2) throw new Error("Expand requires 2 input.");
				let t = e[0].dims, r = Array.from(e[1].getBigInt64Array(), Number), a = r.length < t.length ? 0 : r.length - t.length, n = t.length < r.length ? 0 : t.length - r.length;
				for (; a < r.length && n < t.length; ++a, ++n) if (r[a] !== t[n] && r[a] !== 1 && t[n] !== 1) throw new Error("Expand requires shape to be broadcastable to input");
			}, es = (e, t) => {
				let r = e.length - t.length, a = [];
				for (let n = 0; n < r; ++n) a.push(e[n]);
				for (let n = 0; n < t.length; ++n) a.push(t[n] === 1 ? e[n + r] : t[n]);
				return a;
			}, vc = (e, t) => e.length > t.length ? es(e, t) : es(t, e), $c = (e) => {
				let t = e[0].dims, r = Array.from(e[1].getBigInt64Array(), Number), a = vc(t, r), n = e[0].dataType, i = n === 9 || F.size(t) === 1, s = n === 9 || t.length > 0 && t[t.length - 1] % 4 === 0 ? 4 : 1, l = i || a.length > 0 && a[a.length - 1] % 4 === 0 ? 4 : 1, d = Math.ceil(F.size(a) / l), c = (f) => {
					let w = G("input", n, t.length, s), v = oe("output", n, a.length, l), $;
					if (n === 9) {
						let k = (C, I, E = "") => `
          let outputIndices${I} = ${v.offsetToIndices(`outputOffset + ${I}u`)};
          let offset${I} = ${w.broadcastedIndicesToOffset(`outputIndices${I}`, v)};
          let index${I} = offset${I} / 4u;
          let component${I} = offset${I} % 4u;
          ${C}[${I}] = ${E}(${w.getByOffset(`index${I}`)}[component${I}]);
        `;
						$ = `
        let outputOffset = global_idx * ${l};
        var data = vec4<u32>(0);
        ${k("data", 0, "u32")}
        ${k("data", 1, "u32")}
        ${k("data", 2, "u32")}
        ${k("data", 3, "u32")}
        ${v.setByOffset("global_idx", "data")}
      }`;
					} else $ = `
        let outputIndices = ${v.offsetToIndices(`global_idx * ${l}`)};
        let inputOffset = ${w.broadcastedIndicesToOffset("outputIndices", v)};
        let data = ${v.type.value}(${w.getByOffset(`inputOffset / ${s}`)});
        ${v.setByOffset("global_idx", "data")}
      }`;
					return `
    ${f.registerUniform("vec_size", "u32").declareVariables(w, v)}
    ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${$}`;
				}, h = [{
					type: 12,
					data: d
				}, ...de(t, a)];
				return {
					name: "Expand",
					shaderCache: {
						hint: `${a.length};${s}${l}`,
						inputDependencies: ["rank"]
					},
					getShaderSource: c,
					getRunData: () => ({
						outputs: [{
							dims: a,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(d / 64) },
						programUniforms: h
					})
				};
			}, xc = (e) => {
				bc(e.inputs), e.compute($c(e.inputs), { inputs: [0] });
			};
		}), Tc = Z(() => {
			"use strict";
			fe(), we(), be(), Ja(), Sc = (e) => {
				let t = e[0].dataType, r = F.size(e[0].dims), a = F.size(e[1].dims), n = a % 4 === 0, i = (s) => {
					let l = G("x", t, [1], 4), d = G("bias", t, [1], 4), c = oe("y", t, [1], 4), h = [{
						name: "output_vec_size",
						type: "u32"
					}, {
						name: "bias_size",
						type: "u32"
					}], f = (v) => `
      let bias${v}_offset: u32 = (global_idx * 4 + ${v}) % uniforms.bias_size;
      let bias${v} = ${d.getByOffset(`bias${v}_offset / 4`)}[bias${v}_offset % 4];`, w = n ? `
      let bias = ${d.getByOffset("global_idx % (uniforms.bias_size / 4)")};` : `${f(0)}${f(1)}${f(2)}${f(3)}
      let bias = ${l.type.value}(bias0, bias1, bias2, bias3);`;
					return `${s.registerUniforms(h).declareVariables(l, d, c)}

    ${Pi(ut(t))}

    ${s.mainStart(Pr)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${l.getByOffset("global_idx")};
      ${w}
      let x_in = x + bias;
      ${c.setByOffset("global_idx", Ui("x_in"))}
    }`;
				};
				return {
					name: "FastGeluWithBias",
					shaderCache: {
						hint: `${n}`,
						inputDependencies: ["type", "type"]
					},
					getShaderSource: i,
					getRunData: (s) => ({
						outputs: [{
							dims: s[0].dims,
							dataType: s[0].dataType
						}],
						programUniforms: [{
							type: 12,
							data: Math.ceil(r / 4)
						}, {
							type: 12,
							data: a
						}],
						dispatchGroup: { x: Math.ceil(r / Pr / 4) }
					})
				};
			}, Ec = (e) => {
				e.inputs.length < 2 || F.size(e.inputs[1].dims) === 0 ? Hd(e) : e.compute(Sc(e.inputs));
			};
		}), Rc = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Ic = (e) => {
				if (!e || e.length !== 2) throw new Error("Gather requires 2 inputs.");
			}, zc = (e, t) => {
				let r = e[0].dims, a = e[1].dims, n = r.length, i = F.normalizeAxis(t.axis, n), s = r.slice(0);
				s.splice(i, 1, ...a);
				let l = r[i], d = e[0].dataType === 9 ? 4 : 1, c = Math.ceil(F.size(s) / d), h = [
					{
						type: 12,
						data: c
					},
					{
						type: 6,
						data: l
					},
					{
						type: 12,
						data: i
					},
					...de(e[0].dims, e[1].dims, s)
				], f = (w) => {
					let v = G("data", e[0].dataType, e[0].dims.length, d), $ = G("inputIndices", e[1].dataType, e[1].dims.length), k = oe("output", e[0].dataType, s.length, d), C = (E) => {
						let A = a.length, z = `var indicesIndices${E}  = ${$.type.indices}(0);`;
						for (let B = 0; B < A; B++) z += `${A > 1 ? `indicesIndices${E}[${B}]` : `indicesIndices${E}`} = ${s.length > 1 ? `outputIndices${E}[uniforms.axis + ${B}]` : `outputIndices${E}`};`;
						z += `
          var idx${E} = ${$.getByIndices(`indicesIndices${E}`)};
          if (idx${E} < 0) {
            idx${E} = idx${E} + uniforms.axisDimLimit;
          }
          var dataIndices${E} : ${v.type.indices};
        `;
						for (let B = 0, N = 0; B < n; B++) B === i ? (z += `${n > 1 ? `dataIndices${E}[${B}]` : `dataIndices${E}`} = u32(idx${E});`, N += A) : (z += `${n > 1 ? `dataIndices${E}[${B}]` : `dataIndices${E}`} = ${s.length > 1 ? `outputIndices${E}[${N}]` : `outputIndices${E}`};`, N++);
						return z;
					}, I;
					if (e[0].dataType === 9) {
						let E = (A, z, B = "") => `
          let outputIndices${z} = ${k.offsetToIndices(`outputOffset + ${z}u`)};
          ${C(z)};
          let offset${z} = ${v.indicesToOffset(`dataIndices${z}`)};
          let index${z} = offset${z} / 4u;
          let component${z} = offset${z} % 4u;
          ${A}[${z}] = ${B}(${v.getByOffset(`index${z}`)}[component${z}]);
        `;
						I = `
        let outputOffset = global_idx * ${d};
        var value = vec4<u32>(0);
        ${E("value", 0, "u32")}
        ${E("value", 1, "u32")}
        ${E("value", 2, "u32")}
        ${E("value", 3, "u32")}
        ${k.setByOffset("global_idx", "value")}
      `;
					} else I = `
      let outputIndices = ${k.offsetToIndices("global_idx")};
      ${C("")};
      let value = ${v.getByIndices("dataIndices")};
      ${k.setByOffset("global_idx", "value")};
      `;
					return `
      ${w.registerUniform("outputSize", "u32").registerUniform("axisDimLimit", "i32").registerUniform("axis", "u32").declareVariables(v, $, k)}
      ${w.mainStart()}
        ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${I}
      }`;
				};
				return {
					name: "Gather",
					shaderCache: {
						hint: t.cacheKey,
						inputDependencies: ["rank", "rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: s,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(c / 64) },
						programUniforms: h
					}),
					getShaderSource: f
				};
			}, Cc = (e) => Ne({ axis: e.axis }), Ac = (e, t) => {
				let r = e.inputs;
				Ic(r), e.compute(zc(e.inputs, t));
			};
		}), Mc = Z(() => {
			"use strict";
			fe(), we(), be(), Oc = (e, t, r, a, n, i, s, l, d) => {
				let c = [
					{
						type: 12,
						data: i
					},
					{
						type: 12,
						data: a
					},
					{
						type: 12,
						data: n
					},
					{
						type: 12,
						data: r
					},
					{
						type: 12,
						data: s
					},
					{
						type: 12,
						data: l
					},
					{
						type: 12,
						data: d
					}
				], h = [i];
				c.push(...de(t.dims, h));
				let f = (w) => {
					let v = [G("indices_data", t.dataType, t.dims.length), oe("input_slice_offsets_data", 12, 1, 1)], $ = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "batch_dims",
							type: "u32"
						},
						{
							name: "input_dims",
							type: "u32",
							length: n.length
						},
						{
							name: "sizes_from_slice_dims_data",
							type: "u32",
							length: r.length
						},
						{
							name: "num_slices_per_batch",
							type: "u32"
						},
						{
							name: "input_batch_stride",
							type: "u32"
						},
						{
							name: "num_slice_dims",
							type: "u32"
						}
					];
					return `
  ${w.registerUniforms($).declareVariables(...v)}
  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${n.length === 1 ? "index += i32(uniforms.input_dims);" : "index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length === 1 ? "relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);" : "relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`;
				};
				return e.compute({
					name: "computeSliceOffsets",
					shaderCache: {
						hint: `${n.length}_${r.length}`,
						inputDependencies: ["rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: h,
							dataType: e.inputs[1].dataType
						}],
						dispatchGroup: { x: Math.ceil(i / 64) },
						programUniforms: c
					}),
					getShaderSource: f
				}, {
					inputs: [t],
					outputs: [-1]
				})[0];
			}, Bc = (e, t) => {
				let r = e.inputs, a = r[0].dims, n = r[0].dataType, i = r[1].dims, s = i[i.length - 1], l = F.sizeToDimension(i, i.length - 1), d = F.sizeFromDimension(a, t.batchDims + s), c = F.sizeToDimension(a, t.batchDims), h = F.sizeFromDimension(a, t.batchDims), f = l / c, w = new Array(s), v = d;
				for (let z = 0; z < s; ++z) w[s - 1 - z] = v, v *= a[t.batchDims + s - 1 - z];
				let $ = Oc(e, r[1], w, t.batchDims, a, l, f, h, s), k = t.batchDims + s;
				if (k > a.length) throw new Error("last dimension of indices must not be larger than rank of input tensor");
				let C = i.slice(0, -1).concat(a.slice(k)), I = F.size(C), E = [
					{
						type: 12,
						data: I
					},
					{
						type: 12,
						data: d
					},
					...de(r[0].dims, $.dims, C)
				], A = (z) => {
					let B = G("data", r[0].dataType, r[0].dims.length), N = G("slice_offsets", 12, $.dims.length), P = oe("output", r[0].dataType, C.length);
					return `
          ${z.registerUniform("output_size", "u32").registerUniform("slice_size", "u32").declareVariables(B, N, P)}
            ${z.mainStart()}
            ${z.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`;
				};
				e.compute({
					name: "GatherND",
					shaderCache: {
						hint: t.cacheKey,
						inputDependencies: ["rank", "rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: C,
							dataType: n
						}],
						dispatchGroup: { x: Math.ceil(I / 64) },
						programUniforms: E
					}),
					getShaderSource: A
				}, { inputs: [r[0], $] });
			}, Dc = (e) => ({
				batchDims: e.batch_dims,
				cacheKey: ""
			});
		}), Fc = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Nc = (e, t) => {
				if (e.length < 3 || e.length > 4) throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");
				let r = F.normalizeAxis(t.quantizeAxis, e[0].dims.length), a = t.blockSize, n = e[0], i = e[2], s = e.length === 4 ? e[3] : void 0;
				if (i.dims.length !== n.dims.length || !n.dims.map((l, d) => d === r ? Math.ceil(l / a) === i.dims[d] : l === i.dims[d]).reduce((l, d) => l && d, !0)) throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");
				if (s) {
					if (s.dataType !== n.dataType) throw new Error("Zero point must have the same data type as the input tensor.");
					if (s.dims.length !== i.dims.length || !s.dims.map((l, d) => l === i.dims[d]).reduce((l, d) => l && d, !0)) throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.");
				}
			}, Pc = (e, t) => {
				let r = e[0].dims, a = e[1].dims, n = r.length, i = F.normalizeAxis(t.gatherAxis, n), s = F.normalizeAxis(t.quantizeAxis, n), l = r.slice(0);
				l.splice(i, 1, ...a);
				let d = F.size(l), c = e[2].dataType, h = e[0].dataType === 22, f = [
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: s
					},
					{
						type: 12,
						data: i
					},
					{
						type: 12,
						data: t.blockSize
					},
					...de(...e.map((v, $) => v.dims), l)
				], w = (v) => {
					let $ = G("data", e[0].dataType, e[0].dims.length), k = G("inputIndices", e[1].dataType, e[1].dims.length), C = G("scales", e[2].dataType, e[2].dims.length), I = e.length > 3 ? G("zeroPoint", e[3].dataType, e[3].dims.length) : void 0, E = oe("output", c, l.length), A = [
						$,
						k,
						C
					];
					return I && A.push(I), `
        ${v.registerUniforms([
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "quantize_axis",
							type: "u32"
						},
						{
							name: "gather_axis",
							type: "u32"
						},
						{
							name: "block_size",
							type: "u32"
						}
					]).declareVariables(...A, E)}
        ${v.mainStart()}
        let output_indices = ${E.offsetToIndices("global_idx")};
        var indices_indices = ${k.type.indices}(0);
        ${a.length > 1 ? `
          for (var i: u32 = 0; i < ${a.length}; i++) {
            let index = ${E.indicesGet("output_indices", "uniforms.gather_axis + i")};
            ${k.indicesSet("indices_indices", "i", "index")};
          }` : `indices_indices = ${E.indicesGet("output_indices", "uniforms.gather_axis")};`};
        var data_indices = ${$.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${E.indicesGet("output_indices", "i")};
          ${$.indicesSet("data_indices", "i", "index")};
        }
        var index_from_indices = ${k.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[i]};
        }
        ${$.indicesSet("data_indices", "uniforms.gather_axis", "u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${l.length}; i++) {
          let index = ${E.indicesGet("output_indices", `i + ${a.length} - 1`)};
          ${$.indicesSet("data_indices", "i", "index")};
        }
        let data_offset = ${$.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${$.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h ? "unpack4xI8" : "unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${C.indicesGet("data_indices", "uniforms.quantize_axis")} / uniforms.block_size;
        ${C.indicesSet("scale_indices", "uniforms.quantize_axis", "quantize_axis_index")};
        var scale = ${C.getByIndices("scale_indices")};
        ${I ? `
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${I.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${I.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h ? "unpack4xI8" : "unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];` : "var zero_point = 0"};
        let dequantized_data = ${ut(c)}(quantized_data - zero_point) * scale;
        ${E.setByOffset("global_idx", "dequantized_data")};
    }`;
				};
				return {
					name: "GatherBlockQuantized",
					shaderCache: {
						hint: `${t.cacheKey};${e.filter((v, $) => $ !== 1).map((v) => v.dims.join("_")).join(";")}`,
						inputDependencies: Array.from({ length: e.length }, (v, $) => "rank")
					},
					getRunData: () => ({
						outputs: [{
							dims: l,
							dataType: c
						}],
						dispatchGroup: { x: Math.ceil(d / 64) },
						programUniforms: f
					}),
					getShaderSource: w
				};
			}, Uc = (e, t) => {
				let r = e.inputs;
				Nc(r, t), e.compute(Pc(e.inputs, t));
			}, Lc = (e) => Ne({
				blockSize: e.blockSize,
				gatherAxis: e.gatherAxis,
				quantizeAxis: e.quantizeAxis
			});
		}), Hc = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), qc = (e) => {
				if (!e || e.length !== 2) throw new Error("GatherElements requires 2 inputs.");
				if (e[0].dims.length < 1) throw new Error("GatherElements requires that the data input be rank >= 1.");
				if (e[0].dims.length !== e[1].dims.length) throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`);
			}, Wc = (e, t) => {
				let r = e[0].dims, a = e[0].dataType, n = r.length, i = e[1].dims, s = e[1].dataType, l = F.normalizeAxis(t.axis, n), d = r[l], c = i.slice(0), h = F.size(c), f = G("input", a, n), w = G("indicesInput", s, i.length), v = oe("output", a, c.length), $ = [
					{
						type: 12,
						data: h
					},
					{
						type: 6,
						data: d
					},
					{
						type: 12,
						data: l
					}
				];
				return $.push(...de(r, i, c)), {
					name: "GatherElements",
					shaderCache: { inputDependencies: ["rank", "rank"] },
					getRunData: () => ({
						outputs: [{
							dims: c,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(h / 64) },
						programUniforms: $
					}),
					getShaderSource: (k) => `
      ${k.registerUniform("outputSize", "u32").registerUniform("axisDimLimit", "i32").registerUniform("axis", "u32").declareVariables(f, w, v)}
      ${k.mainStart()}
      ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${v.offsetToIndices("global_idx")};

      var idx = ${w.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${f.type.indices}(outputIndices);
      ${f.indicesSet("inputIndices", "uniforms.axis", "u32(idx)")};
      let value = ${f.getByIndices("inputIndices")};

      ${v.setByOffset("global_idx", "value")};
  }`
				};
			}, Gc = (e) => Ne({ axis: e.axis }), Vc = (e, t) => {
				let r = e.inputs;
				qc(r), e.compute(Wc(e.inputs, t));
			};
		}), Yc = Z(() => {
			"use strict";
			fe(), we(), be(), jc = (e) => {
				if (!e) throw new Error("Input is missing");
				if (e.length < 2 || e.length > 3) throw new Error("Invaid input number.");
				if (e.length === 3 && e[2].dims.length > 2) throw new Error("Invalid input shape of C");
				if (e[0].dataType !== e[1].dataType || e.length === 3 && e[0].dataType !== e[2].dataType) throw new Error("Input types are mismatched");
			}, Kc = (e, t) => {
				let r = e[0].dims.slice(), a = e[1].dims.slice(), [n, i, s] = Bu.getShapeOfGemmResult(r, t.transA, a, t.transB, e.length === 3 ? e[2].dims : void 0), l = [n, i];
				if (!l) throw new Error("Can't use gemm on the given tensors");
				let d = 16, c = Math.ceil(i / d), h = Math.ceil(n / d);
				F.size(l);
				let f = [
					{
						type: 12,
						data: c
					},
					{
						type: 12,
						data: n
					},
					{
						type: 12,
						data: i
					},
					{
						type: 12,
						data: s
					},
					{
						type: 1,
						data: t.alpha
					},
					{
						type: 1,
						data: t.beta
					}
				], w = ["type", "type"];
				e.length === 3 && (f.push(...de(e[2].dims)), w.push("rank")), f.push(...de(l));
				let v = ($) => {
					let k = G("a", e[0].dataType, e[0].dims), C = G("b", e[1].dataType, e[1].dims), I = null, E = [k, C];
					e.length === 3 && (I = G("c", e[2].dataType, e[2].dims.length), E.push(I));
					let A = oe("output", e[0].dataType, l.length);
					E.push(A);
					let z = [
						{
							name: "num_tile_n",
							type: "u32"
						},
						{
							name: "M",
							type: "u32"
						},
						{
							name: "N",
							type: "u32"
						},
						{
							name: "K",
							type: "u32"
						},
						{
							name: "alpha",
							type: "f32"
						},
						{
							name: "beta",
							type: "f32"
						}
					], B = "", N = "";
					t.transA && t.transB ? (N = `
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${k.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `, B = "value += tile_a[k][local_id.y] * tile_b[local_id.x][k];") : t.transA && !t.transB ? (N = `
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${k.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `, B = "value += tile_a[k][local_id.y] * tile_b[k][local_id.x];") : !t.transA && t.transB ? (N = `
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${k.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `, B = "value += tile_a[local_id.y][k] * tile_b[local_id.x][k];") : !t.transA && !t.transB && (N = `
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${k.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${C.type.value}(0);
      }
      `, B = "value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");
					let P = t.alpha === 1 ? "" : "value *= uniforms.alpha;";
					return `
  ${$.registerUniforms(z).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${k.type.storage}, ${d}>, ${d}>;
  var<workgroup> tile_b: array<array<${C.type.storage}, ${d}>, ${d}>;
  ${$.mainStart([
						d,
						d,
						1
					])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d};
    let num_tiles = (uniforms.K - 1) / ${d} + 1;
    var k_start = 0u;
    var value = ${A.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${N}
      k_start = k_start + ${d};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d}; k++) {
        ${B}
      }
      workgroupBarrier();
    }

    ${P}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${I != null ? `let cOffset = ${I.broadcastedIndicesToOffset("vec2(m, n)", A)}; value += ${A.type.value}(uniforms.beta) * ${I.getByOffset("cOffset")};` : ""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`;
				};
				return {
					name: "GemmShared",
					shaderCache: {
						hint: `${t.cacheKey}`,
						inputDependencies: w
					},
					getRunData: () => ({
						outputs: [{
							dims: l,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: c * h },
						programUniforms: f
					}),
					getShaderSource: v
				};
			}, Xc = (e) => ({
				transA: e.transA,
				transB: e.transB,
				alpha: e.alpha,
				beta: e.beta,
				cacheKey: `${e.transA};${e.transB};${e.alpha === 1}`
			}), Zc = (e, t) => {
				jc(e.inputs), e.compute(Kc(e.inputs, t));
			};
		}), um = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), [Nt, Gt, kr, Sr] = [
				0,
				1,
				2,
				3
			], Qc = (e) => {
				if (e[0].dims.length !== 4) throw new Error("only 4-D tensor is supported.");
				if (e[0].dims.length !== e[1].dims.length) throw new Error("input dimensions must be equal to grid dimensions");
				if (e[0].dims.length - 2 !== e[1].dims[e[1].dims.length - 1]) throw new Error(`last dimension of grid must be equal to ${e[0].dims.length - 2}`);
				if (e[0].dims[0] !== e[1].dims[0]) throw new Error("grid batch size must match input batch size");
			}, Jc = `
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`, em = (e) => `
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`, tm = (e) => `
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners === 0 ? `
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    ` : `
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`, rm = (e) => `
  ${e.paddingMode === "reflection" ? `
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }` : ""}
`, am = (e, t, r) => `
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Nt}] = batch;
     indices[${Gt}] = channel;` + (() => {
				switch (r.paddingMode) {
					case "zeros": return `
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${kr}] = u32(r);
            indices[${Sr}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;
					case "border": return `
          indices[${kr}] = u32(clamp(r, 0, H - 1));
          indices[${Sr}] = u32(clamp(c, 0, W - 1));
        `;
					case "reflection": return `
          indices[${kr}] = gs_reflect(r, border[1], border[3]);
          indices[${Sr}] = gs_reflect(c, border[0], border[2]);
        `;
					default: throw new Error(`padding mode ${r.paddingMode} is not supported`);
				}
			})() + `
    return ${e.getByIndices("indices")};
  }
`, nm = (e, t, r) => (() => {
				switch (r.mode) {
					case "nearest": return `
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Nt}], indices[${Gt}], border);
        `;
					case "bilinear": return `
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Nt}], indices[${Gt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Nt}], indices[${Gt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Nt}], indices[${Gt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Nt}], indices[${Gt}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;
					case "bicubic": return `
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Nt}], indices[${Gt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;
					default: throw new Error(`mode ${r.mode} is not supported`);
				}
			})() + `${e.setByOffset("global_idx", "result")}`, im = (e, t) => {
				let r = G("x", e[0].dataType, e[0].dims.length), a = [
					e[1].dims[0],
					e[1].dims[1],
					e[1].dims[2]
				], n = G("grid", e[1].dataType, a.length, 2), i = [
					e[0].dims[0],
					e[0].dims[1],
					e[1].dims[1],
					e[1].dims[2]
				];
				t.format === "NHWC" && (i = [
					e[0].dims[0],
					e[1].dims[1],
					e[1].dims[2],
					e[0].dims[3]
				], [Nt, Gt, kr, Sr] = [
					0,
					3,
					1,
					2
				]);
				let s = oe("output", e[0].dataType, i.length), l = r.type.value, d = [{
					type: 12,
					data: F.size(i)
				}, ...de(e[0].dims, a, i)], c = (h) => `
  ${h.registerUniform("output_size", "u32").declareVariables(r, n, s)}
  ${Jc}
  ${em(l)}
  ${tm(t)}
  ${rm(t)}
  ${am(r, l, t)}

  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${kr}]);
      let W_in = i32(uniforms.x_shape[${Sr}]);

      ${t.alignCorners === 0 ? `
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      ` : `
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Nt}], indices[${kr}], indices[${Sr}]);
      let nxy = ${n.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${nm(s, l, t)}
  }`;
				return {
					name: "GridSample",
					shaderCache: {
						hint: `${t.cacheKey}`,
						inputDependencies: ["type", "type"]
					},
					getRunData: (h) => {
						let f = F.size(i);
						return {
							outputs: [{
								dims: i,
								dataType: h[0].dataType
							}],
							dispatchGroup: { x: Math.ceil(f / 64) },
							programUniforms: d
						};
					},
					getShaderSource: c
				};
			}, sm = (e, t) => {
				Qc(e.inputs), e.compute(im(e.inputs, t));
			}, om = (e) => Ne({
				alignCorners: e.align_corners,
				mode: e.mode,
				paddingMode: e.padding_mode,
				format: e.format
			});
		}), rs = Z(() => {
			"use strict";
			fe(), we(), Qe(), Ga(), Ya(), be(), Wt(), dt = (e, t) => e.length > t && e[t].dims.length > 0 ? e[t] : void 0, lm = (e, t) => {
				let r = e[0], a = dt(e, 1), n = dt(e, 2), i = dt(e, 3), s = dt(e, 4), l = dt(e, 5), d = dt(e, 6), c = dt(e, 7);
				if (r.dims.length !== 3 && r.dims.length !== 5) throw new Error("Input query is expected to have 3 or 5 dimensions");
				let h = r.dims[0], f = r.dims[1], w = r.dims.length === 3 ? r.dims[2] : t.numHeads * r.dims[4], v = f, $ = 0, k = 0, C = Math.floor(w / t.numHeads);
				if (d && c && F.size(d.dims) && F.size(c.dims)) {
					if (d.dims.length !== 4) throw new Error("Input \"past_key\" is expected to have 4 dimensions");
					if (d.dims[0] !== h || d.dims[1] !== t.numHeads || d.dims[3] !== C) throw new Error("Input \"past_key\" shape (batch_size, num_heads, past_sequence_length, head_size)");
					if (c.dims[0] !== h || c.dims[1] !== t.numHeads || c.dims[3] !== C) throw new Error("Input \"past_value\" shape (batch_size, num_heads, past_sequence_length, head_size)");
					if (d.dims[2] !== c.dims[2]) throw new Error("Input \"past_key\" and \"past_value\" shall have same dim 2 (past_sequence_length)");
					if (c.dims.length !== 4) throw new Error("Input \"past_value\" is expected to have 4 dimensions");
					$ = d.dims[2], k = d.dims[2];
				} else if (d && F.size(d.dims) || c && F.size(c.dims)) throw new Error("Input \"past_key\" and \"past_value\" shall be both present or both absent");
				let I;
				if (a && F.size(a.dims) > 0) {
					if (r.dims.length !== 3) throw new Error("Input \"query\" is expected to have 3 dimensions when key is given");
					if (a.dims.length < 3 || a.dims.length > 5) throw new Error("Input \"key\" is expected to have 3, 4, or 5 dimensions");
					if (r.dims[0] !== a.dims[0]) throw new Error("Input \"query\" and \"key\" shall have same dim 0 (batch size)");
					if (a.dims.length === 3) {
						if (a.dims[2] !== r.dims[2]) throw new Error("Input \"query\" and \"key\" shall have same dim 2 (hidden_size)");
						I = 2, v = a.dims[1];
					} else if (a.dims.length === 5) {
						if (a.dims[2] !== t.numHeads || a.dims[3] !== 2 || a.dims[4] !== C) throw new Error("Expect \"key\" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv");
						if (n) throw new Error("Expect \"value\" be none when \"key\" has packed kv format.");
						I = 5, v = a.dims[1];
					} else {
						if (a.dims[1] !== t.numHeads || a.dims[3] !== C) throw new Error("Expect \"key\" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key");
						I = 0, v = a.dims[2];
					}
				} else {
					if (r.dims.length !== 5) throw new Error("Input \"query\" is expected to have 5 dimensions when key is empty");
					if (r.dims[2] !== t.numHeads || r.dims[3] !== 3) throw new Error("Expect \"query\" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv");
					I = 3;
				}
				if (i && F.size(i.dims) > 0) {
					if (i.dims.length !== 1) throw new Error("Input \"bias\" is expected to have 1 dimension");
					if (a && a.dims.length === 5 && a.dims[3] === 2) throw new Error("bias is not allowed for packed kv.");
				}
				let E = $ + v, A = 0;
				if (s && F.size(s.dims) > 0) {
					A = 8;
					let P = s.dims;
					throw P.length === 1 ? P[0] === h ? A = 1 : P[0] === 3 * h + 2 && (A = 3) : P.length === 2 && P[0] === h && P[1] === E && (A = 5), A === 8 ? /* @__PURE__ */ new Error("Input \"key_padding_mask\" shape shall be (batch_size) or (batch_size, total_sequence_length)") : /* @__PURE__ */ new Error("Mask not supported");
				}
				let z = !1, B = w;
				if (n && F.size(n.dims) > 0) {
					if (n.dims.length !== 3 && n.dims.length !== 4) throw new Error("Input \"value\" is expected to have 3 or 4 dimensions");
					if (r.dims[0] !== n.dims[0]) throw new Error("Input \"query\" and \"value\" shall have same dim 0 (batch_size)");
					if (n.dims.length === 3) {
						if (v !== n.dims[1]) throw new Error("Input \"key\" and \"value\" shall have the same dim 1 (kv_sequence_length)");
						B = n.dims[2];
					} else {
						if (v !== n.dims[2]) throw new Error("Input \"key\" and \"value\" shall have the same dim 2 (kv_sequence_length)");
						B = n.dims[1] * n.dims[3], z = !0;
					}
				}
				let N = !1;
				if (s && F.size(s.dims) > 0) throw new Error("Key padding mask is not supported");
				if (l && F.size(l.dims) > 0) {
					if (l.dims.length !== 4) throw new Error("Input \"attention_bias\" is expected to have 4 dimensions");
					if (l.dims[0] !== h || l.dims[1] !== t.numHeads || l.dims[2] !== f || l.dims[3] !== E) throw new Error("Expect \"attention_bias\" shape (batch_size, num_heads, sequence_length, total_sequence_length)");
				}
				return {
					batchSize: h,
					sequenceLength: f,
					pastSequenceLength: $,
					kvSequenceLength: v,
					totalSequenceLength: E,
					maxSequenceLength: k,
					inputHiddenSize: 0,
					hiddenSize: w,
					vHiddenSize: B,
					headSize: C,
					vHeadSize: Math.floor(B / t.numHeads),
					numHeads: t.numHeads,
					isUnidirectional: !1,
					pastPresentShareBuffer: !1,
					maskFilterValue: t.maskFilterValue,
					maskType: A,
					scale: t.scale,
					broadcastResPosBias: N,
					passPastInKv: z,
					qkvFormat: I
				};
			}, dm = (e) => Ne({ ...e }), ts = Ne({ perm: [
				0,
				2,
				1,
				3
			] }), pm = (e, t, r, a, n, i, s) => {
				let l = [
					a,
					n,
					i
				], d = F.size(l), c = [
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: s
					},
					{
						type: 12,
						data: i
					}
				], h = (f) => {
					let w = oe("qkv_with_bias", t.dataType, l), v = G("qkv", t.dataType, l), $ = G("bias", r.dataType, l);
					return `
  ${f.registerUniforms([
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "bias_offset",
							type: "u32"
						},
						{
							name: "hidden_size",
							type: "u32"
						}
					]).declareVariables(v, $, w)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`;
				};
				return e.compute({
					name: "MultiHeadAttentionAddBias",
					shaderCache: { inputDependencies: ["type", "type"] },
					getRunData: () => ({
						outputs: [{
							dims: l,
							dataType: t.dataType,
							gpuDataType: 0
						}],
						dispatchGroup: { x: Math.ceil(d / 64) },
						programUniforms: c
					}),
					getShaderSource: h
				}, {
					inputs: [t, r],
					outputs: [-1]
				})[0];
			}, ua = (e, t, r, a, n, i, s, l) => {
				let d = i;
				if (s && F.size(s.dims) > 0) {
					if (a === 1) throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");
					return d = pm(e, i, s, t, a, r * n, l), d = d.reshape([
						t,
						a,
						r,
						n
					]), r === 1 || a === 1 ? d : e.compute(_t(d, ts.perm), {
						inputs: [d],
						outputs: [-1]
					})[0];
				} else return i.dims.length === 3 && (d = i.reshape([
					t,
					a,
					r,
					n
				])), r === 1 || a === 1 ? d : e.compute(_t(d, ts.perm), {
					inputs: [d],
					outputs: [-1]
				})[0];
			}, cm = (e, t) => {
				let r = lm(e.inputs, t), a = e.inputs[0], n = dt(e.inputs, 1), i = dt(e.inputs, 2), s = dt(e.inputs, 3), l = dt(e.inputs, 4), d = dt(e.inputs, 5), c = dt(e.inputs, 6), h = dt(e.inputs, 7);
				if (a.dims.length === 5) throw new Error("Packed QKV is not implemented");
				if (n?.dims.length === 5) throw new Error("Packed KV is not implemented");
				let f = n && i && n.dims.length === 4 && i.dims.length === 4, w = ua(e, r.batchSize, r.numHeads, r.sequenceLength, r.headSize, a, s, 0);
				if (f) return aa(e, w, n, i, l, void 0, c, h, d, r);
				if (!n || !i) throw new Error("key and value must be provided");
				let v = ua(e, r.batchSize, r.numHeads, r.kvSequenceLength, r.headSize, n, s, r.hiddenSize), $ = ua(e, r.batchSize, r.numHeads, r.kvSequenceLength, r.vHeadSize, i, s, 2 * r.hiddenSize);
				aa(e, w, v, $, l, void 0, c, h, d, r);
			};
		}), ns = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), mm = (e) => {
				if (!e || e.length < 1) throw new Error("too few inputs");
			}, fm = (e, t) => {
				let r = [], a = t.numOutputs;
				return e[1].dims[0] > 0 && (e[1].getBigInt64Array().forEach((n) => r.push(Number(n))), a = r.length), Ne({
					numOutputs: a,
					axis: t.axis,
					splitSizes: r
				});
			}, hm = (e) => `
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${le("uniforms.size_in_split_axis", "i", e)}) {
        return i;
    }
    }
    return ${e}u;
}`, gm = (e) => {
				let t = e.length, r = [];
				for (let a = 0; a < t; ++a) {
					let n = e[a].setByIndices("indices", "input[global_idx]");
					t === 1 ? r.push(n) : a === 0 ? r.push(`if (output_number == ${a}u) { ${n} }`) : a === t - 1 ? r.push(`else { ${n} }`) : r.push(`else if (output_number == ${a}) { ${n} }`);
				}
				return `
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`;
			}, as = (e, t) => {
				let r = e[0].dims, a = F.size(r), n = e[0].dataType, i = F.normalizeAxis(t.axis, r.length), s = new Array(t.numOutputs), l = G("input", n, r.length), d = new Array(t.numOutputs), c = [], h = [], f = 0, w = [{
					type: 12,
					data: a
				}];
				for (let $ = 0; $ < t.numOutputs; $++) {
					f += t.splitSizes[$], d[$] = f;
					let k = r.slice();
					k[i] = t.splitSizes[$], h.push(k), s[$] = oe(`output${$}`, n, k.length), c.push({
						dims: h[$],
						dataType: e[0].dataType
					});
				}
				w.push({
					type: 12,
					data: d
				}, ...de(r, ...h));
				let v = ($) => `
  ${$.registerUniform("input_size", "u32").registerUniform("size_in_split_axis", "u32", d.length).declareVariables(l, ...s)}
  ${hm(d.length)}
  ${gm(s)}

  ${$.mainStart()}
    ${$.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${l.offsetToIndices("global_idx")};
    var index = ${l.indicesGet("indices", i)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${le("uniforms.size_in_split_axis", "output_number - 1u", d.length)};
      ${l.indicesSet("indices", i, "index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;
				return {
					name: "Split",
					shaderCache: {
						hint: t.cacheKey,
						inputDependencies: ["rank"]
					},
					getShaderSource: v,
					getRunData: () => ({
						outputs: c,
						dispatchGroup: { x: Math.ceil(a / 64) },
						programUniforms: w
					})
				};
			}, _m = (e, t) => {
				mm(e.inputs);
				let r = e.inputs.length === 1 ? t : fm(e.inputs, t);
				e.compute(as(e.inputs, r), { inputs: [0] });
			}, ym = (e) => {
				let t = e.axis, r = e.splitSizes, a = e.numOutputs < 0 ? r.length : e.numOutputs;
				if (a !== r.length) throw new Error("numOutputs and splitSizes length must be equal");
				return Ne({
					axis: t,
					numOutputs: a,
					splitSizes: r
				});
			};
		}), is = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), wm = (e, t) => {
				let [r, a, n, i] = e, { numHeads: s, rotaryEmbeddingDim: l } = t;
				if (r.dims.length !== 3 && r.dims.length !== 4) throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);
				if (!F.areEqual(a.dims, []) && !F.areEqual(a.dims, [1]) && a.dims.length !== 2) throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${a.dims.length}`);
				if (n.dims.length !== 2) throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${n.dims.length}`);
				if (i.dims.length !== 2) throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${i.dims.length}`);
				if (!F.areEqual(n.dims, i.dims)) throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");
				if (l > 0 && s === 0) throw new Error("num_heads must be provided if rotary_embedding_dim is specified");
				let d = r.dims[0], c = r.dims[r.dims.length - 2], h = n.dims[0], f = F.sizeFromDimension(r.dims, 1) / c, w = l === 0 ? n.dims[1] * 2 : f / s;
				if (l > w) throw new Error("rotary_embedding_dim must be less than or equal to head_size");
				if (a.dims.length === 2) {
					if (d !== a.dims[0]) throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${a.dims[0]}`);
					if (c !== a.dims[1]) throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${a.dims[1]}`);
				}
				if (c > h) throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported");
				if (w / 2 !== n.dims[1] && l / 2 !== n.dims[1]) throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${n.dims[1]}`);
			}, un = (e, t) => {
				let { interleaved: r, numHeads: a, rotaryEmbeddingDim: n, scale: i } = t, s = e[0].dims[0], l = F.sizeFromDimension(e[0].dims, 1), d = e[0].dims[e[0].dims.length - 2], c = l / d, h = e[2].dims[1], f = n === 0 ? h * 2 : c / a, w = new Array(s, d, c / f, f - h), v = F.computeStrides(w), $ = [
					{
						type: 1,
						data: i
					},
					{
						type: 12,
						data: w
					},
					{
						type: 12,
						data: v
					},
					...e[0].dims.length === 3 ? new Array({
						type: 12,
						data: [
							l,
							c,
							f,
							1
						]
					}) : [],
					...e[0].dims.length === 4 ? new Array({
						type: 12,
						data: [
							l,
							f,
							d * f,
							1
						]
					}) : [],
					...de(e[0].dims, e[1].dims, e[2].dims, e[3].dims, e[0].dims)
				], k = (C) => {
					let I = G("input", e[0].dataType, e[0].dims.length), E = G("position_ids", e[1].dataType, e[1].dims.length), A = G("cos_cache", e[2].dataType, e[2].dims.length), z = G("sin_cache", e[3].dataType, e[3].dims.length), B = oe("output", e[0].dataType, e[0].dims.length);
					return C.registerUniforms([
						{
							name: "scale",
							type: "f32"
						},
						{
							name: "global_shape",
							type: "u32",
							length: w.length
						},
						{
							name: "global_strides",
							type: "u32",
							length: v.length
						},
						{
							name: "input_output_strides",
							type: "u32",
							length: v.length
						}
					]), `
        ${C.declareVariables(I, E, A, z, B)}

        ${C.mainStart(Pr)}
          let half_rotary_emb_dim = uniforms.${A.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${C.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${E.broadcastedIndicesToOffset("bsnh.xy", oe("", E.type.tensor, 2))};
            let position_id =
                u32(${E.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${I.getByOffset("i")} * ${A.get("position_id", "bsnh[3]")} -
                ${I.getByOffset("j")} * ${z.get("position_id", "bsnh[3]")};
            ${B.setByOffset("i", "re")}
            let im = ${I.getByOffset("i")} * ${z.get("position_id", "bsnh[3]")} +
                ${I.getByOffset("j")} * ${A.get("position_id", "bsnh[3]")};
            ${B.setByOffset("j", "im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${B.setByOffset("k", I.getByOffset("k"))}
          }
        }`;
				};
				return {
					name: "RotaryEmbedding",
					shaderCache: {
						hint: Ne({ interleaved: r }).cacheKey,
						inputDependencies: [
							"rank",
							"rank",
							"rank",
							"rank"
						]
					},
					getShaderSource: k,
					getRunData: () => ({
						outputs: [{
							dims: e[0].dims,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(F.size(w) / Pr) },
						programUniforms: $
					})
				};
			}, bm = (e, t) => {
				wm(e.inputs, t), e.compute(un(e.inputs, t));
			};
		}), Sm = Z(() => {
			"use strict";
			Qe(), fe(), Ya(), rs(), ns(), Wt(), is(), be(), vm = (e, t) => {
				if (t.doRotary && e.length <= 7) throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");
				let r = e[0], a = e[1], n = e[2], i = e[3], s = e[4];
				if (t.doRotary !== 0 && e.length <= 7) throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");
				if (t.localWindowSize !== -1) throw new Error("Local attention is not supported");
				if (t.softcap !== 0) throw new Error("Softcap is not supported");
				if (t.rotaryInterleaved !== 0) throw new Error("Rotary interleaved is not supported");
				if (t.smoothSoftmax) throw new Error("Smooth softmax is not supported");
				if (r.dims.length !== 3 && r.dims.length !== 5) throw new Error("Input query is expected to have 3 or 5 dimensions");
				let l = r.dims[0], d = r.dims[1], c = r.dims.length === 3 ? r.dims[2] : t.numHeads * r.dims[4], h = d, f = 0, w = !a || a.dims.length === 0, v = Math.floor(w ? c / (t.numHeads + 2 * t.kvNumHeads) : c / t.numHeads);
				w && (c = v * t.numHeads);
				let $ = i && i.dims.length !== 0, k = s && s.dims.length !== 0;
				if ($ && i.dims.length === 4 && i.dims[0] === l && i.dims[1] !== t.kvNumHeads && i.dims[2] === t.kvNumHeads && i.dims[3] === v) throw new Error("BSNH pastKey/pastValue is not supported");
				if ($ && k) {
					if (i.dims.length !== 4) throw new Error("Input \"past_key\" is expected to have 4 dimensions");
					if (s.dims.length !== 4) throw new Error("Input \"past_value\" is expected to have 4 dimensions");
					f = i.dims[2];
				} else if ($ || k) throw new Error("Input \"past_key\" and \"past_value\" shall be both present or both absent");
				let C = 1;
				if (a && a.dims.length > 0) {
					if (r.dims.length !== 3) throw new Error("Input \"query\" is expected to have 3 dimensions when key is given");
					if (a.dims.length < 3 || a.dims.length > 5) throw new Error("Input \"key\" is expected to have 3, 4, or 5 dimensions");
					if (r.dims[0] !== a.dims[0]) throw new Error("Input \"query\" and \"key\" shall have same dim 0 (batch size)");
					if (a.dims.length === 3) {
						if (r.dims[2] % a.dims[2] !== 0) throw new Error("Dimension 2 of \"query\" should be a multiple of \"key\"");
						h = a.dims[1];
					} else if (a.dims.length === 5) {
						if (a.dims[2] !== t.numHeads || a.dims[3] !== 2 || a.dims[4] !== v) throw new Error("Expect \"key\" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv");
						if (n) throw new Error("Expect \"value\" be none when \"key\" has packed kv format.");
						h = a.dims[1];
					} else {
						if (a.dims[1] !== t.numHeads || a.dims[3] !== v) throw new Error("Expect \"key\" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key");
						h = a.dims[2];
					}
				} else {
					if (r.dims.length !== 3 && r.dims.length !== 5) throw new Error("Input \"query\" is expected to have 3 or 5 dimensions when key is empty");
					if (r.dims.length === 5 && (r.dims[2] !== t.numHeads || r.dims[3] !== 3)) throw new Error("Expect \"query\" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv");
					C = 3;
				}
				let I = 0, E = !1, A = t.kvNumHeads ? v * t.kvNumHeads : c;
				if (n && n.dims.length > 0) {
					if (n.dims.length !== 3 && n.dims.length !== 4) throw new Error("Input \"value\" is expected to have 3 or 4 dimensions");
					if (r.dims[0] !== n.dims[0]) throw new Error("Input \"query\" and \"value\" shall have same dim 0 (batch_size)");
					if (n.dims.length === 3) {
						if (h !== n.dims[1]) throw new Error("Input \"key\" and \"value\" shall have the same dim 1 (kv_sequence_length)");
						A = n.dims[2];
					} else {
						if (h !== n.dims[2]) throw new Error("Input \"past_key\" and \"past_value\" shall have the same dim 2 (kv_sequence_length)");
						A = n.dims[1] * n.dims[3], E = !0;
					}
				}
				let z = e.length > 4 ? e[5] : void 0;
				if (z) {
					if (z.dims.length === 0) throw new Error("seqlens_k must be at least 1D, got scalar.");
					let B = z.dims.reduce((N, P) => N * P, 1);
					if (B !== l) throw new Error(`seqlens_k must have batch_size (${l}) elements, got ${B}.`);
					for (let N = 0; N < z.dims.length; N++) if (z.dims[N] !== 1 && z.dims[N] !== l) throw new Error(`seqlens_k has unexpected shape. Each dimension must be 1 or batch_size (${l}), got dims[${N}] = ${z.dims[N]}.`);
				}
				return {
					batchSize: l,
					sequenceLength: d,
					pastSequenceLength: f,
					kvSequenceLength: h,
					totalSequenceLength: -1,
					maxSequenceLength: -1,
					inputHiddenSize: 0,
					hiddenSize: c,
					vHiddenSize: A,
					headSize: v,
					vHeadSize: Math.floor(A / t.kvNumHeads),
					numHeads: t.numHeads,
					kvNumHeads: t.kvNumHeads,
					nReps: t.numHeads / t.kvNumHeads,
					pastPresentShareBuffer: !1,
					maskType: I,
					scale: t.scale,
					broadcastResPosBias: !1,
					passPastInKv: E,
					qkvFormat: C
				};
			}, $m = Ne({ perm: [
				0,
				2,
				1,
				3
			] }), ss = (e, t, r) => {
				let a = t, n = r.kvNumHeads;
				return t.dims.length === 3 && r.kvSequenceLength !== 0 && (a = t.reshape([
					r.batchSize,
					r.kvSequenceLength,
					n,
					r.headSize
				]), a = e.compute(_t(a, $m.perm), {
					inputs: [a],
					outputs: [-1]
				})[0]), a;
			}, xm = (e, t, r, a) => {
				let n = 7, i = ["type", "type"], s = [e * t], l = e * t, d = [
					{
						type: 12,
						data: l
					},
					{
						type: 12,
						data: t
					},
					{
						type: 12,
						data: e
					}
				], c = (h) => {
					let f = G("seq_lens", r.dataType, r.dims), w = G("total_seq_lens", a.dataType, a.dims), v = oe("pos_ids", n, s);
					return `
  ${h.registerUniforms([
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "sequence_length",
							type: "u32"
						},
						{
							name: "batch_size",
							type: "u32"
						}
					]).declareVariables(f, w, v)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${w.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${f.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${v.setByOffset("global_idx", "pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${v.setByOffset("global_idx", "pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${v.setByOffset("global_idx", "seqlen")}
    };
  }
  `;
				};
				return {
					name: "GeneratePositionIds",
					shaderCache: {
						hint: `${e};${t}`,
						inputDependencies: i
					},
					getRunData: () => ({
						outputs: [{
							dims: s,
							dataType: n
						}],
						dispatchGroup: { x: Math.ceil(l / 64) },
						programUniforms: d
					}),
					getShaderSource: c
				};
			}, km = (e, t) => {
				let r = vm(e.inputs, t);
				if (e.inputs[0].dims.length === 5) throw new Error("Packed QKV is not implemented");
				if (e.inputs[1]?.dims.length === 5) throw new Error("Packed KV is not implemented");
				let a = e.inputs[0], n = e.inputs[1] && e.inputs[1].dims.length > 0 ? e.inputs[1] : void 0, i = e.inputs[2] && e.inputs[2].dims.length > 0 ? e.inputs[2] : void 0, s = e.inputs[3] && e.inputs[3].dims.length !== 0 ? e.inputs[3] : void 0, l = e.inputs[4] && e.inputs[4].dims.length !== 0 ? e.inputs[4] : void 0, d = e.inputs.length > 4 ? e.inputs[5] : void 0, c = e.inputs.length > 5 ? e.inputs[6] : void 0, h = r.kvNumHeads ? r.kvNumHeads : r.numHeads, f = Ne({
					axis: 2,
					numOutputs: 3,
					splitSizes: [
						r.numHeads * r.headSize,
						h * r.headSize,
						h * r.headSize
					]
				}), [w, v, $] = !n && !i ? e.compute(as([a], f), {
					inputs: [a],
					outputs: [
						-1,
						-1,
						-1
					]
				}) : [
					a,
					n,
					i
				], k, C;
				if (t.doRotary) {
					let z = e.compute(xm(r.batchSize, r.sequenceLength, d, c), {
						inputs: [d, c],
						outputs: [-1]
					})[0], B = e.inputs[7], N = e.inputs[8], P = Ne({
						interleaved: t.rotaryInterleaved !== 0,
						numHeads: r.numHeads,
						rotaryEmbeddingDim: 0,
						scale: t.scale
					}), T = [
						w,
						z,
						B,
						N
					], Y = [-1];
					k = e.compute(un(T, P), {
						inputs: T,
						outputs: Y
					})[0], T.splice(0, 1, v);
					let X = Ne({
						interleaved: t.rotaryInterleaved !== 0,
						numHeads: r.kvNumHeads,
						rotaryEmbeddingDim: 0,
						scale: t.scale
					});
					C = e.compute(un(T, X), {
						inputs: T,
						outputs: Y
					})[0];
				}
				let I = ua(e, r.batchSize, r.numHeads, r.sequenceLength, r.headSize, t.doRotary ? k : w, void 0, 0), E = ss(e, t.doRotary ? C : v, r), A = ss(e, $, r);
				aa(e, I, E, A, void 0, void 0, s, l, void 0, r, d, c);
			};
		}), zm = Z(() => {
			"use strict";
			fe(), we(), Wt(), be(), os = (e, t, r, a, n, i, s, l) => {
				let d = Je(i), c = d === 1 ? "f32" : `vec${d}f`, h = d === 1 ? "vec2f" : `mat2x${d}f`, f = n * s, w = 64;
				f === 1 && (w = 256);
				let v = [
					n,
					s,
					i / d
				], $ = [
					n,
					s,
					2
				], k = [
					"rank",
					"type",
					"type"
				], C = [];
				C.push(...de(v, $));
				let I = (E) => {
					let A = G("x", t.dataType, 3, d), z = [
						A,
						G("scale", r.dataType, r.dims),
						G("bias", a.dataType, a.dims),
						oe("output", 1, 3, 2)
					];
					return `
  var<workgroup> workgroup_shared : array<${h}, ${w}>;
  const workgroup_size = ${w}u;
  ${E.declareVariables(...z)}
  ${E.mainStart(w)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${c}(0);
    var squared_sum = ${c}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${c}(${A.get("batch", "channel", "h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${ar("workgroup_shared[0][0]", d)} / f32(hight * ${d});
      let squared_sum_final = ${ar("workgroup_shared[0][1]", d)} / f32(hight * ${d});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${l}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`;
				};
				return e.compute({
					name: "InstanceNormComputeChannelScaleShift",
					shaderCache: {
						hint: `${d};${l};${w}`,
						inputDependencies: k
					},
					getRunData: () => ({
						outputs: [{
							dims: $,
							dataType: 1
						}],
						dispatchGroup: { x: f },
						programUniforms: C
					}),
					getShaderSource: I
				}, {
					inputs: [
						t,
						r,
						a
					],
					outputs: [-1]
				})[0];
			}, Em = (e, t, r) => {
				let a = t[0].dims, n = a, i = 2, s = a[0], l = a[1], d = F.sizeFromDimension(a, i), c = Je(d), h = F.size(n) / c, f = os(e, t[0], t[1], t[2], s, d, l, r.epsilon), w = [
					s,
					l,
					d / c
				], v = [s, l], $ = ["type", "none"], k = (C) => {
					let I = G("x", t[0].dataType, w.length, c), E = G("scale_shift", 1, v.length, 2), A = oe("output", t[0].dataType, w.length, c), z = [
						I,
						E,
						A
					];
					return `
  ${C.registerUniform("output_size", "u32").declareVariables(...z)}
  ${C.mainStart()}
  ${C.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${A.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${E.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${I.getByOffset("global_idx")} * ${A.type.value}(scale_shift.x) + ${A.type.value}(scale_shift.y);
      ${A.setByOffset("global_idx", "value")};
  }`;
				};
				e.compute({
					name: "InstanceNormalization",
					shaderCache: {
						hint: `${c}`,
						inputDependencies: $
					},
					getRunData: () => ({
						outputs: [{
							dims: n,
							dataType: t[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(h / 64) },
						programUniforms: [{
							type: 12,
							data: h
						}, ...de(w, v, w)]
					}),
					getShaderSource: k
				}, { inputs: [t[0], f] });
			}, Tm = (e, t, r) => {
				let a = t[0].dims, n = a, i = a[0], s = a[a.length - 1], l = F.sizeFromDimension(a, 1) / s, d = Je(s), c = F.size(n) / d, h = [{
					type: 12,
					data: l
				}, {
					type: 12,
					data: Math.floor(s / d)
				}], f = ["type", "type"], w = !1, v = [0, a.length - 1];
				for (let I = 0; I < a.length - 2; I++) w = w || a[I + 1] !== 1, v.push(I + 1);
				w = w && a[a.length - 1] !== 1;
				let $ = w ? e.compute(_t(e.inputs[0], v), {
					inputs: [e.inputs[0]],
					outputs: [-1]
				})[0] : e.inputs[0].reshape(Array.from({ length: a.length }, (I, E) => a[v[E]])), k = os(e, $, t[1], t[2], i, l, s, r.epsilon), C = (I) => {
					let E = nt(t[0].dataType), A = d === 1 ? "vec2f" : `mat${d}x2f`, z = (P) => {
						let T = P === 0 ? "x" : "y", Y = d === 1 ? "f32" : `vec${d}f`;
						switch (d) {
							case 1: return `${E}(${Y}(scale.${T}))`;
							case 2: return `vec2<${E}>(${Y}(scale[0].${T}, scale[1].${T}))`;
							case 4: return `vec4<${E}>(${Y}(scale[0].${T}, scale[1].${T}, scale[2].${T}, scale[3].${T}))`;
							default: throw new Error(`Not supported compoents ${d}`);
						}
					}, B = G("input", t[0].dataType, t[0].dims, d), N = oe("output", t[0].dataType, n, d);
					return `
  @group(0) @binding(0) var<storage, read> input : array<${B.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${A}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${N.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${I.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${z(0)}, ${z(1)});
  }`;
				};
				e.compute({
					name: "InstanceNormalizationNHWC",
					shaderCache: {
						hint: `${d}`,
						inputDependencies: f
					},
					getRunData: () => ({
						outputs: [{
							dims: n,
							dataType: t[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(c / 64) },
						programUniforms: h
					}),
					getShaderSource: C
				}, { inputs: [t[0], k] });
			}, Im = (e, t) => {
				t.format === "NHWC" ? Tm(e, e.inputs, t) : Em(e, e.inputs, t);
			};
		}), Om = Z(() => {
			"use strict";
			fe(), we(), be(), Cm = (e) => {
				if (!e || e.length < 2) throw new Error("layerNorm requires at least 2 inputs.");
			}, Am = (e, t, r) => {
				let a = t.simplified, n = e[0].dims, i = e[1], s = !a && e[2], l = n, d = F.normalizeAxis(t.axis, n.length), c = F.sizeToDimension(n, d), h = F.sizeFromDimension(n, d), f = F.size(i.dims), w = s ? F.size(s.dims) : 0;
				if (f !== h || s && w !== h) throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${f} and bias size of ${w}`);
				let v = [];
				for (let B = 0; B < n.length; ++B) B < d ? v.push(n[B]) : v.push(1);
				let $ = Je(h), k = ["type", "type"], C = [
					{
						type: 12,
						data: c
					},
					{
						type: 1,
						data: h
					},
					{
						type: 12,
						data: Math.floor(h / $)
					},
					{
						type: 1,
						data: t.epsilon
					}
				];
				s && k.push("type");
				let I = r > 1, E = r > 2, A = (B) => {
					let N = nt(e[0].dataType), P = [G("x", e[0].dataType, e[0].dims, $), G("scale", i.dataType, i.dims, $)];
					return s && P.push(G("bias", s.dataType, s.dims, $)), P.push(oe("output", e[0].dataType, l, $)), I && P.push(oe("mean_data_output", 1, v)), E && P.push(oe("inv_std_output", 1, v)), `
  ${B.registerUniforms([
						{
							name: "norm_count",
							type: "u32"
						},
						{
							name: "norm_size",
							type: "f32"
						},
						{
							name: "norm_size_vectorized",
							type: "u32"
						},
						{
							name: "epsilon",
							type: "f32"
						}
					]).declareVariables(...P)}
  ${B.mainStart()}
    ${B.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${Ai("f32", $)};
    var mean_square_vector = ${Ai("f32", $)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Ur(N, $, "x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${ar("mean_vector", $)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${ar("mean_square_vector", $)} / uniforms.norm_size ${a ? "" : "- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Ur(N, $, "x[j + offset]")};
      let f32scale = ${Ur(N, $, "scale[j]")};
      output[j + offset] = ${P[0].type.value}((f32input ${a ? "" : "- mean"}) * inv_std_dev * f32scale
        ${s ? `+ ${Ur(N, $, "bias[j]")}` : ""}
      );
    }

    ${I ? "mean_data_output[global_idx] = mean" : ""};
    ${E ? "inv_std_output[global_idx] = inv_std_dev" : ""};
  }`;
				}, z = [{
					dims: l,
					dataType: e[0].dataType
				}];
				return I && z.push({
					dims: v,
					dataType: 1
				}), E && z.push({
					dims: v,
					dataType: 1
				}), {
					name: "LayerNormalization",
					shaderCache: {
						hint: `${$};${r};${a}`,
						inputDependencies: k
					},
					getRunData: () => ({
						outputs: z,
						dispatchGroup: { x: Math.ceil(c / 64) },
						programUniforms: C
					}),
					getShaderSource: A
				};
			}, Rm = (e, t) => {
				Cm(e.inputs), e.compute(Am(e.inputs, t, e.outputCount));
			};
		}), Mm = Z(() => {
			"use strict";
			we(), tn(), an(), Bm = (e) => {
				if (!e || e.length !== 2) throw new Error("MatMul requires 2 inputs.");
				if (e[0].dims[e[0].dims.length - 1] !== e[1].dims[e[1].dims.length - 2]) throw new Error("shared dimension does not match.");
			}, Dm = (e) => {
				Bm(e.inputs);
				let t = Nr.calcShape(e.inputs[0].dims, e.inputs[1].dims, !0);
				if (!t) throw new Error("Can't use matmul on the given tensors");
				let r = t[t.length - 1], a = e.inputs[0].dims[e.inputs[0].dims.length - 1];
				if (r < 8 && a < 8) e.compute(Fi(e.inputs, { activation: "" }, t));
				else {
					let n = t[t.length - 2], i = F.size(e.inputs[0].dims.slice(0, -2)), s = F.size(e.inputs[1].dims.slice(0, -2));
					if (i !== 1 && n === 1 && s === 1) {
						let l = e.inputs[0].reshape([
							1,
							i,
							a
						]), d = e.inputs[1].reshape([
							1,
							a,
							r
						]), c = [
							1,
							i,
							r
						], h = [l, d];
						e.compute(rn(h, { activation: "" }, t, c), { inputs: h });
					} else e.compute(rn(e.inputs, { activation: "" }, t));
				}
			};
		}), qm = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Nm = (e, t) => {
				if (e.length < 3 || e.length > 4) throw new Error("MatMulNBits requires 3 or 4 inputs");
				let r = e[0], a = r.dims.length;
				if (r.dims[a - 1] !== t.k) throw new Error("The last dim of input shape does not match the k value");
				let n = Math.floor((t.k + t.blockSize - 1) / t.blockSize), i = t.blockSize / 8 * t.bits, s = e[1];
				if (!F.areEqual(s.dims, [
					t.n,
					n,
					i
				])) throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");
				let l = e[2].dims;
				if (F.size(l) !== t.n * n) throw new Error("scales input size error.");
				if (e.length === 4) {
					let d = e[3].dims, c = t.n * (t.bits === 8 ? n : Math.floor((n * t.bits + 7) / 8));
					if (F.size(d) !== c) throw new Error("zeroPoints input size error.");
				}
			}, Pm = (e, t) => {
				let r = e[0].dims, a = r.length, n = r[a - 2], i = t.k, s = t.n, l = r.slice(0, a - 2), d = F.size(l), c = e[1].dims[2] / 4, h = e[0].dataType, f = Je(t.k), w = Je(c), v = Je(s), $ = l.concat([n, s]), k = n > 1 && s / v % 2 === 0 ? 2 : 1, C = F.size($) / v / k, I = 64, E = [], A = [
					d,
					n,
					i / f
				], z = F.convertShape(e[1].dims).slice();
				z.splice(-1, 1, c / w), E.push(...de(A)), E.push(...de(z)), E.push(...de(e[2].dims)), e.length === 4 && E.push(...de(F.convertShape(e[3].dims)));
				let B = [
					d,
					n,
					s / v
				];
				E.push(...de(B));
				let N = (P) => {
					let T = A.length, Y = G("a", e[0].dataType, T, f), X = G("b", 12, z.length, w), ue = G("scales", e[2].dataType, e[2].dims.length), ie = [
						Y,
						X,
						ue
					], K = e.length === 4 ? G("zero_points", 12, e[3].dims.length) : void 0;
					K && ie.push(K);
					let U = B.length, j = oe("output", e[0].dataType, U, v), ne = nt(e[0].dataType), pe = (() => {
						switch (f) {
							case 1: return `array<${ne}, 8>`;
							case 2: return `mat4x2<${ne}>`;
							case 4: return `mat2x4<${ne}>`;
							default: throw new Error(`${f}-component is not supported.`);
						}
					})(), he = Math.floor(32 / t.bits), ge = Math.floor(he / 8), V = () => {
						let ve = "";
						for (let ee = 0; ee < ge; ee++) {
							let lt = ee * t.bits * 4, ot = lt + t.bits;
							ve += `
          // reuse a data (pass ${ee})
            var input_offset${ee > 0 ? ee : ""} = ${ee === 0 ? Y.indicesToOffset(`${Y.type.indices}(batch, row, word_offset)`) : "input_offset"};
            var a_data${ee > 0 ? ee : ""}: ${pe};
            for (var j${ee > 0 ? ee : ""}: u32 = 0; j${ee > 0 ? ee : ""} < ${8 / f}; j${ee > 0 ? ee : ""}++) {
              a_data${ee > 0 ? ee : ""}[j${ee > 0 ? ee : ""}] = ${Y.getByOffset(`input_offset${ee > 0 ? ee : ""}`)};
              input_offset${ee > 0 ? ee : ""}++;
            }
          `;
							for (let Pe = 0; Pe < v * k; Pe++) ve += `
            b_value = ${w === 1 ? `b${Pe}_data` : `b${Pe}_data[i]`};
            ${t.bits === 2 ? `{
              let half_word = b_value >> ${ee * 16}u;
              let byte_lo = half_word & 0xFFu;
              let byte_hi = (half_word >> 8u) & 0xFFu;
              let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
              b_value_lower = unpack4xU8(spread_word & b_mask);
              b_value_upper = unpack4xU8((spread_word >> 2u) & b_mask);
            }` : `b_value_lower = unpack4xU8((b_value >> ${lt}u) & b_mask);
            b_value_upper = unpack4xU8((b_value >> ${ot}u) & b_mask);`}
            b_quantized_values = ${pe}(${Array.from({ length: 4 }, (tt, Ae) => `${ne}(b_value_lower[${Ae}]), ${ne}(b_value_upper[${Ae}])`).join(", ")});
            b_dequantized_values = ${f === 1 ? `${pe}(${Array.from({ length: 8 }, (tt, Ae) => `(b_quantized_values[${Ae}] - ${K ? `zero_point${Pe}` : "zero_point"}) * scale${Pe}`).join(", ")});` : `(b_quantized_values - ${pe}(${Array(8).fill(`${K ? `zero_point${Pe}` : "zero_point"}`).join(",")})) * scale${Pe};`};
            workgroup_shared[local_id.x * ${k} + ${Math.floor(Pe / v)}]${v > 1 ? `[${Pe % v}]` : ""} += ${Array.from({ length: 8 / f }, (tt, Ae) => `${f === 1 ? `a_data${ee > 0 ? ee : ""}[${Ae}] * b_dequantized_values[${Ae}]` : `dot(a_data${ee > 0 ? ee : ""}[${Ae}], b_dequantized_values[${Ae}])`}`).join(" + ")};
          `;
						}
						return ve;
					}, se = () => {
						let ve = `
            var col_index = col * ${v};
            ${K ? `
            let zero_point_values_per_byte: u32 = ${Math.floor(8 / t.bits)}u;
            let zero_point_bytes_per_col = (nBlocksPerCol + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;` : `
            // The default zero point is ${Math.pow(2, t.bits - 1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${ne}(${Math.pow(2, t.bits - 1).toFixed(1)});`}
            `;
						for (let ee = 0; ee < v * k; ee++) ve += `
            let scale${ee} = ${ue.getByOffset("col_index * nBlocksPerCol + block")};
            ${K ? `
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            zero_point_word = ${K.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${ee} = ${ne}((zero_point_word) & ${t.bits === 2 ? "0x3u" : "0xFu"});` : ""}
            col_index += 1;`;
						return ve;
					}, ke = () => {
						let ve = `col_index = col * ${v};`;
						for (let ee = 0; ee < v * k; ee++) ve += `
            let b${ee}_data = ${X.getByIndices(`${X.type.indices}(col_index, block, word)`)};
            col_index += 1;`;
						return ve += `
            var b_value: u32;
            let b_mask: u32 = ${t.bits === 2 ? "0x03030303u" : "0x0F0F0F0Fu"};
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${pe};
            var b_dequantized_values: ${pe};`, ve;
					};
					return `
        var<workgroup> workgroup_shared: array<${j.type.value}, ${k * I}>;
        ${P.declareVariables(...ie, j)}
        ${P.mainStart([
						I,
						1,
						1
					])}
          let output_indices = ${j.offsetToIndices(`(global_idx / ${I}) * ${k}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${I}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize / f};
            ${se()}
            for (var word: u32 = 0; word < ${c}; word += ${w}) {
              ${ke()}
              for (var i: u32 = 0; i < ${w}; i++) {
                ${V()}
                word_offset += ${he / f};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${k}) {
            var output_value: ${j.type.value} = ${j.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${I}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${k};
            }
            ${j.setByIndices(`${j.type.indices}(batch, row, col + local_id.x)`, "output_value")};
          }
        }`;
				};
				return {
					name: "MatMulNBits",
					shaderCache: {
						hint: `${t.blockSize};${t.bits};${f};${w};${v};${k};${I}`,
						inputDependencies: Array(e.length).fill("rank")
					},
					getRunData: () => ({
						outputs: [{
							dims: $,
							dataType: h
						}],
						dispatchGroup: { x: C },
						programUniforms: E
					}),
					getShaderSource: N
				};
			}, Um = (e, t) => {
				let r = e[0].dims, a = r.length, n = r[a - 2], i = t.k, s = t.n, l = r.slice(0, a - 2), d = F.size(l), c = e[1].dims[2] / 4, h = e[0].dataType, f = Je(t.k), w = Je(c), v = l.concat([n, s]), $ = 128, k = s % 8 === 0 ? 8 : s % 4 === 0 ? 4 : 1, C = $ / k, I = Math.floor(32 / t.bits), E = C * w * I, A = E / f, z = E / t.blockSize, B = F.size(v) / k, N = [], P = [
					d,
					n,
					i / f
				], T = F.convertShape(e[1].dims).slice();
				T.splice(-1, 1, c / w), N.push(...de(P)), N.push(...de(T)), N.push(...de(e[2].dims)), e.length === 4 && N.push(...de(F.convertShape(e[3].dims)));
				let Y = [
					d,
					n,
					s
				];
				N.push(...de(Y));
				let X = (ue) => {
					let ie = P.length, K = G("a", e[0].dataType, ie, f), U = G("b", 12, T.length, w), j = G("scales", e[2].dataType, e[2].dims.length), ne = [
						K,
						U,
						j
					], pe = e.length === 4 ? G("zero_points", 12, e[3].dims.length) : void 0;
					pe && ne.push(pe);
					let he = Y.length, ge = oe("output", e[0].dataType, he), V = nt(e[0].dataType), se = () => {
						switch (f) {
							case 1: return `
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;
							case 2: return `
          let a_data0 = vec4<${V}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${V}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;
							case 4: return `
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;
							default: throw new Error(`${f}-component is not supported.`);
						}
					};
					return `
        var<workgroup> sub_a: array<${K.type.value}, ${A}>;
        var<workgroup> inter_results: array<array<${ge.type.value}, ${C}>, ${k}>;
        ${ue.declareVariables(...ne, ge)}
        ${ue.mainStart([
						C,
						k,
						1
					])}
          let output_indices = ${ge.offsetToIndices(`workgroup_index * ${k}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${z} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${A};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${A}; a_offset += ${$})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${K.getByIndices(`${K.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${K.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${z} + local_id.x;
            ${pe ? `
            let zero_point_values_per_byte: u32 = ${Math.floor(8 / t.bits)}u;
            let zero_point_bytes_per_col = (n_blocks_per_col + zero_point_values_per_byte - 1u) / zero_point_values_per_byte;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block / zero_point_values_per_byte);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_sub_offset: u32 = block % zero_point_values_per_byte;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_sub_offset * ${t.bits}u);
            let zero_point_word = ${pe.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${V}((zero_point_word) & ${t.bits === 2 ? "0x3u" : "0xFu"});` : `
            // The default zero point is ${Math.pow(2, t.bits - 1)} for unsigned ${t.bits}-bit quantization.
            let zero_point = ${V}(${Math.pow(2, t.bits - 1).toFixed(1)});`}
            let scale = ${j.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${U.getByIndices(`${U.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize / f};
            for (var i: u32 = 0; i < ${w}; i++) {
              let b_value = ${w === 1 ? "b_data" : "b_data[i]"};
              ${(() => {
						let ke = Math.floor(I / 8), ve = "";
						for (let ee = 0; ee < ke; ee++) {
							let lt = ee * t.bits * 4, ot = lt + t.bits;
							ve += `
              ${se()}
              {${t.bits === 2 ? `
                let half_word = b_value >> ${ee * 16}u;
                let byte_lo = half_word & 0xFFu;
                let byte_hi = (half_word >> 8u) & 0xFFu;
                let spread_word = (byte_lo & 0xFu) | ((byte_lo >> 4u) << 8u) | ((byte_hi & 0xFu) << 16u) | ((byte_hi >> 4u) << 24u);
                let b_value_lower = unpack4xU8(spread_word & 0x03030303u);
                let b_value_upper = unpack4xU8((spread_word >> 2u) & 0x03030303u);` : `
                let b_value_lower = unpack4xU8((b_value >> ${lt}u) & 0x0F0F0F0Fu);
                let b_value_upper = unpack4xU8((b_value >> ${ot}u) & 0x0F0F0F0Fu);`}
                let b_quantized_values = mat2x4<${V}>(${Array.from({ length: 4 }, (Pe, tt) => `${V}(b_value_lower[${tt}]), ${V}(b_value_upper[${tt}])`).join(", ")});
                let b_dequantized_values = (b_quantized_values - mat2x4<${V}>(${Array(8).fill("zero_point").join(",")})) * scale;
                inter_results[local_id.y][local_id.x] += ${Array.from({ length: 2 }, (Pe, tt) => `${`dot(a_data${tt}, b_dequantized_values[${tt}])`}`).join(" + ")};
              }
              word_offset += ${8 / f};`;
						}
						return ve;
					})()}
            }
            workgroupBarrier();
          }

          if (local_idx < ${k}) {
            var output_value: ${ge.type.value} = ${ge.type.value}(0);
            for (var b = 0u; b < ${C}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${ge.setByIndices(`${ge.type.indices}(batch, row, col + local_idx)`, "output_value")}
            }
          }
        }`;
				};
				return {
					name: "BlockwiseMatMulNBits32",
					shaderCache: {
						hint: `${t.blockSize};${f};${w};${C};${k}`,
						inputDependencies: Array(e.length).fill("rank")
					},
					getRunData: () => ({
						outputs: [{
							dims: v,
							dataType: h
						}],
						dispatchGroup: { x: B },
						programUniforms: N
					}),
					getShaderSource: X
				};
			}, Lm = (e, t) => {
				Nm(e.inputs, t), t.blockSize === 32 && e.adapterInfo.isVendor("intel") && e.adapterInfo.isArchitecture("gen-12lp") ? e.compute(Um(e.inputs, t)) : e.compute(Pm(e.inputs, t));
			}, Fm = (e) => Ne(e);
		}), Qm = Z(() => {
			"use strict";
			fe(), we(), be(), Wm = (e) => {
				if (!e || e.length < 1) throw new Error("Too few inputs");
				if (e[0].dataType !== 1 && e[0].dataType !== 10) throw new Error("Input type must be float or float16.");
				if (e.length >= 2) {
					let t = e[0].dims.length * 2 === e[1].dims[0];
					if (e.length === 4 && (t = e[3].dims[0] * 2 === e[1].dims[0]), !t) throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].");
				}
			}, Gm = (e, t, r) => {
				let a = "";
				for (let n = t - 1; n >= 0; --n) a += `
            k = i32(${e.indicesGet("indices", n)}) - ${le("uniforms.pads", n, r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${le("uniforms.x_shape", n, t)})) {
              break;
            }
            offset += k * i32(${le("uniforms.x_strides", n, t)});
        `;
				return `
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${a}
            value = x[offset];
          }
      `;
			}, Vm = (e, t, r) => {
				let a = "";
				for (let n = t - 1; n >= 0; --n) a += `
                k = i32(${e.indicesGet("indices", n)}) - ${le("uniforms.pads", n, r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${le("uniforms.x_shape", n, t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${le("uniforms.x_shape", n, t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${le("uniforms.x_strides", n, t)});
            `;
				return `
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `;
			}, Hm = (e, t, r) => {
				let a = "";
				for (let n = t - 1; n >= 0; --n) a += `
                k = i32(${e.indicesGet("indices", n)}) - ${le("uniforms.pads", n, r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${le("uniforms.x_shape", n, t)})) {
                  k = i32(${le("uniforms.x_shape", n, t)}) - 1;
                }
                offset += k * i32(${le("uniforms.x_strides", n, t)});
            `;
				return `
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `;
			}, jm = (e, t, r) => {
				let a = "";
				for (let n = t - 1; n >= 0; --n) a += `
                k = i32(${e.indicesGet("indices", n)}) - ${le("uniforms.pads", n, r)};
                if (k < 0)  {
                  k += i32(${le("uniforms.x_shape", n, t)}]);
                }
                if (k >= i32(${le("uniforms.x_shape", n, t)})) {
                  k -= i32(${le("uniforms.x_shape", n, t)});
                }
                offset += k * i32(${le("uniforms.x_strides", n, t)});
            `;
				return `
              var offset = 0;
              var k = 0;
              ${a}
              value = x[offset];
          `;
			}, Km = (e, t, r) => {
				switch (r.mode) {
					case 0: return Gm(e, t, r.pads.length);
					case 1: return Vm(e, t, r.pads.length);
					case 2: return Hm(e, t, r.pads.length);
					case 3: return jm(e, t, r.pads.length);
					default: throw new Error("Invalid mode");
				}
			}, Xm = (e, t) => {
				let r = F.padShape(e[0].dims.slice(), t.pads), a = e[0].dims, n = [{
					type: 12,
					data: F.size(r)
				}, {
					type: 6,
					data: t.pads
				}], i = e.length >= 3 && e[2].data;
				t.mode === 0 && n.push({
					type: i ? e[2].dataType : 1,
					data: t.value
				}), n.push(...de(e[0].dims, r));
				let s = ["rank"], l = (d) => {
					let c = oe("output", e[0].dataType, r.length), h = G("x", e[0].dataType, a.length), f = h.type.value, w = Km(c, a.length, t), v = [{
						name: "output_size",
						type: "u32"
					}, {
						name: "pads",
						type: "i32",
						length: t.pads.length
					}];
					return t.mode === 0 && v.push({
						name: "constant_value",
						type: i ? f : "f32"
					}), `
            ${d.registerUniforms(v).declareVariables(h, c)}
            ${d.mainStart()}
            ${d.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${c.offsetToIndices("global_idx")};

            var value = ${f}(0);
            ${w}
            output[global_idx] = value;
        }`;
				};
				return {
					name: "Pad",
					shaderCache: {
						hint: `${t.mode}${i}`,
						inputDependencies: s
					},
					getRunData: () => ({
						outputs: [{
							dims: r,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(F.size(r) / 64) },
						programUniforms: n
					}),
					getShaderSource: l
				};
			}, Zm = (e, t) => {
				if (e.length > 1) {
					let r = e[1].getBigInt64Array(), a = e.length >= 3 && e[2].data ? e[2].dataType === 10 ? e[2].getUint16Array()[0] : e[2].getFloat32Array()[0] : 0, n = e[0].dims.length, i = new Int32Array(2 * n).fill(0);
					if (e.length >= 4) {
						let l = e[3].getBigInt64Array();
						for (let d = 0; d < l.length; d++) i[Number(l[d])] = Number(r[d]), i[Number(l[d]) + n] = Number(r[d + l.length]);
					} else r.forEach((l, d) => i[Number(d)] = Number(l));
					let s = [];
					return i.forEach((l) => s.push(l)), {
						mode: t.mode,
						value: a,
						pads: s
					};
				} else return t;
			}, Ym = (e, t) => {
				Wm(e.inputs);
				let r = Zm(e.inputs, t);
				e.compute(Xm(e.inputs, r), { inputs: [0] });
			};
		}), df = Z(() => {
			"use strict";
			ht(), fe(), we(), be(), la = (e) => {
				if (He.webgpu.validateInputContent && (!e || e.length !== 1)) throw new Error("Pool ops requires 1 input.");
			}, us = (e, t, r) => {
				let a = t.format === "NHWC", n = e.dims.slice();
				a && n.splice(1, 0, n.pop());
				let i = Object.hasOwnProperty.call(t, "dilations"), s = t.kernelShape.slice(), l = t.strides.slice(), d = i ? t.dilations.slice() : [], c = t.pads.slice();
				Wa.adjustPoolAttributes(r, n, s, l, d, c);
				let h = Wa.computePoolOutputShape(r, n, l, d, s, c, t.autoPad), f = Object.assign({}, t);
				i ? Object.assign(f, {
					kernelShape: s,
					strides: l,
					pads: c,
					dilations: d,
					cacheKey: t.cacheKey
				}) : Object.assign(f, {
					kernelShape: s,
					strides: l,
					pads: c,
					cacheKey: t.cacheKey
				});
				let w = h.slice();
				return w.push(w.splice(1, 1)[0]), [f, a ? w : h];
			}, ls = (e, t) => {
				let r = t.format === "NHWC", a = F.size(e), n = F.size(t.kernelShape), i = [{
					type: 12,
					data: a
				}, {
					type: 12,
					data: n
				}], s = [{
					name: "outputSize",
					type: "u32"
				}, {
					name: "kernelSize",
					type: "u32"
				}];
				if (t.kernelShape.length <= 2) {
					let l = t.kernelShape[t.kernelShape.length - 1], d = t.strides[t.strides.length - 1], c = t.pads[t.pads.length / 2 - 1], h = t.pads[t.pads.length - 1], f = !!(c + h);
					i.push({
						type: 12,
						data: l
					}, {
						type: 12,
						data: d
					}, {
						type: 12,
						data: c
					}, {
						type: 12,
						data: h
					}), s.push({
						name: "kw",
						type: "u32"
					}, {
						name: "sw",
						type: "u32"
					}, {
						name: "pwStart",
						type: "u32"
					}, {
						name: "pwEnd",
						type: "u32"
					});
					let w = !1;
					if (t.kernelShape.length === 2) {
						let v = t.kernelShape[t.kernelShape.length - 2], $ = t.strides[t.strides.length - 2], k = t.pads[t.pads.length / 2 - 2], C = t.pads[t.pads.length - 2];
						w = !!(k + C), i.push({
							type: 12,
							data: v
						}, {
							type: 12,
							data: $
						}, {
							type: 12,
							data: k
						}, {
							type: 12,
							data: C
						}), s.push({
							name: "kh",
							type: "u32"
						}, {
							name: "sh",
							type: "u32"
						}, {
							name: "phStart",
							type: "u32"
						}, {
							name: "phEnd",
							type: "u32"
						});
					}
					return [
						i,
						s,
						!0,
						f,
						w
					];
				} else {
					if (r) throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");
					let l = F.computeStrides(t.kernelShape);
					return i.push({
						type: 12,
						data: l
					}, {
						type: 12,
						data: t.pads
					}, {
						type: 12,
						data: t.strides
					}), s.push({
						name: "kernelStrides",
						type: "u32",
						length: l.length
					}, {
						name: "pads",
						type: "u32",
						length: t.pads.length
					}, {
						name: "strides",
						type: "u32",
						length: t.strides.length
					}), [
						i,
						s,
						!!t.pads.reduce((d, c) => d + c),
						!1,
						!1
					];
				}
			}, ds = (e, t, r, a, n, i, s, l, d, c, h, f) => {
				let w = n.format === "NHWC", v = t.type.value, $ = oe("output", t.type.tensor, a);
				if (n.kernelShape.length <= 2) {
					let k = "", C = "", I = "", E = r - (w ? 2 : 1);
					if (h ? k = `
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${E}] = indices[${E}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${E}] < 0 || xIndices[${E}]
                      >= uniforms.x_shape[${E}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${i}
                }` : k = `
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${E}] = indices[${E}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${i}
                }`, n.kernelShape.length === 2) {
						let A = r - (w ? 3 : 2);
						f ? C = `
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${A}] = indices[${A}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${A}] < 0 || xIndices[${A}] >= uniforms.x_shape[${A}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              ` : C = `
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${A}] = indices[${A}] * uniforms.sh - uniforms.phStart + j;
                `, I = `
              }
            `;
					}
					return `
            ${e.registerUniforms(d).declareVariables(t, $)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${$.offsetToIndices("global_idx")};
              var xIndices = ${$.offsetToIndices("global_idx")};

              var value = ${v}(${l});
              var pad = 0;
              ${C}
              ${k}
              ${I}
              ${s}

              output[global_idx] = value;
            }`;
				} else {
					if (w) throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");
					let k = n.kernelShape.length, C = n.pads.length, I = "";
					return c ? I = `
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${i}
              }` : I = `
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${i}
            `, `
            ${e.registerUniforms(d).declareVariables(t, $)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${$.offsetToIndices("global_idx")};
              var xIndices = ${$.offsetToIndices("global_idx")};

              var offsets: array<u32, ${k}>;

              var value = ${v}(${l});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${k - 1}u; j++) {
                  offsets[j] = offset / ${le("uniforms.kernelStrides", "j", k)};
                  offset -= offsets[j] * ${le("uniforms.kernelStrides", "j", k)};
                }
                offsets[${k - 1}] = offset;

                isPad = false;
                for (var j = ${r - k}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${le("uniforms.strides", `j - ${r - k}u`, k)}
                    + offsets[j - ${r - k}u] - ${le("uniforms.pads", "j - 2u", C)};
                  ${I}
              }
              ${s}

              output[global_idx] = value;
            }`;
				}
			}, ps = (e) => `${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`, Jm = (e) => `${ps(e)};${e.countIncludePad}`, ef = (e) => `${ps(e)};${e.storageOrder};${e.dilations}`, cs = (e) => ({
				format: e.format,
				autoPad: [
					"NOTSET",
					"VALID",
					"SAME_UPPER",
					"SAME_LOWER"
				][e.auto_pad],
				ceilMode: e.ceil_mode,
				kernelShape: e.kernel_shape,
				strides: e.strides,
				pads: e.pads
			}), ms = (e, t, r, a) => {
				let [n, i] = us(t, a, r), s = G("x", t.dataType, t.dims.length), l = s.type.value, d = "value += x_val;", c = "";
				n.countIncludePad ? c += `value /= ${l}(uniforms.kernelSize);` : c += `value /= ${l}(i32(uniforms.kernelSize) - pad);`;
				let [h, f, w, v, $] = ls(i, n);
				return h.push(...de(t.dims, i)), {
					name: e,
					shaderCache: {
						hint: `${a.cacheKey};${w};${v};${$}`,
						inputDependencies: ["rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: i,
							dataType: t.dataType
						}],
						dispatchGroup: { x: Math.ceil(F.size(i) / 64) },
						programUniforms: h
					}),
					getShaderSource: (k) => ds(k, s, t.dims.length, i.length, n, d, c, 0, f, w, v, $)
				};
			}, tf = (e) => {
				let t = e.count_include_pad !== 0, r = cs(e);
				if (r.ceilMode !== 0) throw new Error("using ceil() in shape computation is not yet supported for AveragePool");
				let a = {
					countIncludePad: t,
					...r,
					cacheKey: ""
				};
				return {
					...a,
					cacheKey: Jm(a)
				};
			}, rf = (e, t) => {
				la(e.inputs), e.compute(ms("AveragePool", e.inputs[0], !1, t));
			}, fs = {
				autoPad: "",
				ceilMode: 0,
				countIncludePad: !1,
				kernelShape: [],
				strides: [],
				pads: [],
				storageOrder: 0,
				dilations: []
			}, af = (e) => {
				let t = e.format;
				return {
					format: t,
					...fs,
					cacheKey: t
				};
			}, nf = (e, t) => {
				la(e.inputs), e.compute(ms("GlobalAveragePool", e.inputs[0], !0, t));
			}, hs = (e, t, r, a) => {
				let [n, i] = us(t, a, r), s = `
      value = max(x_val, value);
    `, l = "", d = G("x", t.dataType, t.dims.length), c = ["rank"], [h, f, w, v, $] = ls(i, n);
				return h.push(...de(t.dims, i)), {
					name: e,
					shaderCache: {
						hint: `${a.cacheKey};${w};${v};${$}`,
						inputDependencies: c
					},
					getRunData: () => ({
						outputs: [{
							dims: i,
							dataType: t.dataType
						}],
						dispatchGroup: { x: Math.ceil(F.size(i) / 64) },
						programUniforms: h
					}),
					getShaderSource: (k) => ds(k, d, t.dims.length, i.length, n, s, l, t.dataType === 10 ? -65504 : -1e5, f, w, v, $)
				};
			}, sf = (e, t) => {
				la(e.inputs), e.compute(hs("MaxPool", e.inputs[0], !1, t));
			}, of = (e) => {
				let t = e.storage_order, r = e.dilations, a = cs(e);
				if (t !== 0) throw new Error("column major storage order is not yet supported for MaxPool");
				if (a.ceilMode !== 0) throw new Error("using ceil() in shape computation is not yet supported for MaxPool");
				let n = {
					storageOrder: t,
					dilations: r,
					...a,
					cacheKey: ""
				};
				return {
					...n,
					cacheKey: ef(n)
				};
			}, uf = (e) => {
				let t = e.format;
				return {
					format: t,
					...fs,
					cacheKey: t
				};
			}, lf = (e, t) => {
				la(e.inputs), e.compute(hs("GlobalMaxPool", e.inputs[0], !0, t));
			};
		}), hf = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), pf = (e, t) => {
				if (e.length < 2 || e.length > 3) throw new Error("DequantizeLinear requires 2 or 3 inputs.");
				if (e.length === 3 && e[1].dims === e[2].dims) throw new Error("x-scale and x-zero-point must have the same shape.");
				if (e.length === 3 && e[0].dataType !== e[2].dataType) throw new Error("x and x-zero-point must have the same data type.");
				if (e[1].dims.length !== 0 && e[1].dims.length !== 1 && e[1].dims.length !== e[0].dims.length) throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");
				if (e.length > 2) {
					if (e[0].dataType !== e[2].dataType) throw new Error("x and x-zero-point must have the same data type.");
					if (e[1].dims.length !== e[2].dims.length) throw new Error("scale and zero-point inputs must have the same rank.");
					if (!e[1].dims.map((r, a) => r === e[2].dims[a]).reduce((r, a) => r && a, !0)) throw new Error("scale and zero-point inputs must have the same shape.");
				}
				if (t.blockSize > 0) {
					if (e[1].dims.length === 0 || e[1].dims.length === 1 && e[1].dims[0] === 1) throw new Error("blockSize must be set only for block quantization.");
					if (!e[1].dims.map((n, i) => i === t.axis || n === e[0].dims[i]).reduce((n, i) => n && i, !0)) throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");
					if (e[1].dims.length !== e[0].dims.length) throw new Error("For block qunatization the scale input rank must be the same as the x rank.");
					let r = e[0].dims[t.axis], a = e[1].dims[t.axis];
					if (t.blockSize < Math.ceil(r / a) || t.blockSize > Math.ceil(r / (a - 1) - 1)) throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].");
				}
			}, cf = (e, t) => {
				let r = F.normalizeAxis(t.axis, e[0].dims.length), a = e[0].dataType, n = a === 3, i = e[0].dims, s = e[1].dataType, l = F.size(i), d = a === 3 || a === 2, c = d ? [Math.ceil(F.size(e[0].dims) / 4)] : e[0].dims, h = e[1].dims, f = e.length > 2 ? e[2] : void 0, w = f ? d ? [Math.ceil(F.size(f.dims) / 4)] : f.dims : void 0, v = h.length === 0 || h.length === 1 && h[0] === 1, $ = v === !1 && h.length === 1, k = Je(l), C = v && (!d || k === 4), I = C ? k : 1, E = C && !d ? k : 1, A = G("input", d ? 12 : a, c.length, E), z = G("scale", s, h.length), B = f ? G("zero_point", d ? 12 : a, w.length) : void 0, N = oe("output", s, i.length, I), P = [A, z];
				B && P.push(B);
				let T = [c, h];
				f && T.push(w);
				let Y = [
					{
						type: 12,
						data: l / I
					},
					{
						type: 12,
						data: r
					},
					{
						type: 12,
						data: t.blockSize
					},
					...de(...T, i)
				], X = (ue) => `
      ${ue.registerUniforms([
					{
						name: "output_size",
						type: "u32"
					},
					{
						name: "axis",
						type: "u32"
					},
					{
						name: "block_size",
						type: "u32"
					}
				]).declareVariables(...P, N)}
      ${ue.mainStart()}
          ${ue.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${N.offsetToIndices("global_idx")};

          // Set input x
          ${d ? `
            let input = ${A.getByOffset("global_idx / 4")};
            let x_vec = ${n ? "unpack4xI8(input)" : "unpack4xU8(input)"};
            let x_value = ${I === 1 ? "x_vec[global_idx % 4]" : "x_vec"};` : `let x_value = ${A.getByOffset("global_idx")};`};

          // Set scale input
          ${v ? `let scale_value= ${z.getByOffset("0")}` : $ ? `
            let scale_index = ${N.indicesGet("output_indices", "uniforms.axis")};
            let scale_value= ${z.getByOffset("scale_index")};` : `
            var scale_indices: ${z.type.indices} = output_indices;
            let index = ${z.indicesGet("scale_indices", "uniforms.axis")} / uniforms.block_size;
            ${z.indicesSet("scale_indices", "uniforms.axis", "index")};
            let scale_value= ${z.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${B ? v ? d ? `
                let zero_point_input = ${B.getByOffset("0")};
                let zero_point_vec =  ${n ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]` : `let zero_point_value = ${B.getByOffset("0")}` : $ ? d ? `
                let zero_point_index = ${N.indicesGet("output_indices", "uniforms.axis")};
                let zero_point_input = ${B.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${n ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]` : `
                let zero_point_index = ${N.indicesGet("output_indices", "uniforms.axis")};
                let zero_point_value = ${B.getByOffset("zero_point_index")};` : d ? `
                let zero_point_offset = ${z.indicesToOffset("scale_indices")};
                let zero_point_input = ${B.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${n ? "unpack4xI8(zero_point_input)" : "unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];` : `let zero_point_value = ${B.getByIndices("scale_indices")};` : `let zero_point_value = ${d ? n ? "i32" : "u32" : A.type.value}(0);`};
      // Compute and write output
      ${N.setByOffset("global_idx", `${N.type.value}(x_value - zero_point_value) * scale_value`)};
      }`;
				return {
					name: "DequantizeLinear",
					shaderCache: {
						hint: t.cacheKey,
						inputDependencies: B ? [
							"rank",
							"rank",
							"rank"
						] : ["rank", "rank"]
					},
					getShaderSource: X,
					getRunData: () => ({
						outputs: [{
							dims: i,
							dataType: s
						}],
						dispatchGroup: {
							x: Math.ceil(l / I / 64),
							y: 1,
							z: 1
						},
						programUniforms: Y
					})
				};
			}, mf = (e, t) => {
				pf(e.inputs, t), e.compute(cf(e.inputs, t));
			}, ff = (e) => Ne({
				axis: e.axis,
				blockSize: e.blockSize
			});
		}), wf = Z(() => {
			"use strict";
			ht(), fe(), be(), gf = (e, t, r) => {
				if (e === t || e < t && r < 0 || e > t && r > 0) throw new Error("Range these inputs' contents are invalid.");
			}, _f = (e, t, r, a) => {
				let n = Math.abs(Math.ceil((t - e) / r)), i = [n], s = n, l = [
					{
						type: 12,
						data: s
					},
					{
						type: a,
						data: e
					},
					{
						type: a,
						data: r
					},
					...de(i)
				], d = (c) => {
					let h = oe("output", a, i.length), f = h.type.value, w = [
						{
							name: "outputSize",
							type: "u32"
						},
						{
							name: "start",
							type: f
						},
						{
							name: "delta",
							type: f
						}
					];
					return `
        ${c.registerUniforms(w).declareVariables(h)}
        ${c.mainStart()}
        ${c.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${f}(global_idx) * uniforms.delta;
      }`;
				};
				return {
					name: "Range",
					shaderCache: { hint: `${a}` },
					getShaderSource: d,
					getRunData: () => ({
						outputs: [{
							dims: i,
							dataType: a
						}],
						dispatchGroup: { x: Math.ceil(s / 64) },
						programUniforms: l
					})
				};
			}, yf = (e) => {
				let t = 0, r = 0, a = 0;
				e.inputs[0].dataType === 6 ? (t = e.inputs[0].getInt32Array()[0], r = e.inputs[1].getInt32Array()[0], a = e.inputs[2].getInt32Array()[0]) : e.inputs[0].dataType === 1 && (t = e.inputs[0].getFloat32Array()[0], r = e.inputs[1].getFloat32Array()[0], a = e.inputs[2].getFloat32Array()[0]), He.webgpu.validateInputContent && gf(t, r, a), e.compute(_f(t, r, a, e.inputs[0].dataType), { inputs: [] });
			};
		}), kf = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), bf = (e, t, r, a) => {
				if (e !== "none" && a !== "i32" && a !== "u32" && a !== "f32") throw new Error(`Input ${a} is not supported with reduction ${e}.`);
				let n = `{
                var oldValue = 0;
                loop {
                  let newValueF32 =`, i = `;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;
				switch (e) {
					case "none": return `${t}=${r};`;
					case "add": return a === "i32" || a === "u32" ? `atomicAdd(&${t}, bitcast<${a}>(${r}));` : `
              ${n}bitcast<${a}>(oldValue) + (${r})${i}`;
					case "max": return a === "i32" || a === "u32" ? `atomicMax(&${t}, bitcast<${a}>(${r}));` : `
                ${n}max(bitcast<f32>(oldValue), (${r}))${i}`;
					case "min": return a === "i32" || a === "u32" ? `atomicMin(&${t}, bitcast<${a}>(${r}));` : `${n}min(bitcast<${a}>(oldValue), (${r}))${i}`;
					case "mul": return `${n}(bitcast<${a}>(oldValue) * (${r}))${i}`;
					default: throw new Error(`Reduction ${e} is not supported.`);
				}
			}, vf = (e, t) => {
				let r = e[0].dims, a = e[1].dims, n = r, i = 1, s = Math.ceil(F.sizeToDimension(a, a.length - 1) / i), l = a[a.length - 1], d = F.sizeFromDimension(r, l), c = [
					{
						type: 12,
						data: s
					},
					{
						type: 12,
						data: l
					},
					{
						type: 12,
						data: d
					},
					...de(e[1].dims, e[2].dims, n)
				], h = (f) => {
					let w = G("indices", e[1].dataType, e[1].dims.length), v = G("updates", e[2].dataType, e[2].dims.length, i), $ = t.reduction !== "none" && t.reduction !== "" ? Yu("output", e[0].dataType, n.length) : oe("output", e[0].dataType, n.length, i);
					return `
      ${f.registerUniform("output_size", "u32").registerUniform("last_index_dimension", "u32").registerUniform("num_updates_elements", "u32").declareVariables(w, v, $)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length === 1 ? `
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;` : `
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${bf(t.reduction, "output[data_offset + i]", "value", $.type.value)}
  }

      }`;
				};
				return {
					name: "ScatterND",
					shaderCache: {
						hint: `${t.cacheKey}_${t.reduction}`,
						inputDependencies: ["rank", "rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: n,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(s / 64) },
						programUniforms: c
					}),
					getShaderSource: h
				};
			}, $f = (e) => Ne({ reduction: e.reduction }), xf = (e, t) => {
				e.compute(vf(e.inputs, t), {
					inputs: [e.inputs[1], e.inputs[2]],
					outputs: []
				});
			};
		}), Wf = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Sf = (e, t) => {
				if (e.every((r) => r > 0 || (() => {
					throw new Error("Resize requires scales input values to be positive");
				})), e.length > 0) {
					if (t.mode === "linear") {
						if (!(e.length === 2 || e.length === 3 || e.length === 4 && e[0] === 1 && e[1] === 1 || e.length === 4 && e[0] === 1 && e[3] === 1 || e.length === 5 && e[0] === 1 && e[1] === 1)) throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`);
					} else if (t.mode === "cubic" && !(e.length === 2 || e.length === 4 && e[0] === 1 && e[1] === 1 || e.length === 4 && e[0] === 1 && e[3] === 1)) throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode");
				}
			}, Ef = (e, t, r) => {
				t.every((n) => n >= 0 && n < r || (() => {
					throw new Error("Resize requires axes input values to be positive and less than rank");
				}));
				let a = new Array(r).fill(1);
				return t.forEach((n, i) => a[n] = e[i]), a;
			}, Tf = (e, t, r, a, n, i) => {
				let [s, l, d] = r > 10 ? [
					1,
					2,
					3
				] : [
					-1,
					e.length > 1 ? 1 : -1,
					-1
				], c = e[0].dims.length;
				if (s > 0 && e.length > s && e[s].dims.length > 0) e[s].getFloat32Array().forEach((h) => i.push(h));
				else if (t.coordinateTransformMode === "tf_crop_and_resize") throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");
				if (l > 0 && e.length > l && e[l].dims.length === 1 && e[l].dims[0] > 0) {
					if (e[l].getFloat32Array().forEach((h) => a.push(h)), a.length !== 0 && a.length !== c && r >= 18 && a.length !== t.axes.length) throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");
					Sf(a, t), t.axes.length > 0 && Ef(a, t.axes, c).forEach((h, f) => a[f] = h);
				}
				if (d > 0 && e.length > d && e[d].dims.length === 1 && e[d].dims[0] > 0 && (e[d].getBigInt64Array().forEach((h) => n.push(Number(h))), n.length !== 0 && n.length !== c && r >= 18 && n.length !== t.axes.length)) throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");
				if (t.axes.length > 0) {
					if (a.length !== 0 && a.length !== t.axes.length) throw new Error("Resize requires \"scales\" input size to be of axes rank when axes attributes is specified");
					if (n.length !== 0 && n.length !== t.axes.length) throw new Error("Resize requires \"sizes\" input size to be of rank axes rank when axes attributes is specified");
				}
				if (typeof a < "u" && typeof n < "u" && a.length > 0 && n.length > c) throw new Error("Resize requires only of scales or sizes to be specified");
			}, gs = (e, t, r, a) => `
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${a}(big / (${r}));
  let fract = ${a}(big % (${r})) / ${a}(${r});
  return whole + fract;
`, If = (e, t) => `fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { ` + (() => {
				switch (e) {
					case "asymmetric": return `
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${gs("xResized", "lengthOriginal", "lengthResized", t)}
          }
        `;
					case "pytorch_half_pixel": return `if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;
					case "tf_half_pixel_for_nn": return `return (${t}(xResized) + 0.5) / ${t}(xScale);`;
					case "align_corners": return `if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${gs("xResized", "lengthOriginal - 1", "lengthResized - 1", t)}
                  }`;
					case "tf_crop_and_resize": return `if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;
					case "half_pixel_symmetric": return `const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;
					case "half_pixel": return `return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;
					default: throw new Error(`Coordinate transform mode ${e} is not supported`);
				}
			})() + "}", zf = (e, t, r) => `fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {` + (() => {
				switch (e) {
					case "round_prefer_ceil": return "if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";
					case "floor": return "return floor(xOriginal);";
					case "ceil": return "return ceil(xOriginal);";
					case "round_prefer_floor": return "if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";
					default:
						if (t < 11) return "if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";
						throw new Error(`Nearest mode ${e} is not supported`);
				}
			})() + "}", Cf = (e, t, r) => {
				let a = new Array(r).fill(0).concat(new Array(r).fill(1)), n = e.length === 0 ? a : e.slice();
				return t.length > 0 ? (t.forEach((i, s) => {
					a[i] = n[s], a[s + r] = n[t.length + s];
				}), a) : n;
			}, Af = (e, t, r, a) => {
				let n = [];
				if (r.length > 0) if (a.length > 0) {
					if (e.forEach((i) => n.push(i)), Math.max(...a) > e.length) throw new Error("axes is out of bound");
					a.forEach((i, s) => n[i] = r[s]);
				} else r.forEach((i) => n.push(i));
				else {
					if (t.length === 0) throw new Error("Resize requires either scales or sizes.");
					n = e.map((i, s) => Math.round(i * t[s]));
				}
				return n;
			}, Rf = (e, t, r) => {
				let a = (() => {
					switch (r.keepAspectRatioPolicy) {
						case "not_larger": return r.axes.length > 0 ? Math.min(...r.axes.map((i) => t[i]), Number.MAX_VALUE) : Math.min(...t, Number.MAX_VALUE);
						case "not_smaller": return r.axes.length > 0 ? Math.max(...r.axes.map((i) => t[i]), Number.MIN_VALUE) : Math.max(...t, Number.MIN_VALUE);
						default: throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`);
					}
				})();
				t.fill(1, 0, t.length);
				let n = e.slice();
				return r.axes.length > 0 ? (r.axes.forEach((i) => t[i] = a), r.axes.forEach((i) => n[i] = Math.round(e[i] * t[i]))) : (t.fill(a, 0, t.length), n.forEach((i, s) => n[s] = Math.round(i * t[s]))), n;
			}, Of = (e, t, r, a, n) => `
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices", "i")};
        var scale = ${le("uniforms.scales", "i", a)};
        var roi_low = ${le("uniforms.roi", "i", n)};
        var roi_hi = ${le("uniforms.roi", `i + ${t.length}`, n)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${le("uniforms.input_shape", "i", t.length)};
          var output_shape_i = ${le("uniforms.output_shape", "i", r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`, Bf = (e, t, r, a, n, i, s) => `
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${a.length}; i++) {
        var output_index = ${t.indicesGet("output_indices", "i")};
        var input_index: u32;
        var scale = ${le("uniforms.scales", "i", n)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${le("uniforms.roi", "i", i)};
          var roi_hi = ${le("uniforms.roi", `i + ${r.length}`, i)};
          var input_shape_i = ${le("uniforms.input_shape", "i", r.length)};
          var output_shape_i = ${le("uniforms.output_shape", "i", a.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices", "i", "input_index")}
      }
      return input_indices;
    }`, Df = (e, t) => `
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices", "i")};
        if (input_index < 0 || input_index >= ${le("uniforms.input_shape", "i", t.length)}) {
          return false;
        }
      }
      return true;
    }`, _s = (e, t, r, a) => e.rank > a ? `
    ${e.indicesSet("input_indices", t, "channel")};
    ${e.indicesSet("input_indices", r, "batch")};
` : "", Mf = (e, t, r, a, n) => {
				let [i, s, l, d] = r.length === 2 ? [
					-1,
					0,
					1,
					-1
				] : [
					0,
					2,
					3,
					1
				], c = e.type.value;
				return `
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${c} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices", s, `max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices", l, `max(0, min(col, ${r[l]} - 1))`)};
      ${_s(e, d, i, 2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${c} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${c} = originalIndices[${s}];
      var col:${c} = originalIndices[${l}];
      ${a ? `if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[l]} - 1)) {
        return ${n};
      }` : ""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[l]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length > 2 ? `u32(originalIndices[${d}])` : "0"};
      var batch: u32 =  ${r.length > 2 ? `u32(originalIndices[${i}])` : "0"};
      var x11: ${c} = getInputValue(batch, channel, row1, col1);
      var x12: ${c} = getInputValue(batch, channel, row1, col2);
      var x21: ${c} = getInputValue(batch, channel, row2, col1);
      var x22: ${c} = getInputValue(batch, channel, row2, col2);
      var dx1: ${c} = abs(row - ${c}(row1));
      var dx2: ${c} = abs(${c}(row2) - row);
      var dy1: ${c} = abs(col - ${c}(col1));
      var dy2: ${c} = abs(${c}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`;
			}, Nf = (e, t, r, a, n, i, s, l, d, c) => {
				let [h, f] = r.length === 2 ? [0, 1] : [2, 3], w = e.type.value, v = ($) => {
					let k = $ === h ? "row" : "col";
					return `
      fn ${k}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${w} {
        var output_index = ${t.indicesGet("output_indices", $)};
        var originalIdx: ${w} = getOriginalCoordinateFromResizedCoordinate(output_index, ${n[$]},
        ${a[$]}, ${r[$]}, ${i[$]}, ${i[$]} + ${r.length});
        var fractOriginalIdx: ${w} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${l} && (originalIdx < 0 || originalIdx > (${r[$]} - 1))) {
          return ${d};
        }
        var data: array<${w}, 4> = array<${w}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${k}: ${w} = originalIdx + ${w}(i);
          if (${k} < 0 || ${k} >= ${r[$]}) {
            ${c ? `coefs[i + 1] = 0.0;
                        continue;` : l ? `return ${d};` : `${k} = max(0, min(${k}, ${r[$]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy", $, `u32(${k})`)};
          data[i + 1] = ${$ === h ? e.getByIndices("input_indices_copy") : "rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`;
				};
				return `
    ${v(h)};
    ${v(f)};
  fn getCubicInterpolationCoefs(s: ${w}) -> array<${w}, 4> {
    var absS = abs(s);
    var coeffs: array<${w}, 4> = array<${w}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${w} = 1.0 - absS;
    var twoMinusAbsS: ${w} = 2.0 - absS;
    var onePlusAbsS: ${w} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${w}, 4>, coefs: array<${w}, 4>) -> ${w} {
    var coefsSum: ${w} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${w} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `;
			}, Pf = (e, t, r, a, n) => {
				let [i, s, l, d, c] = r.length === 3 ? [
					-1,
					0,
					1,
					2,
					-1
				] : [
					0,
					2,
					3,
					4,
					1
				], h = e.type.value;
				return `
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices", s, `max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices", l, `max(0, min(height, ${r[l]} - 1))`)};
      ${e.indicesSet("input_indices", d, `max(0, min(width, ${r[d]} - 1))`)};
      ${_s(e, c, i, 3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${l}];
      var width:${h} = originalIndices[${d}];
      ${a ? `if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[l]} - 1) || width < 0 || (width > ${r[d]} - 1)) {
      return ${n};
        }` : ""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[l]} - 1));
      width = max(0, min(width, ${r[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length > 3 ? `u32(originalIndices[${c}])` : "0"};
      var batch: u32 =  ${r.length > 3 ? `u32(originalIndices[${i}])` : "0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`;
			}, Uf = (e, t, r, a, n, i) => {
				let s = e.dims, l = Cf(i, t.axes, s.length), d = Af(s, a, n, t.axes), c = a.slice();
				a.length === 0 && (c = s.map((E, A) => E === 0 ? 1 : d[A] / E), t.keepAspectRatioPolicy !== "stretch" && (d = Rf(s, c, t)));
				let h = oe("output", e.dataType, d.length), f = G("input", e.dataType, s.length), w = F.size(d), v = s.length === d.length && s.every((E, A) => E === d[A]), $ = t.coordinateTransformMode === "tf_crop_and_resize", k = t.extrapolationValue, C = f.type.value, I = (E) => `
      ${v ? "" : `
      ${If(t.coordinateTransformMode, C)};
      ${(() => {
					switch (t.mode) {
						case "nearest": return `
              ${Df(f, s)};
              ${zf(t.nearestMode, r, C)};
              ${Bf(f, h, s, d, c.length, l.length, $)};
              `;
						case "linear": return `
              ${Of(h, s, d, c.length, l.length)};
              ${(() => {
							if (s.length === 2 || s.length === 4) return `${Mf(f, h, s, $, k)}`;
							if (s.length === 3 || s.length === 5) return `${Pf(f, h, s, $, k)}`;
							throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.");
						})()};
            `;
						case "cubic": return `
            ${(() => {
							if (s.length === 2 || s.length === 4) return `${Nf(f, h, s, d, c, l, t.cubicCoeffA, $, t.extrapolationValue, t.excludeOutside)}`;
							throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.");
						})()};
            `;
						default: throw Error("Invalid resize mode");
					}
				})()};
      `}
      ${E.registerUniform("output_size", "u32").registerUniform("scales", "f32", c.length).registerUniform("roi", "f32", l.length).declareVariables(f, h)}
      ${E.mainStart()}
        ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${v ? "output[global_idx] = input[global_idx];" : `
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${f.type.indices};
        ${(() => {
					switch (t.mode) {
						case "nearest": return `input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${f.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;
						case "linear": return `output[global_idx] = ${s.length === 2 || s.length === 4 ? "bilinearInterpolation" : "trilinearInterpolation"}(output_indices);`;
						case "cubic": return "output[global_idx] = bicubicInterpolation(output_indices);";
						default: throw Error(`Unsupported resize mode: ${t.mode}`);
					}
				})()};
`}
      }`;
				return {
					name: "Resize",
					shaderCache: {
						hint: `${t.cacheKey}|${r}|${c.length > 0 ? t.mode === "cubic" ? c : c.length : ""}|${n.length > 0 ? n : ""}|${l.length > 0 ? l : ""}|${v}|${t.mode === "nearest" ? s.length : s}`,
						inputDependencies: ["rank"]
					},
					getShaderSource: I,
					getRunData: () => ({
						outputs: [{
							dims: d,
							dataType: e.dataType
						}],
						dispatchGroup: { x: Math.ceil(w / 64) },
						programUniforms: [
							{
								type: 12,
								data: w
							},
							{
								type: 1,
								data: c
							},
							{
								type: 1,
								data: l
							},
							...de(s, d)
						]
					})
				};
			}, Lf = (e) => {
				let t = e.customDataBuffer;
				return new Uint32Array(t.buffer, t.byteOffset, 1)[0];
			}, Ff = (e, t) => {
				let r = [], a = [], n = [], i = Lf(e);
				if (t.antialias !== 0) throw Error("Only default value (0) for Antialias attribute is supported");
				Tf(e.inputs, t, i, r, a, n), e.compute(Uf(e.inputs[0], t, i, r, a, n), { inputs: [0] });
			}, qf = (e) => {
				let t = e.antialias, r = e.axes, a = e.coordinateTransformMode, n = e.cubicCoeffA, i = e.excludeOutside !== 0, s = e.extrapolationValue, l = e.keepAspectRatioPolicy, d = e.mode, c = e.nearestMode === "" ? "simple" : e.nearestMode;
				return Ne({
					antialias: t,
					axes: r,
					coordinateTransformMode: a,
					cubicCoeffA: n,
					excludeOutside: i,
					extrapolationValue: s,
					keepAspectRatioPolicy: l,
					mode: d,
					nearestMode: c
				});
			};
		}), jf = Z(() => {
			"use strict";
			fe(), we(), be(), Gf = (e) => {
				if (!e || e.length < 3) throw new Error("layerNorm requires at least 3 inputs.");
				let t = e[0], r = e[1], a = e[2];
				if (t.dataType !== r.dataType || t.dataType !== a.dataType) throw new Error("All inputs must have the same data type");
				if (t.dims.length !== 3 && t.dims.length !== 2) throw new Error("Input must be 2D or 3D");
				if (r.dims.length !== 3 && r.dims.length !== 2) throw new Error("Skip must be 2D or 3D");
				let n = t.dims[t.dims.length - 1], i = t.dims[t.dims.length - 2];
				if (r.dims[r.dims.length - 1] !== n) throw new Error("Skip must have the same hidden size as input");
				if (r.dims[r.dims.length - 2] !== i) throw new Error("Skip must have the same sequence length as input");
				if (a.dims.length !== 1) throw new Error("Gamma must be 1D");
				if (a.dims[a.dims.length - 1] !== n) throw new Error("Gamma must have the same hidden size as input");
				if (e.length > 3) {
					let s = e[3];
					if (s.dims.length !== 1) throw new Error("Beta must be 1D");
					if (s.dims[s.dims.length - 1] !== n) throw new Error("Beta must have the same hidden size as input");
				}
				if (e.length > 4) {
					let s = e[4];
					if (s.dims.length !== 1) throw new Error("Bias must be 1D");
					if (s.dims[s.dims.length - 1] !== n) throw new Error("Bias must have the same hidden size as input");
				}
			}, Vf = (e, t, r, a) => {
				let n = t.simplified, i = e[0].dims, s = F.size(i), l = i, d = s, c = i.slice(-1)[0], h = a ? i.slice(0, -1).concat(1) : [], f = !n && e.length > 3, w = e.length > 4, v = a && r > 1, $ = a && r > 2, k = r > 3, C = 64, I = Je(c), E = [
					{
						type: 12,
						data: d
					},
					{
						type: 12,
						data: I
					},
					{
						type: 12,
						data: c
					},
					{
						type: 1,
						data: t.epsilon
					}
				], A = (B) => {
					let N = [
						{
							name: "output_size",
							type: "u32"
						},
						{
							name: "components",
							type: "u32"
						},
						{
							name: "hidden_size",
							type: "u32"
						},
						{
							name: "epsilon",
							type: "f32"
						}
					], P = [
						G("x", e[0].dataType, e[0].dims, I),
						G("skip", e[1].dataType, e[1].dims, I),
						G("gamma", e[2].dataType, e[2].dims, I)
					];
					f && P.push(G("beta", e[3].dataType, e[3].dims, I)), w && P.push(G("bias", e[4].dataType, e[4].dims, I)), P.push(oe("output", e[0].dataType, l, I)), v && P.push(oe("mean_output", 1, h)), $ && P.push(oe("inv_std_output", 1, h)), k && P.push(oe("input_skip_bias_sum", e[0].dataType, l, I));
					let T = nt(e[0].dataType), Y = nt(1, I);
					return `

      ${B.registerUniforms(N).declareVariables(...P)}
      var<workgroup> sum_shared : array<${Y}, ${C}>;
      var<workgroup> sum_squared_shared : array<${Y}, ${C}>;

      ${B.mainStart([
						C,
						1,
						1
					])}
        let ix = local_id.x;
        let iy = global_id.x / ${C};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${C};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == 63) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${w ? "bias[offset1d + i]" : T + "(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${k ? "input_skip_bias_sum[offset + i] = value;" : ""}
          output[offset + i] = value;
          let f32_value = ${Ur(T, I, "value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${C};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${ar("sum", I)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${ar("square_sum", I)} / f32(uniforms.hidden_size) ${n ? "" : "- mean * mean"} + uniforms.epsilon);
        ${v ? "mean_output[global_idx] = mean;" : ""}
        ${$ ? "inv_std_output[global_idx] = inv_std_dev;" : ""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${n ? "" : `- ${T}(mean)`}) *
            ${T}(inv_std_dev) * gamma[offset1d + i]
            ${f ? "+ beta[offset1d + i]" : ""};
        }
      }`;
				}, z = [{
					dims: l,
					dataType: e[0].dataType
				}];
				return r > 1 && z.push({
					dims: h,
					dataType: 1
				}), r > 2 && z.push({
					dims: h,
					dataType: 1
				}), r > 3 && z.push({
					dims: i,
					dataType: e[0].dataType
				}), {
					name: "SkipLayerNormalization",
					shaderCache: {
						hint: `${I};${v};${$};${k}`,
						inputDependencies: e.map((B, N) => "type")
					},
					getShaderSource: A,
					getRunData: () => ({
						outputs: z,
						dispatchGroup: { x: Math.ceil(d / c) },
						programUniforms: E
					})
				};
			}, Hf = (e, t) => {
				Gf(e.inputs);
				let r = [0];
				e.outputCount > 1 && r.push(-3), e.outputCount > 2 && r.push(-3), e.outputCount > 3 && r.push(3), e.compute(Vf(e.inputs, t, e.outputCount, !1), { outputs: r });
			};
		}), eh = Z(() => {
			"use strict";
			fe(), we(), Qe(), be(), Kf = (e, t) => {
				if (!e || e.length < 1) throw new Error("too few inputs");
				if (t.axes.length !== 0) {
					if (t.axes.length !== t.starts.length || t.axes.length !== t.ends.length) throw new Error("axes, starts and ends must have the same length");
				} else if (t.starts.length !== t.ends.length) throw new Error("starts and ends must have the same length");
				e.slice(1).forEach((r, a) => {
					if (e[a + 1].dataType !== 6 && e[a + 1].dataType !== 7) throw new Error(`Input ${a} must be an array of int32 or int64`);
				});
			}, da = (e, t) => {
				let r = [];
				if (e.length > t) if (e[t].dataType === 7) e[t].getBigInt64Array().forEach((a) => r.push(Number(a)));
				else if (e[t].dataType === 6) e[t].getInt32Array().forEach((a) => r.push(Number(a)));
				else throw new Error(`Input ${t} must be an array of int32 or int64`);
				return r;
			}, Xf = (e, t) => {
				if (e.length > 1) {
					let r = da(e, 1), a = da(e, 2), n = da(e, 3);
					return n.length === 0 && (n = [...Array(e[0].dims.length).keys()]), Ne({
						starts: r,
						ends: a,
						axes: n
					});
				} else return t;
			}, ys = (e, t, r, a, n) => {
				let i = e;
				return e < 0 && (i += r[a[t]]), n[t] < 0 ? Math.max(0, Math.min(i, r[a[t]] - 1)) : Math.max(0, Math.min(i, r[a[t]]));
			}, Zf = (e, t, r) => `fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length - 1}; i >= 0; i--) {
            let input_shape_i = ${le("uniforms.input_shape", "i", r.length)};
            let steps_i = ${le("uniforms.steps", "i", r.length)};
            let signs_i = ${le("uniforms.signs", "i", r.length)};
            let starts_i = ${le("uniforms.starts", "i", r.length)};
            var output_index = ${t.indicesGet("output_indices", "i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices", "i", "input_index")};
          }
          return input_indices;
      }`, Yf = (e, t) => {
				let r = e[0].dims, a = F.size(r), n = t.axes.length > 0 ? F.normalizeAxes(t.axes, r.length) : [...Array(r.length).keys()], i = da(e, 4);
				i.forEach((I) => I !== 0 || (() => {
					throw new Error("step cannot be 0");
				})), i.length === 0 && (i = Array(n.length).fill(1));
				let s = t.starts.map((I, E) => ys(I, E, r, n, i)), l = t.ends.map((I, E) => ys(I, E, r, n, i));
				if (n.length !== s.length || n.length !== l.length) throw new Error("start, ends and axes should have the same number of elements");
				if (n.length !== r.length) for (let I = 0; I < r.length; ++I) n.includes(I) || (s.splice(I, 0, 0), l.splice(I, 0, r[I]), i.splice(I, 0, 1));
				let d = i.map((I) => Math.sign(I));
				i.forEach((I, E, A) => {
					if (I < 0) {
						let z = (l[E] - s[E]) / I, B = s[E], N = B + z * i[E];
						s[E] = N, l[E] = B, A[E] = -I;
					}
				});
				let c = r.slice(0);
				n.forEach((I, E) => {
					c[I] = Math.ceil((l[I] - s[I]) / i[I]);
				});
				let h = {
					dims: c,
					dataType: e[0].dataType
				}, f = oe("output", e[0].dataType, c.length), w = G("input", e[0].dataType, e[0].dims.length), v = F.size(c), $ = [
					{
						name: "outputSize",
						type: "u32"
					},
					{
						name: "starts",
						type: "u32",
						length: s.length
					},
					{
						name: "signs",
						type: "i32",
						length: d.length
					},
					{
						name: "steps",
						type: "u32",
						length: i.length
					}
				], k = [
					{
						type: 12,
						data: v
					},
					{
						type: 12,
						data: s
					},
					{
						type: 6,
						data: d
					},
					{
						type: 12,
						data: i
					},
					...de(e[0].dims, c)
				], C = (I) => `
      ${I.registerUniforms($).declareVariables(w, f)}
        ${Zf(w, f, r)}
        ${I.mainStart()}
          ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${f.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${f.setByOffset("global_idx", w.getByIndices("input_indices"))}
      }`;
				return {
					name: "Slice",
					shaderCache: {
						hint: `${d.length}_${s.length}_${i.length}`,
						inputDependencies: ["rank"]
					},
					getShaderSource: C,
					getRunData: () => ({
						outputs: [h],
						dispatchGroup: { x: Math.ceil(a / 64) },
						programUniforms: k
					})
				};
			}, Qf = (e, t) => {
				Kf(e.inputs, t);
				let r = Xf(e.inputs, t);
				e.compute(Yf(e.inputs, r), { inputs: [0] });
			}, Jf = (e) => {
				let t = e.starts, r = e.ends, a = e.axes;
				return Ne({
					starts: t,
					ends: r,
					axes: a
				});
			};
		}), ih = Z(() => {
			"use strict";
			fe(), we(), Qe(), Wt(), be(), th = (e) => {
				if (!e || e.length !== 1) throw new Error("Softmax op requires 1 input.");
			}, rh = (e, t) => {
				let r = e.inputs[0], a = r.dims, n = F.size(a), i = a.length, s = F.normalizeAxis(t.axis, i), l = s < a.length - 1, d, c = [];
				l ? (c = Array.from({ length: i }, (P, T) => T), c[s] = i - 1, c[i - 1] = s, d = e.compute(_t(r, c), {
					inputs: [r],
					outputs: [-1]
				})[0]) : d = r;
				let h = d.dims, f = h[i - 1], w = n / f, v = Je(f), $ = f / v, k = 64;
				w === 1 && (k = 256);
				let C = (P, T) => T === 4 ? `max(max(${P}.x, ${P}.y), max(${P}.z, ${P}.w))` : T === 2 ? `max(${P}.x, ${P}.y)` : T === 3 ? `max(max(${P}.x, ${P}.y), ${P}.z)` : P, I = G("x", d.dataType, d.dims, v), E = oe("result", d.dataType, d.dims, v), A = I.type.value, z = nt(d.dataType) === "f32" ? `var threadMax = ${A}(-3.4028234663852886e+38f);` : `var threadMax = ${A}(-65504.0h);`, B = (P) => `
      var<workgroup> rowMaxShared : ${A};
      var<workgroup> rowSumShared : ${A};
      var<workgroup> threadShared : array<${A}, ${k}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${A} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${A}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${P.registerUniform("packedCols", "i32").declareVariables(I, E)}
      ${P.mainStart(k)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${k};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${z}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${A}(${C("threadShared[0]", v)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${A}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${A}(${ar("threadShared[0]", v)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${A}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`, N = e.compute({
					name: "Softmax",
					shaderCache: {
						hint: `${v};${k}`,
						inputDependencies: ["type"]
					},
					getRunData: () => ({
						outputs: [{
							dims: h,
							dataType: d.dataType
						}],
						dispatchGroup: { x: w },
						programUniforms: [{
							type: 6,
							data: $
						}]
					}),
					getShaderSource: B
				}, {
					inputs: [d],
					outputs: [l ? -1 : 0]
				})[0];
				l && e.compute(_t(N, c), { inputs: [N] });
			}, ah = (e, t) => {
				th(e.inputs), rh(e, t);
			}, nh = (e) => Ne({ axis: e.axis });
		}), dh = Z(() => {
			"use strict";
			fe(), we(), be(), ws = (e) => Array.from(e.getBigInt64Array(), Number), sh = (e) => {
				if (!e || e.length !== 2) throw new Error("Tile requires 2 inputs.");
				if (e[0].dataType !== 1 && e[0].dataType !== 10 && e[0].dataType !== 6 && e[0].dataType !== 12) throw new Error("Tile only support float, float16, int32, and uint32 data types");
				if (e[1].dataType !== 7) throw new Error("Tile `repeats` input should be of int64 data type");
				if (e[1].dims.length !== 1) throw new Error("Tile `repeats` input should be 1-D");
				if (ws(e[1]).length !== e[0].dims.length) throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor");
			}, oh = (e, t) => {
				let r = [];
				for (let a = 0; a < e.length; ++a) r.push(e[a] * t[a]);
				return r;
			}, uh = (e, t) => {
				let r = e[0].dims, a = t ?? ws(e[1]), n = oh(r, a), i = F.size(n), s = e[0].dataType, l = G("input", s, r.length), d = oe("output", s, n.length), c = (h) => `
      const inputShape = ${l.indices(...r)};
      ${h.registerUniform("output_size", "u32").declareVariables(l, d)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d.offsetToIndices("global_idx")};
      var input_indices: ${l.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${l.indicesGet("uniforms.input_shape", "i")};
        let input_dim_value = ${d.indicesGet("output_indices", "i")}  % input_dim_i;

        ${l.indicesSet("input_indices", "i", "input_dim_value")}
      }
      ${d.setByOffset("global_idx", l.getByIndices("input_indices"))}
    }`;
				return {
					name: "Tile",
					shaderCache: {
						hint: `${a}`,
						inputDependencies: ["rank"]
					},
					getRunData: () => ({
						outputs: [{
							dims: n,
							dataType: e[0].dataType
						}],
						dispatchGroup: { x: Math.ceil(i / 64) },
						programUniforms: [{
							type: 12,
							data: i
						}, ...de(e[0].dims, n)]
					}),
					getShaderSource: c
				};
			}, lh = (e) => {
				sh(e.inputs), e.compute(uh(e.inputs), { inputs: [0] });
			};
		}), fh = Z(() => {
			"use strict";
			fe(), we(), be(), ph = (e, t, r, a, n) => {
				let i = oe("output_data", n, r.length, 4), s = G("a_data", t[1].dataType, t[1].dims.length, 4), l = G("b_data", t[2].dataType, t[2].dims.length, 4), d = G("c_data", t[0].dataType, t[0].dims.length, 4), c, h = (f, w, v) => `select(${w}, ${f}, ${v})`;
				if (!a) c = i.setByOffset("global_idx", h(s.getByOffset("global_idx"), l.getByOffset("global_idx"), d.getByOffset("global_idx")));
				else {
					let f = (w, v, $ = "") => {
						let k = `a_data[index_a${v}][component_a${v}]`, C = `b_data[index_b${v}][component_b${v}]`, I = `bool(c_data[index_c${v}] & (0xffu << (component_c${v} * 8)))`;
						return `
            let output_indices${v} = ${i.offsetToIndices(`global_idx * 4u + ${v}u`)};
            let offset_a${v} = ${s.broadcastedIndicesToOffset(`output_indices${v}`, i)};
            let offset_b${v} = ${l.broadcastedIndicesToOffset(`output_indices${v}`, i)};
            let offset_c${v} = ${d.broadcastedIndicesToOffset(`output_indices${v}`, i)};
            let index_a${v} = offset_a${v} / 4u;
            let index_b${v} = offset_b${v} / 4u;
            let index_c${v} = offset_c${v} / 4u;
            let component_a${v} = offset_a${v} % 4u;
            let component_b${v} = offset_b${v} % 4u;
            let component_c${v} = offset_c${v} % 4u;
            ${w}[${v}] = ${$}(${h(k, C, I)});
          `;
					};
					n === 9 ? c = `
            var data = vec4<u32>(0);
            ${f("data", 0, "u32")}
            ${f("data", 1, "u32")}
            ${f("data", 2, "u32")}
            ${f("data", 3, "u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));` : c = `
            ${f("output_data[global_idx]", 0)}
            ${f("output_data[global_idx]", 1)}
            ${f("output_data[global_idx]", 2)}
            ${f("output_data[global_idx]", 3)}
          `;
				}
				return `
        ${e.registerUniform("vec_size", "u32").declareVariables(d, s, l, i)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${c}
      }`;
			}, ch = (e) => {
				let t = e[1].dims, r = e[2].dims, a = e[0].dims, n = e[1].dataType, i = !(F.areEqual(t, r) && F.areEqual(r, a)), s = t, l = F.size(t);
				if (i) {
					let c = Nr.calcShape(Nr.calcShape(t, r, !1), a, !1);
					if (!c) throw new Error("Can't perform where op on the given tensors");
					s = c, l = F.size(s);
				}
				let d = Math.ceil(l / 4);
				return {
					name: "Where",
					shaderCache: { inputDependencies: [
						"rank",
						"rank",
						"rank"
					] },
					getShaderSource: (c) => ph(c, e, s, i, n),
					getRunData: () => ({
						outputs: [{
							dims: s,
							dataType: n
						}],
						dispatchGroup: { x: Math.ceil(l / 64 / 4) },
						programUniforms: [{
							type: 12,
							data: d
						}, ...de(a, t, r, s)]
					})
				};
			}, mh = (e) => {
				e.compute(ch(e.inputs));
			};
		}), gh = Z(() => {
			"use strict";
			Yl(), Ya(), ud(), cd(), tp(), fp(), vp(), Vp(), tc(), ic(), pc(), wc(), kc(), Tc(), Rc(), Mc(), Fc(), Hc(), Yc(), um(), Sm(), zm(), Om(), Mm(), qm(), rs(), Qm(), df(), hf(), wf(), kf(), Xa(), Wf(), is(), jf(), eh(), ih(), ns(), dh(), Wt(), Ja(), fh(), hh = /* @__PURE__ */ new Map([
				["Abs", [fd]],
				["Acos", [hd]],
				["Acosh", [gd]],
				["Add", [np]],
				["ArgMax", [Zl, Mi]],
				["ArgMin", [Xl, Mi]],
				["Asin", [_d]],
				["Asinh", [yd]],
				["Atan", [wd]],
				["Atanh", [bd]],
				["Attention", [ad]],
				["AveragePool", [rf, tf]],
				["BatchNormalization", [od]],
				["BiasAdd", [pd]],
				["BiasSplitGelu", [ep]],
				["Cast", [$d, vd]],
				["Ceil", [Sd]],
				["Clip", [kd]],
				["Concat", [wp, bp]],
				["Conv", [Xi, ji]],
				["ConvTranspose", [ec, Yp]],
				["Cos", [Ed]],
				["Cosh", [Td]],
				["CumSum", [ac, nc]],
				["DepthToSpace", [lc, dc]],
				["DequantizeLinear", [mf, ff]],
				["Div", [ip]],
				["Einsum", [_c, yc]],
				["Elu", [Id, na]],
				["Equal", [sp]],
				["Erf", [zd]],
				["Exp", [Cd]],
				["Expand", [xc]],
				["FastGelu", [Ec]],
				["Floor", [Ad]],
				["FusedConv", [Xi, ji]],
				["Gather", [Ac, Cc]],
				["GatherElements", [Vc, Gc]],
				["GatherBlockQuantized", [Uc, Lc]],
				["GatherND", [Bc, Dc]],
				["Gelu", [Rd]],
				["Gemm", [Zc, Xc]],
				["GlobalAveragePool", [nf, af]],
				["GlobalMaxPool", [lf, uf]],
				["Greater", [dp]],
				["GreaterOrEqual", [cp]],
				["GridSample", [sm, om]],
				["GroupQueryAttention", [km]],
				["HardSigmoid", [Ld, Ud]],
				["InstanceNormalization", [Im]],
				["LayerNormalization", [Rm]],
				["LeakyRelu", [Od, na]],
				["Less", [pp]],
				["LessOrEqual", [mp]],
				["Log", [Kd]],
				["MatMul", [Dm]],
				["MatMulNBits", [Lm, Fm]],
				["MaxPool", [sf, of]],
				["Mul", [op]],
				["MultiHeadAttention", [cm, dm]],
				["Neg", [Dd]],
				["Not", [Bd]],
				["Pad", [Ym]],
				["Pow", [up]],
				["QuickGelu", [Yd, na]],
				["Range", [yf]],
				["Reciprocal", [Md]],
				["ReduceMin", [Gl]],
				["ReduceMean", [Ul]],
				["ReduceMax", [Wl]],
				["ReduceSum", [Hl]],
				["ReduceProd", [Vl]],
				["ReduceL1", [Ll]],
				["ReduceL2", [Fl]],
				["ReduceLogSum", [Kl]],
				["ReduceLogSumExp", [ql]],
				["ReduceSumSquare", [jl]],
				["Relu", [Nd]],
				["Resize", [Ff, qf]],
				["RotaryEmbedding", [bm]],
				["ScatterND", [xf, $f]],
				["Sigmoid", [Pd]],
				["Sin", [Fd]],
				["Sinh", [qd]],
				["Slice", [Qf, Jf]],
				["SkipLayerNormalization", [Hf]],
				["Split", [_m, ym]],
				["Sqrt", [Wd]],
				["Softmax", [ah, nh]],
				["Sub", [lp]],
				["Tan", [Gd]],
				["Tanh", [Vd]],
				["ThresholdedRelu", [jd, na]],
				["Tile", [lh]],
				["Transpose", [il, sl]],
				["Where", [mh]]
			]);
		}), yh = Z(() => {
			"use strict";
			ht(), Mt(), be(), _h = class {
				constructor(e) {
					this.backend = e, this.repo = /* @__PURE__ */ new Map(), this.attributesBound = !1;
				}
				getArtifact(e) {
					return this.repo.get(e);
				}
				setArtifact(e, t) {
					this.repo.set(e, t);
				}
				run(e, t, r, a, n) {
					kt(e.programInfo.name);
					let i = this.backend.device, s = this.backend.getComputePassEncoder();
					this.backend.writeTimestamp(this.backend.pendingDispatchNumber * 2);
					let l = [];
					for (let c of t) l.push({
						binding: l.length,
						resource: { buffer: c.buffer }
					});
					for (let c of r) l.push({
						binding: l.length,
						resource: { buffer: c.buffer }
					});
					n && l.push({
						binding: l.length,
						resource: n
					});
					let d = i.createBindGroup({
						layout: e.computePipeline.getBindGroupLayout(0),
						entries: l,
						label: e.programInfo.name
					});
					if (this.backend.sessionStatus === "capturing") {
						let c = {
							kernelId: this.backend.currentKernelId,
							computePipeline: e.computePipeline,
							bindGroup: d,
							dispatchGroup: a
						};
						this.backend.capturedCommandList.get(this.backend.currentSessionId).push(c);
					}
					s.setPipeline(e.computePipeline), s.setBindGroup(0, d), s.dispatchWorkgroups(...a), this.backend.writeTimestamp(this.backend.pendingDispatchNumber * 2 + 1), this.backend.pendingDispatchNumber++, (this.backend.pendingDispatchNumber >= this.backend.maxDispatchNumber || this.backend.queryType === "at-passes") && this.backend.endComputePass(), this.backend.pendingDispatchNumber >= this.backend.maxDispatchNumber && this.backend.flush(), yt(e.programInfo.name);
				}
				dispose() {}
				build(e, t) {
					kt(e.name);
					let r = this.backend.device, a = [];
					[{
						feature: "shader-f16",
						extension: "f16"
					}, {
						feature: "subgroups",
						extension: "subgroups"
					}].forEach((c) => {
						r.features.has(c.feature) && a.push(`enable ${c.extension};`);
					});
					let n = Ju(t, this.backend.device.limits), i = e.getShaderSource(n), s = `${a.join(`
`)}
${n.additionalImplementations}
${i}`, l = r.createShaderModule({
						code: s,
						label: e.name
					});
					Ce("verbose", () => `[WebGPU] ${e.name} shader code: ${s}`);
					let d = r.createComputePipeline({
						compute: {
							module: l,
							entryPoint: "main"
						},
						layout: "auto",
						label: e.name
					});
					return yt(e.name), {
						programInfo: e,
						computePipeline: d,
						uniformVariablesInfo: n.variablesInfo
					};
				}
				normalizeDispatchGroupSize(e) {
					let t = typeof e == "number" ? e : e.x, r = typeof e == "number" ? 1 : e.y || 1, a = typeof e == "number" ? 1 : e.z || 1, n = this.backend.device.limits.maxComputeWorkgroupsPerDimension;
					if (t <= n && r <= n && a <= n) return [
						t,
						r,
						a
					];
					let i = t * r * a, s = Math.ceil(Math.sqrt(i));
					if (s > n) {
						if (s = Math.ceil(Math.cbrt(i)), s > n) throw new Error("Total dispatch size exceeds WebGPU maximum.");
						return [
							s,
							s,
							s
						];
					} else return [
						s,
						s,
						1
					];
				}
			};
		}), bs = {}, hr(bs, { WebGpuBackend: () => $h }), xh = Z(() => {
			"use strict";
			ht(), fe(), Mt(), bi(), Xu(), gh(), yh(), wh = (e, t) => {
				if (t.length !== e.length) throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);
				let r = [];
				for (let a = 0; a < e.length; ++a) {
					let n = e[a].dataType;
					switch (t[a]) {
						case "none":
							r.push("");
							break;
						case "type":
							r.push(`${n}`);
							break;
						case "rank": {
							let i = e[a].dims.length;
							r.push(`${n};${i}`);
							break;
						}
						case "dims": {
							let i = e[a].dims.join(",");
							r.push(`${n};${i}`);
							break;
						}
						default: throw new Error(`unsupported input dependency: ${t[a]}`);
					}
				}
				return r.join("|");
			}, bh = (e, t, r) => {
				let a = e.name;
				return e.shaderCache?.hint && (a += "[" + e.shaderCache.hint + "]"), a += ":" + r + `:${wh(t, e.shaderCache?.inputDependencies ?? new Array(t.length).fill("dims"))}`, a;
			}, vh = class {
				constructor(e) {
					e && (this.architecture = e.architecture, this.vendor = e.vendor);
				}
				isArchitecture(e) {
					return this.architecture === e;
				}
				isVendor(e) {
					return this.vendor === e;
				}
			}, $h = class {
				constructor() {
					this.currentSessionId = null, this.currentKernelId = null, this.commandEncoder = null, this.computePassEncoder = null, this.maxDispatchNumber = 16, this.pendingDispatchNumber = 0, this.pendingKernels = [], this.pendingQueries = /* @__PURE__ */ new Map(), this.sessionStatus = "default", this.capturedCommandList = /* @__PURE__ */ new Map(), this.capturedPendingKernels = /* @__PURE__ */ new Map(), this.sessionExternalDataMapping = /* @__PURE__ */ new Map();
				}
				get currentKernelCustomData() {
					if (this.currentKernelId === null) throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");
					let e = this.kernelCustomData.get(this.currentKernelId);
					return e || (e = {}, this.kernelCustomData.set(this.currentKernelId, e)), e;
				}
				async initialize(e, t) {
					this.env = e;
					let r = [], a = {
						requiredLimits: {
							maxComputeWorkgroupStorageSize: t.limits.maxComputeWorkgroupStorageSize,
							maxComputeWorkgroupsPerDimension: t.limits.maxComputeWorkgroupsPerDimension,
							maxStorageBufferBindingSize: t.limits.maxStorageBufferBindingSize,
							maxBufferSize: t.limits.maxBufferSize,
							maxComputeInvocationsPerWorkgroup: t.limits.maxComputeInvocationsPerWorkgroup,
							maxComputeWorkgroupSizeX: t.limits.maxComputeWorkgroupSizeX,
							maxComputeWorkgroupSizeY: t.limits.maxComputeWorkgroupSizeY,
							maxComputeWorkgroupSizeZ: t.limits.maxComputeWorkgroupSizeZ
						},
						requiredFeatures: r
					}, n = (l) => t.features.has(l) && r.push(l) && !0;
					n("chromium-experimental-timestamp-query-inside-passes") || n("timestamp-query"), n("shader-f16"), n("subgroups"), this.device = await t.requestDevice(a);
					let i = t, s = t.info ?? (typeof i.requestAdapterInfo == "function" ? await i.requestAdapterInfo() : void 0);
					this.adapterInfo = new vh(s), this.gpuDataManager = Ku(this), this.programManager = new _h(this), this.kernels = /* @__PURE__ */ new Map(), this.kernelPersistentData = /* @__PURE__ */ new Map(), this.kernelCustomData = /* @__PURE__ */ new Map(), yi(e.logLevel, !!e.debug), this.device.onuncapturederror = (l) => {
						l.error instanceof GPUValidationError && console.error(`An uncaught WebGPU validation error was raised: ${l.error.message}`);
					}, Object.defineProperty(this.env.webgpu, "device", {
						value: this.device,
						writable: !1,
						enumerable: !0,
						configurable: !0
					}), Object.defineProperty(this.env.webgpu, "adapter", {
						value: t,
						writable: !1,
						enumerable: !0,
						configurable: !1
					}), this.setQueryType();
				}
				dispose() {
					typeof this.querySet < "u" && this.querySet.destroy(), this.gpuDataManager.dispose(), this.device && this.env?.webgpu && this.device.lost.then(() => {
						delete this.env.webgpu.device;
					});
				}
				getCommandEncoder() {
					return this.commandEncoder || (this.commandEncoder = this.device.createCommandEncoder()), this.commandEncoder;
				}
				getComputePassEncoder() {
					if (!this.computePassEncoder) {
						let e = this.getCommandEncoder(), t = {};
						this.queryType === "at-passes" && (t.timestampWrites = {
							querySet: this.querySet,
							beginningOfPassWriteIndex: this.pendingDispatchNumber * 2,
							endOfPassWriteIndex: this.pendingDispatchNumber * 2 + 1
						}), this.computePassEncoder = e.beginComputePass(t);
					}
					return this.computePassEncoder;
				}
				endComputePass() {
					this.computePassEncoder && (this.computePassEncoder.end(), this.computePassEncoder = null);
				}
				flush() {
					if (!this.commandEncoder) return;
					kt(), this.endComputePass();
					let e;
					this.queryType !== "none" && (this.commandEncoder.resolveQuerySet(this.querySet, 0, this.pendingDispatchNumber * 2, this.queryResolveBuffer, 0), e = this.device.createBuffer({
						size: this.pendingDispatchNumber * 2 * 8,
						usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST
					}), this.pendingQueries.set(e, this.pendingKernels), this.pendingKernels = [], this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer, 0, e, 0, this.pendingDispatchNumber * 2 * 8)), this.device.queue.submit([this.commandEncoder.finish()]), this.gpuDataManager.refreshPendingBuffers(), this.commandEncoder = null, this.pendingDispatchNumber = 0, this.queryType !== "none" && e.mapAsync(GPUMapMode.READ).then(() => {
						let t = new BigUint64Array(e.getMappedRange()), r = this.pendingQueries.get(e);
						for (let a = 0; a < t.length / 2; a++) {
							let n = r[a], i = n.kernelId, s = this.kernels.get(i), l = s.kernelType, d = s.kernelName, c = n.programName, h = n.inputTensorViews, f = n.outputTensorViews, w = t[a * 2], v = t[a * 2 + 1];
							typeof this.queryTimeBase > "u" && (this.queryTimeBase = w);
							let $ = Number(w - this.queryTimeBase), k = Number(v - this.queryTimeBase);
							if (!Number.isSafeInteger($) || !Number.isSafeInteger(k)) throw new RangeError("incorrect timestamp range");
							if (this.env.webgpu.profiling?.ondata) this.env.webgpu.profiling.ondata({
								version: 1,
								inputsMetadata: h.map((C) => ({
									dims: C.dims,
									dataType: qt(C.dataType)
								})),
								outputsMetadata: f.map((C) => ({
									dims: C.dims,
									dataType: qt(C.dataType)
								})),
								kernelId: i,
								kernelType: l,
								kernelName: d,
								programName: c,
								startTime: $,
								endTime: k
							});
							else {
								let C = "";
								h.forEach((E, A) => {
									C += `input[${A}]: [${E.dims}] | ${qt(E.dataType)}, `;
								});
								let I = "";
								f.forEach((E, A) => {
									I += `output[${A}]: [${E.dims}] | ${qt(E.dataType)}, `;
								}), console.log(`[profiling] kernel "${i}|${l}|${d}|${c}" ${C}${I}start time: ${$} ns, execution time: ${k - $} ns`);
							}
							Jr("GPU", `${c}::${w}::${v}`);
						}
						e.unmap(), this.pendingQueries.delete(e);
					}), yt();
				}
				run(e, t, r, a, n, i) {
					kt(e.name);
					let s = [];
					for (let E = 0; E < t.length; ++E) {
						let A = t[E].data;
						if (A === 0) continue;
						let z = this.gpuDataManager.get(A);
						if (!z) throw new Error(`no GPU data for input: ${A}`);
						s.push(z);
					}
					let { outputs: l, dispatchGroup: d, programUniforms: c } = e.getRunData(t), h = r.length === 0 ? l.map((E, A) => A) : r;
					if (h.length !== l.length) throw new Error(`Output size ${h.length} must be equal to ${l.length}.`);
					let f = [], w = [];
					for (let E = 0; E < l.length; ++E) {
						if (!Number.isInteger(h[E]) || h[E] < -3 || h[E] >= i) throw new Error(`Invalid output index: ${h[E]}`);
						if (h[E] === -3) continue;
						let A = h[E] === -1, z = h[E] === -2, B = A || z ? n(l[E].dataType, l[E].dims) : a(h[E], l[E].dataType, l[E].dims);
						if (f.push(B), B.data === 0) continue;
						let N = this.gpuDataManager.get(B.data);
						if (!N) throw new Error(`no GPU data for output: ${B.data}`);
						if (A && this.temporaryData.push(N), z) {
							let P = this.kernelPersistentData.get(this.currentKernelId);
							P || (P = [], this.kernelPersistentData.set(this.currentKernelId, P)), P.push(N);
						}
						w.push(N);
					}
					if (s.length !== t.length || w.length !== f.length) {
						if (w.length === 0) return yt(e.name), f;
						throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`);
					}
					let v;
					if (c) {
						let E = 0, A = [];
						c.forEach((P) => {
							let T = typeof P.data == "number" ? [P.data] : P.data;
							if (T.length === 0) return;
							let Y = P.type === 10 ? 2 : 4, X, ue;
							P.type === 10 ? (ue = T.length > 4 ? 16 : T.length > 2 ? 8 : T.length * Y, X = T.length > 4 ? 16 : Y * T.length) : (ue = T.length <= 2 ? T.length * Y : 16, X = 16), E = Math.ceil(E / ue) * ue, A.push(E);
							let ie = P.type === 10 ? 8 : 4;
							E += T.length > 4 ? Math.ceil(T.length / ie) * X : T.length * Y;
						});
						let z = 16;
						E = Math.ceil(E / z) * z;
						let B = new ArrayBuffer(E);
						c.forEach((P, T) => {
							let Y = A[T], X = typeof P.data == "number" ? [P.data] : P.data;
							if (P.type === 6) new Int32Array(B, Y, X.length).set(X);
							else if (P.type === 12) new Uint32Array(B, Y, X.length).set(X);
							else if (P.type === 10) new Uint16Array(B, Y, X.length).set(X);
							else if (P.type === 1) new Float32Array(B, Y, X.length).set(X);
							else throw new Error(`Unsupported uniform type: ${qt(P.type)}`);
						});
						let N = this.gpuDataManager.create(E, GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM);
						this.device.queue.writeBuffer(N.buffer, 0, B, 0, E), this.gpuDataManager.release(N.id), v = {
							offset: 0,
							size: E,
							buffer: N.buffer
						};
					}
					let $ = this.programManager.normalizeDispatchGroupSize(d), k = $[1] === 1 && $[2] === 1, C = bh(e, t, k), I = this.programManager.getArtifact(C);
					if (I || (I = this.programManager.build(e, $), this.programManager.setArtifact(C, I), Ce("info", () => `[artifact] key: ${C}, programName: ${e.name}`)), c && I.uniformVariablesInfo) {
						if (c.length !== I.uniformVariablesInfo.length) throw new Error(`Uniform variables count mismatch: expect ${I.uniformVariablesInfo.length}, got ${c.length} in program "${I.programInfo.name}".`);
						for (let E = 0; E < c.length; E++) {
							let A = c[E], z = A.type, B = typeof A.data == "number" ? 1 : A.data.length, [N, P] = I.uniformVariablesInfo[E];
							if (z !== N || B !== P) throw new Error(`Uniform variable ${E} mismatch: expect type ${N} with size ${P}, got type ${z} with size ${B} in program "${I.programInfo.name}".`);
						}
					}
					if (Ce("info", () => `[ProgramManager] run "${e.name}" (key=${C}) with ${$[0]}x${$[1]}x${$[2]}`), this.queryType !== "none" || this.sessionStatus === "capturing") {
						let E = {
							kernelId: this.currentKernelId,
							programName: I.programInfo.name,
							inputTensorViews: t,
							outputTensorViews: f
						};
						this.pendingKernels.push(E), this.sessionStatus === "capturing" && this.capturedPendingKernels.get(this.currentSessionId).push(E);
					}
					return this.programManager.run(I, s, w, $, v), yt(e.name), f;
				}
				upload(e, t) {
					this.gpuDataManager.upload(e, t);
				}
				memcpy(e, t) {
					this.gpuDataManager.memcpy(e, t);
				}
				async download(e, t) {
					await this.gpuDataManager.download(e, t);
				}
				alloc(e) {
					return this.gpuDataManager.create(e).id;
				}
				free(e) {
					return this.gpuDataManager.release(e);
				}
				createKernel(e, t, r, a) {
					let n = hh.get(e);
					if (!n) throw new Error(`kernel not implemented: ${e}`);
					let i = {
						kernelType: e,
						kernelName: a,
						kernelEntry: n[0],
						attributes: [n[1], r]
					};
					this.kernels.set(t, i);
				}
				releaseKernel(e) {
					let t = this.kernelPersistentData.get(e);
					if (t) {
						for (let r of t) this.gpuDataManager.release(r.id);
						this.kernelPersistentData.delete(e);
					}
					this.kernelCustomData.delete(e), this.kernels.delete(e);
				}
				computeKernel(e, t, r) {
					let a = this.kernels.get(e);
					if (!a) throw new Error(`kernel not created: ${e}`);
					let n = a.kernelType, i = a.kernelName, s = a.kernelEntry, l = a.attributes;
					if (this.currentKernelId !== null) throw new Error(`kernel "[${n}] ${i}" is not allowed to be called recursively`);
					this.currentKernelId = e, l[0] && (l[1] = l[0](l[1]), l[0] = void 0), Ce("info", () => `[WebGPU] Start to run kernel "[${n}] ${i}"...`);
					let d = this.env.debug;
					this.temporaryData = [];
					try {
						return d && this.device.pushErrorScope("validation"), s(t, l[1]), 0;
					} catch (c) {
						return r.push(Promise.resolve(`[WebGPU] Kernel "[${n}] ${i}" failed. ${c}`)), 1;
					} finally {
						d && r.push(this.device.popErrorScope().then((c) => c ? `GPU validation error for kernel "[${n}] ${i}": ${c.message}` : null));
						for (let c of this.temporaryData) this.gpuDataManager.release(c.id);
						this.temporaryData = [], this.currentKernelId = null;
					}
				}
				registerBuffer(e, t, r, a) {
					let n = this.sessionExternalDataMapping.get(e);
					n || (n = /* @__PURE__ */ new Map(), this.sessionExternalDataMapping.set(e, n));
					let i = n.get(t), s = this.gpuDataManager.registerExternalBuffer(r, a, i);
					return n.set(t, [s, r]), s;
				}
				unregisterBuffers(e) {
					let t = this.sessionExternalDataMapping.get(e);
					t && (t.forEach((r) => this.gpuDataManager.unregisterExternalBuffer(r[0])), this.sessionExternalDataMapping.delete(e));
				}
				getBuffer(e) {
					let t = this.gpuDataManager.get(e);
					if (!t) throw new Error(`no GPU data for buffer: ${e}`);
					return t.buffer;
				}
				createDownloader(e, t, r) {
					return async () => {
						let a = await Ci(this, e, t);
						return wi(a.buffer, r);
					};
				}
				writeTimestamp(e) {
					this.queryType === "inside-passes" && this.computePassEncoder.writeTimestamp(this.querySet, e);
				}
				setQueryType() {
					this.queryType = "none", (this.env.webgpu.profiling?.mode === "default" || (typeof this.env.trace > "u" ? this.env.wasm.trace : this.env.trace)) && (this.device.features.has("chromium-experimental-timestamp-query-inside-passes") ? this.queryType = "inside-passes" : this.device.features.has("timestamp-query") && (this.queryType = "at-passes"), this.queryType !== "none" && typeof this.querySet > "u" && (this.querySet = this.device.createQuerySet({
						type: "timestamp",
						count: this.maxDispatchNumber * 2
					}), this.queryResolveBuffer = this.device.createBuffer({
						size: this.maxDispatchNumber * 2 * 8,
						usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.QUERY_RESOLVE
					})));
				}
				captureBegin() {
					Ce("info", "captureBegin"), this.capturedCommandList.get(this.currentSessionId) || this.capturedCommandList.set(this.currentSessionId, []), this.capturedPendingKernels.get(this.currentSessionId) || this.capturedPendingKernels.set(this.currentSessionId, []), this.flush(), this.sessionStatus = "capturing";
				}
				captureEnd() {
					Ce("info", "captureEnd"), this.flush(), this.sessionStatus = "default";
				}
				replay() {
					Ce("info", "replay"), this.sessionStatus = "replaying";
					let e = this.capturedCommandList.get(this.currentSessionId), t = this.capturedPendingKernels.get(this.currentSessionId), r = e.length;
					this.pendingKernels = [];
					for (let a = 0; a < r; a++) {
						let n = this.getComputePassEncoder(), i = e[a];
						this.writeTimestamp(this.pendingDispatchNumber * 2), n.setPipeline(i.computePipeline), n.setBindGroup(0, i.bindGroup), n.dispatchWorkgroups(...i.dispatchGroup), this.writeTimestamp(this.pendingDispatchNumber * 2 + 1), this.pendingDispatchNumber++, this.queryType !== "none" && this.pendingKernels.push(t[a]), (this.pendingDispatchNumber >= this.maxDispatchNumber || this.queryType === "at-passes") && this.endComputePass(), this.pendingDispatchNumber >= this.maxDispatchNumber && this.flush();
					}
					this.flush(), this.sessionStatus = "default";
				}
				onCreateSession() {
					this.gpuDataManager.onCreateSession();
				}
				onReleaseSession(e) {
					this.unregisterBuffers(e), this.capturedCommandList.has(e) && this.capturedCommandList.delete(e), this.capturedPendingKernels.has(e) && this.capturedPendingKernels.delete(e), this.gpuDataManager.onReleaseSession(e);
				}
				onRunStart(e) {
					this.currentSessionId = e, this.setQueryType();
				}
			};
		}), vs = {}, hr(vs, { init: () => Sh }), Eh = Z(() => {
			"use strict";
			fe(), Mt(), we(), Gu(), ln = class f0 {
				constructor(t, r, a, n) {
					this.module = t, this.dataType = r, this.data = a, this.dims = n;
				}
				getFloat32Array() {
					if (this.dataType !== 1) throw new Error("Invalid data type");
					let t = F.size(this.dims);
					return t === 0 ? /* @__PURE__ */ new Float32Array() : new Float32Array(this.module.HEAP8.buffer, this.data, t);
				}
				getBigInt64Array() {
					if (this.dataType !== 7) throw new Error("Invalid data type");
					let t = F.size(this.dims);
					return t === 0 ? /* @__PURE__ */ new BigInt64Array() : new BigInt64Array(this.module.HEAP8.buffer, this.data, t);
				}
				getInt32Array() {
					if (this.dataType !== 6) throw new Error("Invalid data type");
					let t = F.size(this.dims);
					return t === 0 ? /* @__PURE__ */ new Int32Array() : new Int32Array(this.module.HEAP8.buffer, this.data, t);
				}
				getUint16Array() {
					if (this.dataType !== 10 && this.dataType !== 4) throw new Error("Invalid data type");
					let t = F.size(this.dims);
					return t === 0 ? /* @__PURE__ */ new Uint16Array() : new Uint16Array(this.module.HEAP8.buffer, this.data, t);
				}
				reshape(t) {
					if (F.size(t) !== F.size(this.dims)) throw new Error("Invalid new shape");
					return new f0(this.module, this.dataType, this.data, t);
				}
			}, kh = class {
				constructor(e, t, r) {
					this.module = e, this.backend = t, this.customDataOffset = 0, this.customDataSize = 0, this.adapterInfo = t.adapterInfo;
					let a = e.PTR_SIZE, n = r / e.PTR_SIZE, i = a === 4 ? "i32" : "i64";
					this.opKernelContext = Number(e.getValue(a * n++, i));
					let s = Number(e.getValue(a * n++, i));
					this.outputCount = Number(e.getValue(a * n++, i)), this.customDataOffset = Number(e.getValue(a * n++, "*")), this.customDataSize = Number(e.getValue(a * n++, i));
					let l = [];
					for (let d = 0; d < s; d++) {
						let c = Number(e.getValue(a * n++, i)), h = Number(e.getValue(a * n++, "*")), f = Number(e.getValue(a * n++, i)), w = [];
						for (let v = 0; v < f; v++) w.push(Number(e.getValue(a * n++, i)));
						l.push(new ln(e, c, h, w));
					}
					this.inputs = l;
				}
				get kernelCustomData() {
					return this.backend.currentKernelCustomData;
				}
				get customDataBuffer() {
					return this.module.HEAPU8.subarray(this.customDataOffset, this.customDataOffset + this.customDataSize);
				}
				compute(e, t) {
					let r = t?.inputs?.map((s) => typeof s == "number" ? this.inputs[s] : s) ?? this.inputs, a = t?.outputs ?? [], n = (s, l, d) => new ln(this.module, l, this.output(s, d), d), i = (s, l) => {
						let d = br(s, l);
						if (!d) throw new Error(`Unsupported data type: ${s}`);
						let c = d > 0 ? this.backend.gpuDataManager.create(d).id : 0;
						return new ln(this.module, s, c, l);
					};
					return this.backend.run(e, r, a, n, i, this.outputCount);
				}
				output(e, t) {
					let r = this.module.stackSave();
					try {
						let a = this.module.PTR_SIZE, n = a === 4 ? "i32" : "i64", i = this.module.stackAlloc((1 + t.length) * a);
						this.module.setValue(i, t.length, n);
						for (let s = 0; s < t.length; s++) this.module.setValue(i + a * (s + 1), t[s], n);
						return this.module._JsepOutput(this.opKernelContext, e, i);
					} catch (a) {
						throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${a}`);
					} finally {
						this.module.stackRestore(r);
					}
				}
			}, Sh = async (e, t, r, a) => {
				let n = t.jsepInit;
				if (!n) throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");
				if (e === "webgpu") {
					let i = (xh(), Mr(bs)).WebGpuBackend, s = new i();
					await s.initialize(r, a), n("webgpu", [
						s,
						(l) => s.alloc(Number(l)),
						(l) => s.free(l),
						(l, d, c, h = !1) => {
							if (h) Ce("verbose", () => `[WebGPU] jsepCopyGpuToGpu: src=${Number(l)}, dst=${Number(d)}, size=${Number(c)}`), s.memcpy(Number(l), Number(d));
							else {
								Ce("verbose", () => `[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(l)}, gpuDataId=${Number(d)}, size=${Number(c)}`);
								let f = t.HEAPU8.subarray(Number(l >>> 0), Number(l >>> 0) + Number(c));
								s.upload(Number(d), f);
							}
						},
						async (l, d, c) => {
							Ce("verbose", () => `[WebGPU] jsepCopyGpuToCpu: gpuDataId=${l}, dataOffset=${d}, size=${c}`), await s.download(Number(l), () => t.HEAPU8.subarray(Number(d) >>> 0, Number(d + c) >>> 0));
						},
						(l, d, c) => s.createKernel(l, Number(d), c, t.UTF8ToString(t._JsepGetNodeName(Number(d)))),
						(l) => s.releaseKernel(l),
						(l, d, c, h) => {
							Ce("verbose", () => `[WebGPU] jsepRun: sessionHandle=${c}, kernel=${l}, contextDataOffset=${d}`);
							let f = new kh(t, s, Number(d));
							return s.computeKernel(Number(l), f, h);
						},
						() => s.captureBegin(),
						() => s.captureEnd(),
						() => s.replay()
					]);
				} else {
					let i = new Wu(r);
					n("webnn", [
						i,
						() => i.reserveTensorId(),
						(s) => i.releaseTensorId(s),
						async (s, l, d, c, h) => i.ensureTensor(s, l, d, c, h),
						(s, l) => {
							i.uploadTensor(s, l);
						},
						async (s, l) => i.downloadTensor(s, l),
						(s, l) => i.registerMLContext(s, l),
						!!r.trace
					]);
				}
			};
		}), As = Z(() => {
			"use strict";
			ht(), vu(), Tu(), fe(), rr(), La(), _i(), Th = (e, t) => {
				We()._OrtInit(e, t) !== 0 && Le("Can't initialize onnxruntime.");
			}, $s = async (e) => {
				Th(e.wasm.numThreads, qa(e.logLevel));
			}, xs = async (e, t) => {
				We().asyncInit?.();
				let r = e.webgpu.adapter;
				if (t === "webgpu") {
					if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
					if (r) {
						if (typeof r.limits != "object" || typeof r.features != "object" || typeof r.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
					} else {
						let a = e.webgpu.powerPreference;
						if (a !== void 0 && a !== "low-power" && a !== "high-performance") throw new Error(`Invalid powerPreference setting: "${a}"`);
						let n = e.webgpu.forceFallbackAdapter;
						if (n !== void 0 && typeof n != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${n}"`);
						if (r = await navigator.gpu.requestAdapter({
							powerPreference: a,
							forceFallbackAdapter: n
						}), !r) throw new Error("Failed to get GPU adapter. You may need to enable flag \"--enable-unsafe-webgpu\" if you are using Chrome.");
					}
				}
				if (t === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
				{
					let a = (Eh(), Mr(vs)).init;
					t === "webgpu" && await a("webgpu", We(), e, r), t === "webnn" && await a("webnn", We(), e);
				}
			}, ir = /* @__PURE__ */ new Map(), Ih = (e) => {
				let t = We(), r = t.stackSave();
				try {
					let a = t.PTR_SIZE, n = t.stackAlloc(2 * a);
					t._OrtGetInputOutputCount(e, n, n + a) !== 0 && Le("Can't get session input/output count.");
					let i = a === 4 ? "i32" : "i64";
					return [Number(t.getValue(n, i)), Number(t.getValue(n + a, i))];
				} finally {
					t.stackRestore(r);
				}
			}, ks = (e, t) => {
				let r = We(), a = r.stackSave(), n = 0;
				try {
					let i = r.PTR_SIZE, s = r.stackAlloc(2 * i);
					r._OrtGetInputOutputMetadata(e, t, s, s + i) !== 0 && Le("Can't get session input/output metadata.");
					let l = Number(r.getValue(s, "*"));
					n = Number(r.getValue(s + i, "*"));
					let d = r.HEAP32[n / 4];
					if (d === 0) return [l, 0];
					let c = r.HEAPU32[n / 4 + 1], h = [];
					for (let f = 0; f < c; f++) {
						let w = Number(r.getValue(n + 8 + f * i, "*"));
						h.push(w !== 0 ? r.UTF8ToString(w) : Number(r.getValue(n + 8 + (f + c) * i, "*")));
					}
					return [
						l,
						d,
						h
					];
				} finally {
					r.stackRestore(a), n !== 0 && r._OrtFree(n);
				}
			}, dn = (e) => {
				let t = We(), r = t._malloc(e.byteLength);
				if (r === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);
				return t.HEAPU8.set(e, r), [r, e.byteLength];
			}, Ss = async (e, t) => {
				let r, a, n = We();
				Array.isArray(e) ? [r, a] = e : e.buffer === n.HEAPU8.buffer ? [r, a] = [e.byteOffset, e.byteLength] : [r, a] = dn(e);
				let i = 0, s = 0, l = 0, d = [], c = [], h = [];
				try {
					if ([s, d] = await Eu(t), t?.externalData && n.mountExternalData) {
						let z = [];
						for (let B of t.externalData) {
							let N = typeof B == "string" ? B : B.path;
							z.push(gi(typeof B == "string" ? B : B.data).then((P) => {
								n.mountExternalData(N, P);
							}));
						}
						await Promise.all(z);
					}
					for (let z of t?.executionProviders ?? []) if ((typeof z == "string" ? z : z.name) === "webnn") {
						if (n.shouldTransferToMLTensor = !1, typeof z != "string") {
							let B = z, N = B?.context, P = B?.gpuDevice, T = B?.deviceType, Y = B?.powerPreference;
							N ? n.currentContext = N : P ? n.currentContext = await n.webnnCreateMLContext(P) : n.currentContext = await n.webnnCreateMLContext({
								deviceType: T,
								powerPreference: Y
							});
						} else n.currentContext = await n.webnnCreateMLContext();
						break;
					}
					i = await n._OrtCreateSession(r, a, s), n.webgpuOnCreateSession?.(i), i === 0 && Le("Can't create a session."), n.jsepOnCreateSession?.(), n.currentContext && (n.webnnRegisterMLContext(i, n.currentContext), n.currentContext = void 0, n.shouldTransferToMLTensor = !0);
					let [f, w] = Ih(i), v = !!t?.enableGraphCapture, $ = [], k = [], C = [], I = [], E = [];
					for (let z = 0; z < f; z++) {
						let [B, N, P] = ks(i, z);
						B === 0 && Le("Can't get an input name."), c.push(B);
						let T = n.UTF8ToString(B);
						$.push(T), C.push(N === 0 ? {
							name: T,
							isTensor: !1
						} : {
							name: T,
							isTensor: !0,
							type: qt(N),
							shape: P
						});
					}
					for (let z = 0; z < w; z++) {
						let [B, N, P] = ks(i, z + f);
						B === 0 && Le("Can't get an output name."), h.push(B);
						let T = n.UTF8ToString(B);
						k.push(T), I.push(N === 0 ? {
							name: T,
							isTensor: !1
						} : {
							name: T,
							isTensor: !0,
							type: qt(N),
							shape: P
						});
						{
							if (v && t?.preferredOutputLocation === void 0) {
								E.push("gpu-buffer");
								continue;
							}
							let Y = typeof t?.preferredOutputLocation == "string" ? t.preferredOutputLocation : t?.preferredOutputLocation?.[T] ?? "cpu", X = n.webnnIsGraphOutput;
							if (Y === "cpu" && X && X(i, T)) {
								E.push("ml-tensor-cpu-output");
								continue;
							}
							if (Y !== "cpu" && Y !== "cpu-pinned" && Y !== "gpu-buffer" && Y !== "ml-tensor") throw new Error(`Not supported preferred output location: ${Y}.`);
							if (v && Y !== "gpu-buffer") throw new Error(`Not supported preferred output location: ${Y}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
							E.push(Y);
						}
					}
					let A = null;
					return E.some((z) => z === "gpu-buffer" || z === "ml-tensor" || z === "ml-tensor-cpu-output") && (l = n._OrtCreateBinding(i), l === 0 && Le("Can't create IO binding."), A = {
						handle: l,
						outputPreferredLocations: E,
						outputPreferredLocationsEncoded: E.map((z) => z === "ml-tensor-cpu-output" ? "ml-tensor" : z).map((z) => hi(z))
					}), ir.set(i, [
						i,
						c,
						h,
						A,
						v,
						!1
					]), [
						i,
						$,
						k,
						C,
						I
					];
				} catch (f) {
					throw c.forEach((w) => n._OrtFree(w)), h.forEach((w) => n._OrtFree(w)), l !== 0 && n._OrtReleaseBinding(l) !== 0 && Le("Can't release IO binding."), i !== 0 && n._OrtReleaseSession(i) !== 0 && Le("Can't release session."), f;
				} finally {
					n._free(r), s !== 0 && n._OrtReleaseSessionOptions(s) !== 0 && Le("Can't release session options."), d.forEach((f) => n._free(f)), n.unmountExternalData?.();
				}
			}, Es = (e) => {
				let t = We(), r = ir.get(e);
				if (!r) throw new Error(`cannot release session. invalid session id: ${e}`);
				let [a, n, i, s, l] = r;
				s && (l && t._OrtClearBoundOutputs(s.handle) !== 0 && Le("Can't clear bound outputs."), t._OrtReleaseBinding(s.handle) !== 0 && Le("Can't release IO binding.")), t.jsepOnReleaseSession?.(e), t.webnnOnReleaseSession?.(e), t.webgpuOnReleaseSession?.(e), n.forEach((d) => t._OrtFree(d)), i.forEach((d) => t._OrtFree(d)), t._OrtReleaseSession(a) !== 0 && Le("Can't release session."), ir.delete(e);
			}, Ts = async (e, t, r, a, n, i, s = !1) => {
				if (!e) {
					t.push(0);
					return;
				}
				let l = We(), d = l.PTR_SIZE, c = e[0], h = e[1], f = e[3], w = f, v, $;
				if (c === "string" && (f === "gpu-buffer" || f === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
				if (s && f !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${i} when enableGraphCapture is true.`);
				if (f === "gpu-buffer") {
					let I = e[2].gpuBuffer;
					$ = br(wr(c), h);
					{
						let E = l.jsepRegisterBuffer;
						if (!E) throw new Error("Tensor location \"gpu-buffer\" is not supported without using WebGPU.");
						v = E(a, i, I, $);
					}
				} else if (f === "ml-tensor") {
					let I = e[2].mlTensor;
					$ = br(wr(c), h);
					let E = l.webnnRegisterMLTensor;
					if (!E) throw new Error("Tensor location \"ml-tensor\" is not supported without using WebNN.");
					v = E(a, I, wr(c), h);
				} else {
					let I = e[2];
					if (Array.isArray(I)) {
						$ = d * I.length, v = l._malloc($), r.push(v);
						for (let E = 0; E < I.length; E++) {
							if (typeof I[E] != "string") throw new TypeError(`tensor data at index ${E} is not a string`);
							l.setValue(v + E * d, St(I[E], r), "*");
						}
					} else {
						let E = l.webnnIsGraphInput, A = l.webnnIsGraphOutput;
						if (c !== "string" && E && A) {
							let z = l.UTF8ToString(n);
							if (E(a, z) || A(a, z)) {
								let B = wr(c);
								$ = br(B, h), w = "ml-tensor";
								let N = l.webnnCreateTemporaryTensor, P = l.webnnUploadTensor;
								if (!N || !P) throw new Error("Tensor location \"ml-tensor\" is not supported without using WebNN.");
								let T = await N(a, B, h);
								P(T, new Uint8Array(I.buffer, I.byteOffset, I.byteLength)), v = T;
							} else $ = I.byteLength, v = l._malloc($), r.push(v), l.HEAPU8.set(new Uint8Array(I.buffer, I.byteOffset, $), v);
						} else $ = I.byteLength, v = l._malloc($), r.push(v), l.HEAPU8.set(new Uint8Array(I.buffer, I.byteOffset, $), v);
					}
				}
				let k = l.stackSave(), C = l.stackAlloc(4 * h.length);
				try {
					h.forEach((E, A) => l.setValue(C + A * d, E, d === 4 ? "i32" : "i64"));
					let I = l._OrtCreateTensor(wr(c), v, $, C, h.length, hi(w));
					I === 0 && Le(`Can't create tensor for input/output. session=${a}, index=${i}.`), t.push(I);
				} finally {
					l.stackRestore(k);
				}
			}, Is = async (e, t, r, a, n, i) => {
				let s = We(), l = s.PTR_SIZE, d = ir.get(e);
				if (!d) throw new Error(`cannot run inference. invalid session id: ${e}`);
				let c = d[0], h = d[1], f = d[2], w = d[3], v = d[4], $ = d[5], k = t.length, C = a.length, I = 0, E = [], A = [], z = [], B = [], N = [], P = s.stackSave(), T = s.stackAlloc(k * l), Y = s.stackAlloc(k * l), X = s.stackAlloc(C * l), ue = s.stackAlloc(C * l);
				try {
					[I, E] = bu(i), er("wasm prepareInputOutputTensor");
					for (let j = 0; j < k; j++) await Ts(r[j], A, B, e, h[t[j]], t[j], v);
					for (let j = 0; j < C; j++) await Ts(n[j], z, B, e, f[a[j]], k + a[j], v);
					tr("wasm prepareInputOutputTensor");
					for (let j = 0; j < k; j++) s.setValue(T + j * l, A[j], "*"), s.setValue(Y + j * l, h[t[j]], "*");
					for (let j = 0; j < C; j++) s.setValue(X + j * l, z[j], "*"), s.setValue(ue + j * l, f[a[j]], "*");
					if (w && !$) {
						let { handle: j, outputPreferredLocations: ne, outputPreferredLocationsEncoded: pe } = w;
						if (h.length !== k) throw new Error(`input count from feeds (${k}) is expected to be always equal to model's input count (${h.length}).`);
						er("wasm bindInputsOutputs");
						for (let he = 0; he < k; he++) {
							let ge = t[he];
							await s._OrtBindInput(j, h[ge], A[he]) !== 0 && Le(`Can't bind input[${he}] for session=${e}.`);
						}
						for (let he = 0; he < C; he++) {
							let ge = a[he];
							n[he]?.[3] ? (N.push(z[he]), s._OrtBindOutput(j, f[ge], z[he], 0) !== 0 && Le(`Can't bind pre-allocated output[${he}] for session=${e}.`)) : s._OrtBindOutput(j, f[ge], 0, pe[ge]) !== 0 && Le(`Can't bind output[${he}] to ${ne[he]} for session=${e}.`);
						}
						tr("wasm bindInputsOutputs"), ir.set(e, [
							c,
							h,
							f,
							w,
							v,
							!0
						]);
					}
					s.jsepOnRunStart?.(c), s.webnnOnRunStart?.(c);
					let ie;
					w ? ie = await s._OrtRunWithBinding(c, w.handle, C, X, I) : ie = await s._OrtRun(c, Y, T, k, ue, C, X, I), ie !== 0 && Le("failed to call OrtRun().");
					let K = [], U = [];
					er("wasm ProcessOutputTensor");
					for (let j = 0; j < C; j++) {
						let ne = Number(s.getValue(X + j * l, "*"));
						if (ne === z[j] || N.includes(z[j])) {
							K.push(n[j]), ne !== z[j] && s._OrtReleaseTensor(ne) !== 0 && Le("Can't release tensor.");
							continue;
						}
						let pe = s.stackSave(), he = s.stackAlloc(4 * l), ge = !1, V, se = 0;
						try {
							s._OrtGetTensorData(ne, he, he + l, he + 2 * l, he + 3 * l) !== 0 && Le(`Can't access output tensor data on index ${j}.`);
							let ke = l === 4 ? "i32" : "i64", ve = Number(s.getValue(he, ke));
							se = s.getValue(he + l, "*");
							let ee = s.getValue(he + l * 2, "*"), lt = Number(s.getValue(he + l * 3, ke)), ot = [];
							for (let Ae = 0; Ae < lt; Ae++) ot.push(Number(s.getValue(ee + Ae * l, ke)));
							s._OrtFree(ee) !== 0 && Le("Can't free memory for tensor dims.");
							let Pe = ot.reduce((Ae, Ye) => Ae * Ye, 1);
							V = qt(ve);
							let tt = w?.outputPreferredLocations[a[j]];
							if (V === "string") {
								if (tt === "gpu-buffer" || tt === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
								let Ae = [];
								for (let Ye = 0; Ye < Pe; Ye++) {
									let at = s.getValue(se + Ye * l, "*"), pt = s.getValue(se + (Ye + 1) * l, "*"), bt = Ye === Pe - 1 ? void 0 : pt - at;
									Ae.push(s.UTF8ToString(at, bt));
								}
								K.push([
									V,
									ot,
									Ae,
									"cpu"
								]);
							} else if (tt === "gpu-buffer" && Pe > 0) {
								let Ae = s.jsepGetBuffer;
								if (!Ae) throw new Error("preferredLocation \"gpu-buffer\" is not supported without using WebGPU.");
								let Ye = Ae(se), at = br(ve, Pe);
								if (at === void 0 || !mi(V)) throw new Error(`Unsupported data type: ${V}`);
								ge = !0, K.push([
									V,
									ot,
									{
										gpuBuffer: Ye,
										download: s.jsepCreateDownloader(Ye, at, V),
										dispose: () => {
											s._OrtReleaseTensor(ne) !== 0 && Le("Can't release tensor.");
										}
									},
									"gpu-buffer"
								]);
							} else if (tt === "ml-tensor" && Pe > 0) {
								let Ae = s.webnnEnsureTensor, Ye = s.webnnIsGraphInputOutputTypeSupported;
								if (!Ae || !Ye) throw new Error("preferredLocation \"ml-tensor\" is not supported without using WebNN.");
								if (br(ve, Pe) === void 0 || !fi(V)) throw new Error(`Unsupported data type: ${V}`);
								if (!Ye(e, V, !1)) throw new Error(`preferredLocation "ml-tensor" for ${V} output is not supported by current WebNN Context.`);
								let at = await Ae(e, se, ve, ot, !1);
								ge = !0, K.push([
									V,
									ot,
									{
										mlTensor: at,
										download: s.webnnCreateMLTensorDownloader(se, V),
										dispose: () => {
											s.webnnReleaseTensorId(se), s._OrtReleaseTensor(ne);
										}
									},
									"ml-tensor"
								]);
							} else if (tt === "ml-tensor-cpu-output" && Pe > 0) {
								let Ae = s.webnnCreateMLTensorDownloader(se, V)(), Ye = K.length;
								ge = !0, U.push((async () => {
									let at = [Ye, await Ae];
									return s.webnnReleaseTensorId(se), s._OrtReleaseTensor(ne), at;
								})()), K.push([
									V,
									ot,
									[],
									"cpu"
								]);
							} else {
								let Ae = new (Fa(V))(Pe);
								new Uint8Array(Ae.buffer, Ae.byteOffset, Ae.byteLength).set(s.HEAPU8.subarray(se, se + Ae.byteLength)), K.push([
									V,
									ot,
									Ae,
									"cpu"
								]);
							}
						} finally {
							s.stackRestore(pe), V === "string" && se && s._free(se), ge || s._OrtReleaseTensor(ne);
						}
					}
					w && !v && (s._OrtClearBoundOutputs(w.handle) !== 0 && Le("Can't clear bound outputs."), ir.set(e, [
						c,
						h,
						f,
						w,
						v,
						!1
					]));
					for (let [j, ne] of await Promise.all(U)) K[j][2] = ne;
					return tr("wasm ProcessOutputTensor"), K;
				} finally {
					s.webnnOnRunEnd?.(c), s.stackRestore(P), A.forEach((ie) => s._OrtReleaseTensor(ie)), z.forEach((ie) => s._OrtReleaseTensor(ie)), B.forEach((ie) => s._free(ie)), I !== 0 && s._OrtReleaseRunOptions(I), E.forEach((ie) => s._free(ie));
				}
			}, zs = (e) => {
				let t = We(), r = ir.get(e);
				if (!r) throw new Error("invalid session id");
				let a = r[0], n = t._OrtEndProfiling(a);
				n === 0 && Le("Can't get an profile file name."), t._OrtFree(n);
			}, Cs = (e) => {
				let t = [];
				for (let r of e) {
					let a = r[2];
					!Array.isArray(a) && "buffer" in a && t.push(a.buffer);
				}
				return t;
			};
		}), Os = Z(() => {
			"use strict";
			ht(), As(), rr(), Na(), sr = () => !!He.wasm.proxy && typeof document < "u", Lr = !1, pa = !1, ca = !1, cn = /* @__PURE__ */ new Map(), Er = (e, t) => {
				let r = cn.get(e);
				r ? r.push(t) : cn.set(e, [t]);
			}, Tr = () => {
				if (Lr || !pa || ca || !wt) throw new Error("worker not ready");
			}, zh = (e) => {
				switch (e.data.type) {
					case "init-wasm":
						Lr = !1, e.data.err ? (ca = !0, Rs[1](e.data.err)) : (pa = !0, Rs[0]()), pn && (URL.revokeObjectURL(pn), pn = void 0);
						break;
					case "init-ep":
					case "copy-from":
					case "create":
					case "release":
					case "run":
					case "end-profiling": {
						let t = cn.get(e.data.type);
						e.data.err ? t.shift()[1](e.data.err) : t.shift()[0](e.data.out);
						break;
					}
				}
			}, Ch = async () => {
				if (!pa) {
					if (Lr) throw new Error("multiple calls to 'initWasm()' detected.");
					if (ca) throw new Error("previous call to 'initWasm()' failed.");
					if (Lr = !0, sr()) return new Promise((e, t) => {
						wt?.terminate(), hu().then(([r, a]) => {
							try {
								wt = a, wt.onerror = (i) => t(i), wt.onmessage = zh, Rs = [e, t];
								let n = {
									type: "init-wasm",
									in: He
								};
								!n.in.wasm.wasmPaths && (r || si) && (n.in.wasm.wasmPaths = { wasm: new URL("/quizletapp/assets/ort-wasm-simd-threaded.jsep-DC5y_g6C.wasm", "" + self.location.href).href }), wt.postMessage(n), pn = r;
							} catch (n) {
								t(n);
							}
						}, t);
					});
					try {
						await ci(He.wasm), await $s(He), pa = !0;
					} catch (e) {
						throw ca = !0, e;
					} finally {
						Lr = !1;
					}
				}
			}, Ah = async (e) => {
				if (sr()) return Tr(), new Promise((t, r) => {
					Er("init-ep", [t, r]);
					let a = {
						type: "init-ep",
						in: {
							epName: e,
							env: He
						}
					};
					wt.postMessage(a);
				});
				await xs(He, e);
			}, Rh = async (e) => sr() ? (Tr(), new Promise((t, r) => {
				Er("copy-from", [t, r]);
				let a = {
					type: "copy-from",
					in: { buffer: e }
				};
				wt.postMessage(a, [e.buffer]);
			})) : dn(e), Oh = async (e, t) => {
				if (sr()) {
					if (t?.preferredOutputLocation) throw new Error("session option \"preferredOutputLocation\" is not supported for proxy.");
					return Tr(), new Promise((r, a) => {
						Er("create", [r, a]);
						let n = {
							type: "create",
							in: {
								model: e,
								options: { ...t }
							}
						}, i = [];
						e instanceof Uint8Array && i.push(e.buffer), wt.postMessage(n, i);
					});
				} else return Ss(e, t);
			}, Bh = async (e) => {
				if (sr()) return Tr(), new Promise((t, r) => {
					Er("release", [t, r]);
					let a = {
						type: "release",
						in: e
					};
					wt.postMessage(a);
				});
				Es(e);
			}, Dh = async (e, t, r, a, n, i) => {
				if (sr()) {
					if (r.some((s) => s[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
					if (n.some((s) => s)) throw new Error("pre-allocated output tensor is not supported for proxy.");
					return Tr(), new Promise((s, l) => {
						Er("run", [s, l]);
						let d = r, c = {
							type: "run",
							in: {
								sessionId: e,
								inputIndices: t,
								inputs: d,
								outputIndices: a,
								options: i
							}
						};
						wt.postMessage(c, Cs(d));
					});
				} else return Is(e, t, r, a, n, i);
			}, Mh = async (e) => {
				if (sr()) return Tr(), new Promise((t, r) => {
					Er("end-profiling", [t, r]);
					let a = {
						type: "end-profiling",
						in: e
					};
					wt.postMessage(a);
				});
				zs(e);
			};
		}), Uh = Z(() => {
			"use strict";
			ht(), Os(), fe(), Da(), _i(), Bs = (e, t) => {
				switch (e.location) {
					case "cpu": return [
						e.type,
						e.dims,
						e.data,
						"cpu"
					];
					case "gpu-buffer": return [
						e.type,
						e.dims,
						{ gpuBuffer: e.gpuBuffer },
						"gpu-buffer"
					];
					case "ml-tensor": return [
						e.type,
						e.dims,
						{ mlTensor: e.mlTensor },
						"ml-tensor"
					];
					default: throw new Error(`invalid data location: ${e.location} for ${t()}`);
				}
			}, Nh = (e) => {
				switch (e[3]) {
					case "cpu": return new xt(e[0], e[2], e[1]);
					case "gpu-buffer": {
						let t = e[0];
						if (!mi(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
						let { gpuBuffer: r, download: a, dispose: n } = e[2];
						return xt.fromGpuBuffer(r, {
							dataType: t,
							dims: e[1],
							download: a,
							dispose: n
						});
					}
					case "ml-tensor": {
						let t = e[0];
						if (!fi(t)) throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);
						let { mlTensor: r, download: a, dispose: n } = e[2];
						return xt.fromMLTensor(r, {
							dataType: t,
							dims: e[1],
							download: a,
							dispose: n
						});
					}
					default: throw new Error(`invalid data location: ${e[3]}`);
				}
			}, Ph = class {
				async fetchModelAndCopyToWasmMemory(e) {
					return Rh(await gi(e));
				}
				async loadModel(e, t) {
					kt();
					let r;
					typeof e == "string" ? r = await this.fetchModelAndCopyToWasmMemory(e) : r = e, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await Oh(r, t), yt();
				}
				async dispose() {
					return Bh(this.sessionId);
				}
				async run(e, t, r) {
					kt();
					let a = [], n = [];
					Object.entries(e).forEach((f) => {
						let w = f[0], v = f[1], $ = this.inputNames.indexOf(w);
						if ($ === -1) throw new Error(`invalid input '${w}'`);
						a.push(v), n.push($);
					});
					let i = [], s = [];
					Object.entries(t).forEach((f) => {
						let w = f[0], v = f[1], $ = this.outputNames.indexOf(w);
						if ($ === -1) throw new Error(`invalid output '${w}'`);
						i.push(v), s.push($);
					});
					let l = a.map((f, w) => Bs(f, () => `input "${this.inputNames[n[w]]}"`)), d = i.map((f, w) => f ? Bs(f, () => `output "${this.outputNames[s[w]]}"`) : null), c = await Dh(this.sessionId, n, l, s, d, r), h = {};
					for (let f = 0; f < c.length; f++) h[this.outputNames[s[f]]] = i[f] ?? Nh(c[f]);
					return yt(), h;
				}
				startProfiling() {}
				endProfiling() {
					Mh(this.sessionId);
				}
			};
		}), Ds = {}, hr(Ds, {
			OnnxruntimeWebAssemblyBackend: () => Ns,
			initializeFlags: () => Ms,
			wasmBackend: () => Lh
		}), Fh = Z(() => {
			"use strict";
			ht(), Os(), Uh(), Ms = () => {
				(typeof He.wasm.initTimeout != "number" || He.wasm.initTimeout < 0) && (He.wasm.initTimeout = 0);
				let e = He.wasm.simd;
				if (typeof e != "boolean" && e !== void 0 && e !== "fixed" && e !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`), He.wasm.simd = !1), typeof He.wasm.proxy != "boolean" && (He.wasm.proxy = !1), typeof He.wasm.trace != "boolean" && (He.wasm.trace = !1), typeof He.wasm.numThreads != "number" || !Number.isInteger(He.wasm.numThreads) || He.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) He.wasm.numThreads = 1;
				else {
					let t = typeof navigator > "u" ? Co("node:os").cpus().length : navigator.hardwareConcurrency;
					He.wasm.numThreads = Math.min(4, Math.ceil((t || 1) / 2));
				}
			}, Ns = class {
				async init(e) {
					Ms(), await Ch(), await Ah(e);
				}
				async createInferenceSessionHandler(e, t) {
					let r = new Ph();
					return await r.loadModel(e, t), r;
				}
			}, Lh = new Ns();
		}), ht(), ht(), ht(), qh = "1.27.0", Wh = ei;
		{
			let e = (Fh(), Mr(Ds)).wasmBackend;
			gr("webgpu", e, 5), gr("webnn", e, 5), gr("cpu", e, 10), gr("wasm", e, 10);
		}
		Object.defineProperty(He.versions, "web", {
			value: qh,
			enumerable: !0
		});
	}));
	var b0 = Object.defineProperty, Gh = (e) => {
		throw TypeError(e);
	}, v0 = (e, t, r) => t in e ? b0(e, t, {
		enumerable: !0,
		configurable: !0,
		writable: !0,
		value: r
	}) : e[t] = r, ma = (e, t, r) => v0(e, typeof t != "symbol" ? t + "" : t, r), Vh = (e, t, r) => t.has(e) || Gh("Cannot " + r), et = (e, t, r) => (Vh(e, t, "read from private field"), r ? r.call(e) : t.get(e)), Ir = (e, t, r) => t.has(e) ? Gh("Cannot add the same private member more than once") : t instanceof WeakSet ? t.add(e) : t.set(e, r), or = (e, t, r, a) => (Vh(e, t, "write to private field"), a ? a.call(e, r) : t.set(e, r), r), mn, Vt, At, fn, Fr, zr, hn;
	const gn = "https://huggingface.co/diffusionstudio/piper-voices/resolve/main", $0 = "https://cdnjs.cloudflare.com/ajax/libs/onnxruntime-web/1.23.0/", Hh = "https://cdn.jsdelivr.net/npm/@diffusionstudio/piper-wasm@1.0.0/build/piper_phonemize", jh = {
		"ar_JO-kareem-low": "ar/ar_JO/kareem/low/ar_JO-kareem-low.onnx",
		"ar_JO-kareem-medium": "ar/ar_JO/kareem/medium/ar_JO-kareem-medium.onnx",
		"ca_ES-upc_ona-medium": "ca/ca_ES/upc_ona/medium/ca_ES-upc_ona-medium.onnx",
		"ca_ES-upc_ona-x_low": "ca/ca_ES/upc_ona/x_low/ca_ES-upc_ona-x_low.onnx",
		"ca_ES-upc_pau-x_low": "ca/ca_ES/upc_pau/x_low/ca_ES-upc_pau-x_low.onnx",
		"cs_CZ-jirka-low": "cs/cs_CZ/jirka/low/cs_CZ-jirka-low.onnx",
		"cs_CZ-jirka-medium": "cs/cs_CZ/jirka/medium/cs_CZ-jirka-medium.onnx",
		"da_DK-talesyntese-medium": "da/da_DK/talesyntese/medium/da_DK-talesyntese-medium.onnx",
		"de_DE-eva_k-x_low": "de/de_DE/eva_k/x_low/de_DE-eva_k-x_low.onnx",
		"de_DE-karlsson-low": "de/de_DE/karlsson/low/de_DE-karlsson-low.onnx",
		"de_DE-kerstin-low": "de/de_DE/kerstin/low/de_DE-kerstin-low.onnx",
		"de_DE-mls-medium": "de/de_DE/mls/medium/de_DE-mls-medium.onnx",
		"de_DE-pavoque-low": "de/de_DE/pavoque/low/de_DE-pavoque-low.onnx",
		"de_DE-ramona-low": "de/de_DE/ramona/low/de_DE-ramona-low.onnx",
		"de_DE-thorsten-high": "de/de_DE/thorsten/high/de_DE-thorsten-high.onnx",
		"de_DE-thorsten-low": "de/de_DE/thorsten/low/de_DE-thorsten-low.onnx",
		"de_DE-thorsten-medium": "de/de_DE/thorsten/medium/de_DE-thorsten-medium.onnx",
		"de_DE-thorsten_emotional-medium": "de/de_DE/thorsten_emotional/medium/de_DE-thorsten_emotional-medium.onnx",
		"el_GR-rapunzelina-low": "el/el_GR/rapunzelina/low/el_GR-rapunzelina-low.onnx",
		"en_GB-alan-low": "en/en_GB/alan/low/en_GB-alan-low.onnx",
		"en_GB-alan-medium": "en/en_GB/alan/medium/en_GB-alan-medium.onnx",
		"en_GB-alba-medium": "en/en_GB/alba/medium/en_GB-alba-medium.onnx",
		"en_GB-aru-medium": "en/en_GB/aru/medium/en_GB-aru-medium.onnx",
		"en_GB-cori-high": "en/en_GB/cori/high/en_GB-cori-high.onnx",
		"en_GB-cori-medium": "en/en_GB/cori/medium/en_GB-cori-medium.onnx",
		"en_GB-jenny_dioco-medium": "en/en_GB/jenny_dioco/medium/en_GB-jenny_dioco-medium.onnx",
		"en_GB-northern_english_male-medium": "en/en_GB/northern_english_male/medium/en_GB-northern_english_male-medium.onnx",
		"en_GB-semaine-medium": "en/en_GB/semaine/medium/en_GB-semaine-medium.onnx",
		"en_GB-southern_english_female-low": "en/en_GB/southern_english_female/low/en_GB-southern_english_female-low.onnx",
		"en_GB-vctk-medium": "en/en_GB/vctk/medium/en_GB-vctk-medium.onnx",
		"en_US-amy-low": "en/en_US/amy/low/en_US-amy-low.onnx",
		"en_US-amy-medium": "en/en_US/amy/medium/en_US-amy-medium.onnx",
		"en_US-arctic-medium": "en/en_US/arctic/medium/en_US-arctic-medium.onnx",
		"en_US-danny-low": "en/en_US/danny/low/en_US-danny-low.onnx",
		"en_US-hfc_female-medium": "en/en_US/hfc_female/medium/en_US-hfc_female-medium.onnx",
		"en_US-hfc_male-medium": "en/en_US/hfc_male/medium/en_US-hfc_male-medium.onnx",
		"en_US-joe-medium": "en/en_US/joe/medium/en_US-joe-medium.onnx",
		"en_US-kathleen-low": "en/en_US/kathleen/low/en_US-kathleen-low.onnx",
		"en_US-kristin-medium": "en/en_US/kristin/medium/en_US-kristin-medium.onnx",
		"en_US-kusal-medium": "en/en_US/kusal/medium/en_US-kusal-medium.onnx",
		"en_US-l2arctic-medium": "en/en_US/l2arctic/medium/en_US-l2arctic-medium.onnx",
		"en_US-lessac-high": "en/en_US/lessac/high/en_US-lessac-high.onnx",
		"en_US-lessac-low": "en/en_US/lessac/low/en_US-lessac-low.onnx",
		"en_US-lessac-medium": "en/en_US/lessac/medium/en_US-lessac-medium.onnx",
		"en_US-libritts-high": "en/en_US/libritts/high/en_US-libritts-high.onnx",
		"en_US-libritts_r-medium": "en/en_US/libritts_r/medium/en_US-libritts_r-medium.onnx",
		"en_US-ljspeech-high": "en/en_US/ljspeech/high/en_US-ljspeech-high.onnx",
		"en_US-ljspeech-medium": "en/en_US/ljspeech/medium/en_US-ljspeech-medium.onnx",
		"en_US-ryan-high": "en/en_US/ryan/high/en_US-ryan-high.onnx",
		"en_US-ryan-low": "en/en_US/ryan/low/en_US-ryan-low.onnx",
		"en_US-ryan-medium": "en/en_US/ryan/medium/en_US-ryan-medium.onnx",
		"es_ES-carlfm-x_low": "es/es_ES/carlfm/x_low/es_ES-carlfm-x_low.onnx",
		"es_ES-davefx-medium": "es/es_ES/davefx/medium/es_ES-davefx-medium.onnx",
		"es_ES-mls_10246-low": "es/es_ES/mls_10246/low/es_ES-mls_10246-low.onnx",
		"es_ES-mls_9972-low": "es/es_ES/mls_9972/low/es_ES-mls_9972-low.onnx",
		"es_ES-sharvard-medium": "es/es_ES/sharvard/medium/es_ES-sharvard-medium.onnx",
		"es_MX-ald-medium": "es/es_MX/ald/medium/es_MX-ald-medium.onnx",
		"es_MX-claude-high": "es/es_MX/claude/high/es_MX-claude-high.onnx",
		"fa_IR-amir-medium": "fa/fa_IR/amir/medium/fa_IR-amir-medium.onnx",
		"fa_IR-gyro-medium": "fa/fa_IR/gyro/medium/fa_IR-gyro-medium.onnx",
		"fi_FI-harri-low": "fi/fi_FI/harri/low/fi_FI-harri-low.onnx",
		"fi_FI-harri-medium": "fi/fi_FI/harri/medium/fi_FI-harri-medium.onnx",
		"fr_FR-gilles-low": "fr/fr_FR/gilles/low/fr_FR-gilles-low.onnx",
		"fr_FR-mls-medium": "fr/fr_FR/mls/medium/fr_FR-mls-medium.onnx",
		"fr_FR-mls_1840-low": "fr/fr_FR/mls_1840/low/fr_FR-mls_1840-low.onnx",
		"fr_FR-siwis-low": "fr/fr_FR/siwis/low/fr_FR-siwis-low.onnx",
		"fr_FR-siwis-medium": "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx",
		"fr_FR-tom-medium": "fr/fr_FR/tom/medium/fr_FR-tom-medium.onnx",
		"fr_FR-upmc-medium": "fr/fr_FR/upmc/medium/fr_FR-upmc-medium.onnx",
		"hu_HU-anna-medium": "hu/hu_HU/anna/medium/hu_HU-anna-medium.onnx",
		"hu_HU-berta-medium": "hu/hu_HU/berta/medium/hu_HU-berta-medium.onnx",
		"hu_HU-imre-medium": "hu/hu_HU/imre/medium/hu_HU-imre-medium.onnx",
		"is_IS-bui-medium": "is/is_IS/bui/medium/is_IS-bui-medium.onnx",
		"is_IS-salka-medium": "is/is_IS/salka/medium/is_IS-salka-medium.onnx",
		"is_IS-steinn-medium": "is/is_IS/steinn/medium/is_IS-steinn-medium.onnx",
		"is_IS-ugla-medium": "is/is_IS/ugla/medium/is_IS-ugla-medium.onnx",
		"it_IT-riccardo-x_low": "it/it_IT/riccardo/x_low/it_IT-riccardo-x_low.onnx",
		"ka_GE-natia-medium": "ka/ka_GE/natia/medium/ka_GE-natia-medium.onnx",
		"kk_KZ-iseke-x_low": "kk/kk_KZ/iseke/x_low/kk_KZ-iseke-x_low.onnx",
		"kk_KZ-issai-high": "kk/kk_KZ/issai/high/kk_KZ-issai-high.onnx",
		"kk_KZ-raya-x_low": "kk/kk_KZ/raya/x_low/kk_KZ-raya-x_low.onnx",
		"lb_LU-marylux-medium": "lb/lb_LU/marylux/medium/lb_LU-marylux-medium.onnx",
		"ne_NP-google-medium": "ne/ne_NP/google/medium/ne_NP-google-medium.onnx",
		"ne_NP-google-x_low": "ne/ne_NP/google/x_low/ne_NP-google-x_low.onnx",
		"nl_BE-nathalie-medium": "nl/nl_BE/nathalie/medium/nl_BE-nathalie-medium.onnx",
		"nl_BE-nathalie-x_low": "nl/nl_BE/nathalie/x_low/nl_BE-nathalie-x_low.onnx",
		"nl_BE-rdh-medium": "nl/nl_BE/rdh/medium/nl_BE-rdh-medium.onnx",
		"nl_BE-rdh-x_low": "nl/nl_BE/rdh/x_low/nl_BE-rdh-x_low.onnx",
		"nl_NL-mls-medium": "nl/nl_NL/mls/medium/nl_NL-mls-medium.onnx",
		"nl_NL-mls_5809-low": "nl/nl_NL/mls_5809/low/nl_NL-mls_5809-low.onnx",
		"nl_NL-mls_7432-low": "nl/nl_NL/mls_7432/low/nl_NL-mls_7432-low.onnx",
		"no_NO-talesyntese-medium": "no/no_NO/talesyntese/medium/no_NO-talesyntese-medium.onnx",
		"pl_PL-darkman-medium": "pl/pl_PL/darkman/medium/pl_PL-darkman-medium.onnx",
		"pl_PL-gosia-medium": "pl/pl_PL/gosia/medium/pl_PL-gosia-medium.onnx",
		"pl_PL-mc_speech-medium": "pl/pl_PL/mc_speech/medium/pl_PL-mc_speech-medium.onnx",
		"pl_PL-mls_6892-low": "pl/pl_PL/mls_6892/low/pl_PL-mls_6892-low.onnx",
		"pt_BR-edresson-low": "pt/pt_BR/edresson/low/pt_BR-edresson-low.onnx",
		"pt_BR-faber-medium": "pt/pt_BR/faber/medium/pt_BR-faber-medium.onnx",
		"pt_PT-tugão-medium": "pt/pt_PT/tugão/medium/pt_PT-tugão-medium.onnx",
		"ro_RO-mihai-medium": "ro/ro_RO/mihai/medium/ro_RO-mihai-medium.onnx",
		"ru_RU-denis-medium": "ru/ru_RU/denis/medium/ru_RU-denis-medium.onnx",
		"ru_RU-dmitri-medium": "ru/ru_RU/dmitri/medium/ru_RU-dmitri-medium.onnx",
		"ru_RU-irina-medium": "ru/ru_RU/irina/medium/ru_RU-irina-medium.onnx",
		"ru_RU-ruslan-medium": "ru/ru_RU/ruslan/medium/ru_RU-ruslan-medium.onnx",
		"sk_SK-lili-medium": "sk/sk_SK/lili/medium/sk_SK-lili-medium.onnx",
		"sl_SI-artur-medium": "sl/sl_SI/artur/medium/sl_SI-artur-medium.onnx",
		"sr_RS-serbski_institut-medium": "sr/sr_RS/serbski_institut/medium/sr_RS-serbski_institut-medium.onnx",
		"sv_SE-nst-medium": "sv/sv_SE/nst/medium/sv_SE-nst-medium.onnx",
		"sw_CD-lanfrica-medium": "sw/sw_CD/lanfrica/medium/sw_CD-lanfrica-medium.onnx",
		"tr_TR-dfki-medium": "tr/tr_TR/dfki/medium/tr_TR-dfki-medium.onnx",
		"tr_TR-fahrettin-medium": "tr/tr_TR/fahrettin/medium/tr_TR-fahrettin-medium.onnx",
		"tr_TR-fettah-medium": "tr/tr_TR/fettah/medium/tr_TR-fettah-medium.onnx",
		"uk_UA-lada-x_low": "uk/uk_UA/lada/x_low/uk_UA-lada-x_low.onnx",
		"uk_UA-ukrainian_tts-medium": "uk/uk_UA/ukrainian_tts/medium/uk_UA-ukrainian_tts-medium.onnx",
		"vi_VN-25hours_single-low": "vi/vi_VN/25hours_single/low/vi_VN-25hours_single-low.onnx",
		"vi_VN-vais1000-medium": "vi/vi_VN/vais1000/medium/vi_VN-vais1000-medium.onnx",
		"vi_VN-vivos-x_low": "vi/vi_VN/vivos/x_low/vi_VN-vivos-x_low.onnx",
		"zh_CN-huayan-medium": "zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx",
		"zh_CN-huayan-x_low": "zh/zh_CN/huayan/x_low/zh_CN-huayan-x_low.onnx",
		"cy_GB-gwryw_gogleddol-medium": "cy/cy_GB/gwryw_gogleddol/medium/cy_GB-gwryw_gogleddol-medium.onnx",
		"en_US-bryce-medium": "en/en_US/bryce/medium/en_US-bryce-medium.onnx",
		"en_US-john-medium": "en/en_US/john/medium/en_US-john-medium.onnx",
		"en_US-norman-medium": "en/en_US/norman/medium/en_US-norman-medium.onnx",
		"it_IT-paola-medium": "it/it_IT/paola/medium/it_IT-paola-medium.onnx"
	};
	async function x0(e, t) {
		if (e.match("https://huggingface.co")) try {
			const r = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper", { create: !0 }), a = e.split("/").at(-1), n = await (await r.getFileHandle(a, { create: !0 })).createWritable();
			await n.write(t), await n.close();
		} catch (r) {
			console.error(r);
		}
	}
	async function k0(e) {
		try {
			const t = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper"), r = e.split("/").at(-1);
			await (await t.getFileHandle(r)).remove();
		} catch (t) {
			console.error(t);
		}
	}
	async function S0(e) {
		if (e.match("https://huggingface.co")) try {
			const t = await (await navigator.storage.getDirectory()).getDirectoryHandle("piper", { create: !0 }), r = e.split("/").at(-1);
			return await (await t.getFileHandle(r)).getFile();
		} catch {
			return;
		}
	}
	async function E0(e, t) {
		var r;
		const a = await fetch(e), n = (r = a.body) == null ? void 0 : r.getReader(), i = +(a.headers.get("Content-Length") ?? 0);
		let s = 0, l = [];
		for (; n;) {
			const { done: d, value: c } = await n.read();
			if (d) break;
			l.push(c), s += c.length, t?.({
				url: e,
				total: i,
				loaded: s
			});
		}
		return new Blob(l, { type: a.headers.get("Content-Type") ?? void 0 });
	}
	function T0(e, t, r) {
		const a = e.length, n = 44, i = /* @__PURE__ */ new DataView(/* @__PURE__ */ new ArrayBuffer(a * t * 2 + n));
		i.setUint32(0, 1179011410, !0), i.setUint32(4, i.buffer.byteLength - 8, !0), i.setUint32(8, 1163280727, !0), i.setUint32(12, 544501094, !0), i.setUint32(16, 16, !0), i.setUint16(20, 1, !0), i.setUint16(22, t, !0), i.setUint32(24, r, !0), i.setUint32(28, t * 2 * r, !0), i.setUint16(32, t * 2, !0), i.setUint16(34, 16, !0), i.setUint32(36, 1635017060, !0), i.setUint32(40, 2 * a, !0);
		let s = n;
		for (let l = 0; l < a; l++) {
			const d = e[l];
			d >= 1 ? i.setInt16(s, 32767, !0) : d <= -1 ? i.setInt16(s, -32768, !0) : i.setInt16(s, d * 32768 | 0, !0), s += 2;
		}
		return i.buffer;
	}
	const Ps = {
		onnxWasm: $0,
		piperData: `${Hh}.data`,
		piperWasm: `${Hh}.wasm`
	}, Us = class Qt {
		constructor({ voiceId: t, progress: r, logger: a, wasmPaths: n }) {
			ma(this, "ready", !1), ma(this, "voiceId", "en_US-hfc_female-medium"), ma(this, "waitReady", !1), Ir(this, mn), Ir(this, Vt), Ir(this, At), Ir(this, fn), Ir(this, Fr), Ir(this, zr, Ps), Ir(this, hn);
			var i;
			return Qt._instance ? (a?.("Reusing session for TTS!"), Qt._instance.voiceId = t ?? Qt._instance.voiceId, or(Qt._instance, Fr, r ?? et(Qt._instance, Fr)), Qt._instance) : (a?.("New session"), or(this, hn, a), this.voiceId = t, or(this, Fr, r), this.waitReady = this.init(), or(this, zr, n ?? Ps), (i = et(this, hn)) == null || i.call(this, `Loaded WASMPaths at: ${JSON.stringify(et(this, zr))}`), Qt._instance = this, this);
		}
		static async create(t) {
			const r = new Qt(t);
			return await r.waitReady, r;
		}
		async init() {
			const { createPiperPhonemize: t } = await Promise.resolve().then(() => (_0(), g0));
			or(this, mn, t), or(this, At, await Promise.resolve().then(() => (w0(), y0))), et(this, At).env.allowLocalModels = !1, et(this, At).env.wasm.numThreads = navigator.hardwareConcurrency, et(this, At).env.wasm.wasmPaths = et(this, zr).onnxWasm;
			const r = jh[this.voiceId], a = await Kh(`${gn}/${r}.json`);
			or(this, Vt, JSON.parse(await a.text()));
			const n = await Kh(`${gn}/${r}`, et(this, Fr));
			or(this, fn, await et(this, At).InferenceSession.create(await n.arrayBuffer()));
		}
		async predict(t) {
			await this.waitReady;
			const r = JSON.stringify([{ text: t.trim() }]), a = await new Promise(async (w) => {
				(await et(this, mn).call(this, {
					print: (v) => {
						w(JSON.parse(v).phoneme_ids);
					},
					printErr: (v) => {
						throw new Error(v);
					},
					locateFile: (v) => v.endsWith(".wasm") ? et(this, zr).piperWasm : v.endsWith(".data") ? et(this, zr).piperData : v
				})).callMain([
					"-l",
					et(this, Vt).espeak.voice,
					"--input",
					r,
					"--espeak_data",
					"/espeak-ng-data"
				]);
			}), n = 0, i = et(this, Vt).audio.sample_rate, s = et(this, Vt).inference.noise_scale, l = et(this, Vt).inference.length_scale, d = et(this, Vt).inference.noise_w, c = et(this, fn), h = {
				input: new (et(this, At)).Tensor("int64", a, [1, a.length]),
				input_lengths: new (et(this, At)).Tensor("int64", [a.length]),
				scales: new (et(this, At)).Tensor("float32", [
					s,
					l,
					d
				])
			};
			Object.keys(et(this, Vt).speaker_id_map).length && Object.assign(h, { sid: new (et(this, At)).Tensor("int64", [n]) });
			const { output: { data: f } } = await c.run(h);
			return new Blob([T0(f, 1, i)], { type: "audio/x-wav" });
		}
	};
	mn = /* @__PURE__ */ new WeakMap(), Vt = /* @__PURE__ */ new WeakMap(), At = /* @__PURE__ */ new WeakMap(), fn = /* @__PURE__ */ new WeakMap(), Fr = /* @__PURE__ */ new WeakMap(), zr = /* @__PURE__ */ new WeakMap(), hn = /* @__PURE__ */ new WeakMap(), ma(Us, "WASM_LOCATIONS", Ps), ma(Us, "_instance", null);
	let I0 = Us;
	async function Kh(e, t) {
		let r = await S0(e);
		return r || (r = await E0(e, t), await x0(e, r)), r;
	}
	async function Ls(e) {
		const t = jh[e], r = [`${gn}/${t}`, `${gn}/${t}.json`];
		await Promise.all(r.map((a) => k0(a)));
	}
	const z0 = "RIFF", C0 = "WAVE", A0 = "fmt ", R0 = "data";
	function Fs(e, t) {
		return String.fromCharCode(...e.subarray(t, t + 4));
	}
	function O0(e) {
		const t = new Uint8Array(e);
		if (t.byteLength < 44 || Fs(t, 0) !== z0 || Fs(t, 8) !== C0) return null;
		const r = new DataView(e);
		let a = 12, n, i, s, l, d;
		for (; a + 8 <= t.byteLength;) {
			const c = Fs(t, a), h = r.getUint32(a + 4, !0), f = a + 8, w = f + h + h % 2;
			if (w > t.byteLength) return null;
			if (c === A0) {
				if (h < 16) return null;
				n = r.getUint16(f, !0), i = r.getUint16(f + 2, !0), s = r.getUint32(f + 4, !0), l = r.getUint16(f + 12, !0), d = r.getUint16(f + 14, !0);
			}
			if (c === R0) return n !== 1 || !i || !s || !l || !d || ![
				8,
				16,
				24,
				32
			].includes(d) || l !== i * (d / 8) || h % l !== 0 ? null : {
				bytes: t,
				dataOffset: f,
				dataLength: h,
				dataPaddingLength: h % 2,
				sampleRate: s,
				blockAlign: l,
				bitsPerSample: d
			};
			a = w;
		}
		return null;
	}
	function B0(e, t = {}) {
		const r = O0(e), a = t.leadingSilenceMs ?? 140, n = t.trailingSilenceMs ?? 80;
		if (!r || !Number.isFinite(a) || !Number.isFinite(n) || a < 0 || n < 0) return e;
		const i = Math.round(r.sampleRate * a / 1e3), s = Math.round(r.sampleRate * n / 1e3), l = i * r.blockAlign, d = s * r.blockAlign;
		if (!Number.isSafeInteger(l) || !Number.isSafeInteger(d) || l < 0 || d < 0 || l + d === 0) return e;
		const c = r.dataLength + l + d;
		if (!Number.isSafeInteger(c) || c > 4294967295) return e;
		const h = c % 2, f = r.dataOffset + r.dataLength + r.dataPaddingLength, w = new Uint8Array(r.bytes.byteLength + l + d + h - r.dataPaddingLength);
		w.set(r.bytes.subarray(0, r.dataOffset), 0);
		const v = new DataView(w.buffer);
		v.setUint32(r.dataOffset - 4, c, !0);
		const $ = r.bitsPerSample === 8 ? 128 : 0;
		return w.fill($, r.dataOffset, r.dataOffset + l), w.set(r.bytes.subarray(r.dataOffset, r.dataOffset + r.dataLength), r.dataOffset + l), w.fill($, r.dataOffset + l + r.dataLength, r.dataOffset + c), w.set(r.bytes.subarray(f), r.dataOffset + c + h), v.setUint32(4, w.byteLength - 8, !0), w.buffer;
	}
	async function D0(e, t = {}) {
		const r = B0(await e.arrayBuffer(), t);
		return r.byteLength === e.size ? e : new Blob([r], { type: e.type || "audio/wav" });
	}
	const _n = "tutrinh-local-tts-models-v1", yn = "en_US-lessac-medium";
	let fa = null, qs = null, Ws = null, Xh = !1;
	const Zh = self.fetch.bind(self);
	function ur(e, t) {
		const r = encodeURIComponent(`${e.modelUrl}|${e.configUrl}`);
		return new Request(`https://local-tts-cache.invalid/en/${encodeURIComponent(e.version)}/${r}/${t}`);
	}
	function wn(e, t) {
		self.postMessage({
			id: e,
			type: "progress",
			progress: t
		});
	}
	async function Yh(e) {
		const t = await crypto.subtle.digest("SHA-256", await e.arrayBuffer());
		return Array.from(new Uint8Array(t), (r) => r.toString(16).padStart(2, "0")).join("");
	}
	async function Qh(e) {
		const t = await caches.open(_n), [r, a] = await Promise.all([t.match(ur(e, "model")), t.match(ur(e, "config"))]);
		if (!r || !a) return !1;
		const n = await r.blob();
		if (n.size < e.expectedBytes || e.expectedSha256 && (await Yh(n)).toLowerCase() !== e.expectedSha256.toLowerCase()) return !1;
		try {
			const i = await a.json();
			return Number(i.audio?.sample_rate) > 0;
		} catch {
			return !1;
		}
	}
	async function Jh(e, t, r) {
		const a = r === "model" ? t.modelUrl : t.configUrl, n = await Zh(a, { cache: "no-store" });
		if (!n.ok || !n.body) throw new Error(`Không tải được ${r === "model" ? "model" : "cấu hình"} Local TTS (${n.status}).`);
		const i = Number(n.headers.get("content-length") || (r === "model" ? t.expectedBytes : 0)), s = n.body.getReader(), l = [];
		let d = 0;
		for (;;) {
			const h = await s.read();
			if (h.done) break;
			l.push(h.value.buffer.slice(h.value.byteOffset, h.value.byteOffset + h.value.byteLength)), d += h.value.byteLength, wn(e, {
				phase: "download",
				loaded: d,
				total: i
			});
		}
		const c = new Blob(l, { type: r === "model" ? "application/octet-stream" : "application/json" });
		if (r === "model" && c.size < t.expectedBytes) throw new Error("Model Local TTS bị tải thiếu. Hãy thử tải lại.");
		if (r === "model" && t.expectedSha256 && (await Yh(c)).toLowerCase() !== t.expectedSha256.toLowerCase()) throw new Error("Kiểm tra toàn vẹn model Local TTS thất bại. Hãy tải lại.");
		await (await caches.open(_n)).put(ur(t, r), new Response(c, { headers: { "content-length": String(c.size) } }));
	}
	async function M0(e, t) {
		const r = await caches.open(_n);
		if (!await Qh(t)) {
			await Promise.all([r.delete(ur(t, "model")), r.delete(ur(t, "config"))]);
			let a;
			for (let n = 0; n < 2; n += 1) try {
				if (await Jh(e, t, "config"), await Jh(e, t, "model"), await Qh(t)) return;
			} catch (i) {
				a = i, await Promise.all([r.delete(ur(t, "model")), r.delete(ur(t, "config"))]);
			}
			throw a instanceof Error ? a : /* @__PURE__ */ new Error("Không thể tải model Local TTS. Hãy kiểm tra mạng rồi thử lại.");
		}
	}
	function N0() {
		Xh || (Xh = !0, self.fetch = (async (e, t) => {
			const r = typeof e == "string" ? e : e instanceof URL ? e.href : e.url;
			if (r.includes("en_US-lessac-medium.onnx")) {
				const a = Ws;
				if (a) {
					const n = await caches.open(_n), i = r.endsWith(".json") ? "config" : "model", s = await n.match(ur(a, i));
					if (s) return s.clone();
				}
			}
			return Zh(e, t);
		}));
	}
	async function P0(e, t) {
		return await M0(e, t), N0(), fa && qs === t.version || (await Ls(yn), qs = t.version, Ws = t, wn(e, { phase: "load" }), fa = await I0.create({
			voiceId: yn,
			progress: (r) => wn(e, {
				phase: "download",
				loaded: r.loaded,
				total: r.total
			})
		}), await Ls(yn), wn(e, { phase: "ready" })), fa;
	}
	self.onmessage = async (e) => {
		const { id: t, type: r, text: a, config: n } = e.data;
		try {
			if (r === "remove") {
				await Ls(yn), fa = null, qs = null, Ws = null, self.postMessage({
					id: t,
					type: "result"
				});
				return;
			}
			const i = await P0(t, n);
			if (r === "prepare") {
				self.postMessage({
					id: t,
					type: "result"
				});
				return;
			}
			const l = await D0(await i.predict(a || ""));
			self.postMessage({
				id: t,
				type: "result",
				blob: l
			});
		} catch (i) {
			self.postMessage({
				id: t,
				type: "error",
				message: i instanceof Error ? i.message : "Không thể khởi tạo Local TTS."
			});
		}
	};
})();
