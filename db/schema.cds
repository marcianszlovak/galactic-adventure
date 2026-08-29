namespace galactic.spacefarer;

using {
  cuid,
  managed
} from '@sap/cds/common';

type SpacefarerStatus : String enum {
  CANDIDATE;
  ACTIVE;
  RETIRED;
  LOST_IN_HYPERSPACE;
}

type MissionStatus    : String enum {
  PLANNED;
  IN_PROGRESS;
  COMPLETED;
  ABORTED;
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
  hasWarpLicense     : Boolean                             @default     : false;
  lastMissionDate    : Date;
  email              : String(35)                          @mandatory  @assert.format: '^[^\s@]+@[^\s@]+\.[^\s@]+$';
  department         : Association to Departments          @assert.integrity;
  position           : Association to Positions            @assert.integrity;
  missions           : Association to many Missions
                         on missions.spacefarer = $self;
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

entity Missions : cuid {
  spacefarer     : Association to Spacefarers;
  destination    : String(100);
  launchDate     : Date;
  status         : MissionStatus default #PLANNED;
  stardustEarned : Decimal(9, 2) default 0;
}
