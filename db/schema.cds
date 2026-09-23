namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

type SpacefarerStatus  : String(25) enum {
  Candidate;
  Active;
  Retired;
  LostInHyperSpace = 'Lost In Hyper Space';
}

type WarpLicenseStatus : String(25) enum {
  Pending;
  Active;
  Expired;
  Revoked;
}

type Planet            : String(25) enum {
  Earth;
  Mars;
  Venus;
  PlanetX = 'Planet X';
  PlanetY = 'Planet Y';
  Jupiter;
  Saturn;
  Neptune;
  Kryptos;
}

type SpacesuitColor    : String(25) enum {
  Silver;
  Gold;
  CosmicBlue = 'Cosmic Blue';
  NebulaPurple = 'Nebula Purple';
  SolarOrange = 'Solar Orange';
  StarWhite = 'Star White';
}

@assert.unique.email: [email]
entity Spacefarers : cuid, managed {
  firstName          : String(25)                          @mandatory;
  lastName           : String(25)                          @mandatory;
  originPlanet       : Planet                              @mandatory  @assert.range : true;
  spacesuitColor     : SpacesuitColor                      @assert.range: true;
  stardustCollection : Decimal(10, 2)                      @assert.range: [
    0,
    99999.99
  ];
  wormholeNavSkill   : Integer                             @assert.range: [
    0,
    100
  ];
  status             : SpacefarerStatus default #Candidate @mandatory;
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
  rank        : Integer @assert.range: [
    0,
    5
  ];
  spacefarers : Association to many Spacefarers
                  on spacefarers.position = $self;
}

entity WarpLicenses : cuid {
  spacefarer     : Association to Spacefarers;
  licenseNumber  : String(20)                          @mandatory;
  issueDate      : Date                                @mandatory;
  expiryDate     : Date                                @mandatory;
  status         : WarpLicenseStatus default #Pending  @mandatory  @assert.range: true;
  clearanceLevel : Integer default 1                   @assert.range: [
    1,
    10
  ];
}
