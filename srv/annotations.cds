using SpacefarerService as service from './spacefarer-service';

annotate service.Spacefarers with @(UI: {

    HeaderInfo         : {
        TypeName      : 'Spacefarer',
        TypeNamePlural: 'Spacefarers',
        Title         : {Value: firstName},
        Description   : {Value: lastName}

    },
    SelectionFields    : [
        originPlanet,
        spacesuitColor,
        department_ID
    ],
    LineItem           : [
        {
            Value: firstName,
            Label: 'First Name',
        },
        {
            Value: lastName,
            Label: 'Last Name'
        },
        {
            Value: originPlanet,
            Label: 'Origin Planet'
        },
        {
            Value: spacesuitColor,
            Label: 'Spacesuit Color'
        },
        {
            Value: stardustCollection,
            Label: 'Stardust Collection'
        },
        {
            Value: wormholeNavSkill,
            Label: 'Wormhole Navigation Skill'
        }
    ],
    // to test pagination with few items
    PresentationVariant: {
        Text          : 'Default',
        SortOrder     : [{
            Property  : stardustCollection,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem'],
        RequestAtLeast: [originPlanet],
        MaxItems      : 2
    }
});
