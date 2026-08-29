using galactic.spacefarer as gs from '../db/schema';

@path: '/spacefarer'
service SpacefarerService {

  @odata.draft.enabled
  entity Spacefarers as projection on gs.Spacefarers
    actions {
      action launchMission(destination: String, launchDate: Date) returns Spacefarers;
    };

  @odata.draft.enabled
  entity Missions    as projection on gs.Missions;

  @readonly
  entity Departments as projection on gs.Departments;

  @readonly
  entity Positions   as projection on gs.Positions;
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
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ'
    ],
    to   : 'SpacefarerAdmin',
    where: 'originPlanet = $user.planet'
  }
]);

annotate SpacefarerService.Missions with @(restrict: [
  {
    grant: ['READ'],
    to   : 'SpacefarerViewer',
    where: 'spacefarer.originPlanet = $user.planet'
  },
  {
    grant: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ'
    ],
    to   : 'SpacefarerAdmin',
    where: 'spacefarer.originPlanet = $user.planet'
  }
]);
