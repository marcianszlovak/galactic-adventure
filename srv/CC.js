export const ROLE = {
  ADMIN: "SpacefarerAdmin",
  OFFICER: "SpacefarerOfficer",
};

export const FIELD_CONTROL = { MANDATORY: 7, READ_ONLY: 1 };

export const SPACEFARER_WRITE_EVENTS = ["NEW", "CREATE", "PATCH", "UPDATE"];
export const SPACEFARER_REFRESH_EVENTS = [
  "READ",
  "NEW",
  "EDIT",
  "PATCH",
  "CREATE",
  "UPDATE",
];
export const WARP_LICENSE_WRITE_EVENTS = ["PATCH", "UPDATE"];
export const WARP_LICENSE_CREATE_EVENTS = ["NEW", "CREATE"];
export const WARP_LICENSE_DELETE_EVENT = "DELETE";
export const WARP_LICENSE_ISSUE_ACTION = "issueWarpLicense";
export const WARP_LICENSE_STATUS = {
  PENDING: "Pending",
  ACTIVE: "Active",
  EXPIRED: "Expired",
  REVOKED: "Revoked",
};
export const WARP_LICENSE_STATUSES = Object.values(WARP_LICENSE_STATUS);
export const WARP_LICENSE_CLEARANCE_LEVEL = { MIN: 1, MAX: 10 };
export const WARP_LICENSE_NUMBER_PREFIX = "WL-";

export const SPACEFARER_DROPDOWN_VALUES = [
  "SpacefarerStatuses",
  "SpacesuitColors",
];
