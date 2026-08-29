sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"spacefarers/test/integration/pages/SpacefarersList.gen",
	"spacefarers/test/integration/pages/SpacefarersObjectPage.gen"
], function (JourneyRunner, SpacefarersListGenerated, SpacefarersObjectPageGenerated) {
    'use strict';

    const runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('spacefarers') + '/test/flp.html#app-preview',
        pages: {
			onTheSpacefarersListGenerated: SpacefarersListGenerated,
			onTheSpacefarersObjectPageGenerated: SpacefarersObjectPageGenerated
        },
        async: true
    });

    return runner;
});

