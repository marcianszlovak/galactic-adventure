namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

entity Spacefarers : cuid, managed {
  firstName          : String(100);
  lastName           : String(100);
  originPlanet       : String(100);
  spacesuitColor     : String(50);
  stardustCollection : Decimal(10, 2);
  wormholeNavSkill   : Integer;
  email              : String(255);
}
