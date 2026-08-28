using galactic.spacefarer as gs from '../db/schema';

@path: '/spacefarer'
service SpacefarerService {

  @odata.draft.enabled
  entity Spacefarers as projection on gs.Spacefarers;

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
    where: 'department.planet = $user.planet'
  },
  {
    grant: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'READ'
    ],
    to   : 'SpacefarerAdmin',
    where: 'department.planet = $user.planet'
  }
]);
