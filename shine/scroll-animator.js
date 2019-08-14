(function() {
	"use strict";

	if(!('animationWorklet' in CSS)) {
		document.write("You need AnimationWorklet to see this demo :(");
		return;
	}

	async function init() {
		await CSS.animationWorklet.addModule('./passthrough.js');

		const things = document.querySelectorAll('.thing-bg');
		const timeline = new ScrollTimeline({
			scrollSource: document.html,
			orientation: "vertical", // "horizontal" or "vertical".
			timeRange: 2000
		});

		things.forEach((thing) => {

			const effect = new KeyframeEffect(
				thing,
				[
					{
						'transform': 'translate(-50%, -50%) rotate(45deg)'
					},
					{
						'transform': 'translate(-50%, -50%) rotate(315deg)'
					}
				],
				{
					duration: 2000,
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
