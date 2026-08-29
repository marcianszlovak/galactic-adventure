using galactic.spacefarer as gs from '../db/schema';

@path: '/spacefarer'
service SpacefarerService {

  @odata.draft.enabled
  entity Spacefarers  as projection on gs.Spacefarers
    actions {
      action issueWarpLicense(clearanceLevel: Integer) returns Spacefarers;
    };


  entity WarpLicenses as projection on gs.WarpLicenses;

  @readonly
  entity Departments  as projection on gs.Departments;

  @readonly
  entity Positions    as projection on gs.Positions;
}

annotate SpacefarerService with @(requires: 'authenticated-user');

annotate SpacefarerService.Spacefarers with @(restrict: [
  {
    grant: ['READ'],
    to   : 'SpacefarerViewer',
    where: 'originPlanet = $user.planet'
  },
  {
    grant: [
      'READ',
      'UPDATE'
    ],
    to   : 'SpacefarerEditor',
    where: 'originPlanet = $user.planet'
  },
  {
    grant: [
      'READ',
      'UPDATE',
      'CREATE',
      'DELETE'
    ],
    to   : 'SpacefarerPowerUser',
    where: 'originPlanet = $user.planet'
  },
  {
    grant: ['*'],
    to   : 'SpacefarerAdmin',
    where: 'originPlanet = $user.planet'
  }
]);

annotate SpacefarerService.WarpLicenses with @(restrict: [
  {
    grant: ['READ'],
    to   : 'SpacefarerViewer',
    where: 'spacefarer.originPlanet = $user.planet'
  },
  {
    grant: ['*'],
    to   : 'SpacefarerAdmin',
    where: 'spacefarer.originPlanet = $user.planet'
  }
]);
