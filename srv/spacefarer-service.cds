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
