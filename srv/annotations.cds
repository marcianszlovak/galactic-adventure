using SpacefarerService as service from './spacefarer-service';

annotate service.Spacefarers with @(UI.SelectionFields: [
    originPlanet,
    spacesuitColor,
    department_ID
], );
