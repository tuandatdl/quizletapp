(function() {
	const v = [
		.40255,
		1.18385,
		3.173,
		15.69105,
		7.1949,
		.5345,
		1.4604,
		.0046,
		1.54575,
		.1192,
		1.01925,
		1.9395,
		.11,
		.29605,
		.2298,
		.2615,
		2.9498,
		.5,
		0
	], U = 19 / 81, F = [
		[.01, 100],
		[.01, 100],
		[.01, 100],
		[.01, 100],
		[1, 10],
		[.01, 5],
		[.01, 5],
		[0, .75],
		[0, 4.5],
		[0, .8],
		[.01, 3.5],
		[.5, 5],
		[.01, .5],
		[.01, 2],
		[0, 2],
		[0, 1],
		[1, 6],
		[.1, .9],
		[0, 0]
	];
	function Z(c, s = 6) {
		const n = s * 3600 * 1e3, o = /* @__PURE__ */ new Map();
		for (const a of c) {
			const f = o.get(a.cardId) || [];
			f.push(a), o.set(a.cardId, f);
		}
		const e = [];
		for (const [, a] of o) {
			a.sort((h, u) => h.reviewedAt - u.reviewedAt);
			let f = -1 / 0;
			for (const h of a) h.reviewedAt - f >= n && (e.push(h), f = h.reviewedAt);
		}
		return e.sort((a, f) => a.reviewedAt - f.reviewedAt);
	}
	function B(c, s = .2) {
		const n = /* @__PURE__ */ new Map();
		for (const t of c) {
			const l = n.get(t.cardId) || [];
			l.push(t), n.set(t.cardId, l);
		}
		const o = Array.from(n.keys());
		if (o.length <= 1) {
			const t = Math.max(1, Math.floor(c.length * (1 - s)));
			return {
				train: c.slice(0, t),
				val: c.slice(t)
			};
		}
		const e = Math.max(1, Math.round(o.length * s)), a = o.length - e, f = /* @__PURE__ */ new Set(), h = /* @__PURE__ */ new Set();
		o.forEach((t, l) => {
			l < a ? f.add(t) : h.add(t);
		});
		const u = [], r = [];
		for (const t of c) h.has(t.cardId) ? r.push(t) : u.push(t);
		return {
			train: u,
			val: r
		};
	}
	function C(c, s, n) {
		const o = Math.max(.01, s), e = n[17] ?? .5, a = Math.pow(1 + U * (c / o), -e);
		return Math.max(1e-5, Math.min(.99999, a));
	}
	function W(c, s) {
		const n = s[4] ?? 7.1949, o = s[5] ?? .5345, e = n - Math.exp(o * (c - 1)) + 1;
		return Math.max(1, Math.min(10, e));
	}
	function O(c, s, n) {
		const o = n[6] ?? 1.4604, e = n[7] ?? .0046, a = W(3, n), f = -o * (s - 3), h = e * a + (1 - e) * (c + f);
		return Math.max(1, Math.min(10, h));
	}
	function k(c, s) {
		const n = Math.max(0, Math.min(3, c - 1));
		return Math.max(.1, s[n] ?? 3.173);
	}
	function P(c, s, n, o, e) {
		const a = e[8] ?? 1.54575, f = e[9] ?? .1192, h = e[10] ?? 1.01925, u = e[15] ?? .2615, r = e[16] ?? 2.9498, t = o === 2 ? u : o === 4 ? r : 1, l = Math.max(.01, Math.min(1, n)), M = Math.max(.1, c), d = Math.exp(a) * (11 - s) * Math.pow(M, -f) * (Math.exp(h * (1 - l)) - 1) * t;
		return Math.max(.1, M * (1 + d));
	}
	function N(c, s, n, o) {
		const e = o[11] ?? 1.9395, a = o[12] ?? .11, f = o[13] ?? .29605, h = o[14] ?? .2298, u = Math.max(1, Math.min(10, s)), r = Math.max(.1, c), t = Math.max(.01, Math.min(1, n)), l = e * Math.pow(u, -a) * (Math.pow(r + 1, f) - 1) * Math.exp(h * (1 - t));
		return Math.max(.1, Math.min(r, l));
	}
	function x(c, s, n = .01) {
		if (c.length === 0) return {
			totalLoss: 0,
			bceLoss: 0,
			l2Loss: 0
		};
		const o = /* @__PURE__ */ new Map();
		for (const r of c) {
			const t = o.get(r.cardId) || [];
			t.push(r), o.set(r.cardId, t);
		}
		let e = 0, a = 0;
		for (const [, r] of o) {
			r.sort((M, d) => M.reviewedAt - d.reviewedAt);
			let t = null, l = null;
			for (let M = 0; M < r.length; M++) {
				const d = r[M], m = d.grade, w = m === 1 ? 0 : 1;
				if (t === null || l === null) if (d.state === "new" || !d.lastStability) t = k(m, s), l = W(m, s);
				else {
					const p = C(Math.max(.01, d.elapsedDays), d.lastStability, s);
					e += -(w * Math.log(p) + (1 - w) * Math.log(1 - p)), a++, l = O(d.lastDifficulty || 5, m, s), m === 1 ? t = N(d.lastStability, l, p, s) : t = P(d.lastStability, l, p, m, s);
					continue;
				}
				else {
					const p = C(Math.max(.01, d.elapsedDays), t, s);
					e += -(w * Math.log(p) + (1 - w) * Math.log(1 - p)), a++, l = O(l, m, s), m === 1 ? t = N(t, l, p, s) : t = P(t, l, p, m, s);
				}
			}
		}
		const f = a > 0 ? e / a : 0;
		let h = 0;
		for (let r = 0; r < 17; r++) {
			const t = (s[r] ?? 0) - (v[r] ?? 0);
			h += t * t;
		}
		const u = .5 * n * h;
		return {
			totalLoss: f + u,
			bceLoss: f,
			l2Loss: u
		};
	}
	function q(c) {
		const { logs: s, customWeights: n, epochs: o = 30, learningRate: e = .03, regularizationWeight: a = .01, valRatio: f = .2, onProgress: h } = c, { train: u, val: r } = B(Z(s), f), t = [...n && n.length === 19 ? n : v], l = new Array(17).fill(0), M = new Array(17).fill(0), d = .9, m = .999, w = 1e-8, p = 1e-4, j = x(u, t, a).totalLoss;
		for (let g = 1; g <= o; g++) {
			const H = new Array(17).fill(0);
			for (let i = 0; i < 17; i++) {
				const y = [...t], S = F[i] ?? [.01, 100];
				y[i] = Math.min(S[1], (y[i] ?? 0) + p);
				const E = x(u, y, a).totalLoss, L = [...t];
				L[i] = Math.max(S[0], (L[i] ?? 0) - p);
				const I = x(u, L, a).totalLoss, R = (y[i] ?? 0) - (L[i] ?? 0);
				H[i] = R > 0 ? (E - I) / R : 0;
			}
			for (let i = 0; i < 17; i++) {
				const y = H[i] ?? 0, S = l[i] ?? 0, E = M[i] ?? 0, L = d * S + .09999999999999998 * y, I = m * E + .0010000000000000009 * y * y;
				l[i] = L, M[i] = I;
				const R = L / (1 - Math.pow(d, g)), $ = I / (1 - Math.pow(m, g)), tt = (t[i] ?? v[i] ?? 0) - e / (Math.sqrt($) + w) * R, G = F[i] ?? [.01, 100];
				t[i] = Math.max(G[0], Math.min(G[1], tt));
			}
			const V = t[0] ?? .40255, D = t[1] ?? 1.18385, T = t[2] ?? 3.173, X = t[3] ?? 15.69105;
			D < V && (t[1] = V), T < (t[1] ?? D) && (t[2] = t[1] ?? D), X < (t[2] ?? T) && (t[3] = t[2] ?? T);
			const Y = x(u, t, a).totalLoss;
			(g % 5 === 0 || g === o) && h && h({
				epoch: g,
				totalEpochs: o,
				currentLoss: Y
			});
		}
		const J = x(u, t, a).totalLoss, A = r.length > 0 ? r : u, b = x(A, v, 0).bceLoss, z = x(A, t, 0).bceLoss, K = b > 0 ? (b - z) / b * 100 : 0, _ = Math.max(-100, Math.min(100, K)), Q = _ >= 1.5;
		return {
			optimizedWeights: t.map((g) => Number(g.toFixed(5))),
			initialLoss: Number(j.toFixed(5)),
			finalLoss: Number(J.toFixed(5)),
			valLossDefault: Number(b.toFixed(5)),
			valLossOptimized: Number(z.toFixed(5)),
			isAccepted: Q,
			improvementPercent: Number(_.toFixed(2)),
			trainCount: u.length,
			valCount: A.length
		};
	}
	typeof self < "u" && typeof self.postMessage == "function" && (self.onmessage = (c) => {
		const { type: s, payload: n } = c.data;
		if (s === "START_OPTIMIZATION") try {
			const o = q({
				logs: n.logs,
				customWeights: n.customWeights,
				epochs: n.epochs,
				learningRate: n.learningRate,
				regularizationWeight: n.regularizationWeight,
				onProgress: (e) => {
					self.postMessage({
						type: "OPTIMIZER_PROGRESS",
						payload: {
							...e,
							currentValLoss: e.currentLoss
						}
					});
				}
			});
			self.postMessage({
				type: "OPTIMIZER_SUCCESS",
				payload: o
			});
		} catch (o) {
			const e = o instanceof Error ? o.message : "Tối ưu hóa FSRS thất bại.";
			self.postMessage({
				type: "OPTIMIZER_ERROR",
				payload: {
					message: e,
					error: e
				}
			});
		}
	});
})();
