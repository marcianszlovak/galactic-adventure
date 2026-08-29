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
        },
        {
            Value: position.rank,
            Label: 'Rank'
        },
    ]},
    FieldGroup #CosmicDetails: {Data: [
        {
            Value: originPlanet,
            Label: 'Origin Planet'
        },
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

annotate service.Spacefarers with {
    firstName    @Common.FieldControl: {$edmJson: {$If: [
        {$Path: 'HasActiveEntity'},
        1,
        3
    ]}};

    lastName     @Common.FieldControl: {$edmJson: {$If: [
        {$Path: 'HasActiveEntity'},
        1,
        3
    ]}};

    originPlanet @Common.FieldControl: {$edmJson: {$If: [
        {$Path: 'HasActiveEntity'},
        1,
        3
    ]}};
};

annotate service.Spacefarers with {
    department     @(
        Common.Text           : department.name,
        Common.TextArrangement: #TextOnly,
        Common.Label          : 'Department Name',
        Common.ValueList      : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Departments',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: department_ID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'name'
                }
            ]
        }
    );

    position       @(
        Common.Text           : position.title,
        Common.TextArrangement: #TextOnly,
        Common.Label          : 'Position Title',
        Common.ValueList      : {
            $Type         : 'Common.ValueListType',
            CollectionPath: 'Positions',
            Parameters    : [
                {
                    $Type            : 'Common.ValueListParameterInOut',
                    LocalDataProperty: position_ID,
                    ValueListProperty: 'ID'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'title'
                },
                {
                    $Type            : 'Common.ValueListParameterDisplayOnly',
                    ValueListProperty: 'rank'
                }
            ]
        }
    );

    originPlanet   @Common.Label: 'Origin Planet';
    spacesuitColor @Common.Label: 'Spacesuit Color';
};
