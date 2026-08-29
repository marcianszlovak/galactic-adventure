namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

type SpacefarerStatus  : String enum {
  CANDIDATE;
  ACTIVE;
  RETIRED;
  LOST_IN_HYPERSPACE;
}

type WarpLicenseStatus : String enum {
  PENDING;
  ACTIVE;
  EXPIRED;
  REVOKED;
}

@assert.unique.email: [email]
entity Spacefarers : cuid, managed {
  firstName          : String(25)                          @mandatory;
  lastName           : String(25)                          @mandatory;
  originPlanet       : String(25)                          @mandatory;
  spacesuitColor     : String(10);
  stardustCollection : Decimal(10, 2)                      @assert.range: [
    0,
    99999.99
  ];
  wormholeNavSkill   : Integer                             @assert.range: [
    0,
    100
  ];
  status             : SpacefarerStatus default #CANDIDATE @mandatory;
  yearsInService     : Integer default 0                   @assert.range: [
    0,
    100
  ];
  email              : String(35)                          @mandatory  @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$';
  department         : Association to Departments          @assert.integrity;
  position           : Association to Positions            @assert.integrity;
  warpLicenses       : Composition of many WarpLicenses
                         on warpLicenses.spacefarer = $self;
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

entity WarpLicenses : cuid {
  spacefarer     : Association to Spacefarers;
  licenseNumber  : String(20)                         @mandatory;
  issueDate      : Date                               @mandatory;
  expiryDate     : Date;
  status         : WarpLicenseStatus default #PENDING @mandatory;
  clearanceLevel : Integer default 1                  @assert.range: [
    1,
    10
  ];
}
