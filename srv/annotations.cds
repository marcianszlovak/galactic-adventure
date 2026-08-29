using SpacefarerService as service from './spacefarer-service';

annotate service.Spacefarers with {
    firstName          @Common.Label: 'First Name';
    lastName           @Common.Label: 'Last Name';
    email              @Common.Label: 'Email Address';
    originPlanet       @Common.Label: 'Origin Planet';
    spacesuitColor     @Common.Label: 'Spacesuit Color';
    stardustCollection @Common.Label: 'Stardust Collection';
    wormholeNavSkill   @Common.Label: 'Wormhole Navigation Skill';
    status             @Common.Label: 'Spacefarer Status';
    yearsInService     @Common.Label: 'Years in Service';
};

annotate service.Departments with {
    name @Common.Label: 'Department Name';
};

annotate service.Positions with {
    title @Common.Label: 'Position Title';
    rank  @Common.Label: 'Position Rank';
};

annotate service.WarpLicenses with {
    licenseNumber  @Common.Label: 'License Number';
    issueDate      @Common.Label: 'Issue Date';
    expiryDate     @Common.Label: 'Expiry Date';
    status         @Common.Label: 'License Status';
    clearanceLevel @Common.Label: 'Clearance Level';
};

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
    department @(
        Common.Text           : department.name,
        Common.TextArrangement: #TextOnly,
        Common.Label          : 'Department',
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

    position   @(
        Common.Text           : position.title,
        Common.TextArrangement: #TextOnly,
        Common.Label          : 'Position',
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
};

annotate service.Spacefarers with @(UI: {
    HeaderInfo               : {
        TypeName      : 'Spacefarer',
        TypeNamePlural: 'Spacefarers',
        Title         : {Value: firstName},
        Description   : {Value: lastName}
    },

    SelectionFields          : [
        email,
        firstName,
        lastName,
        originPlanet,
        spacesuitColor,
        stardustCollection,
        wormholeNavSkill,
        status,
        yearsInService,
        lastMissionDate,
        department.name,
        position.rank,
        position.title,
        warpLicenses.licenseNumber,
        warpLicenses.issueDate,
        warpLicenses.status,
        warpLicenses.clearanceLevel
    ],

    LineItem                 : [
        {Value: firstName},
        {Value: lastName},
        {Value: originPlanet},
        {Value: spacesuitColor},
        {Value: stardustCollection},
        {Value: wormholeNavSkill},
        {Value: email},
        {Value: status}
    ],

    // to test pagination with few items
    // PresentationVariant      : {
    //     Text          : 'Default',
    //     SortOrder     : [{
    //         Property  : stardustCollection,
    //         Descending: true
    //     }],
    //     Visualizations: ['@UI.LineItem'],
    //     RequestAtLeast: [originPlanet],
    //     MaxItems      : 2
    // },

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
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID    : 'WarpLicensesFacet',
            Label : 'Warp Licenses',
            Target: 'warpLicenses/@UI.LineItem'
        }
    ],

    FieldGroup #GeneralInfo  : {Data: [
        {Value: firstName},
        {Value: lastName},
        {Value: email},
        {
            Value: department_ID,
            Label: 'Department'
        },
        {
            Value: position_ID,
            Label: 'Position'
        },
        {Value: position.rank}
    ]},

    FieldGroup #CosmicDetails: {Data: [
        {Value: originPlanet},
        {Value: stardustCollection},
        {Value: wormholeNavSkill},
        {Value: spacesuitColor},
        {Value: status},
        {Value: yearsInService},
    ]}
});

annotate service.WarpLicenses with @(UI: {
    HeaderInfo: {
        TypeName      : 'Warp License',
        TypeNamePlural: 'Warp Licenses',
        Title         : {Value: licenseNumber}
    },

    LineItem  : [
        {Value: licenseNumber},
        {Value: issueDate},
        {Value: expiryDate},
        {Value: status},
        {Value: clearanceLevel}
    ],
});
