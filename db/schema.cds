namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

type Planet : String enum {
  PlanetX = 'Planet X';
  PlanetY = 'Planet Y';
}

entity Spacefarers : cuid, managed {
  firstName          : String(100);
  lastName           : String(100);
  originPlanet       : Planet;
  spacesuitColor     : String(50);
  stardustCollection : Decimal(10, 2);
  wormholeNavSkill   : Integer;
  email              : String(255);
  department         : Association to Departments;
  position           : Association to Positions;
}

entity Departments : cuid {
  name        : String(100);
  planet      : Planet;
  spacefarers : Association to many Spacefarers
                  on spacefarers.department = $self;
}

entity Positions : cuid {
  title       : String(100);
  rank        : Integer;
  spacefarers : Association to many Spacefarers
                  on spacefarers.position = $self;
}
