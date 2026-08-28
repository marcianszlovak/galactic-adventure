using SpacefarerService as service from './spacefarer-service';

annotate service.Spacefarers with @(UI: {

    HeaderInfo               : {
        TypeName      : 'Spacefarer',
        TypeNamePlural: 'Spacefarers',
        Title         : {Value: firstName},
        Description   : {Value: lastName}

    },
    SelectionFields          : [
        originPlanet,
        spacesuitColor,
        department_ID
    ],
    LineItem                 : [
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
    PresentationVariant      : {
        Text          : 'Default',
        SortOrder     : [{
            Property  : stardustCollection,
            Descending: true
        }],
        Visualizations: ['@UI.LineItem'],
        RequestAtLeast: [originPlanet],
        MaxItems      : 2
    },
    Facets                   : [
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'GeneralInfo',
            Label : 'General Information',
            Target: '@UI.FieldGroup#GeneralInfo'
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'CosmicDetails',
            Label : 'Cosmic Details',
            Target: '@UI.FieldGroup#CosmicDetails'
        }
    ],
    FieldGroup #GeneralInfo  : {Data: [
        {
            Value: firstName,
            Label: 'First Name'
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
            Value: email,
            Label: 'Email Address'
        },
        {
            Value: department_ID,
            Label: 'Department'
        },
        {
            Value: position_ID,
            Label: 'Position'
        }
    ]},
    FieldGroup #CosmicDetails: {Data: [
        {
            Value: stardustCollection,
            Label: 'Stardust Collection'
        },
        {
            Value: wormholeNavSkill,
            Label: 'Wormhole Navigation Skill'
        },
        {
            Value: spacesuitColor,
            Label: 'Spacesuit Color'
        }
    ]}
});
