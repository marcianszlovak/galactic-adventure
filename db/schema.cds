namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

@assert.unique.email: [email]
entity Spacefarers : cuid, managed {
  firstName          : String(25)                 @mandatory;
  lastName           : String(25)                 @mandatory;
  originPlanet       : String(25)                 @mandatory;
  spacesuitColor     : String(10);
  stardustCollection : Decimal(10, 2)             @assert.range: [
    0,
    99999.99
  ];
  wormholeNavSkill   : Integer                    @assert.range: [
    0,
    100
  ];
  email              : String(35)                 @mandatory  @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$';
  department         : Association to Departments @assert.integrity;
  position           : Association to Positions   @assert.integrity;
}

entity Departments : cuid {
  name        : String(100);
  spacefarers : Association to many Spacefarers
                  on spacefarers.department = $self;
}

entity Positions : cuid {
  title       : String(100);
  rank        : Integer;
  spacefarers : Association to many Spacefarers
                  on spacefarers.position = $self;
}
