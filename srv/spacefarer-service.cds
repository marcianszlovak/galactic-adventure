using galactic.spacefarer as gs from '../db/schema';

@path: '/spacefarer'
service SpacefarerService {

  @odata.draft.enabled
  entity Spacefarers  as projection on gs.Spacefarers {
    *,
    @UI.Hidden
    virtual planetFieldControl : Integer,
    @UI.Hidden
    virtual canIssueWarpLicense : Boolean
  }
    actions {
      action issueWarpLicense( @title: 'Clearance Level' clearanceLevel: Integer, @title: 'Issue Date' issueDate: Date, @title: 'Expiry Date' expiryDate: Date) returns Spacefarers;
    };


  entity WarpLicenses as projection on gs.WarpLicenses {
    *,
    @UI.Hidden
    virtual licenseStatusFieldControl : Integer,
    @UI.Hidden
    virtual canDeleteLicense : Boolean
  };

  @readonly @cds.persistence.skip
  entity SpacefarerStatuses { key value : gs.SpacefarerStatus; }

  @readonly @cds.persistence.skip
  entity SpacesuitColors { key value : gs.SpacesuitColor; }

  @readonly
  entity Departments  as
    projection on gs.Departments
    excluding {
      spacefarers
    };

  @readonly
  entity Positions    as
    projection on gs.Positions
    excluding {
      spacefarers
    };
}

annotate SpacefarerService with @(requires: 'authenticated-user');

annotate SpacefarerService.Spacefarers with @(restrict: [
  {
    grant: [
      'READ',
      'CREATE',
      'UPDATE',
      'DELETE',
      'issueWarpLicense'
    ],
    to   : 'SpacefarerAdmin'
  },
  {
    grant: [
      'READ',
      'CREATE',
      'UPDATE',
      'issueWarpLicense'
    ],
    to   : 'SpacefarerOfficer',
    where: 'originPlanet = $user.planet'
  },
  {
    grant: 'READ',
    to   : 'SpacefarerViewer',
    where: 'originPlanet = $user.planet'
  }
]);

annotate SpacefarerService.WarpLicenses with @(restrict: [
  {
    grant: [
      'READ',
      'UPDATE',
      'DELETE'
    ],
    to   : 'SpacefarerAdmin'
  },
  {
    grant: [
      'READ',
      'UPDATE'
    ],
    to   : 'SpacefarerOfficer',
    where: 'spacefarer.originPlanet = $user.planet'
  },
  {
    grant: 'READ',
    to   : 'SpacefarerViewer',
    where: 'spacefarer.originPlanet = $user.planet'
  }
]);

