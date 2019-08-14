(function() {
	"use strict";

	if(!('animationWorklet' in CSS)) {
		document.write("You need AnimationWorklet to see this demo :(");
		return;
	}

	async function init() {
		await CSS.animationWorklet.addModule('./passthrough.js');

		const things = document.querySelectorAll('.nav');
		const timeline = new ScrollTimeline({
			scrollSource: document.html,
			orientation: "vertical", // "horizontal" or "vertical".
			timeRange: 1000
		});

		things.forEach((thing) => {

			const effect = new KeyframeEffect(
				thing,
				[
					{
						'backgroundColor': 'transparent'
					},
					{
						'backgroundColor': '#fff'
					}
				],
				{
					duration: (1000 * 38) / document.body.scrollHeight, // 38 is the height of our nav
					fill: 'both'
				}
			);

			new WorkletAnimation(
				'passthrough',
				effect,
				timeline
			).play();

		});
	}
	init();
})();
